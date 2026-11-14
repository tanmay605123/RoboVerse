'use client';

import React, { useState, useEffect } from 'react';
import {
  QualityTier,
  QUALITY_PRESETS,
  auditSceneBudget,
  ALL_ROBOVERSE_COMPONENTS,
  VersionedLibraryComponent,
} from '@roboverse/shared';
import { useCircuitStore } from '@/store/useCircuitStore';

// Build fast lookup map
const componentLookup = new Map<string, VersionedLibraryComponent>();
ALL_ROBOVERSE_COMPONENTS.forEach((c) => componentLookup.set(c.id, c));

interface PerformanceMonitorHUDProps {
  onPresetChange?: (preset: QualityTier) => void;
}

export function PerformanceMonitorHUD({ onPresetChange }: PerformanceMonitorHUDProps) {
  const { components, wires } = useCircuitStore();
  const [activePreset, setActivePreset] = useState<QualityTier>('HIGH');
  const [fps, setFps] = useState(60);
  const [isExpanded, setIsExpanded] = useState(false);

  // Measure actual browser render loop FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / (now - lastTime))));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const audit = auditSceneBudget(
    components.map((c) => ({ componentId: c.typeId || c.id })),
    wires.length,
    componentLookup,
    activePreset
  );

  const handleSelectPreset = (tier: QualityTier) => {
    setActivePreset(tier);
    if (onPresetChange) {
      onPresetChange(tier);
    }
  };

  const getFpsColor = () => {
    if (fps >= 55) return 'text-[#39FF6A]';
    if (fps >= 30) return 'text-[#FF9A1F]';
    return 'text-red-400';
  };

  const getBudgetBarColor = () => {
    if (audit.budgetUtilizationPct < 60) return 'bg-[#39FF6A]';
    if (audit.budgetUtilizationPct < 85) return 'bg-[#7FE7D6]';
    if (audit.budgetUtilizationPct <= 100) return 'bg-[#FF9A1F]';
    return 'bg-red-500';
  };

  return (
    <div className="absolute top-4 left-4 z-30 font-mono text-xs select-none">
      {/* Compact Mini Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B1914]/90 backdrop-blur-md border border-[#39FF6A]/30 shadow-lg">
        {/* FPS Indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-pulse" />
          <span className={`font-black ${getFpsColor()}`}>{fps} FPS</span>
        </div>

        <span className="text-slate-600">&bull;</span>

        {/* Triangle Count */}
        <span className="text-slate-300">
          {(audit.totalTriangles / 1000).toFixed(1)}k Tris
        </span>

        <span className="text-slate-600">&bull;</span>

        {/* Preset Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#39FF6A]/15 text-[#39FF6A] border border-[#39FF6A]/40 uppercase hover:bg-[#39FF6A]/25 transition-all"
        >
          {activePreset} {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded Performance Inspector */}
      {isExpanded && (
        <div className="mt-2 w-72 p-4 rounded-2xl bg-[#07110D]/95 backdrop-blur-xl border border-[#7FE7D6]/30 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-[#7FE7D6] text-[11px] uppercase tracking-wider">
              3D Performance &amp; Triangles
            </span>
            <span className="text-[10px] text-slate-400">Target 60 FPS</span>
          </div>

          {/* Budget Utilization Meter */}
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Scene Polygon Budget:</span>
              <span className="font-bold text-white">
                {audit.totalTriangles.toLocaleString()} /{' '}
                {audit.budgetLimit.toLocaleString()} ({audit.budgetUtilizationPct}%)
              </span>
            </div>
            <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-200 ${getBudgetBarColor()}`}
                style={{ width: `${Math.min(100, audit.budgetUtilizationPct)}%` }}
              />
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/40 p-2.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">BOARDS (&gt;15k):</span>
              <span className="font-bold text-white">{audit.boardCount} Units</span>
            </div>
            <div>
              <span className="text-slate-500 block">PARTS (&lt;5k):</span>
              <span className="font-bold text-white">{audit.smallPartCount} Parts</span>
            </div>
            <div>
              <span className="text-slate-500 block">JUMPER WIRES:</span>
              <span className="font-bold text-white">
                {wires.length} ({audit.wireTriangles.toLocaleString()} Tris)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">DRAW CALLS:</span>
              <span className="font-bold text-[#39FF6A]">
                {Math.max(4, components.length + Math.ceil(wires.length / 4))} Calls
              </span>
            </div>
          </div>

          {/* Quality Presets Switcher */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase block mb-1.5">
              Graphics Quality Preset:
            </span>
            <div className="grid grid-cols-4 gap-1">
              {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as QualityTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => handleSelectPreset(tier)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    activePreset === tier
                      ? 'bg-[#39FF6A] text-[#07110D] shadow-md shadow-[#39FF6A]/20'
                      : 'bg-black/50 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">
              {QUALITY_PRESETS[activePreset].description}
            </p>
          </div>

          {/* Budget Overrun Warning */}
          {!audit.isWithinBudget && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/40 text-[10px] text-red-300">
              ⚠️ Scene exceeds {activePreset} budget ({audit.budgetUtilizationPct}%). Switch to
              Medium or Low to guarantee 60 fps on mobile.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
