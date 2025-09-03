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

interface MedicationSidebarProps {
  medications: MedicationNotification[];
  onMedicationClick?: (medication: MedicationNotification) => void;
  onMarkTaken?: (id: string) => void;
  onEditMedication?: (id: string) => void;
  onDeleteMedication?: (id: string) => void;
  className?: string;
}

const MedicationSidebar: React.FC<MedicationSidebarProps> = ({
  medications,
  onMedicationClick,
  onMarkTaken,
  onEditMedication,
  onDeleteMedication,
  className = '',
}) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const todayMedications = medications.filter(med => 
    !med.date || med.date === todayStr
  );

  const tomorrowMedications = medications.filter(med => 
    med.date === tomorrowStr
  );

  const getMedicineIcon = (type: string) => {
    switch (type) {
      case 'tablet': return 'pill';
      case 'capsule': return 'capsule';
      case 'syrup': return 'bottle-tonic';
      case 'injection': return 'needle';
      default: return 'pill';
    }
  };

  const getMedicineColor = (type: string) => {
    switch (type) {
      case 'tablet': return '#0e3293';
      case 'capsule': return '#0e3293';
      case 'syrup': return '#0e3293';
      case 'injection': return '#0e3293';
      default: return '#0e3293';
    }
  };

  const formatTimeWithAMPM = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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

  const renderMedicationItem = (medication: MedicationNotification, isToday: boolean = false) => {
    const nextTime = isToday ? getNextScheduledTime(medication.scheduledTimes) : null;
    
    return (
      <div
        key={medication.id}
        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
        onClick={() => onMedicationClick?.(medication)}
      >
        {/* Medicine Icon */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0e3293]/10">
          <Icon 
            name={getMedicineIcon(medication.medicineType)} 
            size="small" 
            color={getMedicineColor(medication.medicineType)}
          />
        </div>

        {/* Medication Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Typography variant="subtitle2" className="text-gray-900 font-medium truncate">
              {medication.medicineName}
            </Typography>
            <span className="text-xs text-gray-500">—</span>
            <Typography variant="body2" className="text-gray-600 font-medium">
              {medication.dosage}
            </Typography>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <Typography variant="caption" className="text-gray-500 capitalize">
              {medication.medicineType}
            </Typography>
            {medication.mealTiming && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <Typography variant="caption" className="text-gray-500">
                  {medication.mealTiming} meal
                </Typography>
              </>
            )}
          </div>

          {/* Time Display */}
          <div className="flex items-center space-x-1 mt-2">
            {medication.scheduledTimes.slice(0, 3).map((time, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  nextTime === time
                    ? 'bg-[#0e3293]/10 text-[#0e3293]'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {formatTimeWithAMPM(time)}
              </span>
            ))}
            {medication.scheduledTimes.length > 3 && (
              <span className="text-xs text-gray-500">
                +{medication.scheduledTimes.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 ml-2 opacity-100 group-hover:opacity-100">
          {isToday && (
            <button
              onClick={e => {
                e.stopPropagation();
                onMarkTaken?.(medication.id);
              }}
              className="p-2 text-[#0e3293] hover:bg-[#0e3293]/10 rounded-lg transition-colors"
              title="Mark as taken"
            >
              <Icon name="check" size="small" />
            </button>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onEditMedication?.(medication.id);
            }}
            className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Icon name="edit" size="small" />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onDeleteMedication?.(medication.id);
            }}
            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Icon name="trash" size="small" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border-l border-gray-200 ${className}`}>
      {/* Today Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="h6" className="text-gray-900 font-semibold">
            Today
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            {today.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Typography>
        </div>

        <div className="space-y-1">
          {todayMedications.length === 0 ? (
            <div className="text-center py-6">
              <Icon name="pill-off" size="medium" color="#9ca3af" className="mx-auto mb-2" />
              <Typography variant="body2" color="secondary">
                No medications today
              </Typography>
            </div>
          ) : (
            todayMedications.map(medication => renderMedicationItem(medication, true))
          )}
        </div>
      </div>

      {/* Tomorrow Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Typography variant="h6" className="text-gray-900 font-semibold">
            Tomorrow
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            {tomorrow.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </Typography>
        </div>

        <div className="space-y-1">
          {tomorrowMedications.length === 0 ? (
            <div className="text-center py-6">
              <Icon name="pill-off" size="medium" color="#9ca3af" className="mx-auto mb-2" />
              <Typography variant="body2" color="secondary">
                No medications tomorrow
              </Typography>
            </div>
          ) : (
            tomorrowMedications.map(medication => renderMedicationItem(medication, false))
          )}
        </div>
      </div>

      {/* Scroll indicator for more content */}
      <div className="flex justify-center p-2 border-t border-gray-100">
        <Icon name="chevron-down" size="small" color="#9ca3af" />
      </div>
    </div>
  );
};

export default MedicationSidebar;