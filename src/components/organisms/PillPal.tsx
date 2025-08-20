'use client';

import React, { useState } from 'react';
import { Typography, Icon, Button, HorizontalDatePicker, UniversalHeader } from '../atoms';

// Types and Interfaces
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

interface FCMNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

interface PillPalProps {
  // State props
  userId?: string;
  notifications: MedicationNotification[];
  fcmNotifications: FCMNotification[];
  loading: boolean;
  refreshing: boolean;
  showFcmHistory: boolean;
  showNotificationModal: boolean;
  unreadFcmCount: number;
  toast: Toast;

  // Callback props
  onGoBack: () => void;
  onRefresh: () => void;
  onToggleFcmHistory: () => void;
  onTestFcmToken: () => void;
  onMarkFcmAsRead: (id: string) => void;
  onEditNotification: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onAddButtonPress: () => void;
  onMarkTaken: (id: string) => void;
  onSnooze: (id: string) => void;
  onCloseNotificationModal: () => void;
  onHideToast: () => void;
}

const PillPal: React.FC<PillPalProps> = ({
  notifications,
  fcmNotifications,
  loading,
  refreshing,
  showFcmHistory,
  showNotificationModal,
  unreadFcmCount,
  toast,
  onGoBack,
  onRefresh,
  onToggleFcmHistory,
  onTestFcmToken,
  onMarkFcmAsRead,
  onEditNotification,
  onDeleteNotification,
  onAddButtonPress,
  onMarkTaken,
  onSnooze,
  onCloseNotificationModal,
  onHideToast,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const formatTimeWithAMPM = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getNextMedicationInfo = () => {
    if (notifications.length === 0) return "No medications scheduled";
    
    let nextMed: MedicationNotification | null = null;
    let earliestTime: string | null = null;
    
    notifications.forEach(med => {
      const nextTime = getNextScheduledTime(med.scheduledTimes);
      if (!earliestTime || nextTime < earliestTime) {
        earliestTime = nextTime;
        nextMed = med;
      }
    });
    
    if (nextMed && earliestTime) {
      return `Next: ${nextMed} at ${formatTimeWithAMPM(earliestTime)}`;
    }
    
    return `${notifications.length} medication${notifications.length > 1 ? 's' : ''} scheduled`;
  };

  // Filter medications by selected date
  const getFilteredMedications = (): MedicationNotification[] => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return notifications.filter(med =>
      !med.date || med.date === selectedDateString
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Universal Header */}
      <UniversalHeader
        title="Medication Reminders"
        subtitle={getNextMedicationInfo()}
        variant="gradient"
        icon="pill"
        showBackButton={true}
        onBackPress={onGoBack}
        rightContent={
          <div className="flex items-center space-x-3">
            {/* FCM Bell with Badge */}
            <button
              onClick={onToggleFcmHistory}
              className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <Icon name="bell" size="medium" color="white" />
              {unreadFcmCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadFcmCount > 9 ? '9+' : unreadFcmCount}
                </div>
              )}
            </button>

            {/* WiFi Icon for FCM Testing */}
            <button
              onClick={onTestFcmToken}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <Icon name="activity" size="medium" color="white" />
            </button>
          </div>
        }
      />

      {/* FCM Notification History */}
      {showFcmHistory && (
        <div className="bg-white mx-4 lg:mx-6 mt-4 rounded-lg shadow-sm border border-gray-200 max-w-7xl lg:mx-auto">
          <div className="p-4 border-b border-gray-200">
            <Typography variant="subtitle1" className="text-gray-800">
              Push Notifications
            </Typography>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {fcmNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <Icon name="bell-off" size="large" color="#9ca3af" className="mx-auto mb-2" />
                <Typography variant="body2" color="secondary">
                  No notifications yet
                </Typography>
              </div>
            ) : (
              fcmNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 last:border-b-0 ${
                    !notification.isRead ? 'bg-[#0E3293]/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#0E3293] rounded-full mr-2" />
                        )}
                        <Typography variant="body1" className="font-medium">
                          {notification.title}
                        </Typography>
                      </div>
                      <Typography variant="body2" color="secondary" className="mt-1">
                        {notification.body}
                      </Typography>
                      <Typography variant="caption" color="secondary" className="mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={() => onMarkFcmAsRead(notification.id)}
                        className="ml-2 text-[#0E3293] hover:text-[#0A2470] text-sm"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Horizontal Date Picker */}
      <HorizontalDatePicker
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        className="border-b border-gray-200"
      />

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E3293] mx-auto mb-4"></div>
              <Typography variant="body1" color="secondary">
                Loading your medications...
              </Typography>
            </div>
          </div>
        ) : (() => {
          const filteredMedications: MedicationNotification[] = getFilteredMedications();
          return filteredMedications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon name="pill-off" size="large" color="#9ca3af" className="mb-4 w-16 h-16" />
              <Typography variant="h6" color="secondary" className="mb-2">
                No medications for this date
              </Typography>
              <Typography variant="body2" color="secondary" className="text-center mb-6">
                {notifications.length === 0
                  ? "Add your first medication to get started with reminders"
                  : "No medications scheduled for the selected date"
                }
              </Typography>
              <Button onClick={onAddButtonPress} variant="primary" className="bg-white text-[#0e3293] border border-[#0e3293] hover:bg-white flex items-center justify-center">
                <Icon name="plus" size="small" color="#0e3293" className="mr-2" />
                <span className="font-bold">Add Medication</span>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMedications.map((medication: MedicationNotification) => {
              const nextTime = getNextScheduledTime(medication.scheduledTimes);

              return (
                <div
                  key={medication.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Medicine Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 bg-[#0E3293]/10 rounded-xl flex items-center justify-center mr-3">
                        <Icon
                          name={getMedicineIcon(medication.medicineType)}
                          size="medium"
                          color="#0E3293"
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditNotification(medication.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Icon name="edit" size="small" color="#6b7280" />
                      </button>
                      <button
                        onClick={() => onDeleteNotification(medication.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Icon name="trash" size="small" color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Meal Timing */}
                  {medication.mealTiming && (
                    <div className="flex items-center mb-3">
                      <Icon name="food" size="small" color="#10b981" className="mr-2" />
                      <Typography variant="body2" color="secondary">
                        Take {medication.mealTiming} meals
                      </Typography>
                    </div>
                  )}

                  {/* Dosage */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#0E3293]/10 text-[#0E3293]">
                      <Icon name="pill" size="small" color="#0E3293" className="mr-1" />
                      {medication.dosage}
                    </span>
                  </div>

                  {/* Next Scheduled Time */}
                  {nextTime && (
                    <div className="mb-4 p-3 bg-white rounded-lg border border-[#0e3293]/20">
                      <div className="flex items-center">
                        <Icon name="clock" size="small" color="#0e3293" className="mr-2" />
                        <Typography variant="body2" className="text-[#0e3293] font-medium">
                          Next dose: {formatTimeWithAMPM(nextTime)}
                        </Typography>
                      </div>
                    </div>
                  )}

                  {/* Time Pills */}
                  <div className="flex flex-wrap gap-2">
                    {medication.scheduledTimes.map((time, index) => {
                      const isNext = time === nextTime;
                      return (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            isNext
                              ? 'bg-[#0e3293]/10 text-[#0e3293] border border-[#0e3293]/30'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {formatTimeWithAMPM(time)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
              })}
            </div>
          );
        })()}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={onAddButtonPress}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-[#0E3293] hover:bg-[#0A2470] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        <Icon name="plus" size="small" color="white" />
      </button>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 left-4 right-4 lg:top-6 lg:left-6 lg:right-auto lg:max-w-md z-50">
          <div className={`p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' : 'bg-[#0E3293]'
          } text-white`}>
            <div className="flex items-center justify-between">
              <Typography variant="body1" className="text-white">
                {toast.message}
              </Typography>
              <button
                onClick={onHideToast}
                className="ml-4 text-white hover:text-gray-200"
              >
                <Icon name="x" size="small" color="white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <Icon name="bell" size="large" color="#0E3293" className="mx-auto mb-4" />
              <Typography variant="h6" className="text-gray-900 mb-2">
                Medication Reminder
              </Typography>
              <Typography variant="body2" color="secondary">
                It's time to take your medication
              </Typography>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => onMarkTaken('current')}
                variant="primary"
                className="flex-1"
              >
                Mark Taken
              </Button>
              <Button
                onClick={() => onSnooze('current')}
                variant="secondary"
                className="flex-1"
              >
                Snooze
              </Button>
            </div>
            
            <button
              onClick={onCloseNotificationModal}
              className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PillPal;
