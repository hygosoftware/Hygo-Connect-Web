// Authentication debugging utilities for Safari compatibility

import { TokenManager } from '@/services/auth';
import { SafariCompatibility } from './safariCompatibility';

export interface AuthDebugInfo {
  timestamp: string;
  browser: {
    isSafari: boolean;
    isSafariPWA: boolean;
    userAgent: string;
    isPrivateBrowsing?: boolean;
  };
  storage: {
    healthy: boolean;
    reason: string;
    localStorageAvailable: boolean;
    sessionStorageAvailable: boolean;
  };
  authentication: {
    isAuthenticated: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    hasUserId: boolean;
    hasUserInfo: boolean;
    tokenStructureValid?: boolean;
  };
  cookies: {
    hygoSessionExists: boolean;
    allCookies: string;
  };
}

export const AuthDebugger = {
  // Comprehensive authentication debug information
  async getDebugInfo(): Promise<AuthDebugInfo> {
    const timestamp = new Date().toISOString();
    
    // Browser detection
    const isSafari = SafariCompatibility.isSafari();
    const isSafariPWA = SafariCompatibility.isSafariPWA();
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A';
    const isPrivateBrowsing = await SafariCompatibility.isPrivateBrowsing();

    // Storage health check
    const storageHealth = TokenManager.checkStorageHealth();
    const localStorageAvailable = this.checkStorageType('localStorage');
    const sessionStorageAvailable = this.checkStorageType('sessionStorage');

    // Authentication state
    const tokens = TokenManager.getTokens();
    const isAuthenticated = TokenManager.isAuthenticated();
    
    let tokenStructureValid = false;
    if (tokens.accessToken) {
      try {
        const parts = tokens.accessToken.split('.');
        tokenStructureValid = parts.length === 3;
      } catch (e) {
        tokenStructureValid = false;
      }
    }

    // Cookie information
    const allCookies = typeof document !== 'undefined' ? document.cookie : 'N/A';
    const hygoSessionExists = allCookies.includes('hygo_session=active');

    return {
      timestamp,
      browser: {
        isSafari,
        isSafariPWA,
        userAgent,
        isPrivateBrowsing,
      },
      storage: {
        healthy: storageHealth.healthy,
        reason: storageHealth.reason,
        localStorageAvailable,
        sessionStorageAvailable,
      },
      authentication: {
        isAuthenticated,
        hasAccessToken: !!tokens.accessToken,
        hasRefreshToken: !!tokens.refreshToken,
        hasUserId: !!tokens.userId,
        hasUserInfo: !!tokens.userInfo,
        tokenStructureValid,
      },
      cookies: {
        hygoSessionExists,
        allCookies,
      },
    };
  },

  // Check if a specific storage type is available
  checkStorageType(type: 'localStorage' | 'sessionStorage'): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Log comprehensive debug information
  async logDebugInfo(): Promise<void> {
    const debugInfo = await this.getDebugInfo();
    console.group('🔍 Hygo Authentication Debug Info');
    console.log('Timestamp:', debugInfo.timestamp);
    console.log('Browser Info:', debugInfo.browser);
    console.log('Storage Info:', debugInfo.storage);
    console.log('Authentication Info:', debugInfo.authentication);
    console.log('Cookie Info:', debugInfo.cookies);
    console.groupEnd();
  },

  // Test authentication flow
  async testAuthFlow(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test storage
      const storageHealth = TokenManager.checkStorageHealth();
      if (!storageHealth.healthy) {
        issues.push(`Storage issue: ${storageHealth.reason}`);
      }

      // Test token retrieval
      const tokens = TokenManager.getTokens();
      if (!tokens.accessToken) {
        issues.push('No access token found');
      } else {
        // Validate token structure
        const parts = tokens.accessToken.split('.');
        if (parts.length !== 3) {
          issues.push('Invalid token structure');
        }
      }

      // Test Safari-specific issues
      if (SafariCompatibility.isSafari()) {
        const isPrivate = await SafariCompatibility.isPrivateBrowsing();
        if (isPrivate) {
          issues.push('Private browsing mode detected - storage may be limited');
        }
      }

      return {
        success: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, issues };
    }
  },

  // Clear all authentication data (for testing)
  clearAllAuthData(): void {
    TokenManager.clearTokens();
    
    // Also clear any potential legacy storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
      } catch (e) {
        console.warn('Could not clear legacy localStorage');
      }
    }
    
    console.log('🧹 All authentication data cleared');
  },

  // Simulate login for testing
  simulateLogin(): void {
    const mockUser = {
      _id: 'test_user_123',
      FullName: 'Test User',
      Email: 'test@example.com',
      UserType: 'Patient',
    };
    
    const mockAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0X3VzZXJfMTIzIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDM2MDB9.test_signature';
    const mockRefreshToken = 'refresh_token_123';
    
    TokenManager.setTokens(mockAccessToken, mockRefreshToken, mockUser);
    console.log('🧪 Mock login simulated');
  },
};

// Global debug function for browser console
if (typeof window !== 'undefined') {
  (window as any).hygoAuthDebug = AuthDebugger;
}
