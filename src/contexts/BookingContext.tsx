'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface Doctor {
  _id: string;
  fullName: string;
  specializations: string[];
  qualifications: Array<{
    _id: string;
    degree: string;
    institution: string;
    year: number;
  }>;
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

export interface Clinic {
  _id: string;
  clinicName: string;
  clinicAddress: {
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
  clinicType: string;
  rating: number;
  phone: string;
  email: string;
  description: string;
  services: string[];
  images: string[];
  doctors: Doctor[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  bookedCount: number;
  maxBookings: number;
}

export interface BookingDetails {
  patientType: 'self' | 'family';
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  patientPhone?: string;
  patientEmail?: string;
  symptoms?: string;
  notes?: string;
}

export interface BookingState {
  // Flow control
  currentStep: 'selection' | 'doctor' | 'clinic' | 'date' | 'slot' | 'details' | 'review' | 'payment' | 'confirmation';
  bookingFlow: 'doctor' | 'clinic';
  
  // Selected data
  selectedDoctor: Doctor | null;
  selectedClinic: Clinic | null;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  bookingDetails: BookingDetails | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Payment
  paymentMethod: 'card' | 'upi' | 'wallet' | null;
  paymentStatus: 'pending' | 'processing' | 'success' | 'failed' | null;
}

type BookingAction =
  | { type: 'SET_BOOKING_FLOW'; payload: 'doctor' | 'clinic' }
  | { type: 'SET_STEP'; payload: BookingState['currentStep'] }
  | { type: 'SELECT_DOCTOR'; payload: Doctor }
  | { type: 'SELECT_CLINIC'; payload: Clinic }
  | { type: 'SELECT_DATE'; payload: Date }
  | { type: 'SELECT_SLOT'; payload: TimeSlot }
  | { type: 'SET_BOOKING_DETAILS'; payload: BookingDetails }
  | { type: 'SET_PAYMENT_METHOD'; payload: BookingState['paymentMethod'] }
  | { type: 'SET_PAYMENT_STATUS'; payload: BookingState['paymentStatus'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
  currentStep: 'doctor', // Start with doctor step by default
  bookingFlow: 'doctor',
  selectedDoctor: null,
  selectedClinic: null,
  selectedDate: null,
  selectedSlot: null,
  bookingDetails: null,
  loading: false,
  error: null,
  paymentMethod: null,
  paymentStatus: null,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_BOOKING_FLOW':
      return {
        ...state,
        bookingFlow: action.payload,
        currentStep: 'selection', // Keep on selection step when changing flow
        selectedDoctor: null,
        selectedClinic: null,
        selectedDate: null,
        selectedSlot: null,
        bookingDetails: null,
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SELECT_DOCTOR':
      return { ...state, selectedDoctor: action.payload };
    case 'SELECT_CLINIC':
      return { ...state, selectedClinic: action.payload };
    case 'SELECT_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SELECT_SLOT':
      return { ...state, selectedSlot: action.payload };
    case 'SET_BOOKING_DETAILS':
      return { ...state, bookingDetails: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_PAYMENT_STATUS':
      return { ...state, paymentStatus: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_BOOKING':
      return initialState;
    default:
      return state;
  }
}

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  // Helper functions
  setBookingFlow: (flow: 'doctor' | 'clinic') => void;
  setStep: (step: BookingState['currentStep']) => void;
  selectDoctor: (doctor: Doctor) => void;
  selectClinic: (clinic: Clinic) => void;
  selectDate: (date: Date) => void;
  selectSlot: (slot: TimeSlot) => void;
  setBookingDetails: (details: BookingDetails) => void;
  setPaymentMethod: (method: BookingState['paymentMethod']) => void;
  setPaymentStatus: (status: BookingState['paymentStatus']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetBooking: () => void;
  goBack: () => void;
  goNext: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Helper functions
  const setBookingFlow = (flow: 'doctor' | 'clinic') => {
    dispatch({ type: 'SET_BOOKING_FLOW', payload: flow });
  };

  const setStep = (step: BookingState['currentStep']) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const selectDoctor = (doctor: Doctor) => {
    dispatch({ type: 'SELECT_DOCTOR', payload: doctor });
  };

  const selectClinic = (clinic: Clinic) => {
    dispatch({ type: 'SELECT_CLINIC', payload: clinic });
  };

  const selectDate = (date: Date) => {
    dispatch({ type: 'SELECT_DATE', payload: date });
  };

  const selectSlot = (slot: TimeSlot) => {
    dispatch({ type: 'SELECT_SLOT', payload: slot });
  };

  const setBookingDetails = (details: BookingDetails) => {
    dispatch({ type: 'SET_BOOKING_DETAILS', payload: details });
  };

  const setPaymentMethod = (method: BookingState['paymentMethod']) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const setPaymentStatus = (status: BookingState['paymentStatus']) => {
    dispatch({ type: 'SET_PAYMENT_STATUS', payload: status });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetBooking = () => {
    dispatch({ type: 'RESET_BOOKING' });
  };

  const goBack = () => {
    const stepOrder: BookingState['currentStep'][] = [
      'doctor', 'clinic', 'date', 'slot', 'details', 'review', 'payment', 'confirmation'
    ];

    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      let previousStep = stepOrder[currentIndex - 1];

      // For clinic flow, skip doctor step when going back from date
      if (state.bookingFlow === 'clinic' && state.currentStep === 'date' && previousStep === 'doctor') {
        previousStep = 'clinic';
      }

      setStep(previousStep);
    }
  };

  const goNext = () => {
    const stepOrder: BookingState['currentStep'][] = [
      'doctor', 'clinic', 'date', 'slot', 'details', 'review', 'payment', 'confirmation'
    ];

    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      let nextStep = stepOrder[currentIndex + 1];

      // For clinic flow, skip doctor step when going from clinic to date
      if (state.bookingFlow === 'clinic' && state.currentStep === 'clinic' && nextStep === 'date') {
        // Don't skip, let it go to date naturally
      }

      setStep(nextStep);
    }
  };

  const value: BookingContextType = {
    state,
    dispatch,
    setBookingFlow,
    setStep,
    selectDoctor,
    selectClinic,
    selectDate,
    selectSlot,
    setBookingDetails,
    setPaymentMethod,
    setPaymentStatus,
    setLoading,
    setError,
    resetBooking,
    goBack,
    goNext,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
