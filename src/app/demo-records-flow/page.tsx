'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Icon, UniversalHeader } from '../../components/atoms';

const DemoRecordsFlowPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Records Overview',
      description: 'Start from the Medical Records page where you can see all your organized folders',
      action: 'View Records Page',
      route: '/records'
    },
    {
      id: 2,
      title: 'Select a Folder',
      description: 'Click on any folder (e.g., Medical Reports) to view its contents',
      action: 'Open Medical Reports',
      route: '/files?folderId=medical-reports&userId=user-123&folderName=Medical%20Reports'
    },
    {
      id: 3,
      title: 'File Management',
      description: 'View, download, upload, and manage files within the selected folder',
      action: 'Try File Management',
      route: '/files?folderId=prescriptions&userId=user-123&folderName=Prescriptions'
    }
  ];

  const features = [
    {
      icon: 'folder',
      title: 'Organized Folders',
      description: 'Medical records are organized into logical folders like Medical Reports, Prescriptions, Imaging, etc.'
    },
    {
      icon: 'search',
      title: 'Search & Filter',
      description: 'Quickly find folders and files with real-time search functionality'
    },
    {
      icon: 'upload',
      title: 'File Upload',
      description: 'Upload new documents with drag & drop support and progress tracking'
    },
    {
      icon: 'download',
      title: 'File Actions',
      description: 'View, download, and delete files with intuitive actions'
    },
    {
      icon: 'document',
      title: 'File Types',
      description: 'Support for PDFs, images, documents, and medical imaging files'
    },
    {
      icon: 'records',
      title: 'Medical Focus',
      description: 'Specifically designed for medical records with appropriate categories'
    }
  ];

  const folderExamples = [
    { name: 'Medical Reports', count: 12, icon: 'document', color: 'bg-blue-100 text-blue-600' },
    { name: 'Prescriptions', count: 8, icon: 'pill', color: 'bg-green-100 text-green-600' },
    { name: 'Medical Imaging', count: 5, icon: 'image', color: 'bg-purple-100 text-purple-600' },
    { name: 'Insurance Documents', count: 6, icon: 'health-card', color: 'bg-orange-100 text-orange-600' },
    { name: 'Vaccination Records', count: 4, icon: 'needle', color: 'bg-red-100 text-red-600' },
    { name: 'Appointment Records', count: 15, icon: 'calendar', color: 'bg-indigo-100 text-indigo-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <UniversalHeader
        title="Records to Files Integration"
        subtitle="Complete flow from medical records organization to file management"
        variant="default"
        showBackButton={true}
        rightContent={
          <Button
            onClick={() => router.push('/records')}
            className="flex items-center space-x-2"
          >
            <Icon name="records" size="small" color="white" />
            <span>Try Live Demo</span>
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-gray-900 font-bold mb-6">
            Seamless Medical Records Management
          </Typography>
          <Typography variant="h5" color="secondary" className="max-w-3xl mx-auto mb-8">
            From organized folder structure to detailed file management - experience the complete workflow
            for managing your medical documents with ease.
          </Typography>
        </div>

        {/* Step-by-Step Flow */}
        <div className="mb-16">
          <Typography variant="h4" className="text-gray-900 font-bold mb-8 text-center">
            How It Works
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
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
                  <Typography variant="h6" className="text-gray-900 font-semibold mb-3">
                    {step.title}
                  </Typography>
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
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <Icon name="chevron-right" size="medium" color="#D1D5DB" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Folder Examples */}
        <div className="mb-16">
          <Typography variant="h4" className="text-gray-900 font-bold mb-8 text-center">
            Medical Record Folders
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folderExamples.map((folder, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/files?folderId=${folder.name.toLowerCase().replace(/\s+/g, '-')}&userId=user-123&folderName=${encodeURIComponent(folder.name)}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${folder.color}`}>
                    <Icon name={folder.icon as any} size="medium" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="h6" className="text-gray-900 font-semibold">
                      {folder.name}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                      {folder.count} files
                    </Typography>
                  </div>
                  <Icon name="chevron-right" size="small" color="#9CA3AF" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <Typography variant="h4" className="text-gray-900 font-bold mb-8 text-center">
            Key Features
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

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <Typography variant="h5" className="text-gray-900 font-semibold mb-4">
            Ready to Experience the Full Workflow?
          </Typography>
          <Typography variant="body1" color="secondary" className="mb-6">
            Start with the Records page and click through to see how seamlessly you can manage your medical files.
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
              onClick={() => router.push('/demo-files')}
              variant="secondary"
              size="large"
              className="flex items-center space-x-2"
            >
              <Icon name="document" size="small" />
              <span>View File Features</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoRecordsFlowPage;
