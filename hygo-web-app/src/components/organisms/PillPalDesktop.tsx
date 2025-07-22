'use client';

import React, { useState } from 'react';
import { Typography, Icon, BackButton, Button, WeeklyCalendar } from '../atoms';
import { MedicationSidebar } from '../molecules';

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

interface PillPalDesktopProps {
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

const PillPalDesktop: React.FC<PillPalDesktopProps> = ({
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
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Helper functions
  const getNextMedicationInfo = () => {
    if (notifications.length === 0) return "No medications scheduled";

    const today = new Date().toISOString().split('T')[0];
    const todayMedications = notifications.filter(med => !med.date || med.date === today);

    if (todayMedications.length === 0) return "No medications scheduled for today";

    return `${todayMedications.length} medication${todayMedications.length > 1 ? 's' : ''} scheduled for today`;
  };

  // Convert medications to calendar events
  const getMedicationEvents = () => {
    const events: any[] = [];

    notifications.forEach(med => {
      med.scheduledTimes.forEach(time => {
        events.push({
          id: `${med.id}-${time}`,
          medicineName: med.medicineName,
          medicineType: med.medicineType,
          dosage: med.dosage,
          time: time,
          date: med.date || new Date().toISOString().split('T')[0],
        });
      });
    });

    return events;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMedicationClick = (medication: any) => {
    // Handle medication click from calendar
    console.log('Medication clicked:', medication);
  };

  return (
    <div className="min-h-screen relative">
      {/* Main Content Area */}
      <div className="flex flex-col relative z-10">
        {/* Top Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BackButton
                onClick={onGoBack}
                variant="default"
                className="mr-2"
              />
              <div>
                <Typography variant="h5" color="primary" className="text-gray-800 font-bold">
                  PillPal - Medication Calendar
                </Typography>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={onAddButtonPress}
                variant="primary"
                className="w-full sm:w-auto bg-gradient-to-r from-[#0E3293] to-[#1e40af] hover:from-[#1e40af] hover:to-[#0E3293] flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <Icon name="plus" size="small" color="white" className="mr-2 drop-shadow-sm" />
                <span className="whitespace-nowrap text-white drop-shadow-sm">Add Medication</span>
              </Button>

              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-300 disabled:opacity-50 border border-gray-200 shadow-sm"
              >
                <Icon
                  name="notification"
                  size="medium"
                  color="currentColor"
                  className={refreshing ? 'animate-spin' : ''}
                />
              </button>

              <button
                onClick={onToggleFcmHistory}
                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-300 border border-gray-200 shadow-sm"
              >
                <Icon name="bell" size="medium" color="currentColor" />
                {unreadFcmCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-red-500/30 border border-red-400/50">
                    {unreadFcmCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="px-4 sm:px-6 py-4">
          <div className="bg-gradient-to-r from-[#0E3293] to-[#1e40af] rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between shadow-xl shadow-blue-500/20 border border-blue-300/30 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <Typography variant="h6" color="text-primary" className="text-white font-bold mb-2 drop-shadow-sm text-lg sm:text-xl">
                Be A Hero — It's In Your Blood!
              </Typography>
              <Typography variant="body2" color="text-secondary" className="text-white/90 drop-shadow-sm text-sm sm:text-base">
                Register to be a blood donor, give blood and save lives.
              </Typography>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-red-300/50 flex-shrink-0">
              <Icon name="heart" size="large" color="white" />
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Calendar Area */}
          <div className="flex-1 p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-6"></div>
                  <Typography variant="h6" color="secondary">
                    Loading your medications...
                  </Typography>
                </div>
              </div>
            ) : (
              <WeeklyCalendar
                selectedWeek={selectedWeek}
                medications={getMedicationEvents()}
                onDateSelect={handleDateSelect}
                onMedicationClick={handleMedicationClick}
                className="w-full"
              />
            )}
          </div>

          {/* Right Sidebar */}
          <MedicationSidebar
            medications={notifications}
            onMedicationClick={(med) => onEditNotification(med.id)}
            onMarkTaken={onMarkTaken}
            className="w-full lg:w-80 lg:max-w-sm"
          />
        </div>
      </div>

      {/* FCM History Modal */}
      {showFcmHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-96 flex flex-col border border-gray-200 shadow-2xl shadow-gray-300/50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Typography variant="h6" color="primary" className="text-gray-800">
                  Notifications
                </Typography>
                <button
                  onClick={onToggleFcmHistory}
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-300 border border-gray-200"
                >
                  <Icon name="x" size="small" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {fcmNotifications.length === 0 ? (
                <Typography variant="body2" color="secondary" className="text-center py-8">
                  No notifications yet
                </Typography>
              ) : (
                fcmNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 shadow-sm transform hover:scale-[1.02] ${
                      notification.isRead
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-[#0E3293]/5 border-blue-200 shadow-blue-500/10'
                    }`}
                    onClick={() => onMarkFcmAsRead(notification.id)}
                  >
                    <Typography variant="subtitle2" color="primary" className="text-gray-800 font-medium mb-1">
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="secondary" className="mb-2 text-gray-600">
                      {notification.body}
                    </Typography>
                    <Typography variant="caption" color="secondary" className="text-gray-500">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`
            px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center space-x-3 max-w-sm transition-all duration-300 transform hover:scale-105
            ${toast.type === 'success'
              ? 'bg-green-500/20 border-green-400/30 shadow-green-500/30'
              : toast.type === 'error'
              ? 'bg-red-500/20 border-red-400/30 shadow-red-500/30'
              : 'bg-blue-500/20 border-blue-400/30 shadow-blue-500/30'}
          `}>
            <Icon
              name={toast.type === 'success' ? 'check' : toast.type === 'error' ? 'alert' : 'bell'}
              size="small"
              color="white"
              className="drop-shadow-sm"
            />
            <Typography variant="body2" color="text-primary" className="flex-1 text-white drop-shadow-sm">
              {toast.message}
            </Typography>
            <button
              onClick={onHideToast}
              className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-lg p-1 transition-all duration-300"
            >
              <Icon name="x" size="small" className="drop-shadow-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/30 shadow-2xl shadow-orange-200/30">
            <div className="text-center mb-6">
              <Icon name="bell" size="large" color="#0E3293" className="mx-auto mb-4 drop-shadow-lg" />
              <Typography variant="h6" color="primary" className="text-gray-800 mb-2 drop-shadow-sm">
                Medication Reminder
              </Typography>
              <Typography variant="body2" color="secondary" className="text-gray-600 drop-shadow-sm">
                It's time to take your medication
              </Typography>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => onMarkTaken('current')}
                variant="primary"
                className="flex-1 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-400/30 backdrop-blur-sm shadow-lg shadow-green-500/20 text-green-200 hover:text-green-100 transition-all duration-300"
              >
                Mark Taken
              </Button>
              <Button
                onClick={() => onSnooze('current')}
                variant="secondary"
                className="flex-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 border border-yellow-400/30 backdrop-blur-sm shadow-lg shadow-yellow-500/20 text-yellow-200 hover:text-yellow-100 transition-all duration-300"
              >
                Snooze
              </Button>
            </div>

            <button
              onClick={onCloseNotificationModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 hover:bg-white/20 backdrop-blur-sm rounded-lg p-2 transition-all duration-300 border border-white/30"
            >
              <Icon name="x" size="small" className="drop-shadow-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PillPalDesktop;
