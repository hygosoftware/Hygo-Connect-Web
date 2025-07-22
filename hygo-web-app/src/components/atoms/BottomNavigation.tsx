import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Typography, Icon } from './';

interface BottomNavigationProps {
  userId: string;
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ userId, className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('User');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = () => {
      try {
        // In a real app, you'd get this from localStorage or context
        // For demo, using static data
        setUserName('John');
        setProfilePhoto(null); // No profile photo for demo
      } catch {
        setUserName('User');
        setProfilePhoto(null);
      }
    };
    fetchUserInfo();
  }, []);

  // Function to determine the color of the icon and text based on active tab
  const getTabColor = (tabPath: string) => {
    return pathname === tabPath ? '#0e3293' : '#94a3b8';
  };

  const isActive = (tabPath: string) => {
    return pathname === tabPath;
  };

  const navigationItems = [
    {
      path: '/home',
      icon: 'home',
      label: 'Home',
      onClick: () => router.push('/home')
    },
    {
      path: '/records',
      icon: 'document',
      label: 'Records',
      onClick: () => console.log('Navigate to Records')
    },
    {
      path: '/pillpal',
      icon: 'pill',
      label: 'Pillpal',
      onClick: () => router.push('/pillpal')
    },
    {
      path: '/profile',
      icon: 'user',
      label: userName && userName.length > 0 ? userName.split(' ')[0] : 'User',
      onClick: () => console.log('Navigate to Profile'),
      isProfile: true
    }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg z-40 ${className}`}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            className="flex-1 flex flex-col items-center py-1 px-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
            onClick={item.onClick}
          >
            {item.isProfile && profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-6 h-6 rounded-full mb-1 object-cover"
                onError={(e) => {
                  // Fallback to user icon if profile image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Icon 
                name={item.icon as any} 
                size="medium" 
                color={getTabColor(item.path)}
                className="mb-1"
              />
            )}
            <Typography 
              variant="caption" 
              className="text-xs truncate max-w-full"
              style={{ color: getTabColor(item.path) }}
            >
              {item.label}
            </Typography>
          </button>
        ))}
      </div>
      
      {/* Safe area padding for mobile devices */}
      <div className="h-2 sm:h-0"></div>
    </div>
  );
};

export default BottomNavigation;
