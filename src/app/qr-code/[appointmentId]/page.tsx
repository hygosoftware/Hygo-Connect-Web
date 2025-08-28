"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Typography, Icon } from "../../../components/atoms";
import { useAuth } from "../../../hooks/useAuth";
import axios from "axios";

interface Appointment {
  _id: string;
  QRCode?: string;
  doctor: {
    fullName: string;
  };
  appointmentDate: Date | string;
  timeSlot: {
    from: string;
    to: string;
  };
}

const QRCodePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const appointmentId = String(params?.appointmentId || "");

  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
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
    
    if (appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, API_BASE_URL]);

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

  const handleClose = () => {
    router.back();
  };

  const handleShare = () => {
    if (!appointment?.QRCode) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Check-in QR Code',
        text: `QR Code for appointment with Dr. ${appointment.doctor.fullName}`,
      });
    } else {
      alert('QR code ready for check-in!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred Background */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* QR Code Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl mx-4 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Typography variant="h3" className="font-bold text-gray-800">
              Check-in QR Code
            </Typography>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Icon name="x" size="small" color="#6b7280" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <Typography variant="body1" className="text-gray-600">Loading QR code...</Typography>
            </div>
          ) : error || !appointment ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon name="alert" size="large" color="#ef4444" />
              <Typography variant="h4" className="text-red-500 font-medium mb-2 mt-4">Error Loading QR Code</Typography>
              <Typography variant="body2" className="text-gray-600 text-center">{error || 'QR code not found'}</Typography>
            </div>
          ) : !appointment.QRCode ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon name="qr-code" size="large" color="#6b7280" />
              <Typography variant="h4" className="text-gray-500 font-medium mb-2 mt-4">No QR Code Available</Typography>
              <Typography variant="body2" className="text-gray-600 text-center">QR code is not available for this appointment</Typography>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* QR Code Display */}
              <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6">
                {appointment.QRCode.startsWith('data:image') ? (
                  <img 
                    src={appointment.QRCode} 
                    alt="Check-in QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Icon name="qr-code" size="large" color="#0E3293" />
                      <Typography variant="body2" className="text-gray-500 mt-2">
                        QR: {appointment.QRCode.slice(0, 20)}...
                      </Typography>
                    </div>
                  </div>
                )}
              </div>

              {/* Appointment Info */}
              <div className="text-center mb-6">
                <Typography variant="h4" className="font-semibold text-gray-800 mb-2">
                   {appointment.doctor.fullName}
                </Typography>
                <Typography variant="body1" className="text-gray-600 mb-1">
                  {formatDate(appointment.appointmentDate)}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {appointment.timeSlot.from} - {appointment.timeSlot.to}
                </Typography>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 w-full">
                <div className="flex items-start">
                  <Icon name="info" size="small" color="#2563eb" />
                  <div className="ml-3 flex-1">
                    <Typography variant="body2" className="text-blue-800 font-medium mb-1">
                      How to use this QR code:
                    </Typography>
                    <Typography variant="body2" className="text-blue-700 text-sm leading-relaxed">
                      Show this QR code to the reception desk when you arrive for your appointment. They will scan it to check you in.
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon name="share" size="small" color="#374151" />
                  <span className="ml-2">Share</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                  style={{ backgroundColor: '#0E3293' }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;