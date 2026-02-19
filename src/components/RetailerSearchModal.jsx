import React, { useState } from 'react';
import { Search, MapPin, Plus, ExternalLink, Loader2, Save } from 'lucide-react';

export default function RetailerSearchModal({ isOpen, onClose, onImport }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            // Using OpenStreetMap Nominatim API (Free, No Key)
            // Validating inputs to be polite to the API
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=10`, {
                headers: {
                    'User-Agent': 'PolarSojourner/1.0 (internal-tool)'
                }
            });

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            setResults(data);
        } catch {
            setError('Failed to fetch results. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = (item) => {
        // Map OSM data to our Retailer format
        const address = item.address || {};
        const newRetailer = {
            name: item.name || query.split(' ')[0] || 'Unknown Retailer', // Fallback if name missing
            location: `${address.city || address.town || address.village || ''}, ${address.state || ''}`.replace(/^, /, ''),
            address: item.display_name,
            warehouseCode: 'TBD', // Default key
            notes: `Imported from OpenStreetMap via Live Search. OSM ID: ${item.osm_id}`,
            accounts: {}
        };
        onImport(newRetailer);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">

                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Search size={20} className="text-cdh-red" />
                            Retailer Discovery
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Search globally via OpenStreetMap</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-10">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="e.g. 'Hardware Stores in Nashville, TN'"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red focus:border-cdh-red outline-none shadow-sm transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-cdh-red text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-cdh-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                        </button>
                    </form>
                    <div className="mt-2 text-xs text-gray-400 flex justify-between">
                        <span>Tip: Be specific (e.g. "Ace Hardware Chicago")</span>
                        <span className="flex items-center gap-1">Powered by <span className="font-semibold text-gray-500">OpenStreetMap</span></span>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {!loading && results.length === 0 && query && !error && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <MapPin size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No results found.</p>
                        </div>
                    )}

                    {(Array.isArray(results) ? results : []).map((item) => (
                        <div key={item.osm_id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.name || query.split(' ')[0] || 'Unknown Retailer'}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{item.display_name}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded uppercase ${(item.type === 'city' || item.type === 'administrative')
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                            : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                            }`}>
                                            {(item.type === 'city' || item.type === 'administrative') && <AlertTriangle size={10} />}
                                            {item.type.replace('_', ' ')}
                                        </span>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.display_name)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                                        >
                                            <ExternalLink size={10} /> Verify on Google
                                        </a>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleImport(item)}
                                    className="shrink-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-cdh-red dark:hover:border-red-500 hover:text-cdh-red dark:hover:text-red-400 text-gray-500 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center gap-1 min-w-[80px]"
                                >
                                    <Plus size={20} />
                                    <span>Import</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl flex justify-between items-center text-xs text-gray-400">
                    <span>Results are provided "as-is" from community data.</span>
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors font-medium">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
