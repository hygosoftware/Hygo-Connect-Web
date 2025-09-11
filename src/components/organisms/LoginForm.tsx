'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // ✅ use Next.js Image
import hygoLogo from '../../assets/hygologo.png';
import { Button, Typography } from '../atoms';
import { EmailInput, OfflineBanner, ToastNotification } from '../molecules';
import { AuthService } from '../../services/auth';

interface LoginFormProps {
  onSubmit?: (email: string) => void;
  className?: string;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, className = '' }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  // Connectivity check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkConnection = () => setIsConnected(navigator.onLine);
      window.addEventListener('online', checkConnection);
      window.addEventListener('offline', checkConnection);
      checkConnection();
      return () => {
        window.removeEventListener('online', checkConnection);
        window.removeEventListener('offline', checkConnection);
      };
    }
  }, []);

  const showToast = (message: string, type: ToastState['type'] = 'info') =>
    setToast({ visible: true, message, type });

  const hideToast = () =>
    setToast((prev) => ({ ...prev, visible: false }));

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!isConnected) {
      showToast('No internet connection. Please check your network.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await AuthService.login({ Email: email.trim() });

      console.log('AuthService.login response:', response);
      if (response && response.success) {
        showToast('OTP sent successfully to email', 'success');
        router.push(`/otp?email=${encodeURIComponent(email)}`);
      } else {
        const msg = typeof response?.message === 'string'
          ? response.message
          : 'Failed to send OTP. Please try again.';
        showToast(msg, 'error');
      }      
    } catch (error: any) {
      showToast(error.message || 'Failed to send OTP. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      {!isConnected && <OfflineBanner />}

      <div className="flex flex-col justify-center min-h-screen px-6 py-12 mobile-container">
        <div className="w-full animate-fade-in-up">
          {/* Header Section */}
          <div className="ml-2 mb-8 flex flex-col items-start">
            {/* Hygo Logo */}
            <div className="flex justify-center w-full">
              <Image
                src={hygoLogo}
                alt="Hygo logo"
                width={256}
                height={256}
                className="mx-auto rounded-full"
                priority
              />
            </div>

            <div className="flex justify-center w-full">
              <Typography variant="subtitle1" color="secondary" className="mb-16">
                Welcome aboard!
              </Typography>
            </div>

            <Typography variant="h2" color="primary" className="mb-2 font-bold">
              Wellness Simplified
            </Typography>
          </div>

          {/* Email Input Section */}
          <div className="mb-6">
            <EmailInput
              value={email}
              onChange={setEmail}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            loading={isLoading}
            variant="primary"
            size="medium"
            className="w-full shadow-sm btn-primary focus-ring"
          >
            {isLoading ? 'Sending OTP...' : 'SEND CODE'}
          </Button>

          <Typography
            variant="caption"
            color="text-secondary"
            align="center"
            className="mt-6"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
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

export default LoginForm;