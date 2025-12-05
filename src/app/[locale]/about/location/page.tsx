"use client";

import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Car, Train } from 'lucide-react';
import Navigation from '@/app/components/Navigation';

// 교통 정보
const transportInfo = [
  {
    icon: Train,
    title: "지하철",
    details: [
      "3호선 안국역 1번 출구 도보 10분",
      "3호선 경복궁역 5번 출구 도보 15분",
    ]
  },
  {
    icon: Train,
    title: "버스",
    details: [
      "마을버스 11번 금융연수원 하차",
    ]
  },
  {
    icon: Car,
    title: "자가용",
    details: [
      "삼청 공영제1주차장 이용 가능",
      "공영주차장에서 60m 거리"
    ]
  }
];

// 운영 정보
const operatingInfo = [
  {
    icon: Clock,
    title: "운영 시간",
    content: "화 - 일  11:00 - 18:00\n월요일 휴관"
  },
  {
    icon: Phone,
    title: "전화",
    content: "02-723-3420"
  },
  {
    icon: Mail,
    title: "이메일",
    content: "galleryepoque@naver.com"
  },
  {
    icon: MapPin,
    title: "주소",
    content: "서울특별시 종로구 삼청로 123-1"
  }
];

export default function LocationPage() {
  // 삼청로 좌표 (예시 - 실제 주소에 맞게 조정 필요)
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.279654744498!2d126.98048307678045!3d37.58012697204039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca2e1e67b7d11%3A0x6293a3e2a0369bd6!2z7IK87LKt66Gc!5e0!3m2!1sko!2skr!4v1701234567890!5m2!1sko!2skr";

  return (
    <div className="min-h-screen bg-[#111311]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-8 md:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-6">
            오시는 <span className="text-[#7c8d4c]">길</span>
          </h1>
          <p className="text-xl text-[#ccc5b9] font-light">
            서울의 중심, 삼청동에서 만나는 예술의 공간
          </p>
        </motion.div>
      </section>

      {/* Map Section */}
      <section className="px-8 md:px-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden border border-[#7c8d4c]/20"
        >
          <iframe
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          />
        </motion.div>
        
        {/* 주소 오버레이 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 md:mt-[-80px] md:ml-8 md:relative md:z-10 md:w-fit"
        >
          <div className="bg-[#1a1c1a] border border-[#7c8d4c]/30 rounded-xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#7c8d4c] rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-[#f8f4e3]" />
              </div>
              <div>
                <h3 className="text-[#f8f4e3] font-[var(--font-cormorant)] text-xl mb-2">Gallery Époque</h3>
                <p className="text-[#ccc5b9]">서울특별시 종로구 삼청로 123-1</p>
                <p className="text-[#7c8d4c] text-sm mt-2">3호선 안국역 1번 출구 도보 10분</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Info Grid Section */}
      <section className="px-8 md:px-24 py-16 border-t border-[#7c8d4c]/20">
        <div className="grid md:grid-cols-2 gap-16">
          {/* 운영 정보 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-10">
              운영 정보
            </h2>
            <div className="space-y-8">
              {operatingInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-[#7c8d4c]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-5 h-5 text-[#7c8d4c]" />
                  </div>
                  <div>
                    <h3 className="text-[#d4af37] text-sm tracking-wider mb-1">{info.title}</h3>
                    <p className="text-[#f8f4e3] whitespace-pre-line">{info.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 교통 정보 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-10">
              교통 안내
            </h2>
            <div className="space-y-10">
              {transportInfo.map((transport, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                      <transport.icon className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <h3 className="text-[#f8f4e3] font-medium">{transport.title}</h3>
                  </div>
                  <ul className="space-y-2 pl-[52px]">
                    {transport.details.map((detail, idx) => (
                      <li key={idx} className="text-[#ccc5b9] text-sm flex items-start gap-2">
                        <span className="w-1 h-1 bg-[#7c8d4c] rounded-full mt-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 주변 정보 */}
      <section className="px-8 md:px-24 py-16 bg-[#1a1c1a]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-10 text-center"
        >
          주변 명소
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "경복궁", distance: "도보 15분", image: "https://picsum.photos/seed/place1/400/300" },
            { name: "삼청동 카페거리", distance: "도보 3분", image: "https://picsum.photos/seed/place2/400/300" },
            { name: "북촌 한옥마을", distance: "도보 10분", image: "https://picsum.photos/seed/place3/400/300" },
            { name: "국립현대미술관", distance: "도보 20분", image: "https://picsum.photos/seed/place4/400/300" },
          ].map((place, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-[#f8f4e3] font-medium">{place.name}</h3>
              <p className="text-[#7c8d4c] text-sm">{place.distance}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 md:px-24 py-20 border-t border-[#7c8d4c]/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-[var(--font-cormorant)] text-[#f8f4e3] mb-4">
            갤러리 에포크에서 만나요
          </h2>
          <p className="text-[#ccc5b9] mb-8 max-w-xl mx-auto">
            전시 관람 및 대관 문의는 전화 또는 이메일로 연락 주시기 바랍니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:02-723-3420"
              className="px-8 py-4 bg-[#7c8d4c] text-[#f8f4e3] rounded-full hover:bg-[#6a7a40] transition-colors"
            >
              전화 문의
            </a>
            <a
              href="mailto:galleryepoque@naver.com"
              className="px-8 py-4 border border-[#7c8d4c] text-[#7c8d4c] rounded-full hover:bg-[#7c8d4c] hover:text-[#f8f4e3] transition-colors"
            >
              이메일 문의
            </a>
          </div>
        </motion.div>
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
