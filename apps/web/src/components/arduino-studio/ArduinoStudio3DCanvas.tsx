'use client';

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { useArduinoStudioStore } from '@/store/useArduinoStudioStore';
import { CircuitComponent, PinDefinition } from '@roboverse/shared';
import { GridFloor } from '../3d/GridFloor';
import { ParticleDust } from '../3d/ParticleDust';

export const ArduinoStudio3DCanvas: React.FC = () => {
  const {
    components,
    wires,
    wireDraftFrom,
    cancelWireDraft,
    selectComponent,
  } = useArduinoStudioStore();

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
        camera={{ position: [0, 6.5, 7.5], fov: 42 }}
        onPointerMissed={() => {
          selectComponent(null);
          cancelWireDraft();
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[6, 12, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, 4, -4]} intensity={0.5} color="#7FE7D6" />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          minDistance={2}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2.05} // Keep above floor
          enableDamping
          dampingFactor={0.05}
        />

        {/* 3D Grid Floor & Ambient Dust */}
        <GridFloor size={24} divisions={32} />
        <ParticleDust count={50} />

        {/* Contact Shadow for Grounding Realism */}
        <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={16} blur={1.8} far={4} />

        {/* All Circuit Components */}
        {components.map((comp) => (
          <StudioComponent3D key={comp.id} component={comp} />
        ))}

        {/* All Jumper Wires */}
        {wires.map((wire) => (
          <StudioWire3D key={wire.id} wire={wire} components={components} />
        ))}
      </Canvas>

      {/* Camera Controls Float HUD */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#0E2A1F]/80 backdrop-blur-md p-1.5 rounded-xl border border-[#39FF6A]/20 shadow-lg text-xs z-20">
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

      {/* Wire Routing Banner */}
      {wireDraftFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0E2A1F]/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#39FF6A] shadow-xl flex items-center gap-3 animate-pulse z-30">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39FF6A]" />
          <span className="text-xs text-white font-mono">
            Routing wire in 3D... Click target pin to complete, or Right-Click to cancel.
          </span>
          <button onClick={cancelWireDraft} className="text-[11px] text-[#FF9A1F] hover:underline font-bold">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// 3D Component with Interactive Pins and Clickable Plunger
const StudioComponent3D: React.FC<{ component: CircuitComponent }> = ({ component }) => {
  const {
    selectedComponentId,
    selectComponent,
    wireDraftFrom,
    startWireDraft,
    completeWireDraft,
    componentOutputs,
    pinStates,
    togglePushButton,
  } = useArduinoStudioStore();

  const isSelected = selectedComponentId === component.id;
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const output = componentOutputs.get(component.id)?.state || {};
  const isButton = component.typeId.includes('button') || component.typeId.includes('switch');
  const isPressed = !!component.properties?.isPressed;

  return (
    <group
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

      {/* Specific 3D Geometry */}
      {render3DGeometry(component, output, isPressed, togglePushButton)}

      {/* Interactive Connection Pins */}
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
          wireDraftFrom?.componentId === component.id && wireDraftFrom?.pinId === pin.id;

        return (
          <group key={pin.id} position={pinPos}>
            {/* Visual Pin Sphere */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredPinId(pin.id);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredPinId(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (wireDraftFrom) {
                  completeWireDraft(component.id, pin.id);
                } else {
                  startWireDraft(component.id, pin.id);
                }
              }}
            >
              <sphereGeometry args={[0.07, 16, 16]} />
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

            {/* Hover Tooltip */}
            {(isHovered || isDraftOrigin) && (
              <Html distanceFactor={12} position={[0, 0.2, 0]}>
                <div className="bg-[#07110D]/95 text-white border border-[#39FF6A]/60 px-2 py-1 rounded-lg shadow-xl text-xs whitespace-nowrap backdrop-blur-md pointer-events-none select-none z-50 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-pulse" />
                    <span className="font-bold text-[#39FF6A]">{pin.name}</span>
                    <span className="text-gray-400 text-[10px]">({pin.type})</span>
                  </div>
                  {pinState && (
                    <div className="text-[10px] text-gray-300 mt-0.5">
                      Voltage: <span className="text-[#7FE7D6]">{pinState.voltage.toFixed(2)}V</span>
                      {pinState.isHigh && <span className="ml-1 text-[#39FF6A] font-bold">HIGH</span>}
                    </div>
                  )}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Procedural 3D Geometry for all components
function render3DGeometry(
  component: CircuitComponent,
  output: any,
  isPressed: boolean,
  togglePushButton: (id: string, pressed?: boolean) => void
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
        {/* USB Port */}
        <mesh position={[-1.2, 0.2, -0.6]}>
          <boxGeometry args={[0.5, 0.3, 0.45]} />
          <meshStandardMaterial color="#D0D0D0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* DC Barrel Jack */}
        <mesh position={[-1.2, 0.2, 0.7]}>
          <boxGeometry args={[0.6, 0.3, 0.4]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
        </mesh>
        {/* Digital Header */}
        <mesh position={[0, 0.15, -0.85]}>
          <boxGeometry args={[2.0, 0.18, 0.15]} />
          <meshStandardMaterial color="#1E1E1E" roughness={0.3} />
        </mesh>
        {/* Power / Analog Header */}
        <mesh position={[0, 0.15, 0.85]}>
          <boxGeometry args={[1.8, 0.18, 0.15]} />
          <meshStandardMaterial color="#1E1E1E" roughness={0.3} />
        </mesh>
        {/* Power LED */}
        <mesh position={[-0.4, 0.12, -0.2]}>
          <boxGeometry args={[0.08, 0.04, 0.08]} />
          <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.8} />
        </mesh>
        {/* Built-in Pin 13 LED */}
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

  // 2. Breadboard
  if (type.includes('breadboard')) {
    return (
      <group>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[3.2, 0.12, 2.2]} />
          <meshStandardMaterial color="#ECE8DF" roughness={0.6} />
        </mesh>
        {/* Center Divider Channel */}
        <mesh position={[0, 0.125, 0]}>
          <boxGeometry args={[3.1, 0.02, 0.12]} />
          <meshStandardMaterial color="#888888" roughness={0.8} />
        </mesh>
        {/* Rails */}
        <mesh position={[0, 0.125, -0.95]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#FF3939" />
        </mesh>
        <mesh position={[0, 0.125, -0.85]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#0A84FF" />
        </mesh>
        <mesh position={[0, 0.125, 0.85]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#0A84FF" />
        </mesh>
        <mesh position={[0, 0.125, 0.95]}>
          <boxGeometry args={[3.0, 0.01, 0.04]} />
          <meshBasicMaterial color="#FF3939" />
        </mesh>
      </group>
    );
  }

  // 3. Tactile Push Button (INTERACTIVE CLICKABLE IN 3D)
  if (type.includes('button') || type.includes('switch')) {
    return (
      <group
        onPointerDown={(e) => {
          e.stopPropagation();
          togglePushButton(component.id, true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          togglePushButton(component.id, false);
        }}
      >
        {/* Metal Body Shell */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          <meshStandardMaterial color="#A0A0A0" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Moveable Plunger Button */}
        <mesh position={[0, isPressed ? 0.12 : 0.18, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 24]} />
          <meshStandardMaterial
            color={isPressed ? '#111111' : '#222222'}
            emissive={isPressed ? '#39FF6A' : '#000000'}
            emissiveIntensity={isPressed ? 0.6 : 0}
            roughness={0.4}
          />
        </mesh>
      </group>
    );
  }

  // 4. 5mm LED with Realistic PointLight
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
            emissiveIntensity={isLit ? 2.5 * brightness : 0.05}
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
            emissiveIntensity={isLit ? 3.0 * brightness : 0.05}
          />
        </mesh>
        {/* Real PointLight when LED glows */}
        {isLit && (
          <pointLight
            position={[0, 0.45, 0]}
            color={ledColor}
            intensity={4.0 * brightness}
            distance={3.0}
            decay={2}
          />
        )}
      </group>
    );
  }

  // 5. Resistor (Through-hole)
  if (type.includes('resistor')) {
    return (
      <group>
        <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.35, 16]} />
          <meshStandardMaterial color="#E8D5B5" roughness={0.4} />
        </mesh>
        {/* Color Bands for 220R (Red, Red, Brown, Gold) */}
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
      </group>
    );
  }

  // Generic box fallback
  return (
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[0.6, 0.4, 0.6]} />
      <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.6} />
    </mesh>
  );
}

// 3D Jumper Wire with Curve
const StudioWire3D: React.FC<{ wire: any; components: CircuitComponent[] }> = ({ wire, components }) => {
  const fromComp = components.find((c) => c.id === wire.fromComponentId);
  const toComp = components.find((c) => c.id === wire.toComponentId);
  const { selectWire, selectedWireId } = useArduinoStudioStore();
  const isSelected = selectedWireId === wire.id;

  if (!fromComp || !toComp) return null;

  const fromPin = fromComp.pins.find((p) => p.id === wire.fromPinId);
  const toPin = toComp.pins.find((p) => p.id === wire.toPinId);

  const pA = fromPin?.position3D || fromComp.position;
  const pB = toPin?.position3D || toComp.position;

  // Midpoint with natural wire sag / arc
  const midX = (pA[0] + pB[0]) / 2;
  const midY = Math.max(pA[1], pB[1]) + 0.5 + Math.hypot(pB[0] - pA[0], pB[2] - pA[2]) * 0.15;
  const midZ = (pA[2] + pB[2]) / 2;

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(pA[0], pA[1], pA[2]),
    new THREE.Vector3(midX, midY, midZ),
    new THREE.Vector3(pB[0], pB[1], pB[2])
  );

  const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.035, 8, false);

  return (
    <mesh
      geometry={tubeGeo}
      onClick={(e) => {
        e.stopPropagation();
        selectWire(wire.id);
      }}
    >
      <meshStandardMaterial
        color={wire.color}
        emissive={isSelected ? '#FFFFFF' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
};
