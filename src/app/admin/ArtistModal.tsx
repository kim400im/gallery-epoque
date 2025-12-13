'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

type Artist = {
  id: string
  name: string
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = !!editingArtist

  // 수정 모드일 때 기존 데이터 채우기
  useEffect(() => {
    if (editingArtist) {
      setName(editingArtist.name)
    }
  }, [editingArtist])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('작가 이름을 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/artists', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isEditMode 
            ? { id: editingArtist.id, name: name.trim() }
            : { name: name.trim() }
        ),
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
      <div className="relative bg-[#1a1c1a] border border-[#7c8d4c]/30 rounded-xl w-full max-w-md mx-4 p-6">
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
              작가 이름
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
