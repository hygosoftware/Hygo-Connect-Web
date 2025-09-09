'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OTPForm } from '../../components/organisms';

const OTPPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get email from URL search params
    if (!searchParams) {
      console.error('Search params not available');
      setError('Invalid page state. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      return;
    }
    
    const emailParam = searchParams.get('email');
    console.log('Email param from URL:', emailParam);

    if (emailParam) {
      setEmail(emailParam);
      setIsInitializing(false);
    } else {
      // If no email in URL, redirect to login after a short delay
      console.error('No email parameter found in URL');
      setError('No email found. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }, [searchParams, router]);

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

  const handleResend = async () => {
    if (!email) {
      setError('Email not found. Cannot resend OTP.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Import AuthService dynamically
      const { AuthService } = await import('../../services/auth');

      // Resend OTP
      const response = await AuthService.login({ Email: email });

      if (response && response.success) {
        console.log('OTP resent successfully to:', email);
        // Optionally show a success message
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while resending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate back to login page
    router.push('/login');
  };

  // Show loading spinner while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if no email found
  if (!email && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
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
          <button
            onClick={handleBack}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Main OTP form
  return (
    <main className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
      
        
        <OTPForm 
          email={email}
          onSubmit={handleOTPSubmit} 
          onResend={handleResend} 
          onBack={handleBack}
          isLoading={isLoading}
        />
      </div>
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