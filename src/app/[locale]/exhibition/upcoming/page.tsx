"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      <div className="pt-32 px-8 md:px-24">
        <h1 className="text-4xl md:text-6xl font-serif text-[#f8f4e3] mb-8">
          {t('upcomingExhibition')}
        </h1>
        
        {loading ? (
          <p className="text-[#ccc5b9]">Loading...</p>
        ) : exhibitions.length === 0 ? (
          <p className="text-[#ccc5b9]">예정된 전시가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibitions.map((exhibition) => (
              <div
                key={exhibition.id}
                className="bg-[#1a1c1a] border border-[#7c8d4c]/20 rounded-lg overflow-hidden hover:border-[#7c8d4c]/50 transition-colors"
              >
                <img
                  src={exhibition.imageUrl}
                  alt={exhibition.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl text-[#f8f4e3] font-medium mb-2">
                    {exhibition.title}
                  </h2>
                  <p className="text-[#ccc5b9] text-sm">
                    {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
