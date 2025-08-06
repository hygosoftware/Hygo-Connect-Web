'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyMemberUI } from '../../components/organisms';
import { familyMemberService, FamilyMember as ApiFamilyMember, CreateFamilyMemberRequest } from '../../services/apiServices';

// UI Types (for compatibility with existing components)
interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: string;
  profileImage?: string;
  mobileNumber?: string;
  email?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
}

// Helper functions to convert between API and UI models
const convertApiToUiMember = (apiResponse: any): FamilyMember => {
  // Handle the nested API response structure
  // The structure can be: { patientDetails: { patientInfo: {...} } } or direct member object
  const member = apiResponse?.patientDetails?.patientInfo || apiResponse._id || apiResponse;

  return {
    id: member._id || member.id || 'unknown',
    name: member.FullName || member.name || 'Unknown',
    relation: 'Family Member', // You might want to add a relation field to your schema
    age: member.Age?.toString() || '',
    profileImage: member.profilePhoto,
    mobileNumber: member.MobileNumber?.[0]?.number?.replace(/^\+\d{1,3}/, ''), // Remove country code
    email: member.Email,
    dateOfBirth: member.DateOfBirth ? new Date(member.DateOfBirth).toISOString().split('T')[0] : undefined,
    bloodGroup: member.BloodGroup,
    allergies: member.Allergies || [],
    medications: [] // You might want to add this to your schema or get from pill reminders
  };
};

const convertUiToApiMember = (uiMember: Partial<FamilyMember>, userId: string): CreateFamilyMemberRequest => ({
  FullName: uiMember.name || '',
  Email: uiMember.email,
  MobileNumber: uiMember.mobileNumber ? [{
    number: `+91${uiMember.mobileNumber}`, // Add country code
    isVerified: false
  }] : [],
  Age: uiMember.age ? parseInt(uiMember.age) : undefined,
  DateOfBirth: uiMember.dateOfBirth,
  BloodGroup: uiMember.bloodGroup as ApiFamilyMember['BloodGroup'],
  Allergies: uiMember.allergies || [],
});

