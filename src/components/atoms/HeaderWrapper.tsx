'use client';

import React, { createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderContextType {
  onMobileMenuToggle: () => void;
  onBackPress: () => void;
  shouldShowBackButton: () => boolean;
  getPageTitle: () => string;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }
  return context;
};

interface HeaderProviderProps {
  children: React.ReactNode;
  onMobileMenuToggle: () => void;
}

export const HeaderProvider: React.FC<HeaderProviderProps> = ({
  children,
  onMobileMenuToggle,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Define which pages should NOT show back button (main navigation pages)
  const mainNavigationPages = ['/home'];

  // Define page titles
  const pageTitles: Record<string, string> = {
    '/doctors': 'Find Doctors',
    '/family': 'Family Members',
    '/booking': 'Book Appointment',
    '/file-screen': 'Files',
    '/files': 'File Management',
    '/health-card': 'Health Card',
    '/records': 'My Medical Records',
    '/pillpal': 'PillPal - Medication Calendar',
    '/profile': 'My Profile',
    '/demo-files': 'Demo Files',
    '/demo-navigation-flow': 'Navigation Demo',
    '/demo-records-flow': 'Records Demo',
    '/demo-reminders': 'Reminders Demo',
  };

  const onBackPress = () => {
    router.back();
  };

  const shouldShowBackButton = () => {
    // If pathname is null, don't show back button
    if (!pathname) return false;
    
    // Don't show back button on main navigation pages
    if (mainNavigationPages.includes(pathname)) {
      return false;
    }

    // Don't show back button on auth pages
    const noBackButtonPages = ['/', '/login', '/signup', '/otp'];
    if (noBackButtonPages.includes(pathname)) {
      return false;
    }

    // Show back button on all other pages
    return true;
  };

  const getPageTitle = () => {
    // Return default title if pathname is null
    if (!pathname) return '';
    
    // Check for exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }

    // Check for dynamic routes
    if (pathname.startsWith('/doctors/')) {
      return 'Doctor Details';
    }
    if (pathname.startsWith('/family/')) {
      return 'Family Member';
    }
    if (pathname.startsWith('/health-card/')) {
      return 'Health Card';
    }

    // Default title based on pathname
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return 'Page';
  };

  return (
    <HeaderContext.Provider value={{
      onMobileMenuToggle,
      onBackPress,
      shouldShowBackButton,
      getPageTitle
    }}>
      {children}
    </HeaderContext.Provider>
  );
};

export default HeaderProvider;
