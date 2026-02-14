import React, { useState } from 'react';
import { Search, MapPin, Plus, Loader2, Star, Building, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';

export default function RetailerDiscovery() {
    const navigate = useNavigate();
    const { addRetailer } = useData();
    const toast = useToast();

    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        setResults([]);

        try {
            // Call our Vercel Serverless Function
            // Note: In local Vite dev (npm run dev), this path /api/... might 404 unless proxy is set up.
            // But it will work on Vercel or with `vercel dev`.
            const res = await fetch(`/api/searchRetailers?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Search failed: ${res.status}`);
            }

            const data = await res.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to search retailers');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = (place) => {
        const newRetailer = {
            name: place.name,
            location: location || extractCityState(place.address) || 'Unknown Location',
            address: place.address,
            warehouseCode: 'TBD',
            notes: `Imported from Google Places. Place ID: ${place.place_id}. Rating: ${place.rating}`,
            accounts: {}
        };

        addRetailer(newRetailer);
        toast.success(`Imported ${place.name}`);
    };

    // Helper to try and pull "City, State" from the formatted address string
    // Google formatted_address usually looks like "123 Main St, Nashville, TN 37209, USA"
    // This is a naive heuristic
    const extractCityState = (address) => {
        if (!address) return '';
        const parts = address.split(',').map(p => p.trim());
        // If we have > 2 parts, assume second to last is state/zip and third to last is city? 
        // Or just return the whole address if it's short.
        if (parts.length >= 2) {
            // Return "City, State" roughly
            const stateZip = parts[parts.length - 2];
            const city = parts[parts.length - 3];
            if (city && stateZip) return `${city}, ${stateZip.split(' ')[0]}`; // Split zip off state
        }
        return address;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/retailers')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Retailer Discovery</h1>
                    <p className="text-gray-500 dark:text-gray-400">Find and import retailers using Google Places.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <form onSubmit={handleSearch} className="grid md:grid-cols-[2fr_1fr_auto] gap-4">
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Search Term</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='e.g. "Hardware Stores" or "Home Depot"'
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder='e.g. "Nashville, TN"'
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={loading || !query}
                            className="w-full md:w-auto h-[42px] px-6 bg-cdh-red text-white font-semibold rounded-lg hover:bg-cdh-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {searched && (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Results {results.length > 0 && <span className="text-sm font-normal text-gray-500">({results.length} found)</span>}
                    </h2>
                )}

                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <Loader2 className="animate-spin mb-4 text-cdh-red" size={48} />
                        <p>Searching Google Places...</p>
                    </div>
                )}

                {!loading && searched && results.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm">Try adjusting your search terms or location.</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((place) => (
                        <div key={place.place_id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Building size={24} />
                                </div>
                                {place.rating && (
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{place.rating}</span>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1" title={place.name}>{place.name}</h3>

                            <div className="flex items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
                                <MapPin size={16} className="shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{place.address}</span>
                            </div>

                            <button
                                onClick={() => handleImport(place)}
                                className="w-full py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-cdh-red dark:hover:text-red-400 hover:border-cdh-red dark:hover:border-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Import Retailer
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
