'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import LogoutButton from './LogoutButton'
import ExhibitionModal from './ExhibitionModal'

type Exhibition = {
  id: string
  title: string
  imageUrl: string
  startDate: string
  endDate: string
  createdAt: string
}

type Props = {
  userEmail: string
}

export default function AdminDashboard({ userEmail }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null)
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // 전시회 목록 불러오기
  const fetchExhibitions = async () => {
    try {
      const response = await fetch('/api/exhibitions')
      if (response.ok) {
        const data = await response.json()
        setExhibitions(data)
      }
    } catch (error) {
      console.error('Failed to fetch exhibitions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExhibitions()
  }, [])

  const handleExhibitionCreated = (exhibition: Exhibition) => {
    setExhibitions(prev => [exhibition, ...prev])
  }

  const handleExhibitionUpdated = (exhibition: Exhibition) => {
    setExhibitions(prev => prev.map(e => e.id === exhibition.id ? exhibition : e))
  }

  const handleEdit = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 전시회를 삭제하시겠습니까?')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/exhibitions?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExhibitions(prev => prev.filter(e => e.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete exhibition:', error)
      alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingExhibition(null)
  }

  const handleModalSuccess = (exhibition: Exhibition) => {
    if (editingExhibition) {
      handleExhibitionUpdated(exhibition)
    } else {
      handleExhibitionCreated(exhibition)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getExhibitionStatus = (exhibition: Exhibition) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(exhibition.startDate)
    const endDate = new Date(exhibition.endDate)
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    if (startDate > today) {
      return { label: '예정', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    } else if (endDate < today) {
      return { label: '종료', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    } else {
      return { label: '진행중', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    }
  }

  return (
    <div className="min-h-screen bg-[#111311]">
      {/* 헤더 */}
      <header className="border-b border-[#7c8d4c]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-[var(--font-cormorant)] text-[#7c8d4c]">
            Gallery Epoque Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-[#ccc5b9] text-sm">{userEmail}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl text-[#f8f4e3] font-[var(--font-cormorant)] mb-2">
            대시보드
          </h2>
          <p className="text-[#ccc5b9]">
            관리자 페이지에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 상태 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
            <h3 className="text-[#ccc5b9] text-sm mb-2">로그인 상태</h3>
            <p className="text-[#7c8d4c] text-2xl font-semibold">인증됨</p>
          </div>
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
            <h3 className="text-[#ccc5b9] text-sm mb-2">전시 수</h3>
            <p className="text-[#f8f4e3] text-2xl font-semibold">{exhibitions.length}개</p>
          </div>
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
            <h3 className="text-[#ccc5b9] text-sm mb-2">예약 요청</h3>
            <p className="text-[#f8f4e3] text-2xl font-semibold">0건</p>
          </div>
        </div>

        {/* 전시회 관리 섹션 */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-[#f8f4e3]">전시회 관리</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#7c8d4c] text-[#f8f4e3] rounded-lg hover:bg-[#6a7a40] transition-colors"
            >
              <Plus className="w-4 h-4" />
              전시회 등록
            </button>
          </div>

          {/* 전시회 목록 */}
          {loading ? (
            <div className="text-[#ccc5b9] text-center py-12">로딩 중...</div>
          ) : exhibitions.length === 0 ? (
            <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-12 text-center">
              <p className="text-[#ccc5b9] mb-4">등록된 전시회가 없습니다.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[#7c8d4c] hover:text-[#d4af37] transition-colors"
              >
                첫 전시회를 등록해보세요
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitions.map((exhibition) => {
                const status = getExhibitionStatus(exhibition)
                return (
                  <div
                    key={exhibition.id}
                    className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg overflow-hidden group"
                  >
                    <div className="relative">
                      <img
                        src={exhibition.imageUrl}
                        alt={exhibition.title}
                        className="w-full h-48 object-cover"
                      />
                      {/* 상태 배지 */}
                      <span className={`absolute top-2 left-2 px-2 py-1 text-xs rounded border ${status.color}`}>
                        {status.label}
                      </span>
                      {/* 호버 시 액션 버튼 */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(exhibition)}
                          className="p-2 bg-[#7c8d4c] text-white rounded-lg hover:bg-[#6a7a40] transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exhibition.id)}
                          disabled={deleting === exhibition.id}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-[#f8f4e3] font-medium mb-2">
                        {exhibition.title}
                      </h4>
                      <p className="text-[#ccc5b9] text-sm">
                        {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* 전시회 등록/수정 모달 */}
      <ExhibitionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingExhibition={editingExhibition}
      />
    </div>
  )
}
