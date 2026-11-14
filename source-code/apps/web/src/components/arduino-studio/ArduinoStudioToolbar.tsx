'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useArduinoStudioStore } from '@/store/useArduinoStudioStore';
import { TEMPLATES } from './templates';
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  CheckCircle2,
  Download,
  Share2,
  ChevronLeft,
  Sparkles,
  Layers,
  Box,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Copy,
  Check,
  FileDown,
  FolderOpen,
} from 'lucide-react';

const WIRE_COLORS = [
  { color: '#39FF6A', label: 'Signal (Green)' },
  { color: '#FF3939', label: 'Power (Red)' },
  { color: '#222222', label: 'Ground (Black)' },
  { color: '#0A84FF', label: 'Logic (Blue)' },
  { color: '#FF9A1F', label: 'Aux (Orange)' },
  { color: '#FFD700', label: 'Clock (Yellow)' },
  { color: '#FFFFFF', label: 'Common (White)' },
];

export const ArduinoStudioToolbar: React.FC = () => {
  const {
    projectName,
    setProjectName,
    visualizationMode,
    setVisualizationMode,
    activeWireColor,
    setActiveWireColor,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    isSimulating,
    isPaused,
    simulationSpeed,
    setSimulationSpeed,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    compileCode,
    undo,
    redo,
    undoStack,
    redoStack,
    exportInoFile,
    exportJsonProject,
    loadTemplate,
    arduinoCode,
  } = useArduinoStudioStore();

  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 bg-[#07110D]/95 border-b border-[#39FF6A]/20 px-4 flex items-center justify-between z-30 backdrop-blur-xl select-none">
      {/* LEFT: Branding, Return Link & Project Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/workbench"
          className="p-1.5 rounded-lg bg-gray-800/40 hover:bg-[#39FF6A]/10 text-gray-400 hover:text-[#39FF6A] border border-gray-700/60 transition"
          title="Return to 3D Workbench"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            RoboVerse <span className="text-[#39FF6A]">Arduino Studio</span>
          </span>
          <span className="text-[9px] font-mono bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-1.5 py-0.5 rounded">
            SIM v2.0
          </span>
        </div>

        <div className="w-[1px] h-5 bg-gray-800" />

        {/* Editable Project Name */}
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent hover:bg-gray-900/60 focus:bg-gray-900 text-xs text-white font-medium px-2 py-1 rounded border border-transparent focus:border-[#39FF6A]/40 outline-none w-56 truncate transition"
          title="Click to rename project"
        />

        {/* Template Selector */}
        <select
          onChange={(e) => loadTemplate(e.target.value)}
          className="bg-[#0E2A1F] text-[#7FE7D6] border border-[#7FE7D6]/30 text-[11px] rounded px-2 py-1 outline-none cursor-pointer"
          title="Load pre-built circuit templates"
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* CENTER: 2D vs 3D Mode Switcher */}
      <div className="flex items-center bg-[#0E2A1F] p-1 rounded-xl border border-gray-800 text-xs">
        <button
          onClick={() => setVisualizationMode('2D')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            visualizationMode === '2D'
              ? 'bg-[#39FF6A] text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
          title="2D Precision Breadboard & Component Placement"
        >
          <Layers className="w-3.5 h-3.5" />
          2D Canvas
        </button>

        <button
          onClick={() => setVisualizationMode('3D')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            visualizationMode === '3D'
              ? 'bg-gradient-to-r from-[#7FE7D6] to-[#39FF6A] text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Realistic 3D Electronics & Interactive Orbit Camera"
        >
          <Box className="w-3.5 h-3.5" />
          3D Realistic
        </button>
      </div>

      {/* RIGHT: Tools, Zoom, Wire Colors, Sim Controls & Export */}
      <div className="flex items-center gap-2">
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

        {/* Wire Color Picker */}
        <div className="flex items-center gap-1 bg-[#0E2A1F] p-1 rounded-xl border border-gray-800">
          {WIRE_COLORS.map((w) => (
            <button
              key={w.color}
              onClick={() => setActiveWireColor(w.color)}
              className={`w-4 h-4 rounded-full transition-transform ${
                activeWireColor === w.color
                  ? 'ring-2 ring-white scale-110 shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: w.color }}
              title={`Wire Color: ${w.label}`}
            />
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800 text-gray-300">
          <button
            onClick={zoomOut}
            className="p-1 hover:text-[#39FF6A] transition"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono px-1 text-gray-400">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1 hover:text-[#39FF6A] transition"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1 hover:text-[#7FE7D6] transition"
            title="Reset Zoom to 100%"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-gray-800" />

        {/* Simulation Speed Control */}
        <select
          value={simulationSpeed}
          onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
          className="bg-[#0E2A1F] text-[#39FF6A] border border-gray-800 text-[10px] rounded px-1.5 py-1 font-mono outline-none cursor-pointer"
          title="Simulation execution speed multiplier"
        >
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="1">1.0x (Realtime)</option>
          <option value="2">2.0x</option>
          <option value="5">5.0x</option>
        </select>

        {/* Simulation Controller Action Group */}
        <div className="flex items-center gap-1.5">
          {/* Compile Button */}
          <button
            onClick={compileCode}
            disabled={isSimulating}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/80 hover:bg-gray-800 text-gray-200 border border-gray-700 rounded-lg text-xs font-semibold transition"
            title="Verify & Compile C++ Sketch"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF6A]" />
            Compile
          </button>

          {/* Start / Stop */}
          {isSimulating ? (
            <button
              onClick={stopSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF3939]/20 hover:bg-[#FF3939]/30 text-[#FF3939] border border-[#FF3939]/50 rounded-lg text-xs font-bold transition shadow-sm"
              title="Stop Simulation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold rounded-lg text-xs shadow-md transition"
              title="Start Real-time Simulation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Sim
            </button>
          )}

          {/* Pause / Resume */}
          {isSimulating && (
            <button
              onClick={isPaused ? resumeSimulation : pauseSimulation}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-gray-800/80 text-gray-300 border-gray-700 hover:text-white'
              }`}
              title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Reset Circuit & MCU */}
          <button
            onClick={resetSimulation}
            className="p-1.5 bg-gray-800/80 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-700 transition"
            title="Reset MCU & Electrical Nets"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-gray-800" />

        {/* Export / Share Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0E2A1F] hover:bg-[#0E2A1F]/80 text-[#7FE7D6] border border-[#7FE7D6]/30 text-xs font-medium rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#07110D] border border-gray-800 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 font-sans">
              <button
                onClick={() => {
                  exportInoFile();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#39FF6A]/10 text-gray-300 hover:text-[#39FF6A] rounded-lg transition"
              >
                <FileDown className="w-4 h-4 text-[#39FF6A]" />
                Download .ino Sketch
              </button>
              <button
                onClick={() => {
                  exportJsonProject();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-[#7FE7D6]/10 text-gray-300 hover:text-[#7FE7D6] rounded-lg transition"
              >
                <Download className="w-4 h-4 text-[#7FE7D6]" />
                Export Circuit (.json)
              </button>
              <button
                onClick={() => {
                  handleCopyCode();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-gray-800 text-gray-300 rounded-lg transition"
              >
                {copied ? <Check className="w-4 h-4 text-[#39FF6A]" /> : <Copy className="w-4 h-4" />}
                Copy Arduino Code
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
