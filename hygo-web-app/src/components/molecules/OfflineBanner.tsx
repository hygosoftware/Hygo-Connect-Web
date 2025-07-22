import React from 'react';
import { Typography } from '../atoms';

interface OfflineBannerProps {
  isVisible?: boolean;
  message?: string;
  className?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isVisible = true,
  message = "No Internet Connection",
  className = '',
}) => {
  if (!isVisible) return null;

  return (
    <div className={`bg-red-500 py-2 px-4 ${className}`}>
      <Typography 
        variant="body2" 
        color="text-primary" 
        align="center"
        className="text-white font-medium"
      >
        {message}
      </Typography>
    </div>
  );
};

export default OfflineBanner;
