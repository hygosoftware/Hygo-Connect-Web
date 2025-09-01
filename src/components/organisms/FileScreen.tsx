"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Icon, Typography, SearchBar, FloatingButton } from '../atoms'
import { FileItem, UploadModal, FilePreviewModal } from '../molecules'
import { getAllFileFromFolder, deleteFileFromFolder, FileItem as FileItemType, FolderInfo } from '../../lib/api'

export default function FileScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const folderId = params.get("folderId") || ""
  const userId = params.get("userId") || ""
  const folderName = params.get("folderName") || ""

  const [files, setFiles] = useState<FileItemType[]>([])
  const [folderInfo, setFolderInfo] = useState<FolderInfo | null>(null)
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filePreviewModal, setFilePreviewModal] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
    fileType?: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: '',
    fileType: ''
  })

  useEffect(() => {
    fetchFiles()
  }, [folderId, userId])

  const fetchFiles = async () => {
    if (!userId || !folderId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getAllFileFromFolder(userId, folderId)
      setFiles(data?.files || [])
      setFolderInfo(data?.folderInfo || null)
    } catch (error) {
      console.error('Failed to load files:', error)
      alert("Failed to load files")
    }
    setLoading(false)
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    try {
      await deleteFileFromFolder(userId, folderId, fileId)
      setFiles((prev) => prev.filter((f) => f._id !== fileId))
    } catch (error) {
      console.error('Failed to delete file:', error)
      alert("Failed to delete file")
    }
  }

  const handleDownload = (fileId: string) => {
    const file = files.find(f => f._id === fileId)
    if (file?.fileUrl) {
      const link = document.createElement('a')
      link.href = file.fileUrl
      link.download = file.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleView = (fileId: string) => {
    const file = files.find(f => f._id === fileId)
    if (file?.fileUrl) {
      window.open(file.fileUrl, '_blank')
    }
  }

  const handleFileClick = (fileId: string, fileName: string) => {
    // Find the file to get its type
    const file = files.find(f => f._id === fileId);
    // Open file preview modal (includes both preview and details tabs)
    setFilePreviewModal({
      isOpen: true,
      fileId,
      fileName,
      fileType: file?.fileType || ''
    });
  }

  const closeFilePreviewModal = () => {
    setFilePreviewModal({
      isOpen: false,
      fileId: '',
      fileName: '',
      fileType: ''
    })
  }

  const filteredFiles = files.filter((file: any) =>
    file.fileName?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-[#0e3293] text-white px-4 py-3 sm:p-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Icon name="arrow-left" size="medium" color="white" />
            </button>
            <div className="flex-1 min-w-0">
              <Typography variant="h6" className="font-bold text-white text-lg sm:text-xl truncate">
                {folderName || folderInfo?.folderName || "Files"}
              </Typography>
              <Typography variant="caption" className="text-blue-200 text-sm">
                {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                {(() => {
                  const sharedCount = folderInfo?.folderAccess ? folderInfo.folderAccess.length : 0;
                  return sharedCount > 0 ? ` • Shared with ${sharedCount}` : '';
                })()}
              </Typography>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 sm:p-4 bg-white border-b border-gray-100">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search files"
          />
        </div>

        {/* File List */}
        <div className="px-3 sm:px-4 pb-20 sm:pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-gray-500">
              <Icon name="loader" size="large" color="#9CA3AF" className="animate-spin mb-2" />
              <Typography variant="body1" color="secondary">
                Loading files...
              </Typography>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16 sm:py-24 text-gray-400">
              <Icon name="file" size="large" color="#D1D5DB" className="mx-auto mb-3" />
              <Typography variant="body1" color="secondary">
                {searchText ? 'No files match your search' : 'No files found'}
              </Typography>
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
              {filteredFiles.map((file: any) => (
                <FileItem
                  key={file._id}
                  file={file}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onView={handleView}
                  onFileClick={handleFileClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Button */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
          <FloatingButton onClick={() => setModalOpen(true)} />
        </div>

        {/* Upload Modal */}
        <UploadModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          folderId={folderId}
          userId={userId}
          onUploadSuccess={fetchFiles}
        />
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={filePreviewModal.isOpen}
        onClose={closeFilePreviewModal}
        folderId={folderId}
        fileId={filePreviewModal.fileId}
        fileName={filePreviewModal.fileName}
        fileType={filePreviewModal.fileType}
      />
    </div>
  )
}
