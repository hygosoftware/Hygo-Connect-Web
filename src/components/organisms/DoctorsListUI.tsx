'use client';

import React from 'react';
import Image from 'next/image';
import { Icon, Button, UniversalHeader } from '../atoms';

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
  // State props
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
  
  // Location props
  locationFromParams?: { latitude: number; longitude: number } | null;
  currentAddressFromParams?: string;
  
  // Callback functions
  onGoBack?: () => void;
  onRefresh?: () => void;
  onSearchChange?: (query: string) => void;
  onClearSearch?: () => void;
  onToggleFilters?: () => void;
  onFilterPress?: (filter: string) => void;
  onClinicFilterPress?: (filter: string) => void;
  onClearFilters?: () => void;
  onDoctorPress?: (doctor: Doctor) => void;
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
  onGoBack = () => {},
  onRefresh = () => {},
  onSearchChange = () => {},
  onClearSearch = () => {},
  onToggleFilters = () => {},
  onFilterPress = () => {},
  onClinicFilterPress = () => {},
  onClearFilters = () => {},
  onDoctorPress = () => {},
  onRetry = () => {},
  onErrorDetails = () => {},
}) => {

  // Helper function to construct full image URL
  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return '/images/default-doctor.png';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Clean the path to avoid double slashes and duplicate paths
    let cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Remove any existing API path prefixes to avoid duplication
    cleanPath = cleanPath.replace(/^api\/V0\//, '');
    cleanPath = cleanPath.replace(/^uploads\//, '');

    return `https://hygo-backend.onrender.com/api/V0/uploads/${cleanPath}`;
  };

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Universal Header */}
      <UniversalHeader
        title="Find Your Doctor"
        subtitle={`${filteredDoctors.length} expert doctors available`}
        variant="gradient"
        icon="doctor"
        showBackButton={true}
        onBackPress={onGoBack}
        rightContent={
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{doctors.length}</div>
              <div className="text-blue-100 text-xs">Total Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{doctors.filter(d => d.isAvailableNow).length}</div>
              <div className="text-blue-100 text-xs">Available Now</div>
            </div>
          </div>
        }
      />

      {/* Search and Filters Section */}
      <div className="px-4 md:px-6 py-6 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex bg-white rounded-2xl px-4 py-3 items-center shadow-sm border border-gray-200">
                <Icon name="search" size="small" color="#0E3293" className="mr-3" />
                <input
                  type="text"
                  className="flex-1 text-base outline-none bg-transparent placeholder-gray-500"
                  placeholder="Search by doctor name, specialty, or clinic..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery.length > 0 && (
                  <button
                    onClick={onClearSearch}
                    className="ml-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon name="close" size="small" color="#6B7280" />
                  </button>
                )}
                <button
                  onClick={onToggleFilters}
                  className={`ml-2 p-2.5 rounded-xl transition-all duration-200 ${
                    showFilters
                      ? "bg-[#0E3293] text-white shadow-lg"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  <Icon
                    name="filter"
                    size="small"
                    color={showFilters ? "white" : "#6B7280"}
                  />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Location Banner */}
      {(locationFromParams || currentAddressFromParams) && (
        <div className="mx-4 md:mx-6 mt-6 mb-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                <Icon name="location" size="small" color="#059669" />
              </div>
              <div>
                <div className="text-emerald-800 font-semibold text-sm">Your Location</div>
                <div className="text-emerald-700 text-sm">
                  {currentAddressFromParams ||
                    (locationFromParams ? `${locationFromParams.latitude.toFixed(5)}, ${locationFromParams.longitude.toFixed(5)}` : '')
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1">
        {loading && !refreshing ? (
          <div className="flex-1 flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex justify-center items-center py-20 px-4">
            <div className="text-center">
              <Icon name="alert" size="large" color="#EF4444" className="mx-auto mb-4" />
              <p className="text-red-500 text-lg mb-4">Unable to load doctors</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="secondary" 
                  onClick={onErrorDetails}
                  className="px-4 py-2"
                >
                  Details
                </Button>
                <Button 
                  variant="primary" 
                  onClick={onRetry}
                  className="px-6 py-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Filters Section */}
            {showFilters && (
              <div className="mx-4 md:mx-6 mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  {/* Filter Header */}
                  <div className="bg-gradient-to-r from-[#0E3293]/5 to-blue-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#0E3293]/10 rounded-lg flex items-center justify-center mr-3">
                          <Icon name="filter" size="small" color="#0E3293" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Filter Doctors</h3>
                      </div>
                      <button
                        onClick={onClearFilters}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Filter Content */}
                  <div className="p-6">
                    <div className="md:flex md:gap-8">
                      {/* Specialization Filter */}
                      <div className="mb-6 md:mb-0 md:flex-1">
                        <div className="flex items-center mb-4">
                          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                            <Icon name="doctor" size="small" color="#7c3aed" />
                          </div>
                          <p className="text-lg font-semibold text-gray-800">Specialization</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {specializations.map((item) => (
                            <button
                              key={`spec-${item}`}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                activeFilter === item
                                  ? "bg-gradient-to-r from-[#0E3293] to-blue-600 border-[#0E3293] text-white shadow-lg"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-[#0E3293] hover:bg-blue-50"
                              }`}
                              onClick={() => onFilterPress(item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Clinic Filter */}
                      <div className="md:flex-1">
                        <div className="flex items-center mb-4">
                          <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                            <Icon name="location" size="small" color="#059669" />
                          </div>
                          <p className="text-lg font-semibold text-gray-800">Clinic</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {clinics.map((item) => (
                            <button
                              key={`clinic-${item}`}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                activeClinicFilter === item
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-lg"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50"
                              }`}
                              onClick={() => onClinicFilterPress(item)}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Active Filters Summary */}
                  {(activeFilter !== "All" || activeClinicFilter !== "All") && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <div className="flex items-center mb-3">
                        <Icon name="filter" size="small" color="#6B7280" className="mr-2" />
                        <p className="text-sm font-medium text-gray-700">Active Filters:</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {activeFilter !== "All" && (
                          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl flex items-center border border-blue-200 shadow-sm">
                            <span className="text-sm font-medium text-blue-800">Specialty: {activeFilter}</span>
                            <button
                              className="ml-2 p-1 hover:bg-blue-200 rounded-lg transition-colors"
                              onClick={() => onFilterPress("All")}
                            >
                              <Icon name="close" size="small" color="#1e40af" />
                            </button>
                          </div>
                        )}
                        {activeClinicFilter !== "All" && (
                          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-xl flex items-center border border-emerald-200 shadow-sm">
                            <span className="text-sm font-medium text-emerald-800">Clinic: {activeClinicFilter}</span>
                            <button
                              className="ml-2 p-1 hover:bg-emerald-200 rounded-lg transition-colors"
                              onClick={() => onClinicFilterPress("All")}
                            >
                              <Icon name="close" size="small" color="#059669" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Results Count */}
            {!loading && !error && (
              <div className="px-4 md:px-6 pb-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                        <Icon name="doctor" size="small" color="#0E3293" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? 's' : ''} Found
                        </p>
                        <p className="text-sm text-gray-600">
                          {(activeFilter !== "All" || activeClinicFilter !== "All" || searchQuery)
                            ? "Matching your search criteria"
                            : "Available for consultation"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#0E3293]">{doctors.filter(d => d.isAvailableNow).length}</div>
                      <div className="text-xs text-gray-500">Available Now</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Doctors List */}
            {filteredDoctors.length === 0 ? (
              <div className="flex-1 flex justify-center items-center py-20 px-4">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Icon name="search" size="large" color="#9CA3AF" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Doctors Found</h3>
                  <p className="text-gray-600 text-lg mb-6 max-w-md">
                    We couldn't find any doctors matching your search criteria. Try adjusting your filters.
                  </p>
                  <Button
                    variant="primary"
                    onClick={onClearFilters}
                    className="px-8 py-4 bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-4 md:px-6 pb-20 md:pb-4">
                {/* Enhanced Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDoctors.map((doctor, index) => (
                    <DoctorCard
                      key={doctor._id}
                      doctor={doctor}
                      onPress={() => onDoctorPress(doctor)}
                      getFullImageUrl={getFullImageUrl}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </>
  );
};

// Enhanced Doctor Card Component
interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
  getFullImageUrl: (imagePath: string) => string;
  index: number;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress, getFullImageUrl, index }) => {
  const profileImageUrl = getFullImageUrl(doctor.profileImage);

  return (
    <div
      className="cursor-pointer group transform transition-all duration-300 hover:scale-105"
      onClick={onPress}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 group-hover:shadow-2xl group-hover:bg-white/90 transition-all duration-300 h-full relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0E3293] via-blue-500 to-purple-500"></div>

        {/* Availability Badge */}
        {doctor.isAvailableNow && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              Available
            </div>
          </div>
        )}

        {/* Doctor Image */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden shadow-lg">
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="doctor" size="large" color="#0E3293" />
            </div>
            {profileImageUrl && profileImageUrl !== '/images/default-doctor.png' && (
              <Image
                src={profileImageUrl}
                alt={doctor.fullName}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
          {/* Rating Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-xl shadow-lg flex items-center">
            <Icon name="star" size="small" color="white" className="mr-1" />
            {doctor.ratings?.average || 0}
          </div>
        </div>

        {/* Doctor Info */}
        <div className="text-center">
          <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-[#0E3293] transition-colors">
            {doctor.fullName}
          </h3>

          {/* Specializations */}
          <div className="mb-3">
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {doctor.specializations?.slice(0, 2).map((spec, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full border border-blue-200"
                >
                  {spec}
                </span>
              ))}
              {doctor.specializations && doctor.specializations.length > 2 && (
                <span className="text-blue-600 text-xs font-medium">+{doctor.specializations.length - 2} more</span>
              )}
            </div>
          </div>

          {/* Clinic Info */}
          {doctor.clinic && doctor.clinic.length > 0 && (
            <div className="flex items-center justify-center mb-3">
              <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center">
                <Icon name="location" size="small" color="#6B7280" className="mr-2" />
                <span className="text-gray-600 text-sm font-medium">
                  {doctor.clinic[0].clinicName}
                  {doctor.clinic.length > 1 && ` +${doctor.clinic.length - 1}`}
                </span>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-2xl p-3">
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-[#0E3293]">{doctor.experience || 0}</div>
              <div className="text-xs text-gray-500">Years Exp.</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-yellow-600">{doctor.ratings?.average || 0}</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-gray-700">{doctor.ratings?.count || 0}</div>
              <div className="text-xs text-gray-500">Reviews</div>
            </div>
          </div>

          {/* Consultation Fee */}
          <div className="bg-gradient-to-r from-[#0E3293] to-blue-600 text-white rounded-2xl p-3 group-hover:from-[#0A2470] group-hover:to-blue-700 transition-all duration-300">
            <div className="text-xs opacity-90 mb-1">Consultation Fee</div>
            <div className="text-lg font-bold">₹{doctor.consultationFee || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsListUI;
