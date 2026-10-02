'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { Menu, X, Globe, Sparkles, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const { isAuthenticated, user, profile, studentIdCard } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-robo-bg/80 backdrop-blur-xl border-b border-robo-borderSubtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Logo variant="horizontal" size="md" />

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-robo-textSecondary">
          <Link href="/workbench" className="hover:text-robo-neon transition-colors">
            {lang === 'EN' ? '3D Workbench' : '3D वर्कबेंच'}
          </Link>
          <Link href="/roadmap" className="hover:text-robo-neon transition-colors">
            {lang === 'EN' ? 'Curriculum' : 'पाठ्यक्रम'}
          </Link>
          <Link href="/rituu" className="hover:text-robo-neon transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-robo-teal animate-pulse" />
            <span>Rituu AI</span>
          </Link>
          <Link href="/hackathons" className="hover:text-robo-neon transition-colors">
            {lang === 'EN' ? 'Hackathons' : 'हैकथॉन'}
          </Link>
          <Link href="/shops" className="hover:text-robo-neon transition-colors">
            {lang === 'EN' ? 'Nearby Shops' : 'पार्ट्स दुकानें'}
          </Link>
          <Link href="/store" className="hover:text-robo-neon transition-colors">
            TechSavyyy Store
          </Link>
          <Link href="/#pricing" className="hover:text-robo-neon transition-colors">
            {lang === 'EN' ? 'Pricing' : 'मूल्य निर्धारण'}
          </Link>
        </div>

        {/* Right Action Items */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Language Switcher (EN / HI) */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
            className="flex items-center gap-1 text-xs font-mono text-robo-textSecondary hover:text-robo-neon px-2.5 py-1.5 rounded-lg border border-robo-borderSubtle hover:border-robo-neon/40 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-robo-teal" />
            <span>{lang}</span>
          </button>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-robo-surfaceRaised border border-robo-neon text-robo-neon hover:bg-robo-neon hover:text-black transition-all font-semibold text-sm shadow-neon-subtle"
            >
              <User className="w-4 h-4" />
              <span>{profile?.fullName || studentIdCard?.studentId || 'Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-robo-text hover:text-robo-neon transition-colors px-3 py-2"
              >
                {lang === 'EN' ? 'Log In' : 'लॉग इन'}
              </Link>
              <Link
                href="/register"
                className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-bold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>{lang === 'EN' ? 'Start Building Free' : 'मुफ़्त शुरू करें'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-robo-textSecondary hover:text-robo-neon"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 bg-[#07110D]/95 border-b border-robo-borderSubtle backdrop-blur-2xl flex flex-col gap-4 text-base">
          <Link
            href="/workbench"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-robo-neon py-1"
          >
            3D Circuit Workbench
          </Link>
          <Link
            href="/roadmap"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-robo-neon py-1"
          >
            Curriculum Roadmap
          </Link>
          <Link
            href="/rituu"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-robo-neon py-1 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-robo-teal" />
            <span>Rituu AI Assistant</span>
          </Link>
          <Link
            href="/hackathons"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-robo-neon py-1"
          >
            Robotics Hackathons
          </Link>
          <Link
            href="/shops"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-robo-neon py-1"
          >
            Nearby Component Shops
          </Link>
          <Link
            href="/store"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-robo-neon py-1"
          >
            TechSavyyy Store
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-robo-neon py-1"
          >
            Plans & Pricing
          </Link>

          <div className="pt-4 border-t border-robo-borderSubtle flex flex-col gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-robo-neon text-black font-bold"
              >
                Go to Student Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-robo-borderSubtle text-robo-text font-semibold hover:border-robo-neon"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-robo-neon text-black font-bold shadow-neon-glow"
                >
                  Start Building Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
