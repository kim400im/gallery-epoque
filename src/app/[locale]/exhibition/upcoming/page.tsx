"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '@/app/components/Navigation';

type Exhibition = {
  id: string
  title: string
  imageUrl: string
  startDate: string
  endDate: string
}

export default function UpcomingExhibitionPage() {
  const t = useTranslations('nav');
  const te = useTranslations('exhibition');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await fetch('/api/exhibitions');
        if (response.ok) {
          const data: Exhibition[] = await response.json();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // 예정 전시: 시작일 > 오늘
          const upcomingExhibitions = data.filter(exhibition => {
            const startDate = new Date(exhibition.startDate);
            startDate.setHours(0, 0, 0, 0);
            return startDate > today;
          });
          
          // 시작일 기준 오름차순 정렬 (가장 빨리 시작하는 전시가 먼저)
          upcomingExhibitions.sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dateA - dateB;
          });
          
          setExhibitions(upcomingExhibitions);
        }
      } catch (error) {
        console.error('Failed to fetch exhibitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      <div className="pt-32 pb-20 px-8 md:px-24">
        <h1 className="text-4xl md:text-6xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-12">
          {t('upcomingExhibition')}
        </h1>
        
        {loading ? (
          <p className="text-[#ccc5b9]">{tc('loading')}</p>
        ) : exhibitions.length === 0 ? (
          <p className="text-[#ccc5b9] text-lg">{te('noUpcomingExhibition')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibitions.map((exhibition) => (
              <Link
                key={exhibition.id}
                href={`/exhibition/${exhibition.id}`}
                className="group cursor-pointer block"
              >
                <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-4">
                  <img
                    src={exhibition.imageUrl}
                    alt={exhibition.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[#d4af37] text-sm mb-2">
                      {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                    </p>
                    <h2 className="text-[#f8f4e3] text-xl font-[var(--font-cormorant)] font-medium">
                      {exhibition.title}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
