'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, ShieldCheck, Zap, Play, Sparkles } from 'lucide-react';
import { RobotArmScene } from '../3d/RobotArmScene';

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden hud-grid-bg">
      {/* Background Volumetric Glow Highlights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-robo-neon/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-robo-teal/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-6 z-10">
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-robo-surfaceRaised border border-robo-borderHighlight/50 text-robo-neon text-xs font-mono mb-6 shadow-neon-subtle"
            >
              <Zap className="w-3.5 h-3.5 fill-robo-neon" />
              <span>LEARN IT • BUILD IT • SIMULATE IT</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              The 3D Robotics & Circuits Platform{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-robo-neon via-robo-teal to-robo-neonHover">
                Built for Future Engineers
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-robo-textSecondary leading-relaxed mb-8 max-w-xl"
            >
              Assemble real 3D breadboards, test with real-time modified-nodal electrical simulation, 
              run Arduino sketches in the browser, and build competitive hackathon robots with guidance 
              from <span className="text-robo-teal font-semibold">Rituu</span>, our specialized robotics AI.
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
                className="group px-7 py-3.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-base shadow-neon-glow hover:shadow-[0_0_32px_rgba(57,255,106,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Start Building Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/#workbench"
                className="px-6 py-3.5 rounded-xl glass-panel glass-panel-hover text-robo-text font-semibold text-base flex items-center gap-2 border border-robo-borderSubtle"
              >
                <Play className="w-4 h-4 text-robo-teal fill-robo-teal" />
                <span>Explore 3D Simulator</span>
              </Link>
            </motion.div>

            {/* Trust Markers & Micro Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-robo-borderSubtle/60"
            >
              <div>
                <div className="text-2xl font-bold font-mono text-robo-neon">₹0</div>
                <div className="text-xs text-robo-textMuted mt-0.5">Free for All Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-robo-teal">60 FPS</div>
                <div className="text-xs text-robo-textMuted mt-0.5">Real-time MNA Engine</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-robo-text">48,000+</div>
                <div className="text-xs text-robo-textMuted mt-0.5">Circuits Simulated</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Interactive Robot Arm Canvas */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full h-[460px] md:h-[620px] rounded-3xl glass-panel overflow-hidden border border-robo-borderHighlight/40 shadow-2xl">
              <RobotArmScene />

              {/* HUD Floating telemetry cards */}
              <div className="absolute top-4 right-4 glass-panel px-3 py-2 border border-robo-teal/30 rounded-xl shadow-lg pointer-events-none hidden sm:block">
                <div className="flex items-center gap-2 text-xs font-mono text-robo-teal">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AVR8JS EMULATOR: 16MHz</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 glass-panel px-3 py-2 border border-robo-neon/30 rounded-xl shadow-lg pointer-events-none hidden sm:block">
                <div className="flex items-center gap-2 text-xs font-mono text-robo-neon">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SHORT-CIRCUIT SENSOR: ARMED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
