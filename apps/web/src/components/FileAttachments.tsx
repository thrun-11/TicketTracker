import { useState } from 'react'
import { CloudUpload, File, X, Download } from 'lucide-react'
import type { Attachment } from '../types'

interface FileAttachmentsProps {
  attachments: Attachment[]
  onUpload: (files: FileList) => Promise<void>
  onDelete: (attachmentId: string) => Promise<void>
  uploading?: boolean
}

export default function FileAttachments({ attachments, onUpload, onDelete, uploading = false }: FileAttachmentsProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await onUpload(files)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await onUpload(files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <File className="h-5 w-5 text-blue-500" />
    } else if (mimeType.startsWith('video/')) {
      return <File className="h-5 w-5 text-purple-500" />
    } else if (mimeType.startsWith('audio/')) {
      return <File className="h-5 w-5 text-pink-500" />
    } else if (mimeType.includes('pdf')) {
      return <File className="h-5 w-5 text-red-500" />
    } else if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return <File className="h-5 w-5 text-yellow-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Attachments ({attachments.length})</h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-foreground font-medium mb-1">
            {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports images, documents, and archives
          </p>
        </label>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-white border border-border rounded-md hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(attachment.mimeType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={attachment.originalName}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => onDelete(attachment.id)}
                  disabled={uploading}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10 disabled:opacity-50"
                  title="Delete"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No attachments yet</p>
        </div>
      )}
    </div>
  )
}
