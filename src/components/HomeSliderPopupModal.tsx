import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import type { HomeSliderPhoto } from '../types/index.ts';

interface HomeSliderPopupModalProps {
  photos: HomeSliderPhoto[];
  isOpen: boolean;
  onClose: () => void;
}

export const HomeSliderPopupModal: React.FC<HomeSliderPopupModalProps> = ({
  photos,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Filter only active photos
  const activePhotos = photos.filter(p => p.active);

  useEffect(() => {
    if (isOpen && activePhotos.length > 0) {
      // Trigger zoom-in animation
      setTimeout(() => setShowContent(true), 20);
    } else {
      setShowContent(false);
    }
  }, [isOpen, activePhotos.length]);

  // If no active photos, do NOT render any popup!
  if (!isOpen || activePhotos.length === 0) return null;

  const currentPhoto = activePhotos[currentIndex] || activePhotos[0];

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev + 1) % activePhotos.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(prev => (prev - 1 + activePhotos.length) % activePhotos.length);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDismiss = () => {
    // Zoom-out effect before closing
    setShowContent(false);
    setTimeout(() => {
      onClose();
    }, 280);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 transition-opacity duration-300 ${
        showContent ? 'bg-slate-900/60 backdrop-blur-xs opacity-100' : 'bg-slate-900/0 opacity-0 pointer-events-none'
      }`}
      onClick={handleDismiss}
    >
      {/* Dynamic sized modal adapting directly to image size with zoom-in / zoom-out effect */}
      <div
        onClick={e => e.stopPropagation()}
        className={`relative max-w-lg sm:max-w-xl md:max-w-2xl w-full max-h-[90vh] bg-white rounded-md overflow-hidden shadow-xl border border-slate-200 transform transition-all duration-300 ease-out flex flex-col ${
          showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-8'
        }`}
      >
        {/* Top Header Bar with Close Button */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30 flex items-center space-x-2">
          {activePhotos.length > 1 && (
            <span className="bg-white/95 backdrop-blur-xs text-[#212121] text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-sm border border-slate-200 shadow-xs">
              {currentIndex + 1} / {activePhotos.length}
            </span>
          )}
          <button
            onClick={handleDismiss}
            aria-label="Close Popup"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-slate-100 text-[#212121] border border-slate-200 flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Dynamic Image Container */}
        <div className="relative w-full overflow-hidden flex items-center justify-center bg-[#f1f3f6] min-h-[220px] max-h-[65vh]">
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title || 'ESP Special Notice'}
            className="w-full h-auto max-h-[65vh] object-contain select-none transition-all duration-300"
            loading="eager"
          />

          {/* Previous / Next Arrows for multiple photos */}
          {activePhotos.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#212121] flex items-center justify-center border border-slate-200 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#212121] flex items-center justify-center border border-slate-200 shadow-md transition hover:scale-105 active:scale-95 cursor-pointer z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Caption & Action Details (If provided) */}
        {(currentPhoto.title || currentPhoto.subtitle || currentPhoto.linkUrl) && (
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex-1 min-w-0">
              {currentPhoto.title && (
                <h4 className="text-sm sm:text-base font-black text-[#212121] truncate">
                  {currentPhoto.title}
                </h4>
              )}
              {currentPhoto.subtitle && (
                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 font-medium">
                  {currentPhoto.subtitle}
                </p>
              )}
            </div>

            {currentPhoto.linkUrl && (
              <a
                href={currentPhoto.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center space-x-1.5 px-4 py-2 rounded-sm text-xs font-black bg-[#fb641b] hover:bg-[#e5530d] text-white shadow-xs transition"
              >
                <span>देखें / Explore</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Bottom Pagination Dots */}
        {activePhotos.length > 1 && (
          <div className="py-2.5 bg-[#f9fafb] flex justify-center items-center space-x-1.5 border-t border-slate-200">
            {activePhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-[#2874f0]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
