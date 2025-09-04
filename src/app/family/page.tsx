'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyMemberUI } from '../../components/organisms';
import { TokenManager } from '../../services/auth';
import { familyMemberService, FamilyMember as ApiFamilyMember, CreateFamilyMemberRequest } from '../../services/apiServices';
// UI Types (for compatibility with existing components)
interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: string;
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

// Helper functions to convert between API and UI models
type ApiMemberEnvelope = {
  patientDetails?: { patientInfo?: Partial<ApiFamilyMember> & { _id?: string } };
  _id?: string;
} & Partial<ApiFamilyMember>;

const convertApiToUiMember = (apiResponse: ApiMemberEnvelope): FamilyMember => {
  // Handle the nested API response structure
  // The structure can be: { patientDetails: { patientInfo: {...} } } or direct member object
  const member = (apiResponse?.patientDetails?.patientInfo as ApiMemberEnvelope | undefined) ?? apiResponse;

  // Some payloads embed the real patient in _id as an object:
  // { _id: { _id: '...', FullName: '...', ... }, accessAccount: [...] }
  const source: any = (member && typeof (member as any)._id === 'object') ? (member as any)._id : member;

  // Normalize ID (handle variations)
  const id =
    (source as any)?._id ||
    (source as any)?.id ||
    (source as any)?.patientId ||
    (member as any)?._id ||
    (apiResponse as any)?._id || '';

  // Normalize Name (handle variations: FullName/fullName/Name/name/first+last)
  const firstName = (source as any)?.firstName || (source as any)?.FirstName;
  const lastName = (source as any)?.lastName || (source as any)?.LastName;
  const composed = [firstName, lastName].filter(Boolean).join(' ').trim();
  const name =
    (source as any)?.FullName ||
    (source as any)?.fullName ||
    (source as any)?.Name ||
    (source as any)?.name ||
    (source as any)?.PatientName ||
    (source as any)?.patientName ||
    (composed || 'Unknown');

  // Normalize relation if backend provides it
  const relation =
    (source as any)?.Relation ||
    (source as any)?.relation ||
    (member as any)?.Relation ||
    (member as any)?.relation ||
    (apiResponse as any)?.Relation ||
    (apiResponse as any)?.relation ||
    'Family Member';

  // Normalize age
  const ageVal = (source as any)?.Age ?? (source as any)?.age;

  // Normalize profile photo
  const profileImage = (source as any)?.profilePhoto || (source as any)?.profileImage || (source as any)?.avatar;

  // Normalize mobile
  let mobileNumber: string | undefined;
  const m = (source as any)?.MobileNumber ?? (source as any)?.mobileNumber ?? (source as any)?.phone;
  if (Array.isArray(m) && m.length > 0) {
    const first = m[0];
    if (typeof first === 'object' && first !== null && 'number' in first) {
      mobileNumber = String((first as any).number).replace(/^\+\d{1,3}/, '');
    } else {
      mobileNumber = String(first).replace(/^\+\d{1,3}/, '');
    }
  } else if (typeof m === 'string' && m.trim()) {
    mobileNumber = m.replace(/^\+\d{1,3}/, '');
  }

  // Normalize alternative number
  let altMobileNumber: string | undefined;
  const alt = (source as any)?.AlternativeNumber ?? (source as any)?.alternativeNumber;
  if (Array.isArray(alt) && alt.length > 0) {
    const first = alt[0];
    if (typeof first === 'object' && first !== null && 'number' in first) {
      altMobileNumber = String((first as any).number).replace(/^\+\d{1,3}/, '');
    } else {
      altMobileNumber = String(first).replace(/^\+\d{1,3}/, '');
    }
  } else if (typeof alt === 'string' && alt.trim()) {
    altMobileNumber = alt.replace(/^\+\d{1,3}/, '');
  }

  // Normalize email
  const email = (source as any)?.Email || (source as any)?.email;

  // Normalize DOB
  const dobRaw =
    (source as any)?.DateOfBirth ||
    (source as any)?.dateOfBirth ||
    (source as any)?.DOB ||
    (source as any)?.dob;
  const dateOfBirth = dobRaw ? new Date(dobRaw).toISOString().split('T')[0] : undefined;

  // Normalize blood group
  const bloodGroup = (source as any)?.BloodGroup || (source as any)?.bloodGroup;

  // Normalize allergies
  const allergies = (source as any)?.Allergies || (source as any)?.allergies || [];

  // Additional fields
  const chronicDiseases = (source as any)?.ChronicDiseases || (source as any)?.chronicDiseases || [];
  const gender = (source as any)?.Gender || (source as any)?.gender;
  const height = (source as any)?.Height || (source as any)?.height;
  const weight = (source as any)?.Weight || (source as any)?.weight;
  const country = (source as any)?.Country || (source as any)?.country;
  const state = (source as any)?.State || (source as any)?.state;
  const city = (source as any)?.City || (source as any)?.city;
  const address = (source as any)?.Address || (source as any)?.address;
  const userType = (source as any)?.UserType || (source as any)?.userType;
  const subscription = (source as any)?.subscription || (source as any)?.Subscription;
  const createdAt = (source as any)?.createdAt;
  const updatedAt = (source as any)?.updatedAt;

  return {
    id: id || 'unknown',
    name,
    relation,
    age: typeof ageVal === 'number' ? String(ageVal) : (ageVal || ''),
    profileImage,
    mobileNumber,
    altMobileNumber,
    email,
    dateOfBirth,
    bloodGroup,
    allergies,
    medications: [],
    chronicDiseases,
    gender,
    height,
    weight,
    country,
    state,
    city,
    address,
    userType,
    subscription,
    createdAt,
    updatedAt
  };
};

