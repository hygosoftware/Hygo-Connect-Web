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
      className={`bg-white p-4 rounded-xl mr-4 w-52 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex-shrink-0 ${className}`}
      onClick={handlePress}
    >
      <div className="flex flex-col items-center h-full">
        {/* Doctor Image */}
        <div className="relative mb-3">
          {resolvedImageSrc ? (
            <img
              src={resolvedImageSrc}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover object-center"
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
        <div className="w-full mb-2">
          <Typography
            variant="body1"
            className="font-semibold text-center text-sm leading-tight px-1"
            style={{
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {fullName}
          </Typography>
        </div>

        {/* Qualifications */}
        <div className="w-full mb-2">
          <Typography
            variant="caption"
            className="text-gray-600 text-center text-xs leading-tight px-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxHeight: '1.25rem'
            }}
          >
            {formattedQualifications}
          </Typography>
        </div>

        {/* Specializations */}
        {formattedSpecializations && (
          <div className="w-full mb-3">
            <Typography
              variant="caption"
              className="text-gray-500 text-center text-xs leading-tight px-1"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxHeight: '2.5rem'
              }}
            >
              {formattedSpecializations}
            </Typography>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center justify-center mt-auto">
          <Typography variant="body2" className="text-blue-800 font-bold mr-1 text-sm">
            {validRating.toFixed(1)}
          </Typography>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xs ${
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
