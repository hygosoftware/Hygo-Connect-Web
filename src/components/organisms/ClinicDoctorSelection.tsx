'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Icon, Input, DoctorCardSkeleton } from '../atoms';
import { DoctorCard } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { Doctor } from '../../contexts/BookingContext';

const ClinicDoctorSelection: React.FC = () => {
  const { state, selectDoctor, setStep, setLoading } = useBooking();
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (state.selectedClinic) {
      loadDoctorsByClinic();
    }
  }, [state.selectedClinic]);

  const loadDoctorsByClinic = async () => {
    if (!state.selectedClinic) return;
    
    try {
      setLoading(true);
      const { clinicService } = await import('../../services/apiServices');
      const doctorsData = await clinicService.getdoctorbyclinicid(state.selectedClinic._id);
      setDoctors(doctorsData);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to load doctors',
        message: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setLoading(false);
    }
  };

  const specialties = useMemo(() => {
    const allSpecialties = new Set<string>();
    doctors.forEach(doctor => {
      doctor.specializations.forEach(spec => allSpecialties.add(spec));
    });
    return ['All', ...Array.from(allSpecialties)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = searchQuery === '' || 
        doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specializations.some(spec => 
          spec.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesSpecialty = selectedSpecialty === 'All' || 
        doctor.specializations.includes(selectedSpecialty);
      
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  const handleDoctorSelect = (doctor: Doctor) => {
    selectDoctor(doctor);
    setStep('date');
  };

  const handleGoBack = () => {
    setStep('clinic');
  };

  if (state.loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h2" className="text-gray-900">
            Select Doctor
          </Typography>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <DoctorCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon name="arrow-left" size="medium" className="text-gray-600" />
            </button>
            <div>
              <Typography variant="h2" className="text-gray-900">
                Select Doctor
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Available doctors at {state.selectedClinic?.clinicName}
              </Typography>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="filter" size="medium" className="text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery((e as any).target.value)}
            className="pl-10"
          />
          <Icon 
            name="search" 
            size="small" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Typography variant="body2" className="text-gray-700 mb-2 font-medium">
                Specialty
              </Typography>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedSpecialty === specialty
                        ? 'bg-[#0e3293] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 p-4 overflow-auto">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="user" size="large" className="text-gray-400 mx-auto mb-4" />
            <Typography variant="h3" className="text-gray-900 mb-2">
              No doctors found
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              {searchQuery || selectedSpecialty !== 'All' 
                ? 'Try adjusting your search or filters'
                : 'No doctors are available at this clinic'
              }
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="body1" className="text-gray-600">
                {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available
              </Typography>
            </div>
            
            <div className="grid gap-4">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  doctorId={doctor._id}
                  fullName={doctor.fullName}
                  rating={doctor.ratings?.average || 0}
                  imageSrc={doctor.profileImage || ''}
                  profileImage={doctor.profileImage}
                  qualifications={doctor.qualifications || []}
                  specializations={doctor.specializations || []}
                  onPress={() => handleDoctorSelect(doctor)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicDoctorSelection;
