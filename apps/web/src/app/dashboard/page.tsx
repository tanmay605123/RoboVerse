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
import { useAuthStore } from '../../store/useAuthStore';
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
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, studentIdCard, planTier, logout, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'workbench' | 'roadmap' | 'rituu' | 'hackathons' | 'store'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch /api/v1/auth/me on mount
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
    dashboardData?.studentIdCard?.studentId ||
    studentIdCard?.studentId ||
    'RV-2026-000101';

  const currentFullName =
    dashboardData?.profile?.fullName ||
    profile?.fullName ||
    'Aarav Sharma';

  const currentPlan =
    dashboardData?.planTier ||
    planTier ||
    'FREE';

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
          {/* Timeline Scrubber Component */}
          <TimelineScrubber />

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
                    schoolOrCollege: dashboardData?.profile?.schoolOrCollegeName || 'Delhi Public School',
                    level: dashboardData?.profile?.level || 1,
                    xp: dashboardData?.profile?.xp || 240,
                    streakDays: dashboardData?.profile?.streakDays || 5,
                    qrCodeDataUrl: dashboardData?.studentIdCard?.qrCodeDataUrl,
                  }}
                />
              </div>

              {/* Today Usage Meter */}
              <DailyUsageMeterHud
                usage={dashboardData?.todayUsage}
                planTier={currentPlan}
              />
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

              {/* Active 3D Circuit Projects Preview */}
              <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-mono text-robo-text uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-robo-neon" />
                    <span>Recent 3D Workbench Projects</span>
                  </h3>
                  <Link
                    href="/workbench"
                    className="text-xs font-mono text-robo-teal hover:text-robo-neon flex items-center gap-1"
                  >
                    <span>New Project</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#040D09] border border-robo-borderSubtle hover:border-robo-neon/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-neon/15 text-robo-neon">
                        ARDUINO UNO
                      </span>
                      <span className="text-[10px] font-mono text-robo-textMuted">Edited 2h ago</span>
                    </div>
                    <h4 className="text-sm font-bold text-robo-text">
                      Autonomous 2-Wheel Line Follower
                    </h4>
                    <p className="text-xs text-robo-textSecondary mt-1 line-clamp-2">
                      Dual IR sensors on A0/A1, L298N driver on pins 3-6, PWM speed control loop.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#040D09] border border-robo-borderSubtle hover:border-robo-neon/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-teal/15 text-robo-teal">
                        ESP32 + SERVO
                      </span>
                      <span className="text-[10px] font-mono text-robo-textMuted">Edited 1d ago</span>
                    </div>
                    <h4 className="text-sm font-bold text-robo-text">
                      180° Sonar Obstacle Detector
                    </h4>
                    <p className="text-xs text-robo-textSecondary mt-1 line-clamp-2">
                      HC-SR04 mounted on SG90 servo, real-time polar radar sweep visualization.
                    </p>
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
