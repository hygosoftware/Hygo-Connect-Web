'use client';

import React from 'react';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';

const BookingReview: React.FC = () => {
  const { state, setStep } = useBooking();
  const { showToast } = useToast();

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

  const handleProceedToPayment = () => {
    // Validate all required information before proceeding
    if (!state.selectedDoctor || !state.selectedClinic || !state.selectedDate || !state.selectedSlot || !state.bookingDetails) {
      showToast({
        type: 'error',
        title: 'Missing Information',
        message: 'Please ensure all booking details are complete before proceeding to payment.'
      });
      return;
    }

    setStep('payment');
  };

  const handleEditDetails = () => {
    setStep('details');
  };

  if (!state.selectedDoctor || !state.selectedClinic || !state.selectedDate || !state.selectedSlot || !state.bookingDetails) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="alert" size="large" color="#f59e0b" />
          </div>
          <Typography variant="h6" className="text-gray-900 mb-2">
            Missing booking information
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-4">
            Please complete all previous steps to review your appointment
          </Typography>
          <div className="space-y-2 text-left bg-white rounded-lg p-4 border border-gray-200">
            <Typography variant="body2" className="text-gray-700 font-medium mb-2">
              Required information:
            </Typography>
            <div className="space-y-1">
              <div className={`flex items-center ${state.selectedDoctor ? 'text-green-600' : 'text-red-600'}`}>
                <Icon name={state.selectedDoctor ? 'check' : 'x'} size="small" className="mr-2" />
                <Typography variant="caption">Doctor selected</Typography>
              </div>
              <div className={`flex items-center ${state.selectedClinic ? 'text-green-600' : 'text-red-600'}`}>
                <Icon name={state.selectedClinic ? 'check' : 'x'} size="small" className="mr-2" />
                <Typography variant="caption">Clinic selected</Typography>
              </div>
              <div className={`flex items-center ${state.selectedDate ? 'text-green-600' : 'text-red-600'}`}>
                <Icon name={state.selectedDate ? 'check' : 'x'} size="small" className="mr-2" />
                <Typography variant="caption">Date selected</Typography>
              </div>
              <div className={`flex items-center ${state.selectedSlot ? 'text-green-600' : 'text-red-600'}`}>
                <Icon name={state.selectedSlot ? 'check' : 'x'} size="small" className="mr-2" />
                <Typography variant="caption">Time slot selected</Typography>
              </div>
              <div className={`flex items-center ${state.bookingDetails ? 'text-green-600' : 'text-red-600'}`}>
                <Icon name={state.bookingDetails ? 'check' : 'x'} size="small" className="mr-2" />
                <Typography variant="caption">Patient details filled</Typography>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              // Navigate to the first missing step
              if (!state.selectedDoctor) setStep('doctor');
              else if (!state.selectedClinic) setStep('clinic');
              else if (!state.selectedDate || !state.selectedSlot) setStep('date');
              else if (!state.bookingDetails) setStep('details');
            }}
            className="mt-4 bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-2 px-6 rounded-xl font-medium transition-colors"
          >
            Complete Missing Steps
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Typography variant="h4" className="text-gray-900 font-bold mb-2">
            Review Your Booking
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Please review all details before proceeding to payment
          </Typography>
        </div>

        <div className="space-y-6">
          {/* Doctor Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="text-gray-900 font-semibold">
                Doctor Details
              </Typography>
              <button
                onClick={() => setStep('doctor')}
                className="text-[#0e3293] hover:text-[#0e3293]/80 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={state.selectedDoctor.profileImage}
                  alt={state.selectedDoctor.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(state.selectedDoctor?.fullName ?? '')}&background=0e3293&color=fff`;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                {/* Doctor Name - Single line with ellipsis */}
                <Typography variant="h6" className="text-gray-900 font-semibold mb-2 truncate">
                  {state.selectedDoctor.fullName}
                </Typography>
                
                {/* Specialty */}
                <Typography variant="body2" className="text-gray-600 mb-2">
                  {state.selectedDoctor.specializations.join(', ')}
                </Typography>
                
                {/* Location */}
                <div className="flex items-center mb-3">
                  <Icon name="location" size="small" color="#6b7280" className="mr-2 flex-shrink-0" />
                  <Typography variant="body2" className="text-gray-600">
                    {state.selectedClinic?.clinicName || 'Clinic Location'}
                  </Typography>
                </div>
                
                {/* Consultation Fee */}
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 mb-3">
                  <Typography variant="body2" className="text-gray-700 font-medium">
                    Consultation Fee
                  </Typography>
                  <Typography variant="h6" className="text-[#0e3293] font-bold">
                    ₹{state.selectedDoctor.consultationFee}
                  </Typography>
                </div>
                
                {/* Additional Info - Ratings and Experience */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Icon name="star" size="small" color="#fbbf24" className="mr-1" />
                    <Typography variant="caption" className="text-gray-700">
                      {state.selectedDoctor.ratings.average} ({state.selectedDoctor.ratings.count})
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <Icon name="clock" size="small" color="#6b7280" className="mr-1" />
                    <Typography variant="caption" className="text-gray-600">
                      {state.selectedDoctor.experience} years
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="text-gray-900 font-semibold">
                Clinic Details
              </Typography>
              <button
                onClick={() => setStep('clinic')}
                className="text-[#0e3293] hover:text-[#0e3293]/80 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            
            <div>
              <Typography variant="h6" className="text-gray-900 font-medium mb-2">
                {state.selectedClinic.clinicName}
              </Typography>
              {state.selectedClinic.clinicAddress && (
                <div className="flex items-start space-x-2 mb-2">
                  <Icon name="location" size="small" color="#6b7280" className="mt-0.5" />
                  <Typography variant="body2" className="text-gray-600">
                    {state.selectedClinic.clinicAddress.addressLine && `${state.selectedClinic.clinicAddress.addressLine}, `}
                    {state.selectedClinic.clinicAddress.city && `${state.selectedClinic.clinicAddress.city}, `}
                    {state.selectedClinic.clinicAddress.state}
                  </Typography>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Icon name="star" size="small" color="#10b981" className="mr-1" />
                  <Typography variant="body2" className="text-gray-700">
                    {state.selectedClinic.rating}
                  </Typography>
                </div>
                <div className="flex items-center">
                  <Icon name="phone" size="small" color="#6b7280" className="mr-1" />
                  <Typography variant="body2" className="text-gray-600">
                    {state.selectedClinic.phone}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Date & Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="text-gray-900 font-semibold">
                Date & Time
              </Typography>
              <button
                onClick={() => setStep('date')}
                className="text-[#0e3293] hover:text-[#0e3293]/80 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Icon name="calendar" size="small" color="#0e3293" className="mr-3" />
                <div>
                  <Typography variant="body2" className="text-gray-600">Date</Typography>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {formatDate(state.selectedDate)}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center">
                <Icon name="clock" size="small" color="#0e3293" className="mr-3" />
                <div>
                  <Typography variant="body2" className="text-gray-600">Time</Typography>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {formatTime(state.selectedSlot.time)}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="text-gray-900 font-semibold">
                Patient Information
              </Typography>
              <button
                onClick={handleEditDetails}
                className="text-[#0e3293] hover:text-[#0e3293]/80 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="body2" className="text-gray-600">Patient Name</Typography>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {state.bookingDetails.patientName}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-600">Booking Type</Typography>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {state.bookingDetails.patientType === 'self' ? 'For Myself' : 'For Family Member'}
                  </Typography>
                </div>
              </div>

              {state.bookingDetails.patientType === 'family' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body2" className="text-gray-600">Age</Typography>
                    <Typography variant="body1" className="text-gray-900 font-medium">
                      {state.bookingDetails.patientAge} years
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body2" className="text-gray-600">Gender</Typography>
                    <Typography variant="body1" className="text-gray-900 font-medium">
                      {state.bookingDetails.patientGender ? state.bookingDetails.patientGender.charAt(0).toUpperCase() + state.bookingDetails.patientGender.slice(1) : ''}
                    </Typography>
                  </div>
                </div>
              )}

              {(state.bookingDetails.patientPhone || state.bookingDetails.patientEmail) && (
                <div className="grid grid-cols-2 gap-4">
                  {state.bookingDetails.patientPhone && (
                    <div>
                      <Typography variant="body2" className="text-gray-600">Phone</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {state.bookingDetails.patientPhone}
                      </Typography>
                    </div>
                  )}
                  {state.bookingDetails.patientEmail && (
                    <div>
                      <Typography variant="body2" className="text-gray-600">Email</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">
                        {state.bookingDetails.patientEmail}
                      </Typography>
                    </div>
                  )}
                </div>
              )}

              {state.bookingDetails.symptoms && (
                <div>
                  <Typography variant="body2" className="text-gray-600">Symptoms</Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {state.bookingDetails.symptoms}
                  </Typography>
                </div>
              )}

              {state.bookingDetails.notes && (
                <div>
                  <Typography variant="body2" className="text-gray-600">Additional Notes</Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {state.bookingDetails.notes}
                  </Typography>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
              Payment Summary
            </Typography>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Typography variant="body1" className="text-gray-600">
                  Consultation Fee
                </Typography>
                <Typography variant="body1" className="text-gray-900 font-medium">
                  ₹{state.selectedDoctor.consultationFee}
                </Typography>
              </div>
              <div className="flex justify-between">
                <Typography variant="body1" className="text-gray-600">
                  Platform Fee
                </Typography>
                <Typography variant="body1" className="text-gray-900 font-medium">
                  ₹50
                </Typography>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <Typography variant="h6" className="text-gray-900 font-semibold">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" className="text-[#0e3293] font-bold">
                    ₹{state.selectedDoctor.consultationFee + 50}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <Button
            onClick={handleProceedToPayment}
            className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-4 px-6 rounded-xl font-medium text-lg transition-colors"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
