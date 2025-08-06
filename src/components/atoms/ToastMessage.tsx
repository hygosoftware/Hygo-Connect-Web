import React from 'react';
import { ToastNotification } from '../molecules';

export interface ToastProps {
  visible: boolean;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

interface ToastMessageProps extends ToastProps {
  onHide: () => void;
  duration?: number;
  className?: string;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
  visible,
  message,
  type,
  onHide,
  duration = 3000,
  className = '',
}) => {
  return (
    <ToastNotification
      visible={visible}
      message={message}
      type={type}
      duration={duration}
      onClose={onHide}
      className={className}
    />
  );
};

export default ToastMessage;
export type { ToastMessageProps };
