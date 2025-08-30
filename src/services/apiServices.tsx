import axios from "axios";
import { TokenManager } from './auth';

// Types for Pill Reminder API response (matching your Mongoose schema)
export interface ApiMedicine {
  _id?: string;
  medicineName: string;
  medicineType: "Tablet" | "Pill" | "Injection" | "Syrup" | "Suspension" | "Capsule" | "Ointment" | "Lozenge" | "Suppository" | "Other";
}

export interface PillReminder {
  _id: string;
  medicines: ApiMedicine[];
  root?: string;
  dosage?: string;
  intake?: string;
  Meal: "Before Food" | "After Food" | "With Bedtime";
  Time: string[];
  duration: {
    value?: number;
    unit: "days" | "weeks" | "months" | "sos" | "weekbased" | "alternative" | "onemonthonetime" | "weekwise";
    additionalDetails?: string | { weekdays: string[] };
  };
  startDate: string;
  endDate: string;
  quantity?: number;
  userId: string;
  mobileNumber: string[];
  DelegatedPatientID?: string;
  DelegateAuthID?: string[];
  createdAt: string;
  fileId?: string;
  originalTime?: string[];
  isConfirmed?: boolean;
  confirmationSource?: 'default' | 'patient' | 'auto';
  confirmedTime?: string[];
  confirmedDuration?: {
    value: number;
    unit: string;
  };
  sentNotifications?: Array<{
    time: Date;
    message: string;
    mobileNumbers: string[];
    status: 'sent' | 'failed';
    details: Array<{
      mobile: string;
      status: string;
      error: string;
    }>;
  }>;
  sendCount?: number;
  lastSent?: Date;
  __v?: number;
}

// Interface for adding new medicines (UI model)
export interface Medicine {
  id: string;
  type: ApiMedicine['medicineType']; // Use the same enum as API
  name: string;
  dose: {
    value: string;
    unit: string;
  };
  timings: {
    [key: string]: {
      intake: string;
      time: string;
      customIntake?: string;
    };
  };
  timingType: "before" | "after" | "bedtime" | "custom";
  customTiming?: string;
  appearance?: string;
  notes?: string;
  duration: {
    value: string;
    unit: string;
    startDate: string;
    endDate: string;
  };
};

// Payload expected by createPillReminder when called with (userId, payload)
export interface CreatePillReminderPayload {
  medicines: ApiMedicine[];
  Time: string[];
  Meal: PillReminder['Meal'];
  dosage?: string;
  intake?: string;
  startDate: string;
  duration: PillReminder['duration'];
}

// Types for Doctor API response
import { Doctor, DoctorClinic, DoctorQualification, DoctorAvailability, DoctorDepartment, DoctorAvailabilitySlot } from "../types/Doctor";

// Re-export Doctor types for external use
export type { Doctor, DoctorClinic, DoctorQualification, DoctorAvailability, DoctorDepartment, DoctorAvailabilitySlot };


export interface DoctorsApiResponse {
  success: boolean;
  message: string;
  data: Doctor[];
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

// File/Folder types used by folderService
export interface Folder {
  _id: string;
  folderName: string;
  folderAccess?: Array<{
    DelegateFolderAuthID: string;
    AccessFolderID: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileItem {
  _id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: string;
  fileAccess?: Array<string>;
}

export interface FileDetails {
  _id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  thumbnailUrl?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  uploadedAt?: string;
  fileAccess?: string[];
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    pages?: number;
    [key: string]: unknown;
  };
  tags?: string[];
  description?: string;
  uploadedBy?: string;
  folderId?: string;
  size?: number; // Alias for fileSize for backward compatibility
}

// Family member types for familyMemberService
export interface FamilyMember {
  _id?: string;
  id?: string;
  FullName?: string;
  Email?: string;
  MobileNumber?: Array<{ number: string; isVerified?: boolean }> | string[];
  profilePhoto?: string;
  DateOfBirth?: string;
  Age?: number | string;
  BloodGroup?: string;
  Allergies?: string[];
  Gender?: string;
  Height?: number | string;
  Weight?: number | string;
  Country?: string;
  State?: string;
  City?: string;
}

export interface CreateFamilyMemberRequest {
  FullName: string;
  Gender?: string;
  DateOfBirth?: string;
  MobileNumber?: Array<{ number: string; isVerified?: boolean }> | string[];
  Email?: string;
  BloodGroup?: string;
  Allergies?: string[];
  Height?: number | string;
  Weight?: number | string;
  Country?: string;
  State?: string;
  City?: string;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for pill reminder operations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Skip token for auth endpoints
    const isAuthEndpoint = ['/auth/login', '/auth/verify-otp'].some(path => 
      config.url?.includes(path)
    );
    
    if (!isAuthEndpoint) {
      // Get token from TokenManager
      const { accessToken } = TokenManager.getTokens();
      
      if (!accessToken) {
        console.warn('⚠️ No access token found. API request may fail.');
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log('🔄 Token expired, attempting refresh...');

      try {
        const { refreshToken } = TokenManager.getTokens();
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
            refreshToken
          });

          if (response.data.accessToken) {
            // Update tokens
            TokenManager.setTokens(
              response.data.accessToken,
              response.data.refreshToken || refreshToken,
              response.data.user
            );

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        TokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Log all API errors
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message
    });

    return Promise.reject(error);
  }
);




// Helper to safely extract standard API error messages from unknown data
const getApiMessage = (data: unknown, key: 'message' | 'error' = 'message'): string | undefined => {
  if (data && typeof data === 'object' && data !== null) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === 'string') return value;
  }
  return undefined;
};

