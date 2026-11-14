'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GridFloor } from './GridFloor';
import { ParticleDust } from './ParticleDust';

interface FloatingLabelChipProps {
  name: string;
  tag: string;
  percentage: number;
  statusColor?: string;
  position: [number, number, number];
}

function FloatingLabelChip({
  name,
  tag,
  percentage,
  statusColor = '#39FF6A',
  position,
}: FloatingLabelChipProps) {
  const circumference = 2 * Math.PI * 10;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Html position={position} center distanceFactor={7}>
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#040B08]/95 border border-[rgba(57,255,106,0.35)] backdrop-blur-md shadow-[0_0_15px_rgba(57,255,106,0.25)] pointer-events-none select-none">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6 transform -rotate-90">
            <circle cx="12" cy="12" r="10" stroke="#0E2A1F" strokeWidth="2.5" fill="none" />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={statusColor}
              strokeWidth="2.5"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className="absolute text-[8px] font-mono font-bold text-[#EAF7EF]">
            {percentage}%
          </span>
        </div>
        <div className="flex flex-col text-left pr-1">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-[10px] font-bold text-[#EAF7EF] tracking-tight whitespace-nowrap">
              {name}
            </span>
          </div>
          <span className="text-[8px] font-mono text-[#8FA99B] whitespace-nowrap">{tag}</span>
        </div>
      </div>
    </Html>
  );
}

function ArticulatedRobotArm() {
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const gripperLeftRef = useRef<THREE.Mesh>(null);
  const gripperRightRef = useRef<THREE.Mesh>(null);

  const { pointer } = useThree();

  useFrame((state, delta) => {
    const targetY = pointer.x * 0.9;
    const targetShoulderX = -pointer.y * 0.45;
    const targetElbowX = pointer.y * 0.35 + 0.3;

    if (baseRef.current) {
      baseRef.current.rotation.y = THREE.MathUtils.lerp(baseRef.current.rotation.y, targetY, delta * 3);
    }
    if (shoulderRef.current) {
      shoulderRef.current.rotation.z = THREE.MathUtils.lerp(
        shoulderRef.current.rotation.z,
        targetShoulderX,
        delta * 3
      );
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.z = THREE.MathUtils.lerp(elbowRef.current.rotation.z, targetElbowX, delta * 3);
    }
    if (wristRef.current) {
      wristRef.current.rotation.y += delta * 0.8;
    }

    const gripPulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.05 + 0.15;
    if (gripperLeftRef.current) gripperLeftRef.current.position.x = -gripPulse;
    if (gripperRightRef.current) gripperRightRef.current.position.x = gripPulse;
  });

  return (
    <group position={[0, -1.8, 0]}>
      {/* Platform Pedestal */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.5, 1.8, 0.3, 32]} />
        <meshStandardMaterial color="#0A2218" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Glowing Neon Ring on Pedestal */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.35, 32]} />
        <meshBasicMaterial color="#39FF6A" side={THREE.DoubleSide} />
      </mesh>

      {/* Rotating Robot Base */}
      <group ref={baseRef} position={[0, 0.3, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 0.7, 24]} />
          <meshStandardMaterial color="#0E3324" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Dual Shoulder Joint Brackets */}
        <mesh position={[0.5, 0.85, 0]}>
          <boxGeometry args={[0.2, 0.7, 0.6]} />
          <meshStandardMaterial color="#081811" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[-0.5, 0.85, 0]}>
          <boxGeometry args={[0.2, 0.7, 0.6]} />
          <meshStandardMaterial color="#081811" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Shoulder Pivot & Arm 1 */}
        <group ref={shoulderRef} position={[0, 0.9, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 1.1, 24]} />
            <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.25} />
          </mesh>

          {/* Lower Arm Bicep */}
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.4, 2.0, 0.45]} />
            <meshStandardMaterial color="#0F3826" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Accent Circuit Strip on Arm */}
          <mesh position={[0.21, 1.1, 0]}>
            <boxGeometry args={[0.02, 1.6, 0.15]} />
            <meshBasicMaterial color="#7FE7D6" />
          </mesh>

          {/* Elbow Joint Pivot & Arm 2 */}
          <group ref={elbowRef} position={[0, 2.1, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.32, 0.32, 0.9, 24]} />
              <meshStandardMaterial color="#7FE7D6" emissive="#7FE7D6" emissiveIntensity={0.3} />
            </mesh>

            {/* Forearm */}
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.22, 0.28, 1.6, 16]} />
              <meshStandardMaterial color="#0A2218" roughness={0.4} metalness={0.7} />
            </mesh>

            {/* Wrist & Gripper Assembly */}
            <group ref={wristRef} position={[0, 1.8, 0]}>
              <mesh>
                <sphereGeometry args={[0.28, 16, 16]} />
                <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.4} />
              </mesh>

              {/* Gripper Base Plate */}
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[0.6, 0.15, 0.3]} />
                <meshStandardMaterial color="#05140D" roughness={0.5} metalness={0.9} />
              </mesh>

              {/* Left Clamp Finger */}
              <mesh ref={gripperLeftRef} position={[-0.18, 0.55, 0]}>
                <boxGeometry args={[0.08, 0.45, 0.12]} />
                <meshStandardMaterial color="#7FE7D6" roughness={0.2} metalness={0.9} />
              </mesh>

              {/* Right Clamp Finger */}
              <mesh ref={gripperRightRef} position={[0.18, 0.55, 0]}>
                <boxGeometry args={[0.08, 0.45, 0.12]} />
                <meshStandardMaterial color="#7FE7D6" roughness={0.2} metalness={0.9} />
              </mesh>

              {/* Laser Target Beam from End Effector */}
              <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
                <meshBasicMaterial color="#39FF6A" transparent opacity={0.6} />
              </mesh>

              {/* Floating Label Chip with Percentage Ring */}
              <FloatingLabelChip
                name="6-DOF Articulated Arm"
                tag="Inverse Kinematics • Calibrated"
                percentage={84}
                statusColor="#39FF6A"
                position={[1.2, 1.4, 0]}
              />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function AutonomousRoverPlatform() {
  const roverRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (roverRef.current) {
      roverRef.current.position.y = -1.35 + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  return (
    <group position={[-3.6, -1.8, -0.6]}>
      {/* Platform Pedestal */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.3, 1.5, 0.24, 28]} />
        <meshStandardMaterial color="#0A2218" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Glowing Teal Ring */}
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.15, 28]} />
        <meshBasicMaterial color="#7FE7D6" side={THREE.DoubleSide} />
      </mesh>

      {/* Rover Body */}
      <group ref={roverRef} position={[0, 0.45, 0]}>
        {/* Chassis */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.4, 0.22, 1.8]} />
          <meshStandardMaterial color="#0E2B1E" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Wheels */}
        {[-0.8, 0.8].map((x) =>
          [-0.6, 0.6].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.26, 0.26, 0.22, 16]} />
              <meshStandardMaterial color="#040B08" roughness={0.8} />
            </mesh>
          ))
        )}
        {/* Ultrasonic Sensor Eyes */}
        <mesh position={[-0.2, 0.35, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
          <meshStandardMaterial color="#7FE7D6" emissive="#7FE7D6" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.2, 0.35, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
          <meshStandardMaterial color="#7FE7D6" emissive="#7FE7D6" emissiveIntensity={0.5} />
        </mesh>

        {/* Floating Label Chip with Percentage Ring */}
        <FloatingLabelChip
          name="Autonomous 4WD Rover"
          tag="PID Control • 4/4 Subsystems"
          percentage={92}
          statusColor="#39FF6A"
          position={[0, 1.2, 0]}
        />
      </group>
    </group>
  );
}

