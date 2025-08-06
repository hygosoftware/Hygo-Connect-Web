// Redesigned Profile Page
'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UniversalHeader } from '../../components/atoms';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/apiServices';
import { User, Mail, Phone, Calendar, MapPin, Heart, Activity, Edit3, Save, X, ChevronDown, Camera, Users, Home, Ruler, Weight, ArrowLeft, Check, Bell, Globe, LogOut, Lock, CreditCard } from 'lucide-react';

// Types
interface ProfileData {
  FullName: string;
  Email: string;
  MobileNumber: string;
  AlternativeNumber: string;
  Gender: string;
  Age: string;
  DateOfBirth: string;
  Country: string;
  State: string;
  City: string;
  Address: string;
  PostalCode: string;
  Nationality: string;
  MaritalStatus: string;
  Occupation: string;
  Height: string;
  Weight: string;
  BMI: string;
  BloodGroup: string;
  ChronicDiseases: string[];
  Allergies: string[];
  Medications: string[];
  profilePhoto: string | null;
  HealthCardStatus: string;
  HealthCardNumber: string;
  LastHealthCheckup: string;
  EmergencyContactName: string;
  EmergencyContactRelationship: string;
  EmergencyContactPhone: string;
  NotificationPreferences: string[];
  Language: string;
  ConnectedDevices: string[];
}

