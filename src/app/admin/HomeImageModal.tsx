'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'

type HomeImage = {
  id: string
  imageUrl: string
  title: string | null
  subtitle: string | null
  displayOrder: number
  isActive: boolean
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (homeImage: HomeImage) => void
  editingImage: HomeImage | null
}

export default function HomeImageModal({ isOpen, onClose, onSuccess, editingImage }: Props) {
  const [title, setTitle] = useState(editingImage?.title || '')
  const [subtitle, setSubtitle] = useState(editingImage?.subtitle || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(editingImage?.imageUrl || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!editingImage && !imageFile) {
      setError('이미지를 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      if (editingImage) {
        formData.append('id', editingImage.id)
      }
      formData.append('title', title)
      formData.append('subtitle', subtitle)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await fetch('/api/home-images', {
        method: editingImage ? 'PUT' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '저장에 실패했습니다.')
      }

      const savedImage = await response.json()
      onSuccess(savedImage)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setSubtitle('')
    setImageFile(null)
    setImagePreview(null)
    setError(null)
    onClose()
  }

  // 모달이 열릴 때 편집 데이터 설정
  useEffect(() => {
    if (isOpen && editingImage) {
      setTitle(editingImage.title || '')
      setSubtitle(editingImage.subtitle || '')
      setImagePreview(editingImage.imageUrl)
    } else if (isOpen && !editingImage) {
      setTitle('')
      setSubtitle('')
      setImagePreview(null)
      setImageFile(null)
    }
  }, [isOpen, editingImage])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-[#7c8d4c]/20">
          <h2 className="text-xl text-[#f8f4e3] font-[var(--font-cormorant)]">
            {editingImage ? '홈 이미지 수정' : '홈 이미지 등록'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#ccc5b9] hover:text-[#f8f4e3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-[#ccc5b9] text-sm mb-2">
              이미지 {!editingImage && <span className="text-red-400">*</span>}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#7c8d4c]/30 rounded-lg p-4 text-center cursor-pointer hover:border-[#7c8d4c]/50 transition-colors"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="py-8">
                  <ImageIcon className="w-12 h-12 text-[#7c8d4c]/50 mx-auto mb-2" />
                  <p className="text-[#ccc5b9] text-sm">클릭하여 이미지 선택</p>
                  <p className="text-[#ccc5b9]/60 text-xs mt-1">JPG, PNG, WebP 지원</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 제목 (선택) */}
          <div>
            <label className="block text-[#ccc5b9] text-sm mb-2">
              제목 (선택사항)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Gallery Époque"
              className="w-full bg-[#111311] border border-[#7c8d4c]/30 rounded-lg px-4 py-3 text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c]"
            />
          </div>

          {/* 부제목 (선택) */}
          <div>
            <label className="block text-[#ccc5b9] text-sm mb-2">
              부제목 (선택사항)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Art & Culture"
              className="w-full bg-[#111311] border border-[#7c8d4c]/30 rounded-lg px-4 py-3 text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c]"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
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
                  {editingImage ? '수정' : '등록'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
