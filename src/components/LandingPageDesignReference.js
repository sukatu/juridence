import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const LandingPageDesignReference = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const designImages = [
    {
      name: 'Main Landing Page',
      path: '/landing-page/Juridence Landing Page.png',
      description: 'Main landing page design'
    },
    {
      name: 'Landing Page with Search Input',
      path: '/landing-page/Juridence Landing Page with search input.png',
      description: 'Landing page showing search input state'
    },
    {
      name: 'Landing Page with Search Result',
      path: '/landing-page/Juridence Landing Page with search result.png',
      description: 'Landing page showing search results'
    },
    {
      name: 'Landing Page with Result in View',
      path: '/landing-page/Juridence Landing Page with result in view.png',
      description: 'Landing page with result detail view'
    },
    {
      name: 'Client Company Case Summary',
      path: '/landing-page/Client company case summary page.png',
      description: 'Case summary page design'
    }
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % designImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + designImages.length) % designImages.length);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-brand-500 text-white rounded-lg shadow-lg hover:bg-brand-600 transition-colors text-sm font-medium"
      >
        View Design Reference
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div>
            <h3 className="text-lg font-semibold">{designImages[currentImage].name}</h3>
            <p className="text-sm text-slate-300">{designImages[currentImage].description}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative bg-slate-100 flex items-center justify-center p-4 overflow-auto max-h-[calc(90vh-80px)]">
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>

          <img
            src={designImages[currentImage].path}
            alt={designImages[currentImage].name}
            className="max-w-full h-auto rounded-lg shadow-xl"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden items-center justify-center text-slate-500">
            Image not found
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-slate-700" />
          </button>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center gap-2 p-4 bg-slate-50">
          {designImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImage ? 'bg-brand-500 w-8' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPageDesignReference;

