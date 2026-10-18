'use client';

import React, { useState } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const imageList = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const prevImage = () => {
    setSelectedIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-blush-light border border-brand-100 group">
        <img
          src={imageList[selectedIndex]}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-center transition-all duration-300"
        />

        {/* Zoom Action */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-charcoal-700 hover:bg-white hover:text-brand-700 shadow-sm transition-all"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Prev / Next Arrows */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-charcoal-700 hover:bg-white hover:text-brand-700 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-md text-charcoal-700 hover:bg-white hover:text-brand-700 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-square w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedIndex === idx ? 'border-brand-600 ring-2 ring-brand-200' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal Lightbox */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageList[selectedIndex]}
              alt={productName}
              className="w-full h-full object-contain max-h-[85vh] rounded-xl"
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-charcoal-900/80 text-white p-2 rounded-full hover:bg-charcoal-900 text-xs font-semibold"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
