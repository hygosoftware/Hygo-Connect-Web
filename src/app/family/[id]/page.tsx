'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Icon, Button, Input } from '../../../components/atoms';

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
}

const FamilyMemberDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  // Mock data - in real app, this would come from API/state management
  const [memberData, setMemberData] = useState<FamilyMember>({
    id: memberId,
    name: memberId === 'self' ? 'Myself' : 'John Doe',
    relation: memberId === 'self' ? 'Self' : 'Father',
    age: memberId === 'self' ? '28' : '55',
    bloodGroup: 'O+',
    allergies: ['Peanuts', 'Shellfish'],
    medications: ['Vitamin D', 'Multivitamin'],
    phone: '+1 234 567 8900',
    email: 'john.doe@email.com',
    emergencyContact: '+1 234 567 8901'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<FamilyMember>(memberData);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const relationOptions = [
    'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin', 'Spouse', 'Other'
  ];

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSave = () => {
    setMemberData(editData);
    setIsEditing(false);
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
      <div className="bg-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="arrow-left" size="medium" color="#0E3293" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold ml-2 text-gray-800">
            {memberData.name}
          </h1>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancel} className="px-4 py-2">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} className="px-4 py-2">
                Save
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 flex items-center"
            >
              <Icon name="edit" size="small" color="white" className="mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* Profile Section */}
          <div className="flex items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mr-6">
              <Icon 
                name={memberData.id === 'self' ? 'user' : 'family'} 
                size="large" 
                color="#0E3293" 
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{memberData.name}</h2>
              <p className="text-xl text-gray-600">{memberData.relation}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{memberData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData({...editData, age: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{memberData.age} years</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                {isEditing && memberData.id !== 'self' ? (
                  <select
                    value={editData.relation}
                    onChange={(e) => setEditData({...editData, relation: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {relationOptions.map((relation) => (
                      <option key={relation} value={relation}>{relation}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{memberData.relation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                {isEditing ? (
                  <select
                    value={editData.bloodGroup || ''}
                    onChange={(e) => setEditData({...editData, bloodGroup: e.target.value})}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select blood group</option>
                    {bloodGroupOptions.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{memberData.bloodGroup || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{memberData.phone || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="w-full"
                  />
                ) : (
                  <p className="text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">{memberData.email || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Allergies Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Allergies</h3>
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
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Medications</h3>
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
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Icon name="appointment" size="medium" color="#0E3293" className="mx-auto mb-2" />
                <p className="text-sm text-blue-800 font-medium">Book Appointment</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Icon name="records" size="medium" color="#059669" className="mx-auto mb-2" />
                <p className="text-sm text-green-800 font-medium">View Records</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Icon name="pills" size="medium" color="#7C3AED" className="mx-auto mb-2" />
                <p className="text-sm text-purple-800 font-medium">Medications</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Icon name="laboratory" size="medium" color="#EA580C" className="mx-auto mb-2" />
                <p className="text-sm text-orange-800 font-medium">Lab Reports</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyMemberDetailPage;
