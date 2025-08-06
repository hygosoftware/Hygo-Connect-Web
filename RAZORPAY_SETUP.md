# Razorpay Integration Setup

## Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

## Getting Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings > API Keys
3. Generate Test/Live API Keys
4. Copy the **Key ID** (not the Key Secret for frontend)
5. Add it to your environment variables

## Test Credentials (for development)

For testing, you can use Razorpay's test mode:
- Test Key ID format: `rzp_test_xxxxxxxxxx`
- Test payments won't charge real money

## Backend Integration (TODO)

You'll need to:
1. Verify payments on your backend using Razorpay's webhook
2. Store payment details in your database
3. Update user subscription status

## Test Payment Details

For testing Razorpay payments:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- UPI ID: success@razorpay (for successful payments)
