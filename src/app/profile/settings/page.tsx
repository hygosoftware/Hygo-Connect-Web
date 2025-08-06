'use client'

import React, { useState, useEffect } from 'react'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { UniversalHeader } from '../../../components/atoms'
import { useAuth } from '../../../hooks/useAuth'
import { profileService } from '../../../services/apiServices'
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
  Check,
  Settings,
  Shield,
  Bell,
  Eye,
  Lock,
  Trash2,
  Download,
  Upload,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Palette,
  Languages,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react'
import styles from './settings.module.css'

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

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  items: SettingItem[]
}

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'select' | 'input' | 'button' | 'info'
  value?: any
  options?: { label: string; value: string }[]
  action?: () => void
}

const ProfileSettingsPage: React.FC = () => {
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

  const [activeSection, setActiveSection] = useState<string>('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null)
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      sms: false,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      dataSharing: false
    },
    appearance: {
      theme: 'system',
      language: 'en',
      fontSize: 'medium'
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
      sessionTimeout: '30'
    }
  })

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!authLoading && isAuthenticated && user) {
        setIsLoading(true)
        try {
          const apiProfileData = await profileService.getProfileByUserId(user._id)
          if (apiProfileData) {
            // Normalize the data to match our ProfileData interface
            const normalizedData: ProfileData = {
              FullName: String(apiProfileData.FullName || ''),
              Email: String(apiProfileData.Email || ''),
              MobileNumber: typeof apiProfileData.MobileNumber === 'string' 
                ? apiProfileData.MobileNumber 
                : typeof apiProfileData.MobileNumber === 'object' && apiProfileData.MobileNumber
                ? (apiProfileData.MobileNumber as any).number || ''
                : String(apiProfileData.MobileNumber || ''),
              AlternativeNumber: String(apiProfileData.AlternativeNumber || ''),
              Gender: String(apiProfileData.Gender || ''),
              Age: String(apiProfileData.Age || ''),
              DateOfBirth: String(apiProfileData.DateOfBirth || ''),
              Country: String(apiProfileData.Country || ''),
              State: String(apiProfileData.State || ''),
              City: String(apiProfileData.City || ''),
              Address: String(apiProfileData.Address || ''),
              Height: String(apiProfileData.Height || ''),
              Weight: String(apiProfileData.Weight || ''),
              BloodGroup: String(apiProfileData.BloodGroup || ''),
              ChronicDiseases: Array.isArray(apiProfileData.ChronicDiseases) ? apiProfileData.ChronicDiseases : [],
              Allergies: Array.isArray(apiProfileData.Allergies) ? apiProfileData.Allergies : [],
              profilePhoto: apiProfileData.profilePhoto || null
            }
            setProfileData(normalizedData)
            setOriginalProfileData(normalizedData)
          }
        } catch (error) {
          console.error('Error loading profile data:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadUserData()
  }, [authLoading, isAuthenticated, user])

  // Handle profile data changes
  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true)
    setOriginalProfileData({ ...profileData })
  }

  // Handle save
  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      await profileService.updateProfile(user._id, profileData)
      setOriginalProfileData({ ...profileData })
      setHasChanges(false)
      setIsEditing(false)
      console.log('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (originalProfileData) {
      setProfileData({ ...originalProfileData })
    }
    setHasChanges(false)
    setIsEditing(false)
  }

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Personal Information',
      description: 'Manage your personal information and profile details',
      icon: <User className="w-5 h-5" />,
      items: []
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Control how you receive notifications and updates',
      icon: <Bell className="w-5 h-5" />,
      items: [
        {
          id: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Receive push notifications on your device',
          type: 'toggle',
          value: settings.notifications.push
        },
        {
          id: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          type: 'toggle',
          value: settings.notifications.email
        },
        {
          id: 'smsNotifications',
          label: 'SMS Notifications',
          description: 'Receive notifications via SMS',
          type: 'toggle',
          value: settings.notifications.sms
        },
        {
          id: 'marketingEmails',
          label: 'Marketing Communications',
          description: 'Receive promotional emails and updates',
          type: 'toggle',
          value: settings.notifications.marketing
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Manage your privacy settings and data sharing preferences',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          id: 'profileVisibility',
          label: 'Profile Visibility',
          description: 'Who can see your profile',
          type: 'select',
          value: settings.privacy.profileVisibility,
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Friends Only', value: 'friends' },
            { label: 'Private', value: 'private' }
          ]
        },
        {
          id: 'showEmail',
          label: 'Show Email on Profile',
          description: 'Display your email address on your public profile',
          type: 'toggle',
          value: settings.privacy.showEmail
        },
        {
          id: 'showPhone',
          label: 'Show Phone on Profile',
          description: 'Display your phone number on your public profile',
          type: 'toggle',
          value: settings.privacy.showPhone
        },
        {
          id: 'dataSharing',
          label: 'Data Sharing',
          description: 'Allow anonymous data sharing for service improvement',
          type: 'toggle',
          value: settings.privacy.dataSharing
        }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage your account security and authentication settings',
      icon: <Lock className="w-5 h-5" />,
      items: [
        {
          id: 'twoFactor',
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          type: 'toggle',
          value: settings.security.twoFactor
        },
        {
          id: 'loginAlerts',
          label: 'Login Alerts',
          description: 'Get notified when someone logs into your account',
          type: 'toggle',
          value: settings.security.loginAlerts
        },
        {
          id: 'sessionTimeout',
          label: 'Session Timeout',
          description: 'Automatically log out after inactivity',
          type: 'select',
          value: settings.security.sessionTimeout,
          options: [
            { label: '15 minutes', value: '15' },
            { label: '30 minutes', value: '30' },
            { label: '1 hour', value: '60' },
            { label: '4 hours', value: '240' }
          ]
        },
        {
          id: 'changePassword',
          label: 'Change Password',
          description: 'Update your account password',
          type: 'button',
          action: () => console.log('Change password')
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of your experience',
      icon: <Palette className="w-5 h-5" />,
      items: [
        {
          id: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select',
          value: settings.appearance.theme,
          options: [
            { label: 'System Default', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' }
          ]
        },
        {
          id: 'language',
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          value: settings.appearance.language,
          options: [
            { label: 'English', value: 'en' },
            { label: 'Spanish', value: 'es' },
            { label: 'French', value: 'fr' },
            { label: 'German', value: 'de' }
          ]
        },
        {
          id: 'fontSize',
          label: 'Font Size',
          description: 'Adjust text size for better readability',
          type: 'select',
          value: settings.appearance.fontSize,
          options: [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
          ]
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Export, import, or delete your data',
      icon: <Download className="w-5 h-5" />,
      items: [
        {
          id: 'exportData',
          label: 'Export Data',
          description: 'Download a copy of your data',
          type: 'button',
          action: () => console.log('Export data')
        },
        {
          id: 'importData',
          label: 'Import Data',
          description: 'Import data from a backup file',
          type: 'button',
          action: () => console.log('Import data')
        },
        {
          id: 'deleteAccount',
          label: 'Delete Account',
          description: 'Permanently delete your account and all data',
          type: 'button',
          action: () => console.log('Delete account')
        }
      ]
    }
  ]

  const handleSettingChange = (sectionId: string, itemId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId as keyof typeof prev],
        [itemId]: value
      }
    }))
  }

  // Simple Input Field Component with guaranteed visibility
  const SimpleInputField = ({ 
    label, 
    value, 
    onChange, 
    disabled = false, 
    type = 'text',
    placeholder = ''
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    type?: string
    placeholder?: string
  }) => {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #374151',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            color: '#000000',
            backgroundColor: '#ffffff',
            outline: 'none',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            lineHeight: '1.5'
          } as any}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#d1d5db'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>
    )
  }

  // Render Personal Information Section
  const renderPersonalInfoSection = () => {
    const personalFields = [
      { key: 'FullName' as keyof ProfileData, label: 'Full Name', placeholder: 'Enter your full name' },
      { key: 'Email' as keyof ProfileData, label: 'Email Address', placeholder: 'Enter your email address', type: 'email' },
      { key: 'MobileNumber' as keyof ProfileData, label: 'Phone Number', placeholder: 'Enter your phone number', type: 'tel' },
      { key: 'AlternativeNumber' as keyof ProfileData, label: 'Alternative Phone', placeholder: 'Enter alternative phone number', type: 'tel' },
      { key: 'DateOfBirth' as keyof ProfileData, label: 'Date of Birth', placeholder: 'YYYY-MM-DD', type: 'date' },
      { key: 'Gender' as keyof ProfileData, label: 'Gender', placeholder: 'Select gender' },
      { key: 'Country' as keyof ProfileData, label: 'Country', placeholder: 'Enter your country' },
      { key: 'State' as keyof ProfileData, label: 'State/Province', placeholder: 'Enter your state or province' },
      { key: 'City' as keyof ProfileData, label: 'City', placeholder: 'Enter your city' },
      { key: 'Address' as keyof ProfileData, label: 'Address', placeholder: 'Enter your full address' },
      { key: 'Height' as keyof ProfileData, label: 'Height', placeholder: 'Enter height (e.g., 5\'8")' },
      { key: 'Weight' as keyof ProfileData, label: 'Weight', placeholder: 'Enter weight (e.g., 70 kg)' },
      { key: 'BloodGroup' as keyof ProfileData, label: 'Blood Group', placeholder: 'Enter blood group (e.g., A+)' }
    ]

    return (
      <div className={styles.personalInfoSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <User className="w-5 h-5" />
          </div>
          <div className={styles.sectionHeaderContent}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <p className={styles.sectionDescription}>Manage your personal information and profile details</p>
          </div>
          <div className={styles.sectionActions}>
            {!isEditing ? (
              <button
                className={styles.editButton}
                onClick={handleEdit}
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className={styles.editActions}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  className={`${styles.saveButton} ${!hasChanges ? styles.saveButtonDisabled : ''}`}
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem'
        }}>
          {personalFields.map(field => (
            <SimpleInputField
              key={field.key}
              label={field.label}
              value={profileData[field.key] as string || ''}
              onChange={(value: string) => handleProfileChange(field.key, value)}
              disabled={!isEditing}
              type={field.type || 'text'}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        {/* Medical Information */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #f1f5f9'
        }}>
          <h3 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '1.5rem'
          }}>
            <Heart className="w-4 h-4" />
            Medical Information
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.75rem'
              }}>Chronic Diseases</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {profileData.ChronicDiseases?.map((disease, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={disease}
                      onChange={(e) => {
                        const newDiseases = [...(profileData.ChronicDiseases || [])]
                        newDiseases[index] = e.target.value
                        handleProfileChange('ChronicDiseases', newDiseases as any)
                      }}
                      disabled={!isEditing}
                      placeholder="Enter chronic disease"
                      style={{
                        flex: '1',
                        padding: '0.75rem',
                        border: '2px solid #374151',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#000000',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'bold',
                        lineHeight: '1.5'
                      } as any}
                    />
                    {isEditing && (
                      <button
                        onClick={() => {
                          const newDiseases = profileData.ChronicDiseases?.filter((_, i) => i !== index) || []
                          handleProfileChange('ChronicDiseases', newDiseases as any)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          border: '1px solid #dc2626',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() => {
                      const newDiseases = [...(profileData.ChronicDiseases || []), '']
                      handleProfileChange('ChronicDiseases', newDiseases as any)
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px dashed #9ca3af',
                      borderRadius: '0.5rem',
                      background: 'transparent',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      marginTop: '0.25rem'
                    }}
                  >
                    + Add Disease
                  </button>
                )}
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.75rem'
              }}>Allergies</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {profileData.Allergies?.map((allergy, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={allergy}
                      onChange={(e) => {
                        const newAllergies = [...(profileData.Allergies || [])]
                        newAllergies[index] = e.target.value
                        handleProfileChange('Allergies', newAllergies as any)
                      }}
                      disabled={!isEditing}
                      placeholder="Enter allergy"
                      style={{
                        flex: '1',
                        padding: '0.75rem',
                        border: '2px solid #374151',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#000000',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'bold',
                        lineHeight: '1.5'
                      } as any}
                    />
                    {isEditing && (
                      <button
                        onClick={() => {
                          const newAllergies = profileData.Allergies?.filter((_, i) => i !== index) || []
                          handleProfileChange('Allergies', newAllergies as any)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          border: '1px solid #dc2626',
                          borderRadius: '6px',
                          background: 'transparent',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={() => {
                      const newAllergies = [...(profileData.Allergies || []), '']
                      handleProfileChange('Allergies', newAllergies as any)
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px dashed #9ca3af',
                      borderRadius: '0.5rem',
                      background: 'transparent',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      marginTop: '0.25rem'
                    }}
                  >
                    + Add Allergy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSettingItem = (section: SettingsSection, item: SettingItem) => {
    switch (item.type) {
      case 'toggle':
        return (
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>{item.label}</label>
              {item.description && (
                <p className={styles.settingDescription}>{item.description}</p>
              )}
            </div>
            <div className={styles.settingControl}>
              <button
                className={`${styles.toggle} ${item.value ? styles.toggleActive : ''}`}
                onClick={() => handleSettingChange(section.id, item.id.replace(/[A-Z]/g, letter => letter.toLowerCase()), !item.value)}
              >
                <div className={styles.toggleSlider}></div>
              </button>
            </div>
          </div>
        )

      case 'select':
        return (
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>{item.label}</label>
              {item.description && (
                <p className={styles.settingDescription}>{item.description}</p>
              )}
            </div>
            <div className={styles.settingControl}>
              <select
                className={styles.select}
                value={item.value}
                onChange={(e) => handleSettingChange(section.id, item.id, e.target.value)}
              >
                {item.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 'input':
        return (
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>{item.label}</label>
              {item.description && (
                <p className={styles.settingDescription}>{item.description}</p>
              )}
            </div>
            <div className={styles.settingControl}>
              <input
                type="text"
                className={styles.input}
                value={item.value || ''}
                onChange={(e) => {
                  const key = item.id as keyof ProfileData
                  setProfileData(prev => ({ ...prev, [key]: e.target.value }))
                }}
              />
            </div>
          </div>
        )

      case 'button':
        return (
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <label className={styles.settingLabel}>{item.label}</label>
              {item.description && (
                <p className={styles.settingDescription}>{item.description}</p>
              )}
            </div>
            <div className={styles.settingControl}>
              <button
                className={styles.button}
                onClick={item.action}
              >
                {item.id === 'deleteAccount' ? 'Delete' : 'Manage'}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <UniversalHeader />
      
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage your account preferences and settings</p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Sidebar Navigation */}
          <div className={styles.sidebar}>
            <nav className={styles.nav}>
              {settingsSections.map(section => (
                <button
                  key={section.id}
                  className={`${styles.navItem} ${activeSection === section.id ? styles.navItemActive : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className={styles.navItemIcon}>
                    {section.icon}
                  </div>
                  <div className={styles.navItemContent}>
                    <span className={styles.navItemTitle}>{section.title}</span>
                    <span className={styles.navItemDescription}>{section.description}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className={styles.main}>
            {activeSection === 'profile' ? (
              renderPersonalInfoSection()
            ) : (
              settingsSections
                .filter(section => section.id === activeSection)
                .map(section => (
                  <div key={section.id} className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionIcon}>
                        {section.icon}
                      </div>
                      <div>
                        <h2 className={styles.sectionTitle}>{section.title}</h2>
                        <p className={styles.sectionDescription}>{section.description}</p>
                      </div>
                    </div>

                    <div className={styles.sectionContent}>
                      {section.items.map(item => (
                        <div key={item.id}>
                          {renderSettingItem(section, item)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettingsPage
