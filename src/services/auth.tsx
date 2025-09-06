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

// Safari-compatible storage with mandatory sessionStorage
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

  private getStorage(): Storage {
    // MANDATORY sessionStorage - no fallback to localStorage
    if (this.storageAvailable('sessionStorage')) {
      return sessionStorage;
    }
    // If sessionStorage is not available, throw error instead of fallback
    console.error('❌ sessionStorage is not available - this is required for authentication');
    throw new Error('sessionStorage is required but not available. Please enable sessionStorage in your browser.');
  }

  setItem(key: string, value: string): boolean {
    try {
      const storage = this.getStorage();
      storage.setItem(key, value);
      console.log(`✅ Successfully stored ${key} in sessionStorage`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to store ${key} in sessionStorage:`, error);
      throw error; // Don't fallback, throw error to indicate failure
    }
  }

  getItem(key: string): string | null {
    try {
      const storage = this.getStorage();
      const value = storage.getItem(key);
      console.log(`🔍 Retrieved ${key} from sessionStorage:`, !!value);
      return value;
    } catch (error) {
      console.error(`❌ Failed to retrieve ${key} from sessionStorage:`, error);
      throw error; // Don't fallback, throw error to indicate failure
    }
  }

  removeItem(key: string): void {
    try {
      const storage = this.getStorage();
      storage.removeItem(key);
      console.log(`🗑️ Removed ${key} from sessionStorage`);
    } catch (error) {
      console.error(`❌ Failed to remove ${key} from sessionStorage:`, error);
      throw error; // Don't fallback, throw error to indicate failure
    }
  }
}

const safariStorage = new SafariCompatibleStorage();

export const TokenManager = {
  setTokens: (accessToken: string, refreshToken: string, user: User) => {
    try {
      if (!isBrowser) {
        console.warn('🚫 Not in browser environment, cannot store tokens');
        return;
      }
      
      console.log('💾 Attempting to store tokens...', {
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        userId: user?._id,
        userEmail: user?.Email
      });
      
      // Store tokens in session storage with simple key names
      const accessSuccess = safariStorage.setItem('accessToken', accessToken);
      const refreshSuccess = safariStorage.setItem('refreshToken', refreshToken);
      const userIdSuccess = safariStorage.setItem('userId', user._id);
      const userInfoSuccess = safariStorage.setItem('userInfo', JSON.stringify(user));
      
      console.log('📝 Storage results:', {
        accessToken: accessSuccess,
        refreshToken: refreshSuccess,
        userId: userIdSuccess,
        userInfo: userInfoSuccess
      });
      
      // Immediately verify storage worked
      const verification = {
        accessToken: safariStorage.getItem('accessToken'),
        refreshToken: safariStorage.getItem('refreshToken'),
        userId: safariStorage.getItem('userId'),
        userInfo: safariStorage.getItem('userInfo')
      };
      
      console.log('🔍 Immediate verification after storage:', {
        accessTokenStored: !!verification.accessToken,
        refreshTokenStored: !!verification.refreshToken,
        userIdStored: !!verification.userId,
        userInfoStored: !!verification.userInfo,
        accessTokenMatches: verification.accessToken === accessToken,
        userIdMatches: verification.userId === user._id
      });
      
      // Also try to set a cookie as additional fallback for Safari
      if (isBrowser && document.cookie !== undefined) {
        try {
          // Set secure, httpOnly-like cookies for Safari PWA
          const expires = new Date();
          expires.setDate(expires.getDate() + 7); // 7 days expiry
          document.cookie = `hygo_session=active; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
          console.log('🍪 Session cookie set successfully');
        } catch (cookieError) {
          console.warn('🍪 Cookie fallback failed:', cookieError);
        }
      }
      
      console.log('✅ Tokens stored successfully in sessionStorage (MANDATORY)');
      console.log('📊 Storage type: sessionStorage (no fallback)');
    } catch (error) {
      console.error('💥 Failed to store tokens:', error);
    }
  },

  getTokens: () => {
    try {
      if (!isBrowser) {
        console.log('🚫 getTokens: Not in browser environment');
        return {
          accessToken: null,
          refreshToken: null,
          userId: null,
          userInfo: null,
        };
      }
      
      console.log('🔍 Getting tokens from storage...');
      const accessToken = safariStorage.getItem('accessToken');
      const refreshToken = safariStorage.getItem('refreshToken');
      const userId = safariStorage.getItem('userId');
      const userInfoStr = safariStorage.getItem('userInfo');
      
      console.log('📋 Retrieved from storage:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUserId: !!userId,
        hasUserInfo: !!userInfoStr,
        accessTokenLength: accessToken?.length || 0,
        userIdValue: userId
      });
      
      let userInfo = null;
      if (userInfoStr) {
        try {
          userInfo = JSON.parse(userInfoStr);
          console.log('✅ User info parsed successfully');
        } catch (parseError) {
          console.error('❌ Failed to parse user info:', parseError);
        }
      }
      
      const result = {
        accessToken,
        refreshToken,
        userId,
        userInfo,
      };
      
      console.log('📤 Returning tokens:', {
        hasAccessToken: !!result.accessToken,
        hasRefreshToken: !!result.refreshToken,
        hasUserId: !!result.userId,
        hasUserInfo: !!result.userInfo
      });
      
      return result;
    } catch (error) {
      console.error('💥 Failed to retrieve tokens:', error);
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
      safariStorage.removeItem('accessToken');
      safariStorage.removeItem('refreshToken');
      safariStorage.removeItem('userId');
      safariStorage.removeItem('userInfo');
      
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
      const testKey = 'storage_test';
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
      console.log('🔐 Starting OTP verification for:', Email);
      const response = await apiClient.post<AuthResponse>('/verify-otp', {
        Email,
        OTP,
      });
      
      // Store tokens if verification successful
      const responseData = response.data;
      console.log('📋 OTP API Response:', {
        status: response.status,
        responseDataKeys: Object.keys(responseData),
        hasAccessToken: !!responseData.accessToken,
        hasRefreshToken: !!responseData.refreshToken,
        hasUser: !!responseData.user,
        fullResponse: responseData
      });
      
      // Debug: Log the actual structure to understand the response
      console.log('🔍 Full response structure:', JSON.stringify(responseData, null, 2));
      
      // Check if we have the required data (tokens are nested under message property)
      const messageData = responseData.message as any; // Type assertion since the interface is incorrect
      if (
        response.status === 200 &&
        messageData?.accessToken &&
        messageData?.refreshToken &&
        messageData?.user
      ) {
        console.log('✅ All required data present, storing tokens...');
        TokenManager.setTokens(
          messageData.accessToken,
          messageData.refreshToken,
          messageData.user
        );
        
        // Verify tokens were stored
        const storedTokens = TokenManager.getTokens();
        console.log('🔍 Verification - tokens after storage:', {
          hasAccessToken: !!storedTokens.accessToken,
          hasRefreshToken: !!storedTokens.refreshToken,
          hasUserId: !!storedTokens.userId,
          accessTokenLength: storedTokens.accessToken?.length || 0
        });
        
        // Check storage health
        const storageHealth = TokenManager.checkStorageHealth();
        console.log('🏥 Storage health check:', storageHealth);
        
      } else {
        console.error('❌ OTP verification incomplete - missing required data:', {
          status: response.status,
          hasAccessToken: !!messageData?.accessToken,
          hasRefreshToken: !!messageData?.refreshToken,
          hasUser: !!messageData?.user,
          responseStructure: Object.keys(responseData),
          messageStructure: messageData ? Object.keys(messageData) : 'message is not an object'
        });
        throw new Error('OTP verification failed - incomplete response data.');
      }
      
      // Return success response for compatibility
      return {
        success: true,
        accessToken: messageData.accessToken,
        refreshToken: messageData.refreshToken,
        user: messageData.user
      };
    } catch (error: unknown) {
      console.error('💥 OTP verification failed:', error);
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
