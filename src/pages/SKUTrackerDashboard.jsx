import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import LiveStatusIndicator from '../components/LiveStatusIndicator';
import { Search, Filter, RefreshCw, ExternalLink } from 'lucide-react';
import { RETAILER_CATALOG } from '../data/retailerCatalog';

import { useLiveVerification } from '../hooks/useLiveVerification';

// Helper Component for Sort Icons
const SortIcon = ({ column, sortConfig }) => {
    if (sortConfig.key !== column) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1 text-gray-900 dark:text-gray-100">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
};

export default function SKUTrackerDashboard() {
    const { products, vendors } = useData();
    const [filterVendor, setFilterVendor] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [dataVersion, setDataVersion] = useState(0); // Used to trigger re-renders

    // Auto-Verification Hook
    const { startVerification, stopVerification, isScanning, progress } = useLiveVerification();

    useEffect(() => {
        // Listen for SKU updates to refresh the table
        const handleUpdate = () => setDataVersion(v => v + 1);
        window.addEventListener('sku-status-update', handleUpdate);
        return () => window.removeEventListener('sku-status-update', handleUpdate);
    }, []);

    // Unified Product List: Context Products + Catalog Products
    const unifiedItems = useMemo(() => {
        // 1. Process Context Products (Internal)
        const internalItems = Object.entries(products).flatMap(([vendorId, vendorProducts]) =>
            (Array.isArray(vendorProducts) ? vendorProducts : []).map(p => {
                const vendor = vendors.find(v => v.id === vendorId);
                const stored = localStorage.getItem(`sku_status_${p.sku}`);
                const statusData = stored ? JSON.parse(stored) : null;
                return {
                    ...p,
                    source: 'internal',
                    vendorId,
                    vendorName: vendor?.name || vendorId,
                    status: statusData?.status || 'unknown',
                    lastChecked: statusData?.timestamp
                };
            })
        );

        // 2. Process Catalog Products (External / Staged)
        // We iterate RETAILER_CATALOG. If an item matches a known SKU in internalItems, we skip (or could merge).
        // For this view, we want to see EVERYTHING.
        const catalogItems = [];
        const internalSkus = new Set((Array.isArray(internalItems) ? internalItems : []).map(i => i.sku));

        Object.entries(RETAILER_CATALOG).forEach(([storeKey, storeProducts]) => {
            const displayVendorName = {
                'tractor-supply': 'Tractor Supply',
                'lowes': "Lowe's",
                'homedepot': 'Home Depot',
                'amazon': 'Amazon'
            }[storeKey] || storeKey;

            Object.entries(storeProducts).forEach(([sku, details]) => {
                // If it's already in internal items, we skip adding a duplicate "catalog" entry
                // unless we want to show the specific retailer link integration.
                // Decision: Show unique SKUs. If in internal, it shows there.
                // User wants "all chunks".
                if (!internalSkus.has(sku)) {
                    const stored = localStorage.getItem(`sku_status_${sku}`);
                    const statusData = stored ? JSON.parse(stored) : null;
                    catalogItems.push({
                        sku,
                        description: details.name, // Map name to description
                        source: 'catalog',
                        vendorId: storeKey, // Use storeKey as ID
                        vendorName: displayVendorName,
                        price: details.price,
                        status: statusData?.status || 'unknown',
                        lastChecked: statusData?.timestamp
                    });
                }
            });
        });

        return [...internalItems, ...catalogItems];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products, vendors, dataVersion]);

    // Trigger Verification manually
    const handleRunCheck = () => {
        // Run check on all items or just unknown?
        // User request: "initiating the check". usually implies a full run or run of what's needed.
        // Let's verify everything that isn't already 'active' or 'inactive', OR if nothing checked, everything.
        // Similar to the old logic but manual.
        const toVerify = unifiedItems.filter(i => i.status === 'unknown' || i.status === 'checking');
        if (toVerify.length > 0) {
            startVerification(toVerify);
        } else {
            // If all are done but user clicks run, maybe re-verify all?
            // For now, let's stick to verifying unknown/checking to correspond to "finish the job".
            // If user wants re-verify ALL, we might need a "Reset" or just pass all.
            // Let's pass all unifiedItems if toVerify is empty, effectively "Re-check all".
            startVerification(unifiedItems);
        }
    };

    // Derived stats
    const stats = useMemo(() => {
        const total = unifiedItems.length;
        const active = unifiedItems.filter(i => i.status === 'active').length;
        const inactive = unifiedItems.filter(i => i.status === 'inactive').length;
        const unknown = unifiedItems.filter(i => i.status === 'unknown' || i.status === 'checking').length;
        return { total, active, inactive, unknown };
    }, [unifiedItems]);

    // Helper: Relative Time
    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Helper: Format Full Date
    const formatFullDate = (dateString) => {
        if (!dateString) return 'Never Checked';
        return new Date(dateString).toLocaleString();
    };

    // Filter Logic
    const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'active', 'inactive', 'unknown'
    const [sortConfig, setSortConfig] = useState({ key: 'lastChecked', direction: 'desc' });

    const filteredItems = unifiedItems.filter(item => {
        const matchesSearch = item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVendor = filterVendor === 'All' || item.vendorId === filterVendor || item.vendorName === filterVendor;
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus || (filterStatus === 'unknown' && item.status === 'checking');

        return matchesSearch && matchesVendor && matchesStatus;
    });

    // Sort Logic
    const sortedItems = useMemo(() => {
        let sortable = [...filteredItems];
        if (sortConfig.key) {
            sortable.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Custom handling for status to group by color/meaning
                if (sortConfig.key === 'status') {
                    // rank: active (1) > inactive (2) > checking (3) > unknown (4)
                    const rank = { active: 1, inactive: 2, checking: 3, unknown: 4 };
                    aValue = rank[a.status] || 99;
                    bValue = rank[b.status] || 99;
                }

                // Handle dates/strings
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [filteredItems, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const TABS = [
        { id: 'All', label: 'All Stores' },
        { id: 'tractor-supply', label: 'Tractor Supply' },
        { id: 'lowes', label: "Lowe's" },
        { id: 'homedepot', label: 'Home Depot' },
        { id: 'amazon', label: 'Amazon' },
        { id: 'internal', label: 'Internal' }
    ];

    return (
        <div className="space-y-6">
            <header>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live SKU Tracker</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor product availability across verified vendor sites.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Run/Stop Button */}
                        <button
                            onClick={isScanning ? stopVerification : handleRunCheck}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all
                                ${isScanning
                                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                    : 'bg-cdh-red text-white hover:bg-black hover:shadow-md'
                                }`}
                        >
                            {isScanning ? (
                                <>
                                    <span className="relative flex h-3 w-3 mr-1">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    Stop Check
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    Run Live Check
                                </>
                            )}
                        </button>

                        {/* Status Pivot "Table" Control */}
                        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
                            {[
                                { id: 'All', label: 'Total', count: stats.total, color: 'gray' },
                                { id: 'active', label: 'Active', count: stats.active, color: 'green' },
                                { id: 'inactive', label: 'Inactive', count: stats.inactive, color: 'red' },
                                { id: 'unknown', label: 'Unknown', count: stats.unknown, color: 'amber' }
                            ].map(status => (
                                <button
                                    key={status.id}
                                    onClick={() => setFilterStatus(status.id)}
                                    className={`flex flex-col items-center px-4 py-2 rounded-md transition-all min-w-[80px]
                                        ${filterStatus === status.id
                                            ? `bg-${status.color}-50 dark:bg-${status.color}-900/20 border-${status.color}-200 shadow-sm`
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <span className={`text-xs font-semibold uppercase tracking-wider
                                        ${filterStatus === status.id ? `text-${status.color}-700 dark:text-${status.color}-300` : 'text-gray-500'}
                                    `}>
                                        {status.label}
                                    </span>
                                    <span className={`text-xl font-bold
                                        ${filterStatus === status.id ? `text-${status.color}-800 dark:text-${status.color}-200` : 'text-gray-700 dark:text-gray-300'}
                                    `}>
                                        {status.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Verification Progress */}
                {!progress.isComplete && progress.total > 0 && (
                    <div className="mt-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 h-3 bg-gray-200/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/20 shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 relative transition-all duration-300 ease-out shadow-[0_0_10px_rgba(250,204,21,0.7)]"
                                style={{ width: `${(progress.checked / progress.total) * 100}%` }}
                            >
                                {/* Gloss effect */}
                                <div className="absolute inset-0 bg-white/30 skew-x-12 -ml-4 w-full"></div>
                            </div>
                        </div>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap box-border px-2 py-1 rounded bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur">
                            {progress.checked}/{progress.total}
                        </span>
                    </div>
                )}
            </header>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                {/* Store Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-700">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilterVendor(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                                ${filterVendor === tab.id
                                    ? 'bg-cdh-red text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search SKU or Description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">
                        <tr>
                            <th
                                className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center">
                                    Status / SKU <SortIcon column="status" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                                onClick={() => handleSort('description')}
                            >
                                <div className="flex items-center">
                                    Description <SortIcon column="description" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                                onClick={() => handleSort('vendorName')}
                            >
                                <div className="flex items-center">
                                    Vendor <SortIcon column="vendorName" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4">Source</th>
                            <th
                                className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                                onClick={() => handleSort('lastChecked')}
                            >
                                <div className="flex items-center">
                                    Last Checked <SortIcon column="lastChecked" sortConfig={sortConfig} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {(Array.isArray(sortedItems) ? sortedItems : []).map((item) => (
                            <tr key={`${item.vendorId}-${item.sku}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <LiveStatusIndicator sku={item.sku} storeName={item.vendorName} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white font-mono">{item.sku}</span>
                                            {item.price && (
                                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {item.description}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {item.vendorName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                        ${item.source === 'internal'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
                                        }`}
                                    >
                                        {item.source === 'internal' ? 'App Database' : 'Staged Catalog'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span title={formatFullDate(item.lastChecked)}>{getTimeAgo(item.lastChecked)}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startVerification([item]);
                                            }}
                                            disabled={isScanning || item.status === 'checking'}
                                            className="p-1 text-gray-400 hover:text-cdh-red dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Check this item now"
                                        >
                                            <RefreshCw size={14} className={item.status === 'checking' ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sortedItems.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No items found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
