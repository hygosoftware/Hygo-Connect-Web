'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Icon, Calendar, TimeSlotSkeleton } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { TimeSlot } from '../../contexts/BookingContext';
import { DoctorAvailability, DoctorAvailabilitySlot } from '../../types/Doctor';

const DateTimeSelection: React.FC = () => {
  const { state, selectDate, selectSlot, setStep } = useBooking();
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(state.selectedDate);

  // Sync local selectedDate with context selectedDate
  useEffect(() => {
    if (state.selectedDate !== selectedDate) {
      console.log('DateTimeSelection: Syncing local selectedDate with context:', state.selectedDate);
      setSelectedDate(state.selectedDate);
    }
  }, [state.selectedDate]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Log initial state on component mount
  useEffect(() => {
    // Log only doctor and clinic data
    console.log('Doctor data:', state.selectedDoctor);
    console.log('Clinic data:', state.selectedClinic);
  }, []);

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
  const getNextDatesForWeekday = useCallback((weekday: string, count = 4): Date[] => {
    const results: Date[] = [];
    const today = new Date();
    const day = new Date(today);
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
  }, []);
  
  // Internal helper type to avoid 'any' for clinic identifiers from various sources
  type ClinicIdentifier = { _id?: string; clinicId?: string; id?: string; name?: string; clinicName?: string };

  // Function to get slots for a specific date
  const getSlotsForDate = useCallback((date: Date | null, overrideClinic?: ClinicIdentifier): TimeSlot[] => {
    if (!date) {
      return [];
    }
    if (!state.selectedDoctor) return [];

    // Use the override clinic if provided, otherwise use the selected clinic from state
    const clinicToUse: ClinicIdentifier | undefined = overrideClinic || state.selectedClinic || undefined;
    let normalizedClinicId: string | undefined = undefined;
    if (clinicToUse) {
      if (clinicToUse._id) {
        normalizedClinicId = String(clinicToUse._id);
      } else if (clinicToUse.clinicId) {
        normalizedClinicId = String(clinicToUse.clinicId);
      }
    }

    // Get the day of the week for the selected date
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Access the availability array from the doctor object
    const availability: DoctorAvailability[] = state.selectedDoctor.availability || [];

    // Debug logs
    console.log('Normalized Clinic ID:', normalizedClinicId);
    console.log('Day name:', dayName);
    console.log('Doctor availability:', availability.map((a) => ({ clinic: a.clinic, day: a.day })));

    // --- Robust clinic and day matching ---
    // Normalize all possible clinic IDs for comparison
    const normalize = (v: unknown) => (v !== undefined && v !== null) ? String(v).trim().toLowerCase() : '';
    const selectedClinicIds = [
      normalize(clinicToUse?._id),
      normalize(clinicToUse?.clinicId),
      normalize(clinicToUse?.id),
      normalize(clinicToUse?.name),
      normalize(clinicToUse?.clinicName)
    ].filter(Boolean) as string[];
    const dayNameNorm = dayName.trim().toLowerCase();

    // Filter availabilities for the selected clinic (by any ID or name)
    const clinicAvailabilities = availability.filter((a: DoctorAvailability) => {
      const availClinicNorms = [
        normalize(a.clinic),
      ];
      // If any selectedClinicIds matches any availClinicNorms
      const clinicMatch = selectedClinicIds.some(selId => (availClinicNorms as string[]).includes(selId));
      if (!clinicMatch) {
        console.log('[SLOTS] Clinic mismatch:', {availClinicNorms, selectedClinicIds});
      }
      return clinicMatch;
    });

    // Now filter for the correct day (case-insensitive)
    const dayAvailabilities = clinicAvailabilities
      .filter((a: DoctorAvailability) => a.day && a.day.trim().toLowerCase() === dayNameNorm);

    // Debug logs
    console.log('[SLOTS] Filtered availabilities for clinic:', clinicAvailabilities);
    console.log('[SLOTS] Day availabilities:', dayAvailabilities);

    // If no availability found for this day, return empty array
    if (dayAvailabilities.length === 0) {
      console.log('[SLOTS] No availability found for day:', dayName);
      return [];
    }

    // Get the first matching day availability (there should typically be only one)
    const dayAvailability = dayAvailabilities[0];

    if (!dayAvailability || !dayAvailability.slots) {
      console.log('[SLOTS] No slots found in day availability');
      return [];
    }

    // Convert to TimeSlot[] format for UI
    const formattedSlots = dayAvailability.slots.map((slot: DoctorAvailabilitySlot, idx: number) => {
      // Ensure we have all required data
      if (!slot._id || !slot.startTime || slot.appointmentLimit === undefined || slot.bookedCount === undefined) {
        console.log('[SLOTS] Missing slot data:', slot);
      }

      return {
        id: slot._id || `${dayName}-${idx}`,
        time: slot.startTime,
        available: (slot.bookedCount < slot.appointmentLimit),
        bookedCount: slot.bookedCount || 0,
        maxBookings: slot.appointmentLimit || 5 // Default to 5 if not specified
      };
    });

    console.log('[SLOTS] Formatted slots:', formattedSlots);
    return formattedSlots;
  }, [state.selectedDoctor, state.selectedClinic]);

  // Build available dates based on doctor availability for selected clinic
  useEffect(() => {
    if (!state.selectedDoctor) {
      setAvailableDates([]);
      return;
    }

    const availability: DoctorAvailability[] = state.selectedDoctor.availability || [];
    if (!availability.length) {
      setAvailableDates([]);
      return;
    }

    const selectedClinicId = state.selectedClinic?._id;
    const filtered = selectedClinicId
      ? availability.filter((a) => a.clinic === selectedClinicId)
      : availability;

    const dates: Date[] = [];
    filtered.forEach((a) => {
      if (!a.day) return;
      dates.push(...getNextDatesForWeekday(a.day, 4));
    });

    const unique = Array.from(new Set(dates.map((d) => d.toDateString()))).map((ds) => new Date(ds));
    unique.sort((a, b) => a.getTime() - b.getTime());
    setAvailableDates(unique);
  }, [state.selectedDoctor, state.selectedClinic, getNextDatesForWeekday]);

  // Date selection handler
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    selectDate(date);
    const slots = getSlotsForDate(date);
    setTimeSlots(slots);
  }, [getSlotsForDate, selectDate]);

  // Slot selection handler
  const handleSlotSelect = useCallback((slot: TimeSlot) => {
    selectSlot(slot);
    setStep('details');
  }, [selectSlot, setStep]);

  // Render grid of slots
  const renderSlotGrid = useCallback(() => {
    if (loadingSlots) {
      return <TimeSlotSkeleton />;
    }
    if (!timeSlots.length) {
      return (
        <Typography variant="caption" className="text-gray-500">
          No slots available for this date.
        </Typography>
      );
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            disabled={!slot.available}
            onClick={() => handleSlotSelect(slot)}
            className={`px-3 py-2 rounded-lg border text-sm ${slot.available ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
            aria-disabled={!slot.available}
          >
            {slot.time}
          </button>
        ))}
      </div>
    );
  }, [timeSlots, loadingSlots, handleSlotSelect]);
  
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
        {state.selectedDoctor && (
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
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(state.selectedDoctor?.fullName ?? '')}&background=0e3293&color=fff`;
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
                {state.selectedClinic && (
                  <div className="flex items-center mt-1">
                    <Icon name="location" size="small" color="#6b7280" className="mr-1" />
                    <Typography variant="caption" className="text-gray-600">
                      {state.selectedClinic.clinicName}
                    </Typography>
                  </div>
                )}
                {!state.selectedClinic && state.selectedDoctor.clinic && state.selectedDoctor.clinic.length > 0 && (
                  <div className="flex items-center mt-1">
                    <Icon name="location" size="small" color="#6b7280" className="mr-1" />
                    <Typography variant="caption" className="text-gray-600">
                      {state.selectedDoctor.clinic[0].clinicName} (Auto-selected)
                    </Typography>
                  </div>
                )}
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
            
            {availableDates.length > 0 ? (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <Typography variant="caption" className="text-blue-700 block mb-1">
                  Note:
                </Typography>
                <Typography variant="caption" className="text-blue-600">
                  Highlighted dates show doctor availability at this clinic. Availability is based on the doctor's schedule.
                </Typography>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <Typography variant="caption" className="text-yellow-700 block mb-1">
                  No Available Dates:
                </Typography>
                <Typography variant="caption" className="text-yellow-600">
                  {state.selectedClinic ? 
                    `No availability found for this doctor at ${state.selectedClinic.clinicName}.` : 
                    "No availability found for this doctor at any clinic."}
                </Typography>
              </div>
            )}
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

                {renderSlotGrid()}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="calendar" size="medium" color="#9ca3af" />
                </div>
                <Typography variant="body2" className="text-gray-600">
                  Please select a date first
                </Typography>
                {availableDates.length === 0 && (
                  <Typography variant="caption" className="text-gray-500 mt-2 block">
                    {state.selectedClinic ? 
                      `No available dates found for Dr. ${state.selectedDoctor?.fullName} at ${state.selectedClinic.clinicName}.` : 
                      `No available dates found for Dr. ${state.selectedDoctor?.fullName} at any clinic.`}
                  </Typography>
                )}
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
