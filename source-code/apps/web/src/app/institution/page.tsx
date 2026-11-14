'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../../components/brand/Logo';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Building2,
  Users,
  Award,
  Package,
  FileSpreadsheet,
  Plus,
  Download,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function InstitutionAdminPage() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'seats' | 'hardware' | 'reports'>('overview');
  const [bulkInput, setBulkInput] = useState('');
  const [generatedIds, setGeneratedIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBulkGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const names = bulkInput
        .split('\n')
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      const count = names.length > 0 ? names.length : 5;
      const ids: string[] = [];
      const baseNum = 140;
      for (let i = 0; i < count; i++) {
        ids.push(`RV-2026-${String(baseNum + i).padStart(6, '0')}`);
      }
      setGeneratedIds(ids);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text flex flex-col font-sans selection:bg-robo-neon selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-[#040C08]/90 border-b border-robo-borderSubtle flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Logo variant="horizontal" size="sm" />
          <div className="h-5 w-px bg-robo-borderSubtle hidden sm:block" />
          <span className="text-xs font-mono font-bold text-robo-teal hidden sm:flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-robo-neon" />
            INSTITUTION PORTAL // STEM CAMPUS CONSOLE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-robo-neon/15 text-robo-neon border border-robo-neon/40 hidden sm:inline-block">
            DELHI PUBLIC SCHOOL • CAMPUS 01
          </span>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-xs font-mono text-robo-textSecondary hover:text-robo-text transition-colors"
          >
            Student View
          </Link>
          <div className="w-8 h-8 rounded-lg bg-robo-teal/20 border border-robo-teal/40 flex items-center justify-center text-xs font-mono font-bold text-robo-teal">
            {profile?.fullName?.charAt(0) || 'I'}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>LICENSED SEATS</span>
              <Users className="w-4 h-4 text-robo-teal" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-neon">248 / 300</div>
            <div className="text-xs text-robo-textSecondary mt-1">52 Seats Available for Allocation</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>ACTIVE HARDWARE KITS</span>
              <Package className="w-4 h-4 text-robo-neon" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-text">42 Kits</div>
            <div className="text-xs text-robo-teal mt-1">Deployed across 3 STEM Labs</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>CERTIFIED GRADUATES</span>
              <Award className="w-4 h-4 text-robo-orange" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-orange">114 Issued</div>
            <div className="text-xs text-robo-textSecondary mt-1">Verifiable on Public Registry</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>INSTITUTION PLAN</span>
              <ShieldCheck className="w-4 h-4 text-robo-teal" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-teal">ENTERPRISE</div>
            <div className="text-xs text-robo-textSecondary mt-1">Unlimited Rituu AI & Sim Engine</div>
          </div>
        </div>

        {/* Bulk Student Onboarding & ID Generator */}
        <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle space-y-5 bg-[#040D09]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-robo-borderSubtle/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-robo-text font-sans flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-robo-neon" />
                <span>Bulk Student Registration & Sequence-Based ID Generator</span>
              </h3>
              <p className="text-xs text-robo-textSecondary mt-0.5">
                Automatically issue guaranteed unique Student IDs (format: <code className="text-robo-teal font-mono">RV-2026-XXXXXX</code>) with Supabase Auth profile triggers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-3">
              <label className="block text-xs font-mono text-robo-textSecondary">
                Enter student names or upload CSV (one student per line):
              </label>
              <textarea
                rows={5}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Rohan Sharma&#10;Priya Nair&#10;Dev Patel&#10;Meera Iyer"
                className="w-full bg-black/60 border border-robo-borderSubtle rounded-xl p-3 text-xs text-robo-text font-mono focus:border-robo-neon outline-none"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBulkGenerate}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-robo-neon text-black font-bold text-xs font-mono flex items-center gap-2 hover:bg-robo-teal transition-colors shadow-neon-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating IDs...' : 'Issue Student IDs & Passports'}</span>
                </button>
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl bg-[#030A07] border border-robo-borderSubtle text-xs font-mono text-robo-textSecondary hover:text-robo-text flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV Template</span>
                </button>
              </div>
            </div>

            {/* Generated IDs Output Card */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[#030906] border border-robo-borderSubtle space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-robo-teal">
                <span className="font-bold">RECENTLY ISSUED PASSES</span>
                <span className="text-[10px] text-robo-textMuted">SEQUENCE BATCH</span>
              </div>

              {generatedIds.length === 0 ? (
                <div className="text-xs text-robo-textMuted py-6 text-center">
                  No IDs generated in current batch. Enter names on the left and click Issue.
                </div>
              ) : (
                <div className="space-y-2">
                  {generatedIds.map((id, index) => (
                    <div
                      key={id}
                      className="p-2 rounded-lg bg-black/50 border border-robo-neon/30 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-robo-neon font-bold">{id}</span>
                      <span className="text-[10px] text-robo-teal flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready for Login
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Department / Grade-Wise Cohorts */}
        <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle space-y-4 bg-[#040C08]">
          <h3 className="text-base font-bold text-robo-text font-sans flex items-center gap-2">
            <Layers className="w-5 h-5 text-robo-teal" />
            <span>Campus Cohorts & Department Allocation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#040E0A] border border-robo-borderSubtle">
              <div className="text-xs font-mono text-robo-teal">COHORT 01</div>
              <div className="text-sm font-bold text-robo-text mt-1">Grade 9 STEM Robotics</div>
              <div className="text-xs text-robo-textSecondary mt-2">65 Enrolled • 2 Teachers</div>
              <div className="mt-3 w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-robo-neon" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040E0A] border border-robo-borderSubtle">
              <div className="text-xs font-mono text-robo-teal">COHORT 02</div>
              <div className="text-sm font-bold text-robo-text mt-1">Grade 10 Embedded IoT</div>
              <div className="text-xs text-robo-textSecondary mt-2">80 Enrolled • 3 Teachers</div>
              <div className="mt-3 w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-robo-teal" style={{ width: '92%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040E0A] border border-robo-borderSubtle">
              <div className="text-xs font-mono text-robo-teal">COHORT 03</div>
              <div className="text-sm font-bold text-robo-text mt-1">Grade 11 Automation Capstone</div>
              <div className="text-xs text-robo-textSecondary mt-2">60 Enrolled • 2 Teachers</div>
              <div className="mt-3 w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-robo-orange" style={{ width: '74%' }} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040E0A] border border-robo-borderSubtle">
              <div className="text-xs font-mono text-robo-teal">COHORT 04</div>
              <div className="text-sm font-bold text-robo-text mt-1">Robotics Club & Hackathons</div>
              <div className="text-xs text-robo-textSecondary mt-2">43 Enrolled • 1 Mentor</div>
              <div className="mt-3 w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div className="h-full bg-robo-neon" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
