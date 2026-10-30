'use client';

import React from 'react';
import * as THREE from 'three';
import { ArenaType } from '@/store/useRobotStore';

interface ArenaProps {
  type: ArenaType;
  opponent?: {
    position: [number, number, number];
    rotation: [number, number, number];
    isFallen: boolean;
  };
}

export const Arenas3D: React.FC<ArenaProps> = ({ type, opponent }) => {
  return (
    <group>
      {/* 1. FLAT GROUND SKIDPAD ARENA */}
      {type === 'arena_flat_ground' && (
        <group>
          {/* Main asphalt sprint floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -10]} receiveShadow>
            <planeGeometry args={[14, 30]} />
            <meshStandardMaterial color="#0A1611" roughness={0.8} />
          </mesh>

          {/* Runway White Sprint Stripes */}
          {[-15, -10, -5, 0, 5, 10].map((z) => (
            <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
              <planeGeometry args={[0.3, 1.2]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          ))}

          {/* Skidpad Concentric Circles */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[2.45, 2.55, 64]} />
            <meshBasicMaterial color="#39FF6A" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[4.95, 5.05, 64]} />
            <meshBasicMaterial color="#7FE7D6" transparent opacity={0.6} />
          </mesh>

          {/* Distance Markers Pillars */}
          {[-5, -10, -15, -20].map((z, idx) => (
            <group key={z} position={[4, 0, z]}>
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
              <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[0.5, 0.3, 0.05]} />
                <meshStandardMaterial color="#0E2A1F" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 2. GRAND PRIX LINE TRACK SPEEDWAY */}
      {type === 'arena_line_track' && (
        <group>
          {/* Track Ground Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[18, 18]} />
            <meshStandardMaterial color="#0A140F" roughness={0.85} />
          </mesh>

          {/* Continuous Oval Track Base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <ringGeometry args={[2.8, 5.2, 64]} />
            <meshStandardMaterial color="#0F241B" roughness={0.7} />
          </mesh>

          {/* Center High-Contrast Black Vinyl Line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[3.95, 4.05, 128]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Red & White Curb Rumbles */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <ringGeometry args={[5.2, 5.4, 64]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
            <ringGeometry args={[2.6, 2.8, 64]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>

          {/* Neon Start/Finish Arch */}
          <group position={[4.0, 0, 0]}>
            <mesh position={[-0.7, 1.2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 2.4, 16]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0.7, 1.2, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 2.4, 16]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 2.3, 0]}>
              <boxGeometry args={[1.5, 0.25, 0.1]} />
              <meshStandardMaterial color="#0E2A1F" emissive="#39FF6A" emissiveIntensity={0.6} />
            </mesh>
            {/* Checkerboard finish line banner */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
              <planeGeometry args={[1.4, 0.4]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. DYNAMIC HAZARD OBSTACLE MAZE */}
      {type === 'arena_obstacle_maze' && (
        <group>
          {/* Maze Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[16, 24]} />
            <meshStandardMaterial color="#07150E" roughness={0.9} />
          </mesh>

          {/* Concrete Perimeter Walls */}
          <group>
            <mesh position={[-5, 0.75, 0]}>
              <boxGeometry args={[0.3, 1.5, 20]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} />
            </mesh>
            <mesh position={[5, 0.75, 0]}>
              <boxGeometry args={[0.3, 1.5, 20]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.75, -10]}>
              <boxGeometry args={[10, 1.5, 0.3]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.75, 10]}>
              <boxGeometry args={[10, 1.5, 0.3]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} />
            </mesh>
          </group>

          {/* Internal Labyrinth Baffle Walls */}
          {[
            { pos: [-2, 0.75, -5], size: [4, 1.5, 0.3] },
            { pos: [2, 0.75, -2], size: [4, 1.5, 0.3] },
            { pos: [-1, 0.75, 2], size: [0.3, 1.5, 6] },
            { pos: [2.5, 0.75, 4], size: [3, 1.5, 0.3] },
            { pos: [-3, 0.75, 6], size: [3, 1.5, 0.3] },
          ].map((w, idx) => (
            <mesh key={idx} position={w.pos as [number, number, number]}>
              <boxGeometry args={w.size as [number, number, number]} />
              <meshStandardMaterial color="#132B20" roughness={0.6} />
              {/* Neon top cap glow */}
              <lineSegments>
                <edgesGeometry args={[new (THREE as any).BoxGeometry(...w.size)]} />
                <lineBasicMaterial color="#39FF6A" />
              </lineSegments>
            </mesh>
          ))}

          {/* Exit Target Pad */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0.005, -8.5]}>
            <circleGeometry args={[1.0, 32]} />
            <meshStandardMaterial color="#0A2C1D" emissive="#39FF6A" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* 4. SUMO DOHYO COMBAT RING */}
      {type === 'arena_sumo_ring' && (
        <group>
          {/* Raised Wooden Dohyo Platform (Diameter 2.8m, Height 0.15m) */}
          <mesh position={[0, 0.075, 0]} receiveShadow>
            <cylinderGeometry args={[1.54, 1.6, 0.15, 64]} />
            <meshStandardMaterial color="#3E2723" roughness={0.7} />
          </mesh>

          {/* Black Rubber Mat Top Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.155, 0]}>
            <circleGeometry args={[1.45, 64]} />
            <meshStandardMaterial color="#111827" roughness={0.5} />
          </mesh>

          {/* White Outer Boundary Ring (Shikiri-sen) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.158, 0]}>
            <ringGeometry args={[1.35, 1.45, 64]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Starting Position Lines */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.159, -0.3]}>
            <planeGeometry args={[0.4, 0.04]} />
            <meshBasicMaterial color="#881337" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.159, 0.3]}>
            <planeGeometry args={[0.4, 0.04]} />
            <meshBasicMaterial color="#881337" />
          </mesh>

          {/* Fall Area Floor Around Dohyo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[12, 12]} />
            <meshStandardMaterial color="#07110D" roughness={0.9} />
          </mesh>

          {/* OPPONENT SUMO BOT */}
          {opponent && !opponent.isFallen && (
            <group position={opponent.position} rotation={opponent.rotation}>
              {/* Opponent Chassis */}
              <mesh position={[0, 0.08, 0]} castShadow>
                <boxGeometry args={[0.32, 0.14, 0.35]} />
                <meshStandardMaterial color="#B91C1C" roughness={0.4} />
              </mesh>
              {/* Sloped Steel Dozer Blade */}
              <mesh position={[0, 0.05, 0.2]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.36, 0.12, 0.04]} />
                <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Heavy Wheels */}
              <mesh position={[-0.18, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
              <mesh position={[0.18, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
              {/* Opponent AI Sensor Eye */}
              <mesh position={[0, 0.14, 0.12]}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* 5. AEROZONE FPV DRONE CAGE */}
      {type === 'arena_drone_gates' && (
        <group>
          {/* Landing Pad */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[1.5, 32]} />
            <meshStandardMaterial color="#0E2A1F" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
            <ringGeometry args={[1.3, 1.45, 32]} />
            <meshBasicMaterial color="#39FF6A" />
          </mesh>

          {/* Elevated Neon Racing Gates */}
          {[
            { pos: [0, 2.0, -4], rot: [0, 0, 0], color: '#39FF6A' },
            { pos: [2.5, 3.2, -8], rot: [0, 0.3, 0], color: '#7FE7D6' },
            { pos: [-2.0, 2.5, -12], rot: [0, -0.4, 0], color: '#39FF6A' },
            { pos: [0, 1.8, -16], rot: [0, 0, 0], color: '#FF9A1F' },
          ].map((gate, i) => (
            <group key={i} position={gate.pos as [number, number, number]} rotation={gate.rot as [number, number, number]}>
              {/* Gate Torus Ring */}
              <mesh>
                <torusGeometry args={[1.4, 0.08, 16, 48]} />
                <meshStandardMaterial color={gate.color} emissive={gate.color} emissiveIntensity={1.2} />
              </mesh>
              {/* Support Pylons */}
              <mesh position={[-1.4, -gate.pos[1] / 2, 0]}>
                <cylinderGeometry args={[0.04, 0.04, gate.pos[1], 16]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              <mesh position={[1.4, -gate.pos[1] / 2, 0]}>
                <cylinderGeometry args={[0.04, 0.04, gate.pos[1], 16]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
            </group>
          ))}

          {/* Drone Enclosure Boundary Wireframe */}
          <gridHelper args={[20, 20, '#39FF6A', '#0E2A1F']} position={[0, 0, -8]} />
        </group>
      )}

      {/* 6. ROBOTIC ARM WORKBENCH (PICK & PLACE) */}
      {type === 'arena_pick_place' && (
        <group>
          {/* Heavy Steel Workbench Tabletop */}
          <mesh position={[0, -0.1, 0]} receiveShadow>
            <boxGeometry args={[3.2, 0.2, 2.2]} />
            <meshStandardMaterial color="#0A1C14" roughness={0.6} metalness={0.4} />
          </mesh>

          {/* Coordinate Precision Grid */}
          <gridHelper args={[2.8, 28, '#39FF6A', '#133527']} position={[0, 0.005, 0]} />

          {/* Colored Target Sorting Bins */}
          <mesh position={[-0.8, 0.08, 0.6]}>
            <boxGeometry args={[0.3, 0.14, 0.3]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
          <mesh position={[0, 0.08, 0.6]}>
            <boxGeometry args={[0.3, 0.14, 0.3]} />
            <meshStandardMaterial color="#39FF6A" />
          </mesh>
          <mesh position={[0.8, 0.08, 0.6]}>
            <boxGeometry args={[0.3, 0.14, 0.3]} />
            <meshStandardMaterial color="#3B82F6" />
          </mesh>

          {/* Pickable Cubes */}
          <mesh position={[-0.4, 0.05, -0.4]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#EF4444" roughness={0.3} />
          </mesh>
          <mesh position={[0.3, 0.05, -0.5]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#39FF6A" roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
};
