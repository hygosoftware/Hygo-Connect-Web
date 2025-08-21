'use client';

import React, { useState } from 'react';
import { Typography, Icon, BackButton, Button, WeeklyCalendar, UniversalHeader } from '../atoms';
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
    <div className="min-h-screen bg-white">
      {/* Universal Header */}
      <UniversalHeader
        title="PillPal - Medication Calendar"
        subtitle="Manage your daily medication schedule"
        variant="gradient"
        icon="pill"
        showBackButton={true}
        onBackPress={onGoBack}
        rightContent={
          <div className="flex items-center space-x-4">
            <Button
              onClick={onAddButtonPress}
              variant="primary"
              className="bg-white text-[#0e3293] hover:bg-white border border-white flex items-center justify-center"
            >
              <Icon name="plus" size="small" color="#0e3293" className="mr-2" />
              <span className="text-[#0e3293] font-bold">Add Medication</span>
            </Button>

            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
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
              className="relative p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon name="bell" size="medium" color="currentColor" />
              {unreadFcmCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadFcmCount}
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex flex-col">

        {/* Hero Banner */}
        <div className="px-6 py-4">
          <div className="bg-gradient-to-r from-[#0e3293] to-[#1e40af] rounded-2xl p-6 flex items-center justify-between">
            <div>
              <Typography variant="h6" className="text-white font-bold mb-2">
                Stay Healthy — Take Your Medications!
              </Typography>
              <Typography variant="body2" className="text-white">
                Never miss a dose with PillPal's smart reminders.
              </Typography>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <Icon name="pills" size="large" color="white" />
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex">
          {/* Calendar Area */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e3293] mx-auto mb-6"></div>
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
            className="w-80"
          />
        </div>
      </div>

      {/* FCM History Modal */}
      {showFcmHistory && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-96 flex flex-col">
            <div className="p-4 border-b border-blue-200 bg-gradient-to-r from-[#0e3293] to-[#1e40af]">
              <div className="flex items-center justify-between">
                <Typography variant="h6" className="text-white">
                  Notifications
                </Typography>
                <button
                  onClick={onToggleFcmHistory}
                  className="p-1 text-blue-200 hover:text-white"
                >
                  <Icon name="x" size="small" color="currentColor" />
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
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.isRead
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-[#0e3293]/20'
                    }`}
                    onClick={() => onMarkFcmAsRead(notification.id)}
                  >
                    <Typography variant="subtitle2" className="text-gray-900 font-medium mb-1">
                      {notification.title}
                    </Typography>
                    <Typography variant="body2" color="secondary" className="mb-2">
                      {notification.body}
                    </Typography>
                    <Typography variant="caption" color="secondary">
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
            px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm
            ${toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-[#0e3293] text-white'}
          `}>
            <Icon
              name={toast.type === 'success' ? 'check' : toast.type === 'error' ? 'alert' : 'bell'}
              size="small"
              color="white"
            />
            <Typography variant="body2" className="flex-1">
              {toast.message}
            </Typography>
            <button
              onClick={onHideToast}
              className="text-white hover:text-blue-200"
            >
              <Icon name="x" size="small" color="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <Icon name="bell" size="large" color="#0e3293" className="mx-auto mb-4" />
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
                className="flex-1 bg-[#0e3293] hover:bg-[#0a2470]"
              >
                Mark Taken
              </Button>
              <Button
                onClick={() => onSnooze('current')}
                variant="secondary"
                className="flex-1 bg-blue-100 text-[#0e3293] hover:bg-blue-200"
              >
                Snooze
              </Button>
            </div>
            
            <button
              onClick={onCloseNotificationModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#0e3293]"
            >
              <Icon name="x" size="small" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PillPalDesktop;