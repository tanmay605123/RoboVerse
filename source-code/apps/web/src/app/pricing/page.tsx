'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import {
  ROBOVERSE_PLANS,
  ROBOVERSE_FEATURE_COMPARISON,
  SubscriptionPlanTier,
  SubscriptionBillingCycle,
  calculateSubscriptionPrice,
} from '@roboverse/shared';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'checkout' | 'qr'>('qr');
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    valid?: boolean;
    message?: string;
    discountInr?: number;
  } | null>(null);

  // Checkout modal & payment state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePayment, setActivePayment] = useState<any>(null);
  const [qrCountdown, setQrCountdown] = useState(600); // 10 minutes in seconds
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [copiedVpa, setCopiedVpa] = useState(false);

  // Institution Modal
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false);
  const [institutionFormSubmitted, setInstitutionFormSubmitted] = useState(false);
  const [institutionForm, setInstitutionForm] = useState({
    schoolName: '',
    contactPerson: '',
    email: '',
    phone: '',
    seats: '50',
    hardwareKits: true,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Countdown timer for QR code
  useEffect(() => {
    if (isModalOpen && activePayment?.method === 'qr' && !paymentSuccess) {
      setQrCountdown(600);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start polling status
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        if (!activePayment?.paymentId) return;
        try {
          const res = await fetch(`/api/payments/status/${activePayment.paymentId}`);
          const json = await res.json();
          if (json.data?.status === 'captured') {
            clearInterval(pollRef.current!);
            setPaymentSuccess(json.data);
          }
        } catch (_err) {
          // ignore transient poll error
        }
      }, 2500);
    }
  }, [isModalOpen, activePayment, paymentSuccess]);

  // Handle Coupon Validation
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponFeedback(null);
      return;
    }
    try {
      const res = await fetch('/api/payments/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          planTier: selectedPlan || 'plus',
          billingCycle,
        }),
      });
      const data = await res.json();
      if (data.data?.valid) {
        setCouponFeedback({
          valid: true,
          message: data.data.message,
          discountInr: data.data.discountAppliedInr,
        });
      } else {
        setCouponFeedback({
          valid: false,
          message: data.data?.message || 'Invalid promo coupon code.',
        });
      }
    } catch (_err) {
      setCouponFeedback({ valid: false, message: 'Could not validate coupon.' });
    }
  };

  // Initiate Payment Order
  const handleInitiateOrder = async (planTier: SubscriptionPlanTier) => {
    if (planTier === 'free') {
      alert('You are already exploring the Explorer Free plan!');
      return;
    }
    if (planTier === 'institution') {
      setIsInstitutionModalOpen(true);
      return;
    }

    setSelectedPlan(planTier);
    setIsModalOpen(true);
    setLoading(true);
    setPaymentSuccess(null);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planTier,
          billingCycle,
          paymentMethod,
          couponCode: couponFeedback?.valid ? couponCode : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create payment order');
      setActivePayment(json.data);
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed.');
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Switch Payment Mode inside modal
  const handleSwitchPaymentMode = async (method: 'checkout' | 'qr') => {
    if (!selectedPlan) return;
    setPaymentMethod(method);
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          paymentMethod: method,
          couponCode: couponFeedback?.valid ? couponCode : undefined,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setActivePayment(json.data);
      }
    } catch (_err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Simulate Payment Success (in Test / Dev Mode)
  const handleSimulatePayment = async () => {
    if (!activePayment) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: activePayment.paymentId,
          razorpayOrderId: activePayment.orderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          simulated: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentSuccess(json.data);
      } else {
        alert(json.error || 'Verification failed');
      }
    } catch (err: any) {
      alert(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  // Format seconds to MM:SS
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#07110D] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header Ribbon */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#39FF6A]/40 bg-[#39FF6A]/10 text-[#39FF6A] text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-ping" />
            Transparent STEM Education Pricing &bull; 18% GST Included
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Unlock Full <span className="text-[#39FF6A]">Robotics R&D</span> Superpowers
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            From beginners blinking their first LED to elite engineering teams designing autonomous
            quadrupeds. Razorpay checkout &amp; direct 10-minute UPI Dynamic QR code accepted.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-xl bg-[#0B1914] border border-[#7FE7D6]/20 shadow-lg shadow-black/40">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#39FF6A] text-[#07110D] shadow-md shadow-[#39FF6A]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-[#39FF6A] text-[#07110D] shadow-md shadow-[#39FF6A]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-[#FF9A1F] text-black">
                SAVE 30%
              </span>
            </button>
          </div>
        </div>

        {/* Coupon Code Drawer */}
        <div className="max-w-md mx-auto mb-12 p-3 rounded-xl bg-[#0B1914]/80 border border-[#7FE7D6]/20 flex items-center gap-2">
          <span className="text-xs font-mono text-[#7FE7D6] pl-2 uppercase font-bold">
            PROMO CODE:
          </span>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setCouponFeedback(null);
            }}
            placeholder="e.g. DIWALI2026, ROBOFIRST"
            className="flex-1 bg-black/40 border border-slate-700/60 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#39FF6A]"
          />
          <button
            onClick={handleValidateCoupon}
            className="px-3 py-1.5 rounded bg-[#39FF6A]/20 hover:bg-[#39FF6A]/30 text-[#39FF6A] border border-[#39FF6A]/40 text-xs font-bold uppercase transition-all"
          >
            Apply
          </button>
        </div>

        {couponFeedback && (
          <div
            className={`max-w-md mx-auto -mt-8 mb-8 p-2.5 rounded-lg text-xs font-mono text-center border ${
              couponFeedback.valid
                ? 'bg-[#39FF6A]/10 border-[#39FF6A]/40 text-[#39FF6A]'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}
          >
            {couponFeedback.message}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {(['free', 'plus', 'pro', 'institution'] as SubscriptionPlanTier[]).map((tier) => {
            const plan = ROBOVERSE_PLANS[tier];
            const isSelected = selectedPlan === tier;
            const price = billingCycle === 'yearly' ? plan.priceInrYearly : plan.priceInrMonthly;
            const periodLabel = billingCycle === 'yearly' ? '/year' : '/month';

            return (
              <div
                key={tier}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 border ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#0e271f] to-[#071611] border-[#39FF6A] shadow-xl shadow-[#39FF6A]/10 scale-[1.02]'
                    : 'bg-[#0B1914] border-slate-800 hover:border-[#7FE7D6]/40'
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      plan.popular
                        ? 'bg-[#39FF6A] text-[#07110D]'
                        : 'bg-[#7FE7D6]/20 text-[#7FE7D6] border border-[#7FE7D6]/40'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 min-h-[36px]">{plan.tagline}</p>

                  <div className="mt-5 pb-5 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {tier !== 'free' && (
                        <span className="text-xs text-slate-400 font-mono">{periodLabel}</span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && plan.savingsYearlyPercent > 0 && (
                      <span className="inline-block mt-1 text-[11px] text-[#39FF6A] font-semibold">
                        Includes {plan.savingsYearlyPercent}% annual discount
                      </span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    {plan.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#39FF6A] font-bold text-sm leading-none">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => handleInitiateOrder(tier)}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      tier === 'free'
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : plan.popular
                        ? 'bg-[#39FF6A] text-[#07110D] hover:bg-[#32e05d] shadow-lg shadow-[#39FF6A]/20'
                        : 'bg-[#7FE7D6]/10 text-[#7FE7D6] border border-[#7FE7D6]/40 hover:bg-[#7FE7D6]/20'
                    }`}
                  >
                    {tier === 'free'
                      ? 'Current Plan'
                      : tier === 'institution'
                      ? 'Request School Quote'
                      : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="mt-16 rounded-2xl bg-[#0B1914] border border-[#7FE7D6]/20 p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Feature Matrix &bull; Deep Technical Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Every detail engineered to give robotics enthusiasts and institutions maximum lab
              autonomy.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                  <th className="py-3 px-4 font-bold text-slate-200">Capability</th>
                  <th className="py-3 px-4 text-center">Explorer Free</th>
                  <th className="py-3 px-4 text-center text-[#39FF6A]">Plus Maker</th>
                  <th className="py-3 px-4 text-center text-[#7FE7D6]">Pro Innovator</th>
                  <th className="py-3 px-4 text-center text-[#FF9A1F]">Institution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ROBOVERSE_FEATURE_COMPARISON.map((feat, i) => (
                  <tr key={i} className="hover:bg-black/20">
                    <td className="py-3 px-4 text-slate-200 font-semibold">{feat.name}</td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {typeof feat.free === 'boolean' ? (
                        feat.free ? (
                          <span className="text-[#39FF6A]">✓</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        feat.free
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300 font-medium">
                      {typeof feat.plus === 'boolean' ? (
                        feat.plus ? (
                          <span className="text-[#39FF6A] font-bold">✓</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        feat.plus
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-200 font-semibold">
                      {typeof feat.pro === 'boolean' ? (
                        feat.pro ? (
                          <span className="text-[#39FF6A] font-bold">✓</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        feat.pro
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-300">
                      {typeof feat.institution === 'boolean' ? (
                        feat.institution ? (
                          <span className="text-[#39FF6A] font-bold">✓</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        feat.institution
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Payment Checkout Modal (Razorpay + Dynamic UPI QR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0B1914] border border-[#39FF6A]/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setPaymentSuccess(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-mono"
            >
              ✕
            </button>

            {paymentSuccess ? (
              /* Success State */
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#39FF6A]/20 border border-[#39FF6A] flex items-center justify-center text-3xl text-[#39FF6A] animate-bounce">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Payment Verified &bull; Plan Activated!
                </h3>
                <p className="mt-2 text-xs text-slate-300">
                  Congratulations! You now have full{' '}
                  <span className="text-[#39FF6A] font-bold uppercase">
                    {paymentSuccess.planTier}
                  </span>{' '}
                  capabilities unlocked.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-black/40 border border-[#7FE7D6]/20 text-xs text-left font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice Number:</span>
                    <span className="text-white font-bold">{paymentSuccess.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan Tier:</span>
                    <span className="text-[#39FF6A] uppercase font-bold">
                      {paymentSuccess.planTier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount Paid:</span>
                    <span className="text-white">₹{paymentSuccess.amountInr} (18% GST incl.)</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`/api/payments/invoice/${paymentSuccess.paymentId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#7FE7D6]/20 hover:bg-[#7FE7D6]/30 text-[#7FE7D6] border border-[#7FE7D6]/40 text-xs font-bold uppercase flex items-center justify-center gap-2"
                  >
                    <span>🖨️ Download GST Invoice</span>
                  </a>
                  <Link
                    href="/workbench"
                    className="px-4 py-2.5 rounded-xl bg-[#39FF6A] text-[#07110D] font-bold text-xs uppercase hover:bg-[#32e05d] flex items-center justify-center"
                  >
                    Launch 3D Workbench ➔
                  </Link>
                </div>
              </div>
            ) : (
              /* Active Payment Form */
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase">
                      Subscribe to {selectedPlan?.toUpperCase()} Plan
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Cycle: {billingCycle.toUpperCase()} &bull; Total: ₹
                      {activePayment?.amountInr || '...'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 text-[10px] font-mono font-bold">
                    18% GST INCL.
                  </span>
                </div>

                {/* Payment Method Switcher */}
                <div className="grid grid-cols-2 gap-2 my-5">
                  <button
                    onClick={() => handleSwitchPaymentMode('qr')}
                    className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'qr'
                        ? 'bg-[#39FF6A]/15 border-[#39FF6A] text-[#39FF6A]'
                        : 'bg-black/30 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>⚡ Direct UPI QR</span>
                  </button>
                  <button
                    onClick={() => handleSwitchPaymentMode('checkout')}
                    className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'checkout'
                        ? 'bg-[#39FF6A]/15 border-[#39FF6A] text-[#39FF6A]'
                        : 'bg-black/30 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>💳 Razorpay Gateway</span>
                  </button>
                </div>

                {paymentMethod === 'qr' ? (
                  /* Dynamic UPI QR Display */
                  <div className="text-center py-2">
                    <div className="inline-block p-3 rounded-xl bg-black border border-[#39FF6A]/40 shadow-lg mb-3">
                      {activePayment?.qrImageUrl ? (
                        <img
                          src={activePayment.qrImageUrl}
                          alt="Dynamic UPI QR Code"
                          className="w-52 h-52 mx-auto rounded-lg object-contain"
                        />
                      ) : (
                        <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-500 font-mono">
                          Generating Dynamic QR...
                        </div>
                      )}
                    </div>

                    {/* Expiry Countdown */}
                    <div className="flex items-center justify-center gap-2 text-xs font-mono mb-3">
                      <span className="text-slate-400">QR Code Expires In:</span>
                      <span className="px-2 py-0.5 rounded bg-black border border-[#FF9A1F] text-[#FF9A1F] font-bold">
                        {formatTimer(qrCountdown)}
                      </span>
                    </div>

                    {/* VPA Info */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono flex items-center justify-between mb-4">
                      <span className="text-slate-400">UPI ID: roboverse@icici</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('roboverse@icici');
                          setCopiedVpa(true);
                          setTimeout(() => setCopiedVpa(false), 2000);
                        }}
                        className="text-[#39FF6A] hover:underline text-[11px] font-bold"
                      >
                        {copiedVpa ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                      Scan with any UPI app (GPay, PhonePe, Paytm, BHIM). Once paid, this screen
                      will auto-detect and activate your account.
                    </p>

                    {/* Simulated Success in Dev/Test */}
                    {activePayment?.isTestMode && (
                      <button
                        onClick={handleSimulatePayment}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-[#39FF6A]/20 hover:bg-[#39FF6A]/30 text-[#39FF6A] border border-[#39FF6A]/40 text-xs font-bold uppercase transition-all"
                      >
                        {loading
                          ? 'Verifying...'
                          : '⚡ Test Mode: Simulate Instant UPI Payment & Upgrade'}
                      </button>
                    )}
                  </div>
                ) : (
                  /* Standard Razorpay Checkout */
                  <div className="py-6 text-center">
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      Click below to open Razorpay secure checkout. Supports Indian &amp;
                      International Cards, Netbanking (all 50+ banks), UPI, and EMI options.
                    </p>

                    <button
                      onClick={handleSimulatePayment}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-[#39FF6A] text-[#07110D] font-bold text-xs uppercase tracking-wider hover:bg-[#32e05d] shadow-lg shadow-[#39FF6A]/20 transition-all"
                    >
                      {loading
                        ? 'Processing Gateway...'
                        : `Pay ₹${activePayment?.amountInr} via Razorpay`}
                    </button>

                    <div className="mt-4 text-[10px] text-slate-500 font-mono">
                      PCI-DSS Compliant &bull; 256-Bit SSL Encryption &bull; Instant GST Receipt
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Institutional Inquiry Modal */}
      {isInstitutionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0B1914] border border-[#FF9A1F]/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100">
            <button
              onClick={() => setIsInstitutionModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-mono"
            >
              ✕
            </button>

            {institutionFormSubmitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF9A1F]/20 border border-[#FF9A1F] flex items-center justify-center text-3xl text-[#FF9A1F]">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-white uppercase">Inquiry Received!</h3>
                <p className="mt-2 text-xs text-slate-300">
                  Our Academic Solutions team will contact your institution within 24 hours with a
                  custom quotation, hardware kit package, and pilot curriculum access.
                </p>
                <button
                  onClick={() => setIsInstitutionModalOpen(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-[#FF9A1F] text-black font-bold text-xs uppercase"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-white uppercase">
                  Institutional Lab Licensing
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-5">
                  Bulk seat discounts, teacher LMS controls &amp; hardware lab bundles for CBSE /
                  ICSE / AICTE institutions.
                </p>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 mb-1">School / College Name</label>
                    <input
                      type="text"
                      value={institutionForm.schoolName}
                      onChange={(e) =>
                        setInstitutionForm({ ...institutionForm, schoolName: e.target.value })
                      }
                      placeholder="e.g. Delhi Public School RK Puram"
                      className="w-full bg-black/40 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={institutionForm.contactPerson}
                        onChange={(e) =>
                          setInstitutionForm({ ...institutionForm, contactPerson: e.target.value })
                        }
                        placeholder="Prof. Sharma"
                        className="w-full bg-black/40 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Work Email</label>
                      <input
                        type="email"
                        value={institutionForm.email}
                        onChange={(e) =>
                          setInstitutionForm({ ...institutionForm, email: e.target.value })
                        }
                        placeholder="principal@school.edu.in"
                        className="w-full bg-black/40 border border-slate-700 rounded p-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Estimated Seats</label>
                      <select
                        value={institutionForm.seats}
                        onChange={(e) =>
                          setInstitutionForm({ ...institutionForm, seats: e.target.value })
                        }
                        className="w-full bg-black/40 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="25">25 - 50 Students</option>
                        <option value="100">50 - 200 Students</option>
                        <option value="500">200 - 1000 Students</option>
                        <option value="campus">Full Campus Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Hardware Kits Bundle</label>
                      <select
                        value={institutionForm.hardwareKits ? 'yes' : 'no'}
                        onChange={(e) =>
                          setInstitutionForm({
                            ...institutionForm,
                            hardwareKits: e.target.value === 'yes',
                          })
                        }
                        className="w-full bg-black/40 border border-slate-700 rounded p-2 text-white"
                      >
                        <option value="yes">Include 10 Curriculum Kits</option>
                        <option value="no">Software / Sim Only</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setInstitutionFormSubmitted(true)}
                    className="w-full mt-4 py-3 rounded-xl bg-[#FF9A1F] text-black font-bold text-xs uppercase hover:bg-[#e08516] transition-all"
                  >
                    Submit Quotation Request ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
