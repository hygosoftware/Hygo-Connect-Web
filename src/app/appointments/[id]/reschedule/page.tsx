"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UniversalHeader, Typography } from "../../../../components/atoms";
import { useAuth } from "../../../../hooks/useAuth";
import { rescheduleAppointment } from "../../../../services/apiServices";
import axios from "axios";
import RescheduleCalendar from "../../../../components/organisms/RescheduleCalendar";

// Enhanced TypeScript interfaces matching React Native version
interface Doctor {
  _id: string;
  fullName: string;
  profileImage?: string;
  specializations: string[];
  degree: string;
  qualifications: any[];
  rating?: number;
  email?: string;
  phoneNumber?: string;
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
  clinicPhone?: string;
  clinicEmail?: string;
}

interface Appointment {
  _id: string;
  user: any;
  doctor: Doctor;
  clinic?: Clinic;
  mode: 'InPerson' | 'VideoCall' | 'working';
  videoCallLink?: string;
  appointmentDate: Date | string;
  timeSlot: {
    from: string;
    to: string;
  };
  purpose?: string;
  symptoms?: string[];
  notes?: string;
  diagnosis?: string;
  prescriptionId?: string;
  status: 'Scheduled' | 'On-Time' | 'Delayed' | 'Completed' | 'No Show' | 'Cancelled' | 'Ongoing';
  consultationFee: number;
  payment: {
    amount: number;
    isPaid: boolean;
    method?: 'UPI' | 'Card' | 'Cash' | 'Online';
    paymentIntentId?: string;
    scribeTransactionId?: string;
    status?: 'pending' | 'succeeded' | 'failed';
    paymentDate?: Date | string;
    transactionId?: string;
  };
  ratingAndFeedback?: {
    rating: number;
    review: string;
  };
  isFollowUp: boolean;
  createdBy?: string;
  actualStartTime?: Date | string;
  actualEndTime?: Date | string;
  durationInMinutes?: number;
  delayDurationInMinutes?: number;
  earlyStartDurationInMinutes?: number;
  isRescheduled?: boolean;
  rescheduledFrom?: Date | string;
  QRCode?: string;
  isDeleted?: boolean;
  familyId?: string;
  userName?: string;
  doctorName?: string;
}

const ReschedulePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user: _user } = useAuth();
  const appointmentId = String(params?.id || "");

  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);

  // Get API_BASE_URL from environment
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get accessToken from localStorage (web environment)
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

        const response = await axios.get(`${API_BASE_URL}/Appointment/${appointmentId}`, { headers });
        setAppointment(response.data.appointment);
      } catch (err: any) {
        console.error('Error fetching appointment details:', err);

        let errorMessage = 'Failed to load appointment details';
        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || err.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointmentDetails();
  }, [appointmentId, API_BASE_URL]);

  // Helper functions
  const formatDate = (dateString: Date | string | undefined) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleReschedule = async (selectedDate: Date, selectedSlot: any, selectedClinic: any) => {
    if (!appointment) {
      console.error('No appointment data available');
      return;
    }

    try {
      console.log('=== Starting Reschedule Process ===');
      console.log('Selected Date:', selectedDate);
      console.log('Selected Slot:', selectedSlot);
      console.log('Selected Clinic:', selectedClinic);
      
      setRescheduling(true);
      
      // Check if user is trying to reschedule to the same date, time, and clinic
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      const newDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      console.log('Formatted New Date:', newDate);
      
      const appointmentDateObj = new Date(appointment.appointmentDate);
      const currentYear = appointmentDateObj.getFullYear();
      const currentMonth = appointmentDateObj.getMonth() + 1;
      const currentDay = appointmentDateObj.getDate();
      const currentAppointmentDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      console.log('Current Appointment Date:', currentAppointmentDate);
      
      const isSameDate = newDate === currentAppointmentDate;
      const isSameTime = `${selectedSlot.from} - ${selectedSlot.to}` === `${appointment.timeSlot.from} - ${appointment.timeSlot.to}`;
      const isSameClinic = selectedClinic._id === appointment.clinic?._id;
      
      console.log('Comparison Results:', { isSameDate, isSameTime, isSameClinic });

      if (isSameDate && isSameTime && isSameClinic) {
        alert('Please select a different date, time, or clinic to reschedule');
        return;
      }

      // Get user ID for subscription management
      const userId = typeof window !== 'undefined' ? localStorage.getItem('_id') : null;
      console.log('Current User ID:', userId);
      
      const rescheduleData = {
        newClinic: selectedClinic._id,
        newTimeSlot: {
          from: selectedSlot.from,
          to: selectedSlot.to,
        },
        newDate: newDate,
        rescheduleReason: 'User requested reschedule',
        userId: userId || undefined,
      };
      
      console.log('Sending Reschedule Data:', JSON.stringify(rescheduleData, null, 2));

      const result = await rescheduleAppointment(appointmentId, rescheduleData);
      
      // Enhanced success message based on subscription quota status
      let successMessage = 'Your appointment has been rescheduled successfully!';
      if (result.subscriptionQuota?.quotaManaged) {
        const rescheduleCount = result.subscriptionQuota.rescheduleCount;
        const maxReschedules = result.subscriptionQuota.maxReschedules;
        successMessage += ` Reschedule count: ${rescheduleCount}/${maxReschedules}`;
      }
      
      alert(successMessage);
      router.push(`/appointments/${appointmentId}`);
    } catch (error: any) {
      console.error('Reschedule error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to reschedule appointment. Please try again.';
      if (error.message?.includes('Maximum reschedule limit')) {
        errorMessage = 'Maximum reschedule limit reached. Please cancel and book a new appointment.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white">
        <UniversalHeader
          title="Reschedule Appointment"
          subtitle={appointment?._id ? `#${appointment._id.slice(-6)}` : undefined}
          showBackButton
          onBackPress={() => router.back()}
          variant="gradient"
        />
      </div>

      <main className="px-4 py-4 pb-28">
        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <Typography variant="body1" className="text-gray-600">Loading appointment details...</Typography>
          </div>
        ) : error || !appointment ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center py-16">
            <Typography variant="h3" className="text-red-500 font-medium mb-2 mt-4">Error Loading Data</Typography>
            <Typography variant="body1" className="text-gray-600 mb-6 text-center">{error || 'Appointment not found'}</Typography>
            <button 
              className="bg-blue-800 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-colors"
              onClick={() => router.back()}
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Appointment Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <Typography variant="h3" className="font-bold mb-4 text-blue-800">Current Appointment</Typography>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    {appointment.doctor?.profileImage ? (
                      <img 
                        src={appointment.doctor.profileImage} 
                        alt={appointment.doctor.fullName || "Doctor"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {appointment.doctor?.fullName?.charAt(0) || "D"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Typography variant="h4" className="font-bold text-blue-800 mb-1">
                      {appointment.doctor?.fullName || "Dr. Unknown"}
                    </Typography>
                    <Typography variant="body2" className="text-blue-600">
                      {appointment.doctor?.specializations?.join(', ') || "Doctor"}
                    </Typography>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Typography variant="body2" className="text-blue-600 text-sm mb-1">Date</Typography>
                    <Typography variant="body1" className="text-blue-800 font-medium">{formatDate(appointment.appointmentDate)}</Typography>
                  </div>
                  
                  <div>
                    <Typography variant="body2" className="text-blue-600 text-sm mb-1">Time</Typography>
                    <Typography variant="body1" className="text-blue-800 font-medium">
                      {appointment.timeSlot.from} - {appointment.timeSlot.to}
                    </Typography>
                  </div>
                </div>

                {appointment.clinic && (
                  <div className="mt-4">
                    <Typography variant="body2" className="text-blue-600 text-sm mb-1">Clinic</Typography>
                    <Typography variant="body1" className="text-blue-800 font-medium">
                      {appointment.clinic.clinicName}
                    </Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Reschedule Calendar Component */}
            {appointment && (
              <RescheduleCalendar
                appointment={appointment}
                onReschedule={handleReschedule}
                isRescheduling={rescheduling}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReschedulePage;
