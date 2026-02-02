import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Search, Edit2, Trash2, X, Tag, DollarSign, Package } from 'lucide-react';
import ProductSearchButton from '../components/ProductSearchButton';

export default function ProductManagement() {
    const { products, vendors, addProduct, updateProduct, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // { vendorId, ...product }
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVendor, setFilterVendor] = useState('All');

    // Flatten products for display
    const allProducts = useMemo(() => {
        return Object.entries(products).flatMap(([vendorId, vendorProducts]) =>
            vendorProducts.map(p => ({ ...p, vendorId, vendorName: vendors.find(v => v.id === vendorId)?.name }))
        );
    }, [products, vendors]);

    const filteredProducts = allProducts.filter(p => {
        const matchesSearch = p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVendor = filterVendor === 'All' || p.vendorId === filterVendor;
        return matchesSearch && matchesVendor;
    });

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (vendorId, sku) => {
        if (window.confirm(`Delete SKU ${sku}?`)) {
            deleteProduct(vendorId, sku);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage SKUs, descriptions, and pricing per vendor.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-cdh-red text-white px-4 py-2 rounded-md font-medium hover:bg-cdh-dark flex items-center gap-2 shadow-sm transition-colors"
                >
                    <Plus size={18} /> Add Product
                </button>
            </header>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 transition-colors">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search SKU or Description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none min-w-[200px]"
                    value={filterVendor}
                    onChange={(e) => setFilterVendor(e.target.value)}
                >
                    <option value="All">All Vendors</option>
                    {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">SKU / Description</th>
                            <th className="px-6 py-4">Vendor</th>
                            <th className="px-6 py-4 text-right">Cost</th>
                            <th className="px-6 py-4 text-center">Pack Qty</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredProducts.map((product) => {
                            const vendor = vendors.find(v => v.id === product.vendorId);
                            return (
                                <tr key={`${product.vendorId}-${product.sku}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Tag size={14} className="text-gray-400" />
                                                {product.sku}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{product.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                        {vendor?.name || product.vendorId}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                        ${product.cost.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {product.packQty || 1}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <ProductSearchButton
                                                sku={product.sku}
                                                description={product.description}
                                                vendorName={product.vendorName}
                                            />
                                            <button onClick={() => handleEdit(product)} className="text-gray-400 hover:text-cdh-red dark:hover:text-red-400 p-1">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(product.vendorId, product.sku)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                    No products found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    vendors={vendors}
                    onClose={closeModal}
                    onSave={(vendorId, data) => {
                        if (editingProduct && (editingProduct.vendorId !== vendorId || editingProduct.sku !== data.sku)) {
                            // If vendor or SKU changed, we might need to handle it as delete + create or blocked. 
                            // For simplicity, assuming updateProduct handles SKU changes or we treat it as same product. 
                            // If updateProduct only updates details, this is fine.
                            // The context updateProduct implementation would need to be checked relative to SKU uniqueness.
                            // Assuming SKU is stable or handled.
                            updateProduct(vendorId, data);
                        } else if (editingProduct) {
                            updateProduct(vendorId, data);
                        } else {
                            addProduct(vendorId, data);
                        }
                        closeModal();
                    }}
                />
            )}
        </div>
    );
}

function ProductModal({ product, vendors, onClose, onSave }) {
    const [vendorId, setVendorId] = useState(product?.vendorId || vendors[0]?.id || '');
    const [formData, setFormData] = useState({
        sku: product?.sku || '',
        description: product?.description || '',
        cost: product?.cost ? product.cost.toString() : '',
        packQty: product?.packQty ? product.packQty.toString() : '1'
    });

    // useEffect removed

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(vendorId, {
            ...formData,
            cost: parseFloat(formData.cost),
            packQty: parseInt(formData.packQty)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
                        <select
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            value={vendorId}
                            onChange={e => setVendorId(e.target.value)}
                            disabled={!!product} // Disable vendor change on edit for simplicity, to avoid SKU conflicts
                        >
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                        <input
                            required
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none disabled:opacity-50"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            disabled={!!product} // Disable SKU change on edit
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <input
                            required
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost ($)</label>
                            <input
                                type="number" step="0.01" min="0" required
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pack Qty</label>
                            <input
                                type="number" min="1" required
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                value={formData.packQty}
                                onChange={e => setFormData({ ...formData, packQty: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-cdh-red text-white font-medium rounded-lg hover:bg-cdh-dark">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
