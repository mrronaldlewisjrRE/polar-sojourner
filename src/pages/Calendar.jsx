import React, { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, X, Image as ImageIcon, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { compressImage } from '../lib/imageUtils';
import { useNavigate } from 'react-router-dom';

// Helper to get days in month
const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
};

export default function Calendar() {
    const { events, addEvent, updateEvent } = useData();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // View state inside modal: 'list' (day view) or 'add' (new event form)
    const [modalView, setModalView] = useState('list');
    const [previewImage, setPreviewImage] = useState(null);

    const [newEvent, setNewEvent] = useState({ title: '', type: 'Schedule', time: '09:00', notes: '', images: [] });
    const [isCompressing, setIsCompressing] = useState(false);

    // Refs for file inputs
    const fileInputRef = useRef(null);
    const addImageInputRef = useRef(null);
    const [activeEventIdForUpload, setActiveEventIdForUpload] = useState(null);

    const { days, firstDay } = getDaysInMonth(currentDate);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDateClick = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        setSelectedDate(dateStr);
        setModalView('list'); // Default to list view
        setIsModalOpen(true);
    };

    // --- Image Handling for New Event ---
    const handleNewEventImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsCompressing(true);
        try {
            const compressedImages = await Promise.all(
                files.map(async (file) => {
                    const url = await compressImage(file, 800, 0.6);
                    return {
                        id: Date.now() + Math.random(),
                        url,
                        name: file.name
                    };
                })
            );
            setNewEvent(prev => ({ ...prev, images: [...prev.images, ...compressedImages] }));
        } catch (error) {
            console.error('Image compression failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsCompressing(false);
        }
    };

    const removeNewEventImage = (id) => {
        setNewEvent(prev => ({ ...prev, images: prev.images.filter(img => img.id !== id) }));
    };

    // --- Image Handling for Existing Events ---
    const triggerAddImageToEvent = (eventId) => {
        setActiveEventIdForUpload(eventId);
        addImageInputRef.current?.click();
    };

    const handleAddImageToExistingEvent = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0 || !activeEventIdForUpload) return;

        setIsCompressing(true);
        try {
            const compressedImages = await Promise.all(
                files.map(async (file) => {
                    const url = await compressImage(file, 800, 0.6);
                    return {
                        id: Date.now() + Math.random(),
                        url,
                        name: file.name
                    };
                })
            );

            const eventToUpdate = events.find(e => e.id === activeEventIdForUpload);
            if (eventToUpdate) {
                const updatedImages = [...(eventToUpdate.images || []), ...compressedImages];
                updateEvent(activeEventIdForUpload, { images: updatedImages });
            }
        } catch (error) {
            console.error('Image compression failed:', error);
            alert('Failed to upload image.');
        } finally {
            setIsCompressing(false);
            setActiveEventIdForUpload(null);
            if (addImageInputRef.current) addImageInputRef.current.value = '';
        }
    };

    const removeImageFromEvent = (eventId, imageId) => {
        const eventToUpdate = events.find(e => e.id === eventId);
        if (eventToUpdate) {
            const updatedImages = (eventToUpdate.images || []).filter(img => img.id !== imageId);
            updateEvent(eventId, { images: updatedImages });
        }
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        const event = {
            date: selectedDate,
            ...newEvent
        };
        addEvent(event);
        setModalView('list'); // Go back to list view after adding
        setNewEvent({ title: '', type: 'Schedule', time: '09:00', notes: '', images: [] });
    };

    // Filter events for selected date
    const selectedDateEvents = events.filter(e => e.date === selectedDate);
    const sortedSelectedDateEvents = selectedDateEvents.sort((a, b) => a.time.localeCompare(b.time));

    const renderCalendarDays = () => {
        const calendarDays = [];
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"></div>);
        }
        for (let day = 1; day <= days; day++) {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            calendarDays.push(
                <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                        "h-32 border border-gray-100 dark:border-gray-700 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative group",
                        isToday && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                >
                    <span className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                        isToday ? "bg-cdh-red text-white" : "text-gray-700 dark:text-gray-300"
                    )}>
                        {day}
                    </span>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                        {dayEvents.map(event => (
                            <div key={event.id} className={cn(
                                "text-xs p-1 rounded truncate flex justify-between items-center group/event",
                                event.type === 'Show' ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                                    event.type === 'Schedule' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            )}>
                                <span>{event.time} {event.title}</span>
                                {event.images?.length > 0 && <ImageIcon size={10} className="ml-1 opacity-70" />}
                            </div>
                        ))}
                    </div>
                    <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-200 hover:bg-cdh-red hover:text-white transition-all">
                        <Plus size={14} />
                    </button>
                </div>
            );
        }
        return calendarDays;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalIcon /> Event Calendar
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule vendor calls, manage shows, and track events.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/vendors?view=gallery')}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm transition-colors"
                    >
                        <ImageIcon size={18} />
                        See Images
                    </button>
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-lg font-bold min-w-[150px] text-center dark:text-white">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-center py-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {renderCalendarDays()}
                </div>
            </div>

            {/* Day View / Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">
                                    {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h2>
                                <p className="text-sm text-gray-500">{sortedSelectedDateEvents.length} Events</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X size={20} />
                            </button>
                        </div>

                        {modalView === 'list' ? (
                            <div className="space-y-4 overflow-y-auto flex-1">
                                {/* Hidden Input for Adding Images to Existing Events */}
                                <input
                                    type="file"
                                    ref={addImageInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAddImageToExistingEvent}
                                />

                                {sortedSelectedDateEvents.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                        <CalIcon size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>No events scheduled for this day.</p>
                                    </div>
                                ) : (
                                    sortedSelectedDateEvents.map(event => (
                                        <div key={event.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-xs px-2 py-0.5 rounded font-medium",
                                                            event.type === 'Show' ? "bg-purple-100 text-purple-800" :
                                                                event.type === 'Schedule' ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-800"
                                                        )}>
                                                            {event.type}
                                                        </span>
                                                        <span className="text-sm text-gray-500">{event.time}</span>
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mt-1">{event.title}</h3>
                                                </div>
                                            </div>
                                            {event.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{event.notes}</p>}

                                            {/* Image Grid for Event */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                                        <ImageIcon size={12} /> Photos ({event.images?.length || 0})
                                                    </h4>
                                                    <button
                                                        onClick={() => triggerAddImageToEvent(event.id)}
                                                        className="text-xs flex items-center gap-1 text-cdh-red hover:text-cdh-dark font-medium"
                                                        disabled={isCompressing}
                                                    >
                                                        <Plus size={12} /> Add Photo
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(event.images || []).map(img => (
                                                        <div key={img.id} className="relative group w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                            <img
                                                                src={img.url}
                                                                alt="Event attachment"
                                                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => setPreviewImage(img)}
                                                            />
                                                            <button
                                                                onClick={() => removeImageFromEvent(event.id, img.id)}
                                                                className="absolute top-0.5 right-0.5 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                                title="Delete Photo"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {event.images?.length === 0 && (
                                                        <div className="text-xs text-gray-400 italic">No photos attached</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}

                                <button
                                    onClick={() => setModalView('add')}
                                    className="w-full py-3 mt-4 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-cdh-red hover:text-cdh-red transition-all font-medium"
                                >
                                    <Plus size={20} />
                                    Add New Event
                                </button>
                            </div>
                        ) : (
                            // Add Event Form
                            <form onSubmit={handleAddEvent} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                        value={newEvent.title}
                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                            value={newEvent.type}
                                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                        >
                                            <option value="Schedule">Schedule</option>
                                            <option value="Show">Show / Market</option>
                                            <option value="Note">Note</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                        <input
                                            type="time"
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none"
                                            value={newEvent.time}
                                            onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                    <textarea
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cdh-red outline-none h-24"
                                        value={newEvent.notes}
                                        onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                                        placeholder="Add details..."
                                    />
                                </div>

                                {/* Image Upload for New Event */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Photos</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        {newEvent.images.map(img => (
                                            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 group">
                                                <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewEventImage(img.id)}
                                                    className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    title="Remove Photo"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400"
                                            disabled={isCompressing}
                                        >
                                            {isCompressing ? <Loader2 size={20} className="animate-spin" /> : <Plus size={24} />}
                                            <span className="text-xs mt-1">{isCompressing ? '...' : 'Add'}</span>
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleNewEventImageUpload}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setModalView('list')} // Back to list
                                        className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCompressing}
                                        className="flex-1 py-2 bg-cdh-red text-white rounded-lg hover:bg-cdh-dark font-medium shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        Save Event
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox for Preview */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="max-w-5xl w-full max-h-[90vh] flex flex-col gap-4 pointer-events-none">
                        <img
                            src={previewImage.url}
                            alt="Preview"
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
                        />
                        <p className="text-center text-white text-sm opacity-80">{previewImage.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
