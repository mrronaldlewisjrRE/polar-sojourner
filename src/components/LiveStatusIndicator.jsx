import React, { useState, useEffect } from 'react';
import ManualCheckModal from './ManualCheckModal';

// Helper to interact with localStorage safely
const getStoredStatus = (sku) => {
    try {
        const item = localStorage.getItem(`sku_status_${sku}`);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
};

const setStoredStatus = (sku, status) => {
    try {
        const data = {
            status,
            timestamp: new Date().toISOString(),
            method: 'manual'
        };
        localStorage.setItem(`sku_status_${sku}`, JSON.stringify(data));
        return data;
    } catch (e) {
        return null;
    }
};

export default function LiveStatusIndicator({ sku, storeName = 'Vendor Site' }) {
    const [statusData, setStatusData] = useState(() => getStoredStatus(sku));
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (sku) {
            const current = getStoredStatus(sku);
            // eslint-disable-next-line
            setStatusData(current);
        }
    }, [sku]);

    const handleUpdate = (newStatus) => {
        const data = setStoredStatus(sku, newStatus);
        setStatusData(data);
        // Dispatch custom event to sync other indicators
        window.dispatchEvent(new Event('sku-status-update'));
    };

    // Listen for updates from other instances
    useEffect(() => {
        const handleSync = () => {
            if (sku) setStatusData(getStoredStatus(sku));
        };
        // Listen for internal "checking" events from the auto-verifier
        const handleInternal = (e) => {
            if (e.detail?.sku === sku && e.detail?.status === 'checking') {
                setStatusData({ status: 'checking', timestamp: null });
            }
        };

        window.addEventListener('sku-status-update', handleSync);
        window.addEventListener('sku-status-update-internal', handleInternal);

        return () => {
            window.removeEventListener('sku-status-update', handleSync);
            window.removeEventListener('sku-status-update-internal', handleInternal);
        };
    }, [sku]);

    if (!sku) return null;

    const status = statusData?.status || 'unknown';

    // Visual styles
    const baseStyle = "w-3 h-3 rounded-full cursor-pointer transition-all duration-300";
    const statusStyles = {
        active: "bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]",
        inactive: "bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]",
        checking: "bg-yellow-400 animate-pulse shadow-[0_0_8px_2px_rgba(250,204,21,0.6)]",
        unknown: "bg-gray-300 dark:bg-gray-600 hover:bg-yellow-400 shadow-none hover:shadow-[0_0_8px_2px_rgba(250,204,21,0.5)]"
    };

    return (
        <div className="relative inline-flex items-center justify-center mr-2">
            <div
                className={`${baseStyle} ${statusStyles[status]}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsModalOpen(true)}
            />

            {/* Tooltip */}
            {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-max max-w-[200px] bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none shadow-lg animate-in fade-in zoom-in-95 duration-100">
                    <p className="font-semibold capitalize mb-0.5">Status: {status}</p>
                    {statusData?.timestamp ? (
                        <p className="opacity-75 text-[10px]">
                            Checked: {new Date(statusData.timestamp).toLocaleDateString()}
                        </p>
                    ) : (
                        <p className="opacity-75 text-[10px]">Click to verify</p>
                    )}
                    {/* Triangle arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900"></div>
                </div>
            )}

            <ManualCheckModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sku={sku}
                storeName={storeName}
                currentStatus={status}
                onUpdateStatus={handleUpdate}
            />
        </div>
    );
}
