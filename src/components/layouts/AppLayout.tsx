'use client';

import React from 'react';
import { useCloseSidebarOnNavigation } from '../../hooks/useCloseSidebarOnNavigation';
import { useRouter, usePathname } from 'next/navigation';
import { ResponsiveNavigation, BottomNavigation, UniversalHeader } from '../atoms';
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
  const pathname = usePathname() || '';
  const { user } = useAuth();
  
  // Check if current route should show navigation
  const shouldShowNavigation = () => {
    const noNavRoutes = ['/', '/login', '/signup', '/otp'];
    return !noNavRoutes.includes(pathname);
  };

  // Check if bottom navigation should be hidden
  const shouldHideBottomNav = () => {
    return pathname === '/booking' || pathname.startsWith('/booking/');
  };

  // Helper to close sidebar on desktop/tablet
  const closeSidebarIfDesktopOrTablet = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && isSidebarExpanded) {
      setIsSidebarExpanded(false);
    }
  };

  // Navigation items with proper routing
  const navigationItems: NavigationItemLocal[] = [
    {
      title: 'Home',
      icon: 'home',
      path: '/home',
      isActive: pathname === '/home',
      onPress: () => {
        closeSidebarIfDesktopOrTablet();
        router.push('/home');
      }
    },
    {
      title: 'Records',
      icon: 'records',
      path: '/records',
      isActive: pathname === '/records' || pathname.startsWith('/file-screen'),
      onPress: () => {
        closeSidebarIfDesktopOrTablet();
        router.push('/records');
      }
    },
    {
      title: 'PillPal',
      icon: 'pills',
      path: '/pillpal',
      isActive: pathname === '/pillpal',
      onPress: () => {
        closeSidebarIfDesktopOrTablet();
        router.push('/pillpal');
      }
    },
    {
      title: 'Profile',
      icon: 'user',
      path: '/profile',
      isActive: pathname === '/profile',
      onPress: () => {
        closeSidebarIfDesktopOrTablet();
        router.push('/profile');
      }
    },
    {
      title: 'Privacy Policy',
      icon: 'document',
      path: '/privacy-policy',
      isActive: pathname === '/privacy-policy',
      onPress: () => {
        closeSidebarIfDesktopOrTablet();
        router.push('/privacy-policy');
      }
    },
    {
      title: 'Terms & Conditions',
      icon: 'document',
      path: '/terms',
      isActive: pathname === '/terms',
      onPress: () => {
        closeSidebarIfDesktopOrTablet();
        router.push('/terms');
      }
    },
  ];

  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!shouldShowNavigation()) {
    return <>{children}</>;
  }


  return (
    <HeaderProvider onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Fixed Header */}
        {shouldShowNavigation() && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
            <UniversalHeader 
              variant="default"
              showMenuButton={true}
            />
          </div>
        )}
        
        <div className="flex flex-1">
          {/* Sidebar */}
          <ResponsiveNavigation
            visible={true}
            navigation={navigationItems.map(({ title, icon, isActive, onPress }) => ({ title, icon, isActive, onPress }))}
            userName={(user && (user.FullName || (user as any).fullName)) || null}
            isSidebarExpanded={isSidebarExpanded}
            onSidebarToggle={setIsSidebarExpanded}
            isMobileMenuOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Main Content */}
          <main className={`flex-1 flex flex-col ${shouldShowNavigation() ? 'pt-16' : ''} min-h-screen`}>
            <div className="flex-1">
              {children}
            </div>
            
            {/* Bottom Navigation */}
            {shouldShowNavigation() && !shouldHideBottomNav() && (
              <div className="fixed bottom-0 left-0 right-0 z-40">
                <BottomNavigation userId={user?._id || ''} />
              </div>
            )}
          </main>
        </div>
      </div>
    </HeaderProvider>
  );
};

export default AppLayout;
