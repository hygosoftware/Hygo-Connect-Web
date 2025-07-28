import React, { useState } from 'react';
import { Icon, Typography } from '../atoms';
import { FileItem as FileItemType, formatFileSize, formatDate, getFileIcon } from '../../lib/api';

interface FileItemProps {
  file: FileItemType;
  onDelete: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  onView?: (fileId: string) => void;
  className?: string;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onDelete,
  onDownload,
  onView,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(file._id);
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
  const fileIcon = getFileIcon(file.fileType);

  return (
    <div 
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {/* File Icon/Thumbnail */}
        <div className="flex-shrink-0">
          {isImage && file.thumbnailUrl ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
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
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center hidden">
                <Icon name={fileIcon as any} size="medium" color="#3B82F6" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon name={fileIcon as any} size="medium" color="#3B82F6" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Typography 
                variant="subtitle2" 
                className="text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleView}
              >
                {file.fileName}
              </Typography>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {getFileTypeDisplay(file.fileType)}
                </span>
                <Typography variant="caption" color="secondary">
                  {formatFileSize(file.fileSize)}
                </Typography>
                <Typography variant="caption" color="secondary">
                  •
                </Typography>
                <Typography variant="caption" color="secondary">
                  {formatDate(file.uploadDate)}
                </Typography>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center space-x-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              <button
                onClick={handleView}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="View file"
              >
                <Icon name="eye" size="small" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Download file"
              >
                <Icon name="download" size="small" />
              </button>
              <button
                onClick={handleDelete}
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
          </div>
        </div>
      </div>

      {/* Mobile Actions - Show on tap */}
      <div className="md:hidden">
        {showActions && (
          <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleView}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Icon name="eye" size="small" />
              <span>View</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            >
              <Icon name="download" size="small" />
              <span>Download</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {isDeleting ? (
                <Icon name="loader" size="small" className="animate-spin" />
              ) : (
                <Icon name="trash" size="small" />
              )}
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileItem;
