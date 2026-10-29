'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { apiRequest } from '../../lib/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  ShieldCheck,
  ChevronRight,
  X,
  Code2,
  Cpu,
  Clock,
  Send,
  Zap,
  UserPlus,
  Compass,
  Download,
} from 'lucide-react';

interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  city: string;
  state: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  level: string;
  prizePoolInr: number;
  registrationDeadline: string;
  eventDate: string;
  url: string;
  description: string;
  isCurated: boolean;
  teamSizeMax: number;
}

interface PeerCandidate {
  id: string;
  name: string;
  studentId: string;
  avatar: string;
  college: string;
  role: string;
  skills: string[];
  matchScore: number;
  pitch: string;
  invited?: boolean;
}

const POPULAR_SKILLS = [
  'ROS 2',
  'Arduino C++',
  'Computer Vision',
  'CAD & 3D Printing',
  'ESP32 Mesh',
  'Autonomous Navigation',
  'Drone Flight Stack',
  'Edge ML & TinyML',
  'PCB Design',
];

const ROLES = [
  'Perception & AI Lead',
  'Firmware & Embedded Systems Engineer',
  'Mechanical & CAD Designer',
  'Flight / Control Systems Engineer',
  'Team Captain & Pitch Specialist',
];

const INITIAL_PEERS: PeerCandidate[] = [
  {
    id: 'peer-1',
    name: 'Aarav Sharma',
    studentId: 'RV-2026-8812',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    college: 'IIT Delhi',
    role: 'Perception & AI Lead',
    skills: ['ROS 2', 'Computer Vision', 'Edge ML & TinyML'],
    matchScore: 96,
    pitch: 'Building vision-based rover navigation algorithms. Need embedded & CAD teammates!',
  },
  {
    id: 'peer-2',
    name: 'Diya Patel',
    studentId: 'RV-2026-4421',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    college: 'BMS College, Bengaluru',
    role: 'Firmware & Embedded Systems Engineer',
    skills: ['Arduino C++', 'ESP32 Mesh', 'PCB Design'],
    matchScore: 92,
    pitch: 'Specialized in multi-node ESP-NOW mesh telemetry and low-latency motor control.',
  },
  {
    id: 'peer-3',
    name: 'Rohan Deshmukh',
    studentId: 'RV-2026-9054',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    college: 'COEP Pune',
    role: 'Mechanical & CAD Designer',
    skills: ['CAD & 3D Printing', 'Drone Flight Stack'],
    matchScore: 88,
    pitch: 'Designed 4-wheel rocker-bogie chassis and carbon-fiber drone arm mounts in Fusion360.',
  },
  {
    id: 'peer-4',
    name: 'Ananya Roy',
    studentId: 'RV-2026-3190',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    college: 'BITS Pilani',
    role: 'Flight / Control Systems Engineer',
    skills: ['Drone Flight Stack', 'Autonomous Navigation'],
    matchScore: 84,
    pitch: 'PX4 autopilot tuning and PID loop optimization for quadcopter obstacle avoidance.',
  },
];

