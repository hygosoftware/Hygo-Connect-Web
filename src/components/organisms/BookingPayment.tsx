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

  // Debug logging to identify missing fields
  useEffect(() => {
  }, [state, isBookingComplete]);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | null>(null);
  const [showCashConfirm, setShowCashConfirm] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const baseTotalAmount = state.selectedDoctor ? state.selectedDoctor.consultationFee + 50 : 0;
  const [effectiveTotal, setEffectiveTotal] = useState<number>(baseTotalAmount);

  // Removed desktop-specific checks as only Razorpay and Cash are supported

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
        // Attempt to stringify known shapes
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
        const sub = await userSubscriptionService.getActiveSubscription(userId);
        const active = !!sub && (
          (sub as any).status?.toString().toLowerCase() === 'active' ||
          (sub as any).isActive === true ||
          (sub as any).remainingBookings > 0 ||
          (sub as any).remainingFreeAppointments > 0
        );
        setEffectiveTotal(active ? 0 : baseTotalAmount);
      } catch {
        setEffectiveTotal(baseTotalAmount);
      } finally {
        setSubscriptionChecked(true);
      }
    };
    void init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTotalAmount]);

  const handlePaymentMethodSelect = (method: 'card' | 'cash') => {
    setSelectedMethod(method);
    setPaymentMethod(method);
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
      // Prefer server-provided Razorpay order if available
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
      // Detect existing order details from server response
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
      // Use existing order if provided by server; otherwise create a new one
      let order: any = null;
      if (serverOrderId) {
        order = {
          id: serverOrderId,
          amount: Number.isFinite(serverAmountPaise) ? serverAmountPaise : effectiveTotal * 100,
          currency: 'INR'
        };
        console.log('Using server-provided Razorpay order:', order);
      } else {
        order = await paymentService.createOrder({
          amount: effectiveTotal * 100,
          currency: 'INR',
          method: 'Online',
          receipt: `appointment_${Date.now()}`,
          relatedType: 'appointment',
          relatedId: appointmentId,
          userId: resolvedUserId,
          user: resolvedUserId, // legacy
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
        amount: Number(order?.amount) || effectiveTotal * 100, // Amount in paise
        order_id: order.id,
        description: `Appointment with ${(state.selectedDoctor?.fullName || '').replace(/^Dr\.\s*/i, '')}`,
        handler: async function (response: import('../../lib/razorpay').RazorpayPaymentData) {
          try {
            // Verify payment on backend
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
              // If backend returned 200 with some payload, consider success unless explicitly falsey
              (v !== undefined && v !== null && v !== false)
            );

            if (isSuccess) {
              setPaymentStatus('success');
              showToast({
                type: 'success',
                title: 'Payment successful!',
                message: 'Your appointment has been booked and payment confirmed.'
              });

              // Store appointment data in context for confirmation page
              // You might want to add this to your BookingContext
              setStep('confirmation');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
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

            // Note: In production, you might want to:
            // 1. Set a timer to cancel the appointment if payment isn't completed
            // 2. Send the appointment ID to a cleanup service
            // 3. Show a countdown timer to the user
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      showToast({
        type: 'error',
        title: 'Payment initialization failed',
        message: extractErrorMessage(error)
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
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

      // Step 1: Book the appointment first

      // Get current user ID from auth
      const { userId } = TokenManager.getTokens();

      if (!userId) {
        throw new Error('User not authenticated. Please log in to book an appointment.');
      }

      // Require explicitly selected clinic id
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

      // Helpers to format time and combine to UTC ISO
      const to24Hour = (time12h: string): { hhmm: string; hours: number; minutes: number } => {
        // accepts formats like "10:00 AM" or "02:30 pm"
        const m = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!m) {
          // fallback: try HH:mm
          const m24 = time12h.match(/^(\d{1,2}):(\d{2})$/);
          if (m24) {
            const h = Math.min(23, Math.max(0, parseInt(m24[1], 10)));
            const min = Math.min(59, Math.max(0, parseInt(m24[2], 10)));
            return { hhmm: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`, hours: h, minutes: min };
          }
          return { hhmm: '', hours: 0, minutes: 0 };
        }
        let h = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        const ampm = m[3].toUpperCase();
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return { hhmm: `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`, hours: h, minutes: min };
      };

      const combineDateAndTimeToUTC = (dateOnly: Date | null, timeText: string): string => {
        if (!dateOnly || !timeText) return '';
        const { hours, minutes } = to24Hour(timeText);
        if (isNaN(hours) || isNaN(minutes)) return '';
        const d = new Date(dateOnly);
        // set local time, then output UTC ISO
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString();
      };

      // Prepare booking data matching required schema
      // Extract from/to from slot id pattern: `${from}-${to}-${idx}` created in DateTimeSelection
      const idParts = (state.selectedSlot?.id || '').split('-');
      const rawFromFromId = idParts.length >= 2 ? idParts[0] : '';
      const rawToFromId = idParts.length >= 2 ? idParts[1] : '';
      const from24 = to24Hour(rawFromFromId || (state.selectedSlot?.time || ''));
      const to24Parsed = to24Hour(rawToFromId || (state.selectedSlot?.time || ''));
      // Appointment date as YYYY-MM-DD (local) to avoid UTC day drift on backend
      const toYyyyMmDd = (dateOnly: Date | null): string => {
        if (!dateOnly) return '';
        const y = dateOnly.getFullYear();
        const m = String(dateOnly.getMonth() + 1).padStart(2, '0');
        const d = String(dateOnly.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      const appointmentDateStr = toYyyyMmDd(state.selectedDate || null);

      // Validate computed time and date
      if (!from24.hhmm || !to24Parsed.hhmm || !appointmentDateStr) {
        setLoading(false);
        showToast({
          type: 'error',
          title: 'Invalid time selection',
          message: 'Please select a valid date and time slot.'
        });
        setStep('date');
        return;
      }

      // Client-side availability pre-check to avoid avoidable 400s
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

      // Backend expects method enum: 'Online' | 'Cash' | 'Card' 
      // Use 'Online' for card/upi/razorpay payments, and 'Cash' for cash
      const paymentMethodText = selectedMethod === 'cash' ? 'Cash' : 'Online';

      const bookingPayload = {
        user: userId,
        doctor: state.selectedDoctor?._id || '',
        clinic: resolvedClinicId,
        appointmentDate: appointmentDateStr,
        timeSlot: {
          from: from24.hhmm,
          to: to24Parsed.hhmm
        },
        mode: 'InPerson',
        consultationFee: state.selectedDoctor?.consultationFee || 0,
        purpose: 'General Consultation',
        status: 'Scheduled',
        symptoms: [] as string[],
        notes: '',
        paymentMethod: paymentMethodText,
        payment: {
          amount: effectiveTotal || state.selectedDoctor?.consultationFee || 0,
          isPaid: effectiveTotal === 0 ? true : false,
          method: paymentMethodText,
          status: effectiveTotal === 0 ? 'succeeded' : 'pending'
        },
        isFollowUp: false,
        createdBy: userId,
        userName: state.bookingDetails?.patientName || 'Myself',
        doctorName: state.selectedDoctor?.fullName || '',
        isRescheduled: false,
        isDeleted: false
      };
      // Book the appointment via backend
      const appointmentResult = await appointmentService.bookAppointment(bookingPayload);

      // If amount is zero (subscription covered), skip Razorpay entirely
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

      // If user selected cash, skip Razorpay
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

      // Proceed to Razorpay for card/online payments
      setLoading(false);
      await handleRazorpayPayment(appointmentResult as any);
    } catch (error) {
      console.error('Booking or payment error:', error);
      setPaymentStatus('failed');
      // Detect slot availability error shape and surface suggestions
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
      // Safety: ensure loading is cleared even if a branch above missed it
      setLoading(false);
    }
  };

  const PaymentMethodCard: React.FC<{
    method: 'card' | 'cash';
    icon: 'credit-card' | 'hospital'; // Use 'hospital' icon for cash
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

  // Removed UPI QR flow

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

        <>
            {/* Payment Methods */}
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

            {/* Pay Button */}
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
                onClick={() => { void handlePayment(); }}
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
          </>

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
             mm        </Typography>
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