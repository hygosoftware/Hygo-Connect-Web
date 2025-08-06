'use client';

import React from 'react';
import { Typography, Icon } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';

interface StepInfo {
  key: string;
  label: string;
  icon: string;
  description: string;
}

const BookingProgressStepper: React.FC = () => {
  const { state } = useBooking();

  const getSteps = (): StepInfo[] => {
    const baseSteps: StepInfo[] = [];

    if (state.bookingFlow === 'doctor') {
      baseSteps.push(
        {
          key: 'doctor',
          label: 'Select Doctor',
          icon: 'doctor',
          description: 'Choose your doctor'
        },
        {
          key: 'clinic',
          label: 'Select Clinic',
          icon: 'location',
          description: 'Choose clinic location'
        }
      );
    } else {
      baseSteps.push(
        {
          key: 'clinic',
          label: 'Select Clinic',
          icon: 'location',
          description: 'Choose clinic location'
        },
        {
          key: 'doctor',
          label: 'Select Doctor',
          icon: 'doctor',
          description: 'Choose your doctor'
        }
      );
    }

    baseSteps.push(
      {
        key: 'date',
        label: 'Date & Time',
        icon: 'calendar',
        description: 'Pick appointment slot'
      },
      {
        key: 'details',
        label: 'Details',
        icon: 'user',
        description: 'Patient information'
      },
      {
        key: 'review',
        label: 'Review',
        icon: 'check',
        description: 'Confirm details'
      },
      {
        key: 'payment',
        label: 'Payment',
        icon: 'credit-card',
        description: 'Complete payment'
      },
      {
        key: 'confirmation',
        label: 'Confirmation',
        icon: 'check-circle',
        description: 'Booking confirmed'
      }
    );

    return baseSteps;
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex(step => step.key === state.currentStep);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Typography variant="h6" className="text-gray-900 font-semibold mb-2">
          Booking Progress
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          {state.bookingFlow === 'doctor' ? 'Booking by Doctor' : 'Booking by Clinic'}
        </Typography>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="relative">
              <div className="flex items-start">
                {/* Step Icon */}
                <div className="flex-shrink-0 relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      status === 'completed'
                        ? 'bg-[#0e3293] border-[#0e3293]'
                        : status === 'current'
                        ? 'bg-white border-[#0e3293] ring-4 ring-[#0e3293]/20'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Icon name="check" size="small" color="white" />
                    ) : (
                      <Icon
                        name={step.icon}
                        size="small"
                        color={status === 'current' ? '#0e3293' : '#9ca3af'}
                      />
                    )}
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`absolute top-10 left-5 w-0.5 h-8 transition-colors duration-200 ${
                        status === 'completed' ? 'bg-[#0e3293]' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>

                {/* Step Content */}
                <div className="ml-4 flex-1 min-w-0">
                  <Typography
                    variant="body1"
                    className={`font-medium ${
                      status === 'current'
                        ? 'text-[#0e3293]'
                        : status === 'completed'
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`mt-1 ${
                      status === 'current'
                        ? 'text-[#0e3293]/70'
                        : status === 'completed'
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </Typography>

                  {/* Show selected data for completed steps */}
                  {status === 'completed' && (
                    <div className="mt-2">
                      {step.key === 'doctor' && state.selectedDoctor && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <Typography variant="caption" className="text-gray-600 block mb-1">
                            Selected Doctor
                          </Typography>
                          <Typography variant="body2" className="text-gray-900 font-medium">
                            {state.selectedDoctor.fullName}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {state.selectedDoctor.specializations.join(', ')}
                          </Typography>
                        </div>
                      )}

                      {step.key === 'clinic' && state.selectedClinic && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <Typography variant="caption" className="text-gray-600 block mb-1">
                            Selected Clinic
                          </Typography>
                          <Typography variant="body2" className="text-gray-900 font-medium">
                            {state.selectedClinic.clinicName}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {state.selectedClinic.clinicAddress?.city || state.selectedClinic.address?.city || 'Unknown City'}
                          </Typography>
                        </div>
                      )}

                      {step.key === 'date' && state.selectedDate && state.selectedSlot && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <Typography variant="caption" className="text-gray-600 block mb-1">
                            Selected Date & Time
                          </Typography>
                          <Typography variant="body2" className="text-gray-900 font-medium">
                            {state.selectedDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {state.selectedSlot.time}
                          </Typography>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Card */}
      {state.selectedDoctor && state.selectedClinic && (
        <div className="mt-6 p-4 bg-[#0e3293]/5 rounded-lg border border-[#0e3293]/20">
          <Typography variant="body2" className="text-[#0e3293] font-medium mb-2">
            Booking Summary
          </Typography>
          <div className="space-y-1">
            <Typography variant="caption" className="text-gray-600 block">
              Dr. {state.selectedDoctor.fullName}
            </Typography>
            <Typography variant="caption" className="text-gray-600 block">
              {state.selectedClinic.clinicName}
            </Typography>
            {state.selectedDate && state.selectedSlot && (
              <Typography variant="caption" className="text-gray-600 block">
                {state.selectedDate.toLocaleDateString()} at {state.selectedSlot.time}
              </Typography>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingProgressStepper;
