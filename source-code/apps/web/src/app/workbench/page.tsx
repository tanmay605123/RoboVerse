'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCircuitStore } from '@/store/useCircuitStore';
import { BreadboardCanvas } from '@/components/workbench/BreadboardCanvas';
import { Schematic2DView } from '@/components/workbench/Schematic2DView';
import { RobotBuilderArena } from '@/components/workbench/RobotBuilderArena';
import { ComponentPaletteDrawer } from '@/components/workbench/ComponentPaletteDrawer';
import { ArduinoEditorDrawer } from '@/components/workbench/ArduinoEditorDrawer';
import { VirtualInstrumentsModal } from '@/components/workbench/VirtualInstrumentsModal';
import { BomModal } from '@/components/workbench/BomModal';
import { CircuitChallengesModal } from '@/components/workbench/CircuitChallengesModal';
import { CircuitDiagnosticsBar } from '@/components/workbench/CircuitDiagnosticsBar';
import {
  Layers,
  FileCode,
  Bot,
  Activity,
  Trophy,
  ShoppingCart,
  Undo2,
  Redo2,
  Share2,
  ChevronLeft,
  Sparkles,
  Palette,
  Check,
} from 'lucide-react';

const WIRE_COLORS = [
  { color: '#39FF6A', label: 'Signal (Green)' },
  { color: '#FF3939', label: 'VCC (Red)' },
  { color: '#222222', label: 'GND (Black)' },
  { color: '#0A84FF', label: 'PWM (Blue)' },
  { color: '#FF9A1F', label: 'Aux (Orange)' },
  { color: '#FFD700', label: 'Clock (Yellow)' },
];

export default function WorkbenchPage() {
  const {
    viewMode,
    setViewMode,
    activeWireColor,
    setActiveWireColor,
    undo,
    redo,
    undoStack,
    redoStack,
    isSimulating,
    startSimulation,
    stopSimulation,
  } = useCircuitStore();

  const [isInstrumentsOpen, setIsInstrumentsOpen] = useState(false);
  const [isBomOpen, setIsBomOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="w-screen h-screen bg-[#07110D] flex flex-col overflow-hidden select-none">
      {/* TOP CONTROL ROOM HUD BAR */}
      <header className="h-14 bg-[#07110D]/95 border-b border-[#39FF6A]/20 px-4 flex items-center justify-between z-30 backdrop-blur-xl">
        {/* Left: Branding & Back link */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg bg-gray-800/40 hover:bg-[#39FF6A]/10 text-gray-400 hover:text-[#39FF6A] border border-gray-700/60 transition"
            title="Return to Student Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] animate-pulse" />
            <h1 className="text-sm font-bold text-white tracking-wide">
              RoboVerse <span className="text-[#39FF6A]">Workbench</span>
            </h1>
            <span className="text-[10px] font-mono bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-2 py-0.5 rounded-full">
              v1.0 3D MNA
            </span>
          </div>
        </div>

        {/* Center: View Switcher (3D Workbench / 2D Schematic / 3D Robot Arena) */}
        <div className="flex items-center bg-[#0E2A1F] p-1 rounded-xl border border-gray-800 text-xs">
          <button
            onClick={() => setViewMode('3D')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === '3D'
                ? 'bg-[#39FF6A] text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            3D Breadboard
          </button>

          <button
            onClick={() => setViewMode('SCHEMATIC')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'SCHEMATIC'
                ? 'bg-[#39FF6A] text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            2D Schematic
          </button>

          <button
            onClick={() => setViewMode('ROBOT_BUILDER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'ROBOT_BUILDER'
                ? 'bg-gradient-to-r from-[#7FE7D6] to-[#39FF6A] text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            3D Robot Arena
          </button>
        </div>

        {/* Right: Wire Color Selector, Instruments, Challenges, BOM, Undo/Redo */}
        <div className="flex items-center gap-2">
          {/* Wire Color Picker */}
          <div className="flex items-center gap-1 bg-[#0E2A1F] p-1 rounded-xl border border-gray-800">
            {WIRE_COLORS.map((w) => (
              <button
                key={w.color}
                onClick={() => setActiveWireColor(w.color)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  activeWireColor === w.color
                    ? 'ring-2 ring-white scale-110 shadow-md'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: w.color }}
                title={`Wire Color: ${w.label}`}
              />
            ))}
          </div>

          <div className="w-[1px] h-5 bg-gray-800" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="p-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 text-gray-300 disabled:opacity-30 border border-gray-700/60 transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 text-gray-300 disabled:opacity-30 border border-gray-700/60 transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-[1px] h-5 bg-gray-800" />

          {/* Virtual Instruments Button */}
          <button
            onClick={() => setIsInstrumentsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E2A1F] hover:bg-[#0E2A1F]/80 text-[#7FE7D6] border border-[#7FE7D6]/30 text-xs font-medium transition"
          >
            <Activity className="w-3.5 h-3.5" />
            Instruments
          </button>

          {/* Challenges Button */}
          <button
            onClick={() => setIsChallengesOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E2A1F] hover:bg-[#0E2A1F]/80 text-[#FF9A1F] border border-[#FF9A1F]/30 text-xs font-medium transition"
          >
            <Trophy className="w-3.5 h-3.5" />
            Quests
          </button>

          {/* BOM & Store Button */}
          <button
            onClick={() => setIsBomOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0E2A1F] hover:bg-[#0E2A1F]/80 text-[#39FF6A] border border-[#39FF6A]/30 text-xs font-medium transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            BOM &amp; Buy
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 text-gray-300 border border-gray-700/60 transition"
            title="Share Circuit URL"
          >
            {shareCopied ? (
              <Check className="w-3.5 h-3.5 text-[#39FF6A]" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN WORKBENCH LAYOUT */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left: Component Palette Drawer */}
        <ComponentPaletteDrawer />

        {/* Center: Interactive 3D Canvas / 2D Schematic / Robot Builder */}
        <main className="flex-1 relative h-full">
          {viewMode === '3D' && <BreadboardCanvas />}
          {viewMode === 'SCHEMATIC' && <Schematic2DView />}
          {viewMode === 'ROBOT_BUILDER' && <RobotBuilderArena />}

          {/* Bottom Diagnostics Bar */}
          <CircuitDiagnosticsBar />
        </main>

        {/* Right: Arduino C++ Editor & Virtual Serial Monitor */}
        <ArduinoEditorDrawer />
      </div>

      {/* MODALS */}
      <VirtualInstrumentsModal
        isOpen={isInstrumentsOpen}
        onClose={() => setIsInstrumentsOpen(false)}
      />

      <BomModal isOpen={isBomOpen} onClose={() => setIsBomOpen(false)} />

      <CircuitChallengesModal
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
      />
    </div>
  );
}
