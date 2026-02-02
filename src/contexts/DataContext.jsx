import React, { createContext, useContext, useState } from 'react';
import { VENDORS as INITIAL_VENDORS, DISTRIBUTORS as INITIAL_DISTRIBUTORS, PRODUCTS as INITIAL_PRODUCTS } from '../lib/mockData';
import { RETAILERS as INITIAL_RETAILERS } from '../data/retailers';

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    // Initialize state from mockData or empty defaults
    const [retailers, setRetailers] = useState(INITIAL_RETAILERS);
    const [vendors, setVendors] = useState(INITIAL_VENDORS);
    const [distributors, setDistributors] = useState(INITIAL_DISTRIBUTORS);
    // Products is strictly an object { vendorId: [products] } in mockData, keeping it consistent or flattening?
    // Let's keep it consistent for now but provide helper methods
    const [products, setProducts] = useState(INITIAL_PRODUCTS);

    // Load orders from LocalStorage
    const [orders, setOrders] = useState(() => {
        try {
            const saved = localStorage.getItem('cdh_orders');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load orders", e);
            return [];
        }
    });

    // Save orders to LocalStorage
    React.useEffect(() => {
        localStorage.setItem('cdh_orders', JSON.stringify(orders));
    }, [orders]);

    // --- Actions ---

    // Retailers
    const addRetailer = (retailer) => {
        const newRetailer = { ...retailer, id: `r${Date.now()}` };
        setRetailers([...retailers, newRetailer]);
    };

    const updateRetailer = (id, updates) => {
        setRetailers(retailers.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteRetailer = (id) => {
        setRetailers(retailers.filter(r => r.id !== id));
    };

    // Vendors
    const addVendor = (vendor) => {
        const newVendor = { ...vendor, id: `v${Date.now()}` };
        setVendors([...vendors, newVendor]);
    };

    const updateVendor = (id, updates) => {
        setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    const deleteVendor = (id) => {
        setVendors(vendors.filter(v => v.id !== id));
    };

    // Distributors
    const addDistributor = (distributor) => {
        const newDistributor = { ...distributor, id: `d${Date.now()}` };
        setDistributors([...distributors, newDistributor]);
    };

    const updateDistributor = (id, updates) => {
        setDistributors(distributors.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const deleteDistributor = (id) => {
        setDistributors(distributors.filter(d => d.id !== id));
    };

    // Products
    const addProduct = (vendorId, product) => {
        const currentVendorProducts = products[vendorId] || [];
        const newProduct = { ...product, sku: product.sku || `SKU-${Date.now()}` };

        setProducts({
            ...products,
            [vendorId]: [...currentVendorProducts, newProduct]
        });
    };

    const deleteProduct = (vendorId, sku) => {
        setProducts({
            ...products,
            [vendorId]: products[vendorId].filter(p => p.sku !== sku)
        });
    };

    // Orders (PO Tracking)
    const addOrder = (order) => {
        const newOrder = {
            ...order,
            id: `ORD-${Date.now()}`,
            date: new Date().toISOString(),
            status: order.submissionStatus || 'Submitted'
        };
        setOrders([newOrder, ...orders]);
        return newOrder;
    };

    const updateOrder = (id, updates) => {
        setOrders(orders.map(o => o.id === id ? { ...o, ...updates } : o));
    };

    const value = {
        retailers, addRetailer, updateRetailer, deleteRetailer,
        vendors, addVendor, updateVendor, deleteVendor,
        distributors, addDistributor, updateDistributor, deleteDistributor,
        products, addProduct, deleteProduct,
        orders, addOrder, updateOrder
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
