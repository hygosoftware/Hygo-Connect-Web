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
}

// Types for Doctor API response
export interface DoctorQualification {
  _id: string;
  degree: string;
  institution: string;
  year: number;
  certificates: string[];
}

export interface DoctorAvailabilitySlot {
  _id: string;
  startTime: string;
  endTime: string;
  appointmentLimit: number;
  bookedCount: number;
}

export interface DoctorAvailability {
  _id: string;
  clinic: string;
  day: string;
  slots: DoctorAvailabilitySlot[];
}

export interface DoctorClinic {
  _id: string;
  clinicName: string;
  clinicAddress?: {
    location?: {
      type: string;
      coordinates: number[];
    };
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  clinicPhone?: string;
  clinicEmail?: string;
  clinicImage?: string | null;
  clinicStatus?: string;
  clinicType?: string;
  clinicDescription?: string;
  Department?: Array<{
    _id: string;
    departmentName: string;
  }>;
  OPD?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorDepartment {
  _id: string;
  departmentName: string;
}

export interface Doctor {
  _id: string;
  fullName: string;
  gender: string;
  staffID: string;
  email: string;
  phone: string;
  profileImage: string;
  isSpecialized: boolean;
  specializations: string[];
  qualifications: DoctorQualification[];
  experience: number;
  languagesSpoken: string[];
  bio: string;
  consultationFee: number;
  availability: DoctorAvailability[];
  scheduleType: string;
  isAvailableNow: boolean;
  status: string;
  staffRole: string;
  department: DoctorDepartment[];
  clinic: DoctorClinic[];
  HomeService: {
    offered: string;
    fee: number;
  };
  ratings: {
    average: number;
    count: number;
  };
}

export interface DoctorsApiResponse {
  success: boolean;
  message: string;
  data: Doctor[];
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hygo-backend.onrender.com/api/V0';

// Create axios instance
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
    // Get token from TokenManager
    const { accessToken } = TokenManager.getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log the request for debugging
    console.log('🔐 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!accessToken,
      headers: config.headers
    });

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
  MobileNumber?: string;
  AlternativeNumber?: string;
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
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);

      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      return null;
    }
  },

  // Update user profile
  updateProfile: async (userId: string, profileData: UpdateProfileRequest): Promise<ProfileData | null> => {
    console.log('🌐 API Call: Updating profile for user ID:', userId);
    console.log('🔗 API URL:', `${API_BASE_URL}/${userId}`);
    console.log('📊 Update data:', profileData);

    try {
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
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);

      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      throw error; // Re-throw to allow caller to handle
    }
  },
};

