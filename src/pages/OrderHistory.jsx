import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, FileText, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function OrderHistory() {
    const { orders, retailers, vendors, distributors } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const filteredOrders = orders.filter(order => {
        const retailer = retailers.find(r => r.id === (order.retailer_id || order.retailerId));
        const vendor = vendors.find(v => v.id === (order.vendor_id || order.vendorId));

        // Search Filter
        const oNum = order.vendor_number || order.vendorNumber || '';
        const auth = order.auth_number || order.creditAuthNumber || order.credit_auth_number || '';
        const searchString = `${order.id} ${retailer?.name} ${vendor?.name} ${oNum} ${auth}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());

        // Status Filter
        const matchesStatus = statusFilter === 'All' || (order.status || 'Submitted') === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const toggleExpand = (id) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order History</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage submitted Purchase Orders.</p>
            </header>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 w-full max-w-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search PO #, Retailer, Vendor, Auth #..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="relative w-40">
                        <select
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-cdh-red outline-none cursor-pointer"
                            onChange={(e) => setStatusFilter(e.target.value)}
                            value={statusFilter}
                        >
                            <option value="All">All Status</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const headers = ["PO Number", "Date", "Retailer", "Vendor", "Total", "Status"];
                        const rows = (Array.isArray(orders) ? orders : []).map(o => {
                            const r = retailers.find(x => x.id === o.retailerId)?.name || 'Unknown';
                            const v = vendors.find(x => x.id === o.vendorId)?.name || 'Unknown';
                            return [o.id, new Date(o.created_at || o.date).toLocaleDateString(), r, v, Number(o.total || 0).toFixed(2), o.status];
                        });
                        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `CDH_Order_Log_${new Date().toISOString().split('T')[0]}.csv`;
                        link.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                >
                    <FileText size={16} /> Export CSV
                </button>
            </div>

            {/* Orders List */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">PO Number</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Retailer</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Distributor</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredOrders.length > 0 ? (
                                (Array.isArray(filteredOrders) ? filteredOrders : []).map((order) => {
                                    const retailer = retailers.find(r => r.id === order.retailerId);
                                    const vendor = vendors.find(v => v.id === order.vendorId);
                                    const distributor = distributors.find(d => d.id === order.distributorId) || { name: 'Unknown' };
                                    const isExpanded = expandedOrderId === order.id;

                                    return (
                                        <React.Fragment key={order.id}>
                                            <tr
                                                className={cn("hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors", isExpanded && "bg-gray-50 dark:bg-gray-700/50")}
                                                onClick={() => toggleExpand(order.id)}
                                            >
                                                <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                    {order.id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(order.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {retailer?.name || 'Unknown Retailer'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    {vendor?.name || 'Unknown Vendor'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {distributor.name}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                                    ${Number(order.total || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-transparent dark:border-blue-800">
                                                        <CheckCircle size={12} /> Submitted
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400">
                                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                                    <td colSpan="8" className="px-6 py-4">
                                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                                <FileText size={16} /> Order Details
                                                            </h4>
                                                            <table className="w-full text-sm">
                                                                <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 text-left">
                                                                    <tr>
                                                                        <th className="py-2">SKU</th>
                                                                        <th className="py-2">MFR No</th>
                                                                        <th className="py-2">Description</th>
                                                                        <th className="py-2 text-center">Qty</th>
                                                                        <th className="py-2 text-right">Cost</th>
                                                                        <th className="py-2 text-right">Subtotal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                                    {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                                                                        <tr key={idx}>
                                                                            <td className="py-2 font-mono text-xs text-gray-900 dark:text-gray-300">{item.sku}</td>
                                                                            <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{item.mfrNo || '-'}</td>
                                                                            <td className="py-2 text-gray-600 dark:text-gray-400">{item.description}</td>
                                                                            <td className="py-2 text-center text-gray-900 dark:text-gray-300">{item.qty}</td>
                                                                            <td className="py-2 text-right text-gray-500 dark:text-gray-400">${Number(item.cost || 0).toFixed(2)}</td>
                                                                            <td className="py-2 text-right font-medium text-gray-900 dark:text-white">${(Number(item.cost || 0) * Number(item.qty || 1)).toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide mb-1">Vendor Number</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white block">{order.vendor_number || order.vendorNumber || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide mb-1">Customer Number</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white block">{order.customer_number || order.customerNumber || 'N/A'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide mb-1">Credit Auth #</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white block">{order.credit_auth_number || order.auth_number || order.creditAuthNumber || '-'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide mb-1">Retailer Email</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white block break-words">{order.order_email || order.orderEmail || '-'}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide mb-1">Internal Email</span>
                                                                    <span className="font-medium text-gray-900 dark:text-white block break-words">{order.internal_email || order.internalEmail || '-'}</span>
                                                                </div>
                                                            </div>
                                                            {order.notes && (
                                                                <div className="mt-4 text-sm bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-100 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                                                    <strong>Notes:</strong> {order.notes}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-0 border-none">
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
                                            <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-3">
                                                <Search className="text-gray-400 dark:text-gray-500" size={24} />
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-gray-200">No orders found</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                            {(searchTerm || statusFilter !== 'All') && (
                                                <button
                                                    onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                                                    className="mt-4 text-sm text-cdh-red font-semibold hover:underline"
                                                >
                                                    Clear Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
}
