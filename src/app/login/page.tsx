'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/organisms/LoginForm';

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleLoginSubmit = (email: string) => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
  
    // ✅ Navigate to OTP page directly
    router.push(`/otp?email=${encodeURIComponent(email)}`);
  };


  return (
    <main className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
        <LoginForm onSubmit={handleLoginSubmit} />
      </div>
    </main>
  );
};

export default LoginPage;
