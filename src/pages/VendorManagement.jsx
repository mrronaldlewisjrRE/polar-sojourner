import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { cn } from '../lib/utils';
import { Filter, Search, Plus, MoreHorizontal, X, LayoutList, Image as ImageIcon } from 'lucide-react';
import PhotoGallery from '../components/PhotoGallery';
import { useToast } from '../contexts/ToastContext';

import { useSearchParams } from 'react-router-dom';

export default function VendorManagement() {
    const { vendors: VENDORS, distributors: DISTRIBUTORS, addVendor, updateVendor } = useData();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    // View state controlled by URL or local state fallback
    const view = searchParams.get('view') || 'list';
    const setView = (newView) => {
        setSearchParams({ view: newView });
    };

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVendor(null);
    };

    const filteredVendors = (Array.isArray(VENDORS) ? VENDORS : []).filter(vendor => {
        const matchesStatus = filterStatus === 'All' || vendor?.status === filterStatus;
        const matchesSearch = (vendor?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage vendor status, distributor authorizations, and events.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium",
                                view === 'list'
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <LayoutList size={18} />
                            List
                        </button>
                        <button
                            onClick={() => setView('gallery')}
                            className={cn(
                                "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium",
                                view === 'gallery'
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            <ImageIcon size={18} />
                            Gallery
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-cdh-red text-white px-4 py-2 rounded-md font-medium hover:bg-cdh-dark flex items-center gap-2 shadow-sm transition-colors ml-2"
                    >
                        <Plus size={18} />
                        Add Vendor
                    </button>
                </div>
            </header>

            {view === 'gallery' ? (
                <PhotoGallery />
            ) : (
                <>
                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 transition-colors">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search vendors..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-gray-400" />
                            <select
                                className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Paused">Paused</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Vendor Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Order Email</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4 text-center">Distributors</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {(Array.isArray(filteredVendors) ? filteredVendors : []).map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{vendor.name}</td>
                                        <td className="px-6 py-4">
                                            <StatusToggle status={vendor.status} />
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{vendor.email}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{vendor.contact}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center -space-x-2">
                                                {(Array.isArray(vendor.authorizedDistributors) ? vendor.authorizedDistributors : []).map((distId, i) => {
                                                    const dist = (Array.isArray(DISTRIBUTORS) ? DISTRIBUTORS : []).find(d => d.id === distId);
                                                    return (
                                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300" title={dist?.name}>
                                                            {dist?.name?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    );
                                                })}
                                                {(!vendor.authorizedDistributors || vendor.authorizedDistributors.length === 0) && (
                                                    <span className="text-xs text-gray-400 italic">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <VendorActions
                                                isOpen={openMenuId === vendor.id}
                                                onToggle={() => toggleMenu(vendor.id)}
                                                onClose={() => setOpenMenuId(null)}
                                                onEdit={() => handleEdit(vendor)}
                                            />
                                        </td>
                                    </tr>

                                ))}
                                {filteredVendors.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full mb-1">
                                                    <Filter className="text-gray-400 dark:text-gray-500" size={20} />
                                                </div>
                                                <p className="font-medium">No vendors found</p>
                                                <p className="text-sm">Try adjusting your filters or search terms.</p>
                                                {(searchTerm || filterStatus !== 'All') && (
                                                    <button
                                                        onClick={() => { setSearchTerm(''); setFilterStatus('All'); }}
                                                        className="text-sm font-semibold text-cdh-red hover:underline mt-1"
                                                    >
                                                        Reset Filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )
            }

            {
                isModalOpen && (
                    <VendorModal
                        vendor={editingVendor}
                        onClose={closeModal}
                        onSave={(data) => {
                            if (editingVendor) updateVendor(editingVendor.id, data);
                            else addVendor(data);
                            closeModal();
                        }}
                    />
                )
            }
        </div >
    );
}

function StatusToggle({ status }) {
    const isActive = status === 'Active';
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        )}>
            {status}
        </span>
    );
}

function VendorActions({ isOpen, onToggle, onClose, onEdit }) {
    const toast = useToast();
    return (
        <div className="relative inline-block text-left">
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <MoreHorizontal size={20} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={onClose}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 z-20 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); toast.info('View Details clicked'); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            View Details
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); onEdit(); }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Edit Configuration
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); toast.info('Deactivate Vendor clicked'); }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Deactivate Vendor
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function VendorModal({ vendor, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: vendor?.name || '',
        email: vendor?.email || '',
        contact: vendor?.contact || '',
        status: vendor?.status || 'Active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            authorizedDistributors: vendor?.authorizedDistributors || []
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{vendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Name</label>
                        <input
                            required
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Order Submission)</label>
                        <input
                            type="email"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                        <input
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            value={formData.contact}
                            onChange={e => setFormData({ ...formData, contact: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-cdh-red text-white font-medium rounded-lg hover:bg-cdh-dark">Save Vendor</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
