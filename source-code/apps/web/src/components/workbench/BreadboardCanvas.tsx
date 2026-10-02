'use client';

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { useCircuitStore } from '@/store/useCircuitStore';
import { Component3D } from './Component3D';
import { Wire3D } from './Wire3D';
import { GridFloor } from '../3d/GridFloor';
import { ParticleDust } from '../3d/ParticleDust';

export const BreadboardCanvas: React.FC = () => {
  const {
    components,
    wires,
    wireDraftFrom,
    cancelWireDraft,
    selectComponent,
  } = useCircuitStore();

  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const setTopDownView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, 9, 0.01);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div
      className="relative w-full h-full bg-[#07110D] select-none overflow-hidden cursor-crosshair"
      onContextMenu={(e) => {
        e.preventDefault();
        cancelWireDraft();
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 6, 7], fov: 45 }}
        onPointerMissed={() => {
          selectComponent(null);
          cancelWireDraft();
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[6, 10, 6]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, 4, -4]} intensity={0.5} color="#7FE7D6" />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          minDistance={2}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2.05} // don't go below floor
          enableDamping
          dampingFactor={0.05}
        />

        {/* 3D Grid Floor & Ambient Dust */}
        <GridFloor size={24} divisions={32} />
        <ParticleDust count={60} />

        {/* Contact Shadow for Grounded Realism */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.6}
          scale={16}
          blur={1.8}
          far={4}
        />

        {/* All Circuit Components */}
        {components.map((comp) => (
          <Component3D key={comp.id} component={comp} />
        ))}

        {/* All Jumper Wires */}
        {wires.map((wire) => (
          <Wire3D key={wire.id} wire={wire} />
        ))}
      </Canvas>

      {/* Floating HUD Viewport Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#0E2A1F]/80 backdrop-blur-md p-1.5 rounded-xl border border-[#39FF6A]/20 shadow-lg text-xs">
        <button
          onClick={resetCamera}
          className="px-2.5 py-1 text-gray-300 hover:text-[#39FF6A] hover:bg-[#39FF6A]/10 rounded-lg transition font-mono"
          title="Reset Orbit Camera"
        >
          Reset View
        </button>
        <div className="w-[1px] h-4 bg-gray-700" />
        <button
          onClick={setTopDownView}
          className="px-2.5 py-1 text-gray-300 hover:text-[#7FE7D6] hover:bg-[#7FE7D6]/10 rounded-lg transition font-mono"
          title="Top-Down Ortho View"
        >
          Top View
        </button>
      </div>

      {/* Wire Routing Active Banner */}
      {wireDraftFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0E2A1F]/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#39FF6A] shadow-xl flex items-center gap-3 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39FF6A]" />
          <span className="text-xs text-white font-mono">
            Routing wire from pin... Click target pin to complete, or Right-Click to cancel.
          </span>
          <button
            onClick={cancelWireDraft}
            className="text-[11px] text-[#FF9A1F] hover:underline font-bold"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
