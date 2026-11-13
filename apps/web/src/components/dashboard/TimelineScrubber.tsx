'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Activity } from 'lucide-react';

export function TimelineScrubber() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(38); // 38%
  const [speed, setSpeed] = useState<'1x' | '2x' | '5x'>('1x');

  return (
    <div className="w-full glass-panel px-4 py-2.5 rounded-2xl border border-robo-borderSubtle flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
      {/* Simulation Controls & Current Timestamp */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded-lg bg-robo-neon text-black hover:brightness-110 shadow-neon-subtle transition-all"
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
        </button>

        <button
          onClick={() => setProgress(0)}
          className="p-1.5 rounded-lg bg-robo-surfaceRaised border border-robo-borderSubtle text-robo-textSecondary hover:text-robo-neon transition-colors"
          title="Reset Simulation Time"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 text-robo-neon">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>T+ 00:01:24.400</span>
        </div>
      </div>

      {/* Scrubber Bar with Highlighted Active Range */}
      <div className="flex-1 w-full max-w-xl flex items-center gap-3">
        <span className="text-[10px] text-robo-textMuted">00:00</span>
        <div className="relative flex-1 h-3 bg-[#040B08] rounded-full border border-robo-borderSubtle flex items-center px-1">
          {/* Highlighted Execution Range */}
          <div
            className="absolute left-[15%] w-[35%] h-full bg-robo-teal/20 rounded border-x border-robo-teal/50"
            title="Active Arduino Loop() Interval"
          />

          {/* Current Scrubber Head */}
          <div
            className="absolute h-full bg-gradient-to-r from-robo-neon to-robo-teal rounded-full"
            style={{ width: `${progress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-[10px] text-robo-textMuted">05:00</span>
      </div>

      {/* Speed Selector & Clock Frequency */}
      <div className="flex items-center gap-3 text-[11px]">
        <div className="flex rounded-lg bg-[#040B08] border border-robo-borderSubtle p-0.5">
          {(['1x', '2x', '5x'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                speed === s
                  ? 'bg-robo-neon/20 text-robo-neon border border-robo-neon/40'
                  : 'text-robo-textMuted hover:text-robo-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="hidden lg:block text-robo-teal">
          CLOCK: 16.00 MHz
        </div>
      </div>
    </div>
  );
}
