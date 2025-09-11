'use client';

import React from 'react';
import { Typography, Icon } from '../atoms';

interface BookingTabNavigationProps {
  activeFlow: 'doctor' | 'clinic';
  onFlowChange: (flow: 'doctor' | 'clinic') => void;
  isDesktop: boolean;
}

const BookingTabNavigation: React.FC<BookingTabNavigationProps> = ({
  activeFlow,
  onFlowChange,
  isDesktop
}) => {
  if (isDesktop) {
    // Desktop version - horizontal tabs at top
    return (
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="w-full">
          <div className="flex space-x-8 w-full">
            <button
              onClick={() => onFlowChange('doctor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeFlow === 'doctor'
                  ? 'border-[#0e3293] text-[#0e3293]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon 
                  name="doctor" 
                  size="small" 
                  color={activeFlow === 'doctor' ? '#0e3293' : '#6b7280'} 
                />
                <span>Book by Doctor</span>
              </div>
            </button>
            
            <button
              onClick={() => onFlowChange('clinic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeFlow === 'clinic'
                  ? 'border-[#0e3293] text-[#0e3293]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon 
                  name="location" 
                  size="small" 
                  color={activeFlow === 'clinic' ? '#0e3293' : '#6b7280'} 
                />
                <span>Book by Clinic</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile version - top tab bar
  return (
    <div className="bg-white border-b border-gray-200 md:hidden">
      <div className="grid grid-cols-2 w-full">
        <button
          onClick={() => onFlowChange('doctor')}
          className={`relative flex flex-col items-center justify-center py-3 px-4 transition-colors duration-200 ${
            activeFlow === 'doctor'
              ? 'text-[#0e3293]'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center justify-center mb-1">
            <Icon 
              name="doctor" 
              size="small" 
              color={activeFlow === 'doctor' ? '#0e3293' : '#6b7280'} 
            />
          </div>
          <Typography 
            variant="caption" 
            className={`font-medium ${
              activeFlow === 'doctor' ? 'text-[#0e3293]' : 'text-gray-500'
            }`}
          >
            By Doctor
          </Typography>
          {activeFlow === 'doctor' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0e3293]"></div>
          )}
        </button>
        
        <button
          onClick={() => onFlowChange('clinic')}
          className={`relative flex flex-col items-center justify-center py-3 px-4 transition-colors duration-200 ${
            activeFlow === 'clinic'
              ? 'text-[#0e3293]'
              : 'text-gray-500'
          }`}
        >
          <div className="flex items-center justify-center mb-1">
            <Icon 
              name="location" 
              size="small" 
              color={activeFlow === 'clinic' ? '#0e3293' : '#6b7280'} 
            />
          </div>
          <Typography 
            variant="caption" 
            className={`font-medium ${
              activeFlow === 'clinic' ? 'text-[#0e3293]' : 'text-gray-500'
            }`}
          >
            By Clinic
          </Typography>
          {activeFlow === 'clinic' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0e3293]"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingTabNavigation;
