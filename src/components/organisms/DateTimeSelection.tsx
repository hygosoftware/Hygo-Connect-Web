'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Icon, Calendar, TimeSlotSkeleton } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { TimeSlot } from '../../contexts/BookingContext';
import { DoctorAvailability, DoctorAvailabilitySlot } from '../../types/Doctor';
import { appointmentService } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';
import { useToast } from '../../contexts/ToastContext';

const DateTimeSelection: React.FC = () => {
  const { state, selectDate, selectSlot, setStep } = useBooking();
  const { showToast } = useToast();
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableDateKeys, setAvailableDateKeys] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | null>(state.selectedDate);

  // Sync local selectedDate with context selectedDate
  useEffect(() => {
    if (state.selectedDate !== selectedDate) {
      setSelectedDate(state.selectedDate);
    }
  }, [state.selectedDate]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rawApiSlots, setRawApiSlots] = useState<{ id: string; from: string; to: string; appointmentLimit?: number; availableSlots?: number; isAvailable?: boolean }[]>([]);

  // (Removed debug logs previously printing initial doctor and clinic data)

  // Helpers to block past selections
  const isPastDate = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cmp = new Date(d);
    cmp.setHours(0, 0, 0, 0);
    return cmp < today;
  };

  const parseTimeToDate = (baseDate: Date, timeStr: string): Date | null => {
    if (!timeStr) return null;
    const d = new Date(baseDate);
    // Expect formats like "HH:MM AM/PM" or "HH:MM"
    const ampmMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    const hhmmMatch = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
    let hours: number | null = null;
    let minutes: number | null = null;
    if (ampmMatch) {
      hours = parseInt(ampmMatch[1], 10);
      minutes = parseInt(ampmMatch[2], 10);
      const ampm = ampmMatch[3].toLowerCase();
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
    } else if (hhmmMatch) {
      hours = parseInt(hhmmMatch[1], 10);
      minutes = parseInt(hhmmMatch[2], 10);
    } else {
      // Fallback: try Date parsing
      const isoTry = new Date(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${timeStr}`);
      if (!isNaN(isoTry.getTime())) return isoTry;
      return null;
    }
    if (hours == null || minutes == null) return null;
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const isPastTimeOnDate = (date: Date, timeStr: string) => {
    const now = new Date();
    const dt = parseTimeToDate(date, timeStr);
    if (!dt) return false; // If unknown format, do not block
    return dt.getTime() < now.getTime();
  };

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

  // Helper: Get next N dates for a given weekday (legacy fallback)
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

  // Function to fetch slots for a specific date from API
  const fetchSlotsForDate = useCallback(async (date: Date | null, _overrideClinic?: ClinicIdentifier): Promise<TimeSlot[]> => {
    if (!date || !state.selectedDoctor) return [];

    // Strict: require explicitly selected clinic with valid _id
    const clinicId = String(state.selectedClinic?._id || '');
    if (!clinicId) {
      showToast({ type: 'error', title: 'Please select a clinic first' });
      setStep('clinic');
      return [];
    }
    const doctorId = String(state.selectedDoctor._id);

    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    try {
      const slots = await appointmentService.getAvailableSlotsForDate(doctorId, clinicId, dateStr);
      console.log("slots", slots)
      // Normalize to UI TimeSlot[] and keep raw mapping for conflict checks
      const normalized = (slots || []).map((s: any, idx: number) => {
        const from: string = s.from || s.start || s.startTime || '';
        const to: string = s.to || s.end || s.endTime || '';
        const id = `${from}-${to}-${idx}`;
        const appointmentLimit: number | undefined = typeof s.appointmentLimit === 'number' ? s.appointmentLimit : undefined;
        const availableSlots: number | undefined = typeof s.availableSlots === 'number' ? s.availableSlots : undefined;
        const isAvailable: boolean | undefined = typeof s.isAvailable === 'boolean' ? s.isAvailable : undefined;
        return { id, from, to, appointmentLimit, availableSlots, isAvailable };
      });
      setRawApiSlots(normalized);

      const uiSlots: TimeSlot[] = normalized.map((s) => {
        const maxBookings = (s.appointmentLimit && s.appointmentLimit > 0) ? s.appointmentLimit : 1;
        const bookedCount = (typeof s.availableSlots === 'number' && typeof s.appointmentLimit === 'number')
          ? Math.max(0, s.appointmentLimit - s.availableSlots)
          : 0;
        const available = (s.isAvailable !== false) && (typeof s.availableSlots === 'number' ? s.availableSlots > 0 : true);
        return {
          id: s.id,
          time: s.from,
          available,
          bookedCount,
          maxBookings,
        };
      });
      return uiSlots;
    } catch (e: any) {
      console.error('[API] Failed to fetch slots:', e);
      const msg = e?.response?.data?.message || 'Doctor not available on this day at this clinic';
      showToast({ type: 'warning', title: msg });
      return [];
    }
  }, [state.selectedDoctor, state.selectedClinic, setStep, showToast]);

  // Build available dates using API for current and next month
  useEffect(() => {
    const fetchMonthly = async () => {
      if (!state.selectedDoctor) { setAvailableDates([]); return; }
      const doctorId = String(state.selectedDoctor._id);
      // Strict: require explicitly selected clinic ID
      const clinicId = String(state.selectedClinic?._id || '');
      if (!clinicId) {
        setAvailableDates([]);
        setAvailableDateKeys(new Set());
        showToast({ type: 'error', title: 'Please select a clinic to view availability' });
        setStep('clinic');
        return;
      }

      const today = new Date();
      const month1 = today.getMonth() + 1; // 1-based
      const year1 = today.getFullYear();
      const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const month2 = next.getMonth() + 1;
      const year2 = next.getFullYear();

      try {
        const [d1, d2] = await Promise.all([
          appointmentService.getMonthlySlots(doctorId, clinicId, month1, year1),
          appointmentService.getMonthlySlots(doctorId, clinicId, month2, year2),
        ]);
        const all = [...(d1 || []), ...(d2 || [])];
        // Support two formats:
        // 1) string[] of 'YYYY-MM-DD'
        // 2) { date: 'YYYY-MM-DD', day: string, slots: Array<{startTime,endTime,isAvailable,...}> }
        const dateStrings: string[] = all
          .filter(Boolean)
          .map((entry: any) => {
            if (typeof entry === 'string') return entry;
            if (entry && typeof entry === 'object') {
              const hasAvailableSlots = Array.isArray(entry.slots)
                ? entry.slots.some((s: any) => s?.isAvailable !== false)
                : true; // if slots missing, assume available
              return hasAvailableSlots ? entry.date : null;
            }
            return null;
          })
          .filter((s): s is string => !!s);

        const asDates = dateStrings
          .map((ds) => {
            const [y, m, d] = String(ds).split('-').map((n) => parseInt(n, 10));
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d);
          })
          .filter((x): x is Date => !!x);

        // Deduplicate by date string
        const keySet = new Set(asDates.map((d) => d.toDateString()));
        const unique = Array.from(keySet).map((ds) => new Date(ds));
        unique.sort((a, b) => a.getTime() - b.getTime());
        setAvailableDates(unique);
        setAvailableDateKeys(keySet);
      } catch (e) {
        console.error('Failed to fetch monthly slots:', e);
        setAvailableDates([]);
        setAvailableDateKeys(new Set());
      }
    };
    void fetchMonthly();
  }, [state.selectedDoctor, state.selectedClinic]);

  // Date selection handler
  const handleDateSelect = useCallback((date: Date) => {
    // Block selecting past dates regardless of availability
    if (isPastDate(date)) {
      showToast({ type: 'warning', title: 'You cannot select a past date' });
      return;
    }
    setSelectedDate(date);
    selectDate(date);
    const key = date.toDateString();
    if (!availableDateKeys.has(key)) {
      setTimeSlots([]);
      showToast({ type: 'warning', title: 'Doctor not available on this date at this clinic' });
      return;
    }
    setLoadingSlots(true);
    void (async () => {
      const slots = await fetchSlotsForDate(date);
      // If selected date is today, mark past times as unavailable
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sel = new Date(date);
      sel.setHours(0, 0, 0, 0);
      const adjusted = sel.getTime() === today.getTime()
        ? slots.map(s => ({
            ...s,
            available: s.available && !isPastTimeOnDate(date, s.time)
          }))
        : slots;
      setTimeSlots(adjusted);
      setLoadingSlots(false);
    })();
  }, [availableDateKeys, fetchSlotsForDate, selectDate, showToast]);

  // Slot selection handler
  const handleSlotSelect = useCallback(async (slot: TimeSlot) => {
    try {
      if (!state.selectedDoctor) {
        showToast({ type: 'error', title: 'Please select a doctor first' });
        setStep('doctor');
        return;
      }
      if (!state.selectedClinic) {
        showToast({ type: 'error', title: 'Please select a clinic first' });
        setStep('clinic');
        return;
      }
      if (!state.selectedDate) {
        showToast({ type: 'error', title: 'Please select a date first' });
        return;
      }

      // Guard: prevent selecting past time slot
      if (isPastDate(state.selectedDate) || isPastTimeOnDate(state.selectedDate, slot.time)) {
        showToast({ type: 'warning', title: 'Please select a future time slot' });
        return;
      }

      const userId = TokenManager.getTokens().userId as string | null;
      if (!userId) {
        showToast({ type: 'error', title: 'Please login to continue' });
        return;
      }

      // Find raw slot by id to extract from/to
      const raw = rawApiSlots.find((s) => s.id === slot.id);
      const from = raw?.from || slot.time;
      const to = raw?.to || slot.time; // fallback
      const doctorId = String(state.selectedDoctor._id);
      const clinicId = String(state.selectedClinic._id);
      const d = state.selectedDate;
      const yyyy = d.getFullYear();
      const mm = (d.getMonth() + 1).toString().padStart(2, '0');
      const dd = d.getDate().toString().padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const hasConflict = await appointmentService.checkUserBookingForSlot(
        userId,
        doctorId,
        clinicId,
        dateStr,
        { from, to }
      );
      if (hasConflict) {
        showToast({ type: 'warning', title: 'You already have a booking at this time' });
        return;
      }

      selectSlot(slot);
      setStep('details');
    } catch (e) {
      console.error('Slot selection error:', e);
      showToast({ type: 'error', title: 'Unable to validate slot. Please try again.' });
    }
  }, [rawApiSlots, selectSlot, setStep, state.selectedClinic, state.selectedDate, state.selectedDoctor, showToast]);

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
      <div className="grid grid-cols-2 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.id}
            disabled={!slot.available}
            onClick={() => handleSlotSelect(slot)}
            className={`w-full px-4 py-3 rounded-xl border transition-colors text-center ${slot.available ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
            aria-disabled={!slot.available}
          >
            <div className={`text-sm font-medium ${slot.available ? 'text-green-700' : 'text-gray-400'}`}>
              {(() => {
                const raw = rawApiSlots.find((s) => s.id === slot.id);
                const from = raw?.from || slot.time;
                const to = raw?.to;
                return to ? `${from} - ${to}` : from;
              })()}
            </div>
            <div className="text-[11px] mt-1 text-gray-600">
              Booked: {slot.bookedCount} • Available: {Math.max(0, (slot.maxBookings || 0) - (slot.bookedCount || 0))}
            </div>
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
                      `No available dates found for ${state.selectedDoctor?.fullName} at ${state.selectedClinic.clinicName}.` : 
                      `No available dates found for ${state.selectedDoctor?.fullName} at any clinic.`}
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
