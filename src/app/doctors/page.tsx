'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DoctorsListUI } from '../../components/organisms';
import { doctorService, Doctor as ApiDoctor, doctorHelpers } from '../../services/apiServices';

// Types
interface Doctor {
  _id: string;
  fullName: string;
  specializations: string[];
  qualifications: Array<{
    _id: string;
    degree: string;
    institution: string;
    year: number;
  }>;
  ratings: {
    average: number;
    count: number;
  };
  profileImage: string;
  experience: number;
  consultationFee: number;
  isAvailableNow: boolean;
  department?: string;
  clinic?: Array<{
    _id: string;
    clinicName: string;
    clinicAddress?: {
      addressLine: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      location?: {
        type: string;
        coordinates: number[];
      };
    };
    clinicType?: string;
    rating?: number;
    phone?: string;
    email?: string;
    description?: string;
  }>;
  availability: Array<{
    clinic: string;
    day: string;
    slots: Array<{
      startTime: string;
      endTime: string;
      appointmentLimit: number;
      bookedCount: number;
      _id: string;
    }>;
    _id: string;
  }>;
}

// Helper to convert API -> UI
const convertApiDoctorToUiDoctor = (apiDoctor: ApiDoctor): Doctor => ({
  _id: apiDoctor._id,
  fullName: apiDoctor.fullName,
  specializations: apiDoctor.specializations,
  qualifications: apiDoctor.qualifications.map(qual => ({
    _id: qual._id,
    degree: qual.degree,
    institution: qual.institution,
    year: qual.year
  })),
  ratings: apiDoctor.ratings,
  profileImage: doctorHelpers.getFullImageUrl(apiDoctor.profileImage),
  experience: apiDoctor.experience,
  consultationFee: apiDoctor.consultationFee,
  isAvailableNow: apiDoctor.isAvailableNow,
  availability: (apiDoctor.availability || []).map(av => ({
    clinic: av.clinic,
    day: av.day,
    slots: (av.slots || []).map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      appointmentLimit: slot.appointmentLimit,
      bookedCount: slot.bookedCount,
      _id: slot._id
    })),
    _id: av._id
  })),
  department: apiDoctor.department?.[0]?.departmentName,
  clinic: apiDoctor.clinic?.map(clinic => ({
    _id: clinic._id,
    clinicName: clinic.clinicName,
    clinicAddress: clinic.clinicAddress ? {
      addressLine: clinic.clinicAddress.addressLine,
      city: clinic.clinicAddress.city,
      state: clinic.clinicAddress.state,
      zipCode: clinic.clinicAddress.zipCode,
      country: clinic.clinicAddress.country,
      location: clinic.clinicAddress.location
    } : undefined
  }))
});

// -----------------------------------------
// Inner component that uses useSearchParams
// -----------------------------------------
const DoctorsPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeClinicFilter, setActiveClinicFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Load doctors from API
  const loadDoctors = useCallback(async () => {
    try {
      setError(null);
      const apiDoctors = await doctorService.getAllDoctors();
      const uiDoctors = apiDoctors.map(convertApiDoctorToUiDoctor);
      setDoctors(uiDoctors);
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  // Get location from URL params
  const { locationFromParams, currentAddressFromParams } = useMemo(() => {
    if (!searchParams) {
      return { locationFromParams: null, currentAddressFromParams: '' };
    }
    
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const address = searchParams.get('address') || '';
    
    const location = (lat && lng) 
      ? { latitude: parseFloat(lat), longitude: parseFloat(lng) } 
      : null;
      
    return {
      locationFromParams: location,
      currentAddressFromParams: address
    };
  }, [searchParams]);

  // Filter options
  const specializations = useMemo(() => {
    const specs = new Set<string>();
    doctors.forEach(d => d.specializations.forEach(spec => specs.add(spec)));
    return ['All', ...Array.from(specs)];
  }, [doctors]);

  const clinics = useMemo(() => {
    const names = new Set<string>();
    doctors.forEach(d => d.clinic?.forEach(c => names.add(c.clinicName)));
    return ['All', ...Array.from(names)];
  }, [doctors]);

  // Apply filters
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchesSearch = searchQuery === '' ||
        d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
        d.clinic?.some(c => c.clinicName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSpecialization = activeFilter === 'All' || d.specializations.includes(activeFilter);
      const matchesClinic = activeClinicFilter === 'All' || d.clinic?.some(c => c.clinicName === activeClinicFilter);

      return matchesSearch && matchesSpecialization && matchesClinic;
    });
  }, [doctors, searchQuery, activeFilter, activeClinicFilter]);

  // Handlers
  const handleGoBack = () => router.back();
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const apiDoctors = await doctorService.getAllDoctors();
      setDoctors(apiDoctors.map(convertApiDoctorToUiDoctor));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh doctors');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <DoctorsListUI
      doctors={doctors}
      filteredDoctors={filteredDoctors}
      loading={loading}
      refreshing={refreshing}
      error={error}
      searchQuery={searchQuery}
      activeFilter={activeFilter}
      activeClinicFilter={activeClinicFilter}
      showFilters={showFilters}
      specializations={specializations}
      clinics={clinics}
      locationFromParams={locationFromParams}
      currentAddressFromParams={currentAddressFromParams}
      onGoBack={handleGoBack}
      onRefresh={() => { void handleRefresh(); }}
      onSearchChange={setSearchQuery}
      onClearSearch={() => setSearchQuery('')}
      onToggleFilters={() => setShowFilters(!showFilters)}
      onFilterPress={setActiveFilter}
      onClinicFilterPress={setActiveClinicFilter}
      onClearFilters={() => {
        setActiveFilter('All');
        setActiveClinicFilter('All');
        setSearchQuery('');
      }}
      onDoctorPress={(doctor) => router.push(`/doctors/${doctor._id}`)}
      onRetry={() => { setLoading(true); void loadDoctors(); }}
      onErrorDetails={() => alert('Error details: Unable to connect to server')}
    />
  );
};

// -----------------------------------------
// Page wrapper with Suspense
// -----------------------------------------
const DoctorsPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading doctors page...</div>}>
      <DoctorsPageContent />
    </Suspense>
  );
};

export default DoctorsPage;
