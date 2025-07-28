'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  Settings,
  Eye,
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

  const [profileData, setProfileData] = useState<ProfileData>({
    FullName: "Devyani Kadachha",
    Email: "devyanikadachha29@gmail.com",
    MobileNumber: "+918200744009",
    AlternativeNumber: "",
    Gender: "Female",
    Age: "23",
    DateOfBirth: "2001-01-29",
    Country: "India",
    State: "Gujarat",
    City: "Ahmedabad",
    Address: "",
    Height: "165",
    Weight: "55",
    BloodGroup: "O+",
    ChronicDiseases: ["Diabetes"],
    Allergies: ["Peanuts", "Dairy"],
    profilePhoto: null,
  })

  const [activeSection, setActiveSection] = useState<'overview' | 'personal' | 'medical' | 'contact'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showGenderModal, setShowGenderModal] = useState(false)
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
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem("profileData", JSON.stringify(profileData))
      setIsEditing(false)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false)
  }

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedData = localStorage.getItem("profileData")
        if (storedData) {
          setProfileData(JSON.parse(storedData))
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        console.error('Load error:', error)
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

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
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="space-y-4">
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
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Information</h3>
        <div className="space-y-4">
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
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Conditions</h3>

        {/* Chronic Diseases */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Chronic Diseases</label>
          <div className="grid grid-cols-2 gap-2">
            {chronicDiseaseOptions.map((disease) => (
              <button
                key={disease}
                onClick={() => isEditing && handleArrayFieldToggle('ChronicDiseases', disease)}
                disabled={!isEditing}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  profileData.ChronicDiseases.includes(disease)
                    ? 'bg-[#0e3293] text-white'
                    : 'bg-gray-100 text-gray-600'
                } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
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
                onClick={() => isEditing && handleArrayFieldToggle('Allergies', allergy)}
                disabled={!isEditing}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  profileData.Allergies.includes(allergy)
                    ? 'bg-[#0e3293] text-white'
                    : 'bg-gray-100 text-gray-600'
                } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
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
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
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
                onClick={() => isEditing && handleArrayFieldToggle('ChronicDiseases', disease)}
                disabled={!isEditing}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  profileData.ChronicDiseases.includes(disease)
                    ? 'bg-[#0e3293] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
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
                onClick={() => isEditing && handleArrayFieldToggle('Allergies', allergy)}
                disabled={!isEditing}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  profileData.Allergies.includes(allergy)
                    ? 'bg-[#0e3293] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
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
  }> = ({ label, value, field, icon, placeholder, type = "text" }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0e3293]">
          {icon}
        </div>
        <input
          type={type}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0e3293] focus:border-transparent transition-all duration-200 ${
            isEditing ? "bg-white" : "bg-gray-50"
          }`}
          value={value?.toString() || ""}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={!isEditing}
        />
      </div>
    </div>
  )

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
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0e3293]">
          {icon}
        </div>
        <button
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
            isEditing ? "bg-white hover:bg-gray-50" : "bg-gray-50"
          }`}
          onClick={() => isEditing && setModalVisible(true)}
          disabled={!isEditing}
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
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

  if (isLoading) {
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
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-gradient-to-br from-[#0e3293] to-blue-600 relative">
          {/* Status Bar Simulation */}
          <div className="flex justify-between items-center px-4 py-1 text-sm text-white">
            <span>5:47</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs">0.20 KB/s</span>
              <span className="text-xs">64%</span>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium">Profile</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              {isEditing ? <X className="w-5 h-5 text-white" /> : <Edit3 className="w-5 h-5 text-white" />}
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-4 pb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  {profileData.profilePhoto ? (
                    <Image
                      src={profileData.profilePhoto}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <Camera className="w-3 h-3 text-[#0e3293]" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl font-bold mb-1">
                  {profileData.FullName || "Your Name"}
                </h1>
                <div className="flex items-center text-white text-opacity-80 text-sm mb-1">
                  <Mail className="w-4 h-4 mr-1" />
                  <span>{profileData.Email}</span>
                </div>
                <div className="flex items-center text-white text-opacity-80 text-sm">
                  <Phone className="w-4 h-4 mr-1" />
                  <span>{profileData.MobileNumber}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white bg-opacity-20 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${calculateProfileCompletion()}%` }}
              />
            </div>
            <div className="flex justify-between text-white text-xs opacity-80">
              <span>Profile Completion</span>
              <span>{calculateProfileCompletion()}%</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeSection === section.id
                    ? "text-[#0e3293] border-b-2 border-[#0e3293] bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setActiveSection(section.id as any)}
              >
                <div className="flex items-center justify-center space-x-2">
                  {section.icon}
                  <span>{section.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4 pb-20">
          {activeSection === 'overview' && <MobileOverviewSection />}
          {activeSection === 'personal' && <MobilePersonalSection />}
          {activeSection === 'medical' && <MobileMedicalSection />}
          {activeSection === 'contact' && <MobileContactSection />}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-6">
          {/* Desktop Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right mr-4">
                  <div className="text-sm text-gray-600">Profile Completion</div>
                  <div className="text-lg font-semibold text-[#0e3293]">{calculateProfileCompletion()}%</div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEditing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-[#0e3293] text-white hover:bg-blue-700"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
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
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                {/* Profile Card */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#0e3293] to-blue-600 rounded-full flex items-center justify-center mb-4">
                      {profileData.profilePhoto ? (
                        <Image
                          src={profileData.profilePhoto}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#0e3293] rounded-full flex items-center justify-center shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {profileData.FullName || "Your Name"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{profileData.Email}</p>

                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-[#0e3293] rounded-full h-2 transition-all duration-300"
                      style={{ width: `${calculateProfileCompletion()}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{calculateProfileCompletion()}% Complete</p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-[#0e3293] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setActiveSection(section.id as any)}
                    >
                      {section.icon}
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-9">
              <div className="bg-white rounded-xl shadow-sm p-6">
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
