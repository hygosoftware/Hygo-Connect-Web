'use client';

import React from 'react';
import { Typography, Icon } from '../../components/atoms';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-blue-800 px-4 py-4 shadow-lg">
        <Typography variant="h6" className="text-white font-semibold">
          Profile
        </Typography>
        <Typography variant="body2" className="text-blue-100 text-sm">
          Manage your account and preferences
        </Typography>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <Icon name="user" size="large" color="#9ca3af" className="mb-4 w-16 h-16" />
          <Typography variant="h6" color="secondary" className="mb-2">
            User Profile
          </Typography>
          <Typography variant="body2" color="secondary" className="text-center mb-6">
            This page will show your profile information, settings, and preferences
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
