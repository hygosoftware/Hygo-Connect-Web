'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Icon, Calendar, TimeSlotSkeleton } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { mockAPI, getAvailableDates } from '../../lib/mockBookingData';
import { TimeSlot } from '../../contexts/BookingContext';

const DateTimeSelection: React.FC = () => {
  const { state, selectDate, selectSlot, setStep, setLoading } = useBooking();
  const { showToast } = useToast();
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(state.selectedDate);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    // Load available dates
    const dates = getAvailableDates();
    setAvailableDates(dates);
    
    // If no date is selected, select the first available date
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && state.selectedDoctor && state.selectedClinic) {
      loadTimeSlots();
    }
  }, [selectedDate, state.selectedDoctor, state.selectedClinic]);

  const loadTimeSlots = async () => {
    if (!selectedDate || !state.selectedDoctor || !state.selectedClinic) return;

    try {
      setLoadingSlots(true);
      const slots = await mockAPI.getAvailableSlots(
        state.selectedDoctor._id,
        state.selectedClinic._id,
        selectedDate
      );
      setTimeSlots(slots);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to load time slots',
        message: 'Please try again or select a different date.'
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    selectDate(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    selectSlot(slot);
    setStep('details');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const TimeSlotCard: React.FC<{ slot: TimeSlot }> = ({ slot }) => (
    <button
      onClick={() => handleSlotSelect(slot)}
      disabled={!slot.available}
      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
        slot.available
          ? 'border-gray-200 hover:border-[#0e3293] hover:bg-[#0e3293]/5 cursor-pointer'
          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
      }`}
    >
      <div className="text-center">
        <Typography variant="h6" className={`font-semibold mb-1 ${
          slot.available ? 'text-gray-900' : 'text-gray-400'
        }`}>
          {formatTime(slot.time)}
        </Typography>
        
        <div className={`text-xs ${
          slot.available ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {slot.available ? (
            <span className="flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              {slot.maxBookings - slot.bookedCount} of {slot.maxBookings} spots left
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
              Fully booked
            </span>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Typography variant="h4" className="text-gray-900 font-bold mb-2">
            Select Date & Time
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Choose your preferred appointment date and time slot
          </Typography>
        </div>

        {/* Selected Doctor and Clinic Info */}
        {state.selectedDoctor && state.selectedClinic && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <Typography variant="body2" className="text-gray-600 mb-3">
              Booking appointment with:
            </Typography>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={state.selectedDoctor.profileImage}
                  alt={state.selectedDoctor.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(state.selectedDoctor.fullName)}&background=0e3293&color=fff`;
                  }}
                />
              </div>
              <div className="flex-1">
                <Typography variant="h6" className="text-gray-900 font-semibold">
                  {state.selectedDoctor.fullName}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {state.selectedDoctor.specializations.join(', ')}
                </Typography>
                <div className="flex items-center mt-1">
                  <Icon name="location" size="small" color="#6b7280" className="mr-1" />
                  <Typography variant="caption" className="text-gray-600">
                    {state.selectedClinic.clinicName}
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <Typography variant="h6" className="text-[#0e3293] font-bold">
                  ₹{state.selectedDoctor.consultationFee}
                </Typography>
                <Typography variant="caption" className="text-gray-600">
                  Consultation Fee
                </Typography>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
              Select Date
            </Typography>
            
            <Calendar
              selectedDate={selectedDate || new Date()}
              onDateSelect={handleDateSelect}
              highlightedDates={availableDates}
              className="w-full"
            />
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Typography variant="caption" className="text-blue-700 block mb-1">
                Note:
              </Typography>
              <Typography variant="caption" className="text-blue-600">
                Highlighted dates are available for booking. Sundays are closed.
              </Typography>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
              Available Time Slots
            </Typography>
            
            {selectedDate ? (
              <>
                <div className="mb-4">
                  <Typography variant="body2" className="text-gray-600">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </div>

                {loadingSlots ? (
                  <TimeSlotSkeleton />
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <TimeSlotCard key={slot.id} slot={slot} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="calendar" size="medium" color="#9ca3af" />
                    </div>
                    <Typography variant="body2" className="text-gray-600">
                      No slots available for this date
                    </Typography>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="calendar" size="medium" color="#9ca3af" />
                </div>
                <Typography variant="body2" className="text-gray-600">
                  Please select a date first
                </Typography>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <Typography variant="body2" className="text-gray-700 font-medium mb-3">
            Booking Information:
          </Typography>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <Typography variant="caption" className="text-gray-600">
                Available slots
              </Typography>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <Typography variant="caption" className="text-gray-600">
                Fully booked
              </Typography>
            </div>
            <div className="flex items-center">
              <Icon name="info" size="small" color="#6b7280" className="mr-2" />
              <Typography variant="caption" className="text-gray-600">
                Maximum 5 bookings per slot
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
