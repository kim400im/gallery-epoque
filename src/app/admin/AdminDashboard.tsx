'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Users, Image as ImageIcon, GripVertical } from 'lucide-react'
import LogoutButton from './LogoutButton'
import ExhibitionModal from './ExhibitionModal'
import ArtistModal from './ArtistModal'
import HomeImageModal from './HomeImageModal'

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
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [editingHomeImage, setEditingHomeImage] = useState<HomeImage | null>(null)
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [homeImages, setHomeImages] = useState<HomeImage[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'exhibitions' | 'artists' | 'homeImages'>('exhibitions')

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

  useEffect(() => {
    Promise.all([fetchExhibitions(), fetchArtists(), fetchHomeImages()]).finally(() => setLoading(false))
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
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg p-6">
            <h3 className="text-[#ccc5b9] text-sm mb-2">예약 요청</h3>
            <p className="text-[#f8f4e3] text-2xl font-semibold">0건</p>
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
                    {artists.map((artist) => (
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

      {/* 홈 이미지 등록/수정 모달 */}
      <HomeImageModal
        isOpen={isHomeImageModalOpen}
        onClose={handleHomeImageModalClose}
        onSuccess={handleHomeImageModalSuccess}
        editingImage={editingHomeImage}
      />
    </div>
  )
}
