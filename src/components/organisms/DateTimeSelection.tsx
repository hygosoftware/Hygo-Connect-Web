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

  // Helper: Map weekday string to JS day index
  const weekdayToIndex: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  // Helper: Get next N dates for a given weekday
  function getNextDatesForWeekday(weekday: string, count = 4): Date[] {
    const results: Date[] = [];
    const today = new Date();
    let day = new Date(today);
    const targetDay = weekdayToIndex[weekday];
    let added = 0;
    let i = 0;
    while (added < count && i < 30) { // max 30 days lookahead
      if (day.getDay() === targetDay) {
        results.push(new Date(day));
        added++;
      }
      day.setDate(day.getDate() + 1);
      i++;
    }
    return results;
  }

  useEffect(() => {
    // Build available dates based on doctor availability for selected clinic
    if (state.selectedDoctor && state.selectedClinic) {
      // Access the availability array from the doctor object
      const availability = state.selectedDoctor.availability || [];
      
      // Filter availability by the selected clinic ID
      const clinicAvailability = availability.filter((a: any) => a.clinic === state.selectedClinic._id);
      
      let dates: Date[] = [];
      clinicAvailability.forEach((a: any) => {
        // For each available day, get next 4 dates (or more/less as needed)
        dates = dates.concat(getNextDatesForWeekday(a.day, 4));
      });
      
      // Remove duplicates and sort
      const dateStrSet = new Set(dates.map(d => d.toDateString()));
      const uniqueDates = Array.from(dateStrSet).map(ds => new Date(ds));
      uniqueDates.sort((a, b) => a.getTime() - b.getTime());
      
      setAvailableDates(uniqueDates);
      
      // Auto-select first available date if none selected
      if ((!selectedDate || !uniqueDates.some(d => d.toDateString() === selectedDate.toDateString())) && uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0]);
      }
    } else {
      setAvailableDates([]);
    }

    // ---- LOGGING SELECTED DOCTOR DATA ----
    if (state.selectedDoctor) {
      console.log('Selected doctor data:', state.selectedDoctor);
    }
    // ---- END LOGGING ----

    // ---- LOGGING DOCTOR AVAILABILITY FOR SELECTED CLINIC ----
    if (state.selectedDoctor && state.selectedClinic) {
      const availability = state.selectedDoctor.availability || [];
      const clinicAvailability = availability.filter((a: any) => a.clinic === state.selectedClinic._id);
      if (clinicAvailability.length === 0) {
        console.log('No availability for this doctor at selected clinic:', state.selectedClinic.clinicName);
      } else {
        console.log(`Doctor ${state.selectedDoctor.fullName} availability at clinic ${state.selectedClinic.clinicName}:`, clinicAvailability);
      }
    }
    // ---- END LOGGING ----
  }, [state.selectedDoctor, state.selectedClinic]);

  useEffect(() => {
    // Update slots for selected date
    const fetchTimeSlots = async () => {
      if (selectedDate && state.selectedDoctor && state.selectedClinic) {
        setLoadingSlots(true);
        
        try {
          // Use mockAPI to get available slots
          const slots = await mockAPI.getAvailableSlots(
            state.selectedDoctor._id,
            state.selectedClinic._id,
            selectedDate
          );
          
          console.log('[DEBUG] Slots from API:', slots);
          setTimeSlots(slots);
        } catch (error) {
          console.error('Error fetching time slots:', error);
          showToast({
            type: 'error',
            title: 'Failed to load time slots',
            message: 'Please try again or select a different date.'
          });
          setTimeSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      } else {
        setTimeSlots([]);
      }
    };
    
    fetchTimeSlots();
  }, [selectedDate, state.selectedDoctor, state.selectedClinic, showToast]);

  // Remove mockAPI usage entirely


  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    selectDate(date);
    
    console.log(`Selected date: ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    // The time slots will be fetched automatically by the useEffect hook
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
              <strong>{slot.maxBookings - slot.bookedCount}</strong> of {slot.maxBookings} spots available
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
              <strong>Fully booked</strong>
            </span>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
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
                <Typography variant="body1" className="text-[#0e3293] font-bold">
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
                Highlighted dates show doctor availability at this clinic. Availability is based on the doctor's schedule.
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
                Each slot has limited appointments
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
