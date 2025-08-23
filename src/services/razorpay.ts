// Type for the Razorpay instance with all the methods we need
type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: (response: any) => void) => void;
};

// Extend the Window interface with the minimal required type
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// Helper function to create a Razorpay instance with proper typing
export function createRazorpay(options: Record<string, unknown>): RazorpayInstance {
  // We use type assertion here to tell TypeScript about the additional 'on' method
  return new window.Razorpay(options) as unknown as RazorpayInstance;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  // Check if Razorpay is already loaded
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      if (typeof window.Razorpay === 'function') {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve(true);
      } else {
        console.error('❌ Razorpay SDK loaded but not available on window object');
        resolve(false);
      }
    };
    
    document.head.appendChild(script);
  });
};