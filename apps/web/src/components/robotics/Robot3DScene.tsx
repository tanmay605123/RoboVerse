'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { useRobotStore } from '@/store/useRobotStore';
import { Arenas3D } from './arenas/Arenas3D';
import { Robot3DAssembly } from './Robot3DAssembly';
import { Camera, Maximize2, RotateCcw, Video, Compass } from 'lucide-react';

function SceneSimLoop() {
  const { tickSimulation, isSimulating } = useRobotStore();

  useFrame((_, delta) => {
    if (isSimulating) {
      tickSimulation(delta);
    }
  });

  return null;
}

function FollowCamera({ isFollow }: { isFollow: boolean }) {
  const { robotPosition, robotRotation } = useRobotStore();
  const controlsRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (isFollow) {
      const [x, y, z] = robotPosition;
      const [, yaw] = robotRotation;
      const camDistance = 3.5;
      const camHeight = 2.0;

      // Position camera behind the robot based on its heading
      const camX = x - Math.sin(yaw) * camDistance;
      const camZ = z + Math.cos(yaw) * camDistance;

      camera.position.set(camX, y + camHeight, camZ);
      camera.lookAt(x, y + 0.3, z);
    }
  });

  return !isFollow ? (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={1.2}
      maxDistance={25}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  ) : null;
}

export const Robot3DScene: React.FC = () => {
  const {
    mode,
    activeArenaId,
    robotPosition,
    robotRotation,
    sumoOpponent,
  } = useRobotStore();

  const [cameraMode, setCameraMode] = useState<'FREE' | 'FOLLOW' | 'TOP_DOWN'>('FREE');

  return (
    <div className="relative w-full h-full bg-[#07110D] overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 4.5, 6.0]} fov={45} />
        <color attach="background" args={['#07110D']} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[8, 12, 8]}
          intensity={1.3}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-4, 6, -4]} intensity={0.5} color="#7FE7D6" />

        {/* Dynamic Follow Camera or Orbit Controls */}
        <FollowCamera isFollow={cameraMode === 'FOLLOW'} />

        {/* Arena Environment (Only in simulation, or simple ground in builder) */}
        {mode === 'SIMULATION' ? (
          <Arenas3D type={activeArenaId} opponent={sumoOpponent} />
        ) : (
          <group>
            {/* Dark Green Control Room Grid Floor for Builder Mode */}
            <gridHelper args={[16, 32, '#39FF6A', '#0E2A1F']} position={[0, -0.01, 0]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#05100B" roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* 3D Robot Assembly */}
        <Robot3DAssembly
          position={mode === 'SIMULATION' ? robotPosition : [0, 0.08, 0]}
          rotation={mode === 'SIMULATION' ? robotRotation : [0, 0, 0]}
          isBuilderMode={mode === 'BUILDER'}
        />

        {/* Contact Shadow Under Robot */}
        <ContactShadows
          position={[
            mode === 'SIMULATION' ? robotPosition[0] : 0,
            0.005,
            mode === 'SIMULATION' ? robotPosition[2] : 0,
          ]}
          opacity={0.8}
          scale={2.2}
          blur={1.8}
          far={1.5}
        />

        {/* Real-time Physics Simulation Loop */}
        <SceneSimLoop />
      </Canvas>

      {/* Floating 3D Camera Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 bg-[#040B08]/90 backdrop-blur-xl rounded-2xl border border-[rgba(57,255,106,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.6)] font-mono text-xs">
        <button
          onClick={() => setCameraMode('FREE')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            cameraMode === 'FREE'
              ? 'bg-[#0E2A1F] text-[#39FF6A] border border-[#39FF6A]/40'
              : 'text-[#8FA99B] hover:text-[#EAF7EF]'
          }`}
          title="Free Orbit Camera (Rotate & Zoom)"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Free Cam</span>
        </button>

        <button
          onClick={() => setCameraMode('FOLLOW')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            cameraMode === 'FOLLOW'
              ? 'bg-[#0E2A1F] text-[#39FF6A] border border-[#39FF6A]/40'
              : 'text-[#8FA99B] hover:text-[#EAF7EF]'
          }`}
          title="Follow Chase Camera behind Robot"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Follow Cam</span>
        </button>

        <button
          onClick={() => setCameraMode('TOP_DOWN')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            cameraMode === 'TOP_DOWN'
              ? 'bg-[#0E2A1F] text-[#39FF6A] border border-[#39FF6A]/40'
              : 'text-[#8FA99B] hover:text-[#EAF7EF]'
          }`}
          title="Top-down Orthographic view"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Top-Down</span>
        </button>
      </div>
    </div>
  );
};
