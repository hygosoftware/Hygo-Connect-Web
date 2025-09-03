'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/apiServices';
import Icon from './Icon';

interface UserProfile {
  profilePhoto?: string | null;
  FullName: string;
  Email: string;
  Gender: string;
  DateOfBirth: string;
  MobileNumber: string;
}

interface UserNameWithPhoto {
  profilePhoto?: string;
  FullName?: string;
  [key: string]: any;
}

type NavIcon = 'home' | 'records' | 'document' | 'pills' | 'user' | 'pill' | 'news';
interface NavigationItem {
  title: string;
  icon: NavIcon;
  isActive?: boolean;
  onPress: () => void | Promise<void>;
}

interface ResponsiveNavigationProps {
  visible: boolean;
  onClose: () => void;
  navigation?: NavigationItem[];
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
  isMobileMenuOpen: isMobileMenuOpenProp,
}) => {
  // Sidebar expansion state: use controlled prop for desktop
  const isSidebarExpanded = isSidebarExpandedProp;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    FullName: 'User',
    Email: 'user@example.com',
    Gender: 'Not specified',
    DateOfBirth: 'Not specified',
    MobileNumber: 'Not specified',
  });
  const { user, isAuthenticated } = useAuth();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?._id) {
        const userId = user._id;
        try {
          const profile = await profileService.getProfileByUserId(userId);
          if (profile) {
            setUserProfile({
              profilePhoto: profile.profilePhoto,
              FullName: profile.FullName || user.FullName || user.fullName || 'User',
              Email: profile.Email || user.Email || user.email || 'user@example.com',
              Gender: profile.Gender || 'Not specified',
              DateOfBirth: profile.DateOfBirth || 'Not specified',
              MobileNumber: (() => {
                if (Array.isArray(profile.MobileNumber) && profile.MobileNumber.length > 0) {
                  return profile.MobileNumber[0]?.number || 'Not specified';
                }
                return typeof profile.MobileNumber === 'string' ? profile.MobileNumber : 'Not specified';
              })()
            });
          }
        } catch (error) {
          console.error('Error fetching user profile, using fallback data:', error);
          // Fallback to user data from auth if available
          if (user) {
            setUserProfile({
              FullName: user.FullName || user.fullName || 'User',
              Email: user.Email || user.email || 'user@example.com',
              profilePhoto: '',
              Gender: 'Not specified',
              DateOfBirth: 'Not specified',
              MobileNumber: 'Not specified'
            });
          }
        }
      } else if (!user) {
        // Demo data when no user is logged in
        setUserProfile({
          FullName: 'Demo User',
          Email: 'demo@example.com',
          profilePhoto: '',
          Gender: 'Not specified',
          DateOfBirth: 'Not specified',
          MobileNumber: 'Not specified'
        });
      }
    };

    fetchUserProfile();
  }, [user?._id, user?.FullName, user?.fullName, user?.Email, user?.email]);

  // User helpers - simplified since we have getDisplayName
  const getUserDisplayName = () => getDisplayName();
  const getUserEmail = () => userProfile.Email;
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
    if (onSidebarToggle) onSidebarToggle(!isSidebarExpanded);
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

  // Sync internal mobile menu state with external prop (controlled mode on mobile)
  useEffect(() => {
    if (typeof isMobileMenuOpenProp === 'boolean') {
      setIsMobileMenuOpen(isMobileMenuOpenProp);
    }
  }, [isMobileMenuOpenProp]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;
    if (isMobileMenuOpen) {
      const original = body.style.overflow;
      body.style.overflow = 'hidden';
      return () => { body.style.overflow = original; };
    }
    return;
  }, [isMobileMenuOpen]);
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
        {navigation.map((item: NavigationItem, index: number) => (
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
            onClick={() => { void item.onPress(); }}
          >
            <div className={isSidebarExpanded ? "flex-shrink-0" : ""}>
              <Icon name={item.icon} className={`w-6 h-6 ${item.isActive ? 'text-white' : 'text-blue-200'}`} />
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
          onClick={() => { void handleLogout(); }}
        >
          <Icon name="logout" className="w-6 h-6" />
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
          className="absolute inset-0 bg-black/30"
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
              {navigation.map((item: NavigationItem, index: number) => (
                <button
                  key={index}
                  className="w-full flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => {
                    void item.onPress();
                    handleCloseMobileMenu();
                  }}
                >
                  <Icon name={item.icon} className="w-6 h-6 text-blue-800 mr-4" />
                  <span className="text-gray-800 font-medium">{item.title}</span>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4">
              <button
                className="w-full flex items-center px-6 py-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                onClick={() => { void handleLogout(); }}
              >
                <Icon name="logout" className="w-6 h-6 text-red-600 mr-4" />
                <span className="text-red-600 font-bold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null
  );

  const userId = user?._id || 'demo-user-123';

  // Get display name with priority order
  const getDisplayName = () => userProfile.FullName;

  // Get profile photo with priority order
  const getProfilePhoto = () => {
    return userProfile?.profilePhoto ||
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