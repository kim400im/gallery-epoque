"use client";

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '@/app/components/Navigation';

type Exhibition = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  startDate: string;
  endDate: string;
};

type Mode = 'current' | 'past' | 'upcoming';

const emptyMessageKey = {
  current: 'noCurrentExhibition',
  past: 'noPastExhibition',
  upcoming: 'noUpcomingExhibition',
} as const;

const titleKey = {
  current: 'currentExhibition',
  past: 'pastExhibition',
  upcoming: 'upcomingExhibition',
} as const;

const kicker = {
  current: 'Now showing',
  past: 'Archive',
  upcoming: 'Next',
} as const;

export default function ExhibitionListingPage({ mode }: { mode: Mode }) {
  const t = useTranslations('nav');
  const te = useTranslations('exhibition');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExhibitions() {
      try {
        const response = await fetch('/api/exhibitions');
        if (!response.ok) return;

        const data: Exhibition[] = await response.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = data.filter((exhibition) => {
          const startDate = new Date(exhibition.startDate);
          const endDate = new Date(exhibition.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);

          if (mode === 'current') return startDate <= today && today <= endDate;
          if (mode === 'upcoming') return startDate > today;
          return endDate < today;
        });

        filtered.sort((a, b) => {
          const dateA = new Date(mode === 'past' ? a.endDate : a.startDate).getTime();
          const dateB = new Date(mode === 'past' ? b.endDate : b.startDate).getTime();
          return mode === 'past' ? dateB - dateA : dateA - dateB;
        });

        setExhibitions(filtered);
      } catch (error) {
        console.error('Failed to fetch exhibitions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExhibitions();
  }, [mode]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="ge-page">
      <Navigation />
      <main className="ge-container ge-page-pad">
        <div className="mb-12 max-w-3xl">
          <p className="ge-kicker mb-4">{kicker[mode]}</p>
          <h1 className="ge-title">{t(titleKey[mode])}</h1>
        </div>

        {loading ? (
          <p className="border-y border-[var(--color-border)] py-16 text-center text-[var(--color-fg-muted)]">{tc('loading')}</p>
        ) : exhibitions.length === 0 ? (
          <p className="ge-lead border-y border-[var(--color-border)] py-16 text-center">{te(emptyMessageKey[mode])}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((exhibition) => (
              <Link key={exhibition.id} href={`/exhibition/${exhibition.id}`} className="group block">
                <article className="ge-card overflow-hidden">
                  <div className="ge-art-mat">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={exhibition.imageUrl} alt={exhibition.title} className="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="mb-3 font-mono text-xs text-[var(--color-fg-muted)]">
                      {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                    </p>
                    <h2 className="font-[var(--font-display)] text-2xl font-normal italic leading-tight text-[var(--color-ink)]">
                      {exhibition.title}
                    </h2>
                    {exhibition.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--color-fg-muted)]">{exhibition.description}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
