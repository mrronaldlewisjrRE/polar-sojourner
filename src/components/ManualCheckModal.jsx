import React, { useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { RETAILER_CATALOG } from '../data/retailerCatalog';

export default function ManualCheckModal({ isOpen, onClose, sku, productName, currentStatus, onUpdateStatus, storeName }) {
    if (!isOpen) return null;

    const getStoreLinks = () => {
        const links = [];

        Object.entries(RETAILER_CATALOG).forEach(([storeKey, products]) => {
            const product = products[sku];
            if (product) {
                let url = '';
                let label = '';

                switch (storeKey) {
                    case 'tractor-supply':
                        url = product.storeSku
                            ? `https://www.tractorsupply.com/tsc/product/${product.storeSku}`
                            : `https://www.tractorsupply.com/tsc/search/${sku}`;
                        label = 'Tractor Supply';
                        break;
                    case 'lowes':
                        url = product.storeSku
                            ? `https://www.lowes.com/search?searchTerm=${product.storeSku}`
                            : `https://www.lowes.com/search?searchTerm=${sku}`;
                        label = "Lowe's";
                        break;
                    case 'homedepot':
                        url = product.storeSku
                            ? `https://www.homedepot.com/p/${product.storeSku}`
                            : `https://www.homedepot.com/s/${sku}`;
                        label = 'Home Depot';
                        break;
                    case 'amazon':
                        // Amazon fallbacks since storeSku (ASIN) might be missing
                        url = product.storeSku
                            ? `https://www.amazon.com/dp/${product.storeSku}`
                            : `https://www.amazon.com/s?k=${sku}`;
                        label = 'Amazon';
                        break;
                    default:
                        break;
                }

                if (url) {
                    links.push({ url, label, exact: !!product.storeSku });
                }
            }
        });

        // Fallback if no catalog matches or strict storeName provided
        if (links.length === 0) {
            const query = encodeURIComponent(`${storeName || ''} ${sku} ${productName || ''}`);
            links.push({
                url: `https://www.google.com/search?q=${query}`,
                label: `Search Web (${storeName || 'General'})`,
                exact: false
            });
        }

        return links;
    };

    const links = getStoreLinks();

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="text-blue-500" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verify SKU Status</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Check availability for <strong>{sku}</strong>
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col gap-2 mb-4">
                        {(Array.isArray(links) ? links : []).map((link, idx) => (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg transition-colors font-medium text-sm
                                    ${link.exact
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                                    }`}
                            >
                                <ExternalLink size={16} />
                                Check {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => { onUpdateStatus('active'); onClose(); }}
                            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        >
                            <CheckCircle size={20} />
                            <span className="text-xs font-bold">Mark Active</span>
                        </button>
                        <button
                            onClick={() => { onUpdateStatus('inactive'); onClose(); }}
                            className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        >
                            <XCircle size={20} />
                            <span className="text-xs font-bold">Mark Inactive</span>
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs mt-2"
                    >
                        Cancel / Keep as '{currentStatus || 'Unknown'}'
                    </button>
                </div>
            </div>
        </div>
    );
}
