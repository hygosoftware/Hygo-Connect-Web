'use client';

import React, { useEffect, useState } from 'react';
import { Icon, Typography } from '../atoms';
import { folderService, FileDetails } from '../../services/apiServices';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  fileId: string;
  fileName?: string;
  fileType?: string;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  folderId,
  fileId,
  fileName,
  fileType: initialFileType = ''
}) => {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(() => {
    // Initialize with file type from props if available
    if (initialFileType) {
      return { 
        _id: fileId, 
        fileName: fileName || '', 
        fileType: initialFileType,
        filePath: '',
        fileSize: 0,
        uploadedAt: new Date().toISOString()
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview');

  useEffect(() => {
    console.log('📋 FilePreviewModal useEffect:', { isOpen, folderId, fileId, fileType: initialFileType });
    if (isOpen && folderId && fileId) {
      if (initialFileType) {
        // If we have fileType from props, use it immediately
        setFileDetails(prev => ({
          ...(prev || {} as FileDetails),
          _id: fileId,
          fileName: fileName || '',
          fileType: initialFileType,
          filePath: prev?.filePath || '',
          fileSize: prev?.fileSize || 0,
          uploadedAt: prev?.uploadedAt || new Date().toISOString()
        }));
      }
      console.log('📋 Fetching file details...');
      fetchFileDetails();
    } else {
      // Reset state when modal is closed
      setFileDetails(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, folderId, fileId, initialFileType, fileName]);

  const fetchFileDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching file details for preview:', { folderId, fileId });
      const details = await folderService.getFileDetails(folderId, fileId);
      
      if (details) {
        // Ensure file path is absolute
        const fileDetails = {
          ...details,
          filePath: details.filePath?.startsWith('http') 
            ? details.filePath 
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${details.filePath?.startsWith('/') ? '' : '/'}${details.filePath || ''}`,
          thumbnailUrl: details.thumbnailUrl?.startsWith('http')
            ? details.thumbnailUrl
            : details.thumbnailUrl
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${details.thumbnailUrl.startsWith('/') ? '' : '/'}${details.thumbnailUrl}`
              : undefined
        };
        
        setFileDetails(fileDetails);
      } else {
        setError('File details not found');
      }
    } catch (err) {
      console.error('❌ Error fetching file details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file details');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getFileTypeDisplay = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('word')) return 'Word Document';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel Spreadsheet';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint Presentation';
    if (fileType.startsWith('image/')) return 'Image File';
    if (fileType.startsWith('video/')) return 'Video File';
    if (fileType.startsWith('audio/')) return 'Audio File';
    return 'File';
  };

  const canPreview = (fileType: string): boolean => {
    if (!fileType) return false;
    
    const lowerFileType = fileType.toLowerCase();
    
    // Check for image types
    if (lowerFileType.startsWith('image/')) return true;
    
    // Check for specific file extensions that might be missing the image/ prefix
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
    if (imageExtensions.some(ext => lowerFileType.endsWith(ext))) return true;
    
    // Check for common image MIME types without prefix
    const imageMimeTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
    if (imageMimeTypes.some(type => lowerFileType.includes(type))) return true;
    
    // Check for other previewable types
    return (
      lowerFileType.startsWith('video/') ||
      lowerFileType.startsWith('audio/') ||
      lowerFileType.includes('pdf') ||
      lowerFileType.includes('text/') ||
      lowerFileType.includes('json') ||
      lowerFileType.includes('xml') ||
      lowerFileType.includes('html')
    );
  };

  const renderPreview = () => {
    if (!fileDetails) return null;

    const { fileType, filePath, fileName } = fileDetails;
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center p-8">
          <Icon name="alert" size="large" className="text-red-500 mx-auto mb-4" />
          <Typography variant="h6" className="text-red-600 mb-2">Error loading file</Typography>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFileDetails}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    // Handle image files - improved detection
    const lowerFileType = fileType.toLowerCase();
    const isImageFile = (
      lowerFileType.startsWith('image/') || 
      lowerFileType.endsWith('.png') || 
      lowerFileType.endsWith('.jpg') || 
      lowerFileType.endsWith('.jpeg') || 
      lowerFileType.endsWith('.gif') || 
      lowerFileType.endsWith('.webp') ||
      lowerFileType.endsWith('.svg') ||
      lowerFileType.includes('png') ||
      lowerFileType.includes('jpg') ||
      lowerFileType.includes('jpeg') ||
      lowerFileType.includes('gif') ||
      lowerFileType.includes('webp') ||
      lowerFileType.includes('svg')
    );
    
    if (isImageFile) {
      
      // Get the API base URL and userId
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      
      // Construct the image URL with the proper file endpoint path
      const imageUrl = filePath.startsWith('http') 
        ? filePath 
        : `${API_BASE}/file/${userId}/${folderId}/${fileId}`;
      
      return (
        <div className="flex items-center justify-center bg-gray-50 p-3 sm:p-4 min-h-[50vh] sm:min-h-[60vh]">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imageUrl}
              alt={fileName || 'Preview'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              style={{ maxHeight: '70vh' }}
              onError={(e) => {
                const img = e.currentTarget;
                console.error('Error loading image:', imageUrl);
                img.style.display = 'none';
                const fallback = img.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.classList.remove('hidden');
                  fallback.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'w-full', 'h-full');
                }
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', imageUrl);
              }}
            />
            <div className="hidden absolute inset-0 flex-col items-center justify-center text-center text-gray-500 bg-white p-4 rounded-lg">
              <Icon name="image" size="large" className="text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Image preview not available</p>
              <p className="text-sm mb-6">The image could not be loaded.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = fileName || 'download';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (fileType.toLowerCase().startsWith('video/')) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <video
            controls
            className="w-full max-h-96 rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          >
            <source src={filePath} type={fileType} />
            Your browser does not support the video tag.
          </video>
          <div className="hidden text-center text-gray-500 py-8">
            <Icon name="video" size="large" color="#9CA3AF" className="mx-auto mb-2" />
            <p>Video preview not available</p>
          </div>
        </div>
      );
    }

    if (fileType.toLowerCase().startsWith('audio/')) {
      return (
        <div className="bg-gray-50 rounded-lg p-8">
          <div className="text-center mb-4">
            <Icon name="audio" size="large" color="#6B7280" className="mx-auto mb-2" />
            <Typography variant="h6" className="text-gray-700">
              {fileName}
            </Typography>
          </div>
          <audio
            controls
            className="w-full"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          >
            <source src={filePath} type={fileType} />
            Your browser does not support the audio tag.
          </audio>
          <div className="hidden text-center text-gray-500 mt-4">
            <p>Audio preview not available</p>
          </div>
        </div>
      );
    }

    if (fileType.toLowerCase().includes('pdf')) {
      // Construct the proper PDF URL
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      const directPdfUrl = filePath.startsWith('http') 
        ? filePath 
        : `${API_BASE}/file/${userId}/${folderId}/${fileId}`;
      
      // Use Google Docs viewer for PDF preview
      const pdfUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(directPdfUrl)}&embedded=true`;
      
      return (
        <div className="bg-gray-50 rounded-lg p-4 h-full">
          <div className="relative w-full h-full min-h-[500px]">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg border"
              title={`PDF Viewer - ${fileName}`}
              onError={(e) => {
                const iframe = e.currentTarget;
                iframe.style.display = 'none';
                const fallback = iframe.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.classList.remove('hidden');
                  fallback.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'h-full', 'p-8');
                }
              }}
            />
            <div className="hidden absolute inset-0 flex-col items-center justify-center text-center bg-white p-8 rounded-lg">
              <Icon name="document" size="large" className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">PDF Preview Unavailable</h3>
              <p className="text-gray-500 mb-6">We couldn't load the PDF preview. You can still download the file.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => window.open(filePath, '_blank')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Open in New Tab
                </button>
                <a
                  href={filePath}
                  download={fileName}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="bg-gray-50 p-6 sm:p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <Icon name="file" size="large" color="#9CA3AF" className="mx-auto mb-4" />
        <Typography variant="h6" className="text-gray-700 mb-2">
          Preview not available
        </Typography>
        <Typography variant="body2" color="secondary" className="mb-6">
          This file type cannot be previewed in the browser
        </Typography>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          <button
            onClick={() => window.open(filePath, '_blank')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
          >
            <Icon name="share" size="small" color="white" />
            <span>Open in New Tab</span>
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = filePath;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 w-full sm:w-auto"
          >
            <Icon name="download" size="small" color="white" />
            <span>Download</span>
          </button>
        </div>
      </div>
    );
  };

  console.log('📋 FilePreviewModal render:', { isOpen, fileId, fileName });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      {/* Modal content */}
      <div className="relative z-10 bg-white w-full shadow-2xl sm:max-w-4xl lg:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col sm:m-4 sm:rounded-t-2xl md:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="file" size="small" color="#0e3293" />
                </div>
                <div className="min-w-0 flex-1">
                  <Typography variant="subtitle1" className="text-gray-900 font-semibold truncate text-sm">
                    {fileName || fileDetails?.fileName || 'Loading...'}
                  </Typography>
                  <Typography variant="caption" color="secondary" className="text-xs">
                    {fileDetails ? getFileTypeDisplay(fileDetails.fileType) : 'Loading...'}
                  </Typography>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ml-2"
                aria-label="Close"
              >
                <Icon name="close" size="medium" color="#6b7280" />
              </button>
            </div>
            {/* Mobile Tab Navigation */}
            <div className="px-4 pb-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'preview'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'details'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Details
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="file" size="medium" color="#0e3293" />
              </div>
              <div>
                <Typography variant="h6" className="text-gray-900 font-semibold">
                  {fileName || fileDetails?.fileName || 'Loading...'}
                </Typography>
                <Typography variant="body2" color="secondary">
                  {fileDetails ? getFileTypeDisplay(fileDetails.fileType) : 'Loading...'}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Desktop Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'preview'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'details'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Details
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Close"
              >
                <Icon name="close" size="medium" color="#6b7280" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 sm:py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <Typography variant="body1" color="secondary">
                Loading file...
              </Typography>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-12 sm:py-24 px-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="alert" size="large" color="#dc2626" />
              </div>
              <Typography variant="h6" className="text-gray-900 mb-2 text-center">
                Error Loading File
              </Typography>
              <Typography variant="body1" color="secondary" className="text-center mb-4">
                {error}
              </Typography>
              <button
                onClick={fetchFileDetails}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : fileDetails ? (
            <div className={`${activeTab === 'preview' ? '' : 'p-4 sm:p-6'}`}>
              {activeTab === 'preview' ? (
                <div className="min-h-[60vh] sm:min-h-[70vh]">
                  {canPreview(fileDetails.fileType) ? (
                    <div className="h-full">{renderPreview()}</div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 sm:p-12 text-center">
                      <Icon name="file" size="large" color="#9CA3AF" className="mx-auto mb-4" />
                      <Typography variant="h6" className="text-gray-700 mb-2">
                        Preview not supported
                      </Typography>
                      <Typography variant="body2" color="secondary" className="mb-6">
                        This file type cannot be previewed. You can download or open it in a new tab.
                      </Typography>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
                        <button
                          onClick={() => window.open(fileDetails.filePath, '_blank')}
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full sm:w-auto"
                        >
                          <Icon name="share" size="small" color="white" />
                          <span>Open in New Tab</span>
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = fileDetails.filePath;
                            link.download = fileDetails.fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 w-full sm:w-auto"
                        >
                          <Icon name="download" size="small" color="white" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Details Tab Content - Reuse from FileDetailsModal
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <Typography variant="h6" className="text-gray-900 mb-3 font-semibold">
                      Basic Information
                    </Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Typography variant="body2" color="secondary" className="font-medium">
                            File Name
                          </Typography>
                          <Typography variant="body1" className="text-gray-900">
                            {fileDetails.fileName}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body2" color="secondary" className="font-medium">
                            File Type
                          </Typography>
                          <Typography variant="body1" className="text-gray-900">
                            {getFileTypeDisplay(fileDetails.fileType)}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body2" color="secondary" className="font-medium">
                            File Size
                          </Typography>
                          <Typography variant="body1" className="text-gray-900">
                            {formatFileSize(fileDetails.fileSize)}
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Typography variant="body2" color="secondary" className="font-medium">
                            Uploaded
                          </Typography>
                          <Typography variant="body1" className="text-gray-900">
                            {fileDetails.uploadedAt ? formatDate(fileDetails.uploadedAt) : 'N/A'}
                          </Typography>
                        </div>
                        {fileDetails.updatedAt && fileDetails.updatedAt !== fileDetails.uploadedAt && (
                          <div>
                            <Typography variant="body2" color="secondary" className="font-medium">
                              Last Modified
                            </Typography>
                            <Typography variant="body1" className="text-gray-900">
                              {formatDate(fileDetails.updatedAt)}
                            </Typography>
                          </div>
                        )}
                        {fileDetails.uploadedBy && (
                          <div>
                            <Typography variant="body2" color="secondary" className="font-medium">
                              Uploaded By
                            </Typography>
                            <Typography variant="body1" className="text-gray-900">
                              {fileDetails.uploadedBy}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {fileDetails.description && (
                    <div>
                      <Typography variant="h6" className="text-gray-900 mb-3 font-semibold">
                        Description
                      </Typography>
                      <Typography variant="body1" className="text-gray-700">
                        {fileDetails.description}
                      </Typography>
                    </div>
                  )}

                  {/* Tags */}
                  {fileDetails.tags && fileDetails.tags.length > 0 && (
                    <div>
                      <Typography variant="h6" className="text-gray-900 mb-3 font-semibold">
                        Tags
                      </Typography>
                      <div className="flex flex-wrap gap-2">
                        {fileDetails.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  {fileDetails.metadata && Object.keys(fileDetails.metadata).length > 0 && (
                    <div>
                      <Typography variant="h6" className="text-gray-900 mb-3 font-semibold">
                        Additional Information
                      </Typography>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {fileDetails.metadata.dimensions && (
                          <div className="mb-2">
                            <Typography variant="body2" color="secondary" className="font-medium">
                              Dimensions
                            </Typography>
                            <Typography variant="body1" className="text-gray-900">
                              {fileDetails.metadata.dimensions.width} × {fileDetails.metadata.dimensions.height} pixels
                            </Typography>
                          </div>
                        )}
                        {fileDetails.metadata.duration && (
                          <div className="mb-2">
                            <Typography variant="body2" color="secondary" className="font-medium">
                              Duration
                            </Typography>
                            <Typography variant="body1" className="text-gray-900">
                              {Math.round(fileDetails.metadata.duration)} seconds
                            </Typography>
                          </div>
                        )}
                        {fileDetails.metadata.pages && (
                          <div className="mb-2">
                            <Typography variant="body2" color="secondary" className="font-medium">
                              Pages
                            </Typography>
                            <Typography variant="body1" className="text-gray-900">
                              {fileDetails.metadata.pages}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <Typography variant="body1" color="secondary">
                No file available
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
