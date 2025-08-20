'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OTPForm } from '../../components/organisms';

const OTPPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get email from URL search params
    const emailParam = searchParams.get('email');
    console.log('Email param from URL:', emailParam);

    if (emailParam) {
      setEmail(emailParam);
      setIsLoading(false);
    } else {
      // If no email in URL, redirect to login after a short delay
      console.error('No email parameter found in URL');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const handleOTPSubmit = async (otp: string) => {
    if (!email) {
      console.error('No email found for OTP verification');
      return;
    }

    try {
      console.log('OTP submitted:', otp, 'for email:', email);

      // Import AuthService dynamically
      const { AuthService } = await import('../../services/auth');

      // Verify OTP
      const response = await AuthService.verifyOTP(email, otp);

      if (response && response.success) {
        console.log('OTP verification successful, navigating to home...');
        // Navigate to home page after successful verification
        window.location.href = '/';
      } else {
        console.error('OTP verification failed:', response);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    }
  };

  const handleResend = () => {
    console.log('Resending OTP to:', email);
    // Here you would typically resend the OTP
  };

  const handleBack = () => {
    // Navigate back to login page
    router.push('/login');
  };

  return (
    <main>
      <OTPForm
        email={email}
        onSubmit={(otp) => { void handleOTPSubmit(otp); }}
        onResend={handleResend}
        onBack={handleBack}
      />
    </main>
  );
};

const OTPPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <OTPPageContent />
    </Suspense>
  );
};

export default OTPPage;
