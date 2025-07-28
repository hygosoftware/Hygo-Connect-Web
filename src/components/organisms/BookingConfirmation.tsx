'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';

const BookingConfirmation: React.FC = () => {
  const router = useRouter();
  const { state, resetBooking } = useBooking();

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGoHome = () => {
    resetBooking();
    router.push('/home');
  };

  const handleViewAppointments = () => {
    resetBooking();
    router.push('/appointments');
  };

  const appointmentId = `APT-${Date.now().toString().slice(-6)}`;

  if (!state.selectedDoctor || !state.selectedClinic || !state.selectedDate || !state.selectedSlot) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h6" className="text-gray-900 mb-2">
            Booking information not found
          </Typography>
          <Button onClick={handleGoHome} className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check-circle" size="large" color="#10b981" />
          </div>
          <Typography variant="h3" className="text-gray-900 font-bold mb-2">
            Booking Confirmed!
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Your appointment has been successfully booked
          </Typography>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h6" className="text-gray-900 font-semibold">
              Appointment Details
            </Typography>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <Typography variant="caption" className="font-medium">
                Confirmed
              </Typography>
            </div>
          </div>

          {/* Appointment ID */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <Typography variant="body2" className="text-gray-600 mb-1">
              Appointment ID
            </Typography>
            <Typography variant="h6" className="text-gray-900 font-mono font-bold">
              {appointmentId}
            </Typography>
          </div>

          {/* Doctor and Clinic Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={state.selectedDoctor.profileImage}
                  alt={state.selectedDoctor.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(state.selectedDoctor.fullName)}&background=0e3293&color=fff`;
                  }}
                />
              </div>
              <div className="flex-1">
                <Typography variant="h6" className="text-gray-900 font-semibold mb-1">
                  {state.selectedDoctor.fullName}
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-2">
                  {state.selectedDoctor.specializations.join(', ')}
                </Typography>
                <div className="flex items-center">
                  <Icon name="location" size="small" color="#6b7280" className="mr-2" />
                  <Typography variant="body2" className="text-gray-600">
                    {state.selectedClinic.clinicName}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#0e3293]/5 rounded-lg">
              <div className="flex items-center">
                <Icon name="calendar" size="small" color="#0e3293" className="mr-3" />
                <div>
                  <Typography variant="caption" className="text-gray-600 block">
                    Date
                  </Typography>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {formatDate(state.selectedDate)}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center">
                <Icon name="clock" size="small" color="#0e3293" className="mr-3" />
                <div>
                  <Typography variant="caption" className="text-gray-600 block">
                    Time
                  </Typography>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {formatTime(state.selectedSlot.time)}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Clinic Address */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <Typography variant="body2" className="text-gray-600 mb-2">
                Clinic Address
              </Typography>
              <Typography variant="body1" className="text-gray-900 font-medium mb-1">
                {state.selectedClinic.clinicName}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {state.selectedClinic.clinicAddress.addressLine}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {state.selectedClinic.clinicAddress.city}, {state.selectedClinic.clinicAddress.state} {state.selectedClinic.clinicAddress.zipCode}
              </Typography>
              <div className="flex items-center mt-2">
                <Icon name="phone" size="small" color="#6b7280" className="mr-2" />
                <Typography variant="body2" className="text-gray-600">
                  {state.selectedClinic.phone}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
          <Typography variant="h6" className="text-blue-900 font-semibold mb-4">
            What's Next?
          </Typography>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                1
              </div>
              <div>
                <Typography variant="body2" className="text-blue-800 font-medium">
                  Confirmation SMS/Email
                </Typography>
                <Typography variant="caption" className="text-blue-700">
                  You'll receive a confirmation message with appointment details
                </Typography>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                2
              </div>
              <div>
                <Typography variant="body2" className="text-blue-800 font-medium">
                  Arrive 15 minutes early
                </Typography>
                <Typography variant="caption" className="text-blue-700">
                  Please arrive at the clinic 15 minutes before your appointment time
                </Typography>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                3
              </div>
              <div>
                <Typography variant="body2" className="text-blue-800 font-medium">
                  Bring necessary documents
                </Typography>
                <Typography variant="caption" className="text-blue-700">
                  Carry your ID proof and any relevant medical records
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleViewAppointments}
            className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-4 px-6 rounded-xl font-medium text-lg transition-colors"
          >
            View My Appointments
          </Button>
          
          <Button
            onClick={handleGoHome}
            className="w-full bg-white hover:bg-gray-50 text-[#0e3293] border-2 border-[#0e3293] py-4 px-6 rounded-xl font-medium text-lg transition-colors"
          >
            Back to Home
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start">
            <Icon name="info" size="small" color="#6b7280" className="mr-3 mt-0.5" />
            <div>
              <Typography variant="body2" className="text-gray-700 font-medium mb-1">
                Need Help?
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                If you need to reschedule or cancel your appointment, please contact us at least 2 hours before your appointment time.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
