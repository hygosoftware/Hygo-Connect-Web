'use client'
import React from 'react';
import Image from 'next/image';
import { User, Mail, Phone, MapPin, Calendar, Heart, Edit3, Eye } from 'lucide-react';

interface ProfileSummaryCardProps {
  profileData: {
    FullName?: string;
    Email?: string;
    MobileNumber?: string;
    profilePhoto?: string;
    Age?: string;
    BloodGroup?: string;
    City?: string;
    Country?: string;
  };
  completionPercentage: number;
  variant?: 'compact' | 'detailed';
  showEditButton?: boolean;
  onEdit?: () => void;
  onView?: () => void;
}

const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  profileData,
  completionPercentage,
  variant = 'detailed',
  showEditButton = false,
  onEdit,
  onView
}) => {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
              <Image
                src={profileData.profilePhoto || '/placeholder.svg'}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {profileData.FullName || 'Complete your profile'}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {profileData.Email || 'Add your email'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{completionPercentage}%</span>
            </div>
          </div>
          {showEditButton && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
              <Image
                src={profileData.profilePhoto || '/placeholder.svg'}
                alt="Profile"
                width={64}
                height={64}
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profileData.FullName || 'Complete your profile'}
            </h2>
            <p className="text-gray-600">
              {profileData.Email || 'Add your email address'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {onView && (
            <button
              onClick={onView}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        {completionPercentage < 100 && (
          <p className="text-xs text-gray-500 mt-1">
            Complete your profile to unlock all features
          </p>
        )}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {profileData.MobileNumber || 'Add phone'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {profileData.Age ? `${profileData.Age} years` : 'Add age'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {profileData.City && profileData.Country 
              ? `${profileData.City}, ${profileData.Country}` 
              : 'Add location'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Heart className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            {profileData.BloodGroup || 'Add blood group'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {(showEditButton || onView) && (
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          {onView && (
            <button
              onClick={onView}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              View Full Profile
            </button>
          )}
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSummaryCard;