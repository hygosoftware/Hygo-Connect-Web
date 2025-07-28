import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hygo-backend.onrender.com/api/V0";

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Token management
const TokenManager = {
  setTokens: (accessToken: string, refreshToken: string, user: any) => {
    try {
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
      return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        userId: localStorage.getItem('userId'),
        userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null
      };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return {
        accessToken: null,
        refreshToken: null,
        userId: null,
        userInfo: null
      };
    }
  },

  clearTokens: () => {
    try {
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
  }
};

export const AuthService = {
  // Login (signup endpoint)
  login: async (userData: { Email: string }) => {
    const response = await apiClient.post('/signup', userData);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (Email: string, OTP: string) => {
    const response = await apiClient.post('/verify-otp', {
      Email,
      OTP
    });

    // Store tokens if verification successful
    if (response.data && response.data.success && response.data.message) {
      const { accessToken, refreshToken, user } = response.data.message;
      
      if (accessToken && refreshToken && user) {
        TokenManager.setTokens(accessToken, refreshToken, user);
      }
    }

    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    const response = await apiClient.post('/requestPasswordReset', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (email: string, token: string, newPassword: string) => {
    const response = await apiClient.put('/resetPassword', { 
      email, 
      token, 
      password: newPassword 
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (userId: string, profileData: any, profilePhoto?: any) => {
    const endpoint = `/${userId}`;

    if (profilePhoto) {
      const formData = new FormData();

      // Format data for backend
      const formattedData = {
        ...profileData,
        MobileNumber: profileData.MobileNumber ? (
          Array.isArray(profileData.MobileNumber)
            ? profileData.MobileNumber
            : [{
                number: (typeof profileData.MobileNumber === 'string' && profileData.MobileNumber.startsWith('+'))
                  ? profileData.MobileNumber
                  : `+91${profileData.MobileNumber}`,
                isVerified: true
              }]
        ) : undefined,
        Age: profileData.Age ? parseInt(profileData.Age.toString()) : undefined,
        Height: profileData.Height ? parseInt(profileData.Height.toString()) : undefined,
        Weight: profileData.Weight ? parseInt(profileData.Weight.toString()) : undefined,
      };

      // Append text fields
      Object.keys(formattedData).forEach((key) => {
        const value = formattedData[key];
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'MobileNumber' || key === 'ChronicDiseases' || key === 'Allergies') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append profile photo
      formData.append("profilePhoto", {
        uri: profilePhoto.uri,
        name: profilePhoto.fileName || "profile.jpg",
        type: profilePhoto.type || "image/jpeg",
      } as any);

      const response = await apiClient.put(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      return response.data;
    } else {
      // No photo - send as JSON
      const formattedData = {
        ...profileData,
        MobileNumber: profileData.MobileNumber ? (
          Array.isArray(profileData.MobileNumber)
            ? profileData.MobileNumber
            : [{
                number: (typeof profileData.MobileNumber === 'string' && profileData.MobileNumber.startsWith('+'))
                  ? profileData.MobileNumber
                  : `+91${profileData.MobileNumber}`,
                isVerified: true
              }]
        ) : undefined,
        Age: profileData.Age ? parseInt(profileData.Age.toString()) : undefined,
        Height: profileData.Height ? parseInt(profileData.Height.toString()) : undefined,
        Weight: profileData.Weight ? parseInt(profileData.Weight.toString()) : undefined,
      };

      // Remove undefined values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === '') {
          delete formattedData[key];
        }
      });

      const response = await apiClient.put(endpoint, formattedData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      return response.data;
    }
  },

  // Logout
  logout: async () => {
    try {
      TokenManager.clearTokens();
      return { success: true, message: 'Logged out successfully' };
    } catch (error: any) {
      TokenManager.clearTokens();
      return { success: true, message: 'Logged out successfully' };
    }
  }
};

// Export TokenManager for use in other components
export { TokenManager };
