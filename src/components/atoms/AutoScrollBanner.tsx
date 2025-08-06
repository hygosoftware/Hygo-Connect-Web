import React, { useRef, useEffect, useState } from 'react';
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
  const intervalRef = useRef<number | null>(null);  const containerRef = useRef<HTMLDivElement>(null);

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

  const renderBannerItem = (item: BannerItem, index: number) => {
    return (
      <div
        key={item.id}
        className={`absolute inset-0 transition-opacity duration-500 ${
          index === currentIndex ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="relative w-full h-40 rounded-xl overflow-hidden">
          <img
            src={item.imageUri}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a gradient background if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <Typography variant="h5" className="text-white font-bold mb-1">
                {item.title}
              </Typography>
              <Typography variant="body2" className="text-white">
                {item.description}
              </Typography>
            </div>
            <button
              className="self-start bg-blue-800 hover:bg-blue-900 py-2 px-4 rounded-full transition-colors duration-200"
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
        className="relative w-full h-40 rounded-xl overflow-hidden"
      >
        {data.map((item, index) => renderBannerItem(item, index))}
      </div>
      {data.length > 1 && renderPaginationDots()}
    </div>
  );
};

export default AutoScrollBanner;
