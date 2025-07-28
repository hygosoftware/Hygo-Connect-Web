'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DoctorsListUI } from '../../components/organisms';

// Types
interface Qualification {
  _id: string;
  degree: string;
  institution: string;
  year: number;
}

interface Doctor {
  _id: string;
  fullName: string;
  specializations: string[];
  qualifications: Qualification[];
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

// Mock data for demonstration
const mockDoctors: Doctor[] = [
  {
    _id: '1',
    fullName: 'Dr. Sarah Johnson',
    specializations: ['Cardiology', 'Internal Medicine'],
    qualifications: [
      { _id: '1', degree: 'MD', institution: 'Harvard Medical School', year: 2010 },
      { _id: '2', degree: 'Fellowship', institution: 'Mayo Clinic', year: 2015 }
    ],
    ratings: { average: 4.8, count: 127 },
    profileImage: '/api/uploads/doctors/sarah-johnson.jpg',
    experience: 12,
    consultationFee: 500,
    isAvailableNow: true,
    department: 'Cardiology',
    clinic: [
      {
        _id: '1',
        clinicName: 'Heart Care Center',
        clinicAddress: {
          addressLine: '123 Medical Plaza',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        clinicType: 'Specialty',
        rating: 4.7,
        phone: '+91-9876543210',
        email: 'info@heartcare.com'
      }
    ]
  },
  {
    _id: '2',
    fullName: 'Dr. Rajesh Kumar',
    specializations: ['Orthopedics', 'Sports Medicine'],
    qualifications: [
      { _id: '3', degree: 'MBBS', institution: 'AIIMS Delhi', year: 2008 },
      { _id: '4', degree: 'MS Orthopedics', institution: 'PGIMER Chandigarh', year: 2012 }
    ],
    ratings: { average: 4.6, count: 89 },
    profileImage: '/api/uploads/doctors/rajesh-kumar.jpg',
    experience: 15,
    consultationFee: 400,
    isAvailableNow: false,
    department: 'Orthopedics',
    clinic: [
      {
        _id: '2',
        clinicName: 'Bone & Joint Clinic',
        clinicAddress: {
          addressLine: '456 Health Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        clinicType: 'Multi-specialty',
        rating: 4.5
      }
    ]
  },
  {
    _id: '3',
    fullName: 'Dr. Priya Sharma',
    specializations: ['Dermatology', 'Cosmetic Surgery'],
    qualifications: [
      { _id: '5', degree: 'MBBS', institution: 'Grant Medical College', year: 2012 },
      { _id: '6', degree: 'MD Dermatology', institution: 'KEM Hospital', year: 2016 }
    ],
    ratings: { average: 4.9, count: 156 },
    profileImage: '/api/uploads/doctors/priya-sharma.jpg',
    experience: 8,
    consultationFee: 350,
    isAvailableNow: true,
    department: 'Dermatology',
    clinic: [
      {
        _id: '3',
        clinicName: 'Skin Care Clinic',
        clinicAddress: {
          addressLine: '789 Beauty Lane',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        clinicType: 'Specialty',
        rating: 4.8
      }
    ]
  }
];

const DoctorsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [doctors] = useState<Doctor[]>(mockDoctors);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeClinicFilter, setActiveClinicFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
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
    router.push(`/doctors/${doctor._id}`);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Simulate retry
    setTimeout(() => setLoading(false), 1000);
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
