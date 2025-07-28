'use client';

import React, { useState, useEffect } from 'react';
import { Icon, Button, Input } from '../atoms';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: string;
  profileImage?: string;
  mobileNumber?: string;
  email?: string;
  bloodGroup?: string;
  allergies?: string[];
  medications?: string[];
}

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'info' | 'error' | 'success';
}

interface FamilyMemberUIProps {
  familyMembers: FamilyMember[];
  selectedMember: string;
  selectedMemberData?: FamilyMember;
  showAddMember: boolean;
  newMemberName: string;
  newMemberAge: string;
  newMemberRelation: string;
  newMemberEmail: string;
  newMemberMobile: string;

  // Handlers
  onGoBack: () => void;
  onMemberSelect: (memberId: string) => void;
  onAddMember: () => void;
  onDeleteMember: (memberId: string) => void;
  onEditMember: (memberId: string, updatedData: Partial<FamilyMember>) => void;
  onCancelAdd: () => void;
  onMemberDetails: (memberId: string) => void;
  onShowAddMember: () => void;
  onNewMemberNameChange: (value: string) => void;
  onNewMemberAgeChange: (value: string) => void;
  onNewMemberRelationChange: (value: string) => void;
  onNewMemberEmailChange: (value: string) => void;
  onNewMemberMobileChange: (value: string) => void;
}

// Toast Component
const Toast: React.FC<ToastProps & { onHide?: () => void }> = ({
  visible,
  message,
  type = 'info',
  onHide
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`fixed bottom-24 left-4 right-4 ${bgColor} py-3 px-4 rounded-xl shadow-lg z-50 transition-all duration-300`}>
      <p className="text-white font-medium text-center">{message}</p>
    </div>
  );
};

// Input Field Component
const InputField: React.FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}> = ({ placeholder, value, onChange, type = 'text' }) => (
  <input
    type={type}
    className="border border-gray-200 rounded-xl px-4 py-3 mb-3 bg-white text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

// Family Member Card Component (Grid View)
const FamilyMemberCard: React.FC<{
  member: FamilyMember;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ member, onPress, onEdit, onDelete }) => (
  <div
    onClick={onPress}
    className="rounded-2xl p-4 mb-4 w-40 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
  >
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full mb-3 bg-gray-100 flex items-center justify-center overflow-hidden">
        {member.profileImage ? (
          <img
            src={member.profileImage}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name={member.id === 'self' ? 'user' : 'family'} size="medium" color="#9CA3AF" />
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1 text-center">
        {member.name}
      </h3>
      <p className="text-xs text-gray-500 mb-2 text-center">{member.relation}</p>
      <div className="flex justify-between w-full mt-1 gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 flex items-center justify-center bg-blue-50 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Icon name="edit" size="small" color="#2563EB" />
        </button>
        {member.id !== 'self' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 flex items-center justify-center bg-red-50 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Icon name="trash" size="small" color="#DC2626" />
          </button>
        )}
      </div>
    </div>
  </div>
);

// Family Member List Item Component (List View)
const FamilyMemberListItem: React.FC<{
  member: FamilyMember;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ member, onPress, onEdit, onDelete }) => (
  <div
    onClick={onPress}
    className="flex items-center justify-between bg-white py-4 px-4 mb-3 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
  >
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
      {member.profileImage ? (
        <img
          src={member.profileImage}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <Icon name={member.id === 'self' ? 'user' : 'family'} size="small" color="#9CA3AF" />
      )}
    </div>
    <div className="flex-1 mx-4">
      <h3 className="text-base font-semibold text-gray-800">{member.name}</h3>
      <p className="text-xs text-gray-500 mt-1">
        {member.mobileNumber ? `+91 ${member.mobileNumber}` : member.relation}
      </p>
    </div>
    <div className="flex gap-2">
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
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center py-20">
    <Icon name="family" size="large" color="#D1D5DB" />
    <p className="text-gray-400 mt-4 text-base">No family members found</p>
    <p className="text-gray-400 text-sm mt-1">Add new members with the + button</p>
  </div>
);

