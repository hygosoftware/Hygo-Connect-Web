'use client';

import React, { useState } from 'react';
import { Icon, Typography } from '../atoms';
import { FileItem as FileItemType, formatFileSize, formatDate, getFileIcon } from '../../lib/api';
import type { IconName } from '../atoms/Icon';

interface FileItemProps {
  file: FileItemType;
  onDelete: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  onView?: (fileId: string) => void;
  onFileClick?: (fileId: string, fileName: string) => void;
  className?: string;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onDelete,
  onDownload,
  onView,
  onFileClick,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    setIsDeleting(true);
    try {
      await Promise.resolve(onDelete(file._id));
    } catch (error) {
      console.error('Failed to delete file:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file._id);
    } else {
      // Fallback to direct download
      const link = document.createElement('a');
      link.href = file.fileUrl || '#';
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(file._id);
    } else if (file.fileUrl) {
      window.open(file.fileUrl, '_blank');
    }
  };

  const handleFileClick = () => {
    console.log('🖱️ File name clicked:', file.fileName);
    console.log('🖱️ File ID:', file._id);
    console.log('🖱️ onFileClick handler exists:', !!onFileClick);

    if (onFileClick) {
      console.log('🖱️ Calling onFileClick handler');
      onFileClick(file._id, file.fileName);
    } else {
      console.log('🖱️ No onFileClick handler, falling back to view');
      // Fallback to view if no file click handler
      handleView();
    }
  };

  const getFileTypeDisplay = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'DOC';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'XLS';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PPT';
    if (fileType.startsWith('image/')) return 'IMG';
    if (fileType.startsWith('video/')) return 'VID';
    if (fileType.startsWith('audio/')) return 'AUD';
    return 'FILE';
  };

  const isImage = file.fileType.startsWith('image/');
  const fileIcon = getFileIcon(file.fileType) as IconName;

  return (
    <div 
      className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group ${className}`}
      onClick={() => setShowActions(!showActions)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => !showActions && setShowActions(false)}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        {/* File Icon/Thumbnail */}
        <div className="flex-shrink-0 relative">
          {isImage && file.thumbnailUrl ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-100 ring-2 ring-offset-1 ring-blue-500/10 group-hover:ring-blue-500/20 transition-all">
              <img
                src={file.thumbnailUrl}
                alt={file.fileName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center hidden">
                <Icon name={fileIcon} size="medium" color="#3B82F6" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 flex items-center justify-center ring-2 ring-offset-1 ring-blue-500/10 group-hover:ring-blue-500/20 transition-all">
              <Icon name={fileIcon} size="medium" color="#3B82F6" />
            </div>
          )}
          <div className="absolute -top-1 -right-1 bg-blue-100 rounded-full px-1.5 py-0.5 text-xs font-medium text-blue-700 hidden sm:group-hover:block">
            {getFileTypeDisplay(file.fileType)}
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between space-x-2">
            <div className="flex-1 min-w-0">
              <Typography
                variant="subtitle2"
                className="text-gray-900 cursor-pointer font-medium hover:text-blue-600 transition-colors text-sm sm:text-base leading-tight"
                onClick={handleFileClick}
                style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {file.fileName}
              </Typography>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {getFileTypeDisplay(file.fileType)}
                </span>
                <Typography variant="caption" color="secondary" className="text-xs">
                  {formatFileSize(file.fileSize)}
                </Typography>
                <Typography variant="caption" color="secondary" className="text-xs hidden sm:inline">
                  •
                </Typography>
                <Typography variant="caption" color="secondary" className="text-xs">
                  {formatDate(file.uploadDate)}
                </Typography>
              </div>
            </div>

            {/* Action Buttons - Desktop Only */}
            <div className={`hidden sm:flex items-center space-x-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); handleView(); }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="View file"
              >
                <Icon name="eye" size="small" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Download file"
              >
                <Icon name="download" size="small" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete file"
              >
                {isDeleting ? (
                  <Icon name="loader" size="small" className="animate-spin" />
                ) : (
                  <Icon name="trash" size="small" />
                )}
              </button>
            </div>
            
            {/* Mobile Menu Indicator */}
            <div className="sm:hidden flex items-center">
              <div className={`transform transition-transform duration-200 ${showActions ? 'rotate-180' : ''}`}>
                <Icon name="chevron-down" size="small" color="#6B7280" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Actions - Show on tap */}
      <div className="sm:hidden">
        {showActions && (
          <div className="animate-slideUp">
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleView(); }}
                  className="flex flex-col items-center justify-center p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-95 min-h-[60px]"
                >
                  <Icon name="eye" size="small" />
                  <span className="text-xs mt-1 font-medium">View</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                  className="flex flex-col items-center justify-center p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all active:scale-95 min-h-[60px]"
                >
                  <Icon name="download" size="small" />
                  <span className="text-xs mt-1 font-medium">Download</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  disabled={isDeleting}
                  className="flex flex-col items-center justify-center p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95 disabled:opacity-50 min-h-[60px]"
                >
                  {isDeleting ? (
                    <Icon name="loader" size="small" className="animate-spin" />
                  ) : (
                    <Icon name="trash" size="small" />
                  )}
                  <span className="text-xs mt-1 font-medium">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FileItem;
