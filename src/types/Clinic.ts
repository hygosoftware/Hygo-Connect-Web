// Canonical Clinic type for both API and UI usage
import { Doctor } from './Doctor';

export interface Clinic {
  _id: string;
  clinicName: string;
  clinicAddress: {
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    location: {
      type: string;
      coordinates: number[];
    };
  };
  clinicType: string;
  rating: number;
  phone: string;
  email: string;
  description: string;
  services: string[];
  images: string[];
  doctors: Doctor[];
}
