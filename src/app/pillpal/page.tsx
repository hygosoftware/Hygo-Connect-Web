'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PillPal, PillPalDesktop } from '../../components/organisms';
import AddMedicineModal from '../../components/organisms/AddMedicineModal';
import { pillReminderService, pillReminderHelpers, PillReminder, Medicine } from '../../services/apiServices';

// Helper function to get date strings
const getDateString = (daysFromToday: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0];
};
const PillPalPage: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pillReminders, setPillReminders] = useState<PillReminder[]>([]);
  const [fcmNotifications, setFcmNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFcmHistory, setShowFcmHistory] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [addingMedicines, setAddingMedicines] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    visible: false,
  });

  // Load pill reminders from API
  const loadPillReminders = async () => {
    try {
      setLoading(true);
      // Using the sample user ID from your API example
      const userId = '685e823b3ec68e8bb8dae392';
      console.log('💊 Loading pill reminders for user:', userId);

      const apiReminders = await pillReminderService.getPillRemindersByUserId(userId);
      console.log('API Response Data:', apiReminders);

      // Ensure apiReminders is an array
      const remindersArray = Array.isArray(apiReminders) ? apiReminders : [];
      setPillReminders(remindersArray);

      // Convert API data to component format - now returns arrays of notifications for each day
      const convertedNotifications = remindersArray.flatMap(reminder => {
        try {
          return pillReminderHelpers.convertToComponentFormat(reminder);
        } catch (conversionError) {
          console.error('Error converting reminder:', conversionError);
          return [];
        }
      });

      setNotifications(convertedNotifications);
      console.log('Converted Notifications:', convertedNotifications);

      if (convertedNotifications.length === 0) {
        showToast('No medication reminders found. Click + to add your first medicine.', 'info');
      } else {
        showToast(`Loaded ${convertedNotifications.length} medication${convertedNotifications.length > 1 ? 's' : ''}`, 'success');
      }

    } catch (error) {
      console.error('❌ Failed to load pill reminders:', error);
      showToast('Failed to load medication reminders. Please check your connection.', 'error');
      // Keep empty arrays on error
      setPillReminders([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Detect desktop screen size and handle client-side hydration
  useEffect(() => {
    setIsClient(true);

    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load pill reminders on component mount
  useEffect(() => {
    loadPillReminders();
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPillReminders();
      showToast('Medications refreshed successfully', 'success');
    } catch (error) {
      showToast('Failed to refresh medications', 'error');
    } finally {
      setRefreshing(false);
    }
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

  const handleDeleteNotification = async (id: string) => {
    const medication = notifications.find(n => n.id === id);

    try {
      // Call API to delete the pill reminder
      const success = await pillReminderService.deletePillReminder(id);

      if (success) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== id));
        setPillReminders(prev => prev.filter(r => r._id !== id));
        showToast(`${medication?.medicineName || 'Medication'} deleted successfully`, 'success');
      } else {
        showToast('Failed to delete medication', 'error');
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      showToast('Failed to delete medication', 'error');
    }
  };

  const handleAddButtonPress = () => {
    setShowAddMedicineModal(true);
  };



  const handleAddMedicines = async (medicines: Medicine[]) => {
    setAddingMedicines(true);

    try {
      // Using the sample user ID from your API example
      const userId = '685e823b3ec68e8bb8dae392';
      console.log('💊 Adding medicines for user:', userId);
      console.log('📋 Medicines to add:', medicines);

      // Show initial loading message
      showToast('Adding medicines... This may take a moment', 'info');

      const result = await pillReminderService.addMedicines(medicines, userId);

      if (result.success) {
        showToast(`Successfully added ${result.created.length} medicine${result.created.length > 1 ? 's' : ''}`, 'success');
        setShowAddMedicineModal(false);

        // Reload the pill reminders to show the new ones
        await loadPillReminders();

        // Show any warnings
        if (result.errors.length > 0) {
          setTimeout(() => {
            showToast(result.errors.join('; '), 'info');
          }, 2000);
        }
      } else {
        const errorMessage = result.errors.join('; ') || 'Failed to add medicines';
        console.error('❌ Add medicines failed:', errorMessage);

        // Check if it's a timeout error
        if (errorMessage.includes('timeout') || errorMessage.includes('exceeded')) {
          showToast('Request timed out. Please check your connection and try again.', 'error');
        } else {
          showToast(errorMessage, 'error');
        }
      }
    } catch (error: any) {
      console.error('❌ Error adding medicines:', error);

      // Handle different types of errors
      let errorMessage = 'Failed to add medicines';

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
    } finally {
      setAddingMedicines(false);
    }
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

  // Show loading until client-side detection is complete to prevent flash
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e3293] mx-auto mb-6"></div>
          <div className="text-lg font-medium text-[#0e3293]">Loading PillPal...</div>
        </div>
      </div>
    );
  }

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

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={showAddMedicineModal}
        onClose={() => setShowAddMedicineModal(false)}
        onAddMedicines={handleAddMedicines}
        loading={addingMedicines}
      />



      {/* Demo Controls - Only show on mobile */}
      {/* {!isDesktop && (
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
      )} */}
    </>
  );
};

export default PillPalPage;