function DronePlatform() {
  const droneRef = useRef<THREE.Group>(null);
  const prop1Ref = useRef<THREE.Mesh>(null);
  const prop2Ref = useRef<THREE.Mesh>(null);
  const prop3Ref = useRef<THREE.Mesh>(null);
  const prop4Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (droneRef.current) {
      droneRef.current.position.y = -1.2 + Math.sin(state.clock.elapsedTime * 2.0) * 0.06;
      droneRef.current.rotation.y += delta * 0.2;
    }
    const propSpeed = delta * 25;
    if (prop1Ref.current) prop1Ref.current.rotation.y += propSpeed;
    if (prop2Ref.current) prop2Ref.current.rotation.y -= propSpeed;
    if (prop3Ref.current) prop3Ref.current.rotation.y += propSpeed;
    if (prop4Ref.current) prop4Ref.current.rotation.y -= propSpeed;
  });

  return (
    <group position={[3.6, -1.8, -0.6]}>
      {/* Platform Pedestal */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.3, 1.5, 0.24, 28]} />
        <meshStandardMaterial color="#0A2218" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Glowing Orange Warning Ring (Needs Attention / Fault) */}
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.15, 28]} />
        <meshBasicMaterial color="#FF9A1F" side={THREE.DoubleSide} />
      </mesh>

      {/* Drone Quadcopter */}
      <group ref={droneRef} position={[0, 0.6, 0]}>
        {/* Core Hub */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.3, 0.35, 0.15, 16]} />
          <meshStandardMaterial color="#0E2B1E" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* 4 Carbon Arms */}
        {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((angle, idx) => {
          const armX = Math.cos(angle) * 0.7;
          const armZ = Math.sin(angle) * 0.7;
          return (
            <group key={idx} position={[armX, 0.1, armZ]}>
              <mesh>
                <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
                <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.3} />
              </mesh>
              {/* Spinning Propeller */}
              <mesh
                ref={idx === 0 ? prop1Ref : idx === 1 ? prop2Ref : idx === 2 ? prop3Ref : prop4Ref}
                position={[0, 0.12, 0]}
              >
                <boxGeometry args={[0.7, 0.015, 0.08]} />
                <meshBasicMaterial color="#7FE7D6" transparent opacity={0.7} />
              </mesh>
            </group>
          );
        })}

        {/* Floating Label Chip with Percentage Ring (Needs Attention / Orange) */}
        <FloatingLabelChip
          name="AeroDrone Quad X1"
          tag="IMU Echo Jitter • Firmware Fix"
          percentage={65}
          statusColor="#FF9A1F"
          position={[0, 1.3, 0]}
        />
      </group>
    </group>
  );
}

