import React from 'react';
import { Typography } from './';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  bgColor?: string;
  hasNotification?: boolean;
  onPress?: () => void;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  bgColor = 'bg-white',
  hasNotification = false,
  onPress,
  className = '',
}) => {
  return (
    <button
      className={`flex flex-col items-center mb-4 focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
      onClick={onPress}
    >
      <div className={`${bgColor === 'hygo-3d-card' ? 'hygo-3d-card' : bgColor} w-16 h-16 rounded-xl flex items-center justify-center relative transition-all duration-300 hover:shadow-lg animate-float3D`}>
        {icon}
        {hasNotification && (
          <div className="absolute top-0 right-0 w-3 h-3 hygo-gradient-warm rounded-full -mt-1 -mr-1 animate-pulse" />
        )}
      </div>
      <Typography
        variant="caption"
        className="text-white mt-1 text-center max-w-[64px] leading-tight font-medium"
      >
        {title}
      </Typography>
    </button>
  );
};

export default FeatureCard;
