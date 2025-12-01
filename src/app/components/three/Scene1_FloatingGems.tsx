"use client";

/**
 * Scene 1: Floating Gems (플로팅 보석)
 * 투명한 보석 형태의 다면체들이 천천히 회전하며 떠다니는 효과
 * 고급스러운 갤러리 분위기
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Gem({ position, scale, color, rotationSpeed = 0.1 }: {
  position: [number, number, number];
  scale: number;
  color: string;
  rotationSpeed?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += rotationSpeed * 0.01;
      mesh.current.rotation.y += rotationSpeed * 0.015;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={mesh} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={5}
          thickness={2}
          roughness={0.05}
          transmission={0.95}
          ior={2.5}
          chromaticAberration={0.5}
          color={color}
          background={new THREE.Color('#111311')}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} color="#fff5e6" />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffecd1" />
      <spotLight position={[-10, -5, 5]} angle={0.3} penumbra={1} intensity={1} color="#d4af37" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#7c8d4c" />
      
      <Gem position={[2.5, 0.5, 0]} scale={1.0} color="#f8f4e3" rotationSpeed={0.8} />
      <Gem position={[-2, 1, -2]} scale={0.7} color="#d4af37" rotationSpeed={0.6} />
      <Gem position={[0, -1.5, 1]} scale={0.5} color="#7c8d4c" rotationSpeed={1.0} />
      <Gem position={[-3, -0.5, 1]} scale={0.4} color="#ccc5b9" rotationSpeed={0.5} />
      <Gem position={[3, -1, -1]} scale={0.3} color="#d4af37" rotationSpeed={0.7} />
      
      <Environment preset="city" />
    </>
  );
}

export default function FloatingGems() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <color attach="background" args={['#111311']} />
      <Scene />
    </Canvas>
  );
}
