'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users, Image as ImageIcon, GripVertical, Calendar, Mail, Phone, Check, Ban, X, Bell, Paperclip, Star } from 'lucide-react'
import LogoutButton from './LogoutButton'
import ExhibitionModal from './ExhibitionModal'
import ArtistModal from './ArtistModal'
import HomeImageModal from './HomeImageModal'
import NoticeModal from './NoticeModal'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ko } from 'date-fns/locale'

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
  createdAt: string
  attachments: NoticeAttachment[]
}

type BlockedDate = {
  id: string
  date: string
  reason: string | null
  type: string
}

type Booking = {
  id: string
  name: string
  phone: string
  email: string
  startDate: string
  endDate: string
  message: string | null
  isRead: boolean
  createdAt: string
}

type Artist = {
  id: string
  name: string
  biography: string | null
  introduction: string | null
  createdAt: string
}

type ExhibitionImage = {
  id: string
  imageUrl: string
  displayOrder: number
}

type HomeImage = {
  id: string
  imageUrl: string
  title: string | null
  subtitle: string | null
  displayOrder: number
  isActive: boolean
}

type ExhibitionArtist = {
  id: string
  artistId: string
  artist: Artist
}

type Exhibition = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  startDate: string
  endDate: string
  createdAt: string
  artists?: ExhibitionArtist[]
  images?: ExhibitionImage[]
}

type Props = {
  userEmail: string
}

