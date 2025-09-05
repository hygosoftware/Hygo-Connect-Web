import { useEffect, useState } from 'react';
import { TokenManager } from '../services/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  storageHealthy: boolean;
  error: string | null;
}

export const useSafariAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    storageHealthy: true,
    error: null,
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check storage health first
        const healthCheck = TokenManager.checkStorageHealth();
        
        if (!healthCheck.healthy) {
          console.warn('Storage health issue:', healthCheck.reason);
          setAuthState(prev => ({
            ...prev,
            storageHealthy: false,
            error: `Storage issue: ${healthCheck.reason}`,
            isLoading: false,
          }));
          return;
        }

        // Check authentication
        const isAuth = TokenManager.isAuthenticated();
        const { accessToken } = TokenManager.getTokens();
        
        // Additional Safari-specific checks
        if (isAuth && accessToken) {
          // Verify token is not corrupted
          try {
            // Basic token validation (check if it's a valid JWT-like structure)
            const parts = accessToken.split('.');
            if (parts.length !== 3) {
              throw new Error('Invalid token structure');
            }
            
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              storageHealthy: true,
              error: null,
            });
          } catch (tokenError) {
            console.error('Token validation failed:', tokenError);
            // Clear corrupted tokens
            TokenManager.clearTokens();
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              storageHealthy: true,
              error: 'Token corrupted, please login again',
            });
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            storageHealthy: true,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          storageHealthy: false,
          error: error instanceof Error ? error.message : 'Authentication check failed',
        });
      }
    };

    // Initial check
    checkAuth();

    // Safari-specific: Listen for storage events (when user switches tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('hygo_')) {
        console.log('Storage change detected, rechecking auth');
        checkAuth();
      }
    };

    // Safari-specific: Listen for visibility changes (when app comes back to foreground)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('App became visible, rechecking auth');
        setTimeout(checkAuth, 100); // Small delay to ensure storage is ready
      }
    };

    // Safari-specific: Listen for page focus (when user returns to PWA)
    const handleFocus = () => {
      console.log('App focused, rechecking auth');
      setTimeout(checkAuth, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Method to manually refresh auth state (useful after login)
  const refreshAuth = () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setTimeout(() => {
      const isAuth = TokenManager.isAuthenticated();
      const healthCheck = TokenManager.checkStorageHealth();
      
      setAuthState({
        isAuthenticated: isAuth,
        isLoading: false,
        storageHealthy: healthCheck.healthy,
        error: healthCheck.healthy ? null : healthCheck.reason,
      });
    }, 100);
  };

  return {
    ...authState,
    refreshAuth,
  };
};
