"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '../components/Navigation';
import HeroSlider, { SlideData, TransitionEffect } from '../components/HeroSlider';

// 슬라이더 효과 설정 (여기서 변경 가능: 'slide' | 'fade' | 'zoom')
const SLIDER_EFFECT: TransitionEffect = 'fade';

type Exhibition = {
  id: string
  title: string
  imageUrl: string
  startDate: string
  endDate: string
}

// 전시 카드 컴포넌트
function ExhibitionCard({ exhibition, index }: { exhibition: Exhibition, index: number }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace('.', '.');
  };

  const dateRange = exhibition.startDate && exhibition.endDate 
    ? `${formatDate(exhibition.startDate)} - ${formatDate(exhibition.endDate)}`
    : '';

  return (
    <Link href={`/exhibition/${exhibition.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="group cursor-pointer"
      >
        <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-4">
          <img
            src={exhibition.imageUrl}
            alt={exhibition.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-[#d4af37] text-sm mb-2">{dateRange}</p>
            <h3 className="text-[#f8f4e3] text-xl font-[var(--font-cormorant)] font-medium mb-1">
              {exhibition.title}
            </h3>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// 섹션 컴포넌트
function ExhibitionSection({ 
  title, 
  exhibitions, 
  link,
  loading
}: { 
  title: string; 
  exhibitions: Exhibition[];
  link: string;
  loading: boolean;
}) {
  return (
    <section className="py-20 px-8 md:px-24">
      <div className="flex justify-between items-center mb-12">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[var(--font-cormorant)] text-[#f8f4e3]"
        >
          {title}
        </motion.h2>
        <Link href={link}>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-[#7c8d4c] text-sm tracking-wider hover:text-[#d4af37] transition-colors flex items-center gap-2"
          >
            VIEW ALL <ArrowRight className="w-4 h-4" />
          </motion.span>
        </Link>
      </div>
      
      {loading ? (
        <div className="text-[#ccc5b9] text-center py-12">Loading...</div>
      ) : exhibitions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center py-16"
        >
          <p className="text-[#ccc5b9] text-lg font-[var(--font-cormorant)] tracking-wider">
            Coming Soon
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibitions.slice(0, 3).map((exhibition, index) => (
            <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function GalleryLanding() {
  const t = useTranslations();
  const [currentExhibitions, setCurrentExhibitions] = useState<Exhibition[]>([]);
  const [pastExhibitions, setPastExhibitions] = useState<Exhibition[]>([]);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<Exhibition[]>([]);
  const [homeSlides, setHomeSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 홈 이미지 가져오기
    const fetchHomeImages = async () => {
      try {
        const response = await fetch('/api/home-images');
        if (response.ok) {
          const data: SlideData[] = await response.json();
          setHomeSlides(data);
        }
      } catch (error) {
        console.error('Failed to fetch home images:', error);
      }
    };

    fetchHomeImages();
  }, []);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const response = await fetch('/api/exhibitions');
        if (response.ok) {
          const data: Exhibition[] = await response.json();
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const current: Exhibition[] = [];
          const past: Exhibition[] = [];
          const upcoming: Exhibition[] = [];

          data.forEach(exhibition => {
            if (!exhibition.startDate || !exhibition.endDate) {
              // 날짜가 없으면 과거로 분류
              past.push(exhibition);
              return;
            }

            const startDate = new Date(exhibition.startDate);
            const endDate = new Date(exhibition.endDate);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            if (startDate > today) {
              upcoming.push(exhibition);
            } else if (endDate < today) {
              past.push(exhibition);
            } else {
              current.push(exhibition);
            }
          });

          // 과거 전시: 종료일 기준 내림차순 정렬 (최신 종료 전시가 먼저)
          past.sort((a, b) => {
            const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
            const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
            return dateB - dateA;
          });

          // 예정 전시: 시작일 기준 오름차순 정렬 (가장 빨리 시작하는 전시가 먼저)
          upcoming.sort((a, b) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dateA - dateB;
          });

          setCurrentExhibitions(current);
          setPastExhibitions(past);
          setUpcomingExhibitions(upcoming);
        }
      } catch (error) {
        console.error('Failed to fetch exhibitions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  return (
    <div className="w-full bg-[#111311]">
      {/* 히어로 섹션 - 이미지 슬라이더 */}
      <div className="h-screen relative overflow-hidden">
        {/* 슬라이더 배경 */}
        <div className="absolute inset-0 z-0">
          <HeroSlider 
            slides={homeSlides} 
            effect={SLIDER_EFFECT}
            autoPlay={true}
            interval={5000}
            showArrows={true}
            showDots={true}
          />
        </div>

        {/* 네비게이션 */}
        <Navigation />

        {/* 메인 콘텐츠 - 갤러리 타이틀 */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-8 md:px-24 pointer-events-none z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h2 className="text-[#ccc5b9] text-lg md:text-xl font-light tracking-[0.3em] mb-4 uppercase">
              {t('home.subtitle')}
            </h2>
            <h1 className="text-5xl md:text-8xl font-[var(--font-cormorant)] font-light text-[#f8f4e3] leading-tight mb-8 drop-shadow-xl">
              <span className="text-[#7c8d4c]">{t('home.title')}</span> {t('home.titleHighlight')}
            </h1>
            
            <div className="pointer-events-auto inline-block">
                <Link href="/book">
                  <button className="group flex items-center gap-4 bg-[#7c8d4c] text-[#f8f4e3] px-8 py-4 rounded-full text-lg font-medium hover:bg-[#6a7a40] transition-all shadow-[0_0_25px_rgba(124,141,76,0.3)]">
                      {t('home.cta')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
            </div>
          </motion.div>
        </div>

        {/* 스크롤 인디케이터 */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-[#d4af37]" />
        </motion.div>
      </div>

      {/* 현재 전시 섹션 */}
      <ExhibitionSection 
        title="Current Exhibition" 
        exhibitions={currentExhibitions}
        link="/exhibition/current"
        loading={loading}
      />

      {/* 구분선 */}
      <div className="px-8 md:px-24">
        <div className="border-t border-[#7c8d4c]/20" />
      </div>

      {/* 예정 전시 섹션 */}
      <ExhibitionSection 
        title="Upcoming Exhibition" 
        exhibitions={upcomingExhibitions}
        link="/exhibition/upcoming"
        loading={loading}
      />

      {/* 구분선 */}
      <div className="px-8 md:px-24">
        <div className="border-t border-[#7c8d4c]/20" />
      </div>

      {/* 지난 전시 섹션 */}
      <ExhibitionSection 
        title="Past Exhibition" 
        exhibitions={pastExhibitions}
        link="/exhibition/past"
        loading={loading}
      />

      {/* 푸터 */}
      <footer className="py-16 px-8 md:px-24 border-t border-[#7c8d4c]/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[#7c8d4c] font-[var(--font-cormorant)] text-2xl">
            Gallery Epoque
          </div>
          <div className="text-[#ccc5b9] text-sm text-center md:text-right">
            <p>서울특별시 종로구 삼청로 123-1</p>
            <p className="mt-1">Tel. 02-723-3420 | galleryepoque@naver.com</p>
          </div>
        </div>
        <div className="mt-8 text-center text-[#7c8d4c]/50 text-xs">
          © 2024 Gallery Epoque. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
