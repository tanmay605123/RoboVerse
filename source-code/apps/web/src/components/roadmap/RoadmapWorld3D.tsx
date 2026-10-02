'use client';

import React from 'react';
import { PlanTier } from '@roboverse/shared';
import { useAuthStore } from '@/store/useAuthStore';
import { CheckCircle2, Lock, Play, Sparkles, BookOpen, Clock, Award } from 'lucide-react';

export interface LevelData {
  levelNumber: number;
  title: string;
  subtitle: string;
  tier: 'FREE' | 'PLUS' | 'PRO';
  durationHours: number;
  xpReward: number;
  modulesCount: number;
  completedModules: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  description: string;
  iconName: string;
}

export const ROADMAP_LEVELS: LevelData[] = [
  {
    levelNumber: 1,
    title: 'Electronics & Arduino Foundations',
    subtitle: "Ohm's Law, Breadboards & First C++ Sketches",
    tier: 'FREE',
    durationHours: 6,
    xpReward: 300,
    modulesCount: 5,
    completedModules: 5,
    isUnlocked: true,
    isCompleted: true,
    description:
      'Master the basics of voltage, current, resistance, circuit breadboards, and writing your first C++ sketches for the ATmega328P.',
    iconName: 'Zap',
  },
  {
    levelNumber: 2,
    title: 'Sensors & Actuators Mastery',
    subtitle: 'Ultrasonic Sonar, Servos, Motors & Drivers',
    tier: 'PLUS',
    durationHours: 10,
    xpReward: 500,
    modulesCount: 6,
    completedModules: 3,
    isUnlocked: true,
    isCompleted: false,
    description:
      'Learn pulse-width modulation (PWM) to control SG90 servos, L298N motor drivers for DC gear motors, and HC-SR04 sonar distance sensors.',
    iconName: 'Activity',
  },
  {
    levelNumber: 3,
    title: 'IoT & Connected Devices with ESP32',
    subtitle: 'Wi-Fi, Bluetooth BLE, MQTT & Web Dashboards',
    tier: 'PLUS',
    durationHours: 12,
    xpReward: 650,
    modulesCount: 6,
    completedModules: 0,
    isUnlocked: true,
    isCompleted: false,
    description:
      'Connect microcontrollers to the internet. Publish live sensor telemetry via MQTT, host local web servers, and control robots over Bluetooth BLE.',
    iconName: 'Wifi',
  },
  {
    levelNumber: 4,
    title: 'Robotics Mechanisms & Chassis',
    subtitle: 'Kinematics, 2WD/4WD Rovers & Robotic Grippers',
    tier: 'PLUS',
    durationHours: 14,
    xpReward: 800,
    modulesCount: 7,
    completedModules: 0,
    isUnlocked: true,
    isCompleted: false,
    description:
      'Differential drive kinematics, center of gravity, torque calculations, acrylic chassis assembly, and 3D printed mechanical arms.',
    iconName: 'Bot',
  },
  {
    levelNumber: 5,
    title: 'Control Systems & PID Tuning',
    subtitle: 'Closed-Loop Feedback, Optical Encoders & Line Following',
    tier: 'PRO',
    durationHours: 16,
    xpReward: 1000,
    modulesCount: 6,
    completedModules: 0,
    isUnlocked: false,
    isCompleted: false,
    description:
      'Master Proportional-Integral-Derivative (PID) control algorithms for precision line-tracking rovers and inverted pendulum balance bots.',
    iconName: 'Sliders',
  },
  {
    levelNumber: 6,
    title: 'Machine Learning for Edge Robotics',
    subtitle: 'TinyML, Edge Impulse & Camera Object Detection',
    tier: 'PRO',
    durationHours: 18,
    xpReward: 1200,
    modulesCount: 6,
    completedModules: 0,
    isUnlocked: false,
    isCompleted: false,
    description:
      'Train lightweight convolutional neural networks (CNNs) using TinyML and deploy them onto ESP32-CAM and Raspberry Pi for vision-guided navigation.',
    iconName: 'Brain',
  },
  {
    levelNumber: 7,
    title: 'ROS 2 (Robot Operating System) Basics',
    subtitle: 'Nodes, Topics, Services & URDF Modeling',
    tier: 'PRO',
    durationHours: 20,
    xpReward: 1500,
    modulesCount: 8,
    completedModules: 0,
    isUnlocked: false,
    isCompleted: false,
    description:
      'Industry-standard robotics architecture. Learn ROS 2 Humble/Jazzy, publish-subscribe message graphs, URDF robot modeling, and RViz visualization.',
    iconName: 'Boxes',
  },
  {
    levelNumber: 8,
    title: 'Capstone: Full-Stack Autonomous Rover',
    subtitle: 'SLAM Navigation, LiDAR Mapping & Hackathon Demo',
    tier: 'PRO',
    durationHours: 25,
    xpReward: 2500,
    modulesCount: 8,
    completedModules: 0,
    isUnlocked: false,
    isCompleted: false,
    description:
      'Design, simulate in 3D, and deploy a complete autonomous rover featuring simultaneous localization and mapping (SLAM), obstacle avoidance, and cloud dashboard.',
    iconName: 'Trophy',
  },
];

