// Safari PWA compatibility utilities

// Extend Navigator interface to include standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export const SafariCompatibility = {
  // Check if running in Safari
  isSafari: (): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent;
    return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  },

  // Check if running as PWA in Safari
  isSafariPWA: (): boolean => {
    if (typeof window === 'undefined') return false;
    return SafariCompatibility.isSafari() && window.navigator.standalone === true;
  },

  // Check if in private browsing mode (Safari specific)
  isPrivateBrowsing: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Safari private browsing detection
      const storage = window.localStorage;
      storage.setItem('__private_test__', 'test');
      storage.removeItem('__private_test__');
      return false;
    } catch (e) {
      return true;
    }
  },

  // Force reload with cache bypass (Safari PWA specific)
  forceReload: (): void => {
    if (typeof window === 'undefined') return;
    
    if (SafariCompatibility.isSafariPWA()) {
      // In Safari PWA, use location.reload with force
      window.location.reload();
    } else {
      // In regular Safari, use hard reload by adding timestamp
      const currentUrl = window.location.href;
      const separator = currentUrl.includes('?') ? '&' : '?';
      window.location.href = `${currentUrl}${separator}_t=${Date.now()}`;
    }
  },

  // Add Safari-specific meta tags programmatically
  addSafariMetaTags: (): void => {
    if (typeof document === 'undefined') return;

    const metaTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'Hygo Connect' },
      { name: 'mobile-web-app-capable', content: 'yes' },
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
  },

  // Initialize Safari compatibility fixes
  init: (): void => {
    if (typeof window === 'undefined') return;

    // Add meta tags
    SafariCompatibility.addSafariMetaTags();

    // Safari PWA specific fixes
    if (SafariCompatibility.isSafariPWA()) {
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }

      // Handle safe area insets for Safari PWA
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
    }

    // Add event listeners for Safari-specific issues
    window.addEventListener('pageshow', (event) => {
      if (event.persisted && SafariCompatibility.isSafari()) {
        // Safari back/forward cache fix
        console.log('Safari pageshow with persisted cache, checking auth state');
        window.dispatchEvent(new CustomEvent('safari-auth-recheck'));
      }
    });
  },
};
