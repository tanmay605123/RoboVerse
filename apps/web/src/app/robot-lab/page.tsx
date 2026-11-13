'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Wrench,
  Play,
  RotateCcw,
  Compass,
  Layers,
  Cpu,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useRobotStore, ARENA_CONFIGS } from '@/store/useRobotStore';
import { useRituuStore } from '@/store/useRituuStore';
import { Robot3DScene } from '@/components/robotics/Robot3DScene';
import { RoboticsBuilderSidebar } from '@/components/robotics/RoboticsBuilderSidebar';
import { RoboticsTelemetryHUD } from '@/components/robotics/RoboticsTelemetryHUD';
import { ArenaSelectorModal } from '@/components/robotics/ArenaSelectorModal';

export default function RobotLabPage() {
  const {
    mode,
    setMode,
    activeArenaId,
    currentDesignTitle,
    isSimulating,
    resetSimulationState,
  } = useRobotStore();

  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const activeArena = ARENA_CONFIGS[activeArenaId];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07110D] flex flex-col font-sans select-none">
      {/* ================= TOP NAVIGATION / CONTROL BAR ================= */}
      <header className="relative z-30 h-16 px-4 md:px-6 bg-[#040B08]/90 backdrop-blur-xl border-b border-[rgba(57,255,106,0.2)] flex items-center justify-between shrink-0">
        {/* Left: Brand & Return Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#39FF6A]/40 text-[#8FA99B] hover:text-[#EAF7EF] transition-colors text-xs font-mono font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center text-[#39FF6A]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-[#EAF7EF] tracking-tight">
                  Robotic Design Lab
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 font-bold hidden md:inline">
                  Physics v2.4
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#8FA99B] block">
                {currentDesignTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher (CAD BUILDER vs TEST RUN SIMULATION) */}
        <div className="flex items-center p-1 rounded-2xl bg-black/60 border border-[rgba(57,255,106,0.2)]">
          <button
            onClick={() => setMode('BUILDER')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              mode === 'BUILDER'
                ? 'bg-[#39FF6A] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]'
                : 'text-[#8FA99B] hover:text-[#EAF7EF]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>CAD Builder</span>
          </button>
          <button
            onClick={() => setMode('SIMULATION')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              mode === 'SIMULATION'
                ? 'bg-[#39FF6A] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]'
                : 'text-[#8FA99B] hover:text-[#EAF7EF]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulation</span>
          </button>
        </div>

        {/* Right: Active Arena, Circuit Lab switch, Help */}
        <div className="flex items-center gap-2.5">
          {/* Active Arena Picker Button */}
          <button
            onClick={() => setIsArenaModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 hover:border-[#39FF6A] text-[#EAF7EF] transition-all text-xs font-mono"
            title="Switch Environment Arena"
          >
            <Compass className="w-3.5 h-3.5 text-[#39FF6A]" />
            <span className="hidden lg:inline text-[#8FA99B]">Arena:</span>
            <span className="font-bold text-[#39FF6A]">{activeArena.name.split(' ')[0]}</span>
          </button>

          {/* Ask Rituu AI */}
          <button
            onClick={() => {
              const rituu = useRituuStore.getState();
              rituu.setPendingRobotContext(`Design: ${currentDesignTitle}, Arena: ${activeArenaId}`);
              rituu.setOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 hover:border-[#39FF6A] text-[#39FF6A] hover:bg-[#39FF6A]/20 transition-all text-xs font-mono font-bold"
            title="Ask Rituu AI about robot kinematics & tuning"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ask Rituu</span>
          </button>

          {/* Quick link to Circuit Lab */}
          <Link
            href="/workbench"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#7FE7D6]/40 text-[#7FE7D6] hover:bg-[#7FE7D6]/10 transition-colors text-xs font-mono font-bold"
            title="Open Circuit Lab"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Circuit Lab</span>
          </Link>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 flex items-center justify-center text-[#8FA99B] hover:text-[#EAF7EF] transition-colors"
            title="Simulation Controls & Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= 3D VIEWPORT & OVERLAYS ================= */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Three.js / R3F Canvas Viewport */}
        <Robot3DScene />

        {/* Left Floating CAD Builder Sidebar (Only in BUILDER mode or minimized) */}
        {mode === 'BUILDER' && <RoboticsBuilderSidebar />}

        {/* Bottom Floating Telemetry HUD (Always or during simulation) */}
        <RoboticsTelemetryHUD />
      </main>

      {/* ================= ARENA SELECTOR MODAL ================= */}
      <ArenaSelectorModal
        isOpen={isArenaModalOpen}
        onClose={() => setIsArenaModalOpen(false)}
      />

      {/* ================= HELP / MANUAL CONTROL MODAL ================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#07110D]/95 border border-[rgba(57,255,106,0.3)] rounded-3xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.8)] font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(57,255,106,0.15)] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center text-[#39FF6A]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#EAF7EF]">
                  Robotic Lab Simulation Guide
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#8FA99B] hover:text-white text-xs font-mono"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono text-[#8FA99B]">
              <div>
                <h4 className="text-sm font-bold text-[#39FF6A] mb-1">🎮 Physics Engine Features</h4>
                <p className="text-white/70 leading-relaxed font-sans">
                  The RoboVerse Robotics Lab simulates full differential drive kinematics, wheel slip, battery discharge sag, ultrasonic distance raycasting, 5-channel infrared ground sensing, and Sumo opponent combat.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#7FE7D6] mb-1">📐 Physical Diagnostics</h4>
                <p className="text-white/70 leading-relaxed font-sans">
                  Mounting motors, sensors, batteries, and grippers dynamically recalculates the robot's Total Mass, 3D Center of Mass (CoM), Power Budget, and Thrust-to-Weight ratio in real time.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#FF9A1F] mb-1">💾 Cloud Persistence</h4>
                <p className="text-white/70 leading-relaxed font-sans">
                  Completed test runs can be saved directly to the Supabase <code className="text-[#39FF6A]">test_runs</code> table with full telemetry snapshots, lap time, score, and replay scrubbing.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#39FF6A] text-[#07110D] font-mono font-bold text-xs"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
