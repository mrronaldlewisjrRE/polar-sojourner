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
        if (!query.trim() || !location.trim()) {
            toast.error("Please enter both a search term and a location.");
            return;
        }

        setLoading(true);
        setSearched(true);
        setResults([]);

        try {
            // Call our Vercel Serverless Function
            // This function will now query the Yelp Fusion API
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

    const handleImport = async (business) => {
        const newRetailer = {
            name: business.name,
            location: location || 'Unknown Location',
            address: business.address,
            warehouseCode: 'TBD',
            notes: `Imported from Yelp. Yelp ID: ${business.id}. Rating: ${business.rating} (${business.review_count} reviews). Phone: ${business.phone}`,
            accounts: {}
        };

        try {
            await addRetailer(newRetailer);
            toast.success(`Imported ${business.name}`);
        } catch (error) {
            console.error(error);
            toast.error(`Failed to import ${business.name}. See console.`);
        }
    };

    // Helper to try and pull "City, State" from the formatted address string
    // Google formatted_address usually looks like "123 Main St, Nashville, TN 37209, USA"
    // This is a naive heuristic
    // const extractCityState = (address) => {
    //     if (!address) return '';
    //     const parts = address.split(',').map(p => p.trim());
    //     // If we have > 2 parts, assume second to last is state/zip and third to last is city? 
    //     // Or just return the whole address if it's short.
    //     if (parts.length >= 2) {
    //         // Return "City, State" roughly
    //         const stateZip = parts[parts.length - 2];
    //         const city = parts[parts.length - 3];
    //         if (city && stateZip) return `${city}, ${stateZip.split(' ')[0]}`; // Split zip off state
    //     }
    //     return address;
    // };

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
                    <p className="text-gray-500 dark:text-gray-400">Find and import retailers using Yelp Fusion.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <form onSubmit={handleSearch} className="grid md:grid-cols-[2fr_1fr_auto] gap-4">
                    <div className="relative">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Business Type / Name</label>
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
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">City, State or Zip</label>
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
                            disabled={loading || !query || !location}
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
                        <p>Searching Yelp...</p>
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
                    {(Array.isArray(results) ? results : []).map((place) => (
                        <div key={place.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden">

                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2" title={place.name}>{place.name}</h3>
                                {place.rating && (
                                    <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full shrink-0">
                                        <Star size={12} className="fill-red-500 text-red-500" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{place.rating}</span>
                                        <span className="text-[10px] text-gray-400">({place.review_count})</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{place.address}</span>
                                </div>
                                {place.phone && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">{place.phone}</span>
                                    </div>
                                )}
                                {place.categories && place.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {(Array.isArray(place.categories) ? place.categories : []).slice(0, 3).map((cat, idx) => (
                                            <span key={idx} className="text-[10px] uppercase font-bold tracking-wider text-gray-500 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                )}
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
