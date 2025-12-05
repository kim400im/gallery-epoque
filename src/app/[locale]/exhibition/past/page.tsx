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

export default function PastExhibitionPage() {
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
          
          // 과거 전시: 종료일 < 오늘
          const pastExhibitions = data.filter(exhibition => {
            const endDate = new Date(exhibition.endDate);
            endDate.setHours(23, 59, 59, 999);
            return endDate < today;
          });
          
          setExhibitions(pastExhibitions);
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
          {t('pastExhibition')}
        </h1>
        
        {loading ? (
          <p className="text-[#ccc5b9]">Loading...</p>
        ) : exhibitions.length === 0 ? (
          <p className="text-[#ccc5b9]">지난 전시가 없습니다.</p>
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
