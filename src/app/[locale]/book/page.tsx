"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, User, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import * as THREE from 'three';

// --- 3D Components: 고급스러운 추상 오브제 ---
function ElegantShape({ position, color }: { position: [number, number, number], color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      // 천천히 우아하게 회전
      mesh.current.rotation.x = t * 0.1;
      mesh.current.rotation.y = t * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh} position={position} scale={1.8}>
        {/* 복잡한 굴절을 위한 TorusKnot 형태 */}
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={3}
          thickness={2}
          roughness={0.05}
          transmission={0.95} // 더 투명하게
          ior={1.5}
          chromaticAberration={0.4} // 빛 분산 효과
          color={color}
          background={new THREE.Color('#111311')}
        />
      </mesh>
    </Float>
  );
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.5} color="#fff0e0" />
      <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} color="#ffecd1" castShadow />
      <spotLight position={[-10, -5, -5]} angle={0.5} penumbra={1} intensity={1} color="#7c8d4c" />
      
      {/* 화면 좌측을 채워줄 오브제 */}
      <group position={[-1, 0, 0]}>
        <ElegantShape position={[0, 0, 0]} color="#f2eadd" />
      </group>
      
      <Environment preset="city" />
    </>
  );
}

// --- UI Components ---

export default function BookingPage() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const homePath = locale === 'ko' ? '/' : `/${locale}`;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => setIsSubmitted(true), 500); // 약간의 딜레이로 UX 향상
  };

  // 입력 필드 렌더링 헬퍼 함수
  const renderInput = (
    id: string, 
    label: string, 
    type: string, 
    Icon: any, 
    placeholder: string
  ) => (
    <div className="relative group">
      <label 
        className={`absolute left-0 transition-all duration-300 pointer-events-none flex items-center gap-2 uppercase tracking-widest text-xs font-bold
          ${focusedField === id || (formData as any)[id] ? '-top-5 text-[#d4af37] scale-90 origin-left' : 'top-3 text-[#7c8d4c]'}
        `}
      >
        <Icon className="w-3 h-3" /> {label}
      </label>
      <input 
        type={type} 
        required
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
        className="w-full bg-transparent border-b border-[#7c8d4c]/30 text-[#f8f4e3] text-lg py-3 outline-none transition-all focus:border-[#d4af37]"
        placeholder={focusedField === id ? placeholder : ''}
        value={(formData as any)[id]}
        onChange={(e) => setFormData({...formData, [id]: e.target.value})}
        style={{ colorScheme: 'dark' }} // 달력 아이콘 다크모드
      />
      {/* 포커스시 차오르는 바 효과 */}
      <div className={`absolute bottom-0 left-0 h-[1px] bg-[#d4af37] transition-all duration-500 ${focusedField === id ? 'w-full' : 'w-0'}`} />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#111311] text-[#f8f4e3] flex flex-col md:flex-row overflow-hidden relative">
      
      {/* 1. Left Section: Visuals & Branding (PC에서만 크게 보임) */}
      <div className="hidden md:flex w-full md:w-5/12 h-screen sticky top-0 flex-col justify-between p-12 lg:p-16 border-r border-[#7c8d4c]/10 z-10 bg-[#111311]/50 backdrop-blur-sm">
        <div>
           <Link href={homePath} className="inline-flex items-center gap-2 text-[#ccc5b9] hover:text-[#d4af37] transition-colors text-xs tracking-[0.2em] uppercase mb-8 group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> {useTranslations('nav')('backToHome')}
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-serif leading-none mb-6"
          >
            {t('heading1')} <br/><span className="italic text-[#7c8d4c]">{t('heading2')}</span> <br/>{t('heading3')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-[#ccc5b9] font-light leading-relaxed max-w-sm whitespace-pre-line"
          >
            {t('description')}
          </motion.p>
        </div>

        {/* 3D Scene Container (Left Background) */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-80">
           <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
             <Scene3D />
           </Canvas>
        </div>
        
        <div className="text-[#7c8d4c]/40 text-xs tracking-widest uppercase">
          {t('copyright')}
        </div>
      </div>

      {/* 모바일용 헤더 */}
      <div className="md:hidden p-6 flex justify-between items-center bg-[#111311] z-20">
         <div className="font-serif font-bold text-[#7c8d4c]">Lumière</div>
         <Link href={homePath} className="text-xs text-[#ccc5b9]">{useTranslations('nav')('close')}</Link>
      </div>

      {/* 2. Right Section: The Form */}
      <div className="w-full md:w-7/12 min-h-screen relative flex items-center justify-center p-6 md:p-16 lg:p-24 bg-[#111311]">
        {/* 은은한 배경 그라디언트 */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7c8d4c]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div 
              key="form-container"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-lg"
            >
              <h2 className="md:hidden text-3xl font-serif mb-2 text-[#f8f4e3]">{t('pageTitle')}</h2>
              <p className="md:hidden text-[#ccc5b9] text-sm mb-12">{t('pageSubtitle')}</p>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-8">
                  {renderInput('name', t('form.name'), 'text', User, t('form.namePlaceholder'))}
                  {renderInput('phone', t('form.phone'), 'tel', Phone, t('form.phonePlaceholder'))}
                  {renderInput('email', t('form.email'), 'email', Mail, t('form.emailPlaceholder'))}
                  {renderInput('date', t('form.date'), 'date', Calendar, '')}
                </div>

                <div className="relative group pt-4">
                  <label className="text-[#7c8d4c] text-xs font-bold tracking-widest uppercase mb-2 block">
                    {t('form.message')}
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full bg-[#1a1c1a]/50 border border-[#7c8d4c]/20 rounded-lg p-4 text-[#f8f4e3] outline-none focus:border-[#d4af37] transition-colors resize-none placeholder:text-white/10"
                    placeholder={t('form.messagePlaceholder')}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group w-full bg-[#7c8d4c] hover:bg-[#6a7a40] text-[#f8f4e3] py-5 rounded-none flex items-center justify-between px-8 transition-all duration-300"
                >
                  <span className="text-sm font-bold tracking-[0.2em] uppercase">{t('form.submit')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>
            </motion.div>
          ) : (
            // 완료 화면
            <motion.div
              key="success-container"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center w-full max-w-lg"
            >
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} 
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 rounded-full border border-[#d4af37] flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle className="w-8 h-8 text-[#d4af37]" />
              </motion.div>
              
              <h2 className="text-4xl font-serif text-[#f8f4e3] mb-6">{t('success.title')}</h2>
              <p className="text-[#ccc5b9] mb-12 leading-relaxed font-light">
                <strong className="text-[#d4af37]">{formData.name}</strong> {t('success.message1')}<br/>
                {t('success.message2')}<br/>
                <span className="text-sm mt-2 block opacity-60">{t('success.message3')}</span>
              </p>
              
              <Link href={homePath} className="text-[#7c8d4c] hover:text-[#d4af37] text-xs tracking-[0.2em] uppercase border-b border-[#7c8d4c] pb-1 hover:border-[#d4af37] transition-all">
                {t('success.returnLink')}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
