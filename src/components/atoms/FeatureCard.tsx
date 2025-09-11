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
      className={`flex flex-col items-center mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      title={title}
      onClick={onPress}
    >
      <div className={`${bgColor} w-16 h-16 rounded-xl flex items-center justify-center shadow-sm relative transition-all duration-200 hover:shadow-md`}>
        {icon}
        {hasNotification && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full -mt-1 -mr-1 animate-pulse" />
        )}
      </div>
      <Typography 
        variant="caption" 
        className="text-gray-700 mt-1 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis px-1"
      >
        {title}
      </Typography>
    </button>
  );
};

export default FeatureCard;
