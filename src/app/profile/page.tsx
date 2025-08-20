// Modern Profile Page - Database Schema Aligned
'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { UniversalHeader } from '../../components/atoms';
import { useAuth } from '../../hooks/useAuth';
import { profileService, UpdateProfileRequest } from '../../services/apiServices';
import { User, Mail, Phone, Calendar, Heart, Activity, Edit3, Save, X, Camera, Ruler, Weight, Bell, Shield, Settings, Stethoscope, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import ProfileCompletionWizard from '../../components/organisms/ProfileCompletionWizard';
import ProfileSettings from '../../components/organisms/ProfileSettings';

// Types based on actual database schema
interface ProfileData {
  profilePhoto?: string;
  FullName: string;
  Email: string;
  MobileNumber: string; // Display as string in UI, stored as array in DB
  AlternativeNumber: string;
  Gender: string;
  Age: string;
  DateOfBirth: string;
  Country: string;
  State: string;
  City: string;
  Height: string;
  Weight: string;
  BloodGroup: string;
  ChronicDiseases: string[];
  Allergies: string[];
}

const defaultProfileData: ProfileData = {
  profilePhoto: '',
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
  Height: '',
  Weight: '',
  BloodGroup: '',
  ChronicDiseases: [],
  Allergies: [],
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
  { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
  { id: 'medical', label: 'Medical', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
];

const ProfileScreen: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCompletionWizard, setShowCompletionWizard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
            profilePhoto: apiProfileData?.profilePhoto ?? '',
            MobileNumber: normalizeNumber(apiProfileData?.MobileNumber),
            AlternativeNumber: normalizeNumber(apiProfileData?.AlternativeNumber) || '',
            Age: apiProfileData?.Age !== undefined ? String(apiProfileData.Age) : '',
            Height: apiProfileData?.Height !== undefined ? String(apiProfileData.Height) : '',
            Weight: apiProfileData?.Weight !== undefined ? String(apiProfileData.Weight) : '',
            ChronicDiseases: Array.isArray(apiProfileData?.ChronicDiseases) ? apiProfileData!.ChronicDiseases : [],
            Allergies: Array.isArray(apiProfileData?.Allergies) ? apiProfileData!.Allergies : [],
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

  // Validate mobile number format
  const validateMobileNumber = (number: string): boolean => {
    if (!number) return true; // Empty is valid
    const mobileRegex = /^\+\d{1,3}\d{10}$/;
    return mobileRegex.test(number);
  };

  // Handle input changes
  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (user?._id) {
        // Validate mobile numbers before saving
        if (profileData.MobileNumber && !validateMobileNumber(profileData.MobileNumber)) {
          setError('Please enter a valid mobile number in international format (+[country code][number])');
          return;
        }
        if (profileData.AlternativeNumber && !validateMobileNumber(profileData.AlternativeNumber)) {
          setError('Please enter a valid alternative number in international format (+[country code][number])');
          return;
        }

        // Build payload to match UpdateProfileRequest (strings for numbers, plain strings for phones)
        const dataToSend: UpdateProfileRequest = {
          FullName: profileData.FullName || undefined,
          Email: profileData.Email || undefined,
          MobileNumber: profileData.MobileNumber?.trim() || undefined,
          AlternativeNumber: profileData.AlternativeNumber?.trim() || undefined,
          Gender: profileData.Gender || undefined,
          Age: profileData.Age?.trim() || undefined,
          DateOfBirth: profileData.DateOfBirth || undefined,
          Country: profileData.Country || undefined,
          State: profileData.State || undefined,
          City: profileData.City || undefined,
          Height: profileData.Height?.trim() || undefined,
          Weight: profileData.Weight?.trim() || undefined,
          BloodGroup: profileData.BloodGroup || undefined,
          ChronicDiseases: profileData.ChronicDiseases?.length ? profileData.ChronicDiseases : undefined,
          Allergies: profileData.Allergies?.length ? profileData.Allergies : undefined,
          profilePhoto: profileData.profilePhoto ?? undefined,
        };

        await profileService.updateProfile(user._id, dataToSend);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update profile.');
      console.error('Profile update error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate profile completion
  const calculateProfileCompletion = (): number => {
    const fields = [
      'FullName', 'Email', 'MobileNumber', 'Gender', 'DateOfBirth',
      'Country', 'State', 'City', 'Height', 'Weight', 'BloodGroup'
    ];
    const filled = fields.filter(f => profileData[f as keyof ProfileData] && String(profileData[f as keyof ProfileData]).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  // Calculate BMI
  const calculateBMI = (): string => {
    const height = parseFloat(profileData.Height);
    const weight = parseFloat(profileData.Weight);
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return 'N/A';
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Age"
                value={profileData.Age || 'N/A'}
                icon={<Calendar className="w-5 h-5" />}
              />
              <StatCard
                label="Height"
                value={profileData.Height ? `${profileData.Height} cm` : 'N/A'}
                icon={<Ruler className="w-5 h-5" />}
              />
              <StatCard
                label="Weight"
                value={profileData.Weight ? `${profileData.Weight} kg` : 'N/A'}
                icon={<Weight className="w-5 h-5" />}
              />
              <StatCard
                label="BMI"
                value={calculateBMI()}
                icon={<Heart className="w-5 h-5" />}
              />
            </div>

            {/* Health Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <HealthCard
                title="Medical Information"
                icon={<Stethoscope className="w-5 h-5" />}
                items={[
                  { label: 'Blood Group', value: profileData.BloodGroup || 'Not specified', status: profileData.BloodGroup ? 'success' : 'warning' },
                  { label: 'Chronic Diseases', value: profileData.ChronicDiseases?.length ? profileData.ChronicDiseases.join(', ') : 'None reported', status: profileData.ChronicDiseases?.length ? 'warning' : 'success' },
                  { label: 'Allergies', value: profileData.Allergies?.length ? profileData.Allergies.join(', ') : 'None reported', status: profileData.Allergies?.length ? 'warning' : 'success' }
                ]}
              />

              <HealthCard
                title="Contact Information"
                icon={<Phone className="w-5 h-5" />}
                items={[
                  { label: 'Mobile Number', value: profileData.MobileNumber || 'Not provided', status: profileData.MobileNumber ? 'success' : 'warning' },
                  { label: 'Alternative Number', value: profileData.AlternativeNumber || 'Not provided', status: profileData.AlternativeNumber ? 'success' : 'info' },
                  { label: 'Location', value: `${profileData.City || ''} ${profileData.State || ''} ${profileData.Country || ''}`.trim() || 'Not specified', status: profileData.Country ? 'success' : 'warning' }
                ]}
              />
            </div>
          </div>
        );
      case 'personal':
        return (
          <div className="space-y-6">
            <SectionCard title="Basic Information" icon={<User className="w-5 h-5" />}>
              <Input label="Full Name" value={profileData.FullName} onChange={v => handleInputChange('FullName', v)} disabled={!isEditing} />
              <SelectInput
                label="Gender"
                value={profileData.Gender}
                onChange={v => handleInputChange('Gender', v)}
                disabled={!isEditing}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Others', label: 'Others' }
                ]}
              />
              <Input label="Date of Birth" value={profileData.DateOfBirth} onChange={v => handleInputChange('DateOfBirth', v)} disabled={!isEditing} type="date" />
              <Input label="Age" value={profileData.Age} onChange={v => handleInputChange('Age', v)} disabled={!isEditing} type="number" />
            </SectionCard>
          </div>
        );
      case 'medical':
        return (
          <div className="space-y-6">
            <SectionCard title="Physical Information" icon={<Ruler className="w-5 h-5" />}>
              <Input label="Height (cm)" value={profileData.Height} onChange={v => handleInputChange('Height', v)} disabled={!isEditing} type="number" />
              <Input label="Weight (kg)" value={profileData.Weight} onChange={v => handleInputChange('Weight', v)} disabled={!isEditing} type="number" />
              <Input label="BMI" value={calculateBMI()} onChange={() => { }} disabled={true} />
              <SelectInput
                label="Blood Group"
                value={profileData.BloodGroup}
                onChange={v => handleInputChange('BloodGroup', v)}
                disabled={!isEditing}
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' }
                ]}
              />
            </SectionCard>

            <SectionCard title="Medical History" icon={<Stethoscope className="w-5 h-5" />}>
              <TagInput
                label="Chronic Diseases"
                value={profileData.ChronicDiseases}
                onChange={v => handleInputChange('ChronicDiseases', v)}
                disabled={!isEditing}
                placeholder="Add chronic diseases..."
              />
              <TagInput
                label="Allergies"
                value={profileData.Allergies}
                onChange={v => handleInputChange('Allergies', v)}
                disabled={!isEditing}
                placeholder="Add allergies..."
              />
            </SectionCard>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <SectionCard title="Contact Details" icon={<Phone className="w-5 h-5" />}>
              <div>
                <Input
                  label="Mobile Number"
                  value={profileData.MobileNumber}
                  onChange={v => handleInputChange('MobileNumber', v)}
                  disabled={!isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Format: +[country code][number] (e.g., +1234567890)
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="Alternative Number"
                  value={profileData.AlternativeNumber}
                  onChange={v => handleInputChange('AlternativeNumber', v)}
                  disabled={!isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    Format: +[country code][number] (optional)
                  </p>
                )}
              </div>
              <Input label="Email Address" value={profileData.Email} onChange={v => handleInputChange('Email', v)} disabled={!isEditing} type="email" />
            </SectionCard>

            <SectionCard title="Location Information" icon={<Calendar className="w-5 h-5" />}>
              <Input label="Country" value={profileData.Country} onChange={v => handleInputChange('Country', v)} disabled={!isEditing} />
              <Input label="State/Province" value={profileData.State} onChange={v => handleInputChange('State', v)} disabled={!isEditing} />
              <Input label="City" value={profileData.City} onChange={v => handleInputChange('City', v)} disabled={!isEditing} />
            </SectionCard>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <UniversalHeader
        title="My Profile"
        subtitle={`${calculateProfileCompletion()}% Complete`}
        variant="gradient"
        icon="user"
        showBackButton={true}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Profile Photo */}
            <div className="relative w-32 h-32 mx-auto lg:mx-0">
              <div className="w-full h-full rounded-full p-1" style={{ backgroundColor: '#0e3293' }}>
                <Image
                  src={profileData.profilePhoto || '/placeholder.svg'}
                  alt="Profile Photo"
                  width={128}
                  height={128}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 text-white rounded-full p-3 shadow-lg hover:opacity-90 transition-all" style={{ backgroundColor: '#0e3293' }}>
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData.FullName || 'Your Name'}</h1>
              <div className="space-y-2 mb-4">
                <div className="text-gray-600 flex items-center justify-center lg:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {profileData.Email || 'your@email.com'}
                </div>
                <div className="text-gray-600 flex items-center justify-center lg:justify-start gap-2">
                  <Phone className="w-4 h-4" />
                  {profileData.MobileNumber || 'Mobile Number'}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm font-bold" style={{ color: '#0e3293' }}>{calculateProfileCompletion()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProfileCompletion()}%`, backgroundColor: '#0e3293' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg hover:opacity-90"
                    style={{ backgroundColor: '#0e3293' }}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : (<><Save className="w-4 h-4" /> Save Changes</>)}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:opacity-90"
                    style={{ backgroundColor: '#0e3293' }}
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </button>
                  {calculateProfileCompletion() < 100 && (
                    <button
                      onClick={() => setShowCompletionWizard(true)}
                      className="text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:opacity-90"
                      style={{ backgroundColor: '#0e3293' }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete Profile
                    </button>
                  )}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {success}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 border border-gray-100">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide justify-evenly">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                style={activeTab === tab.id ? { backgroundColor: '#0e3293' } : {}}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      {showCompletionWizard && (
        <ProfileCompletionWizard
          onClose={() => setShowCompletionWizard(false)}
          currentCompletion={calculateProfileCompletion()}
          profileData={profileData}
          onUpdateProfile={(data) => {
            setProfileData(data);
            handleSave();
          }}
        />
      )}

      {showSettings && (
        <ProfileSettings
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

// Helper components
const StatCard = ({ label, value, icon }: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white" style={{ backgroundColor: '#0e3293' }}>
      {icon}
    </div>
    <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
  </div>
);

const HealthCard = ({ title, icon, items }: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ label: string; value: string; status: 'success' | 'warning' | 'info' }>;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
      {icon}
      {title}
    </h3>
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${item.status === 'success' ? 'bg-green-500' :
            item.status === 'warning' ? 'bg-yellow-500' : ''
            }`}
            style={item.status === 'info' ? { backgroundColor: '#0e3293' } : {}}
          />
          <div className="flex-1">
            <div className="font-medium text-gray-700 text-sm">{item.label}</div>
            <div className="text-gray-900">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900">
      {icon}
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  type?: string;
}> = ({ label, value, onChange, disabled, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-500 transition-colors focus:outline-none focus:ring-2"
      style={{
        '--tw-ring-color': '#0e3293',
        '--tw-ring-opacity': '0.1'
      } as React.CSSProperties}
      onFocus={(e) => e.target.style.borderColor = '#0e3293'}
      onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      type={type}
    />
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  options: Array<{ value: string; label: string }>;
}> = ({ label, value, onChange, disabled, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-500 transition-colors focus:outline-none focus:ring-2"
      style={{
        '--tw-ring-color': '#0e3293',
        '--tw-ring-opacity': '0.1'
      } as React.CSSProperties}
      onFocus={(e) => e.target.style.borderColor = '#0e3293'}
      onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Select {label}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const TagInput: React.FC<{
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, disabled, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-3">
        {!disabled && (
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 bg-white transition-colors focus:outline-none focus:ring-2"
              style={{
                '--tw-ring-color': '#0e3293',
                '--tw-ring-opacity': '0.1'
              } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#0e3293'}
              onBlur={(e) => e.target.style.borderColor = 'rgb(209 213 219)'}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={placeholder}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              type="button"
              onClick={addTag}
              className="text-white px-4 py-3 rounded-xl hover:opacity-90 transition-all"
              style={{ backgroundColor: '#0e3293' }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <span key={index} className="px-3 py-1 rounded-full text-sm flex items-center gap-2 text-white" style={{ backgroundColor: '#0e3293' }}>
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;