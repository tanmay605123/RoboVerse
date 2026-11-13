'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Building2, Shield, ArrowRight } from 'lucide-react';
import { BillingCycle } from '@roboverse/shared';

export function Pricing3DSection() {
  const [cycle, setCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);

  const getPrice = (monthly: number, quarterly: number, yearly: number) => {
    if (cycle === BillingCycle.QUARTERLY) return { price: quarterly, period: '/ quarter', note: 'billed quarterly' };
    if (cycle === BillingCycle.YEARLY) return { price: yearly, period: '/ year', note: 'billed annually' };
    return { price: monthly, period: '/ month', note: 'billed monthly' };
  };

  const plusPricing = getPrice(299, 749, 2499);
  const proPricing = getPrice(999, 2699, 8999);

  return (
    <section id="pricing" className="py-20 md:py-28 relative overflow-hidden bg-robo-bg">
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-robo-neon/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-robo-surfaceRaised border border-robo-borderSubtle text-robo-neon text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5 fill-robo-neon" />
            <span>TRANSPARENT VALUE-FIRST PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans">
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-robo-neon to-robo-teal">
              Robotics Trajectory
            </span>
          </h2>
          <p className="text-base sm:text-lg text-robo-textSecondary mt-4">
            Always open and free for all students. Upgrade for advanced tools, live mentor classes, and national hackathon prep.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-robo-surface border border-robo-borderSubtle">
            <button
              onClick={() => setCycle(BillingCycle.MONTHLY)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                cycle === BillingCycle.MONTHLY
                  ? 'bg-robo-neon text-black shadow-neon-subtle'
                  : 'text-robo-textSecondary hover:text-robo-text'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle(BillingCycle.QUARTERLY)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                cycle === BillingCycle.QUARTERLY
                  ? 'bg-robo-neon text-black shadow-neon-subtle'
                  : 'text-robo-textSecondary hover:text-robo-text'
              }`}
            >
              Quarterly
              <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 font-bold">Save ~16%</span>
            </button>
            <button
              onClick={() => setCycle(BillingCycle.YEARLY)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
                cycle === BillingCycle.YEARLY
                  ? 'bg-robo-neon text-black shadow-neon-subtle'
                  : 'text-robo-textSecondary hover:text-robo-text'
              }`}
            >
              Yearly
              <span className="ml-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 font-bold">Save ~30%</span>
            </button>
          </div>

          <div className="text-xs font-mono text-robo-teal mt-2">
            ✓ All prices INCLUDE 18% GST • 7-Day Money-Back Guarantee
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Card 1: FREE */}
          <div className="rounded-2xl glass-panel p-7 flex flex-col justify-between border-robo-borderSubtle transition-all duration-300 hover:border-robo-neon/40">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/50 text-robo-textMuted border border-robo-borderSubtle">
                  STARTER
                </span>
              </div>
              <h3 className="text-xl font-bold font-sans text-robo-text">Free Explorer</h3>
              <p className="text-xs text-robo-textSecondary mt-1 min-h-[36px]">
                Open for everyone building circuits and learning robotics.
              </p>

              <div className="my-6">
                <div className="text-4xl font-extrabold font-mono text-robo-text">₹0</div>
                <div className="text-xs text-robo-textMuted mt-1">Free forever • No card required</div>
              </div>

              <div className="space-y-3 pt-6 border-t border-robo-borderSubtle/50 text-xs text-robo-textSecondary">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>3D circuit workbench & basic parts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Up to 5 saved public projects</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Arduino basics & coding lessons</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Rituu AI: 15 msgs/day, 3 photo scans/day</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Digital Student ID & Learning Passport</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Community forum & local shop locator</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/register"
                className="w-full block text-center py-3 rounded-xl border border-robo-borderSubtle text-robo-text font-bold text-sm hover:border-robo-neon hover:text-robo-neon transition-colors"
              >
                Join Free
              </Link>
            </div>
          </div>

          {/* Card 2: PLUS */}
          <div className="rounded-2xl glass-panel p-7 flex flex-col justify-between border-robo-borderSubtle transition-all duration-300 hover:border-robo-neon/40">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/50 text-robo-teal border border-robo-teal/30">
                  SELF-LEARNER
                </span>
              </div>
              <h3 className="text-xl font-bold font-sans text-robo-text">Plus</h3>
              <p className="text-xs text-robo-textSecondary mt-1 min-h-[36px]">
                For independent builders needing the full 3D component library.
              </p>

              <div className="my-6">
                <div className="text-4xl font-extrabold font-mono text-robo-neon">
                  ₹{plusPricing.price}
                </div>
                <div className="text-xs text-robo-textMuted mt-1">
                  {plusPricing.period} ({plusPricing.note})
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-robo-borderSubtle/50 text-xs text-robo-textSecondary">
                <div className="flex items-start gap-2 font-semibold text-robo-text">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Everything in Free, plus:</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Unlimited private & public saved circuits</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Full component library (ESP32, Pico, sensors)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Oscilloscope, multimeter & 3D robot builder</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Rituu AI: 100 msgs/day, 20 photo analyses/day</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>5% discount on TechSavyyy store</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Verified course completion certificates</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/register?plan=PLUS"
                className="w-full block text-center py-3 rounded-xl bg-robo-surfaceRaised border border-robo-borderHighlight text-robo-neon font-bold text-sm hover:bg-robo-neon hover:text-black transition-all"
              >
                Choose Plus
              </Link>
            </div>
          </div>

          {/* Card 3: PRO (POPULAR) */}
          <div className="rounded-2xl glass-panel p-7 flex flex-col justify-between border-2 border-robo-neon shadow-neon-glow relative bg-[#092218]/90">
            {/* Popular Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-robo-neon to-robo-teal text-black text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              Most Popular • Guided
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/60 text-robo-neon border border-robo-neon/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>LIVE CLASSES</span>
                </span>
              </div>
              <h3 className="text-2xl font-extrabold font-sans text-robo-text">Pro Guided</h3>
              <p className="text-xs text-robo-textSecondary mt-1 min-h-[36px]">
                Live masterclasses, real guided hardware projects & hackathon prep.
              </p>

              <div className="my-6">
                <div className="text-4xl font-extrabold font-mono text-robo-neon">
                  ₹{proPricing.price}
                </div>
                <div className="text-xs text-robo-textMuted mt-1">
                  {proPricing.period} ({proPricing.note})
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-robo-borderHighlight/40 text-xs text-robo-text">
                <div className="flex items-start gap-2 font-bold text-robo-neon">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Everything in Plus, plus:</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span className="font-semibold">8+ Live online classes/mo + doubt sessions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Real-life projects with mentor review & grading</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Machine learning for robotics track (ROS, CV)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>National hackathon prep (mock rounds, pitch prep)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>Fair-use unlimited Rituu (300 msgs/day, 50 photos)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-neon shrink-0 mt-0.5" />
                  <span>10% discount on TechSavyyy store + priority support</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <Link
                href="/register?plan=PRO&trial=true"
                className="w-full block text-center py-3.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 transition-all"
              >
                Start 7-Day Free Trial
              </Link>
              <div className="text-[10px] text-center text-robo-textMuted font-mono">
                Mandate setup required • Cancel anytime in 1 click
              </div>
            </div>
          </div>

          {/* Card 4: INSTITUTION */}
          <div className="rounded-2xl glass-panel p-7 flex flex-col justify-between border-robo-borderSubtle transition-all duration-300 hover:border-robo-teal/40">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/50 text-robo-teal border border-robo-borderSubtle">
                  SCHOOLS & COLLEGES
                </span>
              </div>
              <h3 className="text-xl font-bold font-sans text-robo-text">Institution</h3>
              <p className="text-xs text-robo-textSecondary mt-1 min-h-[36px]">
                For schools, colleges, and Atal Tinkering Labs (ATLs).
              </p>

              <div className="my-6">
                <div className="text-4xl font-extrabold font-mono text-robo-teal">₹499</div>
                <div className="text-xs text-robo-textMuted mt-1">
                  per student / year (min 50 students)
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-robo-borderSubtle/50 text-xs text-robo-textSecondary">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-teal shrink-0 mt-0.5" />
                  <span>Dedicated teacher & admin dashboard</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-teal shrink-0 mt-0.5" />
                  <span>Batch management & assignment grading</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-teal shrink-0 mt-0.5" />
                  <span>Bulk Student ID generation & passports</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-teal shrink-0 mt-0.5" />
                  <span>Full 3D simulator & component library</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-teal shrink-0 mt-0.5" />
                  <span>Free 3-month classroom trial for teachers</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-robo-teal shrink-0 mt-0.5" />
                  <span>Custom curriculum integration & reports</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/register?plan=INSTITUTION"
                className="w-full block text-center py-3 rounded-xl border border-robo-borderSubtle text-robo-text font-bold text-sm hover:border-robo-teal hover:text-robo-teal transition-colors"
              >
                Request School Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing Comparison Benchmark Callout */}
        <div className="mt-14 p-6 rounded-2xl glass-panel border border-robo-borderHighlight/30 text-xs text-robo-textSecondary flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-robo-teal shrink-0" />
            <div>
              <span className="font-bold text-robo-text">Market Comparison: </span>
              Standalone circuit simulators typically charge $7–25/month for simulation alone, and private robotics tutors charge ₹400–700/hour. RoboVerse bundles 3D simulation, avr8js MCU compilation, 8+ live classes, and AI copilot for ₹999/month.
            </div>
          </div>
          <Link
            href="/register"
            className="shrink-0 px-4 py-2 rounded-xl bg-robo-surfaceRaised border border-robo-neon text-robo-neon font-mono text-xs hover:bg-robo-neon hover:text-black transition-colors"
          >
            Start Free Forever
          </Link>
        </div>
      </div>
    </section>
  );
}
