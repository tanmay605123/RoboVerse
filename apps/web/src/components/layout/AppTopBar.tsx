'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Globe,
  Plus,
  Menu,
  Cpu,
  FolderPlus,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  Sliders,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { CommandPaletteModal } from './CommandPaletteModal';

interface AppTopBarProps {
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
}

export function AppTopBar({
  onToggleSidebar,
  onOpenMobileSidebar,
}: AppTopBarProps) {
  const router = useRouter();
  const { user, profile, studentIdCard, planTier, logout } = useAuthStore();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'EN' | 'HI'>('EN');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Top Timeline Scrubber State (date-range selector)
  const [scrubberValue, setScrubberValue] = useState(70);
  const [activeDateRange, setActiveDateRange] = useState<'1D' | '7D' | '1M' | 'ALL'>('7D');

  const createMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const studentName = profile?.fullName || 'Aarav Sharma';
  const studentId = studentIdCard?.studentId || 'RV-2026-000101';
  const currentPlan = planTier || 'PRO';

  return (
    <>
      <header className="sticky top-0 z-20 h-20 bg-[#07110D]/90 backdrop-blur-xl border-b border-[rgba(57,255,106,0.15)] px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Global Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-sm md:max-w-md">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-[#8FA99B] hover:text-[#39FF6A]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Rounded Futuristic Search Bar (Ctrl+K) */}
          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative w-full cursor-pointer"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA99B]" />
            <input
              id="global-search-input"
              type="text"
              readOnly
              placeholder={
                currentLang === 'EN'
                  ? 'Search circuits, robots, components, code...'
                  : 'सर्किट, रोबोट, कंपोनेंट, कोड खोजें...'
              }
              className="w-full pl-9 pr-14 py-2 rounded-full bg-[#040B08]/90 border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] text-xs font-mono text-[#EAF7EF] placeholder:text-[#527063] cursor-pointer transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <kbd className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-[#0E2A1F] border border-[rgba(57,255,106,0.2)] text-[#8FA99B] font-bold">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Center: Top Timeline Scrubber strip (date-range selector) */}
        <div className="hidden xl:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#040B08]/80 border border-[rgba(57,255,106,0.18)] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#39FF6A] text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>RANGE:</span>
          </div>

          {/* Scrubber slider track with highlighted green active range */}
          <div className="relative w-44 h-3 bg-[#07150F] rounded-full border border-[rgba(57,255,106,0.15)] flex items-center px-1">
            {/* Highlighted active date range band */}
            <div
              className="absolute left-[30%] w-[45%] h-full bg-[#39FF6A]/20 border-x border-[#39FF6A]/60 rounded"
              title="Active Analysis Window"
            />
            {/* Scrubber playhead */}
            <div
              className="absolute h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] rounded-full shadow-[0_0_8px_rgba(57,255,106,0.5)]"
              style={{ width: `${scrubberValue}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={scrubberValue}
              onChange={(e) => setScrubberValue(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1">
            {(['1D', '7D', '1M', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setActiveDateRange(range);
                  if (range === '1D') setScrubberValue(25);
                  else if (range === '7D') setScrubberValue(50);
                  else if (range === '1M') setScrubberValue(75);
                  else setScrubberValue(100);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  activeDateRange === range
                    ? 'bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/40 shadow-[0_0_6px_rgba(57,255,106,0.3)]'
                    : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions, Notifications, Language, User Card & "+ Create" */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setCurrentLang(currentLang === 'EN' ? 'HI' : 'EN')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E2A1F]/80 text-xs font-mono font-semibold text-[#CBD8D0] hover:text-[#39FF6A] transition-colors border border-[rgba(57,255,106,0.15)]"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#8FA99B]" />
              <span>{currentLang === 'EN' ? 'EN' : 'हिन्दी'}</span>
            </button>
          </div>

          {/* Notifications Icon with Glowing Pulse Badge */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-[#0E2A1F]/80 text-[#8FA99B] hover:text-[#39FF6A] border border-[rgba(57,255,106,0.15)] transition-colors"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#39FF6A] animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#39FF6A] shadow-[0_0_6px_#39FF6A]" />
            </button>

            {/* Notifications Dropdown in Dark Glass */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-[#0A1F17]/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(57,255,106,0.25)] p-4 z-50 backdrop-blur-2xl animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(57,255,106,0.12)]">
                  <h4 className="text-sm font-bold text-[#EAF7EF]">System Telemetry</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]">
                    2 Alerts
                  </span>
                </div>
                <div className="py-2 space-y-2">
                  <div className="p-2.5 rounded-xl bg-[rgba(57,255,106,0.06)] border border-[rgba(57,255,106,0.2)]">
                    <p className="text-xs font-semibold text-[#EAF7EF] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A]" />
                      National Rover Challenge 2026
                    </p>
                    <p className="text-[11px] text-[#8FA99B] mt-0.5">Registration closes in 5 days! Form a team now.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[rgba(255,154,31,0.08)] border border-[rgba(255,154,31,0.25)]">
                    <p className="text-xs font-semibold text-[#FF9A1F] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF9A1F]" />
                      Rituu Diagnostic Alert
                    </p>
                    <p className="text-[11px] text-[#8FA99B] mt-0.5">Ultrasonic radar circuit nodal analysis complete.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Identity Pill (Avatar + Name + Student ID) */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[#0E2A1F]/80 border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#39FF6A] to-[#7FE7D6] flex items-center justify-center text-[#07110D] font-black text-xs shadow-[0_0_8px_rgba(57,255,106,0.3)]">
                {studentName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-[#EAF7EF] leading-tight">
                  {studentName}
                </span>
                <span className="text-[10px] font-mono text-[#8FA99B] leading-none">
                  {studentId}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8FA99B]" />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#0A1F17]/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(57,255,106,0.25)] py-2 z-50 backdrop-blur-2xl animate-slide-up">
                <div className="px-4 py-2 border-b border-[rgba(57,255,106,0.12)]">
                  <p className="text-xs font-bold text-[#EAF7EF]">{studentName}</p>
                  <p className="text-[11px] text-[#8FA99B] font-mono">{studentId}</p>
                  <div className="mt-1.5">
                    <span className="text-[9.5px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A]">
                      {currentPlan} Member
                    </span>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#CBD8D0] hover:text-[#39FF6A] hover:bg-white/5"
                  >
                    <User className="w-3.5 h-3.5 text-[#8FA99B]" /> Profile & Passport
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#CBD8D0] hover:text-[#39FF6A] hover:bg-white/5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#8FA99B]" /> Control Room Operations
                  </Link>
                </div>
                <div className="pt-1 border-t border-[rgba(57,255,106,0.12)]">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#FF4D4D] hover:bg-red-950/20 text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prominent Neon-Green "+ Create" Button with Dropdown */}
          <div className="relative" ref={createMenuRef}>
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] text-xs md:text-sm font-extrabold shadow-[0_0_16px_rgba(57,255,106,0.45)] hover:shadow-[0_0_24px_rgba(57,255,106,0.65)] hover:brightness-105 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {/* Create Dropdown Menu */}
            {showCreateMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#0A1F17]/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(57,255,106,0.25)] py-2 z-50 backdrop-blur-2xl animate-slide-up">
                <Link
                  href="/workbench"
                  onClick={() => setShowCreateMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#EAF7EF] hover:bg-[rgba(57,255,106,0.10)] group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] flex items-center justify-center text-[#39FF6A]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">New Circuit</p>
                    <p className="text-[10px] text-[#8FA99B]">Launch 3D workshop</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard?action=new-project"
                  onClick={() => setShowCreateMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#EAF7EF] hover:bg-[rgba(127,231,214,0.10)] group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[rgba(127,231,214,0.15)] border border-[rgba(127,231,214,0.3)] flex items-center justify-center text-[#7FE7D6]">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">New Project</p>
                    <p className="text-[10px] text-[#8FA99B]">Arduino or robot design</p>
                  </div>
                </Link>
                <Link
                  href="/rituu"
                  onClick={() => setShowCreateMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#EAF7EF] hover:bg-purple-950/40 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Ask Rituu</p>
                    <p className="text-[10px] text-[#8FA99B]">Debug circuit from photo</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
