"use client";

/**
 * Scene 2: Particle Wave (파티클 웨이브)
 * 수천 개의 작은 입자들이 파도처럼 물결치는 효과
 * 몽환적이고 현대적인 분위기
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 3000 }) {
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const color1 = new THREE.Color('#7c8d4c');
    const color2 = new THREE.Color('#d4af37');
    const color3 = new THREE.Color('#f8f4e3');
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      const mixedColor = color1.clone();
      if (Math.random() > 0.7) {
        mixedColor.lerp(color2, Math.random());
      } else if (Math.random() > 0.5) {
        mixedColor.lerp(color3, Math.random() * 0.5);
      }
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    
    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      const time = state.clock.getElapsedTime();
      const positionArray = mesh.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const x = positionArray[i * 3];
        const z = positionArray[i * 3 + 2];
        positionArray[i * 3 + 1] = Math.sin(x * 0.5 + time * 0.5) * Math.cos(z * 0.5 + time * 0.3) * 1.5;
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true;
      mesh.current.rotation.y = time * 0.02;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={mesh} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#d4af37" />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#7c8d4c" />
      <Particles />
    </>
  );
}

export default function ParticleWave() {
  return (
    <Canvas camera={{ position: [0, 3, 10], fov: 50 }}>
      <color attach="background" args={['#111311']} />
      <Scene />
    </Canvas>
  );
}
