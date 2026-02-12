import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useLiveVerification() {
    const [progress, setProgress] = useState({ total: 0, checked: 0, isComplete: false });
    const [isScanning, setIsScanning] = useState(false);
    const stopRequested = useRef(false);
    const processingRef = useRef(false);

    const stopVerification = useCallback(() => {
        if (processingRef.current) {
            stopRequested.current = true;
        }
    }, []);

    const startVerification = useCallback((items) => {
        if (processingRef.current || !items || items.length === 0) return;

        processingRef.current = true;
        stopRequested.current = false;
        setIsScanning(true);
        setProgress({ total: items.length, checked: 0, isComplete: false });

        let checkedCount = 0;
        const queue = [...items];

        const processItem = async () => {
            // Check for stop signal
            if (stopRequested.current) {
                // If stopped, we just empty the queue and finish
                queue.length = 0;
            }

            if (queue.length === 0) {
                if (checkedCount === items.length || stopRequested.current) {
                    processingRef.current = false;
                    setIsScanning(false);
                    setProgress(p => ({ ...p, isComplete: true }));
                }
                return;
            }

            const item = queue.shift();

            // 1. Mark as "checking"
            window.dispatchEvent(new CustomEvent('sku-status-update-internal', {
                detail: { sku: item.sku, status: 'checking' }
            }));

            try {
                // 2. Call Real API
                const params = new URLSearchParams({
                    sku: item.sku,
                    vendor: item.vendorId || item.vendorName?.toLowerCase().replace(/\s+/g, '')
                });

                const response = await fetch(`/api/check-sku?${params.toString()}`);
                const resultData = await response.json();

                // fallback if API fails or returns unknown
                const status = resultData.status || 'unknown';

                // 3. Update Persistence
                const data = {
                    sku: item.sku,
                    status: status,
                    created_at: new Date().toISOString(),
                    metadata: resultData // Store full result including reason/url
                };

                // Fire and forget log
                supabase.from('sku_logs').insert([data]).then(({ error }) => {
                    if (error) console.error('Error logging SKU status:', error);
                });

                // Update Local Storage
                localStorage.setItem(`sku_status_${item.sku}`, JSON.stringify({
                    status: status,
                    timestamp: new Date().toISOString(),
                    method: 'auto-verified-api',
                    reason: resultData.reason
                }));

                // Dispatch update
                window.dispatchEvent(new Event('sku-status-update'));

            } catch (error) {
                console.error('API Check failed:', error);
                // Mark as error/unknown locally so it stops pulsing
                localStorage.setItem(`sku_status_${item.sku}`, JSON.stringify({
                    status: 'unknown',
                    timestamp: new Date().toISOString(),
                    method: 'auto-verified-error',
                    error: true
                }));
                window.dispatchEvent(new Event('sku-status-update'));
            }

            checkedCount++;
            // Update progress only if not stopped (or maybe just show what we did)
            setProgress({
                total: items.length,
                checked: checkedCount,
                isComplete: checkedCount === items.length
            });

            // Next
            if (!stopRequested.current) {
                processItem();
            } else {
                // If stopped, ensure we clean up
                if (queue.length === 0) {
                    processingRef.current = false;
                    setIsScanning(false);
                }
            }
        };

        // Concurrency: 6 workers (Speed up)
        const WORKERS = 6;
        for (let i = 0; i < Math.min(WORKERS, queue.length); i++) {
            processItem();
        }

    }, []);

    return { startVerification, stopVerification, isScanning, progress };
}
