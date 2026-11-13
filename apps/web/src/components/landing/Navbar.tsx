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
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#07110D]/90 backdrop-blur-xl border-b border-[rgba(57,255,106,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Logo variant="horizontal" size="md" />

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#CBD8D0]">
          <Link href="/workbench" className="hover:text-[#39FF6A] transition-colors">
            {lang === 'EN' ? 'Circuit Lab' : 'सर्किट लैब'}
          </Link>
          <Link href="/roadmap" className="hover:text-[#39FF6A] transition-colors">
            {lang === 'EN' ? 'Curriculum' : 'पाठ्यक्रम'}
          </Link>
          <Link href="/rituu" className="hover:text-[#39FF6A] transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#39FF6A] animate-pulse" />
            <span>Rituu AI</span>
          </Link>
          <Link href="/hackathons" className="hover:text-[#39FF6A] transition-colors">
            {lang === 'EN' ? 'Hackathons' : 'हैकथॉन'}
          </Link>
          <Link href="/shops" className="hover:text-[#39FF6A] transition-colors">
            {lang === 'EN' ? 'Nearby Shops' : 'पार्ट्स की दुकानें'}
          </Link>
          <Link href="/store" className="hover:text-[#39FF6A] transition-colors">
            TechSavyyy Store
          </Link>
          <Link href="/#pricing" className="hover:text-[#39FF6A] transition-colors">
            {lang === 'EN' ? 'Pricing' : 'मूल्य'}
          </Link>
        </div>

        {/* Right Action Items */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Language Switcher (EN / HI) */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
            className="flex items-center gap-1 text-xs font-mono font-semibold text-[#8FA99B] hover:text-[#39FF6A] px-2.5 py-1.5 rounded-full bg-[#0E2A1F]/80 border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#39FF6A]" />
            <span>{lang}</span>
          </button>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0E2A1F] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] hover:bg-[#39FF6A] hover:text-[#07110D] transition-all font-bold text-sm shadow-[0_0_12px_rgba(57,255,106,0.25)]"
            >
              <User className="w-4 h-4" />
              <span>{profile?.fullName || studentIdCard?.studentId || 'Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-[#EAF7EF] hover:text-[#39FF6A] transition-colors px-3 py-2 font-mono"
              >
                {lang === 'EN' ? 'Log In' : 'लॉग इन'}
              </Link>
              <Link
                href="/register"
                className="btn-primary-neon px-5 py-2.5 text-sm font-bold shadow-neon-pill flex items-center gap-1.5"
              >
                <span>{lang === 'EN' ? 'Start Free' : 'शुरू करें'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#8FA99B] hover:text-[#39FF6A]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 bg-[#07110D]/95 border-b border-[rgba(57,255,106,0.15)] backdrop-blur-2xl flex flex-col gap-4 text-sm font-bold">
          <Link
            href="/workbench"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#EAF7EF] hover:text-[#39FF6A]"
          >
            Circuit Lab
          </Link>
          <Link
            href="/roadmap"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#EAF7EF] hover:text-[#39FF6A]"
          >
            Curriculum
          </Link>
          <Link
            href="/rituu"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#EAF7EF] hover:text-[#39FF6A]"
          >
            Rituu AI Mentor
          </Link>
          <Link
            href="/hackathons"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#EAF7EF] hover:text-[#39FF6A]"
          >
            Hackathons
          </Link>
          <Link
            href="/shops"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#EAF7EF] hover:text-[#39FF6A]"
          >
            Nearby Shops
          </Link>
          <Link
            href="/store"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#EAF7EF] hover:text-[#39FF6A]"
          >
            TechSavyyy Store
          </Link>
          <div className="pt-2 border-t border-[rgba(57,255,106,0.15)] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-[#EAF7EF] font-bold"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary-neon text-center py-2.5 font-bold shadow-neon-pill"
            >
              Start Building Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}