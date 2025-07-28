'use client';

import React from 'react';
import { Typography, Icon } from '../atoms';

interface MedicationNotification {
  id: string;
  medicineName: string;
  medicineType: 'tablet' | 'capsule' | 'syrup' | 'injection';
  dosage: string;
  mealTiming?: 'before' | 'after' | 'with';
  scheduledTimes: string[];
  nextScheduledTime?: string;
  isActive?: boolean;
  date?: string; // Date in YYYY-MM-DD format
}

interface MedicationPanelProps {
  selectedDate: Date;
  medications: MedicationNotification[];
  onEditMedication: (id: string) => void;
  onDeleteMedication: (id: string) => void;
  onMarkTaken: (id: string) => void;
  className?: string;
}

const MedicationPanel: React.FC<MedicationPanelProps> = ({
  selectedDate,
  medications,
  onEditMedication,
  onDeleteMedication,
  onMarkTaken,
  className = '',
}) => {
  // Helper functions
  const getMedicineIcon = (type: string) => {
    switch (type) {
      case 'tablet': return 'pill';
      case 'capsule': return 'capsule';
      case 'syrup': return 'bottle-tonic';
      case 'injection': return 'needle';
      default: return 'pill';
    }
  };

  const formatTimeWithAMPM = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getNextScheduledTime = (scheduledTimes: string[]) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const time of scheduledTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;
      if (timeInMinutes > currentTime) {
        return time;
      }
    }
    return scheduledTimes[0]; // Next day's first time
  };

  // Filter medications for the selected date
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const filteredMedications = medications.filter(med => 
    !med.date || med.date === selectedDateString
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Icon name="pills" size="medium" color="#1e40af" className="mr-3" />
          <Typography variant="h5" className="text-gray-900 font-semibold">
            Medications
          </Typography>
        </div>
        <Typography variant="body1" className="text-blue-800 font-medium">
          {formatDate(selectedDate)}
        </Typography>
      </div>

      {/* Medications List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredMedications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Icon name="pill-off" size="large" color="#9ca3af" className="mb-4 w-16 h-16" />
            <Typography variant="h6" color="secondary" className="mb-2">
              No medications scheduled
            </Typography>
            <Typography variant="body2" color="secondary" className="text-center">
              No medications are scheduled for this date.
            </Typography>
          </div>
        ) : (
          filteredMedications.map((medication) => {
            const nextTime = getNextScheduledTime(medication.scheduledTimes);
            
            return (
              <div
                key={medication.id}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                {/* Medicine Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                      <Icon 
                        name={getMedicineIcon(medication.medicineType)} 
                        size="medium" 
                        color="#1e40af" 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Typography variant="subtitle1" className="text-gray-900 font-semibold">
                        {medication.medicineName}
                      </Typography>
                      <Typography variant="body2" color="secondary" className="capitalize">
                        {medication.medicineType}
                      </Typography>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditMedication(medication.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Icon name="edit" size="small" />
                    </button>
                    <button
                      onClick={() => onDeleteMedication(medication.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Icon name="trash" size="small" />
                    </button>
                  </div>
                </div>

                {/* Meal Timing */}
                {medication.mealTiming && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#0e3293]/10 text-[#0e3293]">
                      <Icon name="food" size="small" color="#0e3293" className="mr-1" />
                      Take {medication.mealTiming} meal
                    </span>
                  </div>
                )}

                {/* Dosage */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Icon name="pill" size="small" color="#1e40af" className="mr-1" />
                    {medication.dosage}
                  </span>
                </div>

                {/* Time Pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {medication.scheduledTimes.map((time, index) => {
                    const isNext = time === nextTime;
                    return (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          isNext
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatTimeWithAMPM(time)}
                      </span>
                    );
                  })}
                </div>

                {/* Mark as Taken Button */}
                <button
                  onClick={() => onMarkTaken(medication.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Mark as Taken
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MedicationPanel;
