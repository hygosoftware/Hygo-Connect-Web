'use client';

import React, { useEffect, useState } from 'react';
import { Icon, Typography } from '../atoms';
import { folderService, FileDetails } from '../../services/apiServices';

interface FileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  fileId: string;
  fileName?: string;
}

const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  isOpen,
  onClose,
  folderId,
  fileId,
  fileName
}) => {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && folderId && fileId) {
      fetchFileDetails();
    }
  }, [isOpen, folderId, fileId]);

  const fetchFileDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching file details for:', { folderId, fileId });
      const details = await folderService.getFileDetails(folderId, fileId);
      
      if (details) {
        setFileDetails(details);
      } else {
        setError('File details not found');
      }
    } catch (err) {
      console.error('❌ Error fetching file details:', err);
      setError('Failed to load file details');
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

  const handleDownload = () => {
    if (fileDetails?.filePath) {
      const link = document.createElement('a');
      link.href = fileDetails.filePath;
      link.download = fileDetails.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = () => {
    if (fileDetails?.filePath) {
      window.open(fileDetails.filePath, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="file" size="medium" color="#0e3293" />
            </div>
            <div>
              <Typography variant="h6" className="text-gray-900 font-semibold">
                File Details
              </Typography>
              <Typography variant="body2" color="secondary">
                {fileName || fileDetails?.fileName || 'Loading...'}
              </Typography>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Icon name="close" size="medium" color="#6b7280" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <Typography variant="body1" color="secondary">
                Loading file details...
              </Typography>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="alert" size="large" color="#dc2626" />
              </div>
              <Typography variant="h6" className="text-gray-900 mb-2">
                Error Loading Details
              </Typography>
              <Typography variant="body1" color="secondary" className="text-center mb-4">
                {error}
              </Typography>
              <button
                onClick={fetchFileDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : fileDetails ? (
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
                        {formatDate(fileDetails.uploadedAt)}
                      </Typography>
                    </div>
                    {fileDetails.updatedAt && (
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

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleView}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Icon name="eye" size="small" color="white" />
                  <span>View File</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Icon name="download" size="small" color="white" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Typography variant="body1" color="secondary">
                No file details available
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDetailsModal;
