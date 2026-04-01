'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Paperclip, Trash2 } from 'lucide-react'

type NoticeAttachment = {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number | null
  mimeType: string | null
}

type Notice = {
  id: string
  title: string
  content: string
  isFeatured: boolean
  viewCount: number
  createdAt: string
  attachments: NoticeAttachment[]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (notice: Notice) => void
  editingNotice: Notice | null
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NoticeModal({ isOpen, onClose, onSuccess, editingNotice }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<NoticeAttachment[]>([])
  const [deleteAttachmentIds, setDeleteAttachmentIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && editingNotice) {
      setTitle(editingNotice.title)
      setContent(editingNotice.content)
      setExistingAttachments(editingNotice.attachments)
      setNewFiles([])
      setDeleteAttachmentIds([])
    } else if (isOpen && !editingNotice) {
      setTitle('')
      setContent('')
      setExistingAttachments([])
      setNewFiles([])
      setDeleteAttachmentIds([])
    }
    setError(null)
  }, [isOpen, editingNotice])

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || [])
    setNewFiles((prev) => [...prev, ...picked])
    e.target.value = ''
  }

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const markAttachmentForDeletion = (id: string) => {
    setDeleteAttachmentIds((prev) => [...prev, id])
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError('제목과 본문은 필수입니다.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      if (editingNotice) formData.append('id', editingNotice.id)
      formData.append('title', title)
      formData.append('content', content)
      if (deleteAttachmentIds.length > 0) {
        formData.append('deleteAttachmentIds', JSON.stringify(deleteAttachmentIds))
      }
      newFiles.forEach((f) => formData.append('attachments', f))

      const response = await fetch('/api/notices', {
        method: editingNotice ? 'PUT' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '저장에 실패했습니다.')
      }

      const saved: Notice = await response.json()
      onSuccess(saved)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setContent('')
    setNewFiles([])
    setExistingAttachments([])
    setDeleteAttachmentIds([])
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#7c8d4c]/20">
          <h2 className="text-xl text-[#f8f4e3] font-[var(--font-cormorant)]">
            {editingNotice ? '공지사항 수정' : '공지사항 등록'}
          </h2>
          <button onClick={handleClose} className="text-[#ccc5b9] hover:text-[#f8f4e3] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#ccc5b9] text-sm mb-2">
              제목 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              className="w-full bg-[#111311] border border-[#7c8d4c]/30 rounded-lg px-4 py-3 text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c]"
            />
          </div>

          <div>
            <label className="block text-[#ccc5b9] text-sm mb-2">
              첨부파일 <span className="text-[#ccc5b9]/60 text-xs">(선택사항, 여러 파일 가능)</span>
            </label>

            {existingAttachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {existingAttachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between px-3 py-2 bg-[#111311] border border-[#7c8d4c]/20 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-4 h-4 text-[#7c8d4c] flex-shrink-0" />
                      <span className="text-[#f8f4e3] text-sm truncate">{att.fileName}</span>
                      {att.fileSize && (
                        <span className="text-[#ccc5b9]/60 text-xs flex-shrink-0">{formatBytes(att.fileSize)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => markAttachmentForDeletion(att.id)}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {newFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#7c8d4c]/10 border border-[#7c8d4c]/30 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-4 h-4 text-[#7c8d4c] flex-shrink-0" />
                      <span className="text-[#f8f4e3] text-sm truncate">{file.name}</span>
                      <span className="text-[#ccc5b9]/60 text-xs flex-shrink-0">{formatBytes(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#7c8d4c]/40 rounded-lg text-[#ccc5b9] hover:border-[#7c8d4c] hover:text-[#7c8d4c] transition-colors text-sm"
            >
              <Paperclip className="w-4 h-4" />
              파일 추가
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-[#ccc5b9] text-sm mb-2">
              본문 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항 내용을 입력하세요"
              rows={10}
              className="w-full bg-[#111311] border border-[#7c8d4c]/30 rounded-lg px-4 py-3 text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-[#7c8d4c]/30 text-[#ccc5b9] rounded-lg hover:bg-[#7c8d4c]/10 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#7c8d4c] text-[#f8f4e3] rounded-lg hover:bg-[#6a7a40] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#f8f4e3]/30 border-t-[#f8f4e3] rounded-full animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {editingNotice ? '수정' : '등록'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
