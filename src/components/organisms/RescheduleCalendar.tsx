'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Icon, Calendar, TimeSlotSkeleton } from '../atoms';
import { appointmentService, doctorService } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';
import { useToast } from '../../contexts/ToastContext';

interface Doctor {
  _id: string;
  fullName: string;
  profileImage?: string;
  specializations: string[];
  degree: string;
  consultationFee?: number;
}

interface Clinic {
  _id: string;
  clinicName: string;
  clinicAddress?: {
    addressLine?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface Appointment {
  _id: string;
  doctor: Doctor;
  clinic?: Clinic;
  appointmentDate: Date | string;
  timeSlot: {
    from: string;
    to: string;
  };
  consultationFee: number;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  bookedCount?: number;
  maxBookings?: number;
  from?: string;
  to?: string;
}

interface RescheduleCalendarProps {
  appointment: Appointment;
  onReschedule: (selectedDate: Date, selectedSlot: any, selectedClinic: any) => void;
  isRescheduling: boolean;
}

const RescheduleCalendar: React.FC<RescheduleCalendarProps> = ({
  appointment,
  onReschedule,
  isRescheduling
}) => {
  const { showToast } = useToast();
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableDateKeys, setAvailableDateKeys] = useState<Set<string>>(new Set());
  const [availableDatesRawArray, setAvailableDatesRawArray] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rawApiSlots, setRawApiSlots] = useState<{ id: string; from: string; to: string; appointmentLimit?: number; availableSlots?: number; isAvailable?: boolean }[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableClinics, setAvailableClinics] = useState<Clinic[]>([]);
  // selectedClinic is always a Clinic object (not a string)
  // If only one clinic, auto-select it by default
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  useEffect(() => {
    console.log('[DEBUG] availableClinics:', availableClinics);
    console.log('[DEBUG] selectedClinic before auto-select:', selectedClinic);
  }, [availableClinics, selectedClinic]);

  useEffect(() => {
    console.log('[DEBUG] selectedClinic after auto-select:', selectedClinic);
  }, [selectedClinic]);
  // Always derive the clinicId string for API calls
  const clinicId: string | null = selectedClinic?._id || (typeof appointment.clinic === 'string' ? appointment.clinic : null);

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

