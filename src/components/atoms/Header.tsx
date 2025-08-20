"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Icon } from './';
// Removed useHeader to avoid conditional hook usage in this atom component

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
  onScanPress = () => { },
  onMenuPress = () => { },
  showBranding = true,
  showSearch = true,
  className = '',
}) => {
  const router = useRouter();

  // Use provided prop for mobile menu handling to keep this component context-agnostic
  const mobileMenuHandler = onMenuPress;
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
    router.push('/booking');
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
    <div className={`px-4 py-3 bg-blue-800 shadow-sm ${className}`}>
      {/* Compact Header - Single Row */}
      <div className="flex justify-between items-center">
        {/* Left Side - Menu & Greeting */}
        <div className="flex items-center flex-1">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 hover:bg-white/30 transition-colors duration-200"
            onClick={mobileMenuHandler}
          >
            <Icon name="menu" size="small" color="white" />
          </button>

          {/* Compact Greeting */}
          <div>
            <Typography variant="body2" className="text-white font-semibold">
              Hi, {userName ? userName.split(' ')[0] : 'User'}!
            </Typography>
            <Typography variant="caption" className="text-white/70 text-xs">
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
            </Typography>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Location */}
          <button
            className="hidden sm:flex items-center bg-white/15 px-3 py-1.5 rounded-lg hover:bg-white/25 transition-colors duration-200"
            onClick={permissionDenied ? handleLocationPermission : handleLocationPress}
          >
            <Icon name="location" size="small" color="white" className="mr-1" />
            <Typography variant="caption" className="text-white text-xs truncate max-w-20">
              {currentAddress || 'Location'}
            </Typography>
          </button>

          {/* Notification */}
          <button
            className="relative w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            onClick={handleNotificationPress}
          >
            <Icon name="notification" size="small" color="white" />
            {unreadNotificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <Typography variant="caption" className="text-white font-bold text-xs">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount.toString()}
                </Typography>
              </div>
            )}
          </button>

          {/* Book Appointment Button */}
          <button
            className="bg-white rounded-lg flex items-center py-1.5 px-3 hover:bg-gray-50 transition-colors duration-200"
            onClick={handleBookAppointment}
          >
            <Icon name="plus" size="small" color="#1e40af" className="mr-1" />
            <Typography variant="caption" className="font-semibold text-blue-800 text-xs">
              Book Appointment
            </Typography>
          </button>
        </div>
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
