'use client';

import React from 'react';
import { BackButton, Typography, Icon } from './';
import { useHeader } from './HeaderWrapper';

interface UniversalHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'home';
  icon?: string;
  subtitle?: string;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  title,
  showBackButton,
  onBackPress,
  rightContent,
  className = '',
  variant = 'default',
  icon,
  subtitle,
}) => {
  const { onBackPress: contextBackPress, shouldShowBackButton, getPageTitle, onMobileMenuToggle } = useHeader();

  // Determine if back button should be shown
  const shouldShow = showBackButton !== undefined ? showBackButton : shouldShowBackButton();
  
  // Determine back press handler
  const handleBackPress = onBackPress || contextBackPress;
  
  // Determine title
  const pageTitle = title || getPageTitle();

  // Style variants with consistent height and padding
  const variantStyles = {
    default: {
      container: 'bg-white border-b border-gray-200 shadow-sm',
      title: 'text-gray-900',
      subtitle: 'text-gray-600',
      backButtonVariant: 'default' as const,
    },
    gradient: {
      container: 'bg-gradient-to-r from-[#0E3293] via-[#1e40af] to-[#3b82f6] shadow-xl',
      title: 'text-white',
      subtitle: 'text-blue-100',
      backButtonVariant: 'white' as const,
    },
    home: {
      container: 'bg-blue-800 shadow-sm',
      title: 'text-white',
      subtitle: 'text-white/70',
      backButtonVariant: 'white' as const,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} rounded-b-2xl shadow-lg ${className}`}>
      {/* Consistent height and padding across all variants */}
      <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center flex-1">
              {/* Mobile Menu Button for home variant */}
              {variant === 'home' && (
                <button
                  className="md:hidden w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 hover:bg-white/30 transition-colors duration-200"
                  onClick={onMobileMenuToggle}
                >
                  <Icon name="menu" size="small" color="white" />
                </button>
              )}

              {/* Back Button for other variants */}
              {shouldShow && variant !== 'home' && (
                <BackButton
                  onClick={handleBackPress}
                  variant={styles.backButtonVariant}
                  className="mr-4"
                />
              )}
              
              <div className="flex items-center">
                {/* Optional Icon */}
                {icon && (
                  <div className={`w-12 h-12 ${variant === 'gradient' ? 'bg-white/20' : 'bg-gray-100'} rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm`}>
                    <Icon 
                      name={icon} 
                      size="medium" 
                      color={variant === 'gradient' ? 'white' : '#0e3293'} 
                    />
                  </div>
                )}

                <div>
                  <Typography 
                    variant="h5" 
                    className={`font-bold ${styles.title}`}
                  >
                    {pageTitle}
                  </Typography>
                  {subtitle && (
                    <Typography 
                      variant="body2" 
                      className={`${styles.subtitle} text-sm`}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </div>
              </div>
            </div>

          {/* Right Content */}
          {rightContent && (
            <div className="flex items-center space-x-2">
              {rightContent}
            </div>
          )}
        </div>
      </div>
  );
};

export default UniversalHeader;
