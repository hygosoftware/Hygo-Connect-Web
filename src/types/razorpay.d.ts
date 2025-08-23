// Type definitions for Razorpay
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface IRazorpay {
  open(): void;
  on?(event: string, callback: (response: any) => void): void;
}

export declare class Razorpay implements IRazorpay {
  constructor(options: RazorpayOptions);
  open(): void;
  on?(event: string, callback: (response: any) => void): void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => IRazorpay;
  }
}
