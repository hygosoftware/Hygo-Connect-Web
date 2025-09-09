"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Icon, Typography, SearchBar, FloatingButton, UniversalHeader } from '../../components/atoms'
import { FileItem as FileItemCard, FilePreviewModal } from '../../components/molecules'
import { getAllFileFromFolder, deleteFileFromFolder } from "../../lib/api"
import type { FileItem as ApiFileItem, FolderInfo } from "../../lib/api"

export default function FileScreenContent() {
  const searchParams = useSearchParams()
  const folderId = searchParams?.get("folderId") || ""
  const userId = searchParams?.get("userId") || ""

  const [files, setFiles] = useState<ApiFileItem[]>([])
  const [folderInfo, setFolderInfo] = useState<FolderInfo | null>(null)
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(true)
  const [filePreviewModal, setFilePreviewModal] = useState({
    isOpen: false,
    fileId: '',
    fileName: '',
    fileType: ''
  })

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllFileFromFolder(userId, folderId)
      setFiles(data?.files || [])
      setFolderInfo(data?.folderInfo || null)
    } catch (_error) {
      alert("Failed to load files")
    }
    setLoading(false)
  }, [userId, folderId])

  useEffect(() => {
    void fetchFiles()
  }, [fetchFiles])

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    try {
      await deleteFileFromFolder(userId, folderId, fileId)
      setFiles((prev) => prev.filter((f) => f._id !== fileId))
    } catch {
      alert("Failed to delete file")
    }
  }

  const handleFileClick = (fileId: string, fileName: string) => {
    const file = files.find(f => f._id === fileId)
    setFilePreviewModal({ 
      isOpen: true, 
      fileId, 
      fileName, 
      fileType: file?.fileType || '' 
    })
  }

  const closeFilePreviewModal = () => {
    setFilePreviewModal({ isOpen: false, fileId: '', fileName: '', fileType: '' })
  }

  const filteredFiles = files.filter((file) =>
    file.fileName?.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <UniversalHeader
        title={folderInfo?.folderName || "Files"}
        subtitle={`${filteredFiles.length} file(s)${
          folderInfo?.folderAccess?.length
            ? ` • Shared with ${folderInfo.folderAccess.length}`
            : ""
        }`}
        variant="gradient"
        showBackButton={true}
        rightContent={
          <div className="flex items-center gap-2 text-white/70">
            <Icon name="records" size="small" color="white" className="opacity-60" />
            <Icon name="chevron-right" size="small" color="white" className="opacity-60" />
            <Icon name="folder" size="small" color="white" className="opacity-60" />
          </div>
        }
      />

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
            {filteredFiles.map((file) => (
              <FileItemCard
                key={file._id}
                file={file}
                onDelete={(id) => void handleDelete(id)}
                onFileClick={handleFileClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Button */}
      <FloatingButton onClick={() => alert('Upload functionality coming soon!')} />

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
