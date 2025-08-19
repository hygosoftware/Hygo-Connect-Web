import React from 'react';
import { Icon } from './';

interface BackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'white';
}

const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  disabled = false,
  className = '',
  variant = 'default',
}) => {
  const baseClasses = 'flex items-center justify-center w-10 h-10 transition-all duration-200 focus:outline-none focus:ring-2 rounded-lg';

  const variantClasses = {
    default: {
      button: 'cursor-pointer hover:bg-white active:bg-blue-100 focus:ring-blue-500',
      icon: '#0e3293'
    },
    white: {
      button: 'cursor-pointer hover:bg-white hover:bg-opacity-20 active:bg-white active:bg-opacity-30 focus:ring-white',
      icon: 'white'
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
      aria-label="Go back to previous page"
    >
      <Icon name="arrow-left" size="medium" color={variantClasses[variant].icon} />
    </button>
  );
};

export default BackButton;
