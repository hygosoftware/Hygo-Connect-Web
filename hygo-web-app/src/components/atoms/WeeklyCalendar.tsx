'use client';

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
      case 'tablet': return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-200 border-blue-400/30 backdrop-blur-sm shadow-lg shadow-blue-500/20';
      case 'capsule': return 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-200 border-green-400/30 backdrop-blur-sm shadow-lg shadow-green-500/20';
      case 'syrup': return 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 border-purple-400/30 backdrop-blur-sm shadow-lg shadow-purple-500/20';
      case 'injection': return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-200 border-red-400/30 backdrop-blur-sm shadow-lg shadow-red-500/20';
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-200 border-gray-400/30 backdrop-blur-sm shadow-lg shadow-gray-500/20';
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
    <div className={`bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-300 border border-gray-200 shadow-sm"
        >
          <Icon name="chevron-left" size="small" color="#374151" />
        </button>
        
        <div className="text-center">
          <Typography variant="h6" color="primary" className="text-gray-800 font-semibold">
            {getWeekRange()}
          </Typography>
          <Typography variant="body2" color="secondary" className="text-gray-600">
            Week
          </Typography>
        </div>

        <button
          onClick={() => navigateWeek('next')}
          className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-300 border border-gray-200 shadow-sm"
        >
          <Icon name="chevron-right" size="small" color="#374151" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] lg:min-w-full">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-3 text-center border-r border-gray-200">
              <Typography variant="body2" color="secondary" className="font-medium text-xs text-gray-600">
                Time
              </Typography>
            </div>
            {weekDays.map((date, index) => (
              <div
                key={index}
                className={`p-2 sm:p-3 text-center border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-300 min-w-[100px] ${
                  isToday(date) ? 'bg-gradient-to-b from-[#0E3293]/10 to-[#1e40af]/10 shadow-lg shadow-blue-500/20 border-l border-r border-blue-200' : ''
                }`}
                onClick={() => onDateSelect?.(date)}
              >
                <Typography variant="body2" color="secondary" className={`font-medium text-xs ${
                  isToday(date) ? 'text-[#0E3293]' : 'text-gray-600'
                }`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </Typography>
                <Typography variant="h6" color="primary" className={`font-bold text-sm sm:text-base ${
                  isToday(date) ? 'text-[#0E3293]' : 'text-gray-800'
                }`}>
                  {date.getDate()}
                </Typography>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map((time, timeIndex) => (
            <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100 min-h-[50px] sm:min-h-[60px]">
              {/* Time Label */}
              <div className="p-2 sm:p-3 border-r border-gray-200 flex items-center justify-center min-w-[80px]">
                <Typography variant="body2" color="secondary" className="text-gray-600 text-xs">
                  {formatTimeDisplay(time)}
                </Typography>
              </div>

              {/* Day Cells */}
              {weekDays.map((date, dayIndex) => {
                const dayMedications = getMedicationsForDateAndTime(date, time);

                return (
                  <div
                    key={dayIndex}
                    className="p-1 border-r border-gray-200 min-h-[50px] sm:min-h-[60px] min-w-[100px] relative hover:bg-gray-50 transition-all duration-300"
                  >
                    {dayMedications.map((medication, medIndex) => (
                      <div
                        key={medIndex}
                        onClick={() => onMedicationClick?.(medication)}
                        className={`
                          text-xs p-1 rounded-lg border cursor-pointer hover:shadow-xl transition-all duration-300 mb-1 transform hover:scale-105 touch-manipulation
                          ${getMedicineColor(medication.medicineType)}
                        `}
                      >
                        <div className="font-medium truncate text-xs">
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
