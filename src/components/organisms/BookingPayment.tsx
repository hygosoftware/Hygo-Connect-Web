'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Icon, Button, Input } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { mockAPI } from '../../lib/mockBookingData';

const BookingPayment: React.FC = () => {
  const { state, setPaymentMethod, setPaymentStatus, setStep, setLoading } = useBooking();
  const { showToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'wallet' | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [upiId, setUpiId] = useState('');
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

  const totalAmount = state.selectedDoctor ? state.selectedDoctor.consultationFee + 50 : 0;

  const handlePaymentMethodSelect = (method: 'card' | 'upi' | 'wallet') => {
    setSelectedMethod(method);
    setPaymentMethod(method);
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

      // Prepare booking data with doctor availability information
      const bookingData = {
        doctor: state.selectedDoctor,
        clinic: state.selectedClinic,
        date: state.selectedDate,
        slot: state.selectedSlot,
        patientDetails: state.bookingDetails,
        paymentMethod: selectedMethod,
        amount: totalAmount,
        // Include the specific availability information for this booking
        availability: {
          clinicId: state.selectedClinic._id,
          day: state.selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
          slotId: state.selectedSlot.id
        }
      };

      const result = await mockAPI.bookAppointment(bookingData);

      if (result.success) {
        setPaymentStatus('success');
        showToast({
          type: 'success',
          title: 'Payment successful!',
          message: 'Your appointment has been booked successfully.'
        });
        setStep('confirmation');
      } else {
        setPaymentStatus('failed');
        showToast({
          type: 'error',
          title: 'Payment failed',
          message: result.error || 'Please try again or use a different payment method.'
        });
      }
    } catch (error) {
      setPaymentStatus('failed');
      showToast({
        type: 'error',
        title: 'Payment failed',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethodCard: React.FC<{
    method: 'card' | 'upi' | 'wallet';
    icon: string;
    title: string;
    description: string;
  }> = ({ method, icon, title, description }) => (
    <button
      onClick={() => handlePaymentMethodSelect(method)}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
        selectedMethod === method
          ? 'border-[#0e3293] bg-[#0e3293]/5'
          : 'border-gray-200 hover:border-[#0e3293]/50'
      }`}
    >
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
          selectedMethod === method ? 'bg-[#0e3293]' : 'bg-gray-100'
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
            QR CODE<br/>₹{totalAmount}
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

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Typography variant="h4" className="text-gray-900 font-bold mb-2">
            Payment
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Complete your payment to confirm the appointment
          </Typography>
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
                  title="Credit/Debit Card"
                  description="Pay securely with your card"
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
                    <Input
                      type="text"
                      placeholder="Card Number"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                      className="w-full"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                        className="w-full"
                      />
                      <Input
                        type="text"
                        placeholder="CVV"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                        className="w-full"
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                )}

                {selectedMethod === 'upi' && (
                  <div className="space-y-4">
                    {isDesktop ? (
                      <div className="text-center">
                        <Button
                          onClick={() => setShowQR(true)}
                          className="bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                        >
                          Show QR Code
                        </Button>
                        <Typography variant="body2" className="text-gray-600 mt-2">
                          Or enter UPI ID below
                        </Typography>
                      </div>
                    ) : null}
                    
                    <Input
                      type="text"
                      placeholder="Enter UPI ID (e.g., user@paytm)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div className="text-center py-4">
                    <Typography variant="body1" className="text-gray-600">
                      You will be redirected to your wallet app
                    </Typography>
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
                Secure Payment
              </Typography>
              <Typography variant="caption" className="text-green-700">
                Your payment information is encrypted and secure. We use industry-standard security measures.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPayment;
