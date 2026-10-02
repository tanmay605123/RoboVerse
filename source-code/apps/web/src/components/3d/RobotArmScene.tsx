'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { GridFloor } from './GridFloor';
import { ParticleDust } from './ParticleDust';

function ArticulatedRobotArm() {
  const baseRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const gripperLeftRef = useRef<THREE.Mesh>(null);
  const gripperRightRef = useRef<THREE.Mesh>(null);

  const { pointer } = useThree();

  useFrame((state, delta) => {
    // Smooth lerp robot base rotation to point towards cursor
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

    // Micro pulsing on grippers
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

              {/* HUD 3D Tooltip Tag */}
              <Html position={[0.7, 0.6, 0]} center distanceFactor={8}>
                <div className="bg-[#040B08]/90 border border-robo-neon px-2.5 py-1 rounded-full text-[10px] font-mono text-robo-neon whitespace-nowrap shadow-neon-subtle flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-robo-neon animate-ping" />
                  <span>6-DOF ARM • ONLINE</span>
                </div>
              </Html>
            </group>
          </group>
        </group>
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
      <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5} position={[-2.8, 1.4, 0.5]}>
        <group ref={chipRef} scale={0.7}>
          {/* Chip Body */}
          <mesh>
            <boxGeometry args={[1.2, 0.2, 1.2]} />
            <meshStandardMaterial color="#0A1812" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Logo on IC */}
          <mesh position={[0, 0.11, 0]}>
            <planeGeometry args={[0.7, 0.7]} />
            <meshBasicMaterial color="#39FF6A" />
          </mesh>
          {/* IC Pins */}
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
            <div className="text-[10px] font-mono text-robo-teal bg-black/80 px-2 py-0.5 rounded border border-robo-teal/40">
              ATmega328P
            </div>
          </Html>
        </group>
      </Float>

      {/* Floating 220Ω Resistor */}
      <Float speed={3} rotationIntensity={1.5} floatIntensity={2} position={[2.9, 1.6, -0.2]}>
        <group ref={resistorRef} scale={0.8}>
          {/* Wire Leads */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={1} />
          </mesh>
          {/* Ceramic Body */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.8, 16]} />
            <meshStandardMaterial color="#D2B48C" roughness={0.5} />
          </mesh>
          {/* Color Bands (Red, Red, Brown, Gold) */}
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
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.8} position={[2.5, -0.6, 1.2]}>
        <group ref={ledRef} scale={0.7}>
          {/* Dome */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.8} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.28, 0.4, 16]} />
            <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.6} transparent opacity={0.85} />
          </mesh>
          {/* Pins */}
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
    <div className="w-full h-full min-h-[460px] md:min-h-[620px] relative">
      <Canvas
        camera={{ position: [0, 1.5, 5.8], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Ambient Cyber Lighting */}
          <ambientLight intensity={0.4} />
          
          {/* Soft Directional Rim Light */}
          <directionalLight position={[6, 8, 4]} intensity={1.2} color="#FFFFFF" />
          <directionalLight position={[-6, 6, -4]} intensity={0.8} color="#7FE7D6" />

          {/* Accent Colored Point Lights */}
          <pointLight position={[0, 3, 2]} intensity={1.8} color="#39FF6A" distance={8} />
          <pointLight position={[0, -1, 3]} intensity={1.2} color="#7FE7D6" distance={6} />

          {/* 3D Objects */}
          <ArticulatedRobotArm />
          <FloatingElectronics />
          <GridFloor />
          <ParticleDust count={60} />
        </Suspense>
      </Canvas>

      {/* Cybernetic HUD Corner Accents */}
      <div className="absolute top-4 left-4 pointer-events-none font-mono text-[10px] text-robo-textMuted flex flex-col gap-0.5">
        <span className="text-robo-neon font-bold">SYS // 3D_WORKBENCH_ACTIVE</span>
        <span>LATENCY: 12ms • REFRESH: 60FPS</span>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none font-mono text-[10px] text-robo-textMuted flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-robo-neon animate-pulse" />
        <span>INTERACTIVE 3D ARM • DRAG CURSOR</span>
      </div>
    </div>
  );
}
