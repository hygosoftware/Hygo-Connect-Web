// API Service for handling HTTP requests

interface Notification {
  _id: string;
  intake: string;
  Time: string[];
  medicines: {
    _id: string;
    medicineName: string;
    medicineType: string;
  }[] | { medicineName: string; medicineType: string };
  Meal: string;
  startDate: string;
  endDate: string;
  userId: string;
  mobileNumber?: string;
  DelegatedPatientID?: string | null;
  DelegateAuthID?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Notification API functions
export const getNotifications = async (userId: string): Promise<ApiResponse<Notification[]>> => {
  // For now, return mock data. Replace with actual API call when backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            _id: '1',
            intake: '2 tablets',
            Time: ['08:00', '14:00', '20:00'],
            medicines: [
              { _id: '1', medicineName: 'Paracetamol', medicineType: 'Tablet' },
              { _id: '2', medicineName: 'Vitamin D', medicineType: 'Capsule' }
            ],
            Meal: 'After meal',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            userId: userId,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            _id: '2',
            intake: '1 tablet',
            Time: ['09:00', '21:00'],
            medicines: { medicineName: 'Aspirin', medicineType: 'Tablet' },
            Meal: 'Before meal',
            startDate: '2024-01-01',
            endDate: '2024-02-01',
            userId: userId,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        success: true,
        message: 'Notifications retrieved successfully'
      });
    }, 1000);
  });

  // Uncomment this when you have a real API endpoint:
  // return apiRequest<Notification[]>(`/notifications/${userId}`);
};

export const deleteNotification = async (notificationId: string): Promise<ApiResponse<{ id: string }>> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: { id: notificationId },
        success: true,
        message: 'Notification deleted successfully'
      });
    }, 500);
  });

  // Uncomment this when you have a real API endpoint:
  // return apiRequest<{ id: string }>(`/notifications/${notificationId}`, {
  //   method: 'DELETE',
  // });
};

export const updateNotification = async (
  notificationId: string, 
  notification: Partial<Notification>
): Promise<ApiResponse<Notification>> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: { ...notification, _id: notificationId } as Notification,
        success: true,
        message: 'Notification updated successfully'
      });
    }, 500);
  });

  // Uncomment this when you have a real API endpoint:
  // return apiRequest<Notification>(`/notifications/${notificationId}`, {
  //   method: 'PUT',
  //   body: JSON.stringify(notification),
  // });
};

export const createNotification = async (notification: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Notification>> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          ...notification,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Notification,
        success: true,
        message: 'Notification created successfully'
      });
    }, 500);
  });

  // Uncomment this when you have a real API endpoint:
  // return apiRequest<Notification>('/notifications', {
  //   method: 'POST',
  //   body: JSON.stringify(notification),
  // });
};

// Export types for use in components
export type { Notification, ApiResponse };
