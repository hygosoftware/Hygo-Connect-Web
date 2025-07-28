import { Doctor, Clinic, TimeSlot } from '../contexts/BookingContext';

// Mock Doctors Data
export const mockDoctors: Doctor[] = [
  {
    _id: '1',
    fullName: 'Dr. Sarah Johnson',
    specializations: ['Cardiology', 'Internal Medicine'],
    qualifications: [
      { _id: '1', degree: 'MD', institution: 'Harvard Medical School', year: 2010 },
      { _id: '2', degree: 'Fellowship', institution: 'Mayo Clinic', year: 2015 }
    ],
    ratings: { average: 4.8, count: 127 },
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
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
      },
      {
        _id: '2',
        clinicName: 'City General Hospital',
        clinicAddress: {
          addressLine: '456 Health Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400002',
          country: 'India'
        },
        clinicType: 'Multi-specialty',
        rating: 4.5,
        phone: '+91-9876543211',
        email: 'info@citygeneral.com'
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
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experience: 15,
    consultationFee: 400,
    isAvailableNow: false,
    department: 'Orthopedics',
    clinic: [
      {
        _id: '3',
        clinicName: 'Bone & Joint Clinic',
        clinicAddress: {
          addressLine: '789 Wellness Road',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        clinicType: 'Specialty',
        rating: 4.5,
        phone: '+91-9876543212',
        email: 'info@bonejoint.com'
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
    profileImage: 'https://images.unsplash.com/photo-1594824475317-d8b0b4b5b8b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experience: 8,
    consultationFee: 350,
    isAvailableNow: true,
    department: 'Dermatology',
    clinic: [
      {
        _id: '4',
        clinicName: 'Skin Care Clinic',
        clinicAddress: {
          addressLine: '321 Beauty Lane',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        clinicType: 'Specialty',
        rating: 4.8,
        phone: '+91-9876543213',
        email: 'info@skincare.com'
      }
    ]
  },
  {
    _id: '4',
    fullName: 'Dr. Michael Chen',
    specializations: ['Pediatrics', 'Child Development'],
    qualifications: [
      { _id: '7', degree: 'MBBS', institution: 'Christian Medical College', year: 2011 },
      { _id: '8', degree: 'MD Pediatrics', institution: 'JIPMER', year: 2015 }
    ],
    ratings: { average: 4.7, count: 98 },
    profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experience: 9,
    consultationFee: 300,
    isAvailableNow: true,
    department: 'Pediatrics',
    clinic: [
      {
        _id: '5',
        clinicName: 'Children\'s Health Center',
        clinicAddress: {
          addressLine: '654 Kids Avenue',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          country: 'India'
        },
        clinicType: 'Specialty',
        rating: 4.6,
        phone: '+91-9876543214',
        email: 'info@childrenshealth.com'
      }
    ]
  },
  {
    _id: '5',
    fullName: 'Dr. Anita Patel',
    specializations: ['Gynecology', 'Obstetrics'],
    qualifications: [
      { _id: '9', degree: 'MBBS', institution: 'BJ Medical College', year: 2009 },
      { _id: '10', degree: 'MS Gynecology', institution: 'Seth GS Medical College', year: 2013 }
    ],
    ratings: { average: 4.8, count: 142 },
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experience: 11,
    consultationFee: 450,
    isAvailableNow: true,
    department: 'Gynecology',
    clinic: [
      {
        _id: '6',
        clinicName: 'Women\'s Wellness Clinic',
        clinicAddress: {
          addressLine: '987 Care Street',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India'
        },
        clinicType: 'Specialty',
        rating: 4.7,
        phone: '+91-9876543215',
        email: 'info@womenswellness.com'
      }
    ]
  },
  {
    _id: '6',
    fullName: 'Dr. Amit Singh',
    specializations: ['Neurology', 'Stroke Medicine'],
    qualifications: [
      { _id: '11', degree: 'MBBS', institution: 'King George Medical University', year: 2007 },
      { _id: '12', degree: 'DM Neurology', institution: 'NIMHANS', year: 2012 }
    ],
    ratings: { average: 4.9, count: 76 },
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    experience: 13,
    consultationFee: 600,
    isAvailableNow: false,
    department: 'Neurology',
    clinic: [
      {
        _id: '7',
        clinicName: 'Neuro Care Institute',
        clinicAddress: {
          addressLine: '147 Brain Street',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500001',
          country: 'India'
        },
        clinicType: 'Specialty',
        rating: 4.8,
        phone: '+91-9876543216',
        email: 'info@neurocare.com'
      }
    ]
  }
];

// Mock Clinics Data
export const mockClinics: Clinic[] = [
  {
    _id: '1',
    clinicName: 'Heart Care Center',
    clinicAddress: {
      addressLine: '123 Medical Plaza',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760]
      }
    },
    clinicType: 'Specialty',
    rating: 4.7,
    phone: '+91-9876543210',
    email: 'info@heartcare.com',
    description: 'Leading cardiac care facility with state-of-the-art equipment and experienced cardiologists.',
    services: ['Cardiology', 'Cardiac Surgery', 'ECG', 'Echocardiography', 'Stress Testing'],
    images: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    doctors: [mockDoctors[0]]
  },
  {
    _id: '2',
    clinicName: 'City General Hospital',
    clinicAddress: {
      addressLine: '456 Health Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400002',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760]
      }
    },
    clinicType: 'Multi-specialty',
    rating: 4.5,
    phone: '+91-9876543211',
    email: 'info@citygeneral.com',
    description: 'Comprehensive healthcare facility offering multiple specialties under one roof.',
    services: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology', 'Orthopedics', 'Emergency Care'],
    images: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    doctors: [mockDoctors[0], mockDoctors[3]]
  },
  {
    _id: '3',
    clinicName: 'Bone & Joint Clinic',
    clinicAddress: {
      addressLine: '789 Wellness Road',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      }
    },
    clinicType: 'Specialty',
    rating: 4.5,
    phone: '+91-9876543212',
    email: 'info@bonejoint.com',
    description: 'Specialized orthopedic clinic with advanced treatment options for bone and joint disorders.',
    services: ['Orthopedics', 'Sports Medicine', 'Physiotherapy', 'Joint Replacement', 'Arthroscopy'],
    images: [
      'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    doctors: [mockDoctors[1]]
  },
  {
    _id: '4',
    clinicName: 'Skin Care Clinic',
    clinicAddress: {
      addressLine: '321 Beauty Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716]
      }
    },
    clinicType: 'Specialty',
    rating: 4.8,
    phone: '+91-9876543213',
    email: 'info@skincare.com',
    description: 'Premier dermatology clinic offering comprehensive skin care and cosmetic treatments.',
    services: ['Dermatology', 'Cosmetic Surgery', 'Laser Treatment', 'Skin Analysis', 'Anti-aging'],
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    doctors: [mockDoctors[2]]
  }
];