export default function AdminDashboard({ userEmail }: Props) {
  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false)
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false)
  const [isHomeImageModalOpen, setIsHomeImageModalOpen] = useState(false)
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false)
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [editingHomeImage, setEditingHomeImage] = useState<HomeImage | null>(null)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [homeImages, setHomeImages] = useState<HomeImage[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [noticePage, setNoticePage] = useState(1)
  const [noticeTotalPages, setNoticeTotalPages] = useState(1)
  const [noticeTotal, setNoticeTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'exhibitions' | 'artists' | 'homeImages' | 'bookings' | 'blockedDates' | 'notices'>('exhibitions')
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [allUnavailableDates, setAllUnavailableDates] = useState<Date[]>([]) // 모든 예약 불가 날짜 (전시 + 차단)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [blockReason, setBlockReason] = useState('')
  const [isBlocking, setIsBlocking] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const fetchNotices = async (page = 1) => {
    try {
      const response = await fetch(`/api/notices?page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setNotices(data.notices)
        setNoticePage(data.page)
        setNoticeTotalPages(data.totalPages)
        setNoticeTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error)
    }
  }

  const handleNoticeCreated = (notice: Notice) => {
    setNotices((prev) => [notice, ...prev])
    setNoticeTotal((t) => t + 1)
  }

  const handleNoticeUpdated = (notice: Notice) => {
    setNotices((prev) => prev.map((n) => (n.id === notice.id ? notice : n)))
  }

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice)
    setIsNoticeModalOpen(true)
  }

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return
    setDeleting(id)
    try {
      const response = await fetch(`/api/notices?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        setNotices((prev) => prev.filter((n) => n.id !== id))
        setNoticeTotal((t) => t - 1)
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete notice:', error)
      alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const handleNoticeModalClose = () => {
    setIsNoticeModalOpen(false)
    setEditingNotice(null)
  }

  const handleToggleFeatured = async (notice: Notice) => {
    try {
      if (notice.isFeatured) {
        const res = await fetch('/api/notices/featured', { method: 'DELETE' })
        if (res.ok) {
          setNotices((prev) => prev.map((n) => ({ ...n, isFeatured: false })))
        }
      } else {
        const res = await fetch('/api/notices/featured', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notice.id }),
        })
        if (res.ok) {
          setNotices((prev) =>
            prev.map((n) => ({ ...n, isFeatured: n.id === notice.id }))
          )
        }
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error)
      alert('메인 노출 설정에 실패했습니다.')
    }
  }

  const handleNoticeModalSuccess = (notice: Notice) => {
    if (editingNotice) {
      handleNoticeUpdated(notice)
    } else {
      handleNoticeCreated(notice)
    }
  }

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
    }
  }

  // 작가 목록 불러오기
  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/artists')
      if (response.ok) {
        const data = await response.json()
        setArtists(data)
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error)
    }
  }

  // 홈 이미지 목록 불러오기 (관리자용 - 모든 이미지)
  const fetchHomeImages = async () => {
    try {
      const response = await fetch('/api/home-images/admin')
      if (response.ok) {
        const data = await response.json()
        setHomeImages(data)
      }
    } catch (error) {
      console.error('Failed to fetch home images:', error)
    }
  }

  // 예약 목록 불러오기
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  // 차단된 날짜 목록 불러오기 (관리자가 수동으로 차단한 것만)
  const fetchBlockedDates = async () => {
    try {
      const response = await fetch('/api/bookings/unavailable-dates/admin')
      if (response.ok) {
        const data = await response.json()
        setBlockedDates(data)
      }
    } catch (error) {
      console.error('Failed to fetch blocked dates:', error)
    }
  }

  // 모든 예약 불가 날짜 불러오기 (전시 + 관리자 차단 모두)
  const fetchAllUnavailableDates = async () => {
    try {
      const response = await fetch('/api/bookings/unavailable-dates')
      if (response.ok) {
        const data = await response.json()
        // 문자열 날짜를 Date 객체로 변환
        const dates = data.unavailableDates.map((dateStr: string) => {
          const d = new Date(dateStr)
          d.setHours(0, 0, 0, 0)
          return d
        })
        setAllUnavailableDates(dates)
      }
    } catch (error) {
      console.error('Failed to fetch all unavailable dates:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchExhibitions(), fetchArtists(), fetchHomeImages(), fetchBookings(), fetchBlockedDates(), fetchAllUnavailableDates(), fetchNotices()]).finally(() => setLoading(false))
  }, [])

  // 전시회 핸들러
  const handleExhibitionCreated = (exhibition: Exhibition) => {
    setExhibitions(prev => [exhibition, ...prev])
  }

  const handleExhibitionUpdated = (exhibition: Exhibition) => {
    setExhibitions(prev => prev.map(e => e.id === exhibition.id ? exhibition : e))
  }

  const handleEditExhibition = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition)
    setIsExhibitionModalOpen(true)
  }

  const handleDeleteExhibition = async (id: string) => {
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

  const handleExhibitionModalClose = () => {
    setIsExhibitionModalOpen(false)
    setEditingExhibition(null)
  }

  const handleExhibitionModalSuccess = (exhibition: Exhibition) => {
    if (editingExhibition) {
      handleExhibitionUpdated(exhibition)
    } else {
      handleExhibitionCreated(exhibition)
    }
  }

  // 작가 핸들러
  const handleArtistCreated = (artist: Artist) => {
    setArtists(prev => [artist, ...prev])
  }

  const handleArtistUpdated = (artist: Artist) => {
    setArtists(prev => prev.map(a => a.id === artist.id ? artist : a))
  }

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist)
    setIsArtistModalOpen(true)
  }

  const handleDeleteArtist = async (id: string) => {
    if (!confirm('정말로 이 작가를 삭제하시겠습니까? 관련된 전시회의 작가 정보가 삭제됩니다.')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/artists?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setArtists(prev => prev.filter(a => a.id !== id))
        // 전시회 목록도 새로고침 (작가 정보 업데이트)
        fetchExhibitions()
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete artist:', error)
      alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const handleArtistModalClose = () => {
    setIsArtistModalOpen(false)
    setEditingArtist(null)
  }

  const handleArtistModalSuccess = (artist: Artist) => {
    if (editingArtist) {
      handleArtistUpdated(artist)
    } else {
      handleArtistCreated(artist)
    }
  }

  // 홈 이미지 핸들러
  const handleHomeImageCreated = (image: HomeImage) => {
    setHomeImages(prev => [...prev, image])
  }

  const handleHomeImageUpdated = (image: HomeImage) => {
    setHomeImages(prev => prev.map(i => i.id === image.id ? image : i))
  }

  const handleEditHomeImage = (image: HomeImage) => {
    setEditingHomeImage(image)
    setIsHomeImageModalOpen(true)
  }

  const handleDeleteHomeImage = async (id: string) => {
    if (!confirm('정말로 이 이미지를 삭제하시겠습니까?')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/home-images?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setHomeImages(prev => prev.filter(i => i.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to delete home image:', error)
      alert('삭제에 실패했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const handleHomeImageModalClose = () => {
    setIsHomeImageModalOpen(false)
    setEditingHomeImage(null)
  }

  const handleHomeImageModalSuccess = (image: HomeImage) => {
    if (editingHomeImage) {
      handleHomeImageUpdated(image)
    } else {
      handleHomeImageCreated(image)
    }
  }

  // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 방지)
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 날짜 차단 핸들러
  const handleBlockDates = async () => {
    if (selectedDates.length === 0) {
      alert('차단할 날짜를 선택해주세요.')
      return
    }

    setIsBlocking(true)
    try {
      const response = await fetch('/api/bookings/unavailable-dates/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: selectedDates.map(d => formatLocalDate(d)),
          reason: blockReason || '관리자 차단'
        })
      })

      if (response.ok) {
        await fetchBlockedDates()
        await fetchAllUnavailableDates()
        setSelectedDates([])
        setBlockReason('')
        alert('날짜가 차단되었습니다.')
      } else {
        const data = await response.json()
        alert(data.error || '날짜 차단에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to block dates:', error)
      alert('날짜 차단에 실패했습니다.')
    } finally {
      setIsBlocking(false)
    }
  }

  const handleUnblockDate = async (id: string) => {
    if (!confirm('이 날짜의 차단을 해제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/bookings/unavailable-dates/admin?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBlockedDates(prev => prev.filter(d => d.id !== id))
        await fetchAllUnavailableDates()
      } else {
        alert('차단 해제에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to unblock date:', error)
      alert('차단 해제에 실패했습니다.')
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
            <h3 className="text-[#ccc5b9] text-sm mb-2">로그인 상태</h3>
            <p className="text-[#7c8d4c] text-2xl font-semibold">인증됨</p>
          </div>
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
            <h3 className="text-[#ccc5b9] text-sm mb-2">전시 수</h3>
            <p className="text-[#f8f4e3] text-2xl font-semibold">{exhibitions.length}개</p>
          </div>
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
            <h3 className="text-[#ccc5b9] text-sm mb-2">작가 수</h3>
            <p className="text-[#f8f4e3] text-2xl font-semibold">{artists.length}명</p>
          </div>
          <div 
            className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6 cursor-pointer hover:border-[#7c8d4c]/40 transition-colors"
            onClick={() => setActiveTab('bookings')}
          >
            <h3 className="text-[#ccc5b9] text-sm mb-2">예약 요청</h3>
            <div className="flex items-center gap-2">
              <p className="text-[#f8f4e3] text-2xl font-semibold">{bookings.length}건</p>
              {bookings.filter(b => !b.isRead).length > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {bookings.filter(b => !b.isRead).length} 새 요청
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mt-12 border-b border-[#7c8d4c]/20">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('exhibitions')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'exhibitions'
                  ? 'text-[#7c8d4c]'
                  : 'text-[#ccc5b9] hover:text-[#f8f4e3]'
              }`}
            >
              전시회 관리
              {activeTab === 'exhibitions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c8d4c]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'artists'
                  ? 'text-[#7c8d4c]'
                  : 'text-[#ccc5b9] hover:text-[#f8f4e3]'
              }`}
            >
              작가 관리
              {activeTab === 'artists' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c8d4c]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('homeImages')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'homeImages'
                  ? 'text-[#7c8d4c]'
                  : 'text-[#ccc5b9] hover:text-[#f8f4e3]'
              }`}
            >
              홈 화면 관리
              {activeTab === 'homeImages' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c8d4c]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'text-[#7c8d4c]'
                  : 'text-[#ccc5b9] hover:text-[#f8f4e3]'
              }`}
            >
              예약 관리
              {bookings.filter(b => !b.isRead).length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {bookings.filter(b => !b.isRead).length}
                </span>
              )}
              {activeTab === 'bookings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c8d4c]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('blockedDates')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'blockedDates'
                  ? 'text-[#7c8d4c]'
                  : 'text-[#ccc5b9] hover:text-[#f8f4e3]'
              }`}
            >
              <Ban className="w-4 h-4" />
              날짜 차단
              {activeTab === 'blockedDates' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c8d4c]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'notices'
                  ? 'text-[#7c8d4c]'
                  : 'text-[#ccc5b9] hover:text-[#f8f4e3]'
              }`}
            >
              <Bell className="w-4 h-4" />
              공지사항
              {activeTab === 'notices' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7c8d4c]" />
              )}
            </button>
          </div>
        </div>

        {/* 전시회 관리 탭 */}
        {activeTab === 'exhibitions' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg text-[#f8f4e3]">전시회 목록</h3>
              <button
                onClick={() => setIsExhibitionModalOpen(true)}
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
                  onClick={() => setIsExhibitionModalOpen(true)}
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
                        {/* 추가 이미지 개수 표시 */}
                        {exhibition.images && exhibition.images.length > 0 && (
                          <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-black/50 text-white">
                            +{exhibition.images.length} 이미지
                          </span>
                        )}
                        {/* 호버 시 액션 버튼 */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditExhibition(exhibition)}
                            className="p-2 bg-[#7c8d4c] text-white rounded-lg hover:bg-[#6a7a40] transition-colors"
                            title="수정"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExhibition(exhibition.id)}
                            disabled={deleting === exhibition.id}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-[#f8f4e3] font-medium mb-1">
                          {exhibition.title}
                        </h4>
                        {exhibition.artists && exhibition.artists.length > 0 && (
                          <p className="text-[#7c8d4c] text-sm mb-2">
                            {exhibition.artists.map(ea => ea.artist.name).join(', ')}
                          </p>
                        )}
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
        )}

        {/* 작가 관리 탭 */}
        {activeTab === 'artists' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg text-[#f8f4e3]">작가 목록</h3>
              <button
                onClick={() => setIsArtistModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#7c8d4c] text-[#f8f4e3] rounded-lg hover:bg-[#6a7a40] transition-colors"
              >
                <Plus className="w-4 h-4" />
                작가 등록
              </button>
            </div>

            {/* 작가 목록 */}
            {loading ? (
              <div className="text-[#ccc5b9] text-center py-12">로딩 중...</div>
            ) : artists.length === 0 ? (
              <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-12 text-center">
                <Users className="w-12 h-12 text-[#7c8d4c]/50 mx-auto mb-4" />
                <p className="text-[#ccc5b9] mb-4">등록된 작가가 없습니다.</p>
                <button
                  onClick={() => setIsArtistModalOpen(true)}
                  className="text-[#7c8d4c] hover:text-[#d4af37] transition-colors"
                >
                  첫 작가를 등록해보세요
                </button>
              </div>
            ) : (
              <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#7c8d4c]/20">
                      <th className="text-left text-[#ccc5b9] text-sm font-medium px-6 py-4">작가명</th>
                      <th className="text-left text-[#ccc5b9] text-sm font-medium px-6 py-4">등록일</th>
                      <th className="text-right text-[#ccc5b9] text-sm font-medium px-6 py-4">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...artists].sort((a, b) => a.name.localeCompare(b.name, 'ko')).map((artist) => (
                      <tr key={artist.id} className="border-b border-[#7c8d4c]/10 last:border-b-0">
                        <td className="text-[#f8f4e3] px-6 py-4">{artist.name}</td>
                        <td className="text-[#ccc5b9] text-sm px-6 py-4">{formatDate(artist.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditArtist(artist)}
                              className="p-2 text-[#7c8d4c] hover:bg-[#7c8d4c]/10 rounded-lg transition-colors"
                              title="수정"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteArtist(artist.id)}
                              disabled={deleting === artist.id}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 예약 관리 탭 */}
        {activeTab === 'bookings' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg text-[#f8f4e3]">예약 요청 목록</h3>
                <p className="text-[#ccc5b9] text-sm mt-1">공간 예약 문의 내역을 확인합니다.</p>
              </div>
            </div>

            {loading ? (
              <div className="text-[#ccc5b9] text-center py-12">로딩 중...</div>
            ) : bookings.length === 0 ? (
              <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-12 text-center">
                <Calendar className="w-12 h-12 text-[#7c8d4c]/50 mx-auto mb-4" />
                <p className="text-[#ccc5b9]">예약 요청이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`bg-[#1a1c1a] border rounded-lg p-6 ${
                      booking.isRead 
                        ? 'border-[#7c8d4c]/20' 
                        : 'border-red-500/50 bg-red-500/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <h4 className={`text-lg font-medium ${booking.isRead ? 'text-[#f8f4e3]' : 'text-red-400'}`}>
                          {booking.name}
                        </h4>
                        {!booking.isRead && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded">NEW</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!booking.isRead && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/bookings', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: booking.id, isRead: true })
                                })
                                if (response.ok) {
                                  setBookings(prev => prev.map(b => 
                                    b.id === booking.id ? { ...b, isRead: true } : b
                                  ))
                                }
                              } catch (error) {
                                console.error('Failed to mark as read:', error)
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#7c8d4c] text-white rounded hover:bg-[#6a7a40] transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            읽음 처리
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm('이 예약 요청을 삭제하시겠습니까?')) return
                            try {
                              const response = await fetch(`/api/bookings?id=${booking.id}`, {
                                method: 'DELETE'
                              })
                              if (response.ok) {
                                setBookings(prev => prev.filter(b => b.id !== booking.id))
                              }
                            } catch (error) {
                              console.error('Failed to delete booking:', error)
                            }
                          }}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-[#ccc5b9]">
                        <Phone className="w-4 h-4" />
                        <span>{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#ccc5b9]">
                        <Mail className="w-4 h-4" />
                        <span>{booking.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#ccc5b9] mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        대관 기간: {new Date(booking.startDate).toLocaleDateString('ko-KR')} ~ {new Date(booking.endDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    
                    {booking.message && (
                      <div className="bg-[#111311] rounded-lg p-4 mb-4">
                        <p className="text-[#ccc5b9] text-sm whitespace-pre-wrap">{booking.message}</p>
                      </div>
                    )}
                    
                    <p className="text-[#7c8d4c]/60 text-xs">
                      접수일: {new Date(booking.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 홈 화면 관리 탭 */}
        {activeTab === 'homeImages' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg text-[#f8f4e3]">홈 슬라이더 이미지</h3>
                <p className="text-[#ccc5b9] text-sm mt-1">홈 화면에 표시될 슬라이더 이미지를 관리합니다.</p>
              </div>
              <button
                onClick={() => setIsHomeImageModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#7c8d4c] text-[#f8f4e3] rounded-lg hover:bg-[#6a7a40] transition-colors"
              >
                <Plus className="w-4 h-4" />
                이미지 등록
              </button>
            </div>

            {/* 홈 이미지 목록 */}
            {loading ? (
              <div className="text-[#ccc5b9] text-center py-12">로딩 중...</div>
            ) : homeImages.length === 0 ? (
              <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-12 text-center">
                <ImageIcon className="w-12 h-12 text-[#7c8d4c]/50 mx-auto mb-4" />
                <p className="text-[#ccc5b9] mb-4">등록된 홈 이미지가 없습니다.</p>
                <button
                  onClick={() => setIsHomeImageModalOpen(true)}
                  className="text-[#7c8d4c] hover:text-[#d4af37] transition-colors"
                >
                  첫 이미지를 등록해보세요
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`bg-[#1a1c1a] border rounded-lg overflow-hidden group ${
                      image.isActive ? 'border-[#7c8d4c]/20' : 'border-red-500/30 opacity-60'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={image.imageUrl}
                        alt={image.title || '홈 이미지'}
                        className="w-full h-48 object-cover"
                      />
                      {/* 순서 표시 */}
                      <span className="absolute top-2 left-2 px-2 py-1 text-xs rounded bg-black/50 text-white flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        #{index + 1}
                      </span>
                      {/* 비활성화 표시 */}
                      {!image.isActive && (
                        <span className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-red-500/80 text-white">
                          비활성
                        </span>
                      )}
                      {/* 호버 시 액션 버튼 */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditHomeImage(image)}
                          className="p-2 bg-[#7c8d4c] text-white rounded-lg hover:bg-[#6a7a40] transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHomeImage(image.id)}
                          disabled={deleting === image.id}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          title="삭제"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-[#f8f4e3] font-medium mb-1">
                        {image.title || 'Gallery Epoque'}
                      </h4>
                      <p className="text-[#ccc5b9] text-sm">
                        {image.subtitle || 'Art & Culture'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 날짜 차단 관리 탭 */}
        {activeTab === 'blockedDates' && (
          <div className="mt-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg text-[#f8f4e3]">예약 불가 날짜 관리</h3>
                <p className="text-[#ccc5b9] text-sm mt-1">
                  특정 날짜를 예약 불가능하도록 설정합니다. 전시 일정은 자동으로 차단됩니다.
                </p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm('기존 전시 일정을 기반으로 예약 불가 날짜를 동기화하시겠습니까?')) return
                  setIsSyncing(true)
                  try {
                    const response = await fetch('/api/bookings/unavailable-dates/sync', {
                      method: 'POST'
                    })
                    const data = await response.json()
                    if (response.ok) {
                      alert(data.message)
                      await fetchBlockedDates()
                      await fetchAllUnavailableDates()
                    } else {
                      alert(data.error || '동기화에 실패했습니다.')
                    }
                  } catch (error) {
                    console.error('Failed to sync:', error)
                    alert('동기화에 실패했습니다.')
                  } finally {
                    setIsSyncing(false)
                  }
                }}
                disabled={isSyncing}
                className="px-4 py-2 bg-[#7c8d4c]/20 text-[#7c8d4c] rounded-lg hover:bg-[#7c8d4c]/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSyncing && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSyncing ? '동기화 중...' : '전시 일정 동기화'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 날짜 선택 섹션 */}
              <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
                <h4 className="text-[#f8f4e3] font-medium mb-4">날짜 차단하기</h4>
                
                <div className="mb-4">
                  <label className="block text-[#ccc5b9] text-sm mb-2">차단할 날짜 선택</label>
                  <DatePicker
                    selected={null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const dateStr = date.toISOString().split('T')[0]
                        const exists = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr)
                        if (!exists) {
                          setSelectedDates([...selectedDates, date])
                        }
                      }
                    }}
                    inline
                    locale={ko}
                    minDate={new Date()}
                    highlightDates={selectedDates}
                    excludeDates={allUnavailableDates}
                    calendarClassName="admin-datepicker"
                  />
                </div>

                {selectedDates.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-[#ccc5b9] text-sm mb-2">
                      선택된 날짜 ({selectedDates.length}개)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates
                        .sort((a, b) => a.getTime() - b.getTime())
                        .map((date, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#7c8d4c]/20 text-[#7c8d4c] text-sm rounded"
                          >
                            {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            <button
                              onClick={() => setSelectedDates(prev => prev.filter((_, i) => i !== index))}
                              className="hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-[#ccc5b9] text-sm mb-2">차단 사유 (선택)</label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="예: 휴관, 내부 행사"
                    className="w-full bg-[#111311] border border-[#7c8d4c]/30 text-[#f8f4e3] px-4 py-2 rounded-lg focus:outline-none focus:border-[#7c8d4c]"
                  />
                </div>

                <button
                  onClick={handleBlockDates}
                  disabled={selectedDates.length === 0 || isBlocking}
                  className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  {isBlocking ? '처리 중...' : `${selectedDates.length}개 날짜 차단`}
                </button>
              </div>

              {/* 차단된 날짜 목록 */}
              <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
                <h4 className="text-[#f8f4e3] font-medium mb-4">차단된 날짜 목록</h4>
                
                {blockedDates.length === 0 ? (
                  <div className="text-center py-8">
                    <Ban className="w-12 h-12 text-[#7c8d4c]/30 mx-auto mb-4" />
                    <p className="text-[#ccc5b9]">차단된 날짜가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {blockedDates
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((blocked) => (
                        <div
                          key={blocked.id}
                          className="flex items-center justify-between p-3 bg-[#111311] rounded-lg"
                        >
                          <div>
                            <span className="text-[#f8f4e3]">
                              {new Date(blocked.date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </span>
                            {blocked.reason && (
                              <span className="text-[#ccc5b9] text-sm ml-2">
                                - {blocked.reason}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleUnblockDate(blocked.id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="차단 해제"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'notices' && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg text-[#f8f4e3]">공지사항 목록</h3>
                <p className="text-[#ccc5b9] text-sm mt-1">전체 {noticeTotal}건</p>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#7c8d4c] text-[#f8f4e3] rounded-lg hover:bg-[#6a7a40] transition-colors"
              >
                <Plus className="w-4 h-4" />
                공지사항 등록
              </button>
            </div>

            {loading ? (
              <div className="text-[#ccc5b9] text-center py-12">로딩 중...</div>
            ) : notices.length === 0 ? (
              <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-12 text-center">
                <Bell className="w-12 h-12 text-[#7c8d4c]/50 mx-auto mb-4" />
                <p className="text-[#ccc5b9] mb-4">등록된 공지사항이 없습니다.</p>
                <button
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="text-[#7c8d4c] hover:text-[#d4af37] transition-colors"
                >
                  첫 공지사항을 등록해보세요
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg overflow-hidden">
                  <table className="w-full">
                     <thead>
                       <tr className="border-b border-[#7c8d4c]/20">
                         <th className="text-left text-[#ccc5b9] text-sm font-medium px-6 py-4">제목</th>
                         <th className="text-center text-[#ccc5b9] text-sm font-medium px-4 py-4 hidden md:table-cell">첨부</th>
                         <th className="text-center text-[#ccc5b9] text-sm font-medium px-4 py-4 hidden md:table-cell">메인 노출</th>
                         <th className="text-left text-[#ccc5b9] text-sm font-medium px-6 py-4 hidden md:table-cell">등록일</th>
                         <th className="text-right text-[#ccc5b9] text-sm font-medium px-6 py-4">관리</th>
                       </tr>
                     </thead>
                     <tbody>
                       {notices.map((notice) => (
                         <tr key={notice.id} className="border-b border-[#7c8d4c]/10 last:border-b-0">
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                               <span className="text-[#f8f4e3] font-medium">{notice.title}</span>
                               {notice.isFeatured && (
                                 <span className="px-1.5 py-0.5 text-xs bg-[#d4af37]/20 text-[#d4af37] rounded">메인</span>
                               )}
                             </div>
                           </td>
                           <td className="px-4 py-4 hidden md:table-cell text-center">
                             {notice.attachments.length > 0 ? (
                               <span className="inline-flex items-center gap-1 text-[#7c8d4c] text-sm">
                                 <Paperclip className="w-3 h-3" />
                                 {notice.attachments.length}
                               </span>
                             ) : (
                               <span className="text-[#ccc5b9]/40 text-sm">-</span>
                             )}
                           </td>
                           <td className="px-4 py-4 hidden md:table-cell text-center">
                             <button
                               onClick={() => handleToggleFeatured(notice)}
                               title={notice.isFeatured ? '메인 노출 해제' : '신진 작가 공모로 메인 노출'}
                               className={`p-1.5 rounded-lg transition-colors ${
                                 notice.isFeatured
                                   ? 'text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20'
                                   : 'text-[#ccc5b9]/40 hover:text-[#d4af37] hover:bg-[#d4af37]/10'
                               }`}
                             >
                               <Star className={`w-4 h-4 ${notice.isFeatured ? 'fill-[#d4af37]' : ''}`} />
                             </button>
                           </td>
                           <td className="text-[#ccc5b9] text-sm px-6 py-4 hidden md:table-cell">
                             {formatDate(notice.createdAt)}
                           </td>
                           <td className="px-6 py-4">
                             <div className="flex justify-end gap-2">
                               <button
                                 onClick={() => handleEditNotice(notice)}
                                 className="p-2 text-[#7c8d4c] hover:bg-[#7c8d4c]/10 rounded-lg transition-colors"
                                 title="수정"
                               >
                                 <Pencil className="w-4 h-4" />
                               </button>
                               <button
                                 onClick={() => handleDeleteNotice(notice.id)}
                                 disabled={deleting === notice.id}
                                 className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                 title="삭제"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>

                {noticeTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => { fetchNotices(noticePage - 1); setNoticePage(noticePage - 1) }}
                      disabled={noticePage <= 1}
                      className="px-3 py-1.5 text-sm border border-[#7c8d4c]/30 text-[#ccc5b9] rounded hover:bg-[#7c8d4c]/10 transition-colors disabled:opacity-30"
                    >
                      이전
                    </button>
                    <span className="text-[#ccc5b9] text-sm">{noticePage} / {noticeTotalPages}</span>
                    <button
                      onClick={() => { fetchNotices(noticePage + 1); setNoticePage(noticePage + 1) }}
                      disabled={noticePage >= noticeTotalPages}
                      className="px-3 py-1.5 text-sm border border-[#7c8d4c]/30 text-[#ccc5b9] rounded hover:bg-[#7c8d4c]/10 transition-colors disabled:opacity-30"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* 전시회 등록/수정 모달 */}
      <ExhibitionModal
        isOpen={isExhibitionModalOpen}
        onClose={handleExhibitionModalClose}
        onSuccess={handleExhibitionModalSuccess}
        editingExhibition={editingExhibition}
        artists={artists}
      />

      {/* 작가 등록/수정 모달 */}
      <ArtistModal
        isOpen={isArtistModalOpen}
        onClose={handleArtistModalClose}
        onSuccess={handleArtistModalSuccess}
        editingArtist={editingArtist}
      />

      <HomeImageModal
        isOpen={isHomeImageModalOpen}
        onClose={handleHomeImageModalClose}
        onSuccess={handleHomeImageModalSuccess}
        editingImage={editingHomeImage}
      />

      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={handleNoticeModalClose}
        onSuccess={handleNoticeModalSuccess}
        editingNotice={editingNotice}
      />
    </div>
  )
}