const FamilyMemberUI: React.FC<FamilyMemberUIProps> = ({
  familyMembers,
  selectedMember,
  selectedMemberData,
  showAddMember,
  newMemberName,
  newMemberAge,
  newMemberRelation,
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
  onNewMemberAgeChange,
  onNewMemberRelationChange,
  onNewMemberEmailChange,
  onNewMemberMobileChange,
}) => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState<ToastProps>({ visible: false, message: '', type: 'info' });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const relationOptions = [
    'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister',
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin', 'Spouse', 'Other'
  ];

  // Filter members based on search
  const filteredMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Show toast message
  const showToast = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ visible: true, message, type });
  };

  // Hide toast
  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'info' });
  };

  // Handle member actions
  const handleMemberPress = (member: FamilyMember) => {
    onMemberDetails(member.id);
  };

  const handleEditPress = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    onNewMemberNameChange(member.name);
    onNewMemberAgeChange(member.age);
    onNewMemberRelationChange(member.relation);
    onNewMemberEmailChange(member.email || '');
    onNewMemberMobileChange(member.mobileNumber || '');
    onShowAddMember();
  };

  const handleDeletePress = (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      onDeleteMember(memberId);
      showToast('Family member deleted successfully!', 'success');
    }
  };

  const handleSubmit = () => {
    if (!newMemberName.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }

    if (editingMemberId) {
      onEditMember(editingMemberId, {
        name: newMemberName,
        age: newMemberAge,
        relation: newMemberRelation,
        email: newMemberEmail,
        mobileNumber: newMemberMobile,
      });
      showToast('Family member updated successfully!', 'success');
    } else {
      onAddMember();
      showToast('Family member added successfully!', 'success');
    }

    setEditingMemberId(null);
  };

  const handleCancel = () => {
    setEditingMemberId(null);
    onCancelAdd();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0e3293] px-4 pt-3 pb-4">
        <div className="flex items-center">
          <button
            onClick={onGoBack}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors md:hidden mr-2"
          >
            <Icon name="arrow-left" size="medium" color="white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">Family Members</h1>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
            <Icon name="search" size="small" color="#9CA3AF" />
            <input
              type="text"
              className="flex-1 pl-2 text-gray-800 text-base py-1 outline-none"
              placeholder="Search Family Member"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button onClick={() => setSearchText('')}>
                <Icon name="close" size="small" color="#9CA3AF" />
              </button>
            )}
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="bg-[#0e3293] rounded-xl p-3 hover:bg-blue-700 transition-colors"
          >
            <Icon name={viewMode === 'grid' ? 'menu' : 'home'} size="small" color="white" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 pb-32">
        {filteredMembers.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="flex flex-wrap gap-4 justify-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
              {filteredMembers.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onPress={() => handleMemberPress(member)}
                  onEdit={() => handleEditPress(member)}
                  onDelete={() => handleDeletePress(member.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-4">
              {filteredMembers.map((member) => (
                <FamilyMemberListItem
                  key={member.id}
                  member={member}
                  onPress={() => handleMemberPress(member)}
                  onEdit={() => handleEditPress(member)}
                  onDelete={() => handleDeletePress(member.id)}
                />
              ))}
            </div>
          )
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingMemberId(null);
          onShowAddMember();
        }}
        className="fixed bottom-32 right-6 bg-[#0e3293] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <Icon name="plus" size="medium" color="white" />
      </button>

      {/* Add/Edit Modal */}
      {showAddMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-[#0e3293] mb-4 text-center">
              {editingMemberId ? 'Edit Family Member' : 'Add Family Member'}
            </h2>

            <InputField
              placeholder="Full Name"
              value={newMemberName}
              onChange={onNewMemberNameChange}
            />

            <InputField
              placeholder="Email"
              value={newMemberEmail}
              onChange={onNewMemberEmailChange}
              type="email"
            />

            <InputField
              placeholder="Mobile Number (10 digits)"
              value={newMemberMobile}
              onChange={(value) => {
                const cleanText = value.replace(/\D/g, '').slice(0, 10);
                onNewMemberMobileChange(cleanText);
              }}
              type="tel"
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <InputField
                placeholder="Age"
                value={newMemberAge}
                onChange={onNewMemberAgeChange}
                type="number"
              />

              <select
                value={newMemberRelation}
                onChange={(e) => onNewMemberRelationChange(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select relation</option>
                {relationOptions.map((relation) => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </div>
  );
};

export default FamilyMemberUI;