const convertUiToApiMember = (uiMember: Partial<FamilyMember>): CreateFamilyMemberRequest => ({
  FullName: uiMember.name || '',
  Email: uiMember.email,
  MobileNumber: uiMember.mobileNumber ? [{
    number: `+91${uiMember.mobileNumber}`, // Add country code
    isVerified: false
  }] : [],
  DateOfBirth: uiMember.dateOfBirth,
  BloodGroup: uiMember.bloodGroup,
});

const FamilyPage: React.FC = () => {
  const router = useRouter();

  // State
  const [selectedMember, setSelectedMember] = useState('');
const [selectedMemberDetails, setSelectedMemberDetails] = useState<FamilyMember | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userId } = TokenManager.getTokens();

  // Load family members on component mount
  const loadFamilyMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Guard: ensure user is logged in
      if (!userId) {
        setError('Please login to view family members.');
        setLoading(false);
        return;
      }

      const apiResponse = await familyMemberService.getFamilyMembers(userId);

      // familyMemberService.getFamilyMembers returns a normalized array of members
      const uiMembers = apiResponse.map(convertApiToUiMember);

      setFamilyMembers(uiMembers);
      if (uiMembers.length > 0) {
        const firstWithId = uiMembers.find(m => m.id && m.id !== 'unknown');
        if (firstWithId?.id) setSelectedMember(firstWithId.id);
        else setSelectedMember(uiMembers[0].id);
      }

     

    } catch (error: any) {
      let errorMessage = 'Failed to load family members';
      // Narrow error type safely
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if ((error as any) && typeof error === 'object') {
        const maybeAxios = error as { response?: { status?: number }; code?: string; message?: string };
        if (maybeAxios.response?.status === 500) {
          errorMessage = 'Server error: There might be an issue with the database. Please try again later.';
        } else if (maybeAxios.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (maybeAxios.response?.status === 404) {
          errorMessage = 'Family members endpoint not found. Using offline mode.';
        } else if (maybeAxios.code === 'ECONNABORTED' || maybeAxios.message?.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        }
      }

      setError(errorMessage);

      // No fallback data - show error state instead
      setFamilyMembers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadFamilyMembers();
  }, [loadFamilyMembers]);

  // Check if mobile view
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleGoBack = () => {
    router.back();
  };

  const handleMemberSelect = async (memberId: string) => {
    if (isMobile) {
      // On mobile, navigate to detail page
      router.push(`/family/${memberId}`);
      return;
    }
    
    // On desktop, show details in the same page
    setSelectedMember(memberId);
    setSelectedMemberDetails(null);
    try {
      // Guard: ensure user is logged in
      if (!userId) {
        setError('Please login to view member details.');
        return;
      }
      const apiDetail = await familyMemberService.getFamilyMemberDetails(userId, memberId);
      if (apiDetail) {
        setSelectedMemberDetails(convertApiToUiMember(apiDetail));
      }
    } finally {
      // no-op
    }
  };

  // Utility to remove undefined fields from an object (preserve type)
  function removeUndefined<T extends object>(obj: T): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    ) as T;
  }

  const handleAddMember = async (): Promise<boolean> => {
    if (!newMemberName.trim()) return false;
    try {
      // Guard: ensure user is logged in
      if (!userId) {
        setError('Please login to add a family member.');
        return false;
      }
      const memberData = removeUndefined(convertUiToApiMember({
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || undefined,
        mobileNumber: newMemberMobile.trim() || undefined,
      }));

      console.log('Payload being sent to addFamilyMember:', memberData);
      const addedMember = await familyMemberService.addFamilyMember(userId, memberData);

      if (addedMember) {
        const uiMember = convertApiToUiMember(addedMember);
        uiMember.relation = newMemberRelation.trim(); // Set the relation from form
        // Optimistically add to list and select
        setFamilyMembers([...familyMembers, uiMember]);
        if (!selectedMember) {
          setSelectedMember(uiMember.id);
        }
        // Refresh list from server to ensure data is up-to-date
        await loadFamilyMembers();
        // Ensure the newly added member stays selected if available
        if (uiMember.id) {
          setSelectedMember(uiMember.id);
        }
        setNewMemberName('');
        // removed unused age field
        setNewMemberRelation('');
        setNewMemberEmail('');
        setNewMemberMobile('');
        setShowAddMember(false);
        return true;
      } else {
        setError('Failed to add family member');
        return false;
      }
    } catch (error) {
      setError('Failed to add family member');
      return false;
    }
  };

  const handleDeleteMember = async (memberId: string): Promise<boolean> => {
    try {
      const success = await familyMemberService.deleteFamilyMember(memberId);

      if (success) {
        const nextList = familyMembers.filter(member => member.id !== memberId);
        setFamilyMembers(nextList);
        if (selectedMember === memberId) {
          setSelectedMember(nextList[0]?.id || '');
        }
        return true;
      } else {
        setError('Failed to delete family member');
        return false;
      }
    } catch (error) {
      setError('Failed to delete family member');
      return false;
    }
  };

  const handleEditMember = async (memberId: string, updatedData: Partial<FamilyMember>): Promise<boolean> => {
    try {
      // Guard: ensure user is logged in
      if (!userId) {
        setError('Please login to update a family member.');
        return false;
      }
      const apiUpdates = convertUiToApiMember(updatedData);
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
        return true;
      } else {
        setError('Failed to update family member');
        return false;
      }
    } catch (error) {
      setError('Failed to update family member');
      return false;
    }
  };

  const handleCancelAdd = () => {
    setShowAddMember(false);
    setNewMemberName('');
    setNewMemberRelation('');
    setNewMemberEmail('');
    setNewMemberMobile('');
  };

  const handleMemberDetails = async (memberId: string) => {
    setSelectedMember(memberId);
    setSelectedMemberDetails(null);
    try {
      // Guard: ensure user is logged in
      if (!userId) {
        setError('Please login to view member details.');
        return;
      }
      const apiDetail = await familyMemberService.getFamilyMemberDetails(userId, memberId);
      if (apiDetail) {
        setSelectedMemberDetails(convertApiToUiMember(apiDetail));
      }
    } finally {
      // no-op
    }
  };

  // Show fetched details if available, else fallback to local
  const selectedMemberData = selectedMemberDetails || familyMembers.find(member => member.id === selectedMember);

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
                  void loadFamilyMembers();
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
        newMemberEmail={newMemberEmail}
        newMemberMobile={newMemberMobile}
        onGoBack={handleGoBack}
        onMemberSelect={(id) => { void handleMemberSelect(id); }}
        onAddMember={handleAddMember}
        onDeleteMember={handleDeleteMember}
        onEditMember={handleEditMember}
        onCancelAdd={handleCancelAdd}
        onMemberDetails={(id) => { void handleMemberDetails(id); }}
        onShowAddMember={() => setShowAddMember(true)}
        onNewMemberNameChange={setNewMemberName}
        onNewMemberEmailChange={setNewMemberEmail}
        onNewMemberMobileChange={setNewMemberMobile}
      />
    </>
  );
};

export default FamilyPage;

