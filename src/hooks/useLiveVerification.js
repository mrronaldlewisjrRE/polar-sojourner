import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Deterministic status generator (Mock)
// Returns 'active' or 'inactive' based on SKU hash to be consistent across reloads
const getSimulatedStatus = (sku) => {
    let hash = 0;
    for (let i = 0; i < sku.length; i++) {
        hash = ((hash << 5) - hash) + sku.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    // 80% chance of being active
    const randomish = Math.abs(hash) % 100;
    return randomish < 80 ? 'active' : 'inactive';
};

export function useLiveVerification() {
    const [progress, setProgress] = useState({ total: 0, checked: 0, isComplete: false });
    const processingRef = useRef(false);

    // This function triggers the cascade verification
    const startVerification = useCallback((items) => {
        if (processingRef.current || !items || items.length === 0) return;

        processingRef.current = true;
        setProgress({ total: items.length, checked: 0, isComplete: false });

        let checkedCount = 0;
        const queue = [...items];

        // We simulate a constrained concurrency (e.g., 3 checks at a time)
        // wrapper to process one item
        const processItem = () => {
            if (queue.length === 0) {
                if (checkedCount === items.length) {
                    processingRef.current = false;
                    setProgress(p => ({ ...p, isComplete: true }));
                }
                return;
            }

            const item = queue.shift();

            // 1. Mark as "checking" (yellow pulse) via event/storage
            // We'll interpret 'unknown' as pending if we are in verification mode, 
            // but here we can dispatch a specific 'checking' event if we want distinct UI.
            // For simplicity, we'll let the UI show "checking" if status is unknown and verification is active,
            // or we can explicitly set a temp status.
            // Let's explicitly set a "checking" status so the UI reacts immediately.

            window.dispatchEvent(new CustomEvent('sku-status-update-internal', {
                detail: { sku: item.sku, status: 'checking' }
            }));

            // 2. Simulate network delay (random 500ms - 1500ms)
            const delay = 500 + Math.random() * 1000;

            setTimeout(() => {
                // 3. Resolve status
                const result = getSimulatedStatus(item.sku);

                // 4. Update Persistence (Supabase)
                const data = {
                    sku: item.sku,
                    status: result,
                    created_at: new Date().toISOString()
                };

                // Fire and forget - don't await strictly to keep UI snappy
                supabase.from('sku_logs').insert([data]).then(({ error }) => {
                    if (error) console.error('Error logging SKU status:', error);
                });

                // Also update local storage for immediate UI feedback in other components (legacy support)
                localStorage.setItem(`sku_status_${item.sku}`, JSON.stringify({
                    status: result,
                    timestamp: new Date().toISOString(),
                    method: 'auto-verified'
                }));

                // Dispatch event for LiveStatusIndicator to pick up
                window.dispatchEvent(new Event('sku-status-update'));

                checkedCount++;
                setProgress({ total: items.length, checked: checkedCount, isComplete: checkedCount === items.length });

                // Next
                processItem();
            }, delay);
        };

        // Start concurrency fan-out (e.g., 5 parallel workers)
        const WORKERS = 5;
        for (let i = 0; i < Math.min(WORKERS, queue.length); i++) {
            processItem();
        }

    }, []);

    return { startVerification, progress };
}
