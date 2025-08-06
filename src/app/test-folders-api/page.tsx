'use client';

import React, { useState, useEffect } from 'react';
import { folderService, Folder } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';
import { FilePreviewModal } from '../../components/molecules';

const TestFoldersApiPage: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [files, setFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [fileDetailsLoading, setFileDetailsLoading] = useState(false);
  const [fileDetailsError, setFileDetailsError] = useState<string | null>(null);
  const [filePreviewModal, setFilePreviewModal] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });

  const { userId } = TokenManager.getTokens();

  const fetchFolders = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Testing API: Fetching folders for user:', userId);
      
      const response = await folderService.getFoldersByUserId(userId);
      console.log('✅ API Response:', response);
      
      setFolders(response);
    } catch (err) {
      console.error('❌ API Error:', err);
      setError('Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!userId || !newFolderName.trim()) return;

    try {
      setCreateLoading(true);
      console.log('🔄 Testing API: Creating folder:', newFolderName);

      const response = await folderService.createFolder(userId, newFolderName.trim());
      console.log('✅ Create Response:', response);

      if (response) {
        setNewFolderName('');
        fetchFolders(); // Refresh the list
      }
    } catch (err) {
      console.error('❌ Create Error:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const fetchFiles = async (folderId: string) => {
    if (!userId || !folderId) return;

    try {
      setFilesLoading(true);
      setFilesError(null);
      console.log('🔄 Testing API: Fetching files for folder:', folderId);

      const response = await folderService.getFilesByFolderId(userId, folderId);
      console.log('✅ Files Response:', response);

      setFiles(response);
      setSelectedFolderId(folderId);
    } catch (err) {
      console.error('❌ Files Error:', err);
      setFilesError('Failed to fetch files');
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchFileDetails = async (folderId: string, fileId: string) => {
    if (!folderId || !fileId) return;

    try {
      setFileDetailsLoading(true);
      setFileDetailsError(null);
      console.log('🔄 Testing API: Fetching file details for:', { folderId, fileId });

      const response = await folderService.getFileDetails(folderId, fileId);
      console.log('✅ File Details Response:', response);

      setFileDetails(response);
      setSelectedFileId(fileId);
    } catch (err) {
      console.error('❌ File Details Error:', err);
      setFileDetailsError('Failed to fetch file details');
    } finally {
      setFileDetailsLoading(false);
    }
  };

  const openFilePreview = (fileId: string, fileName: string) => {
    setFilePreviewModal({
      isOpen: true,
      fileId,
      fileName
    });
  };

  const closeFilePreview = () => {
    setFilePreviewModal({
      isOpen: false,
      fileId: '',
      fileName: ''
    });
  };

  useEffect(() => {
    fetchFolders();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Folders API Test Page
        </h1>

        {/* User Info */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <p><strong>User ID:</strong> {userId || 'Not authenticated'}</p>
        </div>

        {/* Create Folder */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createFolder}
              disabled={createLoading || !newFolderName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </div>

        {/* Fetch Folders */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Folders List</h2>
            <button
              onClick={fetchFolders}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading folders...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div>
              <p className="mb-4 text-gray-600">
                Found {folders.length} folder{folders.length !== 1 ? 's' : ''}
              </p>
              
              {folders.length === 0 ? (
                <p className="text-gray-500 italic">No folders found</p>
              ) : (
                <div className="space-y-4">
                  {folders.map((folder) => (
                    <div key={folder._id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{folder.folderName}</h3>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {folder._id}</p>
                        <p><strong>Created:</strong> {folder.createdAt ? new Date(folder.createdAt).toLocaleString() : 'N/A'}</p>
                        <p><strong>Updated:</strong> {folder.updatedAt ? new Date(folder.updatedAt).toLocaleString() : 'N/A'}</p>
                        <p><strong>File Count:</strong> {folder.files ? folder.files.length : 0}</p>
                        <p><strong>Access Users:</strong> {folder.folderAccess?.map(access => access.DelegateFolderAuthID).join(', ') || 'None'}</p>

                        {/* Show files if any */}
                        {folder.files && folder.files.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium">Files:</p>
                            <ul className="ml-4 space-y-1">
                              {folder.files.map((file) => (
                                <li key={file._id} className="text-xs">
                                  <strong>{file.fileName}</strong> ({file.fileType}) - {new Date(file.uploadedAt).toLocaleDateString()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Test Files API Button */}
                        <div className="mt-3">
                          <button
                            onClick={() => fetchFiles(folder._id)}
                            disabled={filesLoading}
                            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
                          >
                            {filesLoading && selectedFolderId === folder._id ? 'Loading Files...' : 'Test Files API'}
                          </button>
                        </div>

                        {/* Show access permissions */}
                        {folder.folderAccess && folder.folderAccess.length > 0 && (
                          <div className="mt-3">
                            <p className="font-medium">Access Permissions:</p>
                            <ul className="ml-4 space-y-1">
                              {folder.folderAccess.map((access, idx) => (
                                <li key={idx} className="text-xs">
                                  <strong>User:</strong> {access.DelegateFolderAuthID}<br/>
                                  <strong>Permissions:</strong> {access.AccessFolderID.join(', ')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Files API Test Results */}
        {selectedFolderId && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Files API Test Results</h2>
            <p className="mb-4 text-gray-600">
              Testing files for folder ID: <code className="bg-gray-100 px-2 py-1 rounded">{selectedFolderId}</code>
            </p>

            {filesLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading files...</p>
              </div>
            )}

            {filesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{filesError}</p>
              </div>
            )}

            {!filesLoading && !filesError && (
              <div>
                <p className="mb-4 text-gray-600">
                  Found {files.length} file{files.length !== 1 ? 's' : ''} via Files API
                </p>

                {files.length === 0 ? (
                  <p className="text-gray-500 italic">No files found via Files API</p>
                ) : (
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file._id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium text-sm">{file.fileName}</h4>
                        <div className="mt-1 text-xs text-gray-600 space-y-1">
                          <p><strong>ID:</strong> {file._id}</p>
                          <p><strong>Type:</strong> {file.fileType}</p>
                          <p><strong>Path:</strong> {file.filePath}</p>
                          <p><strong>Uploaded:</strong> {new Date(file.uploadedAt).toLocaleString()}</p>
                          <p><strong>Access:</strong> {file.fileAccess?.length || 0} permission(s)</p>
                        </div>

                        {/* Test File Details API Button */}
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => fetchFileDetails(selectedFolderId, file._id)}
                            disabled={fileDetailsLoading}
                            className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50"
                          >
                            {fileDetailsLoading && selectedFileId === file._id ? 'Loading Details...' : 'Test File Details API'}
                          </button>
                          <button
                            onClick={() => openFilePreview(file._id, file.fileName)}
                            className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                          >
                            Test File Preview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* File Details API Test Results */}
        {selectedFileId && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">File Details API Test Results</h2>
            <p className="mb-4 text-gray-600">
              Testing file details for file ID: <code className="bg-gray-100 px-2 py-1 rounded">{selectedFileId}</code>
            </p>

            {fileDetailsLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading file details...</p>
              </div>
            )}

            {fileDetailsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600">{fileDetailsError}</p>
              </div>
            )}

            {!fileDetailsLoading && !fileDetailsError && fileDetails && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-lg mb-3">{fileDetails.fileName}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p><strong>ID:</strong> {fileDetails._id}</p>
                    <p><strong>Type:</strong> {fileDetails.fileType}</p>
                    <p><strong>Path:</strong> {fileDetails.filePath}</p>
                    <p><strong>Size:</strong> {fileDetails.fileSize ? `${fileDetails.fileSize} bytes` : 'Unknown'}</p>
                    <p><strong>Uploaded:</strong> {new Date(fileDetails.uploadedAt).toLocaleString()}</p>
                    {fileDetails.updatedAt && (
                      <p><strong>Updated:</strong> {new Date(fileDetails.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p><strong>Folder ID:</strong> {fileDetails.folderId}</p>
                    <p><strong>Uploaded By:</strong> {fileDetails.uploadedBy || 'Unknown'}</p>
                    <p><strong>Access Permissions:</strong> {fileDetails.fileAccess?.length || 0}</p>
                    {fileDetails.description && (
                      <p><strong>Description:</strong> {fileDetails.description}</p>
                    )}
                    {fileDetails.tags && fileDetails.tags.length > 0 && (
                      <p><strong>Tags:</strong> {fileDetails.tags.join(', ')}</p>
                    )}
                  </div>
                </div>

                {fileDetails.metadata && Object.keys(fileDetails.metadata).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="font-medium mb-2">Metadata:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(fileDetails.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {!fileDetailsLoading && !fileDetailsError && !fileDetails && (
              <p className="text-gray-500 italic">No file details found</p>
            )}
          </div>
        )}

        {/* API Endpoint Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">API Endpoint Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Base URL:</strong> https://hygo-backend.onrender.com/api/V0</p>
            <p><strong>Get Folders:</strong> GET /Folder/{userId}</p>
            <p><strong>Create Folder:</strong> POST /Folder/{userId}</p>
            <p><strong>Update Folder:</strong> PUT /Folder/{userId}/{folderId}</p>
            <p><strong>Delete Folder:</strong> DELETE /Folder/{userId}/{folderId}</p>
            <p className="text-purple-600"><strong>Get Files:</strong> GET /File/{userId}/{folderId}</p>
            <p className="text-orange-600"><strong>Get File Details:</strong> GET /File/{folderId}/{fileId}</p>
          </div>
        </div>

        {/* File Preview Modal */}
        <FilePreviewModal
          isOpen={filePreviewModal.isOpen}
          onClose={closeFilePreview}
          folderId={selectedFolderId}
          fileId={filePreviewModal.fileId}
          fileName={filePreviewModal.fileName}
        />
      </div>
    </div>
  );
};

export default TestFoldersApiPage;
