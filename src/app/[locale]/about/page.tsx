"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Navigation from '@/app/components/Navigation';

// 이미지 슬라이더 컴포넌트
function ImageSlider() {
  const t = useTranslations('about');
  const galleryImages = [
    {
      id: 1,
      src: "/images/gallery/out_02.png",
      alt: "Gallery Exterior",
      captionKey: "galleryExteriorCaption" as const
    },
    {
      id: 2,
      src: "/images/gallery/floor_2_02.jpg",
      alt: "Gallery Interior",
      captionKey: "floor2Caption" as const
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={galleryImages[currentIndex].src}
            alt={galleryImages[currentIndex].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#111311]/90 to-transparent p-8">
            <p className="text-[#f8f4e3] font-[var(--font-cormorant)] text-xl">
              {t(galleryImages[currentIndex].captionKey)}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#111311]/50 backdrop-blur-sm rounded-full flex items-center justify-center text-[#f8f4e3] hover:bg-[#7c8d4c] transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#111311]/50 backdrop-blur-sm rounded-full flex items-center justify-center text-[#f8f4e3] hover:bg-[#7c8d4c] transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {galleryImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-[#d4af37] w-6' : 'bg-[#f8f4e3]/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// 갤러리 통계 컴포넌트
function Stats() {
  const t = useTranslations('about');
  const stats = [
    { number: "20", labelKey: "statArea" as const },
    { number: "150+", labelKey: "statArtists" as const },
    { number: "50+", labelKey: "statExhibitions" as const },
    { number: "30,000+", labelKey: "statVisitors" as const },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="text-4xl md:text-5xl font-[var(--font-cormorant)] text-[#d4af37] mb-2">
            {stat.number}
          </div>
          <div className="text-[#ccc5b9] text-sm tracking-wider">
            {t(stat.labelKey)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// 썸네일 갤러리 이미지 데이터
const thumbnailImages = [
  { id: 1, src: "/images/gallery/out_01.jpg", alt: "gallery-1" },
  { id: 2, src: "/images/gallery/out_02.png", alt: "gallery-2" },
  { id: 3, src: "/images/gallery/floor_1_01.jpg", alt: "gallery-3" },
  { id: 4, src: "/images/gallery/floor_1_02.jpg", alt: "gallery-4" },
  { id: 5, src: "/images/gallery/floor_1_03.jpg", alt: "gallery-5" },
  { id: 6, src: "/images/gallery/floor_2_01.jpg", alt: "gallery-6" },
  { id: 7, src: "/images/gallery/floor_2_02.jpg", alt: "gallery-7" },
  { id: 8, src: "/images/gallery/floor_2_03.jpg", alt: "gallery-8" },
  { id: 9, src: "/images/gallery/floor_2_04.jpg", alt: "gallery-9" },
  { id: 10, src: "/images/gallery/step_01.jpg", alt: "gallery-10" },
];

// 썸네일 갤러리
function ThumbnailGallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {thumbnailImages.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="aspect-square overflow-hidden rounded-lg group cursor-pointer"
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  const t = useTranslations('about');
  const th = useTranslations('home');

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 md:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-6">
            {t('heroTitle')} <span className="text-[#7c8d4c]">{t('heroTitleHighlight')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#ccc5b9] font-light leading-relaxed whitespace-pre-line">
            {t('heroSubtitle')}
          </p>
        </motion.div>
      </section>

      {/* Main Image Slider */}
      <section className="px-8 md:px-24 pb-20">
        <ImageSlider />
      </section>

      {/* Introduction Text */}
      <section className="px-8 md:px-24 py-20 border-t border-[#7c8d4c]/20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-8">
              {t('sectionTitle')}<br />
              <span className="text-[#d4af37]">{t('sectionTitleHighlight')}</span>
            </h2>
            <div className="space-y-6 text-[#ccc5b9] leading-relaxed">
              <p>{t('introP1')}</p>
              <p>{t('introP2')}</p>
              <p>{t('introP3')}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="/images/gallery/floor_1_03.jpg"
              alt="Gallery Detail"
              className="w-full rounded-lg"
            />
            <div className="absolute -bottom-8 -left-8 bg-[#7c8d4c] p-8 rounded-lg max-w-xs hidden md:block">
              <p className="text-[#f8f4e3] font-[var(--font-cormorant)] text-xl italic">
                <span className="block">{t('motto1')}</span>
                <span className="block">{t('motto2')}</span>
              </p>
              <p className="text-[#f8f4e3]/70 text-sm mt-4">{t('mottoAttribution')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="px-8 md:px-24 py-20 border-t border-[#7c8d4c]/20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-12 text-center"
        >
          {t('facilitiesTitle')}
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {([
            {
              titleKey: "facility1Title" as const,
              descKey: "facility1Desc" as const,
              image: "/images/gallery/floor_1_01.jpg"
            },
            {
              titleKey: "facility2Title" as const,
              descKey: "facility2Desc" as const,
              image: "/images/gallery/floor_2_01.jpg"
            },
            {
              titleKey: "facility3Title" as const,
              descKey: "facility3Desc" as const,
              image: "/images/gallery/step_01.jpg"
            }
          ]).map((facility, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="overflow-hidden rounded-lg mb-6 aspect-[3/2]">
                <img
                  src={facility.image}
                  alt={t(facility.titleKey)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-[var(--font-cormorant)] text-[#d4af37] mb-3">
                {t(facility.titleKey)}
              </h3>
              <p className="text-[#ccc5b9] text-sm leading-relaxed">
                {t(facility.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Thumbnails */}
      <section className="px-8 md:px-24 py-20 border-t border-[#7c8d4c]/20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-12 text-center"
        >
          {t('galleryViewTitle')}
        </motion.h2>
        <ThumbnailGallery />
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 md:px-24 border-t border-[#7c8d4c]/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[#7c8d4c] font-[var(--font-cormorant)] text-2xl">
            Gallery Époque
          </div>
          <div className="text-[#ccc5b9] text-sm text-center md:text-right">
            <p>{th('footerAddress')}</p>
            <p className="mt-1">Tel. 02-723-3420 | galleryepoque@naver.com</p>
          </div>
        </div>
        <div className="mt-8 text-center text-[#7c8d4c]/50 text-xs">
          {th('footerCopyright')}
        </div>
      </footer>
    </div>
  );
}
