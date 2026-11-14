'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import confetti from 'canvas-confetti';
import {
  ROBOT_TEMPLATES,
  ARENAS,
  RobotTemplate,
  ArenaDefinition,
  RobotType,
  ArenaId,
  LiveTelemetryFrame,
  TestRunRecord,
} from '@roboverse/shared';
import {
  RoboticsPhysicsEngine,
  RoverSimulationState,
} from '@roboverse/sim-engine';
import { useAuthStore } from '@/store/useAuthStore';
import { labAudio } from '@/lib/synthAudio';
import {
  Layers,
  Wrench,
  Play,
  Square,
  RotateCcw,
  Navigation,
  Activity,
  Battery,
  Zap,
  Target,
  Trophy,
  Award,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Compass,
  Cpu,
  Scale,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

export const RobotBuilderArena: React.FC = () => {
  const { user, profile, updateProfile } = useAuthStore();

  // Mode: 3D CAD Builder vs Physics Simulation Arena
  const [activeTab, setActiveTab] = useState<'ARENA' | 'BUILDER'>('ARENA');

  // Active Template & Arena
  const [selectedTemplate, setSelectedTemplate] = useState<RobotTemplate>(ROBOT_TEMPLATES[0]);
  const [selectedArena, setSelectedArena] = useState<ArenaDefinition>(ARENAS[1]); // Default to Obstacle Course

  // Simulation State
  const [isDriving, setIsDriving] = useState(false);
  const [driveMode, setDriveMode] = useState<'AUTONOMOUS' | 'MANUAL'>('AUTONOMOUS');
  const [completedRun, setCompletedRun] = useState<TestRunRecord | null>(null);

  // Initial state helper
  const getInitialState = (arena: ArenaDefinition): RoverSimulationState => {
    const startCp = arena.checkpoints[0];
    return {
      x: startCp ? startCp.position[0] : 0,
      y: 0.2,
      z: startCp ? startCp.position[2] : 0,
      heading: 0,
      pitch: 0,
      roll: 0,
      linearVelocity: 0,
      angularVelocity: 0,
      leftMotorPwm: 0,
      rightMotorPwm: 0,
      batteryMahRemaining: selectedTemplate.specs.batteryCapacityMah,
      sonarDistanceCm: 150,
      irLineSensors: [false, false, false, false, false],
      armJointsDeg: [90, 60, 90, 30],
      checkpointsCleared: new Set(),
      score: 0,
      elapsedSeconds: 0,
      isColliding: false,
    };
  };

  const [simState, setSimState] = useState<RoverSimulationState>(() => getInitialState(selectedArena));

  // Physical Metrics for current template
  const metrics = useMemo(() => {
    return RoboticsPhysicsEngine.calculatePhysicalMetrics(selectedTemplate);
  }, [selectedTemplate]);

  // Telemetry frame
  const telemetry: LiveTelemetryFrame = useMemo(() => {
    return RoboticsPhysicsEngine.createTelemetryFrame(simState, selectedTemplate, selectedArena);
  }, [simState, selectedTemplate, selectedArena]);

  // Handle template switch
  const handleSelectTemplate = (template: RobotTemplate) => {
    setSelectedTemplate(template);
    const matchingArena = ARENAS.find((a) => a.id === template.defaultArenaId) || selectedArena;
    setSelectedArena(matchingArena);
    setSimState(getInitialState(matchingArena));
    setIsDriving(false);
    labAudio.playButtonClick(true);
  };

  // Handle arena switch
  const handleSelectArena = (arena: ArenaDefinition) => {
    setSelectedArena(arena);
    setSimState(getInitialState(arena));
    setIsDriving(false);
    labAudio.playButtonClick(true);
  };

  // Reset rover
  const handleReset = () => {
    setSimState(getInitialState(selectedArena));
    setIsDriving(false);
    setCompletedRun(null);
    labAudio.playButtonClick(false);
  };

  // Manual WASD / D-Pad controls
  const handleManualCommand = (dir: 'F' | 'B' | 'L' | 'R') => {
    setDriveMode('MANUAL');
    setIsDriving(true);
    setSimState((prev) => {
      let lPwm = prev.leftMotorPwm;
      let rPwm = prev.rightMotorPwm;
      if (dir === 'F') {
        lPwm = 220;
        rPwm = 220;
      } else if (dir === 'B') {
        lPwm = -180;
        rPwm = -180;
      } else if (dir === 'L') {
        lPwm = 60;
        rPwm = 220;
      } else if (dir === 'R') {
        lPwm = 220;
        rPwm = 60;
      }
      return { ...prev, leftMotorPwm: lPwm, rightMotorPwm: rPwm };
    });
  };

  // Main Physics Simulation Loop
  useEffect(() => {
    if (!isDriving || activeTab !== 'ARENA') return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaSec = Math.min(0.08, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      setSimState((prev) => {
        let leftPwm = prev.leftMotorPwm;
        let rightPwm = prev.rightMotorPwm;

        // Autonomous AI behavior when in AUTONOMOUS mode
        if (driveMode === 'AUTONOMOUS') {
          if (selectedTemplate.type === 'ROVER_2WD') {
            // Sonar obstacle avoider
            if (prev.sonarDistanceCm < 45) {
              // Obstacle ahead! Slow & steer away
              leftPwm = 210;
              rightPwm = 40;
            } else {
              leftPwm = 190;
              rightPwm = 190;
            }
          } else if (selectedTemplate.type === 'ROVER_4WD') {
            // Line follower weighted sensor feedback
            const [s0, s1, s2, s3, s4] = prev.irLineSensors;
            if (s2) {
              leftPwm = 200;
              rightPwm = 200;
            } else if (s0 || s1) {
              leftPwm = 60;
              rightPwm = 220;
            } else if (s3 || s4) {
              leftPwm = 220;
              rightPwm = 60;
            } else {
              leftPwm = 160;
              rightPwm = 160;
            }
          } else if (selectedTemplate.type === 'QUADCOPTER') {
            // Drone hover & navigate
            leftPwm = 240;
            rightPwm = 240;
          } else {
            leftPwm = 180;
            rightPwm = 180;
          }
        }

        const stateWithMotors = { ...prev, leftMotorPwm: leftPwm, rightMotorPwm: rightPwm };
        const stepped = RoboticsPhysicsEngine.stepDifferentialDrive(stateWithMotors, selectedArena, deltaSec);

        // Check if all checkpoints cleared
        if (
          stepped.checkpointsCleared.size === selectedArena.checkpoints.length &&
          !completedRun
        ) {
          const runRecord = RoboticsPhysicsEngine.gradeTestRun(
            user?.id || 'demo_user',
            selectedTemplate.id,
            selectedArena,
            stepped
          );
          setCompletedRun(runRecord);
          setIsDriving(false);

          if (runRecord.stars === 3) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          }
        }

        return stepped;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isDriving, driveMode, activeTab, selectedArena, selectedTemplate, completedRun, user?.id]);

  return (
    <div className="relative w-full h-full bg-[#050D09] select-none font-sans overflow-hidden flex flex-col">
      {/* TOP ARENA / BUILDER SUB-HEADER */}
      <div className="h-12 bg-[#07110D]/90 border-b border-[#39FF6A]/20 px-4 flex items-center justify-between z-10 backdrop-blur-md">
        {/* Left: Mode Tabs & Robot Select */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#0E2A1F] p-0.5 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => {
                setActiveTab('ARENA');
                labAudio.playButtonClick(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'ARENA'
                  ? 'bg-[#39FF6A] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Physics Arena
            </button>
            <button
              onClick={() => {
                setActiveTab('BUILDER');
                setIsDriving(false);
                labAudio.playButtonClick(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'BUILDER'
                  ? 'bg-[#7FE7D6] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              3D Robot Builder
            </button>
          </div>

          <div className="w-[1px] h-4 bg-gray-800" />

          {/* Template Selector Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400">Template:</span>
            <select
              value={selectedTemplate.id}
              onChange={(e) => {
                const found = ROBOT_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) handleSelectTemplate(found);
              }}
              className="bg-[#07110D] border border-gray-700 rounded-lg px-2 py-1 text-xs text-[#39FF6A] focus:outline-none focus:border-[#39FF6A]"
            >
              {ROBOT_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.difficulty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Arena Selector & Physical Metrics Badge */}
        <div className="flex items-center gap-3 text-xs">
          {activeTab === 'ARENA' && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Arena:</span>
              <select
                value={selectedArena.id}
                onChange={(e) => {
                  const found = ARENAS.find((a) => a.id === e.target.value);
                  if (found) handleSelectArena(found);
                }}
                className="bg-[#07110D] border border-gray-700 rounded-lg px-2 py-1 text-xs text-[#7FE7D6] focus:outline-none focus:border-[#7FE7D6]"
              >
                {ARENAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-[#0E2A1F] px-2.5 py-1 rounded-lg border border-gray-800 font-mono text-[11px] text-gray-300">
            <Scale className="w-3.5 h-3.5 text-[#39FF6A]" />
            <span>{metrics.totalMassGrams}g</span>
            <span className="text-gray-600">|</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#7FE7D6]" />
            <span>{metrics.stabilityScore}% stab</span>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT: 3D CANVAS */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas camera={{ position: [0, 10, 14], fov: 48 }} shadows>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[10, 16, 10]}
            intensity={1.3}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[0, 4, 0]} intensity={1.2} color="#39FF6A" distance={18} />

          <OrbitControls
            maxPolarAngle={Math.PI / 2.05}
            minDistance={3}
            maxDistance={28}
            enableDamping
          />

          {/* Render Arena or Builder Platform */}
          {activeTab === 'ARENA' ? (
            <Arena3DWorld
              arena={selectedArena}
              simState={simState}
              template={selectedTemplate}
            />
          ) : (
            <RobotCadLabScene
              template={selectedTemplate}
              metrics={metrics}
            />
          )}

          {/* Ground Contact Shadow */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.65}
            scale={22}
            blur={1.6}
            far={4}
          />
        </Canvas>

        {/* OVERLAYS FOR ARENA SIMULATION */}
        {activeTab === 'ARENA' && (
          <>
            {/* Top-Left Telemetry HUD Card */}
            <div className="absolute top-4 left-4 bg-[#07110D]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-[#39FF6A]/30 shadow-2xl font-mono text-xs w-72 space-y-2 pointer-events-none">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] animate-pulse" />
                  <span className="font-bold text-white tracking-wide font-sans text-xs">
                    {selectedTemplate.name}
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30">
                  {simState.isColliding ? 'COLLISION' : isDriving ? 'RUNNING' : 'STANDBY'}
                </span>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0E2A1F]/60 p-2 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">Speed</span>
                  <span className="text-[#39FF6A] font-bold text-sm">
                    {telemetry.speedMps} <span className="text-[10px] text-gray-400">m/s</span>
                  </span>
                </div>

                <div className="bg-[#0E2A1F]/60 p-2 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">Current Draw</span>
                  <span className="text-[#FF9A1F] font-bold text-sm">
                    {telemetry.motorCurrentMa} <span className="text-[10px] text-gray-400">mA</span>
                  </span>
                </div>

                <div className="bg-[#0E2A1F]/60 p-2 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">Battery Level</span>
                  <span className="text-[#7FE7D6] font-bold text-sm">
                    {telemetry.batteryPct}% ({telemetry.batteryVolts}V)
                  </span>
                </div>

                <div className="bg-[#0E2A1F]/60 p-2 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px]">Sonar Distance</span>
                  <span
                    className={`font-bold text-sm ${
                      telemetry.sonarDistanceCm < 40 ? 'text-[#FF3939] animate-pulse' : 'text-[#39FF6A]'
                    }`}
                  >
                    {telemetry.sonarDistanceCm} <span className="text-[10px] text-gray-400">cm</span>
                  </span>
                </div>
              </div>

              {/* 5-Channel IR Line Tracker Bitmask */}
              {selectedTemplate.type === 'ROVER_4WD' && (
                <div className="bg-[#0E2A1F]/60 p-2 rounded-xl border border-gray-800 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 text-[10px]">IR Line Array:</span>
                  <div className="flex gap-1.5">
                    {telemetry.irLineSensors.map((active, i) => (
                      <span
                        key={i}
                        className={`w-3 h-3 rounded-full border ${
                          active
                            ? 'bg-[#39FF6A] border-[#39FF6A] shadow-md shadow-[#39FF6A]/50'
                            : 'bg-black/60 border-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Checkpoint Clearance Progress Bar */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Checkpoints</span>
                  <span className="text-[#39FF6A] font-bold">
                    {telemetry.checkpointsCleared} / {telemetry.totalCheckpoints}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] transition-all"
                    style={{
                      width: `${(telemetry.checkpointsCleared / telemetry.totalCheckpoints) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Floating Control Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#07110D]/95 backdrop-blur-xl p-3 rounded-3xl border border-[#39FF6A]/40 shadow-2xl flex items-center gap-3">
              {/* Drive Toggle */}
              {isDriving ? (
                <button
                  onClick={() => setIsDriving(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF3939]/20 hover:bg-[#FF3939]/30 text-[#FF3939] border border-[#FF3939]/50 rounded-2xl font-bold text-xs transition"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Halt Simulation
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsDriving(true);
                    labAudio.playButtonClick(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black rounded-2xl font-bold text-xs transition shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Test Run
                </button>
              )}

              {/* Drive Mode: Autonomous vs Manual */}
              <div className="flex bg-[#0E2A1F] p-1 rounded-xl border border-gray-800 text-xs">
                <button
                  onClick={() => setDriveMode('AUTONOMOUS')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    driveMode === 'AUTONOMOUS'
                      ? 'bg-[#39FF6A] text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Autonomous AI
                </button>
                <button
                  onClick={() => setDriveMode('MANUAL')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    driveMode === 'MANUAL'
                      ? 'bg-[#7FE7D6] text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Manual WASD
                </button>
              </div>

              {/* On-screen Directional D-Pad */}
              <div className="flex items-center gap-1 bg-[#0E2A1F] p-1 rounded-xl border border-gray-800">
                <button
                  onClick={() => handleManualCommand('L')}
                  className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
                  title="Turn Left (A)"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleManualCommand('F')}
                  className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
                  title="Forward (W)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleManualCommand('B')}
                  className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
                  title="Reverse (S)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleManualCommand('R')}
                  className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-white"
                  title="Turn Right (D)"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Reset to Start Line */}
              <button
                onClick={handleReset}
                className="p-2.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-2xl border border-gray-700 transition"
                title="Reset to Origin"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* OVERLAYS FOR 3D ROBOT CAD BUILDER */}
        {activeTab === 'BUILDER' && (
          <div className="absolute top-4 right-4 w-80 bg-[#07110D]/95 backdrop-blur-xl p-4 rounded-2xl border border-[#7FE7D6]/30 shadow-2xl font-sans text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#7FE7D6]" />
                <span className="font-bold text-white text-sm">CAD Specifications</span>
              </div>
              <span className="text-[10px] font-mono text-[#39FF6A] bg-[#39FF6A]/10 border border-[#39FF6A]/30 px-2 py-0.5 rounded-full">
                {selectedTemplate.type}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">Chassis Dimensions</span>
                <span className="font-mono text-white">
                  {selectedTemplate.chassis.dimensionsMm.join(' × ')} mm
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">Total All-Up Mass</span>
                <span className="font-mono text-[#39FF6A] font-bold">
                  {metrics.totalMassGrams} g
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">Center of Mass (X, Y, Z)</span>
                <span className="font-mono text-[#7FE7D6]">
                  [{metrics.centerOfMass.join(', ')}]
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">Weight Distribution</span>
                <span className="font-mono text-white">
                  F:{metrics.weightDistribution.frontPct}% / R:{metrics.weightDistribution.rearPct}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">Est. Battery Endurance</span>
                <span className="font-mono text-white">
                  ~{metrics.estimatedBatteryLifeMinutes} min
                </span>
              </div>
            </div>

            {/* Attached Hardware BOM */}
            <div>
              <span className="text-[11px] font-bold text-gray-300 block mb-1.5 uppercase tracking-wider">
                Attached Components ({selectedTemplate.defaultParts.length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                {selectedTemplate.defaultParts.map((part) => (
                  <div
                    key={part.id}
                    className="p-1.5 bg-[#0E2A1F]/70 rounded-lg border border-gray-800 flex justify-between items-center"
                  >
                    <span className="text-gray-200">{part.name}</span>
                    <span className="text-[#39FF6A]">{part.massGrams}g</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('ARENA');
                setIsDriving(true);
              }}
              className="w-full py-2 bg-gradient-to-r from-[#7FE7D6] to-[#39FF6A] text-black font-bold rounded-xl shadow-lg transition hover:brightness-110 flex items-center justify-center gap-2"
            >
              <span>Deploy to Arena &rarr;</span>
            </button>
          </div>
        )}
      </div>

      {/* TEST RUN COMPLETION / VICTORY MODAL */}
      {completedRun && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#07110D] border border-[#39FF6A]/40 rounded-3xl p-6 shadow-2xl relative font-sans text-center">
            <button
              onClick={() => setCompletedRun(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-[#39FF6A]" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Test Run Cleared!
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              All checkpoints in {selectedArena.name} cleared successfully.
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((star) => (
                <Award
                  key={star}
                  className={`w-7 h-7 ${
                    star <= completedRun.stars
                      ? 'text-[#FFD700] fill-current drop-shadow-[0_0_8px_#FFD700]'
                      : 'text-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Run Stats */}
            <div className="grid grid-cols-2 gap-2 bg-[#0E2A1F]/60 p-3 rounded-2xl border border-gray-800 text-xs font-mono mb-4 text-left">
              <div>
                <span className="text-gray-400 block text-[10px]">Lap Time:</span>
                <span className="text-[#39FF6A] font-bold text-sm">
                  {completedRun.durationSeconds}s
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Total Score:</span>
                <span className="text-[#7FE7D6] font-bold text-sm">
                  {completedRun.score} XP
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Avg Speed:</span>
                <span className="text-white">
                  {completedRun.telemetrySummary.avgSpeedMps} m/s
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Battery Used:</span>
                <span className="text-[#FF9A1F]">
                  {completedRun.telemetrySummary.batteryConsumedPct}%
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition"
              >
                Retry Arena
              </button>
              <button
                onClick={() => {
                  setCompletedRun(null);
                  setActiveTab('BUILDER');
                }}
                className="flex-1 py-2.5 bg-[#39FF6A] hover:bg-[#2BD95B] text-black rounded-xl text-xs font-bold transition shadow-md"
              >
                Tune in Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 3D ARENA WORLD RENDERER
// -------------------------------------------------------------
function Arena3DWorld({
  arena,
  simState,
  template,
}: {
  arena: ArenaDefinition;
  simState: RoverSimulationState;
  template: RobotTemplate;
}) {
  const [w, l] = arena.dimensions;

  return (
    <group>
      {/* Arena Floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial
          color={
            arena.terrainType === 'TILED_LAB'
              ? '#0A1812'
              : arena.terrainType === 'ROUGH_TERRAIN'
              ? '#141E18'
              : '#0C1611'
          }
          roughness={0.7}
        />
      </mesh>

      {/* Grid Floor */}
      <gridHelper args={[w, arena.gridDivisions, '#39FF6A', '#1E4D38']} position={[0, 0, 0]} />

      {/* Perimeter Walls */}
      <mesh position={[0, 0.5, l / 2]}>
        <boxGeometry args={[w, 1.0, 0.2]} />
        <meshStandardMaterial color="#1E4D38" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.5, -l / 2]}>
        <boxGeometry args={[w, 1.0, 0.2]} />
        <meshStandardMaterial color="#1E4D38" transparent opacity={0.5} />
      </mesh>
      <mesh position={[w / 2, 0.5, 0]}>
        <boxGeometry args={[0.2, 1.0, l]} />
        <meshStandardMaterial color="#1E4D38" transparent opacity={0.5} />
      </mesh>
      <mesh position={[-w / 2, 0.5, 0]}>
        <boxGeometry args={[0.2, 1.0, l]} />
        <meshStandardMaterial color="#1E4D38" transparent opacity={0.5} />
      </mesh>

      {/* High-Contrast Black Line Track (if present) */}
      {arena.lineTrackPath && (
        <group position={[0, 0.005, 0]}>
          {arena.lineTrackPath.map((pt, i) => {
            if (i === arena.lineTrackPath!.length - 1) return null;
            const next = arena.lineTrackPath![i + 1];
            const dx = next[0] - pt[0];
            const dz = next[1] - pt[1];
            const len = Math.sqrt(dx * dx + dz * dz);
            const midX = (pt[0] + next[0]) / 2;
            const midZ = (pt[1] + next[1]) / 2;
            const angle = Math.atan2(dx, dz);

            return (
              <mesh key={i} position={[midX, 0, midZ]} rotation={[-Math.PI / 2, 0, -angle]}>
                <planeGeometry args={[0.08, len]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Obstacles */}
      {arena.obstacles.map((obs) => {
        if (obs.type === 'CYLINDER') {
          return (
            <mesh key={obs.id} position={obs.position} castShadow>
              <cylinderGeometry args={[obs.dimensions[0], obs.dimensions[0], obs.dimensions[1], 24]} />
              <meshStandardMaterial color={obs.color || '#FF9A1F'} roughness={0.4} />
            </mesh>
          );
        } else if (obs.type === 'CONE') {
          return (
            <mesh key={obs.id} position={obs.position} castShadow>
              <coneGeometry args={[obs.dimensions[0], obs.dimensions[1], 16]} />
              <meshStandardMaterial color={obs.color || '#FF9A1F'} roughness={0.4} />
            </mesh>
          );
        } else {
          return (
            <mesh key={obs.id} position={obs.position} castShadow>
              <boxGeometry args={obs.dimensions} />
              <meshStandardMaterial color={obs.color || '#1E4D38'} roughness={0.5} />
            </mesh>
          );
        }
      })}

      {/* Checkpoints with Glowing Rings */}
      {arena.checkpoints.map((cp) => {
        const isPassed = simState.checkpointsCleared.has(cp.id);
        return (
          <group key={cp.id} position={cp.position}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[cp.radius * 0.8, cp.radius, 32]} />
              <meshBasicMaterial
                color={isPassed ? '#39FF6A' : '#7FE7D6'}
                transparent
                opacity={isPassed ? 0.8 : 0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Pulsing Light Pillar */}
            {!isPassed && (
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
                <meshBasicMaterial color="#7FE7D6" transparent opacity={0.6} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 3D Robot in Arena */}
      <RobotRenderer
        template={template}
        simState={simState}
      />
    </group>
  );
}

// -------------------------------------------------------------
// 3D ROBOT CAD LAB SCENE (BUILDER MODE)
// -------------------------------------------------------------
function RobotCadLabScene({
  template,
  metrics,
}: {
  template: RobotTemplate;
  metrics: any;
}) {
  const dummyState: RoverSimulationState = {
    x: 0,
    y: 0.25,
    z: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    linearVelocity: 0,
    angularVelocity: 0,
    leftMotorPwm: 0,
    rightMotorPwm: 0,
    batteryMahRemaining: 1000,
    sonarDistanceCm: 150,
    irLineSensors: [false, false, false, false, false],
    armJointsDeg: [90, 60, 90, 30],
    checkpointsCleared: new Set(),
    score: 0,
    elapsedSeconds: 0,
    isColliding: false,
  };

  return (
    <group>
      {/* Inspection Turntable Platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[4.5, 4.8, 0.2, 48]} />
        <meshStandardMaterial color="#0A1812" metalness={0.4} roughness={0.6} />
      </mesh>
      <gridHelper args={[8, 16, '#7FE7D6', '#1E4D38']} position={[0, 0.06, 0]} />

      {/* Center of Mass (CoM) 3D Visual Crosshair Target */}
      <group position={metrics.centerOfMass}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#FF3939" />
        </mesh>
        {/* Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 24]} />
          <meshBasicMaterial color="#39FF6A" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* The 3D Robot Model */}
      <RobotRenderer template={template} simState={dummyState} />
    </group>
  );
}

// -------------------------------------------------------------
// HIGH-FIDELITY 3D ROBOT MODEL RENDERER (ALL 5 TEMPLATES)
// -------------------------------------------------------------
function RobotRenderer({
  template,
  simState,
}: {
  template: RobotTemplate;
  simState: RoverSimulationState;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);
  const sonarRef = useRef<THREE.Group>(null);
  const propsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(simState.x, 0.2, simState.z);
      groupRef.current.rotation.y = simState.heading;
    }

    // Spin wheels / propellers if driving
    if (simState.linearVelocity > 0 || simState.leftMotorPwm > 0) {
      if (wheelsRef.current) {
        wheelsRef.current.rotation.x += simState.linearVelocity * 10 * delta;
      }
      if (propsRef.current) {
        propsRef.current.children.forEach((p) => {
          p.rotation.y += delta * 45;
        });
      }
    }

    // Sweep sonar servo head
    if (sonarRef.current) {
      sonarRef.current.rotation.y = Math.sin(Date.now() * 0.006) * 0.45;
    }
  });

  // 1. 2WD Autonomous Obstacle Avoider
  if (template.type === 'ROVER_2WD') {
    return (
      <group ref={groupRef}>
        {/* Transparent Acrylic Chassis Base */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[1.5, 0.06, 2.1]} />
          <meshPhysicalMaterial
            color="#0A84FF"
            transmission={0.65}
            opacity={0.85}
            transparent
            roughness={0.15}
          />
        </mesh>

        {/* Arduino Uno R3 on chassis */}
        <mesh position={[0, 0.2, 0.15]}>
          <boxGeometry args={[1.0, 0.08, 0.8]} />
          <meshStandardMaterial color="#0A5C80" />
        </mesh>

        {/* L298N Motor Driver */}
        <mesh position={[0, 0.2, -0.45]}>
          <boxGeometry args={[0.7, 0.08, 0.6]} />
          <meshStandardMaterial color="#A81B1B" />
        </mesh>

        {/* 9V Battery Snap Pack */}
        <mesh position={[0, 0.04, -0.1]}>
          <boxGeometry args={[0.5, 0.3, 0.8]} />
          <meshStandardMaterial color="#222222" />
        </mesh>

        {/* Sonar Turret with HC-SR04 */}
        <group ref={sonarRef} position={[0, 0.32, 0.9]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
            <meshStandardMaterial color="#0A84FF" />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.75, 0.26, 0.08]} />
            <meshStandardMaterial color="#005B94" />
          </mesh>
          <mesh position={[-0.2, 0.12, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.18, 16]} />
            <meshStandardMaterial color="#CCCCCC" metalness={0.8} />
          </mesh>
          <mesh position={[0.2, 0.12, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.18, 16]} />
            <meshStandardMaterial color="#CCCCCC" metalness={0.8} />
          </mesh>

          {/* Sonar Radar Green Ping Beam Cone */}
          <mesh position={[0, 0.12, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.65, 2.0, 16, 1, true]} />
            <meshBasicMaterial color="#39FF6A" transparent opacity={0.15} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Left & Right 65mm Wheels */}
        <group ref={wheelsRef}>
          <mesh position={[-0.85, 0.15, -0.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.18, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.8} />
          </mesh>
          <mesh position={[0.85, 0.15, -0.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.18, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.8} />
          </mesh>
        </group>

        {/* Front & Rear Caster Ball Glides */}
        <mesh position={[0, 0.05, 0.8]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#E0E0E0" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, -0.8]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#E0E0E0" metalness={0.9} />
        </mesh>
      </group>
    );
  }

  // 2. 4WD Line Follower
  if (template.type === 'ROVER_4WD') {
    return (
      <group ref={groupRef}>
        {/* Aluminum Heavy-Duty Chassis */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.7, 0.08, 2.3]} />
          <meshStandardMaterial color="#3A4A42" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* 5-Channel IR Reflective Line Sensor Bar (Front Underside) */}
        <group position={[0, 0.04, 1.15]}>
          <mesh>
            <boxGeometry args={[1.2, 0.03, 0.12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {[-0.4, -0.2, 0, 0.2, 0.4].map((posX, i) => (
            <mesh key={i} position={[posX, -0.02, 0]}>
              <boxGeometry args={[0.08, 0.03, 0.08]} />
              <meshBasicMaterial color={simState.irLineSensors[i] ? '#39FF6A' : '#FF3939'} />
            </mesh>
          ))}
        </group>

        {/* 4 Wheels */}
        <group ref={wheelsRef}>
          <mesh position={[-0.95, 0.18, 0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.2, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <mesh position={[0.95, 0.18, 0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.2, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <mesh position={[-0.95, 0.18, -0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.2, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
          <mesh position={[0.95, 0.18, -0.7]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.38, 0.38, 0.2, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.9} />
          </mesh>
        </group>
      </group>
    );
  }

  // 3. 3-DOF Robotic Manipulator Arm
  if (template.type === 'ROBOTIC_ARM_3DOF') {
    const [yaw, shoulder, elbow, gripper] = simState.armJointsDeg;

    return (
      <group ref={groupRef}>
        {/* Heavy Cast Steel Base Platform */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.8, 0.9, 0.2, 32]} />
          <meshStandardMaterial color="#2B3632" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Base Turret Yaw Joint */}
        <group rotation={[0, (yaw * Math.PI) / 180, 0]} position={[0, 0.2, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
            <meshStandardMaterial color="#0A84FF" />
          </mesh>

          {/* Shoulder Pitch Joint */}
          <group position={[0, 0.3, 0]} rotation={[-(shoulder * Math.PI) / 180, 0, 0]}>
            {/* Upper Arm Link */}
            <mesh position={[0, 0.6, 0]}>
              <boxGeometry args={[0.15, 1.2, 0.15]} />
              <meshStandardMaterial color="#CCCCCC" metalness={0.7} />
            </mesh>

            {/* Elbow Pitch Joint */}
            <group position={[0, 1.2, 0]} rotation={[(elbow * Math.PI) / 180, 0, 0]}>
              {/* Forearm Link */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.12, 1.0, 0.12]} />
                <meshStandardMaterial color="#39FF6A" />
              </mesh>

              {/* End Effector Gripper Claws */}
              <group position={[0, 1.05, 0]}>
                <mesh position={[-0.1, 0.15, 0]}>
                  <boxGeometry args={[0.04, 0.25, 0.08]} />
                  <meshStandardMaterial color="#FF9A1F" />
                </mesh>
                <mesh position={[0.1, 0.15, 0]}>
                  <boxGeometry args={[0.04, 0.25, 0.08]} />
                  <meshStandardMaterial color="#FF9A1F" />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    );
  }

  // 4. Hexapod Spider Walker
  if (template.type === 'HEXAPOD_WALKER') {
    return (
      <group ref={groupRef}>
        {/* Central Hexagonal Body Shell */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.2, 6]} />
          <meshStandardMaterial color="#1E2A24" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.1, 6]} />
          <meshStandardMaterial color="#39FF6A" emissive="#39FF6A" emissiveIntensity={0.2} />
        </mesh>

        {/* 6 Articulated Legs */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <group key={i} position={[Math.cos(rad) * 0.8, 0.35, Math.sin(rad) * 0.8]} rotation={[0, -rad, 0]}>
              <mesh position={[0.3, 0, 0]}>
                <boxGeometry args={[0.6, 0.08, 0.08]} />
                <meshStandardMaterial color="#CCCCCC" metalness={0.7} />
              </mesh>
              <mesh position={[0.6, -0.2, 0]} rotation={[0, 0, -Math.PI / 3]}>
                <boxGeometry args={[0.6, 0.06, 0.06]} />
                <meshStandardMaterial color="#111111" />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  // 5. Quadcopter AeroDrone X-4
  if (template.type === 'QUADCOPTER') {
    return (
      <group ref={groupRef}>
        {/* Carbon Fiber X-Arms */}
        <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[2.8, 0.06, 0.12]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[2.8, 0.06, 0.12]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.4} />
        </mesh>

        {/* Center Flight Controller Canopy */}
        <mesh position={[0, 0.38, 0]}>
          <sphereGeometry args={[0.35, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#FF9A1F" roughness={0.2} />
        </mesh>

        {/* 4 BLDC Motors with Spinning Propellers */}
        <group ref={propsRef}>
          {[
            [-1.0, 0.35, 1.0],
            [1.0, 0.35, 1.0],
            [-1.0, 0.35, -1.0],
            [1.0, 0.35, -1.0],
          ].map((pos, idx) => (
            <group key={idx} position={pos as [number, number, number]}>
              {/* Motor Stator */}
              <mesh>
                <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
                <meshStandardMaterial color="#0A84FF" metalness={0.8} />
              </mesh>
              {/* Propeller Blade */}
              <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.9, 0.02, 0.1]} />
                <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    );
  }

  return null;
}
