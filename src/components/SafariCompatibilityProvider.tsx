'use client';

import { useEffect } from 'react';
import { SafariCompatibility } from '@/utils/safariCompatibility';

interface SafariCompatibilityProviderProps {
  children: React.ReactNode;
}

export default function SafariCompatibilityProvider({ children }: SafariCompatibilityProviderProps) {
  useEffect(() => {
    // Initialize Safari compatibility fixes
    SafariCompatibility.init();

    // Log Safari detection for debugging
    if (SafariCompatibility.isSafari()) {
      console.log('🍎 Safari detected, compatibility fixes applied');
      
      if (SafariCompatibility.isSafariPWA()) {
        console.log('📱 Running as Safari PWA');
      }
    }

    // Check for private browsing mode
    SafariCompatibility.isPrivateBrowsing().then((isPrivate) => {
      if (isPrivate) {
        console.warn('🔒 Private browsing detected - storage may be limited');
      }
    });
  }, []);

  return <>{children}</>;
}
