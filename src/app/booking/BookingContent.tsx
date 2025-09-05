'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBooking } from '../../contexts/BookingContext';
import { Typography, UniversalHeader } from '../../components/atoms';
import BookingTabNavigation from '../../components/organisms/BookingTabNavigation';
import BookingProgressStepper from '../../components/organisms/BookingProgressStepper';
import DoctorSelection from '../../components/organisms/DoctorSelection';
import ClinicSelection from '../../components/organisms/ClinicSelection';
import ClinicDoctorSelection from '../../components/organisms/ClinicDoctorSelection';
import DateTimeSelection from '../../components/organisms/DateTimeSelection';
import BookingDetailsForm from '../../components/organisms/BookingDetailsForm';
import BookingReview from '../../components/organisms/BookingReview';
import BookingPayment from '../../components/organisms/BookingPayment';
import BookingConfirmation from '../../components/organisms/BookingConfirmation';

const BookingContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, setBookingFlow, goBack, selectDoctor } = useBooking();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsDesktop(window.innerWidth >= 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle pre-selected doctor from URL parameters
  useEffect(() => {
    const doctorId = searchParams.get('doctorId');
    if (doctorId && !state.selectedDoctor) {
      void import('../../services/apiServices').then(({ doctorService }) => {
        doctorService.getDoctorById(doctorId)
          .then(selectDoctor)
          .catch((error) => console.error('Failed to load pre-selected doctor:', error));
      });
    }
  }, [searchParams, state.selectedDoctor, selectDoctor]);

  const handleGoBack = () => {
    if (state.currentStep === 'selection' || state.currentStep === 'doctor') {
      router.push('/');
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
        return state.bookingFlow === 'doctor' && state.selectedDoctor ? <ClinicSelection /> : null;
      case 'clinic-doctor':
        return state.bookingFlow === 'clinic' && state.selectedClinic ? <ClinicDoctorSelection /> : null;
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
      <UniversalHeader
        title="Book Appointment"
        variant="gradient"
        showBackButton={true}
        onBackPress={handleGoBack}
        showMenuButton={false}
      />

      <div className="max-w-7xl mx-auto">
        {isDesktop ? (
          <div className="flex min-h-[calc(100vh-4rem)]">
            {state.currentStep !== 'selection' && state.currentStep !== 'doctor' && (
              <div className="w-80 bg-white shadow-sm border-r border-gray-200">
                <div className="p-6">
                  <BookingProgressStepper />
                </div>
              </div>
            )}
            <div className="flex-1 overflow-auto">{renderStepContent()}</div>
          </div>
        ) : (
          <div className="h-[calc(100vh-4rem)] overflow-auto">
            {renderStepContent()}
          </div>
        )}
      </div>

      {state.loading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
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

export default BookingContent;
