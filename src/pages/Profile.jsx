import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';
import { User, Camera, Save, Loader2, AlertCircle, CheckCircle, Lock, Eye, EyeOff, Phone, Activity, Volume2, Shield, Users, Zap, BarChart } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Profile Fields
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [bio, setBio] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [isOnline, setIsOnline] = useState(true);
    const [role, setRole] = useState('viewer');

    // Admin Fields
    const [users, setUsers] = useState([]);
    const [adminOverrides, setAdminOverrides] = useState(false);
    const [adminInsights, setAdminInsights] = useState(false);

    // Password Fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Feedback
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const getProfile = React.useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setFullName(data.full_name || '');
                setAvatarUrl(data.avatar_url);
                setBio(data.bio || '');
                setContactInfo(data.contact_info || '');
                setIsOnline(data.is_online ?? true);

                // Set initial role from DB
                setRole(data.role || 'viewer');

                // Bootstrap Logic: If email matches, FORCE admin rights and fetch team
                const isBootstrap = user.email === 'ronald@cdhassociates.com';

                if (data.role === 'admin' || isBootstrap) {
                    // Update local role state to reflect admin privileges
                    if (isBootstrap && data.role !== 'admin') {
                        setRole('admin');
                    }
                    fetchTeam();
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchTeam = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (data) {
            console.log('Shape Check Profile Team:', data);
            setUsers(Array.isArray(data) ? data : []);
        }
    };

    useEffect(() => {
        if (user) getProfile();
    }, [user, getProfile]);

    async function toggleAdminRole(targetUserId, currentRole) {
        // Toggle Logic
        const newRole = currentRole === 'admin' ? 'viewer' : 'admin';

        // Optimistic Update
        setUsers((Array.isArray(users) ? users : []).map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
        if (targetUserId === user.id) setRole(newRole);

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUserId);

        if (error) {
            console.error('Error updating role:', error);
            setMessage('Failed to update role in database');
            // Revert on error
            fetchTeam();
        } else {
            setMessage(`User role updated to ${newRole}`);
            setTimeout(() => setMessage(null), 3000);
        }
    }

    async function updateProfile(e) {
        e.preventDefault();
        try {
            setSaving(true);

            // Password Update
            if (newPassword) {
                if (newPassword.length < 6) throw new Error("Password too short");
                if (newPassword !== confirmPassword) throw new Error("Passwords do not match");

                const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
                if (pwdError) throw pwdError;

                setNewPassword('');
                setConfirmPassword('');
            }

            // Profile Update
            const updates = {
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                bio: bio,
                contact_info: contactInfo,
                is_online: isOnline,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            setMessage('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            setMessage(error.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <User /> My Profile
            </h1>

            <form onSubmit={updateProfile} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6 animate-in fade-in duration-500">

                {/* Admin Banner */}
                {role === 'admin' && (
                    <div className="bg-gradient-to-r from-cdh-red/10 to-red-50 dark:from-red-900/30 dark:to-red-900/10 border border-red-100 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center gap-4">
                        <div className="p-2 bg-cdh-red text-white rounded-full shadow-sm">
                            <Shield size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">Admin Access Granted</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                You have administrative privileges. Admin settings are available at the bottom of this page.
                            </p>
                        </div>
                    </div>
                )}

                {/* Role Badge */}
                {role === 'admin' && (
                    <div className="flex items-center gap-2 text-cdh-red font-semibold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg w-fit">
                        <Shield size={16} /> Admin Account
                    </div>
                )}

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400 border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} />
                            )}
                        </div>
                        <button type="button" className="absolute bottom-0 right-0 p-2 bg-cdh-red text-white rounded-full shadow-md hover:bg-cdh-dark transition-colors" title="Change Avatar (Coming Soon)">
                            <Camera size={16} />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.email}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Team Member</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cdh-red outline-none transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Phone size={14} /> Contact Phone/Ext
                        </label>
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cdh-red outline-none transition-all"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cdh-red outline-none transition-all resize-none"
                        placeholder="Tell the team a bit about what you do..."
                    />
                </div>

                {/* Tool Status Indicator Toggle */}
                {/* Tool Status Indicator Toggle */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                            <Activity size={20} />
                        </div>
                        <div className="flex flex-col">
                            <p className="font-medium text-gray-900 dark:text-white">Live Status Indicator</p>
                            <p className="text-xs text-gray-500">Show when I am active in the tool</p>
                        </div>
                    </div>

                    <Switch
                        checked={isOnline}
                        onChange={setIsOnline}
                        color="bg-green-500"
                        label=""
                    />
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Volume2 size={18} /> Notification Sounds
                    </h3>
                    <SoundSettings />
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Lock size={18} /> Security
                    </h3>

                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <CheckCircle size={16} /> {message}
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cdh-red to-red-600 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>

            {/* Admin Settings Section */}
            {role === 'admin' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6 animate-in fade-in duration-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="text-cdh-red" size={24} />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Settings</h2>
                    </div>

                    {/* Admin Privileges */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">System Overrides</p>
                                    <p className="text-xs text-gray-500">Bypass standard validation rules.</p>
                                </div>
                            </div>
                            <Switch checked={adminOverrides} onChange={setAdminOverrides} />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                    <BarChart size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Advanced Insights</p>
                                    <p className="text-xs text-gray-500">View detailed analytics data.</p>
                                </div>
                            </div>
                            <Switch checked={adminInsights} onChange={setAdminInsights} />
                        </div>
                    </div>

                    {/* Team Management */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Users size={18} /> Team Management
                        </h3>

                        <div className="space-y-3">
                            {(Array.isArray(users) ? users : []).map((u) => (
                                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-gray-500">{u.full_name?.[0] || u.email?.[0] || '?'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{u.full_name || 'Unnamed User'}</p>
                                            <p className="text-xs text-gray-500">{u.email || 'No email'}</p>
                                        </div>
                                    </div>

                                    {/* Allow self-editing for bootstrap */}
                                    {(true) && (
                                        <button
                                            type="button"
                                            onClick={() => toggleAdminRole(u.id, u.role)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${u.role === 'admin'
                                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200'
                                                }`}
                                        >
                                            {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                    )}
                                    {u.id === user.id && (
                                        <span className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-400 rounded-full cursor-default">
                                            You
                                        </span>
                                    )}
                                </div>
                            ))}
                            {users.length === 0 && <p className="text-sm text-gray-500 italic">No other users found.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



const Switch = ({ checked, onChange, label, description, color = 'bg-cdh-red' }) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
            {description && <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cdh-red focus:ring-offset-2 ${checked ? color : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    </div>
);

function SoundSettings() {
    const { settings, toggleSetting } = useSettings();

    return (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-1">
            <Switch
                label="Team Message Sounds"
                checked={settings.teamChatSound}
                onChange={() => toggleSetting('teamChatSound')}
            />
            <Switch
                label="Private Message Sounds"
                checked={settings.privateChatSound}
                onChange={() => toggleSetting('privateChatSound')}
            />
            <Switch
                label="System Notifications"
                description="Toast popups and alerts"
                checked={settings.systemSound}
                onChange={() => toggleSetting('systemSound')}
            />
        </div>
    );
}