// API Services
export const doctorService = {
  // Fetch all doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    console.log('🌐 API Call: Fetching all doctors');
    console.log('🔗 API URL:', `${API_BASE_URL}/Staff/d`);

    try {
      const response = await apiClient.get<Doctor[]>('/Staff/d');
      console.log('✅ API Response received for all doctors:', response.status);
      console.log('📦 Number of doctors received:', response.data?.length || 0);
      console.log('📋 First doctor sample:', response.data?.[0]);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Error fetching all doctors:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Return empty array on error
      console.log('🔄 Returning empty array due to API error');
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
    } catch (error: any) {
      console.error('❌ API Error fetching doctor:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });



      throw new Error('Failed to fetch doctor details. Please try again later.');
    }
  },

  // Search doctors by name or specialization
  searchDoctors: async (query: string): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get<Doctor[]>(`/Staff/d?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error searching doctors:', error);

      return [];
    }
  },

  // Filter doctors by specialization
  getDoctorsBySpecialization: async (specialization: string): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get<Doctor[]>(`/Staff/d?specialization=${encodeURIComponent(specialization)}`);
      return response.data;
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('❌ API Error fetching all clinics:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      // Return empty array on error
      console.log('🔄 Returning empty array due to API error');
      return [];
    }
  },

  // Fetch clinics by doctor ID
  getClinicsByDoctor: async (doctorId: string): Promise<any[]> => {
    console.log('🌐 API Call: Fetching clinics by doctor ID', doctorId);
    console.log('🔗 API URL:', `${API_BASE_URL}/Clinic/doctor/${doctorId}`);
    try {
      const response = await apiClient.get<{ status: string; message: string; data: any[] }>(`/Clinic/doctor/${doctorId}`);
      console.log('✅ API Response received for clinics by doctor:', response.status);
      return response.data.data || [];
    } catch (error: any) {
      console.error('❌ API Error fetching clinics by doctor:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      // Return empty array on error
      console.log('🔄 Returning empty array due to API error');
      return [];
    }
  },

  getdoctorbyclinicid: async (clinicId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/staff/c/${clinicId}`);
      return response.data;
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('API Error fetching pill reminders:', error);
      return [];
    }
  },

  createPillReminder: async (userIdOrPillReminder: string | Omit<PillReminder, '_id' | 'createdAt' | 'updatedAt'>, notificationData?: any): Promise<PillReminder | null> => {
    try {
      // Handle both old and new calling patterns
      let userId: string;
      let data: any;
      
      if (typeof userIdOrPillReminder === 'string') {
        // New pattern: createPillReminder(userId, notificationData)
        userId = userIdOrPillReminder;
        data = notificationData;
      } else {
        // Old pattern: createPillReminder(pillReminderObject)
        userId = userIdOrPillReminder.userId;
        data = userIdOrPillReminder;
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
      formData.append("dosage", data.dosage)
      formData.append("intake", data.intake)
      formData.append("startDate", data.startDate)
      formData.append("duration", JSON.stringify(data.duration))

      console.log("Converted to FormData format (matching curl)")

      const response = await apiClient.post(`${API_BASE_URL}/Pillreminder/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log("Success Response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("=== ADD NOTIFICATION ERROR DEBUG ===")
      console.error("Full error object:", error)
      console.error("Error message:", error.message)
      console.error("Error response:", error.response)
      console.error("Error response data:", error.response?.data)
      console.error("Error response status:", error.response?.status)
      console.error("Error request:", error.request)
      console.error("Error config:", error.config)

      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred"
      console.error("Final error message:", errorMessage)
      throw new Error(errorMessage)
    }
  },

  // Create multiple pill reminders (for adding multiple medicines)
  createMultiplePillReminders: async (pillReminders: Omit<PillReminder, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<PillReminder[]> => {
    console.log(' API Call: Creating multiple pill reminders');
    console.log(' Number of reminders to create:', pillReminders.length);

    try {
      const promises = pillReminders.map(reminder =>
        pillReminderService.createPillReminder(reminder)
      );

      const results = await Promise.all(promises);
      const successfulReminders = results.filter(result => result !== null) as PillReminder[];

      console.log('✅ Successfully created reminders:', successfulReminders.length);
      console.log('❌ Failed to create reminders:', results.length - successfulReminders.length);

      return successfulReminders;
    } catch (error: any) {
      console.error('❌ API Error creating multiple pill reminders:', error);
      return [];
    }
  },

  // Add medicines (convert UI model to API format and create reminders)
  addMedicines: async (medicines: Medicine[], userId: string): Promise<{ success: boolean; created: PillReminder[]; errors: string[] }> => {
    console.log(' Adding medicines for user:', userId);
    console.log(' Medicines to add:', medicines);

    const errors: string[] = [];
    const validMedicines: Medicine[] = [];

    // Validate each medicine
    medicines.forEach((medicine, index) => {
      const validation = pillReminderHelpers.validateMedicine(medicine);
      if (validation.isValid) {
        validMedicines.push(medicine);
      } else {
        errors.push(`Medicine ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    if (validMedicines.length === 0) {
      return { success: false, created: [], errors: ['No valid medicines to add'] };
    }

    try {
      // Convert to API format
      const apiReminders = pillReminderHelpers.convertMultipleMedicinesToApiFormat(validMedicines, userId);

      // Create reminders
      const createdReminders = await pillReminderService.createMultiplePillReminders(apiReminders);

      const success = createdReminders.length > 0;
      if (createdReminders.length < validMedicines.length) {
        errors.push(`Only ${createdReminders.length} out of ${validMedicines.length} medicines were added successfully`);
      }

      return { success, created: createdReminders, errors };
    } catch (error: any) {
      console.error(' Error adding medicines:', error);
      return { success: false, created: [], errors: ['Failed to add medicines'] };
    }
  },

  // Update a pill reminder
  updatePillReminder: async (reminderId: string, updates: Partial<PillReminder>): Promise<PillReminder | null> => {
    console.log('💊 API Call: Updating pill reminder:', reminderId);

    try {
      const response = await apiClient.put<PillReminder>(`/pill reminder/${reminderId}`, updates);
      console.log('✅ Pill reminder updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Error updating pill reminder:', error);
      return null;
    }
  },

  // Delete a pill reminder
  deletePillReminder: async (reminderId: string): Promise<boolean> => {
    console.log('💊 API Call: Deleting pill reminder:', reminderId);

    try {
      await apiClient.delete(`/pill reminder/${reminderId}`);
      console.log('✅ Pill reminder deleted successfully');
      return true;
    } catch (error: any) {
      console.error('❌ API Error deleting pill reminder:', error);
      return false;
    }
  },
};

// API Response structure (what we actually receive)
export interface FamilyMemberApiResponse {
  patients: Array<{
    _id: {
      _id: string;
      FullName: string;
      UserID: string;
      UserType: "User";
      profilePhoto?: string;
      Email?: string;
      MobileNumber?: Array<{
        number: string;
        isVerified: boolean;
        _id?: string;
      }>;
      Gender?: "Male" | "Female" | "Others";
      Age?: number;
      DateOfBirth?: string | Date;
      Country?: string;
      State?: string;
      City?: string;
      Height?: number;
      Weight?: number;
      BloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
      ChronicDiseases?: string[];
      Allergies?: string[];
      createdAt?: string;
      updatedAt?: string;
    };
    accessAccount: ("Insert" | "Update" | "Delete" | "View")[];
  }>;
}

// Flattened Family Member interface (for easier use in UI)
export interface FamilyMember {
  _id: string;
  profilePhoto?: string;
  FullName: string;
  Email?: string;
  UserID?: string;
  UserType: "User";
  MobileNumber?: Array<{
    number: string;
    isVerified: boolean;
    _id?: string;
  }>;
  Gender?: "Male" | "Female" | "Others";
  Age?: number;
  DateOfBirth?: string | Date;
  Country?: string;
  State?: string;
  City?: string;
  Height?: number;
  Weight?: number;
  BloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  ChronicDiseases?: string[];
  Allergies?: string[];
  accessAccount?: ("Insert" | "Update" | "Delete" | "View")[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface for creating new family member (UI model)
export interface CreateFamilyMemberRequest {
  FullName: string;
  Email?: string;
  MobileNumber: Array<{
    number: string;
    isVerified?: boolean;
  }>;
  Gender?: "Male" | "Female" | "Others";
  Age?: number;
  DateOfBirth?: string;
  Country?: string;
  State?: string;
  City?: string;
  AlternativeNumber?: string;
  Height?: number;
  Weight?: number;
  BloodGroup?: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";
  ChronicDiseases?: string[];
  Allergies?: string[];
}

// Folder-related interfaces based on actual API response
export interface FolderAccess {
  _id: string;
  AccessFolderID: string[];
  DelegateFolderAuthID: string;
}

export interface FileItem {
  _id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
  fileAccess: any[];
}

export interface FileDetails {
  _id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: string;
  updatedAt?: string;
  fileAccess: any[];
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;
    pages?: number;
    [key: string]: any;
  };
  tags?: string[];
  description?: string;
  uploadedBy?: string;
  folderId: string;
}

export interface Folder {
  _id: string;
  folderName: string;
  folderAccess: FolderAccess[];
  files: FileItem[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  fileCount?: number;
  lastModified?: string;
}

export interface FoldersApiResponse {
  success: boolean;
  message: string;
  data: Folder[];
}

// Folder API Services
export const folderService = {
  // Get all folders for a user
  getFoldersByUserId: async (userId: string): Promise<Folder[]> => {
    console.log('🌐 API Call: Fetching folders for user ID:', userId);
    console.log('🔗 API URL:', `${API_BASE_URL}/Folder/${userId}`);

    try {
      const response = await apiClient.get<Folder[] | FoldersApiResponse>(`/Folder/${userId}`);
      console.log('✅ API Response received for folders:', response.status);
      console.log('📦 Raw response data:', response.data);
      console.log('📊 Response data type:', typeof response.data);
      console.log('📊 Is response data an array?', Array.isArray(response.data));

      // Handle different response formats
      let folders: Folder[] = [];

      if (Array.isArray(response.data)) {
        console.log('🔄 Processing direct array response');
        folders = response.data;
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        console.log('🔄 Processing wrapped response format with "data" property');
        // Handle wrapped response format
        const wrappedResponse = response.data as FoldersApiResponse;
        console.log('📊 Wrapped response success:', wrappedResponse.success);
        console.log('📊 Wrapped response message:', wrappedResponse.message);
        if (wrappedResponse.success && Array.isArray(wrappedResponse.data)) {
          folders = wrappedResponse.data;
        }
      } else if (response.data && typeof response.data === 'object' && 'folders' in response.data) {
        console.log('🔄 Processing response with "folders" property');
        // Handle response format: { folders: [...] }
        const foldersResponse = response.data as { folders: Folder[] };
        console.log('📊 Folders array length:', foldersResponse.folders?.length);
        if (Array.isArray(foldersResponse.folders)) {
          folders = foldersResponse.folders;
        }
      } else {
        console.log('⚠️ Unexpected response format:', response.data);
      }

      console.log('📋 Number of folders processed:', folders.length);
      console.log('📋 Folders data structure:');
      folders.forEach((folder, index) => {
        // Calculate file count from files array
        const fileCount = folder.files ? folder.files.length : 0;

        // Extract access information
        const accessInfo = folder.folderAccess?.map(access => ({
          delegateId: access.DelegateFolderAuthID,
          permissions: access.AccessFolderID
        })) || [];

        console.log(`📁 Folder ${index + 1}:`, {
          id: folder._id,
          name: folder.folderName,
          fileCount: fileCount,
          filesData: folder.files,
          accessInfo: accessInfo,
          rawAccess: folder.folderAccess
        });
      });

      // Add file count to each folder for easier access
      const foldersWithFileCount = folders.map(folder => ({
        ...folder,
        fileCount: folder.files ? folder.files.length : 0,
        lastModified: folder.files && folder.files.length > 0
          ? new Date(Math.max(...folder.files.map(file => new Date(file.uploadedAt).getTime()))).toISOString()
          : folder.updatedAt || folder.createdAt || new Date().toISOString()
      }));

      if (foldersWithFileCount.length > 0) {
        console.log('📋 First folder with enhanced data:', foldersWithFileCount[0]);
      }

      return foldersWithFileCount;
    } catch (error: any) {
      console.error('❌ API Error fetching folders:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

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
      console.log('📊 Response data type:', typeof response.data);
      console.log('📊 Is response data an array?', Array.isArray(response.data));

      // Handle different response formats
      let files: FileItem[] = [];

      if (Array.isArray(response.data)) {
        console.log('🔄 Processing direct array response');
        files = response.data;
      } else if (response.data && typeof response.data === 'object' && 'files' in response.data) {
        console.log('🔄 Processing response with "files" property');
        const filesResponse = response.data as { files: FileItem[] };
        console.log('📊 Files array length:', filesResponse.files?.length);
        if (Array.isArray(filesResponse.files)) {
          files = filesResponse.files;
        }
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        console.log('🔄 Processing wrapped response format with "data" property');
        const wrappedResponse = response.data as { data: FileItem[] };
        console.log('📊 Data array length:', wrappedResponse.data?.length);
        if (Array.isArray(wrappedResponse.data)) {
          files = wrappedResponse.data;
        }
      } else {
        console.log('⚠️ Unexpected response format:', response.data);
      }

      console.log('📋 Number of files processed:', files.length);
      console.log('📋 Files data structure:');
      files.forEach((file, index) => {
        console.log(`📄 File ${index + 1}:`, {
          id: file._id,
          name: file.fileName,
          type: file.fileType,
          path: file.filePath,
          uploadedAt: file.uploadedAt,
          access: file.fileAccess
        });
      });

      return files;
    } catch (error: any) {
      console.error('❌ API Error fetching files:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

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
    } catch (error: any) {
      console.error('❌ API Error fetching folder info:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Return null on error
      return null;
    }
  },

  // Get file details by folder ID and file ID
  getFileDetails: async (folderId: string, fileId: string): Promise<FileDetails | null> => {
    console.log('🌐 API Call: Fetching file details for folder ID:', folderId, 'and file ID:', fileId);
    console.log('🔗 API URL:', `${API_BASE_URL}/File/${folderId}/${fileId}`);

    try {
      const response = await apiClient.get<FileDetails | { file: FileDetails } | { data: FileDetails }>(`/File/${folderId}/${fileId}`);
      console.log('✅ API Response received for file details:', response.status);
      console.log('📦 Raw response data:', response.data);
      console.log('📊 Response data type:', typeof response.data);

      // Handle different response formats
      let fileDetails: FileDetails | null = null;

      if (response.data && typeof response.data === 'object') {
        if ('file' in response.data) {
          console.log('🔄 Processing response with "file" property');
          const fileResponse = response.data as { file: FileDetails };
          fileDetails = fileResponse.file;
        } else if ('data' in response.data) {
          console.log('🔄 Processing wrapped response format with "data" property');
          const wrappedResponse = response.data as { data: FileDetails };
          fileDetails = wrappedResponse.data;
        } else if ('_id' in response.data) {
          console.log('🔄 Processing direct file object response');
          fileDetails = response.data as FileDetails;
        } else {
          console.log('⚠️ Unexpected response format:', response.data);
        }
      }

      if (fileDetails) {
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
      }

      return fileDetails;
    } catch (error: any) {
      console.error('❌ API Error fetching file details:', error);
      console.log('🔍 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Return null on error
      return null;
    }
  },

  // Create a new folder for a user
  createFolder: async (userId: string, folderName: string): Promise<Folder | null> => {
    console.log('🌐 API Call: Creating folder for user ID:', userId);
    console.log('📁 Folder name:', folderName);

    try {
      const response = await apiClient.post<Folder>(`/Folder/${userId}`, {
        folderName,
        folderAccess: [userId] // Default access to the user who created it
      });

      console.log('✅ Folder created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Error creating folder:', error);
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('❌ API Error updating folder:', error);
      return null;
    }
  }
};

export const familyMemberService = {
  // Get all family members for a user with fallback endpoints
  getFamilyMembers: async (userId: string): Promise<FamilyMember[]> => {


    // Try multiple endpoints in case the schema structure is different
    const endpoints = [
      `/add/${userId}/Patient`,
      `/users/${userId}/family`,
      `/family/${userId}`,
      `/User/${userId}` // In case it's a single user endpoint
    ];

    for (const endpoint of endpoints) {
      try {
        console.log('🔗 Trying endpoint:', `${API_BASE_URL}/add/${userId}/Patient`);

        const response = await apiClient.get<FamilyMember[] | FamilyMember>(endpoint);
        console.log('✅ Response received from:', endpoint);
        console.log('📊 Response data type:', typeof response.data);
        console.log('� Response data:', response.data);

        // Handle both array and single object responses
        let familyMembers: FamilyMember[] = [];

        if (Array.isArray(response.data)) {
          familyMembers = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If it's a single user object, wrap it in an array
          familyMembers = [response.data as FamilyMember];
        }

        console.log('📊 Number of family members:', familyMembers.length);

        // Log first member structure for debugging
        if (familyMembers.length > 0) {
          console.log('📋 First member structure:', JSON.stringify(familyMembers[0], null, 2));
        }

        return familyMembers;

      } catch (error: any) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error.response?.status, error.message);

        // If this is the last endpoint and it's a 500 error, log detailed info
        if (endpoint === endpoints[endpoints.length - 1]) {
          console.error('❌ All endpoints failed. Last error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data,
            message: error.message,
            code: error.code
          });

          // Handle specific error cases
          if (error.response?.status === 500) {
            console.error('🚨 Server Error (500): Backend schema or database query issue');
            console.error('💡 Possible causes:');
            console.error('   - DelegateAuthID field population issue');
            console.error('   - Missing required fields in database');
            console.error('   - Schema validation errors');
            console.error('   - Database connection issues');
          }
        }

        // Continue to next endpoint unless it's the last one
        if (endpoint !== endpoints[endpoints.length - 1]) {
          continue;
        }
      }
    }

    console.log('� No family members found or all endpoints failed');
    return [];
  },

  // Add a new family member
  addFamilyMember: async (userId: string, memberData: CreateFamilyMemberRequest): Promise<FamilyMember | null> => {
    try {
      const response = await apiClient.post<FamilyMember>(`${API_BASE_URL}/add/${userId}`, memberData);
      return response.data;
    } catch (error: any) {
      return null;
    }
  },

  // Add a patient (special endpoint)
  addPatient: async (userId: string, memberData: CreateFamilyMemberRequest): Promise<FamilyMember | null> => {
    try {
      const response = await apiClient.post<FamilyMember>(`${API_BASE_URL}/add/${userId}`, memberData);
      return response.data;
    } catch (error: any) {
      return null;
    }
  },

  // Update family member
  updateFamilyMember: async (memberId: string, updates: Partial<CreateFamilyMemberRequest>): Promise<FamilyMember | null> => {
    try {
      const response = await apiClient.put<FamilyMember>(`/add/${memberId}`, updates);
      return response.data;
    } catch (error: any) {
      return null;
    }
  },

  // Delete family member
  deleteFamilyMember: async (memberId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/add/${memberId}`);
      return true;
    } catch (error: any) {
      return false;
    }
  },

  // Get family member by ID
  getFamilyMemberById: async (memberId: string): Promise<FamilyMember | null> => {
    try {
      const response = await apiClient.get<FamilyMember>(`/add/${memberId}`);
      return response.data;
    } catch (error: any) {
      return null;
    }
  },

  // Get family member details by user ID and patient ID
  getFamilyMemberDetails: async (userId: string, patientId: string): Promise<FamilyMember | null> => {
    try {
      const response = await apiClient.get<FamilyMember>(`/add/${userId}/${patientId}`);
      return response.data;
    } catch (error: any) {
      return null;
    }
  },
};

// Razorpay Payment API Types
export interface CreatePaymentRequest {
  amount: number; // Amount in paise (multiply by 100 for INR)
  currency?: string; // Default: 'INR'
  method: 'card' | 'upi' | 'wallet' | 'netbanking';
  relatedType: 'subscription' | 'appointment' | 'service';
  relatedId: string; // ID of the subscription, appointment, etc.
  userId?: string; // Optional if using auth middleware
}

export interface CreatePaymentResponse {
  message: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ConfirmPaymentResponse {
  message: string;
  payment: {
    _id: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    userId: string;
    relatedType: string;
    relatedId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PaymentRecord {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentIntentId?: string;
  amount: number;
  currency: string;
  method: string;
  status: 'created' | 'paid' | 'failed' | 'cancelled';
  userId: {
    _id: string;
    FullName: string;
    email: string;
  };
  relatedType: string;
  relatedId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPaymentsResponse {
  success: boolean;
  data: PaymentRecord[];
}

// Razorpay Payment API Services
export const paymentService = {
  // Create a new payment order
  async createPayment(paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      console.log('🚀 Creating payment order:', paymentData);
      
      const response = await apiClient.post('/payment', paymentData);
      
      console.log('✅ Payment order created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating payment:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
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
    } catch (error: any) {
      console.error('❌ Error confirming payment:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to confirm payment');
    }
  },

  // Get all payments for the authenticated user
  async getPayments(): Promise<PaymentRecord[]> {
    try {
      console.log('📋 Fetching payment history...');
      
      const response = await apiClient.get('/payment');
      
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log('✅ Payment history fetched:', response.data.data.length, 'records');
        return response.data.data;
      }
      
      console.warn('⚠️ Unexpected payment history response format:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching payments:', error);
      
      if (error.response?.status === 404) {
        console.log('📝 No payment history found');
        return [];
      }
      
      throw new Error('Failed to fetch payment history');
    }
  },

  // Get payment by order ID
  async getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
    try {
      const payments = await this.getPayments();
      const payment = payments.find(p => p.razorpayOrderId === orderId);
      return payment || null;
    } catch (error) {
      console.error('❌ Error finding payment by order ID:', error);
      return null;
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
    const typeMap: {[key: string]: string} = {
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
    const timingMap: {[key: string]: string} = {
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
    const times = Object.values(medicine.timings).map(timing => timing.time);

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
  doctor: string;
  clinic: string;
  date: string; // 'YYYY-MM-DD'
  slot: AppointmentSlot;
  user: string;
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

// Appointment API Services
export const appointmentService = {
  // Book an appointment
  bookAppointment: async ({ doctor, clinic, date, slot, user }: BookAppointmentPayload): Promise<any> => {
    try {
      const response = await apiClient.post('/appointments/book', {
        doctor,
        clinic,
        date, // format: 'YYYY-MM-DD'
        slot, // { from: '10:00', to: '10:30' }
        user,
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        // @ts-ignore
        throw error.response.data || error;
      }
      throw error;
    }
  },
  // Get appointments by user ID
  getAppointmentsByUserId: async (userId: string): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/Appointment/user/${userId}`);
      console.log("response.data",response.data)
      return response.data?.data || response.data || [];
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

}
 export const subscriptionservices = {

  getallsubscription : async(): Promise<any> => {

    try{
      const response = await apiClient.get(`/Subscription/all`)
      console.log("response.data",response.data)
      console.log("response.data",response.data)
      return response.data
    }
    catch(error: any){
    console.error("fetching error getallsubscription",error)
    }
  }
 }