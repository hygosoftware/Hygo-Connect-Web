'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UniversalHeader, FeatureCard, Icon, AppointmentCard, Typography, DailyTips, AutoScrollBanner, DoctorCard } from '../../components/atoms';
import { doctorService, Doctor as ApiDoctor, doctorHelpers, appointmentService, Appointment } from '../../services/apiServices';
import { useAuth } from '../../hooks/useAuth';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const handleScanPress = () => {
    console.log('Scan pressed');
  };

  const handleFeaturePress = (feature: string) => {
    console.log(`Feature pressed: ${feature}`);
    if (feature === 'PillPal') {
      router.push('/pillpal');
    } else if (feature === 'Book Appointment' || feature === 'Appointment') {
      router.push('/booking');
    }
  };

  // Load doctors from API
  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const apiDoctors = await doctorService.getAllDoctors();
      // Get only first 5 doctors for home page display
      setDoctors(apiDoctors.slice(0, 5));
    } catch (error) {
      console.error('Failed to load doctors:', error);
      // Keep empty array on error, don't show error on home page
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Load appointments from API
  const loadAppointments = async () => {
    if (!user?._id) {
      setLoadingAppointments(false);
      return;
    }

    try {
      setLoadingAppointments(true);
      const userAppointments = await appointmentService.getAppointmentsByUserId(user._id);
      // Get only upcoming appointments (first 3 for home page display)
      const upcomingAppointments = userAppointments
        .filter(apt => new Date(apt.appointmentDate) >= new Date())
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
        .slice(0, 3);
      setAppointments(upcomingAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      // Keep empty array on error, don't show error on home page
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Load doctors and appointments on component mount
  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, [user?._id]);

  // Feature items with icon names
  const featureItems = [
    {
      iconName: 'pills',
      title: 'PillPal',
      onPress: () => router.push('/pillpal'),
    },
    {
      iconName: 'family',
      title: 'Family Details',
      onPress: () => router.push('/family'),
    },
    {
      iconName: 'doctor',
      title: 'Doctors',
      onPress: () => router.push('/doctors'),
    },
    {
      iconName: 'health-card',
      title: 'Health Card',
      onPress: () => router.push('/health-card'),
    },
    {
      iconName: 'records',
      title: 'Records',
      onPress: () => router.push('/records'),
    },
    {
      iconName: 'robot',
      title: 'Health Bot',
      onPress: () => handleFeaturePress('Health Bot'),
      hasNotification: true,
    },
    {
      iconName: 'appointment',
      title: 'Appointment',
      onPress: () => handleFeaturePress('Appointment'),
    },
    {
      iconName: 'laboratory',
      title: 'Laboratory',
      onPress: () => handleFeaturePress('Laboratory'),
    },
  ]; 

  // Banner data for health promotions
  const bannerData = [
    {
      id: '1',
      title: 'Vaccination',
      description: 'Schedule your COVID-19 vaccination or booster today',
      imageUri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Book Now',
      onPress: () => handleFeaturePress('Vaccination'),
    },
    {
      id: '2',
      title: 'Health Check-up',
      description: 'Complete health packages at special prices',
      imageUri: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Check Offers',
      onPress: () => handleFeaturePress('Health Check-up'),
    },
    {
      id: '3',
      title: 'Mental Wellness',
      description: 'Talk to professional therapists and counselors',
      imageUri: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Consult Now',
      onPress: () => handleFeaturePress('Mental Wellness'),
    },
    {
      id: '4',
      title: 'Medicine Delivery',
      description: 'Get medicines delivered at your doorstep',
      imageUri: 'https://images.unsplash.com/photo-1585435557343-3b092031d4c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Order Now',
      onPress: () => handleFeaturePress('Medicine Delivery'),
    },
  ];

  // Convert API doctors to format expected by DoctorCard component
  const convertedDoctors = doctors.map(doctor => ({
    doctorId: doctor._id,
    fullName: doctor.fullName,
    rating: doctor.ratings.average,
    imageSrc: doctorHelpers.getFullImageUrl(doctor.profileImage),
    qualifications: doctorHelpers.formatQualifications(doctor.qualifications),
    specializations: doctor.specializations
  }));

  // Sample appointment data
  const sampleAppointments = [
    {
      doctor: {
        fullName: 'Dr. Sarah Johnson',
        specializations: ['Cardiology'],
        rating: 4.8,
      },
      date: '2024-01-25',
      actualStartTime: '10:00 AM',
      actualEndTime: '10:30 AM',
      mode: 'VideoCall' as const,
      status: 'upcoming' as const,
      clinic: {
        clinicName: 'Heart Care Center',
        clinicAddress: { city: 'New York' }
      },
      appointmentId: '1'
    },
    {
      doctor: {
        fullName: 'Dr. Michael Chen',
        specializations: ['Dermatology'],
        rating: 4.9,
      },
      date: '2024-01-26',
      actualStartTime: '2:00 PM',
      actualEndTime: '2:45 PM',
      mode: 'InPerson' as const,
      status: 'upcoming' as const,
      clinicName: 'Skin Health Clinic',
      clinicCity: 'Brooklyn',
      qrCode: 'sample-qr-code-inperson',
      appointmentId: '2'
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header - fixed and full width behind sidebar */}
      <div className="fixed top-0 left-0  w-screen z-10" style={{right: 0}}>
        <UniversalHeader
          title={`Hi, ${user?.FullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'User'}!`}
          subtitle="Good Morning"
          variant="home"
          showBackButton={false}
          rightContent={
            <div className="flex items-center space-x-2">
              {/* Location */}
              <button className="hidden sm:flex items-center bg-white/15 px-3 py-1.5 rounded-lg hover:bg-white/25 transition-colors duration-200">
                <Icon name="location" size="small" color="white" className="mr-1" />
                <Typography variant="caption" className="text-white text-xs">
                  New York, NY
                </Typography>
              </button>

              {/* Notifications */}
              <button className="relative w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center hover:bg-white/25 transition-colors duration-200">
                <Icon name="bell" size="small" color="white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Typography variant="caption" className="text-white text-xs font-bold">3</Typography>
                </span>
              </button>

              {/* Book Appointment */}
              <button
                onClick={() => handleFeaturePress('Book Appointment')}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
              >
                <Typography variant="body2" className="text-white font-semibold">Book</Typography>
              </button>
            </div>
          }
        />
      </div>

      {/* Add top padding to prevent content from being hidden behind the header */}
      <main className="pt-20">

      {/* Daily Health Tips */}
      <DailyTips onPress={() => console.log('Daily tip clicked')} />

      {/* Features Grid */}
      <div className="mx-4 my-4">
        <Typography variant="h5" className="font-semibold text-gray-800 mb-4">
          Health Features
        </Typography>

        {/* Mobile Layout - 4 columns grid (same as before) */}
        <div className="grid grid-cols-4 gap-4 md:hidden">
          {featureItems.map((item, index) => (
            <FeatureCard
              key={index}
              icon={<Icon name={item.iconName as any} size="medium" color="#1e40af" />}
              title={item.title}
              bgColor={item.title === 'Health Bot' ? 'bg-blue-50' : 'bg-white'}
              hasNotification={item.hasNotification}
              onPress={item.onPress}
            />
          ))}
        </div>

        {/* Desktop Layout - All 8 features in one horizontal line with equal spacing */}
        <div className="hidden md:block">
          <div className="flex justify-between items-center gap-2 lg:gap-4">
            {featureItems.map((item, index) => (
              <button
                key={index}
                className="group flex flex-col items-center p-3 lg:p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-blue-200 transition-all duration-200 hover:-translate-y-1 flex-1 max-w-[140px]"
                onClick={item.onPress}
              >
                <div className="relative mb-3">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    item.title === 'Health Bot' ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-50 group-hover:bg-blue-50'
                  }`}>
                    <Icon name={item.iconName as any} color="#1e40af" className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                  {item.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
                      <div className="w-full h-full bg-red-500 rounded-full animate-ping"></div>
                    </div>
                  )}
                </div>
                <Typography
                  variant="body2"
                  className="text-gray-700 font-medium text-center group-hover:text-blue-800 transition-colors duration-200 text-xs lg:text-sm leading-tight"
                >
                  {item.title}
                </Typography>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="px-4 mt-5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h5" className="font-semibold text-gray-800">
            Your Appointments
          </Typography>
          <button
            className="text-blue-800 hover:text-blue-900 transition-colors duration-200"
            onClick={() => console.log('See all appointments')}
          >
            <Typography variant="body1" className="text-blue-800">
              See All
            </Typography>
          </button>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
          {loadingAppointments ? (
            // Loading skeleton for appointments
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-80 h-40 bg-gray-200 rounded-xl animate-pulse"></div>
            ))
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                doctor={{
                  fullName: appointment.doctor.fullName,
                  specializations: appointment.doctor.specializations,
                  avatar: appointment.doctor.profileImage
                }}
                date={new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
                actualStartTime={appointment.appointmentTime.from}
                actualEndTime={appointment.appointmentTime.to}
                mode="InPerson" // Default mode, can be enhanced later
                status={appointment.status === 'scheduled' ? 'upcoming' : appointment.status as any}
                clinic={{
                  _id: appointment.clinic._id,
                  clinicName: appointment.clinic.clinicName,
                  clinicAddress: {
                    addressLine: appointment.clinic.clinicAddress || 'N/A'
                  }
                }}
                clinicName={appointment.clinic.clinicName}
                clinicCity={appointment.clinic.clinicAddress || 'N/A'}
                qrCode={`appointment-${appointment._id}`}
                appointmentId={appointment._id}
                onPress={() => console.log(`Appointment ${appointment._id} clicked`)}
              />
            ))
          ) : (
            <div className="flex-shrink-0 w-full text-center py-8">
              <Typography variant="body2" className="text-gray-500">
                No upcoming appointments
              </Typography>
              <button
                onClick={() => handleFeaturePress('Book Appointment')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Typography variant="body2" className="text-white">
                  Book Your First Appointment
                </Typography>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Health Promotion Banners */}
      <div className="px-4 my-3">
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h5" className="font-semibold text-gray-800">
            Health Promotions
          </Typography>
        </div>

        <AutoScrollBanner
          data={bannerData}
          autoScrollInterval={4000}
        />
      </div>

      {/* Top Doctors Section */}
      <div className="px-4 my-3">
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h5" className="font-semibold text-gray-800">
            Top Rated Doctors
          </Typography>
          <button
            className="text-blue-800 hover:text-blue-900 transition-colors duration-200"
            onClick={() => router.push('/doctors')}
          >
            <Typography variant="body1" className="text-blue-800">
              See All
            </Typography>
          </button>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
          {loadingDoctors ? (
            // Loading skeleton - match the new card width (w-52 = 208px)
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-52 h-56 bg-gray-200 rounded-xl animate-pulse"></div>
            ))
          ) : convertedDoctors.length > 0 ? (
            convertedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.doctorId}
                doctorId={doctor.doctorId}
                fullName={doctor.fullName}
                rating={doctor.rating}
                imageSrc={doctor.imageSrc}
                qualifications={doctor.qualifications}
                specializations={doctor.specializations}
                onPress={() => {
                  console.log('🏠 Home: Doctor card clicked:', doctor);
                  console.log('🔗 Navigating to doctor ID:', doctor.doctorId);
                  router.push(`/doctors/${doctor.doctorId}`);
                }}
              />
            ))
          ) : (
            <div className="flex-shrink-0 w-full text-center py-8">
              <Typography variant="body2" className="text-gray-500">
                No doctors available at the moment
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-20"></div>

      {/* Status Section */}
    

      </main>
    </div>
  );
};

export default HomePage;