const FamilyPage: React.FC = () => {
  const router = useRouter();

  // State
  const [selectedMember, setSelectedMember] = useState('self');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample user ID - in real app, get from auth context
  const userId = '685e823b3ec68e8bb8dae392';

  // Load family members on component mount
  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiResponse = await familyMemberService.getFamilyMembers(userId);

      // Handle the API response structure
      let apiMembers: any[] = [];

      if (Array.isArray(apiResponse)) {
        // Check if the first element has a patients array
        if (apiResponse.length > 0 && apiResponse[0].patients) {
          apiMembers = apiResponse[0].patients;
        } else {
          // If it's already an array of members, use it directly
          apiMembers = apiResponse;
        }
      } else if (apiResponse && typeof apiResponse === 'object' && (apiResponse as any).patients) {
        // If it has a patients property, extract it
        apiMembers = (apiResponse as any).patients;
      }

      const uiMembers = apiMembers.map(convertApiToUiMember);

      // Add self as first member (you might want to get this from user profile)
      const selfMember: FamilyMember = {
        id: 'self',
        name: 'Myself',
        relation: 'Self',
        age: '28',
        email: 'myself@email.com',
        mobileNumber: '9876543210',
        bloodGroup: 'O+',
        allergies: ['Peanuts', 'Shellfish'],
        medications: ['Vitamin D', 'Multivitamin']
      };

      const allMembers = [selfMember, ...uiMembers];
      setFamilyMembers(allMembers);

      if (apiMembers.length === 0) {
        setError('No family members found. You can add new members using the + button.');
      }

    } catch (error: any) {
      let errorMessage = 'Failed to load family members';

      if (error.response?.status === 500) {
        errorMessage = 'Server error: There might be an issue with the database. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Family members endpoint not found. Using offline mode.';
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      }

      setError(errorMessage);

      // No fallback data - show error state instead
      setFamilyMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleGoBack = () => {
    router.back();
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
  };

  const handleAddMember = async () => {
    if (newMemberName.trim() && newMemberAge.trim() && newMemberRelation.trim()) {
      try {
        const memberData = convertUiToApiMember({
          name: newMemberName.trim(),
          age: newMemberAge.trim(),
          email: newMemberEmail.trim() || undefined,
          mobileNumber: newMemberMobile.trim() || undefined,
        }, userId);

        const addedMember = await familyMemberService.addPatient(userId, memberData);

        if (addedMember) {
          const uiMember = convertApiToUiMember(addedMember);
          uiMember.relation = newMemberRelation.trim(); // Set the relation from form

          setFamilyMembers([...familyMembers, uiMember]);
          setNewMemberName('');
          setNewMemberAge('');
          setNewMemberRelation('');
          setNewMemberEmail('');
          setNewMemberMobile('');
          setShowAddMember(false);
        } else {
          setError('Failed to add family member');
        }
      } catch (error) {
        setError('Failed to add family member');
      }
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (memberId !== 'self') {
      try {
        const success = await familyMemberService.deleteFamilyMember(memberId);

        if (success) {
          setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
          if (selectedMember === memberId) {
            setSelectedMember('self');
          }
        } else {
          setError('Failed to delete family member');
        }
      } catch (error) {
        setError('Failed to delete family member');
      }
    }
  };

  const handleEditMember = async (memberId: string, updatedData: Partial<FamilyMember>) => {
    if (memberId === 'self') {
      // Handle self update locally for now
      setFamilyMembers(familyMembers.map(member =>
        member.id === memberId
          ? { ...member, ...updatedData }
          : member
      ));
      return;
    }

    try {
      const apiUpdates = convertUiToApiMember(updatedData, userId);
      const updatedMember = await familyMemberService.updateFamilyMember(memberId, apiUpdates);

      if (updatedMember) {
        const uiMember = convertApiToUiMember(updatedMember);
        // Preserve the relation from the original member
        const originalMember = familyMembers.find(m => m.id === memberId);
        if (originalMember) {
          uiMember.relation = originalMember.relation;
        }

        setFamilyMembers(familyMembers.map(member =>
          member.id === memberId ? uiMember : member
        ));
      } else {
        setError('Failed to update family member');
      }
    } catch (error) {
      setError('Failed to update family member');
    }
  };

  const handleCancelAdd = () => {
    setShowAddMember(false);
    setNewMemberName('');
    setNewMemberAge('');
    setNewMemberRelation('');
    setNewMemberEmail('');
    setNewMemberMobile('');
  };

  const handleMemberDetails = (memberId: string) => {
    router.push(`/family/${memberId}`);
  };

  const selectedMemberData = familyMembers.find(member => member.id === selectedMember);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family members...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 mx-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium">Error Loading Family Members</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => {
                  setError(null);
                  loadFamilyMembers();
                }}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <FamilyMemberUI
        familyMembers={familyMembers}
        selectedMember={selectedMember}
        selectedMemberData={selectedMemberData}
        showAddMember={showAddMember}
        newMemberName={newMemberName}
        newMemberAge={newMemberAge}
        newMemberRelation={newMemberRelation}
        newMemberEmail={newMemberEmail}
        newMemberMobile={newMemberMobile}
        onGoBack={handleGoBack}
        onMemberSelect={handleMemberSelect}
        onAddMember={handleAddMember}
        onDeleteMember={handleDeleteMember}
        onEditMember={handleEditMember}
        onCancelAdd={handleCancelAdd}
        onMemberDetails={handleMemberDetails}
        onShowAddMember={() => setShowAddMember(true)}
        onNewMemberNameChange={setNewMemberName}
        onNewMemberAgeChange={setNewMemberAge}
        onNewMemberRelationChange={setNewMemberRelation}
        onNewMemberEmailChange={setNewMemberEmail}
        onNewMemberMobileChange={setNewMemberMobile}
      />
    </>
  );
};

export default FamilyPage;
