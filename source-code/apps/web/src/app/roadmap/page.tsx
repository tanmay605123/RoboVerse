'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RoadmapWorld3D, LevelData } from '@/components/roadmap/RoadmapWorld3D';
import { LessonViewerModal } from '@/components/roadmap/LessonViewerModal';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Compass,
  Sparkles,
  Award,
  ChevronLeft,
  Flame,
  Clock,
  BookOpen,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function RoadmapPage() {
  const { profile, planTier } = useAuthStore();
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);

  const studentLevel = profile?.level || 1;
  const currentXp = profile?.xp || 450;
  const nextLevelXp = 800;
  const xpPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <div className="min-h-screen bg-[#07110D] text-white flex flex-col font-sans selection:bg-[#39FF6A]/30 selection:text-white">
      {/* TOP CONTROL ROOM NAV */}
      <header className="h-16 bg-[#07110D]/90 border-b border-[#39FF6A]/20 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-gray-800/40 hover:bg-[#39FF6A]/10 text-gray-400 hover:text-[#39FF6A] border border-gray-700/60 transition"
            title="Return to Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] animate-pulse" />
            <h1 className="text-base font-bold text-white tracking-wide">
              RoboVerse <span className="text-[#39FF6A]">Learning Roadmap</span>
            </h1>
            <span className="text-[10px] font-mono bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-2 py-0.5 rounded-full">
              Levels 1-8
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workbench"
            className="flex items-center gap-2 px-4 py-2 bg-[#0E2A1F] hover:bg-[#0E2A1F]/80 text-[#39FF6A] border border-[#39FF6A]/30 rounded-xl text-xs font-bold transition"
          >
            <Layers className="w-4 h-4" />
            Open 3D Workbench
          </Link>
        </div>
      </header>

      {/* LEARNING PASSPORT HUD PROGRESS BANNER */}
      <section className="bg-gradient-to-b from-[#0E2A1F]/80 to-transparent border-b border-gray-800/60 py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Level & XP Gauge */}
            <div className="p-4 rounded-2xl bg-[#07110D]/80 border border-[#39FF6A]/30 shadow-lg md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#39FF6A] uppercase tracking-wider">
                  STUDENT LEARNING PASSPORT
                </span>
                <span className="text-xs font-mono text-gray-400">
                  Level {studentLevel} Explorer
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold mb-1">
                <span>XP Progress</span>
                <span className="text-[#7FE7D6] font-mono">
                  {currentXp} / {nextLevelXp} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Streak Counter */}
            <div className="p-4 rounded-2xl bg-[#07110D]/80 border border-gray-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-black text-white font-mono">
                  {profile?.streakDays || 5} Days
                </div>
                <div className="text-xs text-gray-400">Active Study Streak</div>
              </div>
            </div>

            {/* Total Hours */}
            <div className="p-4 rounded-2xl bg-[#07110D]/80 border border-gray-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-950/60 border border-teal-600/40 flex items-center justify-center text-[#7FE7D6]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-black text-white font-mono">
                  {profile?.totalLearningHours || 14.5} hrs
                </div>
                <div className="text-xs text-gray-400">Total Simulation Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP WORLD TRACK */}
      <main className="flex-1 py-4">
        <div className="max-w-5xl mx-auto px-6 mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Robotics Curriculum Path
              </h2>
              <p className="text-xs text-gray-400">
                Progress through hardware, circuits, firmware, robotics mechanisms, and ROS
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#39FF6A]" /> Completed
              </span>
              <span className="flex items-center gap-1.5 text-gray-400 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7FE7D6] animate-pulse" /> Current
              </span>
              <span className="flex items-center gap-1.5 text-gray-400 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-600" /> Locked
              </span>
            </div>
          </div>
        </div>

        <RoadmapWorld3D onSelectLevel={(level) => setSelectedLevel(level)} />
      </main>

      {/* LESSON MODAL */}
      <LessonViewerModal
        level={selectedLevel}
        onClose={() => setSelectedLevel(null)}
      />
    </div>
  );
}
