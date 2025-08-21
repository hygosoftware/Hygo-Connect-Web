'use client';
import './doctor-details-responsive.css';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doctorService, Doctor, DoctorClinic, doctorHelpers } from '../../../services/apiServices';
import { UniversalHeader, Typography, Icon } from '../../../components/atoms';

const DoctorDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  // State
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [clinics, setClinics] = useState<Record<string, DoctorClinic>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load doctor details
  const loadDoctorDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching doctor details for ID:', doctorId);
      const doctorData = await doctorService.getDoctorById(doctorId);
      console.log('✅ Doctor details fetched successfully:', doctorData);
      console.log('📋 Doctor data structure:', JSON.stringify(doctorData, null, 2));
      setDoctor(doctorData);

      // Fetch clinic details for each unique clinic in availability
      if (doctorData.availability && doctorData.availability.length > 0) {
        const uniqueClinicIds = [...new Set(doctorData.availability.map(avail => avail.clinic))];
        console.log('🏥 Fetching clinic details for IDs:', uniqueClinicIds);

        const clinicPromises = uniqueClinicIds.map(async (clinicId: string) => {
          try {
            const clinicData = await doctorService.getClinicById(clinicId);
            return { id: clinicId, data: clinicData };
          } catch (error) {
            console.error(`❌ Failed to fetch clinic ${clinicId}:`, error);
            return { id: clinicId, data: null };
          }
        });

        const clinicResults = await Promise.all(clinicPromises);
        const clinicsMap: Record<string, DoctorClinic> = {};

        clinicResults.forEach(result => {
          if (result.data) {
            clinicsMap[result.id] = result.data;
            console.log(`✅ Clinic ${result.id} fetched:`, result.data.clinicName);
          }
        });

        setClinics(clinicsMap);
        console.log('🏥 All clinics fetched:', clinicsMap);
      }
    } catch (err) {
      console.error('❌ Failed to load doctor details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  // Load doctor on component mount
  useEffect(() => {
    if (doctorId) {
      void loadDoctorDetails();
    }
  }, [doctorId, loadDoctorDetails]);

  const handleGoBack = () => {
    router.back();
  };

  const handleBookAppointment = () => {
    if (doctor) {
      router.push(`/booking?doctorId=${doctor._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UniversalHeader
          title="Doctor Details"
          subtitle="Loading doctor information..."
          variant="gradient"
          icon="user"
          showBackButton={true}
          onBackPress={handleGoBack}
        />
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1 doctor-info">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UniversalHeader
          title="Doctor Details"
          subtitle="Unable to load doctor information"
          variant="gradient"
          icon="user"
          showBackButton={true}
          onBackPress={handleGoBack}
        />
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Icon name="alert" size="large" color="red" className="mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-800 mb-2">
              {error || 'Doctor not found'}
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              Unable to load doctor details. Please try again.
            </Typography>
            <button
              onClick={() => { void loadDoctorDetails(); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-3"
            >
              Retry
            </button>
            <button
              onClick={handleGoBack}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UniversalHeader
        title={`Dr. ${doctor.fullName.replace(/^Dr\.\s*/i, '')}`}
        subtitle={doctor.specializations?.join(', ') || 'Medical Professional'}
        variant="gradient"
        icon="user"
        showBackButton={true}
        onBackPress={handleGoBack}
      />
      
      <div className="p-6 space-y-6">
        {/* Doctor Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start mb-6">
            {/* Doctor Image */}
            <div className="relative mr-4 flex-shrink-0 doctor-img">
              <img
                src={doctorHelpers.getFullImageUrl(doctor.profileImage)}
                alt={doctor.fullName}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/default-doctor.png';
                }}
              />
              {doctor.isAvailableNow && (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <Typography variant="h5" className="font-bold text-gray-800 mb-2">
                {doctor.fullName}
              </Typography>
              
              <div className="flex items-center mb-2">
                <Typography variant="body2" className="text-blue-600 font-semibold mr-2">
                  {doctorHelpers.formatQualifications(doctor.qualifications).join(', ')}
                </Typography>
              </div>

              <Typography variant="body2" className="text-gray-600 mb-2">
                {doctor.specializations.join(', ')}
              </Typography>

              <div className="flex items-center mb-2">
                <div className="flex items-center mr-4">
                  <Typography variant="body2" className="text-yellow-600 font-bold mr-1">
                    {doctor.ratings.average.toFixed(1)}
                  </Typography>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          star <= Math.round(doctor.ratings.average) ? "text-yellow-500" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <Typography variant="caption" className="text-gray-500 ml-1">
                    ({doctor.ratings.count} reviews)
                  </Typography>
                </div>
              </div>

              <Typography variant="body2" className="text-gray-600">
                {doctorHelpers.formatExperience(doctor.experience)}
              </Typography>
            </div>

            {/* Consultation Fee */}
            <div className="text-right">
              <div className="bg-gradient-to-r from-[#0E3293] to-blue-600 text-white rounded-xl p-3">
                <Typography variant="caption" className="opacity-90 block text-white">
                  Consultation Fee
                </Typography>
                <Typography variant="body1" className="font-bold text-white">
                  {doctorHelpers.formatConsultationFee(doctor.consultationFee)}
                </Typography>
              </div>
            </div>
          </div>

          {/* Status and Languages */}
          <div className="flex items-center justify-between mb-4 status-lang-row">
            <div className="flex items-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                doctor.isAvailableNow 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {doctor.isAvailableNow ? 'Available Now' : 'Not Available'}
              </div>
            </div>
            
            <Typography variant="body2" className="text-gray-600">
              Languages: {doctor.languagesSpoken.join(', ')}
            </Typography>
          </div>

          {/* Book Appointment Button */}
          <div className="flex justify-center book-btn-row">
            <button
              onClick={handleBookAppointment}
              className="px-6 py-2 bg-gradient-to-r from-[#0E3293] to-blue-600 text-white rounded-lg font-medium hover:from-[#0A2470] hover:to-blue-700 transition-all duration-300 text-sm"
            >
              Book Appointment
            </button>
          </div>
        </div>

        {/* Bio Section */}
        {doctor.bio && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Typography variant="h6" className="font-bold text-gray-800 mb-3">
              About {doctor.fullName.split(' ').pop()}
            </Typography>
            <Typography variant="body2" className="text-gray-700 leading-relaxed whitespace-pre-line">
              {doctor.bio}
            </Typography>
          </div>
        )}

        {/* Qualifications */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Typography variant="h6" className="font-bold text-gray-800 mb-4">
            Qualifications
          </Typography>
          <div className="space-y-3">
            {doctor.qualifications.map((qual) => (
              <div key={qual._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <div>
                  <Typography variant="body1" className="font-semibold text-gray-800">
                    {qual.degree}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {qual.institution} • {qual.year}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Schedule - Compact Clinic-wise */}
        {doctor.availability && doctor.availability.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              Availability Schedule
            </Typography>

            {/* Group availability by clinic */}
            {(() => {
              // Group availability by clinic ID
              const clinicGroups: {[key: string]: typeof doctor.availability} = {};
              doctor.availability.forEach(daySchedule => {
                if (!clinicGroups[daySchedule.clinic]) {
                  clinicGroups[daySchedule.clinic] = [];
                }
                clinicGroups[daySchedule.clinic].push(daySchedule);
              });

              return Object.entries(clinicGroups).map(([clinicId, schedules]) => {
                const clinic = clinics[clinicId];

                return (
                  <div key={clinicId} className="mb-4 last:mb-0">
                    {/* Compact Clinic Header */}
                    <div className="flex items-center justify-between mb-3 p-3 bg-white rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-white0 rounded-full mr-2"></div>
                        <div>
                          <Typography variant="body1" className="font-bold text-blue-800">
                            {clinic?.clinicName || `Clinic ${clinicId}`}
                          </Typography>
                          <Typography variant="caption" className="text-gray-600">
                            {clinic?.clinicAddress?.city}, {clinic?.clinicAddress?.state}
                          </Typography>
                        </div>
                      </div>
                      {clinic?.clinicType && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {clinic.clinicType}
                        </div>
                      )}
                    </div>

                    {/* Compact Schedule Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
                      {schedules.map((daySchedule) => {
                        const slots = daySchedule.slots;
                        if (slots.length === 0) return null;

                        // Get time range
                        const startTime = slots[0].startTime.replace(':00', '');
                        const endTime = slots[slots.length - 1].endTime.replace(':00', '');
                        const timeRange = `${startTime} - ${endTime}`;

                        // Count available slots
                        const totalSlots = slots.reduce((sum, slot) => sum + slot.appointmentLimit, 0);
                        const bookedSlots = slots.reduce((sum, slot) => sum + slot.bookedCount, 0);
                        const availableSlots = totalSlots - bookedSlots;

                        return (
                          <div key={daySchedule._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                availableSlots > 0 ? 'bg-green-500' : 'bg-blue-400'
                              }`}></div>
                              <div>
                                <Typography variant="body2" className="font-medium text-gray-800">
                                  {daySchedule.day}
                                </Typography>
                                <Typography variant="caption" className="text-gray-600">
                                  {timeRange}
                                </Typography>
                              </div>
                            </div>
                            <Typography variant="caption" className={`font-medium ${
                              availableSlots > 0 ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {availableSlots > 0 ? `${availableSlots} slots` : 'Booked'}
                            </Typography>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Home Service */}
        {doctor.HomeService && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Typography variant="h6" className="font-bold text-gray-800 mb-4">
              Home Service
            </Typography>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Typography variant="body1" className="font-semibold text-gray-800">
                  Home Consultation
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {doctor.HomeService.offered === 'Yes' ? 'Available' : 'Not Available'}
                </Typography>
              </div>
              {doctor.HomeService.offered === 'Yes' && doctor.HomeService.fee > 0 && (
                <div className="text-right consult-fee-box">
                  <Typography variant="body1" className="font-bold text-blue-600">
                    ₹{doctor.HomeService.fee}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    Additional Fee
                  </Typography>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDetailsPage;
