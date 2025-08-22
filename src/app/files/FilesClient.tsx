// This is the client-only logic split out from the original FilesContent component
'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FileScreen from '../../components/organisms/FileScreen';
import FileScreenDesktop from '../../components/organisms/FileScreenDesktop';

const FilesClient: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  // Check if we have required parameters
  const folderId = searchParams.get('folderId');
  const userId = searchParams.get('userId');

  useEffect(() => {
    setIsClient(true);

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Show error if required parameters are missing
  if (!folderId || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Missing Parameters</h1>
          <p className="text-gray-600 mb-6">
            This page requires folderId and userId parameters to function properly.
          </p>
          <p className="text-sm text-gray-500">
            Example: /files?folderId=folder-1&userId=user-123
          </p>
        </div>
      </div>
    );
  }

  // Show loading until client-side detection is complete to prevent flash
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <div className="text-lg font-medium text-gray-700">Loading Files...</div>
        </div>
      </div>
    );
  }

  // Render appropriate component based on screen size
  const FileComponent = isDesktop ? FileScreenDesktop : FileScreen;

  return <FileComponent />;
};

export default FilesClient;
