'use client';

import React from 'react';
import { LoginForm } from '../../components/organisms';

const LoginPage: React.FC = () => {
  const handleLoginSubmit = (email: string) => {
    console.log('Login submitted with email:', email);
    // Here you would typically navigate to the OTP page
    // For now, we'll just log the email
  };

  return (
    <main>
      <LoginForm onSubmit={handleLoginSubmit} />
    </main>
  );
};

export default LoginPage;
