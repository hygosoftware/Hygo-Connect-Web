'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PillPal, PillPalDesktop } from '../../components/organisms';

// Helper function to get date strings
const getDateString = (daysFromToday: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
};

// Mock data for demonstration with dates
const mockNotifications = [
  {
    id: '1',
    medicineName: 'Metformin',
    medicineType: 'tablet' as const,
    dosage: '500mg',
    mealTiming: 'after' as const,
    scheduledTimes: ['08:00', '14:00', '20:00'],
    isActive: true,
    date: getDateString(0), // Today
  },
  {
    id: '2',
    medicineName: 'Vitamin D3',
    medicineType: 'capsule' as const,
    dosage: '1000 IU',
    mealTiming: 'with' as const,
    scheduledTimes: ['09:00'],
    isActive: true,
    date: getDateString(0), // Today
  },
  {
    id: '3',
    medicineName: 'Cough Syrup',
    medicineType: 'syrup' as const,
    dosage: '10ml',
    mealTiming: 'before' as const,
    scheduledTimes: ['10:00', '16:00', '22:00'],
    isActive: true,
    date: getDateString(1), // Tomorrow
  },
  {
    id: '4',
    medicineName: 'Insulin',
    medicineType: 'injection' as const,
    dosage: '10 units',
    scheduledTimes: ['07:30', '19:30'],
    isActive: true,
    date: getDateString(0), // Today
  },
  {
    id: '5',
    medicineName: 'Blood Pressure Medication',
    medicineType: 'tablet' as const,
    dosage: '25mg',
    mealTiming: 'before' as const,
    scheduledTimes: ['08:00', '20:00'],
    isActive: true,
    date: getDateString(2), // Day after tomorrow
  },
  {
    id: '6',
    medicineName: 'Omega-3',
    medicineType: 'capsule' as const,
    dosage: '1000mg',
    mealTiming: 'with' as const,
    scheduledTimes: ['12:00'],
    isActive: true,
    date: getDateString(1), // Tomorrow
  },
];

const mockFcmNotifications = [
  {
    id: '1',
    title: 'Medication Reminder',
    body: 'Time to take your Metformin (500mg)',
    timestamp: new Date().toISOString(),
    isRead: false,
  },
  {
    id: '2',
    title: 'Medication Taken',
    body: 'You successfully logged your Vitamin D3 dose',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: true,
  },
  {
    id: '3',
    title: 'Missed Dose Alert',
    body: 'You missed your evening Cough Syrup dose',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
  },
];

const PillPalPage: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [fcmNotifications, setFcmNotifications] = useState(mockFcmNotifications);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFcmHistory, setShowFcmHistory] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    visible: false,
  });

  // Detect desktop screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const unreadFcmCount = fcmNotifications.filter(n => !n.isRead).length;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleGoBack = () => {
    router.back(); // Navigate back to previous page
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Medications refreshed successfully', 'success');
    }, 1000);
  };

  const handleToggleFcmHistory = () => {
    setShowFcmHistory(!showFcmHistory);
  };

  const handleTestFcmToken = () => {
    showToast('FCM token test initiated', 'info');
  };

  const handleMarkFcmAsRead = (id: string) => {
    setFcmNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
    showToast('Notification marked as read', 'success');
  };

  const handleEditNotification = (id: string) => {
    const medication = notifications.find(n => n.id === id);
    showToast(`Edit ${medication?.medicineName || 'medication'}`, 'info');
    // In a real app, navigate to edit screen
  };

  const handleDeleteNotification = (id: string) => {
    const medication = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast(`${medication?.medicineName || 'Medication'} deleted successfully`, 'success');
  };

  const handleAddButtonPress = () => {
    showToast('Add new medication', 'info');
    // In a real app, navigate to add medication screen
  };

  const handleMarkTaken = (id: string) => {
    showToast('Medication marked as taken', 'success');
    setShowNotificationModal(false);
  };

  const handleSnooze = (id: string) => {
    showToast('Reminder snoozed for 15 minutes', 'info');
    setShowNotificationModal(false);
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
  };

  const handleHideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Render desktop or mobile version based on screen size
  const PillPalComponent = isDesktop ? PillPalDesktop : PillPal;

  return (
    <>
      <PillPalComponent
        userId="demo-user"
        notifications={notifications}
        fcmNotifications={fcmNotifications}
        loading={loading}
        refreshing={refreshing}
        showFcmHistory={showFcmHistory}
        showNotificationModal={showNotificationModal}
        unreadFcmCount={unreadFcmCount}
        toast={toast}
        onGoBack={handleGoBack}
        onRefresh={handleRefresh}
        onToggleFcmHistory={handleToggleFcmHistory}
        onTestFcmToken={handleTestFcmToken}
        onMarkFcmAsRead={handleMarkFcmAsRead}
        onEditNotification={handleEditNotification}
        onDeleteNotification={handleDeleteNotification}
        onAddButtonPress={handleAddButtonPress}
        onMarkTaken={handleMarkTaken}
        onSnooze={handleSnooze}
        onCloseNotificationModal={handleCloseNotificationModal}
        onHideToast={handleHideToast}
      />

      {/* Demo Controls - Only show on mobile */}
      {!isDesktop && (
        <div className="fixed bottom-20 left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-40">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Demo Controls</h3>
          <div className="space-y-2">
            <button
              onClick={() => setLoading(!loading)}
              className="w-full text-left text-xs text-blue-600 hover:text-blue-800"
            >
              Toggle Loading: {loading ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowNotificationModal(true)}
              className="w-full text-left text-xs text-blue-600 hover:text-blue-800"
            >
              Show Notification Modal
            </button>
            <button
              onClick={() => showToast('Demo toast message', 'success')}
              className="w-full text-left text-xs text-blue-600 hover:text-blue-800"
            >
              Show Success Toast
            </button>
            <button
              onClick={() => showToast('Error occurred', 'error')}
              className="w-full text-left text-xs text-blue-600 hover:text-blue-800"
            >
              Show Error Toast
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PillPalPage;
