'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '../../../components/atoms';
import { Button } from '../../../components/atoms';
import { Typography } from '../../../components/atoms';
import { SUBSCRIPTION_PLANS, SubscriptionPlan, PaymentDetails } from '../../../types/healthCard';

const HealthCardUpgradePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'selection' | 'payment' | 'confirmation'>('selection');

  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, [searchParams]);

  const handleGoBack = () => {
    if (step === 'payment') {
      setStep('selection');
    } else {
      router.back();
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleContinueToPayment = () => {
    if (selectedPlan) {
      setStep('payment');
    }
  };

  const handlePaymentMethodSelect = (method: 'card' | 'upi' | 'wallet') => {
    setPaymentMethod(method);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || !paymentMethod) return;

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page or card display
      router.push('/health-card/card?upgraded=true');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'selection':
        return <PlanSelectionStep />;
      case 'payment':
        return <PaymentStep />;
      default:
        return <PlanSelectionStep />;
    }
  };

  const PlanSelectionStep = () => (
    <div className="space-y-6">
      {/* Current Plan Info */}
      <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-300">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center mr-4">
            <Icon name="health-card" size="medium" color="white" />
          </div>
          <div>
            <Typography variant="h6" className="text-gray-700 font-semibold">
              Current Plan: Basic Free
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              No benefits • Upgrade to unlock premium features
            </Typography>
          </div>
        </div>
      </div>

      {/* Plan Selection */}
      <div>
        <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
          Choose Your New Plan
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUBSCRIPTION_PLANS.filter(plan => plan.type !== 'free').map((plan) => (
            <PlanOption
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan?.id === plan.id}
              onSelect={() => handlePlanSelect(plan)}
            />
          ))}
        </div>
      </div>

      {/* Continue Button */}
      {selectedPlan && (
        <div className="text-center pt-6">
          <Button
            onClick={handleContinueToPayment}
            className="px-8 py-4 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            Continue to Payment
          </Button>
        </div>
      )}
    </div>
  );

  const PaymentStep = () => (
    <div className="space-y-6">
      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-white rounded-2xl p-6 border-2 border-[#0E3293]/20 shadow-lg">
          <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
            Order Summary
          </Typography>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Typography variant="body1" className="text-gray-900 font-medium">
                {selectedPlan.name}
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                {selectedPlan.duration}
              </Typography>
            </div>
            <Typography variant="h6" className="text-[#0E3293] font-bold">
              ${selectedPlan.price}
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
      )}

      {/* Payment Methods */}
      <div>
        <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
          Select Payment Method
        </Typography>
        <div className="space-y-3">
          <PaymentMethodCard
            method="card"
            icon="credit-card"
            title="Credit/Debit Card"
            description="Pay securely with your card"
            isSelected={paymentMethod === 'card'}
            onSelect={() => handlePaymentMethodSelect('card')}
          />
          <PaymentMethodCard
            method="upi"
            icon="smartphone"
            title="UPI Payment"
            description="Pay using UPI apps like GPay, PhonePe"
            isSelected={paymentMethod === 'upi'}
            onSelect={() => handlePaymentMethodSelect('upi')}
          />
          <PaymentMethodCard
            method="wallet"
            icon="wallet"
            title="Digital Wallet"
            description="Pay using digital wallets"
            isSelected={paymentMethod === 'wallet'}
            onSelect={() => handlePaymentMethodSelect('wallet')}
          />
        </div>
      </div>

      {/* Confirm Payment Button */}
      {paymentMethod && (
        <div className="text-center pt-6">
          <Button
            onClick={handleConfirmUpgrade}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay $${selectedPlan?.price}`}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0E3293] via-[#1e40af] to-[#3b82f6] px-4 md:px-6 py-6 md:py-8 shadow-xl sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 mr-3 backdrop-blur-sm"
            >
              <Icon name="arrow-left" size="medium" color="white" />
            </button>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
                <Icon name="health-card" size="medium" color="white" />
              </div>
              <div>
                <Typography variant="h4" className="text-white font-bold">
                  {step === 'payment' ? 'Payment' : 'Upgrade Plan'}
                </Typography>
                <Typography variant="body2" className="text-white/80">
                  {step === 'payment' ? 'Complete your payment' : 'Choose your health card plan'}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="px-4 md:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'selection' ? 'text-[#0E3293]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'selection' ? 'bg-[#0E3293] text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Select Plan</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'payment' ? 'text-[#0E3293]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-[#0E3293] text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

interface PlanOptionProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
}

const PlanOption: React.FC<PlanOptionProps> = ({ plan, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
      isSelected
        ? 'border-[#0E3293] bg-blue-50'
        : 'border-gray-200 bg-white hover:border-[#0E3293]/50'
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <Typography variant="h6" className="text-gray-900 font-semibold">
        {plan.name}
      </Typography>
      <Typography variant="h6" className="text-[#0E3293] font-bold">
        ${plan.price}
      </Typography>
    </div>
    <Typography variant="body2" className="text-gray-600 mb-3">
      {plan.description}
    </Typography>
    <div className="space-y-1">
      {plan.benefits.slice(0, 3).map((benefit, idx) => (
        <div key={idx} className="flex items-center">
          <Icon name="check" size="small" color="#10b981" className="mr-2" />
          <Typography variant="caption" className="text-gray-600">
            {benefit}
          </Typography>
        </div>
      ))}
    </div>
  </div>
);

interface PaymentMethodCardProps {
  method: 'card' | 'upi' | 'wallet';
  icon: string;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  icon,
  title,
  description,
  isSelected,
  onSelect
}) => (
  <div
    onClick={onSelect}
    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
      isSelected
        ? 'border-[#0E3293] bg-blue-50'
        : 'border-gray-200 bg-white hover:border-[#0E3293]/50'
    }`}
  >
    <div className="flex items-center">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
        isSelected ? 'bg-[#0E3293]' : 'bg-gray-100'
      }`}>
        <Icon name={icon as any} size="medium" color={isSelected ? 'white' : '#6b7280'} />
      </div>
      <div className="flex-1">
        <Typography variant="body1" className="text-gray-900 font-medium">
          {title}
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          {description}
        </Typography>
      </div>
      {isSelected && (
        <Icon name="check" size="medium" color="#0E3293" />
      )}
    </div>
  </div>
);

export default HealthCardUpgradePage;
