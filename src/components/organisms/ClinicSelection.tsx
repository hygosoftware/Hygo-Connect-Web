'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Typography, Icon, Input, ClinicCardSkeleton } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { Clinic } from '../../types/Clinic';
import { Doctor, DoctorClinic } from '../../types/Doctor';

// Helper: map API DoctorClinic shape to UI Clinic shape with safe defaults
const mapDoctorClinicToClinic = (c: DoctorClinic): Clinic => {
  const images: string[] = [];
  if (typeof c.clinicImage === 'string' && c.clinicImage) {
    images.push(c.clinicImage);
  }

  const addressLine = c.clinicAddress?.addressLine ?? '';
  const city = c.clinicAddress?.city ?? '';
  const state = c.clinicAddress?.state ?? '';
  const zipCode = c.clinicAddress?.zipCode ?? '';
  const country = c.clinicAddress?.country ?? '';
  const locationType = c.clinicAddress?.location?.type ?? 'Point';
  const locationCoordinates = Array.isArray(c.clinicAddress?.location?.coordinates)
    ? c.clinicAddress!.location!.coordinates
    : [0, 0];

  // Robust id/name extraction to handle variations like _id/clinicId/id and clinicName/name
  const id = (c as any)?._id || (c as any)?.clinicId || (c as any)?.id || '';
  const clinicName = (c as any)?.clinicName || (c as any)?.name || '';

  return {
    _id: id,
    clinicName,
    clinicAddress: {
      addressLine,
      city,
      state,
      zipCode,
      country,
      location: {
        type: locationType,
        coordinates: locationCoordinates,
      },
    },
    clinicType: c.clinicType ?? 'General',
    rating: 0,
    phone: c.clinicPhone ?? '',
    email: c.clinicEmail ?? '',
    description: c.clinicDescription ?? '',
    services: [],
    images,
    doctors: [],
  };
};

