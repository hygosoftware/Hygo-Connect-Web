'use client';

import React, { useState, useMemo } from 'react';
import { Typography, Icon } from './';

interface HorizontalDatePickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  className?: string;
}

const HorizontalDatePicker: React.FC<HorizontalDatePickerProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  className = '',
}) => {
  const [currentWeek, setCurrentWeek] = useState(() => {
    // Start from the selected date's week
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  const weekDays = useMemo(() => {
    const days = [];
    const startDate = new Date(currentWeek);
    
    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  }, [currentWeek]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newWeek = new Date(prev);
      const days = direction === 'prev' ? -7 : 7;
      newWeek.setDate(newWeek.getDate() + days);
      return newWeek;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long'
    });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <div className={`bg-white ${className}`}>
      {/* Header with current date and navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Typography variant="h6" className="text-gray-900 font-semibold">
            Today, {formatDate(selectedDate)}
          </Typography>
          <Icon name="chevron-down" size="small" color="#6b7280" />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="chevron-left" size="small" color="#6b7280" />
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="chevron-right" size="small" color="#6b7280" />
          </button>
        </div>
      </div>

      {/* Horizontal date picker */}
      <div className="flex items-center justify-between px-4 py-4 overflow-x-auto">
        {weekDays.map((date, index) => {
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-2xl transition-all duration-200
                ${isSelectedDate 
                  ? 'bg-pink-500 text-white shadow-lg scale-105' 
                  : isTodayDate 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Typography 
                variant="h5" 
                className={`font-bold mb-1 ${
                  isSelectedDate ? 'text-white' : 
                  isTodayDate ? 'text-blue-800' : 'text-gray-900'
                }`}
              >
                {date.getDate()}
              </Typography>
              <Typography 
                variant="caption" 
                className={`text-xs ${
                  isSelectedDate ? 'text-white' : 
                  isTodayDate ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {getDayName(date)}
              </Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalDatePicker;