function FloatingElectronics() {
  const chipRef = useRef<THREE.Group>(null);
  const resistorRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (chipRef.current) {
      chipRef.current.rotation.x += delta * 0.4;
      chipRef.current.rotation.y += delta * 0.6;
    }
    if (resistorRef.current) {
      resistorRef.current.rotation.y += delta * 0.5;
      resistorRef.current.rotation.z += delta * 0.3;
    }
    if (ledRef.current) {
      ledRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <>
      {/* Floating Microcontroller IC Chip */}
      <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5} position={[-2.4, 2.2, 0.8]}>
        <group ref={chipRef} scale={0.65}>
          <mesh>
            <boxGeometry args={[1.2, 0.2, 1.2]} />
            <meshStandardMaterial color="#0A1812" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <planeGeometry args={[0.7, 0.7]} />
            <meshBasicMaterial color="#39FF6A" />
          </mesh>
          {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
            <React.Fragment key={i}>
              <mesh position={[x, -0.05, 0.68]}>
                <boxGeometry args={[0.08, 0.04, 0.2]} />
                <meshStandardMaterial color="#7FE7D6" metalness={1} />
              </mesh>
              <mesh position={[x, -0.05, -0.68]}>
                <boxGeometry args={[0.08, 0.04, 0.2]} />
                <meshStandardMaterial color="#7FE7D6" metalness={1} />
              </mesh>
            </React.Fragment>
          ))}
          <Html position={[0, -0.8, 0]} center distanceFactor={7}>
            <div className="text-[9px] font-mono text-[#7FE7D6] bg-black/80 px-2 py-0.5 rounded border border-[#7FE7D6]/40">
              ATmega328P
            </div>
          </Html>
        </group>
      </Float>

      {/* Floating 220Ω Resistor */}
      <Float speed={3} rotationIntensity={1.5} floatIntensity={2} position={[2.6, 2.3, 0.3]}>
        <group ref={resistorRef} scale={0.75}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={1} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.8, 16]} />
            <meshStandardMaterial color="#D2B48C" roughness={0.5} />
          </mesh>
          <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.185, 0.185, 0.06, 16]} />
            <meshBasicMaterial color="#FF3333" />
          </mesh>
          <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.185, 0.185, 0.06, 16]} />
            <meshBasicMaterial color="#FF3333" />
          </mesh>
          <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.185, 0.185, 0.06, 16]} />
            <meshBasicMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.185, 0.185, 0.06, 16]} />
            <meshBasicMaterial color="#DAA520" />
          </mesh>
        </group>
      </Float>

      {/* Floating 5mm Glowing Neon Green LED */}
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.8} position={[0, 2.6, -1.0]}>
        <group ref={ledRef} scale={0.65}>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.8} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.28, 0.4, 16]} />
            <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.6} transparent opacity={0.85} />
          </mesh>
          <mesh position={[-0.08, -0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={1} />
          </mesh>
          <mesh position={[0.08, -0.45, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={1} />
          </mesh>
        </group>
      </Float>
    </>
  );
}

export function RobotArmScene() {
  return (
    <div className="w-full h-full min-h-[480px] md:min-h-[580px] relative">
      <Canvas
        camera={{ position: [0, 1.8, 6.5], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Ambient Cyber Control-Room Lighting */}
          <ambientLight intensity={0.45} />
          
          {/* Directional Soft Lighting */}
          <directionalLight position={[6, 9, 5]} intensity={1.2} color="#FFFFFF" />
          <directionalLight position={[-6, 7, -4]} intensity={0.8} color="#7FE7D6" />

          {/* Accent Neon Point Lights */}
          <pointLight position={[0, 3, 2]} intensity={2.0} color="#39FF6A" distance={9} />
          <pointLight position={[-3.6, 1, 2]} intensity={1.5} color="#7FE7D6" distance={7} />
          <pointLight position={[3.6, 1, 2]} intensity={1.5} color="#FF9A1F" distance={7} />

          {/* 3D Objects on Platforms with Glow Rings & Floating Percentage-Ring Labels */}
          <ArticulatedRobotArm />
          <AutonomousRoverPlatform />
          <DronePlatform />
          <FloatingElectronics />
          <GridFloor />
          <ParticleDust count={75} />
        </Suspense>
      </Canvas>

      {/* Cybernetic HUD Corner Accents */}
      <div className="absolute top-4 left-4 pointer-events-none font-mono text-[10px] text-[#8FA99B] flex flex-col gap-0.5">
        <span className="text-[#39FF6A] font-bold">ROBOVERSE_LAB // 3D_HUD_ACTIVE</span>
        <span>STATUS: 3 ROBOTS SYNCHRONIZED • 60 FPS</span>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none font-mono text-[10px] text-[#8FA99B] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-pulse shadow-[0_0_8px_#39FF6A]" />
        <span>INTERACTIVE 3D LAB • ORBIT/ZOOM ENABLED</span>
      </div>
    </div>
  );
}
