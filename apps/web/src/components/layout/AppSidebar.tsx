'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../brand/Logo';
import {
  Home,
  GraduationCap,
  Cpu,
  Bot,
  FolderGit2,
  Bookmark,
  BookOpen,
  Award,
  Sparkles,
  Trophy,
  MapPin,
  ShoppingBag,
  Users,
  CreditCard,
  Settings,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X,
  LogIn,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  isNew?: boolean;
}

interface NavSection {
  sectionLabel: string;
  items: NavItem[];
}

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user, profile, entitlements, projectCount, isAuthenticated } = useAuthStore();

  const sections: NavSection[] = [
    {
      sectionLabel: 'MAIN',
      items: [
        { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
        { id: 'classes', label: 'Classes', icon: GraduationCap, href: '/classes' },
        { id: 'circuit-lab', label: 'Circuit Lab', icon: Cpu, href: '/workbench', badge: '3D' },
        { id: 'robot-lab', label: 'Robot Design Lab', icon: Bot, href: '/robot-lab', badge: 'Sim' },
        { id: 'projects', label: 'Projects', icon: FolderGit2, href: '/dashboard?tab=projects', badge: projectCount > 0 ? String(projectCount) : undefined },
        { id: 'collections', label: 'Collections', icon: Bookmark, href: '/dashboard?tab=collections' },
      ],
    },
    {
      sectionLabel: 'LEARNING & AI',
      items: [
        { id: 'tutorials', label: 'Tutorials', icon: BookOpen, href: '/roadmap' },
        { id: 'challenges', label: 'Challenges', icon: Award, href: '/challenges', badge: 'New' },
        { id: 'rituu', label: 'Rituu AI', icon: Sparkles, href: '/rituu', badge: 'AI' },
      ],
    },
    {
      sectionLabel: 'COMMUNITY & HARDWARE',
      items: [
        { id: 'hackathons', label: 'Events & Hackathons', icon: Trophy, href: '/hackathons' },
        { id: 'shops', label: 'Nearby Shops', icon: MapPin, href: '/shops' },
        { id: 'store', label: 'TechSavyyy Store', icon: ShoppingBag, href: '/store' },
        { id: 'community', label: 'Community', icon: Users, href: '/dashboard?tab=community' },
        { id: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard?tab=certificates' },
        { id: 'plans', label: 'Plans & Pricing', icon: CreditCard, href: '/dashboard?tab=plans' },
      ],
    },
    {
      sectionLabel: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
        { id: 'documentation', label: 'Documentation', icon: FileText, href: '/docs' },
        { id: 'help', label: 'Help Center', icon: HelpCircle, href: '/help' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#07110D]/95 backdrop-blur-xl border-r border-[rgba(57,255,106,0.15)] transition-all duration-200">
      {/* Top Header & Logo */}
      <div className="flex items-center justify-between px-4 h-20 border-b border-[rgba(57,255,106,0.10)] shrink-0">
        {!isCollapsed ? (
          <Logo variant="horizontal" size="md" />
        ) : (
          <Logo variant="icon" size="sm" />
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-[rgba(57,255,106,0.06)] border border-[rgba(57,255,106,0.15)] text-[#8FA99B] hover:text-[#39FF6A] hover:border-[#39FF6A] transition-all"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-2 text-[#8FA99B] hover:text-[#39FF6A]"
          aria-label="Close mobile navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.sectionLabel} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8FA99B]">
                {section.sectionLabel}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href) && item.href !== '/');

              return (
                <div key={item.id} className="relative group">
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-bold shadow-[0_0_16px_rgba(57,255,106,0.45)]'
                        : 'text-[#CBD8D0] hover:text-[#39FF6A] hover:bg-white/5 font-medium'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? 'text-[#07110D]'
                          : 'text-[#8FA99B] group-hover:text-[#39FF6A]'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="flex-1 text-[13px] tracking-tight truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-[#07110D]/20 text-[#07110D]'
                            : 'bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip on Collapsed Rail */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-[#0E2A1F] border border-[rgba(57,255,106,0.3)] text-xs text-[#EAF7EF] font-mono whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User Quick Card */}
      {!isCollapsed && (
        <div className="p-3 m-3 rounded-2xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#39FF6A] to-[#7FE7D6] flex items-center justify-center text-[#07110D] font-black text-xs shadow-[0_0_10px_rgba(57,255,106,0.4)]">
                {(profile?.fullName || user?.email || 'RV')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#EAF7EF] truncate">
                  {profile?.fullName || user?.email?.split('@')[0] || 'RoboVerse Explorer'}
                </p>
                <p className="text-[10px] text-[#8FA99B] font-mono truncate">
                  {profile?.studentId || 'RV-XXXX-XXXXXX'}
                </p>
              </div>
              <span className="text-[9.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A]">
                {entitlements?.badge || 'FREE'}
              </span>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[rgba(57,255,106,0.1)] hover:bg-[rgba(57,255,106,0.2)] border border-[rgba(57,255,106,0.3)] text-xs font-bold text-[#39FF6A] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 z-30 ${
          isCollapsed ? 'w-20' : 'w-[260px]'
        }`}
      >
        <div className="fixed top-0 bottom-0 left-0" style={{ width: isCollapsed ? '80px' : '260px' }}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-[280px] max-w-full h-full z-10 animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
