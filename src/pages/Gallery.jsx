import React from 'react';
import PhotoGallery from '../components/PhotoGallery';

export default function Gallery() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Photo Gallery</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Browse all photos from vendor visits, shows, and events.</p>
            </header>
            <PhotoGallery />
        </div>
    );
}
