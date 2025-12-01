"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Navigation from '../components/Navigation';

// 3D Scene - 시안 2: Particle Wave
import ParticleWave from '../components/three/Scene2_ParticleWave';

export default function GalleryLanding() {
  const t = useTranslations();

  return (
    <div className="w-full h-screen bg-[#111311] relative overflow-hidden">
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
    </div>
  );
}