export default function HackathonsPage() {
  const { user, profile, studentIdCard, isAuthenticated } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [minPrize, setMinPrize] = useState<number>(0);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('ALL');

  // Team matching modal
  const [matchingModalOpen, setMatchingModalOpen] = useState(false);
  const [matchingModalTab, setMatchingModalTab] = useState<'join' | 'browse'>('join');
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['ROS 2', 'Arduino C++']);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [pitchMessage, setPitchMessage] = useState('');
  const [joiningPool, setJoiningPool] = useState(false);
  const [matchingSuccess, setMatchingSuccess] = useState<string | null>(null);
  const [matchingError, setMatchingError] = useState<string | null>(null);

  // Peer candidate candidates pool
  const [peers, setPeers] = useState<PeerCandidate[]>(INITIAL_PEERS);
  const [invitedPeers, setInvitedPeers] = useState<Record<string, boolean>>({});

  // Fetch hackathons
  useEffect(() => {
    async function loadHackathons() {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedCity !== 'ALL') queryParams.append('city', selectedCity);
      if (selectedMode !== 'ALL') queryParams.append('mode', selectedMode);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await apiRequest(`/hackathons?${queryParams.toString()}`);
      if (res.success && res.data) {
        let list: Hackathon[] = res.data.hackathons || [];
        if (minPrize > 0) {
          list = list.filter((h) => h.prizePoolInr >= minPrize);
        }
        if (selectedSkillFilter !== 'ALL') {
          list = list.filter((h) =>
            h.description.toLowerCase().includes(selectedSkillFilter.toLowerCase()) ||
            h.title.toLowerCase().includes(selectedSkillFilter.toLowerCase())
          );
        }
        setHackathons(list);
      }
      setLoading(false);
    }

    loadHackathons();
  }, [selectedCity, selectedMode, searchQuery, minPrize, selectedSkillFilter]);

  const handleOpenMatching = (hackathon: Hackathon, initialTab: 'join' | 'browse' = 'join') => {
    setSelectedHackathon(hackathon);
    setMatchingModalTab(initialTab);
    setMatchingSuccess(null);
    setMatchingError(null);
    setMatchingModalOpen(true);
  };

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmitMatching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;

    if (!isAuthenticated) {
      setMatchingError('Please log in with your Student ID to join the matching pool.');
      return;
    }

    setJoiningPool(true);
    setMatchingError(null);

    const res = await apiRequest(`/hackathons/${selectedHackathon.id}/team-matching`, {
      method: 'POST',
      body: JSON.stringify({
        skills: selectedSkills,
        preferredRole: selectedRole,
        message: pitchMessage || 'Excited to build high-grade robotics prototypes together!',
      }),
    });

    setJoiningPool(false);

    if (res.success) {
      setMatchingSuccess('Successfully joined the verified team-matching pool! Your card is now visible to peers.');
      // Add current user to local peers preview
      const myEntry: PeerCandidate = {
        id: `peer-me-${Date.now()}`,
        name: profile?.fullName || 'You (Active Candidate)',
        studentId: studentIdCard?.studentId || 'RV-2026-YOU',
        avatar: profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        college: profile?.schoolOrCollegeName || 'Your Campus',
        role: selectedRole,
        skills: selectedSkills,
        matchScore: 99,
        pitch: pitchMessage || 'Excited to build high-grade robotics prototypes together!',
      };
      setPeers((prev) => [myEntry, ...prev]);
      setMatchingModalTab('browse');
    } else {
      setMatchingError(res.error?.message || 'Failed to join matching pool.');
    }
  };

  const handleInvitePeer = (peerId: string) => {
    setInvitedPeers((prev) => ({ ...prev, [peerId]: true }));
  };

  const handleExportCalendar = (hackathon: Hackathon) => {
    const startDate = new Date(hackathon.eventDate);
    const endDate = new Date(startDate.getTime() + 8 * 3600 * 1000); // 8-hour sprint default

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RoboVerse//Hackathons Arena//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:hackathon-${hackathon.id}@roboverse.org`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:RoboVerse: ${hackathon.title}`,
      `DESCRIPTION:${hackathon.description.replace(/\n/g, ' ')}\\n\\nPrize Pool: ₹${hackathon.prizePoolInr}\\nRegistration URL: ${hackathon.url}`,
      `LOCATION:${hackathon.city}, India (${hackathon.mode})`,
      `URL:${hackathon.url}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${hackathon.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPrizePool = hackathons.reduce((acc, h) => acc + h.prizePoolInr, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans">
      {/* Slim Icon Rail Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,42,31,0.6),rgba(7,17,13,0.95))]">
        {/* Top Translucent Glass Bar */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Hero Banner in Control-Room 3D Style */}
          <section className="relative overflow-hidden rounded-3xl bg-[#0E2A1F]/35 backdrop-blur-xl border border-[#39FF6A]/20 p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#39FF6A]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39FF6A]/10 border border-[#39FF6A]/30 text-[#39FF6A] text-xs font-semibold mb-3 tracking-wide">
                    <Trophy className="w-3.5 h-3.5 text-[#39FF6A]" />
                    <span>NATIONAL ROBOTICS ARENA 2026</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#EAF7EF] tracking-tight mb-2">
                    Robotics Hackathons &amp; Competitions
                  </h1>
                  <p className="text-sm sm:text-base text-[#8FA99B] max-w-2xl leading-relaxed">
                    Compete in rover exploration challenges, autonomous drone obstacle derbies, and IoT sprints across India.
                    Form verified student squads via the AI matchmaking pool and win cash prizes in INR.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href="/workbench"
                    className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-[#39FF6A]/10 text-xs font-bold text-[#EAF7EF] border border-[#39FF6A]/20 flex items-center gap-2 transition-colors"
                  >
                    <Cpu className="w-4 h-4 text-[#7FE7D6]" />
                    <span>Circuit Lab Prototype</span>
                  </Link>
                  <button
                    onClick={() => {
                      if (hackathons.length > 0) handleOpenMatching(hackathons[0], 'browse');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#39FF6A] hover:bg-[#2BD95B] text-[#07110D] font-bold text-xs shadow-[0_0_20px_rgba(57,255,106,0.35)] flex items-center gap-2 transition-transform hover:scale-[1.02]"
                  >
                    <Users className="w-4 h-4" />
                    <span>Find Teammates</span>
                  </button>
                </div>
              </div>

              {/* Telemetry Status Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#39FF6A]/15">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#39FF6A]/15">
                  <div className="text-[11px] font-semibold text-[#8FA99B] uppercase tracking-wider mb-1">
                    TOTAL PRIZE POOL
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#39FF6A] font-mono">
                    ₹{totalPrizePool > 0 ? totalPrizePool.toLocaleString('en-IN') : '18,50,000'}
                  </div>
                  <div className="text-[11px] text-[#7FE7D6] font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#39FF6A]" />
                    <span>Verified Cash Rewards</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#39FF6A]/15">
                  <div className="text-[11px] font-semibold text-[#8FA99B] uppercase tracking-wider mb-1">
                    ACTIVE ARENAS
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#7FE7D6] font-mono">
                    {hackathons.length} Events
                  </div>
                  <div className="text-[11px] text-[#8FA99B] mt-1">Collegiate &amp; High School</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#39FF6A]/15">
                  <div className="text-[11px] font-semibold text-[#8FA99B] uppercase tracking-wider mb-1">
                    REGISTERED SQUADS
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#EAF7EF] font-mono">
                    420+ Teams
                  </div>
                  <div className="text-[11px] text-[#8FA99B] mt-1">From 85+ Campuses</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#39FF6A]/15">
                  <div className="text-[11px] font-semibold text-[#8FA99B] uppercase tracking-wider mb-1">
                    PRO PREP TRACK
                  </div>
                  <div className="text-sm font-bold text-[#FF9A1F] flex items-center gap-1 mt-1">
                    <Flame className="w-4 h-4 text-[#FF9A1F]" />
                    <span>Mentor Review Active</span>
                  </div>
                  <div className="text-[11px] text-[#8FA99B] mt-1">Included in Plus / Pro</div>
                </div>
              </div>
            </div>
          </section>

          {/* Filter, Search & Mode Bar */}
          <section className="bg-[#0E2A1F]/35 backdrop-blur-xl rounded-2xl border border-[#39FF6A]/20 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA99B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hackathons by title, challenge, technology (e.g. Rover, ROS, ESP32, Drone)..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-[#39FF6A]/20 text-[#EAF7EF] placeholder-[#8FA99B]/60 text-sm focus:outline-none focus:border-[#39FF6A] transition-colors"
                />
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {['ALL', 'OFFLINE', 'HYBRID', 'ONLINE'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      selectedMode === mode
                        ? 'bg-[#39FF6A] text-[#07110D] font-bold shadow-[0_0_15px_rgba(57,255,106,0.3)]'
                        : 'bg-white/[0.03] text-[#8FA99B] hover:text-[#EAF7EF] border border-[#39FF6A]/15 hover:border-[#39FF6A]/30'
                    }`}
                  >
                    {mode === 'ALL' ? 'All Formats' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: City & Prize Pool */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#39FF6A]/15">
              {/* City chips */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
                <span className="text-[#8FA99B] font-medium shrink-0 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#39FF6A]" />
                  City:
                </span>
                {['ALL', 'Delhi', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
                      selectedCity === city
                        ? 'bg-[#39FF6A]/20 text-[#39FF6A] font-bold border border-[#39FF6A]/40'
                        : 'bg-white/[0.03] text-[#8FA99B] hover:text-[#EAF7EF] border border-transparent'
                    }`}
                  >
                    {city === 'ALL' ? 'All India' : city}
                  </button>
                ))}
              </div>

              {/* Prize Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#8FA99B] font-medium shrink-0">Min Prize:</span>
                <select
                  value={minPrize}
                  onChange={(e) => setMinPrize(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-[#39FF6A]/20 text-[#EAF7EF] text-xs font-semibold focus:outline-none focus:border-[#39FF6A]"
                >
                  <option value={0} className="bg-[#07110D] text-[#EAF7EF]">Any Prize Pool</option>
                  <option value={50000} className="bg-[#07110D] text-[#EAF7EF]">₹50,000+</option>
                  <option value={100000} className="bg-[#07110D] text-[#EAF7EF]">₹1,00,000+</option>
                  <option value={250000} className="bg-[#07110D] text-[#EAF7EF]">₹2,50,000+</option>
                </select>
              </div>
            </div>

            {/* Skill tags */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs pt-1">
              <span className="text-[#8FA99B] font-medium shrink-0 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-[#7FE7D6]" />
                Track:
              </span>
              <button
                onClick={() => setSelectedSkillFilter('ALL')}
                className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] ${
                  selectedSkillFilter === 'ALL'
                    ? 'bg-[#39FF6A] text-[#07110D] font-bold'
                    : 'bg-white/[0.03] text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                All Tracks
              </button>
              {POPULAR_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkillFilter(skill)}
                  className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] shrink-0 transition-colors ${
                    selectedSkillFilter === skill
                      ? 'bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/40 font-bold'
                      : 'bg-white/[0.03] text-[#8FA99B] hover:text-[#EAF7EF] border border-[#39FF6A]/10'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </section>

          {/* Hackathons Feed Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#EAF7EF] flex items-center gap-2">
                <span>Featured Competitions</span>
                <span className="px-2 py-0.5 rounded-full bg-[#39FF6A]/15 text-[#39FF6A] text-xs font-semibold font-mono">
                  {hackathons.length}
                </span>
              </h2>
              <span className="text-xs text-[#8FA99B]">Verified by RoboVerse Academic Council</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="h-80 rounded-2xl bg-[#0E2A1F]/30 border border-[#39FF6A]/15 animate-pulse p-6 space-y-4"
                  >
                    <div className="w-24 h-4 bg-white/10 rounded-full" />
                    <div className="w-3/4 h-6 bg-white/10 rounded-lg" />
                    <div className="w-full h-16 bg-white/5 rounded-lg" />
                    <div className="w-1/2 h-8 bg-white/10 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : hackathons.length === 0 ? (
              <div className="rounded-2xl bg-[#0E2A1F]/35 backdrop-blur-xl border border-[#39FF6A]/20 p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <AlertCircle className="w-10 h-10 text-[#FF9A1F] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#EAF7EF] mb-1">
                  No hackathons found matching your filters
                </h3>
                <p className="text-sm text-[#8FA99B] mb-4 max-w-md mx-auto">
                  Try switching your city to All India or clearing your minimum prize filter to discover more upcoming competitions.
                </p>
                <button
                  onClick={() => {
                    setSelectedCity('ALL');
                    setSelectedMode('ALL');
                    setMinPrize(0);
                    setSearchQuery('');
                    setSelectedSkillFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#39FF6A] text-[#07110D] text-xs font-bold shadow-[0_0_15px_rgba(57,255,106,0.3)]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hackathons.map((hackathon) => {
                  const deadlineDate = new Date(hackathon.registrationDeadline);
                  const isUpcoming = deadlineDate.getTime() > Date.now();
                  const daysLeft = Math.ceil(
                    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={hackathon.id}
                      className="group rounded-2xl bg-[#0E2A1F]/35 backdrop-blur-xl border border-[#39FF6A]/15 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-[#39FF6A]/50 hover:shadow-[0_0_25px_rgba(57,255,106,0.15)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Card Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              hackathon.mode === 'ONLINE'
                                ? 'bg-[#4C8DFF]/15 text-[#4C8DFF] border border-[#4C8DFF]/30'
                                : hackathon.mode === 'HYBRID'
                                ? 'bg-[#7FE7D6]/15 text-[#7FE7D6] border border-[#7FE7D6]/30'
                                : 'bg-[#39FF6A]/15 text-[#39FF6A] border border-[#39FF6A]/30'
                            }`}
                          >
                            {hackathon.mode} • {hackathon.city}
                          </span>

                          {hackathon.isCurated && (
                            <span className="px-2 py-0.5 rounded-full bg-[#7FE7D6]/10 text-[#7FE7D6] border border-[#7FE7D6]/30 text-[10px] font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#7FE7D6]" />
                              Curated
                            </span>
                          )}
                        </div>

                        {/* Title & Organizer */}
                        <h3 className="text-base font-bold text-[#EAF7EF] group-hover:text-[#39FF6A] transition-colors mb-1 line-clamp-2">
                          {hackathon.title}
                        </h3>
                        <div className="text-xs text-[#8FA99B] mb-3 flex items-center gap-1.5">
                          <span>By {hackathon.organizer}</span>
                          <span>•</span>
                          <span className="capitalize">{hackathon.level.toLowerCase()}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#8FA99B] line-clamp-3 mb-4 leading-relaxed">
                          {hackathon.description}
                        </p>

                        {/* Dates & Countdown */}
                        <div className="space-y-1.5 mb-4 text-xs text-[#8FA99B]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#39FF6A] shrink-0" />
                            <span>
                              Event: <strong className="text-[#EAF7EF]">{new Date(hackathon.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#7FE7D6] shrink-0" />
                            <span>
                              Deadline:{' '}
                              <strong className="text-[#EAF7EF]">
                                {deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </strong>
                              {isUpcoming && daysLeft <= 14 && (
                                <span className="ml-1 text-[11px] font-bold text-[#FF9A1F]">
                                  ({daysLeft} {daysLeft === 1 ? 'day' : 'days'} left)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#39FF6A] shrink-0" />
                            <span>Team Size: <strong className="text-[#EAF7EF]">1 - {hackathon.teamSizeMax} Members</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Prize & Actions */}
                      <div className="pt-4 border-t border-[#39FF6A]/15">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-semibold text-[#8FA99B] uppercase tracking-wider">PRIZE POOL</span>
                          <div className="px-3 py-1 rounded-full bg-[#39FF6A]/20 border border-[#39FF6A]/40 text-[#39FF6A] font-extrabold text-xs font-mono shadow-[0_0_12px_rgba(57,255,106,0.2)]">
                            ₹{hackathon.prizePoolInr.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <button
                            onClick={() => handleOpenMatching(hackathon, 'join')}
                            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-[#39FF6A]/15 text-[#39FF6A] text-xs font-bold border border-[#39FF6A]/25 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Squad Finder</span>
                          </button>

                          <a
                            href={hackathon.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-[#39FF6A] hover:bg-[#2BD95B] text-[#07110D] text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(57,255,106,0.3)] transition-all"
                          >
                            <span>Arena Page</span>
                            <ExternalLink className="w-3 h-3 text-[#07110D]/80" />
                          </a>
                        </div>

                        <button
                          onClick={() => handleExportCalendar(hackathon)}
                          className="w-full py-1.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-[#8FA99B] hover:text-[#EAF7EF] text-xs font-semibold border border-[#39FF6A]/15 flex items-center justify-center gap-1.5 transition-colors"
                          title="Export hackathon schedule to your calendar (.ics)"
                        >
                          <Download className="w-3.5 h-3.5 text-[#39FF6A]" />
                          <span>Add to Calendar (.ics)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* TEAM MATCHING MODAL IN CONTROL-ROOM DARK GLASS */}
      {matchingModalOpen && selectedHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0A1813] border border-[#39FF6A]/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#39FF6A]/20">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#39FF6A] mb-1">
                  <Trophy className="w-3.5 h-3.5 text-[#39FF6A]" />
                  <span>SQUAD MATCHING POOL</span>
                </div>
                <h3 className="text-xl font-bold text-[#EAF7EF]">
                  {selectedHackathon.title}
                </h3>
              </div>
              <button
                onClick={() => setMatchingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-[#8FA99B] hover:text-[#EAF7EF] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs: Join vs Browse Candidates */}
            <div className="flex items-center gap-2 mt-4 mb-6 p-1 rounded-xl bg-black/40 border border-[#39FF6A]/15 text-xs font-bold">
              <button
                onClick={() => setMatchingModalTab('join')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  matchingModalTab === 'join'
                    ? 'bg-[#39FF6A] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.3)]'
                    : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                Join Matching Pool
              </button>
              <button
                onClick={() => setMatchingModalTab('browse')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  matchingModalTab === 'browse'
                    ? 'bg-[#39FF6A] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.3)]'
                    : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                <span>Browse Candidates</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  matchingModalTab === 'browse' ? 'bg-[#07110D]/20 text-[#07110D]' : 'bg-[#39FF6A]/20 text-[#39FF6A]'
                }`}>
                  {peers.length}
                </span>
              </button>
            </div>

            {matchingSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#39FF6A]/15 border border-[#39FF6A]/30 text-[#39FF6A] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{matchingSuccess}</span>
              </div>
            )}

            {matchingError && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#FF4D4D]/15 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{matchingError}</span>
              </div>
            )}

            {matchingModalTab === 'join' ? (
              <form onSubmit={handleSubmitMatching} className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#EAF7EF] mb-1.5">
                    Your Primary Squad Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#39FF6A]/20 text-xs font-semibold text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role} className="bg-[#07110D] text-[#EAF7EF]">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skills Toggle Chips */}
                <div>
                  <label className="block text-xs font-bold text-[#EAF7EF] mb-1.5">
                    Verified Competency Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#39FF6A] text-[#07110D] font-bold shadow-[0_0_12px_rgba(57,255,106,0.3)]'
                              : 'bg-white/[0.03] text-[#8FA99B] hover:text-[#EAF7EF] border border-[#39FF6A]/15'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pitch Message */}
                <div>
                  <label className="block text-xs font-bold text-[#EAF7EF] mb-1.5">
                    Squad Elevator Pitch &amp; Availability
                  </label>
                  <textarea
                    rows={3}
                    value={pitchMessage}
                    onChange={(e) => setPitchMessage(e.target.value)}
                    placeholder="e.g. 3rd year robotics student proficient in ROS2 Nav2 and Kalman filters. Looking for embedded systems & CAD specialists to build an autonomous rover for this hackathon!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#39FF6A]/20 text-xs text-[#EAF7EF] placeholder-[#8FA99B]/60 focus:outline-none focus:border-[#39FF6A]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMatchingModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#8FA99B] hover:text-[#EAF7EF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joiningPool}
                    className="px-5 py-2.5 rounded-xl bg-[#39FF6A] hover:bg-[#2BD95B] text-[#07110D] font-bold text-xs shadow-[0_0_20px_rgba(57,255,106,0.35)] flex items-center gap-2 disabled:opacity-50 transition-all"
                  >
                    {joiningPool ? (
                      <span>Adding to Pool...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Squad Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Browse Candidates Pool Tab */
              <div className="space-y-4">
                <p className="text-xs text-[#8FA99B] leading-relaxed">
                  Verified RoboVerse students actively looking for teammates for <strong className="text-[#EAF7EF]">{selectedHackathon.title}</strong>:
                </p>

                <div className="space-y-3">
                  {peers.map((peer) => {
                    const isInvited = invitedPeers[peer.id];
                    return (
                      <div
                        key={peer.id}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-[#39FF6A]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#39FF6A]/30 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#EAF7EF]">
                                {peer.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 border border-[#39FF6A]/20 text-[#39FF6A]">
                                {peer.studentId}
                              </span>
                              <span className="text-[11px] font-bold text-[#39FF6A] bg-[#39FF6A]/15 px-2 py-0.5 rounded-full font-mono">
                                {peer.matchScore}% Match
                              </span>
                            </div>

                            <div className="text-xs text-[#8FA99B] mt-0.5">
                              {peer.role} • <strong className="text-[#EAF7EF]">{peer.college}</strong>
                            </div>

                            <p className="text-xs text-[#8FA99B] mt-1 italic">
                              "{peer.pitch}"
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {peer.skills.map((s) => (
                                <span
                                  key={s}
                                  className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-[#7FE7D6] border border-[#39FF6A]/15 font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleInvitePeer(peer.id)}
                            disabled={isInvited}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isInvited
                                ? 'bg-[#39FF6A]/15 text-[#39FF6A] border border-[#39FF6A]/30 cursor-default'
                                : 'bg-[#39FF6A] hover:bg-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.25)]'
                            }`}
                          >
                            {isInvited ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Invite Sent</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Invite to Squad</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
