'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRobotStore, AttachedRobotPart, ChassisType } from '@/store/useRobotStore';

interface Robot3DAssemblyProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isBuilderMode?: boolean;
}

export const Robot3DAssembly: React.FC<Robot3DAssemblyProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isBuilderMode = false,
}) => {
  const {
    chassisType,
    attachedParts,
    centerOfMass,
    linearVelocityMps,
    leftMotorRpm,
    rightMotorRpm,
    sonarDistanceCm,
    lineSensors,
    attachPart,
  } = useRobotStore();

  const wheelSpinRef = useRef<number>(0);
  const propSpinRef = useRef<number>(0);

  useFrame((_, delta) => {
    // Spin wheels according to speed
    wheelSpinRef.current += (linearVelocityMps > 0 ? linearVelocityMps * 12 : 0) * delta;
    // Spin drone props
    propSpinRef.current += 35 * delta;
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ==================== 1. CHASSIS BASE FRAMES ==================== */}

      {/* 2WD DIFFERENTIAL ROVER CHASSIS */}
      {chassisType === 'chassis_2wd' && (
        <group>
          {/* Main Acrylic Lower Deck */}
          <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.1, 0.04, 1.4]} />
            <meshStandardMaterial color="#0284C7" transparent opacity={0.85} roughness={0.2} metalness={0.1} />
          </mesh>

          {/* Upper Electronics Standoff Deck */}
          <mesh position={[0, 0.18, 0.05]} castShadow>
            <boxGeometry args={[0.9, 0.03, 1.1]} />
            <meshStandardMaterial color="#0369A1" transparent opacity={0.75} roughness={0.2} />
          </mesh>

          {/* Brass Standoff Spacers */}
          {[-0.4, 0.4].map((x) =>
            [-0.4, 0.4].map((z) => (
              <mesh key={`${x}_${z}`} position={[x, 0.13, z]}>
                <cylinderGeometry args={[0.015, 0.015, 0.1, 12]} />
                <meshStandardMaterial color="#FACC15" metalness={0.9} roughness={0.2} />
              </mesh>
            ))
          )}

          {/* Front Omni Metal Ball Caster */}
          <mesh position={[0, 0.04, -0.55]} castShadow>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Chassis Extruded Side Wiring Rails */}
          <mesh position={[-0.56, 0.08, 0]}>
            <boxGeometry args={[0.02, 0.02, 1.35]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
          <mesh position={[0.56, 0.08, 0]}>
            <boxGeometry args={[0.02, 0.02, 1.35]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
        </group>
      )}

      {/* 4WD ROVER CHASSIS */}
      {chassisType === 'chassis_4wd' && (
        <group>
          {/* Anodized Black Aluminum Plate */}
          <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.3, 0.04, 1.6]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.1, 0.03, 1.3]} />
            <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* DRONE F450 COMPOSITE FRAME */}
      {chassisType === 'drone_f450' && (
        <group>
          {/* Central Distribution Core Plates */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.03, 32]} />
            <meshStandardMaterial color="#111827" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.03, 32]} />
            <meshStandardMaterial color="#111827" roughness={0.3} />
          </mesh>

          {/* 4 Angled Molded Arms */}
          {[
            { angle: Math.PI / 4, color: '#DC2626' }, // Front-Right (Red orientation)
            { angle: (3 * Math.PI) / 4, color: '#DC2626' }, // Front-Left (Red orientation)
            { angle: (5 * Math.PI) / 4, color: '#FFFFFF' }, // Rear-Left (White)
            { angle: (7 * Math.PI) / 4, color: '#FFFFFF' }, // Rear-Right (White)
          ].map((arm, i) => (
            <group key={i} rotation={[0, arm.angle, 0]}>
              <mesh position={[0.55, 0.1, 0]}>
                <boxGeometry args={[0.8, 0.05, 0.06]} />
                <meshStandardMaterial color={arm.color} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 4-DOF ROBOTIC ARM BASE */}
      {chassisType === 'arm_4dof' && (
        <group>
          {/* Circular Ground Turntable Stand */}
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <cylinderGeometry args={[0.5, 0.55, 0.08, 32]} />
            <meshStandardMaterial color="#0A2C1D" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Articulated Lower Segment */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.18, 0.28, 24]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} />
          </mesh>
          {/* Shoulder Linkage Bone */}
          <mesh position={[0, 0.48, 0.08]} rotation={[0.4, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.38, 0.06]} />
            <meshStandardMaterial color="#39FF6A" roughness={0.3} />
          </mesh>
          {/* Elbow Joint Bone */}
          <mesh position={[0, 0.72, -0.05]} rotation={[-0.6, 0, 0]} castShadow>
            <boxGeometry args={[0.07, 0.35, 0.05]} />
            <meshStandardMaterial color="#7FE7D6" roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* ==================== 2. ATTACHED PARTS ==================== */}
      {attachedParts.map((part) => {
        const isLeftWheel = part.id.includes('wheel_l') || part.snapPointId.includes('motor_l');
        const isRightWheel = part.id.includes('wheel_r') || part.snapPointId.includes('motor_r');
        const isMotor = part.category === 'motor';
        const isWheel = part.category === 'wheel' || isLeftWheel || isRightWheel;
        const isSonar = part.componentTypeId.includes('ultrasonic') || part.componentTypeId.includes('sonar');
        const isLineArray = part.componentTypeId.includes('ir_line');
        const isController = part.category === 'controller';
        const isBattery = part.category === 'battery';
        const isPropeller = part.category === 'propeller';
        const isGripper = part.category === 'gripper';

        return (
          <group key={part.id} position={part.position} rotation={part.rotation || [0, 0, 0]}>
            {/* DC Gear Motor + Rubber Wheel */}
            {isWheel && (
              <group>
                {/* Yellow Gearbox */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.12, 0.08, 0.16]} />
                  <meshStandardMaterial color="#EAB308" roughness={0.4} />
                </mesh>
                {/* Spinning Rubber Tire */}
                <group rotation={[wheelSpinRef.current, 0, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.16, 0.16, 0.07, 32]} />
                    <meshStandardMaterial color="#111827" roughness={0.9} />
                  </mesh>
                  {/* Wheel Rim Spokes */}
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.09, 0.09, 0.072, 16]} />
                    <meshStandardMaterial color="#FACC15" roughness={0.4} />
                  </mesh>
                </group>
              </group>
            )}

            {/* Brushless Drone Motor with Spinning Propeller */}
            {isPropeller && (
              <group>
                {/* Motor Outrunner */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.08, 0.08, 0.08, 24]} />
                  <meshStandardMaterial color="#EAB308" metalness={0.8} roughness={0.3} />
                </mesh>
                {/* Spinning 1045 Propeller */}
                <group rotation={[0, propSpinRef.current, 0]}>
                  <mesh position={[0, 0.06, 0]}>
                    <boxGeometry args={[0.9, 0.015, 0.06]} />
                    <meshStandardMaterial color="#DC2626" roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.06, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
                    <meshStandardMaterial color="#1E293B" />
                  </mesh>
                </group>
              </group>
            )}

            {/* Arduino / Flight Controller Board */}
            {isController && (
              <group>
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[0.42, 0.03, 0.58]} />
                  <meshStandardMaterial color="#00878F" roughness={0.3} metalness={0.2} />
                </mesh>
                {/* ATmega / MCU chip */}
                <mesh position={[0, 0.025, 0]}>
                  <boxGeometry args={[0.18, 0.02, 0.18]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.2} />
                </mesh>
                {/* Silver USB port */}
                <mesh position={[0, 0.03, -0.27]}>
                  <boxGeometry args={[0.09, 0.05, 0.08]} />
                  <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Pin headers */}
                <mesh position={[-0.18, 0.03, 0]}>
                  <boxGeometry args={[0.03, 0.03, 0.5]} />
                  <meshStandardMaterial color="#0F172A" />
                </mesh>
                <mesh position={[0.18, 0.03, 0]}>
                  <boxGeometry args={[0.03, 0.03, 0.5]} />
                  <meshStandardMaterial color="#0F172A" />
                </mesh>
              </group>
            )}

            {/* Battery Pack */}
            {isBattery && (
              <group>
                <mesh position={[0, 0, 0]} castShadow>
                  <boxGeometry args={[0.32, 0.12, 0.42]} />
                  <meshStandardMaterial color="#0369A1" roughness={0.4} />
                </mesh>
                {/* Red/Black Leads */}
                <mesh position={[0, 0.07, 0.2]}>
                  <boxGeometry args={[0.08, 0.02, 0.04]} />
                  <meshStandardMaterial color="#EF4444" />
                </mesh>
              </group>
            )}

            {/* Ultrasonic Sonar Sensor with Live Acoustic Cone */}
            {isSonar && (
              <group>
                {/* PCB Board */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.28, 0.12, 0.03]} />
                  <meshStandardMaterial color="#1D4ED8" />
                </mesh>
                {/* Left Acoustic Transducer */}
                <mesh position={[-0.08, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.06, 24]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
                </mesh>
                {/* Right Acoustic Transducer */}
                <mesh position={[0.08, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.06, 24]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* SENSOR CONE RAYCAST (Visualizing acoustic beam) */}
                <group position={[0, 0, -0.08]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -(sonarDistanceCm / 100) / 2]}>
                    <coneGeometry args={[0.35 * (sonarDistanceCm / 100), sonarDistanceCm / 100, 24, 1, true]} />
                    <meshBasicMaterial
                      color="#38BDF8"
                      transparent
                      opacity={0.18}
                      wireframe={false}
                      depthWrite={false}
                    />
                  </mesh>
                  {/* Outer ray indicator wire */}
                  <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -(sonarDistanceCm / 100) / 2]}>
                    <coneGeometry args={[0.35 * (sonarDistanceCm / 100), sonarDistanceCm / 100, 16, 1, true]} />
                    <meshBasicMaterial color="#7FE7D6" wireframe transparent opacity={0.35} />
                  </mesh>
                </group>
              </group>
            )}

            {/* 5-Channel Infrared Line Sensor Array with Downward Lasers */}
            {isLineArray && (
              <group>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.45, 0.02, 0.1]} />
                  <meshStandardMaterial color="#0F172A" />
                </mesh>
                {/* 5 IR LEDs & Downward Detection Rays */}
                {[-0.18, -0.09, 0, 0.09, 0.18].map((lx, idx) => {
                  const isDetectingBlack = lineSensors[idx];
                  return (
                    <group key={idx} position={[lx, -0.015, 0]}>
                      <mesh>
                        <boxGeometry args={[0.02, 0.015, 0.03]} />
                        <meshStandardMaterial color="#38BDF8" />
                      </mesh>
                      {/* Downward Sensing Beam */}
                      <lineSegments>
                        <bufferGeometry>
                          <bufferAttribute
                            attach="attributes-position"
                            args={[new Float32Array([0, 0, 0, 0, -0.05, 0]), 3]}
                          />
                        </bufferGeometry>
                        <lineBasicMaterial color={isDetectingBlack ? '#39FF6A' : '#EF4444'} />
                      </lineSegments>
                    </group>
                  );
                })}
              </group>
            )}

            {/* Gripper Clamp */}
            {isGripper && (
              <group>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.18, 0.08, 0.12]} />
                  <meshStandardMaterial color="#059669" />
                </mesh>
                {/* Left Claw Prong */}
                <mesh position={[-0.08, 0, 0.1]} rotation={[0, -0.2, 0]}>
                  <boxGeometry args={[0.03, 0.06, 0.16]} />
                  <meshStandardMaterial color="#047857" />
                </mesh>
                {/* Right Claw Prong */}
                <mesh position={[0.08, 0, 0.1]} rotation={[0, 0.2, 0]}>
                  <boxGeometry args={[0.03, 0.06, 0.16]} />
                  <meshStandardMaterial color="#047857" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* ==================== 3. CHASSIS RAIL WIRING PREVIEW ==================== */}
      <group>
        {/* Left rail power/signal conduit */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  -0.54, 0.09, -0.6,  -0.54, 0.09, 0.5,
                  -0.54, 0.09, 0.2,   0, 0.18, 0.4,
                  -0.54, 0.09, -0.3,  0, 0.12, -0.3,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#39FF6A" linewidth={2} />
        </lineSegments>
        {/* Right rail ground return conduit */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  0.54, 0.09, -0.6,  0.54, 0.09, 0.5,
                  0.54, 0.09, 0.2,   0, 0.18, 0.4,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#7FE7D6" linewidth={2} />
        </lineSegments>
      </group>

      {/* ==================== 4. VISUAL CENTER OF MASS (CoM) 3D MARKER ==================== */}
      <group position={centerOfMass}>
        {/* Center of Mass Sphere Crosshair */}
        <mesh>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#FACC15" emissive="#FACC15" emissiveIntensity={0.8} />
        </mesh>
        {/* 3D CoM Alignment Axes */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  -0.08, 0, 0, 0.08, 0, 0,
                  0, -0.08, 0, 0, 0.08, 0,
                  0, 0, -0.08, 0, 0, 0.08,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#FACC15" />
        </lineSegments>
      </group>
    </group>
  );
};
