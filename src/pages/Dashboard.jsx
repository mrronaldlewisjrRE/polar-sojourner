import React from 'react';
import { useData } from '../contexts/DataContext'; // Import Context
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Clock, FileText, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
    const { orders, distributors } = useData();

    // Derived Stats
    const totalOrders = orders.length; // Basic count
    const pendingOrders = orders.filter(o => o.status === 'Submitted' || o.submissionStatus === 'SUBMITTED').length;

    return (
        <div className="space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of order flow and system health.</p>
                </div>
                <button className="bg-cdh-red text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cdh-dark transition-colors shadow-sm">
                    + Quick New Order
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Orders"
                    value={totalOrders || "0"}
                    trend="+12%"
                    trendUp={true}
                    icon={<FileText className="text-blue-600 dark:text-blue-400" size={24} />}
                />
                <StatCard
                    label="Pending Submission"
                    value={pendingOrders || "0"}
                    subtext="Awaiting review"
                    icon={<Clock className="text-orange-600 dark:text-orange-400" size={24} />}
                />
                <StatCard
                    label="Routing Errors"
                    value="0"
                    subtext="Needs attention"
                    isAlert={false}
                    icon={<AlertCircle className="text-red-600 dark:text-red-400" size={24} />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders by Distributor</h2>
                        <select className="text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-cdh-red focus:border-cdh-red p-1">
                            <option>This Month</option>
                            <option>Last Quarter</option>
                            <option>YTD</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Orgill', value: orders.filter(o => o.distributorId === 'orgill').length || 1 },
                                { name: 'House-Hasson', value: orders.filter(o => o.distributorId === 'house-hasson').length || 1 },
                                { name: 'Wallace', value: orders.filter(o => o.distributorId === 'wallace').length || 1 },
                            ]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#1F2937' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                                    {
                                        [2500, 1800, 1100].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill='#8B0000' />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders List */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                        <button className="text-sm text-cdh-red font-medium hover:text-cdh-dark">View All</button>
                    </div>
                    <div className="flex-1 overflow-auto -mx-2 px-2 space-y-3">
                        {orders.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No orders yet.</p>
                        )}
                        {orders.slice(0, 10).map((order) => {
                            const dist = distributors.find(d => d.id === order.distributorId);
                            return (
                                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-600 group">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</span>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(order.timestamp).toLocaleDateString()} • {dist?.name || 'Manual'}
                                        </p>
                                    </div>
                                    <button className="text-gray-400 group-hover:text-cdh-red transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, subtext, isAlert, icon, trendUp }) {
    return (
        <div className={cn("bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm transition-colors", isAlert ? "border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30" : "border-gray-200 dark:border-gray-700")}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>

                    {trend && (
                        <div className={cn("flex items-center mt-2 text-sm", trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                            <TrendingUp size={16} className="mr-1" />
                            <span className="font-medium">{trend}</span>
                            <span className="text-gray-400 ml-1 font-normal">vs last month</span>
                        </div>
                    )}

                    {subtext && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtext}</p>
                    )}
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        Submitted: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
        Draft: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
        Error: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
    };

    return (
        <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border", styles[status] || styles.Draft)}>
            {status}
        </span>
    );
}
