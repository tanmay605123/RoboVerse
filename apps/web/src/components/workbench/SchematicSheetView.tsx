'use client';

import React, { useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { Download, Printer, ZoomIn, ZoomOut, Maximize2, FileText, Check } from 'lucide-react';

export const SchematicSheetView: React.FC = () => {
  const { components, wires, isSimulating } = useCircuitStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  // Generate Reference Designators
  const componentRefs: Record<string, string> = {};
  const counters: Record<string, number> = {
    U: 0,
    R: 0,
    D: 0,
    BAT: 0,
    C: 0,
    SW: 0,
    SERVO: 0,
    PING: 0,
    POT: 0,
  };

  components.forEach((c) => {
    let prefix = 'U';
    if (c.typeId.includes('resistor')) prefix = 'R';
    else if (c.typeId.includes('led')) prefix = 'D';
    else if (c.typeId.includes('battery')) prefix = 'BAT';
    else if (c.typeId.includes('push') || c.typeId.includes('switch')) prefix = 'SW';
    else if (c.typeId.includes('servo')) prefix = 'SERVO';
    else if (c.typeId.includes('ultrasonic')) prefix = 'PING';
    else if (c.typeId.includes('potentiometer')) prefix = 'POT';

    counters[prefix] = (counters[prefix] || 0) + 1;
    componentRefs[c.id] = `${prefix}${counters[prefix]}`;
  });

  const handleDownloadPdf = () => {
    setIsPdfDownloading(true);
    // Trigger native print / PDF export dialog
    setTimeout(() => {
      window.print();
      setIsPdfDownloading(false);
    }, 400);
  };

  return (
    <div className="relative w-full h-full bg-[#07110D] p-4 md:p-8 overflow-auto select-none font-sans text-[#EAF7EF]">
      {/* Schematic Top Floating Controls */}
      <div className="sticky top-2 z-20 flex items-center justify-between bg-[#040B08]/90 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(57,255,106,0.15)] max-w-4xl mx-auto mb-4 font-mono">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#39FF6A]" />
          <span className="text-xs font-bold text-[#EAF7EF] uppercase tracking-wider">
            Schematic View (IEEE Std 315)
          </span>
          {isSimulating && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] animate-pulse">
              Live Netlist Synced
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#8FA99B] w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.1))}
            className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors"
            title="Fit to sheet"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[rgba(57,255,106,0.15)] mx-1" />

          {/* Download .PDF Button (Reference B5) */}
          <button
            onClick={handleDownloadPdf}
            className="btn-primary-neon flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold shadow-neon-pill"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .PDF</span>
          </button>
        </div>
      </div>

      {/* DRAWING-SHEET FRAME (Reference B5) */}
      <div
        className="max-w-5xl mx-auto bg-white border-2 border-[#1E293B] shadow-2xl relative transition-transform duration-200"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          aspectRatio: '1.414/1', // ISO A4 landscape ratio
          minHeight: '650px',
        }}
      >
        {/* Outer & Inner Border Margin */}
        <div className="absolute inset-2 border border-[#1E293B] pointer-events-none" />

        {/* Grid Coordinates Reference Ruler (1..8 columns, A..D rows) */}
        <div className="absolute top-0 inset-x-2 h-5 flex justify-around text-[10px] font-mono font-bold text-gray-500 border-b border-[#1E293B]">
          {['1', '2', '3', '4', '5', '6', '7', '8'].map((col) => (
            <span key={col}>{col}</span>
          ))}
        </div>
        <div className="absolute left-0 inset-y-2 w-5 flex flex-col justify-around text-[10px] font-mono font-bold text-gray-500 border-r border-[#1E293B] items-center">
          {['A', 'B', 'C', 'D'].map((row) => (
            <span key={row}>{row}</span>
          ))}
        </div>

        {/* SCHEMATIC CIRCUIT NETWORKS & SYMBOLS */}
        <div className="p-12 pl-16 h-full flex flex-col justify-between">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
            {components.map((comp) => {
              const refDes = componentRefs[comp.id] || 'U1';
              const isResistor = comp.typeId.includes('resistor');
              const isLed = comp.typeId.includes('led');
              const isArduino = comp.typeId.includes('arduino');
              const isBattery = comp.typeId.includes('battery');
              const isUltrasonic = comp.typeId.includes('ultrasonic');
              const isServo = comp.typeId.includes('servo');

              return (
                <div
                  key={comp.id}
                  className="p-3 border-2 border-dashed border-gray-300 rounded-xl relative bg-white"
                >
                  {/* Reference Designator Pill */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                    <span className="text-xs font-black text-brand-navy">{refDes}</span>
                    <span className="text-[10px] text-gray-500 font-mono truncate max-w-[100px]">
                      {comp.name}
                    </span>
                  </div>

                  {/* Standard Schematic Graphic */}
                  <div className="py-4 flex justify-center items-center">
                    {/* Resistor IEEE Zig-zag */}
                    {isResistor && (
                      <div className="flex flex-col items-center">
                        <svg width="120" height="30" className="text-brand-navy">
                          <line x1="5" y1="15" x2="25" y2="15" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M 25,15 L 32,5 L 42,25 L 52,5 L 62,25 L 72,5 L 82,25 L 92,15 L 115,15"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-[10px] font-mono font-bold mt-1">
                          {comp.properties?.resistanceOhms ?? 220}Ω
                        </span>
                      </div>
                    )}

                    {/* Diode / LED Symbol */}
                    {isLed && (
                      <div className="flex flex-col items-center">
                        <svg width="90" height="40" className="text-brand-navy">
                          <line x1="5" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="2" />
                          <polygon points="30,8 30,32 50,20" fill="none" stroke="currentColor" strokeWidth="2" />
                          <line x1="50" y1="8" x2="50" y2="32" stroke="currentColor" strokeWidth="2.5" />
                          <line x1="50" y1="20" x2="85" y2="20" stroke="currentColor" strokeWidth="2" />
                          {/* Light Emission Rays */}
                          <line x1="42" y1="10" x2="55" y2="2" stroke="currentColor" strokeWidth="1.5" />
                          <polygon points="55,2 50,3 53,6" fill="currentColor" />
                          <line x1="48" y1="14" x2="61" y2="6" stroke="currentColor" strokeWidth="1.5" />
                          <polygon points="61,6 56,7 59,10" fill="currentColor" />
                        </svg>
                        <span className="text-[10px] font-mono font-bold mt-1 text-rose-500">
                          {comp.properties?.colorName ?? 'Red'} LED
                        </span>
                      </div>
                    )}

                    {/* DC Battery Symbol */}
                    {isBattery && (
                      <div className="flex flex-col items-center">
                        <svg width="80" height="35" className="text-brand-navy">
                          <line x1="5" y1="17.5" x2="30" y2="17.5" stroke="currentColor" strokeWidth="2" />
                          <line x1="30" y1="6" x2="30" y2="29" stroke="currentColor" strokeWidth="3" />
                          <line x1="40" y1="10" x2="40" y2="25" stroke="currentColor" strokeWidth="2" />
                          <line x1="50" y1="6" x2="50" y2="29" stroke="currentColor" strokeWidth="3" />
                          <line x1="60" y1="10" x2="60" y2="25" stroke="currentColor" strokeWidth="2" />
                          <line x1="60" y1="17.5" x2="75" y2="17.5" stroke="currentColor" strokeWidth="2" />
                          <text x="24" y="10" fontSize="8" fontWeight="bold">+</text>
                        </svg>
                        <span className="text-[10px] font-mono font-bold mt-1">
                          {comp.properties?.voltage ?? 9.0}V DC
                        </span>
                      </div>
                    )}

                    {/* MCU Box Symbol */}
                    {isArduino && (
                      <div className="w-full border-2 border-brand-navy rounded-lg p-2 text-center bg-gray-50">
                        <span className="text-[11px] font-black tracking-wider block">ATMEGA328P</span>
                        <div className="flex justify-between text-[9px] font-mono mt-2 pt-1 border-t border-gray-300">
                          <span>D13 (SCK)</span>
                          <span>5V / GND</span>
                        </div>
                      </div>
                    )}

                    {/* Sonar Sensor Symbol */}
                    {isUltrasonic && (
                      <div className="w-full border-2 border-brand-navy rounded-lg p-2 text-center bg-blue-50">
                        <span className="text-[11px] font-bold block">HC-SR04 SONAR</span>
                        <div className="flex justify-between text-[8px] font-mono mt-1 text-gray-600">
                          <span>VCC</span>
                          <span>TRIG</span>
                          <span>ECHO</span>
                          <span>GND</span>
                        </div>
                      </div>
                    )}

                    {/* Servo Symbol */}
                    {isServo && (
                      <div className="w-full border-2 border-brand-navy rounded-lg p-2 text-center bg-amber-50">
                        <span className="text-[11px] font-bold block">SG90 SERVO</span>
                        <div className="flex justify-between text-[8px] font-mono mt-1 text-gray-600">
                          <span>GND</span>
                          <span>5V</span>
                          <span>PWM</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Net Labels */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 pt-1 border-t border-gray-100">
                    <span>NET_1</span>
                    <span>NET_GND</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TITLE BLOCK (Standard Lower-Right Engineering Box, Reference B5) */}
          <div className="self-end mt-8 border-2 border-[#1E293B] bg-white w-80 text-xs">
            <div className="p-2 border-b border-[#1E293B] flex items-center justify-between font-black">
              <span>ROBOVERSE EDA SUITE</span>
              <span className="text-[10px] font-mono">REV 1.0</span>
            </div>
            <div className="p-2 border-b border-[#1E293B]">
              <p className="text-[10px] text-gray-500 uppercase font-bold">TITLE</p>
              <p className="font-extrabold text-brand-navy truncate">RoboVerse Interactive Schematic</p>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#1E293B] text-[10px]">
              <div className="p-1.5">
                <span className="text-gray-500">DATE: </span>
                <span className="font-mono font-bold">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="p-1.5">
                <span className="text-gray-500">SHEET: </span>
                <span className="font-bold">1 / 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
