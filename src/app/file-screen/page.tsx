"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Icon, Typography, BottomNavigation, SearchBar, FloatingButton } from '../../components/atoms'
import { FileItem } from '../../components/molecules'
import { getAllFileFromFolder, deleteFileFromFolder } from "../../lib/api"

export default function FileScreen() {
  const router = useRouter()
  const params = useSearchParams()
  const folderId = params.get("folderId") || ""
  const userId = params.get("userId") || ""

  const [files, setFiles] = useState([])
  const [folderInfo, setFolderInfo] = useState(null)
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [folderId, userId])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const data = await getAllFileFromFolder(userId, folderId)
      setFiles(data?.files || [])
      setFolderInfo(data?.folderInfo || null)
    } catch (error) {
      alert("Failed to load files")
    }
    setLoading(false)
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    try {
      await deleteFileFromFolder(userId, folderId, fileId)
      setFiles((prev) => prev.filter((f: any) => f._id !== fileId))
    } catch {
      alert("Failed to delete file")
    }
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
          <Icon name="records" size="small" color="white" className="opacity-60" />
          <Icon name="chevron-right" size="small" color="white" className="opacity-60" />
          <Icon name="folder" size="small" color="white" className="opacity-60" />
          <Icon name="chevron-right" size="small" color="white" className="opacity-60" />
          <div>
            <Typography variant="h6" className="font-bold text-white">
              {folderInfo?.folderName || "Files"}
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
              <FileItem key={file._id} file={file} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Button */}
      <FloatingButton onClick={() => alert('Upload functionality coming soon!')} />

      {/* Bottom Navigation */}
      <BottomNavigation userId={userId} />
    </div>
  )
}
