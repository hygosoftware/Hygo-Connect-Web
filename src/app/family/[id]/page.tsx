'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Icon, Button, Input, UniversalHeader } from '../../../components/atoms';
import { familyMemberService, FamilyMember as ApiFamilyMember } from '../../../services/apiServices';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: string;
  profileImage?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
  phone?: string;
  email?: string;
  emergencyContact?: string;
  gender?: string;
  height?: number;
  weight?: number;
  country?: string;
  state?: string;
  city?: string;
}

// Helper function to convert API data to UI format
const convertApiToUiMember = (apiResponse: any): FamilyMember => {
  // Handle the nested API response structure
  const patientInfo = apiResponse?.patientDetails?.patientInfo || apiResponse;

  return {
    id: patientInfo._id || patientInfo.id || 'unknown',
    name: patientInfo.FullName || 'Unknown',
    relation: 'Family Member',
    age: patientInfo.Age?.toString() || '',
    profileImage: patientInfo.profilePhoto,
    dateOfBirth: patientInfo.DateOfBirth ? new Date(patientInfo.DateOfBirth).toISOString().split('T')[0] : undefined,
    bloodGroup: patientInfo.BloodGroup,
    allergies: patientInfo.Allergies || [],
    medications: [], // You might want to get this from pill reminders or chronic diseases
    phone: patientInfo.MobileNumber?.[0]?.number,
    email: patientInfo.Email,
    emergencyContact: patientInfo.AlternativeNumber || '',
    gender: patientInfo.Gender,
    height: patientInfo.Height,
    weight: patientInfo.Weight,
    country: patientInfo.Country,
    state: patientInfo.State,
    city: patientInfo.City
  };
};

const FamilyMemberDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  // Sample user ID - in real app, get from auth context
  const userId = '685e823b3ec68e8bb8dae392';

  const [memberData, setMemberData] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<FamilyMember | null>(null);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  // Load member data on component mount
  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load real member data from API for all members including self
      console.log('🔍 Loading family member details for:', { userId, memberId });
      const apiMember = await familyMemberService.getFamilyMemberDetails(userId, memberId);
      console.log('📊 API Response:', apiMember);

      if (apiMember) {
        const uiMember = convertApiToUiMember(apiMember);
        console.log('🎨 Converted UI Member:', uiMember);
        // Set relation based on member ID
        uiMember.relation = memberId === 'self' ? 'Self' : 'Family Member';
        setMemberData(uiMember);
        setEditData(uiMember);
      } else {
        setError('Family member not found');
      }
    } catch (error) {
      setError('Failed to load family member details');
    } finally {
      setLoading(false);
    }
  };

  const relationOptions = [
    'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister',
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin', 'Spouse', 'Other'
  ];

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <UniversalHeader
          title="Loading..."
          leftElement={
            <Button
              variant="ghost"
              size="small"
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Icon name="arrow-left" size="small" className="mr-2" />
              Back
            </Button>
          }
        />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading family member details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !memberData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <UniversalHeader
          title="Error"
          leftElement={
            <Button
              variant="ghost"
              size="small"
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Icon name="arrow-left" size="small" className="mr-2" />
              Back
            </Button>
          }
        />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="alert-circle" size="large" color="#DC2626" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Details</h2>
            <p className="text-gray-600 mb-4">{error || 'Family member not found'}</p>
            <Button
              variant="primary"
              size="medium"
              onClick={loadMemberData}
              className="mr-2"
            >
              Try Again
            </Button>
            <Button
              variant="ghost"
              size="medium"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editData || !memberData) return;

    try {
      // Update via API for all members including self
      const updates = {
        FullName: editData.name,
        Email: editData.email,
        Age: editData.age ? parseInt(editData.age) : undefined,
        Gender: editData.gender as ApiFamilyMember['Gender'],
        Height: editData.height,
        Weight: editData.weight,
        BloodGroup: editData.bloodGroup as ApiFamilyMember['BloodGroup'],
        Allergies: editData.allergies,
        Country: editData.country,
        State: editData.state,
        City: editData.city,
        MobileNumber: editData.phone ? [{
          number: editData.phone,
          isVerified: false
        }] : undefined,
        AlternativeNumber: editData.emergencyContact
      };

      const updatedMember = await familyMemberService.updateFamilyMember(memberId, updates);

      if (updatedMember) {
        const uiMember = convertApiToUiMember(updatedMember);
        // Preserve the relation
        uiMember.relation = memberId === 'self' ? 'Self' : 'Family Member';
        setMemberData(uiMember);
        setEditData(uiMember);
        setIsEditing(false);
      } else {
        setError('Failed to update family member');
      }
    } catch (error) {
      setError('Failed to save changes');
    }
  };

  const handleCancel = () => {
    setEditData(memberData);
    setIsEditing(false);
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setEditData({
        ...editData,
        allergies: [...(editData.allergies || []), newAllergy.trim()]
      });
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setEditData({
      ...editData,
      allergies: editData.allergies?.filter((_, i) => i !== index) || []
    });
  };

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setEditData({
        ...editData,
        medications: [...(editData.medications || []), newMedication.trim()]
      });
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setEditData({
      ...editData,
      medications: editData.medications?.filter((_, i) => i !== index) || []
    });
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <UniversalHeader
        title={memberData.name}
        subtitle={memberData.relation}
        variant="gradient"
        icon={memberData.id === 'self' ? 'user' : 'family'}
        showBackButton={true}
        onBackPress={() => router.back()}
        rightContent={
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={handleCancel} className="px-4 py-2 bg-white/20 text-white hover:bg-white/30">
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} className="px-4 py-2 bg-white text-[#0e3293] hover:bg-white/90 font-semibold">
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 flex items-center bg-white/20 text-white hover:bg-white/30"
              >
                <Icon name="edit" size="small" color="white" className="mr-2" />
                Edit
              </Button>
            )}
          </div>
        }
      />

      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto pb-20">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Profile Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Icon 
                  name={memberData.id === 'self' ? 'user' : 'family'} 
                  size="large" 
                  color="#0E3293" 
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{memberData.name}</h2>
                <p className="text-base sm:text-lg text-gray-600">{memberData.relation}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="w-full">
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData?.name || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg min-h-[48px] flex items-center">
                      {memberData.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <div className="w-full">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData?.age || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, age: e.target.value} : null)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg min-h-[48px] flex items-center">
                      {memberData.age} years
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Relation</label>
                <div className="w-full">
                  {isEditing ? (
                    <select
                      value={editData?.relation || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, relation: e.target.value} : null)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="Self">Self</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg min-h-[48px] flex items-center">
                      {memberData.relation}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="w-full">
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editData?.email || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, email: e.target.value} : null)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <div className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg min-h-[48px] flex items-center overflow-x-auto whitespace-pre-line break-all max-w-full">
                      {memberData.email || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="w-full">
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData?.phone || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, phone: e.target.value} : null)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg min-h-[48px] flex items-center">
                      {memberData.phone || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                <div className="w-full">
                  {isEditing ? (
                    <select
                      value={editData?.bloodGroup || ''}
                      onChange={(e) => setEditData(prev => prev ? {...prev, bloodGroup: e.target.value} : null)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <div className="text-base text-gray-800 bg-gray-50 p-3 rounded-lg min-h-[48px] flex items-center">
                      {memberData.bloodGroup || 'Not specified'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Allergies Section */}
          <div className="p-4 sm:p-6 border-t border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Allergies</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editData.allergies : memberData.allergies)?.map((allergy, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    <span>{allergy}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAllergy(index)}
                        className="ml-2 hover:bg-red-200 rounded-full p-1"
                      >
                        <Icon name="x" size="small" color="#DC2626" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add new allergy"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                  />
                  <Button variant="secondary" onClick={handleAddAllergy} className="px-4 py-2">
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Medications Section */}
          <div className="p-4 sm:p-6 border-t border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Current Medications</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(isEditing ? editData.medications : memberData.medications)?.map((medication, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    <span>{medication}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveMedication(index)}
                        className="ml-2 hover:bg-green-200 rounded-full p-1"
                      >
                        <Icon name="x" size="small" color="#059669" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add new medication"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMedication()}
                  />
                  <Button variant="secondary" onClick={handleAddMedication} className="px-4 py-2">
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <button className="p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex flex-col items-center">
                <Icon name="appointment" size="medium" color="#0E3293" className="mb-2" />
                <p className="text-xs sm:text-sm text-blue-800 font-medium text-center">Book Appointment</p>
              </button>
              <button className="p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex flex-col items-center">
                <Icon name="records" size="medium" color="#059669" className="mb-2" />
                <p className="text-xs sm:text-sm text-green-800 font-medium text-center">View Records</p>
              </button>
              <button className="p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex flex-col items-center">
                <Icon name="pills" size="medium" color="#7C3AED" className="mb-2" />
                <p className="text-xs sm:text-sm text-purple-800 font-medium text-center">Medications</p>
              </button>
              <button className="p-3 sm:p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors flex flex-col items-center">
                <Icon name="laboratory" size="medium" color="#EA580C" className="mb-2" />
                <p className="text-xs sm:text-sm text-orange-800 font-medium text-center">Lab Reports</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberDetailPage;
