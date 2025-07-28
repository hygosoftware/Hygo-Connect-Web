'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FamilyMemberUI } from '../../components/organisms';

// Types
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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: 'self',
      name: 'Myself',
      relation: 'Self',
      age: '28',
      email: 'myself@email.com',
      mobileNumber: '9876543210',
      bloodGroup: 'O+',
      allergies: ['Peanuts', 'Shellfish'],
      medications: ['Vitamin D', 'Multivitamin']
    },
    {
      id: '1',
      name: 'John Doe',
      relation: 'Father',
      age: '55',
      email: 'john.doe@email.com',
      mobileNumber: '9876543211',
      bloodGroup: 'A+',
      allergies: ['Dust'],
      medications: ['Blood pressure medication']
    },
    {
      id: '2',
      name: 'Jane Doe',
      relation: 'Mother',
      age: '52',
      email: 'jane.doe@email.com',
      mobileNumber: '9876543212',
      bloodGroup: 'B+',
      allergies: [],
      medications: ['Calcium supplements']
    },
    {
      id: '3',
      name: 'Mike Doe',
      relation: 'Brother',
      age: '25',
      email: 'mike.doe@email.com',
      mobileNumber: '9876543213',
      bloodGroup: 'O+',
      allergies: ['Cats'],
      medications: []
    },
  ]);

  // Handlers
  const handleGoBack = () => {
    router.back();
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(memberId);
  };

  const handleAddMember = () => {
    if (newMemberName.trim() && newMemberAge.trim() && newMemberRelation.trim()) {
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: newMemberName.trim(),
        relation: newMemberRelation.trim(),
        age: newMemberAge.trim(),
        email: newMemberEmail.trim() || undefined,
        mobileNumber: newMemberMobile.trim() || undefined,
        allergies: [],
        medications: []
      };

      setFamilyMembers([...familyMembers, newMember]);
      setNewMemberName('');
      setNewMemberAge('');
      setNewMemberRelation('');
      setNewMemberEmail('');
      setNewMemberMobile('');
      setShowAddMember(false);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    if (memberId !== 'self') {
      setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
      if (selectedMember === memberId) {
        setSelectedMember('self');
      }
    }
  };

  const handleEditMember = (memberId: string, updatedData: Partial<FamilyMember>) => {
    setFamilyMembers(familyMembers.map(member => 
      member.id === memberId 
        ? { ...member, ...updatedData }
        : member
    ));
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

  return (
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
  );
};

export default FamilyPage;
