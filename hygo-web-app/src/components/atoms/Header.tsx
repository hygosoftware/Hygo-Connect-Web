import React, { useState, useEffect } from 'react';
import { Typography, Icon } from './';
import { useHeader } from './HeaderWrapper';

interface HeaderProps {
  userName?: string | null;
  onScanPress?: () => void;
  onMenuPress?: () => void;
  showBranding?: boolean;
  showSearch?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  userName = null,
  onScanPress = () => {},
  onMenuPress = () => {},
  showBranding = true,
  showSearch = true,
  className = '',
}) => {
  // Try to get the mobile menu handler from context, fallback to prop
  let mobileMenuHandler = onMenuPress;
  try {
    const { onMobileMenuToggle } = useHeader();
    mobileMenuHandler = onMobileMenuToggle;
  } catch {
    // Context not available, use the prop
  }
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(3); // Static for demo
  const [currentAddress, setCurrentAddress] = useState('New York, NY');
  const [locationLoading, setLocationLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Simulate loading unread notifications
  useEffect(() => {
    // Static demo data
    setUnreadNotificationCount(3);
  }, []);

  const handleBookAppointment = () => {
    console.log('Book appointment clicked');
    // Navigate to book appointment page
  };

  const handleNotificationPress = () => {
    console.log('Notification clicked');
    // Navigate to notifications page
  };

  const handleLocationPress = () => {
    console.log('Location clicked');
    setShowLocationModal(true);
  };

  const handleLocationPermission = () => {
    console.log('Request location permission');
    setPermissionDenied(false);
    setLocationLoading(true);
    // Simulate location loading
    setTimeout(() => {
      setLocationLoading(false);
      setCurrentAddress('Current Location, NY');
    }, 2000);
  };

  return (
    <div className={`px-4 pt-3 pb-6 shadow-lg bg-blue-800 ${className}`}>
      {/* Top row with menu, location and notification */}
      <div className="flex justify-between items-center mb-4">
        {/* Left side - Menu and Location */}
        <div className="flex items-center flex-1">
          {/* Menu button - Only visible on mobile */}
          <button
            className="md:hidden w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 hover:bg-white/30 transition-colors duration-200"
            onClick={mobileMenuHandler}
          >
            <Icon name="menu" size="small" color="white" />
          </button>

          {/* Location Display with Dropdown */}
          <button
            className="flex items-center bg-white/15 px-3 py-2 rounded-full flex-1 max-w-48 hover:bg-white/25 transition-colors duration-200"
            onClick={permissionDenied ? handleLocationPermission : handleLocationPress}
          >
            <Icon 
              name={permissionDenied ? "alert" : "location"} 
              size="small" 
              color="white" 
              className="mr-2"
            />
            <Typography 
              variant="body2" 
              className="text-white flex-1 truncate"
            >
              {permissionDenied 
                ? 'Enable Location' 
                : (locationLoading ? 'Loading...' : (currentAddress || 'Select Location'))
              }
            </Typography>
            <Icon name="chevron-down" size="small" color="rgba(255,255,255,0.8)" className="ml-1" />
          </button>
        </div>

        {/* Right side - Notification */}
        <button
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative hover:bg-white/30 transition-colors duration-200"
          onClick={handleNotificationPress}
        >
          <Icon name="notification" size="small" color="white" />
          {/* Dynamic notification badge based on unread count */}
          {unreadNotificationCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <Typography variant="caption" className="text-white font-bold text-xs">
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount.toString()}
              </Typography>
            </div>
          )}
        </button>
      </div>

      {/* Greeting section with Book Appointment button */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Typography variant="body2" className="text-white/80">
            Hello,
          </Typography>
          <Typography variant="h4" className="text-white font-bold">
            {userName ? `${userName}!` : 'Welcome!'}
          </Typography>
          <Typography variant="caption" className="text-white/70 mt-1">
            How can we help you today?
          </Typography>
        </div>

        {/* Book Appointment Button - Responsive */}
        <button
          className="bg-white rounded-xl flex items-center shadow-lg py-2 px-4 sm:py-2.5 sm:px-5 min-w-[120px] max-w-[180px] justify-center hover:bg-gray-50 transition-colors duration-200 active:scale-95"
          onClick={handleBookAppointment}
        >
          <Icon name="plus" size="small" color="#0e3293" className="mr-2" />
          <Typography 
            variant="body2" 
            className="font-semibold text-blue-800 text-sm sm:text-base truncate"
          >
            Book Appointment
          </Typography>
        </button>
      </div>

      {/* Location Selection Modal - Placeholder for now */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <Typography variant="h5" className="mb-4">Select Location</Typography>
            <Typography variant="body1" className="mb-4">
              Current: {currentAddress}
            </Typography>
            <div className="flex space-x-2">
              <button 
                className="flex-1 bg-gray-200 py-2 px-4 rounded-lg"
                onClick={() => setShowLocationModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-blue-800 text-white py-2 px-4 rounded-lg"
                onClick={() => {
                  setCurrentAddress('New Location Selected');
                  setShowLocationModal(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
