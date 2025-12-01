"use client";

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '../components/Navigation';

// 3D Scene - 시안 2: Particle Wave
import ParticleWave from '../components/three/Scene2_ParticleWave';

// 목업 전시 데이터
const currentExhibitions = [
  {
    id: 1,
    title: "빛의 형상",
    artist: "김서연",
    date: "2024.12.01 - 2025.01.15",
    image: "https://picsum.photos/seed/exhibit1/600/800"
  },
  {
    id: 2,
    title: "Urban Fragments",
    artist: "이정민",
    date: "2024.12.10 - 2025.01.20",
    image: "https://picsum.photos/seed/exhibit2/600/800"
  },
];

const pastExhibitions = [
  {
    id: 1,
    title: "시간의 결",
    artist: "박현우",
    date: "2024.10.01 - 2024.11.30",
    image: "https://picsum.photos/seed/past1/600/800"
  },
  {
    id: 2,
    title: "Silent Echo",
    artist: "최유나",
    date: "2024.09.15 - 2024.10.31",
    image: "https://picsum.photos/seed/past2/600/800"
  },
  {
    id: 3,
    title: "자연의 숨결",
    artist: "정다은",
    date: "2024.08.01 - 2024.09.10",
    image: "https://picsum.photos/seed/past3/600/800"
  },
];

const upcomingExhibitions = [
  {
    id: 1,
    title: "미래의 기억",
    artist: "한소희",
    date: "2025.02.01 - 2025.03.15",
    image: "https://picsum.photos/seed/upcoming1/600/800"
  },
  {
    id: 2,
    title: "Boundaries",
    artist: "오민준",
    date: "2025.03.20 - 2025.04.30",
    image: "https://picsum.photos/seed/upcoming2/600/800"
  },
];

// 전시 카드 컴포넌트
function ExhibitionCard({ exhibition, index }: { exhibition: typeof currentExhibitions[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-4">
        <img
          src={exhibition.image}
          alt={exhibition.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[#d4af37] text-sm mb-2">{exhibition.date}</p>
          <h3 className="text-[#f8f4e3] text-xl font-[var(--font-cormorant)] font-medium mb-1">
            {exhibition.title}
          </h3>
          <p className="text-[#ccc5b9] text-sm">{exhibition.artist}</p>
        </div>
      </div>
    </motion.div>
  );
}

// 섹션 컴포넌트
function ExhibitionSection({ 
  title, 
  exhibitions, 
  link 
}: { 
  title: string; 
  exhibitions: typeof currentExhibitions;
  link: string;
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exhibitions.map((exhibition, index) => (
          <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={index} />
        ))}
      </div>
    </section>
  );
}

export default function GalleryLanding() {
  const t = useTranslations();

  return (
    <div className="w-full bg-[#111311]">
      {/* 히어로 섹션 */}
      <div className="h-screen relative overflow-hidden">
        {/* 3D 배경 */}
        <div className="absolute inset-0 z-0">
          <ParticleWave />
        </div>

        {/* 네비게이션 */}
        <Navigation />

        {/* 메인 콘텐츠 */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-8 md:px-24 pointer-events-none z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h2 className="text-[#ccc5b9] text-lg md:text-xl font-light tracking-[0.3em] mb-4 uppercase">
              {t('home.subtitle')}
            </h2>
            <h1 className="text-5xl md:text-8xl font-[var(--font-cormorant)] font-light text-[#7c8d4c] leading-tight mb-8 drop-shadow-xl">
              {t('home.title')} {t('home.titleHighlight')}
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

        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#111311]/90 via-transparent to-transparent pointer-events-none z-0" />

        {/* 스크롤 인디케이터 */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-[#7c8d4c]" />
        </motion.div>
      </div>

      {/* 현재 전시 섹션 */}
      <ExhibitionSection 
        title="Current Exhibition" 
        exhibitions={currentExhibitions}
        link="/exhibition/current"
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
      />

      {/* 푸터 */}
      <footer className="py-16 px-8 md:px-24 border-t border-[#7c8d4c]/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[#7c8d4c] font-[var(--font-cormorant)] text-2xl">
            Gallery Époque
          </div>
          <div className="text-[#ccc5b9] text-sm text-center md:text-right">
            <p>서울특별시 종로구 삼청로 123-1</p>
            <p className="mt-1">Tel. 02-723-3420 | galleryepoque@naver.com</p>
          </div>
        </div>
        <div className="mt-8 text-center text-[#7c8d4c]/50 text-xs">
          © 2024 Gallery Époque. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
