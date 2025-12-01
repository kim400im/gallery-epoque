"use client";

/**
 * Scene 4: Abstract Sculpture (추상 조각)
 * 유기적인 형태의 추상 조각이 천천히 변형되는 효과
 * 예술적이고 갤러리에 어울리는 분위기
 */

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function MorphingSphere({ position, scale, color, distort, speed }: {
  position: [number, number, number];
  scale: number;
  color: string;
  distort: number;
  speed: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * speed * 0.2;
      mesh.current.rotation.y = state.clock.getElapsedTime() * speed * 0.3;
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        distort={distort}
        speed={speed}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

function FloatingPlane({ position, rotation, scale }: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <meshStandardMaterial
        color="#d4af37"
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.9}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function GlowingSphere() {
  const light = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (light.current) {
      light.current.intensity = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <pointLight ref={light} color="#d4af37" intensity={1} distance={10} />
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="#f8f4e3" />
      </mesh>
    </group>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#fff5e6" />
      <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} color="#ffecd1" />
      <spotLight position={[-10, 5, -10]} angle={0.3} penumbra={1} intensity={1} color="#7c8d4c" />
      
      <group ref={groupRef}>
        {/* 중앙 메인 조각 */}
        <MorphingSphere position={[0, 0, 0]} scale={1.8} color="#7c8d4c" distort={0.4} speed={2} />
        
        {/* 주변 작은 조각들 */}
        <MorphingSphere position={[3, 0.5, -1]} scale={0.6} color="#d4af37" distort={0.3} speed={3} />
        <MorphingSphere position={[-2.5, -0.5, 1]} scale={0.5} color="#ccc5b9" distort={0.5} speed={2.5} />
        <MorphingSphere position={[1, 2, 1]} scale={0.4} color="#f8f4e3" distort={0.35} speed={4} />
        
        {/* 플로팅 평면 */}
        <FloatingPlane position={[-3, 1, -2]} rotation={[0.3, 0.5, 0]} scale={[2, 0.5, 1]} />
        <FloatingPlane position={[2.5, -1, 2]} rotation={[-0.2, -0.3, 0.1]} scale={[1.5, 0.3, 1]} />
        
        {/* 중앙 빛나는 구 */}
        <GlowingSphere />
      </group>
      
      <Environment preset="sunset" />
    </>
  );
}

export default function AbstractSculpture() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <color attach="background" args={['#111311']} />
      <Scene />
    </Canvas>
  );
}
