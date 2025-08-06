import React from 'react';
import { Icon } from './';

interface FloatingButtonProps {
  onClick: () => void;
  icon?: 'plus' | 'upload' | 'edit' | 'refresh';
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  onClick,
  icon = 'plus',
  disabled = false,
  className = '',
  size = 'medium',
  variant = 'primary',
  position = 'bottom-right',
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16',
  };

  const variantClasses = {
    primary: 'bg-[#0e3293] hover:bg-blue-900 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 shadow-lg hover:shadow-xl border border-gray-200',
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6 md:bottom-8 md:right-8',
    'bottom-left': 'fixed bottom-6 left-6 md:bottom-8 md:left-8',
    'top-right': 'fixed top-6 right-6 md:top-8 md:right-8',
    'top-left': 'fixed top-6 left-6 md:top-8 md:left-8',
    'custom': '',
  };

  const iconColor = variant === 'primary' ? 'white' : '#374151';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${position !== 'custom' ? positionClasses[position] : ''}
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg
        z-50
        ${className}
      `}
      type="button"
    >
      <Icon 
        name={icon} 
        size={size === 'small' ? 'small' : 'medium'} 
        color={disabled ? '#9CA3AF' : iconColor} 
      />
    </button>
  );
};

export default FloatingButton;
