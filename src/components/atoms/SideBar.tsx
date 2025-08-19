import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface UserProfile {
  profilePhoto?: string;
  FullName?: string;
  Email?: string;
  Gender?: string;
  DateOfBirth?: string;
  MobileNumber?: string;
}

interface UserNameWithPhoto {
  profilePhoto?: string;
  FullName?: string;
  [key: string]: any;
}

interface ResponsiveNavigationProps {
  visible: boolean;
  onClose: () => void;
  navigation?: any;
  userName: string | UserNameWithPhoto | null;
  className?: string;
  isSidebarExpanded?: boolean;
  onSidebarToggle?: (expanded: boolean) => void;
  isMobileMenuOpen?: boolean;
}

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  visible,
  onClose,
  navigation = [],
  userName,
  className = '',
  isSidebarExpanded: isSidebarExpandedProp = true,
  onSidebarToggle,
}) => {
  // Sidebar expansion state (controlled internally)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(isSidebarExpandedProp);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // User helpers
  const getUserDisplayName = () => {
    if (userName && typeof userName === 'object' && userName.FullName && userName.FullName.trim().length > 0) {
      return userName.FullName;
    }
    if (typeof userName === 'string' && userName.trim().length > 0) {
      return userName;
    }
    return 'User';
  };
  const getUserEmail = () => {
    if (userName && typeof userName === 'object' && userName.Email && userName.Email.trim().length > 0) {
      return userName.Email;
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

  // Sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarExpanded((prev) => {
      const next = !prev;
      if (onSidebarToggle) onSidebarToggle(next);
      return next;
    });
  };

  // Mobile menu toggle
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };
  // Close mobile menu
  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    if (onClose) onClose();
  };
  // Logout
  const handleLogout = async () => {
    try {
      console.log('Logout clicked');

      // Import AuthService dynamically to avoid circular dependencies
      const { AuthService } = await import('../../services/auth');
      await AuthService.logout();

      window.location.href = '/login';
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: clear tokens manually if service fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
      onClose();
    }
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div
      className={`hidden md:flex md:flex-col ${isSidebarExpanded ? 'md:w-72' : 'md:w-16'} md:h-screen md:fixed md:left-0 md:top-0 md:z-50 transition-all duration-300 ${className}`}
      style={{
        backgroundColor: '#0e3293',
        background: 'linear-gradient(135deg, #0e3293 0%, #1e40af 50%, #0e3293 100%)',
        boxShadow: '8px 0 32px rgba(0, 0, 0, 0.3), inset -2px 0 8px rgba(0, 0, 0, 0.2)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        borderTopRightRadius: '0rem',
        borderBottomRightRadius: '2rem',
      }}
    >
      {/* User Profile Section */}
      {isSidebarExpanded ? (
        <div className="p-4 border-b border-blue-400">
          <button
            onClick={handleSidebarToggle}
            className="w-full flex items-center space-x-3 hover:bg-blue-700/30 rounded-lg p-2 transition-colors duration-200"
          >
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform duration-200">
              <span className="text-blue-800 font-bold text-lg">{getUserInitials()}</span>
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">{getUserDisplayName()}</h3>
              <p className="text-blue-200 text-sm truncate">{getUserEmail()}</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="p-3 border-b border-blue-400 flex justify-center">
          <button
            onClick={handleSidebarToggle}
            className="h-10 w-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-all duration-200 hover:shadow-lg"
            title={`${getUserDisplayName()} - Click to expand`}
          >
            <span className="text-blue-800 font-bold">{getUserInitials()}</span>
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <div className="py-2 flex-1">
        {navigation.map((item: any, index: number) => (
          <button
            key={index}
            className={`w-full ${isSidebarExpanded ? 'flex items-center px-4' : 'flex justify-center px-2'} py-3 transition-all duration-200 ${
              item.isActive ? 'border-r-4 border-white' : ''
            }`}
            style={item.isActive ? {
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
            } : {}}
            onMouseEnter={(e) => {
              if (!item.isActive) {
                e.currentTarget.style.background = 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.isActive) {
                e.currentTarget.style.background = '';
                e.currentTarget.style.boxShadow = '';
              }
            }}
            onClick={item.onPress}
          >
            <div className={isSidebarExpanded ? "flex-shrink-0" : ""}>
              {/* Render SVG icons as in AppLayout */}
              <svg className={`w-6 h-6 ${item.isActive ? 'text-white' : 'text-blue-200'}`} fill="none" viewBox="0 0 24 24">
                {item.icon === 'home' && <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                {item.icon === 'records' && <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
                {item.icon === 'document' && <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                {item.icon === 'pills' && (
                  <>
                    {/* Big Capsule - Very recognizable */}
                    <g transform="rotate(-25 8 12)">
                      <rect x="4" y="6" width="8" height="12" rx="4" ry="4" fill="currentColor" stroke="none"/>
                      <rect x="4" y="6" width="8" height="6" rx="4" ry="4" fill="white" stroke="none"/>
                    </g>
                    {/* Big Round Tablet - Simple and clear */}
                    <circle cx="17" cy="8" r="5" fill="currentColor" stroke="none"/>
                    <line x1="14" y1="8" x2="20" y2="8" stroke="white" strokeWidth="2"/>
                  </>
                )}
                {item.icon === 'user' && <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
              </svg>
            </div>
            {isSidebarExpanded && (
              <span className={`ml-3 font-medium ${item.isActive ? 'text-white' : 'text-blue-200'}`}>{item.title}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div
        className="p-4 border-t border-blue-400"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)'
        }}
      >
        <button
          className={`w-full ${isSidebarExpanded ? 'flex items-center px-4' : 'flex justify-center px-2'} py-3 text-red-300 hover:bg-red-600 rounded-lg transition-colors duration-200`}
          onClick={handleLogout}
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
  );

  // Mobile Overlay
  const MobileOverlay = () => (
    isMobileMenuOpen ? (
      <div className="md:hidden fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleCloseMobileMenu}
        />
        {/* Side Menu */}
        <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Mobile Profile Section */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
                  <span className="text-blue-800 font-bold text-xl">{getUserInitials()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{getUserDisplayName()}</h3>
                  <p className="text-gray-500 text-sm truncate">{getUserEmail()}</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 py-2">
              {navigation.map((item: any, index: number) => (
                <button
                  key={index}
                  className="w-full flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    item.onPress();
                    handleCloseMobileMenu();
                  }}
                >
                  <svg className="w-6 h-6 text-blue-800 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
                    {item.icon === 'records' && <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
                    {item.icon === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                    {item.icon === 'pills' && (
                      <>
                        {/* Big Capsule - Very recognizable */}
                        <g transform="rotate(-25 8 12)">
                          <rect x="4" y="6" width="8" height="12" rx="4" ry="4" fill="currentColor" stroke="none"/>
                          <rect x="4" y="6" width="8" height="6" rx="4" ry="4" fill="white" stroke="none"/>
                        </g>
                        {/* Big Round Tablet - Simple and clear */}
                        <circle cx="17" cy="8" r="5" fill="currentColor" stroke="none"/>
                        <line x1="14" y1="8" x2="20" y2="8" stroke="white" strokeWidth="2"/>
                      </>
                    )}
                    {item.icon === 'user' && <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
                  </svg>
                  <span className="text-gray-800 font-medium">{item.title}</span>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4">
              <button
                className="w-full flex items-center px-6 py-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                onClick={handleLogout}
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
    ) : null
  );

  const { user, isAuthenticated } = useAuth();
  const [userId, setUserId] = useState<string | null>('demo-user-123');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Use real user data from authentication if available
      if (visible && user) {
        setProfile({
          FullName: user.FullName || user.fullName || 'User',
          Email: user.Email || user.email || 'user@example.com',
          profilePhoto: '', // Empty for demo - will show initials
          Gender: 'Not specified',
          DateOfBirth: 'Not specified',
          MobileNumber: 'Not specified'
        });
        setUserId(user._id || 'demo-user-123');
      } else if (visible) {
        // Fallback to demo data if no user is authenticated
        setProfile({
          FullName: 'John Doe',
          Email: 'john.doe@example.com',
          profilePhoto: '', // Empty for demo - will show initials
          Gender: 'Male',
          DateOfBirth: '1990-01-01',
          MobileNumber: '+1234567890'
        });
      }
    };

    fetchUserProfile();
  }, [visible, user]);

  const navigationItems = [
    {
      title: 'Home',
      icon: 'home',
      isActive: true,
      onPress: () => {
        console.log('Navigate to Home');
        onClose();
      }
    },
    {
      title: 'Records',
      icon: 'document',
      isActive: false,
      onPress: () => {
        console.log('Navigate to Records');
        onClose();
      }
    },
    {
      title: 'PillPal',
      icon: 'pills',
      isActive: false,
      onPress: () => {
        console.log('Navigate to PillPal');
        onClose();
      }
    },
    {
      title: 'Profile',
      icon: 'user',
      isActive: false,
      onPress: () => {
        console.log('Navigate to Profile');
        onClose();
      }
    },
  ];

  const menuItems = [
    {
      title: 'Medical Records',
      icon: 'document',
      onPress: () => {
        console.log('Navigate to Medical Records');
        onClose();
      }
    },
    {
      title: 'Medication Reminders',
      icon: 'pill',
      onPress: () => {
        console.log('Navigate to Medication Reminders');
        onClose();
      }
    },
    {
      title: 'News and Updates',
      icon: 'news',
      onPress: () => {
        console.log('Navigate to News and Updates');
        onClose();
      }
    },
  ];

  // Get display name with priority order
  const getDisplayName = () => {
    if (profile && profile.FullName && profile.FullName.trim().length > 0) {
      return profile.FullName;
    }
    if (userName && typeof userName === "object" && userName.FullName && userName.FullName.trim().length > 0) {
      return userName.FullName;
    }
    if (userName && typeof userName === "string" && userName.trim().length > 0) {
      return userName;
    }
    return "User";
  };

  // Get profile photo with priority order
  const getProfilePhoto = () => {
    return profile?.profilePhoto ||
      (userName && typeof userName === "object" ? userName.profilePhoto : null);
  };

  const displayName = getDisplayName();
  const profilePhotoUri = getProfilePhoto();

  // Don't render anything if not visible and on mobile
  if (!visible && typeof window !== 'undefined' && window.innerWidth < 768) return null;



  return (
    <>
      <DesktopSidebar />
      <MobileOverlay />
    </>
  );
};

export default ResponsiveNavigation;
