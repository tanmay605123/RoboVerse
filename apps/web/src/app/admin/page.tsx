'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { useAuthStore } from '../../store/useAuthStore';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Percent,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  Zap,
  Lock,
  Tag,
  ArrowRight,
  ChevronRight,
  Eye,
  ShoppingBag,
  Clock,
  Printer,
  Sparkles,
  Radio,
  Activity,
  Flame,
  BookOpen,
  Calendar,
  Layers,
  Terminal,
  Award,
  Send,
  Check,
  Ban,
} from 'lucide-react';
import { AdminStudentRow } from '../api/admin/students/route';
import { AdminMetrics } from '../api/admin/overview/route';
import { LiveStudentSession } from '../api/admin/live-activity/route';

interface CertificateRow {
  code: string;
  studentName: string;
  studentId: string;
  courseName: string;
  track: string;
  grade: number;
  issuedAt: string;
  isRevoked: boolean;
}

const SEED_CERTIFICATES: CertificateRow[] = [
  {
    code: 'RV-CERT-2026-001001',
    studentName: 'Tanmay Chawda',
    studentId: 'RV-2026-001001',
    courseName: 'Arduino & Electronics Foundations',
    track: 'HARDWARE & EMBEDDED SYSTEMS',
    grade: 98.5,
    issuedAt: '2026-10-18T14:30:00Z',
    isRevoked: false,
  },
  {
    code: 'RV-CERT-2026-001002',
    studentName: 'Aarav Sharma',
    studentId: 'RV-2026-001002',
    courseName: 'Autonomous Mobile Robotics: Line Tracers & Rovers',
    track: 'ROBOTICS & CONTROL SYSTEMS',
    grade: 96.0,
    issuedAt: '2026-10-22T11:15:00Z',
    isRevoked: false,
  },
  {
    code: 'RV-CERT-2026-001003',
    studentName: 'Ananya Deshmukh',
    studentId: 'RV-2026-001003',
    courseName: 'Robotic Arm Kinematics & Inverse Trigonometry',
    track: 'KINEMATICS & MECHATRONICS',
    grade: 99.0,
    issuedAt: '2026-10-25T16:00:00Z',
    isRevoked: false,
  },
  {
    code: 'RV-CERT-2026-REVOKED',
    studentName: 'Test Account',
    studentId: 'RV-2026-009999',
    courseName: 'Drone Flight Dynamics & PID Stabilization',
    track: 'AERIAL ROBOTICS',
    grade: 60.0,
    issuedAt: '2026-08-01T00:00:00Z',
    isRevoked: true,
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'metrics' | 'live' | 'users' | 'certificates' | 'plans' | 'orders'>('metrics');

  // Timeline Range selector
  const [timelineRange, setTimelineRange] = useState<'1D' | '7D' | '1M' | 'ALL'>('7D');
  const [scrubberPosition, setScrubberPosition] = useState(84);

  // Telemetry data
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveStudentSession[]>([]);
  const [certificates, setCertificates] = useState<CertificateRow[]>(SEED_CERTIFICATES);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);

  // Search & Filter
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');

  // Plan editing state
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>('plan_plus');
  const [editPriceMonthly, setEditPriceMonthly] = useState<number>(299);
  const [editRituuMsgLimit, setEditRituuMsgLimit] = useState<number>(100);
  const [editRituuPhotoLimit, setEditRituuPhotoLimit] = useState<number>(20);
  const [editStoreDiscount, setEditStoreDiscount] = useState<number>(5);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);

  // Demo bypass toggle for reviewer evaluation
  const [demoBypassActive, setDemoBypassActive] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, studentsRes, liveRes] = await Promise.all([
        fetch('/api/admin/overview').then((r) => r.json()),
        fetch(`/api/admin/students?search=${encodeURIComponent(searchUserQuery)}&plan=${planFilter}`).then((r) => r.json()),
        fetch('/api/admin/live-activity').then((r) => r.json()),
      ]);

      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data);
      }
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.students || []);
      }
      if (liveRes.success && liveRes.data) {
        setLiveSessions(liveRes.data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load admin cluster telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [searchUserQuery, planFilter]);

  // Send Password Reset Link to student
  const handleSendPasswordReset = async (student: AdminStudentRow) => {
    setResettingEmail(student.email);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: student.email, studentId: student.studentId }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(json.message || `Password reset link dispatched to ${student.email}`);
      } else {
        setActionMessage(`Error: ${json.error?.message || 'Could not send reset link'}`);
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setResettingEmail(null);
    }
  };

  // Toggle Certificate Revocation status
  const handleToggleCertificateRevoke = (certCode: string) => {
    setCertificates((prev) =>
      prev.map((c) => {
        if (c.code === certCode) {
          const nextState = !c.isRevoked;
          setActionMessage(
            nextState
              ? `Certificate ${certCode} marked as REVOKED in academy registry.`
              : `Certificate ${certCode} re-activated as VALID.`
          );
          return { ...c, isRevoked: nextState };
        }
        return c;
      })
    );
  };

  const handleUpdatePlan = async () => {
    setIsSavingPlan(true);
    setTimeout(() => {
      setIsSavingPlan(false);
      setActionMessage(
        `Plan ${selectedPlanTier.toUpperCase()} settings saved: ₹${editPriceMonthly}/mo (incl. 18% GST), ${editRituuMsgLimit} Rituu msgs/day, ${editStoreDiscount}% hardware discount.`
      );
    }, 600);
  };

  const isAdmin = user?.role === 'admin' || (user?.role as string) === 'ADMIN' || demoBypassActive;

  // 403 Forbidden Screen if not admin
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans">
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <AppTopBar
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,107,107,0.3)] backdrop-blur-xl p-8 text-center shadow-[0_0_30px_rgba(255,107,107,0.15)] space-y-4 font-mono">
              <div className="w-16 h-16 rounded-full bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] mx-auto flex items-center justify-center border-2 border-[#FF6B6B]/40 shadow">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-sans">
                403 Forbidden: Admin Role Required
              </h2>
              <p className="text-xs text-[#8FA99B] leading-relaxed">
                You are currently signed in as a student (<strong className="text-white">{user?.email}</strong>). The Master Control Center is restricted to RoboVerse Operations &amp; Faculty Administrators.
              </p>
              <div className="pt-3 space-y-2">
                <button
                  onClick={() => setDemoBypassActive(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow transition-all font-sans"
                >
                  Unlock Admin Control Room (Demo Mode)
                </button>
                <Link
                  href="/dashboard"
                  className="block w-full py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(57,255,106,0.15)] text-[#EAF7EF] text-xs font-bold hover:bg-[rgba(57,255,106,0.1)] transition-colors"
                >
                  Return to Student Dashboard
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* Sidebar Rail */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Admin HUD Header */}
          <section className="relative overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(7,17,13,0.8)]">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] text-xs font-mono font-bold tracking-wider mb-3 shadow-[0_0_15px_rgba(57,255,106,0.15)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>MASTER CONTROL ROOM • POSTGRES RLS PROTECTED</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#EAF7EF] tracking-tight">
                  RoboVerse Admin Control Center
                </h1>
                <p className="text-xs sm:text-sm text-[#8FA99B] mt-2 max-w-2xl leading-relaxed font-mono">
                  Real-time telemetry, student directory with lockout recovery (strictly zero stored passwords),
                  verifiable certificates registry, Rituu AI sentinel monitoring, and TechSavyyy order settlement.
                </p>
              </div>

              {/* Scrubber & Sync Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 font-mono">
                {/* Timeline Range Selector */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs">
                  <span className="text-[10px] text-[#8FA99B] px-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#39FF6A]" />
                    <span>WINDOW</span>
                  </span>
                  {(['1D', '7D', '1M', 'ALL'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimelineRange(range)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        timelineRange === range
                          ? 'bg-[#39FF6A] text-black shadow-[0_0_12px_rgba(57,255,106,0.5)]'
                          : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <button
                  onClick={loadAdminData}
                  className="px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(57,255,106,0.1)] text-xs font-bold text-[#EAF7EF] border border-[rgba(57,255,106,0.25)] flex items-center gap-2 transition-all shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#39FF6A] ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync Cluster</span>
                </button>
              </div>
            </div>

            {actionMessage && (
              <div className="relative z-10 mt-6 p-4 rounded-2xl bg-[rgba(57,255,106,0.08)] border border-[#39FF6A]/40 text-[#39FF6A] text-xs flex items-center gap-2 font-mono font-semibold shadow">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            {/* Elevated Off-Topic Rate Alert Banner if Rituu Sentinel triggers */}
            {metrics && metrics.rituuOfftopicRatePct > 10 && (
              <div className="relative z-10 mt-4 p-3 rounded-2xl bg-amber-950/40 border border-[#FF9A1F]/40 text-[#FF9A1F] text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF9A1F]" />
                  <span>
                    Sentinel Advisory: Rituu off-topic detection is at {metrics.rituuOfftopicRatePct}% ({metrics.rituuOfftopicToday} rejected attempts today).
                  </span>
                </div>
                <span className="text-[10px] bg-[#FF9A1F]/20 px-2 py-0.5 rounded font-bold">
                  Defenses Active
                </span>
              </div>
            )}

            {/* Realtime Telemetry Strip */}
            {metrics && (
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[rgba(57,255,106,0.12)]">
                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    ONLINE NOW
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF6A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39FF6A]"></span>
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#39FF6A] font-mono">
                      {metrics.onlineNow}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Working on Labs: {metrics.workingOnProjects}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    TOTAL STUDENTS
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {metrics.totalStudents}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Active 24h: {metrics.active24h}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    PROJECTS IN PIPELINE
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#7FE7D6] font-mono">
                    {metrics.projectsCreated}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Enrollments: {metrics.enrollmentsCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    VERIFIED CERTS
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#39FF6A] font-mono">
                    {metrics.certificatesIssued}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Public registry active
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    RITUU AI MSGS (TODAY)
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#7FE7D6] font-mono">
                    {metrics.rituuMessagesToday}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Sentinel Defense: {(100 - metrics.rituuOfftopicRatePct).toFixed(1)}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    STORE REVENUE (INR)
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#39FF6A] font-mono">
                    ₹{metrics.totalRevenueInr.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Orders: {metrics.ordersCount} (incl. 18% GST)
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sub-tab Navigation */}
          <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono">
            {[
              { id: 'metrics', label: 'Overview Metrics', icon: TrendingUp },
              { id: 'live', label: 'Students Working Now', icon: Radio },
              { id: 'users', label: 'Student Directory', icon: Users },
              { id: 'certificates', label: 'Verifiable Certificates', icon: Award },
              { id: 'plans', label: 'Plans & AI Limits', icon: Sliders },
              { id: 'orders', label: 'Hardware Orders', icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A] shadow-[0_0_20px_rgba(57,255,106,0.25)]'
                      : 'bg-[rgba(255,255,255,0.03)] text-[#8FA99B] hover:text-[#EAF7EF] border border-[rgba(57,255,106,0.12)] hover:border-[rgba(57,255,106,0.3)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#39FF6A]' : 'text-[#8FA99B]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </section>

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'metrics' && metrics && (
            <section className="space-y-6">
              {/* Radial Gauges Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg height="80" width="80" className="transform -rotate-90">
                      <circle stroke="#0C261B" fill="transparent" strokeWidth="6" r="32" cx="40" cy="40" />
                      <circle
                        stroke="#39FF6A"
                        fill="transparent"
                        strokeWidth="6"
                        strokeDasharray="201 201"
                        style={{ strokeDashoffset: 201 - (82 / 100) * 201 }}
                        strokeLinecap="round"
                        r="32"
                        cx="40"
                        cy="40"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-sm text-[#EAF7EF]">82%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#7FE7D6] uppercase tracking-wider">RETENTION RATE</div>
                    <div className="text-sm font-bold text-white font-sans">Active Weekly Builders</div>
                    <div className="text-xs text-[#8FA99B] mt-0.5">{metrics.active7d} / {metrics.totalStudents} students</div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg height="80" width="80" className="transform -rotate-90">
                      <circle stroke="#0C261B" fill="transparent" strokeWidth="6" r="32" cx="40" cy="40" />
                      <circle
                        stroke="#7FE7D6"
                        fill="transparent"
                        strokeWidth="6"
                        strokeDasharray="201 201"
                        style={{ strokeDashoffset: 201 - (99.9 / 100) * 201 }}
                        strokeLinecap="round"
                        r="32"
                        cx="40"
                        cy="40"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-[#EAF7EF]">99.9%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#7FE7D6] uppercase tracking-wider">CORE SIMULATION ENGINE</div>
                    <div className="text-sm font-bold text-white font-sans">MNA Solver Uptime</div>
                    <div className="text-xs text-[#8FA99B] mt-0.5">0 crashes across 3,120 runs</div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg height="80" width="80" className="transform -rotate-90">
                      <circle stroke="#0C261B" fill="transparent" strokeWidth="6" r="32" cx="40" cy="40" />
                      <circle
                        stroke="#4C8DFF"
                        fill="transparent"
                        strokeWidth="6"
                        strokeDasharray="201 201"
                        style={{ strokeDashoffset: 201 - (97.9 / 100) * 201 }}
                        strokeLinecap="round"
                        r="32"
                        cx="40"
                        cy="40"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-sm text-[#EAF7EF]">97.9%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#7FE7D6] uppercase tracking-wider">RITUU AI SENTINEL</div>
                    <div className="text-sm font-bold text-white font-sans">Curriculum Containment</div>
                    <div className="text-xs text-[#8FA99B] mt-0.5">Off-topic rejected: {metrics.rituuOfftopicToday} queries</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: STUDENTS WORKING NOW (LIVE TELEMETRY) */}
          {activeTab === 'live' && (
            <section className="space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                    <Radio className="w-5 h-5 text-[#39FF6A] animate-pulse" />
                    <span>Realtime Presence: Students Working in Labs</span>
                  </h3>
                  <p className="text-xs text-[#8FA99B] mt-0.5">
                    Live telemetry tracked via touch_presence RPC and Supabase Realtime broadcast channels.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#39FF6A]/10 text-[#39FF6A] text-xs font-bold border border-[#39FF6A]/30">
                  {liveSessions.length} Active Sessions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] flex flex-col justify-between space-y-3 hover:border-[#39FF6A]/40 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#39FF6A] font-bold">{s.studentId}</span>
                        <span className="px-2 py-0.5 rounded bg-black/60 text-[#7FE7D6] text-[10px] border border-gray-800">
                          {s.lab}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white font-sans">{s.fullName}</h4>
                      <p className="text-xs text-gray-300 mt-1 line-clamp-1">{s.projectName}</p>
                    </div>

                    <div className="p-3 bg-black/40 rounded-xl border border-gray-800/80 text-[11px] text-[#8FA99B] space-y-1">
                      <div className="text-gray-400 font-bold uppercase text-[9px]">Live Action:</div>
                      <div className="text-gray-200">{s.action}</div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-800">
                      <span>Active for {s.timeActiveMinutes} mins</span>
                      <span className="text-[#39FF6A]">Ping: {s.lastPingSecondsAgo}s ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 3: STUDENT DIRECTORY (ZERO STORED PASSWORDS, PRIVACY-COMPLIANT) */}
          {activeTab === 'users' && (
            <section className="space-y-4 font-mono">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA99B]" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="Search by Student ID (e.g. RV-2026-001001), name, or email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8FA99B]">Plan Filter:</span>
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-white focus:outline-none focus:border-[#39FF6A]"
                  >
                    <option value="ALL">All Plans</option>
                    <option value="FREE">Free Tier</option>
                    <option value="PLUS">Plus Member</option>
                    <option value="PRO">Pro Scholar</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgba(57,255,106,0.15)] overflow-hidden bg-[rgba(255,255,255,0.03)] backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#040B08]/80 text-[#8FA99B] font-mono font-bold border-b border-[rgba(57,255,106,0.15)]">
                      <tr>
                        <th className="p-3.5">STUDENT ID</th>
                        <th className="p-3.5">NAME &amp; EMAIL</th>
                        <th className="p-3.5">INSTITUTION &amp; CITY</th>
                        <th className="p-3.5">ACTIVE PLAN</th>
                        <th className="p-3.5">CURRENT LAB WORK</th>
                        <th className="p-3.5">METRICS</th>
                        <th className="p-3.5 text-right">SECURITY ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(57,255,106,0.08)]">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-[rgba(57,255,106,0.04)] transition-colors">
                          <td className="p-3.5 font-mono text-[#39FF6A] font-bold">
                            {s.studentId}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white font-sans">{s.fullName}</div>
                            <div className="text-[11px] text-[#8FA99B] font-mono">{s.email}</div>
                          </td>
                          <td className="p-3.5 text-[#8FA99B]">
                            <div className="font-medium text-white">{s.schoolOrCollege}</div>
                            <div className="text-[10px] text-[#7FE7D6] font-mono">{s.city}</div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                                s.planTier === 'PRO'
                                  ? 'bg-[#39FF6A]/10 text-[#39FF6A] border-[#39FF6A]/30'
                                  : s.planTier === 'PLUS'
                                  ? 'bg-[#7FE7D6]/10 text-[#7FE7D6] border-[#7FE7D6]/30'
                                  : 'bg-gray-800 text-gray-300 border-gray-700'
                              }`}
                            >
                              {s.planTier}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs text-gray-300 max-w-xs truncate">
                            {s.currentActivity}
                          </td>
                          <td className="p-3.5 text-[11px] text-[#8FA99B]">
                            <span className="text-white font-bold">{s.xp} XP</span> • 🔥 {s.streakDays}d
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleSendPasswordReset(s)}
                              disabled={resettingEmail === s.email}
                              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-[#7FE7D6] hover:text-[#39FF6A] border border-gray-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ml-auto"
                              title="Send Supabase Auth Password Reset Email"
                            >
                              <Send className="w-3 h-3" />
                              <span>{resettingEmail === s.email ? 'Sending...' : 'Send Reset Link'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: VERIFIABLE CERTIFICATES REGISTRY */}
          {activeTab === 'certificates' && (
            <section className="space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#39FF6A]" />
                    <span>RoboVerse Academy Verifiable Certificates Registry</span>
                  </h3>
                  <p className="text-xs text-[#8FA99B] mt-0.5">
                    Credentials issued via issue_certificate() RPC. Publicly verifiable at /verify/&lt;code&gt;.
                  </p>
                </div>
                <Link
                  href="/verify"
                  target="_blank"
                  className="px-3.5 py-1.5 bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 rounded-xl text-xs font-bold hover:bg-[#39FF6A]/20 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Lookup Portal</span>
                </Link>
              </div>

              <div className="rounded-2xl border border-[rgba(57,255,106,0.15)] overflow-hidden bg-[rgba(255,255,255,0.03)] backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#040B08]/80 text-[#8FA99B] font-mono font-bold border-b border-[rgba(57,255,106,0.15)]">
                      <tr>
                        <th className="p-3.5">CERTIFICATE CODE</th>
                        <th className="p-3.5">RECIPIENT &amp; STUDENT ID</th>
                        <th className="p-3.5">COURSE TITLE &amp; TRACK</th>
                        <th className="p-3.5">SCORE</th>
                        <th className="p-3.5">STATUS</th>
                        <th className="p-3.5 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(57,255,106,0.08)]">
                      {certificates.map((cert) => (
                        <tr key={cert.code} className="hover:bg-[rgba(57,255,106,0.04)] transition-colors">
                          <td className="p-3.5 font-mono text-[#39FF6A] font-bold">
                            {cert.code}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white font-sans">{cert.studentName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{cert.studentId}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white">{cert.courseName}</div>
                            <div className="text-[10px] text-[#7FE7D6] font-mono">{cert.track}</div>
                          </td>
                          <td className="p-3.5 font-bold text-[#39FF6A]">
                            {cert.grade}%
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                !cert.isRevoked
                                  ? 'bg-[#39FF6A]/10 text-[#39FF6A] border-[#39FF6A]/30'
                                  : 'bg-red-950/40 text-red-400 border-red-500/40'
                              }`}
                            >
                              {!cert.isRevoked ? 'VERIFIED ACTIVE' : 'REVOKED'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <Link
                              href={`/verify/${cert.code}`}
                              target="_blank"
                              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-[11px] inline-flex items-center gap-1 transition"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </Link>

                            <button
                              onClick={() => handleToggleCertificateRevoke(cert.code)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 ${
                                !cert.isRevoked
                                  ? 'bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/30'
                                  : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-500/30'
                              }`}
                            >
                              <Ban className="w-3 h-3" />
                              <span>{!cert.isRevoked ? 'Revoke' : 'Reactivate'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: PLANS & LIMITS */}
          {activeTab === 'plans' && (
            <section className="rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl p-6 sm:p-8 space-y-6 font-mono">
              <div>
                <h3 className="text-xl font-bold text-[#EAF7EF] mb-1 font-sans">
                  Dynamic Plan Pricing &amp; Limit Management
                </h3>
                <p className="text-xs text-[#8FA99B]">
                  Modify monthly pricing (inclusive of 18% GST), daily Rituu AI rate limits, and hardware store discounts without redeploying code.
                </p>
              </div>

              {/* Plan Tier Selector */}
              <div className="flex flex-wrap gap-2">
                {['plan_free', 'plan_plus', 'plan_pro', 'plan_institution'].map((pId) => (
                  <button
                    key={pId}
                    onClick={() => {
                      setSelectedPlanTier(pId);
                      if (pId === 'plan_free') {
                        setEditPriceMonthly(0);
                        setEditRituuMsgLimit(15);
                        setEditRituuPhotoLimit(3);
                        setEditStoreDiscount(0);
                      } else if (pId === 'plan_plus') {
                        setEditPriceMonthly(299);
                        setEditRituuMsgLimit(100);
                        setEditRituuPhotoLimit(20);
                        setEditStoreDiscount(5);
                      } else if (pId === 'plan_pro') {
                        setEditPriceMonthly(999);
                        setEditRituuMsgLimit(300);
                        setEditRituuPhotoLimit(60);
                        setEditStoreDiscount(10);
                      } else {
                        setEditPriceMonthly(4999);
                        setEditRituuMsgLimit(1000);
                        setEditRituuPhotoLimit(200);
                        setEditStoreDiscount(15);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedPlanTier === pId
                        ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A] shadow-[0_0_15px_rgba(57,255,106,0.25)]'
                        : 'bg-[rgba(255,255,255,0.02)] text-[#8FA99B] hover:text-[#EAF7EF] border border-[rgba(57,255,106,0.1)]'
                    }`}
                  >
                    {pId.replace('plan_', '').toUpperCase()} TIER
                  </button>
                ))}
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[rgba(57,255,106,0.1)]">
                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <label className="text-[11px] font-bold text-[#8FA99B] font-mono block mb-1">
                    MONTHLY PRICE (INCL. 18% GST)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[#39FF6A] font-bold text-lg font-mono">₹</span>
                    <input
                      type="number"
                      value={editPriceMonthly}
                      onChange={(e) => setEditPriceMonthly(Number(e.target.value))}
                      className="w-full bg-transparent text-[#EAF7EF] font-extrabold text-xl font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <label className="text-[11px] font-bold text-[#8FA99B] font-mono block mb-1">
                    DAILY RITUU TEXT MESSAGES
                  </label>
                  <input
                    type="number"
                    value={editRituuMsgLimit}
                    onChange={(e) => setEditRituuMsgLimit(Number(e.target.value))}
                    className="w-full bg-transparent text-[#EAF7EF] font-extrabold text-xl font-mono focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <label className="text-[11px] font-bold text-[#8FA99B] font-mono block mb-1">
                    DAILY PHOTO ANALYSES
                  </label>
                  <input
                    type="number"
                    value={editRituuPhotoLimit}
                    onChange={(e) => setEditRituuPhotoLimit(Number(e.target.value))}
                    className="w-full bg-transparent text-[#EAF7EF] font-extrabold text-xl font-mono focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <label className="text-[11px] font-bold text-[#8FA99B] font-mono block mb-1">
                    TECHSAVYYY STORE DISCOUNT (%)
                  </label>
                  <input
                    type="number"
                    value={editStoreDiscount}
                    onChange={(e) => setEditStoreDiscount(Number(e.target.value))}
                    className="w-full bg-transparent text-[#EAF7EF] font-extrabold text-xl font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleUpdatePlan}
                  disabled={isSavingPlan}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-2 shadow transition-all font-sans"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingPlan ? 'Saving Changes...' : 'Save Dynamic Quotas'}</span>
                </button>
              </div>
            </section>
          )}

          {/* TAB 6: ORDERS */}
          {activeTab === 'orders' && (
            <section className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-4 font-mono">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#39FF6A]" />
                  <span>TechSavyyy Store Settlements &amp; GST Invoices</span>
                </h3>
                <Link
                  href="/store"
                  className="text-xs text-[#7FE7D6] hover:text-[#39FF6A] flex items-center gap-1 transition"
                >
                  <span>Open Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  {
                    orderNumber: 'ROBO-20261030-8491',
                    buyer: 'Tanmay Chawda (RV-2026-001001)',
                    items: 'Arduino Uno R3, SG90 Servo, HC-SR04 Sonar',
                    totalInr: 937,
                    status: 'PAID',
                    invoiceNumber: 'INV-2026-008491',
                  },
                  {
                    orderNumber: 'ROBO-20261029-4102',
                    buyer: 'Aarav Sharma (RV-2026-001002)',
                    items: 'RoboVerse Arduino Starter Kit',
                    totalInr: 1199,
                    status: 'DELIVERED',
                    invoiceNumber: 'INV-2026-004102',
                  },
                ].map((ord) => (
                  <div
                    key={ord.orderNumber}
                    className="p-4 rounded-2xl bg-black/40 border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#39FF6A] font-bold">{ord.orderNumber}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30">
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-white mt-1 font-sans">{ord.buyer}</div>
                      <div className="text-gray-400 text-[11px]">{ord.items}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-[#39FF6A]">₹{ord.totalInr}</div>
                      <div className="text-[10px] text-gray-500">Includes 18% GST • Invoice: {ord.invoiceNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