// Generate time slots for a given date
export const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    const slotId = `${date.toISOString().split('T')[0]}-${timeString}`;
    
    // Simulate random booking counts (0-5)
    const bookedCount = Math.floor(Math.random() * 6);
    
    slots.push({
      id: slotId,
      time: timeString,
      available: bookedCount < 5,
      bookedCount,
      maxBookings: 5
    });
  }
  
  return slots;
};

// Get available dates (next 30 days, excluding Sundays)
export const getAvailableDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip Sundays (0 = Sunday)
    if (date.getDay() !== 0) {
      dates.push(date);
    }
  }
  
  return dates;
};

// Mock API functions
export const mockAPI = {
  getDoctors: async (): Promise<Doctor[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockDoctors;
  },
  
  getClinics: async (): Promise<Clinic[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockClinics;
  },
  
  getDoctorsByClinic: async (clinicId: string): Promise<Doctor[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const clinic = mockClinics.find(c => c._id === clinicId);
    return clinic?.doctors || [];
  },
  
  getClinicsByDoctor: async (doctorId: string): Promise<Clinic[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const doctor = mockDoctors.find(d => d._id === doctorId);
    if (!doctor?.clinic) return [];
    
    return doctor.clinic.map(clinicData => {
      const fullClinic = mockClinics.find(c => c._id === clinicData._id);
      return fullClinic || {
        ...clinicData,
        services: [],
        images: [],
        doctors: [doctor]
      } as Clinic;
    });
  },
  
  getAvailableSlots: async (doctorId: string, clinicId: string, date: Date): Promise<TimeSlot[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return generateTimeSlots(date);
  },
  
  bookAppointment: async (bookingData: any): Promise<{ success: boolean; appointmentId?: string; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        appointmentId: `APT-${Date.now()}`
      };
    } else {
      return {
        success: false,
        error: 'Booking failed. Please try again.'
      };
    }
  }
};
