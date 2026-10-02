'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { ShieldCheck, Heart, Github, Twitter, Youtube, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#040B08] border-t border-robo-borderSubtle text-robo-textSecondary text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="horizontal" size="md" />
            <p className="text-sm text-robo-textMuted max-w-sm leading-relaxed">
              RoboVerse is India’s premier 3D robotics and electronics learning platform. 
              Enabling students to design, simulate, and build real-world robots with 
              browser-based MNA engines and specialized AI guidance.
            </p>
            <div className="flex items-center gap-3 pt-2 text-robo-textSecondary">
              <span className="p-2 rounded-lg bg-robo-surfaceRaised border border-robo-borderSubtle hover:text-robo-neon cursor-pointer">
                <Twitter className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-robo-surfaceRaised border border-robo-borderSubtle hover:text-robo-neon cursor-pointer">
                <Youtube className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-robo-surfaceRaised border border-robo-borderSubtle hover:text-robo-neon cursor-pointer">
                <Github className="w-4 h-4" />
              </span>
              <span className="p-2 rounded-lg bg-robo-surfaceRaised border border-robo-borderSubtle hover:text-robo-neon cursor-pointer">
                <Mail className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Links Column 1: Simulator */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-robo-text uppercase tracking-wider">
              3D Simulator
            </h4>
            <ul className="space-y-2">
              <li><Link href="/#workbench" className="hover:text-robo-neon">3D Circuit Workbench</Link></li>
              <li><Link href="/#workbench" className="hover:text-robo-neon">Arduino Uno Emulation</Link></li>
              <li><Link href="/#workbench" className="hover:text-robo-neon">ESP32 & Sensors</Link></li>
              <li><Link href="/#workbench" className="hover:text-robo-neon">Short-Circuit Diagnostics</Link></li>
              <li><Link href="/#workbench" className="hover:text-robo-neon">3D Robot Builder</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Learning */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-robo-text uppercase tracking-wider">
              Curriculum & AI
            </h4>
            <ul className="space-y-2">
              <li><Link href="/#roadmap" className="hover:text-robo-neon">Beginner to ROS Roadmap</Link></li>
              <li><Link href="/#rituu" className="hover:text-robo-neon">Rituu AI Circuit Copilot</Link></li>
              <li><Link href="/#pricing" className="hover:text-robo-neon">Live Guided Classes</Link></li>
              <li><Link href="/#hackathons" className="hover:text-robo-neon">National Hackathon Hub</Link></li>
              <li><Link href="/#pricing" className="hover:text-robo-neon">Institution & ATL Plans</Link></li>
            </ul>
          </div>

          {/* Links Column 3: TechSavyyy */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-robo-text uppercase tracking-wider">
              Ecosystem
            </h4>
            <ul className="space-y-2">
              <li><Link href="/#store" className="hover:text-robo-neon">TechSavyyy Hardware Store</Link></li>
              <li><Link href="/#store" className="hover:text-robo-neon">1-Click BOM Checkout</Link></li>
              <li><Link href="/#store" className="hover:text-robo-neon">Nearby Component Shops</Link></li>
              <li><Link href="/dashboard" className="hover:text-robo-neon">Digital Student ID Card</Link></li>
              <li><Link href="/dashboard" className="hover:text-robo-neon">Verify Credentials</Link></li>
            </ul>
          </div>
        </div>

        {/* Corporate Legal, GST & Minor Protection Disclosure */}
        <div className="pt-8 border-t border-robo-borderSubtle/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-robo-textMuted">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© 2026 RoboVerse Technologies Pvt Ltd. All rights reserved.</span>
            <span>GSTIN: 07AABCR9920A1Z2</span>
            <span>HSN: 999293 (Educational Services)</span>
            <span className="flex items-center gap-1 text-robo-teal">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Minor Safety & COPPA Compliant</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-robo-neon">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-robo-neon">Terms of Service</Link>
            <Link href="/refund" className="hover:text-robo-neon">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
