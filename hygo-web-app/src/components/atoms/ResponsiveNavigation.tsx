import React, { useEffect, useState } from 'react';
import { Typography, Icon } from './';

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
  isExpanded?: boolean;
}

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  visible,
  onClose,
  navigation,
  userName,
  className = '',
  isExpanded = true,
}) => {
  const [userId, setUserId] = useState<string | null>('demo-user-123');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Simulate fetching user profile - static data for demo
      if (visible) {
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
  }, [visible]);

  const handleLogout = async () => {
    try {
      console.log('Logout clicked');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items (same as bottom navigation)
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

  // Desktop Sidebar (always visible on desktop)
  const DesktopSidebar = () => (
    <div className={`hidden md:flex md:flex-col ${isExpanded ? 'md:w-72' : 'md:w-20'} md:bg-white md:h-screen md:shadow-lg md:border-r md:border-gray-200 md:fixed md:left-0 md:top-0 md:z-40 transition-all duration-300`}>
      {/* Header without toggle button */}
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className={`${isExpanded ? 'h-12 w-12' : 'h-10 w-10'} rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300 overflow-hidden transition-all duration-300`}>
            {profilePhotoUri ? (
              <img
                src={profilePhotoUri}
                alt="Profile"
                className={`${isExpanded ? 'h-12 w-12' : 'h-10 w-10'} rounded-full object-cover`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Typography variant={isExpanded ? "h4" : "h5"} className="font-bold text-blue-800">
                {displayName.charAt(0).toUpperCase()}
              </Typography>
            )}
          </div>
          {isExpanded && (
            <div className="ml-3">
              <Typography variant="body1" className="font-bold text-gray-800">
                {displayName}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Healthcare App
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="py-2">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            className={`w-full ${isExpanded ? 'flex items-center px-4' : 'flex justify-center px-2'} py-3 hover:bg-blue-50 transition-colors duration-200 ${
              item.isActive ? 'bg-blue-100 border-r-4 border-blue-600' : ''
            }`}
            onClick={item.onPress}
          >
            <div className={isExpanded ? "flex-shrink-0" : ""}>
              <Icon
                name={item.icon as any}
                size="medium"
                color={item.isActive ? "#1e40af" : "#6b7280"}
              />
            </div>
            {isExpanded && (
              <Typography
                variant="body2"
                className={`ml-3 font-medium ${
                  item.isActive ? 'text-blue-800' : 'text-gray-700'
                }`}
              >
                {item.title}
              </Typography>
            )}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-2"></div>

      {/* Additional Menu Items */}
      <div className="flex-1 py-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full ${isExpanded ? 'flex items-center px-4' : 'flex justify-center px-2'} py-3 hover:bg-gray-50 transition-colors duration-200`}
            onClick={item.onPress}
          >
            <div className={isExpanded ? "flex-shrink-0" : ""}>
              <Icon name={item.icon as any} size="medium" color="#6b7280" />
            </div>
            {isExpanded && (
              <Typography variant="body2" className="ml-3 text-gray-700 font-medium">
                {item.title}
              </Typography>
            )}
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <button
          className={`w-full ${isExpanded ? 'flex items-center px-4' : 'flex justify-center px-2'} py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200`}
          onClick={handleLogout}
        >
          <div className={isExpanded ? "flex-shrink-0" : ""}>
            <Icon name="logout" size="medium" color="#dc2626" />
          </div>
          {isExpanded && (
            <Typography variant="body2" className="ml-3 text-red-600 font-bold">
              Logout
            </Typography>
          )}
        </button>
      </div>

      {/* Version Info */}
      {isExpanded && (
        <div className="flex items-center justify-center mb-4">
          <Typography variant="caption" className="text-gray-400">
            HealthCare App v1.0.0
          </Typography>
        </div>
      )}
    </div>
  );

  // Mobile Overlay (shows when visible on mobile)
  const MobileOverlay = () => (
    <div className={`md:hidden fixed inset-0 z-50 flex ${visible ? '' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Side Menu */}
      <div className={`w-72 bg-white h-full shadow-xl transform transition-transform duration-300 ${visible ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-6 bg-blue-50 border-b border-gray-200">
            <div className="flex flex-col items-center mb-4">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-2 border-2 border-blue-300 overflow-hidden">
                {profilePhotoUri ? (
                  <img
                    src={profilePhotoUri}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Typography variant="h2" className="font-bold text-blue-800">
                    {displayName.charAt(0).toUpperCase()}
                  </Typography>
                )}
              </div>
              <Typography variant="h5" className="font-bold text-gray-800 text-center">
                {displayName}
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                View and edit profile
              </Typography>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                onClick={item.onPress}
              >
                <div className="mr-4">
                  <Icon name={item.icon as any} size="medium" color="#1e40af" />
                </div>
                <Typography variant="body1" className="text-gray-800 font-medium">
                  {item.title}
                </Typography>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <button
              className="w-full flex items-center px-6 py-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
              onClick={handleLogout}
            >
              <Icon name="logout" size="medium" color="#dc2626" className="mr-4" />
              <Typography variant="body1" className="text-red-600 font-bold">
                Logout
              </Typography>
            </button>
          </div>

          {/* Version Info */}
          <div className="flex items-center justify-center mt-4 mb-6">
            <Typography variant="caption" className="text-gray-400">
              HealthCare App v1.0.0
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileOverlay />
    </>
  );
};

export default ResponsiveNavigation;
