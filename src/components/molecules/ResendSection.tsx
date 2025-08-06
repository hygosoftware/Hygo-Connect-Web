import React, { useState, useEffect } from 'react';
import { Typography, Button } from '../atoms';

interface ResendSectionProps {
  onResend: () => void;
  initialTimer?: number;
  disabled?: boolean;
  className?: string;
}

const ResendSection: React.FC<ResendSectionProps> = ({
  onResend,
  initialTimer = 60,
  disabled = false,
  className = '',
}) => {
  const [timer, setTimer] = useState(initialTimer);
  const [resendDisabled, setResendDisabled] = useState(true);

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
    if (!resendDisabled && !disabled) {
      setTimer(initialTimer);
      setResendDisabled(true);
      onResend();
    }
  };

  // Reset timer when initialTimer changes (useful for external resets)
  useEffect(() => {
    setTimer(initialTimer);
    setResendDisabled(initialTimer > 0);
  }, [initialTimer]);

  return (
    <div className={`flex justify-center items-center space-x-1 ${className}`}>
      <Typography variant="body1" color="text-secondary">
        Didn't receive the code?
      </Typography>
      
      {resendDisabled || disabled ? (
        <Typography 
          variant="body1" 
          color="text-secondary"
          className="opacity-60"
        >
          Resend in {timer}s
        </Typography>
      ) : (
        <button
          onClick={handleResend}
          disabled={disabled}
          className="text-blue-800 font-medium hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors duration-200"
        >
          <Typography 
            variant="body1" 
            color="primary"
            className="font-medium"
          >
            Resend OTP
          </Typography>
        </button>
      )}
    </div>
  );
};

export default ResendSection;
