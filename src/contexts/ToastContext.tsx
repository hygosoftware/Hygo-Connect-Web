'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Typography, Icon } from '../components/atoms';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast after duration
    const duration = newToast.duration ?? 0;
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <Icon name="check-circle" size="small" color="#10b981" />;
      case 'error':
        return <Icon name="alert" size="small" color="#ef4444" />;
      case 'warning':
        return <Icon name="alert" size="small" color="#f59e0b" />;
      case 'info':
        return <Icon name="info" size="small" color="#3b82f6" />;
      default:
        return <Icon name="info" size="small" color="#6b7280" />;
    }
  };

  const getToastColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-white border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => (
    <div
      className={`max-w-md w-[92vw] sm:w-auto rounded-lg border p-4 shadow-lg transition-all duration-300 ${getToastColors(toast.type)}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getToastIcon(toast.type)}
        </div>
        <div className="flex-1 min-w-0">
          <Typography variant="body2" className="font-medium mb-1 break-words">
            {toast.title}
          </Typography>
          {toast.message && (
            <Typography variant="caption" className="opacity-90 whitespace-pre-line break-words">
              {toast.message}
            </Typography>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => hideToast(toast.id)}
          className="flex-shrink-0 ml-3 opacity-70 hover:opacity-100 transition-opacity"
        >
          <Icon name="close" size="small" color="currentColor" />
        </button>
      </div>
    </div>
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
