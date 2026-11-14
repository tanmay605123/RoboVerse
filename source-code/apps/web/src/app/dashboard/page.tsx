'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import { StudentIdCard3D } from '../../components/dashboard/StudentIdCard3D';
import { SkillRadarChart } from '../../components/dashboard/SkillRadarChart';
import { HudRadialGauge } from '../../components/dashboard/HudRadialGauge';
import { TimelineScrubber } from '../../components/dashboard/TimelineScrubber';
import { RobotStatusTiles } from '../../components/dashboard/RobotStatusTiles';
import { DailyUsageMeterHud } from '../../components/dashboard/DailyUsageMeterHud';
import { useAuthStore, calculateJourneyLevel } from '../../store/useAuthStore';
import { apiRequest } from '../../lib/apiClient';
import {
  LayoutDashboard,
  Cpu,
  Layers,
  Sparkles,
  Trophy,
  ShoppingBag,
  Settings,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass,
  Terminal,
  Flame,
  Award,
  Play,
  MapPin,
  Send,
  Store,
  CheckCircle,
  HelpCircle,
  FolderGit2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, studentIdCard, planTier, logout, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'workbench' | 'roadmap' | 'rituu' | 'hackathons' | 'store'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rituuQuery, setRituuQuery] = useState('');

  // Fetch /api/v1/auth/me on mount if available
  useEffect(() => {
    async function loadDashboard() {
      const res = await apiRequest('/auth/me');
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const currentStudentId =
    profile?.studentId ||
    studentIdCard?.studentId ||
    dashboardData?.studentIdCard?.studentId ||
    'RV-2026-000101';

  const currentFullName =
    profile?.fullName ||
    dashboardData?.profile?.fullName ||
    'Aarav Sharma';

  const currentPlan =
    planTier ||
    dashboardData?.planTier ||
    'FREE';

  const currentSchool =
    profile?.schoolOrCollegeName ||
    dashboardData?.profile?.schoolOrCollegeName ||
    'Delhi Public School';

  const currentXp = profile?.xp ?? (dashboardData?.profile?.xp || 240);
  const currentStreak = profile?.streakDays ?? (dashboardData?.profile?.streakDays || 5);
  const journey = calculateJourneyLevel(currentXp);

  const handleRituuAsk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rituuQuery.trim()) return;
    router.push(`/rituu?q=${encodeURIComponent(rituuQuery.trim())}`);
  };

  const handlePromptChipClick = (prompt: string) => {
    router.push(`/rituu?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text flex flex-col md:flex-row font-sans selection:bg-robo-neon selection:text-black">
      {/* 1. Left Vertical Icon Rail Navigation (Desktop) */}
      <aside className="w-full md:w-20 lg:w-64 bg-[#040C08] border-r border-robo-borderSubtle shrink-0 flex flex-col justify-between py-6 px-3 z-30">
        <div>
          {/* Top Brand Logo */}
          <div className="flex items-center justify-center lg:justify-start px-2 mb-8">
            <Logo variant="icon" size="md" className="hidden md:block lg:hidden" />
            <Logo variant="horizontal" size="sm" className="hidden lg:block" />
            <div className="block md:hidden">
              <Logo variant="horizontal" size="sm" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Control Room', icon: LayoutDashboard, href: '/dashboard' },
              { id: 'workbench', label: '3D Workbench', icon: Cpu, badge: 'MNA', href: '/workbench' },
              { id: 'arduino-studio', label: 'Arduino Studio', icon: Terminal, badge: 'SIM', href: '/arduino-studio' },
              { id: 'roadmap', label: 'Learning Roadmap', icon: Layers, href: '/roadmap' },
              { id: 'rituu', label: 'Rituu AI Mentor', icon: Sparkles, badge: 'AI', href: '/rituu' },
              { id: 'hackathons', label: 'Hackathons Hub', icon: Trophy, href: '/hackathons' },
              { id: 'shops', label: 'Nearby Shops', icon: Compass, href: '/shops' },
              { id: 'store', label: 'TechSavyyy Store', icon: ShoppingBag, href: '/store' },
              { id: 'admin', label: 'Admin Ops', icon: Settings, badge: 'OPS', href: '/admin' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              if (item.href && item.id !== 'overview') {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="w-full flex items-center justify-center lg:justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all text-robo-textSecondary hover:text-robo-text hover:bg-robo-surfaceRaised/50"
                    title={item.label}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="hidden lg:inline text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-robo-teal border border-robo-teal/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-center lg:justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-robo-neon/15 text-robo-neon border border-robo-neon/40 shadow-neon-subtle'
                      : 'text-robo-textSecondary hover:text-robo-text hover:bg-robo-surfaceRaised/50'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-robo-neon' : ''}`} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="hidden lg:inline text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-robo-teal border border-robo-teal/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card & Logout */}
        <div className="pt-4 border-t border-robo-borderSubtle/50 space-y-2">
          <div className="hidden lg:flex items-center gap-3 px-2 py-2 rounded-xl bg-[#030906] border border-robo-borderSubtle">
            <div className="w-8 h-8 rounded-lg bg-robo-neon/20 border border-robo-neon/40 flex items-center justify-center text-xs font-mono font-bold text-robo-neon shrink-0">
              {currentFullName.charAt(0)}
            </div>
            <div className="overflow-hidden text-xs">
              <div className="font-bold truncate text-robo-text">{currentFullName}</div>
              <div className="text-[10px] font-mono text-robo-teal truncate">{currentStudentId}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-xs font-mono text-robo-textMuted hover:text-robo-red hover:bg-robo-red/10 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">Disconnect Session</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Control Room Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Control Bar Header */}
        <header className="h-16 px-6 bg-[#040C08]/90 border-b border-robo-borderSubtle flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-robo-neon animate-pulse" />
            <span className="font-mono text-xs text-robo-neon font-bold">
              SYS // NOMINAL • ROBOVERSE OS v2.6
            </span>
          </div>

          {/* Quick Search & Notification Bell */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-xs text-robo-textMuted">
              <Search className="w-3.5 h-3.5" />
              <span>Search components, lessons, or circuits... (Ctrl+K)</span>
            </div>

            <button
              className="p-2 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-robo-textSecondary hover:text-robo-neon relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-robo-neon" />
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Journey Level & Status Bar */}
          <div className="rounded-2xl glass-panel p-5 border border-robo-borderSubtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-[#040E0A] via-[#051610] to-[#040E0A]">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-black/50 border border-robo-neon/40 flex items-center justify-center shadow-neon-glow shrink-0">
                <span className="text-xl font-mono font-black text-robo-neon">
                  L{journey.levelNumber}
                </span>
                <span className="absolute -bottom-1 -right-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-robo-neon text-black font-bold">
                  {journey.levelName}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-robo-text">
                    Welcome back, {currentFullName}!
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-robo-teal/15 text-robo-teal border border-robo-teal/30">
                    {journey.levelName.toUpperCase()} RANK
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-robo-textSecondary mt-1">
                  <span className="flex items-center gap-1 text-robo-neon font-mono">
                    <Award className="w-3.5 h-3.5" />
                    {currentXp} XP ({journey.progressPct}% to next rank)
                  </span>
                  <span className="flex items-center gap-1 text-robo-orange font-mono">
                    <Flame className="w-3.5 h-3.5" />
                    {currentStreak} Days Active Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Next Milestone Progress Bar */}
            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-robo-textMuted">Rank Progress</span>
                <span className="text-robo-neon font-bold">{currentXp} / {journey.nextLevelXp} XP</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-robo-borderSubtle/60">
                <div
                  className="h-full bg-gradient-to-r from-robo-teal to-robo-neon rounded-full transition-all duration-500"
                  style={{ width: `${journey.progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timeline Scrubber Component */}
          <TimelineScrubber />

          {/* Next Lesson Quick Resume & Rituu AI Quick-Ask Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* NEXT LESSON CARD */}
            <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border border-robo-neon/40 shadow-neon-subtle relative overflow-hidden bg-gradient-to-br from-[#061B12] via-[#04100B] to-[#040C08]">
              <div className="flex items-center justify-between text-xs font-mono text-robo-teal mb-3">
                <span className="flex items-center gap-1.5 font-bold">
                  <Play className="w-3.5 h-3.5 text-robo-neon fill-robo-neon" />
                  NEXT MISSION IN YOUR JOURNEY
                </span>
                <span className="px-2 py-0.5 rounded bg-robo-neon/20 text-robo-neon border border-robo-neon/40 text-[10px]">
                  LESSON 1 OF 16
                </span>
              </div>

              <h3 className="text-xl font-bold text-robo-text font-sans">
                Blink an LED: Digital GPIO & Current-Limiting Resistors
              </h3>
              <p className="text-xs text-robo-textSecondary mt-2 leading-relaxed">
                Connect a 5mm LED and a 220Ω resistor to Arduino Digital Pin 13. Write and upload your first firmware sketch using <code className="text-robo-teal font-mono">pinMode()</code> and <code className="text-robo-teal font-mono">digitalWrite()</code> in the 3D simulator.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/arduino-studio?lesson=1"
                  className="px-5 py-2.5 rounded-xl bg-robo-neon text-black font-bold text-xs font-mono flex items-center gap-2 hover:bg-robo-teal transition-colors shadow-neon-glow"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>START MISSION IN SIMULATOR</span>
                </Link>
                <Link
                  href="/workbench?lesson=1"
                  className="px-4 py-2.5 rounded-xl bg-[#030A07] border border-robo-borderSubtle text-robo-textSecondary hover:text-robo-text text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-robo-teal" />
                  <span>Open in 3D Workbench</span>
                </Link>
              </div>
            </div>

            {/* RITUU QUICK-ASK CARD */}
            <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-robo-borderSubtle flex flex-col justify-between bg-[#040D09]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-robo-neon/20 border border-robo-neon/40 flex items-center justify-center text-robo-neon">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-robo-text font-mono uppercase tracking-wider">
                      Rituu AI Quick-Ask
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-robo-neon font-bold px-2 py-0.5 rounded bg-black/60 border border-robo-neon/30">
                    GEMINI 2.5
                  </span>
                </div>
                <p className="text-xs text-robo-textSecondary mb-3">
                  Have a circuit question, burning component, or syntax error? Ask Rituu anytime.
                </p>

                {/* Quick Prompt Chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    'Why does an LED need a resistor?',
                    'How to wire L298N motor driver?',
                    'Explain pull-up vs pull-down',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handlePromptChipClick(chip)}
                      className="text-[11px] font-mono text-robo-teal hover:text-robo-neon bg-black/40 hover:bg-robo-neon/10 border border-robo-teal/20 hover:border-robo-neon/40 px-2 py-1 rounded-lg transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleRituuAsk} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={rituuQuery}
                  onChange={(e) => setRituuQuery(e.target.value)}
                  placeholder="Ask Rituu a robotics question..."
                  className="flex-1 bg-black/60 border border-robo-borderSubtle rounded-xl px-3 py-2 text-xs text-robo-text placeholder:text-robo-textMuted focus:outline-none focus:border-robo-neon font-sans"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-robo-neon/20 hover:bg-robo-neon text-robo-neon hover:text-black border border-robo-neon/40 transition-colors shrink-0"
                  title="Send to Rituu"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Top Metric Cards Row: HUD Gauge + Robot Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Radial Gauge Progress */}
            <div className="lg:col-span-4 rounded-2xl glass-panel p-5 border border-robo-borderSubtle flex items-center justify-center">
              <HudRadialGauge
                completed={24}
                total={53}
                title="Curriculum & Circuits"
                subtitle="Milestone Phase 1"
              />
            </div>

            {/* Robot Diagnostic Status Tiles */}
            <div className="lg:col-span-8">
              <RobotStatusTiles />
            </div>
          </div>

          {/* Middle Main Workspace Grid: Student ID Card & Skill Radar & Daily Quota */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3D Digital Flip Student ID Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl glass-panel p-5 border border-robo-borderSubtle">
                <StudentIdCard3D
                  cardData={{
                    studentId: currentStudentId,
                    fullName: currentFullName,
                    planName: currentPlan === 'PRO' ? 'Pro Member' : currentPlan === 'PLUS' ? 'Plus Member' : 'Free Explorer',
                    schoolOrCollege: currentSchool,
                    level: journey.levelNumber,
                    xp: currentXp,
                    streakDays: currentStreak,
                    qrCodeDataUrl: studentIdCard?.qrCodeDataUrl || dashboardData?.studentIdCard?.qrCodeDataUrl,
                  }}
                />
              </div>

              {/* Today Usage Meter */}
              <DailyUsageMeterHud
                usage={dashboardData?.todayUsage}
                planTier={currentPlan}
              />

              {/* CERTIFICATES SECTION */}
              <div className="rounded-2xl glass-panel p-5 border border-robo-borderSubtle bg-[#040C08]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold font-mono text-robo-text uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-robo-teal" />
                    <span>Verified Certificates</span>
                  </h3>
                  <Link
                    href={`/verify/student/${currentStudentId}`}
                    className="text-[11px] font-mono text-robo-neon hover:underline flex items-center gap-1"
                  >
                    <span>Public Registry</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-robo-teal/30 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-robo-text">Arduino Robotics Apprentice</div>
                      <div className="text-[10px] font-mono text-robo-teal">ID: RV-CERT-ARD-2026-0042</div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-robo-neon/20 text-robo-neon border border-robo-neon/40 font-bold shrink-0">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-[10px] text-robo-textSecondary">
                    Completed 16 interactive lessons, 3 circuit projects, and hardware simulation quiz.
                  </div>
                  <div className="pt-2 border-t border-robo-borderSubtle/40 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-robo-textMuted">Issued Nov 2026</span>
                    <Link
                      href="/verify/RV-CERT-ARD-2026-0042"
                      className="text-[10px] font-mono text-robo-neon hover:underline"
                    >
                      View Certificate →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Center & Right Column: Learning Passport Skill Radar & Active Projects */}
            <div className="lg:col-span-8 space-y-6">
              {/* Learning Passport Card */}
              <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-robo-borderSubtle/50 pb-4 mb-6 gap-2">
                  <div>
                    <h3 className="text-lg font-bold font-sans text-robo-text flex items-center gap-2">
                      <Compass className="w-5 h-5 text-robo-teal" />
                      <span>Student Learning Passport & Skill Radar</span>
                    </h3>
                    <p className="text-xs text-robo-textSecondary mt-0.5">
                      Evaluated across 6 core robotics competencies via simulator challenges and coding tasks.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-robo-neon font-bold">
                      {dashboardData?.profile?.totalLearningHours || 4.5} HRS
                    </span>
                    <span className="text-[11px] text-robo-textMuted block">Learning Time</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Skill Radar SVG Visualizer */}
                  <SkillRadarChart />

                  {/* Competency Badges & Quick Stats */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-robo-textSecondary">Electronics & Nodal Analysis</span>
                        <span className="text-robo-neon font-bold">65%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
                        <div className="h-full bg-robo-neon rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-robo-textSecondary">Arduino C++ Programming</span>
                        <span className="text-robo-teal font-bold">70%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
                        <div className="h-full bg-robo-teal rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-robo-textSecondary">Machine Learning & ROS</span>
                        <span className="text-robo-orange font-bold">30%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
                        <div className="h-full bg-robo-orange rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-robo-borderSubtle/40 flex items-center justify-between text-xs">
                      <span className="text-robo-textSecondary font-mono">1 Verified Certificate</span>
                      <Link
                        href={`/verify/student/${currentStudentId}`}
                        className="text-robo-neon hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <span>Public Registry</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* CURRENT WORKING PROJECT & SAMPLE PROJECTS SHELF */}
              <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-robo-text uppercase tracking-wider flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-robo-neon" />
                      <span>Curated Sample Projects & Your Workbench</span>
                    </h3>
                    <p className="text-xs text-robo-textSecondary mt-0.5">
                      Explore pre-built verified circuits or resume your current design.
                    </p>
                  </div>
                  <Link
                    href="/workbench"
                    className="text-xs font-mono text-robo-teal hover:text-robo-neon flex items-center gap-1 shrink-0"
                  >
                    <span>Open Workbench</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sample 1: Blink an LED */}
                  <div className="p-4 rounded-xl bg-[#040D09] border border-robo-borderSubtle hover:border-robo-neon/40 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-neon/15 text-robo-neon font-bold">
                          BEGINNER • DIGITAL OUT
                        </span>
                        <span className="text-[10px] font-mono text-robo-textMuted">Sample 01</span>
                      </div>
                      <h4 className="text-sm font-bold text-robo-text">
                        Blink an LED Circuit
                      </h4>
                      <p className="text-xs text-robo-textSecondary mt-1">
                        Arduino Uno R3 with a 5mm Red LED and 220Ω current limiter on Pin 13.
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-robo-borderSubtle/50 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-robo-teal">3 Components</span>
                      <Link
                        href="/workbench?sample=blink"
                        className="text-xs font-mono text-robo-neon hover:underline flex items-center gap-1"
                      >
                        <span>Simulate</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Sample 2: Push Button & Buzzer */}
                  <div className="p-4 rounded-xl bg-[#040D09] border border-robo-borderSubtle hover:border-robo-neon/40 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-teal/15 text-robo-teal font-bold">
                          INTERACTIVE • INPUT/SOUND
                        </span>
                        <span className="text-[10px] font-mono text-robo-textMuted">Sample 02</span>
                      </div>
                      <h4 className="text-sm font-bold text-robo-text">
                        Push Button & Piezo Buzzer
                      </h4>
                      <p className="text-xs text-robo-textSecondary mt-1">
                        10kΩ pull-down momentary switch triggering variable frequency piezo buzzer tones.
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-robo-borderSubtle/50 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-robo-teal">5 Components</span>
                      <Link
                        href="/workbench?sample=button_buzzer"
                        className="text-xs font-mono text-robo-neon hover:underline flex items-center gap-1"
                      >
                        <span>Simulate</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Sample 3: Traffic Light Controller */}
                  <div className="p-4 rounded-xl bg-[#040D09] border border-robo-borderSubtle hover:border-robo-neon/40 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-orange/15 text-robo-orange font-bold">
                          TIMING • STATE MACHINE
                        </span>
                        <span className="text-[10px] font-mono text-robo-textMuted">Sample 03</span>
                      </div>
                      <h4 className="text-sm font-bold text-robo-text">
                        RGB Traffic Signal Controller
                      </h4>
                      <p className="text-xs text-robo-textSecondary mt-1">
                        Three-channel Red, Yellow, Green LED sequenced logic with pedestrian override button.
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-robo-borderSubtle/50 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-robo-teal">7 Components</span>
                      <Link
                        href="/workbench?sample=traffic_light"
                        className="text-xs font-mono text-robo-neon hover:underline flex items-center gap-1"
                      >
                        <span>Simulate</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Sample 4: 2-Wheel Autonomous Line Follower */}
                  <div className="p-4 rounded-xl bg-[#040D09] border border-robo-borderSubtle hover:border-robo-neon/40 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-neon/15 text-robo-neon font-bold">
                          ROBOTICS • DUAL MOTOR
                        </span>
                        <span className="text-[10px] font-mono text-robo-textMuted">Active Work</span>
                      </div>
                      <h4 className="text-sm font-bold text-robo-text">
                        Autonomous 2-Wheel Line Follower
                      </h4>
                      <p className="text-xs text-robo-textSecondary mt-1">
                        Dual IR sensors on A0/A1, L298N driver on pins 3-6, PWM speed control loop.
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-robo-borderSubtle/50 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-robo-teal">11 Components</span>
                      <Link
                        href="/workbench?sample=line_follower"
                        className="text-xs font-mono text-robo-neon hover:underline flex items-center gap-1"
                      >
                        <span>Open Project</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEARBY STORES CARD */}
              <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle bg-[#040C08]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-robo-text uppercase tracking-wider flex items-center gap-2">
                      <Store className="w-4 h-4 text-robo-teal" />
                      <span>Nearby Verified Electronics & Robotics Stores</span>
                    </h3>
                    <p className="text-xs text-robo-textSecondary mt-0.5">
                      Need hardware right now? Find components at verified offline shops nearby.
                    </p>
                  </div>
                  <Link
                    href="/shops"
                    className="text-xs font-mono text-robo-neon hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Map Directory</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Shop 1 */}
                  <div className="p-3.5 rounded-xl bg-[#040E0A] border border-robo-borderSubtle hover:border-robo-teal/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-robo-neon bg-robo-neon/15 px-2 py-0.5 rounded">
                        1.8 KM
                      </span>
                      <span className="text-[10px] font-mono text-robo-teal flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-robo-text truncate">
                      TechSavyyy Components Hub
                    </h5>
                    <p className="text-[11px] text-robo-textMuted mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-robo-teal shrink-0" />
                      <span className="truncate">Connaught Place, New Delhi</span>
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-robo-textSecondary">
                      Stock: Arduino, Servos, Resistors, Sensors
                    </div>
                  </div>

                  {/* Shop 2 */}
                  <div className="p-3.5 rounded-xl bg-[#040E0A] border border-robo-borderSubtle hover:border-robo-teal/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-robo-neon bg-robo-neon/15 px-2 py-0.5 rounded">
                        3.4 KM
                      </span>
                      <span className="text-[10px] font-mono text-robo-teal flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-robo-text truncate">
                      Silicon Valley Electronics
                    </h5>
                    <p className="text-[11px] text-robo-textMuted mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-robo-teal shrink-0" />
                      <span className="truncate">Nehru Place, New Delhi</span>
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-robo-textSecondary">
                      Stock: ICs, Breadboards, Motors, Batteries
                    </div>
                  </div>

                  {/* Shop 3 */}
                  <div className="p-3.5 rounded-xl bg-[#040E0A] border border-robo-borderSubtle hover:border-robo-teal/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-robo-neon bg-robo-neon/15 px-2 py-0.5 rounded">
                        5.2 KM
                      </span>
                      <span className="text-[10px] font-mono text-robo-teal flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-robo-text truncate">
                      RoboKits India Depot
                    </h5>
                    <p className="text-[11px] text-robo-textMuted mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-robo-teal shrink-0" />
                      <span className="truncate">Okhla Industrial Area, Delhi</span>
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-robo-textSecondary">
                      Stock: Chassis, L298N, BLDC Motors, ESCs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
