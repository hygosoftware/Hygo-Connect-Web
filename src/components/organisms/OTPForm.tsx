import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, BackButton } from '../atoms';
import { OTPInputGroup, ResendSection, ToastNotification } from '../molecules';
import { AuthService } from '../../services/auth';
import Image from 'next/image';
import hygoLogo from '../../assets/hygologo.png';

interface OTPFormProps {
  email?: string;
  onSubmit?: (otp: string) => void;
  onResend?: () => void;
  onBack?: () => void;
  className?: string;
  isLoading?: boolean;
  isResending?: boolean;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

const OTPForm: React.FC<OTPFormProps> = ({
  email = '',
  onSubmit,
  onResend,
  onBack,
  className = '',
  isLoading = false,
  isResending = false,
}) => {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [internalLoading, setInternalLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  // Ensure we're on the client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if email is provided, if not redirect to login
  useEffect(() => {
    if (isClient && !email) {
      console.error('Email parameter is missing');
      showToast('Session expired. Please start over.', 'error');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }, [email, router, isClient]);

  const showToast = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');

    // Validation
    if (!email) {
      showToast('Session expired. Please restart the login process.', 'error');
      router.push('/login');
      return;
    }

    if (otpValue.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    // Validate OTP contains only numbers
    if (!/^\d{6}$/.test(otpValue)) {
      showToast('OTP must contain only numbers', 'error');
      return;
    }

    setInternalLoading(true);
    try {
      // Call the actual AuthService verifyOTP method
      const response = await AuthService.verifyOTP(email, otpValue);

      if (response && response.success) {
        showToast('OTP verified successfully', 'success');

        // Call onSubmit callback if provided
        onSubmit?.(otpValue);

        // Navigate to home page after successful verification
        setTimeout(() => {
          showToast('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            router.push('/home');
          }, 1000);
        }, 1000);
      } else {
        const msg = typeof (response as any)?.message === 'string'
          ? (response as any).message
          : 'Failed to verify OTP. Please try again.';
        showToast(msg, 'error');
      }

    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      showToast('Session expired. Please restart the login process.', 'error');
      router.push('/login');
      return;
    }

    try {
      setInternalLoading(true);

      // Call the actual AuthService login method to resend OTP
      const response = await AuthService.login({ Email: email });

      if (response && response.success) {
        showToast('OTP has been resent to your email', 'success');

        // Clear current OTP
        setOtp(Array(6).fill(''));

        // Call onResend callback if provided
        onResend?.();
      } else {
        const msg = typeof (response as any)?.message === 'string'
          ? (response as any).message
          : 'Failed to resend OTP. Please try again.';
        showToast(msg, 'error');
      }

    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setInternalLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Don't render main content if not on client or email is missing
  if (!isClient || !email) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <Typography variant="body1" color="text-secondary" className="mb-4">
            Loading...
          </Typography>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col ${className}">
      {/* Back Button */}
      <div className="absolute top-6 left-4 z-10">
        {onBack && <BackButton onClick={onBack} className="mb-6" />}
      </div>

      <div className="flex-1 flex mt-16 justify-center p-4 w-full">
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src={hygoLogo}
                alt="Hygo Logo"
                width={256}
                height={256}
                className="mx-auto rounded-full"
                priority
              />
            </div>
            <Typography
              variant="h4"
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Enter Verification Code
            </Typography>
            <Typography className="text-gray-600 mb-8">
              We've sent a verification code to {email || 'your email'}
            </Typography>
          </div>

          {/* OTP Input Section */}
          <div className="w-full mb-8 px-2 sm:px-4">
            <div className="max-w-md mx-auto">
              <OTPInputGroup
                value={otp}
                onChange={handleOtpChange}
                length={6}
                disabled={isLoading || internalLoading}
              />
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOtp}
            disabled={otp.some((digit) => !digit) || isLoading}
            loading={isLoading || internalLoading}
            variant="primary"
            size="medium"
            className="w-full shadow-sm btn-primary focus-ring mb-6"
          >
            {(isLoading || internalLoading) ? 'Verifying...' : 'VERIFY'}
          </Button>

          {/* Resend Section */}
          <ResendSection
            onResend={handleResendOtp}
            countdownSeconds={30}
            className="mt-6"
            isResending={isResending}
          />
        </div>
      </div>

      {/* Toast Notification */}
      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
};

export default OTPForm;