  // Fetch available clinics for the doctor
  useEffect(() => {
    const fetchClinics = async () => {
      if (!appointment.doctor._id) return;
      
      try {
        // Fetch doctor details to get clinics
        const doctorDetails = await doctorService.getDoctorById(appointment.doctor._id);
        if (doctorDetails && doctorDetails.clinic) {
          setAvailableClinics(doctorDetails.clinic);
          // Set current clinic as default if it exists in available clinics
          if (appointment.clinic) {
            const currentClinic = doctorDetails.clinic.find((c: Clinic) => c._id === appointment.clinic?._id);
            if (currentClinic) {
              setSelectedClinic(currentClinic);
            } else if (doctorDetails.clinic.length === 1) {
              setSelectedClinic(doctorDetails.clinic[0]);
            }
          } else if (doctorDetails.clinic.length === 1) {
            setSelectedClinic(doctorDetails.clinic[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch doctor clinics:', error);
      }
    };

    fetchClinics();
  }, [appointment.doctor._id, appointment.clinic]);

  // Function to fetch slots for a specific date from API
  const fetchSlotsForDate = useCallback(async (date: Date | null, clinic: Clinic | null): Promise<TimeSlot[]> => {
    if (!date) return [];
    // Use availableDatesRawArray to find slots for the selected date
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`; // Always 'YYYY-MM-DD'
    const dateObj = availableDatesRawArray.find((d: any) => d.date === dateStr);
    console.log('[DEBUG] availableDatesRawArray:', availableDatesRawArray);
    console.log('[DEBUG] selected dateStr:', dateStr);
    const slots = dateObj?.slots || [];

    // Normalize slots
    const normalized = (slots || []).map((s: { [key: string]: any }, idx: number) => {
      // Always prefer startTime/endTime, fallback to from/to/start/end
      const from = s.startTime || s.from || s.start || '';
      const to = s.endTime || s.to || s.end || '';
      const id = `${from}-${to}-${idx}`;
      const appointmentLimit: number | undefined = typeof s.appointmentLimit === 'number' ? s.appointmentLimit : undefined;
      const availableSlots: number | undefined = typeof s.availableSlots === 'number' ? s.availableSlots : undefined;
      const isAvailable: boolean | undefined = typeof s.isAvailable === 'boolean' ? s.isAvailable : undefined;
      return {
        id,
        from,
        to,
        appointmentLimit,
        availableSlots,
        isAvailable
      };
    });
    setRawApiSlots(normalized);
    console.log('[SLOTS]', normalized);

    const uiSlots: TimeSlot[] = normalized.map((s: any) => {
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
        from: s.from,
        to: s.to,
      };
    });
    return uiSlots;
  }, [availableDatesRawArray]);

  // Build available dates using API for current and next month
  useEffect(() => {
    const fetchMonthly = async () => {
      if (!appointment.doctor || !clinicId) { 
        setAvailableDates([]);
        return; 
      }
      
      const doctorId = appointment.doctor._id;
      // clinicId is now always a string or null
      if (!doctorId || !clinicId) {
        setAvailableDates([]);
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
        setAvailableDatesRawArray(all); // Store raw for slot lookup
        
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
  }, [appointment.doctor, selectedClinic]);

  // Date selection handler
  const handleDateSelect = useCallback((date: Date) => {
  
    // Block selecting past dates regardless of availability
    if (isPastDate(date)) {
      alert('You cannot select a past date');
      return;
    }
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes
    
    const key = date.toDateString();
    if (!availableDateKeys.has(key)) {
      setTimeSlots([]);
      alert('Doctor not available on this date at this clinic');
      return;
    }
    setLoadingSlots(true);
    void (async () => {
      const slots = await fetchSlotsForDate(date, selectedClinic);
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
      console.log('[TIME SLOTS]', adjusted);
      setLoadingSlots(false);
    })();
  }, [availableDateKeys, fetchSlotsForDate, selectedClinic]);

  // Slot selection handler
  const handleSlotSelect = useCallback(async (slot: TimeSlot) => {
    console.log('[DEBUG] handleSlotSelect called with slot:', slot);
    
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    // Guard: prevent selecting past time slot
    if (isPastDate(selectedDate) || isPastTimeOnDate(selectedDate, slot.time)) {
      alert('Please select a future time slot');
      return;
    }

    // Simply set the selected slot - no validation needed for reschedule
    setSelectedSlot(slot);
    console.log('[DEBUG] Slot selected successfully:', slot);
  }, [selectedDate]);

  // Auto-select clinic when available clinics are loaded or use the one from appointment
  useEffect(() => {
    // If we have the clinic in the appointment and it's not already selected
    if (appointment.clinic && !selectedClinic) {
      // If clinic is a string (ID), create a minimal clinic object
      if (typeof appointment.clinic === 'string') {
        setSelectedClinic({
          _id: appointment.clinic,
          clinicName: 'Clinic',
          clinicAddress: {}
        });
      } 
      // If clinic is an object, use it directly
      else if (appointment.clinic._id) {
        setSelectedClinic(appointment.clinic);
      }
    }
    // If no clinic in appointment but we have available clinics
    else if (availableClinics.length > 0 && !selectedClinic) {
      setSelectedClinic(availableClinics[0]);
    }
  }, [availableClinics, selectedClinic, appointment.clinic]);

  // Handle clinic selection
  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setSelectedDate(null);
    setSelectedSlot(null);
    setTimeSlots([]);
  };


  const handleConfirmReschedule = () => {
    if (!selectedDate || !selectedSlot) {
      showToast({
        type: 'error',
        title: 'Selection Required',
        message: 'Please select a date and time slot'
      });
      return;
    }

    // Use the selected clinic, fall back to appointment clinic, or first available clinic
    const clinicToUse = selectedClinic || 
                       (typeof appointment.clinic === 'object' ? appointment.clinic : null) ||
                       (availableClinics.length > 0 ? availableClinics[0] : null);

    if (!clinicToUse) {
      showToast({
        type: 'error',
        title: 'Clinic Information Missing',
        message: 'No clinic information available for rescheduling'
      });
      return;
    }

    console.log('Proceeding with reschedule:', {
      date: selectedDate,
      slot: selectedSlot,
      clinic: clinicToUse
    });
    
    // Pass the full clinic object to the onReschedule callback
    onReschedule(selectedDate, selectedSlot, clinicToUse);
  };

  return (
    <div className="space-y-6">
      {/* Clinic Selection */}
      {availableClinics.length > 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-[#0e3293] rounded-full mr-3"></div>
            <Typography variant="h6" className="text-gray-900 font-semibold">
              Select Clinic
            </Typography>
          </div>
          
          <div className="grid gap-3">
            {availableClinics.map((clinic) => (
              <button
                key={clinic._id}
                onClick={() => handleClinicSelect(clinic)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  selectedClinic?._id === clinic._id
                    ? 'border-[#0e3293] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Typography variant="body1" className="font-medium text-gray-900 mb-1">
                  {clinic.clinicName}
                </Typography>
                {clinic.clinicAddress && (
                  <Typography variant="body2" className="text-gray-600">
                    {clinic.clinicAddress.addressLine}, {clinic.clinicAddress.city}
                  </Typography>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date Selection Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-[#0e3293] rounded-full mr-3"></div>
          <Typography variant="h6" className="text-gray-900 font-semibold">
            Select New Date
          </Typography>
        </div>
        
        <Calendar
          selectedDate={selectedDate || new Date()}
          onDateSelect={handleDateSelect}
          highlightedDates={availableDates}
          className="mb-4"
        />
        
        {/* Selected Date Info */}
        {selectedDate && (
          <div className="bg-blue-50 rounded-lg p-4">
            <Typography variant="body2" className="text-[#0e3293] font-medium mb-1">
              Selected: {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            <Typography variant="caption" className="text-blue-600">
              {timeSlots.filter(slot => slot.available).length} time slot(s) available
            </Typography>
          </div>
        )}
      </div>

      {/* Time Slots Selection */}
      {selectedDate && timeSlots.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <Typography variant="h6" className="text-gray-900 font-semibold mb-4">
            Available Time Slots
          </Typography>
          
          {/* Grouped Time Slots by Period */}
          {loadingSlots ? (
            <TimeSlotSkeleton />
          ) : (
            <>
              {[
                { key: 'morning', label: 'Morning', icon: '☀️', filter: (hour: number) => hour >= 6 && hour < 12 },
                { key: 'afternoon', label: 'Afternoon', icon: '☀️', filter: (hour: number) => hour >= 12 && hour < 18 },
                { key: 'evening', label: 'Evening', icon: '🌙', filter: (hour: number) => hour >= 18 || hour < 6 }
              ].map(period => {
                const slots = timeSlots.filter(slot => {
                  const hour = parseInt(slot.time.split(':')[0]);
                  return period.filter(hour);
                });
                if (slots.length === 0) return null;
                return (
                  <div key={period.key} className="mb-4">
                    <Typography variant="subtitle1" className="mb-2 flex items-center">
                      <span className="mr-2">{period.icon}</span> {period.label}
                    </Typography>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          disabled={!slot.available}
                          onClick={() => handleSlotSelect(slot)}
                          className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border transition-colors text-center ${
                            selectedSlot?.id === slot.id
                              ? 'border-[#0e3293] bg-blue-50 text-[#0e3293]'
                              : slot.available 
                                ? 'border-green-600 text-green-700 hover:bg-green-50' 
                                : 'border-gray-300 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className={`text-xs sm:text-sm font-medium ${
                            selectedSlot?.id === slot.id 
                              ? 'text-[#0e3293]'
                              : slot.available ? 'text-green-700' : 'text-gray-400'
                          }`}>
                            {slot.from && slot.to ? `${slot.from} - ${slot.to}` : slot.time}
                          </div>
                          <div className="text-[10px] sm:text-[11px] mt-1 text-gray-600">
                            Available: {Math.max(0, (slot.maxBookings || 0) - (slot.bookedCount || 0))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Confirm Reschedule Button - always visible when slot is selected */}
      {selectedDate && selectedSlot && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <Typography variant="h6" className="text-gray-900 font-semibold mb-2">
              New Appointment Time
            </Typography>
            <div className="bg-gray-50 rounded-lg p-4">
              <Typography variant="body2" className="text-gray-600 mb-2">
                Your appointment will be rescheduled to:
              </Typography>
              <Typography variant="body1" className="font-medium text-gray-900">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} at {selectedSlot.from} - {selectedSlot.to}
              </Typography>
              {selectedClinic && (
                <Typography variant="body2" className="text-gray-600 mt-1">
                  {selectedClinic.clinicName}
                </Typography>
              )}
            </div>
          </div>
          <button
            onClick={handleConfirmReschedule}
            disabled={isRescheduling}
            className="w-full bg-[#0e3293] hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRescheduling ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Rescheduling...
              </div>
            ) : (
              'Reschedule'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RescheduleCalendar;
