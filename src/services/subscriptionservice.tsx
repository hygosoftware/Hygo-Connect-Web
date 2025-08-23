import { loadRazorpayScript } from '../services/razorpay';
import { getRazorpayConfig } from '../lib/razorpay';
import { TokenManager } from './auth';
import axios from 'axios';
import type { IRazorpay } from '../types/razorpay';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
// Prefer using sanitized key from getRazorpayConfig to avoid accidental concatenation
const RAZORPAY_KEY = ((): string => {
  const key = getRazorpayConfig().key as string;
  return key;
})();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Increased to 60 seconds for pill reminder operations
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  // Add request interceptor to include auth token if available
  apiClient.interceptors.request.use(
    (config) => {
      // Get token from TokenManager
      const { accessToken } = TokenManager.getTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
  
      // Log the request for debugging
      console.log('🔐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!accessToken,
        headers: config.headers
      });
  
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor for error handling and token refresh
  apiClient.interceptors.response.use(
    (response) => {
      // Log successful responses for debugging
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        method: response.config.method?.toUpperCase()
      });
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
  
      // Handle 401 Unauthorized errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        console.log('🔄 Token expired, attempting refresh...');
  
        try {
          const { refreshToken } = TokenManager.getTokens();
          if (refreshToken) {
            // Try to refresh the token
            const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
              refreshToken
            });
  
            if (response.data.accessToken) {
              // Update tokens
              TokenManager.setTokens(
                response.data.accessToken,
                response.data.refreshToken || refreshToken,
                response.data.user
              );
  
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return apiClient(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          // Clear tokens and redirect to login
          TokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
  
      // Log all API errors
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response?.data,
        message: error.message
      });
  
      return Promise.reject(error);
    }
  );


// Purchase a subscription for a user
export const purchaseSubscription = async ({
  subscriptionId,
  userId,
  method = 'upi',
  prefill = { email: '', contact: '', name: '' },
}: {
  subscriptionId: string;
  userId: string;
  method?: 'upi' | 'card';
  prefill?: { email?: string; contact?: string; name?: string };
}) => {
  console.log('Starting subscription purchase process...', { subscriptionId, userId, method });
  
  if (!['card', 'upi'].includes(method)) {
    console.warn(`Invalid payment method '${method}', defaulting to 'upi'`);
    method = 'upi';
  }

  try {
    // Load Razorpay script
    console.log('Loading Razorpay script...');
    const isRazorpayLoaded = await loadRazorpayScript();
    if (!isRazorpayLoaded) {
      const errorMsg = 'Razorpay SDK failed to load. Please check your internet connection and try again.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.log('Razorpay script loaded successfully');

    // 1) Create order
    console.log('Creating order...', { subscriptionId, method });
    const orderRes = await apiClient.post(
      `UserSubscription/create-order/${userId}`,
      { subscriptionId, method },
    );

    console.log('Order created successfully:', orderRes.data);

    if (!orderRes.data?.order?.id) {
      const errorMsg = 'Invalid order response from server';
      console.error(errorMsg, orderRes.data);
      throw new Error(errorMsg);
    }

    const {
      order,
      paymentId,
      paymentStatus,
      subscriptionId: subId,
      subscriptionCardId,
      cardStatus,
    } = orderRes.data;

  // 2) Open Razorpay Checkout
  return new Promise((resolve, reject) => {
    try {
      console.log('Preparing Razorpay checkout...');
      
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.id,
        name: 'Hygo Healthcare',
        description: 'Subscription Purchase',
        prefill: {
          name: prefill.name || '',
          email: prefill.email || '',
          contact: prefill.contact || ''
        },
        theme: {
          color: '#0e3293'
        },
        handler: async function (response: any) {
          console.log('Payment successful:', response);
          try {
            // Verify payment with backend
            const verifyRes = await apiClient.post(`UserSubscription/verify-payment/${userId}`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
              subscriptionId: subId
            });
            
            console.log('Payment verification successful:', verifyRes.data);
            resolve({
              success: true,
              data: verifyRes.data,
              paymentId: response.razorpay_payment_id
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
            reject(new Error('Payment verification failed'));
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed by user');
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      console.log('Opening Razorpay checkout...');
      const rzp: IRazorpay = new window.Razorpay(options);
      
      // Handle payment failure using the modal's ondismiss as a fallback
      // since the 'on' method might not be available in all versions
      if (typeof rzp.on === 'function') {
        rzp.on('payment.failed', function(response: any) {
          console.error('Payment failed:', response.error);
          reject(new Error(response.error?.description || 'Payment failed'));
        });
      } else {
        console.warn('Razorpay on() method not available. Using modal dismiss handler only.');
      }
      
      // Open the Razorpay checkout
      rzp.open();
      
    } catch (error) {
      console.error('Error in payment process:', error);
      reject(new Error('Failed to process payment. Please try again.'));
    }
  });
  } catch (error) {
    console.error('Error in purchaseSubscription:', error);
    throw error;
  }
};
