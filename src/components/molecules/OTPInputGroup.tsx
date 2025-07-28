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
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && index > 0 && value[index] === '') {
      setTimeout(() => {
        const prevInput = inputRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      }, 0);
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
    <div className={`flex justify-between space-x-2 ${className}`}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="flex-1 max-w-[48px]">
            <OTPInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={value[index] || ''}
              onChange={(text) => handleOtpChange(text, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              index={index}
              autoFocus={index === 0}
              disabled={disabled}

              onPaste={index === 0 ? handlePaste : undefined}
            />
          </div>
        ))}
    </div>
  );
};

export default OTPInputGroup;
