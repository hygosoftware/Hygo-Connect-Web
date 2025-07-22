import React from 'react';
import { Typography, Icon } from './';

interface Qualification {
  _id?: string;
  degree?: string;
  name?: string;
  institution?: string;
  year?: number;
}

interface DoctorCardProps {
  doctorId: string;
  fullName: string;
  rating: number;
  imageSrc: string;
  profileImage?: string;
  qualifications: (Qualification | string)[];
  specializations: string[];
  onPress?: () => void;
  className?: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctorId,
  fullName,
  rating,
  imageSrc,
  profileImage,
  qualifications,
  specializations,
  onPress,
  className = '',
}) => {
  // Prefer profileImage, then imageSrc, then fallback to doctor icon
  const resolvedImageSrc = profileImage || imageSrc;

  // Handle card press
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      console.log(`Navigate to doctor detail: ${doctorId}`);
      // Here you would typically navigate to doctor detail page
    }
  };

  // Format qualifications
  const formattedQualifications = Array.isArray(qualifications) && qualifications.length > 0
    ? qualifications.map((q) => typeof q === 'string' ? q : q.degree || q.name || '').filter(Boolean).join(", ")
    : "Medical Professional";

  // Format specializations
  const formattedSpecializations = specializations && specializations.length > 0
    ? specializations.join(", ")
    : "";

  // Ensure rating is valid
  const validRating = Number.isFinite(rating) && rating > 0 ? rating : 4.5;

  return (
    <button
      className={`bg-white p-3 rounded-xl mr-4 w-44 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={handlePress}
    >
      <div className="flex flex-col items-center">
        {/* Doctor Image */}
        <div className="relative mb-2">
          {resolvedImageSrc ? (
            <img
              src={resolvedImageSrc}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover"
              onError={(e) => {
                // Hide image and show icon fallback
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = parent.querySelector('.fallback-avatar');
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }
              }}
            />
          ) : null}

          {/* Fallback avatar icon */}
          <div className={`fallback-avatar w-20 h-20 bg-blue-800 rounded-full flex items-center justify-center ${resolvedImageSrc ? 'hidden' : 'flex'}`}>
            <Icon name="doctor" size="medium" color="white" />
          </div>

          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
        </div>

        {/* Doctor Name */}
        <Typography variant="body1" className="font-semibold text-center text-base mb-1 truncate w-full">
          {fullName}
        </Typography>

        {/* Qualifications */}
        <div className="mt-1">
          <Typography variant="caption" className="text-gray-600 text-center leading-4 truncate w-full">
            {formattedQualifications}
          </Typography>
        </div>

        {/* Specializations */}
        {formattedSpecializations && (
          <div className="mt-2">
            <Typography variant="caption" className="text-gray-600 text-center leading-4 truncate w-full">
              {formattedSpecializations}
            </Typography>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mt-2">
          <Typography variant="body2" className="text-blue-800 font-bold mr-1">
            {validRating.toFixed(1)}
          </Typography>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${
                  star <= Math.round(validRating) ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

export default DoctorCard;
