"use client";
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Typography } from './';

interface BannerItem {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  actionText: string;
  onPress: () => void;
}

interface AutoScrollBannerProps {
  data: BannerItem[];
  autoScrollInterval?: number; // in milliseconds
  className?: string;
}

const AutoScrollBanner: React.FC<AutoScrollBannerProps> = ({
  data,
  autoScrollInterval = 3000,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll logic
  useEffect(() => {
    if (data.length <= 1) return;

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.length;
          return nextIndex;
        });
      }, autoScrollInterval);
    };

    startAutoScroll();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data.length, autoScrollInterval]);

  // Handle manual navigation
  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    
    // Reset auto scroll
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Restart auto scroll after manual interaction
    setTimeout(() => {
      if (data.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
        }, autoScrollInterval);
      }
    }, autoScrollInterval);
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const renderBannerItem = (item: BannerItem, index: number) => {
    const imageError = imageErrors[item.id] || false;
    
    return (
      <div
        key={`${item.id}-${index}`}
        className={`absolute inset-0 transition-opacity duration-500 ${
          index === currentIndex ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="relative w-full h-40 md:h-64 lg:h-80 rounded-2xl overflow-hidden bg-gray-100">
          {/* Fallback gradient if image fails */}
          {imageError && (
            <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}} />
          )}

          {/* Mobile background image (cover) */}
          <Image
            src={item.imageUri}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-cover md:hidden"
            onError={() => handleImageError(item.id)}
          />

          {/* Desktop blurred background (cover) */}
          <Image
            src={item.imageUri}
            alt={`${item.title} background`}
            fill
            sizes="(min-width: 768px) 100vw"
            className="hidden md:block object-cover opacity-40 blur-sm"
            onError={() => handleImageError(item.id)}
          />

          {/* Content layer */}
          <div className="absolute inset-0 rounded-2xl p-4 md:p-6 flex flex-col justify-between md:grid md:grid-cols-2 md:gap-4">
            {/* Left: Text */}
            <div className="relative z-10 md:flex md:flex-col md:justify-center md:items-start bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl md:bg-transparent">
              <div>
                <Typography variant="h5" className="text-white font-bold mb-1 text-lg md:text-2xl">
                  {item.title}
                </Typography>
                <Typography variant="body2" className="text-white text-xs md:text-sm">
                  {item.description}
                </Typography>
              </div>
              <button
                className="self-start bg-blue-800 hover:bg-blue-900 mt-3 py-2 px-4 rounded-full transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onPress();
                }}
              >
                <Typography variant="body2" className="text-white font-medium">
                  {item.actionText}
                </Typography>
              </button>
            </div>

            {/* Right: Non-cropped image on desktop */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={item.imageUri}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 50vw"
                  className="object-contain p-2 md:p-4"
                  onError={() => handleImageError(item.id)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaginationDots = () => {
    return (
      <div className="flex justify-center mt-3 mb-1 space-x-1">
        {data.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-2 rounded-full transition-all duration-200 ${
              currentIndex === index
                ? 'w-6 bg-blue-800'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className={`mb-4 ${className}`}>
        <div className="relative w-full h-40 rounded-xl bg-gray-200 flex items-center justify-center">
          <Typography variant="body1" className="text-gray-500">
            No banners available
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <div 
        ref={containerRef}
        className="relative w-full h-40 md:h-64 lg:h-80 rounded-2xl overflow-hidden"
      >
        {data.map((item, index) => renderBannerItem(item, index))}
      </div>
      {data.length > 1 && renderPaginationDots()}
    </div>
  );
};

export default AutoScrollBanner;
