'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Button } from '../atoms';

interface ResendSectionProps {
  onResend: () => void;
  countdownSeconds?: number;
  initialTimer?: number;
  disabled?: boolean;
  className?: string;
  isResending?: boolean;
}

const ResendSection: React.FC<ResendSectionProps> = ({
  onResend,
  countdownSeconds = 30,
  initialTimer = countdownSeconds,
  disabled = false,
  className = '',
  isResending = false,
}) => {
  const [timer, setTimer] = useState(initialTimer);
  const [resendDisabled, setResendDisabled] = useState(initialTimer > 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timer > 0 && resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, resendDisabled]);

  const handleResend = () => {
    if ((!resendDisabled && !disabled) || isResending) {
      if (!isResending) {
        setTimer(initialTimer);
        setResendDisabled(true);
      }
      onResend();
    }
  };

  // Reset timer when initialTimer changes
  useEffect(() => {
    setTimer(initialTimer);
    setResendDisabled(initialTimer > 0);
  }, [initialTimer]);

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Typography variant="body2" color="text-secondary">
        Didn't receive the code?
      </Typography>
      
      {resendDisabled || disabled ? (
        <Typography 
          variant="body2" 
          color="text-secondary"
          className="opacity-60"
        >
          Resend in {timer}s
        </Typography>
      ) : (
        <Button
          variant="primary"
          onClick={handleResend}
          disabled={(resendDisabled || disabled) && !isResending}
          loading={isResending}
          className={`text-primary-600 hover:text-primary-700 p-0 h-auto min-h-0 ${isResending ? 'opacity-70' : ''}`}
        >
          {isResending ? 'Sending...' : 'Resend Code'}
        </Button>
      )}
    </div>
  );
};

export default ResendSection;
