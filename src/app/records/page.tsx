'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Icon, SearchBar } from '../../components/atoms';

interface RecordFolder {
  id: string;
  name: string;
  usersWithAccess: number;
  sharedWith: string[];
  sharedWithNames: string[];
  lastUpdated: string;
}

const RecordsPage: React.FC = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user-123';

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const recordFolders: RecordFolder[] = [
    {
      id: 'abc',
      name: 'Abc',
      usersWithAccess: 1,
      sharedWith: ['devyani.kadachha@example.com'],
      sharedWithNames: ['Devyani Kadachha'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 'updated-reports',
      name: 'Updated Reports',
      usersWithAccess: 1,
      sharedWith: ['685e823b3e6c68e8bb8dae392'],
      sharedWithNames: ['685e823b3e6c68e8bb8dae392'],
      lastUpdated: '2024-01-10'
    },
    {
      id: 'rohan',
      name: 'Rohan',
      usersWithAccess: 0,
      sharedWith: [],
      sharedWithNames: [],
      lastUpdated: '2024-01-08'
    },
    {
      id: 'dr-priyank-vasavada',
      name: 'Dr. Priyank H Vasavada',
      usersWithAccess: 0,
      sharedWith: [],
      sharedWithNames: [],
      lastUpdated: '2024-01-05'
    }
  ];

  const handleFolderClick = (folder: RecordFolder) => {
    // Navigate to the file management screen with the folder ID
    router.push(`/file-screen?folderId=${folder.id}&userId=${userId}&folderName=${encodeURIComponent(folder.name)}`);
  };

  const filteredFolders = recordFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }

        .animate-pulse-gentle {
          animation: pulse 2s infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-[#0E3293] via-[#1e40af] to-[#3b82f6] shadow-xl">
          <div className="px-4 py-6 md:py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  <Icon name="arrow-left" size="medium" color="white" />
                </button>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
                    <Icon name="records" size="medium" color="white" />
                  </div>
                  <div>
                    <Typography variant="h4" className="font-bold text-white">
                      My Medical Records
                    </Typography>
                    <Typography variant="body1" className="text-blue-100">
                      Organize and manage your health documents
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{filteredFolders.length}</div>
                  <div className="text-blue-100 text-xs">Total Folders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {filteredFolders.reduce((acc, folder) => acc + folder.fileCount, 0)}
                  </div>
                  <div className="text-blue-100 text-xs">Total Files</div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="mt-6">
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <div className="flex bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 items-center shadow-lg border border-white/20">
                    <Icon name="search" size="small" color="#0E3293" className="mr-3" />
                    <input
                      type="text"
                      placeholder="Search folders, documents, or file types..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="flex-1 text-base outline-none bg-transparent placeholder-gray-500"
                    />
                    {searchText.length > 0 && (
                      <button
                        onClick={() => setSearchText('')}
                        className="ml-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Icon name="close" size="small" color="#6B7280" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Folders Section */}
        <div className="px-4 md:px-6 pb-24">
          {/* Section Header */}
          <div className="mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#0E3293]/10 rounded-xl flex items-center justify-center mr-3">
                    <Icon name="folder" size="small" color="#0E3293" />
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-gray-800">
                      Medical Folders ({filteredFolders.length})
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      {searchText ? `Showing results for "${searchText}"` : 'Organize your health documents'}
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#0E3293]">
                    {filteredFolders.reduce((acc, folder) => acc + (folder.fileCount || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Files</div>
                </div>
              </div>
            </div>
          </div>

          {filteredFolders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse-gentle">
                <Icon name="folder" size="large" color="#9CA3AF" />
              </div>
              <Typography variant="h5" className="font-bold text-gray-800 mb-2">
                {searchText ? 'No folders found' : 'No folders yet'}
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchText
                  ? 'Try adjusting your search terms or browse all folders'
                  : 'Create your first medical folder to start organizing your health documents'
                }
              </Typography>
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="px-6 py-3 bg-[#0E3293] text-white rounded-2xl hover:bg-[#0A2470] transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFolders.map((folder, index) => (
                <div
                  key={folder.id}
                  onClick={() => handleFolderClick(folder)}
                  className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer transform hover:scale-105 animate-fadeInUp"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Folder Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0E3293]/10 to-blue-100 rounded-2xl flex items-center justify-center group-hover:from-[#0E3293]/20 group-hover:to-blue-200 transition-all duration-300">
                      <Icon name="folder" size="large" color="#0E3293" />
                    </div>

                    {/* Action Menu */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit action
                        }}
                        className="p-2 text-[#0E3293] hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Icon name="edit" size="small" color="#0E3293" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete action
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Icon name="trash" size="small" color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Folder Info */}
                  <div className="mb-4">
                    <Typography variant="h6" className="font-bold text-gray-800 mb-2 group-hover:text-[#0E3293] transition-colors">
                      {folder.name}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 line-clamp-2">
                      {folder.description || 'Medical documents and files'}
                    </Typography>
                  </div>

                  {/* Sharing Info */}
                  {folder.sharedWith && folder.sharedWith.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center mb-1">
                        <Icon name="user" size="small" color="#0E3293" className="mr-2" />
                        <Typography variant="body2" className="text-[#0E3293] font-medium">
                          Shared with {folder.usersWithAccess} user{folder.usersWithAccess !== 1 ? 's' : ''}
                        </Typography>
                      </div>
                      <Typography variant="caption" className="text-gray-600">
                        {folder.sharedWithNames?.join(', ') || 'Team members'}
                      </Typography>
                    </div>
                  )}

                  {/* Folder Stats */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 group-hover:bg-blue-50 transition-colors">
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-[#0E3293]">{folder.fileCount || 0}</div>
                      <div className="text-xs text-gray-500">Files</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center flex-1">
                      <div className="text-sm font-semibold text-gray-700">{folder.lastModified || 'Recent'}</div>
                      <div className="text-xs text-gray-500">Updated</div>
                    </div>
                  </div>

                  {/* Hover Effect Arrow */}
                  <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-8 h-8 bg-[#0E3293] rounded-xl flex items-center justify-center">
                      <Icon name="chevron-right" size="small" color="white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button className="group bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse-gentle">
            <Icon name="plus" size="medium" color="white" />
            <div className="absolute -top-12 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Add New Folder
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default RecordsPage;
