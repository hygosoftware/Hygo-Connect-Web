'use client'
import React, { useEffect, useState } from 'react';

import { CheckCircle2, ArrowRight, ArrowLeft, X, User, Heart, Phone, Shield, Award } from 'lucide-react';

interface ProfileCompletionWizardProps {
  onClose: () => void;
  currentCompletion: number;
  profileData: any;
  onUpdateProfile: (data: any) => void;
}

const ProfileCompletionWizard: React.FC<ProfileCompletionWizardProps> = ({ 
  onClose, 
  currentCompletion, 
  profileData, 
  onUpdateProfile 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(profileData);

  // Helper: Convert to dd-mm-yyyy if possible; pass-through otherwise
  const toDDMMYYYY = (value: string | undefined | null): string => {
    if (!value) return '';
    const str = String(value).trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}-${m}-${y}`;
    }
    return str;
  };

  // Helper: mask input to dd-mm-yyyy while typing
  const formatDOBInput = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0,2)}-${digits.slice(2)}`;
    return `${digits.slice(0,2)}-${digits.slice(2,4)}-${digits.slice(4)}`;
  };

  // Normalize initial DOB once on mount to dd-mm-yyyy
  useEffect(() => {
    setFormData((prev: any) => ({
      ...prev,
      DateOfBirth: toDDMMYYYY(prev?.DateOfBirth)
    }));
  }, []);

  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: <User className="w-5 h-5" />,
      description: 'Complete your basic profile information',
      fields: ['FullName', 'Gender', 'DateOfBirth', 'Age']
    },
    {
      id: 'contact',
      title: 'Contact Details',
      icon: <Phone className="w-5 h-5" />,
      description: 'Add your contact information',
      fields: ['MobileNumber', 'Email', 'Country', 'State', 'City']
    },
    {
      id: 'medical',
      title: 'Health Information',
      icon: <Heart className="w-5 h-5" />,
      description: 'Share your health details for better care',
      fields: ['Height', 'Weight', 'BloodGroup']
    }
  ];

  const isStepComplete = (stepIndex: number) => {
    const step = steps[stepIndex];
    return step.fields.every(field => formData[field] && String(formData[field]).trim() !== '');
  };

  const getStepCompletion = (stepIndex: number) => {
    const step = steps[stepIndex];
    const completedFields = step.fields.filter(field => formData[field] && String(formData[field]).trim() !== '').length;
    return Math.round((completedFields / step.fields.length) * 100);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Format mobile numbers for API compatibility
    const formatMobileNumber = (number: string) => {
      if (!number || number.trim() === '') return [];
      return [{
        number: number.trim(),
        isVerified: false
      }];
    };

    const formattedData = {
      ...formData,
      MobileNumber: formatMobileNumber(formData.MobileNumber || ''),
      AlternativeNumber: formatMobileNumber(formData.AlternativeNumber || ''),
      DateOfBirth: toDDMMYYYY(formData.DateOfBirth || ''),
    };

    onUpdateProfile(formattedData);
    onClose();
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              value={formData.FullName || ''} 
              onChange={v => handleInputChange('FullName', v)} 
            />
            <Select 
              label="Gender" 
              value={formData.Gender || ''} 
              onChange={v => handleInputChange('Gender', v)}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Others', label: 'Others' }
              ]}
            />
            <Input 
              label="Date of Birth" 
              value={formData.DateOfBirth || ''} 
              onChange={v => handleInputChange('DateOfBirth', formatDOBInput(v))} 
              type="text"
              placeholder="dd-mm-yyyy"
            />
            <Input 
              label="Age" 
              value={formData.Age || ''} 
              onChange={v => handleInputChange('Age', v)} 
              type="number"
            />
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-4">
            <Input 
              label="Mobile Number" 
              value={formData.MobileNumber || ''} 
              onChange={v => handleInputChange('MobileNumber', v)} 
            />
            <Input 
              label="Email Address" 
              value={formData.Email || ''} 
              onChange={v => handleInputChange('Email', v)} 
              type="email"
            />
            <Input 
              label="Country" 
              value={formData.Country || ''} 
              onChange={v => handleInputChange('Country', v)} 
            />
            <Input 
              label="State/Province" 
              value={formData.State || ''} 
              onChange={v => handleInputChange('State', v)} 
            />
            <Input 
              label="City" 
              value={formData.City || ''} 
              onChange={v => handleInputChange('City', v)} 
            />
          </div>
        );
      case 'medical':
        return (
          <div className="space-y-4">
            <Input 
              label="Height (cm)" 
              value={formData.Height || ''} 
              onChange={v => handleInputChange('Height', v)} 
              type="number"
            />
            <Input 
              label="Weight (kg)" 
              value={formData.Weight || ''} 
              onChange={v => handleInputChange('Weight', v)} 
              type="number"
            />
            <Select 
              label="Blood Group" 
              value={formData.BloodGroup || ''} 
              onChange={v => handleInputChange('BloodGroup', v)}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' }
              ]}
            />

          </div>
        );

      default:
        return null;
    }
  };

  const Input = ({ label, value, onChange, type = 'text', placeholder }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
        placeholder={placeholder}
      />
    </div>
  );

  const Select = ({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  // Component return UI
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Complete Your Profile</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Top Progress Summary */}
        <div className="px-6 pt-4">
          <div className="text-blue-600 text-sm mb-2">
            Step {currentStep + 1} of {steps.length} • {currentCompletion}% Complete
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-6 pt-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index === currentStep
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isStepComplete(index)
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {isStepComplete(index) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isStepComplete(index) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-blue-600">{steps[currentStep].icon}</div>
              <h3 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h3>
            </div>
            <p className="text-gray-600">{steps[currentStep].description}</p>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Step Progress</span>
                <span className="text-sm font-medium text-blue-600">{getStepCompletion(currentStep)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStepCompletion(currentStep)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              <Award className="w-4 h-4" />
              Complete Profile
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionWizard;