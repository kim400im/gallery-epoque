'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react'

type Artist = {
  id: string
  name: string
  createdAt: string
}

type ExhibitionImage = {
  id: string
  imageUrl: string
  displayOrder: number
}

type ExhibitionArtist = {
  id: string
  artistId: string
  artist: Artist
}

type Exhibition = {
  id: string
  title: string
  imageUrl: string
  startDate: string
  endDate: string
  createdAt: string
  artists?: ExhibitionArtist[]
  images?: ExhibitionImage[]
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (exhibition: Exhibition) => void
  editingExhibition?: Exhibition | null
  artists: Artist[]
}

export default function ExhibitionModal({ isOpen, onClose, onSuccess, editingExhibition, artists }: Props) {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ExhibitionImage[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const additionalFileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!editingExhibition

  // 수정 모드일 때 기존 데이터 채우기
  useEffect(() => {
    if (editingExhibition) {
      setTitle(editingExhibition.title)
      setStartDate(editingExhibition.startDate ? editingExhibition.startDate.split('T')[0] : '')
      setEndDate(editingExhibition.endDate ? editingExhibition.endDate.split('T')[0] : '')
      setPreview(editingExhibition.imageUrl)
      // 기존 작가들의 ID 배열 설정
      const artistIds = editingExhibition.artists?.map(ea => ea.artistId) || []
      setSelectedArtistIds(artistIds)
      setExistingImages(editingExhibition.images || [])
      setDeleteImageIds([])
    }
  }, [editingExhibition])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setAdditionalImages(prev => [...prev, ...files])
      
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setAdditionalPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: string) => {
    setDeleteImageIds(prev => [...prev, imageId])
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
  }

  // 작가 선택/해제 핸들러
  const handleArtistToggle = (artistId: string) => {
    setSelectedArtistIds(prev => {
      if (prev.includes(artistId)) {
        return prev.filter(id => id !== artistId)
      } else {
        return [...prev, artistId]
      }
    })
  }

  // 선택된 작가 제거
  const removeSelectedArtist = (artistId: string) => {
    setSelectedArtistIds(prev => prev.filter(id => id !== artistId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !startDate || !endDate) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (!isEditMode && !image) {
      setError('대표 이미지를 업로드해주세요.')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('종료일은 시작일보다 이후여야 합니다.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)
      
      // 다중 작가 ID 전송
      if (selectedArtistIds.length > 0) {
        formData.append('artistIds', JSON.stringify(selectedArtistIds))
      }
      
      if (image) {
        formData.append('image', image)
      }

      // 추가 이미지들
      additionalImages.forEach(img => {
        formData.append('additionalImages', img)
      })

      if (isEditMode) {
        formData.append('id', editingExhibition.id)
        if (deleteImageIds.length > 0) {
          formData.append('deleteImageIds', JSON.stringify(deleteImageIds))
        }
      }

      const response = await fetch('/api/exhibitions', {
        method: isEditMode ? 'PUT' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `전시회 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`)
      }

      const exhibition = await response.json()
      onSuccess(exhibition)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : `전시회 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setStartDate('')
    setEndDate('')
    setSelectedArtistIds([])
    setImage(null)
    setPreview(null)
    setAdditionalImages([])
    setAdditionalPreviews([])
    setExistingImages([])
    setDeleteImageIds([])
    setError(null)
    onClose()
  }

  // 선택되지 않은 작가만 드롭다운에 표시
  const availableArtists = artists.filter(artist => !selectedArtistIds.includes(artist.id))

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
            {isEditMode ? '전시회 수정' : '전시회 등록'}
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
          {/* 전시회 이름 */}
          <div>
            <label htmlFor="title" className="block text-sm text-[#ccc5b9] mb-2">
              전시회 이름
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] placeholder-[#ccc5b9]/50 focus:outline-none focus:border-[#7c8d4c] transition-colors"
              placeholder="전시회 이름을 입력하세요"
            />
          </div>

          {/* 작가 선택 (다중 선택) */}
          <div>
            <label htmlFor="artist" className="block text-sm text-[#ccc5b9] mb-2">
              작가 <span className="text-[#7c8d4c]">(여러 명 선택 가능)</span>
            </label>
            
            {/* 선택된 작가들 표시 */}
            {selectedArtistIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedArtistIds.map(artistId => {
                  const artist = artists.find(a => a.id === artistId)
                  if (!artist) return null
                  return (
                    <span
                      key={artistId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#7c8d4c]/20 border border-[#7c8d4c]/30 rounded-full text-sm text-[#f8f4e3]"
                    >
                      {artist.name}
                      <button
                        type="button"
                        onClick={() => removeSelectedArtist(artistId)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}

            {/* 작가 선택 드롭다운 */}
            <select
              id="artist"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleArtistToggle(e.target.value)
                }
              }}
              className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] focus:outline-none focus:border-[#7c8d4c] transition-colors"
            >
              <option value="">
                {availableArtists.length > 0 
                  ? '작가를 선택하세요 (선택사항)' 
                  : '모든 작가가 선택되었습니다'}
              </option>
              {availableArtists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          {/* 전시 기간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm text-[#ccc5b9] mb-2">
                시작일
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] focus:outline-none focus:border-[#7c8d4c] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm text-[#ccc5b9] mb-2">
                종료일
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#111311] border border-[#7c8d4c]/30 rounded-lg text-[#f8f4e3] focus:outline-none focus:border-[#7c8d4c] transition-colors"
              />
            </div>
          </div>

          {/* 대표 이미지 업로드 */}
          <div>
            <label className="block text-sm text-[#ccc5b9] mb-2">
              대표 이미지 {isEditMode && <span className="text-[#7c8d4c]">(선택사항)</span>}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setPreview(isEditMode ? editingExhibition?.imageUrl || null : null)
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-[#7c8d4c] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#6a7a40] transition-colors"
                  >
                    변경
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-[#7c8d4c]/30 rounded-lg flex flex-col items-center justify-center gap-2 text-[#ccc5b9] hover:border-[#7c8d4c]/50 hover:text-[#f8f4e3] transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">클릭하여 대표 이미지 업로드</span>
              </button>
            )}
          </div>

          {/* 추가 이미지 업로드 */}
          <div>
            <label className="block text-sm text-[#ccc5b9] mb-2">
              추가 이미지 <span className="text-[#7c8d4c]">(선택사항)</span>
            </label>
            <input
              ref={additionalFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="hidden"
            />

            {/* 기존 추가 이미지 (수정 모드) */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.imageUrl}
                      alt="Additional"
                      className="w-full h-24 object-cover rounded-lg"
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
            {additionalPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {additionalPreviews.map((previewUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={previewUrl}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 추가 이미지 업로드 버튼 */}
            <button
              type="button"
              onClick={() => additionalFileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-[#7c8d4c]/30 rounded-lg flex items-center justify-center gap-2 text-[#ccc5b9] hover:border-[#7c8d4c]/50 hover:text-[#f8f4e3] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">추가 이미지 업로드</span>
            </button>
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
