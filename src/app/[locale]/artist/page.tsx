"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/app/components/Navigation';

interface Artist {
  id: string;
  name: string;
  biography: string | null;
  introduction: string | null;
}

export default function ArtistPage() {
  const t = useTranslations('artist');
  const params = useParams();
  const locale = params.locale as string;
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const response = await fetch('/api/artists');
        if (response.ok) setArtists(await response.json());
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  return (
    <div className="ge-page">
      <Navigation />
      <main className="ge-container ge-page-pad">
        <div className="mb-12 max-w-3xl">
          <p className="ge-kicker mb-4">Our Roster</p>
          <h1 className="ge-title">{t('pageTitle')}</h1>
          <p className="ge-lead mt-5">Each artist is introduced through a considered body of work and a precise point of view.</p>
        </div>

        {loading ? (
          <p className="border-y border-[var(--color-border)] py-16 text-center text-[var(--color-fg-muted)]">Loading...</p>
        ) : artists.length === 0 ? (
          <p className="ge-lead border-y border-[var(--color-border)] py-16 text-center">{t('noArtists')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {artists.map((artist) => (
              <Link key={artist.id} href={`/${locale}/artist/${artist.id}`} className="ge-card group block p-8">
                <p className="ge-kicker mb-4">Artist</p>
                <h2 className="font-[var(--font-display)] text-4xl font-light text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-primary)]">
                  {artist.name}
                </h2>
                {artist.introduction && (
                  <p className="mt-5 line-clamp-3 text-sm leading-7 text-[var(--color-fg-muted)]">{artist.introduction}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
