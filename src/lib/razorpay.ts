// Razorpay utility functions
// Note: In production, order creation should be done on the server-side

export interface RazorpayOrderData {
  amount: number; // Amount in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Mock function to simulate order creation
// In production, this should be an API call to your backend
export const createRazorpayOrder = async (orderData: RazorpayOrderData) => {
  // This is a mock implementation
  // In production, you would call your backend API like:
  // const response = await fetch('/api/create-razorpay-order', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(orderData)
  // });
  // return response.json();

  return {
    id: `order_${Date.now()}`, // Mock order ID
    amount: orderData.amount,
    currency: orderData.currency,
    receipt: orderData.receipt,
    status: 'created'
  };
};

// Function to verify payment signature
// This should also be done on the server-side
export const verifyPaymentSignature = async (paymentData: RazorpayPaymentData) => {
  // This is a mock implementation
  // In production, you would call your backend API to verify the signature
  // using the Razorpay webhook secret

  console.log('Payment verification (mock):', paymentData);
  return { verified: true };
};

// Razorpay configuration
export const getRazorpayConfig = () => ({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_9mOyRUi9azswI',
  currency: 'INR',
  name: 'Hygo Healthcare',
  description: 'Medical Appointment Booking',
  image: '/logo.png', // Your logo URL
  theme: {
    color: '#0e3293'
  }
});