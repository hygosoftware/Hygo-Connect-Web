'use client';

import React, { useState, useMemo } from 'react';
import { Typography, Icon } from './';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  highlightedDates?: Date[];
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  highlightedDates = [],
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // First day of the week for the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isHighlighted = (date: Date) => {
    return highlightedDates.some(highlightedDate => 
      date.toDateString() === highlightedDate.toDateString()
    );
  };

  const handleDateClick = (date: Date) => {
    // Prevent selecting past dates
    if (isPastDate(date)) return;
    onDateSelect(date);
  };

  // New: compute if a date is in the past (date-only, ignore time)
  const isPastDate = (date: Date) => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < t;
  };

  // New: whether we can navigate to previous month (block months before current month)
  const canGoPrevMonth = () => {
    const t = new Date();
    const firstOfThisMonth = new Date(t.getFullYear(), t.getMonth(), 1);
    return currentMonth > firstOfThisMonth;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6 max-w-md mx-auto ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => canGoPrevMonth() && navigateMonth('prev')}
          disabled={!canGoPrevMonth()}
          className={`p-2 sm:p-3 rounded-lg transition-colors ${canGoPrevMonth() ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
        >
          <Icon name="chevron-left" size="small" color="#6b7280" />
        </button>
        
        <Typography variant="h6" className="text-gray-900 font-bold text-base sm:text-lg">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Typography>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 sm:p-3 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="chevron-right" size="small" color="#6b7280" />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
        {dayNames.map(day => (
          <div key={day} className="p-1 sm:p-3 text-center">
            <Typography variant="body2" className="text-gray-600 font-semibold text-xs sm:text-sm">
              {day}
            </Typography>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((date, index) => {
          const isCurrentMonthDate = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);
          const isHighlightedDate = isHighlighted(date);
          const isPast = isPastDate(date);
          const isAvailableDate = isCurrentMonthDate && !isPast && isHighlightedDate;
          const isUnavailableDate = isCurrentMonthDate && !isPast && !isHighlightedDate;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={`
                p-1 sm:p-3 h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 relative flex items-center justify-center
                ${isCurrentMonthDate ? 'text-gray-900' : 'text-gray-300'}
                ${isSelectedDate
                  ? 'bg-[#0e3293] text-white border-2 border-[#0e3293] shadow-lg sm:transform sm:scale-105'
                  : `${isPast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-sm'}`
                }
                ${!isSelectedDate && isAvailableDate ? 'border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100' : ''}
                ${!isSelectedDate && isUnavailableDate ? 'border-2 border-red-400 bg-red-50 text-red-600' : ''}
                ${(!isCurrentMonthDate || isPast) && 'cursor-not-allowed'}
                ${isTodayDate && !isSelectedDate ? 'ring-1 sm:ring-2 ring-blue-200' : ''}
              `}
              disabled={!isCurrentMonthDate || isPast}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-6 space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-lg border-2 border-green-500 bg-green-50"></div>
          <Typography variant="body2" className="text-gray-700 text-sm font-medium">
            Available
          </Typography>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-lg border-2 border-red-400 bg-red-50"></div>
          <Typography variant="body2" className="text-gray-700 text-sm font-medium">
            Unavailable
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
