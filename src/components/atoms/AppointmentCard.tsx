"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  variant?: 'default' | 'compact' | 'modern';
  reason?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
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
  variant = 'default',
  reason,
  paymentStatus,
}) => {
  const router = useRouter();

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
          gradient: 'bg-gradient-to-r from-[#0E3293] to-[#0E3293]',
          icon: <Icon name="video" size="small" color="white" />,
          label: 'Video Call'
        };
      default:
        return {
          gradient: 'bg-gradient-to-r from-[#0E3293] to-[#0E3293]',
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
        // Default upcoming: show Scheduled unless payment pending
        if (paymentStatus === 'pending') {
          return {
            color: 'bg-blue-100',
            textColor: 'text-blue-700',
            label: 'Pending Payment',
            icon: <Icon name="wallet" size="small" color="#1d4ed8" />
          };
        }
        return {
          color: 'bg-blue-100',
          textColor: 'text-blue-700',
          label: 'Scheduled',
          icon: <Icon name="calendar" size="small" color="#1d4ed8" />
        };
    }
  };

  const modeInfo = getModeInfo();
  const statusInfo = getStatusInfo();

  const doctorName = (() => {
    const name = doctor?.fullName || 'Unknown Doctor';
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

  const rootCardClasses = (() => {
    const base = 'bg-white overflow-hidden transition-all duration-300 cursor-pointer w-full';
    if (variant === 'compact') {
      return `${base} rounded-2xl shadow border border-gray-100 hover:shadow-md`;
    }
    if (variant === 'modern') {
      return `${base} rounded-2xl border border-gray-200 hover:shadow-sm`;
    }
    return `${base} rounded-t-3xl rounded-b-2xl mr-4 shadow-lg hover:shadow-xl min-w-[260px] max-w-[350px] sm:min-w-[280px] sm:w-80`;
  })();

  // Modern variant: entirely different flat layout
  if (variant === 'modern') {
    return (
      <div className={`${rootCardClasses} group`} onClick={onPress}>
        <div className="p-4 sm:p-5">
          {/* Top row: Doctor + Status badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {doctor?.avatar ? (
                <img src={doctor.avatar} alt={doctorName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0 border border-gray-200" />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-900 flex-shrink-0">
                  <Icon name="doctor" size="small" color="#0E3293" />
                </div>
              )}
              <div className="min-w-0">
                <Typography variant="body1" className="font-semibold text-gray-900 truncate text-sm sm:text-base">{doctorName}</Typography>
                <Typography variant="body2" className="text-gray-600 truncate text-xs sm:text-sm">{specialty}</Typography>
              </div>
            </div>
            {/* Status badge */}
            <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
              paymentStatus === 'pending' ? 'bg-blue-100 text-blue-700' :
              status === 'ongoing' ? 'bg-green-100 text-green-700' :
              status === 'completed' ? 'bg-gray-100 text-gray-700' :
              status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <span className="inline-block">
                {paymentStatus === 'pending' ? <Icon name="wallet" size="small" color="#1d4ed8" /> :
                 status === 'ongoing' ? <Icon name="clock" size="small" color="#16a34a" /> :
                 status === 'completed' ? <Icon name="check" size="small" color="#6b7280" /> :
                 status === 'cancelled' ? <Icon name="x" size="small" color="#dc2626" /> : <Icon name="calendar" size="small" color="#1d4ed8" />}
              </span>
              <span className="font-medium">{paymentStatus === 'pending' ? 'Pending Payment' : (status === 'upcoming' ? 'Scheduled' : status?.charAt(0).toUpperCase() + status?.slice(1))}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-4" />

          {/* Details rows like the screenshot */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Icon name="calendar" size="small" color="#0E3293" />
              <Typography variant="body2" className="ml-2 text-gray-800 text-sm">{formattedDate}</Typography>
              <span className="mx-3 text-gray-300">|</span>
              <Icon name="clock" size="small" color="#0E3293" />
              <Typography variant="body2" className="ml-2 text-gray-800 text-sm">{formattedTime}</Typography>
            </div>
            <div className="flex items-center">
              <Icon name="location" size="small" color="#0E3293" />
              <Typography variant="body2" className="ml-2 text-gray-800 text-sm">{mode === 'VideoCall' ? 'Video Appointment' : 'InPerson Appointment'}</Typography>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-blue-50 text-blue-900 rounded-lg px-3 py-2 flex items-center">
                <Icon name="hospital" size="small" color="#0E3293" />
                <Typography variant="body2" className="ml-2 text-blue-900 text-sm">Clinic</Typography>
              </div>
            </div>
            <div className="flex items-center">
              <Icon name="document" size="small" color="#6b7280" />
              <Typography variant="body2" className="ml-2 text-gray-600 text-sm">Reason: {reason || 'General Consultation'}</Typography>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              className="bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              onClick={(e) => { e.stopPropagation(); onPress(); }}
            >
              View Details
            </button>
            {mode === 'InPerson' && qrCode && appointmentId && (
              <button
                className="bg-gray-100 hover:bg-gray-200 rounded-lg w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); router.push(`/qr-code/${appointmentId}`); }}
              >
                <Icon name="qr-code" size="small" color="#0E3293" />
              </button>
            )}
            {mode === 'VideoCall' && (
              <button
                className="bg-green-100 hover:bg-green-200 rounded-lg w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); console.log('Join video call'); }}
              >
                <Icon name="video" size="small" color="#059669" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${rootCardClasses} ${className}`}
      onClick={onPress}
    >
      {/* Header with gradient */}
      <div className={`${modeInfo.gradient} flex justify-between items-center ${variant === 'compact' ? 'p-2' : 'p-2 sm:p-3'}`}>
        <div className="flex items-center flex-1 min-w-0">
          {modeInfo.icon}
          <Typography variant="body2" className={`text-white font-semibold ml-2 truncate ${variant === 'compact' ? 'text-xs' : 'text-sm sm:text-base'}`}>
            {modeInfo.label}
          </Typography>
        </div>

        <div className={`${statusInfo.color} px-2 py-1 rounded-full flex items-center ${variant === 'compact' ? 'max-w-[60%]' : 'max-w-[50%]'} ml-2`}>
          {statusInfo.icon}
          <Typography variant="caption" className={`${statusInfo.textColor} font-medium ml-1 truncate ${variant === 'compact' ? 'text-[10px]' : 'text-xs'}`}>
            {statusInfo.label.length > 12 ? statusInfo.label.substring(0, 10) + '...' : statusInfo.label}
          </Typography>
        </div>
      </div>

      {/* Main content */}
      <div className={`${variant === 'compact' ? 'p-3' : 'p-3 sm:p-4'}`}>
        {/* Doctor info */}
        <div className="flex items-center mb-3">
          <div className="relative flex-shrink-0">
            <div className={`${variant === 'compact' ? 'w-9 h-9' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-full flex items-center justify-center`} style={{ backgroundColor: '#0E3293' }}>
              <Icon name="doctor" size="small" color="white" />
            </div>
            <div className={`absolute bg-green-400 rounded-full border-2 border-white -bottom-0.5 -right-0.5 ${variant === 'compact' ? 'w-2.5 h-2.5' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
          </div>

          <div className="ml-3 flex-1 min-w-0">
            <Typography variant="body1" className={`font-bold text-gray-900 mb-0.5 truncate ${variant === 'compact' ? 'text-sm' : 'text-sm sm:text-base'}`}>
              {doctorName}
            </Typography>
            <Typography variant="body2" className={`text-gray-600 truncate ${variant === 'compact' ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              {specialty}
            </Typography>
          </div>
        </div>

        {/* Appointment details */}
        <div className={`bg-gray-50 rounded-xl mb-3 ${variant === 'compact' ? 'p-2' : 'p-2 sm:p-3'}`}>
          <div className="flex items-center mb-2">
            <div className={`${variant === 'compact' ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-blue-100 rounded-full flex items-center justify-center mr-2 ${variant === 'compact' ? '' : 'sm:mr-3'} flex-shrink-0`}>
              <Icon name="calendar" size="small" color="#0E3293" />
            </div>
            <Typography variant="body2" className={`text-gray-800 font-semibold truncate ${variant === 'compact' ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              {formattedDate}
            </Typography>
          </div>

          <div className="flex items-center">
            <div className={`${variant === 'compact' ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'} bg-blue-100 rounded-full flex items-center justify-center mr-2 ${variant === 'compact' ? '' : 'sm:mr-3'} flex-shrink-0`}>
              <Icon name="clock" size="small" color="#0E3293" />
            </div>
            <Typography variant="body2" className={`text-gray-800 font-semibold truncate ${variant === 'compact' ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              {formattedTime}
            </Typography>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center gap-2">
          <button
            className={`text-white font-semibold ${variant === 'compact' ? 'py-2 px-3 text-xs' : 'py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm'} rounded-lg flex-1 transition-colors duration-200 hover:opacity-90`}
            style={{ backgroundColor: '#0E3293' }}
            onClick={(e) => {
              e.stopPropagation();
              onPress();
            }}
          >
            View Details
          </button>

          {/* Show QR code button only for in-person appointments */}
          {mode === 'InPerson' && qrCode && appointmentId && (
            <button
              className={`bg-gray-100 hover:bg-gray-200 rounded-lg ${variant === 'compact' ? 'w-9 h-9' : 'w-10 h-10 sm:w-12 sm:h-12'} flex items-center justify-center transition-colors duration-200 flex-shrink-0`}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/qr-code/${appointmentId}`);
              }}
            >
              <Icon name="qr-code" size="small" color="#0E3293" />
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
  );
};

export default AppointmentCard;