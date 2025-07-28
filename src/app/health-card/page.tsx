'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../../components/atoms';
import { Button } from '../../components/atoms';
import { Typography } from '../../components/atoms';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../types/healthCard';

const HealthCardSubscriptionPage: React.FC = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const handleGoBack = () => {
    router.back();
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (plan.type === 'free') {
      // For free plan, show current card or create basic card
      router.push('/health-card/card');
    } else {
      // For paid plans, go to upgrade page
      router.push(`/health-card/upgrade?plan=${plan.id}`);
    }
  };

  const handleCompareAll = () => {
    // Scroll to comparison table or show modal
    const comparisonSection = document.getElementById('comparison-table');
    if (comparisonSection) {
      comparisonSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
                  Health Card Plans
                </Typography>
                <Typography variant="body2" className="text-white/80">
                  Choose the perfect plan for your health needs
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-4 md:px-6 py-8 text-center">
        <Typography variant="h3" className="text-gray-900 font-bold mb-4">
          Unlock Your Health Benefits
        </Typography>
        <Typography variant="body1" className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Get access to premium healthcare services, doctor consultations, and exclusive discounts with our health card subscription plans.
        </Typography>
      </div>

      {/* Plans Grid */}
      <div className="px-4 md:px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handlePlanSelect(plan)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Compare Plans Button */}
      <div className="px-4 md:px-6 pb-8 text-center">
        <Button
          onClick={handleCompareAll}
          className="px-8 py-4 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          Compare All Plans
        </Button>
      </div>

      {/* Comparison Table */}
      <div id="comparison-table" className="px-4 md:px-6 pb-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 max-w-7xl mx-auto">
          <Typography variant="h5" className="text-gray-900 font-bold mb-6 text-center">
            Plan Comparison
          </Typography>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-2 font-semibold text-gray-900">Features</th>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-2 font-semibold text-gray-900 min-w-32">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 font-medium text-gray-700">Price</td>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-2">
                      <span className="font-bold text-[#0E3293]">
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 font-medium text-gray-700">Duration</td>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-2 text-gray-600">
                      {plan.duration}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 font-medium text-gray-700">Doctor Consultations</td>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-2 text-gray-600">
                      {plan.type === 'free' ? '❌' : 
                       plan.type === 'daily' ? '1 Free' :
                       plan.type === 'monthly' ? '5 Free' :
                       plan.type === 'quarterly' ? '15 Free' :
                       'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 font-medium text-gray-700">Medicine Discounts</td>
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-2 text-gray-600">
                      {plan.type === 'free' ? '❌' : 
                       plan.type === 'daily' ? '10%' :
                       plan.type === 'monthly' ? '15%' :
                       plan.type === 'quarterly' ? '20%' :
                       '25%'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: () => void;
  index: number;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, index }) => {
  const isFree = plan.type === 'free';
  const cardBgColor = isFree ? 'bg-gray-100' : 'bg-white';
  const borderColor = isFree ? 'border-gray-300' : `border-[#0E3293]/20`;
  const textColor = isFree ? 'text-gray-600' : 'text-gray-900';

  return (
    <div
      className={`${cardBgColor} ${borderColor} border-2 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden group`}
      onClick={onSelect}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform rotate-12">
          Most Popular
        </div>
      )}

      {/* Background Gradient */}
      {!isFree && (
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0E3293] via-blue-500 to-purple-500"></div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <div className={`w-16 h-16 ${isFree ? 'bg-gray-300' : 'bg-gradient-to-r from-[#0E3293] to-blue-600'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <Icon name="health-card" size="medium" color="white" />
        </div>
        <Typography variant="h6" className={`${textColor} font-bold mb-2`}>
          {plan.name}
        </Typography>
        <Typography variant="body2" className="text-gray-500 mb-4">
          {plan.description}
        </Typography>
        <div className="mb-4">
          <span className={`text-3xl font-bold ${isFree ? 'text-gray-600' : 'text-[#0E3293]'}`}>
            {plan.price === 0 ? 'Free' : `$${plan.price}`}
          </span>
          <span className="text-gray-500 text-sm ml-2">/ {plan.duration}</span>
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-3 mb-6">
        {plan.benefits.slice(0, 4).map((benefit, idx) => (
          <div key={idx} className="flex items-center">
            <div className={`w-5 h-5 rounded-full ${isFree ? 'bg-gray-400' : 'bg-green-500'} flex items-center justify-center mr-3 flex-shrink-0`}>
              <Icon name="check" size="small" color="white" />
            </div>
            <Typography variant="body2" className="text-gray-600 text-sm">
              {benefit}
            </Typography>
          </div>
        ))}
        {plan.benefits.length > 4 && (
          <Typography variant="body2" className="text-gray-500 text-sm text-center">
            +{plan.benefits.length - 4} more benefits
          </Typography>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={onSelect}
        className={`w-full py-3 rounded-2xl font-semibold transition-all duration-200 ${
          isFree
            ? 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            : 'bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
        }`}
      >
        {isFree ? 'View Free Card' : 'Upgrade Now'}
      </Button>
    </div>
  );
};

export default HealthCardSubscriptionPage;
