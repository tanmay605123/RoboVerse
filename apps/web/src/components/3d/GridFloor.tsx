'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

interface GridFloorProps {
  size?: number;
  divisions?: number;
  position?: [number, number, number];
}

export function GridFloor({
  size = 40,
  divisions = 40,
  position = [0, -2, 0],
}: GridFloorProps = {}) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      {/* Primary Grid */}
      <gridHelper
        args={[size, divisions, '#39FF6A', '#0E3A28']}
        position={[0, 0.01, 0]}
      />

      {/* Volumetric Radial Glow Center Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[2.8, 3.2, 64]} />
        <meshBasicMaterial color="#39FF6A" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[4.2, 4.4, 64]} />
        <meshBasicMaterial color="#7FE7D6" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Floor surface plane absorbing soft reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#05100B"
          roughness={0.65}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}
