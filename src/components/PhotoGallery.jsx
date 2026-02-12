import React, { useState } from 'react';
import { Filter, Image as ImageIcon, Maximize2, Calendar, SortDesc, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { cn } from '../lib/utils';

// Mock Photo Data (Static Legacy Data)
const MOCK_PHOTOS = [
    { id: 'm1', title: 'House-Hasson Fall Market Booth', category: 'Show', url: 'https://images.unsplash.com/photo-1540575467063-17ebe8624387?auto=format&fit=crop&q=80&w=800', date: '2023-10-15' },
    { id: 'm2', title: 'Milwaukee Tool Display', category: 'Distributor', url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800', date: '2023-11-02' },
    { id: 'm3', title: 'Orgill Spring Dealer Market', category: 'Show', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800', date: '2024-02-20' },
    { id: 'm4', title: 'Warehouse Setup - Nashville', category: 'Distributor', url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800', date: '2024-01-10' },
    { id: 'm5', title: 'Do it Best Market Floor', category: 'Show', url: 'https://images.unsplash.com/photo-1560439514-e960a3ef5019?auto=format&fit=crop&q=80&w=800', date: '2023-09-12' },
    { id: 'm6', title: 'Ace Hardware Convention', category: 'Show', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800', date: '2023-08-15' },
];

export default function PhotoGallery() {
    const { events, updateEvent } = useData();
    const [filter, setFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Date'); // 'Date' or 'Title'
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // 1. Transform Calendar Events into Photo Objects
    const eventPhotos = events ? events.flatMap(event =>
        (event.images || []).map(img => ({
            id: img.id,
            eventId: event.id, // Keep track of event ID for deletion
            title: event.title,
            category: event.type, // Map 'Schedule'/'Show' to category
            url: img.url,
            date: event.date,
            isEventPhoto: true
        }))
    ) : [];

    // 2. Merge and Filter
    const allPhotos = [...MOCK_PHOTOS, ...eventPhotos];

    const filteredPhotos = allPhotos.filter(photo => {
        if (filter === 'All') return true;
        // Map specific event types if needed, otherwise exact match
        if (filter === 'Show') return photo.category === 'Show';
        if (filter === 'Distributor') return photo.category === 'Distributor';
        return photo.category === filter;
    });

    // 3. Sort
    const sortedPhotos = filteredPhotos.sort((a, b) => {
        if (sortBy === 'Date') {
            return new Date(b.date) - new Date(a.date); // Newest first
        }
        return a.title.localeCompare(b.title);
    });

    const toggleSelection = (photo) => {
        if (!photo.isEventPhoto) return; // Cannot select mock photos
        const newSelected = new Set(selectedIds);
        if (newSelected.has(photo.id)) {
            newSelected.delete(photo.id);
        } else {
            newSelected.add(photo.id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Delete ${selectedIds.size} selected photos?`)) return;

        // Group by event to minimize updates
        const photosToDelete = eventPhotos.filter(p => selectedIds.has(p.id));
        const eventsToUpdate = {};

        photosToDelete.forEach(photo => {
            if (!eventsToUpdate[photo.eventId]) {
                eventsToUpdate[photo.eventId] = new Set();
            }
            eventsToUpdate[photo.eventId].add(photo.id);
        });

        // Execute updates
        Object.entries(eventsToUpdate).forEach(([eventId, imageIds]) => {
            const event = events.find(e => e.id === eventId);
            if (event) {
                const updatedImages = (event.images || []).filter(img => !imageIds.has(img.id));
                updateEvent(eventId, { images: updatedImages });
            }
        });

        // Reset
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };

    const handleDeletePhoto = (e, photo) => {
        e.stopPropagation();
        if (!photo.isEventPhoto || !window.confirm('Delete this photo?')) return;

        const event = events.find(ev => ev.id === photo.eventId);
        if (event) {
            const updatedImages = (event.images || []).filter(img => img.id !== photo.id);
            updateEvent(photo.eventId, { images: updatedImages });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ImageIcon size={20} className="text-cdh-red" />
                        Event Gallery
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full ml-2">
                            {sortedPhotos.length} items
                        </span>
                    </h2>

                    {/* Selection Controls */}
                    {isSelectionMode ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedIds.size === 0}
                                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                            >
                                <Trash2 size={12} />
                                Delete ({selectedIds.size})
                            </button>
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedIds(new Set());
                                }}
                                className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            className="text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Select Photos
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Filter */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-md border border-gray-200 dark:border-gray-700">
                        <Filter size={14} className="text-gray-400 ml-1" />
                        <select
                            className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Show">Shows / Markets</option>
                            <option value="Distributor">Distributor Events</option>
                            <option value="Schedule">Schedules/Other</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-md border border-gray-200 dark:border-gray-700">
                        <SortDesc size={14} className="text-gray-400 ml-1" />
                        <select
                            className="bg-transparent text-sm outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="Date">Date (Newest)</option>
                            <option value="Title">Title (A-Z)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {sortedPhotos.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No photos found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedPhotos.map((photo) => {
                        const isSelected = selectedIds.has(photo.id);
                        return (
                            <div
                                key={photo.id}
                                className={cn(
                                    "group relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border",
                                    isSelected
                                        ? "border-cdh-red ring-2 ring-cdh-red ring-offset-2 dark:ring-offset-gray-900"
                                        : "border-gray-200 dark:border-gray-700"
                                )}
                                onClick={() => isSelectionMode ? toggleSelection(photo) : setSelectedPhoto(photo)}
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className={cn(
                                        "w-full h-full object-cover transition-transform duration-500",
                                        !isSelectionMode && "group-hover:scale-105",
                                        isSelectionMode && !photo.isEventPhoto && "opacity-50 grayscale"
                                    )}
                                    loading="lazy"
                                />

                                {/* Selection Checkbox Overlay */}
                                {isSelectionMode && photo.isEventPhoto && (
                                    <div className="absolute top-2 right-2">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            isSelected
                                                ? "bg-cdh-red border-cdh-red text-white"
                                                : "bg-black/30 border-white text-transparent hover:bg-black/50"
                                        )}>
                                            <div className="w-2.5 h-2.5 bg-current rounded-full" />
                                        </div>
                                    </div>
                                )}

                                {/* Normal Overlay (Hidden in selection mode) */}
                                {!isSelectionMode && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                            <div className="flex justify-between items-end">
                                                <div className="flex-1 min-w-0">
                                                    <span className={cn(
                                                        "text-[10px] font-mono px-1.5 py-0.5 rounded w-fit mb-1 inline-block",
                                                        photo.isEventPhoto ? "bg-blue-500 text-white" : "bg-cdh-red text-white"
                                                    )}>
                                                        {photo.category}
                                                    </span>
                                                    <h3 className="text-white font-medium truncate text-sm">{photo.title}</h3>
                                                    <p className="text-gray-300 text-[10px] flex items-center gap-1">
                                                        <Calendar size={10} /> {photo.date}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-full text-white">
                                            <Maximize2 size={14} />
                                        </div>

                                        {photo.isEventPhoto && (
                                            <button
                                                onClick={(e) => handleDeletePhoto(e, photo)}
                                                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-full"
                                                title="Delete Photo"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="max-w-5xl w-full max-h-[90vh] flex flex-col gap-4">
                        <img
                            src={selectedPhoto.url}
                            alt={selectedPhoto.title}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="text-white text-center">
                            <h3 className="text-xl font-bold">{selectedPhoto.title}</h3>
                            <div className="flex justify-center gap-3 text-sm text-gray-400 mt-1">
                                <span className="bg-gray-800 px-2 py-0.5 rounded">{selectedPhoto.category}</span>
                                <span>•</span>
                                <span>{selectedPhoto.date}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
