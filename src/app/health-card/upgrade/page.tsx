'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, Button, Typography, UniversalHeader } from '../../../components/atoms';
import { subscriptionservices } from '../../../services/apiServices';
import { purchaseSubscription } from '../../../services/subscriptionservice';
import { TokenManager } from '../../../services/auth';
import type { IconName } from '../../../components/atoms/Icon';

// Razorpay: avoid conflicting global redeclarations; we'll cast at usage time
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions extends Record<string, unknown> {
  key: string;
  amount?: number;
  currency?: string;
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

const HealthCardUpgradeContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'payment' | 'confirmation'>('review');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchPlanData = useCallback(async () => {
    try {
      if (!searchParams) {
        console.warn('Search params not available');
        return;
      }
      
      const planId = searchParams.get('planId') || '';
      const response = await subscriptionservices.getallsubscription();
      
      let plans: SubscriptionPlan[] = [];
      if (response && (response as { data?: unknown }).data) {
        const data = (response as { data?: unknown }).data;
        if (Array.isArray(data)) plans = data as SubscriptionPlan[];
      } else if (Array.isArray(response as unknown[])) {
        plans = response as unknown as SubscriptionPlan[];
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
  }, [searchParams]);

  useEffect(() => {
    loadUserProfile();
    void fetchPlanData();
  }, [fetchPlanData]);

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
    if (!selectedPlan || !userProfile || !paymentMethod) return;

    setLoading(true);
    try {
      // Use subscription service unified flow
      const result = await purchaseSubscription({
        subscriptionId: selectedPlan._id,
        userId: userProfile.id,
        method: (paymentMethod === 'upi' ? 'upi' : 'card'),
        prefill: { name: userProfile.name, email: userProfile.email || '' }
      });

      console.log('✅ Subscription purchase flow completed:', result);
      setStep('confirmation');
    } catch (error: unknown) {
      console.error('❌ Error initiating subscription purchase:', error);
      const message =
        typeof error === 'object' && error && 'message' in error && typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to initiate payment. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Payment success handling is done inside purchaseSubscription()

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !paymentMethod) return;

    setLoading(true);
    try {
      if (paymentMethod === 'card' || paymentMethod === 'upi') {
        // Use subscription services API for Razorpay flow
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
      <div className="min-h-screen bg-bg-white">
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
                    ₹{selectedPlan.price}
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
                    ₹{selectedPlan.price}
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
                  { method: 'card' as const, icon: 'credit-card' as IconName, title: 'Credit/Debit Card', description: 'Pay securely with your card' },
                  { method: 'upi' as const, icon: 'smartphone' as IconName, title: 'UPI Payment', description: 'Pay using UPI apps like GPay, PhonePe' },
                  { method: 'wallet' as const, icon: 'wallet' as IconName, title: 'Digital Wallet', description: 'Pay using digital wallets' }
                ].map((option) => (
                  <div
                    key={option.method}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === option.method
                        ? 'border-[#0E3293] bg-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaymentMethodSelect(option.method)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        paymentMethod === option.method ? 'bg-[#0E3293]' : 'bg-gray-100'
                      }`}>
                        <Icon name={option.icon} className={`w-5 h-5 ${
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
                onClick={() => void handleConfirmUpgrade()}
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
              {/* Add extra bottom spacing to avoid overlap with BottomNavigation on mobile */}
              <div className="space-y-4 mb-28 md:mb-4">
                <Button
                  onClick={() => router.push('/health-card')}
                  className="w-full py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  View Health Card
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
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
    <div className="min-h-screen bg-bg-white">
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

const HealthCardUpgradePage: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-white px-4 md:px-6 py-8">Loading...</div>}>
      <HealthCardUpgradeContent />
    </Suspense>
  );
};

export default HealthCardUpgradePage;
