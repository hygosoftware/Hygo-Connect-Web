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

export interface GetFilesResponse {
  files: FileItem[];
  folderInfo: FolderInfo;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hygo-backend.onrender.com/api/V0';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Mock data for development - organized by folder
const mockFilesByFolder: Record<string, FileItem[]> = {
  'medical-reports': [
    {
      _id: '1',
      fileName: 'Blood Test Report.pdf',
      fileSize: 2048576, // 2MB
      fileType: 'application/pdf',
      uploadDate: '2024-01-15T10:30:00Z',
      fileUrl: '/mock-files/blood-test.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    },
    {
      _id: '2',
      fileName: 'Complete Blood Count.pdf',
      fileSize: 1536000, // 1.5MB
      fileType: 'application/pdf',
      uploadDate: '2024-01-12T14:20:00Z',
      fileUrl: '/mock-files/cbc-report.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    },
    {
      _id: '3',
      fileName: 'Lipid Profile.pdf',
      fileSize: 1024000, // 1MB
      fileType: 'application/pdf',
      uploadDate: '2024-01-08T09:15:00Z',
      fileUrl: '/mock-files/lipid-profile.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    }
  ],
  'prescriptions': [
    {
      _id: '4',
      fileName: 'Dr. Smith Prescription.pdf',
      fileSize: 512000, // 500KB
      fileType: 'application/pdf',
      uploadDate: '2024-01-10T16:45:00Z',
      fileUrl: '/mock-files/prescription-smith.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    },
    {
      _id: '5',
      fileName: 'Medication List.pdf',
      fileSize: 256000, // 250KB
      fileType: 'application/pdf',
      uploadDate: '2024-01-05T11:30:00Z',
      fileUrl: '/mock-files/medication-list.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    }
  ],
  'imaging': [
    {
      _id: '6',
      fileName: 'X-Ray Chest.jpg',
      fileSize: 5242880, // 5MB
      fileType: 'image/jpeg',
      uploadDate: '2024-01-08T14:20:00Z',
      fileUrl: '/mock-files/xray-chest.jpg',
      thumbnailUrl: '/mock-files/xray-chest-thumb.jpg'
    },
    {
      _id: '7',
      fileName: 'MRI Brain Scan.dcm',
      fileSize: 15728640, // 15MB
      fileType: 'application/dicom',
      uploadDate: '2024-01-03T09:15:00Z',
      fileUrl: '/mock-files/mri-brain.dcm',
      thumbnailUrl: '/icons/medical-icon.png'
    }
  ],
  'insurance': [
    {
      _id: '8',
      fileName: 'Insurance Card.jpg',
      fileSize: 1024000, // 1MB
      fileType: 'image/jpeg',
      uploadDate: '2024-01-05T10:30:00Z',
      fileUrl: '/mock-files/insurance-card.jpg',
      thumbnailUrl: '/mock-files/insurance-card-thumb.jpg'
    },
    {
      _id: '9',
      fileName: 'Coverage Details.pdf',
      fileSize: 2048000, // 2MB
      fileType: 'application/pdf',
      uploadDate: '2024-01-02T14:20:00Z',
      fileUrl: '/mock-files/coverage-details.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    }
  ],
  'vaccination': [
    {
      _id: '10',
      fileName: 'COVID-19 Vaccination Card.pdf',
      fileSize: 512000, // 500KB
      fileType: 'application/pdf',
      uploadDate: '2024-01-03T09:15:00Z',
      fileUrl: '/mock-files/covid-vaccine.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    }
  ],
  'appointments': [
    {
      _id: '11',
      fileName: 'Visit Summary - Jan 12.pdf',
      fileSize: 768000, // 750KB
      fileType: 'application/pdf',
      uploadDate: '2024-01-12T16:45:00Z',
      fileUrl: '/mock-files/visit-summary-jan12.pdf',
      thumbnailUrl: '/icons/pdf-icon.png'
    },
    {
      _id: '12',
      fileName: 'Appointment Notes.docx',
      fileSize: 256000, // 250KB
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadDate: '2024-01-08T11:30:00Z',
      fileUrl: '/mock-files/appointment-notes.docx',
      thumbnailUrl: '/icons/word-icon.png'
    }
  ]
};

const mockFolderInfoByFolder: Record<string, FolderInfo> = {
  'medical-reports': {
    _id: 'medical-reports',
    folderName: 'Medical Reports',
    folderAccess: ['user1', 'doctor1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  'prescriptions': {
    _id: 'prescriptions',
    folderName: 'Prescriptions',
    folderAccess: ['user1', 'doctor1', 'pharmacist1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T16:45:00Z'
  },
  'imaging': {
    _id: 'imaging',
    folderName: 'Medical Imaging',
    folderAccess: ['user1', 'doctor1', 'radiologist1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-08T14:20:00Z'
  },
  'insurance': {
    _id: 'insurance',
    folderName: 'Insurance Documents',
    folderAccess: ['user1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-05T10:30:00Z'
  },
  'vaccination': {
    _id: 'vaccination',
    folderName: 'Vaccination Records',
    folderAccess: ['user1', 'doctor1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-03T09:15:00Z'
  },
  'appointments': {
    _id: 'appointments',
    folderName: 'Appointment Records',
    folderAccess: ['user1', 'doctor1'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  }
};

// Get all files from a folder
export const getAllFileFromFolder = async (
  userId: string,
  folderId: string
): Promise<GetFilesResponse> => {
  // For now, return mock data. Replace with actual API call when backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      const files = mockFilesByFolder[folderId] || [];
      const folderInfo = mockFolderInfoByFolder[folderId] || {
        _id: folderId,
        folderName: 'Unknown Folder',
        folderAccess: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      resolve({
        files,
        folderInfo
      });
    }, 1000); // Simulate network delay
  });

  // Uncomment this when you have a real API endpoint:
  // return apiRequest<GetFilesResponse>(`/users/${userId}/folders/${folderId}/files`);
};

// Delete a file from folder
export const deleteFileFromFolder = async (
  userId: string,
  folderId: string,
  fileId: string
): Promise<{ success: boolean; message: string }> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'File deleted successfully'
      });
    }, 500);
  });

  // Uncomment this when you have a real API endpoint:
  // return apiRequest<{ success: boolean; message: string }>(`/users/${userId}/folders/${folderId}/files/${fileId}`, {
  //   method: 'DELETE',
  // });
};

// Upload file to folder
export const uploadFileToFolder = async (
  userId: string,
  folderId: string,
  file: File
): Promise<{ success: boolean; message: string; file?: FileItem }> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFile: FileItem = {
        _id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        fileUrl: URL.createObjectURL(file),
        thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '/icons/file-icon.png'
      };

      resolve({
        success: true,
        message: 'File uploaded successfully',
        file: newFile
      });
    }, 2000); // Simulate upload time
  });

  // Uncomment this when you have a real API endpoint:
  // const formData = new FormData();
  // formData.append('file', file);
  // 
  // return apiRequest<{ success: boolean; message: string; file?: FileItem }>(`/users/${userId}/folders/${folderId}/files`, {
  //   method: 'POST',
  //   body: formData,
  //   headers: {
  //     // Don't set Content-Type for FormData, let the browser set it
  //   },
  // });
};

// Get file download URL
export const getFileDownloadUrl = async (
  userId: string,
  folderId: string,
  fileId: string
): Promise<{ downloadUrl: string }> => {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        downloadUrl: `/mock-files/download/${fileId}`
      });
    }, 300);
  });

  // Uncomment this when you have a real API endpoint:
  // return apiRequest<{ downloadUrl: string }>(`/users/${userId}/folders/${folderId}/files/${fileId}/download`);
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
