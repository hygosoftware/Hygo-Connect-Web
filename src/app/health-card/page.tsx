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
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'used'>('overview');

  // Helper to remove the phrase "Health Card" from plan names for display
  const cleanPlanName = (name?: string | null) => {
    if (!name) return '';
    return name.replace(/health\s*card/gi, '').trim().replace(/\s{2,}/g, ' ');
  };

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
          plan: cleanPlanName(activeSubscriptionData.subscription.subscriptionName) || prev.plan,
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
      <div className="min-h-screen bg-bg-white overflow-x-hidden">
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
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 sm:hover:scale-105"
                >
                  <div className="text-center mb-6">
                    <Typography variant="h6" className="text-gray-900 font-bold mb-2">
                      {cleanPlanName(plan.subscriptionName) || 'Subscription Plan'}
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <UniversalHeader
        title="My Health Card"
        subtitle={cleanPlanName(activeSubscription?.subscription?.subscriptionName) || 'Your digital health companion'}
        icon="health-card"
        showBackButton={true}
        onBackPress={handleGoBack}
        rightContent={
          <Button
            onClick={handleSubscribe}
            className="px-4 py-2 bg-[#0E3293] hover:bg-[#0A2470] text-white font-semibold rounded-xl shadow-md text-sm"
          >
            Upgrade
          </Button>
        }
      />

      {/* Main Content Container - Fixed for better web view */}
      <div className="w-full max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Virtual Health Card - Improved responsive design */}
        <div className="w-full">
          <div className="relative rounded-2xl bg-[#1E3A8A] text-white p-6 shadow-lg overflow-hidden">
            {/* Top section with logo and status */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="font-bold text-xl leading-tight">HYGO Health</div>
                <div className="text-sm opacity-90">Digital Health Card</div>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <Icon name="plus" className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Card holder and plan info */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs opacity-70 uppercase tracking-wide mb-1">CARD HOLDER</div>
                <div className="font-bold text-lg">
                  {userProfile?.name || 'Devyani'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70 uppercase tracking-wide mb-1">PLAN</div>
                <div className="font-bold text-lg">
                  {cleanPlanName(activeSubscription?.subscription?.subscriptionName) || 'Family Essential'}
                </div>
              </div>
            </div>

            {/* Bottom section with card ID and validity */}
            <div className="flex justify-between items-end mt-6">
              <div>
                <div className="text-xs opacity-70 uppercase tracking-wide mb-1">CARD ID</div>
                <div className="font-mono text-sm">
                  {cardNumber || '25090100000000001'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70 uppercase tracking-wide mb-1">VALID UNTIL</div>
                <div className="font-bold text-base">
                  {userProfile?.subscriptionEndDate ? 
                    new Date(userProfile.subscriptionEndDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'Sep 2026'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Improved layout */}
        <div className="w-full">
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-200 flex">
            <button
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'overview' 
                  ? 'bg-[#0E3293] text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <Icon name="grid" className="w-4 h-4 inline mr-1 sm:mr-2" />
              Overview
            </button>
            <button
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'benefits' 
                  ? 'bg-[#0E3293] text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('benefits')}
            >
              <Icon name="check-circle" className="w-4 h-4 inline mr-1 sm:mr-2" />
              Benefits
            </button>
            <button
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'used' 
                  ? 'bg-[#0E3293] text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('used')}
            >
              <Icon name="clock" className="w-4 h-4 inline mr-1 sm:mr-2" />
              Used Services
            </button>
          </div>
        </div>

        {/* Tab Content - Fixed service display and spacing */}
        <div className="w-full">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Family Members Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    <Icon name="users" className="text-[#0E3293] w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {activeSubscription?.familyMembers?.length ?? 0}
                </div>
                <div className="text-sm text-gray-500 leading-tight">
                  Family Members<br />Covered
                </div>
              </div>

              {/* Services Available Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    <Icon name="star" className="text-[#0E3293] w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {activeSubscription?.subscription?.availableServices?.length ?? 7}
                </div>
                <div className="text-sm text-gray-500 leading-tight">
                  Services<br />Available
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {loading ? (
                <Typography variant="body2" className="text-gray-600 text-center">Loading...</Typography>
              ) : !activeSubscription || !activeSubscription.subscription?.availableServices ? (
                <div className="text-center py-8">
                  <Icon name="info" className="w-12 h-12 text-gray-300 mb-3 mx-auto" />
                  <Typography variant="body1" className="text-gray-600 mb-2 font-medium">
                    No services available
                  </Typography>
                  <Typography variant="body2" className="text-gray-400 text-center">
                    {hasActiveSubscription ? 'Your subscription services will appear here.' : 'Purchase a subscription to access health services.'}
                  </Typography>
                </div>
              ) : (
                <div className="space-y-4">
                  <Typography variant="h6" className="text-gray-900 font-bold mb-4">
                    Available Services
                  </Typography>
                  {(activeSubscription.availableServices || []).map((svc: any, idx: number) => {
                    const planSvc = activeSubscription.subscription?.availableServices?.find((s: any) => s._id === svc.service);
                    const usedCount = Array.isArray(svc?.used) ? svc.used.length : 0;
                    const totalAllowed = typeof svc?.totalAllowed === 'number' ? svc.totalAllowed : 0;
                    const isUnlimited = totalAllowed === -1;
                    const percent = isUnlimited
                      ? 100
                      : totalAllowed > 0
                        ? Math.min(100, Math.round((usedCount / totalAllowed) * 100))
                        : 0;
                    return (
                      <div key={`${svc?._id || svc?.service || idx}`} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon name="check" className="text-green-500 w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <Typography variant="body1" className="text-gray-900 font-medium">
                              {planSvc?.serviceName || `Service ${idx + 1}`}
                            </Typography>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              isUnlimited ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isUnlimited ? 'Unlimited' : `Used ${usedCount}/${totalAllowed}`}
                            </span>
                          </div>
                          {!isUnlimited && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-1.5 bg-green-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <Typography variant="body2" className="text-gray-500 mt-1">
                                Remaining {Math.max(0, totalAllowed - usedCount)} out of {totalAllowed}
                              </Typography>
                            </div>
                          )}
                          {isUnlimited && (
                            <Typography variant="body2" className="text-gray-500 mt-1">
                              Included in your plan
                            </Typography>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'used' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {usedServices.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <Icon name="info" className="w-12 h-12 text-gray-300 mb-3" />
                  <Typography variant="body1" className="text-gray-600 mb-2 font-medium">
                    No services used yet
                  </Typography>
                  <Typography variant="body2" className="text-gray-400 text-center">
                    {hasActiveSubscription ? 'Your used services will appear here after you use them.' : 'Purchase a subscription to access health services.'}
                  </Typography>
                </div>
              ) : (
                <div className="space-y-4">
                  <Typography variant="h6" className="text-gray-900 font-bold mb-4">
                    Service Usage
                  </Typography>
                  {usedServices.map((service, uIdx) => (
                    <div key={`${service.id || service.serviceId}-${uIdx}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0E3293] rounded-full flex items-center justify-center">
                          <Icon name={service.type === 'Consultation' ? 'calendar' : 'heart'} className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <Typography variant="body1" className="font-semibold text-gray-900">
                            {service.name}
                          </Typography>
                          <Typography variant="body2" className="text-gray-500 text-sm">
                            Used: {service.usedCount}/{service.totalAllowed === -1 ? 'Unlimited' : service.totalAllowed}
                          </Typography>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          service.totalAllowed === -1 ? 'bg-purple-100 text-purple-800' :
                          service.usedCount === 0 ? 'bg-green-100 text-green-800' :
                          service.usedCount < service.totalAllowed ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {service.totalAllowed === -1 ? 'Unlimited' :
                           service.usedCount === 0 ? 'Available' :
                           service.usedCount < service.totalAllowed ? 'In Use' :
                           'Used Up'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Services Section - Only show if user has active subscription */}
        {hasActiveSubscription && activeTab === 'overview' && (
          <div className="w-full mt-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Typography variant="h6" className="text-gray-900 font-bold mb-4">
                Quick Actions
              </Typography>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <Icon name="calendar" className="w-6 h-6 text-[#0E3293] mb-2" />
                  <Typography variant="body2" className="text-gray-700 text-center font-medium">
                    Book Appointment
                  </Typography>
                </button>
                <button className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <Icon name="phone" className="w-6 h-6 text-green-600 mb-2" />
                  <Typography variant="body2" className="text-gray-700 text-center font-medium">
                    Emergency Call
                  </Typography>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthCardPage;