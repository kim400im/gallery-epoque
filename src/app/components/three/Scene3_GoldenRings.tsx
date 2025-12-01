"use client";

/**
 * Scene 3: Golden Rings (골든 링)
 * 금색 링들이 서로 교차하며 회전하는 효과
 * 클래식하고 럭셔리한 분위기
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

function Ring({ radius, tube, rotationAxis, speed, color, roughness = 0.3, metalness = 0.9 }: {
  radius: number;
  tube: number;
  rotationAxis: 'x' | 'y' | 'z';
  speed: number;
  color: string;
  roughness?: number;
  metalness?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.getElapsedTime();
      mesh.current.rotation[rotationAxis] = time * speed;
    }
  });

  return (
    <mesh ref={mesh}>
      <torusGeometry args={[radius, tube, 64, 100]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

function FloatingOrb({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.getElapsedTime();
      mesh.current.position.y = position[1] + Math.sin(time * 2) * 0.3;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial
        color="#f8f4e3"
        emissive="#d4af37"
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} color="#fff5e6" />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={2} color="#ffecd1" castShadow />
      <spotLight position={[-10, -5, -10]} angle={0.3} penumbra={1} intensity={1} color="#d4af37" />
      <pointLight position={[0, 0, 5]} intensity={1} color="#7c8d4c" />
      
      <group ref={groupRef}>
        <Ring radius={2.5} tube={0.02} rotationAxis="x" speed={0.3} color="#d4af37" />
        <Ring radius={2.2} tube={0.02} rotationAxis="y" speed={0.4} color="#d4af37" roughness={0.4} />
        <Ring radius={1.9} tube={0.02} rotationAxis="z" speed={0.5} color="#7c8d4c" />
        <Ring radius={1.6} tube={0.015} rotationAxis="x" speed={-0.35} color="#ccc5b9" />
        <Ring radius={1.3} tube={0.015} rotationAxis="y" speed={-0.45} color="#d4af37" metalness={1} />
        
        <FloatingOrb position={[0, 0, 0]} />
        <FloatingOrb position={[1.5, 0.5, 0.5]} />
        <FloatingOrb position={[-1.5, -0.3, -0.5]} />
      </group>
      
      <Environment preset="studio" />
    </>
  );
}

export default function GoldenRings() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
      <color attach="background" args={['#111311']} />
      <Scene />
    </Canvas>
  );
}
