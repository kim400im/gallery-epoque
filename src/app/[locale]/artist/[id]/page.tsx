"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import Link from 'next/link';

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
        if (response.ok) {
          const data = await response.json();
          setArtist(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch artist:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [artistId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111311]">
        <Navigation />
        <div className="pt-32 px-8 md:px-24 flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-[#111311]">
        <Navigation />
        <div className="pt-32 px-8 md:px-24 pb-16">
          <p className="text-[#ccc5b9] mb-8">{t('notFound')}</p>
          <Link
            href={`/${locale}/artist`}
            className="inline-flex items-center text-[#c9a227] hover:text-[#f8f4e3] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = artist.images && artist.images.length > 0;

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      <div className="pt-32 px-8 md:px-24 pb-16">
        <Link
          href={`/${locale}/artist`}
          className="inline-flex items-center text-[#c9a227] hover:text-[#f8f4e3] transition-colors mb-8"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToList')}
        </Link>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {hasImages && (
            <div className="flex gap-4 flex-shrink-0">
              {artist.images!.map((img) => (
                <div key={img.id} className="w-48 md:w-64">
                  <img
                    src={img.imageUrl}
                    alt={artist.name}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end">
            <h1 className="text-4xl md:text-6xl font-serif text-[#f8f4e3]">
              {artist.name}
            </h1>
          </div>
        </div>

        <div className="space-y-12">
          {/* Biography Section */}
          <section>
            <h2 className="text-2xl font-serif text-[#c9a227] mb-4 border-b border-[#333] pb-2">
              {t('biography')}
            </h2>
            {artist.biography ? (
              <div className="text-[#ccc5b9] whitespace-pre-wrap leading-relaxed">
                {artist.biography}
              </div>
            ) : (
              <p className="text-[#666]">{t('noBiography')}</p>
            )}
          </section>

          {/* Introduction Section */}
          <section>
            <h2 className="text-2xl font-serif text-[#c9a227] mb-4 border-b border-[#333] pb-2">
              {t('introduction')}
            </h2>
            {artist.introduction ? (
              <div className="text-[#ccc5b9] whitespace-pre-wrap leading-relaxed">
                {artist.introduction}
              </div>
            ) : (
              <p className="text-[#666]">{t('noIntroduction')}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
