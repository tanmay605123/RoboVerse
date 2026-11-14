'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  LiveTestRunSession,
  LiveTelemetryFrame,
  realtimeManager,
} from '@roboverse/shared';

export default function LiveTestRunViewerPage() {
  const params = useParams();
  const testRunId = (params?.id as string) || 'tr_sih_mars_rover_01';

  const [session, setSession] = useState<LiveTestRunSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewers, setViewers] = useState(4);

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial run session data
  useEffect(() => {
    async function loadSession() {
      try {
        setLoading(true);
        const res = await fetch(`/api/realtime/test-run/${testRunId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Test run not found');
        setSession(json.data);
        setViewers(json.data.viewerCount || 4);
        if (json.data.frames?.length > 0) {
          setActiveFrameIndex(0);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load test run session');
      } finally {
        setLoading(false);
      }
    }
    loadSession();

    // Subscribe to live telemetry broadcast via Realtime manager
    const unsubscribe = realtimeManager.subscribeToTestRun(testRunId, {
      onTelemetry: (frame: LiveTelemetryFrame) => {
        setSession((prev) => {
          if (!prev) return prev;
          const updatedFrames = [...prev.frames, frame];
          return {
            ...prev,
            currentFrame: frame,
            frames: updatedFrames,
            score: Math.max(prev.score, frame.score),
            durationSeconds: frame.durationSeconds,
          };
        });
      },
      onCompleted: (result) => {
        setSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'completed',
            score: result.score,
            durationSeconds: result.durationSeconds,
            stars: result.stars,
            passed: true,
          };
        });
      },
    });

    return () => {
      unsubscribe();
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [testRunId]);

  // Telemetry Replay Playback Timer (20 Hz interpolation = 50ms per frame)
  useEffect(() => {
    if (!isPlaying || !session?.frames?.length) return;

    const intervalMs = Math.max(20, Math.round(50 / playbackSpeed));

    playbackTimerRef.current = setInterval(() => {
      setActiveFrameIndex((prev) => {
        if (prev >= session.frames.length - 1) {
          return 0; // Loop replay
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, session?.frames?.length, playbackSpeed]);

  const currentFrame: LiveTelemetryFrame | undefined =
    session?.frames && session.frames.length > 0
      ? session.frames[activeFrameIndex]
      : session?.currentFrame;

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07110D] flex items-center justify-center text-slate-100 font-mono">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#39FF6A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-[#7FE7D6] uppercase tracking-wider">
            Connecting to Realtime Telemetry Feed...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#07110D] flex items-center justify-center p-4 text-slate-100 font-mono">
        <div className="max-w-md w-full bg-[#0B1914] border border-red-500/40 rounded-2xl p-6 text-center">
          <div className="text-2xl text-red-400 mb-2">⚠️</div>
          <h2 className="text-lg font-bold text-white uppercase">Test Run Not Available</h2>
          <p className="text-xs text-slate-400 mt-2 mb-6">{error || 'Session ID is invalid.'}</p>
          <Link
            href="/workbench"
            className="px-4 py-2.5 rounded-xl bg-[#39FF6A] text-[#07110D] text-xs font-bold uppercase hover:bg-[#32e05d]"
          >
            Return to 3D Workbench
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07110D] text-slate-100 flex flex-col font-sans">
      {/* Top Telemetry Header */}
      <header className="border-b border-[#39FF6A]/20 bg-[#0B1914]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/workbench"
            className="p-1.5 rounded-lg border border-slate-700/60 bg-black/40 hover:border-[#39FF6A] text-slate-400 hover:text-white transition-all text-xs font-mono"
            title="Back to Workbench"
          >
            ← Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                {session.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#39FF6A]/15 text-[#39FF6A] border border-[#39FF6A]/30 uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] animate-ping" />
                LIVE STREAM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Pilot: <span className="text-[#7FE7D6]">{session.studentName}</span> (
              <code>{session.studentId}</code>) &bull; Robot: <strong>{session.robotName}</strong>{' '}
              &bull; Arena: <strong>{session.arenaName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Viewers Count */}
          <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-[#7FE7D6]/30 text-xs font-mono text-[#7FE7D6] flex items-center gap-2">
            <span>👁️</span>
            <span>{viewers} Watching</span>
          </div>

          {/* Share Button */}
          <button
            onClick={handleCopyShareLink}
            className="px-3.5 py-1.5 rounded-lg bg-[#39FF6A]/20 hover:bg-[#39FF6A]/30 text-[#39FF6A] border border-[#39FF6A]/40 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5"
          >
            <span>🔗</span>
            <span>{copiedLink ? 'COPIED LINK!' : 'SHARE RUN'}</span>
          </button>
        </div>
      </header>

      {/* Main Grid Viewport */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Left 2 Cols: 3D Replay Canvas & Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* 3D Canvas Container */}
          <div className="relative flex-1 min-h-[420px] rounded-2xl bg-black border border-[#39FF6A]/30 overflow-hidden shadow-2xl flex flex-col justify-between p-4">
            {/* Top Canvas Overlay HUD */}
            <div className="flex items-center justify-between text-xs font-mono z-10">
              <div className="px-2.5 py-1 rounded bg-[#0B1914]/80 border border-[#7FE7D6]/30 text-slate-200">
                POS: [
                {currentFrame?.position?.[0] ?? (activeFrameIndex * 0.4).toFixed(1)},{' '}
                {currentFrame?.position?.[1] ?? '0.15'},{' '}
                {currentFrame?.position?.[2] ?? (Math.sin(activeFrameIndex * 0.2) * 1.5).toFixed(1)}
                ] m
              </div>
              <div className="px-2.5 py-1 rounded bg-[#0B1914]/80 border border-[#FF9A1F]/30 text-[#FF9A1F]">
                RATE: 20 Hz REALTIME
              </div>
            </div>

            {/* Simulated 3D Arena Ground & Trajectory */}
            <div className="my-auto relative h-64 w-full flex items-center justify-center">
              {/* Isometric Arena Grid Simulation */}
              <div
                className="w-full h-full rounded-xl border border-dashed border-[#7FE7D6]/20 relative overflow-hidden"
                style={{
                  background:
                    'radial-gradient(circle, rgba(57,255,106,0.06) 0%, rgba(7,17,13,0.95) 75%)',
                }}
              >
                {/* Checkpoint Rings */}
                <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full border-2 border-[#39FF6A]/60 flex items-center justify-center text-[10px] font-mono text-[#39FF6A]">
                  CP 1
                </div>
                <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full border-2 border-[#39FF6A]/60 flex items-center justify-center text-[10px] font-mono text-[#39FF6A]">
                  CP 2
                </div>
                <div className="absolute bottom-1/4 right-1/3 w-12 h-12 rounded-full border-2 border-[#39FF6A]/60 flex items-center justify-center text-[10px] font-mono text-[#39FF6A]">
                  CP 3
                </div>

                {/* Animated Robot Node */}
                <div
                  className="absolute w-8 h-8 rounded-lg bg-[#39FF6A] border-2 border-white shadow-lg shadow-[#39FF6A]/50 flex items-center justify-center text-black font-black text-xs transition-all duration-75"
                  style={{
                    left: `${Math.min(85, Math.max(10, 25 + (activeFrameIndex / (session.frames.length || 1)) * 55))}%`,
                    top: `${Math.min(80, Math.max(15, 45 + Math.sin(activeFrameIndex * 0.4) * 25))}%`,
                    transform: `rotate(${(currentFrame?.headingRad || 0) * (180 / Math.PI)}deg)`,
                  }}
                >
                  ▲
                </div>

                {/* Sonar Sensor Ray Cone */}
                <div
                  className="absolute pointer-events-none opacity-40"
                  style={{
                    left: `${Math.min(85, Math.max(10, 25 + (activeFrameIndex / (session.frames.length || 1)) * 55))}%`,
                    top: `${Math.min(80, Math.max(15, 45 + Math.sin(activeFrameIndex * 0.4) * 25))}%`,
                    width: '60px',
                    height: '60px',
                    borderTop: '2px dashed #7FE7D6',
                    borderRight: '2px dashed #7FE7D6',
                    transform: `rotate(${(currentFrame?.headingRad || 0) * (180 / Math.PI) - 45}deg)`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Timeline Controls */}
            <div className="z-10 bg-[#0B1914]/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1 rounded bg-[#39FF6A] text-[#07110D] font-bold uppercase hover:bg-[#32e05d]"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={() => setActiveFrameIndex(0)}
                  className="px-2 py-1 rounded bg-black/40 border border-slate-700 text-slate-300 hover:text-white"
                >
                  ⏮ Restart
                </button>
                <span className="text-slate-400">
                  {currentFrame?.durationSeconds?.toFixed(1) || '0.0'}s /{' '}
                  {session.durationSeconds.toFixed(1)}s
                </span>
              </div>

              {/* Scrubber slider */}
              <input
                type="range"
                min={0}
                max={Math.max(0, session.frames.length - 1)}
                value={activeFrameIndex}
                onChange={(e) => setActiveFrameIndex(Number(e.target.value))}
                className="flex-1 min-w-[140px] accent-[#39FF6A] cursor-pointer"
              />

              {/* Speed Buttons */}
              <div className="flex items-center gap-1">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      playbackSpeed === spd
                        ? 'bg-[#39FF6A]/20 border border-[#39FF6A] text-[#39FF6A]'
                        : 'bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: High-Tech Telemetry Cockpit HUD */}
        <div className="flex flex-col gap-4">
          {/* Run Score & Stars Card */}
          <div className="rounded-2xl bg-[#0B1914] border border-[#39FF6A]/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase">Run Performance</span>
              <span className="text-[#39FF6A] font-bold text-sm tracking-wider">
                {'★'.repeat(session.stars)}
                {'☆'.repeat(3 - session.stars)}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-white font-mono">
                  {currentFrame?.score || session.score}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">PTS</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/40 text-xs font-mono font-bold">
                PASSED
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Checkpoints Cleared:</span>
                <span className="text-white font-bold">
                  {currentFrame?.checkpointsCleared ?? 3} / 4
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Duration:</span>
                <span className="text-white font-bold">{session.durationSeconds}s</span>
              </div>
            </div>
          </div>

          {/* Telemetry Sensor Gauges */}
          <div className="rounded-2xl bg-[#0B1914] border border-[#7FE7D6]/20 p-5 space-y-4 font-mono text-xs">
            <div className="text-[#7FE7D6] font-bold uppercase text-xs tracking-wider border-b border-slate-800 pb-2">
              Hardware Telemetry HUD
            </div>

            {/* Speed & Motor Current */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Speed</span>
                <div className="text-xl font-bold text-white mt-1">
                  {currentFrame?.speedMps ?? 1.2}{' '}
                  <span className="text-xs text-slate-400">m/s</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase">Motor Current</span>
                <div className="text-xl font-bold text-[#FF9A1F] mt-1">
                  {currentFrame?.motorCurrentMa ?? 480}{' '}
                  <span className="text-xs text-slate-400">mA</span>
                </div>
              </div>
            </div>

            {/* Battery Level */}
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400 text-[10px] uppercase">LiPo Battery</span>
                <span className="text-[#39FF6A] font-bold">
                  {currentFrame?.batteryVolts ?? 11.6}V ({currentFrame?.batteryPct ?? 92}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#39FF6A] h-full transition-all duration-100"
                  style={{ width: `${currentFrame?.batteryPct ?? 92}%` }}
                />
              </div>
            </div>

            {/* Sonar Distance Radar */}
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px] uppercase">Ultrasonic Sonar</span>
                <span className="text-white font-bold">
                  {currentFrame?.sonarDistanceCm ?? 45} cm
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    (currentFrame?.sonarDistanceCm ?? 45) < 30 ? 'bg-red-500' : 'bg-[#39FF6A]'
                  }`}
                />
                <span>
                  {(currentFrame?.sonarDistanceCm ?? 45) < 30
                    ? 'Proximity Obstacle Warning'
                    : 'Clear Path Ahead'}
                </span>
              </div>
            </div>

            {/* 5-Channel IR Line Tracker Status */}
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block mb-2">
                5-Channel IR Line Tracker Array
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {(currentFrame?.irLineSensors || [false, true, true, true, false]).map(
                  (active, idx) => (
                    <div
                      key={idx}
                      className={`py-2 rounded text-center font-bold text-[10px] transition-all ${
                        active
                          ? 'bg-[#39FF6A] text-black shadow-md shadow-[#39FF6A]/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      CH{idx + 1}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Attitude Euler Angles */}
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-slate-500 text-[10px] block">PITCH</span>
                <span className="text-white font-bold text-xs">
                  {(((currentFrame?.pitchRad || 0) * 180) / Math.PI).toFixed(1)}°
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ROLL</span>
                <span className="text-white font-bold text-xs">
                  {(((currentFrame?.rollRad || 0) * 180) / Math.PI).toFixed(1)}°
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">HEADING</span>
                <span className="text-white font-bold text-xs">
                  {(((currentFrame?.headingRad || 0) * 180) / Math.PI).toFixed(0)}°
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
