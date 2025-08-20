'use client';

import React, { useRef, useEffect, forwardRef } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  index: number;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

const OTPInput = forwardRef<HTMLInputElement, OTPInputProps>(({
  value,
  onChange,
  onKeyDown,
  onPaste,
  index,
  autoFocus = false,
  disabled = false,
  className = '',
}, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = ref || internalRef;

  useEffect(() => {
    if (autoFocus && typeof inputRef !== 'function' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, inputRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow single digit
    if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Always call parent handler first
    onKeyDown?.(e);

    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const baseClasses = 'w-12 h-14 border rounded-lg text-center text-xl font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const stateClasses = value 
    ? 'border-blue-800 bg-white text-blue-800' 
    : 'border-gray-300 bg-white text-gray-800';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400';
  
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={1}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={onPaste}
      disabled={disabled}
      className={inputClasses}
      aria-label={`OTP digit ${index + 1}`}
    />
  );
});

OTPInput.displayName = 'OTPInput';

export default OTPInput;
