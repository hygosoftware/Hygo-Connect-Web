'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { createRazorpayOrder, verifyPaymentSignature, getRazorpayConfig } from '../../lib/razorpay';
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
    console.log('BookingPayment - Validation Check:', {
      selectedDoctor: !!state.selectedDoctor,
      selectedClinic: !!state.selectedClinic,
      selectedDate: !!state.selectedDate,
      selectedSlot: !!state.selectedSlot,
      bookingDetails: !!state.bookingDetails,
      isComplete: isBookingComplete
    });

    // More detailed logging
    console.log('BookingPayment - Detailed State:', {
      doctorName: state.selectedDoctor?.fullName,
      clinicName: state.selectedClinic?.clinicName,
      date: state.selectedDate?.toDateString(),
      slotTime: state.selectedSlot?.time,
      patientName: state.bookingDetails?.patientName,
      currentStep: state.currentStep
    });
  }, [state, isBookingComplete]);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'wallet' | null>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const totalAmount = state.selectedDoctor ? state.selectedDoctor.consultationFee + 50 : 0;

  const handlePaymentMethodSelect = (method: 'card' | 'upi' | 'wallet') => {
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
      const orderData = {
        amount: totalAmount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          appointment_id: appointmentData?._id || appointmentData?.id || '',
          doctor_id: state.selectedDoctor?._id || '',
          clinic_id: state.selectedClinic?._id || '',
          appointment_date: state.selectedDate?.toISOString() || '',
          slot_id: state.selectedSlot?.id || '',
          patient_name: state.bookingDetails?.patientName || ''
        }
      };

      const order = await createRazorpayOrder(orderData);
      const config = getRazorpayConfig();

      const options = {
        ...config,
        amount: totalAmount * 100, // Amount in paise
        order_id: order.id,
        description: `Appointment with Dr. ${state.selectedDoctor?.fullName}`,
        handler: async function (response: Record<string, unknown>) {
          try {
            // Verify payment (in production, this should be done on your backend)
            const verification = await verifyPaymentSignature(response);

            if (verification.verified) {
              console.log('Payment successful:', response);
              console.log('Appointment confirmed with payment:', appointmentData);

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
            console.log('Payment cancelled for appointment:', appointmentData);
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
      console.log('Step 1: Booking appointment...');

      // Get current user ID from auth
      const { userId } = TokenManager.getTokens();

      if (!userId) {
        throw new Error('User not authenticated. Please log in to book an appointment.');
      }

      // Calculate end time (assuming 30-minute appointments)
      const calculateEndTime = (startTime: string): string => {
        if (!startTime) return '';

        // Parse time like "10:00 AM" or "02:30 PM"
        const timeMatch = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!timeMatch) return startTime; // Return original if can't parse

        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();

        // Convert to 24-hour format
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        // Add 30 minutes
        let endMinutes = minutes + 30;
        let endHours = hours;
        if (endMinutes >= 60) {
          endMinutes -= 60;
          endHours += 1;
        }

        // Convert back to 12-hour format
        const endAmPm = endHours >= 12 ? 'PM' : 'AM';
        const displayHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);

        return `${displayHours}:${endMinutes.toString().padStart(2, '0')} ${endAmPm}`;
      };

      // Prepare booking data for API (matching MongoDB schema)
      const bookingPayload = {
        user: userId,
        doctor: state.selectedDoctor?._id || '',
        clinic: state.selectedClinic?._id || '',
        appointmentDate: state.selectedDate?.toISOString() || '', // Full ISO date for MongoDB
        timeSlot: {
          from: state.selectedSlot?.time || '',
          to: calculateEndTime(state.selectedSlot?.time || '')
        },
        mode: 'InPerson',
        consultationFee: state.selectedDoctor?.consultationFee || 0,
        purpose: 'General Consultation',
        symptoms: state.bookingDetails?.symptoms ? [state.bookingDetails.symptoms] : [],
        notes: state.bookingDetails?.notes || '',
        // Legacy fields for backward compatibility
        date: state.selectedDate?.toISOString().split('T')[0] || '',
        slot: {
          from: state.selectedSlot?.time || '',
          to: calculateEndTime(state.selectedSlot?.time || '')
        }
      };

      console.log('Booking payload:', bookingPayload);
      console.log('Detailed payload structure:', {
        doctor: bookingPayload.doctor,
        clinic: bookingPayload.clinic,
        date: bookingPayload.date,
        slot: bookingPayload.slot,
        user: bookingPayload.user,
        hasAllFields: !!(bookingPayload.doctor && bookingPayload.clinic && bookingPayload.date && bookingPayload.slot.from && bookingPayload.user)
      });

      // Book the appointment
      const appointmentResult = await appointmentService.bookAppointment(bookingPayload);
      console.log('Appointment booked successfully:', appointmentResult);

      showToast({
        type: 'success',
        title: 'Appointment booked!',
        message: 'Your appointment has been reserved. Proceeding to payment...'
      });

      // Step 2: Process payment after successful booking
      console.log('Step 2: Processing payment...');
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
    method: 'card' | 'upi' | 'wallet';
    icon: 'credit-card' | 'smartphone' | 'wallet';
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

  const QRCodeDisplay: React.FC = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
      <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
        Scan QR Code to Pay
      </Typography>

      {/* Mock QR Code */}
      <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
        <div className="w-40 h-40 bg-black rounded-lg flex items-center justify-center">
          <Typography variant="body2" className="text-white text-center">
            QR CODE<br />₹{totalAmount}
          </Typography>
        </div>
      </div>

      <Typography variant="body2" className="text-gray-600 mb-4">
        Use any UPI app to scan and pay
      </Typography>

      <div className="flex justify-center space-x-4 mb-6">
        <div className="flex items-center">
          <Icon name="check-circle" size="small" color="#10b981" className="mr-2" />
          <Typography variant="caption" className="text-gray-600">Secure</Typography>
        </div>
        <div className="flex items-center">
          <Icon name="check-circle" size="small" color="#10b981" className="mr-2" />
          <Typography variant="caption" className="text-gray-600">Instant</Typography>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-3 px-6 rounded-xl font-medium transition-colors"
      >
        I have paid ₹{totalAmount}
      </Button>
    </div>
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

        {isDesktop && selectedMethod === 'upi' && showQR ? (
          <QRCodeDisplay />
        ) : (
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
                  description="Cards, UPI, Wallets, Net Banking & more"
                />

                <PaymentMethodCard
                  method="upi"
                  icon="smartphone"
                  title="UPI Payment"
                  description="Pay using UPI apps like GPay, PhonePe"
                />

                <PaymentMethodCard
                  method="wallet"
                  icon="wallet"
                  title="Digital Wallet"
                  description="Pay using digital wallets"
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

                {selectedMethod === 'upi' && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <Icon name="smartphone" size="small" color="#10b981" className="mr-2" />
                        <Typography variant="body2" className="text-green-800 font-medium">
                          UPI Payment via Razorpay
                        </Typography>
                      </div>
                      <Typography variant="caption" className="text-green-700">
                        Pay instantly using any UPI app. Supports GPay, PhonePe, Paytm, BHIM and more.
                      </Typography>
                    </div>

                    {isDesktop ? (
                      <div className="text-center">
                        <Button
                          onClick={() => setShowQR(true)}
                          className="bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                        >
                          Show QR Code
                        </Button>
                        <Typography variant="body2" className="text-gray-600 mt-2">
                          Or proceed to enter UPI ID
                        </Typography>
                      </div>
                    ) : (
                      <Typography variant="body2" className="text-gray-600 text-center">
                        Proceed to payment to enter your UPI ID
                      </Typography>
                    )}
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <Icon name="wallet" size="small" color="#8b5cf6" className="mr-2" />
                        <Typography variant="body2" className="text-purple-800 font-medium">
                          Digital Wallet Payment
                        </Typography>
                      </div>
                      <Typography variant="caption" className="text-purple-700">
                        Pay using Paytm, Amazon Pay, MobiKwik, Freecharge and other digital wallets.
                      </Typography>
                    </div>

                    <div className="text-center py-4">
                      <Typography variant="body1" className="text-gray-600">
                        You will be redirected to select your preferred wallet
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pay Button */}
            {selectedMethod && !showQR && (
              <Button
                onClick={handlePayment}
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
          </>
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
