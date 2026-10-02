'use client';

import React from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';

export const Schematic2DView: React.FC = () => {
  const { components, wires, isSimulating } = useCircuitStore();

  return (
    <div className="relative w-full h-full bg-[#050B08] p-6 overflow-auto select-none font-mono">
      {/* Schematic Grid Background */}
      <div
        className="w-full min-w-[900px] h-full min-h-[600px] border border-[#39FF6A]/20 rounded-2xl relative p-8 bg-[#09150F]/70"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(57,255,106,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Title Block (Standard Engineering Schematic Header) */}
        <div className="absolute top-4 left-6 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#39FF6A]" />
          <span className="text-sm font-bold text-[#39FF6A] tracking-wider uppercase">
            RoboVerse Circuit Schematic (IEEE Standard)
          </span>
          {isSimulating && (
            <span className="text-xs bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/40 px-2 py-0.5 rounded-full animate-pulse">
              LIVE NETLIST SIMULATING
            </span>
          )}
        </div>

        {/* 2D Schematic Block Layout */}
        <div className="grid grid-cols-3 gap-8 mt-12">
          {components.map((comp) => {
            const isArduino = comp.typeId.includes('arduino');
            const isLed = comp.typeId.includes('led');
            const isResistor = comp.typeId.includes('resistor');
            const isBreadboard = comp.typeId.includes('breadboard');

            return (
              <div
                key={comp.id}
                className={`p-4 rounded-xl border backdrop-blur-md transition-all ${
                  isArduino
                    ? 'border-[#0A84FF]/60 bg-[#0A84FF]/10'
                    : isLed
                    ? 'border-[#FF3939]/60 bg-[#FF3939]/10'
                    : isResistor
                    ? 'border-[#FF9A1F]/60 bg-[#FF9A1F]/10'
                    : 'border-[#7FE7D6]/40 bg-[#7FE7D6]/5'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-700/60 mb-3">
                  <span className="text-xs font-bold text-white uppercase">{comp.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{comp.category}</span>
                </div>

                {/* Schematic Symbol Graphic */}
                <div className="flex justify-center my-3">
                  {isResistor && (
                    <svg width="120" height="40" className="text-[#FF9A1F]">
                      <path
                        d="M 5,20 L 25,20 L 35,5 L 45,35 L 55,5 L 65,35 L 75,5 L 85,35 L 95,20 L 115,20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <text x="60" y="38" fontSize="9" fill="#FF9A1F" textAnchor="middle">
                        220Ω
                      </text>
                    </svg>
                  )}

                  {isLed && (
                    <svg width="100" height="50" className="text-[#FF3939]">
                      {/* Anode Line */}
                      <line x1="10" y1="25" x2="35" y2="25" stroke="currentColor" strokeWidth="2" />
                      {/* Triangle */}
                      <polygon points="35,10 35,40 60,25" fill="none" stroke="currentColor" strokeWidth="2" />
                      {/* Cathode Line */}
                      <line x1="60" y1="10" x2="60" y2="40" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="60" y1="25" x2="90" y2="25" stroke="currentColor" strokeWidth="2" />
                      {/* Emission Arrows */}
                      <line x1="50" y1="12" x2="65" y2="2" stroke="#39FF6A" strokeWidth="1.5" />
                      <polygon points="65,2 60,3 64,7" fill="#39FF6A" />
                      <line x1="56" y1="18" x2="71" y2="8" stroke="#39FF6A" strokeWidth="1.5" />
                      <polygon points="71,8 66,9 70,13" fill="#39FF6A" />
                    </svg>
                  )}

                  {isArduino && (
                    <div className="w-full text-center py-2 px-3 border border-[#0A84FF]/40 rounded bg-[#0A84FF]/20 text-[11px] text-[#7FE7D6]">
                      ATmega328P 16MHz RISC MCU
                    </div>
                  )}

                  {isBreadboard && (
                    <div className="w-full text-center py-2 px-3 border border-[#7FE7D6]/30 rounded bg-[#7FE7D6]/10 text-[10px] text-gray-300">
                      Common Interconnect Bus
                    </div>
                  )}
                </div>

                {/* Pin Terminals */}
                <div className="space-y-1.5 pt-2 border-t border-gray-800">
                  <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Pins & Terminals:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.pins.map((pin) => {
                      const isConnected = wires.some(
                        (w) =>
                          (w.fromComponentId === comp.id && w.fromPinId === pin.id) ||
                          (w.toComponentId === comp.id && w.toPinId === pin.id)
                      );
                      return (
                        <span
                          key={pin.id}
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            isConnected
                              ? 'border-[#39FF6A]/60 bg-[#39FF6A]/20 text-[#39FF6A] font-bold'
                              : 'border-gray-700 bg-gray-800/40 text-gray-400'
                          }`}
                        >
                          {pin.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Wires Netlist Table */}
        <div className="mt-8 p-4 rounded-xl border border-gray-800 bg-[#07110D]/90">
          <div className="text-xs font-bold text-[#39FF6A] mb-2 uppercase">Active Schematic Netlist:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {wires.map((wire, idx) => (
              <div
                key={wire.id}
                className="flex items-center justify-between p-2 rounded bg-black/40 border border-gray-800 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: wire.color }}
                  />
                  <span className="text-gray-300 font-mono">Net #{idx + 1}</span>
                </div>
                <div className="text-gray-400 font-mono">
                  {wire.fromComponentId.split('_')[0]}:{wire.fromPinId} ➔{' '}
                  {wire.toComponentId.split('_')[0]}:{wire.toPinId}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
