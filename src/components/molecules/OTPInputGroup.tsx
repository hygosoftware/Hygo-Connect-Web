'use client';

import React, { useRef, useEffect } from 'react';
import { OTPInput } from '../atoms';

interface OTPInputGroupProps {
  value: string[];
  onChange: (otp: string[]) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
}

const OTPInputGroup: React.FC<OTPInputGroupProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  className = '',
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Initialize OTP array if not provided or wrong length
  useEffect(() => {
    if (value.length !== length) {
      onChange(Array(length).fill(''));
    }
  }, [length, value.length, onChange]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length <= 1) {
      const newOtp = [...value];
      newOtp[index] = text;
      onChange(newOtp);

      // Auto-focus next input if current input is filled
      if (text.length === 1 && index < length - 1) {
        // Use setTimeout to ensure the DOM is updated
        setTimeout(() => {
          const nextInput = inputRefs.current[index + 1];
          if (nextInput) {
            nextInput.focus();
          }
        }, 0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Enhanced backspace logic
    if (e.key === 'Backspace') {
      if (value[index] === '') {
        if (index > 0) {
          // Move focus to previous input and clear it
          setTimeout(() => {
            const prevInput = inputRefs.current[index - 1];
            if (prevInput) {
              prevInput.focus();
            }
            // Clear previous input value
            const newOtp = [...value];
            newOtp[index - 1] = '';
            onChange(newOtp);
          }, 0);
        }
      } else {
        // If current box is not empty, clear it and move focus to previous
        const newOtp = [...value];
        newOtp[index] = '';
        onChange(newOtp);
        if (index > 0) {
          setTimeout(() => {
            const prevInput = inputRefs.current[index - 1];
            if (prevInput) {
              prevInput.focus();
            }
          }, 0);
        }
      }
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setTimeout(() => {
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }, 0);
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      setTimeout(() => {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (pastedDigits.length > 0) {
      const newOtp = Array(length).fill('');
      for (let i = 0; i < pastedDigits.length && i < length; i++) {
        newOtp[i] = pastedDigits[i];
      }
      onChange(newOtp);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = Math.min(pastedDigits.length, length - 1);
      const targetInput = inputRefs.current[nextEmptyIndex];
      if (targetInput) {
        targetInput.focus();
      }
    }
  };

  return (
    <div className={`w-full px-2 sm:px-4 ${className}`}>
      <div className="flex justify-between gap-1 sm:gap-2 max-w-xs mx-auto">
        {Array.from({ length }).map((_, index) => (
          <div key={index} className="flex-1">
            <OTPInput
              value={value[index] || ''}
              onChange={(text) => handleOtpChange(text, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              index={index}
              autoFocus={index === 0}
              disabled={disabled}
              className="w-full max-w-[40px] sm:max-w-[50px] focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OTPInputGroup;
