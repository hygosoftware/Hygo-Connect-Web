'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, Button, Typography, UniversalHeader } from '../../../components/atoms';
import { subscriptionservices, paymentService } from '../../../services/apiServices';
import { TokenManager } from '../../../services/auth';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email?: string;
  };
  theme: {
    color: string;
  };
}

// Define interfaces for dynamic data
interface SubscriptionPlan {
  _id: string;
  subscriptionName: string;
  price: number;
  duration: { value: number; unit: string };
  availableServices: Array<{
    _id: string;
    serviceName: string;
  }>;
  adminId?: string;
  allowFamilyMembers?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

interface UserProfile {
  name: string;
  id: string;
  email?: string;
}

const HealthCardUpgradePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'payment' | 'confirmation'>('review');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
    fetchPlanData();
  }, [searchParams]);

  const loadUserProfile = () => {
    const tokens = TokenManager.getTokens();
    const userInfo = tokens.userInfo;
    const userId = tokens.userId;
    
    if (userId && userInfo) {
      setUserProfile({
        name: userInfo.FullName || userInfo.fullName || 'User',
        id: userId,
        email: userInfo.Email || userInfo.email
      });
    }
  };

  const fetchPlanData = async () => {
    try {
      const planId = searchParams.get('planId');
      const response = await subscriptionservices.getallsubscription();
      
      let plans: SubscriptionPlan[] = [];
      if (response && response.data) {
        plans = response.data;
      } else if (Array.isArray(response)) {
        plans = response;
      }
      
      if (planId) {
        const plan = plans.find(p => p._id === planId);
        if (plan) {
          setSelectedPlan(plan);
        }
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  };

  const handleGoBack = () => {
    if (step === 'payment') {
      setStep('review');
    } else {
      router.back();
    }
  };

  const handleContinueToPayment = () => {
    if (selectedPlan) {
      setStep('payment');
    }
  };

  const handlePaymentMethodSelect = (method: 'card' | 'upi' | 'wallet') => {
    setPaymentMethod(method);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!selectedPlan || !userProfile) return;

    setLoading(true);
    try {
      // Step 1: Create payment order on backend
      console.log('🚀 Creating payment order for subscription:', selectedPlan._id);
      const paymentOrder = await paymentService.createSubscriptionPayment(
        selectedPlan._id,
        selectedPlan.price,
        paymentMethod as 'card' | 'upi' | 'wallet'
      );

      console.log('✅ Payment order created:', paymentOrder);

      // Step 2: Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // Step 3: Configure Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_9mOyRUi9azswI4',
        amount: paymentOrder.amount, // Amount already in paise from backend
        currency: paymentOrder.currency,
        name: 'Hygo Health',
        description: `Subscription: ${selectedPlan.subscriptionName}`,
        order_id: paymentOrder.orderId, // Use order ID from backend
        handler: (response: RazorpayResponse) => {
          console.log('💳 Razorpay payment successful:', response);
          handlePaymentSuccess(response);
        },
        prefill: {
          name: userProfile.name,
          email: userProfile.email || '',
        },
        theme: {
          color: '#0E3293',
        }
      };

      // Step 4: Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error('❌ Error initiating payment:', error);
      alert(error.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      // Step 1: Confirm payment with backend
      console.log('🔐 Confirming payment with backend:', response);
      
      const confirmationResult = await paymentService.confirmPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });

      console.log('✅ Payment confirmed successfully:', confirmationResult);
      
      // Step 2: Show success and navigate to confirmation
      setStep('confirmation');
      
    } catch (error: any) {
      console.error('❌ Payment verification failed:', error);
      alert(error.message || 'Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !paymentMethod) return;

    setLoading(true);
    try {
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        // Use Razorpay for card and UPI payments
        await handleRazorpayPayment();
      } else {
        // Handle other payment methods (wallet, etc.)
        console.log('Processing payment for:', selectedPlan.subscriptionName, 'via', paymentMethod);
        
        // Simulate payment processing for other methods
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setStep('confirmation');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <UniversalHeader
          title="Plan Not Found"
          subtitle="Please select a plan from the health card page"
          variant="gradient"
          icon="health-card"
          showBackButton={true}
          onBackPress={handleGoBack}
        />
        <div className="px-4 md:px-6 py-8 text-center">
          <Typography variant="body1" className="text-gray-600">
            No plan selected. Please go back and choose a subscription plan.
          </Typography>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 'review':
        return (
          <div className="max-w-2xl mx-auto">
            {/* Plan Review */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
              <Typography variant="h6" className="text-gray-900 font-bold mb-4">
                Selected Plan
              </Typography>
              
              <div className="space-y-4">
                <div>
                  <Typography variant="h5" className="text-[#0E3293] font-bold">
                    {selectedPlan.subscriptionName}
                  </Typography>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <Typography variant="body1" className="font-semibold text-gray-900">
                    Price
                  </Typography>
                  <Typography variant="h6" className="text-[#0E3293] font-bold">
                    ${selectedPlan.price}
                  </Typography>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <Typography variant="body1" className="font-semibold text-gray-900">
                    Duration
                  </Typography>
                  <Typography variant="body1" className="text-gray-600">
                    {selectedPlan.duration.value} {selectedPlan.duration.unit}{selectedPlan.duration.value > 1 ? 's' : ''}
                  </Typography>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <Typography variant="body1" className="font-semibold text-gray-900 mb-3">
                    Available Services
                  </Typography>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedPlan.availableServices.map((service) => (
                      <div key={service._id} className="flex items-center space-x-3">
                        <Icon name="check" className="text-green-500 w-4 h-4" />
                        <Typography variant="body2" className="text-gray-700">
                          {service.serviceName}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            {userProfile && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                <Typography variant="h6" className="text-gray-900 font-bold mb-4">
                  Subscriber Information
                </Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">Name:</Typography>
                    <Typography variant="body2" className="text-gray-900 font-medium">{userProfile.name}</Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">User ID:</Typography>
                    <Typography variant="body2" className="text-gray-900 font-medium">{userProfile.id}</Typography>
                  </div>
                  {userProfile.email && (
                    <div className="flex justify-between">
                      <Typography variant="body2" className="text-gray-600">Email:</Typography>
                      <Typography variant="body2" className="text-gray-900 font-medium">{userProfile.email}</Typography>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Button
              onClick={handleContinueToPayment}
              className="w-full py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continue to Payment
            </Button>
          </div>
        );

      case 'payment':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Order Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <Typography variant="h6" className="text-gray-900 font-bold mb-4">
                Order Summary
              </Typography>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Typography variant="body1" className="text-gray-900 font-medium">
                    {selectedPlan.subscriptionName}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    {selectedPlan.duration.value} {selectedPlan.duration.unit}{selectedPlan.duration.value > 1 ? 's' : ''}
                  </Typography>
                </div>
                <Typography variant="h6" className="text-[#0E3293] font-bold">
                  ₹{selectedPlan.price}
                </Typography>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <Typography variant="body1" className="text-gray-900 font-semibold">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" className="text-[#0E3293] font-bold">
                    ${selectedPlan.price}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <Typography variant="h6" className="text-gray-900 font-bold mb-4">
                Select Payment Method
              </Typography>
              <div className="space-y-3">
                {[
                  { method: 'card' as const, icon: 'credit-card', title: 'Credit/Debit Card', description: 'Pay securely with your card' },
                  { method: 'upi' as const, icon: 'smartphone', title: 'UPI Payment', description: 'Pay using UPI apps like GPay, PhonePe' },
                  { method: 'wallet' as const, icon: 'wallet', title: 'Digital Wallet', description: 'Pay using digital wallets' }
                ].map((option) => (
                  <div
                    key={option.method}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === option.method
                        ? 'border-[#0E3293] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaymentMethodSelect(option.method)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        paymentMethod === option.method ? 'bg-[#0E3293]' : 'bg-gray-100'
                      }`}>
                        <Icon name={option.icon as any} className={`w-5 h-5 ${
                          paymentMethod === option.method ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <Typography variant="body1" className="font-medium text-gray-900">
                          {option.title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          {option.description}
                        </Typography>
                      </div>
                      {paymentMethod === option.method && (
                        <Icon name="check" className="w-5 h-5 text-[#0E3293]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Payment Button */}
            {paymentMethod && (
              <Button
                onClick={handleConfirmUpgrade}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Processing Payment...' : `Pay ₹${selectedPlan.price}`}
              </Button>
            )}
          </div>
        );

      case 'confirmation':
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="check" className="w-8 h-8 text-green-600" />
              </div>
              <Typography variant="h5" className="text-gray-900 font-bold mb-4">
                Payment Successful!
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-6">
                Your subscription to {selectedPlan.subscriptionName} has been activated successfully.
              </Typography>
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/health-card')}
                  className="w-full py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  View Health Card
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <UniversalHeader
        title={step === 'review' ? 'Review Your Plan' : step === 'payment' ? 'Payment Details' : 'Subscription Confirmed!'}
        subtitle={step === 'review' ? 'Confirm your subscription details' : step === 'payment' ? 'Complete your payment' : 'Welcome to your new health plan'}
        variant="gradient"
        icon="health-card"
        showBackButton={true}
        onBackPress={handleGoBack}
      />

      <div className="px-4 md:px-6 py-8">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default HealthCardUpgradePage;
