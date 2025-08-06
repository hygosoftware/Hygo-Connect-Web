'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DoctorsListUI } from '../../components/organisms';
import { doctorService, Doctor as ApiDoctor, doctorHelpers } from '../../services/apiServices';

// Types - Use the API types but create a compatible interface for the UI
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
}

// Helper function to convert API doctor to UI doctor format
const convertApiDoctorToUiDoctor = (apiDoctor: ApiDoctor): Doctor => {
  return {
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
  };
};



const DoctorsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const loadDoctors = async () => {
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
  };

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Get location from URL params
  const locationFromParams = useMemo(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    if (lat && lng) {
      return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
    }
    return null;
  }, [searchParams]);

  const currentAddressFromParams = searchParams.get('address') || '';

  // Generate filter options
  const specializations = useMemo(() => {
    const specs = new Set<string>();
    doctors.forEach(doctor => {
      doctor.specializations.forEach(spec => specs.add(spec));
    });
    return ['All', ...Array.from(specs)];
  }, [doctors]);

  const clinics = useMemo(() => {
    const clinicNames = new Set<string>();
    doctors.forEach(doctor => {
      doctor.clinic?.forEach(clinic => clinicNames.add(clinic.clinicName));
    });
    return ['All', ...Array.from(clinicNames)];
  }, [doctors]);

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doctor.clinic?.some(clinic => clinic.clinicName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Specialization filter
      const matchesSpecialization = activeFilter === 'All' || 
        doctor.specializations.includes(activeFilter);

      // Clinic filter
      const matchesClinic = activeClinicFilter === 'All' || 
        doctor.clinic?.some(clinic => clinic.clinicName === activeClinicFilter);

      return matchesSearch && matchesSpecialization && matchesClinic;
    });
  }, [doctors, searchQuery, activeFilter, activeClinicFilter]);

  // Handlers
  const handleGoBack = () => {
    router.back();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const apiDoctors = await doctorService.getAllDoctors();
      const uiDoctors = apiDoctors.map(convertApiDoctorToUiDoctor);
      setDoctors(uiDoctors);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh doctors:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh doctors');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterPress = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleClinicFilterPress = (filter: string) => {
    setActiveClinicFilter(filter);
  };

  const handleClearFilters = () => {
    setActiveFilter('All');
    setActiveClinicFilter('All');
    setSearchQuery('');
  };

  const handleDoctorPress = (doctor: Doctor) => {
    console.log('👨‍⚕️ Doctors List: Doctor card clicked:', doctor);
    console.log('🔗 Navigating to doctor ID:', doctor._id);
    router.push(`/doctors/${doctor._id}`);
  };

  const handleRetry = () => {
    setLoading(true);
    loadDoctors();
  };

  const handleErrorDetails = () => {
    alert('Error details: Unable to connect to server');
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
      onRefresh={handleRefresh}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
      onToggleFilters={handleToggleFilters}
      onFilterPress={handleFilterPress}
      onClinicFilterPress={handleClinicFilterPress}
      onClearFilters={handleClearFilters}
      onDoctorPress={handleDoctorPress}
      onRetry={handleRetry}
      onErrorDetails={handleErrorDetails}
    />
  );
};

export default DoctorsPage;
