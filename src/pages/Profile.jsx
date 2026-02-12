import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Camera, Save, Loader2, AlertCircle, CheckCircle, Lock, Eye, EyeOff, Phone, Activity } from 'lucide-react';

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

            if (error && error.code !== 'PGRST116') {
                console.warn('Error fetching profile:', error.message);
            }

            if (data) {
                setFullName(data.full_name || '');
                setAvatarUrl(data.avatar_url);
                setBio(data.bio || '');
                setContactInfo(data.contact_info || '');
                setIsOnline(data.is_online ?? true);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            getProfile();
        }
    }, [user, getProfile]);

    async function updateProfile(e) {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            setMessage(null);

            // 1. Update Password (if provided)
            if (newPassword) {
                if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");
                if (newPassword !== confirmPassword) throw new Error("Passwords do not match");

                const { error: passwordError } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (passwordError) throw passwordError;
                setNewPassword('');
                setConfirmPassword('');
            }

            // 2. Update Profile (Name/Avatar/Bio/Contact/Status)
            const updates = {
                id: user.id,
                full_name: fullName,
                avatar_url: avatarUrl,
                bio: bio,
                contact_info: contactInfo,
                is_online: isOnline,
                updated_at: new Date(),
            };

            const { error: profileError } = await supabase.from('profiles').upsert(updates);
            if (profileError) throw profileError;

            setMessage('Profile updated successfully!');
        } catch (error) {
            setError(error.message);
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
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Live Status Indicator</p>
                            <p className="text-xs text-gray-500">Show when I am active in the tool</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOnline(!isOnline)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cdh-red ${isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ease-in-out mt-1 ml-1 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                    </button>
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
                        className="w-full md:w-auto px-6 py-2.5 bg-cdh-red hover:bg-cdh-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
