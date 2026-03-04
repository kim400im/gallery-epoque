"use client";

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '@/app/components/Navigation';
import ShareButton from '@/app/components/ShareButton';
import ImageModal from '@/app/components/ImageModal';
import ArtistInfoDialog from '@/app/components/ArtistInfoDialog';

type ExhibitionImage = {
  id: string;
  imageUrl: string;
  displayOrder: number;
};

type Artist = {
  id: string;
  name: string;
  biography: string | null;
  introduction: string | null;
};

type ExhibitionArtist = {
  id: string;
  artistId: string;
  artist: Artist;
};

type Exhibition = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  startDate: string;
  endDate: string;
  artists: ExhibitionArtist[];
  images: ExhibitionImage[];
};

export default function ExhibitionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id } = use(params);
  const te = useTranslations('exhibition');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 이미지 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 작가 정보 팝업 상태
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistDialogOpen, setArtistDialogOpen] = useState(false);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        const response = await fetch(`/api/exhibitions/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError(te('notFound'));
          } else {
            setError(te('loadError'));
          }
          return;
        }
        const data = await response.json();
        setExhibition(data);
      } catch (err) {
        console.error('Failed to fetch exhibition:', err);
        setError(te('loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchExhibition();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 모든 이미지 (대표 이미지 + 추가 이미지)
  const allImages = exhibition 
    ? [exhibition.imageUrl, ...exhibition.images.map(img => img.imageUrl)]
    : [];

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  // 작가 정보 팝업 열기
  const openArtistDialog = (artist: Artist) => {
    setSelectedArtist(artist);
    setArtistDialogOpen(true);
  };

  // 작가 정보 팝업 닫기
  const closeArtistDialog = () => {
    setArtistDialogOpen(false);
    setSelectedArtist(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111311]">
        <Navigation />
        <div className="pt-32 px-8 md:px-24 flex items-center justify-center">
          <p className="text-[#ccc5b9] text-lg">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="min-h-screen bg-[#111311]">
        <Navigation />
        <div className="pt-32 px-8 md:px-24">
          <Link href="/exhibition/past" className="inline-flex items-center gap-2 text-[#7c8d4c] hover:text-[#d4af37] transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            <span>{tc('backToList')}</span>
          </Link>
          <p className="text-[#ccc5b9] text-lg">{error || te('notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      
      <div className="pt-32 pb-20 px-8 md:px-24">
        {/* 뒤로가기 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-12"
        >
          <Link href="/exhibition/past" className="inline-flex items-center gap-2 text-[#7c8d4c] hover:text-[#d4af37] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{tc('backToList')}</span>
          </Link>
          <ShareButton />
        </motion.div>

        {/* 메인 섹션: 대표 이미지 + 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* 대표 이미지 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openModal(0)}
          >
            <img
              src={exhibition.imageUrl}
              alt={exhibition.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm tracking-wider">
                {tc('clickToZoom')}
              </span>
            </div>
          </motion.div>

          {/* 전시 정보 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            {/* 전시 제목 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-6 leading-tight">
              {exhibition.title}
            </h1>

            {/* 작가명 - 클릭 가능 */}
            {exhibition.artists && exhibition.artists.length > 0 && (
              <div className="flex items-center gap-3 text-[#d4af37] mb-4">
                <User className="w-5 h-5 flex-shrink-0" />
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {exhibition.artists.map((ea, index) => (
                    <span key={ea.id}>
                      <button
                        onClick={() => openArtistDialog(ea.artist)}
                        className="text-lg font-medium hover:text-[#f8f4e3] transition-colors underline underline-offset-4 decoration-[#d4af37]/50 hover:decoration-[#f8f4e3]"
                      >
                        {ea.artist.name}
                      </button>
                      {index < exhibition.artists.length - 1 && (
                        <span className="text-[#d4af37]">, </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 전시 기간 */}
            <div className="flex items-center gap-3 text-[#ccc5b9] mb-8">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}</span>
            </div>

            {/* 구분선 */}
            <div className="w-16 h-px bg-[#7c8d4c]/50 mb-8" />

            {/* 전시 설명 */}
            {exhibition.description && (
              <p className="text-[#ccc5b9] text-lg leading-relaxed whitespace-pre-wrap">
                {exhibition.description}
              </p>
            )}
          </motion.div>
        </div>

        {/* 전시 이미지 갤러리 */}
        {exhibition.images.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-8">
              {te('exhibitionGallery')}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {exhibition.images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => openModal(index + 1)}
                >
                  <img
                    src={image.imageUrl}
                    alt={`${exhibition.title} - ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* 이미지 모달 */}
      <ImageModal
        images={allImages}
        currentIndex={currentImageIndex}
        isOpen={modalOpen}
        onClose={closeModal}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />

      {/* 작가 정보 팝업 */}
      <ArtistInfoDialog
        artist={selectedArtist}
        isOpen={artistDialogOpen}
        onClose={closeArtistDialog}
      />
    </div>
  );
}
