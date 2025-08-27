'use client';

import React, { useState } from 'react';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { BookingDetails } from '../../contexts/BookingContext';

// Mock family members data - in real app, this would come from user's profile
const mockFamilyMembers = [
  { id: '1', name: 'John Doe (Father)', age: 45, gender: 'male' },
  { id: '2', name: 'Jane Doe (Mother)', age: 42, gender: 'female' },
  { id: '3', name: 'Mike Doe (Brother)', age: 20, gender: 'male' },
  { id: '4', name: 'Sarah Doe (Sister)', age: 18, gender: 'female' },
];

const BookingDetailsForm: React.FC = () => {
  const { state, setBookingDetails, setStep } = useBooking();

  const [patientType, setPatientType] = useState<'self' | 'family'>('self');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>('');

  const handleSubmit = () => {
    let bookingDetails: BookingDetails;

    if (patientType === 'self') {
      bookingDetails = {
        patientType: 'self',
        patientName: 'Current User', // In real app, get from user profile
        patientAge: undefined,
        patientGender: undefined,
        patientPhone: '',
        patientEmail: '',
        symptoms: '',
        notes: ''
      };
    } else {
      const familyMember = mockFamilyMembers.find(m => m.id === selectedFamilyMember);
      if (!familyMember) return;

      bookingDetails = {
        patientType: 'family',
        patientName: familyMember.name,
        patientAge: familyMember.age,
        patientGender: familyMember.gender as 'male' | 'female',
        patientPhone: '',
        patientEmail: '',
        symptoms: '',
        notes: ''
      };
    }

    setBookingDetails(bookingDetails);
    setStep('review');
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <Typography variant="h4" className="text-gray-900 font-bold mb-2">
            Patient Details
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            Please provide the patient information for this appointment
          </Typography>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Patient Type Selection */}
          <div className="mb-4 sm:mb-6">
            <Typography variant="body1" className="text-gray-900 font-medium mb-3">
              Who is this appointment for?
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setPatientType('self')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  patientType === 'self'
                    ? 'border-[#0e3293] bg-[#0e3293]/5'
                    : 'border-gray-200 hover:border-[#0e3293]/50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    patientType === 'self' ? 'bg-[#0e3293]' : 'bg-gray-100'
                  }`}>
                    <Icon
                      name="user"
                      size="small"
                      color={patientType === 'self' ? 'white' : '#6b7280'}
                    />
                  </div>
                  <div className="text-left">
                    <Typography variant="body1" className="text-gray-900 font-medium">
                      Myself
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Book for yourself
                    </Typography>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPatientType('family')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  patientType === 'family'
                    ? 'border-[#0e3293] bg-[#0e3293]/5'
                    : 'border-gray-200 hover:border-[#0e3293]/50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    patientType === 'family' ? 'bg-[#0e3293]' : 'bg-gray-100'
                  }`}>
                    <Icon
                      name="users"
                      size="small"
                      color={patientType === 'family' ? 'white' : '#6b7280'}
                    />
                  </div>
                  <div className="text-left">
                    <Typography variant="body1" className="text-gray-900 font-medium">
                      Family Member
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Book for someone else
                    </Typography>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Family Member Selection */}
          {patientType === 'family' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Family Member
              </label>
              <select
                value={selectedFamilyMember}
                onChange={(e) => setSelectedFamilyMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0e3293] focus:border-[#0e3293] bg-white text-base sm:text-sm"
              >
                <option value="">Choose a family member</option>
                {mockFamilyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Patient Summary */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-4">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Appointment will be booked for:
            </Typography>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#0e3293] rounded-full flex items-center justify-center mr-3">
                <Icon
                  name={patientType === 'self' ? 'user' : 'users'}
                  size="small"
                  color="white"
                />
              </div>
              <div>
                <Typography variant="body1" className="text-gray-900 font-medium">
                  {patientType === 'self'
                    ? 'Yourself'
                    : selectedFamilyMember
                      ? mockFamilyMembers.find(m => m.id === selectedFamilyMember)?.name
                      : 'Select a family member'
                  }
                </Typography>
                {patientType === 'family' && selectedFamilyMember && (
                  <Typography variant="caption" className="text-gray-600">
                    {mockFamilyMembers.find(m => m.id === selectedFamilyMember)?.age} years old
                  </Typography>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSubmit}
              disabled={patientType === 'family' && !selectedFamilyMember}
              className="w-full bg-[#0e3293] hover:bg-[#0e3293]/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 sm:py-3 px-4 sm:px-6 rounded-xl font-medium text-base sm:text-lg transition-colors"
            >
              Continue to Review
            </Button>
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Icon name="info" size="small" color="#3b82f6" className="mr-3 mt-0.5" />
            <div>
              <Typography variant="body2" className="text-blue-800 font-medium mb-1">
                Privacy & Security
              </Typography>
              <Typography variant="caption" className="text-blue-700">
                Your personal information is encrypted and secure. We follow strict privacy guidelines to protect your data.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsForm;
