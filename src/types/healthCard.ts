// Health Card Subscription Types

// API Response interfaces matching your actual data structure
export interface ApiSubscriptionService {
  _id: string;
  serviceName: string;
}

export interface ApiAvailableService {
  service: string;
  totalAllowed: number;
  used: any[];
  _id: string;
}

export interface ApiSubscriptionPlan {
  duration: {
    value: number;
    unit: string;
  };
  _id: string;
  subscriptionName: string;
  price: number;
  availableServices: ApiSubscriptionService[];
  adminId: string;
  allowFamilyMembers: boolean;
  isDeleted: boolean;
  createdAt: string;
  __v: number;
}

export interface ApiCardHolder {
  _id: string;
  Email: string;
  UserID: string;
  mobileTokens: any[];
  UserType: string;
  FullName?: string;
  MobileNumber?: any[];
  profilePhoto?: string;
  Gender?: string;
  DateOfBirth?: string;
  Age?: number;
  BloodGroup?: string;
  Height?: number;
  Weight?: number;
  Country?: string;
  State?: string;
  City?: string;
  Address?: string;
  ChronicDiseases?: string[];
  Allergies?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiUserSubscription {
  _id: string;
  CardHolder: ApiCardHolder;
  availableServices: ApiAvailableService[];
  familyMembers: any[];
  purchasedAt: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  subscription: ApiSubscriptionPlan;
  subscriptionEndDate: string;
  subscriptionNumber: string;
  subscriptionStartDate: string;
  __v: number;
}

// Legacy interfaces for backward compatibility
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'daily' | 'monthly' | 'quarterly' | 'annual';
  price: number;
  duration: string;
  benefits: string[];
  isPopular?: boolean;
  color: string;
  description: string;
}

export interface HealthCard {
  id: string;
  userId: string;
  cardNumber: string;
  holderName: string;
  holderPhoto?: string;
  planType: SubscriptionPlan['type'];
  planName: string;
  issueDate: string;
  expiryDate: string;
  qrCode: string;
  benefits: string[];
  status: 'active' | 'expired' | 'suspended';
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planType: SubscriptionPlan['type'];
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentMethod?: string;
  amount: number;
  autoRenew: boolean;
}

export interface PaymentDetails {
  method: 'card' | 'upi' | 'wallet';
  amount: number;
  currency: string;
  transactionId?: string;
}
// Note: Mock SUBSCRIPTION_PLANS removed to rely solely on API-driven data.
