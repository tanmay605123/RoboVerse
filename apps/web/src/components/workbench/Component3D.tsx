'use client';

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CircuitComponent, PinDefinition } from '@roboverse/shared';
import { useCircuitStore } from '@/store/useCircuitStore';

interface Component3DProps {
  component: CircuitComponent;
}

export const Component3D: React.FC<Component3DProps> = ({ component }) => {
  const {
    selectedComponentId,
    selectComponent,
    toolMode,
    wireDraftFrom,
    startWireDraft,
    completeWireDraft,
    componentOutputs,
    pinStates,
  } = useCircuitStore();

  const isSelected = selectedComponentId === component.id;
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  const output = componentOutputs.get(component.id)?.state || {};
  const groupRef = useRef<THREE.Group>(null);
  const motorShaftRef = useRef<THREE.Mesh>(null);
  const servoHornRef = useRef<THREE.Group>(null);

  // Animate dynamic elements (motors spinning, servo angle)
  useFrame((_, delta) => {
    if (motorShaftRef.current && output.rpm && output.rpm > 0) {
      motorShaftRef.current.rotation.x += (output.rpm / 60) * delta * Math.PI * 2;
    }
    if (servoHornRef.current && typeof output.angle === 'number') {
      const targetRad = (output.angle * Math.PI) / 180;
      servoHornRef.current.rotation.y = THREE.MathUtils.lerp(
        servoHornRef.current.rotation.y,
        targetRad,
        0.15
      );
    }
  });

  const handlePinClick = (e: any, pin: PinDefinition) => {
    e.stopPropagation();
    if (wireDraftFrom) {
      completeWireDraft(component.id, pin.id);
    } else {
      startWireDraft(component.id, pin.id);
    }
  };

  return (
    <group
      ref={groupRef}
      position={component.position}
      rotation={component.rotation}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
    >
      {/* Selection Bounding Ring */}
      {isSelected && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.3, 32]} />
          <meshBasicMaterial color="#39FF6A" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* RENDER SPECIFIC COMPONENT 3D GEOMETRY */}
      {renderComponentGeometry(component, output, motorShaftRef, servoHornRef)}

      {/* INTERACTIVE CONNECTION PINS */}
      {component.pins.map((pin) => {
        const pinPos = pin.position3D
          ? ([
              pin.position3D[0] - component.position[0],
              pin.position3D[1] - component.position[1],
              pin.position3D[2] - component.position[2],
            ] as [number, number, number])
          : ([0, 0.2, 0] as [number, number, number]);

        const pinKey = `${component.id}:${pin.id}`;
        const pinState = pinStates.get(pinKey);
        const isHovered = hoveredPinId === pin.id;
        const isDraftOrigin =
          wireDraftFrom?.componentId === component.id &&
          wireDraftFrom?.pinId === pin.id;

        return (
          <group key={pin.id} position={pinPos}>
            {/* Visual Pin Jack */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredPinId(pin.id);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredPinId(null);
              }}
              onClick={(e) => handlePinClick(e, pin)}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color={
                  isDraftOrigin
                    ? '#39FF6A'
                    : isHovered
                    ? '#7FE7D6'
                    : pin.type === 'GROUND'
                    ? '#222222'
                    : pin.type === 'POWER_VCC'
                    ? '#FF3939'
                    : '#FFD700'
                }
                emissive={
                  isDraftOrigin || isHovered
                    ? '#39FF6A'
                    : pinState?.isHigh
                    ? '#39FF6A'
                    : '#000000'
                }
                emissiveIntensity={isHovered ? 0.8 : pinState?.isHigh ? 0.4 : 0}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Pin HUD Tooltip */}
            {(isHovered || isDraftOrigin) && (
              <Html distanceFactor={12} position={[0, 0.2, 0]}>
                <div className="bg-[#07110D]/95 text-white border border-[#39FF6A]/60 px-2.5 py-1.5 rounded-lg shadow-xl text-xs whitespace-nowrap backdrop-blur-md pointer-events-none select-none z-50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-pulse" />
                    <span className="font-bold text-[#39FF6A]">{pin.name}</span>
                    <span className="text-gray-400 font-mono text-[10px]">({pin.type})</span>
                  </div>
                  {pinState && (
                    <div className="text-[10px] text-gray-300 font-mono mt-0.5">
                      Voltage: <span className="text-[#7FE7D6]">{pinState.voltage.toFixed(2)}V</span>
                      {pinState.isHigh && <span className="ml-1 text-[#39FF6A]">HIGH</span>}
                    </div>
                  )}
                  <div className="text-[9px] text-[#39FF6A]/80 italic mt-0.5">
                    {wireDraftFrom ? 'Click to connect wire' : 'Click to route wire'}
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Procedural high-detail 3D geometry for components
function renderComponentGeometry(
  component: CircuitComponent,
  output: any,
  motorShaftRef: React.RefObject<THREE.Mesh>,
  servoHornRef: React.RefObject<THREE.Group>
) {
  const type = component.typeId.toLowerCase();

  // 1. Arduino Uno R3
  if (type.includes('arduino_uno')) {
    return (
      <group>
        {/* PCB Board */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[2.7, 0.1, 2.1]} />
          <meshStandardMaterial color="#0A5C80" roughness={0.4} metalness={0.1} />
        </mesh>

        {/* ATmega328P DIP IC Chip */}
        <mesh position={[0.2, 0.14, 0.2]}>
          <boxGeometry args={[1.2, 0.08, 0.35]} />
          <meshStandardMaterial color="#111111" roughness={0.8} />
        </mesh>

        {/* USB Type-B Port */}
        <mesh position={[-1.2, 0.2, -0.6]}>
          <boxGeometry args={[0.5, 0.3, 0.45]} />
          <meshStandardMaterial color="#D0D0D0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* DC Barrel Jack */}
        <mesh position={[-1.2, 0.2, 0.7]}>
          <boxGeometry args={[0.6, 0.3, 0.4]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
        </mesh>

        {/* Header Pin Sockets (Digital Row) */}
        <mesh position={[0, 0.15, -0.85]}>
          <boxGeometry args={[2.0, 0.18, 0.15]} />
          <meshStandardMaterial color="#1E1E1E" roughness={0.3} />
        </mesh>

        {/* Header Pin Sockets (Power & Analog Row) */}
        <mesh position={[0, 0.15, 0.85]}>
          <boxGeometry args={[1.8, 0.18, 0.15]} />
          <meshStandardMaterial color="#1E1E1E" roughness={0.3} />
        </mesh>

        {/* Arduino Built-in Power LED (Green) */}
        <mesh position={[-0.4, 0.12, -0.2]}>
          <boxGeometry args={[0.08, 0.04, 0.08]} />
          <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.8} />
        </mesh>

        {/* Built-in Pin 13 LED (Orange/Yellow) */}
        <mesh position={[-0.2, 0.12, -0.2]}>
          <boxGeometry args={[0.08, 0.04, 0.08]} />
          <meshStandardMaterial
            color="#FF9A1F"
            emissive="#FF9A1F"
            emissiveIntensity={output.isOn || output.voltageOut ? 1.0 : 0.1}
          />
        </mesh>
      </group>
    );
  }

  // 2. Breadboard (Half-Size 400 pts)
  if (type.includes('breadboard')) {
    return (
      <group>
        {/* Base Body */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[3.2, 0.12, 2.2]} />
          <meshStandardMaterial color="#ECE8DF" roughness={0.6} />
        </mesh>
        {/* Center Divider Channel */}
        <mesh position={[0, 0.125, 0]}>
          <boxGeometry args={[3.1, 0.02, 0.12]} />
          <meshStandardMaterial color="#888888" roughness={0.8} />
        </mesh>
        {/* Red Positive Power Rails */}
        <mesh position={[0, 0.125, -0.95]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#FF3939" />
        </mesh>
        <mesh position={[0, 0.125, 0.95]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#FF3939" />
        </mesh>
        {/* Blue Negative Ground Rails */}
        <mesh position={[0, 0.125, -0.85]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#0A84FF" />
        </mesh>
        <mesh position={[0, 0.125, 0.85]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#0A84FF" />
        </mesh>
      </group>
    );
  }

  // 3. LED (5mm)
  if (type.includes('led')) {
    const ledColor = component.properties?.color || '#FF3333';
    const isLit = output.isOn || (output.brightness && output.brightness > 0);
    const brightness = output.brightness || (isLit ? 1.0 : 0);

    return (
      <group>
        {/* LED Dome Body */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
          <meshPhysicalMaterial
            color={ledColor}
            transmission={0.6}
            opacity={0.9}
            transparent
            roughness={0.1}
            emissive={ledColor}
            emissiveIntensity={isLit ? 2.0 * brightness : 0.05}
          />
        </mesh>
        {/* Top Dome Hemisphere */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={ledColor}
            transmission={0.6}
            opacity={0.9}
            transparent
            emissive={ledColor}
            emissiveIntensity={isLit ? 2.5 * brightness : 0.05}
          />
        </mesh>
        {/* Wire Leads */}
        <mesh position={[0, 0.05, -0.06]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color="#B0B0B0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.05, 0.06]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color="#B0B0B0" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Real PointLight when LED glows */}
        {isLit && (
          <pointLight
            position={[0, 0.45, 0]}
            color={ledColor}
            intensity={3.5 * brightness}
            distance={2.5}
            decay={2}
          />
        )}
      </group>
    );
  }

  // 4. Resistor (Through-hole)
  if (type.includes('resistor')) {
    return (
      <group>
        {/* Resistor Ceramic Body */}
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.35, 16]} />
          <meshStandardMaterial color="#E8D5B5" roughness={0.4} />
        </mesh>
        {/* Color Bands (e.g. Red, Red, Brown for 220R) */}
        <mesh position={[-0.1, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.092, 0.092, 0.04, 16]} />
          <meshBasicMaterial color="#FF2222" />
        </mesh>
        <mesh position={[-0.03, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.092, 0.092, 0.04, 16]} />
          <meshBasicMaterial color="#FF2222" />
        </mesh>
        <mesh position={[0.04, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.092, 0.092, 0.04, 16]} />
          <meshBasicMaterial color="#6B4423" />
        </mesh>
        <mesh position={[0.11, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.092, 0.092, 0.04, 16]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.8} />
        </mesh>
        {/* Axial Leads */}
        <mesh position={[-0.24, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial color="#AAAAAA" metalness={0.9} />
        </mesh>
        <mesh position={[0.24, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial color="#AAAAAA" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  // 5. SG90 Micro Servo Motor
  if (type.includes('servo')) {
    return (
      <group>
        {/* Translucent Blue Housing */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.5, 0.7, 0.3]} />
          <meshPhysicalMaterial
            color="#0A84FF"
            transmission={0.4}
            opacity={0.85}
            transparent
            roughness={0.3}
          />
        </mesh>
        {/* Top Gear Tower */}
        <mesh position={[0.12, 0.75, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
          <meshStandardMaterial color="#0A84FF" />
        </mesh>
        {/* Dynamic Rotating Servo Horn */}
        <group ref={servoHornRef} position={[0.12, 0.84, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[0.4, 0.03, 0.08]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
        </group>
      </group>
    );
  }

  // 6. HC-SR04 Ultrasonic Distance Sensor
  if (type.includes('ultrasonic')) {
    return (
      <group>
        {/* Sensor PCB */}
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.6, 0.08]} />
          <meshStandardMaterial color="#005B94" roughness={0.4} />
        </mesh>
        {/* Left Transducer Cylinder (Transmitter) */}
        <mesh position={[-0.32, 0.3, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.32, 24]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Right Transducer Cylinder (Receiver) */}
        <mesh position={[0.32, 0.3, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.32, 24]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    );
  }

  // 7. TT DC Gear Motor
  if (type.includes('motor')) {
    return (
      <group>
        {/* Yellow Gearbox */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.6, 0.45, 0.9]} />
          <meshStandardMaterial color="#FFB800" roughness={0.4} />
        </mesh>
        {/* Metallic DC Motor Can */}
        <mesh position={[0, 0.3, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Rotating Output Shaft / Wheel */}
        <mesh ref={motorShaftRef} position={[0.35, 0.3, 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
          <meshStandardMaterial color="#111111" roughness={0.5} />
        </mesh>
      </group>
    );
  }

  // 8. 5V Active Buzzer
  if (type.includes('buzzer')) {
    return (
      <group>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.35, 24]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.43, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
          <meshStandardMaterial color="#000000" roughness={0.9} />
        </mesh>
      </group>
    );
  }

  // Fallback generic component
  return (
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[0.6, 0.4, 0.6]} />
      <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}
