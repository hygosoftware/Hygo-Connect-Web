'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ResponsiveNavigation, BottomNavigation } from '../atoms';
import { HeaderProvider } from '../atoms/HeaderWrapper';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if current route should show navigation
  const shouldShowNavigation = () => {
    const noNavRoutes = ['/', '/login', '/signup', '/otp'];
    return !noNavRoutes.includes(pathname);
  };

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items with proper routing
  const navigationItems = [
    {
      title: 'Home',
      icon: 'home',
      path: '/home',
      isActive: pathname === '/home',
      onPress: () => router.push('/home')
    },
    {
      title: 'Records',
      icon: 'document',
      path: '/records',
      isActive: pathname === '/records',
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

  return (
    <HeaderProvider onMobileMenuToggle={handleMobileMenuToggle}>
      <div className="min-h-screen bg-white relative">
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className={`hidden md:flex md:flex-col ${isSidebarExpanded ? 'md:w-72' : 'md:w-20'} md:bg-white md:h-screen md:shadow-2xl md:shadow-gray-200/50 md:border-r md:border-gray-200 md:fixed md:left-0 md:top-0 md:z-40 transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${isSidebarExpanded ? 'h-12 w-12' : 'h-10 w-10'} rounded-full bg-gradient-to-br from-[#0E3293] to-[#1e40af] backdrop-blur-sm flex items-center justify-center border-2 border-blue-400/50 shadow-lg shadow-blue-500/30 transition-all duration-300`}>
                <span className="text-white font-bold text-lg drop-shadow-sm">H</span>
              </div>
              {isSidebarExpanded && (
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-800 drop-shadow-sm">Hygo</h3>
                  <p className="text-sm text-gray-600 drop-shadow-sm">Health Platform</p>
                </div>
              )}
            </div>
            <button
              onClick={handleSidebarToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarExpanded ? "M11 19l-7-7 7-7M21 12H3" : "M13 5l7 7-7 7M5 12h14"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="py-2 flex-1">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              className={`w-full ${isSidebarExpanded ? 'flex items-center px-4' : 'flex justify-center px-2'} py-3 mx-2 my-1 rounded-xl transition-all duration-300 ${
                item.isActive
                  ? 'bg-gradient-to-r from-[#0E3293]/10 to-[#1e40af]/10 border border-blue-200 shadow-lg shadow-blue-500/10'
                  : 'hover:bg-gray-50 hover:border hover:border-gray-200 hover:shadow-md'
              }`}
              onClick={item.onPress}
            >
              <div className={isSidebarExpanded ? "flex-shrink-0" : ""}>
                <svg className={`w-6 h-6 ${item.isActive ? 'text-[#0E3293]' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                  {item.icon === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                  {item.icon === 'pills' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A1.998 1.998 0 004 17.618v.786a2 2 0 00.281 1.023l1.46 2.435a2 2 0 001.718.972h9.082a2 2 0 001.718-.972l1.46-2.435A2 2 0 0020 18.404v-.786a2 2 0 00-.572-1.39z" />}
                  {item.icon === 'user' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                </svg>
              </div>
              {isSidebarExpanded && (
                <span className={`ml-3 font-medium ${item.isActive ? 'text-[#0E3293]' : 'text-gray-700'}`}>
                  {item.title}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            className={`w-full ${isSidebarExpanded ? 'flex items-center px-4' : 'flex justify-center px-2'} py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md`}
            onClick={() => router.push('/login')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarExpanded && (
              <span className="ml-3 font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseMobileMenu}
          />

          {/* Side Menu */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl shadow-gray-300/50 border-r border-gray-200">
            <div className="flex flex-col h-full">
              {/* Profile Section */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col items-center mb-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#0E3293] to-[#1e40af] backdrop-blur-sm flex items-center justify-center mb-2 border-2 border-blue-400/50 shadow-lg shadow-blue-500/30">
                    <span className="text-white font-bold text-2xl drop-shadow-sm">H</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 text-center drop-shadow-sm">John Doe</h3>
                  <p className="text-sm text-gray-600 drop-shadow-sm">View and edit profile</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-2">
                {navigationItems.map((item, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center px-6 py-4 mx-2 my-1 rounded-xl border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                    onClick={() => {
                      item.onPress();
                      handleCloseMobileMenu();
                    }}
                  >
                    <svg className="w-6 h-6 text-gray-700 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                      {item.icon === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      {item.icon === 'pills' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A1.998 1.998 0 004 17.618v.786a2 2 0 00.281 1.023l1.46 2.435a2 2 0 001.718.972h9.082a2 2 0 001.718-.972l1.46-2.435A2 2 0 0020 18.404v-.786a2 2 0 00-.572-1.39z" />}
                      {item.icon === 'user' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                    </svg>
                    <span className="text-gray-800 font-medium">{item.title}</span>
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <div className="p-4">
                <button
                  className="w-full flex items-center px-6 py-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200 shadow-sm"
                  onClick={() => {
                    router.push('/login');
                    handleCloseMobileMenu();
                  }}
                >
                  <svg className="w-6 h-6 text-red-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-red-600 font-bold">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarExpanded ? 'md:ml-72' : 'md:ml-20'} pb-20 md:pb-0`}>
        {children}
      </div>

      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <div className="md:hidden">
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-2xl shadow-gray-300/50 z-40">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-all duration-300 rounded-lg min-h-[60px] touch-manipulation ${
                  item.isActive
                    ? 'bg-gradient-to-r from-[#0E3293]/10 to-[#1e40af]/10 shadow-lg shadow-blue-500/10 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={item.onPress}
              >
                <svg className={`w-7 h-7 mb-1 ${item.isActive ? 'text-[#0E3293]' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                  {item.icon === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                  {item.icon === 'pills' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A1.998 1.998 0 004 17.618v.786a2 2 0 00.281 1.023l1.46 2.435a2 2 0 001.718.972h9.082a2 2 0 001.718-.972l1.46-2.435A2 2 0 0020 18.404v-.786a2 2 0 00-.572-1.39z" />}
                  {item.icon === 'user' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                </svg>
                <span className={`text-xs truncate max-w-full font-medium ${item.isActive ? 'text-[#0E3293] font-semibold' : 'text-gray-600'}`}>
                  {item.title}
                </span>
              </button>
            ))}
          </div>

          {/* Safe area padding for mobile devices */}
          <div className="h-2 sm:h-0"></div>
        </div>
      </div>
      </div>
    </HeaderProvider>
  );
};

export default AppLayout;
