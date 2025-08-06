'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { UniversalHeader } from '../../components/atoms'
import { useAuth } from '../../hooks/useAuth'
import { profileService } from '../../services/apiServices'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Activity,
  Edit3,
  Save,
  X,
  ChevronDown,
  Camera,
  Users,
  Home,
  Ruler,
  Weight,
  ArrowLeft,
  Check
} from 'lucide-react'

// Types
interface ProfileData {
  FullName: string
  Email: string
  MobileNumber: string
  AlternativeNumber: string
  Gender: string
  Age: string
  DateOfBirth: string
  Country: string
  State: string
  City: string
  Address: string
  Height: string
  Weight: string
  BloodGroup: string
  ChronicDiseases: string[]
  Allergies: string[]
  profilePhoto: string | null
}

interface QuickStat {
  label: string
  value: string
  icon: React.ReactNode
}

// Main Profile Component
const ProfileScreen: React.FC = () => {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [profileData, setProfileData] = useState<ProfileData>({
    FullName: "",
    Email: "",
    MobileNumber: "",
    AlternativeNumber: "",
    Gender: "",
    Age: "",
    DateOfBirth: "",
    Country: "",
    State: "",
    City: "",
    Address: "",
    Height: "",
    Weight: "",
    BloodGroup: "",
    ChronicDiseases: [],
    Allergies: [],
    profilePhoto: null,
  })

  const [activeSection, setActiveSection] = useState<'overview' | 'personal' | 'medical' | 'contact'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showGenderModal, setShowGenderModal] = useState(false)

  // Load user data when authentication state changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!authLoading) {
        if (isAuthenticated && user) {
          setIsLoading(true)

          try {
            // First, try to fetch complete profile data from API
            console.log('🔄 Loading profile data for user:', user._id)
            const apiProfileData = await profileService.getProfileByUserId(user._id)

            if (apiProfileData) {
              // Use API data if available
              console.log('✅ Profile data loaded from API:', apiProfileData)

              // Helper function to extract phone number from API response
              const extractPhoneNumber = (phoneData: any): string => {
                if (!phoneData) return "";
                if (typeof phoneData === 'string') return phoneData;
                if (Array.isArray(phoneData) && phoneData.length > 0) {
                  return phoneData[0].number || phoneData[0].toString();
                }
                if (typeof phoneData === 'object' && phoneData.number) {
                  return phoneData.number;
                }
                return "";
              };

              setProfileData({
                FullName: apiProfileData.FullName || "",
                Email: apiProfileData.Email || "",
                MobileNumber: extractPhoneNumber(apiProfileData.MobileNumber),
                AlternativeNumber: extractPhoneNumber(apiProfileData.AlternativeNumber),
                Gender: apiProfileData.Gender || "",
                Age: apiProfileData.Age?.toString() || "",
                DateOfBirth: apiProfileData.DateOfBirth || "",
                Country: apiProfileData.Country || "",
                State: apiProfileData.State || "",
                City: apiProfileData.City || "",
                Address: apiProfileData.Address || "",
                Height: apiProfileData.Height?.toString() || "",
                Weight: apiProfileData.Weight?.toString() || "",
                BloodGroup: apiProfileData.BloodGroup || "",
                ChronicDiseases: apiProfileData.ChronicDiseases || [],
                Allergies: apiProfileData.Allergies || [],
                profilePhoto: apiProfileData.profilePhoto || null,
              })
            } else {
              // Fallback to basic user data from authentication
              console.log('⚠️ API profile data not available, using auth data')
              setProfileData(prevData => ({
                ...prevData,
                FullName: user.FullName || user.fullName || "",
                Email: user.Email || user.email || "",
              }))
            }
          } catch (error) {
            console.error('❌ Error loading profile data:', error)
            // Fallback to basic user data from authentication
            setProfileData(prevData => ({
              ...prevData,
              FullName: user.FullName || user.fullName || "",
              Email: user.Email || user.email || "",
            }))
          }
        } else {
          // Redirect to login if not authenticated
          router.push('/login')
          return
        }
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user, isAuthenticated, authLoading, router])
  const [showBloodGroupModal, setShowBloodGroupModal] = useState(false)

  // Options
  const genderOptions = ["Male", "Female", "Other"]
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const chronicDiseaseOptions = ["Diabetes", "Hypertension", "Heart Disease", "Asthma", "Arthritis", "Thyroid", "Kidney Disease", "Liver Disease"]
  const allergiesOptions = ["Peanuts", "Shellfish", "Dairy", "Eggs", "Soy", "Wheat", "Tree Nuts", "Fish", "Sesame", "Sulphites"]

  const sections = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
    { id: 'medical', label: 'Medical', icon: <Heart className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
  ]

  // Calculate profile completion
  const calculateProfileCompletion = (): number => {
    const fields = [
      'FullName', 'Email', 'MobileNumber', 'Gender', 'DateOfBirth',
      'Country', 'State', 'City', 'Height', 'Weight', 'BloodGroup'
    ]
    const filledFields = fields.filter(field =>
      profileData[field as keyof ProfileData] &&
      String(profileData[field as keyof ProfileData]).trim() !== ''
    ).length
    return Math.round((filledFields / fields.length) * 100)
  }

  // Handle input changes
  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  // Handle array field changes
  const handleArrayFieldToggle = (field: 'ChronicDiseases' | 'Allergies', value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  // Handle save
  const handleSave = async () => {
    if (!user?._id) {
      console.error('❌ No user ID available for saving profile')
      return
    }

    setIsSaving(true)
    try {
      console.log('🔄 Saving profile data for user:', user._id)

      // Prepare update data
      const updateData = {
        FullName: profileData.FullName,
        Email: profileData.Email,
        MobileNumber: profileData.MobileNumber,
        AlternativeNumber: profileData.AlternativeNumber,
        Gender: profileData.Gender,
        Age: profileData.Age,
        DateOfBirth: profileData.DateOfBirth,
        Country: profileData.Country,
        State: profileData.State,
        City: profileData.City,
        Address: profileData.Address,
        Height: profileData.Height,
        Weight: profileData.Weight,
        BloodGroup: profileData.BloodGroup,
        ChronicDiseases: profileData.ChronicDiseases,
        Allergies: profileData.Allergies,
        profilePhoto: profileData.profilePhoto,
      }

      // Save to API
      const updatedProfile = await profileService.updateProfile(user._id, updateData)

      if (updatedProfile) {
        console.log('✅ Profile saved successfully:', updatedProfile)

        // Helper function to extract phone number from API response
        const extractPhoneNumber = (phoneData: any): string => {
          if (!phoneData) return "";
          if (typeof phoneData === 'string') return phoneData;
          if (Array.isArray(phoneData) && phoneData.length > 0) {
            return phoneData[0].number || phoneData[0].toString();
          }
          if (typeof phoneData === 'object' && phoneData.number) {
            return phoneData.number;
          }
          return "";
        };

        // Update local state with the response data
        setProfileData({
          FullName: updatedProfile.FullName || "",
          Email: updatedProfile.Email || "",
          MobileNumber: extractPhoneNumber(updatedProfile.MobileNumber),
          AlternativeNumber: extractPhoneNumber(updatedProfile.AlternativeNumber),
          Gender: updatedProfile.Gender || "",
          Age: updatedProfile.Age?.toString() || "",
          DateOfBirth: updatedProfile.DateOfBirth || "",
          Country: updatedProfile.Country || "",
          State: updatedProfile.State || "",
          City: updatedProfile.City || "",
          Address: updatedProfile.Address || "",
          Height: updatedProfile.Height?.toString() || "",
          Weight: updatedProfile.Weight?.toString() || "",
          BloodGroup: updatedProfile.BloodGroup || "",
          ChronicDiseases: updatedProfile.ChronicDiseases || [],
          Allergies: updatedProfile.Allergies || [],
          profilePhoto: updatedProfile.profilePhoto || null,
        })
        setIsEditing(false)
      } else {
        console.error('❌ Failed to save profile - no response data')
        // Fallback to localStorage for now
        localStorage.setItem("profileData", JSON.stringify(profileData))
        setIsEditing(false)
      }
    } catch (error) {
      console.error('❌ Save error:', error)
      // Fallback to localStorage on error
      localStorage.setItem("profileData", JSON.stringify(profileData))
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }





  // Mobile Section Components
  const MobileOverviewSection: React.FC = () => {
    const quickStats: QuickStat[] = [
      { label: 'Age', value: profileData.Age || 'N/A', icon: <Calendar className="w-5 h-5" /> },
      { label: 'Height', value: profileData.Height ? `${profileData.Height} cm` : 'N/A', icon: <Ruler className="w-5 h-5" /> },
      { label: 'Weight', value: profileData.Weight ? `${profileData.Weight} kg` : 'N/A', icon: <Weight className="w-5 h-5" /> },
      { label: 'Blood Group', value: profileData.BloodGroup || 'N/A', icon: <Heart className="w-5 h-5" /> },
    ]

    return (
      <div className="space-y-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-[#0e3293] mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-xs text-gray-600 mb-1">{stat.label}</div>
                <div className="font-semibold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-gray-700 text-sm">Chronic Conditions</span>
              </div>
              <span className="text-red-600 font-medium">{profileData.ChronicDiseases.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-yellow-500 mr-3" />
                <span className="text-gray-700 text-sm">Allergies</span>
              </div>
              <span className="text-yellow-600 font-medium">{profileData.Allergies.length}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MobilePersonalSection: React.FC = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#0e3293] text-sm font-medium flex items-center space-x-1 hover:text-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
        <div className="space-y-5">
          <InputField
            label="Full Name"
            value={profileData.FullName}
            field="FullName"
            icon={<User className="w-4 h-4" />}
            placeholder="Enter your full name"
          />
          <InputField
            label="Email"
            value={profileData.Email}
            field="Email"
            icon={<Mail className="w-4 h-4" />}
            placeholder="Enter your email"
            type="email"
          />
          <DropdownField
            label="Gender"
            value={profileData.Gender}
            field="Gender"
            icon={<Users className="w-4 h-4" />}
            options={genderOptions}
            placeholder="Select gender"
            modalVisible={showGenderModal}
            setModalVisible={setShowGenderModal}
          />
          <InputField
            label="Date of Birth"
            value={profileData.DateOfBirth}
            field="DateOfBirth"
            icon={<Calendar className="w-4 h-4" />}
            placeholder="YYYY-MM-DD"
            type="date"
          />
          <InputField
            label="Country"
            value={profileData.Country}
            field="Country"
            icon={<MapPin className="w-4 h-4" />}
            placeholder="Enter your country"
          />
          <InputField
            label="State"
            value={profileData.State}
            field="State"
            icon={<MapPin className="w-4 h-4" />}
            placeholder="Enter your state"
          />
          <InputField
            label="City"
            value={profileData.City}
            field="City"
            icon={<MapPin className="w-4 h-4" />}
            placeholder="Enter your city"
          />
          <InputField
            label="Address"
            value={profileData.Address}
            field="Address"
            icon={<Home className="w-4 h-4" />}
            placeholder="Enter your address"
          />
        </div>
      </div>
    </div>
  )

  const MobileMedicalSection: React.FC = () => (
    <div className="space-y-4">
      {/* Physical Information */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Physical Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#0e3293] text-sm font-medium flex items-center space-x-1 hover:text-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
        <div className="space-y-5">
          <InputField
            label="Height (cm)"
            value={profileData.Height}
            field="Height"
            icon={<Ruler className="w-4 h-4" />}
            placeholder="Enter height"
            type="number"
          />
          <InputField
            label="Weight (kg)"
            value={profileData.Weight}
            field="Weight"
            icon={<Weight className="w-4 h-4" />}
            placeholder="Enter weight"
            type="number"
          />
          <DropdownField
            label="Blood Group"
            value={profileData.BloodGroup}
            field="BloodGroup"
            icon={<Heart className="w-4 h-4" />}
            options={bloodGroupOptions}
            placeholder="Select blood group"
            modalVisible={showBloodGroupModal}
            setModalVisible={setShowBloodGroupModal}
          />
        </div>
      </div>

      {/* Health Conditions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Health Conditions</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#0e3293] text-sm font-medium flex items-center space-x-1 hover:text-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Chronic Diseases */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Chronic Diseases</label>
          <div className="grid grid-cols-2 gap-2">
            {chronicDiseaseOptions.map((disease) => (
              <button
                key={disease}
                onClick={() => handleArrayFieldToggle('ChronicDiseases', disease)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  profileData.ChronicDiseases.includes(disease)
                    ? 'bg-[#0e3293] text-white border-[#0e3293] shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                } cursor-pointer`}
              >
                {disease}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Allergies</label>
          <div className="grid grid-cols-2 gap-2">
            {allergiesOptions.map((allergy) => (
              <button
                key={allergy}
                onClick={() => handleArrayFieldToggle('Allergies', allergy)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  profileData.Allergies.includes(allergy)
                    ? 'bg-[#0e3293] text-white border-[#0e3293] shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                } cursor-pointer`}
              >
                {allergy}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const MobileContactSection: React.FC = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#0e3293] text-sm font-medium flex items-center space-x-1 hover:text-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
        </div>
        <div className="space-y-5">
          <InputField
            label="Mobile Number"
            value={profileData.MobileNumber}
            field="MobileNumber"
            icon={<Phone className="w-4 h-4" />}
            placeholder="Enter mobile number"
            type="tel"
          />
          <InputField
            label="Alternative Number"
            value={profileData.AlternativeNumber}
            field="AlternativeNumber"
            icon={<Phone className="w-4 h-4" />}
            placeholder="Enter alternative number"
            type="tel"
          />
        </div>
      </div>
    </div>
  )

  // Desktop Section Components
  const DesktopOverviewSection: React.FC = () => {
    const quickStats: QuickStat[] = [
      { label: 'Age', value: profileData.Age || 'N/A', icon: <Calendar className="w-6 h-6" /> },
      { label: 'Height', value: profileData.Height ? `${profileData.Height} cm` : 'N/A', icon: <Ruler className="w-6 h-6" /> },
      { label: 'Weight', value: profileData.Weight ? `${profileData.Weight} kg` : 'N/A', icon: <Weight className="w-6 h-6" /> },
      { label: 'Blood Group', value: profileData.BloodGroup || 'N/A', icon: <Heart className="w-6 h-6" /> },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Overview</h2>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
                <div className="text-[#0e3293] mb-3 flex justify-center">{stat.icon}</div>
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Health Summary */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Chronic Conditions</h3>
              </div>
              <div className="text-3xl font-bold text-red-600 mb-2">{profileData.ChronicDiseases.length}</div>
              <div className="text-sm text-gray-600">
                {profileData.ChronicDiseases.length > 0 ? profileData.ChronicDiseases.join(', ') : 'None reported'}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Activity className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">{profileData.Allergies.length}</div>
              <div className="text-sm text-gray-600">
                {profileData.Allergies.length > 0 ? profileData.Allergies.join(', ') : 'None reported'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const DesktopPersonalSection: React.FC = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      <div className="grid grid-cols-2 gap-6">
        <InputField
          label="Full Name"
          value={profileData.FullName}
          field="FullName"
          icon={<User className="w-5 h-5" />}
          placeholder="Enter your full name"
        />
        <InputField
          label="Email"
          value={profileData.Email}
          field="Email"
          icon={<Mail className="w-5 h-5" />}
          placeholder="Enter your email"
          type="email"
        />
        <DropdownField
          label="Gender"
          value={profileData.Gender}
          field="Gender"
          icon={<Users className="w-5 h-5" />}
          options={genderOptions}
          placeholder="Select gender"
          modalVisible={showGenderModal}
          setModalVisible={setShowGenderModal}
        />
        <InputField
          label="Date of Birth"
          value={profileData.DateOfBirth}
          field="DateOfBirth"
          icon={<Calendar className="w-5 h-5" />}
          placeholder="YYYY-MM-DD"
          type="date"
        />
        <InputField
          label="Country"
          value={profileData.Country}
          field="Country"
          icon={<MapPin className="w-5 h-5" />}
          placeholder="Enter your country"
        />
        <InputField
          label="State"
          value={profileData.State}
          field="State"
          icon={<MapPin className="w-5 h-5" />}
          placeholder="Enter your state"
        />
        <InputField
          label="City"
          value={profileData.City}
          field="City"
          icon={<MapPin className="w-5 h-5" />}
          placeholder="Enter your city"
        />
        <InputField
          label="Address"
          value={profileData.Address}
          field="Address"
          icon={<Home className="w-5 h-5" />}
          placeholder="Enter your address"
        />
      </div>
    </div>
  )

  const DesktopMedicalSection: React.FC = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Medical Information</h2>

      {/* Physical Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Information</h3>
        <div className="grid grid-cols-3 gap-6">
          <InputField
            label="Height (cm)"
            value={profileData.Height}
            field="Height"
            icon={<Ruler className="w-5 h-5" />}
            placeholder="Enter height"
            type="number"
          />
          <InputField
            label="Weight (kg)"
            value={profileData.Weight}
            field="Weight"
            icon={<Weight className="w-5 h-5" />}
            placeholder="Enter weight"
            type="number"
          />
          <DropdownField
            label="Blood Group"
            value={profileData.BloodGroup}
            field="BloodGroup"
            icon={<Heart className="w-5 h-5" />}
            options={bloodGroupOptions}
            placeholder="Select blood group"
            modalVisible={showBloodGroupModal}
            setModalVisible={setShowBloodGroupModal}
          />
        </div>
      </div>

      {/* Health Conditions */}
      <div className="space-y-6">
        {/* Chronic Diseases */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chronic Diseases</h3>
          <div className="grid grid-cols-4 gap-3">
            {chronicDiseaseOptions.map((disease) => (
              <button
                key={disease}
                onClick={() => {
                  if (!isEditing) {
                    setIsEditing(true)
                  }
                  handleArrayFieldToggle('ChronicDiseases', disease)
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer ${
                  profileData.ChronicDiseases.includes(disease)
                    ? 'bg-[#0e3293] text-white border-[#0e3293] shadow-md'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                {disease}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h3>
          <div className="grid grid-cols-4 gap-3">
            {allergiesOptions.map((allergy) => (
              <button
                key={allergy}
                onClick={() => {
                  if (!isEditing) {
                    setIsEditing(true)
                  }
                  handleArrayFieldToggle('Allergies', allergy)
                }}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer ${
                  profileData.Allergies.includes(allergy)
                    ? 'bg-[#0e3293] text-white border-[#0e3293] shadow-md'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                {allergy}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const DesktopContactSection: React.FC = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
      <div className="grid grid-cols-2 gap-6">
        <InputField
          label="Mobile Number"
          value={profileData.MobileNumber}
          field="MobileNumber"
          icon={<Phone className="w-5 h-5" />}
          placeholder="Enter mobile number"
          type="tel"
        />
        <InputField
          label="Alternative Number"
          value={profileData.AlternativeNumber}
          field="AlternativeNumber"
          icon={<Phone className="w-5 h-5" />}
          placeholder="Enter alternative number"
          type="tel"
        />
      </div>
    </div>
  )

  // Input Field Component
  const InputField: React.FC<{
    label: string
    value: string | number | undefined
    field: keyof ProfileData
    icon: React.ReactNode
    placeholder: string
    type?: string
  }> = ({ label, value, field, icon, placeholder, type = "text" }) => {
    const handleClick = () => {
      if (!isEditing) {
        setIsEditing(true)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Ensure we're in edit mode when typing
      if (!isEditing) {
        setIsEditing(true)
      }
      // Always allow changes when the field is focused/active
      handleInputChange(field, e.target.value)
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0e3293] z-10">
            {icon}
          </div>
          <input
            type={type}
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all duration-200 relative z-0 ${
              isEditing
                ? "bg-white border-[#0e3293] focus:ring-4 focus:ring-[#0e3293]/20 focus:border-[#0e3293] shadow-sm"
                : "bg-white border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm"
            } ${!isEditing && value ? "text-gray-900" : ""}`}
            value={value?.toString() || ""}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={!isEditing}
            onClick={handleClick}
            onFocus={() => !isEditing && setIsEditing(true)}
          />
        </div>
      </div>
    )
  }

  // Dropdown Field Component
  const DropdownField: React.FC<{
    label: string
    value: string | undefined
    field: keyof ProfileData
    icon: React.ReactNode
    options: string[]
    placeholder: string
    modalVisible: boolean
    setModalVisible: (visible: boolean) => void
  }> = ({ label, value, field, icon, options, placeholder, modalVisible, setModalVisible }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0e3293] z-10">
          {icon}
        </div>
        <button
          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-left flex items-center justify-between transition-all duration-200 relative z-0 ${
            isEditing
              ? "bg-white border-[#0e3293] hover:shadow-sm focus:ring-4 focus:ring-[#0e3293]/20"
              : "bg-white border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm"
          }`}
          onClick={() => {
            if (!isEditing) {
              setIsEditing(true)
            }
            setModalVisible(true)
          }}
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm max-h-96 relative z-[10000]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
              <button
                onClick={() => setModalVisible(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {options.map((option) => (
                <button
                  key={option}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors"
                  onClick={() => {
                    handleInputChange(field, option)
                    setModalVisible(false)
                  }}
                >
                  <span className="text-gray-900">{option}</span>
                  {value === option && <Check className="w-4 h-4 text-[#0e3293]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e3293] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Universal Header */}
      <UniversalHeader
        title="My Profile"
        subtitle={`${calculateProfileCompletion()}% Complete`}
        variant="gradient"
        icon="user"
        showBackButton={true}
      />

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-gradient-to-br from-[#0e3293] to-blue-600 relative z-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 relative z-10">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium">Profile</span>
            </button>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="text-sm">Save</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                {isEditing ? <X className="w-5 h-5 text-white" /> : <Edit3 className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-4 pb-8 relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                  {profileData.profilePhoto ? (
                    <Image
                      src={profileData.profilePhoto}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-3 h-3 text-[#0e3293]" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl font-bold mb-2">
                  {profileData.FullName || "Complete Your Profile"}
                </h1>
                {profileData.Email && (
                  <div className="flex items-center text-white/80 text-sm mb-1">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{profileData.Email}</span>
                  </div>
                )}
                {profileData.MobileNumber && (
                  <div className="flex items-center text-white/80 text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{profileData.MobileNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-2">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${calculateProfileCompletion()}%` }}
              />
            </div>
            <div className="flex justify-between text-white text-sm">
              <span>Profile Completion</span>
              <span className="font-semibold">{calculateProfileCompletion()}%</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="bg-white shadow-lg sticky top-0 z-20 border-b border-gray-100">
          <div className="flex overflow-x-auto scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`flex-1 px-4 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 relative ${
                  activeSection === section.id
                    ? "text-[#0e3293] bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveSection(section.id as any)}
              >
                <div className="flex items-center justify-center space-x-2">
                  {section.icon}
                  <span>{section.label}</span>
                </div>
                {activeSection === section.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0e3293] rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4 pb-24 min-h-screen bg-gray-50">
          {/* Edit Mode Indicator */}
          {isEditing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span className="text-blue-800 text-sm font-medium">Edit mode active - Tap fields to modify</span>
            </div>
          )}

          <div className="space-y-4">
            {activeSection === 'overview' && <MobileOverviewSection />}
            {activeSection === 'personal' && <MobilePersonalSection />}
            {activeSection === 'medical' && <MobileMedicalSection />}
            {activeSection === 'contact' && <MobileContactSection />}
          </div>
        </div>

        {/* Floating Action Button for Mobile */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#0e3293] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30 hover:scale-105"
          >
            <Edit3 className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-6">
          {/* Desktop Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                  <p className="text-gray-600 text-sm mt-1">Manage your personal information and preferences</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Profile Completion</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0e3293] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProfileCompletion()}%` }}
                      />
                    </div>
                    <span className="text-lg font-semibold text-[#0e3293]">{calculateProfileCompletion()}%</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isEditing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-[#0e3293] text-white hover:bg-blue-700 hover:shadow-lg"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </div>
                  )}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                {/* Profile Card */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#0e3293] to-blue-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                      {profileData.profilePhoto ? (
                        <Image
                          src={profileData.profilePhoto}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0e3293] rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {profileData.FullName || "Complete Your Profile"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{profileData.Email || "Add your email"}</p>

                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-gradient-to-r from-[#0e3293] to-blue-600 rounded-full h-3 transition-all duration-500"
                      style={{ width: `${calculateProfileCompletion()}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{calculateProfileCompletion()}% Complete</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-[#0e3293] to-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={() => setActiveSection(section.id as any)}
                    >
                      <div className={`${activeSection === section.id ? 'text-white' : 'text-[#0e3293]'}`}>
                        {section.icon}
                      </div>
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-9">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {/* Edit Mode Indicator */}
                {isEditing && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-blue-800 font-medium">Edit mode is active</p>
                      <p className="text-blue-600 text-sm">Click on any field to modify your information</p>
                    </div>
                  </div>
                )}

                {activeSection === 'overview' && <DesktopOverviewSection />}
                {activeSection === 'personal' && <DesktopPersonalSection />}
                {activeSection === 'medical' && <DesktopMedicalSection />}
                {activeSection === 'contact' && <DesktopContactSection />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileScreen
