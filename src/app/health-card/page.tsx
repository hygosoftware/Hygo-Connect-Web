'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Typography, UniversalHeader } from '../../components/atoms';
import { subscriptionservices, userSubscriptionService } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';

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

interface UsedService {
  id: string;
  name: string;
  date: string;
  type: string;
  status: string;
}

interface UserProfile {
  name: string;
  id: string;
  memberSince: string;
  plan: string;
}

const HealthCardPage: React.FC = () => {
  const router = useRouter();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cardNumber, setCardNumber] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);

  const [usedServices, setUsedServices] = useState<UsedService[]>([]);

  useEffect(() => {
    void fetchSubscriptionPlans();
    loadUserProfile();
    fetchUsedServices();
  }, []);

  const fetchUsedServices = () => {
    try {
      const tokens = TokenManager.getTokens();
      const userId = tokens.userId;
      
      if (!userId) {
        console.log('No user ID available for fetching services');
        return;
      }

      // TODO: Replace with your actual services API endpoint
      // Example: const response = await apiClient.get(`/user/${userId}/services`);
      // For now, setting empty array since no API endpoint provided
      setUsedServices([]);
      
      console.log('Used services loaded (currently empty - replace with actual API)');
    } catch (error) {
      console.error('Error fetching used services:', error);
      setUsedServices([]);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await subscriptionservices.getallsubscription();
      const respUnknown = response as unknown;
      const data = (respUnknown as { data?: unknown }).data;
      if (Array.isArray(data)) {
        const plans = data as SubscriptionPlan[];
        setSubscriptionPlans(plans);
        await selectActivePlan(plans);
      } else if (Array.isArray(respUnknown)) {
        const plans = respUnknown as SubscriptionPlan[];
        setSubscriptionPlans(plans);
        await selectActivePlan(plans);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectActivePlan = async (plans: SubscriptionPlan[]) => {
    try {
      const tokens = TokenManager.getTokens();
      const userId = tokens.userId;
      if (!userId) {
        // Anonymous: no active subscription context
        setActivePlan(null);
        setHasActiveSubscription(false);
        return;
      }
      const active = await userSubscriptionService.getActiveSubscription(userId);
      // Try to find planId in common shapes
      let planId: string | undefined;
      if (Array.isArray(active)) {
        // Prefer status === 'active', otherwise pick the most recent by subscriptionStartDate, else first
        const pick =
          active.find((it) => it && typeof it === 'object' && (it as any).status === 'active') ||
          active
            .slice()
            .sort((a, b) => {
              const aDate = (a && typeof a === 'object' && (a as any).subscriptionStartDate) ? Date.parse((a as any).subscriptionStartDate) : 0;
              const bDate = (b && typeof b === 'object' && (b as any).subscriptionStartDate) ? Date.parse((b as any).subscriptionStartDate) : 0;
              return bDate - aDate;
            })[0] ||
          active[0];

        if (pick && typeof pick === 'object') {
          const obj = pick as Record<string, unknown>;
          const subField = obj.subscription as unknown;
          if (typeof (obj as any).subscriptionNumber === 'string') {
            setCardNumber((obj as any).subscriptionNumber as string);
          }
          if (typeof obj.subscriptionId === 'string') {
            planId = obj.subscriptionId;
          } else if (subField && typeof subField === 'object' && '_id' in subField && typeof (subField as any)._id === 'string') {
            planId = (subField as any)._id;
          } else if (typeof subField === 'string') {
            planId = subField;
          }
        }
      } else if (active && typeof active === 'object') {
        const obj = active as Record<string, unknown>;
        const planField = obj.plan as unknown;
        if (typeof (obj as any).subscriptionNumber === 'string') {
          setCardNumber((obj as any).subscriptionNumber as string);
        }
        if (typeof obj.planId === 'string') {
          planId = obj.planId;
        } else if (typeof obj.subscriptionId === 'string') {
          planId = obj.subscriptionId;
        } else if (planField && typeof planField === 'object' && '_id' in planField && typeof (planField as any)._id === 'string') {
          planId = (planField as any)._id;
        } else if (typeof planField === 'string') {
          planId = planField;
        }
      }
      const plan = plans.find(p => p._id === planId) || null;
      setActivePlan(plan);
      setHasActiveSubscription(!!plan);
      if (plan) {
        setUserProfile(prev => prev ? { ...prev, plan: plan.subscriptionName || prev.plan } : prev);
      } else {
        setUserProfile(prev => prev ? { ...prev, plan: 'None' } : prev);
      }
    } catch (e) {
      console.warn('Could not resolve active subscription plan');
      setActivePlan(null);
      setHasActiveSubscription(false);
      setUserProfile(prev => prev ? { ...prev, plan: 'None' } : prev);
    }
  };

  const loadUserProfile = () => {
    const tokens = TokenManager.getTokens();
    const userId = tokens.userId;
    const userInfo = tokens.userInfo;
    
    if (userId && userInfo) {
      setUserProfile({
        name: userInfo.FullName || userInfo.fullName || 'User',
        id: userId,
        memberSince: new Date(userInfo.createdAt || Date.now()).getFullYear().toString(),
        plan: 'None' // This will be updated if an active subscription exists
      });
    } else {
      // If no user data available, set empty profile
      setUserProfile(null);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSubscribe = () => {
    setShowSubscriptions(true);
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    // Navigate to payment or plan details
    router.push(`/health-card/upgrade?planId=${plan._id}`);
  };

  if (showSubscriptions) {
    return (
      <div className="min-h-screen bg-bg-white">
        <UniversalHeader
          title="Subscription Plans"
          subtitle="Choose your perfect health plan"
          variant="gradient"
          icon="health-card"
          showBackButton={true}
          onBackPress={() => setShowSubscriptions(false)}
        />

        <div className="px-4 md:px-6 py-8">
          {loading ? (
            <div className="text-center py-12">
              <Typography variant="body1" className="text-gray-600">
                Loading subscription plans...
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <div className="text-center mb-6">
                    <Typography variant="h6" className="text-gray-900 font-bold mb-2">
                      {plan.subscriptionName || 'Subscription Plan'}
                    </Typography>
                    <div className="text-3xl font-bold text-[#0E3293] mb-2">
                      ₹{plan.price || 0}
                    </div>
                    <Typography variant="body2" className="text-gray-600">
                      {plan.duration ? 
                        `${plan.duration.value} ${plan.duration.unit}${plan.duration.value > 1 ? 's' : ''}` : 
                        'Duration not specified'
                      }
                    </Typography>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Typography variant="body2" className="text-gray-600 mb-3 font-medium">
                      Available Services:
                    </Typography>
                    {plan.availableServices?.map((service) => (
                      <div key={service._id} className="flex items-center space-x-3">
                        <Icon name="check" className="text-green-500 w-4 h-4" />
                        <Typography variant="body2" className="text-gray-700">
                          {service.serviceName}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    className="w-full py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Select Plan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <UniversalHeader
        title="Health Card"
        subtitle="Your digital health companion"
        variant="gradient"
        icon="health-card"
        showBackButton={true}
        onBackPress={handleGoBack}
      />

      <div className="px-4 md:px-6 py-8 space-y-8">
        {/* Virtual Health Card */}
        <div className="max-w-lg mx-auto">
  <div className="relative rounded-xl bg-[#0E3293] text-white px-4 py-4 sm:px-6 sm:py-6 overflow-visible" style={{minHeight:'148px'}}>
    {/* Floating icon button */}
    <button className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/30 hover:bg-white/50 rounded-full p-1.5 sm:p-2 shadow-md transition-all border border-white/30">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="4" width="14" height="14" rx="3" fill="#fff" fillOpacity=".8"/>
        <path d="M7 11h4m-2-2v4" stroke="#0E3293" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
    {/* Card header and plan badge */}
    <div className="flex flex-col gap-1 mb-3">
      <div>
        <div className="font-bold text-lg md:text-xl leading-tight text-left">HYGO Health</div>
        <div className="text-xs md:text-sm opacity-80">Digital Health Card</div>
      </div>
      <div className="flex md:block justify-end">
        <span className="bg-blue-800/60 rounded-xl px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow border border-white/10 whitespace-nowrap">
          {userProfile?.plan || 'No Plan'}
        </span>
      </div>
    </div>
    {/* Cardholder/plan row */}
    <div className="flex flex-col gap-1 mt-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="uppercase text-xs opacity-70">Card Holder</div>
        <div className="font-bold text-base md:text-lg">{userProfile?.name || 'Loading...'}</div>
      </div>
      <div className="md:text-right">
        <div className="uppercase text-xs opacity-70">Plan</div>
        <div className="font-bold text-base md:text-lg">{userProfile?.plan || 'No Plan'}</div>
      </div>
    </div>
    {/* Card ID / Valid Until row */}
    <div className="flex flex-col gap-1 mt-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="uppercase text-xs opacity-70">Card ID</div>
        <div className="font-mono text-base md:text-lg tracking-widest">{cardNumber || userProfile?.id || 'HYGO001'}</div>
      </div>
      <div className="md:text-right">
        <div className="uppercase text-xs opacity-70">Valid Until</div>
        <div className="font-bold text-base md:text-lg">{activePlan?.duration?.unit === 'year' && activePlan?.duration?.value ? `Aug ${2026}` : '—'}</div>
      </div>
    </div>
  </div>
</div>

        {/* Card Details (from active subscription) */}
        <div className="max-w-3xl mx-auto">
          <Typography variant="h5" className="text-gray-900 font-bold mb-6 text-center">
            Card Details
          </Typography>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            {loading ? (
              <Typography variant="body2" className="text-gray-600 text-center">
                Loading card details...
              </Typography>
            ) : !activePlan ? (
              <div className="text-center space-y-4">
                <Typography variant="body2" className="text-gray-600">
                  No subscription found.
                </Typography>
                <Button
                  onClick={handleSubscribe}
                  className="px-6 py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Purchase Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" className="text-gray-900 font-bold">
                    {activePlan.subscriptionName}
                  </Typography>
                  <Typography variant="h6" className="text-[#0E3293] font-bold">
                    ₹{activePlan.price}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <Typography variant="body1" className="text-gray-900 font-semibold">
                    Duration
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {activePlan.duration?.value} {activePlan.duration?.unit}{activePlan.duration?.value && activePlan.duration.value > 1 ? 's' : ''}
                  </Typography>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <Typography variant="body1" className="text-gray-900 font-semibold mb-3">
                    Available Services
                  </Typography>
                  <div className="space-y-2">
                    {activePlan.availableServices?.map((service) => (
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
            )}
          </div>
        </div>

        {/* Used Services */}
        <div className="max-w-4xl mx-auto">
          <Typography variant="h5" className="text-gray-900 font-bold mb-6 text-center">
            Recent Services
          </Typography>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            {usedServices.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Icon name="info" className="w-12 h-12 text-gray-300 mb-4" />
                <Typography variant="body1" className="text-gray-600 mb-2">
                  No services used yet
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                  Your recent health services will appear here.
                </Typography>
              </div>
            ) : (
              <div className="space-y-4">
                {usedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#0E3293] rounded-full flex items-center justify-center">
                        <Icon name={service.type === 'Consultation' ? 'appointment' : 'heart'} className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="body1" className="font-semibold text-gray-900">
                          {service.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          {service.type} • {new Date(service.date).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        service.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        service.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plans Preview */}
        <div className="max-w-6xl mx-auto mt-12">
          <Typography variant="h5" className="text-gray-900 font-bold mb-6 text-center">
            Subscription Plan Options
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.slice(0,3).map((plan) => (
              <div
                key={plan._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <div className="text-center mb-6">
                  <Typography variant="h6" className="text-gray-900 font-bold mb-2">
                    {plan.subscriptionName || 'Subscription Plan'}
                  </Typography>
                  <div className="text-3xl font-bold text-[#0E3293] mb-2">
                    ₹{plan.price || 0}
                  </div>
                  <Typography variant="body2" className="text-gray-600">
                    {plan.duration ? 
                      `${plan.duration.value} ${plan.duration.unit}${plan.duration.value > 1 ? 's' : ''}` : 
                      'Duration not specified'
                    }
                  </Typography>
                </div>
                <div className="space-y-3 mb-6">
                  <Typography variant="body2" className="text-gray-600 mb-3 font-medium">
                    Available Services:
                  </Typography>
                  {plan.availableServices?.slice(0, 3).map((service) => (
                    <div key={service._id} className="flex items-center space-x-3">
                      <Icon name="check" className="text-green-500 w-4 h-4" />
                      <Typography variant="body2" className="text-gray-700">
                        {service.serviceName}
                      </Typography>
                    </div>
                  ))}
                  {plan.availableServices && plan.availableServices.length > 3 && (
                    <Typography variant="body2" className="text-gray-400 ml-7">
                      +{plan.availableServices.length - 3} more
                    </Typography>
                  )}
                </div>
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full py-3 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Select Plan
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              onClick={handleSubscribe}
              className="px-8 py-4 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              View All Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCardPage;
