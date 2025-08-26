import React from 'react';
import { Input, Icon } from '../atoms';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your email address",
  error,
  disabled = false,
  className = '',
}) => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {    }
    if (!isValidEmail(email)) {
    }
    return undefined;
  };

  const validationError = value ? validateEmail(value) : error;

  return (
    <div className={`w-full ${className}`}>
      <div className={`flex items-center border rounded-xl overflow-hidden bg-gray-50 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${validationError ? 'border-red-500' : 'border-gray-200'}`}>
        <div className="px-3 py-4">
          <Icon name="email" size="medium" color="#6b7280" />
        </div>
        <Input
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          error={validationError}
          autoComplete="email"
          autoCapitalize="none"
          className="border-none bg-transparent focus-ring"
        />
      </div>
      {validationError && (
        <p className="mt-1 text-sm text-red-600 animate-fade-in-up">{validationError}</p>
      )}
    </div>
  );
};

export default EmailInput;
