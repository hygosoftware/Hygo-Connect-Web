import { useState, useEffect } from 'react';
import { TokenManager } from '../services/auth';

interface User {
  _id: string;
  FullName: string;
  Email: string;
  UserType: string;
  fullName?: string;
  email?: string;
  userType?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const tokens = TokenManager.getTokens();
        const isAuthenticated = TokenManager.isAuthenticated();

        setAuthState({
          isAuthenticated,
          user: tokens.userInfo,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
        });
      }
    };

    checkAuthStatus();

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'userInfo') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshAuthState = () => {
    const tokens = TokenManager.getTokens();
    const isAuthenticated = TokenManager.isAuthenticated();

    setAuthState({
      isAuthenticated,
      user: tokens.userInfo,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      loading: false,
    });
  };

  return {
    ...authState,
    refreshAuthState,
  };
};

export default useAuth;
