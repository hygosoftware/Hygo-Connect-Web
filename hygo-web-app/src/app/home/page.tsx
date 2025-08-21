'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, FeatureCard, Icon, AppointmentCard, Typography, DailyTips, AutoScrollBanner, DoctorCard } from '../../components/atoms';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleScanPress = () => {
    console.log('Scan pressed');
  };

  const handleFeaturePress = (feature: string) => {
    console.log(`Feature pressed: ${feature}`);
    if (feature === 'PillPal') {
      router.push('/pillpal');
    }
  };

  // Feature items with icon names
  const featureItems = [
    {
      iconName: 'pills',
      title: 'PillPal',
      onPress: () => handleFeaturePress('PillPal'),
    },
    {
      iconName: 'family',
      title: 'Family Details',
      onPress: () => handleFeaturePress('Family Details'),
    },
    {
      iconName: 'doctor',
      title: 'Doctors',
      onPress: () => handleFeaturePress('Doctors'),
    },
    {
      iconName: 'health-card',
      title: 'Health Card',
      onPress: () => handleFeaturePress('Health Card'),
    },
    {
      iconName: 'records',
      title: 'Records',
      onPress: () => handleFeaturePress('Records'),
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

  // Sample doctor data
  const sampleDoctors = [
    {
      doctorId: '1',
      fullName: 'Dr. Sarah Johnson',
      rating: 4.8,
      imageSrc: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      qualifications: ['MBBS', 'MD Cardiology'],
      specializations: ['Cardiology', 'Heart Surgery']
    },
    {
      doctorId: '2',
      fullName: 'Dr. Michael Chen',
      rating: 4.9,
      imageSrc: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      qualifications: ['MBBS', 'MD Dermatology'],
      specializations: ['Dermatology', 'Cosmetic Surgery']
    },
    {
      doctorId: '3',
      fullName: 'Dr. Emily Rodriguez',
      rating: 4.7,
      imageSrc: 'https://images.unsplash.com/photo-1594824475317-d8b0b4b5b8b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      qualifications: ['MBBS', 'MD Pediatrics'],
      specializations: ['Pediatrics', 'Child Care']
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header
        userName="John Doe"
        onMenuPress={() => {}} // No longer needed since navigation is handled by AppLayout
        onScanPress={handleScanPress}
      />

      <main>

      {/* Daily Health Tips */}
      <DailyTips onPress={() => console.log('Daily tip clicked')} />

      {/* Features Grid */}
      <div className="mx-4 my-4">
        <Typography variant="h5" className="font-semibold text-white mb-4">
          Health Features
        </Typography>

        {/* Mobile Layout - 4 columns grid (same as before) */}
        <div className="grid grid-cols-4 gap-4 md:hidden">
          {featureItems.map((item, index) => (
            <FeatureCard
              key={index}
              icon={<Icon name={item.iconName as any} size="medium" color="#0E3293" />}
              title={item.title}
              bgColor="hygo-3d-card"
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
          {sampleAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointmentId}
              doctor={appointment.doctor}
              date={appointment.date}
              actualStartTime={appointment.actualStartTime}
              actualEndTime={appointment.actualEndTime}
              mode={appointment.mode}
              status={appointment.status}
              clinic={appointment.clinic}
              clinicName={appointment.clinicName}
              clinicCity={appointment.clinicCity}
              qrCode={appointment.qrCode}
              appointmentId={appointment.appointmentId}
              onPress={() => console.log(`Appointment ${appointment.appointmentId} clicked`)}
            />
          ))}
        </div>
      </div>

      {/* Health Promotion Banners */}
      <div className="px-4 my-3">
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h5" className="font-semibold text-white">
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
          <Typography variant="h5" className="font-semibold text-white">
            Top Rated Doctors
          </Typography>
          <button
            className="text-[#0E3293] hover:text-[#1E42A3] transition-colors duration-200 hygo-3d-button px-4 py-2 rounded-lg"
            onClick={() => console.log('See all doctors')}
          >
            <Typography variant="body1" className="text-white">
              See All
            </Typography>
          </button>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
          {sampleDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.doctorId}
              doctorId={doctor.doctorId}
              fullName={doctor.fullName}
              rating={doctor.rating}
              imageSrc={doctor.imageSrc}
              qualifications={doctor.qualifications}
              specializations={doctor.specializations}
              onPress={() => console.log(`Doctor ${doctor.doctorId} clicked`)}
            />
          ))}
        </div>
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-20"></div>

      {/* Status Section */}
      <div className="p-6">
        <div className="hygo-3d-card p-6 animate-fadeInUp">
          <h2 className="text-2xl font-bold text-[#0E3293] mb-4">Welcome to Hygo!</h2>
          <p className="text-gray-700 mb-4">
            ✅ Header component working with menu functionality
          </p>
          <p className="text-gray-700 mb-4">
            ✅ SideMenu component working with profile and navigation
          </p>
          <p className="text-gray-700 mb-4">
            ✅ FeatureCard component working with 8 health features
          </p>
          <p className="text-gray-700 mb-4">
            ✅ AppointmentCard component with video/in-person appointments
          </p>
          <p className="text-gray-700 mb-4">
            ✅ DailyTips component with rotating health tips
          </p>
          <p className="text-gray-700 mb-4">
            ✅ AutoScrollBanner component with health promotions
          </p>
          <p className="text-gray-700 mb-4">
            ✅ DoctorCard component with top rated doctors
          </p>
          <p className="text-gray-700 mb-4">
            ✅ Persistent navigation with responsive design
          </p>
          <p className="text-gray-700 mb-4">
            🎯 Click any feature card, appointment card, doctor card, or banner to test functionality!
          </p>
          <p className="text-gray-700 mb-4">
            📱 Try clicking the QR code button on in-person appointments!
          </p>
          <p className="text-gray-700 mb-4">
            🎥 Try clicking the video call button on video appointments!
          </p>
          <p className="text-gray-700">
            Please provide the next atomic component to continue building the home screen.
          </p>
        </div>
      </div>

      </main>
    </div>
  );
};

export default HomePage;
