'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Button, Input } from '../atoms';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age?: string;
  profileImage?: string;
  mobileNumber?: string;
  altMobileNumber?: string;
  email?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  chronicDiseases?: string[];
  gender?: string;
  height?: string | number;
  weight?: string | number;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  userType?: string;
  subscription?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ResponsiveFamilyUIProps {
  familyMembers: FamilyMember[];
  selectedMember: string;
  selectedMemberData?: FamilyMember;
  showAddMember: boolean;
  newMemberName: string;
  newMemberEmail: string;
  newMemberMobile: string;
  onGoBack: () => void;
  onMemberSelect: (memberId: string) => void;
  onAddMember: () => Promise<boolean>;
  onDeleteMember: (memberId: string) => Promise<boolean>;
  onEditMember: (memberId: string, updatedData: Partial<FamilyMember>) => Promise<boolean>;
  onCancelAdd: () => void;
  onMemberDetails: (memberId: string) => void;
  onShowAddMember: () => void;
  onNewMemberNameChange: (value: string) => void;
  onNewMemberEmailChange: (value: string) => void;
  onNewMemberMobileChange: (value: string) => void;
}

// Enhanced Family Member Card for Mobile
const MobileFamilyCard: React.FC<{
  member: FamilyMember;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ member, onPress, onEdit, onDelete }) => (
  <div
    onClick={onPress}
    className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
  >
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
        {member.profileImage ? (
          <img
            src={member.profileImage}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name={member.id === 'self' ? 'user' : 'family'} size="medium" color="#0E3293" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{member.name}</h3>
        <p className="text-sm text-gray-500 mb-1">{member.relation}</p>
        {member.mobileNumber && (
          <p className="text-xs text-gray-400">+91 {member.mobileNumber}</p>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Icon name="edit" size="small" color="#2563EB" />
        </button>
        {member.id !== 'self' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Icon name="trash" size="small" color="#DC2626" />
          </button>
        )}
      </div>
    </div>
  </div>
);

// Desktop/Tablet List Item
const DesktopFamilyItem: React.FC<{
  member: FamilyMember;
  isSelected: boolean;
  onPress: () => void;
}> = ({ member, isSelected, onPress }) => (
  <div
    onClick={onPress}
    className={`px-6 py-4 cursor-pointer border-b border-gray-100 flex items-center gap-4 hover:bg-blue-50 transition-colors ${
      isSelected ? 'bg-blue-100 border-blue-200' : ''
    }`}
  >
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
      {member.profileImage ? (
        <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
      ) : (
        <Icon name={member.id === 'self' ? 'user' : 'family'} size="small" color="#0E3293" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-gray-800 truncate">{member.name}</div>
      <div className="text-sm text-gray-500 truncate">{member.relation}</div>
    </div>
    {isSelected && (
      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
    )}
  </div>
);

// Enhanced Detail Panel
const DetailPanel: React.FC<{ member: FamilyMember | null }> = ({ member }) => {
  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <Icon name="family" size="large" color="#D1D5DB" className="mb-4" />
        <h3 className="text-xl font-medium text-gray-500 mb-2">Select a Family Member</h3>
        <p className="text-gray-400 text-center">Choose a member from the list to view their details</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
              {member.profileImage ? (
                <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <Icon name={member.id === 'self' ? 'user' : 'family'} size="large" color="#0E3293" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{member.name}</h2>
              <p className="text-gray-600">{member.relation}</p>
              {member.age && <p className="text-sm text-gray-500 mt-1">{member.age} years old</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {(member.email || member.mobileNumber || member.altMobileNumber) && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Icon name="phone" size="small" color="#0E3293" className="mr-2" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {member.email && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-32">Email:</span>
                  <span className="text-gray-600">{member.email}</span>
                </div>
              )}
              {member.mobileNumber && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-32">Mobile:</span>
                  <span className="text-gray-600">+91 {member.mobileNumber}</span>
                </div>
              )}
              {member.altMobileNumber && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-32">Alt. Mobile:</span>
                  <span className="text-gray-600">{member.altMobileNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Information */}
        {(member.bloodGroup || (member.allergies && member.allergies.length > 0) || (member.chronicDiseases && member.chronicDiseases.length > 0)) && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Icon name="heart" size="small" color="#DC2626" className="mr-2" />
              Medical Information
            </h3>
            <div className="space-y-3">
              {member.bloodGroup && (
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-32">Blood Group:</span>
                  <span className="text-gray-600">{member.bloodGroup}</span>
                </div>
              )}
              {member.allergies && member.allergies.length > 0 && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-32 mt-1">Allergies:</span>
                  <div className="flex flex-wrap gap-2">
                    {member.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {member.chronicDiseases && member.chronicDiseases.length > 0 && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-32 mt-1">Conditions:</span>
                  <div className="flex flex-wrap gap-2">
                    {member.chronicDiseases.map((disease, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {disease}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center">
              <Icon name="calendar" size="medium" color="#0E3293" className="mb-2" />
              <span className="text-sm font-medium text-blue-800">Book Appointment</span>
            </button>
            <button className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors flex flex-col items-center">
              <Icon name="document" size="medium" color="#059669" className="mb-2" />
              <span className="text-sm font-medium text-green-800">View Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResponsiveFamilyUI: React.FC<ResponsiveFamilyUIProps> = ({
  familyMembers,
  selectedMember,
  selectedMemberData,
  showAddMember,
  newMemberName,
  newMemberEmail,
  newMemberMobile,
  onGoBack,
  onMemberSelect,
  onAddMember,
  onDeleteMember,
  onEditMember,
  onCancelAdd,
  onMemberDetails,
  onShowAddMember,
  onNewMemberNameChange,
  onNewMemberEmailChange,
  onNewMemberMobileChange,
}) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter members based on search
  const filteredMembers = familyMembers.filter(member =>
    member?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
    member?.relation?.toLowerCase()?.includes(searchText.toLowerCase()) ||
    member?.email?.toLowerCase()?.includes(searchText.toLowerCase())
  );

  const handleMemberPress = (member: FamilyMember) => {
    if (isMobile) {
      router.push(`/family/${member.id}`);
    } else {
      onMemberDetails(member.id);
    }
  };

  const handleEditPress = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    onNewMemberNameChange(member.name || '');
    onNewMemberEmailChange(member.email || '');
    onNewMemberMobileChange(member.mobileNumber || '');
    onShowAddMember();
  };

  const handleDeletePress = async (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      await onDeleteMember(memberId);
    }
  };

  const handleSubmit = async () => {
    if (!newMemberName.trim()) return;

    try {
      if (editingMemberId) {
        await onEditMember(editingMemberId, {
          name: newMemberName,
          email: newMemberEmail,
          mobileNumber: newMemberMobile,
        });
        setEditingMemberId(null);
      } else {
        await onAddMember();
      }
    } catch (error) {
      console.error('Failed to save member:', error);
    }
  };

  const handleCancel = () => {
    setEditingMemberId(null);
    onCancelAdd();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-[#0e3293] px-4 pt-3 pb-4">
        <div className="flex items-center">
          <button
            onClick={onGoBack}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors mr-2"
          >
            <Icon name="arrow-left" size="medium" color="white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">Family Members</h1>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4 py-4">
        <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          <Icon name="search" size="small" color="#9CA3AF" />
          <input
            type="text"
            className="flex-1 pl-3 text-gray-800 text-base outline-none"
            placeholder="Search family members..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button onClick={() => setSearchText('')} className="p-1">
              <Icon name="x" size="small" color="#9CA3AF" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-20">
        {isMobile ? (
          // Mobile Layout: List only
          <div className="space-y-3">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <MobileFamilyCard
                  key={member.id}
                  member={member}
                  onPress={() => handleMemberPress(member)}
                  onEdit={() => handleEditPress(member)}
                  onDelete={() => handleDeletePress(member.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <Icon name="family" size="large" color="#D1D5DB" className="mb-4" />
                <p className="text-gray-400 text-center">No family members found</p>
              </div>
            )}
            
            {/* Floating Add Button */}
            <button
              onClick={() => {
                setEditingMemberId(null);
                onShowAddMember();
              }}
              className="fixed bottom-20 right-6 bg-[#0e3293] w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
            >
              <Icon name="plus" size="medium" color="white" />
            </button>
          </div>
        ) : (
          // Desktop/Tablet Layout: Split view
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <div className="flex h-full">
              {/* Left Panel: Family List */}
              <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setEditingMemberId(null);
                      onShowAddMember();
                    }}
                    className="w-full bg-[#0e3293] text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Icon name="plus" size="small" color="white" className="mr-2" />
                    Add Family Member
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <DesktopFamilyItem
                        key={member.id}
                        member={member}
                        isSelected={selectedMember === member.id}
                        onPress={() => handleMemberPress(member)}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                      <Icon name="family" size="large" color="#D1D5DB" className="mb-4" />
                      <p className="text-center">No family members found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Member Details */}
              <div className="flex-1">
                <DetailPanel member={selectedMemberData || null} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddMember && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={handleCancel}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-[#0e3293] mb-6 text-center">
                {editingMemberId ? 'Edit Family Member' : 'Add Family Member'}
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Name"
                  value={newMemberName}
                  onChange={(e) => onNewMemberNameChange(e.target.value)}
                />

                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email"
                  value={newMemberEmail}
                  onChange={(e) => onNewMemberEmailChange(e.target.value)}
                />

                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mobile Number (10 digits)"
                  value={newMemberMobile}
                  onChange={(e) => {
                    const cleanText = e.target.value.replace(/\D/g, '').slice(0, 10);
                    onNewMemberMobileChange(cleanText);
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#0e3293] text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingMemberId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResponsiveFamilyUI;
