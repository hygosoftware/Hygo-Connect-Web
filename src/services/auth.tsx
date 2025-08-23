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
  message: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
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

// --- Token Manager ---
const isBrowser = typeof window !== 'undefined';
export const TokenManager = {
  setTokens: (accessToken: string, refreshToken: string, user: User) => {
    try {
      if (!isBrowser) return;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('userInfo', JSON.stringify(user));
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
      return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userId: localStorage.getItem('userId'),
        userInfo: localStorage.getItem('userInfo')
          ? JSON.parse(localStorage.getItem('userInfo')!)
          : null,
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userInfo');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },

  isAuthenticated: () => {
    const { accessToken } = TokenManager.getTokens();
    return !!accessToken;
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
        data.message?.accessToken &&
        data.message?.refreshToken &&
        data.message?.user
      ) {
        TokenManager.setTokens(
          data.message.accessToken,
          data.message.refreshToken,
          data.message.user
        );
      }
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('OTP verification failed:', error.response?.data || error.message);
        if (error.response?.status === 400) {
          const errorMessage =
            error.response.data?.message || 'Invalid OTP or session expired. Please try again.';
          throw new Error(errorMessage);
        }
        throw error;
      } else {
        throw error;
      }
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
  },
};
