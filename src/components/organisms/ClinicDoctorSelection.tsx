'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Icon, Input, DoctorCardSkeleton } from '../atoms';
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

  const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => (
    <div
      onClick={() => handleDoctorSelect(doctor)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#0e3293]/30 transition-all duration-200 cursor-pointer group"
    >
      {/* Doctor Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={doctor.profileImage}
          alt={doctor.fullName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0e3293&color=fff&size=400`;
          }}
        />
        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
          doctor.isAvailableNow
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          {doctor.isAvailableNow ? 'Available' : 'Busy'}
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-3">
          <Typography variant="h6" className="text-gray-900 font-semibold mb-1 group-hover:text-[#0e3293] transition-colors">
            {doctor.fullName}
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-2">
            {doctor.specializations.join(', ')}
          </Typography>
        </div>

        {/* Rating and Experience */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Icon name="star" size="small" color="#fbbf24" className="mr-1" />
            <Typography variant="body2" className="text-gray-700 font-medium">
              {doctor.ratings.average}
            </Typography>
            <Typography variant="caption" className="text-gray-500 ml-1">
              ({doctor.ratings.count})
            </Typography>
          </div>
          <div className="flex items-center">
            <Icon name="clock" size="small" color="#6b7280" className="mr-1" />
            <Typography variant="body2" className="text-gray-600">
              {doctor.experience} years
            </Typography>
          </div>
        </div>

        {/* Qualifications */}
        <div className="flex flex-wrap gap-2 mb-4">
          {doctor.qualifications.slice(0, 2).map((qual, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {qual.degree}
            </span>
          ))}
        </div>

        {/* Consultation Fee */}
        <div className="mb-3">
          <Typography variant="body1" className="text-[#0e3293] font-bold">
            ₹{doctor.consultationFee}
          </Typography>
          <Typography variant="caption" className="text-gray-600">
            Consultation Fee
          </Typography>
        </div>

        {/* Clinic Info */}
        {doctor.clinic && doctor.clinic.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <Typography variant="caption" className="text-gray-500 block mb-2">
              Available at:
            </Typography>
            <div className="space-y-1">
              {doctor.clinic.slice(0, 1).map((clinic, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <Icon name="location" size="small" color="#6b7280" className="mr-1" />
                  <Typography variant="caption">
                    {clinic.clinicName}
                  </Typography>
                </div>
              ))}
              {doctor.clinic.length > 1 && (
                <Typography variant="caption" className="text-gray-500">
                  +{doctor.clinic.length - 1} more location{doctor.clinic.length > 2 ? 's' : ''}
                </Typography>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Typography variant="h4" className="text-gray-900 font-bold mb-2">
            Select a Doctor
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Available doctors at {state.selectedClinic?.clinicName}
          </Typography>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search doctors by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                leftIcon="search"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Icon name="filter" size="small" color="#6b7280" className="mr-2" />
              <Typography variant="body2" className="text-gray-700">
                Filters
              </Typography>
            </button>
          </div>

          {/* Specialty Filter */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Typography variant="body2" className="text-gray-700 font-medium mb-3">
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
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <Typography variant="body2" className="text-gray-600">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
          </Typography>
        </div>

        {/* Doctors Grid */}
        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <DoctorCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="search" size="large" color="#9ca3af" />
            </div>
            <Typography variant="h6" className="text-gray-900 mb-2">
              No doctors found
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Try adjusting your search or filters
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicDoctorSelection;