interface RoadmapProps {
  onSelectLevel: (level: LevelData) => void;
}

export const RoadmapWorld3D: React.FC<RoadmapProps> = ({ onSelectLevel }) => {
  const { planTier } = useAuthStore();

  return (
    <div className="relative w-full py-8 px-4 font-sans max-w-5xl mx-auto">
      {/* Visual Connecting Energy Rail */}
      <div className="relative space-y-6">
        {ROADMAP_LEVELS.map((level, idx) => {
          const isPro = planTier === PlanTier.PRO;
          const isPlus = planTier === PlanTier.PLUS || isPro;
          const isTierPermitted =
            level.tier === 'FREE' ||
            (level.tier === 'PLUS' && isPlus) ||
            (level.tier === 'PRO' && isPro);

          const isLocked = !isTierPermitted || !level.isUnlocked;
          const isCurrent = !level.isCompleted && !isLocked;

          return (
            <div
              key={level.levelNumber}
              className={`relative flex items-center gap-6 p-6 rounded-3xl border transition-all ${
                level.isCompleted
                  ? 'bg-[#0E2A1F]/70 border-[#39FF6A]/40 shadow-lg'
                  : isCurrent
                  ? 'bg-[#0E2A1F]/90 border-[#39FF6A] ring-2 ring-[#39FF6A]/30 shadow-2xl scale-[1.01]'
                  : 'bg-[#09150F]/50 border-gray-800 opacity-75'
              }`}
            >
              {/* Level Circle Node */}
              <div className="relative shrink-0">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-xl border transition-transform ${
                    level.isCompleted
                      ? 'bg-[#39FF6A]/20 border-[#39FF6A] text-[#39FF6A]'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-[#39FF6A] to-[#7FE7D6] border-[#39FF6A] text-black shadow-lg shadow-[#39FF6A]/30 animate-pulse'
                      : 'bg-gray-800/60 border-gray-700 text-gray-500'
                  }`}
                >
                  {level.isCompleted ? (
                    <CheckCircle2 className="w-8 h-8 text-[#39FF6A]" />
                  ) : isLocked ? (
                    <Lock className="w-6 h-6 text-gray-500" />
                  ) : (
                    <span>0{level.levelNumber}</span>
                  )}
                </div>

                {/* Vertical trace line between nodes */}
                {idx < ROADMAP_LEVELS.length - 1 && (
                  <div
                    className={`absolute top-16 left-1/2 -translate-x-1/2 w-1 h-12 ${
                      level.isCompleted
                        ? 'bg-gradient-to-b from-[#39FF6A] to-[#39FF6A]/40'
                        : 'bg-gray-800'
                    }`}
                  />
                )}
              </div>

              {/* Content Card */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-[#39FF6A] uppercase tracking-wider">
                    LEVEL {level.levelNumber}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      level.tier === 'FREE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : level.tier === 'PLUS'
                        ? 'bg-teal-950 text-teal-400 border border-teal-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {level.tier} PLAN
                  </span>

                  {level.isCompleted && (
                    <span className="text-[10px] bg-[#39FF6A]/10 text-[#39FF6A] px-2 py-0.5 rounded font-mono font-bold">
                      COMPLETED
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white tracking-wide truncate">
                  {level.title}
                </h3>
                <p className="text-xs text-gray-300 font-mono mt-0.5 mb-2">{level.subtitle}</p>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {level.description}
                </p>

                {/* Telemetry metadata */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-800/80 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#7FE7D6]" />
                    {level.completedModules}/{level.modulesCount} Modules
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {level.durationHours} hrs
                  </span>
                  <span className="flex items-center gap-1.5 text-[#39FF6A] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    +{level.xpReward} XP
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 pl-2">
                {isLocked ? (
                  <div className="text-center">
                    <span className="text-[11px] font-mono text-gray-500 block mb-1">
                      {level.tier} Required
                    </span>
                    <a
                      href="/#pricing"
                      className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-xl text-xs font-bold transition inline-block"
                    >
                      Unlock Level
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectLevel(level)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {level.isCompleted ? 'Review Level' : 'Start Level'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
