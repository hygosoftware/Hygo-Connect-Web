import React, { useState } from 'react';
import { Typography, Icon } from './';

interface AppointmentCardProps {
  doctor: {
    fullName?: string;
    specializations?: string[] | string;
    rating?: number;
    avatar?: string;
  };
  date: string;
  time?: string;
  onPress: () => void;
  mode?: 'VideoCall' | 'InPerson';
  qrCode?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  clinicName?: string;
  clinicCity?: string;
  clinic?: {
    _id?: string;
    clinicName?: string;
    clinicAddress?: {
      city?: string;
      state?: string;
      addressLine?: string;
    };
  };
  appointmentId?: string;
  className?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  doctor,
  date,
  time,
  onPress,
  mode = 'InPerson',
  qrCode,
  actualStartTime,
  actualEndTime,
  status = 'upcoming',
  clinicName,
  clinicCity,
  clinic,
  appointmentId,
  className = '',
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) return dateString;
      return parsedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatSingleTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (/^\d{1,2}:\d{2}(\s?(AM|PM|am|pm))?$/.test(timeStr.trim())) {
      return timeStr.replace(/\s?(am|pm)$/, (m) => m.toUpperCase());
    }
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${m} ${ampm}`;
    }
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    return timeStr;
  };

  const formatTimeRange = (range: string) => {
    const [start, end] = range.split('-').map(s => s.trim());
    return `${formatSingleTime(start)} - ${formatSingleTime(end)}`;
  };

  const formattedTime = (() => {
    if (actualStartTime && actualEndTime) {
      return `${formatSingleTime(actualStartTime)} - ${formatSingleTime(actualEndTime)}`;
    }
    if (time) {
      return formatTimeRange(time);
    }
    return 'N/A';
  })();

  const formattedDate = formatDate(date);

  const getModeInfo = () => {
    switch (mode) {
      case 'VideoCall':
        return {
          gradient: 'bg-gradient-to-r from-blue-800 to-blue-700',
          icon: <Icon name="video" size="small" color="white" />,
          label: 'Video Call'
        };
      default:
        return {
          gradient: 'bg-gradient-to-r from-blue-800 to-blue-700',
          icon: <Icon name="hospital" size="small" color="white" />,
          label: 'In Person'
        };
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'ongoing':
        return {
          color: 'bg-green-500',
          textColor: 'text-white',
          label: 'Ongoing',
          icon: <Icon name="clock" size="small" color="white" />
        };
      case 'completed':
        return {
          color: 'bg-gray-500',
          textColor: 'text-white',
          label: 'Completed',
          icon: <Icon name="check" size="small" color="white" />
        };
      case 'cancelled':
        return {
          color: 'bg-red-500',
          textColor: 'text-white',
          label: 'Cancelled',
          icon: <Icon name="x" size="small" color="white" />
        };
      default:
        const getClinicDisplayName = () => {
          if (clinic?.clinicName) {
            const city = clinic.clinicAddress?.city;
            return city ? `${clinic.clinicName}, ${city}` : clinic.clinicName;
          }
          if (clinicName && clinicCity) {
            return `${clinicName}, ${clinicCity}`;
          }
          if (clinicName) {
            return clinicName;
          }
          return 'HYGO Clinic';
        };

        return {
          color: 'bg-white border border-gray-200',
          textColor: 'text-blue-800',
          label: getClinicDisplayName(),
          icon: <Icon name="hospital" size="small" color="#1e40af" />
        };
    }
  };

  const modeInfo = getModeInfo();
  const statusInfo = getStatusInfo();

  const doctorName = (() => {
    const name = doctor?.fullName || 'Unknown Doctor';
    if (name.startsWith('Dr. ')) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0]} ${parts[1]}`;
      }
    }
    return name;
  })();

  let specialty = '';
  if (Array.isArray(doctor?.specializations)) {
    specialty = doctor.specializations[0] || 'General';
  } else if (typeof doctor?.specializations === 'string') {
    specialty = doctor.specializations;
  } else {
    specialty = 'General';
  }

  return (
    <>
      <div
        className={`bg-white rounded-t-3xl rounded-b-2xl mr-4 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer w-full min-w-[280px] max-w-[350px] sm:w-80 ${className}`}
        onClick={onPress}
      >
        {/* Header with gradient */}
        <div className={`${modeInfo.gradient} flex justify-between items-center p-2 sm:p-3`}>
          <div className="flex items-center flex-1 min-w-0">
            {modeInfo.icon}
            <Typography variant="body2" className="text-white font-semibold ml-2 truncate text-sm sm:text-base">
              {modeInfo.label}
            </Typography>
          </div>

          <div className={`${statusInfo.color} px-2 py-1 rounded-full flex items-center max-w-[50%] ml-2`}>
            {statusInfo.icon}
            <Typography variant="caption" className={`${statusInfo.textColor} font-medium ml-1 truncate text-xs`}>
              {statusInfo.label.length > 12 ? statusInfo.label.substring(0, 10) + '...' : statusInfo.label}
            </Typography>
          </div>
        </div>

        {/* Main content */}
        <div className="p-3 sm:p-4">
          {/* Doctor info */}
          <div className="flex items-center mb-3">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-800 rounded-full flex items-center justify-center">
                <Icon name="doctor" size="small" color="white" />
              </div>
              <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white -bottom-0.5 -right-0.5" />
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <Typography variant="body1" className="font-bold text-gray-900 mb-0.5 truncate text-sm sm:text-base">
                {doctorName}
              </Typography>
              <Typography variant="body2" className="text-gray-600 truncate text-xs sm:text-sm">
                {specialty}
              </Typography>
            </div>
          </div>

          {/* Appointment details */}
          <div className="bg-gray-50 rounded-xl mb-3 p-2 sm:p-3">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <Icon name="calendar" size="small" color="#1e40af" />
              </div>
              <Typography variant="body2" className="text-gray-800 font-semibold truncate text-xs sm:text-sm">
                {formattedDate}
              </Typography>
            </div>

            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <Icon name="clock" size="small" color="#1e40af" />
              </div>
              <Typography variant="body2" className="text-gray-800 font-semibold truncate text-xs sm:text-sm">
                {formattedTime}
              </Typography>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-2">
            <button
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg flex-1 transition-colors duration-200 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onPress();
              }}
            >
              View Details
            </button>

            {/* Show QR code button only for in-person appointments */}
            {mode === 'InPerson' && qrCode && (
              <button
                className="bg-gray-100 hover:bg-gray-200 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQRModal(true);
                }}
              >
                <Icon name="qr-code" size="small" color="#1e40af" />
              </button>
            )}

            {/* Show video call link button for video appointments */}
            {mode === 'VideoCall' && (
              <button
                className="bg-green-100 hover:bg-green-200 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Join video call');
                  // Here you would typically open the video call link
                }}
              >
                <Icon name="video" size="small" color="#059669" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrCode && showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 mx-4 max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col items-center">
              {qrCode.startsWith('data:image') ? (
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-64 sm:h-64 mb-4 object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-64 sm:h-64 mb-4 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Icon name="qr-code" size="large" color="#1e40af" />
                </div>
              )}
              <Typography variant="h6" className="font-semibold mb-4 text-gray-800 text-center text-lg sm:text-xl">
                Check-in QR Code
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-6 text-center text-sm sm:text-base">
                Show this QR code at the reception desk
              </Typography>
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                onClick={() => setShowQRModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
