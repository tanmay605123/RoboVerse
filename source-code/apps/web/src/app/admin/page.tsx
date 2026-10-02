'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/landing/Navbar';
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
} from 'lucide-react';

export default function AdminPage() {
  const { user, profile, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'metrics' | 'plans' | 'users' | 'orders' | 'coupons'>('metrics');

  // Telemetry data
  const [metrics, setMetrics] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Selected plan for editing
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

  const loadAdminData = async () => {
    setLoading(true);
    const [metricsRes, plansRes, usersRes, ordersRes, invoicesRes] = await Promise.all([
      apiRequest('/admin/metrics'),
      apiRequest('/admin/plans'),
      apiRequest('/admin/users'),
      apiRequest('/admin/orders'),
      apiRequest('/admin/invoices'),
    ]);

    if (metricsRes.success) setMetrics(metricsRes.data);
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
    if (!targetPlan) return;

    const updatedPricing = targetPlan.pricing.map((pr: any) => {
      if (pr.cycle === 'MONTHLY') {
        return { ...pr, priceInrInclusiveGst: Number(editPriceMonthly), label: `₹${editPriceMonthly} / month` };
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
      setActionMessage(`Plan ${selectedPlanTier} successfully updated live! New 18% GST price and AI quotas applied without redeployment.`);
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

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text font-sans selection:bg-robo-neon selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top Admin HUD Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D241A] via-[#081811] to-[#040C08] border border-robo-neon/40 p-8 sm:p-10 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-robo-neon/20 border border-robo-neon text-robo-neon text-xs font-mono font-bold mb-3 shadow-neon-subtle">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ROBOVERSE MASTER ADMIN CONTROL CENTER</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Live Pricing, Quotas &amp; Telemetry
              </h1>
              <p className="text-sm text-robo-textSecondary mt-2 max-w-2xl">
                Configure live plan prices (inclusive of 18% GST), adjust server-side Rituu AI rate limits, track Razorpay fees (2% + 1% AutoPay), audit store orders, and issue official GST invoices.
              </p>
            </div>

            <button
              onClick={loadAdminData}
              className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle hover:border-robo-neon text-xs font-mono text-robo-neon flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Live Cluster</span>
            </button>
          </div>

          {actionMessage && (
            <div className="mt-6 p-4 rounded-2xl bg-robo-neon/10 border border-robo-neon text-robo-neon text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Revenue & AI Cost Telemetry Strip */}
          {metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-robo-borderSubtle/60">
              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <div className="text-[10px] font-mono text-robo-textSecondary mb-1">TOTAL COMBINED GROSS</div>
                <div className="text-2xl font-black text-robo-neon">
                  ₹{metrics.totalGrossRevenueInr?.toLocaleString('en-IN') || 0}
                </div>
                <div className="text-[10px] font-mono text-robo-textMuted mt-1">
                  Subs: ₹{metrics.subscriptionRevenueInr || 0} | Store: ₹{metrics.storeRevenueInr || 0}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <div className="text-[10px] font-mono text-robo-textSecondary mb-1">ESTIMATED NET MARGIN</div>
                <div className="text-2xl font-black text-robo-teal">
                  ₹{metrics.estimatedNetMarginInr?.toLocaleString('en-IN') || 0}
                </div>
                <div className="text-[10px] font-mono text-robo-teal mt-1">
                  After AI Vision &amp; Tokens
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <div className="text-[10px] font-mono text-robo-textSecondary mb-1">RAZORPAY TRANSACTION FEES</div>
                <div className="text-2xl font-black text-robo-accentOrange">
                  ₹{metrics.razorpayFeeEstimateInr || 0}
                </div>
                <div className="text-[10px] font-mono text-robo-textMuted mt-1">
                  ~2.36% (2% Fee + 18% GST)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <div className="text-[10px] font-mono text-robo-textSecondary mb-1">STUDENTS &amp; SUBSCRIPTIONS</div>
                <div className="text-2xl font-black text-white">
                  {metrics.totalStudentsRegistered} / {metrics.activePaidSubscriptions} Paid
                </div>
                <div className="text-[10px] font-mono text-robo-textMuted mt-1">
                  Invoices Issued: {metrics.totalInvoicesIssued}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Tab Selector */}
        <section className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          {[
            { id: 'metrics', label: 'Overview Metrics', icon: TrendingUp },
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
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-robo-neon text-black shadow-neon-glow'
                    : 'bg-robo-surfaceRaised text-robo-textSecondary border border-robo-borderSubtle hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </section>

        {/* Tab 1: Overview Metrics & Telemetry */}
        {activeTab === 'metrics' && metrics && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-[#081912] border border-robo-borderSubtle space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-robo-neon" />
                  <span>Subscription Distribution</span>
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-robo-borderSubtle">
                    <span>Free Tier (₹0):</span>
                    <strong className="text-white">{metrics.planDistribution?.free || 0} Students</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-robo-borderSubtle">
                    <span className="text-robo-teal">Plus Plan (₹299/mo):</span>
                    <strong className="text-robo-teal">{metrics.planDistribution?.plus || 0} Active</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-robo-borderSubtle">
                    <span className="text-robo-neon">Pro Plan (₹999/mo):</span>
                    <strong className="text-robo-neon">{metrics.planDistribution?.pro || 0} Guided Learners</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-robo-borderSubtle">
                    <span className="text-robo-accentOrange">School &amp; Institution (₹499/yr):</span>
                    <strong className="text-robo-accentOrange">{metrics.planDistribution?.institution || 0} Batches</strong>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#081912] border border-robo-borderSubtle space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-robo-teal" />
                  <span>Rituu AI Cost Awareness &amp; Guardrails</span>
                </h3>
                <p className="text-xs text-robo-textSecondary leading-relaxed">
                  Daily rate limits prevent multimodal vision inference token abuse while allowing high-yield robotics debugging.
                </p>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-robo-borderSubtle">
                    <span>Total AI Inference Spend:</span>
                    <strong className="text-robo-teal">₹{metrics.totalAiInferenceCostInr}</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-robo-borderSubtle">
                    <span>Store Orders Placed:</span>
                    <strong className="text-white">{metrics.totalStoreOrdersCount} Orders</strong>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-robo-borderSubtle">
                    <span>Confirmed Fulfilled Orders:</span>
                    <strong className="text-robo-neon">{metrics.confirmedStoreOrdersCount} Dispatched</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Live Pricing & Plan Quotas Editor */}
        {activeTab === 'plans' && (
          <section className="rounded-3xl bg-[#081912] border border-robo-borderSubtle p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Dynamic Plan Pricing &amp; Limit Management
              </h3>
              <p className="text-xs text-robo-textSecondary">
                Edit prices inclusive of 18% GST, modify Rituu AI rate caps, and change hardware store discounts without redeploying code.
              </p>
            </div>

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
                      ? 'bg-robo-teal text-black'
                      : 'bg-black/50 text-robo-textSecondary border border-robo-borderSubtle'
                  }`}
                >
                  {pId.replace('plan_', '').toUpperCase()} TIER
                </button>
              ))}
            </div>

            {/* Editable Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-robo-borderSubtle">
              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <label className="text-[10px] font-mono text-robo-textSecondary block mb-1">
                  MONTHLY PRICE (INCL. 18% GST)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-robo-neon font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={editPriceMonthly}
                    onChange={(e) => setEditPriceMonthly(Number(e.target.value))}
                    className="w-full bg-transparent text-white font-black text-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <label className="text-[10px] font-mono text-robo-textSecondary block mb-1">
                  DAILY RITUU TEXT MESSAGES
                </label>
                <input
                  type="number"
                  value={editRituuMsgLimit}
                  onChange={(e) => setEditRituuMsgLimit(Number(e.target.value))}
                  className="w-full bg-transparent text-white font-black text-xl focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <label className="text-[10px] font-mono text-robo-textSecondary block mb-1">
                  DAILY RITUU PHOTO ANALYSES
                </label>
                <input
                  type="number"
                  value={editRituuPhotoLimit}
                  onChange={(e) => setEditRituuPhotoLimit(Number(e.target.value))}
                  className="w-full bg-transparent text-white font-black text-xl focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle">
                <label className="text-[10px] font-mono text-robo-textSecondary block mb-1">
                  TECHSAVYYY STORE DISCOUNT
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editStoreDiscount}
                    onChange={(e) => setEditStoreDiscount(Number(e.target.value))}
                    className="w-full bg-transparent text-white font-black text-xl focus:outline-none"
                  />
                  <span className="text-robo-neon font-bold text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleUpdatePlan}
                disabled={isSavingPlan}
                className="px-6 py-3 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-xs flex items-center gap-2 shadow-neon-glow transition-all"
              >
                {isSavingPlan ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Deploy to Cluster Live</span>
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Tab 3: Student Directory */}
        {activeTab === 'users' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-robo-textSecondary" />
                <input
                  type="text"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  placeholder="Filter by Student ID, email or name..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-xs text-white placeholder-robo-textSecondary focus:outline-none focus:border-robo-neon"
                />
              </div>
              <span className="text-xs font-mono text-robo-textSecondary">
                Showing {filteredUsers.length} Registered Students
              </span>
            </div>

            <div className="rounded-2xl border border-robo-borderSubtle overflow-hidden bg-[#081811]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 text-robo-textSecondary font-mono border-b border-robo-borderSubtle">
                    <tr>
                      <th className="p-3.5">STUDENT ID</th>
                      <th className="p-3.5">NAME &amp; EMAIL</th>
                      <th className="p-3.5">INSTITUTION &amp; CITY</th>
                      <th className="p-3.5">ACTIVE ROLE</th>
                      <th className="p-3.5">PROMOTE ROLE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-robo-borderSubtle/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-robo-surfaceRaised/40 transition-colors">
                        <td className="p-3.5 font-mono text-robo-neon font-bold">
                          {u.studentId || 'RV-PENDING'}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white">{u.fullName || 'Student'}</div>
                          <div className="text-[11px] text-robo-textSecondary">{u.email}</div>
                        </td>
                        <td className="p-3.5 text-robo-textSecondary">
                          <div>{u.schoolOrCollege || 'Robotics Lab'}</div>
                          <div className="text-[10px] text-robo-teal">{u.city}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-robo-surfaceRaised border border-robo-neon/40 text-robo-neon">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-black/60 border border-robo-borderSubtle rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-robo-neon"
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

        {/* Tab 4: TechSavyyy Orders & 18% GST Invoices */}
        {activeTab === 'orders' && (
          <section className="space-y-6">
            {/* Orders List */}
            <div className="p-6 rounded-3xl bg-[#081811] border border-robo-borderSubtle space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-robo-neon" />
                <span>Store Orders &amp; Invoices Audit</span>
              </h3>

              {ordersList.length === 0 ? (
                <p className="text-xs text-robo-textSecondary py-6">No store orders placed yet.</p>
              ) : (
                <div className="space-y-3">
                  {ordersList.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="p-4 rounded-2xl bg-black/50 border border-robo-borderSubtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{ord.orderId}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-robo-neon/20 text-robo-neon">
                            {ord.status}
                          </span>
                        </div>
                        <div className="text-robo-textSecondary mt-1">
                          Customer: <strong className="text-white">{ord.customerName}</strong> ({ord.customerEmail})
                        </div>
                        <div className="text-[11px] text-robo-teal mt-0.5">
                          Destination: {ord.shippingAddress?.city}, {ord.shippingAddress?.state} • Items: {ord.items?.length || 1}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-robo-neon">
                          ₹{ord.taxBreakdown?.finalAmountInr}
                        </div>
                        <div className="text-[10px] text-robo-textSecondary">
                          Base: ₹{ord.taxBreakdown?.taxableAmountInr} + 18% GST: ₹{ord.taxBreakdown?.totalGstInr}
                        </div>
                        {ord.invoice?.id && (
                          <a
                            href={`/api/v1/subscriptions/invoices/${ord.invoice.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-robo-teal hover:underline mt-1"
                          >
                            <span>Invoice {ord.invoice.invoiceNumber}</span>
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

        {/* Tab 5: Coupons & Scholarships */}
        {activeTab === 'coupons' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#081811] border border-robo-borderSubtle space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-robo-teal" />
                <span>Issue Scholarship / Discount Coupon</span>
              </h3>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-robo-textSecondary block mb-1">COUPON CODE (UPPERCASE)</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ROBOINDIA50, SCHOLAR2026"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-robo-borderSubtle text-white focus:outline-none focus:border-robo-neon"
                  />
                </div>

                <div>
                  <label className="text-robo-textSecondary block mb-1">DISCOUNT PERCENTAGE (%)</label>
                  <input
                    type="number"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-robo-borderSubtle text-white focus:outline-none focus:border-robo-neon"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingCoupon}
                  className="w-full py-2.5 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-neon-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Live Coupon</span>
                </button>
              </form>
            </div>

            <div className="p-6 rounded-3xl bg-[#081811] border border-robo-borderSubtle space-y-3">
              <h3 className="text-lg font-bold text-white mb-2">Policy &amp; Discount Engine</h3>
              <p className="text-xs text-robo-textSecondary leading-relaxed">
                Active coupons automatically apply at subscription or store checkout. All discounts compute prior to 18% GST computation, maintaining strict legal tax parity across intra-state and inter-state transactions.
              </p>
              <div className="p-4 rounded-2xl bg-black/40 border border-robo-borderSubtle text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span>Default Referral Reward:</span>
                  <span className="text-robo-neon">1 Free Month Pro</span>
                </div>
                <div className="flex justify-between">
                  <span>Grace Period on Renewal:</span>
                  <span className="text-robo-teal">3 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Pro 7-Day Trial:</span>
                  <span className="text-white">Active with Mandate</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
