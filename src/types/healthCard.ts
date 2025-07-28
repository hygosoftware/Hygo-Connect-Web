// Health Card Subscription Types

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

// Mock data for subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free-basic',
    name: 'Basic Free',
    type: 'free',
    price: 0,
    duration: 'Forever',
    description: 'Basic health card with no benefits',
    color: 'gray',
    benefits: [
      'Digital health card',
      'Basic profile storage',
      'No consultation benefits',
      'No discounts available'
    ]
  },
  {
    id: 'daily-plan',
    name: 'Daily Plan',
    type: 'daily',
    price: 5,
    duration: '1 Day',
    description: 'Perfect for single consultations',
    color: '#0e3293',
    benefits: [
      '1 free doctor consultation',
      '10% discount on medicines',
      'Priority booking',
      'Digital health card',
      'Basic health tips'
    ]
  },
  {
    id: 'monthly-plan',
    name: 'Monthly Plan',
    type: 'monthly',
    price: 30,
    duration: '30 Days',
    description: 'Great for regular health monitoring',
    color: '#0e3293',
    isPopular: true,
    benefits: [
      '5 free doctor consultations',
      '15% discount on medicines',
      'Priority booking',
      'Digital health card',
      'Health tips & reminders',
      'Basic lab test discounts'
    ]
  },
  {
    id: 'quarterly-plan',
    name: 'Quarterly Plan',
    type: 'quarterly',
    price: 80,
    duration: '90 Days',
    description: 'Best value for families',
    color: '#0e3293',
    benefits: [
      '15 free doctor consultations',
      '20% discount on medicines',
      'Priority booking',
      'Digital health card',
      'Advanced health insights',
      '15% lab test discounts',
      'Family member coverage'
    ]
  },
  {
    id: 'annual-plan',
    name: 'Annual Plan',
    type: 'annual',
    price: 300,
    duration: '365 Days',
    description: 'Complete healthcare solution',
    color: '#0e3293',
    benefits: [
      'Unlimited doctor consultations',
      '25% discount on medicines',
      'Priority booking',
      'Digital health card',
      'Premium health insights',
      '25% lab test discounts',
      'Family member coverage',
      'Annual health checkup',
      '24/7 health support'
    ]
  }
];
