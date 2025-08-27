'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Icon } from '../atoms';

interface ToastNotificationProps {
  visible: boolean;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning';
  duration?: number;
  onClose?: () => void;
  className?: string;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onClose,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [visible, duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    info: 'bg-white0',
    error: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-[#0e3293]',
  };

  const typeIcons = {
    info: 'alert',
    error: 'x',
    success: 'check',
    warning: 'alert',
  } as const;

  return (
    <div 
      className={`
        fixed bottom-24 left-6 right-6 md:bottom-8 z-50 
        ${typeStyles[type]} 
        py-3 px-4 rounded-lg shadow-lg
        transition-all duration-300 ease-in-out
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
        ${className}
      `}
    >
      <div className="flex items-center justify-center space-x-2">
        <Icon name={typeIcons[type]} size="small" color="white" />
        <Typography 
          variant="body2" 
          className="text-white font-medium"
          align="center"
        >
          {message}
        </Typography>
      </div>
    </div>
  );
};

export default ToastNotification;
