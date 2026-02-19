import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, X, MapPin, Building, AlertTriangle, Star, Globe } from 'lucide-react';
import RetailerSearchModal from '../components/RetailerSearchModal';
import RetailerEditModal from '../components/RetailerEditModal';
import { useToast } from '../contexts/ToastContext';

export default function RetailerManagement() {
    const navigate = useNavigate();
    const { retailers, addRetailer, updateRetailer, deleteRetailer, toggleRetailerFavorite } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [editingRetailer, setEditingRetailer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRetailers = retailers
        .filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));

    const favorites = retailers.filter(r => r.isFavorite);

    const handleEdit = (retailer) => {
        setEditingRetailer(retailer);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this retailer?')) {
            deleteRetailer(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRetailer(null);
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Retailer Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage retailer profiles, addresses, and distributor accounts.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/discovery')}
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Globe size={18} /> Discover New
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-cdh-red text-white px-4 py-2 rounded-md font-medium hover:bg-cdh-dark flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus size={18} /> Add Retailer
                    </button>
                </div>
            </header>

            {/* Favorites Section */}
            {favorites.length > 0 && !searchTerm && (
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <Star size={18} className="fill-yellow-400 text-yellow-400" /> Favorites
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(Array.isArray(favorites) ? favorites : []).slice(0, 6).map(retailer => (
                            <div key={retailer.id} onClick={() => handleEdit(retailer)} className="cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-full text-yellow-600 dark:text-yellow-400">
                                        <Star size={16} className="fill-current" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{retailer.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{retailer.location}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleRetailerFavorite(retailer.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-yellow-500 transition-all"
                                    title="Remove from existing Favorites"
                                >
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search retailers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(filteredRetailers) ? filteredRetailers : []).map(retailer => {
                    // Check for Data Health
                    const hasHHAccount = retailer.accounts && retailer.accounts['house-hasson'];
                    const hasWarehouse = retailer.warehouseCode === 'K' || retailer.warehouseCode === 'P';
                    const isManualReview = !hasHHAccount || !hasWarehouse;

                    return (
                        <div key={retailer.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-all relative group">

                            {/* Missing Data Warning Badge */}
                            {isManualReview && (
                                <div className="absolute top-0 right-0 p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <span title="Manual Routing/Review Required" className="flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                        <AlertTriangle size={12} /> Review
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg text-gray-600 dark:text-gray-300 ${isManualReview ? 'bg-orange-50 dark:bg-orange-900/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        <Building size={20} className={isManualReview ? 'text-orange-500' : ''} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{retailer.name}</h3>
                                        <div className="flex flex-col mt-1">
                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <MapPin size={14} />
                                                {retailer.location}
                                            </div>
                                            {retailer.geocoded_at && (
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                    Updated: {new Date(retailer.geocoded_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => toggleRetailerFavorite(retailer.id)}
                                        className={`p-1.5 rounded-md transition-colors ${retailer.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400 dark:text-gray-600'} hover:bg-yellow-50 dark:hover:bg-yellow-900/20`}
                                        title={retailer.isFavorite ? "Remove favorite" : "Add to favorites"}
                                    >
                                        <Star size={16} className={retailer.isFavorite ? "fill-current" : ""} />
                                    </button>
                                    <button onClick={() => handleEdit(retailer)} className="p-1.5 text-gray-400 hover:text-cdh-red dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(retailer.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Accounts */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Distributor Accounts</h4>
                                <div className="space-y-2">
                                    {retailer.accounts && Object.entries(retailer.accounts).length > 0 ? (
                                        Object.entries(retailer.accounts).map(([distId, accNum]) => (
                                            <div key={distId} className="flex justify-between text-sm">
                                                <span className="capitalize text-gray-600 dark:text-gray-300">{distId}</span>
                                                <span className="font-medium font-mono text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded">{accNum}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No accounts linked</p>
                                    )}
                                    {/* Warehouse Code Display */}
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="capitalize text-gray-500 dark:text-gray-400">Warehouse</span>
                                        {hasWarehouse ? (
                                            <span className="font-medium font-mono text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">{retailer.warehouseCode}</span>
                                        ) : (
                                            <span className="font-medium font-mono text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded text-[10px]">MISSING</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

            {filteredRetailers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full mb-3">
                        <Search className="text-gray-400 dark:text-gray-500" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No retailers found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        We couldn't find any retailers matching "{searchTerm}". Try adjusting your search query.
                    </p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-sm font-semibold text-cdh-red hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {isModalOpen && (
                <RetailerModal
                    retailer={editingRetailer}
                    existingRetailers={retailers} // Pass for duplicate check
                    onClose={closeModal}
                    onSave={(data) => {
                        if (editingRetailer) updateRetailer(editingRetailer.id, data);
                        else addRetailer(data);
                        closeModal();
                    }}
                />
            )}

            <RetailerSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onImport={(data) => {
                    addRetailer(data);
                    setIsSearchModalOpen(false);
                }}
            />
        </div>
    );
}

// Simple Levenshtein distance for fuzzy matching
const levenshtein = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
            else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
    }
    return matrix[b.length][a.length];
};

function RetailerModal({ retailer, existingRetailers, onClose, onSave }) {
    const toast = useToast();
    const [formData, setFormData] = useState({
        name: retailer?.name || '',
        location: retailer?.location || '',
        address: retailer?.address || '',
        warehouseCode: retailer?.warehouseCode || '',
        accounts: retailer?.accounts ? JSON.stringify(retailer.accounts, null, 2) : '{\n  "house-hasson": ""\n}'
    });

    // Body Scroll Lock
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // DUPLICATE DETECTION (Fuzzy Match)
        if (!retailer) {
            const currentName = formData.name.toLowerCase();
            const potentialDupes = existingRetailers.filter(r => {
                const rName = r.name.toLowerCase();
                const dist = levenshtein(currentName, rName);
                const similarity = 1 - (dist / Math.max(currentName.length, rName.length));
                return similarity > 0.8;
            });

            if (potentialDupes.length > 0) {
                const dupeNames = potentialDupes.map(d => d.name).join(', ');
                const confirmMsg = `Warning: Potential duplicates found for "${formData.name}":\n\n${dupeNames}\n\nAre you sure you want to create this retailer?`;
                if (!window.confirm(confirmMsg)) return;
            }
        }

        try {
            const parsedAccounts = JSON.parse(formData.accounts);
            onSave({
                ...formData,
                accounts: parsedAccounts
            });
        } catch {
            toast.error('Invalid JSON for accounts. Please check format.');
        }
    };

    if (!document.body) return null; // Safety check

    return createPortal(
        <RetailerEditModal
            isOpen={true}
            onClose={onClose}
            title={retailer ? 'Edit Retailer' : 'Add New Retailer'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retailer Name</label>
                    <input
                        required
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City, State</label>
                    <input
                        required
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address (Optional)</label>
                    <textarea
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                        rows="2"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse Code (K/P)</label>
                    <select
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                        value={formData.warehouseCode}
                        onChange={e => setFormData({ ...formData, warehouseCode: e.target.value })}
                    >
                        <option value="">-- Manual / Undefined --</option>
                        <option value="K">Knoxville (K)</option>
                        <option value="P">Prichard (P)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distributor Accounts (JSON)</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Enter account numbers for each distributor (e.g., "orgill": "123").</p>
                    <textarea
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 font-mono text-xs bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-cdh-red outline-none"
                        rows="8"
                        value={formData.accounts}
                        onChange={e => setFormData({ ...formData, accounts: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-cdh-red text-white font-medium rounded-lg hover:bg-cdh-dark">Save Retailer</button>
                </div>
            </form>
        </RetailerEditModal>,
        document.body
    );
}
