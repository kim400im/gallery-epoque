'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'

type Exhibition = {
  id: string
  title: string
  imageUrl: string
  startDate: string
  endDate: string
  createdAt: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (exhibition: Exhibition) => void
  editingExhibition?: Exhibition | null
}

export default function ExhibitionModal({ isOpen, onClose, onSuccess, editingExhibition }: Props) {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!editingExhibition

  // 수정 모드일 때 기존 데이터 채우기
  useEffect(() => {
    if (editingExhibition) {
      setTitle(editingExhibition.title)
      setStartDate(editingExhibition.startDate ? editingExhibition.startDate.split('T')[0] : '')
      setEndDate(editingExhibition.endDate ? editingExhibition.endDate.split('T')[0] : '')
      setPreview(editingExhibition.imageUrl)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 등록 모드에서는 이미지 필수, 수정 모드에서는 선택
    if (!title || !startDate || !endDate) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (!isEditMode && !image) {
      setError('이미지를 업로드해주세요.')
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
      
      if (image) {
        formData.append('image', image)
      }

      if (isEditMode) {
        formData.append('id', editingExhibition.id)
      }

      const response = await fetch('/api/exhibitions', {
        method: isEditMode ? 'PUT' : 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} exhibition`)
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
    setImage(null)
    setPreview(null)
    setError(null)
    onClose()
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
      <div className="relative bg-[#1a1c1a] border border-[#7c8d4c]/30 rounded-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
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

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm text-[#ccc5b9] mb-2">
              전시회 이미지 {isEditMode && <span className="text-[#7c8d4c]">(선택사항)</span>}
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
                <span className="text-sm">클릭하여 이미지 업로드</span>
              </button>
            )}
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
