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

// No direct auth imports here; actual API calls are performed via services in apiServices

// Base API configuration (not directly used in this module; API calls are delegated)

// Note: API requests are delegated to services in `src/services/apiServices.tsx`.

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
    type FolderAccessEntry = string | { DelegateFolderAuthID?: string } | null | undefined;
    const toAccessId = (entry: FolderAccessEntry): string | null => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object' && typeof entry.DelegateFolderAuthID === 'string') {
        return entry.DelegateFolderAuthID;
      }
      return null;
    };
    const normalizedAccess: string[] = Array.isArray(folderData?.folderAccess)
      ? (folderData!.folderAccess as FolderAccessEntry[])
          .map(toAccessId)
          .filter((v): v is string => typeof v === 'string' && v.length > 0)
      : [];

    const folderInfo: FolderInfo = folderData ? {
      _id: folderData._id,
      folderName: folderData.folderName,
      folderAccess: normalizedAccess,
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
  _userId: string,
  _folderId: string,
  _fileId: string
): Promise<{ success: boolean; message: string }> => {
  // Not implemented: Replace with actual API call
  throw new Error('deleteFileFromFolder is not implemented. Connect to real API.');
};

// Upload file to folder
export const uploadFileToFolder = async (
  _userId: string,
  _folderId: string,
  _file: File
): Promise<{ success: boolean; message: string; file?: FileItem }> => {
  // Not implemented: Replace with actual API call
  throw new Error('uploadFileToFolder is not implemented. Connect to real API.');
};

// Get file download URL
export const getFileDownloadUrl = async (
  _userId: string,
  _folderId: string,
  _fileId: string
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
