'use client';

import React, { useState } from 'react';
import { useArduinoStudioStore } from '@/store/useArduinoStudioStore';
import { COMPONENT_CATALOG } from './catalog';
import {
  Sliders,
  RotateCw,
  Copy,
  Trash2,
  BookOpen,
  Zap,
  Info,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const ArduinoStudioInspector: React.FC = () => {
  const {
    components,
    selectedComponentId,
    selectedWireId,
    wires,
    pinStates,
    componentOutputs,
    rotateComponent,
    duplicateComponent,
    removeComponent,
    removeWire,
    updateComponentProperty,
    togglePushButton,
  } = useArduinoStudioStore();

  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'DOCS'>('PROPERTIES');

  // If a wire is selected
  if (selectedWireId) {
    const wire = wires.find((w) => w.id === selectedWireId);
    if (!wire) return null;

    const fromComp = components.find((c) => c.id === wire.fromComponentId);
    const toComp = components.find((c) => c.id === wire.toComponentId);
    const fromPinState = pinStates.get(`${wire.fromComponentId}:${wire.fromPinId}`);

    return (
      <aside className="w-80 h-full bg-[#07110D]/95 border-l border-[#39FF6A]/20 flex flex-col backdrop-blur-xl z-20 font-sans select-none">
        <div className="p-3.5 border-b border-gray-800 bg-[#0E2A1F]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: wire.color }} />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Jumper Wire Inspector
            </h3>
          </div>
          <button
            onClick={() => removeWire(wire.id)}
            className="p-1.5 text-gray-400 hover:text-[#FF3939] rounded hover:bg-gray-800 transition"
            title="Delete Wire"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
              Wire Color
            </label>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: wire.color }} />
              <span className="font-mono text-white">{wire.color}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2 font-mono">
            <div>
              <span className="text-gray-500 text-[10px] block">FROM PIN:</span>
              <span className="text-[#39FF6A] font-bold">{fromComp?.name || wire.fromComponentId}</span>
              <div className="text-gray-400 text-[11px]">&rarr; Pin: {wire.fromPinId}</div>
            </div>
            <div className="border-t border-gray-800 pt-2">
              <span className="text-gray-500 text-[10px] block">TO PIN:</span>
              <span className="text-[#7FE7D6] font-bold">{toComp?.name || wire.toComponentId}</span>
              <div className="text-gray-400 text-[11px]">&rarr; Pin: {wire.toPinId}</div>
            </div>
            {fromPinState && (
              <div className="border-t border-gray-800 pt-2 text-[11px]">
                <span className="text-gray-500 text-[10px] block">LIVE ELECTRICAL NET:</span>
                <span className="text-white">Net ID: {fromPinState.netId}</span>
                <div className="text-[#39FF6A]">Voltage: {fromPinState.voltage.toFixed(2)}V</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // If no component is selected
  const selectedComp = components.find((c) => c.id === selectedComponentId);
  if (!selectedComp) {
    return (
      <aside className="w-80 h-full bg-[#07110D]/95 border-l border-[#39FF6A]/20 flex flex-col backdrop-blur-xl z-20 font-sans select-none items-center justify-center p-6 text-center text-gray-500">
        <Sliders className="w-8 h-8 text-gray-700 mb-2" />
        <h4 className="text-xs font-bold text-gray-400 mb-1">No Component Selected</h4>
        <p className="text-[11px] leading-relaxed text-gray-500">
          Click any component or breadboard wire on the canvas to inspect its pins, edit properties, and view documentation.
        </p>
      </aside>
    );
  }

  const catalogItem = COMPONENT_CATALOG.find((item) => item.typeId === selectedComp.typeId);
  const output = componentOutputs.get(selectedComp.id)?.state || {};
  const isButton = selectedComp.typeId.includes('button') || selectedComp.typeId.includes('switch');
  const isResistor = selectedComp.typeId.includes('resistor');
  const isLed = selectedComp.typeId.includes('led');
  const isPot = selectedComp.typeId.includes('potentiometer');

  return (
    <aside className="w-80 h-full bg-[#07110D]/95 border-l border-[#39FF6A]/20 flex flex-col backdrop-blur-xl z-20 font-sans select-none">
      {/* Header with Title and Quick Actions */}
      <div className="p-3.5 border-b border-gray-800 bg-[#0E2A1F]/40 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide truncate max-w-[180px]">
              {selectedComp.name}
            </h3>
            <span className="text-[9px] font-mono text-[#7FE7D6] uppercase">
              {selectedComp.category}
            </span>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => rotateComponent(selectedComp.id, 90)}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition"
              title="Rotate 90° Clockwise"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => duplicateComponent(selectedComp.id)}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition"
              title="Duplicate Component"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => removeComponent(selectedComp.id)}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-[#FF3939]/30 text-gray-300 hover:text-[#FF3939] transition"
              title="Delete Component"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab switch: Properties vs Docs */}
        <div className="flex bg-black/40 p-0.5 rounded-lg border border-gray-800 text-[11px]">
          <button
            onClick={() => setActiveTab('PROPERTIES')}
            className={`flex-1 py-1 rounded-md text-center font-medium transition ${
              activeTab === 'PROPERTIES'
                ? 'bg-[#39FF6A] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Properties & Pins
          </button>
          <button
            onClick={() => setActiveTab('DOCS')}
            className={`flex-1 py-1 rounded-md text-center font-medium transition ${
              activeTab === 'DOCS'
                ? 'bg-[#39FF6A] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Documentation
          </button>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs scrollbar-thin scrollbar-thumb-gray-800">
        {activeTab === 'PROPERTIES' && (
          <>
            {/* INTERACTIVE PUSH BUTTON CONTROL */}
            {isButton && (
              <div className="p-3.5 rounded-xl bg-[#0E2A1F]/60 border border-[#39FF6A]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Tactile Push Button State</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      selectedComp.properties?.isPressed
                        ? 'bg-[#39FF6A] text-black font-bold animate-pulse'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {selectedComp.properties?.isPressed ? 'PRESSED (CLOSED)' : 'RELEASED (OPEN)'}
                  </span>
                </div>

                <button
                  onMouseDown={() => togglePushButton(selectedComp.id, true)}
                  onMouseUp={() => togglePushButton(selectedComp.id, false)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 ${
                    selectedComp.properties?.isPressed
                      ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black scale-95 shadow-[#39FF6A]/20'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                  title="Click and hold to physically push the button"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {selectedComp.properties?.isPressed ? 'Button Held Down (0V)' : 'Press Virtual Button'}
                </button>
                <div className="text-[10px] text-gray-400 italic text-center">
                  Pressing bridges Pin 2 to GND, setting digitalRead(2) == LOW.
                </div>
              </div>
            )}

            {/* RESISTOR EDITABLE CONFIGURATION */}
            {isResistor && (
              <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold block">
                  Resistance Value (Ohms)
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedComp.properties?.resistanceOhms || 220}
                    onChange={(e) =>
                      updateComponentProperty(selectedComp.id, 'resistanceOhms', parseInt(e.target.value, 10))
                    }
                    className="flex-1 bg-[#050B08] border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-[#39FF6A] font-mono outline-none"
                  >
                    <option value="220">220 Ω (LED Current Limiter)</option>
                    <option value="330">330 Ω (Standard 5V)</option>
                    <option value="1000">1 kΩ (1000 Ohms)</option>
                    <option value="10000">10 kΩ (Pull-Up/Down)</option>
                  </select>
                </div>
              </div>
            )}

            {/* LED EDITABLE CONFIGURATION */}
            {isLed && (
              <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold block">
                  LED Emissive Color
                </label>
                <div className="flex gap-1.5">
                  {[
                    { color: '#FF3333', label: 'Red' },
                    { color: '#39FF6A', label: 'Green' },
                    { color: '#0A84FF', label: 'Blue' },
                    { color: '#FFD700', label: 'Yellow' },
                    { color: '#FFFFFF', label: 'White' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => updateComponentProperty(selectedComp.id, 'color', c.color)}
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                        (selectedComp.properties?.color || '#FF3333') === c.color
                          ? 'border-white text-white shadow-md'
                          : 'border-transparent text-gray-400 opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: `${c.color}20` }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Live Output telemetry */}
                <div className="pt-2 border-t border-gray-800 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">State:</span>
                    <span className={output.isOn ? 'text-[#39FF6A] font-bold' : 'text-gray-500'}>
                      {output.isOn ? 'GLOWING (ON)' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Draw:</span>
                    <span className="text-white">{output.currentMa || 0} mA</span>
                  </div>
                </div>
              </div>
            )}

            {/* POTENTIOMETER WIPER */}
            {isPot && (
              <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400 font-bold uppercase">Wiper Position</span>
                  <span className="text-[#39FF6A] font-mono">
                    {selectedComp.properties?.wiperPositionPct || 50}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedComp.properties?.wiperPositionPct || 50}
                  onChange={(e) =>
                    updateComponentProperty(selectedComp.id, 'wiperPositionPct', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#39FF6A] cursor-pointer"
                />
              </div>
            )}

            {/* PINS & TERMINAL MONITOR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Pin Terminals ({selectedComp.pins.length})
                </span>
                <span className="text-[9px] font-mono text-gray-500">Live Volts</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {selectedComp.pins.map((pin) => {
                  const pinKey = `${selectedComp.id}:${pin.id}`;
                  const state = pinStates.get(pinKey);
                  const isConnected = wires.some(
                    (w) =>
                      (w.fromComponentId === selectedComp.id && w.fromPinId === pin.id) ||
                      (w.toComponentId === selectedComp.id && w.toPinId === pin.id)
                  );

                  return (
                    <div
                      key={pin.id}
                      className="p-2 rounded-lg bg-black/40 border border-gray-800 flex items-center justify-between text-[11px] font-mono"
                    >
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isConnected ? 'bg-[#39FF6A]' : 'bg-gray-600'
                          }`}
                        />
                        <span className="text-gray-200 truncate">{pin.name}</span>
                        <span className="text-gray-500 text-[9px]">({pin.type})</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {state ? (
                          <>
                            <span className="text-[#7FE7D6] font-bold">
                              {state.voltage.toFixed(2)}V
                            </span>
                            {state.isHigh && (
                              <span className="text-[9px] bg-[#39FF6A]/20 text-[#39FF6A] px-1 rounded">
                                HIGH
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-600">0.00V</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'DOCS' && (
          <div className="space-y-3 font-sans">
            <div>
              <h4 className="text-xs font-bold text-white mb-1">Component Overview</h4>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {catalogItem?.docs.overview || 'Standard electronic component.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-gray-800">
              <h5 className="text-[10px] text-[#7FE7D6] uppercase font-bold mb-1">Pinout Guide</h5>
              <p className="text-[11px] text-gray-300 leading-relaxed font-mono">
                {catalogItem?.docs.pinout || 'See pin markings.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0E2A1F]/40 border border-[#39FF6A]/30">
              <h5 className="text-[10px] text-[#39FF6A] uppercase font-bold mb-1">
                Schematic Best Practice
              </h5>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {catalogItem?.docs.schematicTips || 'Ensure connections are secure.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
