'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, ShieldCheck, Zap, Play, Sparkles } from 'lucide-react';
import { RobotArmScene } from '../3d/RobotArmScene';

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-[#07110D]">
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#39FF6A]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#7FE7D6]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-[#0E2A1F]/80 rounded-full blur-[120px] pointer-events-none" />
      {/* Subtle grid floor overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#39FF6A_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-6 z-10">
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A] text-xs font-mono font-bold mb-6 shadow-[0_0_12px_rgba(57,255,106,0.2)]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>LEARN IT • BUILD IT • SIMULATE IT</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-[#EAF7EF]"
            >
              The 3D Robotics & Circuits Platform{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF6A] via-[#7FE7D6] to-[#2BD95B] drop-shadow-[0_0_20px_rgba(57,255,106,0.4)]">
                Built for Future Inventors
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#CBD8D0] leading-relaxed mb-8 max-w-xl font-normal"
            >
              Assemble real 2D & 3D circuits, test with real-time electrical nodal simulation, 
              run Arduino sketches in the browser, and build competitive hackathon robots with guidance 
              from <span className="text-[#39FF6A] font-bold">Rituu</span>, your specialized robotics AI mentor.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-10"
            >
              <Link
                href="/register"
                className="btn-primary-neon px-7 py-3.5 text-base font-bold flex items-center gap-2 shadow-neon-pill"
              >
                <span>Start Building Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/workbench"
                className="btn-secondary-white px-6 py-3.5 text-base font-bold flex items-center gap-2 border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] transition-colors"
              >
                <Play className="w-4 h-4 text-[#39FF6A] fill-[#39FF6A]" />
                <span>Launch Circuit Lab</span>
              </Link>
            </motion.div>

            {/* Trust Markers & Micro Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-[rgba(57,255,106,0.15)] font-mono"
            >
              <div>
                <div className="text-2xl font-black text-[#39FF6A] drop-shadow-[0_0_8px_rgba(57,255,106,0.4)]">₹0</div>
                <div className="text-xs text-[#8FA99B] mt-0.5 font-medium">Free for All Students</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#EAF7EF]">60 FPS</div>
                <div className="text-xs text-[#8FA99B] mt-0.5 font-medium">Real-time MNA Engine</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#EAF7EF]">48,000+</div>
                <div className="text-xs text-[#8FA99B] mt-0.5 font-medium">Circuits Simulated</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive 3D Robot Arm & Breadboard Canvas Preview */}
          <div className="lg:col-span-6 z-10 flex items-center justify-center">
            <div className="w-full h-[420px] sm:h-[480px] rounded-[24px] overflow-hidden glass-card bg-[#040B08]/90 border border-[rgba(57,255,106,0.25)] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
              <RobotArmScene />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#07110D]/90 backdrop-blur-md border border-[rgba(57,255,106,0.25)] flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] animate-ping" />
                  <span className="text-xs font-bold text-[#EAF7EF]">
                    Live 3D Simulation Active
                  </span>
                </div>
                <Link
                  href="/workbench"
                  className="text-xs font-bold text-[#39FF6A] hover:underline flex items-center gap-1 font-mono"
                >
                  Enter Workshop <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}