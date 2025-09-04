'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { userSubscriptionService, appointmentService } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';

interface SubscriptionDetails {
  _id: string;
  status: string;
  isActive: boolean;
  remainingBookings: number;
  remainingFreeAppointments: number;
}

const BookingReview: React.FC = () => {
  const { state, setStep } = useBooking();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkSubscription = useCallback(async () => {
    try {
      const { userId } = TokenManager.getTokens();
      if (!userId) return;
      const sub = await userSubscriptionService.getActiveSubscription(userId);
      if (sub) setSubscription(sub as unknown as SubscriptionDetails);
    } catch (error) {
      // Non-blocking UI hint
      console.error('Failed to fetch subscription:', error);
    }
  }, []);

  useEffect(() => {
    void checkSubscription();
  }, [checkSubscription]);

  // Determine if the subscription grants a free appointment (same logic as BookingPayment)
  const hasFreeAppointment = useCallback((): boolean => {
    let raw = subscription as any;
    if (!raw) return false;

    const unwrap = (val: any): any => {
      if (!val || typeof val !== 'object') return val;
      if ('data' in val && (val as any).data != null) return (val as any).data;
      if ('subscription' in val && (val as any).subscription != null) return (val as any).subscription;
      if ('subscriptions' in val && (val as any).subscriptions != null) return (val as any).subscriptions;
      return val;
    };
    raw = unwrap(unwrap(raw));

    const isActiveValue = (val: any): boolean => {
      if (val === true || val === 1) return true;
      if (typeof val === 'string') {
        const v = val.toLowerCase();
        return v === 'true' || v === 'active' || v === 'yes' || v === 'enabled';
      }
      return false;
    };

    const getRemaining = (obj: any): number | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;
      const candidates = [
        'remainingFreeAppointments',
        'remainingAppointments',
        'remainingBookings',
        'freeAppointmentsLeft',
        'freeAppointmentsRemaining'
      ];
      for (const key of candidates) {
        const v = (obj as any)[key];
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
      }
      return undefined;
    };

    const isActive = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      const flags = ['isActive', 'status', 'is_active', 'active', 'subscriptionStatus'];
      for (const f of flags) {
        if (f in obj) return isActiveValue((obj as any)[f]);
      }
      return false;
    };

    const evaluate = (obj: any): boolean => {
      if (!obj) return false;
      const active = isActive(obj);
      const rem = getRemaining(obj);
      if (typeof rem === 'number') return active && rem > 0;
      return active;
    };

    if (Array.isArray(raw)) {
      const withRemaining = raw.find((s) => evaluate(s) && typeof getRemaining(s) === 'number');
      if (withRemaining) return true;
      return raw.some((s) => evaluate(s));
    }

    const result = evaluate(raw);
    if (process && (process as any).env && (process as any).env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[BookingReview] subscription check', { raw, result });
    }
    return result;
  }, [subscription]);

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

  // Convert 12-hour to 24-hour format
  const to24Hour = (time12h: string): string => {
    const m = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      const ampm = m[3].toUpperCase();
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    // Already 24-hour format
    const m24 = time12h.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      const h = Math.min(23, Math.max(0, parseInt(m24[1], 10)));
      const min = Math.min(59, Math.max(0, parseInt(m24[2], 10)));
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    return '';
  };

  // Normalize selected slot to { from, to }
  const getTimeRange = useCallback((): { from: string; to: string } | null => {
    const slot: any = state.selectedSlot as any;
    if (!slot) return null;
    
    // Try direct startTime/endTime first
    if (slot.startTime && slot.endTime) {
      const from24 = to24Hour(slot.startTime);
      const to24 = to24Hour(slot.endTime);
      if (from24 && to24 && from24 !== to24) {
        return { from: from24, to: to24 };
      }
    }
    
    // Try parsing from slot ID pattern: `${from}-${to}-${idx}`
    if (slot.id) {
      const idParts = slot.id.split('-');
      if (idParts.length >= 2) {
        const fromTime = idParts[0];
        const toTime = idParts[1];
        if (fromTime && toTime && fromTime !== toTime) {
          const from24 = to24Hour(fromTime);
          const to24 = to24Hour(toTime);
          if (from24 && to24) {
            return { from: from24, to: to24 };
          }
        }
      }
    }
    
    // Try parsing from time string with dash separator
    const raw = String(slot.time || slot.label || slot.value || '');
    if (raw) {
      const parts = raw.split('-').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const from24 = to24Hour(parts[0]);
        const to24 = to24Hour(parts[1]);
        if (from24 && to24 && from24 !== to24) {
          return { from: from24, to: to24 };
        }
      }
      
      // Fallback: create a 30-minute slot from the main time
      const baseTime = to24Hour(raw);
      if (baseTime) {
        const [hours, minutes] = baseTime.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours, minutes + 30, 0, 0);
        const endHours = endTime.getHours();
        const endMinutes = endTime.getMinutes();
        const toTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
        return { from: baseTime, to: toTime };
      }
    }
    
    return null;
  }, [state.selectedSlot]);

  const handleConfirmWithSubscription = useCallback(async () => {
    try {
      setIsProcessing(true);
      if (!state.selectedDoctor || !state.selectedClinic || !state.selectedDate || !state.selectedSlot || !state.bookingDetails) {
        showToast({ type: 'error', title: 'Missing Information', message: 'Please ensure all booking details are complete before confirming.' });
        return;
      }
      const eligible = hasFreeAppointment();
      if (!eligible) {
        showToast({ type: 'warning', title: 'Subscription Not Applicable', message: 'Your subscription does not cover this appointment.' });
        return;
      }

      const { userId } = TokenManager.getTokens();
      if (!userId) {
        showToast({ type: 'error', title: 'Authentication Required', message: 'Please sign in to proceed.' });
        return;
      }

      const yyyy = state.selectedDate.getFullYear();
      const mm = String(state.selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(state.selectedDate.getDate()).padStart(2, '0');
      const appointmentDate = `${yyyy}-${mm}-${dd}`;

      const timeRange = getTimeRange();
      if (!timeRange) {
        showToast({ type: 'error', title: 'Invalid Time', message: 'Could not parse selected time slot. Please reselect.' });
        return;
      }

      const payload = {
        user: String(userId),
        doctor: String(state.selectedDoctor._id),
        clinic: String(state.selectedClinic._id),
        appointmentDate,
        timeSlot: { from: timeRange.from, to: timeRange.to },
        consultationFee: state.selectedDoctor.consultationFee || 0,
        paymentMethod: 'Subscription',
        payment: { amount: 0, isPaid: true, method: 'Subscription', status: 'paid' }
      } as const;

      const appointment = await appointmentService.bookAppointment(payload);

      try {
        await userSubscriptionService.useService({
          userId,
          service: 'appointment',
          appointmentId: appointment?._id,
          action: 'use',
          count: 1,
        });
      } catch (e) {
        console.warn('[BookingReview] Failed to record subscription usage', e);
      }

      showToast({ type: 'success', title: 'Appointment Confirmed', message: 'Your appointment has been confirmed using your subscription.' });
      setStep('confirmation');
    } catch (error) {
      console.error('Confirm with subscription failed:', error);
      const msg = (error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to confirm booking';
      showToast({ type: 'error', title: 'Booking Failed', message: msg });
    } finally {
      setIsProcessing(false);
    }
  }, [state, hasFreeAppointment, getTimeRange, showToast, setStep]);

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
            {(() => {
              const base = state.selectedDoctor?.consultationFee || 0;
              const eligible = hasFreeAppointment();
              const total = eligible ? 0 : base;
              return (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Typography variant="body1" className="text-gray-600">
                      Consultation Fee
                    </Typography>
                    <Typography variant="body1" className="text-gray-900 font-medium">
                      ₹{base}
                    </Typography>
                  </div>
                  {eligible && (
                    <div className="flex justify-between text-green-600">
                      <Typography variant="body1">Subscription Discount</Typography>
                      <Typography variant="body1">-₹{base}</Typography>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <Typography variant="h6" className="text-gray-900 font-semibold">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" className="text-[#0e3293] font-bold">
                        {total === 0 ? 'FREE' : `₹${total}`}
                      </Typography>
                    </div>
                  </div>
                  {eligible && (
                    <div className="text-xs text-green-600 text-center">
                      {typeof (subscription as any)?.remainingFreeAppointments === 'number'
                        ? `${(subscription as any).remainingFreeAppointments} free appointment(s) remaining in your subscription`
                        : 'Your active subscription will cover this appointment for free'}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Action Button (single) */}
          <Button
  onClick={handleProceedToPayment}
  disabled={isProcessing}
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
