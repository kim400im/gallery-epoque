"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import * as THREE from 'three';
import { Link } from '@/i18n/navigation';
import Navigation from '../components/Navigation';

// --- 3D Components ---

function AbstractArt({ position, scale, color, speed, roughness = 0.1, transmission = 0.95 }: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  roughness?: number;
  transmission?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if(mesh.current) {
        mesh.current.rotation.x = t * speed;
        mesh.current.rotation.y = t * speed * 0.5;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={mesh} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial backside backsideThickness={5} thickness={2} roughness={roughness} transmission={transmission} ior={1.5} chromaticAberration={0.3} color={color} background={new THREE.Color('#111311')} />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} color="#fff0e0" />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#ffecd1" castShadow />
      <spotLight position={[-10, -10, -5]} angle={0.2} penumbra={1} intensity={0.5} color="#ffd7a8" />
      <group position={[0, 0, 0]}>
        <AbstractArt position={[2, 0, 0]} scale={1.2} color="#f2eadd" speed={0.2} roughness={0.05} />
        <AbstractArt position={[-2.5, 1, -1]} scale={0.8} color="#d4af37" speed={0.15} transmission={0.6} roughness={0.2} /> 
        <AbstractArt position={[0, -2, 1]} scale={0.5} color="#4a5d23" speed={0.3} transmission={0.8} />
      </group>
      <ContactShadows resolution={1024} scale={20} blur={3} opacity={0.4} far={10} color="#1a1410" />
      <Environment preset="lobby" />
    </>
  );
}

export default function GalleryLanding() {
  const t = useTranslations();

  return (
    <div className="w-full h-screen bg-[#111311] relative overflow-hidden">
      {/* 3D 배경 */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 1, 9], fov: 45 }}>
          <color attach="background" args={['#111311']} />
          <Scene />
        </Canvas>
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
          <h1 className="text-5xl md:text-8xl font-serif text-[#f8f4e3] leading-tight mb-8 drop-shadow-xl">
            {t('home.title')} <br />
            <span className="italic text-[#d4af37]">{t('home.titleHighlight')}</span>
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
