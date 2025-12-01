"use client";

import { useTranslations } from 'next-intl';
import Navigation from '@/app/components/Navigation';

export default function ArtistPage() {
  const t = useTranslations('nav');

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      <div className="pt-32 px-8 md:px-24">
        <h1 className="text-4xl md:text-6xl font-serif text-[#f8f4e3] mb-8">
          {t('artistList')}
        </h1>
        <p className="text-[#ccc5b9]">Coming soon...</p>
      </div>
    </div>
  );
}
