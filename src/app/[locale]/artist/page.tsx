"use client";

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
        if (response.ok) {
          const data = await response.json();
          setArtists(data);
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      <div className="pt-32 px-8 md:px-24 pb-16">
        <h1 className="text-4xl md:text-6xl font-serif text-[#f8f4e3] mb-12">
          {t('pageTitle')}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : artists.length === 0 ? (
          <p className="text-[#ccc5b9]">{t('noArtists')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/${locale}/artist/${artist.id}`}
                className="group block p-6 bg-[#1a1c1a] border border-[#333] rounded-lg hover:border-[#c9a227] transition-all duration-300"
              >
                <h2 className="text-2xl font-serif text-[#f8f4e3] group-hover:text-[#c9a227] transition-colors duration-300">
                  {artist.name}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
