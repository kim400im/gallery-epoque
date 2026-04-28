"use client";

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '@/app/components/Navigation';
import ShareButton from '@/app/components/ShareButton';
import ImageModal from '@/app/components/ImageModal';
import ArtistInfoDialog from '@/app/components/ArtistInfoDialog';

type ExhibitionImage = {
  id: string;
  imageUrl: string;
  description: string | null;
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

export default function ExhibitionDetailClient({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const te = useTranslations('exhibition');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistDialogOpen, setArtistDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchExhibition() {
      try {
        const response = await fetch(`/api/exhibitions/${id}`);
        if (!response.ok) {
          setError(response.status === 404 ? te('notFound') : te('loadError'));
          return;
        }
        setExhibition(await response.json());
      } catch (err) {
        console.error('Failed to fetch exhibition:', err);
        setError(te('loadError'));
      } finally {
        setLoading(false);
      }
    }

    fetchExhibition();
  }, [id, te]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const allImages = exhibition ? [exhibition.imageUrl, ...exhibition.images.map((img) => img.imageUrl)] : [];

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="ge-page">
        <Navigation />
        <div className="ge-container ge-page-pad flex items-center justify-center">
          <p className="text-lg text-[var(--color-fg-muted)]">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="ge-page">
        <Navigation />
        <div className="ge-container ge-page-pad">
          <Link href="/exhibition/past" className="mb-8 inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:text-[var(--color-gold)]">
            <ArrowLeft className="h-5 w-5" />
            <span>{tc('backToList')}</span>
          </Link>
          <p className="text-lg text-[var(--color-fg-muted)]">{error || te('notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ge-page">
      <Navigation />

      <main className="ge-container ge-page-pad">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 flex items-center justify-between"
        >
          <Link href="/exhibition/past" className="inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:text-[var(--color-gold)]">
            <ArrowLeft className="h-5 w-5" />
            <span>{tc('backToList')}</span>
          </Link>
          <ShareButton />
        </motion.div>

        <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="group ge-art-mat relative cursor-pointer"
            onClick={() => openModal(0)}
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img src={exhibition.imageUrl} alt={exhibition.title} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-3 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <span className="bg-[var(--color-green-900)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {tc('clickToZoom')}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="flex flex-col justify-center"
          >
            <p className="ge-kicker mb-4">Exhibition</p>
            <h1 className="ge-title mb-8">{exhibition.title}</h1>

            {exhibition.artists.length > 0 && (
              <div className="mb-5 flex items-center gap-3 text-[var(--color-gold)]">
                <User className="h-5 w-5 flex-shrink-0" />
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {exhibition.artists.map((ea, index) => (
                    <span key={ea.id}>
                      <button
                        onClick={() => {
                          setSelectedArtist(ea.artist);
                          setArtistDialogOpen(true);
                        }}
                        className="text-lg font-medium underline decoration-[var(--color-gold)]/50 underline-offset-4 transition-colors hover:text-[var(--color-primary)]"
                      >
                        {ea.artist.name}
                      </button>
                      {index < exhibition.artists.length - 1 && <span>, </span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 flex items-center gap-3 text-[var(--color-fg-muted)]">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}</span>
            </div>

            <div className="mb-8 h-px w-16 bg-[var(--color-gold)]" />

            {exhibition.description && (
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--color-fg-muted)]">
                {exhibition.description}
              </p>
            )}
          </motion.div>
        </div>

        {exhibition.images.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
          >
            <h2 className="mb-8 font-[var(--font-display)] text-4xl font-light text-[var(--color-ink)]">
              {te('exhibitionGallery')}
            </h2>

            <div className="mx-auto flex max-w-3xl flex-col items-center gap-16">
              {exhibition.images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.06 * Math.min(index, 5) }}
                  className="w-full"
                >
                  <div className="group ge-art-mat cursor-pointer" onClick={() => openModal(index + 1)}>
                    <img src={image.imageUrl} alt={`${exhibition.title} - ${index + 1}`} className="h-auto w-full object-contain" />
                  </div>
                  {image.description && (
                    <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-[var(--color-fg-muted)]">
                      {image.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <ImageModal
        images={allImages}
        currentIndex={currentImageIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPrev={goToPrevImage}
        onNext={goToNextImage}
      />

      <ArtistInfoDialog artist={selectedArtist} isOpen={artistDialogOpen} onClose={() => setArtistDialogOpen(false)} />
    </div>
  );
}
