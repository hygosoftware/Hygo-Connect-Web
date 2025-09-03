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
      const planServices = Array.isArray(subscription.subscription.availableServices)
      ? subscription.subscription.availableServices
      : [];
    const services: UsedService[] = subscription.availableServices.map((service, index) => {
      // Try to find the service name from the plan's availableServices
      let name = `Service ${index + 1}`;
      const matchedPlan = planServices.find((p: any) => {
        const planId = typeof p === 'string' ? p : p?._id;
        return String(planId) === String(service.service);
      });
      if (matchedPlan && matchedPlan.serviceName) {
        name = matchedPlan.serviceName;
      } else if ((service as any)?.serviceName) {
        name = (service as any).serviceName;
      }
      return {
        id: service._id,
        name,
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
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafd] to-[#eaf1fa] flex flex-col items-center">
      <UniversalHeader
        title="Health Card"
        subtitle="Your digital health companion"
        icon="health-card"
        showBackButton={true}
        onBackPress={handleGoBack}
      />
      <div className="w-full md:bg-white/80 md:rounded-3xl md:shadow-lg md:p-10 md:space-y-10 px-2 py-4 space-y-6 max-w-md md:max-w-3xl mx-auto">
        {/* Enhanced Virtual Health Card for Mobile */}
        <div className="rounded-3xl bg-[#0E3293] text-white px-4 py-7 shadow-xl relative flex flex-col gap-4 min-h-[180px] border-2 border-[#183f8c]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-bold text-lg md:text-xl leading-tight">HYGO</div>
              <div className="text-xs md:text-sm opacity-80">Digital Health Card</div>
            </div>
            <span className={`rounded-xl px-3 py-1 text-xs font-semibold uppercase tracking-wide border border-white/20 whitespace-nowrap ${
              userProfile?.subscriptionStatus === 'active' ? 'bg-green-700/70' :
              userProfile?.subscriptionStatus === 'expired' ? 'bg-red-700/70' :
              userProfile?.subscriptionStatus === 'cancelled' ? 'bg-gray-700/70' :
              'bg-blue-700/70'
            }`}>
              {userProfile?.subscriptionStatus === 'active' ? 'ACTIVE' :
                userProfile?.subscriptionStatus === 'expired' ? 'EXPIRED' :
                userProfile?.subscriptionStatus === 'cancelled' ? 'CANCELLED' :
                'NO PLAN'}
            </span>
          </div>
          <div className="flex flex-wrap justify-between items-end gap-2">
            <div className="flex items-center gap-2">
              {/* Avatar/Initials */}
              <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center font-bold text-[#0E3293] text-lg shadow-md" aria-label="Profile Avatar">
                {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="uppercase text-[11px] opacity-70">Holder</div>
                <div className="font-bold text-lg md:text-xl truncate max-w-[120px]">{userProfile?.name || '...'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="uppercase text-[11px] opacity-70">Plan</div>
              <div className="font-bold text-lg md:text-xl truncate max-w-[120px]">{userProfile?.plan || 'No Plan'}</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 mt-1">
            <div>
              <div className="uppercase text-[11px] opacity-70">Card ID</div>
              <div className="font-mono text-xs tracking-widest break-all">{cardNumber || userProfile?.id || 'HYGO001'}</div>
            </div>
            <div className="text-right">
              <div className="uppercase text-[11px] opacity-70">Valid Until</div>
              <div className="font-bold text-xs md:text-sm">
                {userProfile?.subscriptionEndDate ?
                  new Date(userProfile.subscriptionEndDate).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  }) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Card Details (from active subscription) */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="credit-card" className="text-[#0E3293]" size="medium" aria-label="Subscription Details Icon" />
            <Typography variant="h6" className="text-gray-900 font-bold">
              Subscription Details
            </Typography>
            <div className="flex-1 border-t border-gray-200 ml-3" />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            {loading ? (
              <Typography variant="body2" className="text-gray-600 text-center">
                Loading subscription details...
              </Typography>
            ) : !activeSubscription ? (
              <div className="text-center space-y-3">
                <Typography variant="body2" className="text-gray-600">
                  No active subscription found.
                </Typography>
                <Button
                  onClick={handleSubscribe}
                  className="px-4 py-2 bg-[#0E3293] hover:bg-[#0A2470] text-white font-semibold rounded-lg shadow-md text-sm"
                >
                  Purchase Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <div className="uppercase text-xs text-gray-400 mb-1">Plan</div>
                    <Typography variant="body2" className="text-gray-900 font-bold text-lg">
                      {activeSubscription.subscription.subscriptionName}
                    </Typography>
                  </div>
                  <div>
                    <div className="uppercase text-xs text-gray-400 mb-1">Status</div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      activeSubscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      activeSubscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activeSubscription.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="uppercase text-xs text-gray-400 mb-1">Price</div>
                    <Typography variant="body2" className="text-[#0E3293] font-bold">
                      ₹{activeSubscription.subscription.price}
                    </Typography>
                  </div>
                  <div>
                    <div className="uppercase text-xs text-gray-400 mb-1">Duration</div>
                    <Typography variant="body2" className="text-gray-600">
                      {activeSubscription.subscription.duration?.value} {activeSubscription.subscription.duration?.unit}{activeSubscription.subscription.duration?.value > 1 ? 's' : ''}
                    </Typography>
                  </div>
                  <div>
                    <div className="uppercase text-xs text-gray-400 mb-1">Valid Until</div>
                    <Typography variant="body2" className="text-gray-600">
                      {new Date(activeSubscription.subscriptionEndDate).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </Typography>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <Typography variant="body2" className="text-gray-900 font-semibold mb-2">
                    Included Services
                  </Typography>
                  <div className="space-y-1">
                    {activeSubscription.availableServices?.map((svc, aIdx) => {
                      const planServices: any[] = (activeSubscription.subscription?.availableServices as any[]) || [];
                      const svcId = (svc as any)?.service?._id || (svc as any)?.service;
                      const matchedPlan = planServices.find((p: any) => {
                        const planId = (typeof p === 'string') ? p : p?._id;
                        return String(planId) === String(svcId);
                      });
                      const name = (matchedPlan && matchedPlan.serviceName) || (svc as any)?.serviceName || `Service ${aIdx + 1}`;
                      const key = `${(svc as any)?._id || svcId}-${aIdx}`;
                      return (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <Icon name="check" className="text-green-500 w-4 h-4" />
                          <Typography variant="body2" className="text-gray-700">
                            {name}
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
        <div className="max-w-4xl mx-auto mt-10">
          <div className="flex items-center gap-2 mb-6">
            <Icon name="grid" className="text-[#0E3293]" size="medium" aria-label="Service Usage Icon" />
            <Typography variant="h5" className="text-gray-900 font-bold">
              Service Usage
            </Typography>
            <div className="flex-1 border-t border-gray-200 ml-3" />
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
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
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                        {/* Service-specific icon selection */}
                        {service.name.toLowerCase().includes('consultation') && service.name.toLowerCase().includes('specialist') ? (
                          <Icon name="star" className="text-purple-700" size="medium" />
                        ) : service.name.toLowerCase().includes('consultation') ? (
                          <Icon name="doctor" className="text-blue-700" size="medium" />
                        ) : service.name.toLowerCase().includes('pharmacy') ? (
                          <Icon name="pill" className="text-green-700" size="medium" />
                        ) : service.name.toLowerCase().includes('followup') || service.name.toLowerCase().includes('follow-up') ? (
                          <Icon name="calendar" className="text-orange-600" size="medium" />
                        ) : (
                          <Icon name="check-circle" className="text-gray-500" size="medium" />
                        )}
                      </div>
                      <div>
                        <Typography variant="body1" className="font-semibold text-gray-900">
                          {service.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          Used: {service.usedCount}/{service.totalAllowed === -1 ? 'Unlimited' : service.totalAllowed} • Available since {new Date(service.date).toLocaleDateString()}
                        </Typography>
                        {service.totalAllowed !== -1 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2" aria-label={`Usage progress for ${service.name}`}> 
                            <div
                              className={`h-2 rounded-full ${
                                service.usedCount === 0 ? 'bg-green-400' :
                                service.usedCount < service.totalAllowed ? 'bg-blue-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.round((service.usedCount / service.totalAllowed) * 100))}%` }}
                            />
                          </div>
                        )}
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