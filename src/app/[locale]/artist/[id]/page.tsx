"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

interface ArtistImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

interface Artist {
  id: string;
  name: string;
  biography: string | null;
  introduction: string | null;
  images?: ArtistImage[];
}

export default function ArtistDetailPage() {
  const t = useTranslations('artist');
  const params = useParams();
  const locale = params.locale as string;
  const artistId = params.id as string;
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchArtist() {
      try {
        const response = await fetch(`/api/artists/${artistId}`);
        if (response.ok) setArtist(await response.json());
        else setError(true);
      } catch (err) {
        console.error('Failed to fetch artist:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [artistId]);

  const backLink = (
    <Link href={`/${locale}/artist`} className="mb-10 inline-flex items-center gap-2 text-[var(--color-primary)] transition-colors hover:text-[var(--color-gold)]">
      <ArrowLeft className="h-4 w-4" />
      {t('backToList')}
    </Link>
  );

  if (loading) {
    return (
      <div className="ge-page">
        <Navigation />
        <div className="ge-container ge-page-pad text-center text-[var(--color-fg-muted)]">Loading...</div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="ge-page">
        <Navigation />
        <main className="ge-container ge-page-pad">
          <p className="mb-8 text-[var(--color-fg-muted)]">{t('notFound')}</p>
          {backLink}
        </main>
      </div>
    );
  }

  const images = [...(artist.images || [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="ge-page">
      <Navigation />
      <main className="ge-container ge-page-pad">
        {backLink}

        <div className="mb-16 grid gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-end">
          {images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {images.map((img) => (
                <div key={img.id} className="ge-art-mat">
                  <img src={img.imageUrl} alt={artist.name} className="h-auto w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[var(--color-border)] bg-white p-12">
              <p className="ge-kicker">Artist profile</p>
            </div>
          )}
          <div>
            <p className="ge-kicker mb-4">Artist</p>
            <h1 className="ge-title">{artist.name}</h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="ge-card p-8">
            <h2 className="mb-5 border-b border-[var(--color-border)] pb-4 font-[var(--font-display)] text-3xl font-light text-[var(--color-ink)]">
              {t('biography')}
            </h2>
            <div className="whitespace-pre-wrap leading-relaxed text-[var(--color-fg-muted)]">
              {artist.biography || t('noBiography')}
            </div>
          </section>

          <section className="ge-card p-8">
            <h2 className="mb-5 border-b border-[var(--color-border)] pb-4 font-[var(--font-display)] text-3xl font-light text-[var(--color-ink)]">
              {t('introduction')}
            </h2>
            <div className="whitespace-pre-wrap leading-relaxed text-[var(--color-fg-muted)]">
              {artist.introduction || t('noIntroduction')}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
