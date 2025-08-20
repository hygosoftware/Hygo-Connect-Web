'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icon, Typography, BackButton } from '../atoms';
import { FileItem, UploadModal, FilePreviewModal } from '../molecules';
import SearchBar from '../atoms/SearchBar';
import { getAllFileFromFolder, deleteFileFromFolder, FileItem as FileItemType, FolderInfo } from '../../lib/api';

interface FileScreenDesktopProps {
  className?: string;
}

const FileScreenDesktop: React.FC<FileScreenDesktopProps> = ({ className = '' }) => {
  const router = useRouter();
  const params = useSearchParams();
  const folderId = params.get('folderId') || '';
  const userId = params.get('userId') || '';
  const folderName = params.get('folderName') || '';

  const [files, setFiles] = useState<FileItemType[]>([]);
  const [folderInfo, setFolderInfo] = useState<FolderInfo | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filePreviewModal, setFilePreviewModal] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });

  useEffect(() => {
    fetchFiles();
  }, [folderId, userId]);

  const fetchFiles = async () => {
    if (!userId || !folderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getAllFileFromFolder(userId, folderId);
      setFiles(data?.files || []);
      setFolderInfo(data?.folderInfo || null);
    } catch (error) {
      console.error('Failed to load files:', error);
      alert('Failed to load files');
    }
    setLoading(false);
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFileFromFolder(userId, folderId, fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file');
    }
  };

  const handleDownload = (fileId: string) => {
    const file = files.find(f => f._id === fileId);
    if (file?.fileUrl) {
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleView = (fileId: string) => {
    const file = files.find(f => f._id === fileId);
    if (file?.fileUrl) {
      window.open(file.fileUrl, '_blank');
    }
  };

  const handleFileClick = (fileId: string, fileName: string) => {
    // Open file preview modal (includes both preview and details tabs)
    setFilePreviewModal({
      isOpen: true,
      fileId,
      fileName
    });
  };

  const closeFilePreviewModal = () => {
    setFilePreviewModal({
      isOpen: false,
      fileId: '',
      fileName: ''
    });
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredFiles = files
    .filter((file) => file.fileName?.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'date':
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'type':
          comparison = a.fileType.localeCompare(b.fileType);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <BackButton onClick={() => router.back()} />
            <div>
              <Typography variant="h3" className="text-gray-900 font-bold">
                {folderName || folderInfo?.folderName || 'Files'}
              </Typography>
              <Typography variant="body1" color="secondary">
                {sortedAndFilteredFiles.length} file(s)
                {(() => {
                  const sharedCount = folderInfo?.folderAccess ? folderInfo.folderAccess.length : 0;
                  return sharedCount > 0 ? ` • Shared with ${sharedCount} people` : '';
                })()}
              </Typography>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-[#0e3293] text-white rounded-xl hover:bg-blue-900 transition-colors duration-200 font-medium"
            >
              <Icon name="upload" size="small" color="white" />
              <span>Upload Files</span>
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder="Search files..."
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon name="menu" size="small" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon name="document" size="small" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-desc">Largest First</option>
                <option value="size-asc">Smallest First</option>
                <option value="type-asc">Type A-Z</option>
              </select>
              <Icon 
                name="chevron-down" 
                size="small" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* File List/Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <Icon name="loader" size="large" color="#9CA3AF" className="animate-spin mb-4" />
            <Typography variant="h6" color="secondary">
              Loading files...
            </Typography>
          </div>
        ) : sortedAndFilteredFiles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Icon name="file" size="large" color="#D1D5DB" className="mx-auto mb-6" />
            <Typography variant="h5" color="secondary" className="mb-3">
              {searchText ? 'No files found' : 'No files yet'}
            </Typography>
            <Typography variant="body1" color="secondary" className="mb-6">
              {searchText 
                ? 'Try adjusting your search terms' 
                : 'Upload your first file to get started'
              }
            </Typography>
            {!searchText && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0e3293] text-white rounded-xl hover:bg-blue-900 transition-colors duration-200 font-medium"
              >
                <Icon name="upload" size="small" color="white" />
                <span>Upload Files</span>
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {sortedAndFilteredFiles.map((file) => (
              <FileItem
                key={file._id}
                file={file}
                onDelete={handleDelete}
                onDownload={handleDownload}
                onView={handleView}
                onFileClick={handleFileClick}
                className={viewMode === 'grid' ? 'h-full' : 'w-full'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        folderId={folderId}
        userId={userId}
        onUploadSuccess={fetchFiles}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={filePreviewModal.isOpen}
        onClose={closeFilePreviewModal}
        folderId={folderId}
        fileId={filePreviewModal.fileId}
        fileName={filePreviewModal.fileName}
      />
    </div>
  );
};

export default FileScreenDesktop;
