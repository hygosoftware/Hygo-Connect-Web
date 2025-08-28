"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UniversalHeader, Typography, Icon, IconName } from "../../../components/atoms";
import { useAuth } from "../../../hooks/useAuth";
import { appointmentService } from "../../../services/apiServices";
import axios from "axios";
import { useToast } from "../../../contexts/ToastContext";

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
}

interface Appointment {
  _id: string;
  user: any;
  doctor: Doctor;
  clinic?: {
    _id?: string;
    clinicName?: string;
    clinicAddress?: {
      addressLine?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    clinicPhone?: string;
    clinicEmail?: string;
  };
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

const AppointmentDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const appointmentId = String(params?.id || "");

  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [showQR, setShowQR] = useState(false);

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

  const getFormattedQualification = (doctor: Doctor) => {
    if (!doctor.qualifications || doctor.qualifications.length === 0) {
      return doctor.degree || 'Not specified';
    }
    
    if (typeof doctor.qualifications[0] === 'string') {
      return doctor.qualifications[0];
    }
    
    if (typeof doctor.qualifications[0] === 'object' && doctor.qualifications[0] !== null) {
      const qualification = doctor.qualifications[0];
      return qualification.degree || qualification.institution || doctor.degree || 'Not specified';
    }
    
    return doctor.degree || 'Not specified';
  };

  const getStatusStyle = (status: string): { bgColor: string; textColor: string; icon: IconName } => {
    switch (status) {
      case 'Scheduled':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          icon: 'calendar'
        };
      case 'On-Time':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: 'clock'
        };
      case 'Delayed':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: 'clock'
        };
      case 'Completed':
        return {
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-800',
          icon: 'check-circle'
        };
      case 'Cancelled':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: 'close'
        };
      case 'No Show':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: 'user'
        };
      case 'Ongoing':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          icon: 'clock'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: 'info'
        };
    }
  };

  const handleJoinVideoCall = () => {
    if (appointment?.videoCallLink) {
      window.open(appointment.videoCallLink, '_blank');
    } else {
      alert('Video call link is not available.');
    }
  };

  const handleReschedule = () => {
    if (appointment) {
      router.push(`/booking?appointmentId=${appointment._id}`);
    }
  };

  const handleShare = () => {
    if (!appointment) return;
    
    const doctorName = appointment.doctor.fullName;
    const date = formatDate(appointment.appointmentDate);
    const time = `${appointment.timeSlot.from} - ${appointment.timeSlot.to}`;
    const mode = appointment.mode;
    
    const message = `My appointment with Dr. ${doctorName}\nDate: ${date}\nTime: ${time}\nMode: ${mode}${appointment.videoCallLink ? `\nVideo Link: ${appointment.videoCallLink}` : ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Appointment Details',
        text: message,
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Appointment details copied to clipboard!');
    }
  };

  // Notification function (fallback if toast context not available)
  const pushNotification = (title: string, message: string) => {
    // Try to use toast context if available
    try {
      // If toast context is available, use it
      console.log(`${title}: ${message}`);
      // For now, we'll use a simple alert as fallback
      // You can replace this with your preferred notification system
    } catch (error) {
      console.log(`${title}: ${message}`);
    }
  };

  // Cancel appointment API function
  const cancelAppointmentAPI = async (appointmentId: string) => {
    try {
      console.log('Cancelling appointment:', appointmentId);
      
      // Get access token
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      
      // Use the correct endpoint as per API documentation
      const res = await axios.post(`${API_BASE_URL}/Appointment/cancel/${appointmentId}`, {}, { headers });
      
      console.log('Cancellation successful:', res.data);
      pushNotification("Appointment Cancelled", "Your appointment has been cancelled successfully.");
      
      return res.data;
    } catch (error: any) {
      console.error("Cancel error:", error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        throw new Error('Appointment not found.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
  };

  const cancelAppointment = async () => {
    if (!appointment?._id) return;
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      setActionBusy(true);
      
      // Use the new cancel appointment API
      await cancelAppointmentAPI(appointment._id);
      
      // Reload appointment details to reflect the updated status
      const fetchAppointmentDetails = async () => {
        try {
          setIsLoading(true);
          setError(null);
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
      
      await fetchAppointmentDetails();
      
    } catch (e: any) {
      console.error('Cancellation failed:', e);
      alert(e?.message || "Failed to cancel appointment");
    } finally {
      setActionBusy(false);
    }
  };

  const rescheduleAppointment = () => {
    if (!appointment?._id) return;
    // Navigate to booking page with query to prefill context
    router.push(`/booking?appointmentId=${appointment._id}`);
  };

  // Computed values
  const statusStyle = appointment ? getStatusStyle(appointment.status) : { bgColor: 'bg-gray-100', textColor: 'text-gray-800', icon: 'info' as IconName };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const appointmentDateObj = appointment ? new Date(appointment.appointmentDate) : new Date();
  appointmentDateObj.setHours(0, 0, 0, 0);
  const isPastAppointment = appointmentDateObj < today;
  
  const canReschedule = appointment && !isPastAppointment && (
    String(appointment.status).toLowerCase() === 'scheduled' || 
    String(appointment.status).toLowerCase() === 'pending payment'
  ) && appointmentDateObj > today;
  
  const canJoinVideoCall = appointment && appointment.mode === 'VideoCall' && 
                           (appointment.status === 'Scheduled' || appointment.status === 'On-Time' || appointment.status === 'Ongoing');

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white">
        <UniversalHeader
          title="Appointment Details"
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
            <Icon name="alert" size="large" color="#ef4444" />
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
            {/* Status Bar */}
            <div className={`${statusStyle.bgColor} p-4 rounded-xl flex items-center justify-between`}>
              <div className="flex items-center">
                <Icon name={statusStyle.icon} size="small" color={statusStyle.textColor.replace('text-', '')} />
                <Typography variant="body1" className={`${statusStyle.textColor} font-medium ml-2`}>
                  {appointment.status}
                </Typography>
              </div>
              {appointment.status === 'Delayed' && appointment.durationInMinutes && (
                <Typography variant="body2" className={statusStyle.textColor}>
                  {appointment.durationInMinutes} min delay
                </Typography>
              )}
            </div>

            {/* QR Code Section */}
            {appointment.QRCode && (
              <div className="flex flex-col items-center">
                {showQR ? (
                  <div className="flex flex-col items-center mb-4">
                    {appointment.QRCode.startsWith('data:image') ? (
                      <img
                        src={appointment.QRCode}
                        alt="Appointment QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-white p-4 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                        <Typography variant="body2" className="text-gray-500 text-center">QR Code: {appointment.QRCode}</Typography>
                      </div>
                    )}
                    <button 
                      className="mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      onClick={() => setShowQR(false)}
                    >
                      Hide QR Code
                    </button>
                  </div>
                ) : (
                  <button 
                    className="flex items-center py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors"
                    onClick={() => setShowQR(true)}
                  >
                    <Icon name="qr-code" size="small" color="#1e40af" />
                    <Typography variant="body1" className="text-blue-800 font-medium ml-2">Show Check-in QR Code</Typography>
                  </button>
                )}
              </div>
            )}

            {/* Doctor Info */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <Typography variant="h3" className="font-bold mb-4 text-gray-800">Doctor</Typography>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  {appointment.doctor?.profileImage ? (
                    <img 
                      src={appointment.doctor.profileImage} 
                      alt={appointment.doctor.fullName || "Doctor"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Icon name="doctor" size="large" color="#0E3293" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Typography variant="h4" className="font-bold text-gray-800 mb-1">
                    {appointment.doctor?.fullName || "Dr. Unknown"}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    {appointment.doctor?.specializations?.join(', ') || "Doctor"}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 text-sm">
                    {getFormattedQualification(appointment.doctor)}
                  </Typography>
                  {appointment.doctor?.rating && (
                    <div className="flex items-center mt-2">
                      <Icon name="star" size="small" color="#fbbf24" />
                      <Typography variant="body2" className="text-gray-700 ml-1">{appointment.doctor.rating}</Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <Typography variant="h3" className="font-bold mb-4 text-gray-800">Appointment Details</Typography>
              
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" className="text-gray-500 text-sm mb-1">Date</Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">{formatDate(appointment.appointmentDate)}</Typography>
                </div>
                
                <div>
                  <Typography variant="body2" className="text-gray-500 text-sm mb-1">Time</Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">
                    {appointment.timeSlot.from} - {appointment.timeSlot.to}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body2" className="text-gray-500 text-sm mb-1">Mode</Typography>
                  <div className="flex items-center mt-1">
                    {appointment.mode === 'VideoCall' ? (
                      <>
                        <Icon name="video" size="small" color="#2563eb" />
                        <Typography variant="body1" className="text-gray-800 font-medium ml-2">Video Consultation</Typography>
                      </>
                    ) : (
                      <>
                        <Icon name="user" size="small" color="#7c3aed" />
                        <Typography variant="body1" className="text-gray-800 font-medium ml-2">In-Person Visit</Typography>
                      </>
                    )}
                  </div>
                </div>

                {appointment.durationInMinutes && (
                  <div>
                    <Typography variant="body2" className="text-gray-500 text-sm mb-1">Duration</Typography>
                    <Typography variant="body1" className="text-gray-800 font-medium">{appointment.durationInMinutes} minutes</Typography>
                  </div>
                )}
                
                <div>
                  <Typography variant="body2" className="text-gray-500 text-sm mb-1">Follow-up</Typography>
                  <Typography variant="body1" className="text-gray-800 font-medium">{appointment.isFollowUp ? 'Yes' : 'No'}</Typography>
                </div>

                {/* Clinic Information */}
                {appointment.clinic && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Typography variant="body2" className="text-gray-500 text-sm mb-2">Clinic Information</Typography>
                    <div className="flex items-start">
                      <Icon name="hospital" size="small" color="#2563eb" />
                      <div className="ml-2 flex-1">
                        <Typography variant="body1" className="text-blue-800 font-semibold mb-1">
                          {appointment.clinic.clinicName || 'Clinic'}
                        </Typography>
                        {appointment.clinic.clinicAddress && (
                          <div className="mb-2">
                            <Typography variant="body2" className="text-blue-700">
                              {appointment.clinic.clinicAddress.addressLine}
                            </Typography>
                            <Typography variant="body2" className="text-blue-600">
                              {appointment.clinic.clinicAddress.city}
                              {appointment.clinic.clinicAddress.state && `, ${appointment.clinic.clinicAddress.state}`}
                              {appointment.clinic.clinicAddress.zipCode && ` - ${appointment.clinic.clinicAddress.zipCode}`}
                            </Typography>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4">
                          {appointment.clinic.clinicPhone && (
                            <div className="flex items-center">
                              <Icon name="phone" size="small" color="#2563eb" />
                              <Typography variant="body2" className="text-blue-700 ml-1 text-xs">
                                {appointment.clinic.clinicPhone}
                              </Typography>
                            </div>
                          )}
                          {appointment.clinic.clinicEmail && (
                            <div className="flex items-center">
                              <Icon name="email" size="small" color="#2563eb" />
                              <Typography variant="body2" className="text-blue-700 ml-1 text-xs">
                                {appointment.clinic.clinicEmail}
                              </Typography>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purpose and Symptoms */}
                {appointment.purpose && (
                  <div>
                    <Typography variant="body2" className="text-gray-500 text-sm mb-1">Purpose</Typography>
                    <Typography variant="body1" className="text-gray-800 font-medium">{appointment.purpose}</Typography>
                  </div>
                )}
                
                {appointment.symptoms && appointment.symptoms.length > 0 && (
                  <div>
                    <Typography variant="body2" className="text-gray-500 text-sm mb-1">Symptoms</Typography>
                    <Typography variant="body1" className="text-gray-800 font-medium">{appointment.symptoms.join(', ')}</Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <Typography variant="h3" className="font-bold mb-4 text-gray-800">Payment Information</Typography>
              
              <div className="space-y-4">
                <div>
                  <Typography variant="body2" className="text-gray-500 text-sm mb-1">Consultation Fee</Typography>
                  <Typography variant="h4" className="text-gray-800 font-medium">₹{appointment.consultationFee}</Typography>
                </div>
                
                <div>
                  <Typography variant="body2" className="text-gray-500 text-sm mb-1">Payment Status</Typography>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      appointment.payment.isPaid ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <Typography variant="body1" className={`font-medium ${
                      appointment.payment.isPaid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {appointment.payment.isPaid ? 'Paid' : 'Pending'}
                    </Typography>
                  </div>
                </div>
                
                {appointment.payment.method && (
                  <div>
                    <Typography variant="body2" className="text-gray-500 text-sm mb-1">Payment Method</Typography>
                    <Typography variant="body1" className="text-gray-800 font-medium">{appointment.payment.method}</Typography>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Notes */}
            {(appointment.diagnosis || appointment.notes) && (
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <Typography variant="h3" className="font-bold mb-4 text-gray-800">Medical Notes</Typography>
                
                <div className="space-y-4">
                  {appointment.diagnosis && (
                    <div>
                      <Typography variant="body2" className="text-gray-500 text-sm mb-1">Diagnosis</Typography>
                      <Typography variant="body1" className="text-gray-800 font-medium">{appointment.diagnosis}</Typography>
                    </div>
                  )}
                  
                  {appointment.notes && (
                    <div>
                      <Typography variant="body2" className="text-gray-500 text-sm mb-1">Doctor's Notes</Typography>
                      <Typography variant="body1" className="text-gray-700">{appointment.notes}</Typography>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {canJoinVideoCall && (
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
                  onClick={handleJoinVideoCall}
                >
                  <Icon name="video" size="small" color="#ffffff" />
                  <span className="ml-2">Join Video Call</span>
                </button>
              )}
              
              {canReschedule && (
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
                    onClick={handleReschedule}
                  >
                    <Icon name="calendar" size="small" color="#ffffff" />
                    <span className="ml-2">Reschedule</span>
                  </button>
                  
                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
                    onClick={cancelAppointment}
                    disabled={actionBusy}
                  >
                    <Icon name="x" size="small" color="#ffffff" />
                    <span className="ml-2">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AppointmentDetailPage;