const defaultProfileData: ProfileData = {
  FullName: '',
  Email: '',
  MobileNumber: '',
  AlternativeNumber: '',
  Gender: '',
  Age: '',
  DateOfBirth: '',
  Country: '',
  State: '',
  City: '',
  Address: '',
  PostalCode: '',
  Nationality: '',
  MaritalStatus: '',
  Occupation: '',
  Height: '',
  Weight: '',
  BMI: '',
  BloodGroup: '',
  ChronicDiseases: [],
  Allergies: [],
  Medications: [],
  profilePhoto: null,
  HealthCardStatus: '',
  HealthCardNumber: '',
  LastHealthCheckup: '',
  EmergencyContactName: '',
  EmergencyContactRelationship: '',
  EmergencyContactPhone: '',
  NotificationPreferences: [],
  Language: '',
  ConnectedDevices: [],
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
  { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
  { id: 'medical', label: 'Medical Info', icon: <Heart className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact Info', icon: <Phone className="w-4 h-4" /> },
  { id: 'preferences', label: 'Preferences', icon: <Bell className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
];

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (isAuthenticated && user?._id) {
          const apiProfileData = await profileService.getProfileByUserId(user._id);
          const normalizeNumber = (num: any): string => {
            if (typeof num === 'string') return num;
            if (Array.isArray(num)) return num[0]?.number || '';
            if (num && typeof num === 'object') return num.number || '';
            return '';
          };
          setProfileData({
            ...defaultProfileData,
            ...apiProfileData,
            MobileNumber: normalizeNumber(apiProfileData?.MobileNumber),
            AlternativeNumber: normalizeNumber(apiProfileData?.AlternativeNumber),
            Age: apiProfileData?.Age !== undefined ? String(apiProfileData.Age) : '',
            Height: apiProfileData?.Height !== undefined ? String(apiProfileData.Height) : '',
            Weight: apiProfileData?.Weight !== undefined ? String(apiProfileData.Weight) : '',
            BMI: (apiProfileData && 'BMI' in apiProfileData && apiProfileData.BMI !== undefined) ? String(apiProfileData.BMI) : '',
          });
        }
      } catch (e: any) {
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  // Handle input changes
  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (user?._id) {
        // Format DateOfBirth to DD-MM-YYYY before sending
const toDDMMYYYY = (dateStr: string): string => {
  // If already in DD-MM-YYYY, return as is
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return '';
};
const dataToSend = {
  ...profileData,
  DateOfBirth: toDDMMYYYY(profileData.DateOfBirth),
};
await profileService.updateProfile(user._id, dataToSend);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (e: any) {
      setError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate profile completion
  const calculateProfileCompletion = (): number => {
    const fields = [
      'FullName', 'Email', 'MobileNumber', 'Gender', 'DateOfBirth',
      'Country', 'State', 'City', 'Height', 'Weight', 'BloodGroup',
      'HealthCardNumber', 'HealthCardStatus', 'EmergencyContactName',
      'EmergencyContactPhone', 'Address', 'PostalCode', 'Nationality', 'MaritalStatus', 'Occupation'
    ];
    const filled = fields.filter(f => profileData[f as keyof ProfileData] && String(profileData[f as keyof ProfileData]).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Age" value={profileData.Age || 'N/A'} icon={<Calendar className="w-5 h-5" />} />
              <StatCard label="Height" value={profileData.Height ? `${profileData.Height} cm` : 'N/A'} icon={<Ruler className="w-5 h-5" />} />
              <StatCard label="Weight" value={profileData.Weight ? `${profileData.Weight} kg` : 'N/A'} icon={<Weight className="w-5 h-5" />} />
              <StatCard label="Blood Group" value={profileData.BloodGroup || 'N/A'} icon={<Heart className="w-5 h-5" />} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Health Summary</h3>
              <div className="flex flex-wrap gap-8">
                <div>
                  <div className="font-medium text-gray-700">Chronic Diseases</div>
                  <div className="text-gray-900">{profileData.ChronicDiseases?.length ? profileData.ChronicDiseases.join(', ') : 'None'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Allergies</div>
                  <div className="text-gray-900">{profileData.Allergies?.length ? profileData.Allergies.join(', ') : 'None'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Health Card</div>
                  <div className="text-gray-900">{profileData.HealthCardStatus || 'N/A'} ({profileData.HealthCardNumber || '-'})</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Last Checkup</div>
                  <div className="text-gray-900">{profileData.LastHealthCheckup || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'personal':
        return (
          <SectionCard title="Personal Information">
            <Input label="Full Name" value={profileData.FullName} onChange={v => handleInputChange('FullName', v)} disabled={!isEditing} />
            <Input label="Gender" value={profileData.Gender} onChange={v => handleInputChange('Gender', v)} disabled={!isEditing} />
            <Input label="Date of Birth" value={profileData.DateOfBirth} onChange={v => handleInputChange('DateOfBirth', v)} disabled={!isEditing} type="date" />
            <Input label="Nationality" value={profileData.Nationality} onChange={v => handleInputChange('Nationality', v)} disabled={!isEditing} />
            <Input label="Marital Status" value={profileData.MaritalStatus} onChange={v => handleInputChange('MaritalStatus', v)} disabled={!isEditing} />
            <Input label="Occupation" value={profileData.Occupation} onChange={v => handleInputChange('Occupation', v)} disabled={!isEditing} />
            <Input label="Age" value={profileData.Age} onChange={v => handleInputChange('Age', v)} disabled={!isEditing} />
          </SectionCard>
        );
      case 'medical':
        return (
          <SectionCard title="Medical Information">
            <Input label="Height (cm)" value={profileData.Height} onChange={v => handleInputChange('Height', v)} disabled={!isEditing} type="number" />
            <Input label="Weight (kg)" value={profileData.Weight} onChange={v => handleInputChange('Weight', v)} disabled={!isEditing} type="number" />
            <Input label="BMI" value={profileData.BMI} onChange={v => handleInputChange('BMI', v)} disabled={true} />
            <Input label="Blood Group" value={profileData.BloodGroup} onChange={v => handleInputChange('BloodGroup', v)} disabled={!isEditing} />
            <Input label="Chronic Diseases" value={profileData.ChronicDiseases.join(', ')} onChange={v => handleInputChange('ChronicDiseases', v.split(','))} disabled={!isEditing} />
            <Input label="Allergies" value={profileData.Allergies.join(', ')} onChange={v => handleInputChange('Allergies', v.split(','))} disabled={!isEditing} />
            <Input label="Medications" value={profileData.Medications.join(', ')} onChange={v => handleInputChange('Medications', v.split(','))} disabled={!isEditing} />
            <Input label="Last Health Checkup" value={profileData.LastHealthCheckup} onChange={v => handleInputChange('LastHealthCheckup', v)} disabled={!isEditing} type="date" />
          </SectionCard>
        );
      case 'contact':
        return (
          <SectionCard title="Contact Information">
            <Input label="Mobile Number" value={profileData.MobileNumber} onChange={v => handleInputChange('MobileNumber', v)} disabled={!isEditing} />
            <Input label="Alternative Number" value={profileData.AlternativeNumber} onChange={v => handleInputChange('AlternativeNumber', v)} disabled={!isEditing} />
            <Input label="Email" value={profileData.Email} onChange={v => handleInputChange('Email', v)} disabled={!isEditing} />
            <Input label="Country" value={profileData.Country} onChange={v => handleInputChange('Country', v)} disabled={!isEditing} />
            <Input label="State" value={profileData.State} onChange={v => handleInputChange('State', v)} disabled={!isEditing} />
            <Input label="City" value={profileData.City} onChange={v => handleInputChange('City', v)} disabled={!isEditing} />
            <Input label="Address" value={profileData.Address} onChange={v => handleInputChange('Address', v)} disabled={!isEditing} />
            <Input label="Postal Code" value={profileData.PostalCode} onChange={v => handleInputChange('PostalCode', v)} disabled={!isEditing} />
            <Input label="Emergency Contact Name" value={profileData.EmergencyContactName} onChange={v => handleInputChange('EmergencyContactName', v)} disabled={!isEditing} />
            <Input label="Emergency Contact Relationship" value={profileData.EmergencyContactRelationship} onChange={v => handleInputChange('EmergencyContactRelationship', v)} disabled={!isEditing} />
            <Input label="Emergency Contact Phone" value={profileData.EmergencyContactPhone} onChange={v => handleInputChange('EmergencyContactPhone', v)} disabled={!isEditing} />
          </SectionCard>
        );
      case 'preferences':
        return (
          <SectionCard title="Preferences">
            <Input label="Language" value={profileData.Language} onChange={v => handleInputChange('Language', v)} disabled={!isEditing} />
            <Input label="Notification Preferences" value={profileData.NotificationPreferences.join(', ')} onChange={v => handleInputChange('NotificationPreferences', v.split(','))} disabled={!isEditing} />
            <Input label="Connected Devices" value={profileData.ConnectedDevices.join(', ')} onChange={v => handleInputChange('ConnectedDevices', v.split(','))} disabled={!isEditing} />
          </SectionCard>
        );
      case 'security':
        return (
          <SectionCard title="Security & Account">
            <button className="w-full flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-3 text-blue-900 font-medium mb-4"><Lock className="w-4 h-4" /> Change Password</button>
            <button className="w-full flex items-center gap-2 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-3 text-blue-900 font-medium mb-4"><CreditCard className="w-4 h-4" /> Manage Payment Methods</button>
            <button className="w-full flex items-center gap-2 bg-red-50 hover:bg-red-100 rounded-lg px-4 py-3 text-red-900 font-medium"><LogOut className="w-4 h-4" /> Logout</button>
          </SectionCard>
        );
      default:
        return null;
    }
  };

  if (isLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversalHeader
        title="My Profile"
        subtitle={`${calculateProfileCompletion()}% Complete`}
        variant="gradient"
        icon="user"
        showBackButton={true}
      />
      {/* Profile Card */}
      <div className="max-w-3xl mx-auto mt-8 mb-8 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="relative w-28 h-28 mx-auto md:mx-0">
            <Image
              src={profileData.profilePhoto || '/placeholder.svg'}
              alt="Profile Photo"
              width={112}
              height={112}
              className="rounded-full object-cover border-4 border-blue-100"
            />
            {isEditing && (
              <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow hover:bg-blue-100">
                <Camera className="w-4 h-4 text-blue-800" />
              </button>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="text-2xl font-bold text-gray-900 mb-1">{profileData.FullName || 'Your Name'}</div>
            <div className="text-gray-600 mb-1 flex items-center"><Mail className="w-4 h-4 mr-1" /> {profileData.Email || 'your@email.com'}</div>
            <div className="text-gray-600 mb-1 flex items-center"><Phone className="w-4 h-4 mr-1" /> {profileData.MobileNumber || 'Mobile Number'}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full" style={{ width: `${calculateProfileCompletion()}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">Profile Completion: {calculateProfileCompletion()}%</div>
          </div>
          <div className="flex flex-col gap-2">
            {isEditing ? (
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50" disabled={isSaving}>
                {isSaving ? 'Saving...' : (<><Save className="w-4 h-4" /> Save</>)}
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-blue-50 text-blue-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit</button>
            )}
            {isEditing && <button onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>}
          </div>
        </div>
        {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-3">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-3">{success}</div>}
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};

// Helper components
const StatCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center">
    <div className="mb-2 text-blue-700">{icon}</div>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="font-semibold text-gray-900 text-lg">{value}</div>
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl p-6 shadow-md mb-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; disabled?: boolean; type?: string }> = ({ label, value, onChange, disabled, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900 bg-gray-50 disabled:bg-gray-100"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      type={type}
    />
  </div>
);

export default ProfileScreen;
