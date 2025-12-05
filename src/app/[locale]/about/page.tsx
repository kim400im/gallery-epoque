"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navigation from '@/app/components/Navigation';

// 갤러리 이미지 목업 데이터
const galleryImages = [
  {
    id: 1,
    src: "https://picsum.photos/seed/gallery1/1200/800",
    alt: "Gallery Interior 1",
    caption: "1층 메인 전시홀"
  },
  {
    id: 2,
    src: "https://picsum.photos/seed/gallery2/1200/800",
    alt: "Gallery Interior 2",
    caption: "2층 특별 전시실"
  },
  {
    id: 3,
    src: "https://picsum.photos/seed/gallery3/1200/800",
    alt: "Gallery Interior 3",
    caption: "자연광이 들어오는 아트리움"
  },
  {
    id: 4,
    src: "https://picsum.photos/seed/gallery4/1200/800",
    alt: "Gallery Interior 4",
    caption: "프라이빗 컬렉션 룸"
  },
  {
    id: 5,
    src: "https://picsum.photos/seed/gallery5/1200/800",
    alt: "Gallery Interior 5",
    caption: "아티스트 라운지"
  },
];

// 이미지 슬라이더 컴포넌트
function ImageSlider() {
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
              {galleryImages[currentIndex].caption}
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
  const stats = [
    { number: "1,200", label: "전시 면적 (m²)" },
    { number: "150+", label: "누적 전시 작가" },
    { number: "50+", label: "연간 전시 횟수" },
    { number: "30,000+", label: "연간 방문객" },
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
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// 썸네일 갤러리
function ThumbnailGallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {galleryImages.map((image, index) => (
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
            About <span className="text-[#7c8d4c]">Gallery Époque</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#ccc5b9] font-light leading-relaxed">
            시대를 초월한 예술의 가치를 담아내는 공간,<br />
            갤러리 에포크입니다.
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
              예술과 공간이<br />
              <span className="text-[#d4af37]">하나가 되는 곳</span>
            </h2>
            <div className="space-y-6 text-[#ccc5b9] leading-relaxed">
              <p>
                2010년 서울 삼청동에 문을 연 갤러리 에포크는 동시대 예술의 흐름을 
                선도하며 신진 작가와 기성 작가의 작품을 폭넓게 소개하고 있습니다.
              </p>
              <p>
                1,200제곱미터의 넓은 전시 공간은 자연광이 유입되는 아트리움, 
                미디어아트를 위한 블랙박스 룸, 그리고 프라이빗 컬렉션 룸으로 구성되어 
                다양한 형태의 예술 작품을 최적의 환경에서 선보일 수 있습니다.
              </p>
              <p>
                우리는 단순히 작품을 전시하는 것을 넘어, 작가와 관람객이 깊이 있는 
                대화를 나눌 수 있는 문화 플랫폼이 되고자 합니다. 정기적인 아티스트 토크, 
                큐레이터 투어, 그리고 교육 프로그램을 통해 예술을 더 가까이에서 
                경험할 수 있는 기회를 제공합니다.
              </p>
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
              src="https://picsum.photos/seed/gallerydetail/800/1000"
              alt="Gallery Detail"
              className="w-full rounded-lg"
            />
            <div className="absolute -bottom-8 -left-8 bg-[#7c8d4c] p-8 rounded-lg max-w-xs hidden md:block">
              <p className="text-[#f8f4e3] font-[var(--font-cormorant)] text-xl italic">
                "예술은 시대를 비추는 거울이자, 미래를 향한 창입니다."
              </p>
              <p className="text-[#f8f4e3]/70 text-sm mt-4">— 갤러리 에포크 철학</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-8 md:px-24 py-20 bg-[#1a1c1a]">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center text-2xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-16"
        >
          Gallery Époque in Numbers
        </motion.h2>
        <Stats />
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
          공간 구성
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "메인 전시홀",
              description: "600m²의 넓은 공간에서 대규모 전시를 진행합니다. 5m 천장고와 가변형 조명 시스템을 갖추고 있습니다.",
              image: "https://picsum.photos/seed/space1/600/400"
            },
            {
              title: "미디어아트 룸",
              description: "프로젝션 매핑과 사운드 설치를 위한 블랙박스 공간입니다. 최신 AV 장비가 상설 구비되어 있습니다.",
              image: "https://picsum.photos/seed/space2/600/400"
            },
            {
              title: "프라이빗 갤러리",
              description: "소규모 기획전과 VIP 프리뷰를 위한 공간입니다. 아늑한 분위기에서 작품을 감상할 수 있습니다.",
              image: "https://picsum.photos/seed/space3/600/400"
            }
          ].map((facility, index) => (
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
                  alt={facility.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-[var(--font-cormorant)] text-[#d4af37] mb-3">
                {facility.title}
              </h3>
              <p className="text-[#ccc5b9] text-sm leading-relaxed">
                {facility.description}
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
          갤러리 전경
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
