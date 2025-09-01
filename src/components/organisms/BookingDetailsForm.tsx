'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Icon, Button } from '../atoms';
import { useBooking } from '../../contexts/BookingContext';
import { BookingDetails } from '../../contexts/BookingContext';
import { familyMemberService, type FamilyMember } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';

// Helper functions to normalize API data
const getMemberId = (m: FamilyMember): string => String(m._id || m.id || '');
const getMemberName = (m: FamilyMember): string => String(m.FullName || '');
const getMemberGender = (m: FamilyMember): 'male' | 'female' | 'other' | undefined => {
  const g = (m.Gender || '').toString().toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  return g ? 'other' : undefined;
};
const parseNumber = (val: unknown): number | undefined => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = parseInt(val, 10);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
};
const getAgeFromMember = (m: FamilyMember): number | undefined => {
  const age = parseNumber(m.Age);
  if (age !== undefined) return age;
  if (m.DateOfBirth) {
    const dob = new Date(m.DateOfBirth);
    if (!isNaN(dob.getTime())) {
      const today = new Date();
      let a = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) a--;
      return a;
    }
  }
  return undefined;
};

const BookingDetailsForm: React.FC = () => {
  const { state, setBookingDetails, setStep } = useBooking();

  const [patientType, setPatientType] = useState<'self' | 'family'>('self');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string>('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  useEffect(() => {
    // Preload family members when component mounts
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        setMembersError(null);
        const { userId } = TokenManager.getTokens();
        if (!userId) {
          setMembersError('User not authenticated.');
          setFamilyMembers([]);
          return;
        }
        const list = await familyMemberService.getFamilyMembers(userId);
        setFamilyMembers(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load family members', e);
        setMembersError('Failed to load family members.');
        setFamilyMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    loadMembers();
  }, []);

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
      const familyMember = familyMembers.find(m => getMemberId(m) === selectedFamilyMember);
      if (!familyMember) return;

      bookingDetails = {
        patientType: 'family',
        patientName: getMemberName(familyMember),
        patientAge: getAgeFromMember(familyMember),
        patientGender: getMemberGender(familyMember),
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0e3293] focus:border-[#0e3293] bg-white text-base sm:text-sm text-gray-900"
              >
                <option value="">{loadingMembers ? 'Loading...' : 'Choose a family member'}</option>
                {familyMembers.map((member) => {
                  const id = getMemberId(member);
                  const name = getMemberName(member) || 'Unnamed Member';
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
              {membersError && (
                <Typography variant="caption" className="text-red-600 mt-2 block">
                  {membersError}
                </Typography>
              )}
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
                      ? getMemberName(
                          familyMembers.find(m => getMemberId(m) === selectedFamilyMember) || ({} as FamilyMember)
                        )
                      : 'Select a family member'
                  }
                </Typography>
                {patientType === 'family' && selectedFamilyMember && (
                  <Typography variant="caption" className="text-gray-600">
                    {(() => {
                      const m = familyMembers.find(f => getMemberId(f) === selectedFamilyMember);
                      const a = m ? getAgeFromMember(m) : undefined;
                      return a !== undefined ? `${a} years old` : '';
                    })()}
                  </Typography>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={handleSubmit}
              disabled={(patientType === 'family' && !selectedFamilyMember) || loadingMembers}
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
