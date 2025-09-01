'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Typography, UniversalHeader } from '../../components/atoms';
import { subscriptionservices, userSubscriptionService } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';
import { ApiUserSubscription, ApiSubscriptionPlan, ApiAvailableService } from '../../types/healthCard';

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
  serviceId: string;
  totalAllowed: number;
  usedCount: number;
}

interface UserProfile {
  name: string;
  id: string;
  memberSince: string;
  plan: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  subscriptionStartDate?: string;
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
  const [activeSubscription, setActiveSubscription] = useState<ApiUserSubscription | null>(null);
  const [usedServices, setUsedServices] = useState<UsedService[]>([]);

  useEffect(() => {
    void fetchSubscriptionPlans();
    loadUserProfile();
  }, []);

  const fetchUsedServices = (subscription: ApiUserSubscription | null) => {
    try {
      if (!subscription) {
        setUsedServices([]);
        return;
      }

      // Extract used services from subscription data
      const services: UsedService[] = subscription.availableServices.map((service, index) => {
        const serviceInfo = subscription.subscription.availableServices.find(s => s._id === service.service);
        return {
          id: service._id,
          name: serviceInfo?.serviceName || `Service ${index + 1}`,
          date: subscription.subscriptionStartDate,
          type: 'Health Service',
          status: service.used.length > 0 ? 'Used' : 'Available',
          serviceId: service.service,
          totalAllowed: service.totalAllowed,
          usedCount: service.used.length
        };
      });
      
      setUsedServices(services);
      console.log('Used services loaded from subscription data:', services);
    } catch (error) {
      console.error('Error processing used services:', error);
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
        setActiveSubscription(null);
        setHasActiveSubscription(false);
        return;
      }
      
      const active = await userSubscriptionService.getActiveSubscription(userId);
      console.log('Active subscription response:', active);
      
      let activeSubscriptionData: ApiUserSubscription | null = null;
      let planId: string | undefined;
      
      if (Array.isArray(active)) {
        // Find active subscription
        const activeItem = active.find((item: any) => 
          item && typeof item === 'object' && item.status === 'active'
        ) || active[0];
        
        if (activeItem) {
          activeSubscriptionData = activeItem as ApiUserSubscription;
          planId = activeItem.subscription?._id;
          setCardNumber(activeItem.subscriptionNumber);
        }
      } else if (active && typeof active === 'object') {
        activeSubscriptionData = active as ApiUserSubscription;
        planId = (active as any).subscription?._id;
        setCardNumber((active as any).subscriptionNumber);
      }
      
      setActiveSubscription(activeSubscriptionData);
      
      const plan = plans.find(p => p._id === planId) || null;
      setActivePlan(plan);
      setHasActiveSubscription(!!activeSubscriptionData && activeSubscriptionData.status === 'active');
      
      if (activeSubscriptionData) {
        setUserProfile(prev => prev ? { 
          ...prev, 
          plan: activeSubscriptionData.subscription.subscriptionName || prev.plan,
          subscriptionStatus: activeSubscriptionData.status,
          subscriptionEndDate: activeSubscriptionData.subscriptionEndDate,
          subscriptionStartDate: activeSubscriptionData.subscriptionStartDate
        } : prev);
        
        // Fetch used services from subscription data
        fetchUsedServices(activeSubscriptionData);
      } else {
        setUserProfile(prev => prev ? { ...prev, plan: 'None', subscriptionStatus: 'none' } : prev);
        fetchUsedServices(null);
      }
    } catch (e) {
      console.warn('Could not resolve active subscription plan:', e);
      setActivePlan(null);
      setActiveSubscription(null);
      setHasActiveSubscription(false);
      setUserProfile(prev => prev ? { ...prev, plan: 'None', subscriptionStatus: 'none' } : prev);
      fetchUsedServices(null);
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
              {subscriptionPlans.map((plan, idx) => (
                <div
                  key={`${plan._id}-${idx}`}
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
                    {plan.availableServices?.map((service, sIdx) => (
                      <div key={`${service._id}-${sIdx}`} className="flex items-center space-x-3">
                        <Icon name="check" className="text-green-500 w-4 h-4" />
                        <Typography variant="body2" className="text-gray-700">
                          {service.serviceName}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    className="w-full py-3 bg-[#0E3293] hover:bg-[#0A2470] text-white font-semibold rounded-xl shadow-md transition-all duration-200"
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
        icon="health-card"
        showBackButton={true}
        onBackPress={handleGoBack}
      />

      <div className="px-4 md:px-6 py-8 space-y-8">
        {/* Virtual Health Card */}
        <div className="max-w-lg mx-auto">
  <div className="relative rounded-xl bg-[#0E3293] text-white px-4 py-4 sm:px-6 sm:py-6 overflow-visible" style={{minHeight:'148px'}}>
    {/* Card header and plan badge */}
    <div className="flex flex-col gap-1 mb-3">
      <div>
        <div className="font-bold text-lg md:text-xl leading-tight text-left">HYGO Health</div>
        <div className="text-xs md:text-sm opacity-80">Digital Health Card</div>
      </div>
      <div className="flex md:block justify-end">
        <span className={`rounded-xl px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow border border-white/10 whitespace-nowrap ${
          userProfile?.subscriptionStatus === 'active' ? 'bg-green-800/60' :
          userProfile?.subscriptionStatus === 'expired' ? 'bg-red-800/60' :
          userProfile?.subscriptionStatus === 'cancelled' ? 'bg-gray-800/60' :
          'bg-blue-800/60'
        }`}>
          {userProfile?.subscriptionStatus === 'active' ? 'ACTIVE' :
           userProfile?.subscriptionStatus === 'expired' ? 'EXPIRED' :
           userProfile?.subscriptionStatus === 'cancelled' ? 'CANCELLED' :
           'NO PLAN'}
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
        <div className="font-bold text-base md:text-lg">
          {userProfile?.subscriptionEndDate ? 
            new Date(userProfile.subscriptionEndDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : '—'
          }
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Card Details (from active subscription) */}
        <div className="max-w-3xl mx-auto">
          <Typography variant="h5" className="text-gray-900 font-bold mb-6 text-center">
            Subscription Details
          </Typography>
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            {loading ? (
              <Typography variant="body2" className="text-gray-600 text-center">
                Loading subscription details...
              </Typography>
            ) : !activeSubscription ? (
              <div className="text-center space-y-4">
                <Typography variant="body2" className="text-gray-600">
                  No active subscription found.
                </Typography>
                <Button
                  onClick={handleSubscribe}
                  className="px-6 py-3 bg-[#0E3293] hover:bg-[#0A2470] text-white font-semibold rounded-xl shadow-md transition-all duration-200"
                >
                  Purchase Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" className="text-gray-900 font-bold">
                    {activeSubscription.subscription.subscriptionName}
                  </Typography>
                  <div className="text-right">
                    <Typography variant="h6" className="text-[#0E3293] font-bold">
                      ₹{activeSubscription.subscription.price}
                    </Typography>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      activeSubscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      activeSubscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activeSubscription.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Typography variant="body1" className="text-gray-900 font-semibold">
                      Duration
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {activeSubscription.subscription.duration?.value} {activeSubscription.subscription.duration?.unit}{activeSubscription.subscription.duration?.value > 1 ? 's' : ''}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body1" className="text-gray-900 font-semibold">
                      Valid Until
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {new Date(activeSubscription.subscriptionEndDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <Typography variant="body1" className="text-gray-900 font-semibold mb-3">
                    Available Services
                  </Typography>
                  <div className="space-y-2">
                    {activeSubscription.availableServices?.map((svc, aIdx) => {
                      const usedCount = Array.isArray(svc.used) ? svc.used.length : 0;
                      const totalAllowed = svc.totalAllowed;
                      // Resolve name from plan's availableServices (which may be object list or string IDs)
                      const planServices: any[] = (activeSubscription.subscription?.availableServices as any[]) || [];
                      const svcId = (svc as any)?.service?._id || (svc as any)?.service;
                      const matchedPlan = planServices.find((p: any) => {
                        const planId = (typeof p === 'string') ? p : p?._id;
                        return String(planId) === String(svcId);
                      });
                      const name = (matchedPlan && matchedPlan.serviceName) || (svc as any)?.serviceName || `Service ${aIdx + 1}`;
                      const key = `${(svc as any)?._id || svcId}-${aIdx}`;
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon name="check" className="text-green-500 w-4 h-4" />
                            <Typography variant="body2" className="text-gray-700">
                              {name}
                            </Typography>
                          </div>
                          <Typography variant="body2" className="text-gray-500">
                            {usedCount}/{totalAllowed === -1 ? 'Unlimited' : totalAllowed} used
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Usage */}
        <div className="max-w-4xl mx-auto">
          <Typography variant="h5" className="text-gray-900 font-bold mb-6 text-center">
            Service Usage
          </Typography>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            {usedServices.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Icon name="info" className="w-12 h-12 text-gray-300 mb-4" />
                <Typography variant="body1" className="text-gray-600 mb-2">
                  No services available
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                  {hasActiveSubscription ? 'Your subscription services will appear here.' : 'Purchase a subscription to access health services.'}
                </Typography>
              </div>
            ) : (
              <div className="space-y-4">
                {usedServices.map((service, uIdx) => (
                  <div key={`${service.id || service.serviceId}-${uIdx}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#0E3293] rounded-full flex items-center justify-center">
                        <Icon name={service.type === 'Consultation' ? 'appointment' : 'heart'} className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Typography variant="body1" className="font-semibold text-gray-900">
                          {service.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Used: {service.usedCount}/{service.totalAllowed === -1 ? 'Unlimited' : service.totalAllowed} • Available since {new Date(service.date).toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          service.totalAllowed === -1 ? 'bg-purple-100 text-purple-800' :
                          service.usedCount === 0 ? 'bg-green-100 text-green-800' :
                          service.usedCount < service.totalAllowed ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {service.totalAllowed === -1 ? 'Unlimited' :
                           service.usedCount === 0 ? 'Available' :
                           service.usedCount < service.totalAllowed ? 'Partially Used' :
                           'Fully Used'}
                        </span>
                        <Typography variant="body2" className="text-gray-500 text-xs">
                          {service.totalAllowed === -1 ? 'Unlimited remaining' : `${service.totalAllowed - service.usedCount} remaining`}
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plans Preview removed for minimal UI */}
      </div>
    </div>
  );
};

export default HealthCardPage;
