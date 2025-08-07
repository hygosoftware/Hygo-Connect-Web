'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Icon, Calendar, TimeSlotSkeleton } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { TimeSlot } from '../../contexts/BookingContext';

const DateTimeSelection: React.FC = () => {
  const { state, selectDate, selectSlot, setStep, setLoading } = useBooking();
  const { showToast } = useToast();
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(state.selectedDate);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Use only _id for clinic identification
  const normalizedClinic = state.selectedClinic
    ? { ...state.selectedClinic }
    : undefined;

  let selectedClinicId = normalizedClinic?._id;

  // Log initial state on component mount
  useEffect(() => {
    //('DateTimeSelection component initialized with state:');
    //('Initial selectedDoctor:', state.selectedDoctor);
    //('Initial selectedClinic:', state.selectedClinic);
    //('Initial selectedDate:', state.selectedDate);
    
    if (state.selectedDoctor) {
      //('Doctor has clinics:', state.selectedDoctor.clinic);
      //('Doctor has availability:', state.selectedDoctor.availability);
      
      // Check if the specific clinic ID from the user is in the doctor's availability
      const availability = state.selectedDoctor.availability || [];
      const hasSpecificClinic = availability.some((a: any) => (a.clinic === selectedClinicId) || (a.clinic?.toLowerCase?.() === selectedClinicId?.toLowerCase?.()));
      //(`Doctor has availability for specific clinic ID (${specificClinicId}): ${hasSpecificClinic}`);
      
      // Log the clinic IDs in the doctor's availability for comparison
      //('All clinic IDs in doctor\'s availability:', availability.map((a: any) => a.clinic));
      
      // Check if the specific clinic ID is in the doctor's clinic array
      const clinicArray = state.selectedDoctor.clinic || [];
      const clinicInArray = clinicArray.some((c: any) => c._id === selectedClinicId);
      //(`Doctor has clinic with specific ID (${specificClinicId}) in clinic array: ${clinicInArray}`);
      
      // Log all clinic IDs in the doctor's clinic array
      //('All clinic IDs in doctor\'s clinic array:', clinicArray.map((c: any) => c._id));
      
      // Check for case-insensitive matches
      const caseInsensitiveMatches = availability.filter((a: any) => {
        if (typeof a.clinic === 'string' && typeof selectedClinicId === 'string') {
          return a.clinic.toLowerCase() === selectedClinicId.toLowerCase();
        }
        return false;
      });
      //(`Found ${caseInsensitiveMatches.length} case-insensitive matches for selected clinic ID`);
    }
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
  
  // Function to get slots for a specific date, with optional clinic parameter for testing
  function getSlotsForDate(date: Date | null, overrideClinic?: any): TimeSlot[] {
  if (!date) {
    //('[getSlotsForDate] Provided date is null or undefined. Returning empty slot array.');
    return [];
  }
    if (!state.selectedDoctor) return [];
    
    // Use the override clinic if provided, otherwise use the selected clinic from state
    const clinicToUse = overrideClinic || state.selectedClinic;
    
    // Get the day of the week for the selected date
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Access the availability array from the doctor object
    const availability = state.selectedDoctor.availability || [];
    
    // Detailed logging of selected clinic data in getSlotsForDate
    
    
    
    
    
    
    
    // If clinicToUse is undefined, use the first clinic from doctor's clinic array
    if (!clinicToUse && state.selectedDoctor.clinic && state.selectedDoctor.clinic.length > 0) {
      
                 state.selectedDoctor.clinic[0].clinicName;
    }
    
    // Special handling for HYGO clinic ID
    const isHygoClinic = typeof clinicToUse?._id === 'string' && 
                        clinicToUse._id.toUpperCase().includes('HYGO');
    
    if (isHygoClinic) {
      
    }
    
    // If no clinic is selected, use all availabilities
    let clinicAvailability = availability;
    
    // Only filter by clinic if one is selected
    if (clinicToUse) {
      clinicAvailability = availability.filter((a: any) => {
        // Try both exact match and case-insensitive match
        const exactMatch = a.clinic === clinicToUse?._id;
        //(`Exact match check: '${a.clinic}' === '${clinicToUse?._id}' => ${exactMatch}`);
        
        // Check against the specific clinic ID from user (Madhuram Hospital)
        const specificClinicId = "685d192933f7461084071b2f";
        const specificClinicMatch = a.clinic === specificClinicId;
        //(`Specific clinic ID match check: '${a.clinic}' === '${specificClinicId}' => ${specificClinicMatch}`);
        
        // Try case-insensitive match if both are strings
        let caseInsensitiveMatch = false;
        if (typeof a.clinic === 'string' && typeof clinicToUse?._id === 'string') {
          caseInsensitiveMatch = a.clinic.toLowerCase() === clinicToUse._id.toLowerCase();
          //(`Case-insensitive match check: '${a.clinic.toLowerCase()}' === '${clinicToUse._id.toLowerCase()}' => ${caseInsensitiveMatch}`);
        }
        
        // Also try matching by name if clinic has a name property
        let nameMatch = false;
        if (a.clinicName && clinicToUse?.clinicName) {
          nameMatch = a.clinicName.toLowerCase() === clinicToUse.clinicName.toLowerCase();
          //(`Name match check: '${a.clinicName.toLowerCase()}' === '${clinicToUse.clinicName.toLowerCase()}' => ${nameMatch}`);
        }
        
        // Special case for HYGO clinic
        let hygoMatch = false;
        if (isHygoClinic || (typeof a.clinic === 'string' && a.clinic.toUpperCase().includes('HYGO'))) {
          hygoMatch = true;
          //('HYGO match found for clinic in getSlotsForDate:', a.clinic);
        }
        
        // Fallback: If we have no matches but this is the only clinic in the doctor's availability,
        // we'll use it as a last resort
        let fallbackMatch = false;
        if (!exactMatch && !caseInsensitiveMatch && !nameMatch && !hygoMatch && availability.length === 1) {
          fallbackMatch = true;
          //('Using fallback match in getSlotsForDate as this is the only clinic in doctor\'s availability');
        }
        
        const match = exactMatch || caseInsensitiveMatch || nameMatch || hygoMatch || fallbackMatch;
        //(`In getSlotsForDate - Comparing clinic IDs: ${a.clinic} === ${clinicToUse?._id} => ${match} (exact: ${exactMatch}, case-insensitive: ${caseInsensitiveMatch}, name: ${nameMatch}, hygo: ${hygoMatch}, fallback: ${fallbackMatch})`);
        return match;
      });
    }
    
    // Find availability for the selected day
    const dayAvailability = clinicAvailability.find((a: any) => a.day === dayName);
    
    if (!dayAvailability || !dayAvailability.slots) {
      if (clinicToUse) {
        //(`No availability found for ${dayName} at clinic: ${clinicToUse.clinicName}`);
      } else {
        //(`No availability found for ${dayName} at any clinic`);
      }
      return [];
    }
    
    //(`Found ${dayAvailability.slots.length} slots for ${dayName}:`, dayAvailability.slots);
    
    // Convert to TimeSlot[] format for UI
    return dayAvailability.slots.map((slot: any, idx: number) => {
      // Ensure we have all required data
      if (!slot._id || !slot.startTime || slot.appointmentLimit === undefined || slot.bookedCount === undefined) {
        //('Incomplete slot data:', slot);
      }
      
      return {
        id: slot._id || `${dayName}-${idx}`,
        time: slot.startTime,
        available: (slot.bookedCount < slot.appointmentLimit),
        bookedCount: slot.bookedCount || 0,
        maxBookings: slot.appointmentLimit || 5 // Default to 5 if not specified
      };
    });
  }

  useEffect(() => {
    // Build available dates based on doctor availability for selected clinic
    if (state.selectedDoctor) {
      //('Building available dates for doctor:', state.selectedDoctor.fullName);
      
      // Access the availability array from the doctor object
      const availability = state.selectedDoctor.availability || [];
      
      if (!availability.length) {
        
        setAvailableDates([]);
        return;
      }
      
      
      // If selectedClinic is undefined, use the first clinic from doctor's clinic array
      if (!state.selectedClinic && state.selectedDoctor.clinic && state.selectedDoctor.clinic.length > 0) {
        
      }
      
      // Special handling for HYGO clinic ID
      const isHygoClinic = typeof state.selectedClinic?._id === 'string' && 
                          state.selectedClinic._id.toUpperCase().includes('HYGO');
      
      if (isHygoClinic) {
        //('HYGO clinic detected, will attempt to match with all availabilities');
      }
      
      // If no clinic is selected, use all availabilities
      let clinicAvailability = availability;
      
      // Only filter by clinic if one is selected
      if (state.selectedClinic) {
        clinicAvailability = availability.filter((a: any) => {
          // Try both exact match and case-insensitive match
          const exactMatch = a.clinic === selectedClinicId;
          //(`useEffect - Exact match check: '${a.clinic}' === '${selectedClinicId}' => ${exactMatch}`);
          
          // Check against the specific clinic ID from user (Madhuram Hospital)
          const specificClinicId = "685d192933f7461084071b2f";
          const specificClinicMatch = a.clinic === specificClinicId;
          //(`useEffect - Specific clinic ID match check: '${a.clinic}' === '${specificClinicId}' => ${specificClinicMatch}`);
          
          // Try case-insensitive match if both are strings
          let caseInsensitiveMatch = false;
          if (typeof a.clinic === 'string' && typeof selectedClinicId === 'string') {
            caseInsensitiveMatch = a.clinic.toLowerCase() === selectedClinicId.toLowerCase();
            //(`useEffect - Case-insensitive match check: '${a.clinic.toLowerCase()}' === '${selectedClinicId.toLowerCase()}' => ${caseInsensitiveMatch}`);
          }
          
          // Also try matching by name if clinic has a name property
          let nameMatch = false;
          if (a.clinicName && state.selectedClinic?.clinicName) {
            nameMatch = a.clinicName.toLowerCase() === state.selectedClinic.clinicName.toLowerCase();
            //(`useEffect - Name match check: '${a.clinicName.toLowerCase()}' === '${state.selectedClinic.clinicName.toLowerCase()}' => ${nameMatch}`);
          }
          
          // Special case for HYGO clinic
          let hygoMatch = false;
          if (isHygoClinic || (typeof a.clinic === 'string' && a.clinic.toUpperCase().includes('HYGO'))) {
            hygoMatch = true;
            //('HYGO match found for clinic:', a.clinic);
          }
         
          // Fallback: If we have no matches but this is the only clinic in the doctor's availability,
          // we'll use it as a last resort
          let fallbackMatch = false;
          if (!exactMatch && !caseInsensitiveMatch && !nameMatch && !hygoMatch && availability.length === 1) {
            fallbackMatch = true;
            //('Using fallback match as this is the only clinic in doctor\'s availability');
          }
         
          const match = exactMatch || caseInsensitiveMatch || nameMatch || hygoMatch || fallbackMatch;
          //(`Comparing clinic IDs: ${a.clinic} === ${selectedClinicId} => ${match} (exact: ${exactMatch}, case-insensitive: ${caseInsensitiveMatch}, name: ${nameMatch}, hygo: ${hygoMatch}, fallback: ${fallbackMatch})`);
          return match;
        });
      }
      
      if (!clinicAvailability.length) {
        if (state.selectedClinic) {
          //('No availability for this doctor at selected clinic:', state.selectedClinic.clinicName);
        } else if (state.selectedDoctor.clinic && state.selectedDoctor.clinic.length > 0) {
          //('No availability for this doctor at any clinic');
        } else {
          //('No availability data found for this doctor');
        }
        setAvailableDates([]);
        return;
      }
      
      //(`Found ${clinicAvailability.length} availability entries for clinic ${state.selectedClinic.clinicName}:`, clinicAvailability);
      
      let dates: Date[] = [];
      clinicAvailability.forEach((a: any) => {
        if (!a.day) {
          //('Missing day in availability entry:', a);
          return;
        }
        
        // For each available day, get next 4 dates (or more/less as needed)
        const weekdayDates = getNextDatesForWeekday(a.day, 4);
        //(`Generated ${weekdayDates.length} dates for ${a.day}:`, weekdayDates.map(d => d.toDateString()));
        dates = dates.concat(weekdayDates);
      });
      
      // Remove duplicates and sort
      const dateStrSet = new Set(dates.map(d => d.toDateString()));
      const uniqueDates = Array.from(dateStrSet).map(ds => new Date(ds));
      uniqueDates.sort((a, b) => a.getTime() - b.getTime());
      
      //(`Final available dates (${uniqueDates.length}):`, uniqueDates.map(d => d.toDateString()));
      setAvailableDates(uniqueDates);
      
      // Auto-select first available date if none selected
      if ((!selectedDate || !uniqueDates.some(d => d.toDateString() === selectedDate?.toDateString())) && uniqueDates.length > 0) {
        //('Auto-selecting first available date:', uniqueDates[0].toDateString());
        setSelectedDate(uniqueDates[0]);
      }
    } else {
      setAvailableDates([]);
    }
  }, [state.selectedDoctor, state.selectedClinic, selectedDate]);

  useEffect(() => {
    // Update slots for selected date
    const fetchTimeSlots = async () => {
      if (selectedDate && state.selectedDoctor) {
        setLoadingSlots(true);
        
        // Log clinic selection state when fetching time slots
        //('[fetchTimeSlots] Current clinic selection state:');
        //('[fetchTimeSlots] selectedClinic:', state.selectedClinic);
        //('[fetchTimeSlots] selectedClinic ID:', selectedClinicId);
        //('[fetchTimeSlots] selectedDoctor clinics:', state.selectedDoctor.clinic);
        
        try {
          // Use getSlotsForDate to get available slots directly from doctor availability
          const slots = getSlotsForDate(selectedDate);
          
          //('[DEBUG] Available slots for selected date:', slots);
          setTimeSlots(slots);
        } catch (error) {
          //('Error fetching time slots:', error);
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

  // Function to render the time slot grid
  const renderSlotGrid = () => {
    if (loadingSlots) {
      return <TimeSlotSkeleton />;
    }
    
    if (!timeSlots || timeSlots.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="calendar" size="medium" color="#9ca3af" />
          </div>
          <Typography variant="body2" className="text-gray-600">
            No slots available for this date
          </Typography>
          <Typography variant="caption" className="text-gray-500 mt-2 block">
            {state.selectedClinic ? 
              `Try selecting a different date or clinic for Dr. ${state.selectedDoctor?.fullName}.` : 
              `Try selecting a different date for Dr. ${state.selectedDoctor?.fullName}.`}
          </Typography>
        </div>
      );
    }
    
    //(`Rendering ${timeSlots.length} slots for UI`);
    
    return (
      <div className="grid grid-cols-2 gap-3">
        {timeSlots.map((slot) => {
          // Validate slot data before rendering
          if (!slot || !slot.id || !slot.time) {
            //('Invalid slot data:', slot);
            return null;
          }
          return <TimeSlotCard key={slot.id} slot={slot} />;
        })}
      </div>
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    selectDate(date);
    
    //(`Selected date: ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    
    // Log complete clinic selection state
    //('=== CLINIC SELECTION STATE WHEN DATE SELECTED ===');
    //('selectedClinic:', state.selectedClinic);
    //('selectedClinic ID:', state.selectedClinic?._id);
    //('selectedClinic is null or undefined:', state.selectedClinic == null);
    //('selectedDoctor:', state.selectedDoctor?.fullName);
    //('selectedDoctor clinics:', state.selectedDoctor?.clinic);
    //('selectedDoctor availability:', state.selectedDoctor?.availability);
    //('=== END CLINIC SELECTION STATE ===');
    
    // Get slots for the selected date
    const slots = getSlotsForDate(date);
    //(`Retrieved ${slots.length} slots for ${date.toDateString()}:`, slots);
    
    if (slots.length === 0) {
      //(`No slots available for ${date.toDateString()}`);
    }
    
    setTimeSlots(slots);
    // Additional slots will be fetched by the useEffect hook if needed
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    // Log complete clinic selection state when slot is selected
    //('=== CLINIC SELECTION STATE WHEN SLOT SELECTED ===');
    //('selectedClinic:', state.selectedClinic);
    //('selectedClinic ID:', state.selectedClinic?._id);
    //('selectedClinic is null or undefined:', state.selectedClinic == null);
    //('selectedDoctor:', state.selectedDoctor?.fullName);
    //('selectedDate:', selectedDate);
    //('selectedSlot:', slot);
    //('=== END CLINIC SELECTION STATE ===');
    
    selectSlot(slot);
    setStep('details');
  };

  const formatTime = (time: string) => {
    // Handle time formats like "01:00 PM" or "13:00"
    if (time.includes('AM') || time.includes('PM')) {
      // Time is already in 12-hour format with AM/PM
      return time;
    }
    
    // Handle 24-hour format like "13:00"
    const [hours, minutes] = time.split(':');
    if (hours && minutes) {
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    
    // Fallback for any other format
    return time;
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

  // Log complete state on each render
  const logCompleteState = () => {
    //('=== COMPLETE STATE ON RENDER ===');
    //('selectedDoctor:', state.selectedDoctor?.fullName);
    //('selectedClinic:', state.selectedClinic);
    //('selectedClinic ID:', state.selectedClinic?._id);
    //('selectedDate:', selectedDate);
    //('timeSlots:', timeSlots.length);
    //('availableDates:', availableDates.length);
    //('=== END COMPLETE STATE ===');
  };
  
  // Function to test what happens if we manually set the clinic ID
  const testWithSpecificClinic = () => {
    const specificClinicId = "685d192933f7461084071b2f";
    //('\n--- TESTING WITH SPECIFIC CLINIC ID ---');
    
    if (state.selectedDoctor && state.selectedDoctor.availability) {
      // Filter availability with the specific clinic ID
      const testAvailability = state.selectedDoctor.availability.filter((a: any) => {
        const match = a.clinic === specificClinicId;
        //(`Test match for clinic '${a.clinic}' with '${specificClinicId}': ${match}`);
        return match;
      });
      
      //(`Found ${testAvailability.length} availabilities matching specific clinic ID`);
      //('Test availabilities:', testAvailability);
      
      // Get available dates from these availabilities
      let testDates: Date[] = [];
      testAvailability.forEach((a: any) => {
        if (a.day) {
          const weekdayDates = getNextDatesForWeekday(a.day, 4);
          testDates = testDates.concat(weekdayDates);
        }
      });
      
      // Remove duplicates and sort
      const dateStrSet = new Set(testDates.map(d => d.toDateString()));
      const uniqueDates = Array.from(dateStrSet).map(ds => new Date(ds));
      uniqueDates.sort((a, b) => a.getTime() - b.getTime());
      
      //(`This would result in ${uniqueDates.length} available dates`);
      //('Test dates:', uniqueDates.map(d => d.toDateString()));
      
      // Create a mock clinic object with the specific ID
      const mockClinic = {
        _id: specificClinicId,
        clinicName: "Madhuram Hospital",
        clinicAddress: {
          addressLine: "23, Karanpara,1st.floor,happy-home, Behind central bus station, Kanak road",
          city: "Rajkot",
          state: "Gujarat",
          country: "India",
          zipCode: "360005",
          location: { type: 'Point', coordinates: [0, 0] }
        }
      };
      
      //('Created mock clinic with specific ID:', mockClinic);
      
      // Test what happens if we manually override the selected clinic
      //('Testing with manual clinic override...');
      const manuallyFilteredAvailability = getSlotsForDate(selectedDate, mockClinic);
      //(`Manual override resulted in ${manuallyFilteredAvailability.length} time slots`);
    }
    //('--- END TEST ---\n');
  };
  
  // Function for the UI button to manually test with Madhuram Hospital
  const testWithMadhuramClinic = () => {
    const specificClinicId = "685d192933f7461084071b2f";
    const mockClinic = {
      _id: specificClinicId,
      clinicName: "Madhuram Hospital",
      clinicAddress: {
        addressLine: "23, Karanpara,1st.floor,happy-home, Behind central bus station, Kanak road",
        city: "Rajkot",
        state: "Gujarat",
        country: "India",
        zipCode: "360005",
        location: { type: 'Point', coordinates: [0, 0] }
      }
    };
    
    //('\n--- MANUALLY TESTING WITH MADHURAM HOSPITAL ---');
    //('Mock clinic:', mockClinic);
    
    // Get available dates for this clinic
    if (state.selectedDoctor && state.selectedDoctor.availability) {
      const testAvailability = state.selectedDoctor.availability.filter((a: any) => {
        return a.clinic === specificClinicId;
      });
      
      //(`Found ${testAvailability.length} availabilities matching Madhuram Hospital ID`);
      
      if (testAvailability.length > 0) {
        // Get slots for today with this clinic
        const today = new Date();
        const slots = getSlotsForDate(today, mockClinic);
        //(`Found ${slots.length} slots for today with Madhuram Hospital`);
        
        // If we have a selected date, try that too
        if (selectedDate) {
          const slotsForSelectedDate = getSlotsForDate(selectedDate, mockClinic);
          //(`Found ${slotsForSelectedDate.length} slots for selected date (${selectedDate.toDateString()}) with Madhuram Hospital`);
        }
        
        // Try to find the clinic in the doctor's clinic array
        // Find the selected clinic in the doctor's clinics and select it if present
        const clinicInDoctorArray = state.selectedDoctor?.clinic?.find(
          (c: any) => c._id === selectedClinicId
        );
        if (clinicInDoctorArray) {
          // Fixed: assign the selected clinic's ID
    selectedClinicId = clinicInDoctorArray._id;
        }
      }
    }
  };
  
  // Call logCompleteState on each render
  useEffect(() => {
    logCompleteState();
    
    // Run the test once when the component mounts and we have a doctor
    if (state.selectedDoctor) {
      testWithSpecificClinic();
    }
  }, [state.selectedDoctor]);
  
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
          <button 
            onClick={testWithMadhuramClinic} 
            style={{ 
              marginTop: '10px', 
              padding: '5px 10px', 
              backgroundColor: '#f0f0f0', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Test with Madhuram Hospital
          </button>
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
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
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
