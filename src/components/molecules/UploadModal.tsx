import React, { useState, useRef } from 'react';
import { Icon, Typography, Button } from '../atoms';
import { uploadFileToFolder, formatFileSize } from '../../lib/api';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  folderId: string;
  userId: string;
  onUploadSuccess: () => void;
  className?: string;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  open,
  onClose,
  folderId,
  userId,
  onUploadSuccess,
  className = '',
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i];
      
      if (uploadFile.status !== 'pending') continue;

      // Update status to uploading
      setUploadFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i && f.status === 'uploading' 
              ? { ...f, progress: Math.min(f.progress + 10, 90) } 
              : f
          ));
        }, 200);

        const result = await uploadFileToFolder(userId, folderId, uploadFile.file);

        clearInterval(progressInterval);

        if (result.success) {
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'success' as const, progress: 100 } : f
          ));
        } else {
          setUploadFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'error' as const, error: 'Upload failed' } : f
          ));
        }
      } catch (error) {
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' as const, error: 'Upload failed' } : f
        ));
      }
    }

    setIsUploading(false);
    
    // Check if all uploads were successful
    const allSuccess = uploadFiles.every(f => f.status === 'success');
    if (allSuccess) {
      setTimeout(() => {
        onUploadSuccess();
        handleClose();
      }, 1000);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setUploadFiles([]);
      onClose();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'document';
    if (fileType.includes('word')) return 'document';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'document';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Typography variant="h5" className="text-gray-900 font-semibold">
            Upload Files
          </Typography>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <Icon name="x" size="medium" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Icon name="upload" size="large" color="#9CA3AF" className="mx-auto mb-4" />
            <Typography variant="h6" className="text-gray-700 mb-2">
              Drop files here or click to browse
            </Typography>
            <Typography variant="body2" color="secondary" className="mb-4">
              Supports PDF, DOC, XLS, PPT, images, and more
            </Typography>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              disabled={isUploading}
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
            />
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="mt-6">
              <Typography variant="subtitle1" className="text-gray-900 mb-4">
                Files to Upload ({uploadFiles.length})
              </Typography>
              <div className="space-y-3">
                {uploadFiles.map((uploadFile, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Icon 
                      name={getFileIcon(uploadFile.file.type) as any} 
                      size="medium" 
                      color="#6B7280" 
                    />
                    <div className="flex-1 min-w-0">
                      <Typography variant="body2" className="text-gray-900 truncate">
                        {uploadFile.file.name}
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        {formatFileSize(uploadFile.file.size)}
                      </Typography>
                      
                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                          <Typography variant="caption" color="secondary" className="mt-1">
                            {uploadFile.progress}%
                          </Typography>
                        </div>
                      )}
                      
                      {/* Status Messages */}
                      {uploadFile.status === 'success' && (
                        <Typography variant="caption" className="text-green-600 mt-1">
                          Upload successful
                        </Typography>
                      )}
                      {uploadFile.status === 'error' && (
                        <Typography variant="caption" className="text-red-600 mt-1">
                          {uploadFile.error || 'Upload failed'}
                        </Typography>
                      )}
                    </div>
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {uploadFile.status === 'pending' && !isUploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Icon name="x" size="small" />
                        </button>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <Icon name="loader" size="small" color="#3B82F6" className="animate-spin" />
                      )}
                      {uploadFile.status === 'success' && (
                        <Icon name="check" size="small" color="#10B981" />
                      )}
                      {uploadFile.status === 'error' && (
                        <Icon name="x" size="small" color="#EF4444" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button
            onClick={handleClose}
            variant="secondary"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadFiles}
            disabled={uploadFiles.length === 0 || isUploading}
            loading={isUploading}
          >
            {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length} File${uploadFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