const ClinicSelection: React.FC = () => {
  const { state, selectClinic, setStep, setLoading } = useBooking();
  const { showToast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const loadClinics = useCallback(async () => {
    try {
      setLoading(true);
      let clinicsData: DoctorClinic[] = [];
      
      if (state.bookingFlow === 'doctor' && state.selectedDoctor) {
        // If coming from doctor selection, show only clinics where this doctor is available
        const { clinicService } = await import('../../services/apiServices');
        const result = await clinicService.getClinicsByDoctor(state.selectedDoctor._id);
        clinicsData = Array.isArray(result) ? (result as DoctorClinic[]) : [];
      } else {
        // If booking by clinic, show all clinics
        // Replace mockAPI.getClinics with clinicService.getAllClinics
        const { clinicService } = await import('../../services/apiServices');
        const result = await clinicService.getAllClinics();
        clinicsData = Array.isArray(result) ? result : [];
      }
      
      // Map DoctorClinic -> Clinic with safe fallbacks
      const mappedClinics: Clinic[] = (clinicsData || []).map((c) => mapDoctorClinicToClinic(c));
      setClinics(mappedClinics);

    } catch {
      showToast({
        type: 'error',
        title: 'Failed to load clinics',
        message: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setLoading(false);
    }
  }, [state.bookingFlow, state.selectedDoctor, setLoading, showToast]);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  const clinicTypes = useMemo(() => {
    const types = new Set<string>();
    clinics.forEach(clinic => types.add(clinic.clinicType));
    return ['All', ...Array.from(types)];
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    return clinics.filter(clinic => {
      const matchesSearch = searchQuery === '' || 
        clinic.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (clinic.clinicAddress?.city && clinic.clinicAddress.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        clinic.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesType = selectedType === 'All' || clinic.clinicType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [clinics, searchQuery, selectedType]);

  const handleClinicSelect = async (clinic: Clinic) => {
    selectClinic(clinic);
    
    if (state.bookingFlow === 'clinic') {
      // In clinic flow, fetch doctors for the selected clinic
      try {
        setLoading(true);
        const { clinicService } = await import('../../services/apiServices');
        const result = await clinicService.getdoctorbyclinicid(clinic._id);
        
        // Type guard: ensure result is Doctor[]
        let clinicDoctors: Doctor[] = [];
        if (Array.isArray(result)) {
          clinicDoctors = result as Doctor[];
        }
        
        // Update the clinic object with the fetched doctors
        const updatedClinic = {
          ...clinic,
          doctors: clinicDoctors
        };
        
        selectClinic(updatedClinic);
        setStep('clinic-doctor');
        
        showToast({
          type: 'success',
          title: 'Clinic selected',
          message: `Found ${clinicDoctors?.length || 0} doctors available at ${clinic.clinicName}`
        });
      } catch (error) {
        console.error('Error fetching doctors for clinic:', error);
        showToast({
          type: 'error',
          title: 'Failed to load doctors',
          message: 'Unable to fetch doctors for this clinic. Please try again.'
        });
        // Still proceed to clinic-doctor step even if API fails
        setStep('clinic-doctor');
      } finally {
        setLoading(false);
      }
    } else {
      // In doctor flow, go to date selection after selecting clinic
      setStep('date');
    }
  };

  const ClinicCard: React.FC<{ clinic: Clinic }> = ({ clinic }) => (
    <div
      onClick={() => handleClinicSelect(clinic)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#0e3293]/30 transition-all duration-200 cursor-pointer group"
    >
      {/* Clinic Image */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <img
          src={ 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={clinic.clinicName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Typography variant="h6" className="text-gray-900 font-semibold mb-1 group-hover:text-[#0e3293] transition-colors">
              {clinic.clinicName}
            </Typography>
            <div className="flex items-center text-gray-600 mb-2">
              <Icon name="location" size="small" color="#6b7280" className="mr-2" />
              <Typography variant="body2">
                {(clinic.clinicAddress?.city || 'Unknown City')}, {(clinic.clinicAddress?.state || 'Unknown State')}
              </Typography>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center bg-green-50 px-2 py-1 rounded-full">
            <Icon name="star" size="small" color="#10b981" className="mr-1" />
            <Typography variant="body2" className="text-green-700 font-medium">
              {clinic.rating}
            </Typography>
          </div>
        </div>

        {/* Clinic Type */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0e3293]/10 text-[#0e3293]">
            {clinic.clinicType}
          </span>
        </div>

        {/* Description */}
        <Typography variant="body2" className="text-gray-600 mb-4 line-clamp-2">
          {clinic.description}
        </Typography>

        {/* Services */}
        <div className="mb-4">
          <Typography variant="caption" className="text-gray-500 block mb-2">
            Services Available:
          </Typography>
          <div className="flex flex-wrap gap-1">
            {(clinic.services ?? []).slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {service}
              </span>
            ))}
            {(clinic.services?.length ?? 0) > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{clinic.services.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-gray-600">
            <Icon name="phone" size="small" color="#6b7280" className="mr-2" />
            <Typography variant="caption">
              {clinic.phone}
            </Typography>
          </div>
          
          {/* Available Doctors Count */}
          {clinic.doctors && clinic.doctors.length > 0 && (
            <div className="flex items-center text-gray-600">
              <Icon name="doctor" size="small" color="#6b7280" className="mr-1" />
              <Typography variant="caption">
                {clinic.doctors.length} doctor{clinic.doctors.length !== 1 ? 's' : ''}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Typography variant="h4" className="text-gray-900 font-bold mb-2">
            {state.bookingFlow === 'doctor' && state.selectedDoctor 
              ? `Clinics for ${state.selectedDoctor.fullName}`
              : 'Select a Clinic'
            }
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            {state.bookingFlow === 'doctor' 
              ? 'Choose where you\'d like to meet your selected doctor'
              : 'Choose from our partner clinics'
            }
          </Typography>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search clinics by name, location, or services..."
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
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

          {/* Type Filter */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Typography variant="body2" className="text-gray-700 font-medium mb-3">
                Clinic Type
              </Typography>
              <div className="flex flex-wrap gap-2">
                {clinicTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedType === type
                        ? 'bg-[#0e3293] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <Typography variant="body2" className="text-gray-600">
            {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''} found
          </Typography>
        </div>

        {/* Clinics Grid */}
        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ClinicCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredClinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClinics.map((clinic) => (
              <ClinicCard key={clinic._id} clinic={clinic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="search" size="large" color="#9ca3af" />
            </div>
            <Typography variant="h6" className="text-gray-900 mb-2">
              No clinics found
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

export default ClinicSelection;
