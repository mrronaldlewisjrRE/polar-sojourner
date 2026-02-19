import React, { createContext, useContext, useState, useEffect } from 'react';
import { VENDORS as INITIAL_VENDORS, DISTRIBUTORS as INITIAL_DISTRIBUTORS, PRODUCTS as INITIAL_PRODUCTS } from '../lib/mockData';
import { RETAILERS as INITIAL_RETAILERS } from '../data/retailers';

const DataContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

import { supabase } from '../lib/supabase';

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState([]); // User requested []
    const [vendors, setVendors] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [distributors, setDistributors] = useState([]);
    const [orders, setOrders] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [vData, rData, pData, oData, eData, dData] = await Promise.all([
                    supabase.from('vendors').select('*'),
                    supabase.from('retailers').select('*'),
                    supabase.from('products').select('*'),
                    supabase.from('orders').select('*'),
                    supabase.from('events').select('*'),
                    supabase.from('distributors').select('*')
                ]);

                // LOGGING FOR VERIFICATION
                console.log('Fetched Vendors:', vData.data);
                console.log('Fetched Distributors:', dData.data);
                console.log('Fetched Orders:', oData.data);
                console.log('Fetched Events:', eData.data);

                // Always set data from DB (or empty array if null/error)
                setVendors(vData.data || []);
                setDistributors(dData.data || []);
                setOrders(oData.data || []);
                setEvents(eData.data || []);

                if (rData.data) {
                    console.log('Fetched Retailers:', rData.data);
                    // MAP DB (snake_case) -> Frontend (camelCase)
                    const mappedRetailers = (rData.data || []).map(r => ({
                        ...r,
                        warehouseCode: r.warehouse_code, // Map back
                        contactName: r.contact_name,     // Map back
                        isFavorite: r.is_favorite        // Map back
                    }));
                    setRetailers(mappedRetailers);
                } else {
                    console.log('Fetched Retailers: NULL/EMPTY');
                    setRetailers([]);
                }

                // Transform Products: Flat DB list -> { vendorId: [products] }
                if (pData.data && pData.data.length > 0) {
                    console.log('Fetched Products (Raw):', pData.data);
                    const productMap = {};
                    pData.data.forEach(p => {
                        if (!productMap[p.vendor_id]) productMap[p.vendor_id] = [];
                        productMap[p.vendor_id].push(p);
                    });
                    setProducts(productMap);
                } else { // Handle empty products safely
                    console.log('Fetched Products: EMPTY');
                    setProducts({});
                }

            } catch (error) {
                console.error('Data load failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime Subscription
        const tables = ['vendors', 'distributors', 'retailers', 'products', 'orders', 'events'];
        const channels = tables.map(table => {
            return supabase
                .channel(`public:${table}`)
                .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
                    if (table === 'vendors') handleRealtimeUpdate(setVendors, payload);
                    if (table === 'distributors') handleRealtimeUpdate(setDistributors, payload);
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
    // Retailers (Supabase - Text ID)
    const addRetailer = async (retailer) => {
        const id = `r${Date.now()}`;

        // MAP Frontend (camelCase) -> DB (snake_case)
        const dbRetailer = {
            id,
            name: retailer.name,
            location: retailer.location,
            address: retailer.address,
            city: retailer.city,
            state: retailer.state,
            zip: retailer.zip,
            warehouse_code: retailer.warehouseCode, // Map
            contact_name: retailer.contactName,     // Map
            email: retailer.email,
            phone: retailer.phone,
            cell: retailer.cell,
            notes: retailer.notes,
            accounts: retailer.accounts,
            is_favorite: retailer.isFavorite || false, // Map
            created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('retailers').insert([dbRetailer]);

        if (error) {
            console.error("Error adding retailer:", error);
            throw error; // Propagate error to UI
        }

        // Optimistic Update (using camelCase for frontend)
        setRetailers(prev => [...prev, { ...retailer, id, isFavorite: false }]);
    };

    const updateRetailer = async (id, updates) => {
        // MAP Frontend (camelCase) -> DB (snake_case)
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.city !== undefined) dbUpdates.city = updates.city;
        if (updates.state !== undefined) dbUpdates.state = updates.state;
        if (updates.zip !== undefined) dbUpdates.zip = updates.zip;
        if (updates.warehouseCode !== undefined) dbUpdates.warehouse_code = updates.warehouseCode;
        if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.cell !== undefined) dbUpdates.cell = updates.cell;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.accounts !== undefined) dbUpdates.accounts = updates.accounts;
        if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;

        const { error } = await supabase.from('retailers').update(dbUpdates).eq('id', id);
        if (error) console.error("Error updating retailer:", error);

        // Optimistic Update
        setRetailers(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const toggleRetailerFavorite = async (id) => {
        const retailer = retailers.find(r => r.id === id);
        if (retailer) {
            const oldStatus = retailer.isFavorite;
            const newStatus = !oldStatus;

            // 1. Optimistic Update (Immediate)
            setRetailers(prev => prev.map(r => r.id === id ? { ...r, isFavorite: newStatus } : r));

            // 2. DB Update
            const { error } = await supabase.from('retailers').update({ is_favorite: newStatus }).eq('id', id);

            // 3. Revert on Error
            if (error) {
                console.error("Error toggling favorite:", error);
                setRetailers(prev => prev.map(r => r.id === id ? { ...r, isFavorite: oldStatus } : r));
            }
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

        // Map to snake_case for DB - STRICT PAYLOAD
        const newOrder = {
            retailer_id: cleanOrder.retailerId,
            vendor_id: cleanOrder.vendorId,
            distributor_id: cleanOrder.distributorId,
            vendor_number: cleanOrder.vendorNumber,
            customer_number: cleanOrder.customerNumber,
            internal_email: cleanOrder.internalEmail,
            order_email: cleanOrder.orderEmail,
            credit_auth_number: cleanOrder.creditAuthNumber,
            shipping_cost: cleanOrder.shippingCost,
            total: cleanOrder.total,
            notes: cleanOrder.notes,
            status: cleanOrder.status || 'Draft',
            items: cleanOrder.items,
            customer_email: cleanOrder.customerEmail
        };

        // Remove undefined keys
        Object.keys(newOrder).forEach(key => newOrder[key] === undefined && delete newOrder[key]);

        console.log("Submitting Order Payload:", newOrder);

        const { data, error } = await supabase.from('orders').insert([newOrder]).select();

        if (error) {
            console.error("Error adding order:", error);
            return { error };
        }

        if (data && data[0]) {
            const insertedOrder = data[0];
            setOrders(prev => {
                // Avoid duplicates from Realtime
                if (prev.find(o => o.id === insertedOrder.id)) return prev;
                return [insertedOrder, ...prev];
            });
            return { data: insertedOrder };
        }
        return { error: { message: "No data returned" } };
    };

    const updateOrder = async (id, updates) => {
        // Map updates to snake_case before sending to Supabase
        const snakeCaseUpdates = {};

        // Strict mapping based on user request
        if (updates.retailerId !== undefined) snakeCaseUpdates.retailer_id = updates.retailerId;
        if (updates.vendorId !== undefined) snakeCaseUpdates.vendor_id = updates.vendorId;
        if (updates.distributorId !== undefined) snakeCaseUpdates.distributor_id = updates.distributorId;
        if (updates.vendorNumber !== undefined) snakeCaseUpdates.vendor_number = updates.vendorNumber;
        if (updates.customerNumber !== undefined) snakeCaseUpdates.customer_number = updates.customerNumber;
        if (updates.internalEmail !== undefined) snakeCaseUpdates.internal_email = updates.internalEmail;
        if (updates.orderEmail !== undefined) snakeCaseUpdates.order_email = updates.orderEmail;
        if (updates.creditAuthNumber !== undefined) snakeCaseUpdates.credit_auth_number = updates.creditAuthNumber;
        if (updates.shippingCost !== undefined) snakeCaseUpdates.shipping_cost = updates.shippingCost;
        if (updates.total !== undefined) snakeCaseUpdates.total = updates.total;
        if (updates.notes !== undefined) snakeCaseUpdates.notes = updates.notes;
        if (updates.status !== undefined) snakeCaseUpdates.status = updates.status;
        if (updates.items !== undefined) snakeCaseUpdates.items = updates.items;
        // customer_email is requested but seemingly not in state source, assuming orderEmail is enough unless passed explicitly
        if (updates.customerEmail !== undefined) snakeCaseUpdates.customer_email = updates.customerEmail;

        console.log("Updating Order Payload:", snakeCaseUpdates);

        const { error } = await supabase.from('orders').update(snakeCaseUpdates).eq('id', id);
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
