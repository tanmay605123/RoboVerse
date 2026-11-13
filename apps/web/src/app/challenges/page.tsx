'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import {
  Award,
  Trophy,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Medal,
  Sparkles,
  Lock,
} from 'lucide-react';

interface ChallengeItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Rookie' | 'Builder' | 'Engineer' | 'Innovator';
  xpReward: number;
  timeRemaining: string;
  completionsCount: number;
  description: string;
  starterHref: string;
  isCompleted?: boolean;
}

export default function ChallengesPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const challenges: ChallengeItem[] = [
    {
      id: 'ch_obstacle_rover',
      title: 'Autonomous Obstacle Rover with HC-SR04 & L298N',
      category: 'Robotics & Microcontrollers',
      difficulty: 'Builder',
      xpReward: 250,
      timeRemaining: '3 days left',
      completionsCount: 420,
      description: 'Build a differential drive robot that stops and turns when detecting an object within 15 cm. Tune PWM speed control.',
      starterHref: '/workbench?starter=starter_obstacle_car',
      isCompleted: true,
    },
    {
      id: 'ch_pid_line_follower',
      title: 'PID Controlled High-Speed Line Follower',
      category: 'Control Systems',
      difficulty: 'Engineer',
      xpReward: 500,
      timeRemaining: '5 days left',
      completionsCount: 185,
      description: 'Implement proportional-integral-derivative logic on dual IR sensors to smoothly track curved tracks without jitter.',
      starterHref: '/workbench?starter=starter_line_follower',
      isCompleted: false,
    },
    {
      id: 'ch_bionic_hand',
      title: '5-Finger Prosthetic Hand Kinematics',
      category: 'Bionics & Servo Control',
      difficulty: 'Innovator',
      xpReward: 750,
      timeRemaining: '8 days left',
      completionsCount: 92,
      description: 'Coordinate 5 SG90 micro servos using I2C PCA9685 driver with individualized flex sensor input thresholds.',
      starterHref: '/workbench?starter=starter_robotic_hand',
      isCompleted: false,
    },
    {
      id: 'ch_ldr_smart_light',
      title: 'Smart Streetlight with LDR & Hysteresis',
      category: 'Analog Electronics',
      difficulty: 'Rookie',
      xpReward: 100,
      timeRemaining: 'Ongoing',
      completionsCount: 1420,
      description: 'Create an automatic dusk-to-dawn lighting circuit using a photoresistor and operational amplifier comparator.',
      starterHref: '/workbench?starter=starter_smart_lamp',
      isCompleted: true,
    },
  ];

  const badges = [
    {
      id: 'badge_pathfinder',
      name: 'Pathfinder',
      description: 'Constructed an autonomous line-following rover with zero manual intervention.',
      icon: '🚗',
      earned: true,
      earnedDate: 'Earned Oct 12',
    },
    {
      id: 'badge_bughunter',
      name: 'Circuit Bug Hunter',
      description: 'Diagnosed and fixed 5 short-circuit faults with Rituu AI mentor.',
      icon: '🔍',
      earned: true,
      earnedDate: 'Earned Oct 14',
    },
    {
      id: 'badge_hardware_master',
      name: 'Hardware Maestro',
      description: 'Simulated 50+ components simultaneously in a single workshop with stable 60 FPS.',
      icon: '⚡',
      earned: false,
      earnedDate: 'Locked (42/50 Components)',
    },
    {
      id: 'badge_drone_aviator',
      name: 'Autonomous Aviator',
      description: 'Calibrated MPU6050 6-axis gyro and tuned brushless quadcopter ESC telemetry.',
      icon: '🛸',
      earned: false,
      earnedDate: 'Locked (Capstone Mission)',
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Ananya Sharma', city: 'Bengaluru', xp: 9450, badges: 14 },
    { rank: 2, name: 'Kabir Patel', city: 'Mumbai', xp: 8820, badges: 12 },
    { rank: 3, name: 'Tanya Sengupta', city: 'Kolkata', xp: 7910, badges: 11 },
    { rank: 14, name: 'Aarav Sharma (You)', city: 'Delhi', xp: 4850, badges: 8, isCurrentUser: true },
  ];

  const filteredChallenges = challenges.filter(
    (c) => filterDifficulty === 'all' || c.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
  );

  return (
    <div className="flex h-screen bg-[#07110D] overflow-hidden text-[#EAF7EF] font-sans">
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)] flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[#EAF7EF]">
                  Challenges & Badges Arena
                </h1>
              </div>
              <p className="text-xs text-[#8FA99B] mt-1 font-mono">
                Compete in weekly simulation sprints, level up your robotics passport, and collect verified badges.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#0E2A1F] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] shadow-[0_0_12px_rgba(57,255,106,0.25)] flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-current" />
                <span>18 Day Streak • 4,850 XP</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Challenges List (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Difficulty Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['all', 'Rookie', 'Builder', 'Engineer', 'Innovator'].map((diff) => {
                  const isActive = filterDifficulty.toLowerCase() === diff.toLowerCase();
                  return (
                    <button
                      key={diff}
                      onClick={() => setFilterDifficulty(diff)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_16px_rgba(57,255,106,0.45)]'
                          : 'bg-[rgba(255,255,255,0.04)] text-[#8FA99B] hover:text-[#EAF7EF] border border-[rgba(57,255,106,0.15)]'
                      }`}
                    >
                      {diff === 'all' ? 'All Challenges' : diff}
                    </button>
                  );
                })}
              </div>

              {/* Challenge Cards Grid */}
              <div className="space-y-4">
                {filteredChallenges.map((ch) => (
                  <div
                    key={ch.id}
                    className="rounded-2xl p-5 bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-[rgba(57,255,106,0.35)] transition-all"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)]">
                          {ch.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-[#8FA99B]">
                          {ch.category}
                        </span>
                        <span className="text-[10.5px] font-mono text-[#7FE7D6] font-extrabold flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" /> +{ch.xpReward} XP
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#EAF7EF]">
                        {ch.title}
                      </h3>
                      <p className="text-xs text-[#8FA99B] leading-relaxed">
                        {ch.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#8FA99B] pt-1">
                        <span className="flex items-center gap-1 text-[#7FE7D6] font-semibold">
                          <Clock className="w-3 h-3" /> {ch.timeRemaining}
                        </span>
                        <span>•</span>
                        <span>{ch.completionsCount} Students Solved</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ch.isCompleted ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#39FF6A] flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)]">
                            <CheckCircle2 className="w-4 h-4" /> Solved
                          </span>
                          <Link
                            href={ch.starterHref}
                            className="btn-secondary-white px-3.5 py-1.5 text-xs font-mono font-bold"
                          >
                            Retinker
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href={ch.starterHref}
                          className="btn-primary-neon px-5 py-2 text-xs font-mono font-bold shadow-neon-pill flex items-center gap-1.5"
                        >
                          <span>Start Challenge</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges & Leaderboard Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Badges Earned Card */}
              <div className="rounded-2xl p-5 bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#39FF6A]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAF7EF]">
                      Badges & Honors
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#39FF6A]">2 / 4 Unlocked</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        b.earned
                          ? 'border-[rgba(57,255,106,0.3)] bg-[rgba(57,255,106,0.06)]'
                          : 'border-white/10 bg-black/40 opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{b.icon}</div>
                      <h4 className="text-xs font-bold text-[#EAF7EF] truncate">
                        {b.name}
                      </h4>
                      <p className="text-[9.5px] text-[#8FA99B] mt-0.5 line-clamp-2">
                        {b.description}
                      </p>
                      <p className="text-[9px] font-mono font-bold text-[#39FF6A] mt-2">
                        {b.earnedDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* National Student Leaderboard */}
              <div className="rounded-2xl p-5 bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-[#4C8DFF]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAF7EF]">
                      National Leaderboard
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#8FA99B]">October 2026</span>
                </div>

                <div className="space-y-2 font-mono">
                  {leaderboard.map((student) => (
                    <div
                      key={student.rank}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs ${
                        student.isCurrentUser
                          ? 'bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.35)] shadow-[0_0_12px_rgba(57,255,106,0.2)]'
                          : 'bg-[#040B08]/80 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 text-center font-black text-[#8FA99B]">
                          #{student.rank}
                        </span>
                        <div>
                          <p className="font-bold text-[#EAF7EF]">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-[#8FA99B]">{student.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#39FF6A]">{student.xp} XP</span>
                        <p className="text-[10px] text-[#8FA99B]">{student.badges} badges</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}