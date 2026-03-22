import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import LiveStatusIndicator from '../components/LiveStatusIndicator';
import { Search, Trash2, Plus, ArrowRight, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductSearchButton from '../components/ProductSearchButton';
import PortalSubmissionModal from '../components/PortalSubmissionModal';

import { useToast } from '../contexts/ToastContext';

export default function NewOrder() {
    const { retailers: RETAILERS, vendors: VENDORS, distributors: DISTRIBUTORS, products: PRODUCTS, addOrder, updateRetailer } = useData();
    const toast = useToast();
    const [step, setStep] = useState('entry'); // 'entry', 'review', 'submitted'
    const [retailerId, setRetailerId] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [distributorId, setDistributorId] = useState('');
    const [items, setItems] = useState([]);
    const [notes, setNotes] = useState('');
    const [vendorNumber, setVendorNumber] = useState('');
    const [customerNumber, setCustomerNumber] = useState('');
    const [shippingCost, setShippingCost] = useState('');
    const [creditAuthNumber, setCreditAuthNumber] = useState('');
    const [orderEmail, setOrderEmail] = useState('');
    const [internalEmail, setInternalEmail] = useState('');
    const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);

    // Competitor Intelligence parsing
    const getCompetitorTags = (notes) => {
        if (!notes) return [];
        const tags = [];
        const n = notes.toLowerCase();
        if (n.includes('united general') || n.includes('ugs')) tags.push({ label: 'UGS', color: 'bg-orange-100 text-orange-800 border-orange-200' });
        if (n.includes('dize')) tags.push({ label: 'Dize', color: 'bg-purple-100 text-purple-800 border-purple-200' });
        if (n.includes('mrh') || n.includes('mr. heater')) tags.push({ label: 'MRH', color: 'bg-blue-100 text-blue-800 border-blue-200' });
        return tags;
    };

    // Derived Data
    const selectedVendor = (Array.isArray(VENDORS) ? VENDORS : []).find(v => v.id === vendorId);
    const selectedRetailer = (Array.isArray(RETAILERS) ? RETAILERS : []).find(r => r.id === retailerId);
    const selectedDistributor = (Array.isArray(DISTRIBUTORS) ? DISTRIBUTORS : []).find(d => d.id === distributorId) || (distributorId === 'manual' ? { id: 'manual', name: 'Manual / Other', format: 'Manual' } : null);
    const vendorProducts = PRODUCTS[vendorId] || [];
    const competitorTags = selectedRetailer ? getCompetitorTags(selectedRetailer.notes) : [];

    // Auto-Routing Effect
    React.useEffect(() => {
        if (!selectedVendor || !selectedRetailer) {
            setDistributorId('');
            return;
        }

        const authorized = selectedVendor.authorizedDistributors || selectedVendor.authorized_distributors || [];
        const retailerAccounts = selectedRetailer.accounts ? Object.keys(selectedRetailer.accounts) : [];

        // Filter for valid paths based on Retailer Accounts (basic check)
        let validPaths = (Array.isArray(authorized) ? authorized : []).filter(distId => retailerAccounts.includes(distId));

        // --- HOUSE-HASSON ADVANCED ROUTING LOGIC ---
        // Constraint: Must have both Account AND Warehouse Code (K/P) to be Auto-Routable
        if (validPaths.includes('house-hasson')) {
            const warehouseCode = selectedRetailer.warehouseCode;
            const isAutoRoutable = warehouseCode === 'K' || warehouseCode === 'P'; // Explicit K or P required

            if (!isAutoRoutable) {
                // Remove HH from auto-selection candidates to force Manual Selection
                validPaths = (Array.isArray(validPaths) ? validPaths : []).filter(id => id !== 'house-hasson');
            }
        }

        if (validPaths.length === 1) {
            setDistributorId(validPaths[0]);
        } else if (validPaths.length > 1) {
            // Tie-breaker: Prefer Orgill, else first valid
            if (validPaths.includes('orgill')) setDistributorId('orgill');
            else setDistributorId(validPaths[0]);
        } else {
            // No auto-paths found. 
            // If the vendor allows House-Hasson, but we filtered it out above (due to missing Warehouse code),
            // The user must manually select it.
            // We set to '' to ensure "Select Distributor" prompt is visible.

            // Check if there is a default fallback in authorized list that DOESN'T require an account (Open Vendors)?
            // For now, default to manual.
            setDistributorId('');
        }
    }, [selectedVendor, selectedRetailer, DISTRIBUTORS]);

    // Sync Email
    useEffect(() => {
        if (selectedRetailer) {
            setOrderEmail(selectedRetailer.email || '');
        }
    }, [selectedRetailer]);

    // Handlers
    const addItem = () => {
        setItems([...items, { sku: '', mfrNo: '', itemName: '', description: '', qty: 1, cost: 0 }]);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        if (field === 'sku') {
            const product = vendorProducts.find(p => p.sku === value);
            newItems[index] = {
                ...newItems[index],
                sku: value,
                itemName: product?.description || '', // Default name to desc
                description: product?.description || '',
                cost: product?.cost || 0,
                mfrNo: product?.mfrNo || '' // items might need mfrNo from product if available
            };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    const removeItem = (index) => {
        setItems((Array.isArray(items) ? items : []).filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.cost * item.qty), 0);
        const shipping = parseFloat(shippingCost) || 0;
        return subtotal + shipping;
    };

    const onSubmitOrder = async (portalData = {}) => {
        // Validation: Email - OPTIONAL but Recommended
        if (!orderEmail) {
            console.log("Submitting order without email (optional).");
        }

        // Auto-update Retailer Profile if email provided/changed
        if (orderEmail && selectedRetailer && orderEmail !== selectedRetailer.email) {
            console.log("Updating retailer email profile...");
            // Use updateRetailer from context (fire and forget for now, or await?)
            // We'll await to ensure it sticks.
            await updateRetailer(selectedRetailer.id, { email: orderEmail });
        }

        const order = {
            retailerId,
            vendorId,
            distributorId,
            items,
            notes,
            vendorNumber,
            customerNumber,
            shippingCost: parseFloat(shippingCost) || 0,
            creditAuthNumber,
            total: calculateTotal(),
            orderEmail,
            internalEmail,
            timestamp: new Date().toISOString(),
            ...portalData
        };

        const result = await addOrder(order);

        if (result.error) {
            alert(`Failed to save order: ${result.error.message}\n\nPlease check your new fields (Vendor #, Auth #) match database schema.`);
            return;
        }

        setIsPortalModalOpen(false);
        setStep('submitted');
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (step === 'entry' && selectedRetailer && selectedVendor && items.length > 0) {
                    setStep('review');
                } else if (step === 'review') {
                    onSubmitOrder();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, selectedRetailer, selectedVendor, items]); // dependencies related to logic, omitting onSubmitOrder to avoid re-bind loop

    if (step === 'submitted') {
        return <SubmissionSuccess reset={() => window.location.reload()} />;
    }

    if (step === 'review') {
        return (
            <>
                <ReviewScreen
                    retailer={selectedRetailer}
                    vendor={selectedVendor}
                    distributor={selectedDistributor}
                    items={items}
                    notes={notes}
                    vendorNumber={vendorNumber}
                    customerNumber={customerNumber}
                    shippingCost={parseFloat(shippingCost) || 0}
                    creditAuthNumber={creditAuthNumber}
                    setCreditAuthNumber={setCreditAuthNumber}
                    orderEmail={orderEmail}
                    setOrderEmail={setOrderEmail}
                    internalEmail={internalEmail}
                    setInternalEmail={setInternalEmail}
                    total={calculateTotal()}
                    onBack={() => setStep('entry')}
                    onSubmit={() => onSubmitOrder()}
                />
                <PortalSubmissionModal
                    isOpen={isPortalModalOpen}
                    onClose={() => setIsPortalModalOpen(false)}
                    retailer={selectedRetailer}
                    vendor={selectedVendor}
                    distributor={selectedDistributor}
                    items={items}
                    onSubmit={onSubmitOrder}
                />
            </>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-24">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Order</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Select retailer, vendor, and distributor to begin.</p>
            </header>

            {/* Global Search */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors mb-6">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Search size={16} /> Global Lookup
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by SKU (Vendor/Distributor), Retailer Name, or Item Description..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                        onChange={() => {
                            // Logic moved to native onInput via datalist for simplicity
                        }}
                        list="global-omni-search"
                        onInput={(e) => {
                            const val = e.target.value;
                            if (!val.includes(':')) return; // Simple guard to wait for selection

                            // Parse selection type based on prefix
                            const parts = val.split(':');
                            parts.shift(); // Remove type
                            // const id = parts.join(':').trim(); // Unused

                            // Clean value format: "Type: ID - Label"
                            // Actually, simpler to find exact match in data

                            // 1. Retailer Match
                            const retMatch = RETAILERS.find(r => `Retailer: ${r.name}` === val);
                            if (retMatch) {
                                setRetailerId(retMatch.id);
                                setVendorId(''); setItems([]); // Reset downstream
                                e.target.value = '';
                                return;
                            }

                            // 2. Distributor Match
                            const distMatch = (Array.isArray(DISTRIBUTORS) ? DISTRIBUTORS : []).find(d => `Distributor: ${d.name}` === val);
                            if (distMatch) {
                                if (!vendorId) {
                                    toast.warning('Please select a Vendor first before setting Distributor (or use Auto-Routing).');
                                    e.target.value = '';
                                    return;
                                }
                                setDistributorId(distMatch.id);
                                e.target.value = '';
                                return;
                            }

                            // 3. Product Match
                            const allProducts = Object.entries(PRODUCTS).flatMap(([vid, prods]) =>
                                (Array.isArray(prods) ? prods : []).map(p => ({ ...p, vendorId: vid }))
                            );
                            // Match by reconstructing the label format used in datalist
                            // Format: "Product: SKU - Desc (Vendor)"
                            // We need to match precise values or use ID/SKU lookup from string
                            // Let's use string includes for robustness if exact match fails

                            // Find product where `Product: ${p.sku} ...` matches val
                            // Or safer: store ID in a hidden way? No, datalist.
                            // Let's iterate.
                            const prodMatch = allProducts.find(p => {
                                const vName = VENDORS.find(v => v.id === p.vendorId)?.name;
                                const distSkuLabel = p.distSkus ? ` [${Object.values(p.distSkus).join(', ')}]` : '';
                                const label = `Product: ${p.sku}${distSkuLabel} - ${p.description} (${vName})`;
                                return label === val;
                            });

                            if (prodMatch) {
                                const v = VENDORS.find(v => v.id === prodMatch.vendorId);
                                if (window.confirm(`Select Vendor "${v?.name}" and add ${prodMatch.sku}?`)) {
                                    setVendorId(prodMatch.vendorId);
                                    setItems([{ ...prodMatch, qty: 1 }]);
                                    e.target.value = '';
                                }
                            }
                        }}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <datalist id="global-omni-search">
                        {/* Retailers */}
                        {(Array.isArray(RETAILERS) ? RETAILERS : []).map(r => (
                            <option key={`r-${r.id}`} value={`Retailer: ${r.name}`}>Location: {r.location}</option>
                        ))}

                        {/* Distributors */}
                        {(Array.isArray(DISTRIBUTORS) ? DISTRIBUTORS : []).map(d => (
                            <option key={`d-${d.id}`} value={`Distributor: ${d.name}`}>Format: {d.format}</option>
                        ))}

                        {/* Products with Distributor SKUs */}
                        {Object.entries(PRODUCTS).flatMap(([vid, prods]) =>
                            (Array.isArray(prods) ? prods : []).map(p => {
                                const vName = VENDORS.find(v => v.id === vid)?.name || vid;
                                const distSkuLabel = p.distSkus ? ` [${Object.values(p.distSkus).join(', ')}]` : '';
                                return <option key={`${vid}-${p.sku}`} value={`Product: ${p.sku}${distSkuLabel} - ${p.description} (${vName})`} />;
                            })
                        )}
                    </datalist>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Search for <strong>Retailers</strong>, <strong>Distributors</strong>, or <strong>Products</strong> (by Vendor or Distributor SKU).
                </p>
            </div>

            {/* Selection Grid */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 transition-colors">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Retailer</label>
                    <select
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none"
                        value={retailerId}
                        onChange={(e) => {
                            setRetailerId(e.target.value);
                            setVendorId('');
                            setItems([]);
                        }}
                    >
                        <option value="">-- Choose Retailer --</option>
                        {(Array.isArray(RETAILERS) ? RETAILERS : []).map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                        ))}
                    </select>
                    {competitorTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {(Array.isArray(competitorTags) ? competitorTags : []).map((tag, idx) => (
                                <span key={idx} className={`text-xs px-2 py-0.5 rounded border ${tag.color} font-medium`}>
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Vendor</label>
                    <select
                        data-testid="vendor-select"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none"
                        value={vendorId}
                        onChange={(e) => { setVendorId(e.target.value); setItems([]); }}
                    >
                        <option value="">-- Choose Vendor --</option>
                        {(Array.isArray(VENDORS) ? VENDORS : []).filter(v => v.status === 'Active' || v.status === 'active' || !v.status).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Number</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none"
                        placeholder="Optional"
                        value={vendorNumber}
                        onChange={(e) => setVendorNumber(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Number</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none"
                        placeholder="Optional"
                        value={customerNumber}
                        onChange={(e) => setCustomerNumber(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Distributor</label>
                    <div className="relative">
                        <select
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none appearance-none"
                            value={distributorId}
                            onChange={(e) => setDistributorId(e.target.value)}
                        >
                            <option value="">-- Manual Selection --</option>
                            {(Array.isArray(DISTRIBUTORS) ? DISTRIBUTORS : []).map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                            <option value="manual">Manual / Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Items */}
            {vendorId && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Items</h2>
                        <button data-testid="add-item" onClick={addItem} className="text-cdh-red hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1">
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.length === 0 && (
                            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg">
                                No items added. Click "Add Item" to start.
                            </div>
                        )}
                        {(Array.isArray(items) ? items : []).map((item, index) => (
                            <div key={index} data-testid="line-item-row" className="flex gap-4 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 group">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            SKU / MFR No.
                                            {item.sku && <LiveStatusIndicator sku={item.sku} storeName={selectedVendor?.name} />}
                                        </label>
                                        <ProductSearchButton
                                            sku={item.sku}
                                            description={item.description}
                                            vendorName={selectedVendor?.name}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                list={`sku-list-${index}`}
                                                className="w-full border border-gray-300 dark:border-gray-500 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
                                                placeholder="SKU..."
                                                value={item.sku}
                                                onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                            />
                                            <datalist id={`sku-list-${index}`}>
                                                {(Array.isArray(vendorProducts) ? vendorProducts : []).map(p => (
                                                    <option key={p.sku} value={p.sku}>{p.description}</option>
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 dark:border-gray-500 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400"
                                                placeholder="MFR No..."
                                                value={item.mfrNo || ''}
                                                onChange={(e) => updateItem(index, 'mfrNo', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-[2]">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Item Details</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 dark:border-gray-500 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400 mb-2"
                                        placeholder="Item Name (Required)"
                                        value={item.itemName || ''}
                                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                    />
                                    {/* Extended Description Removed per request */}
                                </div>
                                <div className="w-24">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Unit Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1.5 text-gray-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className={`w-full border rounded px-2 pl-5 py-1.5 text-sm outline-none ${vendorProducts.find(p => p.sku === item.sku)?.cost !== parseFloat(item.cost)
                                                ? 'border-red-300 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200'
                                                : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 dark:text-white'
                                                }`}
                                            value={item.cost}
                                            onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    {item.sku && (
                                        <div className="mt-1 text-[10px]">
                                            {(() => {
                                                const catalog = vendorProducts.find(p => p.sku === item.sku);
                                                if (!catalog) return null;
                                                const diff = Math.abs(item.cost - catalog.cost) > 0.001;
                                                return diff ? (
                                                    <span className="text-cdh-red flex items-center gap-0.5" title={`Catalog Price: $${Number(catalog.cost || 0).toFixed(2)}`}>
                                                        <AlertTriangle size={10} /> List: ${Number(catalog.cost || 0).toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 flex items-center gap-0.5">
                                                        <CheckCircle size={10} /> Verified
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                                <div className="w-20">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full border border-gray-300 dark:border-gray-500 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                        value={item.qty}
                                        onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="pt-6">
                                    <button data-testid="remove-item" onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes / Exceptions</label>
                        <textarea
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none h-24 resize-none"
                            placeholder="Enter any special instructions for the distributor..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="mt-6 flex justify-end items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Cost:</label>
                        <div className="relative w-32">
                            <span className="absolute left-2 top-1.5 text-gray-500 text-sm">$</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-300 dark:border-gray-500 rounded px-2 pl-5 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                value={shippingCost}
                                onChange={(e) => setShippingCost(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Bar */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between z-50 transition-all safe-area-pb">
                <div className="flex items-center gap-3">
                    {selectedDistributor ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:inline">Routing to:</span>
                            <span className="font-bold text-cdh-red dark:text-red-400 flex items-center gap-1 text-sm">
                                {selectedDistributor.name}
                                {selectedDistributor.id === 'manual' && <AlertTriangle size={14} className="text-orange-500" />}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:inline">Select details to see routing</span>
                    )}
                </div>
                <button
                    data-testid="submit-order"
                    className="bg-cdh-red text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-cdh-dark active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all touch-manipulation"
                    disabled={!retailerId || !vendorId || !distributorId || items.length === 0}
                    onClick={() => setStep('review')}
                >
                    Review & Submit <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

function ReviewScreen({ retailer, vendor, distributor, items, notes, vendorNumber, customerNumber, shippingCost, creditAuthNumber, setCreditAuthNumber, orderEmail, setOrderEmail, internalEmail, setInternalEmail, total, onBack, onSubmit }) {
    const [verifiedVendorNo, setVerifiedVendorNo] = React.useState(false);
    const [verifiedTotalCost, setVerifiedTotalCost] = React.useState(false);

    const portalTarget = distributor; // Strictly distributor only

    // PDF Generation Helper
    const generatePODoc = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Purchase Order", 105, 15, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 25);
        doc.text(`Retailer: ${retailer?.name}`, 14, 30);
        doc.text(`Vendor: ${vendor?.name}`, 14, 35);
        doc.text(`Distributor: ${distributor?.name || 'Manual'}`, 14, 40);

        if (vendorNumber) doc.text(`Vendor #: ${vendorNumber}`, 14, 45);
        if (customerNumber) doc.text(`Customer #: ${customerNumber}`, 14, 50);
        if (creditAuthNumber) doc.text(`Auth #: ${creditAuthNumber}`, 14, 55);

        let y = 65;
        doc.setLineWidth(0.5);
        doc.line(14, y - 2, 196, y - 2);
        doc.text("Item", 14, y);
        doc.text("Qty", 140, y);
        doc.text("Cost", 160, y);
        doc.text("Total", 180, y);
        doc.line(14, y + 2, 196, y + 2);
        y += 8;

        items.forEach(item => {
            const name = item.itemName || item.sku;
            doc.text(name.substring(0, 50), 14, y);
            doc.text(String(item.qty), 140, y);
            doc.text(`$${Number(item.cost || 0).toFixed(2)}`, 160, y);
            doc.text(`$${(Number(item.cost || 0) * Number(item.qty || 1)).toFixed(2)}`, 180, y);
            y += 6;
            if (item.mfrNo) {
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`MFR: ${item.mfrNo}`, 14, y);
                doc.setTextColor(0);
                doc.setFontSize(10);
                y += 6;
            }
        });

        y += 4;
        doc.line(14, y, 196, y);
        y += 6;
        doc.setFontSize(12);
        doc.text(`Total: $${Number(total || 0).toFixed(2)}`, 180, y, { align: "right" });

        return doc;
    };

    const handleGeneratePO = async () => {
        try {
            const doc = await generatePODoc();
            doc.save(`PO_${retailer?.name}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Gen Error:", error);
            alert("Failed to generate PDF. Check console.");
        }
    };

    const handlePreviewPO = async () => {
        try {
            const doc = await generatePODoc();
            const blobPdf = doc.output('bloburl');
            window.open(blobPdf, '_blank');
        } catch (error) {
            console.error("PDF Preview Error:", error);
            alert("Failed to preview PDF. Check console.");
        }
    };

    const handleOpenPortal = () => {
        if (portalTarget?.portalUrl) {
            window.open(portalTarget.portalUrl, '_blank');
        } else {
            alert(`No portal URL configured for Distributor: ${portalTarget?.name || 'Unknown'}`);
        }
    };

    const handleInternalSubmit = () => {
        if (!creditAuthNumber) {
            alert("Please enter the Credit Authorization Number.");
            return;
        }
        onSubmit();
    };

    const isSubmitDisabled = !verifiedVendorNo || !verifiedTotalCost || !creditAuthNumber;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 mb-6 text-sm font-medium">
                <ArrowLeft size={16} /> Back to Edit
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden transition-colors">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Order</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Please confirm all details before submission.</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Routing Alert */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-medium text-blue-900 dark:text-blue-200">Routing Destination: {distributor?.name}</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">This order will be formatted as {distributor?.format} and emailed to {retailer?.accounts[distributor?.id] ? 'authorized account' : 'the distributor'}.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <span className="block text-gray-500 dark:text-gray-400 mb-1">Retailer</span>
                            <span className="font-medium text-gray-900 dark:text-white block text-lg">{retailer?.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{retailer?.location}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500 dark:text-gray-400 mb-1">Vendor</span>
                            <span className="font-medium text-gray-900 dark:text-white block text-lg">{vendor?.name}</span>
                            {vendorNumber && <span className="text-sm text-gray-500 dark:text-gray-400 block">Vendor #: {vendorNumber}</span>}
                            {customerNumber && <span className="text-sm text-gray-500 dark:text-gray-400 block">Customer #: {customerNumber}</span>}
                        </div>
                    </div>

                    <div>
                        <table className="w-full text-sm">
                            <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-left">
                                <tr>
                                    <th className="py-2 font-medium">Item</th>
                                    <th className="py-2 font-medium w-20 text-center">Qty</th>
                                    <th className="py-2 font-medium w-24 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {(Array.isArray(items) ? items : []).map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {item.itemName || item.sku} {item.mfrNo && <span className="text-gray-400 font-normal">({item.mfrNo})</span>}
                                            </div>
                                            {/* Description removed from review */}
                                        </td>
                                        <td className="py-3 text-center text-gray-900 dark:text-gray-200">{item.qty}</td>
                                        <td className="py-3 text-right text-gray-900 dark:text-gray-200">${(Number(item.cost || 0) * Number(item.qty || 1)).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="2" className="pt-4 text-right font-medium text-gray-900 dark:text-white">Subtotal</td>
                                    <td className="pt-4 text-right font-medium text-gray-900 dark:text-white">${items.reduce((sum, item) => sum + (Number(item.cost || 0) * Number(item.qty || 1)), 0).toFixed(2)}</td>
                                </tr>
                                {shippingCost > 0 && (
                                    <tr>
                                        <td colSpan="2" className="pt-1 text-right font-medium text-gray-600 dark:text-gray-400">Shipping</td>
                                        <td className="pt-1 text-right font-medium text-gray-600 dark:text-gray-400">${Number(shippingCost || 0).toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="2" className="pt-2 text-right font-bold text-gray-900 dark:text-white">Total</td>
                                    <td className="pt-2 text-right font-bold text-lg text-cdh-red dark:text-red-400">${Number(total || 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {notes && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">Notes:</span>
                            <p className="text-gray-600 dark:text-gray-400">{notes}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">

                        {/* Verification Checkboxes */}
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800 space-y-3">
                            <h3 className="font-semibold text-orange-900 dark:text-orange-200 text-sm">Mandatory Verification</h3>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 text-cdh-red rounded border-gray-300 dark:border-gray-600 focus:ring-cdh-red"
                                    checked={verifiedVendorNo}
                                    onChange={e => setVerifiedVendorNo(e.target.checked)}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    I have verified the <strong>Vendor Number</strong> on the {distributor?.name || 'Distributor'} Portal.
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 text-cdh-red rounded border-gray-300 dark:border-gray-600 focus:ring-cdh-red"
                                    checked={verifiedTotalCost}
                                    onChange={e => setVerifiedTotalCost(e.target.checked)}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    I have verified the <strong>Total Cost</strong> matches the distributor's system.
                                </span>
                            </label>
                        </div>



                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credit Authorization Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                placeholder="Enter auth number..."
                                value={creditAuthNumber}
                                onChange={(e) => setCreditAuthNumber(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Email (Optional)</label>
                            <div className="flex flex-col gap-1">
                                <input
                                    type="email"
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                    placeholder="retailer@example.com"
                                    value={orderEmail}
                                    onChange={(e) => setOrderEmail(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Updating this email will save it to the Retailer's profile.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Team Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                placeholder="teammate@example.com"
                                value={internalEmail}
                                onChange={(e) => setInternalEmail(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Receive a copy of the PO for internal records.
                            </p>
                        </div>

                        {/* PO Buttons */}
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={handlePreviewPO}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 border border-gray-300 shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">👁️</span> Preview PO
                            </button>
                            <button
                                onClick={handleGeneratePO}
                                className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-700 shadow-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">⬇️</span> Download PO
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <input type="checkbox" id="confirm" className="w-5 h-5 text-cdh-red rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-cdh-red" />
                            <label htmlFor="confirm" className="text-sm text-gray-700 dark:text-gray-300 select-none">I confirm this order is accurate and ready for processing.</label>
                        </div>

                        {/* Portal Button */}
                        <button
                            onClick={handleOpenPortal}
                            className="w-full mb-3 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            <Search size={20} className="w-5 h-5" />
                            Open {portalTarget?.name || 'Distributor'} Portal
                        </button>

                        <button
                            data-testid="submit-internal"
                            onClick={handleInternalSubmit}
                            disabled={isSubmitDisabled}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Record Order Internally
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SubmissionSuccess({ reset }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <CheckCircle size={40} />
            </div>
            <h1 data-testid="submission-success" className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Submitted!</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                Your order has been recorded and processed.
            </p>
            <div className="flex gap-4">
                <Link to="/" className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Return Home
                </Link>
                <button onClick={reset} className="px-6 py-2.5 rounded-lg bg-cdh-red font-medium text-white hover:bg-cdh-dark border border-transparent">
                    Start New Order
                </button>
            </div>
        </div>
    );
}
