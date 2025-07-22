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

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation?: any; // For now, we'll handle navigation differently
  userName: string | UserNameWithPhoto | null;
  className?: string;
}

const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  navigation,
  userName,
  className = '',
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

  if (!visible || !userId) return null;

  const handleLogout = async () => {
    try {
      console.log('Logout clicked');
      // Clear any stored data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      
      // Navigate to login page
      window.location.href = '/login';
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      title: 'My Profile',
      icon: 'user',
      onPress: () => {
        console.log('Navigate to Profile');
        onClose();
      }
    },
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

  return (
    <div className={`fixed inset-0 z-50 flex ${className}`}>
      {/* Backdrop - Very subtle or transparent */}
      <div
        className="absolute inset-0 bg-black bg-opacity-10 transition-opacity duration-300"
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
                      console.log('Failed to load profile image');
                      // Hide the image and show initials instead
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
};

export default SideMenu;
