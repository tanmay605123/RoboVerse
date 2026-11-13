'use client';

import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { WireConnection } from '@roboverse/shared';
import { useCircuitStore } from '@/store/useCircuitStore';

interface Wire3DProps {
  wire: WireConnection;
}

export const Wire3D: React.FC<Wire3DProps> = ({ wire }) => {
  const { components, isSimulating, removeWire, toolMode } = useCircuitStore();
  const [isHovered, setIsHovered] = useState(false);

  // Compute endpoints from component pin positions
  const curve = useMemo(() => {
    const fromComp = components.find((c) => c.id === wire.fromComponentId);
    const toComp = components.find((c) => c.id === wire.toComponentId);

    if (!fromComp || !toComp) return null;

    const fromPin = fromComp.pins.find((p) => p.id === wire.fromPinId);
    const toPin = toComp.pins.find((p) => p.id === wire.toPinId);

    const startPos = fromPin?.position3D
      ? new THREE.Vector3(fromPin.position3D[0], fromPin.position3D[1], fromPin.position3D[2])
      : new THREE.Vector3(fromComp.position[0], fromComp.position[1] + 0.2, fromComp.position[2]);

    const endPos = toPin?.position3D
      ? new THREE.Vector3(toPin.position3D[0], toPin.position3D[1], toPin.position3D[2])
      : new THREE.Vector3(toComp.position[0], toComp.position[1] + 0.2, toComp.position[2]);

    // Elevated arch control points for realistic dangling/arched breadboard jumper wire
    const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    const distance = startPos.distanceTo(endPos);
    const archHeight = Math.min(1.8, Math.max(0.4, distance * 0.35));

    const cp1 = new THREE.Vector3(
      startPos.x + (midPoint.x - startPos.x) * 0.5,
      startPos.y + archHeight,
      startPos.z + (midPoint.z - startPos.z) * 0.5
    );

    const cp2 = new THREE.Vector3(
      endPos.x + (midPoint.x - endPos.x) * 0.5,
      endPos.y + archHeight,
      endPos.z + (midPoint.z - endPos.z) * 0.5
    );

    return new THREE.CubicBezierCurve3(startPos, cp1, cp2, endPos);
  }, [components, wire]);

  if (!curve) return null;

  const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.035, 8, false);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (toolMode === 'DELETE' || isHovered) {
      removeWire(wire.id);
    }
  };

  return (
    <group>
      <mesh
        geometry={tubeGeometry}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={isHovered ? '#FF3939' : wire.color}
          roughness={0.3}
          metalness={0.1}
          emissive={isHovered ? '#FF3939' : wire.color}
          emissiveIntensity={isHovered ? 0.8 : isSimulating ? 0.3 : 0.05}
        />
      </mesh>
    </group>
  );
};
