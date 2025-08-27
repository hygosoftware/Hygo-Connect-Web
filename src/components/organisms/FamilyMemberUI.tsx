'use client';

import React, { useState, useEffect } from 'react';
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
    info: 'bg-white0'
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
        {member?.profileImage ? (
          <img
            src={member.profileImage}
            alt={member?.name || 'Family member'}
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name={member?.id === 'self' ? 'user' : 'family'} size="medium" color="#9CA3AF" />
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1 text-center">
        {member?.name || 'Unknown'}
      </h3>

      <div className="flex justify-between w-full mt-1 gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 flex items-center justify-center bg-white py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Icon name="edit" size="small" color="#2563EB" />
        </button>
        {member?.id !== 'self' && (
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
      {member?.profileImage ? (
        <img
          src={member.profileImage}
          alt={member?.name || 'Family member'}
          className="w-full h-full object-cover"
        />
      ) : (
        <Icon name={member?.id === 'self' ? 'user' : 'family'} size="small" color="#9CA3AF" />
      )}
    </div>
    <div className="flex-1 mx-4">
      <h3 className="text-base font-semibold text-gray-800">{member?.name || 'Unknown'}</h3>
      <p className="text-xs text-gray-500 mt-1">
        {member?.mobileNumber ? `+91 ${member.mobileNumber}` : (member?.relation || 'Family Member')}
      </p>
    </div>
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Icon name="edit" size="small" color="#2563EB" />
      </button>
      {member?.id !== 'self' && (
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
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState<ToastProps>({ visible: false, message: '', type: 'info' });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);


  // Filter members based on search
  const filteredMembers = familyMembers.filter(member =>
    member?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
    member?.relation?.toLowerCase()?.includes(searchText.toLowerCase()) ||
    member?.email?.toLowerCase()?.includes(searchText.toLowerCase())
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
    setEditingMemberId(member?.id || '');
    onNewMemberNameChange(member?.name || '');
   
    onNewMemberEmailChange(member?.email || '');
    onNewMemberMobileChange(member?.mobileNumber || '');
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
      <div className="bg-[#0e3293] px-4 pt-3 pb-4 header">
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
      {/* Desktop: Split Layout | Mobile: Old Layout */}
      <div className="flex-1 px-4 pb-32">
        <div className="hidden md:flex h-[70vh] bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Left: Member List */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`px-5 py-4 cursor-pointer border-b border-gray-100 flex items-center gap-4 hover:bg-white transition-colors ${selectedMember === member.id ? 'bg-blue-100' : ''}`}
                      onClick={() => handleMemberPress(member)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {member.profileImage ? (
                          <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <Icon name={member.id === 'self' ? 'user' : 'family'} size="small" color="#9CA3AF" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{member.name}</div>
                        <div className="text-xs text-gray-500 truncate">{member.relation}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </div>
              <div className="p-4">
                <button
                  onClick={() => {
                    setEditingMemberId(null);
                    onShowAddMember();
                  }}
                  className="w-full bg-[#0e3293] text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  + Add Family Member
                </button>
              </div>
            </div>
          </div>
          {/* Right: Member Details */}
          <div className="flex-1 overflow-y-auto p-8">
            {selectedMemberData ? (
              <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedMemberData.profileImage ? (
                      <img src={selectedMemberData.profileImage} alt={selectedMemberData.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name={selectedMemberData.id === 'self' ? 'user' : 'family'} size="large" color="#9CA3AF" />
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{selectedMemberData.name}</div>
                    <div className="text-gray-500 text-sm">{selectedMemberData.relation}</div>
                  </div>
                </div>

                {/* Contact */}
                {(selectedMemberData.email || selectedMemberData.mobileNumber || selectedMemberData.altMobileNumber) && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-500 mb-2">Contact</div>
                    <div className="space-y-2">
                      {selectedMemberData.email && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Email:</span>
                          <span className="text-gray-700 break-all">{selectedMemberData.email}</span>
                        </div>
                      )}
                      {selectedMemberData.mobileNumber && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Mobile:</span>
                          <span className="text-gray-700">{selectedMemberData.mobileNumber}</span>
                        </div>
                      )}
                      {selectedMemberData.altMobileNumber && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Alt. Mobile:</span>
                          <span className="text-gray-700">{selectedMemberData.altMobileNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Personal */}
                {(selectedMemberData.gender || selectedMemberData.dateOfBirth || selectedMemberData.age) && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-500 mb-2">Personal</div>
                    <div className="space-y-2">
                      {selectedMemberData.gender && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Gender:</span>
                          <span className="text-gray-700">{selectedMemberData.gender}</span>
                        </div>
                      )}
                      {selectedMemberData.dateOfBirth && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Date of Birth:</span>
                          <span className="text-gray-700">{selectedMemberData.dateOfBirth}</span>
                        </div>
                      )}
                      {selectedMemberData.age && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Age:</span>
                          <span className="text-gray-700">{selectedMemberData.age}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical */}
                {(selectedMemberData.bloodGroup || (selectedMemberData.allergies && selectedMemberData.allergies.length) || (selectedMemberData.chronicDiseases && selectedMemberData.chronicDiseases.length) || (selectedMemberData.medications && selectedMemberData.medications.length)) && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-500 mb-2">Medical</div>
                    <div className="space-y-2">
                      {selectedMemberData.bloodGroup && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Blood Group:</span>
                          <span className="text-gray-700">{selectedMemberData.bloodGroup}</span>
                        </div>
                      )}
                      {selectedMemberData.allergies && selectedMemberData.allergies.length > 0 && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Allergies:</span>
                          <span className="text-gray-700">{selectedMemberData.allergies.join(', ')}</span>
                        </div>
                      )}
                      {selectedMemberData.chronicDiseases && selectedMemberData.chronicDiseases.length > 0 && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Chronic Diseases:</span>
                          <span className="text-gray-700">{selectedMemberData.chronicDiseases.join(', ')}</span>
                        </div>
                      )}
                      {selectedMemberData.medications && selectedMemberData.medications.length > 0 && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Medications:</span>
                          <span className="text-gray-700">{selectedMemberData.medications.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Body Metrics */}
                {(selectedMemberData.height || selectedMemberData.weight) && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-500 mb-2">Body Metrics</div>
                    <div className="space-y-2">
                      {selectedMemberData.height && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Height:</span>
                          <span className="text-gray-700">{selectedMemberData.height}</span>
                        </div>
                      )}
                      {selectedMemberData.weight && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Weight:</span>
                          <span className="text-gray-700">{selectedMemberData.weight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {(selectedMemberData.address || selectedMemberData.city || selectedMemberData.state || selectedMemberData.country) && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-500 mb-2">Location</div>
                    <div className="space-y-2">
                      {selectedMemberData.address && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Address:</span>
                          <span className="text-gray-700">{selectedMemberData.address}</span>
                        </div>
                      )}
                      {selectedMemberData.city && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">City:</span>
                          <span className="text-gray-700">{selectedMemberData.city}</span>
                        </div>
                      )}
                      {selectedMemberData.state && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">State:</span>
                          <span className="text-gray-700">{selectedMemberData.state}</span>
                        </div>
                      )}
                      {selectedMemberData.country && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Country:</span>
                          <span className="text-gray-700">{selectedMemberData.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account */}
                {(selectedMemberData.userType || selectedMemberData.subscription || selectedMemberData.createdAt || selectedMemberData.updatedAt) && (
                  <div className="mb-2">
                    <div className="text-sm font-semibold text-gray-500 mb-2">Account</div>
                    <div className="space-y-2">
                      {selectedMemberData.userType && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">User Type:</span>
                          <span className="text-gray-700">{selectedMemberData.userType}</span>
                        </div>
                      )}
                      {selectedMemberData.subscription && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Subscription:</span>
                          <span className="text-gray-700">{selectedMemberData.subscription}</span>
                        </div>
                      )}
                      {selectedMemberData.createdAt && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Created At:</span>
                          <span className="text-gray-700">{new Date(selectedMemberData.createdAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedMemberData.updatedAt && (
                        <div className="flex items-center text-base">
                          <span className="font-semibold text-gray-900 w-40">Updated At:</span>
                          <span className="text-gray-700">{new Date(selectedMemberData.updatedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Select a member to view details</div>
            )}
          </div>
        </div>
        {/* Mobile: old layout (grid/list) */}
        <div className="md:hidden">
          {filteredMembers.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="flex flex-wrap gap-4 justify-start">
                {filteredMembers.filter(member => member && member.id).map((member) => (
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
              <div className="space-y-3">
                {filteredMembers.filter(member => member && member.id).map((member) => (
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
          {/* Floating Action Button (mobile only) */}
          <button
            onClick={() => {
              setEditingMemberId(null);
              onShowAddMember();
            }}
            className="fixed bottom-20 right-6 bg-[#0e3293] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
          >
            <Icon name="plus" size="medium" color="white" />
          </button>
        </div>
      </div>

      {/* Floating Action Button */}
      {/* (Now handled in desktop left pane and mobile as before) */}

      {/* Add/Edit Modal */}
      {showAddMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
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
