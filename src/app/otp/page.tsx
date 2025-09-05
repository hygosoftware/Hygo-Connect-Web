'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OTPForm } from '../../components/organisms';

const OTPPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Enter OTP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a 6-digit code to {email}
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <OTPForm 
            onSubmit={handleOTPSubmit} 
            onResend={handleResend} 
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  const handleOTPSubmit = async (otp: string) => {
    if (!email) {
      setError('Email not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Import AuthService dynamically
      const { AuthService } = await import('../../services/auth');

      // Verify OTP
      const response = await AuthService.verifyOTP(email, otp);

      if (response && response.success) {
        // Navigate to home page after successful verification
        window.location.href = '/';
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } catch (error: any) {
      // Use the error message from the service or provide a default one
      setError(error.message || 'An error occurred during OTP verification. Please try again.');
    } finally {
      setIsLoading(false);
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