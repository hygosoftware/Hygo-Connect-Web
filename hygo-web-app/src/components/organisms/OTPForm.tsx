import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, BackButton } from '../atoms';
import { OTPInputGroup, ResendSection, ToastNotification } from '../molecules';

interface OTPFormProps {
  email?: string;
  onSubmit?: (otp: string) => void;
  onResend?: () => void;
  onBack?: () => void;
  className?: string;
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
}) => {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      
    } catch (error) {
      showToast('Failed to verify OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      showToast('Session expired. Please restart the login process.', 'error');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast('OTP has been resent to your email', 'success');
      
      // Clear current OTP
      setOtp(Array(6).fill(''));
      
      // Call onResend callback if provided
      onResend?.();
      
    } catch (error) {
      showToast('Failed to resend OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
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
    <div className={`min-h-screen bg-white ${className}`}>
      {/* Back Button */}
      <div className="absolute top-6 left-4 z-10">
        <BackButton onClick={handleBack} disabled={loading} />
      </div>

      <div className="flex flex-col justify-center min-h-screen px-6 py-12 mobile-container">
        <div className="w-full animate-fade-in-up">
          {/* Header Section */}
          <div className="text-center mb-8">
            <Typography 
              variant="h3" 
              color="primary" 
              className="mb-2 font-bold"
            >
              Verify your email
            </Typography>
            <Typography 
              variant="body1" 
              color="text-secondary" 
              className="mb-1"
            >
              We've sent a 6-digit verification code to
            </Typography>
            <Typography 
              variant="body1" 
              color="text-primary" 
              className="font-medium"
            >
              {email}
            </Typography>
          </div>

          {/* OTP Input Section */}
          <div className="mb-8">
            <OTPInputGroup
              value={otp}
              onChange={handleOtpChange}
              length={6}
              disabled={loading}
            />
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
            loading={loading}
            variant="primary"
            size="medium"
            className="w-full shadow-sm btn-primary focus-ring mb-6"
          >
            {loading ? 'Verifying...' : 'VERIFY'}
          </Button>

          {/* Resend Section */}
          <ResendSection
            onResend={handleResendOtp}
            disabled={loading}
            initialTimer={60}
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
