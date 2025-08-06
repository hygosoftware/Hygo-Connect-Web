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
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
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
    // Open file preview modal (includes both preview and details tabs)
    setFilePreviewModal({
      isOpen: true,
      fileId,
      fileName
    });
  }

  const closeFilePreviewModal = () => {
    setFilePreviewModal({
      isOpen: false,
      fileId: '',
      fileName: ''
    })
  }

  const filteredFiles = files.filter((file: any) =>
    file.fileName?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0e3293] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <Icon name="arrow-left" size="medium" color="white" />
          </button>
          <div>
            <Typography variant="h6" className="font-bold text-white">
              {folderName || folderInfo?.folderName || "Files"}
            </Typography>
            <Typography variant="caption" className="text-blue-200">
              {filteredFiles.length} file(s)
              {folderInfo?.folderAccess?.length > 0 &&
                ` • Shared with ${folderInfo.folderAccess.length}`}
            </Typography>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Search files"
        />
      </div>

      {/* File List */}
      <div className="px-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <Icon name="loader" size="large" color="#9CA3AF" className="animate-spin mb-2" />
            <Typography variant="body1" color="secondary">
              Loading files...
            </Typography>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Icon name="file" size="large" color="#D1D5DB" className="mx-auto mb-3" />
            <Typography variant="body1" color="secondary">
              No files found
            </Typography>
          </div>
        ) : (
          <div className="space-y-4">
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
      <FloatingButton onClick={() => setModalOpen(true)} />

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
  )
}
