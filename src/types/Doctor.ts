// Canonical Doctor type for both API and UI usage

export interface DoctorDepartment {
  _id: string;
  departmentName: string;
}

export interface DoctorQualification {
  _id: string;
  degree: string;
  institution: string;
  year: number;
  certificates?: string[];
}

export interface DoctorAvailabilitySlot {
  _id: string;
  startTime: string;
  endTime: string;
  appointmentLimit: number;
  bookedCount: number;
}

export interface DoctorAvailability {
  _id: string;
  clinic: string;
  day: string;
  slots: DoctorAvailabilitySlot[];
}

export interface DoctorClinic {
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
  clinicPhone?: string;
  clinicEmail?: string;
  clinicImage?: string | null;
  clinicStatus?: string;
  clinicType?: string;
  clinicDescription?: string;
  Department?: DoctorDepartment[];
  OPD?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  _id: string;
  fullName: string;
  gender: string;
  staffID: string;
  email: string;
  phone: string;
  profileImage: string;
  isSpecialized: boolean;
  specializations: string[];
  qualifications: DoctorQualification[];
  experience: number;
  languagesSpoken: string[];
  bio: string;
  consultationFee: number;
  availability: DoctorAvailability[];
  scheduleType: string;
  isAvailableNow: boolean;
  status: string;
  staffRole: string;
  department: DoctorDepartment[];
  clinic: DoctorClinic[];
  HomeService: {
    offered: string;
    fee: number;
  };
  ratings: {
    average: number;
    count: number;
  };
}
