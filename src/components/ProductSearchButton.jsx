import React, { useState, useRef, useEffect } from 'react';
import { Search, ExternalLink, ShoppingBag, Globe, Building } from 'lucide-react';

export default function ProductSearchButton({ sku, description, vendorName }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!sku && !description) return null;

    const searchTerm = `${sku} ${description || ''} ${vendorName || ''}`.trim();
    const encodedTerm = encodeURIComponent(searchTerm);
    const encodedSku = encodeURIComponent(sku);

    const links = [
        {
            label: 'Check Orgill.com',
            icon: <Building size={14} className="text-blue-600" />,
            url: `https://www.orgill.com/search?q=${encodedSku}`,
            desc: 'Competitor Stock'
        },
        {
            label: 'Amazon Search',
            icon: <ShoppingBag size={14} className="text-orange-500" />,
            url: `https://www.amazon.com/s?k=${encodedTerm}`,
            desc: 'Market Price'
        },
        {
            label: 'Google Shopping',
            icon: <Globe size={14} className="text-green-600" />,
            url: `https://www.google.com/search?tbm=shop&q=${encodedTerm}`,
            desc: 'Price Comparison'
        }
    ];

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-gray-400 hover:text-cdh-red dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center gap-1"
                title="Product Intelligence Search"
            >
                <Search size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            External Search
                        </span>
                    </div>
                    <div className="p-1">
                        {links.map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="p-1.5 bg-gray-50 dark:bg-gray-800 rounded group-hover:bg-white dark:group-hover:bg-gray-600 border border-gray-100 dark:border-gray-700 transition-colors">
                                    {link.icon}
                                </span>
                                <div>
                                    <div className="font-medium flex items-center gap-1">
                                        {link.label}
                                        <ExternalLink size={10} className="opacity-50" />
                                    </div>
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500">{link.desc}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
