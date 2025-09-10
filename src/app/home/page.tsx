'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UniversalHeader, FeatureCard, Icon, AppointmentCard, Typography, DailyTips, AutoScrollBanner, DoctorCard } from '../../components/atoms';
import type { IconName } from '../../components/atoms/Icon';
import { doctorService, Doctor as ApiDoctor, doctorHelpers, appointmentService, Appointment } from '../../services/apiServices';
import { useAuth } from '../../hooks/useAuth';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [locationText, setLocationText] = useState<string>('Rajkot');

  const handleFeaturePress = (feature: string) => {
    // Keep non-booking feature logs only
    if (feature !== 'Book Appointment' && feature !== 'Appointment') {
      console.log(`Feature pressed: ${feature}`);
    }
    if (feature === 'PillPal') {
      router.push('/pillpal');
    } else if (feature === 'Book Appointment') {
      router.push('/booking');
    } else if (feature === 'Appointment') {
      router.push('/appointments');
    }
  };

  // Load doctors from API
  const loadDoctors = useCallback(async () => {
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
  }, []);

  // Load appointments from API
  const loadAppointments = useCallback(async () => {
    if (!user?._id) {
      setLoadingAppointments(false);
      return;
    }

    try {
      setLoadingAppointments(true);
      const userAppointments = await appointmentService.getAppointmentsByUserId(user._id);
      
      // Get current date at midnight for accurate date comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filter for scheduled appointments with future date+end time
      const now = new Date();
      const scheduledAppointments = userAppointments
        .filter(apt => {
          const status = String(apt.status).toLowerCase();
          let appointmentDateTime: Date;
          if (apt.appointmentDate && apt.appointmentTime && apt.appointmentTime.to) {
            const datePart = apt.appointmentDate.split('T')[0];
            const timePart = apt.appointmentTime.to;
            appointmentDateTime = new Date(`${datePart}T${timePart.length === 5 ? timePart : timePart.padStart(5, '0')}:00`);
          } else {
            appointmentDateTime = new Date(apt.appointmentDate);
          }
          return status === 'scheduled' && appointmentDateTime >= now;
        })
        .sort((a, b) => {
          const aDate = a.appointmentDate && a.appointmentTime && a.appointmentTime.to ? new Date(`${a.appointmentDate.split('T')[0]}T${a.appointmentTime.to.length === 5 ? a.appointmentTime.to : a.appointmentTime.to.padStart(5, '0')}:00`) : new Date(a.appointmentDate);
          const bDate = b.appointmentDate && b.appointmentTime && b.appointmentTime.to ? new Date(`${b.appointmentDate.split('T')[0]}T${b.appointmentTime.to.length === 5 ? b.appointmentTime.to : b.appointmentTime.to.padStart(5, '0')}:00`) : new Date(b.appointmentDate);
          return aDate.getTime() - bDate.getTime();
        })
        .slice(0, 3); // Get first 3 for home page display
      setAppointments(scheduledAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      // Keep empty array on error, don't show error on home page
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }, [user?._id]);

  // Load doctors and appointments on component mount
  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, [loadDoctors, loadAppointments]);

  // Detect location and reverse-geocode to City, State
  useEffect(() => {
    if (typeof window === 'undefined') return; // Safety for SSR
    if (!('geolocation' in navigator)) {
      setLocationText('Rajkot');
      return;
    }

    const timeoutId = window.setTimeout(() => {
      // In case geolocation takes too long, keep UI responsive with fallback
      setLocationText((prev) => prev || 'Rajkot');
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'HygoConnectWeb/1.0 (+https://example.com)'
            },
          });
          const data = await res.json();
          const addr = data?.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.suburb || addr.state_district;
          const state = addr.state || addr.region;
          const text = city && state ? `${city}, ${state}` : (city || state || 'Rajkot');
          setLocationText(text);
        } catch (e) {
          setLocationText('Rajkot');
        } finally {
          window.clearTimeout(timeoutId);
        }
      },
      () => {
        window.clearTimeout(timeoutId);
        setLocationText('Rajkot');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Feature items with icon names..
  const featureItems: { iconName: IconName; title: string; onPress: () => void; hasNotification?: boolean }[] = [
    {
      iconName: 'pills',
      title: 'PillPal',
      onPress: () => router.push('/pillpal'),
    },
    {
      iconName: 'family',
      title: 'Family',
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
    // {
    //   iconName: 'robot',
    //   title: 'Health Bot',
    //   onPress: () => handleFeaturePress('Health Bot'),
    //   hasNotification: true,
    // },
    {
      iconName: 'appointment',
      title: 'Appointment',
      onPress: () => handleFeaturePress('Appointment'),
    },
    // {
    //   iconName: 'laboratory',
    //   title: 'Laboratory',
    //   onPress: () => handleFeaturePress('Laboratory'),
    // },
  ];

  // Banner data for health promotions
  const bannerData = [
    {
      id: '1',
      title: 'Vaccination',
      description: 'Schedule your COVID-19 vaccination or booster today',
      imageUri:'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Book Now',
      onPress: () => handleFeaturePress('Vaccination'),
    },
    {
      id: '2',
      title: 'Health Check-up',
      description: 'Complete health packages at special prices',
      imageUri: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Check Offers',
      onPress: () => handleFeaturePress('Health Check-up'),
    },
    {
      id: '3',
      title: 'Mental Wellness',
      description: 'Talk to professional therapists and counselors',
      imageUri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Consult Now',
      onPress: () => handleFeaturePress('Mental Wellness'),
    },
    {
      id: '4',
      title: 'Medicine Delivery',
      description: 'Get medicines delivered at your doorstep',
      imageUri: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      actionText: 'Order Now',
      onPress: () => handleFeaturePress('Medicine Delivery'),
    },
    {
      id: '2',
      title: 'Health Check-up',
      description: 'Complete health packages at special prices',
      imageUri: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Check Offers',
      onPress: () => handleFeaturePress('Health Check-up'),
    },
    {
      id: '4',
      title: 'Medicine Delivery',
      description: 'Get medicines delivered at your doorstep',
      imageUri: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      actionText: 'Order Now',
      onPress: () => handleFeaturePress('Medicine Delivery'),
    },
  ];
 
  // Auto-scroll desktop health promotions
  const promoScrollRef = useRef<HTMLDivElement | null>(null);
  const [duplication, setDuplication] = useState(1);
  useEffect(() => {
    const container = promoScrollRef.current;
    if (!container) return;

    const getStep = () => {
      const first = container.firstElementChild as HTMLElement | null;
      const cardWidth = first?.getBoundingClientRect().width ?? 320; // fallback width for w-80
      const gap = 16; // Tailwind space-x-4
      return cardWidth + gap;
    };

    // Start after a short delay to ensure layout is measured
    const tick = () => {
      const c = promoScrollRef.current;
      if (!c) return;
      // Compute one full set width for seamless looping
      const first = c.firstElementChild as HTMLElement | null;
      const cardWidth = first?.getBoundingClientRect().width ?? 320;
      const gap = 16;
      const oneSetWidth = bannerData.length * cardWidth + Math.max(0, bannerData.length - 1) * gap;

      // If we've scrolled beyond one set, jump back by exactly one set (no animation)
      if (c.scrollLeft >= oneSetWidth) {
        c.scrollTo({ left: c.scrollLeft - oneSetWidth });
      }

      // Advance by one card (with gap)
      c.scrollBy({ left: getStep(), behavior: 'smooth' });
    };

    const startId = window.setTimeout(() => {
      // initial move so it looks active right away
      tick();
      const intervalId = window.setInterval(tick, 3000);
      // Store interval id on the element to clear later
      (container as any)._autoScrollId = intervalId;
    }, 300);

    return () => {
      window.clearTimeout(startId);
      const id = (container as any)._autoScrollId as number | undefined;
      if (id) window.clearInterval(id);
    };
  }, [bannerData.length]);

  // Ensure overflow on very wide screens by duplicating items
  useEffect(() => {
    const updateDuplication = () => {
      const c = promoScrollRef.current;
      if (!c) return;
      const first = c.firstElementChild as HTMLElement | null;
      const cardWidth = first?.getBoundingClientRect().width ?? 320;
      const gap = 16;
      const singleRowWidth = bannerData.length * cardWidth + Math.max(0, bannerData.length - 1) * gap;
      if (singleRowWidth <= 0) return;
      const needed = Math.max(1, Math.ceil((c.clientWidth + 1) / singleRowWidth) + 1);
      setDuplication(Math.max(2, Math.min(needed, 4))); // ensure at least two sets for seamless loop
    };

    updateDuplication();
    window.addEventListener('resize', updateDuplication);
    return () => window.removeEventListener('resize', updateDuplication);
  }, [bannerData.length]);

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
  

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header - positioned within the layout system */}
      <div className="sticky top-0 z-30 bg-white">
        <UniversalHeader
          title={`Hi, ${user?.FullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'User'}!`}
          subtitle={new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
          variant="home"
          showBackButton={false}
          rightContent={
            <div className="flex items-center space-x-2">
              {/* Location */}
              <button className="hidden sm:flex items-center bg-white/15 px-3 py-1.5 rounded-lg hover:bg-white/25 transition-colors duration-200">
                <Icon name="location" size="small" color="white" className="mr-1" />
                <Typography variant="caption" className="text-white text-xs">
                  {locationText}
                </Typography>
              </button>

              {/* Notifications */}
              {/* <button 
                onClick={() => router.push('/notifications')}
                className="relative w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center hover:bg-white/25 transition-colors duration-200"
              >
                <Icon name="bell" size="small" color="white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Typography variant="caption" className="text-white text-xs font-bold">3</Typography>
                </span>
              </button> */}

              {/* Book Appointment */}
              <button
                onClick={() => handleFeaturePress('Book Appointment')}
                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
              >
                <Typography variant="body2" className="text-white font-semibold">Book Appointment</Typography>
              </button>
            </div>
          }
        />
      </div>

      {/* Main content - no top padding needed with sticky header */}
      <main>

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
                icon={<Icon name={item.iconName} size="medium" color="#1e40af" />}
                title={item.title}
                bgColor={item.title === 'Health Bot' ? 'bg-white' : 'bg-white'}
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
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center transition-colors duration-200 ${item.title === 'Health Bot' ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-50 group-hover:bg-white'
                      }`}>
                      <Icon name={item.iconName} color="#1e40af" className="w-8 h-8 lg:w-14 lg:h-14" />
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
              onClick={() => router.push('/appointments')}
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
                  status={((): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
                    const s = String(appointment.status).toLowerCase();
                    if (s === 'scheduled') return 'upcoming';
                    if (s === 'ongoing') return 'ongoing';
                    if (s === 'completed') return 'completed';
                    if (s === 'cancelled' || s === 'canceled') return 'cancelled';
                    return 'upcoming';
                  })()}
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
                  onPress={() => router.push(`/appointments/${appointment._id}`)}
                />
              ))
            ) : (
              <div className="flex-shrink-0 w-full text-center py-8">
                <Typography variant="body2" className="text-gray-500">
                  No upcoming appointments
                </Typography>
                <button
                  onClick={() => handleFeaturePress('Book Appointment')}
                  className="mt-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

          {/* Mobile: keep auto scroll banner */}
          <div className="md:hidden">
            <AutoScrollBanner
              data={bannerData}
              autoScrollInterval={4000}
            />
          </div>

          {/* Desktop: grid cards with non-cropped images (now horizontally scrollable) */}
          <div className="hidden md:block">
            <div ref={promoScrollRef} className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
              {Array.from({ length: duplication }).map((_, dupIndex) => (
                <React.Fragment key={`dup-${dupIndex}`}>
                  {bannerData.map((item, index) => (
                    <div
                      key={`${item.id}-${index}-${dupIndex}`}
                      className="flex-shrink-0 w-80 group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="relative w-full aspect-[16/9] bg-gray-50">
                        <Image
                          src={item.imageUri}
                          alt={item.title}
                          fill
                          sizes="(min-width: 768px) 25vw"
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="p-4">
                        <Typography variant="body1" className="text-gray-900 font-semibold">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 mt-1">
                          {item.description}
                        </Typography>
                        <button
                          className="mt-3 inline-flex items-center bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-full transition-colors duration-200"
                          onClick={item.onPress}
                        >
                          <Typography variant="body2" className="text-white font-medium">
                            {item.actionText}
                          </Typography>
                        </button>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
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
