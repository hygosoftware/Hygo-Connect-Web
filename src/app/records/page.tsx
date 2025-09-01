'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Icon, SearchBar, UniversalHeader } from '../../components/atoms';
import { folderService, familyMemberService, Folder, FamilyMember } from '../../services/apiServices';
import { TokenManager } from '../../services/auth';

interface RecordFolder {
  id: string;
  name: string;
  usersWithAccess: number;
  sharedWith: string[];
  sharedWithNames: string[];
  lastUpdated: string;
  fileCount?: number;
}

const RecordsPage: React.FC = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [folders, setFolders] = useState<RecordFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createFor, setCreateFor] = useState<'self' | 'family'>('self');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  type Perms = { Insert: boolean; View: boolean; Update: boolean; Delete: boolean };
  type DelegateRow = { id: string; memberId: string; perms: Perms };
  const [delegateRows, setDelegateRows] = useState<DelegateRow[]>([]);
  // Edit Folder modal state
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [editFolderId, setEditFolderId] = useState<string>('');
  const [editFolderName, setEditFolderName] = useState<string>('');
  const [editDelegateRows, setEditDelegateRows] = useState<DelegateRow[]>([]);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  // Delete confirm modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Get user ID from auth context
  const { userId, accessToken, userInfo } = TokenManager.getTokens();

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Load family members when opening the Add or Edit Folder modal for family option
  useEffect(() => {
    const fetchFamily = async () => {
      if (!userId || (!isAddFolderOpen && !isEditFolderOpen)) return;
      try {
        const list = await familyMemberService.getFamilyMembers(userId);
        setFamilyMembers(list || []);
      } catch (e) {
        setFamilyMembers([]);
      }
    };
    fetchFamily();
  }, [userId, isAddFolderOpen, isEditFolderOpen]);

  // When switching to family creation, ensure at least one row exists
  useEffect(() => {
    if (isAddFolderOpen && createFor === 'family' && delegateRows.length === 0) {
      setDelegateRows([
        {
          id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
          memberId: '',
          perms: { Insert: true, View: true, Update: false, Delete: false },
        },
      ]);
    }
    if (createFor === 'self') {
      setDelegateRows([]);
    }
  }, [isAddFolderOpen, createFor]);

  const addDelegateRow = () => {
    setDelegateRows((rows) => [
      ...rows,
      {
        id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        memberId: '',
        perms: { Insert: true, View: true, Update: false, Delete: false },
      },
    ]);
  };

  const removeDelegateRow = (id: string) => {
    setDelegateRows((rows) => rows.filter((r) => r.id !== id));
  };

  const updateRowMember = (id: string, memberId: string) => {
    setDelegateRows((rows) => rows.map((r) => (r.id === id ? { ...r, memberId } : r)));
  };

  const toggleRowPerm = (id: string, perm: keyof Perms, value: boolean) => {
    setDelegateRows((rows) => rows.map((r) => (r.id === id ? { ...r, perms: { ...r.perms, [perm]: value } } : r)));
  };

  // Fetch folders from API
  useEffect(() => {
    const fetchFolders = async () => {
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const apiResponse = await folderService.getFoldersByUserId(userId);

        // Transform API response to match RecordFolder interface
        const transformedFolders: RecordFolder[] = apiResponse.map((folder: Folder, index: number) => {

          // Extract access information from the actual structure (string or object)
          const accessUsers = folder.folderAccess?.map(access =>
            typeof access === 'string' ? access : access.DelegateFolderAuthID
          ) || [];
          // Some APIs may include an embedded files array; it's not part of Folder type, so read safely
          const files = (folder as unknown as { files?: Array<{ uploadedAt: string }> }).files;
          const fileCount = files ? files.length : 0;

          // Get the most recent file upload date for lastUpdated
          let lastUpdated = new Date().toISOString().split('T')[0];
          if (files && files.length > 0) {
            const mostRecentFile = files.reduce((latest, file) =>
              new Date(file.uploadedAt) > new Date(latest.uploadedAt) ? file : latest
            );
            lastUpdated = new Date(mostRecentFile.uploadedAt).toISOString().split('T')[0];
          } else if (folder.updatedAt) {
            lastUpdated = new Date(folder.updatedAt).toISOString().split('T')[0];
          } else if (folder.createdAt) {
            lastUpdated = new Date(folder.createdAt).toISOString().split('T')[0];
          }

          const transformed = {
            id: folder._id,
            name: folder.folderName || 'Untitled Folder',
            usersWithAccess: accessUsers.length,
            sharedWith: accessUsers,
            sharedWithNames: accessUsers, // For now, using IDs as names
            lastUpdated: lastUpdated,
            fileCount: fileCount
          };

          return transformed;
        });
        setFolders(transformedFolders);
      } catch (err) {
        setError('Failed to load folders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [userId]);

  const handleFolderClick = (folder: RecordFolder) => {
    // Navigate to the file management screen with the folder ID
    router.push(`/files?folderId=${folder.id}&userId=${userId}&folderName=${encodeURIComponent(folder.name)}`);
  };

  const filteredFolders = folders.filter(folder =>
    (folder.name || '').toLowerCase().includes((searchText || '').toLowerCase())
  );

  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    // Build delegates if creating for family
    let delegates: Array<{ userId: string; access: string[] }> = [];
    if (createFor === 'family') {
      if (delegateRows.length === 0) {
        setError('Please add at least one family member');
        return;
      }
      // Validate rows: unique members, at least one perm each
      const used = new Set<string>();
      for (const row of delegateRows) {
        const memberId = row.memberId?.trim();
        const selectedPerms = Object.entries(row.perms)
          .filter(([_, v]) => v)
          .map(([k]) => k);
        if (!memberId) {
          setError('Please select a family member for each row');
          return;
        }
        if (used.has(memberId)) {
          setError('Duplicate family member selected. Each member should appear only once.');
          return;
        }
        if (selectedPerms.length === 0) {
          setError('Each selected member must have at least one permission');
          return;
        }
        used.add(memberId);
        delegates.push({ userId: memberId, access: selectedPerms });
      }
    }

    try {
      // Call folder creation API with optional delegates
      const newFolder = await folderService.createFolder(userId, newFolderName, delegates);
      
      if (!newFolder) {
        throw new Error('Failed to create folder');
      }
      
      // Add the new folder to the local state
      setFolders(prev => [
        ...prev,
        {
          id: newFolder._id,
          name: newFolder.folderName,
          usersWithAccess: 1,
          sharedWith: [],
          sharedWithNames: [],
          lastUpdated: new Date().toISOString().split('T')[0],
          fileCount: 0
        }
      ]);
      
      // Reset and close the popup
      setNewFolderName('');
      setCreateFor('self');
      setDelegateRows([]);
      setIsAddFolderOpen(false);
      // Hard reload to guarantee data refetch
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to create folder. Please try again.');
    }
  };

  // Open Edit Folder modal and load current access
  const openEditFolder = async (folderId: string, currentName: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    setEditFolderId(folderId);
    setEditFolderName(currentName);
    setEditDelegateRows([]);
    setIsEditFolderOpen(true);
    try {
      setEditLoading(true);
      const folder = await folderService.getFolderById(userId, folderId);
      const rows: DelegateRow[] = (folder?.folderAccess || []).map((acc: any) => {
        const id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        const permsArr: string[] = Array.isArray(acc?.AccessFolderID) ? acc.AccessFolderID : [];
        const perms: Perms = {
          Insert: permsArr.includes('Insert'),
          View: permsArr.includes('View'),
          Update: permsArr.includes('Update'),
          Delete: permsArr.includes('Delete'),
        };
        const memberId = typeof acc?.DelegateFolderAuthID === 'string' ? acc.DelegateFolderAuthID : '';
        return { id, memberId, perms };
      });
      // Ensure at least one row exists
      setEditDelegateRows(rows.length > 0 ? rows : [{
        id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        memberId: '',
        perms: { Insert: true, View: true, Update: false, Delete: false },
      }]);
    } catch (e) {
      setError('Failed to load folder details for editing.');
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditFolder = () => {
    setIsEditFolderOpen(false);
    setEditFolderId('');
    setEditFolderName('');
    setEditDelegateRows([]);
  };

  // Edit rows helpers
  const addEditDelegateRow = () => {
    setEditDelegateRows((rows) => ([
      ...rows,
      {
        id: crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        memberId: '',
        perms: { Insert: true, View: true, Update: false, Delete: false },
      },
    ]));
  };
  const removeEditDelegateRow = (id: string) => {
    setEditDelegateRows((rows) => rows.filter((r) => r.id !== id));
  };
  const updateEditRowMember = (id: string, memberId: string) => {
    setEditDelegateRows((rows) => rows.map((r) => (r.id === id ? { ...r, memberId } : r)));
  };
  const toggleEditRowPerm = (id: string, perm: keyof Perms, value: boolean) => {
    setEditDelegateRows((rows) => rows.map((r) => (r.id === id ? { ...r, perms: { ...r.perms, [perm]: value } } : r)));
  };

  // Save edits: rename and grant access for listed members
  const handleSaveEditFolder = async () => {
    if (!userId || !editFolderId) return;
    try {
      setEditLoading(true);
      // Update name if changed
      const current = folders.find((f) => f.id === editFolderId);
      if (current && editFolderName.trim() && editFolderName.trim() !== current.name) {
        const updated = await folderService.updateFolder(userId, editFolderId, editFolderName.trim());
        if (updated) {
          setFolders((prev) => prev.map((f) => (f.id === editFolderId ? { ...f, name: editFolderName.trim() } : f)));
        }
      }
      // Grant/Update access for each row
      for (const row of editDelegateRows) {
        const memberId = row.memberId?.trim();
        if (!memberId) continue;
        const selectedPerms = Object.entries(row.perms)
          .filter(([_, v]) => v)
          .map(([k]) => k);
        if (selectedPerms.length === 0) continue;
        await folderService.grantFolderAccess(userId, editFolderId, memberId, selectedPerms);
      }
      closeEditFolder();
      // Refresh page to reflect latest data
      router.refresh();
    } catch (e) {
      setError('Failed to save folder changes.');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete a folder via custom confirm modal
  const openDeleteConfirm = (folderId: string, name: string) => {
    setDeleteTarget({ id: folderId, name });
    setIsDeleteConfirmOpen(true);
  };
  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setDeleteTarget(null);
  };
  const handleConfirmDelete = async () => {
    if (!userId || !deleteTarget) return;
    try {
      const ok = await folderService.deleteFolder(userId, deleteTarget.id);
      if (!ok) throw new Error('Delete failed');
      setFolders((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      closeDeleteConfirm();
      // Refresh page to reflect latest data
      router.refresh();
    } catch (e) {
      setError('Failed to delete folder. Please try again.');
    }
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

      <div className="min-h-screen bg-white transition-all duration-300">
        {/* Universal Header */}
        <UniversalHeader
          title="My Medical Records"
          subtitle="Organize and manage your health documents"
          variant="gradient"
          icon="records"
          showBackButton={true}
          rightContent={
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{filteredFolders.length}</div>
                <div className="text-blue-100 text-xs">Total Folders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filteredFolders.reduce((acc, folder) => acc + (folder.fileCount || 0), 0)}
                </div>
                <div className="text-blue-100 text-xs">Total Files</div>
              </div>
            </div>
          }
        />

        {/* Enhanced Search Bar */}
        <div className="px-4 md:px-6 py-6 bg-transparent">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="flex bg-white rounded-2xl px-4 py-3 items-center shadow-sm border border-gray-200">
                <Icon name="search" size="small" color="#0E3293" className="mr-3" />
                <input
                  type="text"
                  placeholder="Search folders, documents, or file types..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1 text-base outline-none bg-transparent placeholder-gray-500 text-gray-900"
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

        {/* Enhanced Folders Section */}
        <div className="px-4 md:px-6 pb-24">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Icon name="folder" size="large" color="#0E3293" />
              </div>
              <Typography variant="h6" className="text-gray-600 mb-2">
                Loading your folders...
              </Typography>
              <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon name="alert" size="large" color="#DC2626" />
              </div>
              <Typography variant="h6" className="text-red-600 mb-2">
                {error}
              </Typography>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Section Header - Only show when not loading */}
          {!loading && !error && (
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
          )}

          {/* Folders Content - Only show when not loading */}
          {!loading && !error && (filteredFolders.length === 0 ? (
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
                  key={`${folder.id}-${index}`}
                  onClick={() => handleFolderClick(folder)}
                  className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer transform hover:scale-105 animate-fadeInUp"
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
                          openEditFolder(folder.id, folder.name);
                        }}
                        className="p-2 text-[#0E3293] hover:bg-white rounded-xl transition-colors"
                      >
                        <Icon name="edit" size="small" color="#0E3293" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm(folder.id, folder.name);
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
                      {'Medical documents and files'}
                    </Typography>
                  </div>

                  {/* Sharing Info */}
                  {folder.sharedWith && folder.sharedWith.length > 0 && (
                    <div className="mb-4 p-3 bg-white rounded-xl">
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
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3 group-hover:bg-white transition-colors">
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-[#0E3293]">{folder.fileCount || 0}</div>
                      <div className="text-xs text-gray-500">Files</div>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center flex-1">
                      <div className="text-sm font-semibold text-gray-700">{folder.lastUpdated || 'Recent'}</div>
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
          ))}
        </div>

        {/* Enhanced Floating Action Button */}
        <div className="fixed bottom-20 right-6 md:bottom-6 z-50">
          <button 
            onClick={() => setIsAddFolderOpen(true)}
            className="group bg-gradient-to-r from-[#0E3293] to-blue-600 hover:from-[#0A2470] hover:to-blue-700 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse-gentle"
          >
            <Icon name="plus" size="small" color="white" />
            <div className="absolute -top-12 right-0 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Add New Folder
            </div>
          </button>
        </div>

        {/* Add Folder Modal */}
        {isAddFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setIsAddFolderOpen(false);
                setNewFolderName('');
                setCreateFor('self');
                setDelegateRows([]);
              }}
            />
            <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-md animate-fadeInUp">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-bold text-gray-800">
                  Create New Folder
                </Typography>
                <button 
                  onClick={() => {
                    setIsAddFolderOpen(false);
                    setNewFolderName('');
                    setCreateFor('self');
                    setDelegateRows([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icon name="close" size="small" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Medical Reports, Prescriptions"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Create For</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setCreateFor('self')}
                    className={`px-4 py-2 rounded-xl border ${createFor === 'self' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                  >
                    Myself
                  </button>
                  <button
                    onClick={() => setCreateFor('family')}
                    className={`px-4 py-2 rounded-xl border ${createFor === 'family' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                  >
                    Family Member
                  </button>
                </div>
              </div>

              {createFor === 'family' && (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Share with family members</label>
                    <button
                      type="button"
                      onClick={addDelegateRow}
                      className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-400 hover:bg-blue-100"
                    >
                      + Add Member
                    </button>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {delegateRows.map((row) => (
                      <div key={row.id} className="border rounded-xl p-3">
                        <div className="flex items-center gap-3 mb-3">
                          <select
                            value={row.memberId}
                            onChange={(e) => updateRowMember(row.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                          >
                            <option value="">-- Select Member --</option>
                            {familyMembers.map((m, index) => {
                              const id = (m._id || m.id) as string;
                              const name = m.FullName || id;
                              return (
                                <option key={id || index} value={id}>{name}</option>
                              );
                            })}
                          </select>
                          <button
                            type="button"
                            onClick={() => removeDelegateRow(row.id)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Remove"
                          >
                            <Icon name="trash" size="small" color="#ef4444" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {(['Insert', 'View', 'Update', 'Delete'] as const).map((perm) => (
                            <label key={perm} className="flex items-center space-x-2 p-2 border rounded-xl">
                              <input
                                type="checkbox"
                                checked={row.perms[perm]}
                                onChange={(e) => toggleRowPerm(row.id, perm, e.target.checked)}
                              />
                              <span className="text-sm text-gray-700">{perm}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddFolderOpen(false);
                    setNewFolderName('');
                    setCreateFor('self');
                    setDelegateRows([]);
                  }}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFolder}
                  disabled={!newFolderName.trim()}
                  className="px-5 py-2.5 text-white bg-[#0E3293] hover:bg-[#0A2470] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Folder Modal */}
        {isEditFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeEditFolder}
            />
            <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-md animate-fadeInUp">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-bold text-gray-800">
                  Edit Folder
                </Typography>
                <button onClick={closeEditFolder} className="text-gray-500 hover:text-gray-700">
                  <Icon name="close" size="small" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
                <input
                  type="text"
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Member Access</label>
                <button type="button" onClick={addEditDelegateRow} className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-400 hover:bg-blue-100">
                  + Add Member
                </button>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {editDelegateRows.map((row) => (
                  <div key={row.id} className="border rounded-xl p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <select
                        value={row.memberId}
                        onChange={(e) => updateEditRowMember(row.id, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black"
                      >
                        <option value="">-- Select Member --</option>
                        {familyMembers.map((m, index) => {
                          const id = (m._id || m.id) as string;
                          const name = m.FullName || id;
                          return (
                            <option key={id || index} value={id}>{name}</option>
                          );
                        })}
                      </select>
                      <button type="button" onClick={() => removeEditDelegateRow(row.id)} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg" title="Remove">
                        <Icon name="trash" size="small" color="#ef4444" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Insert', 'View', 'Update', 'Delete'] as const).map((perm) => (
                        <label key={perm} className="flex items-center space-x-2 p-2 border rounded-xl">
                          <input
                            type="checkbox"
                            checked={row.perms[perm]}
                            onChange={(e) => toggleEditRowPerm(row.id, perm, e.target.checked)}
                          />
                          <span className="text-sm text-gray-700">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={closeEditFolder} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                <button onClick={handleSaveEditFolder} disabled={editLoading} className="px-5 py-2.5 text-white bg-[#0E3293] hover:bg-[#0A2470] rounded-xl disabled:opacity-50">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Note: Removing access may require backend revoke support. Currently, access is granted/updated for listed members.</p>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeDeleteConfirm}
            />
            <div className="relative z-10 bg-white rounded-2xl p-6 w-full max-w-sm animate-fadeInUp">
              <div className="flex justify-between items-center mb-3">
                <Typography variant="h6" className="font-bold text-gray-800">Delete Folder</Typography>
                <button onClick={closeDeleteConfirm} className="text-gray-500 hover:text-gray-700">
                  <Icon name="close" size="small" />
                </button>
              </div>
              <Typography variant="body1" className="text-gray-700 mb-4">
                Are you sure you want to delete "{deleteTarget.name}"? This action cannot be undone.
              </Typography>
              <div className="flex justify-end space-x-3">
                <button onClick={closeDeleteConfirm} className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                <button onClick={handleConfirmDelete} className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecordsPage;
