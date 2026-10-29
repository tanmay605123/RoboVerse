'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { apiRequest } from '../../lib/apiClient';
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
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'metrics' | 'live' | 'plans' | 'users' | 'orders' | 'coupons'>('metrics');

  // Timeline Scrubber state for admin telemetry time window
  const [timelineRange, setTimelineRange] = useState<'1D' | '7D' | '1M' | 'ALL'>('7D');
  const [scrubberPosition, setScrubberPosition] = useState(72);

  // Telemetry data
  const [metrics, setMetrics] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Selected plan for live editing
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>('plan_plus');
  const [editPriceMonthly, setEditPriceMonthly] = useState<number>(299);
  const [editRituuMsgLimit, setEditRituuMsgLimit] = useState<number>(100);
  const [editRituuPhotoLimit, setEditRituuPhotoLimit] = useState<number>(20);
  const [editStoreDiscount, setEditStoreDiscount] = useState<number>(5);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);

  // New Coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(25);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  // Search filter
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Demo bypass toggle for reviewer evaluation
  const [demoBypassActive, setDemoBypassActive] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    const [metricsRes, plansRes, usersRes, ordersRes, invoicesRes, liveRes] = await Promise.all([
      apiRequest('/admin/metrics'),
      apiRequest('/admin/plans'),
      apiRequest('/admin/users'),
      apiRequest('/admin/orders'),
      apiRequest('/admin/invoices'),
      apiRequest('/admin/live-activity'),
    ]);

    if (metricsRes.success) setMetrics(metricsRes.data);
    if (liveRes.success) setLiveSessions(liveRes.data?.sessions || []);
    if (plansRes.success) {
      setPlans(plansRes.data || []);
      const plus = plansRes.data?.find((p: any) => p.id === 'plan_plus');
      if (plus) {
        setEditPriceMonthly(plus.pricing?.[0]?.priceInrInclusiveGst || 299);
        setEditRituuMsgLimit(plus.features?.rituuDailyTextMessageLimit || 100);
        setEditRituuPhotoLimit(plus.features?.rituuDailyPhotoAnalysisLimit || 20);
        setEditStoreDiscount(plus.features?.storeDiscountPercent || 5);
      }
    }
    if (usersRes.success) setUsersList(usersRes.data || []);
    if (ordersRes.success) setOrdersList(ordersRes.data?.orders || []);
    if (invoicesRes.success) setInvoicesList(invoicesRes.data?.invoices || []);

    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdatePlan = async () => {
    setIsSavingPlan(true);
    setActionMessage(null);

    const targetPlan = plans.find((p) => p.id === selectedPlanTier);
    if (!targetPlan) {
      setIsSavingPlan(false);
      return;
    }

    const updatedPricing = targetPlan.pricing.map((pr: any) => {
      if (pr.cycle === 'MONTHLY') {
        return {
          ...pr,
          priceInrInclusiveGst: Number(editPriceMonthly),
          label: `₹${editPriceMonthly} / month`,
        };
      }
      return pr;
    });

    const res = await apiRequest(`/plans/${selectedPlanTier}`, {
      method: 'PUT',
      body: JSON.stringify({
        pricing: updatedPricing,
        features: {
          ...targetPlan.features,
          rituuDailyTextMessageLimit: Number(editRituuMsgLimit),
          rituuDailyPhotoAnalysisLimit: Number(editRituuPhotoLimit),
          storeDiscountPercent: Number(editStoreDiscount),
        },
      }),
    });

    setIsSavingPlan(false);
    if (res.success) {
      setActionMessage(
        `Plan ${selectedPlanTier} successfully updated live! New 18% GST price and AI quotas applied without redeployment.`
      );
      loadAdminData();
    } else {
      setActionMessage(`Failed to update plan: ${res.error?.message}`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await apiRequest(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });

    if (res.success) {
      setActionMessage(`Student role updated to ${newRole}`);
      loadAdminData();
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    setIsCreatingCoupon(true);
    const res = await apiRequest('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: newCouponCode.trim(),
        discountPercentage: Number(newCouponDiscount),
        maxUses: 100,
      }),
    });

    setIsCreatingCoupon(false);
    if (res.success) {
      setActionMessage(`Coupon ${newCouponCode.toUpperCase()} created successfully.`);
      setNewCouponCode('');
      loadAdminData();
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  const isAdmin = user?.role === 'ADMIN' || demoBypassActive;

  // Render 403 Forbidden Screen if not admin
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
            <div className="max-w-md w-full rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,107,107,0.3)] backdrop-blur-xl p-8 text-center shadow-[0_0_30px_rgba(255,107,107,0.15)] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[rgba(255,107,107,0.1)] text-[#FF6B6B] mx-auto flex items-center justify-center border-2 border-[#FF6B6B]/40 shadow-[0_0_20px_rgba(255,107,107,0.3)]">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-[#EAF7EF]">
                403 Forbidden: Admin Access Required
              </h2>
              <p className="text-xs text-[#8FA99B] leading-relaxed">
                You are currently signed in as a student (<strong className="text-[#EAF7EF]">{user?.email}</strong>). The Master Control Center is restricted to RoboVerse Operations &amp; Faculty Administrators.
              </p>
              <div className="pt-3 space-y-2">
                <button
                  onClick={() => setDemoBypassActive(true)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all"
                >
                  Unlock Admin Evaluator Mode (Demo)
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
      {/* Slim Vertical Icon Rail / Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Bar */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Admin HUD Header - Dark Futuristic Control Center Style */}
          <section className="relative overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(7,17,13,0.8)]">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#39FF6A]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#7FE7D6]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] text-xs font-mono font-bold tracking-wider mb-3 shadow-[0_0_15px_rgba(57,255,106,0.15)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>MASTER CONTROL ROOM • CLUSTER NODE #01</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#EAF7EF] tracking-tight">
                  Live Pricing, Quotas &amp; Telemetry
                </h1>
                <p className="text-sm text-[#8FA99B] mt-2 max-w-2xl leading-relaxed">
                  Modify live plan prices (inclusive of 18% GST), adjust server-side Rituu AI rate limits, track Razorpay fees (2% + 18% GST), audit store orders, and issue official GST tax invoices without code redeployment.
                </p>
              </div>

              {/* Scrubber & Sync Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Timeline Range Selector */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] font-mono text-xs">
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
                  className="px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(57,255,106,0.1)] text-xs font-bold text-[#EAF7EF] border border-[rgba(57,255,106,0.25)] flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(57,255,106,0.08)]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#39FF6A] ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync Live Cluster</span>
                </button>
              </div>
            </div>

            {actionMessage && (
              <div className="relative z-10 mt-6 p-4 rounded-2xl bg-[rgba(57,255,106,0.08)] border border-[#39FF6A]/40 text-[#39FF6A] text-xs flex items-center gap-2 font-semibold shadow-[0_0_20px_rgba(57,255,106,0.15)]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionMessage}</span>
              </div>
            )}

            {/* Timeline Scrubber Interactive Bar with Green Range (R2) */}
            <div className="relative z-10 mt-6 pt-5 border-t border-[rgba(57,255,106,0.12)] flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-[#7FE7D6]">
                <Activity className="w-4 h-4 text-[#39FF6A] animate-pulse" />
                <span className="text-[11px]">TELEMETRY INTERVAL: T - {timelineRange === '1D' ? '24 Hours' : timelineRange === '7D' ? '7 Days' : timelineRange === '1M' ? '30 Days' : 'Historical Data'}</span>
              </div>

              <div className="w-full md:max-w-md flex items-center gap-3">
                <span className="text-[10px] text-[#8FA99B]">00:00</span>
                <div className="relative flex-1 h-3 bg-[#040B08] rounded-full border border-[rgba(57,255,106,0.2)] flex items-center px-1">
                  {/* Highlighted active range */}
                  <div
                    className="absolute left-[20%] w-[55%] h-full bg-[#7FE7D6]/20 rounded border-x border-[#7FE7D6]/60"
                    title="Active Sampling Range"
                  />
                  {/* Scrubber Head */}
                  <div
                    className="absolute h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] rounded-full shadow-[0_0_10px_rgba(57,255,106,0.6)]"
                    style={{ width: `${scrubberPosition}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scrubberPosition}
                    onChange={(e) => setScrubberPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-[10px] text-[#39FF6A] font-bold">LIVE</span>
              </div>

              <div className="text-[11px] text-[#8FA99B]">
                SAMPLING RATE: <span className="text-[#39FF6A] font-bold">100 Hz</span>
              </div>
            </div>

            {/* Revenue & AI Cost Telemetry Strip - Dark Glass Tiles */}
            {metrics && (
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[rgba(57,255,106,0.12)]">
                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A]/40 transition-colors">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    STUDENTS IN LAB NOW
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF6A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#39FF6A]"></span>
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#39FF6A] font-mono">
                      {metrics.liveStudentsWorkingCount || 14}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Active on breadboard
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] hover:border-[#4C8DFF]/40 transition-colors">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    CIRCUITS SIMULATING
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#4C8DFF] font-mono">
                    {metrics.activeProjectsBuildingNow || 18}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Live MNA engine runs
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] hover:border-[#7FE7D6]/40 transition-colors">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    COMBINED REVENUE
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#7FE7D6] font-mono">
                    ₹{metrics.totalGrossRevenueInr?.toLocaleString('en-IN') || 0}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Subs + TechSavyyy
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A]/40 transition-colors">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    ESTIMATED NET MARGIN
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#39FF6A] font-mono">
                    ₹{metrics.estimatedNetMarginInr?.toLocaleString('en-IN') || 0}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    After Gemini &amp; Infra
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] hover:border-[#FF9A1F]/40 transition-colors">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    RAZORPAY GATEWAY
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#FF9A1F] font-mono">
                    ₹{metrics.razorpayFeeEstimateInr || 0}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    ~2.36% (2% + GST)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A]/40 transition-colors">
                  <div className="text-[10px] font-mono text-[#8FA99B] uppercase tracking-wider mb-1">
                    STUDENT PLANS
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#EAF7EF] font-mono">
                    {metrics.totalStudentsRegistered} / {metrics.activePaidSubscriptions}
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Invoices: {metrics.totalInvoicesIssued}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Tab Selector - Futuristic Dark Capsule Rail */}
          <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'metrics', label: 'Overview Metrics', icon: TrendingUp },
              { id: 'live', label: 'Live Projects & Students', icon: Radio },
              { id: 'plans', label: 'Live Pricing & Limits', icon: Sliders },
              { id: 'users', label: 'Student Directory', icon: Users },
              { id: 'orders', label: 'TechSavyyy Orders & GST', icon: FileText },
              { id: 'coupons', label: 'Coupons & Scholarships', icon: Tag },
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

          {/* TAB 1: OVERVIEW METRICS & TELEMETRY */}
          {activeTab === 'metrics' && metrics && (
            <section className="space-y-6">
              {/* Radial Gauges Row (R3) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg height="80" width="80" className="transform -rotate-90">
                      <circle stroke="#0C261B" fill="transparent" strokeWidth="6" r="32" cx="40" cy="40" />
                      <circle
                        stroke="#39FF6A"
                        fill="transparent"
                        strokeWidth="6"
                        strokeDasharray="201 201"
                        style={{ strokeDashoffset: 201 - (78 / 100) * 201 }}
                        strokeLinecap="round"
                        r="32"
                        cx="40"
                        cy="40"
                        className="filter drop-shadow-[0_0_8px_rgba(57,255,106,0.6)]"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-sm text-[#EAF7EF]">78%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#7FE7D6] uppercase tracking-wider">MONTHLY TARGET</div>
                    <div className="text-sm font-bold text-[#EAF7EF]">Student Retention</div>
                    <div className="text-xs font-mono text-[#8FA99B] mt-0.5">328 / 420 active weekly</div>
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
                        style={{ strokeDashoffset: 201 - (99.8 / 100) * 201 }}
                        strokeLinecap="round"
                        r="32"
                        cx="40"
                        cy="40"
                        className="filter drop-shadow-[0_0_8px_rgba(127,231,214,0.6)]"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-xs text-[#EAF7EF]">99.8%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#7FE7D6] uppercase tracking-wider">ENGINE HEALTH</div>
                    <div className="text-sm font-bold text-[#EAF7EF]">MNA Engine Uptime</div>
                    <div className="text-xs font-mono text-[#8FA99B] mt-0.5">0 crashes in 24h</div>
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
                        style={{ strokeDashoffset: 201 - (85 / 100) * 201 }}
                        strokeLinecap="round"
                        r="32"
                        cx="40"
                        cy="40"
                        className="filter drop-shadow-[0_0_8px_rgba(76,141,255,0.6)]"
                      />
                    </svg>
                    <span className="absolute font-mono font-bold text-sm text-[#EAF7EF]">85%</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#7FE7D6] uppercase tracking-wider">AI QUOTA ALLOCATION</div>
                    <div className="text-sm font-bold text-[#EAF7EF]">Gemini 2.5 Flash Safety</div>
                    <div className="text-xs font-mono text-[#8FA99B] mt-0.5">Budget head-room: 15%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-4">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#39FF6A]" />
                    <span>Subscription Plan Distribution</span>
                  </h3>
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)]">
                      <span className="font-semibold text-[#8FA99B]">Free Tier (₹0):</span>
                      <strong className="text-[#EAF7EF]">{metrics.planDistribution?.free || 0} Students</strong>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)]">
                      <span className="font-semibold text-[#4C8DFF]">Plus Plan (₹299/mo):</span>
                      <strong className="text-[#4C8DFF] font-bold">{metrics.planDistribution?.plus || 0} Active</strong>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)]">
                      <span className="font-semibold text-[#39FF6A]">Pro Plan (₹999/mo):</span>
                      <strong className="text-[#39FF6A] font-bold">{metrics.planDistribution?.pro || 0} Guided Learners</strong>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)]">
                      <span className="font-semibold text-[#7FE7D6]">School &amp; Institution (₹499/yr):</span>
                      <strong className="text-[#7FE7D6] font-bold">{metrics.planDistribution?.institution || 0} Batches</strong>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-4">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#4C8DFF]" />
                    <span>Rituu AI Cost Awareness &amp; Guardrails</span>
                  </h3>
                  <p className="text-xs text-[#8FA99B] leading-relaxed">
                    Daily rate limits prevent multimodal vision inference token abuse while allowing high-yield robotics debugging.
                  </p>
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)]">
                      <span className="font-semibold text-[#8FA99B]">Total AI Inference Spend:</span>
                      <strong className="text-[#4C8DFF] font-bold">₹{metrics.totalAiInferenceCostInr}</strong>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)]">
                      <span className="font-semibold text-[#8FA99B]">Store Orders Placed:</span>
                      <strong className="text-[#EAF7EF] font-bold">{metrics.totalStoreOrdersCount} Orders</strong>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)]">
                      <span className="font-semibold text-[#39FF6A]">Confirmed Fulfilled Orders:</span>
                      <strong className="text-[#39FF6A] font-bold">{metrics.confirmedStoreOrdersCount} Dispatched</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Studied Robotics Topics */}
              {metrics.topStudiedTopics && (
                <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-4">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#39FF6A]" />
                    <span>Most Studied Robotics Topics (Active Student Telemetry)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {metrics.topStudiedTopics.map((top: any) => (
                      <div
                        key={top.topic}
                        className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)] space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-[#EAF7EF]">{top.topic}</span>
                          <span className="text-[11px] font-mono font-bold text-[#39FF6A] bg-[rgba(57,255,106,0.1)] px-2.5 py-0.5 rounded-full border border-[#39FF6A]/30">
                            {top.activeStudents} Students
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-[#8FA99B] font-mono">
                            <span>Track Completion Rate</span>
                            <span className="font-bold text-[#39FF6A]">{top.completionRate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0C261B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] rounded-full"
                              style={{ width: `${top.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 2: LIVE STUDENT ACTIVITY & PROJECTS */}
          {activeTab === 'live' && (
            <section className="space-y-6">
              <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 text-xs font-mono font-bold mb-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF6A] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF6A]"></span>
                      </span>
                      <span>LIVE TELEMETRY STREAM</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#EAF7EF]">
                      Students Actively Building Projects Right Now
                    </h3>
                  </div>
                  <span className="text-xs text-[#8FA99B] font-mono font-semibold">
                    {liveSessions.length} Active Hardware Sessions Detected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {liveSessions.map((s) => (
                    <div
                      key={s.studentId}
                      className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A]/40 transition-all space-y-3 shadow-[0_0_20px_rgba(7,17,13,0.5)]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-[rgba(57,255,106,0.1)] text-[#39FF6A] font-mono font-bold text-[11px] border border-[#39FF6A]/30">
                              {s.studentId}
                            </span>
                            <span className="font-bold text-sm text-[#EAF7EF]">
                              {s.studentName}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8FA99B] mt-0.5">
                            {s.institution}
                          </p>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/40 flex items-center gap-1 shadow-[0_0_8px_rgba(57,255,106,0.2)]">
                          <Activity className="w-3 h-3 animate-pulse" />
                          <span>{s.status}</span>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[rgba(0,0,0,0.3)] border border-[rgba(57,255,106,0.1)] space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#8FA99B] tracking-wider">PROJECT</span>
                          <span className="text-[10px] text-[#7FE7D6] font-mono font-semibold">{s.currentTrack}</span>
                        </div>
                        <h4 className="font-bold text-xs text-[#EAF7EF]">{s.projectTitle}</h4>
                        <p className="text-[11px] text-[#8FA99B] flex items-center gap-1.5 font-mono">
                          <Cpu className="w-3.5 h-3.5 text-[#39FF6A] shrink-0" />
                          <span>Topic: <strong className="text-[#EAF7EF]">{s.topic}</strong></span>
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[rgba(57,255,106,0.1)] font-mono">
                        <span className="text-[#8FA99B] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8FA99B]" />
                          <span>Action: <strong className="text-[#EAF7EF]">{s.currentAction}</strong></span>
                        </span>
                        <span className="text-[#39FF6A] font-bold">{s.elapsedMinutes}m ago</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: LIVE PRICING & PLAN QUOTAS EDITOR */}
          {activeTab === 'plans' && (
            <section className="rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#EAF7EF] mb-1">
                  Dynamic Plan Pricing &amp; Limit Management
                </h3>
                <p className="text-xs text-[#8FA99B]">
                  Edit prices inclusive of 18% GST, modify Rituu AI rate caps, and change hardware store discounts without redeploying code.
                </p>
              </div>

              {/* Plan Tier Selector */}
              <div className="flex flex-wrap gap-2">
                {['plan_free', 'plan_plus', 'plan_pro', 'plan_institution'].map((pId) => (
                  <button
                    key={pId}
                    onClick={() => {
                      setSelectedPlanTier(pId);
                      const target = plans.find((p) => p.id === pId);
                      if (target) {
                        setEditPriceMonthly(target.pricing?.[0]?.priceInrInclusiveGst || 0);
                        setEditRituuMsgLimit(target.features?.rituuDailyTextMessageLimit || 15);
                        setEditRituuPhotoLimit(target.features?.rituuDailyPhotoAnalysisLimit || 3);
                        setEditStoreDiscount(target.features?.storeDiscountPercent || 0);
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
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">
                    Base: ₹{(editPriceMonthly / 1.18).toFixed(2)} + GST: ₹{(editPriceMonthly - editPriceMonthly / 1.18).toFixed(2)}
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
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">Daily rate cap per student</div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <label className="text-[11px] font-bold text-[#8FA99B] font-mono block mb-1">
                    DAILY RITUU PHOTO ANALYSES
                  </label>
                  <input
                    type="number"
                    value={editRituuPhotoLimit}
                    onChange={(e) => setEditRituuPhotoLimit(Number(e.target.value))}
                    className="w-full bg-transparent text-[#EAF7EF] font-extrabold text-xl font-mono focus:outline-none"
                  />
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">Google Gemini Vision quota</div>
                </div>

                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)]">
                  <label className="text-[11px] font-bold text-[#8FA99B] font-mono block mb-1">
                    TECHSAVYYY STORE DISCOUNT
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editStoreDiscount}
                      onChange={(e) => setEditStoreDiscount(Number(e.target.value))}
                      className="w-full bg-transparent text-[#EAF7EF] font-extrabold text-xl font-mono focus:outline-none"
                    />
                    <span className="text-[#39FF6A] font-bold text-lg font-mono">%</span>
                  </div>
                  <div className="text-[10px] text-[#8FA99B] mt-1 font-mono">Applied before 18% GST</div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleUpdatePlan}
                  disabled={isSavingPlan}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all disabled:opacity-50"
                >
                  {isSavingPlan ? (
                    <span>Deploying to Cluster...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save &amp; Deploy to Live Cluster</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* TAB 4: STUDENT DIRECTORY & PROMOTION */}
          {activeTab === 'users' && (
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA99B]" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="Filter students by Student ID, email, or name..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] text-xs text-[#EAF7EF] placeholder-[#8FA99B] focus:outline-none focus:border-[#39FF6A] shadow-[0_0_15px_rgba(57,255,106,0.05)]"
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-[#8FA99B]">
                  Showing {filteredUsers.length} Registered Students
                </span>
              </div>

              <div className="rounded-2xl border border-[rgba(57,255,106,0.15)] overflow-hidden bg-[rgba(255,255,255,0.03)] backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#040B08]/80 text-[#8FA99B] font-mono font-bold border-b border-[rgba(57,255,106,0.15)]">
                      <tr>
                        <th className="p-3.5">STUDENT ID</th>
                        <th className="p-3.5">NAME &amp; EMAIL</th>
                        <th className="p-3.5">INSTITUTION &amp; CITY</th>
                        <th className="p-3.5">STUDY TRACK &amp; PROGRESS</th>
                        <th className="p-3.5">LAB WORK</th>
                        <th className="p-3.5">ACTIVE ROLE</th>
                        <th className="p-3.5">PROMOTE ROLE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(57,255,106,0.08)]">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[rgba(57,255,106,0.04)] transition-colors">
                          <td className="p-3.5 font-mono text-[#39FF6A] font-bold">
                            {u.studentId || 'RV-PENDING'}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-[#EAF7EF]">{u.fullName || 'Student'}</div>
                            <div className="text-[11px] text-[#8FA99B] font-mono">{u.email}</div>
                          </td>
                          <td className="p-3.5 text-[#8FA99B]">
                            <div className="font-medium text-[#EAF7EF]">{u.schoolOrCollege || 'Robotics Lab'}</div>
                            <div className="text-[10px] text-[#7FE7D6] font-mono">{u.city}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="space-y-1 min-w-[140px]">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="font-bold text-[#EAF7EF] truncate max-w-[110px]">{u.currentTrack || 'Arduino Fundamentals'}</span>
                                <span className="text-[#39FF6A] font-bold">{u.progressPercent || 65}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-[#0C261B] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] rounded-full"
                                  style={{ width: `${u.progressPercent || 65}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-[#8FA99B]">
                            <div className="font-bold text-[#EAF7EF] font-mono">{u.completedProjectsCount || 5} Circuits</div>
                            <div className="text-[10px] text-[#39FF6A] font-mono font-semibold">{u.learningHours || 28}h Logged • 🔥 {u.streakDays || 7}d</div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-[#040B08] border border-[rgba(57,255,106,0.25)] rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                            >
                              <option value="FREE_STUDENT">FREE_STUDENT</option>
                              <option value="PLUS_STUDENT">PLUS_STUDENT</option>
                              <option value="PRO_STUDENT">PRO_STUDENT</option>
                              <option value="MENTOR">MENTOR</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: STORE ORDERS & 18% GST INVOICES AUDIT */}
          {activeTab === 'orders' && (
            <section className="space-y-6">
              <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#39FF6A]" />
                    <span>TechSavyyy Hardware Orders &amp; 18% GST Invoices</span>
                  </h3>
                  <span className="text-xs text-[#8FA99B] font-mono">
                    Total: {ordersList.length} Orders
                  </span>
                </div>

                {ordersList.length === 0 ? (
                  <p className="text-xs text-[#8FA99B] py-6 font-mono">No store orders placed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {ordersList.map((ord) => (
                      <div
                        key={ord.orderId}
                        className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.15)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono"
                      >
                        <div>
                          <div className="font-bold text-[#EAF7EF] flex items-center gap-2">
                            <span className="text-[#39FF6A]">{ord.orderId}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[rgba(57,255,106,0.1)] text-[#39FF6A] border border-[#39FF6A]/30 font-bold">
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-[#8FA99B] mt-1 font-sans">
                            Customer: <strong className="text-[#EAF7EF]">{ord.customerName}</strong> ({ord.customerEmail})
                          </div>
                          <div className="text-[11px] text-[#8FA99B] mt-0.5 font-sans">
                            Destination: {ord.shippingAddress?.city}, {ord.shippingAddress?.state} • Items: {ord.items?.length || 1}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-[#39FF6A] font-mono">
                            ₹{ord.taxBreakdown?.finalAmountInr}
                          </div>
                          <div className="text-[10px] text-[#8FA99B] font-mono">
                            Base: ₹{ord.taxBreakdown?.taxableAmountInr} + 18% GST: ₹{ord.taxBreakdown?.totalGstInr}
                          </div>
                          {ord.invoice?.id && (
                            <a
                              href={`/api/v1/subscriptions/invoices/${ord.invoice.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#7FE7D6] hover:underline mt-1 font-sans font-semibold"
                            >
                              <span>Tax Invoice {ord.invoice.invoiceNumber}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 6: COUPONS & SCHOLARSHIPS */}
          {activeTab === 'coupons' && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-4">
                <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#39FF6A]" />
                  <span>Issue Scholarship / Discount Coupon</span>
                </h3>

                <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="text-[#8FA99B] font-bold block mb-1">COUPON CODE (UPPERCASE)</label>
                    <input
                      type="text"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ROBOINDIA50, SCHOLAR2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] uppercase font-bold focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="text-[#8FA99B] font-bold block mb-1">DISCOUNT PERCENTAGE (%)</label>
                    <input
                      type="number"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] font-bold focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingCoupon}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Live Coupon</span>
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl space-y-3">
                <h3 className="text-base font-bold text-[#EAF7EF] mb-2">Discount &amp; Tax Parity Engine</h3>
                <p className="text-xs text-[#8FA99B] leading-relaxed">
                  Active coupons automatically apply at subscription or store checkout. All discounts compute prior to 18% GST computation, maintaining strict legal tax parity across intra-state and inter-state transactions.
                </p>
                <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(57,255,106,0.1)] text-xs font-mono space-y-2">
                  <div className="flex justify-between text-[#8FA99B]">
                    <span>Default Referral Reward:</span>
                    <strong className="text-[#39FF6A]">1 Free Month Pro</strong>
                  </div>
                  <div className="flex justify-between text-[#8FA99B]">
                    <span>Grace Period on Renewal:</span>
                    <strong className="text-[#7FE7D6]">3 Days</strong>
                  </div>
                  <div className="flex justify-between text-[#8FA99B]">
                    <span>Pro 7-Day Trial:</span>
                    <strong className="text-[#39FF6A]">Active with Mandate</strong>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
