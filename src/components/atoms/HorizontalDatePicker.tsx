'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Typography, Icon } from './';
import { format, isToday, isSameDay, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';

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
  const [showMonthView, setShowMonthView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const calendarRef = useRef<HTMLDivElement>(null);
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

  const isDateSelected = (date: Date) => {
    return isSameDay(date, selectedDate);
  };

  const renderWeekDays = () => {
    const days = [];
    const startDate = startOfWeek(currentWeek);
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      const isSelectedDay = isDateSelected(day);
      const isTodayDay = isToday(day);
      
      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(day)}
          className={`
            flex flex-col items-center justify-center w-full h-16 rounded-lg transition-colors
            ${isSelectedDay 
              ? 'bg-[#0E3293] text-white' 
              : isTodayDay 
                ? 'bg-[#0E3293]/10 text-[#0E3293]' 
                : 'hover:bg-gray-100 text-gray-600'
            }
          `}
        >
          <span className="text-sm font-medium">
            {format(day, 'EEE')}
          </span>
          <span className={`text-lg font-bold mt-1 ${
            isSelectedDay ? 'text-white' : 'text-gray-900'
          }`}>
            {format(day, 'd')}
          </span>
        </button>
      );
    }
    return days;
  };

  const renderMonthView = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = startOfWeek(monthStart);
    const days = [];
    let daysToAdd = 42; // 6 weeks to cover all cases
    
    return Array.from({ length: daysToAdd }).map((_, i) => {
      const day = addDays(startDate, i);
      const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
      const isSelectedDay = isDateSelected(day);
      const isTodayDay = isToday(day);
      
      return (
        <button
          key={i}
          onClick={() => {
            handleDateClick(day);
            setShowMonthView(false);
          }}
          className={`
            aspect-square flex items-center justify-center rounded-full transition-colors
            ${!isCurrentMonth ? 'text-gray-300' : ''}
            ${isSelectedDay 
              ? 'bg-[#0E3293] text-white' 
              : isTodayDay 
                ? 'bg-[#0E3293]/10 text-[#0E3293]' 
                : 'hover:bg-gray-100 text-gray-600'
            }
          `}
        >
          {format(day, 'd')}
        </button>
      );
    });
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowMonthView(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`bg-white ${className}`} ref={calendarRef}>
      {/* Header with current date and navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button 
          onClick={() => setShowMonthView(!showMonthView)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <Typography variant="h6" className="text-gray-900 font-semibold">
            {format(selectedDate, 'MMMM d, yyyy')}
          </Typography>
          <Icon 
            name={showMonthView ? 'chevron-up' : 'chevron-down'} 
            size="small" 
            color="#6b7280" 
          />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentWeek(prev => subWeeks(prev, 1));
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="chevron-left" size="small" color="#6b7280" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentWeek(prev => addWeeks(prev, 1));
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="chevron-right" size="small" color="#6b7280" />
          </button>
        </div>
      </div>

      {/* Week view (always visible) */}
      <div className="px-2 py-3">
        <div className="grid grid-cols-7 gap-1">
          {renderWeekDays()}
        </div>
      </div>

      {/* Month view (collapsible) */}
      {showMonthView && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Icon name="chevron-left" size="small" color="#6b7280" />
            </button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Icon name="chevron-right" size="small" color="#6b7280" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="py-2 text-gray-500 font-medium">
                {day}
              </div>
            ))}
            {renderMonthView()}
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalDatePicker;