// Profile API Types
export interface ProfileData {
  _id: string;
  FullName: string;
  Email: string;
  MobileNumber?: string | { number: string; isVerified: boolean; _id?: string } | Array<{ number: string; isVerified: boolean; _id?: string }>;
  AlternativeNumber?: string | { number: string; isVerified: boolean; _id?: string } | Array<{ number: string; isVerified: boolean; _id?: string }>;
  Gender?: string;
  Age?: string | number;
  DateOfBirth?: string;
  Country?: string;
  State?: string;
  City?: string;
  Address?: string;
  Height?: string | number;
  Weight?: string | number;
  BloodGroup?: string;
  ChronicDiseases?: string[];
  Allergies?: string[];
  profilePhoto?: string | null;
  UserType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileApiResponse {
  success: boolean;
  message: string;
  data: ProfileData;
}

export interface UpdateProfileRequest {
  FullName?: string;
  Email?: string;
  MobileNumber?: string | Array<{ number: string; isVerified?: boolean }>;
  AlternativeNumber?: string | Array<{ number: string; isVerified?: boolean }>;
  Gender?: string;
  Age?: string;
  DateOfBirth?: string;
  Country?: string;
  State?: string;
  City?: string;
  Address?: string;
  Height?: string;
  Weight?: string;
  BloodGroup?: string;
  ChronicDiseases?: string[];
  Allergies?: string[];
  profilePhoto?: string | null;
}

// Profile API Services
export const profileService = {
  // Get user profile by user ID
  getProfileByUserId: async (userId: string): Promise<ProfileData | null> => {
    console.log('🌐 API Call: Fetching profile for user ID:', userId);
    console.log('🔗 API URL:', `${API_BASE_URL}/${userId}`);

    try {
      const response = await apiClient.get<ProfileData | ProfileApiResponse>(`/${userId}`);
      console.log('✅ Profile data fetched:', response.data);

      // Handle different response formats
      if (response.data && typeof response.data === 'object') {
        // Check if it's wrapped in a success response
        if ('success' in response.data && 'data' in response.data) {
          const apiResponse = response.data as ProfileApiResponse;
          return apiResponse.success ? apiResponse.data : null;
        } else {
          // Direct profile data
          return response.data as ProfileData;
        }
      }

      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching profile:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else if (error instanceof Error) {
        console.error('❌ Error fetching profile:', error.message);
      } else {
        console.error('❌ Error fetching profile:', error);
      }

      return null;
    }
  },

  // Update user profile
  updateProfile: async (userId: string, profileData: UpdateProfileRequest | FormData): Promise<ProfileData | null> => {
    console.log('🌐 API Call: Updating profile for user ID:', userId);
    console.log('🔗 API URL:', `${API_BASE_URL}/${userId}`);
    console.log('📊 Update data:', profileData);

    try {
      // If profilePhoto is a base64 data URL, send multipart/form-data to avoid size bloat and server 413
      const isDataUrl = (v: unknown): v is string => typeof v === 'string' && v.startsWith('data:');

      if (isDataUrl((profileData as any)?.profilePhoto)) {
        const form = new FormData();

        for (const [key, value] of Object.entries(profileData)) {
          if (value === undefined || value === null) continue;
          if (key === 'profilePhoto' && isDataUrl(value)) {
            // Convert data URL to Blob and append with a filename
            const blob = await fetch(value).then(r => r.blob());
            const mime = value.substring(5, value.indexOf(';')) || 'image/png';
            const ext = mime.split('/')[1] || 'png';
            form.append('profilePhoto', blob, `profile.${ext}`);
          } else if (typeof value === 'object') {
            form.append(key, JSON.stringify(value));
          } else {
            form.append(key, String(value));
          }
        }

        const response = await apiClient.put<ProfileData | ProfileApiResponse>(`/${userId}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log('✅ Profile updated (multipart):', response.data);

        if (response.data && typeof response.data === 'object') {
          if ('success' in response.data && 'data' in response.data) {
            const apiResponse = response.data as ProfileApiResponse;
            return apiResponse.success ? apiResponse.data : null;
          }
          return response.data as ProfileData;
        }
        return null;
      }

      const response = await apiClient.put<ProfileData | ProfileApiResponse>(`/${userId}`, profileData);
      console.log('✅ Profile updated:', response.data);

      // Handle different response formats
      if (response.data && typeof response.data === 'object') {
        // Check if it's wrapped in a success response
        if ('success' in response.data && 'data' in response.data) {
          const apiResponse = response.data as ProfileApiResponse;
          return apiResponse.success ? apiResponse.data : null;
        } else {
          // Direct profile data
          return response.data as ProfileData;
        }
      }

      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error updating profile:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else if (error instanceof Error) {
        console.error('❌ Error updating profile:', error.message);
      } else {
        console.error('❌ Error updating profile:', error);
      }

      throw error; // Re-throw to allow caller to handle
    }
  },
};

// API Services
export const doctorService = {
  // Fetch all doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    console.log('🌐 [DoctorService] Fetching all doctors...');
    console.log('🔗 [DoctorService] API Base URL:', API_BASE_URL);
    console.log('🔗 [DoctorService] Endpoint: /Staff/d');
    console.log('🔗 [DoctorService] Full URL:', `${API_BASE_URL}/Staff/d`);

    try {
      console.log('🔄 [DoctorService] Sending GET request...');
      const response = await apiClient.get<Doctor[]>('/Staff/d');
      
      console.log('✅ [DoctorService] Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataLength: response.data?.length || 0,
        firstItem: response.data?.[0] || null
      });

      if (!response.data) {
        console.warn('⚠️ [DoctorService] No data in response');
        return [];
      }

      console.log(`📦 [DoctorService] Successfully fetched ${response.data.length} doctors`);
      if (response.data.length > 0) {
        console.log('📋 [DoctorService] First doctor sample:', JSON.stringify(response.data[0], null, 2));
      }
      
      return response.data;
      
    } catch (error: unknown) {
      console.error('❌ [DoctorService] Error fetching doctors:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        } : undefined
      });

      // Log additional details for CORS issues
      if (axios.isAxiosError(error) && error.message?.includes('Network Error')) {
        console.error('🚨 [DoctorService] Network Error - Possible CORS issue or server not reachable');
        console.error('🚨 [DoctorService] Please check if the backend server is running and CORS is properly configured');
      }

      // Return empty array on error
      console.log('🔄 [DoctorService] Returning empty array due to error');
      return [];
      return [];
    }
  },

  // Fetch doctor by ID
  getDoctorById: async (doctorId: string): Promise<Doctor> => {
    console.log('🌐 API Call: Fetching doctor by ID:', doctorId);
    console.log('🔗 API URL:', `${API_BASE_URL}/Staff/${doctorId}`);

    try {
      const response = await apiClient.get<Doctor>(`/Staff/${doctorId}`);
      console.log('✅ API Response received:', response.status);
      console.log('📦 Raw API Response Data:', response.data);
      console.log('📊 Response Headers:', response.headers);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error fetching doctor:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ API Error fetching doctor:', error.message);
      } else {
        console.error('❌ API Error fetching doctor:', error);
      }

      throw new Error('Failed to fetch doctor details. Please try again later.');
    }
  },

  // Search doctors by name or specialization
  searchDoctors: async (query: string): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get<Doctor[]>(`/Staff/d?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error searching doctors:', error);

      return [];
    }
  },

  // Filter doctors by specialization
  getDoctorsBySpecialization: async (specialization: string): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get<Doctor[]>(`/Staff/d?specialization=${encodeURIComponent(specialization)}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching doctors by specialization:', error);

      return [];
    }
  },

  // Fetch clinic details by ID (for getting clinic info from availability)
  getClinicById: async (clinicId: string): Promise<DoctorClinic | null> => {
    try {
      console.log('🏥 Fetching clinic details for ID:', clinicId);
      const response = await apiClient.get<DoctorClinic>(`/Clinic/${clinicId}`);
      console.log('✅ Clinic details fetched:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error fetching clinic:', error);
      // Return null if clinic not found, don't throw error
      return null;
    }
  },
};

// Add clinicService for fetching all clinics
export const clinicService = {
  // Fetch all clinics
  getAllClinics: async (): Promise<DoctorClinic[]> => {
    console.log('🌐 API Call: Fetching all clinics');
    console.log('🔗 API URL:', `${API_BASE_URL}/Clinic/c`);
    try {
      const response = await apiClient.get<DoctorClinic[]>('/Clinic/c');
      console.log('✅ API Response received for all clinics:', response.status);
      console.log('📦 Number of clinics received:', response.data?.length || 0);
      console.log('📋 First clinic sample:', response.data?.[0]);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error fetching all clinics:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ API Error fetching all clinics:', error.message);
      } else {
        console.error('❌ API Error fetching all clinics:', error);
      }
      // Return empty array on error
      console.log('🔄 Returning empty array due to API error');
      return [];
    }
  },

  // Fetch clinics by doctor ID
  getClinicsByDoctor: async (doctorId: string): Promise<unknown[]> => {
    console.log('🌐 API Call: Fetching clinics by doctor ID', doctorId);
    console.log('🔗 API URL:', `${API_BASE_URL}/Clinic/doctor/${doctorId}`);
    try {
      const response = await apiClient.get<{ status: string; message: string; data: unknown[] }>(`/Clinic/doctor/${doctorId}`);
      console.log('✅ API Response received for clinics by doctor:', response.status);
      return response.data.data || [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error fetching clinics by doctor:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ API Error fetching clinics by doctor:', error.message);
      } else {
        console.error('❌ API Error fetching clinics by doctor:', error);
      }
      // Return empty array on error
      console.log('🔄 Returning empty array due to API error');
      return [];
    }
  },

  getdoctorbyclinicid: async (clinicId: string): Promise<unknown[]> => {
    try {
      const response = await apiClient.get(`/staff/c/${clinicId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("error fetching getdoctorbyclinicid", error);
      return [];
    }
  }
};

// Pill Reminder API Services
export const pillReminderService = {
  // Fetch pill reminders by user ID
  getPillRemindersByUserId: async (userId: string): Promise<PillReminder[]> => {

    try {
      const response = await apiClient.get(`/pillreminder/${userId}`);
      console.log('API Response Data:', response.data);

      // Handle different response formats
      let pillReminders: PillReminder[] = [];

      if (response.data) {
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          pillReminders = response.data;
        }
        // Check if response.data has a data property (wrapped response)
        else if (response.data.data && Array.isArray(response.data.data)) {
          pillReminders = response.data.data;
        }
        // Check if response.data has a pillReminders property
        else if (response.data.pillReminders && Array.isArray(response.data.pillReminders)) {
          pillReminders = response.data.pillReminders;
        }
        // If it's a single object, wrap it in an array
        else if (typeof response.data === 'object' && response.data._id) {
          pillReminders = [response.data];
        }
        // If response.data is not in expected format
        else {
          pillReminders = [];
        }
      } else {
        pillReminders = [];
      }

      return pillReminders;
    } catch (error: unknown) {
      console.error('API Error fetching pill reminders:', error);
      return [];
    }
  },

  createPillReminder: async (
    userIdOrPillReminder: string | Omit<PillReminder, '_id' | 'createdAt' | 'updatedAt'>,
    notificationData?: CreatePillReminderPayload,
    prescriptionFile?: File | null
  ): Promise<PillReminder | null> => {
    try {
      // Handle both old and new calling patterns
      let userId: string;
      let data: CreatePillReminderPayload;

      if (typeof userIdOrPillReminder === 'string') {
        // New pattern: createPillReminder(userId, notificationData)
        userId = userIdOrPillReminder;
        if (!notificationData) {
          throw new Error('Missing notification data for createPillReminder');
        }
        data = notificationData;
      } else {
        // Old pattern: createPillReminder(pillReminderObject)
        userId = userIdOrPillReminder.userId;
        // Map only needed fields to payload type
        data = {
          medicines: userIdOrPillReminder.medicines,
          Time: userIdOrPillReminder.Time,
          Meal: userIdOrPillReminder.Meal,
          dosage: userIdOrPillReminder.dosage,
          intake: userIdOrPillReminder.intake,
          startDate: userIdOrPillReminder.startDate,
          duration: userIdOrPillReminder.duration,
        };
      }

      console.log("=== ADD NOTIFICATION DEBUG ===")
      console.log("API URL:", `${API_BASE_URL}/Pillreminder/${userId}`)
      console.log("Request Data:", JSON.stringify(data, null, 2))

      // Convert JSON to FormData to match backend expectations (like your working curl)
      const formData = new FormData()

      // Add each field as FormData (matching your curl format)
      formData.append("medicines", JSON.stringify(data.medicines))

      // Handle Time field - backend expects it stringified
      formData.append("Time", JSON.stringify(data.Time))

      formData.append("Meal", data.Meal)
      formData.append("startDate", data.startDate)
      formData.append("duration", JSON.stringify(data.duration))

      console.log("Converted to FormData format (matching curl)")

      // Append optional fields only if present
      if (typeof data.dosage === 'string') formData.append("dosage", data.dosage);
      if (typeof data.intake === 'string') formData.append("intake", data.intake);
      // Append optional prescription file
      try {
        if (prescriptionFile instanceof File) {
          formData.append('file', prescriptionFile, prescriptionFile.name || 'prescription');
        }
      } catch (e) {
        console.warn('Could not append prescription file:', e);
      }

      const response = await apiClient.post<PillReminder>(`${API_BASE_URL}/Pillreminder/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("API Error creating pill reminder:", error.message)
        console.log("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
        const errorMessage = getApiMessage(error.response?.data, 'message') || error.message || "An unexpected error occurred";
        throw new Error(errorMessage)
      } else if (error instanceof Error) {
        console.error("API Error creating pill reminder:", error.message)
        throw new Error(error.message)
      } else {
        console.error("Unknown error type while creating pill reminder")
        throw new Error("An unexpected error occurred")
      }
    }
  },

  // Create multiple pill reminders (for adding multiple medicines)
  createMultiplePillReminders: async (
    pillReminders: Omit<PillReminder, '_id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<PillReminder[]> => {
    console.log(' API Call: Creating multiple pill reminders');
    try {
      const response = await apiClient.post<PillReminder[]>(`/pillreminder/bulk`, pillReminders);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ API Error creating multiple pill reminders:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error creating multiple pill reminders:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ API Error creating multiple pill reminders:', error.message);
      } else {
        console.error('❌ API Error creating multiple pill reminders:', error);
      }
      // Return empty array on error
      console.log('🔄 Returning empty array due to API error');
      return [];
    }
  },
  
  // Delete a pill reminder by its ID
  deletePillReminder: async (id: string): Promise<boolean> => {
    console.log('🌐 API Call: Deleting pill reminder with ID:', id);
    console.log('🔗 API URL:', `${API_BASE_URL}/pillreminder/${id}`);
    try {
      await apiClient.delete(`/pillreminder/${id}`);
      console.log('✅ Pill reminder deleted successfully');
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error deleting pill reminder:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ API Error deleting pill reminder:', error.message);
      } else {
        console.error('❌ API Error deleting pill reminder:', error);
      }
      return false;
    }
  },

  // Add multiple medicines for a user by creating individual pill reminders
  addMedicines: async (
    medicines: Medicine[],
    userId: string,
    prescriptionFile?: File | null
  ): Promise<{ success: boolean; created: PillReminder[]; errors: string[] }> => {
    const created: PillReminder[] = [];
    const errors: string[] = [];

    // Validate inputs
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return { success: false, created, errors: ['No medicines provided'] };
    }
    if (!userId) {
      return { success: false, created, errors: ['Missing userId'] };
    }

    // Process sequentially to keep logs clear and avoid rate spikes
    for (const med of medicines) {
      try {
        const validation = pillReminderHelpers.validateMedicine(med);
        if (!validation.isValid) {
          errors.push(`Validation failed for ${med.name || 'medicine'}: ${validation.errors.join(', ')}`);
          continue;
        }

        const payload = pillReminderHelpers.convertMedicineToApiFormat(med, userId);
        const createdReminder = await pillReminderService.createPillReminder(userId, payload, prescriptionFile);
        if (createdReminder) {
          created.push(createdReminder);
        } else {
          errors.push(`Failed to create reminder for ${med.name || 'medicine'}`);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const msg = getApiMessage(err.response?.data, 'message') || err.message || 'Unknown API error';
          errors.push(`API error for ${med.name || 'medicine'}: ${msg}`);
        } else if (err instanceof Error) {
          errors.push(`Error for ${med.name || 'medicine'}: ${err.message}`);
        } else {
          errors.push(`Unknown error for ${med.name || 'medicine'}`);
        }
      }
    }

    const success = created.length > 0 && errors.length === 0 ? true : created.length > 0;
    return { success, created, errors };
  },
};
export const folderService = {
  // Get all folders for a user
  getFoldersByUserId: async (userId: string): Promise<Folder[]> => {
  console.log('🌐 API Call: Fetching folders for user ID:', userId);
  console.log('🔗 API URL:', `${API_BASE_URL}/Folder/${userId}`);
  try {
    const response = await apiClient.get<Folder[] | { data: Folder[] }>(`/Folder/${userId}`);
    console.log('✅ API Response received for folders:', response.status);
    console.log('📦 Raw response data:', response.data);
    // Normalize various possible response shapes
    const raw = response.data as unknown;
    if (Array.isArray(raw)) {
      return raw as Folder[];
    }
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      // Common wrappers
      if (Array.isArray(obj.data)) return obj.data as Folder[];
      if (Array.isArray((obj as any).folders)) return (obj as any).folders as Folder[];
      if (Array.isArray((obj as any).Folders)) return (obj as any).Folders as Folder[];
    }
    return [];
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('❌ API Error fetching folders:', error.message);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    } else if (error instanceof Error) {
      console.error('❌ API Error fetching folders:', error.message);
    } else {
      console.error('❌ API Error fetching folders:', error);
    }
    // Return empty array on error
    console.log('🔄 Returning empty array due to API error');
    return [];
  }
  },

  // Get all files from a specific folder
  getFilesByFolderId: async (userId: string, folderId: string): Promise<FileItem[]> => {
    console.log('🌐 API Call: Fetching files for user ID:', userId, 'and folder ID:', folderId);
    console.log('🔗 API URL:', `${API_BASE_URL}/File/${userId}/${folderId}`);
    try {
      const response = await apiClient.get<FileItem[] | { files: FileItem[] } | { data: FileItem[] }>(`/File/${userId}/${folderId}`);
      console.log('✅ API Response received for files:', response.status);
      console.log('📦 Raw response data:', response.data);

      let files: FileItem[] = [];
      if (Array.isArray(response.data)) {
        files = response.data;
      } else if (response.data && typeof response.data === 'object' && 'files' in response.data) {
        const filesResponse = response.data as { files: FileItem[] };
        if (Array.isArray(filesResponse.files)) {
          files = filesResponse.files;
        }
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const wrappedResponse = response.data as { data: FileItem[] };
        if (Array.isArray(wrappedResponse.data)) {
          files = wrappedResponse.data;
        }
      }

      return files;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error fetching files:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ API Error fetching files:', error.message);
      } else {
        console.error('❌ API Error fetching files:', error);
      }
      // Return empty array on error
      console.log('🔄 Returning empty array due to API error');
      return [];
    }
  },

  // Get folder information by ID
  getFolderById: async (userId: string, folderId: string): Promise<Folder | null> => {
    console.log('🌐 API Call: Fetching folder info for user ID:', userId, 'and folder ID:', folderId);
    console.log('🔗 API URL:', `${API_BASE_URL}/Folder/${userId}/${folderId}`);

    try {
      const response = await apiClient.get<Folder>(`/Folder/${userId}/${folderId}`);
      console.log('✅ API Response received for folder info:', response.status);
      console.log('📦 Folder info data:', response.data);

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error fetching folder info:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ API Error fetching folder info:', error.message);
      } else {
        console.error('❌ API Error fetching folder info:', error);
      }

      // Return null on error
      return null;
    }
  },

  // Get file details by user ID, folder ID and file ID
  getFileDetails: async (folderId: string, fileId: string): Promise<FileDetails | null> => {
    // Get the current user ID from localStorage
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    
    if (!userId) {
      console.error('❌ User ID not found. User must be logged in to access file details.');
      return null;
    }

    console.log('🌐 API Call: Fetching file details for user:', userId, 'folder:', folderId, 'file:', fileId);
    console.log('🔗 API URL:', `${API_BASE_URL}/file/${userId}/${folderId}/${fileId}`);
    
    try {
      // Define response type that could be in different formats
      type FileDetailsResponse = 
        | FileDetails
        | { data: FileDetails }
        | { file: FileDetails };

      const response = await apiClient.get<FileDetailsResponse>(`/file/${userId}/${folderId}/${fileId}`);
      let fileDetails: FileDetails | null = null;
      
      // Handle different response formats
      if (response.data) {
        const responseData = response.data;
        
        // Case 1: Direct file details object
        if ('_id' in responseData && 'fileName' in responseData) {
          fileDetails = responseData as FileDetails;
        } 
        // Case 2: Nested data property
        else if ('data' in responseData && responseData.data) {
          fileDetails = responseData.data as FileDetails;
        }
        // Case 3: Nested file property (for backward compatibility)
        else if ('file' in responseData && responseData.file) {
          fileDetails = responseData.file as FileDetails;
        }
      }
      
      if (!fileDetails) {
        console.warn('⚠️ Unexpected response format from file details API');
        return null;
      }
      
      // Log processed details
      console.log('📋 File details processed:', {
        id: fileDetails._id,
        name: fileDetails.fileName,
        type: fileDetails.fileType,
        path: fileDetails.filePath,
        size: fileDetails.fileSize,
        uploadedAt: fileDetails.uploadedAt,
        metadata: fileDetails.metadata,
        tags: fileDetails.tags,
        description: fileDetails.description
      });
      
      // Ensure required fields are present
      if (!fileDetails._id || !fileDetails.fileName || !fileDetails.fileType || !fileDetails.filePath) {
        console.error('❌ Incomplete file details received from API');
        return null;
      }

      return fileDetails;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error fetching file details:', error.message);
        console.log('🔍 Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      } else if (error instanceof Error) {
        console.error('❌ Error fetching file details:', error.message);
      } else {
        console.error('❌ An unknown error occurred while fetching file details');
      }

      // Return null on error
      return null;
    }
  },

  // Create a new folder for a user. If sharing at creation, provide delegates with permissions.
  createFolder: async (
    userId: string,
    folderName: string,
    delegates: Array<{ userId: string; access: string[] }> = []
  ): Promise<Folder | null> => {
    try {
      const payload = {
        folderName,
        folderAccess: delegates.map((d) => ({
          DelegateFolderAuthID: d.userId,
          AccessFolderID: d.access,
        })),
      };

      const response = await apiClient.post<Folder>(`/Folder/${userId}`, payload);

      console.log('✅ Folder created successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error creating folder:', error.message, error.response?.data);
      } else if (error instanceof Error) {
        console.error('❌ API Error creating folder:', error.message);
      } else {
        console.error('❌ API Error creating folder:', error);
      }
      return null;
    }
  },

  // Grant access to an existing folder
  grantFolderAccess: async (
    userId: string,
    folderId: string,
    userIdToGrant: string,
    accessType: string[]
  ): Promise<Folder | null> => {
    try {
      const response = await apiClient.post<{ message: string; folder: Folder }>(`/Folder/${userId}`, {
        folderId,
        userIdToGrant,
        accessType,
      });
      console.log('✅ Access granted:', response.data);
      return response.data.folder || null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ API Error granting access:', error.message, error.response?.data);
      } else if (error instanceof Error) {
        console.error('❌ API Error granting access:', error.message);
      } else {
        console.error('❌ API Error granting access:', error);
      }
      return null;
    }
  },

  // Delete a folder
  deleteFolder: async (userId: string, folderId: string): Promise<boolean> => {
    console.log('🌐 API Call: Deleting folder:', folderId);

    try {
      await apiClient.delete(`/Folder/${userId}/${folderId}`);
      console.log('✅ Folder deleted successfully');
      return true;
    } catch (error: unknown) {
      console.error('❌ API Error deleting folder:', error);
      return false;
    }
  },

  // Update folder name
  updateFolder: async (userId: string, folderId: string, folderName: string): Promise<Folder | null> => {
    console.log('🌐 API Call: Updating folder:', folderId);

    try {
      const response = await apiClient.put<Folder>(`/Folder/${userId}/${folderId}`, {
        folderName
      });

      console.log('✅ Folder updated successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ API Error updating folder:', error);
      return null;
    }
  },

  // Add file to folder
  addFileToFolder: async (userId: string, folderId: string, fileData: FormData) => {
    try {
      console.log('🌐 API Call: Adding file to folder for user ID:', userId, 'and folder ID:', folderId);
      console.log('🔗 API URL:', `${API_BASE_URL}/file/${userId}/${folderId}`);
      
      const response = await apiClient.post(`/file/${userId}/${folderId}`, fileData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log('✅ File uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error adding file to folder:", error.response?.data || error.message);
      throw error;
    }
  }
};

export const familyMemberService = {
  // Get all family members for a user with fallback endpoints
  getFamilyMembers: async (userId: string): Promise<FamilyMember[]> => {
    // Try multiple endpoints in case the backend varies. Only the primary one is known here.
    const endpoints = [`/add/${userId}/Patient`];

    for (const endpoint of endpoints) {
      try {
        const response = await apiClient.get<FamilyMember[] | FamilyMember>(endpoint);
        let familyMembers: FamilyMember[] = [];
        console.log('✅ API Response received for family members:', response.data);
        // Some backends return { patients: [...] }
        const data: any = response.data as any;
        const list: any[] = Array.isArray(data)
          ? data
          : (data && typeof data === 'object' && Array.isArray(data.patients))
            ? data.patients
            : (data ? [data] : []);

        // Flatten entries where _id is an embedded object holding the actual member fields
        familyMembers = list.map((item: any) => {
          if (item && item._id && typeof item._id === 'object') {
            // If the embedded object has the real patient fields, use it directly
            return { ...(item._id as any) } as FamilyMember;
          }
          return item as FamilyMember;
        });
        return familyMembers;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.log(`❌ Endpoint ${endpoint} failed:`, error.response?.status, error.message);
        } else if (error instanceof Error) {
          console.log(`❌ Endpoint ${endpoint} failed:`, error.message);
        } else {
          console.log(`❌ Endpoint ${endpoint} failed:`, error);
        }
        // If there were more endpoints, continue to the next one
        continue;
      }
    }

    console.log('⚠️ No family members found or all endpoints failed');
    return [];
  },

  // Add a new family member for a user
  addFamilyMember: async (userId: string, member: CreateFamilyMemberRequest): Promise<FamilyMember | null> => {
    try {
      console.log('👪 Adding family member for user:', userId);
      const response = await apiClient.post<FamilyMember | { data: FamilyMember }>(`/add/${userId}`, member);
      const data = response.data as any;
      const created = (data && typeof data === 'object' && 'data' in data) ? data.data : data;
      return created || null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Failed to add family member:', error.message, error.response?.data);
      } else if (error instanceof Error) {
        console.error('❌ Failed to add family member:', error.message);
      } else {
        console.error('❌ Failed to add family member:', error);
      }
      return null;
    }
  },

  // Update family member by memberId
  updateFamilyMember: async (memberId: string, updates: Partial<CreateFamilyMemberRequest>): Promise<FamilyMember | null> => {
    try {
      console.log('✏️ Updating family member:', memberId);
      const response = await apiClient.put<FamilyMember | { data: FamilyMember }>(`/add/${memberId}`, updates);
      const data = response.data as any;
      const updated = (data && typeof data === 'object' && 'data' in data) ? data.data : data;
      return updated || null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Failed to update family member:', error.message, error.response?.data);
      } else if (error instanceof Error) {
        console.error('❌ Failed to update family member:', error.message);
      } else {
        console.error('❌ Failed to update family member:', error);
      }
      return null;
    }
  },

  // Delete family member by memberId
  deleteFamilyMember: async (memberId: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deleting family member:', memberId);
      await apiClient.delete(`/add/${memberId}`);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Failed to delete family member:', error.message, error.response?.data);
      } else if (error instanceof Error) {
        console.error('❌ Failed to delete family member:', error.message);
      } else {
        console.error('❌ Failed to delete family member:', error);
      }
      return false;
    }
  },

  // Get specific family member details
  getFamilyMemberDetails: async (userId: string, patientId: string): Promise<FamilyMember | null> => {
    try {
      console.log('🔍 Fetching family member details:', { userId, patientId });
      // First try the direct endpoint provided by backend
      const directResp = await apiClient.get<FamilyMember | FamilyMember[] | { data?: FamilyMember }>(`/add/${userId}/${patientId}`);
      const data: any = directResp.data as any;
      console.log('📦 Raw response data:', directResp.data);

      // If wrapped in { data }
      let member: any = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;

      // If array is returned, try to locate by id
      if (Array.isArray(member)) {
        member = member.find((item: any) => {
          const directId = (typeof item?._id === 'object') ? (item?._id?._id || item?._id?.id) : (item?._id || item?.id);
          const nestedId = item?.patientDetails?.patientInfo?._id || item?.patientDetails?.patientInfo?.id;
          return directId === patientId || nestedId === patientId;
        }) || member[0];
      }

      // Unwrap common nesting
      if (member?.patientDetails?.patientInfo) member = member.patientDetails.patientInfo;
      if (member && typeof member._id === 'object') member = member._id;

      if (member && (member._id || member.id)) {
        return member as FamilyMember;
      }

      // Fallback: fetch full list and search locally (handles older deployments)
      console.warn('⚠️ Direct endpoint did not return a single member. Falling back to list search.');
      const listResponse = await apiClient.get<FamilyMember[] | FamilyMember>(`/add/${userId}/Patient`);
      const raw = listResponse.data as unknown;
      const rawObj: any = raw as any;
      const list: any[] = Array.isArray(rawObj)
        ? rawObj
        : (rawObj && typeof rawObj === 'object' && Array.isArray(rawObj.patients))
          ? rawObj.patients
          : (rawObj ? [rawObj] : []);

      const found = list.find((item: any) => {
        const directId = (typeof item?._id === 'object') ? (item?._id?._id || item?._id?.id) : (item?._id || item?.id);
        const nestedId = item?.patientDetails?.patientInfo?._id || item?.patientDetails?.patientInfo?.id;
        return directId === patientId || nestedId === patientId;
      });

      if (!found) {
        console.warn('⚠️ Family member not found in list for patientId:', patientId);
        return null;
      }

      let fallbackMember: any = found?.patientDetails?.patientInfo ? found.patientDetails.patientInfo : found;
      if (fallbackMember && typeof fallbackMember._id === 'object') fallbackMember = fallbackMember._id;
      return fallbackMember as FamilyMember;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Failed to fetch family member details:', error.message, error.response?.data);
      } else if (error instanceof Error) {
        console.error('❌ Failed to fetch family member details:', error.message);
      } else {
        console.error('❌ Failed to fetch family member details:', error);
      }
      return null;
    }
  },
};

// Payment types and service
export interface CreatePaymentRequest {
  amount: number; // in paise
  currency: 'INR' | string;
  method: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | string;
  relatedType?: 'subscription' | 'appointment' | string;
  relatedId?: string;
}

export interface CreatePaymentResponse {
  success?: boolean;
  orderId?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface ConfirmPaymentRequest {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface PaymentRecord {
  _id?: string;
  amount?: number;
  currency?: string;
  method?: string;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  razorpayOrderId?: string;
  createdAt?: string;
}

export const paymentService = {
  // Create a new payment order
  async createPayment(paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      console.log('🚀 Creating payment order:', paymentData);
      const response = await apiClient.post('/Payment', paymentData);
      console.log('✅ Payment order created:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error creating payment:', error);
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as any)?.error || error.message;
        throw new Error(msg);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create payment order');
    }
  },

  // Confirm payment after Razorpay success
  async confirmPayment(confirmData: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    try {
      console.log('🔐 Confirming payment:', confirmData);
      const response = await apiClient.post('/payment/confirm', confirmData);
      console.log('✅ Payment confirmed:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error confirming payment:', error);
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as any)?.error || error.message;
        throw new Error(msg);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to confirm payment');
    }
  },

  // Create a Razorpay order on backend
  async createOrder(payload: {
    amount: number; // in paise
    currency: string; // e.g., 'INR'
    method?: string; // e.g., 'razorpay'
    receipt?: string;
    notes?: Record<string, unknown>;
    relatedType?: string; // e.g., 'appointment'
    relatedId?: string; // e.g., appointment id
    user?: string; // legacy user field
    userId?: string; // backend expects userId
  }): Promise<{ id: string; amount: number; currency: string; status?: string } & Record<string, unknown>> {
    try {
      const response = await apiClient.post('/Payment', payload);
      return ((response.data as any)?.data ?? response.data) as any;
    } catch (error: unknown) {
      console.error('Error creating payment order:', error);
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as any)?.error || error.message;
        throw new Error(msg);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create payment order');
    }
  },

  // Verify Razorpay payment on backend
  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    appointmentId?: string;
  }): Promise<{ verified?: boolean; success?: boolean } & Record<string, unknown>> {
    try {
      const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
      if (!appointmentId) {
        throw new Error('Missing appointmentId for payment verification');
      }
      const response = await apiClient.put(`/Appointment/verify-payment/${appointmentId}` as const, {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });
      return ((response.data as any)?.data ?? response.data) as any;
    } catch (error: unknown) {
      console.error('Error verifying payment:', error);
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as any)?.error || error.message;
        throw new Error(msg);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to verify payment');
    }
  },

  // Get all payments for the authenticated user
  async getPayments(): Promise<PaymentRecord[]> {
    try {
      console.log('📋 Fetching payment history...');
      const response = await apiClient.get('/payment');
      if ((response.data as any)?.success && Array.isArray((response.data as any)?.data)) {
        console.log('✅ Payment history fetched:', (response.data as any).data.length, 'records');
        return (response.data as any).data as PaymentRecord[];
      }
      console.warn('⚠️ Unexpected payment history response format:', response.data);
      return [];
    } catch (error: unknown) {
      console.error('❌ Error fetching payments:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log('📝 No payment history found');
          return [];
        }
        const msg = (error.response?.data as any)?.error || error.message;
        throw new Error(msg);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch payment history');
    }
  },

  // Helper function to create subscription payment
  async createSubscriptionPayment(subscriptionId: string, amount: number, method: CreatePaymentRequest['method']): Promise<CreatePaymentResponse> {
    return this.createPayment({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      method,
      relatedType: 'subscription',
      relatedId: subscriptionId
    });
  },

  // Helper function to format amount for display
  formatAmount(amountInPaise: number): string {
    return `₹${(amountInPaise / 100).toFixed(2)}`;
  },

  // Helper function to get payment status color
  getPaymentStatusColor(status: PaymentRecord['status']): string {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'cancelled':
        return 'text-gray-600';
      case 'created':
      default:
        return 'text-yellow-600';
    }
  },

  // Helper function to get payment status display text
  getPaymentStatusText(status: PaymentRecord['status']): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'created':
      default:
        return 'Pending';
    }
  }
};

// Helper functions
export const doctorHelpers = {
  // Get full image URL for doctor profile
  getFullImageUrl: (imagePath: string): string => {
    if (!imagePath) return '/images/default-doctor.png';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Clean the path to avoid double slashes and duplicate paths
    let cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Remove any existing API path prefixes to avoid duplication
    cleanPath = cleanPath.replace(/^api\/V0\//, '');
    cleanPath = cleanPath.replace(/^uploads\//, '');

    return `${API_BASE_URL}/uploads/${cleanPath}`;
  },

  // Format doctor qualifications for display
  formatQualifications: (qualifications: DoctorQualification[]): string[] => {
    return qualifications.map(qual => qual.degree);
  },

  // Check if doctor is available now
  isDoctorAvailable: (doctor: Doctor): boolean => {
    return doctor.isAvailableNow && doctor.status === 'Active';
  },

  // Get doctor's primary clinic
  getPrimaryClinic: (doctor: Doctor): DoctorClinic | null => {
    return doctor.clinic && doctor.clinic.length > 0 ? doctor.clinic[0] : null;
  },

  // Format doctor's experience
  formatExperience: (experience: number): string => {
    return `${experience} year${experience !== 1 ? 's' : ''} experience`;
  },

  // Format consultation fee
  formatConsultationFee: (fee: number): string => {
    return `₹${fee}`;
  },

  // Get available time slots for today
  getTodayAvailableSlots: (doctor: Doctor): DoctorAvailabilitySlot[] => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayAvailability = doctor.availability.find(avail => avail.day === today);

    if (!todayAvailability) return [];

    return todayAvailability.slots.filter(slot => slot.bookedCount < slot.appointmentLimit);
  },

  // Format availability schedule for compact display
  formatAvailabilitySchedule: (availability: DoctorAvailability[]): string => {
    if (!availability || availability.length === 0) return 'No availability information';

    const scheduleStrings = availability.map(daySchedule => {
      const slots = daySchedule.slots;
      if (slots.length === 0) return null;

      // Get time range for the day
      const startTime = slots[0].startTime.replace(':00', '');
      const endTime = slots[slots.length - 1].endTime.replace(':00', '');

      return `${daySchedule.day} ${startTime} - ${endTime}`;
    }).filter(Boolean);

    return scheduleStrings.join(', ');
  },

  // Get availability summary for a specific day
  getDayAvailabilitySummary: (daySchedule: DoctorAvailability) => {
    const slots = daySchedule.slots;
    const totalSlots = slots.reduce((sum, slot) => sum + slot.appointmentLimit, 0);
    const bookedSlots = slots.reduce((sum, slot) => sum + slot.bookedCount, 0);
    const availableSlots = totalSlots - bookedSlots;

    const startTime = slots[0]?.startTime.replace(':00', '') || '';
    const endTime = slots[slots.length - 1]?.endTime.replace(':00', '') || '';

    return {
      day: daySchedule.day,
      timeRange: `${startTime} - ${endTime}`,
      totalSlots,
      bookedSlots,
      availableSlots,
      isAvailable: availableSlots > 0,
      slotCount: slots.length
    };
  },
};

// Pill Reminder Helper functions
export const pillReminderHelpers = {
  // Convert API pill reminder to component format
  convertToComponentFormat: (apiReminder: PillReminder) => {

    // Handle medicines array - it can be an array of objects or a single object
    let medicines: ApiMedicine[] = [];
    if (Array.isArray(apiReminder.medicines)) {
      medicines = apiReminder.medicines;
    } else if (apiReminder.medicines && typeof apiReminder.medicines === 'object') {
      medicines = [apiReminder.medicines as ApiMedicine];
    }

    // Get the first medicine for display (components expect single medicine)
    const primaryMedicine = medicines[0] || { medicineName: 'Unknown Medicine', medicineType: 'tablet' };

    // Handle meal timing - convert from API format to component format
    let mealTiming: 'before' | 'after' | 'with' = 'after';
    if (apiReminder.Meal) {
      const mealLower = apiReminder.Meal.toLowerCase();
      if (mealLower.includes('before')) {
        mealTiming = 'before';
      } else if (mealLower.includes('with')) {
        mealTiming = 'with';
      } else {
        mealTiming = 'after'; // Default for "After Food" or other variations
      }
    }

    // Use dosage field if available, otherwise fall back to intake
    const dosageInfo = apiReminder.dosage || apiReminder.intake || '1 dose';

    // Clean up time format - remove AM/PM if present and convert to 24h format
    const cleanedTimes = (apiReminder.Time || []).map(time => {
      if (time.includes('AM') || time.includes('PM')) {
        // Convert 12-hour format to 24-hour format
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);

        if (period === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
          hour24 = 0;
        }

        return `${hour24.toString().padStart(2, '0')}:${minutes || '00'}`;
      }
      return time;
    });

    const isCurrentlyActive = pillReminderHelpers.isReminderActive(apiReminder);

    // Create notifications for each day in the date range
    const notifications = [];
    const startDate = new Date(apiReminder.startDate);
    const endDate = new Date(apiReminder.endDate);

    // Generate a notification for each day between start and end date
    for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dateString = currentDate.toISOString().split('T')[0];

      notifications.push({
        id: `${apiReminder._id}_${dateString}`, // Unique ID for each day
        medicineName: primaryMedicine.medicineName,
        medicineType: primaryMedicine.medicineType.toLowerCase() as 'tablet' | 'capsule' | 'syrup' | 'injection',
        dosage: dosageInfo,
        mealTiming: mealTiming,
        scheduledTimes: cleanedTimes,
        isActive: isCurrentlyActive,
        date: dateString, // Specific date for this notification
        startDate: apiReminder.startDate,
        endDate: apiReminder.endDate,
        allMedicines: medicines,
        // Additional fields from API
        quantity: apiReminder.quantity,
        duration: apiReminder.duration,
        isConfirmed: apiReminder.isConfirmed || false,
      });
    }

    return notifications;
  },

  // Check if reminder is currently active
  isReminderActive: (reminder: PillReminder): boolean => {
    const now = new Date();
    const startDate = new Date(reminder.startDate);
    const endDate = new Date(reminder.endDate);

    return now >= startDate && now <= endDate;
  },

  // Get reminders for today
  getTodayReminders: (reminders: PillReminder[]): PillReminder[] => {
    const today = new Date().toISOString().split('T')[0];

    return reminders.filter(reminder => {
      const startDate = reminder.startDate.split('T')[0];
      const endDate = reminder.endDate.split('T')[0];

      return today >= startDate && today <= endDate;
    });
  },

  // Get upcoming reminders (next 7 days)
  getUpcomingReminders: (reminders: PillReminder[]): PillReminder[] => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return reminders.filter(reminder => {
      const startDate = new Date(reminder.startDate);
      const endDate = new Date(reminder.endDate);

      return (startDate <= nextWeek && endDate >= today);
    });
  },

  // Format medicine type for display
  formatMedicineType: (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'tablet': 'Tablet',
      'capsule': 'Capsule',
      'syrup': 'Syrup',
      'injection': 'Injection',
      'drops': 'Drops',
      'cream': 'Cream',
      'ointment': 'Ointment'
    };

    return typeMap[type.toLowerCase()] || type;
  },

  // Format meal timing for display
  formatMealTiming: (timing: string): string => {
    const timingMap: { [key: string]: string } = {
      'before': 'Before Meal',
      'after': 'After Meal',
      'with': 'With Meal',
      'empty': 'Empty Stomach'
    };

    return timingMap[timing.toLowerCase()] || timing;
  },

  // Format time for display (convert 24h to 12h format)
  formatTime: (time: string): string => {
    try {
      // If time already has AM/PM, return as is
      if (time.includes('AM') || time.includes('PM')) {
        return time;
      }

      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes || '00'} ${ampm}`;
    } catch (error) {
      return time; // Return original if parsing fails
    }
  },

  // Convert 12-hour format to 24-hour format
  convertTo24Hour: (time: string): string => {
    try {
      if (!time.includes('AM') && !time.includes('PM')) {
        return time; // Already in 24-hour format
      }

      const [timePart, period] = time.split(' ');
      const [hours, minutes] = timePart.split(':');
      let hour24 = parseInt(hours);

      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }

      return `${hour24.toString().padStart(2, '0')}:${minutes || '00'}`;
    } catch (error) {
      return time; // Return original if parsing fails
    }
  },

  // Convert UI Medicine model to API PillReminder format
  convertMedicineToApiFormat: (medicine: Medicine, userId: string): Omit<PillReminder, '_id' | 'createdAt' | 'updatedAt'> => {
    // Extract times from timings object
    // Helper to convert 24h time to 'HH:MM AM/PM' or passthrough for period strings
    function toAmPm(time24: string): string {
      if (/^(morning|afternoon|evening|night)$/i.test(time24)) return time24;
      if (/AM|PM/i.test(time24)) return time24;
      const [hourStr, minStr] = time24.split(":");
      let hour = parseInt(hourStr, 10);
      const min = minStr.padStart(2, "0");
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour.toString().padStart(2, "0")}:${min} ${ampm}`;
    }
    const times = Object.values(medicine.timings).map(timing => toAmPm(timing.time));

    // Create API medicine object with proper type casting
    const apiMedicine: ApiMedicine = {
      medicineName: medicine.name,
      medicineType: medicine.type as ApiMedicine['medicineType']
    };

    // Map timing type to proper Meal enum
    const getMealType = (timingType: string, customTiming?: string): PillReminder['Meal'] => {
      if (timingType === 'custom' && customTiming) {
        return customTiming as PillReminder['Meal'];
      }

      switch (timingType) {
        case 'before':
        case 'beforeFood':
          return 'Before Food';
        case 'after':
        case 'afterFood':
          return 'After Food';
        case 'bedtime':
        case 'withBedtime':
          return 'With Bedtime';
        default:
          return 'After Food'; // Default fallback
      }
    };

    // Map duration unit to proper enum
    const getDurationUnit = (unit: string): PillReminder['duration']['unit'] => {
      switch (unit.toLowerCase()) {
        case 'day':
        case 'days':
          return 'days';
        case 'week':
        case 'weeks':
          return 'weeks';
        case 'month':
        case 'months':
          return 'months';
        case 'sos':
          return 'sos';
        case 'weekbased':
          return 'weekbased';
        case 'alternative':
          return 'alternative';
        case 'onemonthonetime':
          return 'onemonthonetime';
        case 'weekwise':
          return 'weekwise';
        default:
          return 'days'; // Default fallback
      }
    };

    return {
      medicines: [apiMedicine], // Always send as array for consistency
      dosage: `${medicine.dose.value} ${medicine.dose.unit}`,
      intake: `${medicine.dose.value} ${medicine.dose.unit}`,
      Time: times,
      Meal: getMealType(medicine.timingType, medicine.customTiming),
      startDate: medicine.duration.startDate,
      endDate: medicine.duration.endDate,
      userId: userId,
      mobileNumber: ['+1234567890'], // Default mobile number - should be passed from user data
      duration: {
        value: parseInt(medicine.duration.value) || 1,
        unit: getDurationUnit(medicine.duration.unit)
      }
    };
  },

  // Convert multiple medicines to API format (for bulk add)
  convertMultipleMedicinesToApiFormat: (medicines: Medicine[], userId: string): Omit<PillReminder, '_id' | 'createdAt' | 'updatedAt'>[] => {
    return medicines.map(medicine => pillReminderHelpers.convertMedicineToApiFormat(medicine, userId));
  },

  // Create a new Medicine object with default values
  createDefaultMedicine: (): Medicine => {
    const id = `medicine_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return {
      id,
      type: 'Tablet', // Use proper enum value matching schema
      name: '',
      dose: {
        value: '1',
        unit: 'tablet'
      },
      timings: {
        morning: {
          intake: '1',
          time: '08:00'
        }
      },
      timingType: 'after',
      customTiming: '',
      appearance: 'round',
      notes: '',
      duration: {
        value: '7',
        unit: 'days',
        startDate: today,
        endDate: nextWeek.toISOString().split('T')[0]
      }
    };
  },

  // Validate medicine data before API submission
  validateMedicine: (medicine: Medicine): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!medicine.name.trim()) {
      errors.push('Medicine name is required');
    }

    if (!medicine.dose.value || parseFloat(medicine.dose.value) <= 0) {
      errors.push('Valid dose value is required');
    }

    if (Object.keys(medicine.timings).length === 0) {
      errors.push('At least one timing is required');
    }

    if (!medicine.duration.startDate) {
      errors.push('Start date is required');
    }

    if (!medicine.duration.endDate) {
      errors.push('End date is required');
    }

    if (medicine.duration.startDate && medicine.duration.endDate) {
      const startDate = new Date(medicine.duration.startDate);
      const endDate = new Date(medicine.duration.endDate);
      if (endDate <= startDate) {
        errors.push('End date must be after start date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },
};

// Types for appointment service
export interface AppointmentSlot {
  from: string;
  to: string;
}

export interface BookAppointmentPayload {
  user: string; // User ObjectId
  doctor: string; // Doctor ObjectId  
  clinic: string; // Clinic ObjectId
  appointmentDate: string; // ISO date string
  timeSlot: {
    from: string; // e.g., "10:00 AM"
    to: string;   // e.g., "10:30 AM"
  };
  mode?: string; // 'InPerson' | 'VideoCall' | 'working'
  consultationFee?: number;
  purpose?: string;
  symptoms?: string[];
  notes?: string;
  // Legacy fields for backward compatibility
  date?: string;
  slot?: {
    from: string;
    to: string;
  };
}

// Appointment data structure from API
export interface Appointment {
  _id: string;
  doctor: {
    _id: string;
    fullName: string;
    specializations: string[];
    profileImage?: string;
  };
  clinic: {
    _id: string;
    clinicName: string;
    clinicAddress?: string;
  };
  patient: {
    _id: string;
    FullName: string;
  };
  appointmentDate: string;
  appointmentTime: {
    from: string;
    to: string;
  };
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  consultationFee?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert time (HH:MM) to minutes for overlap checks
const convertTimeToMinutes = (time: string) => {
  if (!time) return 0;
  const parts = String(time).split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const h = isNaN(hours) ? 0 : hours;
  const m = isNaN(minutes) ? 0 : minutes;
  return h * 60 + m;
};

// Appointment API Services
export const appointmentService = {
  // Book an appointment
  bookAppointment: async (payload: BookAppointmentPayload): Promise<any> => {
    try {
      // Build request body to match backend schema used in Postman, allowing extra fields via safe casts
      const p: any = payload as any;
      const requestBody: any = {
        user: payload.user,
        doctor: payload.doctor,
        clinic: payload.clinic,
        appointmentDate: payload.appointmentDate,
        timeSlot: payload.timeSlot,
        mode: p.mode || 'InPerson',
        status: p.status || 'Scheduled',
        consultationFee: payload.consultationFee ?? 0,
        purpose: payload.purpose,
        symptoms: payload.symptoms ?? [],
        notes: payload.notes,
        paymentMethod: p.paymentMethod,
        payment: {
          amount: p.payment?.amount ?? payload.consultationFee ?? 0,
          isPaid: p.payment?.isPaid ?? false,
          method: p.payment?.method ?? p.paymentMethod ?? 'Cash',
          status: p.payment?.status ?? 'pending',
        },
        isFollowUp: p.isFollowUp ?? false,
        createdBy: p.createdBy ?? payload.user,
        userName: p.userName,
        doctorName: p.doctorName,
        isRescheduled: p.isRescheduled ?? false,
        isDeleted: p.isDeleted ?? false,
      };
      // Debug: log the exact appointment payload being sent
      console.log('Appointment booking payload:', requestBody);
      const response = await apiClient.post(`/Appointment/${payload.user}`, requestBody);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Appointment booking failed:', error);

      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const apiError = error.response as any;
        console.error('📋 API Error Details:', {
          status: apiError.status,
          statusText: apiError.statusText,
          data: apiError.data,
          url: apiError.config?.url,
          method: apiError.config?.method
        });
        throw apiError.data || error;
      }
      throw error;
    }
  },
  // Get appointments by user ID
  getAppointmentsByUserId: async (userId: string): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/Appointment/user/${userId}`);
      const raw = response.data as any;
      // Local normalizer to guarantee shape expected by Home page
      const normalizeAppointment = (a: any): Appointment => {
        const id = String(a?._id || a?.id || a?.appointmentId || '');
        const appointmentDate: string = String(a?.appointmentDate || a?.date || a?.scheduledAt || '');
        const from: string = String(
          a?.appointmentTime?.from || a?.timeSlot?.from || a?.time?.from || a?.slot?.from || ''
        );
        const to: string = String(
          a?.appointmentTime?.to || a?.timeSlot?.to || a?.time?.to || a?.slot?.to || ''
        );
        const docRaw = (typeof a?.doctor === 'object' && a?.doctor) ? a?.doctor : {};
        const doctor = {
          fullName: String(docRaw?.fullName || a?.doctorName || 'Doctor'),
          specializations: docRaw?.specializations || [],
          profileImage: String(docRaw?.profileImage || '')
        } as any;
        const clinicRaw = (typeof a?.clinic === 'object' && a?.clinic) ? a?.clinic : {};
        const clinic = {
          _id: String(clinicRaw?._id || a?.clinic || ''),
          clinicName: String(clinicRaw?.clinicName || clinicRaw?.name || a?.clinicName || 'Clinic'),
          clinicAddress: String(clinicRaw?.clinicAddress || clinicRaw?.addressLine || '')
        } as any;
        const status = String(a?.status || 'Scheduled');
        return {
          _id: id,
          appointmentDate,
          appointmentTime: { from, to } as any,
          doctor,
          clinic,
          status
        } as unknown as Appointment;
      };
      // Normalize various possible response shapes to an array
      if (Array.isArray(raw)) return (raw as any[]).map(normalizeAppointment) as Appointment[];
      if (raw?.data) {
        if (Array.isArray(raw.data)) return (raw.data as any[]).map(normalizeAppointment) as Appointment[];
        if (Array.isArray(raw.data.appointments)) return (raw.data.appointments as any[]).map(normalizeAppointment) as Appointment[];
      }
      if (Array.isArray(raw?.appointments)) return (raw.appointments as any[]).map(normalizeAppointment) as Appointment[];
      if (raw && typeof raw === 'object') return [normalizeAppointment(raw) as Appointment];
      return [] as Appointment[];
    } catch (error: unknown) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get available slots for a specific doctor, clinic and date
  getAvailableSlotsForDate: async (doctorId: string, clinicId: string, date: string): Promise<any[]> => {
    try {
      // Format as YYYY-MM-DD using local date components (avoid timezone drift)
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      // Using lowercase 'staff' to match other endpoints like `/staff/c/:clinicId`
      const response = await apiClient.get(`/staff/${doctorId}/${clinicId}/available-slots/${formattedDate}`);
      console.log("response.data", response.data)
      if ((response.data as any)?.success && (response.data as any)?.data?.slots) {
        return (response.data as any).data.slots as any[];
      }      // some deployments may return slots array directly
      if (Array.isArray(response.data)) return response.data as any[];
      return [];
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Status code:', error.response?.status);
      try {
        const dateObj = new Date(date);
        console.error('Date sent to backend:', date);
        console.error('Expected day of week:', dateObj.toLocaleDateString('en-US', { weekday: 'long' }));
      } catch {}
      return [];
    }
  },

  // Check if a user already has a booking conflicting with the provided slot
  checkUserBookingForSlot: async (
    userId: string,
    doctorId: string,
    clinicId: string,
    date: string,
    timeSlot: { from: string; to: string }
  ): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/Appointment/${userId}`);
      console.log("response.data", response.data)

      const appointments = (response.data as any)?.appointments || (response.data as any)?.data || response.data || [];
      if (!Array.isArray(appointments)) return false;

      const hasConflict = appointments.some((appointment: any) => {
        // Skip cancelled and no-show appointments (case-insensitive)
        if (appointment.status?.toLowerCase() === 'cancelled' || appointment.status?.toLowerCase() === 'no-show') {
          return false;
        }

        // Check if it's the same date (normalize to YYYY-MM-DD in local time)
        const appointmentDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
        const requestedDate = new Date(date).toISOString().split('T')[0];
        if (appointmentDate !== requestedDate) return false;

        // Check doctor and clinic match (id or nested object)
        const sameDoctor = String(appointment.doctor) === String(doctorId) || String(appointment.doctor?._id) === String(doctorId);
        const sameClinic = String(appointment.clinic) === String(clinicId) || String(appointment.clinic?._id) === String(clinicId);
        if (!sameDoctor || !sameClinic) return false;

        // Compare time slots for overlap
        const existingFrom = appointment.timeSlot?.from || appointment.appointmentTime?.from;
        const existingTo = appointment.timeSlot?.to || appointment.appointmentTime?.to;
        if (!existingFrom || !existingTo) return false;

        const requestedFromMinutes = convertTimeToMinutes(timeSlot.from);
        const requestedToMinutes = convertTimeToMinutes(timeSlot.to);
        const existingFromMinutes = convertTimeToMinutes(existingFrom);
        const existingToMinutes = convertTimeToMinutes(existingTo);
        return requestedFromMinutes < existingToMinutes && requestedToMinutes > existingFromMinutes;
      });
      return hasConflict;
    } catch (error: any) {
      console.error('Error checking user booking for slot:', error);
      return false;
    }
  },

  // Get monthly available dates for a doctor and clinic
  getMonthlySlots: async (doctorId: string, clinicId: string, month: number, year: number): Promise<string[]> => {
    try {
      const response = await apiClient.get(`/staff/generate-monthly-slots/${doctorId}/${clinicId}`, {
        params: { month, year }
      });
      console.log("response.data", response.data)
      if ((response.data as any)?.success && (response.data as any)?.data?.availableDates) {
        return (response.data as any).data.availableDates as string[];
      }
      // some deployments may return the array directly
      if (Array.isArray((response.data as any)?.availableDates)) return (response.data as any).availableDates as string[];
      if (Array.isArray(response.data)) return response.data as string[];
      return [];
    } catch (error: any) {
      console.error('Error fetching monthly slots:', error);
      return [];
    }
  }

}

export const userSubscriptionService = {
  getActiveSubscription: async (userId: string): Promise<unknown | null> => {
    try {
      const response = await apiClient.get(`/UserSubscription/${userId}`);
      console.log("response.data", response.data)
      const raw = response.data as unknown;
      if (raw && typeof raw === 'object' && (raw as any).data !== undefined) {
        return (raw as any).data as unknown;
      }
      if (raw && typeof raw === 'object' && (raw as any).subscription !== undefined) {
        return (raw as any).subscription as unknown;
      }
      return raw ?? null;
    } catch (error: unknown) {
      console.error('Error fetching active subscription:', error);
      return null;
    }
  },
  // Prefer this new endpoint which explicitly reports availability
  checkAvailability: async (
    userId: string
  ): Promise<{ hasActiveSubscription: boolean; subscriptionDetails?: any } | null> => {
    try {
      const res = await apiClient.get(`/UserSubscription/check-availability/${userId}`);
      const data = res.data as any;
      // Normalize a few common shapes
      if (data && typeof data === 'object') {
        if (typeof data.hasActiveSubscription === 'boolean') {
          return {
            hasActiveSubscription: data.hasActiveSubscription,
            subscriptionDetails: data.subscriptionDetails || data.details || data.subscription,
          };
        }
        if ('data' in data && typeof (data as any).data === 'object') {
          const d = (data as any).data;
          return {
            hasActiveSubscription: Boolean(d.hasActiveSubscription),
            subscriptionDetails: d.subscriptionDetails || d.details || d.subscription,
          };
        }
      }
      // Fallback
      return {
        hasActiveSubscription: false,
      };
    } catch (error: any) {
      console.error('Error checking subscription availability:', error?.response?.data || error?.message || error);
      return null;
    }
  },

  // Record subscription service usage when an appointment is covered
  useService: async (payload: any): Promise<any> => {
    try {
      console.log('🔄 Recording subscription usage:', payload);
      const requestBody = {
        userId: payload.userId,
        service: payload.service || 'appointment',
        appointmentId: payload.appointmentId,
        action: payload.action || 'use',
        count: payload.count || 1,
        timestamp: new Date().toISOString()
      };
      const res = await apiClient.post(`/UserSubscription/use-service`, requestBody);
      console.log('✅ Subscription usage recorded successfully:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Error recording subscription service usage:', error?.response?.data || error?.message || error);
      // Don't throw error to prevent blocking appointment booking
      return null;
    }
  },
}

export const subscriptionservices = {

  getallsubscription: async (): Promise<any> => {

    try {
      const response = await apiClient.get(`/Subscription/all`)
      console.log("response.data", response.data)
      console.log("response.data", response.data)
      return response.data
    }
    catch (error: unknown) {
      console.error("fetching error getallsubscription", error)
    }
  }
}