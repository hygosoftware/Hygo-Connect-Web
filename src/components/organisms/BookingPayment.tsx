'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { createRazorpayOrder, verifyPaymentSignature, getRazorpayConfig, RazorpayOrderData } from '../../lib/razorpay';
import { appointmentService } from '../../services/apiServices';
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

  const totalAmount = state.selectedDoctor ? state.selectedDoctor.consultationFee + 50 : 0;

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
      // Create order (in production, this should be done on your backend)
      const orderData: RazorpayOrderData = {
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          appointment_id: String((appointmentData as Record<string, unknown> | undefined)?.['_id'] ?? (appointmentData as Record<string, unknown> | undefined)?.['id'] ?? ''),
          doctor_id: String(state.selectedDoctor?._id ?? ''),
          clinic_id: String(state.selectedClinic?._id ?? ''),
          appointment_date: String(state.selectedDate?.toISOString() ?? ''),
          slot_id: String(state.selectedSlot?.id ?? ''),
          patient_name: String(state.bookingDetails?.patientName ?? '')
        }
      };

      const order = await createRazorpayOrder(orderData);
      const config = getRazorpayConfig();

      const options = {
        ...config,
        amount: totalAmount * 100, // Amount in paise
        order_id: order.id,
        description: `Appointment with ${(state.selectedDoctor?.fullName || '').replace(/^Dr\.\s*/i, '')}`,
        handler: async function (response: import('../../lib/razorpay').RazorpayPaymentData) {
          try {
            // Verify payment (in production, this should be done on your backend)
            const verification = await verifyPaymentSignature(response);

            if (verification.verified) {

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
        message: 'Please try again or contact support.'
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
      // Appointment date should be date-only (midnight UTC) to match backend expectation
      const toMidnightUTC = (dateOnly: Date | null): string => {
        if (!dateOnly) return '';
        const d = new Date(dateOnly);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      };
      const appointmentDateISO = toMidnightUTC(state.selectedDate || null);

      // Validate computed time and date
      if (!from24.hhmm || !to24Parsed.hhmm || !appointmentDateISO) {
        setLoading(false);
        showToast({
          type: 'error',
          title: 'Invalid time selection',
          message: 'Please select a valid date and time slot.'
        });
        setStep('date');
        return;
      }

      const paymentMethodText = selectedMethod === 'cash' ? 'Cash' : 'Online';

      const bookingPayload = {
        user: userId,
        doctor: state.selectedDoctor?._id || '',
        clinic: resolvedClinicId,
        appointmentDate: appointmentDateISO,
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
          amount: state.selectedDoctor?.consultationFee || 0,
          isPaid: false,
          method: paymentMethodText,
          status: 'pending'
        },
        isFollowUp: false,
        createdBy: userId,
        userName: state.bookingDetails?.patientName || 'Myself',
        doctorName: state.selectedDoctor?.fullName || '',
        isRescheduled: false,
        isDeleted: false
      };

      // Debug: verify outgoing booking payload shape
      console.log('Booking payload (client):', bookingPayload);

      // Book the appointment
      const appointmentResult = await appointmentService.bookAppointment(bookingPayload);

      showToast({
        type: 'success',
        title: 'Appointment booked!',
        message: 'Your appointment has been reserved. Proceeding to payment...'
      });

      // Step 2: Process payment after successful booking
      setLoading(false); // Reset loading before opening Razorpay
      handleRazorpayPayment(appointmentResult);

    } catch (error) {
      console.error('Booking or payment error:', error);
      setPaymentStatus('failed');

      // Check if it's a booking error or payment error
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : 'An unexpected error occurred. Please try again.';

      showToast({
        type: 'error',
        title: 'Booking failed',
        message: errorMessage
      });
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
                  ₹{totalAmount}
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
                  `Pay ₹${totalAmount}`
                )}
              </Button>
            )}

            {/* Cash confirmation popup */}
            {showCashConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
                  <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
                    Confirm Cash Payment
                  </Typography>
                  <Typography variant="body2" className="text-gray-700 mb-6">
                    Are you sure you want to pay in cash at the clinic? Your appointment will be reserved, but payment must be made at the front desk.
                  </Typography>
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => setShowCashConfirm(false)}
                      className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        setShowCashConfirm(false);
                        setPaymentMethod('cash' as any); // TypeScript: cast as any since context may expect only old types
                        setPaymentStatus('success');
                        showToast({
                          type: 'success',
                          title: 'Appointment Booked!',
                          message: 'Please pay in cash at the clinic.'
                        });
                        setStep('confirmation');
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