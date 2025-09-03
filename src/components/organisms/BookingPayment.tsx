'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { getRazorpayConfig, RazorpayOrderData } from '../../lib/razorpay';
import { appointmentService, paymentService, userSubscriptionService } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';

// Razorpay types
declare global {
  interface Window {
    Razorpay: {
      new (options: Record<string, unknown>): {
        open: () => void;
      };
    };
  }
}

const BookingPayment: React.FC = () => {
  const { state, setPaymentMethod, setPaymentStatus, setStep, setLoading } = useBooking();
  const { showToast } = useToast();

  // Validation check for required booking information
  const isBookingComplete = state.selectedDoctor &&
    state.selectedClinic &&
    state.selectedDate &&
    state.selectedSlot &&
    state.bookingDetails;

    const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | null>(null);
  const [showCashConfirm, setShowCashConfirm] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [subscriptionUsed, setSubscriptionUsed] = useState(false);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [specializedAvailability, setSpecializedAvailability] = useState<any>(null);
  const baseTotalAmount = state.selectedDoctor ? state.selectedDoctor.consultationFee + 50 : 0;
  const [effectiveTotal, setEffectiveTotal] = useState<number>(baseTotalAmount);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = (): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    void loadRazorpayScript();
  }, []);

  // Extract a useful error message from various error shapes (Axios, Error, string)
  const extractErrorMessage = (err: unknown): string => {
    const fallback = 'An unexpected error occurred. Please try again.';
    try {
      if (typeof err === 'string') return err || fallback;
      if (err && typeof err === 'object') {
        const anyErr = err as any;
        const msg = anyErr?.response?.data?.message
          ?? anyErr?.response?.data?.error
          ?? anyErr?.response?.data?.errors?.[0]?.message
          ?? anyErr?.message;
        if (typeof msg === 'string' && msg.trim()) return msg;
        const data = anyErr?.response?.data;
        if (data && typeof data === 'object') {
          const s = JSON.stringify(data);
          if (s && s !== '{}' && s !== 'null') return s;
        }
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  // Check if doctor is specialized
  const isDoctorSpecialized = (doctor: any) => {
    if (!doctor) return false;
    return doctor.isSpecialized || 
      (doctor.specializations && doctor.specializations.length > 0 && 
       !doctor.specializations.some((spec: string) => 
         spec.toLowerCase().includes('general') || 
         spec.toLowerCase().includes('medicine')
       ));
  };

  // Handle specialized doctor availability check - requires active subscription
  const checkSpecializedAvailability = async (doctorId: string) => {
    if (!isDoctorSpecialized(state.selectedDoctor)) return null;
    
    try {
      const { userId } = TokenManager.getTokens();
      if (!userId) return null;
      
      // First check if user has any active subscription
      const subscription = await userSubscriptionService.getActiveSubscription(userId);
      const hasActiveSubscription = subscription && (
        (subscription as any).status?.toString().toLowerCase() === 'active' ||
        (subscription as any).isActive === true ||
        (subscription as any).remainingBookings > 0 ||
        (subscription as any).remainingFreeAppointments > 0
      );
      
      if (!hasActiveSubscription) {
        return {
          isAvailable: false,
          cardId: null,
          serviceName: 'Specialized Consultation',
          remainingCount: 0,
          quotaExhausted: true,
          message: 'No active subscription found for specialized consultation'
        };
      }
      
      // Only check specialized availability if user has an active subscription
      const response = await userSubscriptionService.checkSpecializedAvailability(userId, doctorId);
      
      // Transform the response to match the expected format
      if (!response?.data) {
        return null;
      }
      
      return {
        isAvailable: response.data.hasAccess,
        cardId: (response.data as any).cardId || `sub-${Date.now()}`,
        serviceName: 'Specialized Consultation',
        remainingCount: response.data.hasAccess ? 1 : 0,
        quotaExhausted: !response.data.hasAccess,
        message: response.data.message
      };
      
    } catch (error) {
      return null;
    }
  };

  // Show quota exhausted alert
  const showQuotaExhaustedAlert = (availability: any) => {
    const doctorName = availability.details?.doctorName || state.selectedDoctor?.fullName || 'the doctor';
    const fee = state.selectedDoctor?.consultationFee || 500;
    
    if (typeof window !== 'undefined') {
      if (window.confirm(
        `⚠️ Specialized Consultation Quota Exhausted\n\n` +
        `Dr. ${doctorName} has already been consulted under your subscription.\n\n` +
        `You can still book by paying ₹${fee}.\n\n` +
        `Would you like to continue?`
      )) {
        // User chose to continue with payment
        setQuotaExhausted(true);
        setSubscriptionUsed(false);
      } else {
        // User chose to go back
        setStep('review');
      }
    }
  };

  // Handle specialized booking
  const handleSpecializedBooking = async () => {
    if (!state.selectedDoctor?._id) return;
    
    const availability = await checkSpecializedAvailability(state.selectedDoctor._id);
    if (!availability) return;
    
    if (availability.isAvailable) {
      setSubscriptionDetails({
        cardId: availability.cardId,
        serviceId: 'special-consultation',
        serviceName: availability.serviceName,
        remainingCount: availability.remainingCount
      });
      setSubscriptionUsed(true);
      setSpecializedAvailability(availability);
      setQuotaExhausted(false);
    } else if (availability.quotaExhausted) {
      showQuotaExhaustedAlert(availability);
      setQuotaExhausted(true);
      setSubscriptionUsed(false);
      setSpecializedAvailability(availability);
    }
  };

  // Preload subscription coverage and compute effective total
  useEffect(() => {
    const init = async () => {
      try {
        const { userId } = TokenManager.getTokens();
        if (!userId) {
          setEffectiveTotal(baseTotalAmount);
          setSubscriptionChecked(true);
          return;
        }

        // Check for specialized doctor first
        if (isDoctorSpecialized(state.selectedDoctor)) {
          await handleSpecializedBooking();
          return;
        }

        // Regular subscription check for non-specialized doctors
        const sub = await userSubscriptionService.getActiveSubscription(userId);
        const active = !!sub && (
          (sub as any).status?.toString().toLowerCase() === 'active' ||
          (sub as any).isActive === true ||
          (sub as any).remainingBookings > 0 ||
          (sub as any).remainingFreeAppointments > 0
        );

        setHasActiveSubscription(active);
        setSubscriptionDetails(sub);
        
        if (active) {
          setSubscriptionUsed(true);
          setEffectiveTotal(0);
        } else {
          setSubscriptionUsed(false);
          setEffectiveTotal(baseTotalAmount);
        }
      } catch (error) {
        setHasActiveSubscription(false);
        setSubscriptionDetails(null);
        setSubscriptionUsed(false);
        setQuotaExhausted(false);
        setEffectiveTotal(baseTotalAmount);
      } finally {
        setSubscriptionChecked(true);
      }
    };
    
    void init();
  }, [baseTotalAmount, state.selectedDoctor]);

  const handlePaymentMethodSelect = (method: 'card' | 'cash') => {
    setSelectedMethod(method);
    setPaymentMethod(method);
  };

  // FIXED: Better time parsing and validation
  const parseTimeSlot = (slotId: string, slotTime: string) => {
    // Extract from/to from slot id pattern: `${from}-${to}-${idx}`
    const idParts = slotId.split('-');
    
    if (idParts.length >= 2) {
      const fromTime = idParts[0];
      const toTime = idParts[1];
      
      // Validate that we have different times
      if (fromTime && toTime && fromTime !== toTime) {
        const from24 = to24Hour(fromTime);
        const to24 = to24Hour(toTime);
        
        if (from24.hhmm && to24.hhmm) {
          return { from: from24.hhmm, to: to24.hhmm };
        }
      }
    }
    
    // Fallback: create a 30-minute slot from the main slot time
    const baseTime = to24Hour(slotTime);
    if (baseTime.hhmm) {
      const endTime = new Date();
      endTime.setHours(baseTime.hours, baseTime.minutes + 30, 0, 0);
      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();
      const toTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
      
      return { from: baseTime.hhmm, to: toTime };
    }
    
    return null;
  };

  const handleRazorpayPayment = async (appointmentData?: Record<string, unknown>) => {
    if (!window.Razorpay) {
      showToast({
        type: 'error',
        title: 'Payment service unavailable',
        message: 'Please refresh the page and try again.'
      });
      return;
    }

    try {
      const apptAny = (appointmentData || {}) as any;
      const appointmentId = String(
        apptAny?._id ||
        apptAny?.id ||
        apptAny?.appointmentId ||
        apptAny?.appointment?._id ||
        apptAny?.data?._id ||
        apptAny?.data?.appointment?._id ||
        ''
      );
      
      if (!appointmentId) {
        throw new Error('Missing related appointmentId for payment');
      }

      const serverOrderId = String(
        apptAny?.razorpayOrder?.orderId ||
        apptAny?.razorpayOrder?.id ||
        apptAny?.payment?.transactionId ||
        apptAny?.data?.razorpayOrder?.orderId ||
        apptAny?.data?.razorpayOrder?.id ||
        apptAny?.data?.payment?.transactionId ||
        ''
      );
      
      const serverAmountPaise = Number(
        apptAny?.razorpayOrder?.amount ??
        apptAny?.data?.razorpayOrder?.amount ??
        NaN
      );
      
      const { userId, userInfo } = TokenManager.getTokens();
      const resolvedUserId = String(
        userId ||
        (userInfo as any)?._id ||
        (state as any)?.bookingDetails?.user ||
        (state as any)?.bookingDetails?.patient?._id ||
        ''
      );
      
      if (!resolvedUserId) {
        showToast({
          type: 'error',
          title: 'Missing user',
          message: 'We could not identify your account. Please login again.'
        });
        throw new Error('Missing userId for payment order creation');
      }

      let order: any = null;
      if (serverOrderId) {
        order = {
          id: serverOrderId,
          amount: Number.isFinite(serverAmountPaise) ? serverAmountPaise : effectiveTotal * 100,
          currency: 'INR'
        };
      } else {
        order = await paymentService.createOrder({
          amount: effectiveTotal * 100,
          currency: 'INR',
          method: 'Online',
          receipt: `appointment_${Date.now()}`,
          relatedType: 'appointment',
          relatedId: appointmentId,
          userId: resolvedUserId,
          user: resolvedUserId,
          notes: {
            appointment_id: appointmentId,
            doctor_id: String(state.selectedDoctor?._id ?? ''),
            clinic_id: String(state.selectedClinic?._id ?? ''),
            appointment_date: state.selectedDate ? `${state.selectedDate.getFullYear()}-${String(state.selectedDate.getMonth()+1).padStart(2,'0')}-${String(state.selectedDate.getDate()).padStart(2,'0')}` : '',
            slot_id: String(state.selectedSlot?.id ?? ''),
            patient_name: String(state.bookingDetails?.patientName ?? '')
          }
        });
      }
      
      const config = getRazorpayConfig();

      const options = {
        ...config,
        amount: Number(order?.amount) || effectiveTotal * 100,
        order_id: order.id,
        description: `Appointment with ${(state.selectedDoctor?.fullName || '').replace(/^Dr\.\s*/i, '')}`,
        handler: async function (response: import('../../lib/razorpay').RazorpayPaymentData) {
          try {
            const verification = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId
            });

            const v: any = verification as any;
            const messageText = typeof v?.message === 'string' ? v.message.toLowerCase() : '';
            const isSuccess = (
              v?.verified === true ||
              v?.success === true ||
              v?.status === 'success' ||
              v?.paymentStatus === 'paid' ||
              messageText.includes('verified') ||
              messageText.includes('success') ||
              (v !== undefined && v !== null && v !== false)
            );

            if (isSuccess) {
              setPaymentStatus('success');
              showToast({
                type: 'success',
                title: 'Payment successful!',
                message: 'Your appointment has been booked and payment confirmed.'
              });
              setStep('confirmation');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            setPaymentStatus('failed');
            showToast({
              type: 'error',
              title: 'Payment verification failed',
              message: 'Please contact support if amount was deducted.'
            });
          }
        },
        prefill: {
          name: state.bookingDetails?.patientName || '',
          email: state.bookingDetails?.patientEmail || '',
          contact: state.bookingDetails?.patientPhone || ''
        },
        modal: {
          ondismiss: function () {
            setPaymentStatus('failed');
            showToast({
              type: 'warning',
              title: 'Payment cancelled',
              message: 'Payment was cancelled. Your appointment is reserved for 10 minutes. Please complete payment to confirm.'
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Payment initialization failed',
        message: extractErrorMessage(error)
      });
    }
  };

  // FIXED: Better time conversion and validation
  const to24Hour = (time12h: string): { hhmm: string; hours: number; minutes: number } => {
    // Handle AM/PM format
    const m = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      const ampm = m[3].toUpperCase();
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return { 
        hhmm: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`, 
        hours: h, 
        minutes: min 
      };
    }
    
    // Handle 24-hour format
    const m24 = time12h.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      const h = Math.min(23, Math.max(0, parseInt(m24[1], 10)));
      const min = Math.min(59, Math.max(0, parseInt(m24[2], 10)));
      return { 
        hhmm: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`, 
        hours: h, 
        minutes: min 
      };
    }
    
    return { hhmm: '', hours: 0, minutes: 0 };
  };

  const handlePayment = async () => {
    // When total is zero (subscription covers cost), we don't require selecting a payment method
    if (effectiveTotal > 0 && !selectedMethod) {
      showToast({
        type: 'warning',
        title: 'Payment method required',
        message: 'Please select a payment method to continue.'
      });
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus('processing');

      const { userId } = TokenManager.getTokens();
      if (!userId) {
        throw new Error('User not authenticated. Please log in to book an appointment.');
      }

      // Check if doctor is specialized
      if (isDoctorSpecialized(state.selectedDoctor)) {
        // First check if user has an active subscription
        const subscription = await userSubscriptionService.getActiveSubscription(userId);
        const hasActiveSubscription = subscription && (
          (subscription as any).status?.toString().toLowerCase() === 'active' ||
          (subscription as any).isActive === true ||
          (subscription as any).remainingBookings > 0 ||
          (subscription as any).remainingFreeAppointments > 0
        );

        if (hasActiveSubscription) {
          // Check specialized availability if user has an active subscription
          const availability = await checkSpecializedAvailability(state.selectedDoctor?._id || '');
          
          if (availability && !availability.isAvailable) {
            if (availability.quotaExhausted) {
              // Show quota exhausted alert and let user decide whether to continue
              const shouldContinue = window.confirm(
                `⚠️ Specialized Consultation Quota Exhausted\n\n` +
                `Dr. ${state.selectedDoctor?.fullName || 'the doctor'} has already been consulted under your subscription.\n\n` +
                `You can still book by paying ₹${state.selectedDoctor?.consultationFee || 0}.\n\n` +
                `Would you like to continue?`
              );
              
              if (!shouldContinue) {
                setLoading(false);
                return;
              }
              
              // Set quota exhausted flag to ensure payment is processed
              setQuotaExhausted(true);
              setSubscriptionUsed(false);
            } else {
              // No availability for other reasons (not just quota)
              setLoading(false);
              showToast({
                type: 'error',
                title: 'Not Available',
                message: availability.message || 'This doctor is not available for subscription booking at this time.'
              });
              return;
            }
          } else if (availability?.isAvailable) {
            // Set subscription details for the booking
            setSubscriptionDetails({
              cardId: availability.cardId,
              serviceId: 'special-consultation',
              serviceName: availability.serviceName,
              remainingCount: availability.remainingCount
            });
            setSubscriptionUsed(true);
            setSpecializedAvailability(availability);
            setQuotaExhausted(false);
          }
        }
        // If no active subscription, proceed with normal payment flow
      }

      const resolvedClinicId = String(state.selectedClinic?._id || '');
      if (!resolvedClinicId) {
        setLoading(false);
        showToast({
          type: 'error',
          title: 'Clinic required',
          message: 'Please select a clinic before booking an appointment.'
        });
        setStep('clinic');
        return;
      }

      // FIXED: Better time slot parsing and validation
      const slot = state.selectedSlot;
      let timeSlotData: { from: string; to: string } | null = null;
      
      // Try to get time slot data from different sources
      if (slot?.startTime && slot?.endTime) {
        // Use direct startTime/endTime if available
        const from24 = to24Hour(slot.startTime);
        const to24 = to24Hour(slot.endTime);
        if (from24.hhmm && to24.hhmm) {
          timeSlotData = { from: from24.hhmm, to: to24.hhmm };
        }
      } else {
        // Parse from slot ID and time
        timeSlotData = parseTimeSlot(slot?.id || '', slot?.time || '');
      }
      
      if (!timeSlotData || !timeSlotData.from || !timeSlotData.to || timeSlotData.from === timeSlotData.to) {
        setLoading(false);
        showToast({
          type: 'error',
          title: 'Invalid time slot',
          message: 'Time slot must have different start and end times.'
        });
        setStep('slot');
        return;
      }

      const toYyyyMmDd = (dateOnly: Date | null): string => {
        if (!dateOnly) return '';
        const y = dateOnly.getFullYear();
        const m = String(dateOnly.getMonth() + 1).padStart(2, '0');
        const d = String(dateOnly.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const appointmentDateStr = toYyyyMmDd(state.selectedDate || null);
      if (!appointmentDateStr) {
        setLoading(false);
        showToast({
          type: 'error',
          title: 'Invalid date selection',
          message: 'Please select a valid appointment date.'
        });
        setStep('date');
        return;
      }

      // Client-side availability pre-check
      const targetClinicId = String(state.selectedClinic?._id || '');
      const targetDay = state.selectedDate
        ? state.selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
        : '';
      const availList = Array.isArray((state.selectedDoctor as any)?.availability)
        ? (state.selectedDoctor as any).availability
        : [];
      const availableForDayClinic = availList.some((a: any) =>
        String(a?.clinic) === targetClinicId && String(a?.day) === targetDay
      );
      
      if (!availableForDayClinic) {
        setLoading(false);
        showToast({
          type: 'warning',
          title: 'Doctor unavailable',
          message: 'Doctor not available on this day at this clinic'
        });
        setStep('date');
        return;
      }

      // Determine payment method and status based on subscription and quota
      const getAdjustedPaymentValues = () => {
        // If quota is exhausted, always require payment
        if (quotaExhausted) {
          return {
            paymentMethodText: selectedMethod === 'cash' ? 'Cash' : 'Online',
            paymentStatus: 'pending',
            isPaid: false,
            amount: baseTotalAmount
          };
        }
        
        // Use subscription when available and quota not exhausted
        if (hasActiveSubscription && subscriptionDetails && !quotaExhausted && subscriptionUsed) {
          return {
            paymentMethodText: 'Subscription',
            paymentStatus: 'succeeded',
            isPaid: true,
            amount: 0
          };
        } else {
          return {
            paymentMethodText: selectedMethod === 'cash' ? 'Cash' : 'Online',
            paymentStatus: 'pending',
            isPaid: false,
            amount: baseTotalAmount
          };
        }
      };

      const {
        paymentMethodText,
        paymentStatus,
        isPaid,
        amount: effectiveAmount
      } = getAdjustedPaymentValues();

      // FIXED: Complete booking payload with all required fields
      const bookingPayload = {
        user: userId,
        doctor: state.selectedDoctor?._id || '',
        clinic: resolvedClinicId,
        appointmentDate: appointmentDateStr,
        timeSlot: {
          from: timeSlotData.from,
          to: timeSlotData.to
        },
        mode: 'InPerson',
        consultationFee: state.selectedDoctor?.consultationFee || 0,
        purpose: 'General Consultation', // FIXED: Always provide a purpose
        status: 'Scheduled',
        symptoms: [] as string[],
        notes: '', // FIXED: Always provide notes (empty string instead of undefined)
        paymentMethod: paymentMethodText,
        payment: {
          amount: effectiveAmount,
          isPaid: isPaid,
          method: paymentMethodText,
          status: paymentStatus,
          subscriptionUsed: subscriptionUsed && !quotaExhausted,
          subscriptionDetails: subscriptionUsed && !quotaExhausted ? subscriptionDetails : undefined
        },
        isFollowUp: false,
        createdBy: userId,
        userName: state.bookingDetails?.patientName || 'Patient', // FIXED: Always provide userName
        doctorName: state.selectedDoctor?.fullName || 'Doctor', // FIXED: Always provide doctorName
        isRescheduled: false,
        isDeleted: false
      };

      // Book the appointment
      const appointmentResult = await appointmentService.bookAppointment(bookingPayload);

      // Handle different payment scenarios
      if (effectiveTotal === 0) {
        setLoading(false);
        setPaymentStatus('success');
        showToast({
          type: 'success',
          title: 'Appointment booked!',
          message: 'Covered by your subscription. No payment required.'
        });
        setStep('confirmation');
        return;
      }

      if (selectedMethod === 'cash') {
        setLoading(false);
        setPaymentStatus('success');
        showToast({
          type: 'success',
          title: 'Appointment booked!',
          message: 'Please pay in cash at the clinic.'
        });
        setStep('confirmation');
        return;
      }

      // Proceed to Razorpay for online payments
      setLoading(false);
      await handleRazorpayPayment(appointmentResult as any);
      
    } catch (error) {
      setPaymentStatus('failed');
      
      const anyErr = error as any;
      const available = anyErr?.availableSlots || anyErr?.response?.data?.availableSlots;
      if (Array.isArray(available) && available.length) {
        const suggestions = available
          .slice(0, 3)
          .map((s: any) => `${s.startTime}-${s.endTime}`)
          .join(', ');
        showToast({
          type: 'warning',
          title: 'Slot unavailable',
          message: `${extractErrorMessage(error)}${suggestions ? `\nTry: ${suggestions}` : ''}`
        });
        setStep('slot');
      } else {
        showToast({
          type: 'error',
          title: 'Booking failed',
          message: extractErrorMessage(error)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethodCard: React.FC<{
    method: 'card' | 'cash';
    icon: 'credit-card' | 'hospital';
    title: string;
    description: string;
  }> = ({ method, icon, title, description }) => (
    <button
      onClick={() => handlePaymentMethodSelect(method)}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedMethod === method
        ? 'border-[#0e3293] bg-[#0e3293]/5'
        : 'border-gray-200 hover:border-[#0e3293]/50'
        }`}
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedMethod === method ? 'bg-[#0e3293]' : 'bg-gray-100'
          }`}>
          <Icon
            name={icon}
            size="medium"
            color={selectedMethod === method ? 'white' : '#6b7280'}
          />
        </div>
        <div className="flex-1">
          <Typography variant="body1" className="text-gray-900 font-medium mb-1">
            {title}
          </Typography>
          <Typography variant="caption" className="text-gray-600">
            {description}
          </Typography>
        </div>
        {selectedMethod === method && (
          <Icon name="check-circle" size="small" color="#0e3293" />
        )}
      </div>
    </button>
  );

  // Show validation error if booking information is incomplete
  if (!isBookingComplete) {
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
            Please complete all previous steps to proceed with payment
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
            onClick={() => setStep('review')}
            className="mt-4 bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-2 px-6 rounded-xl font-medium transition-colors"
          >
            Go to Review
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
            Payment
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-2">
            Complete your payment to confirm the appointment
          </Typography>
          <div className="bg-white border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <Icon name="info" size="small" color="#0e3293" className="mr-2" />
              <Typography variant="body2" className="text-blue-800">
                Your appointment will be booked first, then payment will be processed to confirm it.
              </Typography>
            </div>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {hasActiveSubscription && !quotaExhausted && subscriptionUsed && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon name="check-circle" size="medium" color="#10b981" className="mt-0.5" />
                </div>
                <div className="ml-3">
                  <Typography variant="subtitle2" className="text-green-800 font-semibold">
                    Covered by Subscription
                  </Typography>
                  <Typography variant="body2" className="text-green-700 mt-1">
                    Your appointment is fully covered by your active subscription.
                    {subscriptionDetails?.remainingCount !== undefined && (
                      <span className="block mt-1">
                        Remaining consultations: <span className="font-semibold">{subscriptionDetails.remainingCount}</span>
                      </span>
                    )}
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        )}

        {quotaExhausted && (
          <div className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon name="alert" size="medium" color="#f59e0b" className="mt-0.5" />
                </div>
                <div className="ml-3">
                  <Typography variant="subtitle2" className="text-orange-800 font-semibold">
                    Quota Exhausted
                  </Typography>
                  <Typography variant="body2" className="text-orange-700 mt-1">
                    You've already used your free consultation with this doctor.
                    Payment is required to book this appointment.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
            Payment Summary
          </Typography>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Typography variant="body1" className="text-gray-600">
                Consultation Fee
              </Typography>
              <Typography variant="body1" className="text-gray-900">
                ₹{state.selectedDoctor?.consultationFee}
              </Typography>
            </div>
            <div className="flex justify-between">
              <Typography variant="body1" className="text-gray-600">
                Platform Fee
              </Typography>
              <Typography variant="body1" className="text-gray-900">
                ₹50
              </Typography>
            </div>
            
            {/* Subscription Discount Line */}
            {hasActiveSubscription && !quotaExhausted && subscriptionUsed && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center">
                    <Icon name="shield" size="small" color="#10b981" className="mr-2" />
                    <Typography variant="body2" className="text-green-700">
                      Subscription Coverage
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <Typography variant="body2" className="text-green-600 font-medium">
                      -₹{baseTotalAmount}
                    </Typography>
                  </div>
                </div>
                {subscriptionDetails?.planName && (
                  <div className="mt-1 text-right">
                    <Typography variant="caption" className="text-green-600">
                      {subscriptionDetails.planName}
                    </Typography>
                  </div>
                )}
              </div>
            )}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <Typography variant="h6" className="text-gray-900 font-semibold">
                  Total Amount
                </Typography>
                <Typography variant="h6" className="text-[#0e3293] font-bold">
                  ₹{effectiveTotal}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - Only show if amount > 0 */}
        {effectiveTotal > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
                Select Payment Method
              </Typography>

              <div className="space-y-3">
                <PaymentMethodCard
                  method="card"
                  icon="credit-card"
                  title="Razorpay - All Payment Methods"
                  description="Pay via Razorpay (Cards, UPI, Net Banking, Wallets)"
                />
                <PaymentMethodCard
                  method="cash"
                  icon="hospital"
                  title="Cash at Clinic"
                  description="Pay in cash at the clinic front desk"
                />
              </div>
            </div>

            {/* Payment Details Form */}
            {selectedMethod && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
                  Payment Details
                </Typography>

                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <Icon name="shield" size="small" color="#0e3293" className="mr-2" />
                        <Typography variant="body2" className="text-blue-800 font-medium">
                          Powered by Razorpay
                        </Typography>
                      </div>
                      <Typography variant="caption" className="text-blue-700">
                        Secure payment gateway supporting all major cards, UPI, net banking, and wallets.
                        Your payment details are encrypted and never stored.
                      </Typography>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Icon name="credit-card" size="small" color="#6b7280" className="mr-2" />
                        <Typography variant="caption" className="text-gray-600">Cards</Typography>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Icon name="smartphone" size="small" color="#6b7280" className="mr-2" />
                        <Typography variant="caption" className="text-gray-600">UPI</Typography>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Icon name="wallet" size="small" color="#6b7280" className="mr-2" />
                        <Typography variant="caption" className="text-gray-600">Wallets</Typography>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Icon name="hospital" size="small" color="#6b7280" className="mr-2" />
                        <Typography variant="caption" className="text-gray-600">Net Banking</Typography>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Pay Button */}
        {effectiveTotal === 0 && !quotaExhausted ? (
          <Button
            onClick={async () => await handlePayment()}
            disabled={state.loading}
            className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 disabled:bg-gray-400 text-white py-4 px-6 rounded-xl font-medium text-lg transition-colors"
          >
            {state.loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Book Appointment - Free'
            )}
          </Button>
        ) : (
          <>
            {selectedMethod === 'cash' && (
              <Button
                onClick={() => setShowCashConfirm(true)}
                disabled={state.loading}
                className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 disabled:bg-gray-400 text-white py-4 px-6 rounded-xl font-medium text-lg transition-colors"
              >
                {state.loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Book & Pay at Clinic`
                )}
              </Button>
            )}
            {selectedMethod === 'card' && (
              <Button
                onClick={async () => await handlePayment()}
                disabled={state.loading}
                className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 disabled:bg-gray-400 text-white py-4 px-6 rounded-xl font-medium text-lg transition-colors"
              >
                {state.loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ₹${effectiveTotal}`
                )}
              </Button>
            )}
          </>
        )}

        {/* Cash confirmation popup */}
        {showCashConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
              <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
                Confirm Cash Payment
              </Typography>
              <Typography variant="body2" className="text-gray-700 mb-6">
                Are you sure you want to pay in cash at the clinic? Your appointment will be reserved, but payment must be made at the front desk.
              </Typography>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowCashConfirm(false)}
                  className="px-4 py-2 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setShowCashConfirm(false);
                    setSelectedMethod('cash');
                    await handlePayment();
                  }}
                  className="bg-[#0e3293] text-white hover:bg-[#0e3293]/90 px-4 py-2 rounded-lg"
                >
                  Confirm & Book
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start">
            <Icon name="shield" size="small" color="#10b981" className="mr-3 mt-0.5" />
            <div>
              <Typography variant="body2" className="text-green-800 font-medium mb-1">
                Secure Payment by Razorpay
              </Typography>
              <Typography variant="caption" className="text-green-700">
                Your payment is processed by Razorpay, India&apos;s most trusted payment gateway.
                All transactions are encrypted with 256-bit SSL and PCI DSS compliant.
              </Typography>
            </div>
          </div>
        </div>

        {/* Razorpay Branding */}
        <div className="mt-4 text-center">
          <Typography variant="caption" className="text-gray-500">
            Powered by{' '}
            <span className="text-[#0e3293] font-medium">Razorpay</span>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;