'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Icon, UniversalHeader } from '../../components/atoms';

const DemoNavigationFlowPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const navigationSteps = [
    {
      id: 1,
      title: 'Records Icon',
      description: 'Start from the Records section in your navigation',
      icon: 'records',
      iconColor: '#3B82F6',
      action: 'Go to Records',
      route: '/records',
      breadcrumb: ['Records']
    },
    {
      id: 2,
      title: 'Folder Selection',
      description: 'Choose a medical record folder to explore',
      icon: 'folder',
      iconColor: '#10B981',
      action: 'Open Folder',
      route: '/records',
      breadcrumb: ['Records', 'Folder']
    },
    {
      id: 3,
      title: 'File Management',
      description: 'Manage files within the selected folder',
      icon: 'file',
      iconColor: '#8B5CF6',
      action: 'View Files',
      route: '/file-screen?folderId=medical-reports&userId=user-123&folderName=Medical%20Reports',
      breadcrumb: ['Records', 'Folder', 'Files']
    }
  ];

  const features = [
    {
      icon: 'records',
      title: 'Records Entry Point',
      description: 'Access all your medical records from a central location'
    },
    {
      icon: 'folder',
      title: 'Organized Folders',
      description: 'Medical records categorized into logical folders'
    },
    {
      icon: 'search',
      title: 'Search & Filter',
      description: 'Find specific folders and files quickly'
    },
    {
      icon: 'upload',
      title: 'File Upload',
      description: 'Add new documents to appropriate folders'
    },
    {
      icon: 'download',
      title: 'File Actions',
      description: 'View, download, and manage individual files'
    },
    {
      icon: 'arrow-left',
      title: 'Easy Navigation',
      description: 'Navigate back through the hierarchy seamlessly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <UniversalHeader
        title="Navigation Flow Demo"
        subtitle="Records Icon → Folder Screen → File Screen"
        variant="default"
        showBackButton={true}
        rightContent={
          <Button
            onClick={() => router.push('/records')}
            className="flex items-center space-x-2"
          >
            <Icon name="records" size="small" color="white" />
            <span>Start Demo</span>
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-gray-900 font-bold mb-6">
            Complete Navigation Experience
          </Typography>
          <Typography variant="h5" color="secondary" className="max-w-3xl mx-auto mb-8">
            Experience the seamless flow from Records overview to detailed file management
            with intuitive navigation breadcrumbs and consistent UI design.
          </Typography>
        </div>

        {/* Navigation Flow */}
        <div className="mb-16">
          <Typography variant="h4" className="text-gray-900 font-bold mb-8 text-center">
            Navigation Flow
          </Typography>
          
          {/* Breadcrumb Visualization */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {navigationSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= step.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon 
                        name={step.icon as any} 
                        size="small" 
                        color={currentStep >= step.id ? step.iconColor : '#9CA3AF'} 
                      />
                    </div>
                    <Typography 
                      variant="body2" 
                      className={currentStep >= step.id ? 'text-gray-900 font-medium' : 'text-gray-500'}
                    >
                      {step.breadcrumb[step.breadcrumb.length - 1]}
                    </Typography>
                  </div>
                  {index < navigationSteps.length - 1 && (
                    <Icon 
                      name="chevron-right" 
                      size="small" 
                      color={currentStep > step.id ? '#3B82F6' : '#D1D5DB'} 
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {navigationSteps.map((step, index) => (
              <div
                key={step.id}
                className={`relative bg-white rounded-2xl p-6 shadow-sm border-2 transition-all duration-200 ${
                  currentStep === step.id 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Step Number */}
                <div className="absolute -top-4 left-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === step.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      currentStep === step.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon 
                        name={step.icon as any} 
                        size="medium" 
                        color={currentStep === step.id ? step.iconColor : '#9CA3AF'} 
                      />
                    </div>
                    <Typography variant="h6" className="text-gray-900 font-semibold">
                      {step.title}
                    </Typography>
                  </div>
                  
                  <Typography variant="body2" color="secondary" className="mb-6">
                    {step.description}
                  </Typography>
                  
                  <Button
                    onClick={() => {
                      setCurrentStep(step.id);
                      router.push(step.route);
                    }}
                    variant={currentStep === step.id ? 'primary' : 'secondary'}
                    size="small"
                    className="w-full"
                  >
                    {step.action}
                  </Button>
                </div>

                {/* Arrow to next step */}
                {index < navigationSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <Icon name="chevron-right" size="medium" color="#D1D5DB" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <Typography variant="h4" className="text-gray-900 font-bold mb-8 text-center">
            Navigation Features
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name={feature.icon as any} size="medium" color="#3B82F6" />
                  </div>
                  <Typography variant="h6" className="text-gray-900 font-semibold">
                    {feature.title}
                  </Typography>
                </div>
                <Typography variant="body2" color="secondary">
                  {feature.description}
                </Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <Typography variant="h5" className="text-gray-900 font-semibold mb-4">
            Try the Complete Flow
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Experience each step of the navigation flow from Records to File management.
          </Typography>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => router.push('/records')}
              size="large"
              className="flex items-center space-x-2"
            >
              <Icon name="records" size="small" color="white" />
              <span>Start with Records</span>
            </Button>
            <Button
              onClick={() => router.push('/file-screen?folderId=medical-reports&userId=user-123&folderName=Medical%20Reports')}
              variant="secondary"
              size="large"
              className="flex items-center space-x-2"
            >
              <Icon name="file" size="small" />
              <span>Jump to Files</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoNavigationFlowPage;
