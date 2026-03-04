'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react'

type ArtistImage = {
  id: string
  imageUrl: string
  displayOrder: number
}

type Artist = {
  id: string
  name: string
  biography: string | null
  introduction: string | null
  images?: ArtistImage[]
  createdAt: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (artist: Artist) => void
  editingArtist?: Artist | null
}

export default function ArtistModal({ isOpen, onClose, onSuccess, editingArtist }: Props) {
  const [name, setName] = useState('')
  const [biography, setBiography] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ArtistImage[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!editingArtist

  // 수정 모드일 때 기존 데이터 채우기
  useEffect(() => {
    if (editingArtist) {
      setName(editingArtist.name)
      setBiography(editingArtist.biography || '')
      setIntroduction(editingArtist.introduction || '')
      setExistingImages(editingArtist.images || [])
      setDeleteImageIds([])
    }
  }, [editingArtist])

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length - deleteImageIds.length + newImages.length + files.length
    
    if (totalImages > 2) {
      setError('이미지는 최대 2장까지 등록할 수 있습니다.')
      return
    }

    if (files.length > 0) {
      setNewImages(prev => [...prev, ...files])
      
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setNewPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: string) => {
    setDeleteImageIds(prev => [...prev, imageId])
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('작가 이름을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('biography', biography.trim())
      formData.append('introduction', introduction.trim())
      
      // 새 이미지들
      newImages.forEach(img => {
        formData.append('images', img)
      })

      if (isEditMode) {
        formData.append('id', editingArtist.id)
        if (deleteImageIds.length > 0) {
          formData.append('deleteImageIds', JSON.stringify(deleteImageIds))
        }
      }

      const response = await fetch('/api/artists', {
        method: isEditMode ? 'PUT' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `작가 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`)
      }

      const artist = await response.json()
      onSuccess(artist)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : `작가 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setBiography('')
    setIntroduction('')
    setNewImages([])
    setNewPreviews([])
    setExistingImages([])
    setDeleteImageIds([])
    setError(null)
    onClose()
  }

  const canAddMoreImages = () => {
    const currentCount = existingImages.length + newImages.length
    return currentCount < 2
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 */}
      <div className="relative bg-[#1a1c1a] border border-[#7c8d4c]/30 rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#f8f4e3] font-[var(--font-cormorant)]">
            {isEditMode ? '작가 수정' : '작가 등록'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#ccc5b9] hover:text-[#f8f4e3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 작가 이름 */}
          <div>
            <label htmlFor="artistName" className="block text-sm text-[#ccc5b9] mb-2">
              작가 이름 <span className="text-red-400">*</span>
            </label>
            <input
              id="artistName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] transition-colors"
              placeholder="작가 이름을 입력하세요"
              autoFocus
            />
          </div>

          {/* 작가 사진 */}
          <div>
            <label className="block text-sm text-[#ccc5b9] mb-2">
              작가 사진 <span className="text-[#7c8d4c]">(최대 2장, 선택사항)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="hidden"
            />

            {/* 기존 이미지 (수정 모드) */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.imageUrl}
                      alt="Artist"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 새로 추가할 이미지 미리보기 */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {newPreviews.map((previewUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={previewUrl}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 업로드 버튼 */}
            {canAddMoreImages() && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-[#7c8d4c]/30 rounded-lg flex flex-col items-center justify-center gap-2 text-[#ccc5b9] hover:border-[#7c8d4c]/50 hover:text-[#f8f4e3] transition-colors"
              >
                {existingImages.length === 0 && newPreviews.length === 0 ? (
                  <>
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">클릭하여 작가 사진 업로드</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">사진 추가</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* 약력 */}
          <div>
            <label htmlFor="biography" className="block text-sm text-[#ccc5b9] mb-2">
              약력 <span className="text-[#7c8d4c]">(선택사항)</span>
            </label>
            <textarea
              id="biography"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] transition-colors resize-none"
              placeholder="학력, 수상 경력, 전시 이력 등을 입력하세요"
            />
            <p className="mt-1 text-xs text-[#ccc5b9]/70">예: 홍익대학교 미술대학 졸업, 2023 OO 공모전 대상 등</p>
          </div>

          {/* 소개 */}
          <div>
            <label htmlFor="introduction" className="block text-sm text-[#ccc5b9] mb-2">
              소개 <span className="text-[#7c8d4c]">(선택사항)</span>
            </label>
            <textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] transition-colors resize-none"
              placeholder="작가에 대한 소개글을 입력하세요"
            />
            <p className="mt-1 text-xs text-[#ccc5b9]/70">작가의 작품 세계, 예술적 철학 등을 자유롭게 작성하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 border border-[#7c8d4c]/30 text-[#ccc5b9] rounded-lg hover:border-[#7c8d4c]/50 hover:text-[#f8f4e3] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#7c8d4c] text-[#f8f4e3] rounded-lg hover:bg-[#6a7a40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? '수정 중...' : '등록 중...'}
                </>
              ) : (
                isEditMode ? '수정하기' : '등록하기'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
