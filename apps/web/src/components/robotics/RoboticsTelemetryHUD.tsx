'use client';

import React from 'react';
import {
  Gauge,
  Zap,
  BatteryCharging,
  Radar,
  Radio,
  Clock,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  FastForward,
} from 'lucide-react';
import { useRobotStore, ARENA_CONFIGS } from '@/store/useRobotStore';

export const RoboticsTelemetryHUD: React.FC = () => {
  const {
    activeArenaId,
    linearVelocityMps,
    leftMotorRpm,
    rightMotorRpm,
    batteryVoltage,
    sonarDistanceCm,
    lineSensors,
    elapsedSeconds,
    currentScore,
    checkpointsCleared,
    isRunCompleted,
    isSimulating,
    isPaused,
    simSpeedMultiplier,
    setSimSpeedMultiplier,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulationState,
    recordedFrames,
    isReplaying,
    replayScrubFraction,
    startReplay,
    stopReplay,
    scrubReplay,
    isSavingRun,
    saveTestRunToSupabase,
    sumoOpponent,
  } = useRobotStore();

  const activeArena = ARENA_CONFIGS[activeArenaId];
  const kmh = (linearVelocityMps * 3.6).toFixed(1);
  const batteryPct = Math.round(Math.max(0, Math.min(100, ((batteryVoltage - 9.6) / (11.1 - 9.6)) * 100)));

  return (
    <div className="absolute inset-x-4 bottom-4 z-30 pointer-events-none select-none font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        {/* TOP STATUS ROW: TIMER, SCORE, ARENA TARGET, SAVE TEST RUN */}
        <div className="flex items-center justify-between gap-3">
          {/* Arena Name & Run Time */}
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#040B08]/90 backdrop-blur-xl border border-[rgba(57,255,106,0.25)] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Clock className="w-4 h-4 text-[#39FF6A]" />
              <span className="text-[#8FA99B] uppercase font-bold">Time:</span>
              <span className="text-base font-black text-[#EAF7EF] w-14">
                {elapsedSeconds.toFixed(2)}s
              </span>
            </div>

            <div className="h-4 w-px bg-[rgba(57,255,106,0.2)]" />

            <div className="flex items-center gap-2 text-xs font-mono">
              <Trophy className="w-4 h-4 text-[#FF9A1F]" />
              <span className="text-[#8FA99B] uppercase font-bold">Score:</span>
              <span className="text-base font-black text-[#FF9A1F]">
                {currentScore} pts
              </span>
            </div>

            {isRunCompleted && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/40 animate-pulse">
                Goal Reached!
              </span>
            )}
          </div>

          {/* SIMULATION CONTROLS & SAVE RUN BUTTON */}
          <div className="pointer-events-auto flex items-center gap-2">
            {!isSimulating ? (
              <button
                onClick={startSimulation}
                className="px-4 py-2 rounded-2xl font-mono text-xs font-black bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_16px_rgba(57,255,106,0.45)] hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Test Run</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={resumeSimulation}
                className="px-4 py-2 rounded-2xl font-mono text-xs font-black bg-[#39FF6A] text-[#07110D] shadow-[0_0_16px_rgba(57,255,106,0.45)] hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseSimulation}
                className="px-4 py-2 rounded-2xl font-mono text-xs font-black bg-[#FF9A1F] text-[#07110D] shadow-[0_0_16px_rgba(255,154,31,0.45)] hover:brightness-110 transition-all flex items-center gap-2"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={resetSimulationState}
              className="p-2.5 rounded-2xl bg-[#040B08]/90 text-[#8FA99B] hover:text-[#39FF6A] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] transition-all"
              title="Reset Robot Position & Run"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Sim Speed Toggle (1x / 2x) */}
            <button
              onClick={() => setSimSpeedMultiplier(simSpeedMultiplier === 1 ? 2 : 1)}
              className="px-3 py-2 rounded-2xl bg-[#040B08]/90 text-xs font-mono font-bold text-[#7FE7D6] border border-[rgba(57,255,106,0.2)] hover:border-[#7FE7D6] transition-all flex items-center gap-1"
              title="Simulation speed multiplier"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{simSpeedMultiplier}x</span>
            </button>

            {/* Save Test Run to Supabase */}
            <button
              onClick={saveTestRunToSupabase}
              disabled={isSavingRun || recordedFrames.length === 0}
              className={`px-4 py-2 rounded-2xl font-mono text-xs font-bold border transition-all flex items-center gap-2 ${
                recordedFrames.length > 0
                  ? 'bg-[#0E2A1F] border-[#39FF6A]/40 text-[#39FF6A] hover:bg-[#39FF6A]/20 shadow-[0_0_12px_rgba(57,255,106,0.2)]'
                  : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSavingRun ? 'Saving...' : 'Save Test Run'}</span>
            </button>
          </div>
        </div>

        {/* BOTTOM TELEMETRY GAUGES ROW */}
        <div className="pointer-events-auto grid grid-cols-2 md:grid-cols-5 gap-3 p-3.5 rounded-3xl bg-[#040B08]/95 backdrop-blur-2xl border border-[rgba(57,255,106,0.2)] shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
          {/* Gauge 1: Linear Speed (m/s and km/h) */}
          <div className="p-3 rounded-2xl bg-[#07140E] border border-[rgba(57,255,106,0.12)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8FA99B] text-[10px] font-mono font-bold uppercase">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-[#39FF6A]" />
                Speed
              </span>
              <span className="text-[#39FF6A]">{kmh} km/h</span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#EAF7EF] font-mono">
                {linearVelocityMps.toFixed(2)}
              </span>
              <span className="text-[10px] font-mono text-[#8FA99B]">m/s</span>
            </div>
            {/* Speed Mini Bar */}
            <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] transition-all"
                style={{ width: `${Math.min(100, (linearVelocityMps / 3.0) * 100)}%` }}
              />
            </div>
          </div>

          {/* Gauge 2: Motor RPM (Left vs Right differential) */}
          <div className="p-3 rounded-2xl bg-[#07140E] border border-[rgba(57,255,106,0.12)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8FA99B] text-[10px] font-mono font-bold uppercase">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#FACC15]" />
                Motor RPM
              </span>
              <span className="text-[#FACC15]">Dual TT</span>
            </div>
            <div className="my-1 text-xs font-mono font-bold space-y-1">
              <div className="flex justify-between items-center text-[#EAF7EF]">
                <span className="text-[10px] text-[#8FA99B]">L:</span>
                <span>{leftMotorRpm} RPM</span>
              </div>
              <div className="flex justify-between items-center text-[#EAF7EF]">
                <span className="text-[10px] text-[#8FA99B]">R:</span>
                <span>{rightMotorRpm} RPM</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden flex gap-0.5">
              <div
                className="h-full bg-[#FACC15] transition-all"
                style={{ width: `${Math.min(50, (leftMotorRpm / 400) * 50)}%` }}
              />
              <div
                className="h-full bg-[#EAB308] transition-all"
                style={{ width: `${Math.min(50, (rightMotorRpm / 400) * 50)}%` }}
              />
            </div>
          </div>

          {/* Gauge 3: Battery Discharge & Voltage */}
          <div className="p-3 rounded-2xl bg-[#07140E] border border-[rgba(57,255,106,0.12)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8FA99B] text-[10px] font-mono font-bold uppercase">
              <span className="flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-[#38BDF8]" />
                Battery
              </span>
              <span className={batteryPct < 20 ? 'text-[#EF4444]' : 'text-[#38BDF8]'}>
                {batteryPct}%
              </span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#EAF7EF] font-mono">
                {batteryVoltage.toFixed(1)}
              </span>
              <span className="text-[10px] font-mono text-[#8FA99B]">V (LiPo)</span>
            </div>
            <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  batteryPct < 20
                    ? 'bg-[#EF4444]'
                    : batteryPct < 50
                    ? 'bg-[#FACC15]'
                    : 'bg-gradient-to-r from-[#38BDF8] to-[#39FF6A]'
                }`}
                style={{ width: `${batteryPct}%` }}
              />
            </div>
          </div>

          {/* Gauge 4: HC-SR04 Sonar Radar Distance */}
          <div className="p-3 rounded-2xl bg-[#07140E] border border-[rgba(57,255,106,0.12)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#8FA99B] text-[10px] font-mono font-bold uppercase">
              <span className="flex items-center gap-1">
                <Radar className="w-3.5 h-3.5 text-[#7FE7D6]" />
                Sonar Ray
              </span>
              <span className={sonarDistanceCm < 25 ? 'text-[#EF4444] font-bold' : 'text-[#7FE7D6]'}>
                {sonarDistanceCm < 25 ? 'Hazard' : 'Clear'}
              </span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#EAF7EF] font-mono">
                {sonarDistanceCm}
              </span>
              <span className="text-[10px] font-mono text-[#8FA99B]">cm</span>
            </div>
            <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  sonarDistanceCm < 25 ? 'bg-[#EF4444]' : 'bg-[#7FE7D6]'
                }`}
                style={{ width: `${Math.min(100, (sonarDistanceCm / 200) * 100)}%` }}
              />
            </div>
          </div>

          {/* Gauge 5: 5-Channel IR Line Array State */}
          <div className="p-3 rounded-2xl bg-[#07140E] border border-[rgba(57,255,106,0.12)] flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-[#8FA99B] text-[10px] font-mono font-bold uppercase">
              <span className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-[#A855F7]" />
                Line Array
              </span>
              <span className="text-[#A855F7]">5-CH</span>
            </div>
            <div className="my-2 flex justify-between items-center px-2">
              {lineSensors.map((active, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      active
                        ? 'bg-[#39FF6A] border-[#39FF6A] shadow-[0_0_8px_#39FF6A]'
                        : 'bg-white/10 border-white/20'
                    }`}
                  />
                  <span className="text-[8px] font-mono text-[#8FA99B]">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="text-[9px] font-mono text-center text-[#8FA99B]">
              Reflectance Ground Optical Bus
            </div>
          </div>
        </div>

        {/* SCRUB REPLAY PLAYBACK TIMELINE (If frames exist) */}
        {recordedFrames.length > 10 && (
          <div className="pointer-events-auto p-3 rounded-2xl bg-[#040B08]/90 backdrop-blur-xl border border-[rgba(57,255,106,0.2)] flex items-center gap-3">
            <button
              onClick={() => {
                if (isReplaying) stopReplay();
                else startReplay();
              }}
              className="p-1.5 rounded-xl bg-[#39FF6A] text-[#07110D] hover:brightness-110 transition-all shrink-0"
              title={isReplaying ? 'Stop Replay' : 'Play Recorded Run'}
            >
              {isReplaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <span className="text-[10px] font-mono text-[#8FA99B] uppercase font-bold shrink-0">
              Replay Scrub:
            </span>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={replayScrubFraction}
              onChange={(e) => scrubReplay(parseFloat(e.target.value))}
              className="flex-1 accent-[#39FF6A] h-1.5 bg-[#0E2A1F] rounded-lg cursor-pointer"
            />

            <span className="text-xs font-mono font-bold text-[#39FF6A] w-12 text-right shrink-0">
              {Math.round(replayScrubFraction * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
