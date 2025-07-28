'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingProvider, useBooking } from '../../contexts/BookingContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { Typography, Icon, BackButton, ErrorBoundary } from '../../components/atoms';
import BookingTabNavigation from '../../components/organisms/BookingTabNavigation';
import BookingProgressStepper from '../../components/organisms/BookingProgressStepper';
import DoctorSelection from '../../components/organisms/DoctorSelection';
import ClinicSelection from '../../components/organisms/ClinicSelection';
import DateTimeSelection from '../../components/organisms/DateTimeSelection';
import BookingDetailsForm from '../../components/organisms/BookingDetailsForm';
import BookingReview from '../../components/organisms/BookingReview';
import BookingPayment from '../../components/organisms/BookingPayment';
import BookingConfirmation from '../../components/organisms/BookingConfirmation';

const BookingContent: React.FC = () => {
  const router = useRouter();
  const { state, setBookingFlow, goBack } = useBooking();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleGoBack = () => {
    if (state.currentStep === 'selection' || state.currentStep === 'doctor') {
      router.push('/home');
    } else {
      goBack();
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'selection':
      case 'doctor':
        return (
          <div className="flex-1 flex flex-col">
            <BookingTabNavigation
              activeFlow={state.bookingFlow}
              onFlowChange={setBookingFlow}
              isDesktop={isDesktop}
            />
            {state.bookingFlow === 'doctor' ? <DoctorSelection /> : <ClinicSelection />}
          </div>
        );
      case 'clinic':
        return <ClinicSelection />;
      case 'date':
      case 'slot':
        return <DateTimeSelection />;
      case 'details':
        return <BookingDetailsForm />;
      case 'review':
        return <BookingReview />;
      case 'payment':
        return <BookingPayment />;
      case 'confirmation':
        return <BookingConfirmation />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BackButton 
                onClick={handleGoBack}
                className="mr-4"
              />
              <Typography variant="h5" className="text-gray-900 font-semibold">
                Book Appointment
              </Typography>
            </div>
            
            {/* Progress indicator for mobile */}
            {!isDesktop && state.currentStep !== 'selection' && state.currentStep !== 'doctor' && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#0e3293] rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {isDesktop ? (
          <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Desktop Sidebar */}
            {state.currentStep !== 'selection' && state.currentStep !== 'doctor' && (
              <div className="w-80 bg-white shadow-sm border-r border-gray-200">
                <div className="p-6">
                  <BookingProgressStepper />
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1">
              {renderStepContent()}
            </div>
          </div>
        ) : (
          <div className="min-h-[calc(100vh-4rem)]">
            {renderStepContent()}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {state.loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e3293]"></div>
            <Typography variant="body1" className="text-gray-900">
              Loading...
            </Typography>
          </div>
        </div>
      )}


    </div>
  );
};

const BookingPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BookingProvider>
          <BookingContent />
        </BookingProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default BookingPage;
