'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ResponsiveNavigation, BottomNavigation } from '../atoms';
import { HeaderProvider } from '../atoms/HeaderWrapper';
import { useAuth } from '../../hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  // Check if current route should show navigation
  const shouldShowNavigation = () => {
    const noNavRoutes = ['/', '/login', '/signup', '/otp'];
    return !noNavRoutes.includes(pathname);
  };

  // Handle responsive behavior


  // Helper functions for user profile display
  const getUserDisplayName = () => {
    if (user?.FullName && user.FullName.trim().length > 0) {
      return user.FullName;
    }
    if (user?.fullName && user.fullName.trim().length > 0) {
      return user.fullName;
    }
    return 'User';
  };

  const getUserEmail = () => {
    if (user?.Email && user.Email.trim().length > 0) {
      return user.Email;
    }
    if (user?.email && user.email.trim().length > 0) {
      return user.email;
    }
    return 'user@example.com';
  };

  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    if (displayName === 'User') return 'U';

    const names = displayName.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  };

  // Navigation items with proper routing
  const navigationItems = [
    {
      title: 'Home1',
      icon: 'home',
      path: '/home',
      isActive: pathname === '/home',
      onPress: () => router.push('/home')
    },
    {
      title: 'Records',
      icon: 'records',
      path: '/records',
      isActive: pathname === '/records' || pathname.startsWith('/file-screen'),
      onPress: () => router.push('/records')
    },
    {
      title: 'PillPal',
      icon: 'pills',
      path: '/pillpal',
      isActive: pathname === '/pillpal',
      onPress: () => router.push('/pillpal')
    },
    {
      title: 'Profile',
      icon: 'user',
      path: '/profile',
      isActive: pathname === '/profile',
      onPress: () => router.push('/profile')
    },
  ];

  if (!shouldShowNavigation()) {
    return <>{children}</>;
  }

  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);

  return (
    <HeaderProvider onMobileMenuToggle={() => {}}>
      <div className="min-h-screen bg-blue-50">
        <ResponsiveNavigation
          visible={true}
          navigation={navigationItems}
          userName={user}
          isSidebarExpanded={isSidebarExpanded}
          onSidebarToggle={setIsSidebarExpanded}
          onClose={() => {}}
        />
        <div className={`transition-all duration-300 ${isSidebarExpanded ? 'md:ml-72' : 'md:ml-16'} pb-20 md:pb-0`}>
          {children}
        </div>
      </div>
    </HeaderProvider>
  );
};

export default AppLayout;
