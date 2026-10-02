'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Play, Square, RotateCcw, Compass, Activity, Navigation, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface RoverState {
  x: number;
  z: number;
  heading: number; // in radians
  speed: number;
  steering: number;
  sonarDistance: number;
  isDriving: boolean;
  mode: 'OBSTACLE_AVOIDANCE' | 'LINE_FOLLOWER' | 'MANUAL';
}

const OBSTACLES = [
  { x: 3, z: 2, radius: 1.0 },
  { x: -3, z: 3, radius: 1.2 },
  { x: 0, z: 5, radius: 0.9 },
  { x: -2, z: -3, radius: 1.1 },
  { x: 4, z: -2, radius: 0.8 },
];

function Rover3D({ roverState }: { roverState: RoverState }) {
  const roverGroupRef = useRef<THREE.Group>(null);
  const leftWheelRef = useRef<THREE.Mesh>(null);
  const rightWheelRef = useRef<THREE.Mesh>(null);
  const sonarTurretRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (roverGroupRef.current) {
      roverGroupRef.current.position.set(roverState.x, 0.25, roverState.z);
      roverGroupRef.current.rotation.y = roverState.heading;
    }

    if (roverState.isDriving) {
      if (leftWheelRef.current) leftWheelRef.current.rotation.x += roverState.speed * 8 * delta;
      if (rightWheelRef.current) rightWheelRef.current.rotation.x += roverState.speed * 8 * delta;
      if (sonarTurretRef.current) {
        sonarTurretRef.current.rotation.y = Math.sin(Date.now() * 0.005) * 0.5;
      }
    }
  });

  return (
    <group ref={roverGroupRef}>
      {/* Acrylic Transparent Chassis Plate */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.6, 0.08, 2.2]} />
        <meshPhysicalMaterial
          color="#0A84FF"
          transmission={0.6}
          opacity={0.8}
          transparent
          roughness={0.2}
        />
      </mesh>

      {/* Arduino Uno Controller on Chassis */}
      <mesh position={[0, 0.3, 0.2]}>
        <boxGeometry args={[1.0, 0.06, 0.8]} />
        <meshStandardMaterial color="#0A5C80" />
      </mesh>

      {/* L298N Dual H-Bridge Motor Driver */}
      <mesh position={[0, 0.3, -0.4]}>
        <boxGeometry args={[0.7, 0.06, 0.6]} />
        <meshStandardMaterial color="#B01B1B" />
      </mesh>

      {/* SG90 Servo Turret with HC-SR04 Sonar Head */}
      <group ref={sonarTurretRef} position={[0, 0.45, 0.9]}>
        {/* Servo Horn */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#0A84FF" />
        </mesh>
        {/* Ultrasonic Sensor Eyes */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.08]} />
          <meshStandardMaterial color="#005B94" />
        </mesh>
        <mesh position={[-0.22, 0.12, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.8} />
        </mesh>
        <mesh position={[0.22, 0.12, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.8} />
        </mesh>

        {/* Sonar Ping Beam Conical Light */}
        {roverState.isDriving && (
          <mesh position={[0, 0.12, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.7, 2.0, 16, 1, true]} />
            <meshBasicMaterial
              color="#39FF6A"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* Left Motor & Wheel */}
      <mesh ref={leftWheelRef} position={[-0.9, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 24]} />
        <meshStandardMaterial color="#111111" roughness={0.7} />
      </mesh>

      {/* Right Motor & Wheel */}
      <mesh ref={rightWheelRef} position={[0.9, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 24]} />
        <meshStandardMaterial color="#111111" roughness={0.7} />
      </mesh>

      {/* Front & Rear Caster Ball Glides */}
      <mesh position={[0, 0.08, 0.8]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#D0D0D0" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.08, -0.8]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#D0D0D0" metalness={0.9} />
      </mesh>
    </group>
  );
}

export const RobotBuilderArena: React.FC = () => {
  const [roverState, setRoverState] = useState<RoverState>({
    x: 0,
    z: 0,
    heading: 0,
    speed: 0,
    steering: 0,
    sonarDistance: 120,
    isDriving: false,
    mode: 'OBSTACLE_AVOIDANCE',
  });

  // Kinematics and obstacle detection loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      setRoverState((prev) => {
        if (!prev.isDriving) return prev;

        let speed = prev.speed;
        let heading = prev.heading;
        let x = prev.x;
        let z = prev.z;

        // Sonar Raycasting against obstacles
        let closestDist = 999;
        const forwardVector = new THREE.Vector2(Math.sin(heading), Math.cos(heading));

        OBSTACLES.forEach((obs) => {
          const toObs = new THREE.Vector2(obs.x - x, obs.z - z);
          const dist = toObs.length() - obs.radius;
          const dot = forwardVector.dot(toObs.normalize());

          if (dot > 0.6 && dist < closestDist) {
            closestDist = Math.max(5, Math.round(dist * 20)); // in cm
          }
        });

        // Obstacle Avoidance AI Algorithm
        if (prev.mode === 'OBSTACLE_AVOIDANCE') {
          if (closestDist < 40) {
            // Urgent obstacle! Slow down and turn away
            speed = 0.02;
            heading += 0.05;
          } else {
            // Clear path: drive forward
            speed = 0.06;
          }
        } else if (prev.mode === 'LINE_FOLLOWER') {
          // Autonomous oval curve tracking
          speed = 0.05;
          heading += 0.015;
        }

        // Apply velocities
        x += Math.sin(heading) * speed;
        z += Math.cos(heading) * speed;

        // Bounds constrain (-10 to 10)
        if (x > 8 || x < -8 || z > 8 || z < -8) {
          heading += Math.PI * 0.8;
          x = THREE.MathUtils.clamp(x, -7.5, 7.5);
          z = THREE.MathUtils.clamp(z, -7.5, 7.5);
        }

        return {
          ...prev,
          x,
          z,
          heading,
          speed,
          sonarDistance: closestDist === 999 ? 150 : closestDist,
        };
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleManualMove = (direction: 'F' | 'B' | 'L' | 'R') => {
    setRoverState((prev) => {
      let x = prev.x;
      let z = prev.z;
      let heading = prev.heading;
      const step = 0.4;

      if (direction === 'F') {
        x += Math.sin(heading) * step;
        z += Math.cos(heading) * step;
      } else if (direction === 'B') {
        x -= Math.sin(heading) * step;
        z -= Math.cos(heading) * step;
      } else if (direction === 'L') {
        heading -= 0.2;
      } else if (direction === 'R') {
        heading += 0.2;
      }

      return { ...prev, x, z, heading, isDriving: true, mode: 'MANUAL' };
    });
  };

  const resetRover = () => {
    setRoverState({
      x: 0,
      z: 0,
      heading: 0,
      speed: 0,
      steering: 0,
      sonarDistance: 120,
      isDriving: false,
      mode: 'OBSTACLE_AVOIDANCE',
    });
  };

  return (
    <div className="relative w-full h-full bg-[#050D09] select-none font-sans overflow-hidden">
      {/* 3D ARENA CANVAS */}
      <Canvas camera={{ position: [0, 12, 14], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <pointLight position={[0, 5, 0]} intensity={1.5} color="#39FF6A" distance={20} />

        <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={25} />

        {/* Floor Arena Grid with glowing border */}
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#0A1812" roughness={0.8} />
        </mesh>
        <gridHelper args={[20, 20, '#39FF6A', '#1E4D38']} position={[0, 0, 0]} />

        {/* Arena Boundary Walls */}
        <mesh position={[0, 0.5, 10]}>
          <boxGeometry args={[20, 1, 0.2]} />
          <meshStandardMaterial color="#1E4D38" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.5, -10]}>
          <boxGeometry args={[20, 1, 0.2]} />
          <meshStandardMaterial color="#1E4D38" transparent opacity={0.6} />
        </mesh>
        <mesh position={[10, 0.5, 0]}>
          <boxGeometry args={[0.2, 1, 20]} />
          <meshStandardMaterial color="#1E4D38" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-10, 0.5, 0]}>
          <boxGeometry args={[0.2, 1, 20]} />
          <meshStandardMaterial color="#1E4D38" transparent opacity={0.6} />
        </mesh>

        {/* Obstacle Blocks in Arena */}
        {OBSTACLES.map((obs, idx) => (
          <mesh key={idx} position={[obs.x, 0.6, obs.z]}>
            <cylinderGeometry args={[obs.radius, obs.radius, 1.2, 24]} />
            <meshStandardMaterial
              color="#FF9A1F"
              roughness={0.4}
              emissive="#FF9A1F"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}

        {/* Rover in Arena */}
        <Rover3D roverState={roverState} />
      </Canvas>

      {/* TOP TELEMETRY HUD */}
      <div className="absolute top-4 left-6 flex items-center gap-4 bg-[#07110D]/90 backdrop-blur-md p-3 rounded-2xl border border-[#39FF6A]/30 shadow-xl font-mono text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#39FF6A]" />
          <span className="font-bold text-white">RoboVerse 2WD Autonomous Rover</span>
        </div>
        <div className="w-[1px] h-4 bg-gray-700" />
        <div className="text-gray-300">
          Sonar Distance:{' '}
          <span
            className={`font-bold ${
              roverState.sonarDistance < 40 ? 'text-[#FF3939] animate-pulse' : 'text-[#39FF6A]'
            }`}
          >
            {roverState.sonarDistance} cm
          </span>
        </div>
        <div className="w-[1px] h-4 bg-gray-700" />
        <div className="text-gray-300">
          Status:{' '}
          <span className="text-[#7FE7D6]">
            {roverState.isDriving ? roverState.mode : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* BOTTOM CONTROL DOCK */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#07110D]/90 backdrop-blur-xl p-3.5 rounded-3xl border border-[#39FF6A]/40 shadow-2xl flex items-center gap-4">
        {/* Drive Toggle */}
        {roverState.isDriving ? (
          <button
            onClick={() => setRoverState((prev) => ({ ...prev, isDriving: false }))}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF3939]/20 hover:bg-[#FF3939]/30 text-[#FF3939] border border-[#FF3939]/50 rounded-2xl font-bold text-xs transition"
          >
            <Square className="w-4 h-4 fill-current" />
            Halt Rover
          </button>
        ) : (
          <button
            onClick={() => setRoverState((prev) => ({ ...prev, isDriving: true }))}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black rounded-2xl font-bold text-xs transition shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Autonomous Drive
          </button>
        )}

        {/* Mode Selector */}
        <div className="flex bg-[#0E2A1F] p-1 rounded-xl border border-gray-800 text-xs">
          <button
            onClick={() =>
              setRoverState((p) => ({ ...p, mode: 'OBSTACLE_AVOIDANCE', isDriving: true }))
            }
            className={`px-3 py-1.5 rounded-lg transition ${
              roverState.mode === 'OBSTACLE_AVOIDANCE'
                ? 'bg-[#39FF6A] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Obstacle Avoidance
          </button>
          <button
            onClick={() =>
              setRoverState((p) => ({ ...p, mode: 'LINE_FOLLOWER', isDriving: true }))
            }
            className={`px-3 py-1.5 rounded-lg transition ${
              roverState.mode === 'LINE_FOLLOWER'
                ? 'bg-[#7FE7D6] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Line Follower
          </button>
        </div>

        {/* Manual WASD / Arrow D-Pad */}
        <div className="flex items-center gap-1 bg-[#0E2A1F] p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => handleManualMove('L')}
            className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
            title="Turn Left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManualMove('F')}
            className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
            title="Forward"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManualMove('B')}
            className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
            title="Reverse"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManualMove('R')}
            className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
            title="Turn Right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Reset button */}
        <button
          onClick={resetRover}
          className="p-2.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-2xl border border-gray-700 transition"
          title="Reset Rover to Origin"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
