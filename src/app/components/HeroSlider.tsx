"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type SlideData = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  date?: string;
};

export type TransitionEffect = 'slide' | 'fade' | 'zoom';

type HeroSliderProps = {
  slides: SlideData[];
  effect?: TransitionEffect;
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
};

// 슬라이드 효과 variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1,
  }),
};

// 페이드 효과 variants
const fadeVariants = {
  enter: () => ({
    opacity: 0,
  }),
  center: {
    opacity: 1,
  },
  exit: () => ({
    opacity: 0,
  }),
};

// 줌 효과 variants
const zoomVariants = {
  enter: () => ({
    opacity: 0,
    scale: 1.2,
  }),
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: () => ({
    opacity: 0,
    scale: 0.8,
  }),
};

const getVariants = (effect: TransitionEffect) => {
  switch (effect) {
    case 'fade':
      return fadeVariants;
    case 'zoom':
      return zoomVariants;
    case 'slide':
    default:
      return slideVariants;
  }
};

const getTransition = (effect: TransitionEffect) => {
  switch (effect) {
    case 'fade':
      return { duration: 0.8, ease: 'easeInOut' as const };
    case 'zoom':
      return { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };
    case 'slide':
    default:
      return { 
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      };
  }
};

export default function HeroSlider({
  slides,
  effect = 'slide',
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
}: HeroSliderProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

  const paginate = useCallback((newDirection: number) => {
    setCurrentIndex(([prevIndex]) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = slides.length - 1;
      if (nextIndex >= slides.length) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  }, [slides.length]);

  const goToSlide = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setCurrentIndex([index, newDirection]);
  };

  // 자동 재생
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      paginate(1);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, paginate, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-full bg-[#111311] flex items-center justify-center">
        <p className="text-[#ccc5b9]">No slides available</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  const variants = getVariants(effect);
  const transition = getTransition(effect);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#111311]">
      {/* 슬라이드 이미지 */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
        >
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
          >
            {/* 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#111311]/80 via-[#111311]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111311]/60 via-transparent to-transparent" />
            {/* 상단 네비게이션 영역 그라디언트 강화 */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#111311]/70 to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 슬라이드 정보 오버레이 */}
      <div className="absolute bottom-24 left-8 md:left-24 z-20 max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {currentSlide.date && (
              <p className="text-[#d4af37] text-sm md:text-base tracking-wider mb-2">
                {currentSlide.date}
              </p>
            )}
            {currentSlide.subtitle && (
              <p className="text-[#ccc5b9] text-sm md:text-base tracking-widest uppercase mb-2">
                {currentSlide.subtitle}
              </p>
            )}
            <h2 className="text-[#f8f4e3] text-2xl md:text-4xl lg:text-5xl font-[var(--font-cormorant)] font-light leading-tight">
              {currentSlide.title}
            </h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 좌우 화살표 */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-[#111311]/50 backdrop-blur-sm border border-[#7c8d4c]/30 text-[#f8f4e3] hover:bg-[#7c8d4c]/30 hover:border-[#7c8d4c] transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-[#111311]/50 backdrop-blur-sm border border-[#7c8d4c]/30 text-[#f8f4e3] hover:bg-[#7c8d4c]/30 hover:border-[#7c8d4c] transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* 도트 네비게이션 */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#d4af37] w-6 md:w-8'
                  : 'bg-[#f8f4e3]/40 hover:bg-[#f8f4e3]/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* 슬라이드 카운터 */}
      <div className="absolute bottom-8 right-8 md:right-24 z-20 text-[#ccc5b9] text-sm tracking-wider">
        <span className="text-[#d4af37] text-lg font-medium">{String(currentIndex + 1).padStart(2, '0')}</span>
        <span className="mx-2">/</span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
