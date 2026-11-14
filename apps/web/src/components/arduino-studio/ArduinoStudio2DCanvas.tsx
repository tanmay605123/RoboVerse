'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useArduinoStudioStore } from '@/store/useArduinoStudioStore';
import { COMPONENT_CATALOG } from './catalog';
import { CircuitComponent } from '@roboverse/shared';

export const ArduinoStudio2DCanvas: React.FC = () => {
  const {
    components,
    wires,
    selectedComponentId,
    selectedWireId,
    selectComponent,
    selectWire,
    updateComponentPosition,
    wireDraftFrom,
    startWireDraft,
    completeWireDraft,
    cancelWireDraft,
    activeWireColor,
    zoomLevel,
    panOffset,
    setPanOffset,
    componentOutputs,
    pinStates,
    togglePushButton,
  } = useArduinoStudioStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const [compDragOffset, setCompDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPin, setHoveredPin] = useState<{ compId: string; pinId: string } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map 3D coordinate space to 2D canvas pixels
  // Center (0, 0, 0) -> (500, 350)
  const to2D = (pos3D: [number, number, number]): { x: number; y: number } => {
    return {
      x: 500 + pos3D[0] * 110,
      y: 350 + pos3D[2] * 110,
    };
  };

  const to3D = (x: number, y: number): [number, number, number] => {
    return [(x - 500) / 110, 0.2, (y - 350) / 110];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Alt key for panning
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    // Click canvas background -> deselect
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      selectComponent(null);
      selectWire(null);
      cancelWireDraft();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Track mouse coordinate inside zoomed canvas space
    const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
    setMouseCanvasPos({ x: mouseX, y: mouseY });

    if (isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    if (draggedCompId) {
      const newX = mouseX - compDragOffset.x;
      const newY = mouseY - compDragOffset.y;
      const pos3D = to3D(newX, newY);
      updateComponentPosition(draggedCompId, pos3D);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedCompId(null);
  };

  // Keyboard shortcut: Delete to remove selected component or wire
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelWireDraft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelWireDraft]);

  return (
    <div
      ref={containerRef}
      id="canvas-bg"
      className="relative w-full h-full bg-[#050B08] overflow-hidden select-none cursor-default"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        cancelWireDraft();
      }}
    >
      {/* Precision 2D Engineering Grid Background */}
      <svg
        className="w-full h-full absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <pattern id="grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="#39FF6A" fillOpacity="0.12" />
          </pattern>
          <pattern id="grid-lines" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#39FF6A" strokeOpacity="0.06" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="3000" height="2000" fill="url(#grid-dots)" />
        <rect width="3000" height="2000" fill="url(#grid-lines)" />
      </svg>

      {/* Main Interactive Zoomable & Pannable SVG World */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Defs for Glows and Markers */}
        <defs>
          <radialGradient id="led-red-glow">
            <stop offset="0%" stopColor="#FF3333" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FF3333" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF3333" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="led-green-glow">
            <stop offset="0%" stopColor="#39FF6A" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#39FF6A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#39FF6A" stopOpacity="0" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* 1. RENDER ALL COMPONENTS */}
        {components.map((comp) => {
          const pos = to2D(comp.position);
          const isSelected = selectedComponentId === comp.id;
          const output = componentOutputs.get(comp.id)?.state || {};
          const rotDeg = Math.round(((comp.rotation[1] || 0) * 180) / Math.PI);

          return (
            <g
              key={comp.id}
              transform={`translate(${pos.x}, ${pos.y}) rotate(${rotDeg})`}
              filter="url(#shadow)"
              onMouseDown={(e) => {
                e.stopPropagation();
                selectComponent(comp.id);
                setDraggedCompId(comp.id);
                setCompDragOffset({
                  x: mouseCanvasPos.x - pos.x,
                  y: mouseCanvasPos.y - pos.y,
                });
              }}
              className="cursor-move"
            >
              {/* Selection Halo */}
              {isSelected && (
                <rect
                  x="-130"
                  y="-100"
                  width="260"
                  height="200"
                  fill="none"
                  stroke="#39FF6A"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  rx="12"
                  className="animate-pulse"
                />
              )}

              {/* Render Component Geometry */}
              {render2DComponentGeometry(comp, output, togglePushButton)}

              {/* Component Terminal Pins */}
              {render2DPins(
                comp,
                hoveredPin,
                setHoveredPin,
                wireDraftFrom,
                startWireDraft,
                completeWireDraft,
                pinStates
              )}
            </g>
          );
        })}

        {/* 2. RENDER ALL JUMPER WIRES */}
        {wires.map((wire) => {
          const fromComp = components.find((c) => c.id === wire.fromComponentId);
          const toComp = components.find((c) => c.id === wire.toComponentId);
          if (!fromComp || !toComp) return null;

          const pA = getPinCanvasCoord(fromComp, wire.fromPinId, to2D);
          const pB = getPinCanvasCoord(toComp, wire.toPinId, to2D);
          const isSelected = selectedWireId === wire.id;

          // Compute smooth organic cubic Bezier curve for flexible wire
          const dx = pB.x - pA.x;
          const dy = pB.y - pA.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const sag = Math.min(80, dist * 0.25);
          const cp1x = pA.x + dx * 0.3;
          const cp1y = pA.y + dy * 0.1 + sag;
          const cp2x = pA.x + dx * 0.7;
          const cp2y = pA.y + dy * 0.9 + sag;

          return (
            <g
              key={wire.id}
              onClick={(e) => {
                e.stopPropagation();
                selectWire(wire.id);
              }}
              className="cursor-pointer group"
            >
              {/* Outer hit area / selection halo */}
              <path
                d={`M ${pA.x} ${pA.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pB.x} ${pB.y}`}
                fill="none"
                stroke={isSelected ? '#FFFFFF' : 'transparent'}
                strokeWidth={isSelected ? 10 : 14}
                strokeLinecap="round"
                opacity={isSelected ? 0.3 : 0}
              />
              {/* Main wire stroke */}
              <path
                d={`M ${pA.x} ${pA.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pB.x} ${pB.y}`}
                fill="none"
                stroke={wire.color}
                strokeWidth={isSelected ? 4 : 3}
                strokeLinecap="round"
                className="transition-all group-hover:brightness-125"
              />
              {/* Terminal pin boots */}
              <circle cx={pA.x} cy={pA.y} r="3.5" fill="#111111" stroke={wire.color} strokeWidth="1.5" />
              <circle cx={pB.x} cy={pB.y} r="3.5" fill="#111111" stroke={wire.color} strokeWidth="1.5" />
            </g>
          );
        })}

        {/* 3. DRAFT WIRE PREVIEW */}
        {wireDraftFrom && (
          <g className="pointer-events-none">
            {(() => {
              const startComp = components.find((c) => c.id === wireDraftFrom.componentId);
              if (!startComp) return null;
              const pA = getPinCanvasCoord(startComp, wireDraftFrom.pinId, to2D);
              return (
                <>
                  <line
                    x1={pA.x}
                    y1={pA.y}
                    x2={mouseCanvasPos.x}
                    y2={mouseCanvasPos.y}
                    stroke={activeWireColor}
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                    className="animate-pulse"
                  />
                  <circle cx={pA.x} cy={pA.y} r="4" fill={activeWireColor} />
                  <circle cx={mouseCanvasPos.x} cy={mouseCanvasPos.y} r="4" fill={activeWireColor} />
                </>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Floating Instructions HUD */}
      {wireDraftFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0E2A1F]/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#39FF6A] shadow-2xl flex items-center gap-3 animate-pulse z-30">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39FF6A]" />
          <span className="text-xs text-white font-mono">
            Routing wire from <span className="text-[#39FF6A] font-bold">{wireDraftFrom.componentId}:{wireDraftFrom.pinId}</span>. Click target pin to connect, or Right-Click to cancel.
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

// Helper: Get pin 2D canvas coordinate based on component definition
function getPinCanvasCoord(
  comp: CircuitComponent,
  pinId: string,
  to2D: (pos: [number, number, number]) => { x: number; y: number }
): { x: number; y: number } {
  const center = to2D(comp.position);
  const catalogItem = COMPONENT_CATALOG.find((c) => c.typeId === comp.typeId);
  const pinDef = catalogItem?.pins.find((p) => p.id === pinId);

  if (pinDef) {
    const w = catalogItem?.defaultWidth2D || 100;
    const h = catalogItem?.defaultHeight2D || 100;
    const offsetX = pinDef.rel2D[0] - w / 2;
    const offsetY = pinDef.rel2D[1] - h / 2;

    const rotRad = comp.rotation[1] || 0;
    const rx = offsetX * Math.cos(rotRad) - offsetY * Math.sin(rotRad);
    const ry = offsetX * Math.sin(rotRad) + offsetY * Math.cos(rotRad);
    return { x: center.x + rx, y: center.y + ry };
  }

  return center;
}

// Render component 2D SVG illustration
function render2DComponentGeometry(
  comp: CircuitComponent,
  output: any,
  togglePushButton: (id: string, pressed?: boolean) => void
) {
  const type = comp.typeId.toLowerCase();

  // 1. Arduino Uno R3 Vector Representation
  if (type.includes('arduino_uno')) {
    return (
      <g>
        {/* PCB Board Body */}
        <rect x="-120" y="-90" width="240" height="180" rx="8" fill="#0A5C80" stroke="#074460" strokeWidth="2" />
        <rect x="-115" y="-85" width="230" height="170" rx="6" fill="none" stroke="#39FF6A" strokeOpacity="0.2" strokeWidth="1" />

        {/* USB Port (Metallic) */}
        <rect x="-135" y="-60" width="30" height="40" rx="3" fill="#C0C0C0" stroke="#888888" strokeWidth="1.5" />
        {/* DC Barrel Jack */}
        <rect x="-135" y="20" width="35" height="40" rx="4" fill="#1A1A1A" stroke="#333333" strokeWidth="1.5" />
        {/* ATmega328P DIP IC Chip */}
        <rect x="-20" y="-15" width="100" height="30" rx="2" fill="#111111" stroke="#333333" strokeWidth="1" />
        <text x="30" y="4" fontSize="8" fill="#AAAAAA" fontFamily="monospace" textAnchor="middle">
          ATmega328P-PU
        </text>

        {/* Reset Button */}
        <circle cx="-95" cy="-70" r="6" fill="#CC2222" stroke="#FFFFFF" strokeWidth="1" />

        {/* Header Pin Sockets (Top Digital Row) */}
        <rect x="-65" y="-85" width="180" height="16" rx="2" fill="#1E1E1E" stroke="#333333" strokeWidth="1" />
        <text x="25" y="-73" fontSize="8" fill="#FFFFFF" fontFamily="monospace" textAnchor="middle">
          DIGITAL (PWM ~)
        </text>

        {/* Header Pin Sockets (Bottom Power & Analog Row) */}
        <rect x="-65" y="70" width="180" height="16" rx="2" fill="#1E1E1E" stroke="#333333" strokeWidth="1" />
        <text x="25" y="82" fontSize="8" fill="#FFFFFF" fontFamily="monospace" textAnchor="middle">
          POWER / ANALOG IN
        </text>

        {/* Arduino Built-in D13 LED */}
        <rect x="-35" y="-35" width="8" height="6" rx="1" fill={output.isOn ? '#FF9A1F' : '#443311'} />
        <text x="-20" y="-30" fontSize="7" fill="#888888" fontFamily="monospace">
          L (D13)
        </text>

        {/* Power LED (ON) */}
        <rect x="-55" y="-35" width="8" height="6" rx="1" fill="#39FF6A" />
        <text x="-65" y="-30" fontSize="7" fill="#888888" fontFamily="monospace">
          ON
        </text>

        {/* Board Title Label */}
        <text x="0" y="45" fontSize="13" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif" textAnchor="middle">
          ARDUINO UNO
        </text>
      </g>
    );
  }

  // 2. Breadboard (Half-Size 400 pts)
  if (type.includes('breadboard')) {
    return (
      <g>
        {/* Base Beige Plate */}
        <rect x="-160" y="-110" width="320" height="220" rx="8" fill="#ECE8DF" stroke="#D0CAC0" strokeWidth="2" />
        {/* Center Divider Groove */}
        <rect x="-155" y="-6" width="310" height="12" fill="#888888" opacity="0.3" rx="2" />

        {/* Top Power Rails (+ Red, - Blue) */}
        <line x1="-150" y1="-95" x2="150" y2="-95" stroke="#FF3939" strokeWidth="2" />
        <line x1="-150" y1="-75" x2="150" y2="-75" stroke="#0A84FF" strokeWidth="2" />
        <text x="-155" y="-92" fontSize="10" fill="#FF3939" fontWeight="bold">
          +
        </text>
        <text x="-155" y="-72" fontSize="10" fill="#0A84FF" fontWeight="bold">
          -
        </text>

        {/* Bottom Power Rails (+ Red, - Blue) */}
        <line x1="-150" y1="75" x2="150" y2="75" stroke="#FF3939" strokeWidth="2" />
        <line x1="-150" y1="95" x2="150" y2="95" stroke="#0A84FF" strokeWidth="2" />
        <text x="-155" y="78" fontSize="10" fill="#FF3939" fontWeight="bold">
          +
        </text>
        <text x="-155" y="98" fontSize="10" fill="#0A84FF" fontWeight="bold">
          -
        </text>

        {/* Breadboard Row Number Guides */}
        <text x="-140" y="-55" fontSize="7" fill="#888888" fontFamily="monospace">
          1
        </text>
        <text x="0" y="-55" fontSize="7" fill="#888888" fontFamily="monospace">
          15
        </text>
        <text x="140" y="-55" fontSize="7" fill="#888888" fontFamily="monospace">
          30
        </text>

        {/* Representative tie holes pattern */}
        {[-120, -80, -40, 0, 40, 80, 120].map((x) => (
          <g key={x}>
            {[-45, -30, -15, 15, 30, 45].map((y) => (
              <circle key={y} cx={x} cy={y} r="2" fill="#444444" opacity="0.4" />
            ))}
          </g>
        ))}
      </g>
    );
  }

  // 3. Tactile Push Button (Clickable in 2D!)
  if (type.includes('button') || type.includes('switch')) {
    const isPressed = !!comp.properties?.isPressed;
    return (
      <g
        onMouseDown={(e) => {
          e.stopPropagation();
          togglePushButton(comp.id, true);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          togglePushButton(comp.id, false);
        }}
        className="cursor-pointer"
      >
        {/* Metal Mounting Plate */}
        <rect x="-30" y="-30" width="60" height="60" rx="6" fill="#B0B0B0" stroke="#777777" strokeWidth="2" />
        {/* Corner Solder Pins */}
        <rect x="-35" y="-25" width="8" height="10" rx="1" fill="#C0C0C0" stroke="#555555" />
        <rect x="27" y="-25" width="8" height="10" rx="1" fill="#C0C0C0" stroke="#555555" />
        <rect x="-35" y="15" width="8" height="10" rx="1" fill="#C0C0C0" stroke="#555555" />
        <rect x="27" y="15" width="8" height="10" rx="1" fill="#C0C0C0" stroke="#555555" />

        {/* Central Circular Plunger (Animates when pressed) */}
        <circle
          cx="0"
          cy="0"
          r={isPressed ? 18 : 20}
          fill={isPressed ? '#111111' : '#222222'}
          stroke={isPressed ? '#39FF6A' : '#555555'}
          strokeWidth={isPressed ? 3 : 2}
        />
        <circle
          cx="0"
          cy="0"
          r={isPressed ? 12 : 14}
          fill={isPressed ? '#39FF6A' : '#333333'}
          opacity={isPressed ? 0.9 : 0.6}
        />
        <text
          x="0"
          y="3"
          fontSize="7"
          fill={isPressed ? '#000000' : '#AAAAAA'}
          fontWeight="bold"
          textAnchor="middle"
          pointerEvents="none"
        >
          {isPressed ? 'DOWN' : 'PUSH'}
        </text>
      </g>
    );
  }

  // 4. 5mm LED (Red, Green, etc. with Emissive Glow)
  if (type.includes('led')) {
    const color = comp.properties?.color || '#FF3333';
    const isLit = output.isOn || (output.brightness && output.brightness > 0);
    const glowId = color === '#39FF6A' ? 'url(#led-green-glow)' : 'url(#led-red-glow)';

    return (
      <g>
        {/* Glow halo when energized */}
        {isLit && <circle cx="0" cy="0" r="45" fill={glowId} />}

        {/* LED Plastic Dome */}
        <circle
          cx="0"
          cy="0"
          r="16"
          fill={color}
          fillOpacity={isLit ? 1.0 : 0.6}
          stroke={isLit ? '#FFFFFF' : '#888888'}
          strokeWidth={isLit ? 2 : 1}
        />
        {/* Specular highlight */}
        <circle cx="-5" cy="-5" r="4" fill="#FFFFFF" opacity={isLit ? 0.8 : 0.4} />

        {/* Cathode flat notch notch */}
        <line x1="-16" y1="12" x2="16" y2="12" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
      </g>
    );
  }

  // 5. 220Ω Resistor with Color Stripes
  if (type.includes('resistor')) {
    const ohms = comp.properties?.resistanceOhms || 220;
    return (
      <g>
        {/* Axial Metal Leads */}
        <line x1="-45" y1="0" x2="-20" y2="0" stroke="#AAAAAA" strokeWidth="3" strokeLinecap="round" />
        <line x1="20" y1="0" x2="45" y2="0" stroke="#AAAAAA" strokeWidth="3" strokeLinecap="round" />

        {/* Beige Ceramic Body */}
        <rect x="-22" y="-10" width="44" height="20" rx="5" fill="#E8D5B5" stroke="#C4B08F" strokeWidth="1.5" />

        {/* Color Bands (e.g. 220R = Red, Red, Brown, Gold) */}
        {ohms === 220 ? (
          <>
            <rect x="-14" y="-10" width="4" height="20" fill="#FF2222" />
            <rect x="-6" y="-10" width="4" height="20" fill="#FF2222" />
            <rect x="2" y="-10" width="4" height="20" fill="#8B4513" />
            <rect x="10" y="-10" width="4" height="20" fill="#D4AF37" />
          </>
        ) : (
          <>
            <rect x="-14" y="-10" width="4" height="20" fill="#8B4513" />
            <rect x="-6" y="-10" width="4" height="20" fill="#111111" />
            <rect x="2" y="-10" width="4" height="20" fill="#FF8800" />
            <rect x="10" y="-10" width="4" height="20" fill="#D4AF37" />
          </>
        )}
      </g>
    );
  }

  // Fallback generic rectangular component
  return (
    <rect x="-30" y="-20" width="60" height="40" rx="4" fill="#333333" stroke="#555555" strokeWidth="1.5" />
  );
}

// Render component pin interactive terminals
function render2DPins(
  comp: CircuitComponent,
  hoveredPin: { compId: string; pinId: string } | null,
  setHoveredPin: (p: { compId: string; pinId: string } | null) => void,
  wireDraftFrom: { componentId: string; pinId: string } | null,
  startWireDraft: (cId: string, pId: string) => void,
  completeWireDraft: (cId: string, pId: string) => void,
  pinStates: Map<string, any>
) {
  const catalogItem = COMPONENT_CATALOG.find((c) => c.typeId === comp.typeId);
  const w = catalogItem?.defaultWidth2D || 100;
  const h = catalogItem?.defaultHeight2D || 100;

  return comp.pins.map((pin) => {
    const pinDef = catalogItem?.pins.find((p) => p.id === pin.id);
    const pinX = pinDef ? pinDef.rel2D[0] - w / 2 : 0;
    const pinY = pinDef ? pinDef.rel2D[1] - h / 2 : 0;

    const isHovered = hoveredPin?.compId === comp.id && hoveredPin?.pinId === pin.id;
    const isDraftOrigin = wireDraftFrom?.componentId === comp.id && wireDraftFrom?.pinId === pin.id;
    const pinKey = `${comp.id}:${pin.id}`;
    const pState = pinStates.get(pinKey);

    return (
      <g
        key={pin.id}
        transform={`translate(${pinX}, ${pinY})`}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPin({ compId: comp.id, pinId: pin.id });
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredPin(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (wireDraftFrom) {
            completeWireDraft(comp.id, pin.id);
          } else {
            startWireDraft(comp.id, pin.id);
          }
        }}
        className="cursor-crosshair"
      >
        {/* Glow indicator on hover / wire draft */}
        {(isHovered || isDraftOrigin) && (
          <circle cx="0" cy="0" r="9" fill="#39FF6A" fillOpacity="0.3" className="animate-ping" />
        )}

        {/* Pin Terminal Pad */}
        <circle
          cx="0"
          cy="0"
          r={isHovered ? 5.5 : 4}
          fill={
            isDraftOrigin
              ? '#39FF6A'
              : isHovered
              ? '#7FE7D6'
              : pin.type === 'GROUND'
              ? '#111111'
              : pin.type === 'POWER_VCC'
              ? '#FF3939'
              : '#FFD700'
          }
          stroke={pState?.isHigh ? '#39FF6A' : '#FFFFFF'}
          strokeWidth="1.5"
          className="transition-all"
        />

        {/* Tooltip on pin hover */}
        {isHovered && (
          <g transform="translate(0, -18)" className="pointer-events-none select-none z-50">
            <rect x="-45" y="-14" width="90" height="18" rx="4" fill="#07110D" stroke="#39FF6A" strokeWidth="1" />
            <text x="0" y="-2" fontSize="9" fill="#39FF6A" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {pin.name} {pState ? `(${pState.voltage.toFixed(1)}V)` : ''}
            </text>
          </g>
        )}
      </g>
    );
  });
}
