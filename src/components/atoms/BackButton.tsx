import React from 'react';
import { Icon, Typography } from './';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'white';
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
  disabled = false,
  className = '',
  variant = 'default',
}) => {
  const baseClasses = 'flex items-center space-x-1 transition-all duration-200 focus:outline-none focus:ring-2 rounded-md p-1';

  const variantClasses = {
    default: {
      button: 'cursor-pointer hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
      icon: '#0e3293',
      text: 'text-blue-800'
    },
    white: {
      button: 'cursor-pointer hover:bg-white hover:bg-opacity-20 active:bg-white active:bg-opacity-30 focus:ring-white',
      icon: 'white',
      text: 'text-white'
    }
  };

  const stateClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : variantClasses[variant].button;

  const buttonClasses = `${baseClasses} ${stateClasses} ${className}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      aria-label={`Go back to previous page`}
    >
      <Icon name="arrow-left" size="medium" color={variantClasses[variant].icon} />
      <Typography
        variant="body1"
        className={`font-medium ${variantClasses[variant].text}`}
      >
        {label}
      </Typography>
    </button>
  );
};

export default BackButton;
