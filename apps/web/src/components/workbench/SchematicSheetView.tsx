'use client';

import React, { useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { Download, Printer, ZoomIn, ZoomOut, Maximize2, FileText, Check } from 'lucide-react';
import { getComponentSchematic } from '@roboverse/components-lib';

export const SchematicSheetView: React.FC = () => {
  const { components, wires, isSimulating } = useCircuitStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  // Generate Reference Designators according to IEEE Std 315 prefixes
  const componentRefs: Record<string, string> = {};
  const counters: Record<string, number> = {};

  components.forEach((c) => {
    const schemDef = getComponentSchematic(c.typeId);
    const prefix = schemDef.prefix || 'U';

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
              const schem = getComponentSchematic(comp.typeId);
              const displayVal = comp.properties?.resistanceOhms
                ? `${comp.properties.resistanceOhms}Ω`
                : comp.properties?.voltage
                ? `${comp.properties.voltage}V`
                : comp.properties?.colorName
                ? `${comp.properties.colorName} LED`
                : comp.name;

              return (
                <div
                  key={comp.id}
                  className="p-3 border-2 border-dashed border-gray-300 rounded-xl relative bg-white flex flex-col justify-between min-h-[140px]"
                >
                  {/* Reference Designator Pill */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                    <span className="text-xs font-black text-brand-navy">{refDes}</span>
                    <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]" title={comp.name}>
                      {comp.name}
                    </span>
                  </div>

                  {/* Standard Schematic Graphic (IEEE Std 315) */}
                  <div className="py-2 flex justify-center items-center overflow-hidden">
                    <svg
                      width="120"
                      height="70"
                      viewBox="0 0 120 70"
                      className="text-brand-navy"
                      dangerouslySetInnerHTML={{
                        __html: schem.renderSvg({ refDes, value: displayVal }),
                      }}
                    />
                  </div>

                  {/* Standard Port Labels */}
                  <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 pt-1 border-t border-gray-100">
                    <span className="truncate max-w-[80px]">
                      {schem.ports[0]?.name ? `PIN: ${schem.ports[0].name}` : 'NET_1'}
                    </span>
                    <span className="text-[7px] text-gray-400 uppercase font-sans">
                      {schem.standard.split(' ')[0]}
                    </span>
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
