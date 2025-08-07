// File Management API Functions

export interface FileItem {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}

export interface FolderInfo {
  _id: string;
  folderName: string;
  folderAccess: string[];
  createdAt: string;
  updatedAt: string;
}
export interface GetFolderInfo {
  _id: string;
  folderName: string;
  folderAccess: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetFilesResponse {
  files: FileItem[];
  folderInfo: FolderInfo;
}

import { TokenManager } from '../services/auth';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hygo-backend.onrender.com/api/V0';

// Generic API request function with authorization
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get authorization token
  const { accessToken } = TokenManager.getTokens();

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
    ...options,
  };

  // Log the request for debugging
  console.log('🔐 API Request (fetch):', {
    method: options.method || 'GET',
    url,
    hasAuth: !!accessToken
  });

  try {
    const response = await fetch(url, defaultOptions);

    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      console.log('🔄 Unauthorized request, clearing tokens...');
      TokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - please login again');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Log successful response
    console.log('✅ API Response (fetch):', {
      status: response.status,
      url
    });

    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
}

// Get all files from a folder
export const getAllFileFromFolder = async (
  userId: string,
  folderId: string
): Promise<GetFilesResponse> => {
  try {
    // Import the folderService from apiServices
    const { folderService } = await import('../services/apiServices');

    // Call the real API endpoints
    const [files, folderData] = await Promise.all([
      folderService.getFilesByFolderId(userId, folderId),
      folderService.getFolderById(userId, folderId)
    ]);

    // Convert FileItem from apiServices to FileItem from lib/api
    const convertedFiles: FileItem[] = files.map(file => ({
      _id: file._id,
      fileName: file.fileName,
      fileSize: 0, // API doesn't provide file size, set to 0 or calculate if needed
      fileType: file.fileType,
      uploadDate: file.uploadedAt,
      fileUrl: file.filePath, // Use filePath as fileUrl
      thumbnailUrl: file.fileType.startsWith('image/') ? file.filePath : '/icons/file-icon.png'
    }));

    // Create folder info from API response or fallback
    const folderInfo: FolderInfo = folderData ? {
      _id: folderData._id,
      folderName: folderData.folderName,
      folderAccess: folderData.folderAccess?.map(access => access.DelegateFolderAuthID) || [],
      createdAt: folderData.createdAt || new Date().toISOString(),
      updatedAt: folderData.updatedAt || new Date().toISOString()
    } : {
      _id: folderId,
      folderName: 'Unknown Folder',
      folderAccess: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      files: convertedFiles,
      folderInfo
    };
  } catch (error) {
    console.error('Error fetching files from API:', error);

    // No fallback to mock data; throw error if API fails
    throw new Error('Failed to fetch files from API. No fallback data available.');
  }
};

// Delete a file from folder
export const deleteFileFromFolder = async (
  userId: string,
  folderId: string,
  fileId: string
): Promise<{ success: boolean; message: string }> => {
  // Not implemented: Replace with actual API call
  throw new Error('deleteFileFromFolder is not implemented. Connect to real API.');
};

// Upload file to folder
export const uploadFileToFolder = async (
  userId: string,
  folderId: string,
  file: File
): Promise<{ success: boolean; message: string; file?: FileItem }> => {
  // Not implemented: Replace with actual API call
  throw new Error('uploadFileToFolder is not implemented. Connect to real API.');
};

// Get file download URL
export const getFileDownloadUrl = async (
  userId: string,
  folderId: string,
  fileId: string
): Promise<{ downloadUrl: string }> => {
  // Not implemented: Replace with actual API call
  throw new Error('getFileDownloadUrl is not implemented. Connect to real API.');
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file icon based on file type
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('pdf')) return 'document';
  if (fileType.includes('word')) return 'document';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'document';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'document';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  return 'file';
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString();
};
