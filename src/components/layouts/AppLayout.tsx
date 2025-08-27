'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ResponsiveNavigation, BottomNavigation } from '../atoms';
import { HeaderProvider } from '../atoms/HeaderWrapper';
import { useAuth } from '../../hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Match the icon names expected by ResponsiveNavigation (SideBar.tsx)
type NavIcon = 'home' | 'records' | 'document' | 'pills' | 'user' | 'news';
type NavigationItemLocal = {
  title: string;
  icon: NavIcon;
  path: string;
  isActive: boolean;
  onPress: () => void;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Check if current route should show navigation
  const shouldShowNavigation = () => {
    const noNavRoutes = ['/', '/login', '/signup', '/otp'];
    return !noNavRoutes.includes(pathname);
  };

  // Navigation items with proper routing
  const navigationItems: NavigationItemLocal[] = [
    {
      title: 'Home',
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

  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!shouldShowNavigation()) {
    return <>{children}</>;
  }

  return (
    <HeaderProvider onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
      <div className="min-h-screen bg-white">
        {/* Sidebar - positioned behind header */}
        <ResponsiveNavigation
          visible={true}
          navigation={navigationItems.map(({ title, icon, isActive, onPress }) => ({ title, icon, isActive, onPress }))}
          userName={(user && (user.FullName || (user as any).fullName)) || null}
          isSidebarExpanded={isSidebarExpanded}
          onSidebarToggle={setIsSidebarExpanded}
          onClose={() => setIsMobileMenuOpen(false)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        {/* Main content area with responsive margins */}
        <div className={`transition-all duration-300 ${isSidebarExpanded ? 'md:ml-72' : 'md:ml-16'} pb-20 md:pb-0`}>
          {children}
        </div>

        {/* Bottom Navigation - Mobile Only */}
        <BottomNavigation userId={user?._id || 'demo-user'} />
      </div>
    </HeaderProvider>
  );
};

export default AppLayout;
