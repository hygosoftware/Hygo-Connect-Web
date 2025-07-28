'use client';

import React, { Component, ReactNode } from 'react';
import { Typography, Icon, Button } from './';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="alert" size="large" color="#ef4444" />
            </div>
            
            <Typography variant="h5" className="text-gray-900 font-bold mb-2">
              Something went wrong
            </Typography>
            
            <Typography variant="body1" className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-left">
                <Typography variant="caption" className="text-red-800 font-mono">
                  {this.state.error.message}
                </Typography>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 text-white py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.href = '/home'}
                className="w-full bg-white hover:bg-gray-50 text-[#0e3293] border-2 border-[#0e3293] py-3 px-6 rounded-xl font-medium transition-colors"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
