'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Icon, UniversalHeader } from '../../components/atoms';

const DemoFilesPage: React.FC = () => {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleViewFiles = () => {
    router.push('/files?folderId=folder-1&userId=user-123');
  };

  const features = [
    {
      icon: 'upload',
      title: 'File Upload',
      description: 'Drag & drop or click to upload multiple files with progress tracking'
    },
    {
      icon: 'search',
      title: 'Search & Filter',
      description: 'Quickly find files with real-time search and sorting options'
    },
    {
      icon: 'download',
      title: 'Download & View',
      description: 'Download files or view them directly in the browser'
    },
    {
      icon: 'folder',
      title: 'Folder Management',
      description: 'Organize files in folders with sharing capabilities'
    },
    {
      icon: 'document',
      title: 'File Types',
      description: 'Support for PDF, DOC, XLS, images, videos, and more'
    },
    {
      icon: 'trash',
      title: 'File Management',
      description: 'Delete, rename, and manage your files with ease'
    }
  ];

  // Show loading until client-side detection is complete to prevent flash
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-gray-700">Loading File Management...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <UniversalHeader
        title="File Management System"
        subtitle="A complete file management solution with atomic design architecture"
        variant="default"
        showBackButton={true}
        rightContent={
          <Button
            onClick={handleViewFiles}
            className="flex items-center space-x-2"
          >
            <Icon name="folder" size="small" color="white" />
            <span>View Demo Files</span>
          </Button>
        }
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <Typography variant="h1" className="text-gray-900 font-bold mb-6">
            Modern File Management
          </Typography>
          <Typography variant="h5" color="secondary" className="max-w-3xl mx-auto mb-8">
            Built with Next.js, TypeScript, and Tailwind CSS using atomic design principles.
            Responsive design that works seamlessly on both mobile and desktop.
          </Typography>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={handleViewFiles}
              size="large"
              className="flex items-center space-x-2"
            >
              <Icon name="folder" size="small" color="white" />
              <span>Try Demo</span>
            </Button>
            <Button
              onClick={() => window.open('https://github.com', '_blank')}
              variant="secondary"
              size="large"
              className="flex items-center space-x-2"
            >
              <Icon name="document" size="small" />
              <span>View Code</span>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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

        {/* Architecture Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <Typography variant="h4" className="text-gray-900 font-bold mb-6 text-center">
            Atomic Design Architecture
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="document" size="large" color="#10B981" />
              </div>
              <Typography variant="h6" className="text-gray-900 font-semibold mb-2">
                Atoms
              </Typography>
              <Typography variant="body2" color="secondary">
                SearchBar, FloatingButton, Icon, Typography, Button
              </Typography>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="folder" size="large" color="#F59E0B" />
              </div>
              <Typography variant="h6" className="text-gray-900 font-semibold mb-2">
                Molecules
              </Typography>
              <Typography variant="body2" color="secondary">
                FileItem, UploadModal with complex interactions
              </Typography>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="document" size="large" color="#8B5CF6" />
              </div>
              <Typography variant="h6" className="text-gray-900 font-semibold mb-2">
                Organisms
              </Typography>
              <Typography variant="body2" color="secondary">
                FileScreen, FileScreenDesktop with full functionality
              </Typography>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 text-center">
          <Typography variant="h5" className="text-gray-900 font-semibold mb-6">
            Built With Modern Technologies
          </Typography>
          <div className="flex flex-wrap items-center justify-center space-x-8 text-gray-600">
            <span className="text-lg font-medium">Next.js 15</span>
            <span className="text-lg font-medium">TypeScript</span>
            <span className="text-lg font-medium">Tailwind CSS</span>
            <span className="text-lg font-medium">React Hooks</span>
            <span className="text-lg font-medium">Atomic Design</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoFilesPage;
