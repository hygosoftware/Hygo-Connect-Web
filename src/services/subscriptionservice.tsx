import { loadRazorpayScript } from '../services/razorpay';
import { TokenManager } from './auth';
import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY as string;

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
  if (!['card', 'upi'].includes(method)) method = 'upi';

  // Load Razorpay script
  const isRazorpayLoaded = await loadRazorpayScript();
  if (!isRazorpayLoaded) throw new Error("Razorpay SDK failed to load.");

  // 1) Create order
  const orderRes = await apiClient.post(
    `${API_BASE_URL}/UserSubscription/create-order/${userId}`,
    { subscriptionId, method },
  );

  const {
    order,
    paymentId,
    paymentStatus,
    subscriptionId: subId,
    subscriptionCardId,
    cardStatus,
  } = orderRes.data;

  // 2) Open Razorpay Checkout
  const options = {
    key: RAZORPAY_KEY,
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,
    name: 'HYGO Connect',
    description: 'Subscription Purchase',
    prefill: {
      email: prefill.email || '',
      contact: prefill.contact || '',
      name: prefill.name || '',
    },
    theme: { color: '#3399cc' },
  };

  const paymentObject = new (window as any).Razorpay(options);

  return new Promise((resolve, reject) => {
    paymentObject.on('payment.failed', (err: any) => reject(err));
    paymentObject.open();

    paymentObject.on('payment.success', async (paymentResult: any) => {
      // 3) Verify payment
      const verifyRes = await apiClient.post(        `${API_BASE_URL}/UserSubscription/verify-payment/${userId}`,
        {
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_signature: paymentResult.razorpay_signature,
          paymentId,
        }
      );

      resolve({
        creation: {
          paymentStatus,
          subscriptionId: subId,
          subscriptionCardId,
          cardStatus,
        },
        verification: verifyRes.data,
      });
    });
  });
};
