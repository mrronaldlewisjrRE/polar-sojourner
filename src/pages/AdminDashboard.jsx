import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    Users,
    Shield,
    Activity,
    BarChart3,
    Search,
    AlertTriangle,
    CheckCircle,
    Clock,
    UserCheck,
    UserX,
    LayoutDashboard
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, admins: 0, totalSkus: 0, recentChecks: 0 });
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Users
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (usersError) throw usersError;

            // 2. Fetch Logs (Recent SKU Checks)
            const { data: logsData, error: _logsError } = await supabase
                .from('sku_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            // If logs table doesn't exist yet, we might get an error, ignore it gracefully
            const safeLogs = logsData || [];

            console.log('Shape Check Admin Users:', usersData);
            setUsers(Array.isArray(usersData) ? usersData : []);

            console.log('Shape Check Admin Logs:', safeLogs);
            setLogs(Array.isArray(safeLogs) ? safeLogs : []);

            // 3. Compute Stats
            setStats({
                totalUsers: usersData?.length || 0,
                admins: usersData?.filter(u => u.role === 'admin').length || 0,
                recentChecks: safeLogs.length,
                totalSkus: new Set((Array.isArray(safeLogs) ? safeLogs : []).map(l => l.sku)).size
            });

        } catch (error) {
            console.error('Error fetching admin data:', error);
            setFeedback({ type: 'error', message: 'Failed to load dashboard data.' });
        } finally {
            setLoading(false);
        }
    };

    const toggleAdminRole = async (targetId, currentRole) => {
        try {
            const newRole = currentRole === 'admin' ? 'viewer' : 'admin';

            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', targetId);

            if (error) throw error;

            // Update local state
            setUsers((Array.isArray(users) ? users : []).map(u => u.id === targetId ? { ...u, role: newRole } : u));
            setFeedback({ type: 'success', message: `User role updated to ${newRole}` });

            // Refresh stats
            setStats(prev => ({
                ...prev,
                admins: currentRole === 'admin' ? prev.admins - 1 : prev.admins + 1
            }));

            setTimeout(() => setFeedback(null), 3000);
        } catch (error) {
            console.error('Error updating role:', error);
            setFeedback({ type: 'error', message: 'Failed to update user role.' });
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Admin Dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <LayoutDashboard className="text-cdh-red" /> Admin Dashboard
                </h1>
                <p className="text-gray-500 mt-2">System overview and user management.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} color="blue" />
                <StatCard icon={<Shield />} label="Admins" value={stats.admins} color="red" />
                <StatCard icon={<Activity />} label="Recent Checks" value={stats.recentChecks} color="green" />
                <StatCard icon={<BarChart3 />} label="Unique SKUs" value={stats.totalSkus} color="purple" />
            </div>

            {/* Feedback Message */}
            {feedback && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {feedback.message}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* User Management (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users size={20} /> User Management
                        </h2>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            {users.length} Users
                        </span>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {(Array.isArray(users) ? users : []).map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300">
                                                    {u.email?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{u.full_name || 'No Name'}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {u.role === 'admin' ? <Shield size={12} className="mr-1" /> : <Users size={12} className="mr-1" />}
                                                {u.role || 'viewer'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {u.email === 'ronald@cdhassociates.com' && (
                                                <span className="text-xs text-gray-400 italic mr-2">System Admin</span>
                                            )}

                                            {/* Allow promoting/demoting anyone, including self (for recovery) */}
                                            <button
                                                onClick={() => toggleAdminRole(u.id, u.role)}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.role === 'admin'
                                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                    }`}
                                            >
                                                {u.role === 'admin' ? 'Demote' : 'Promote'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed (1/3 width) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity size={20} /> System Logs
                    </h2>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4 max-h-[600px] overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Activity size={32} className="mx-auto mb-2 opacity-20" />
                                <p>No recent logs found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(Array.isArray(logs) ? logs : []).map((log, i) => (
                                    <div key={i} className="flex gap-3 text-sm border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${log.status === 'active' ? 'bg-green-500' :
                                            log.status === 'inactive' ? 'bg-red-500' : 'bg-gray-400'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
                                                {log.sku}
                                            </p>
                                            <p className="text-gray-500 text-xs truncate">
                                                {log.metadata?.reason || log.method || 'Unknown check'}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap">
                                            {getTimeAgo(log.created_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Overrides & Insights (From User Request) */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield size={20} /> Overrides
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
                            <p className="text-sm text-gray-500">Admin-only override controls.</p>
                            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left flex justify-between items-center group">
                                <span>Bypass Validation Rules</span>
                                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">Inactive</span>
                            </button>
                            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left flex justify-between items-center group">
                                <span>Force Status Reset</span>
                                <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">Inactive</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 size={20} /> Insights
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <p className="text-sm text-gray-500 mb-4">Admin-only insights panel.</p>
                            <div className="h-32 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-600">
                                <span className="text-xs text-gray-400">Analytics Visualization Placeholder</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

// Utility
const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
};
