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

interface SubMenuItem {
  title: string;
  icon: string;
  onPress: () => void;
}

interface MenuItem {
  title: string;
  icon: string;
  hasSubmenu?: boolean;
  subItems?: SubMenuItem[];
  onPress: () => void;
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
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

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

      // Import AuthService dynamically to avoid circular dependencies
      const { AuthService } = await import('../../services/authService');
      await AuthService.logout();

      // Navigate to login page
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

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
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
      icon: 'records',
      hasSubmenu: true,
      subItems: [
        {
          title: 'All Records',
          icon: 'folder',
          onPress: () => {
            window.location.href = '/records';
            onClose();
          }
        },
        {
          title: 'Medical Reports',
          icon: 'document',
          onPress: () => {
            window.location.href = '/file-screen?folderId=medical-reports&userId=demo-user-123&folderName=Medical%20Reports';
            onClose();
          }
        },
        {
          title: 'Prescriptions',
          icon: 'pill',
          onPress: () => {
            window.location.href = '/file-screen?folderId=prescriptions&userId=demo-user-123&folderName=Prescriptions';
            onClose();
          }
        },
        {
          title: 'Medical Imaging',
          icon: 'image',
          onPress: () => {
            window.location.href = '/file-screen?folderId=medical-imaging&userId=demo-user-123&folderName=Medical%20Imaging';
            onClose();
          }
        },
        {
          title: 'Lab Results',
          icon: 'laboratory',
          onPress: () => {
            window.location.href = '/file-screen?folderId=lab-results&userId=demo-user-123&folderName=Lab%20Results';
            onClose();
          }
        }
      ],
      onPress: () => {
        window.location.href = '/records';
        onClose();
      }
    },
    {
      title: 'Medication Reminders',
      icon: 'pills',
      onPress: () => {
        window.location.href = '/pillpal';
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
      <div
        className={`w-72 h-full transform transition-transform duration-300 ${visible ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundColor: '#0e3293',
          background: 'linear-gradient(135deg, #0e3293 0%, #1e40af 50%, #0e3293 100%)',
          boxShadow: '8px 0 32px rgba(0, 0, 0, 0.4), inset -2px 0 8px rgba(0, 0, 0, 0.2)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div
            className="p-6 border-b border-blue-400"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex flex-col items-center mb-4">
              <div
                className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-2 border-2 border-blue-300 overflow-hidden"
                style={{
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)'
                }}
              >
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
              <Typography variant="h5" className="font-bold text-white text-center">
                {displayName}
              </Typography>
              <Typography variant="body2" className="text-blue-200">
                View and edit profile
              </Typography>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 py-2 overflow-y-auto">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button
                  className="w-full flex items-center justify-between px-6 py-4 border-b border-blue-400 transition-all duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  onClick={() => {
                    if (item.hasSubmenu) {
                      toggleSubmenu(item.title);
                    } else {
                      item.onPress();
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="mr-4">
                      <Icon name={item.icon as any} size="medium" color="#bfdbfe" />
                    </div>
                    <Typography variant="body1" className="text-blue-200 font-medium">
                      {item.title}
                    </Typography>
                  </div>
                  {item.hasSubmenu && (
                    <Icon
                      name={expandedMenus[item.title] ? "chevron-up" : "chevron-down"}
                      size="small"
                      color="#bfdbfe"
                    />
                  )}
                </button>

                {/* Submenu Items */}
                {item.hasSubmenu && expandedMenus[item.title] && item.subItems && (
                  <div className="bg-blue-800 bg-opacity-50">
                    {item.subItems.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        className="w-full flex items-center px-12 py-3 border-b border-blue-500 border-opacity-30 transition-all duration-200 hover:bg-blue-700 hover:bg-opacity-30"
                        onClick={subItem.onPress}
                      >
                        <div className="mr-3">
                          <Icon name={subItem.icon as any} size="small" color="#93c5fd" />
                        </div>
                        <Typography variant="body2" className="text-blue-100 font-medium">
                          {subItem.title}
                        </Typography>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <button
              className="w-full flex items-center px-6 py-4 bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
              onClick={handleLogout}
            >
              <Icon name="logout" size="medium" color="#ffffff" className="mr-4" />
              <Typography variant="body1" className="text-white font-bold">
                Logout
              </Typography>
            </button>
          </div>

          {/* Version Info */}
          <div className="flex items-center justify-center mt-4 mb-6">
            <Typography variant="caption" className="text-blue-200">
              HealthCare App v1.0.0
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
