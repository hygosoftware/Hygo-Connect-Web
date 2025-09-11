'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Filter, MapPin, Star, Clock, Users, X, Stethoscope, Building2, RefreshCw, AlertCircle } from 'lucide-react';
import { UniversalHeader, Input, Icon, Typography } from '../atoms';
import { doctorHelpers } from '../../services/apiServices';

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

interface DoctorsListUIProps {
  doctors?: Doctor[];
  filteredDoctors?: Doctor[];
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  searchQuery?: string;
  activeFilter?: string;
  activeClinicFilter?: string;
  showFilters?: boolean;
  specializations?: string[];
  clinics?: string[];
  locationFromParams?: { latitude: number; longitude: number } | null;
  currentAddressFromParams?: string;
  onGoBack?: () => void;
  onRefresh?: () => void;
  onSearchChange?: (query: string) => void;
  onClearSearch?: () => void;
  onToggleFilters?: () => void;
  onFilterPress?: (filter: string) => void;
  onClinicFilterPress?: (filter: string) => void;
  onClearFilters?: () => void;
  onDoctorPress?: (doctor: { _id: string }) => void;
  onRetry?: () => void;
  onErrorDetails?: () => void;
}

const DoctorsListUI: React.FC<DoctorsListUIProps> = ({
  doctors = [],
  filteredDoctors = [],
  loading = false,
  refreshing = false,
  error = null,
  searchQuery = "",
  activeFilter = "All",
  activeClinicFilter = "All",
  showFilters = false,
  specializations = ["All"],
  clinics = ["All"],
  locationFromParams = null,
  currentAddressFromParams = "",
  onGoBack = () => { },
  onRefresh = () => { },
  onSearchChange = () => { },
  onClearSearch = () => { },
  onToggleFilters = () => { },
  onFilterPress = () => { },
  onClinicFilterPress = () => { },
  onClearFilters = () => { },
  onDoctorPress = () => { },
  onRetry = () => { },
  onErrorDetails = () => { },
}) => {

  const availableDoctors = doctors.filter(d => d.isAvailableNow).length;
  const displayDoctors = filteredDoctors.length > 0 ? filteredDoctors : doctors;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Sticky positioning within layout system */}
      <div className="sticky top-0 z-30 bg-white">
        <div>
          <UniversalHeader
          title="Find Your Doctor"
          subtitle={`${displayDoctors.length} expert doctors available`}
          variant="gradient"
          showBackButton={true}
          onBackPress={onGoBack}
          rightContent={
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{doctors.length}</div>
                <div className="text-blue-100 text-xs">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{availableDoctors}</div>
                <div className="text-blue-100 text-xs">Available</div>
              </div>
            </div>
          }
        />
        </div>
      </div>

      {/* Body Content - No top padding needed with sticky header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by doctor name, specialty, or clinic..."
                value={searchQuery}
                onChange={(value) => onSearchChange(value)}
                className="w-full"
                leftIcon="search"
              />
            </div>
            <button
              onClick={onToggleFilters}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-[#0e3293] text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon name="filter" size="small" color={showFilters ? "white" : "#6b7280"} className="mr-2" />
              <Typography variant="body2" className={showFilters ? "text-white" : "text-gray-700"}>
                Filters
              </Typography>
            </button>
          </div>
        </div>

        {/* Location Banner */}
        {(locationFromParams || currentAddressFromParams) && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                <Icon name="location" size="small" color="#059669" />
              </div>
              <div>
                <Typography variant="body1" className="text-emerald-800 font-semibold">Your Location</Typography>
                <Typography variant="body2" className="text-emerald-700">
                  {currentAddressFromParams ||
                    (locationFromParams ? `${locationFromParams.latitude.toFixed(5)}, ${locationFromParams.longitude.toFixed(5)}` : '')
                  }
                </Typography>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-[#0E3293]/5 to-blue-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon name="filter" size="small" color="#0e3293" className="mr-2" />
                  <Typography variant="h6" className="text-gray-800 font-semibold">Filter Options</Typography>
                </div>
                <button
                  onClick={onClearFilters}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
                >
                  <Typography variant="body2">Clear All</Typography>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Specialization Filter */}
                <div>
                  <div className="flex items-center mb-4">
                    <Icon name="doctor" size="small" color="#7c3aed" className="mr-2" />
                    <Typography variant="body1" className="font-semibold text-gray-800">Specialization</Typography>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((item) => (
                      <button
                        key={`spec-${item}`}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilter === item
                          ? "bg-[#0E3293] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        onClick={() => onFilterPress(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clinic Filter */}
                <div>
                  <div className="flex items-center mb-4">
                    <Icon name="hospital" size="small" color="#059669" className="mr-2" />
                    <Typography variant="body1" className="font-semibold text-gray-800">Clinic</Typography>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {clinics.map((item) => (
                      <button
                        key={`clinic-${item}`}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeClinicFilter === item
                          ? "bg-emerald-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        onClick={() => onClinicFilterPress(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(activeFilter !== "All" || activeClinicFilter !== "All") && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center mb-3">
                    <Icon name="filter" size="small" color="#6b7280" className="mr-2" />
                    <Typography variant="body2" className="font-medium text-gray-700">Active Filters:</Typography>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFilter !== "All" && (
                      <div className="bg-blue-100 px-3 py-1 rounded-lg flex items-center">
                        <Typography variant="caption" className="text-blue-800">Specialty: {activeFilter}</Typography>
                        <button
                          className="ml-2 p-0.5 hover:bg-blue-200 rounded"
                          onClick={() => onFilterPress("All")}
                        >
                          <Icon name="x" size="small" color="#2563eb" />
                        </button>
                      </div>
                    )}
                    {activeClinicFilter !== "All" && (
                      <div className="bg-emerald-100 px-3 py-1 rounded-lg flex items-center">
                        <Typography variant="caption" className="text-emerald-800">Clinic: {activeClinicFilter}</Typography>
                        <button
                          className="ml-2 p-0.5 hover:bg-emerald-200 rounded"
                          onClick={() => onClinicFilterPress("All")}
                        >
                          <Icon name="x" size="small" color="#059669" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#0E3293]/10 rounded-xl flex items-center justify-center mr-3">
                  <Icon name="doctor" size="small" color="#0e3293" />
                </div>
                <div>
                  <Typography variant="body1" className="font-semibold text-gray-800">
                    {displayDoctors.length} Doctor{displayDoctors.length !== 1 ? 's' : ''} Found
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {(activeFilter !== "All" || activeClinicFilter !== "All" || searchQuery)
                      ? "Matching your search criteria"
                      : "Available for consultation"
                    }
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#0E3293]">{availableDoctors}</div>
                <Typography variant="caption" className="text-gray-500">Available Now</Typography>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading && !refreshing ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0E3293] mx-auto mb-4"></div>
              <Typography variant="body1" className="text-gray-600">Loading doctors...</Typography>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="alert" size="large" color="#ef4444" />
              </div>
              <Typography variant="h6" className="text-gray-800 mb-2">Unable to load doctors</Typography>
              <Typography variant="body2" className="text-gray-600 mb-6">Please check your connection and try again</Typography>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={onErrorDetails}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  <Typography variant="body2">Details</Typography>
                </button>
                <button
                  onClick={onRetry}
                  className="px-6 py-2 bg-[#0E3293] hover:bg-[#0A2470] text-white rounded-xl transition-colors flex items-center"
                >
                  <Icon name="refresh" size="small" color="white" className="mr-2" />
                  <Typography variant="body2" className="text-white">Try Again</Typography>
                </button>
              </div>
            </div>
          </div>
        ) : displayDoctors.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Icon name="search" size="large" color="#9ca3af" />
              </div>
              <Typography variant="h5" className="text-gray-800 mb-2">No Doctors Found</Typography>
              <Typography variant="body2" className="text-gray-600 mb-6 max-w-md">
                We couldn't find any doctors matching your search criteria. Try adjusting your filters.
              </Typography>
              <button
                onClick={onClearFilters}
                className="px-8 py-3 bg-[#0E3293] hover:bg-[#0A2470] text-white font-semibold rounded-2xl transition-colors"
              >
                <Typography variant="body1" className="text-white">Clear All Filters</Typography>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayDoctors.map((doctor, index) => (
              <DoctorListItem
                key={doctor._id}
                doctor={doctor}
                onPress={() => onDoctorPress(doctor)}
                getFullImageUrl={(p: string) => doctorHelpers.getFullImageUrl(p)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Doctor List Item Component (Mobile-style list)
interface DoctorListItemProps {
  doctor: Doctor;
  onPress: () => void;
  getFullImageUrl: (imagePath: string) => string;
  index: number;
}

const DoctorListItem: React.FC<DoctorListItemProps> = ({ doctor, onPress, getFullImageUrl, index }) => {
  const profileImageUrl = getFullImageUrl(doctor.profileImage);

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 cursor-pointer group hover:bg-gray-50"
      onClick={onPress}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.4s ease-out forwards'
      }}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {/* Doctor Image and Status */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-50">
              <Image
                src={profileImageUrl || "/images/default-doctor.png"}
                alt={doctor.fullName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default-doctor.png';
                }}
              />
            </div>
            {/* {doctor.isAvailableNow && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm font-medium">
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                  Now
                </div>
              </div>
            )} */}
          </div>

          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#0E3293] transition-colors truncate">
                  {doctor.fullName}
                </h3>
                
                {/* Specialization */}
                <p className="text-sm text-gray-600 mt-0.5 truncate">
                  {doctor.specializations?.[0] || 'General consultant'}
                </p>
                
                {/* Clinic Info */}
                {doctor.clinic && doctor.clinic.length > 0 && (
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{doctor.clinic[0].clinicName}</span>
                  </div>
                )}
                
                {/* Experience and Rating */}
                <div className="flex items-center mt-2 space-x-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{doctor.experience || 0} years exp.</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                    <span>{doctor.ratings?.average || 0}</span>
                    <span className="ml-1">({doctor.ratings?.count || 0})</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - Availability and Price */}
              <div className="flex flex-col items-end ml-4 flex-shrink-0">
                {/* <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doctor.isAvailableNow 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {doctor.isAvailableNow ? 'Available' : 'Busy'}
                </div> */}
                
                <div className="text-right mt-2">
                  <div className="text-lg font-bold text-[#0E3293]">
                    ₹{doctor.consultationFee || 500}
                  </div>
                  <div className="text-xs text-gray-500">Consultation Fee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsListUI;