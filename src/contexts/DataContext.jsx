import React, { createContext, useContext, useState, useEffect } from 'react';
import { VENDORS as INITIAL_VENDORS, DISTRIBUTORS as INITIAL_DISTRIBUTORS, PRODUCTS as INITIAL_PRODUCTS } from '../lib/mockData';
import { RETAILERS as INITIAL_RETAILERS } from '../data/retailers';

const DataContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

import { supabase } from '../lib/supabase';

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState({});
    const [vendors, setVendors] = useState([]);
    const [retailers, setRetailers] = useState(INITIAL_RETAILERS);
    const [distributors, setDistributors] = useState(INITIAL_DISTRIBUTORS);
    const [orders, setOrders] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vData, rData, pData, oData, eData] = await Promise.all([
                    supabase.from('vendors').select('*'),
                    supabase.from('retailers').select('*'),
                    supabase.from('products').select('*'),
                    supabase.from('orders').select('*'),
                    supabase.from('events').select('*')
                ]);

                if (vData.data) setVendors(vData.data);
                if (rData.data) setRetailers(rData.data);
                if (oData.data) setOrders(oData.data);
                if (eData.data) setEvents(eData.data);

                // Transform Products: Flat DB list -> { vendorId: [products] }
                if (pData.data) {
                    const productMap = {};
                    pData.data.forEach(p => {
                        if (!productMap[p.vendor_id]) productMap[p.vendor_id] = [];
                        productMap[p.vendor_id].push(p);
                    });
                    setProducts(productMap);
                }

            } catch (error) {
                console.error('Data load failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime Subscription
        const tables = ['vendors', 'retailers', 'products', 'orders', 'events'];
        const channels = tables.map(table => {
            return supabase
                .channel(`public:${table}`)
                .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
                    if (table === 'vendors') handleRealtimeUpdate(setVendors, payload);
                    if (table === 'retailers') handleRealtimeUpdate(setRetailers, payload);
                    if (table === 'orders') handleRealtimeUpdate(setOrders, payload);
                    if (table === 'events') handleRealtimeUpdate(setEvents, payload);
                    // Products skipped for realtime complexity
                })
                .subscribe();
        });

        return () => channels.forEach(c => supabase.removeChannel(c));
    }, []);

    // Helper for Realtime Arrays
    const handleRealtimeUpdate = (setter, payload) => {
        if (payload.eventType === 'INSERT') setter(prev => [payload.new, ...prev]);
        if (payload.eventType === 'UPDATE') setter(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
        if (payload.eventType === 'DELETE') setter(prev => prev.filter(item => item.id !== payload.old.id));
    };

    // --- Actions ---

    // Retailers (Supabase - Text ID)
    const addRetailer = async (retailer) => {
        const newRetailer = { ...retailer, id: `r${Date.now()}` };
        const { error } = await supabase.from('retailers').insert([newRetailer]);
        if (error) console.error("Error adding retailer:", error);
    };

    const updateRetailer = async (id, updates) => {
        const { error } = await supabase.from('retailers').update(updates).eq('id', id);
        if (error) console.error("Error updating retailer:", error);
    };

    const toggleRetailerFavorite = async (id) => {
        const retailer = retailers.find(r => r.id === id);
        if (retailer) {
            const { error } = await supabase.from('retailers').update({ is_favorite: !retailer.is_favorite }).eq('id', id);
            if (error) console.error("Error toggling favorite:", error);
        }
    };

    const deleteRetailer = async (id) => {
        const { error } = await supabase.from('retailers').delete().eq('id', id);
        if (error) console.error("Error deleting retailer:", error);
    };

    // Vendors (Supabase - Text ID)
    const addVendor = async (vendor) => {
        const newVendor = { ...vendor, id: `v${Date.now()}` };
        const { error } = await supabase.from('vendors').insert([newVendor]);
        if (error) console.error("Error adding vendor:", error);
    };

    const updateVendor = async (id, updates) => {
        const { error } = await supabase.from('vendors').update(updates).eq('id', id);
        if (error) console.error("Error updating vendor:", error);
    };

    const deleteVendor = async (id) => {
        const { error } = await supabase.from('vendors').delete().eq('id', id);
        if (error) console.error("Error deleting vendor:", error);
    };

    // Events (Supabase - BigInt ID)
    const addEvent = async (event) => {
        // eslint-disable-next-line no-unused-vars
        const { id, ...dbEvent } = event; // Strip ID, let DB generate
        const { error } = await supabase.from('events').insert([dbEvent]);
        if (error) console.error("Error adding event:", error);
    };

    const updateEvent = async (id, updates) => {
        const { error } = await supabase.from('events').update(updates).eq('id', id);
        if (error) console.error("Error updating event:", error);
    };

    // Distributors (Local only)
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

    // Products (Supabase - BigInt ID)
    const addProduct = async (vendorId, product) => {
        // eslint-disable-next-line no-unused-vars
        const { id, ...cleanProduct } = product;
        const newProduct = {
            ...cleanProduct,
            vendor_id: vendorId,
            sku: product.sku || `SKU-${Date.now()}`
        };
        const { error } = await supabase.from('products').insert([newProduct]);
        if (error) console.error("Error adding product:", error);

        // Manual local update (Optimistic)
        const currentVendorProducts = products[vendorId] || [];
        setProducts({
            ...products,
            [vendorId]: [...currentVendorProducts, newProduct]
        });
    };

    const updateProduct = async (vendorId, productId, updates) => {
        const { error } = await supabase.from('products').update(updates).eq('id', productId);
        if (error) console.error("Error updating product:", error);

        // Manual local update
        const currentVendorProducts = products[vendorId] || [];
        setProducts({
            ...products,
            [vendorId]: currentVendorProducts.map(p => p.id === productId ? { ...p, ...updates } : p)
        });
    };

    const deleteProduct = async (vendorId, productId) => {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) console.error("Error deleting product:", error);

        // Manual local update
        const currentVendorProducts = products[vendorId] || [];
        setProducts({
            ...products,
            [vendorId]: currentVendorProducts.filter(p => p.id !== productId)
        });
    };

    // Orders (Supabase - BigInt ID)
    const addOrder = async (order) => {
        // eslint-disable-next-line no-unused-vars
        const { id, ...cleanOrder } = order;
        const newOrder = {
            ...cleanOrder,
            created_at: new Date().toISOString()
        };
        const { error } = await supabase.from('orders').insert([newOrder]);
        if (error) console.error("Error adding order:", error);
    };

    const updateOrder = async (id, updates) => {
        const { error } = await supabase.from('orders').update(updates).eq('id', id);
        if (error) console.error("Error updating order:", error);
    };

    const value = {
        retailers, addRetailer, updateRetailer, deleteRetailer, toggleRetailerFavorite,
        vendors, addVendor, updateVendor, deleteVendor,
        distributors, addDistributor, updateDistributor, deleteDistributor,
        products, addProduct, updateProduct, deleteProduct,
        orders, addOrder, updateOrder,
        events, addEvent, updateEvent,
        loading
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
