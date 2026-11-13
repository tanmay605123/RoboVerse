'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { CircuitComponent } from '@roboverse/shared';
import { COMPONENT_SVG_RENDERERS } from '@roboverse/components-lib';
import { ComponentPropertiesPopup } from './ComponentPropertiesPopup';
import { ZoomIn, ZoomOut, Maximize2, Move, Box, Eye, Layers, AlertTriangle, Flame, Zap } from 'lucide-react';
import { buzzerAudio } from '@/lib/simulation/webAudioBuzzer';

interface Realistic2DCanvasProps {
  onToggle3DMode: () => void;
  is3DMode: boolean;
  wireColor: string;
}

export const Realistic2DCanvas: React.FC<Realistic2DCanvasProps> = ({
  onToggle3DMode,
  is3DMode,
  wireColor,
}) => {
  const {
    components,
    wires,
    selectedComponentId,
    selectComponent,
    updateComponentPosition,
    removeComponent,
    isSimulating,
    digitalInputs,
    startWireDraft,
    completeWireDraft,
    cancelWireDraft,
    wireDraftFrom,
    wireStyle,
    areComponentsVisible,
    addComponent,
    updateComponentProperties,
    rotateComponent,
    componentOutputs,
    diagnostics,
    setDigitalInput,
  } = useCircuitStore();

  const [zoom, setZoom] = useState(1);
  const [showSignalFlow, setShowSignalFlow] = useState(false);
  const [pan, setPan] = useState({ x: 100, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activePropertiesComp, setActivePropertiesComp] = useState<CircuitComponent | null>(null);
  const [propertiesPosition, setPropertiesPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{ compId: string; pinId: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const initialFitDone = useRef(false);

  const getButtonInputPin = (buttonId: string) =>
    wires
      .filter((wire) => wire.fromComponentId === buttonId || wire.toComponentId === buttonId)
      .map((wire) => {
        const otherComponentId = wire.fromComponentId === buttonId ? wire.toComponentId : wire.fromComponentId;
        const otherPinId = wire.fromComponentId === buttonId ? wire.toPinId : wire.fromPinId;
        const other = components.find((component) => component.id === otherComponentId);
        const pinName = other?.pins.find((pin) => pin.id === otherPinId)?.name || '';
        return other?.typeId.includes('arduino') ? Number(pinName.match(/D(\d+)/i)?.[1]) : NaN;
      })
      .find((pin) => Number.isInteger(pin));

  const minimapPoints = components.map((component) => ({
    id: component.id,
    x: component.position[0] * 50 + 60,
    y: component.position[2] * 50 + 40,
  }));
  const miniWidth = 144;
  const miniHeight = 78;
  const miniMinX = Math.min(-120, ...minimapPoints.map((point) => point.x - 50));
  const miniMinY = Math.min(-80, ...minimapPoints.map((point) => point.y - 40));
  const miniWorldWidth = Math.max(260, Math.max(...minimapPoints.map((point) => point.x + 60), 140) - miniMinX + 120);
  const miniWorldHeight = Math.max(180, Math.max(...minimapPoints.map((point) => point.y + 45), 90) - miniMinY + 80);

  const recenterFromMinimap = (clientX: number, clientY: number) => {
    const rect = minimapRef.current?.getBoundingClientRect();
    const viewport = containerRef.current;
    if (!rect || !viewport) return;
    const ratioX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const ratioY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const worldX = miniMinX + ratioX * miniWorldWidth;
    const worldY = miniMinY + ratioY * miniWorldHeight;
    setPan({
      x: viewport.clientWidth / 2 - worldX * zoom,
      y: viewport.clientHeight / 2 - worldY * zoom,
    });
  };

  const miniViewport = containerRef.current ? {
    x: ((-pan.x / zoom - miniMinX) / miniWorldWidth) * miniWidth,
    y: ((-pan.y / zoom - miniMinY) / miniWorldHeight) * miniHeight,
    width: (containerRef.current.clientWidth / zoom / miniWorldWidth) * miniWidth,
    height: (containerRef.current.clientHeight / zoom / miniWorldHeight) * miniHeight,
  } : null;

  // Keyboard navigation & Shortcuts (Rotate with R, Delete with Del/Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentId && !['input', 'textarea'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
          removeComponent(selectedComponentId);
          selectComponent(null);
          setActivePropertiesComp(null);
          setPropertiesPosition(null);
        }
      }
      if (e.key === 'Escape') {
        cancelWireDraft();
        selectComponent(null);
        setActivePropertiesComp(null);
        setPropertiesPosition(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, removeComponent, selectComponent, cancelWireDraft]);

  // Handle Dragging Components
  const handlePointerDownComponent = (e: React.PointerEvent, comp: CircuitComponent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    selectComponent(comp.id);

    const clientX = e.clientX;
    const clientY = e.clientY;

    const compX = (comp.position[0] * 50) + pan.x;
    const compY = (comp.position[2] * 50) + pan.y;

    setDraggingCompId(comp.id);
    setDragOffset({
      x: clientX - compX,
      y: clientY - compY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    // Handle Pan
    if (isPanning) {
      setPan({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y,
      });
      return;
    }

    // Handle Component Drag
    if (draggingCompId) {
      const newCanvasX = (e.clientX - dragOffset.x - pan.x) / 50;
      const newCanvasY = (e.clientY - dragOffset.y - pan.y) / 50;

      // Snap to grid (step 0.2 units)
      const snappedX = Math.round(newCanvasX * 5) / 5;
      const snappedY = Math.round(newCanvasY * 5) / 5;

      updateComponentPosition(draggingCompId, [snappedX, 0, snappedY]);
    }
  };

  const handlePointerUp = () => {
    components.filter((component) => component.typeId.includes('button')).forEach((button) => {
      const inputPin = getButtonInputPin(button.id);
      if (inputPin !== undefined && digitalInputs[inputPin] === false) setDigitalInput(inputPin, true);
    });
    setDraggingCompId(null);
    setIsPanning(false);
  };

  const handleFitToScreen = useCallback(() => {
    const { current: viewport } = containerRef;
    const canvasComponents = useCircuitStore.getState().components;
    if (!viewport || canvasComponents.length === 0) return;

    const bounds = canvasComponents.map((component) => {
      const isArduino = component.typeId.includes('arduino');
      const isBreadboard = component.typeId.includes('breadboard');
      const width = isBreadboard ? 272 : isArduino ? 232 : 80;
      const height = isBreadboard ? 132 : isArduino ? 172 : 80;
      const left = component.position[0] * 50;
      const top = component.position[2] * 50;
      return { left, top, right: left + width, bottom: top + height };
    });
    const minX = Math.min(...bounds.map((item) => item.left));
    const minY = Math.min(...bounds.map((item) => item.top));
    const maxX = Math.max(...bounds.map((item) => item.right));
    const maxY = Math.max(...bounds.map((item) => item.bottom));
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const scale = Math.max(0.4, Math.min(1.5, (viewport.clientWidth - 96) / width, (viewport.clientHeight - 96) / height));

    setZoom(scale);
    setPan({
      x: viewport.clientWidth / 2 - ((minX + maxX) / 2) * scale,
      y: viewport.clientHeight / 2 - ((minY + maxY) / 2) * scale,
    });
  }, []);

  useEffect(() => {
    if (initialFitDone.current) return;
    const frame = requestAnimationFrame(() => {
      handleFitToScreen();
      initialFitDone.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [handleFitToScreen]);

  useEffect(() => {
    window.addEventListener('roboverse:fit-circuit', handleFitToScreen);
    return () => window.removeEventListener('roboverse:fit-circuit', handleFitToScreen);
  }, [handleFitToScreen]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const parsed = JSON.parse(rawData);
      if (parsed.type === 'component' && parsed.item) {
        const item = parsed.item;
        const rect = containerRef.current?.getBoundingClientRect();
        const clientX = e.clientX - (rect?.left || 0);
        const clientY = e.clientY - (rect?.top || 0);
        const canvasX = (clientX - pan.x) / (50 * zoom);
        const canvasY = (clientY - pan.y) / (50 * zoom);

        addComponent({
          id: `${item.id.replace('comp_', '')}_${Date.now().toString(36)}`,
          typeId: item.id.replace('comp_', ''),
          name: item.name,
          category: item.category,
          model3DUrl: item.model3DUrl,
          position: [Math.round(canvasX * 5) / 5, 0.2, Math.round(canvasY * 5) / 5],
          rotation: [0, 0, 0],
          properties: { ...item.defaultProperties },
          pins:
            item.pins?.map((p: any) => ({
              id: p.id,
              name: p.name,
              type: p.type as any,
              position3D: [0, 0.2, 0],
            })) || [],
        });
      }
    } catch (err) {
      console.error('Failed to parse dropped component:', err);
    }
  };

  const getWirePath = (x1: number, y1: number, x2: number, y2: number, style: string) => {
    if (style === 'straight') {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    if (style === 'angled') {
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }
    // curved (default)
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx1 = x1 + dx * 0.25;
    const cy1 = y1 + Math.abs(dx) * 0.4 + 20;
    const cx2 = x1 + dx * 0.75;
    const cy2 = y2 + Math.abs(dx) * 0.4 + 20;
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  const handlePinClick = (e: React.MouseEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    if (!wireDraftFrom) {
      startWireDraft(compId, pinId);
    } else {
      if (wireDraftFrom.componentId !== compId || wireDraftFrom.pinId !== pinId) {
        completeWireDraft(compId, pinId);
      } else {
        cancelWireDraft();
      }
    }
  };

  // Stop or start buzzer tone based on simulation state
  useEffect(() => {
    if (isSimulating) {
      const buzzers = components.filter(
        (c) => c.typeId.includes('buzzer') || c.typeId.includes('piezo')
      );
      buzzers.forEach((b) => {
        const out = componentOutputs?.get(b.id);
        if (out?.state.isOn) {
          buzzerAudio.playTone(b.id, 2500);
        } else {
          buzzerAudio.stopTone(b.id);
        }
      });
    } else {
      buzzerAudio.stopAll();
    }
    return () => {
      buzzerAudio.stopAll();
    };
  }, [isSimulating, componentOutputs, components]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onContextMenu={(e) => {
        e.preventDefault();
        cancelWireDraft();
      }}
      className="relative w-full h-full overflow-hidden select-none cursor-crosshair"
      style={{
        backgroundColor: '#07110D',
        backgroundImage:
          'radial-gradient(circle, rgba(57, 255, 106, 0.25) 1.5px, transparent 1.5px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Top-Right Real-time Diagnostic Alert Badges */}
      {diagnostics && diagnostics.length > 0 && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end max-w-sm pointer-events-none">
          {diagnostics.slice(0, 3).map((diag) => {
            const isCritical = diag.severity === 'CRITICAL';
            return (
              <div
                key={diag.id}
                className={`pointer-events-auto flex items-start gap-2 px-3 py-2 rounded-2xl shadow-lg text-xs font-mono animate-slide-up border backdrop-blur-xl ${
                  isCritical
                    ? 'bg-[#040B08]/90 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(255,77,77,0.3)]'
                    : 'bg-[#040B08]/90 text-[#FF9A1F] border-[#FF9A1F]/50 shadow-[0_0_15px_rgba(255,154,31,0.3)]'
                }`}
              >
                {isCritical ? (
                  <Flame className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#FF9A1F] shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-extrabold block">{diag.message}</span>
                  <span className="text-[10px] text-[#8FA99B] block mt-0.5">{diag.fixSuggestion}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TOP-LEFT VIEWPORT HUD CONTROLS (Dark Glass Chrome) */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-[#0A1F17]/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] border border-[rgba(57,255,106,0.25)] font-mono">
        {/* Fit to Screen Button */}
        <button
          onClick={handleFitToScreen}
          className="p-1.5 rounded-xl hover:bg-white/10 text-[#CBD8D0] hover:text-[#39FF6A] transition-colors"
          title="Fit to Screen (F)"
          aria-label="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Zoom In */}
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
          className="p-1.5 rounded-xl hover:bg-white/10 text-[#CBD8D0] hover:text-[#39FF6A] transition-colors"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Level Indicator */}
        <span className="text-[11px] font-mono font-bold text-[#8FA99B] px-1.5">
          {Math.round(zoom * 100)}%
        </span>

        {/* Zoom Out */}
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="p-1.5 rounded-xl hover:bg-white/10 text-[#CBD8D0] hover:text-[#39FF6A] transition-colors"
          title="Zoom Out (-)"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowSignalFlow((visible) => !visible)}
          className={`rounded-xl p-1.5 transition-colors ${showSignalFlow ? 'bg-[#39FF6A]/15 text-[#39FF6A]' : 'text-[#CBD8D0] hover:bg-white/10 hover:text-[#39FF6A]'}`}
          title="Show animated signal paths while simulation runs (visual guide, not a current measurement)"
          aria-label="Toggle animated signal paths"
          aria-pressed={showSignalFlow}
        >
          <Zap className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-[rgba(57,255,106,0.2)] mx-1" />

        {/* RoboVerse 2D / 3D Mode Toggle Switch */}
        <div className="flex items-center p-0.5 bg-[#040B08] rounded-xl border border-[rgba(57,255,106,0.18)]">
          <button
            onClick={() => is3DMode && onToggle3DMode()}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              !is3DMode
                ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_10px_rgba(57,255,106,0.4)]'
                : 'text-[#8FA99B] hover:text-[#EAF7EF]'
            }`}
          >
            2D Canvas
          </button>
          <button
            onClick={() => !is3DMode && onToggle3DMode()}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all ${
              is3DMode
                ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_10px_rgba(57,255,106,0.4)]'
                : 'text-[#8FA99B] hover:text-[#EAF7EF]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Table</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Workspace Layer for Components & Bendable Wires */}
      <svg
        className="w-full h-full pointer-events-auto"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            setIsPanning(true);
            setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            selectComponent(null);
            setActivePropertiesComp(null);
            setPropertiesPosition(null);
          }
        }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* JUMPER WIRES (Curved, Straight or Angled with Bend Points) */}
          {wires.map((wire) => {
            const fromComp = components.find((c) => c.id === wire.fromComponentId);
            const toComp = components.find((c) => c.id === wire.toComponentId);
            if (!fromComp || !toComp) return null;

            const x1 = fromComp.position[0] * 50 + 60;
            const y1 = fromComp.position[2] * 50 + 40;
            const x2 = toComp.position[0] * 50 + 60;
            const y2 = toComp.position[2] * 50 + 40;

            const pathD = getWirePath(x1, y1, x2, y2, wireStyle || 'curved');

            return (
              <g key={wire.id} className="cursor-pointer group">
                {/* Thick invisible hover stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                />
                {/* Wire Shadow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform="translate(0, 3)"
                />
                {/* Actual Colored Wire Core */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={wire.color || '#12B76A'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="transition-colors group-hover:stroke-amber-400"
                />
                {showSignalFlow && isSimulating && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#EAF7EF"
                    strokeWidth="2.5"
                    strokeDasharray="2 12"
                    strokeLinecap="round"
                    className="roboverse-signal-flow pointer-events-none"
                  />
                )}
                {/* Terminal Connection Pins */}
                <circle cx={x1} cy={y1} r="4" fill="#CBD5E1" stroke="#334155" strokeWidth="1.5" />
                <circle cx={x2} cy={y2} r="4" fill="#CBD5E1" stroke="#334155" strokeWidth="1.5" />
              </g>
            );
          })}

          {/* DRAFT WIRE FOLLOWING CURSOR */}
          {wireDraftFrom && (() => {
            const fromComp = components.find((c) => c.id === wireDraftFrom.componentId);
            if (!fromComp) return null;
            const x1 = fromComp.position[0] * 50 + 60;
            const y1 = fromComp.position[2] * 50 + 40;
            const x2 = (mousePos.x - pan.x) / zoom;
            const y2 = (mousePos.y - pan.y) / zoom;

            return (
              <path
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                fill="none"
                stroke={wireColor}
                strokeWidth="3.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="animate-pulse"
              />
            );
          })()}

          {/* PLACED CIRCUIT COMPONENTS (Top-Down Artwork) */}
          <g style={{ opacity: areComponentsVisible ? 1 : 0.08, transition: 'opacity 0.2s' }}>
            {components.map((comp) => {
              const posX = comp.position[0] * 50;
              const posY = comp.position[2] * 50;
              const isSelected = selectedComponentId === comp.id;
              const rotation = comp.rotation?.[1] || 0;

              // Render component SVG art
              const isArduino = comp.typeId.includes('arduino');
              const isBreadboard = comp.typeId.includes('breadboard');
              const isLed = comp.typeId.includes('led');
              const isResistor = comp.typeId.includes('resistor');
              const isUltrasonic = comp.typeId.includes('ultrasonic');
              const isServo = comp.typeId.includes('servo');
              const isMotor = comp.typeId.includes('motor');
              const isBattery = comp.typeId.includes('battery');
              const isButton = comp.typeId.includes('button');
              const buttonInputPin = isButton ? getButtonInputPin(comp.id) : undefined;
              const isButtonPressed = buttonInputPin !== undefined && digitalInputs[buttonInputPin] === false;

              const out = componentOutputs?.get(comp.id);

              return (
                <g
                  key={comp.id}
                  transform={`translate(${posX}, ${posY}) rotate(${rotation}, 60, 40)`}
                  onPointerDown={(e) => handlePointerDownComponent(e, comp)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    selectComponent(comp.id);
                    setActivePropertiesComp(comp);
                    setPropertiesPosition({ x: e.clientX - 140, y: e.clientY - 120 });
                  }}
                  className="cursor-move group"
                >
                  <title>Drag to move. Double-click to edit settings.</title>
                  {/* Selection Highlight Box */}
                  {isSelected && (
                    <rect
                      x="-6"
                      y="-6"
                      width={isBreadboard ? 272 : isArduino ? 232 : 100}
                      height={isBreadboard ? 132 : isArduino ? 172 : 80}
                      rx="14"
                      fill="rgba(57, 255, 106, 0.05)"
                      stroke="#39FF6A"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      className="animate-pulse drop-shadow-[0_0_8px_rgba(57,255,106,0.6)]"
                    />
                  )}

                  {/* SVG Artwork Dispatch */}
                  {isArduino && (
                    <g dangerouslySetInnerHTML={{ __html: COMPONENT_SVG_RENDERERS.arduino_uno() }} />
                  )}
                  {isBreadboard && (
                    <g dangerouslySetInnerHTML={{ __html: COMPONENT_SVG_RENDERERS.breadboard_small() }} />
                  )}

                  {/* Animated LED Glow & Blown State */}
                  {isLed && (() => {
                    const isBlown = diagnostics?.some(
                      (d) => d.code === 'LED_NO_RESISTOR' && d.affectedComponentIds.includes(comp.id)
                    );
                    const isLit = isSimulating && !isBlown && (out?.state.isOn ?? true);
                    const ledColor = comp.properties?.color || '#FF3333';
                    return (
                      <g>
                        {isLit && (
                          <circle cx="50" cy="40" r="28" fill={ledColor} opacity="0.45" filter="blur(8px)" />
                        )}
                        {isBlown ? (
                          <g>
                            <circle cx="50" cy="40" r="18" fill="#1C1917" stroke="#44403C" strokeWidth="2" />
                            <text x="50" y="-10" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle">
                              💥 BLOWN (&gt;30mA)
                            </text>
                            <text x="50" y="44" fill="#EF4444" fontSize="14" fontWeight="bold" textAnchor="middle">
                              ✕
                            </text>
                          </g>
                        ) : (
                          <g
                            dangerouslySetInnerHTML={{
                              __html: COMPONENT_SVG_RENDERERS.led_red({
                                state: { lit: isLit },
                              }),
                            }}
                          />
                        )}
                      </g>
                    );
                  })()}

                  {/* Resistor Artwork */}
                  {isResistor && (
                    <g dangerouslySetInnerHTML={{ __html: COMPONENT_SVG_RENDERERS.resistor() }} />
                  )}

                  {isButton && (
                    <g
                      className="cursor-pointer"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        if (isSimulating && buttonInputPin !== undefined) setDigitalInput(buttonInputPin, false);
                      }}
                      onPointerCancel={handlePointerUp}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          if (isSimulating && buttonInputPin !== undefined) setDigitalInput(buttonInputPin, false);
                        }
                      }}
                      onKeyUp={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') handlePointerUp();
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${comp.name}: ${isButtonPressed ? 'pressed' : 'released'}`}
                    >
                      <rect x="8" y="4" width="64" height="48" rx="9" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
                      <circle cx="40" cy={isButtonPressed ? 30 : 25} r="15" fill={isButtonPressed ? '#F97316' : '#EF4444'} stroke="#FECACA" strokeWidth="2" />
                      <text x="40" y="64" fill="#E2E8F0" fontSize="9" fontWeight="bold" textAnchor="middle">{isButtonPressed ? 'PRESSED' : 'PUSH BUTTON'}</text>
                    </g>
                  )}

                  {/* Ultrasonic Sonar with Interactive Distance Slider */}
                  {isUltrasonic && (() => {
                    const dist = comp.properties?.testDistanceCm ?? 24;
                    return (
                      <g>
                        <g dangerouslySetInnerHTML={{ __html: COMPONENT_SVG_RENDERERS.ultrasonic_sensor() }} />
                        {/* Interactive Distance Tag & Adjuster */}
                        <g transform="translate(10, 85)" className="cursor-pointer">
                          <rect x="0" y="0" width="100" height="22" rx="6" fill="#1E293B" stroke="#0F172A" />
                          <text x="50" y="15" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">
                            Dist: {dist} cm
                          </text>
                          <g onClick={(e) => { e.stopPropagation(); updateComponentProperties(comp.id, { testDistanceCm: Math.max(2, dist - 5) }); }}>
                            <rect x="2" y="2" width="18" height="18" rx="4" fill="#334155" />
                            <text x="11" y="15" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">-</text>
                          </g>
                          <g onClick={(e) => { e.stopPropagation(); updateComponentProperties(comp.id, { testDistanceCm: Math.min(400, dist + 5) }); }}>
                            <rect x="80" y="2" width="18" height="18" rx="4" fill="#334155" />
                            <text x="89" y="15" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">+</text>
                          </g>
                        </g>
                      </g>
                    );
                  })()}

                  {/* Servo Motor with Dynamic Angle Sweep */}
                  {isServo && (() => {
                    const angle = out?.state.angle ?? comp.properties?.angle ?? 90;
                    return (
                      <g>
                        <rect x="0" y="0" width="80" height="48" rx="6" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
                        <rect x="18" y="6" width="44" height="36" rx="4" fill="#1E40AF" />
                        <text x="40" y="28" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                          SG90 {angle}°
                        </text>
                        {/* Rotating Servo Horn */}
                        <g transform={`translate(40, 24) rotate(${angle})`}>
                          <line x1="-18" y1="0" x2="18" y2="0" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
                          <circle cx="0" cy="0" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
                        </g>
                      </g>
                    );
                  })()}

                  {/* DC Motor with Rotating Propeller Shaft */}
                  {isMotor && (() => {
                    const rpm = out?.state.rpm ?? (isSimulating ? 180 : 0);
                    const isSpinning = isSimulating && rpm > 0;
                    return (
                      <g>
                        <rect x="0" y="0" width="70" height="50" rx="8" fill="#64748B" stroke="#334155" strokeWidth="2" />
                        <circle cx="35" cy="25" r="18" fill="#475569" />
                        <text x="35" y="44" fill="#E2E8F0" fontSize="8" fontWeight="bold" textAnchor="middle">
                          DC MOTOR
                        </text>
                        <g
                          transform="translate(35, 20)"
                          className={isSpinning ? 'animate-spin' : ''}
                          style={{ transformOrigin: '0px 0px' }}
                        >
                          <line x1="-12" y1="0" x2="12" y2="0" stroke="#F59E0B" strokeWidth="3" />
                          <line x1="0" y1="-12" x2="0" y2="12" stroke="#F59E0B" strokeWidth="3" />
                          <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
                        </g>
                      </g>
                    );
                  })()}

                  {/* Generic Fallback Component Box */}
                  {!isArduino && !isBreadboard && !isLed && !isResistor && !isButton && !isUltrasonic && !isServo && !isMotor && (
                    <g>
                      <rect x="0" y="0" width="80" height="60" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                      <text x="40" y="34" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {comp.name}
                      </text>
                    </g>
                  )}

                  {/* INTERACTIVE COMPONENT TERMINAL PINS */}
                  {comp.pins.map((pin) => {
                    const pinX = 60; // pin layout relative
                    const pinY = 40;
                    const isHovered =
                      hoveredPin?.compId === comp.id && hoveredPin?.pinId === pin.id;

                    return (
                      <circle
                        key={pin.id}
                        cx={pinX}
                        cy={pinY}
                        r={isHovered ? 7 : 4}
                        fill={isHovered ? '#FFA94D' : '#FFFFFF'}
                        stroke="#FF8A1F"
                        strokeWidth="2"
                        className="transition-all cursor-pointer hover:scale-125"
                        onMouseEnter={() => setHoveredPin({ compId: comp.id, pinId: pin.id })}
                        onMouseLeave={() => setHoveredPin(null)}
                        onClick={(e) => handlePinClick(e, comp.id, pin.id)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Click or drag the overview map to recenter the canvas. */}
      <div
        ref={minimapRef}
        role="application"
        aria-label="Circuit overview map. Click or drag to move the canvas view."
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          recenterFromMinimap(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) recenterFromMinimap(event.clientX, event.clientY);
        }}
        className="absolute bottom-16 left-4 z-30 h-[100px] w-[168px] touch-none overflow-hidden rounded-xl border border-[rgba(57,255,106,0.28)] bg-[#040B08]/90 p-2 shadow-xl backdrop-blur-md"
      >
        <div className="mb-1 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-[#8FA99B]">
          <span>Overview</span><span>Click or drag</span>
        </div>
        <svg viewBox={`0 0 ${miniWidth} ${miniHeight}`} className="h-[78px] w-full">
          <rect width={miniWidth} height={miniHeight} rx="7" fill="#07110D" stroke="rgba(57,255,106,0.15)" />
          {minimapPoints.map((point) => (
            <circle
              key={point.id}
              cx={((point.x - miniMinX) / miniWorldWidth) * miniWidth}
              cy={((point.y - miniMinY) / miniWorldHeight) * miniHeight}
              r={point.id === selectedComponentId ? 4 : 2.5}
              fill={point.id === selectedComponentId ? '#FF9A1F' : '#39FF6A'}
            />
          ))}
          {miniViewport && (
            <rect
              x={Math.max(0, Math.min(miniWidth - 4, miniViewport.x))}
              y={Math.max(0, Math.min(miniHeight - 4, miniViewport.y))}
              width={Math.max(4, Math.min(miniWidth, miniViewport.width))}
              height={Math.max(4, Math.min(miniHeight, miniViewport.height))}
              rx="3"
              fill="rgba(57,255,106,0.08)"
              stroke="#7FE7D6"
              strokeWidth="1.2"
            />
          )}
        </svg>
      </div>

      {/* PROPERTIES POPUP WHEN COMPONENT IS SELECTED */}
      {activePropertiesComp && (
        <ComponentPropertiesPopup
          component={activePropertiesComp}
          onUpdateProperties={(id, props) => {
            updateComponentProperties(id, props);
            setActivePropertiesComp((prev) => (prev && prev.id === id ? { ...prev, properties: { ...prev.properties, ...props } } : prev));
          }}
          onRotate={(id) => {
            rotateComponent(id);
            setActivePropertiesComp((prev) => (prev && prev.id === id ? { ...prev, rotation: [prev.rotation[0], ((prev.rotation[1] || 0) + 45) % 360, prev.rotation[2]] } : prev));
          }}
          onDelete={(id) => {
            removeComponent(id);
            setActivePropertiesComp(null);
            setPropertiesPosition(null);
            selectComponent(null);
          }}
          onClose={() => {
            setActivePropertiesComp(null);
            setPropertiesPosition(null);
          }}
          position={propertiesPosition || undefined}
        />
      )}
    </div>
  );
};
