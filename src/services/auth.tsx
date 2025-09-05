import axios from 'axios';

// --- Types ---
export interface User {
  _id: string;
  FullName: string;
  Email: string;
  UserType: string;
  [key: string]: string | number | boolean | object | undefined;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string; // For error messages
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

// --- API Client ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const RESOLVED_BASE_URL = API_BASE_URL?.trim();

if (typeof window !== 'undefined') {
  if (!RESOLVED_BASE_URL) {
    console.error('[AuthService] NEXT_PUBLIC_API_BASE_URL is not set. Requests will fail.');
  } else {
    console.log('[AuthService] Using API base URL:', RESOLVED_BASE_URL);
  }
}

const apiClient = axios.create({
  baseURL: RESOLVED_BASE_URL,
  withCredentials: true,
  // Temporarily increase timeout to rule out slow network/API cold starts
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// --- Safari-Compatible Storage Manager ---
const isBrowser = typeof window !== 'undefined';

// Safari-compatible storage with fallback mechanisms
class SafariCompatibleStorage {
  private storageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    if (!isBrowser) return false;
    try {
      const storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getStorage(): Storage | null {
    // Try localStorage first
    if (this.storageAvailable('localStorage')) {
      return localStorage;
    }
    // Fallback to sessionStorage for Safari private browsing
    if (this.storageAvailable('sessionStorage')) {
      console.warn('localStorage unavailable, using sessionStorage as fallback');
      return sessionStorage;
    }
    // No storage available
    console.warn('No web storage available');
    return null;
  }

  setItem(key: string, value: string): boolean {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(key, value);
        return true;
      }
      // Fallback to memory storage for this session
      this.memoryStorage[key] = value;
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      // Fallback to memory storage
      this.memoryStorage[key] = value;
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      const storage = this.getStorage();
      if (storage) {
        return storage.getItem(key);
      }
      // Fallback to memory storage
      return this.memoryStorage[key] || null;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      // Fallback to memory storage
      return this.memoryStorage[key] || null;
    }
  }

  removeItem(key: string): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(key);
      }
      // Also remove from memory storage
      delete this.memoryStorage[key];
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      // Remove from memory storage anyway
      delete this.memoryStorage[key];
    }
  }

  // Memory fallback for when no storage is available
  private memoryStorage: { [key: string]: string } = {};
}

const safariStorage = new SafariCompatibleStorage();

export const TokenManager = {
  setTokens: (accessToken: string, refreshToken: string, user: User) => {
    try {
      if (!isBrowser) return;
      
      // Store tokens with Safari-compatible storage
      safariStorage.setItem('hygo_access_token', accessToken);
      safariStorage.setItem('hygo_refresh_token', refreshToken);
      safariStorage.setItem('hygo_user_id', user._id);
      safariStorage.setItem('hygo_user_info', JSON.stringify(user));
      
      // Also try to set a cookie as additional fallback for Safari
      if (isBrowser && document.cookie !== undefined) {
        try {
          // Set secure, httpOnly-like cookies for Safari PWA
          const expires = new Date();
          expires.setDate(expires.getDate() + 7); // 7 days expiry
          document.cookie = `hygo_session=active; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
        } catch (cookieError) {
          console.warn('Cookie fallback failed:', cookieError);
        }
      }
      
      console.log('✅ Tokens stored successfully with Safari compatibility');
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  },

  getTokens: () => {
    try {
      if (!isBrowser) {
        return {
          accessToken: null,
          refreshToken: null,
          userId: null,
          userInfo: null,
        };
      }
      
      const accessToken = safariStorage.getItem('hygo_access_token');
      const refreshToken = safariStorage.getItem('hygo_refresh_token');
      const userId = safariStorage.getItem('hygo_user_id');
      const userInfoStr = safariStorage.getItem('hygo_user_info');
      
      let userInfo = null;
      if (userInfoStr) {
        try {
          userInfo = JSON.parse(userInfoStr);
        } catch (parseError) {
          console.error('Failed to parse user info:', parseError);
        }
      }
      
      return {
        accessToken,
        refreshToken,
        userId,
        userInfo,
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return {
        accessToken: null,
        refreshToken: null,
        userId: null,
        userInfo: null,
      };
    }
  },

  clearTokens: () => {
    try {
      if (!isBrowser) return;
      
      // Clear from Safari-compatible storage
      safariStorage.removeItem('hygo_access_token');
      safariStorage.removeItem('hygo_refresh_token');
      safariStorage.removeItem('hygo_user_id');
      safariStorage.removeItem('hygo_user_info');
      
      // Also clear session cookie
      if (isBrowser && document.cookie !== undefined) {
        try {
          document.cookie = 'hygo_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        } catch (cookieError) {
          console.warn('Cookie cleanup failed:', cookieError);
        }
      }
      
      console.log('✅ Tokens cleared successfully');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },

  isAuthenticated: () => {
    const { accessToken } = TokenManager.getTokens();
    return !!accessToken;
  },

  // New method to check if storage is working properly
  checkStorageHealth: () => {
    if (!isBrowser) return { healthy: false, reason: 'Not in browser' };
    
    try {
      const testKey = 'hygo_storage_test';
      const testValue = 'test';
      
      safariStorage.setItem(testKey, testValue);
      const retrieved = safariStorage.getItem(testKey);
      safariStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        return { healthy: true, reason: 'Storage working normally' };
      } else {
        return { healthy: false, reason: 'Storage read/write mismatch' };
      }
    } catch (error) {
      return { healthy: false, reason: `Storage error: ${error}` };
    }
  },
};

// --- Auth Service ---
export const AuthService = {
  // Signup or login (using email)
  login: async (userData: { Email: string }) => {
    try {
      const response = await apiClient.post<AuthResponse>('/signup', userData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
      } else {
        throw error;
      }
    }
  },

  // Verify OTP
  verifyOTP: async (Email: string, OTP: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/verify-otp', {
        Email,
        OTP,
      });
      // Store tokens if verification successful
      const data = response.data;
      if (
        data.success &&
        data.accessToken &&
        data.refreshToken &&
        data.user
      ) {
        TokenManager.setTokens(
          data.accessToken,
          data.refreshToken,
          data.user
        );
      } else if (!data.success) {
        // Handle case where API returns success: false but no error
        throw new Error('OTP verification failed. Please try again.');
      }
      return data;
    } catch (error: unknown) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/request-password-reset',
        { email }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Password reset request failed:', error.response?.data || error.message);
        throw error;
      } else {
        throw error;
      }
    }
  },

  // Reset password
  resetPassword: async (email: string, token: string, newPassword: string) => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      '/reset-password',
      {
        email,
        token,
        password: newPassword,
      }
    );
    return response.data;
  },

  // Logout
  logout: async () => {
    TokenManager.clearTokens();
    return { success: true, message: 'Logged out successfully' };
  }
};
