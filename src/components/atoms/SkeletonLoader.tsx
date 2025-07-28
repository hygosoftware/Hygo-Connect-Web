'use client';

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'rectangular':
        return 'rounded-lg';
      case 'circular':
        return 'rounded-full';
      case 'card':
        return 'h-48 rounded-xl';
      default:
        return 'h-4 rounded';
    }
  };

  const getDefaultDimensions = () => {
    switch (variant) {
      case 'text':
        return { width: '100%', height: '1rem' };
      case 'circular':
        return { width: '3rem', height: '3rem' };
      case 'card':
        return { width: '100%', height: '12rem' };
      default:
        return { width: '100%', height: '1rem' };
    }
  };

  const defaults = getDefaultDimensions();
  const finalWidth = width || defaults.width;
  const finalHeight = height || defaults.height;

  const skeletonStyle = {
    width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
    height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
  };

  const SkeletonItem = () => (
    <div
      className={`bg-gray-200 animate-pulse ${getVariantClasses()} ${className}`}
      style={skeletonStyle}
    />
  );

  if (count === 1) {
    return <SkeletonItem />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </div>
  );
};

// Predefined skeleton components for common use cases
export const DoctorCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <SkeletonLoader variant="rectangular" width="100%" height={192} />
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <SkeletonLoader variant="text" width="70%" height={20} />
        <SkeletonLoader variant="text" width="50%" height={16} />
      </div>
      <div className="flex justify-between">
        <SkeletonLoader variant="text" width={80} height={16} />
        <SkeletonLoader variant="text" width={100} height={16} />
      </div>
      <div className="flex space-x-2">
        <SkeletonLoader variant="rectangular" width={60} height={24} className="rounded-full" />
        <SkeletonLoader variant="rectangular" width={80} height={24} className="rounded-full" />
      </div>
      <SkeletonLoader variant="text" width={60} height={20} />
      <div className="pt-3 border-t border-gray-200 space-y-1">
        <SkeletonLoader variant="text" width="40%" height={14} />
        <SkeletonLoader variant="text" width="60%" height={14} />
      </div>
    </div>
  </div>
);

export const ClinicCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <SkeletonLoader variant="rectangular" width="100%" height={192} />
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="70%" height={20} />
          <SkeletonLoader variant="text" width="50%" height={16} />
        </div>
        <SkeletonLoader variant="rectangular" width={60} height={24} className="rounded-full" />
      </div>
      <SkeletonLoader variant="rectangular" width={100} height={20} className="rounded-full" />
      <SkeletonLoader variant="text" count={2} />
      <div className="flex space-x-2">
        <SkeletonLoader variant="rectangular" width={80} height={24} className="rounded-full" />
        <SkeletonLoader variant="rectangular" width={100} height={24} className="rounded-full" />
        <SkeletonLoader variant="rectangular" width={60} height={24} className="rounded-full" />
      </div>
      <div className="flex justify-between pt-3">
        <SkeletonLoader variant="text" width={120} height={16} />
        <SkeletonLoader variant="text" width={80} height={16} />
      </div>
    </div>
  </div>
);

export const TimeSlotSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="p-4 rounded-xl border border-gray-200">
        <div className="text-center space-y-2">
          <SkeletonLoader variant="text" width={80} height={20} />
          <SkeletonLoader variant="text" width={120} height={14} />
        </div>
      </div>
    ))}
  </div>
);

export const BookingProgressSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <SkeletonLoader variant="text" width="60%" height={20} />
      <SkeletonLoader variant="text" width="40%" height={16} />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-start space-x-4">
          <SkeletonLoader variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <SkeletonLoader variant="text" width="50%" height={16} />
            <SkeletonLoader variant="text" width="70%" height={14} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonLoader;
