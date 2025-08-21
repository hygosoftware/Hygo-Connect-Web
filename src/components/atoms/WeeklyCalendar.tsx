'use client';
import '../atoms/pillpal-responsive.css';

import React, { useState, useMemo } from 'react';
import { Typography, Icon } from './';

interface MedicationEvent {
  id: string;
  medicineName: string;
  medicineType: 'tablet' | 'capsule' | 'syrup' | 'injection';
  dosage: string;
  time: string; // HH:MM format
  date: string; // YYYY-MM-DD format
  color?: string;
}

interface WeeklyCalendarProps {
  selectedWeek?: Date;
  medications: MedicationEvent[];
  onDateSelect?: (date: Date) => void;
  onMedicationClick?: (medication: MedicationEvent) => void;
  className?: string;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedWeek = new Date(),
  medications,
  onDateSelect,
  onMedicationClick,
  className = '',
}) => {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const date = new Date(selectedWeek);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const weekDays = useMemo(() => {
    const days = [];
    const startDate = new Date(currentWeek);
    
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

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const getMedicationsForDateAndTime = (date: Date, time: string) => {
    const dateStr = formatDate(date);
    return medications.filter(med => 
      med.date === dateStr && med.time === time
    );
  };

  const getMedicineColor = (type: string) => {
    switch (type) {
      case 'tablet': return 'bg-[#0e3293]/10 text-[#0e3293] border-[#0e3293]/20';
      case 'capsule': return 'bg-[#0e3293]/10 text-[#0e3293] border-[#0e3293]/20';
      case 'syrup': return 'bg-[#0e3293]/10 text-[#0e3293] border-[#0e3293]/20';
      case 'injection': return 'bg-[#0e3293]/10 text-[#0e3293] border-[#0e3293]/20';
      default: return 'bg-[#0e3293]/10 text-[#0e3293] border-[#0e3293]/20';
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${start.getDate()} — ${end.getDate()} ${startMonth}`;
    } else {
      return `${start.getDate()} ${startMonth} — ${end.getDate()} ${endMonth}`;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 weekly-calendar-mobile ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="chevron-left" size="small" color="#6b7280" />
        </button>
        
        <div className="text-center">
          <Typography variant="h6" className="text-gray-900 font-semibold">
            {getWeekRange()}
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Week
          </Typography>
        </div>
        
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon name="chevron-right" size="small" color="#6b7280" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full calendar-grid">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 text-center border-r border-gray-200">
              <Typography variant="body2" className="text-gray-500 font-medium text-xs">
                Time
              </Typography>
            </div>
            {weekDays.map((date, index) => (
              <div 
                key={index} 
                className={`p-3 text-center border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday(date) ? 'bg-[#0e3293]/10' : ''
                }`}
                onClick={() => onDateSelect?.(date)}
              >
                <Typography variant="body2" className={`font-medium text-xs ${
                  isToday(date) ? 'text-[#0e3293]' : 'text-gray-500'
                }`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </Typography>
                <Typography variant="h6" className={`font-bold ${
                  isToday(date) ? 'text-[#0e3293]' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </Typography>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map((time, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100 min-h-[60px]">
              {/* Time Label */}
              <div className="p-3 border-r border-gray-200 flex items-center justify-center">
                <Typography variant="body2" className="text-gray-500 text-xs">
                  {formatTimeDisplay(time)}
                </Typography>
              </div>

              {/* Day Cells */}
              {weekDays.map((date, dayIndex) => {
                const dayMedications = getMedicationsForDateAndTime(date, time);
                
                return (
                  <div 
                    key={dayIndex} 
                    className="p-1 border-r border-gray-200 min-h-[60px] relative"
                  >
                    {dayMedications.map((medication, medIndex) => (
                      <div
                        key={medIndex}
                        onClick={() => onMedicationClick?.(medication)}
                        className={`
                          text-xs p-1 rounded border cursor-pointer hover:shadow-sm transition-all mb-1
                          ${getMedicineColor(medication.medicineType)}
                        `}
                      >
                        <div className="font-medium truncate">
                          {medication.medicineName}
                        </div>
                        <div className="text-xs opacity-75">
                          {medication.dosage}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
