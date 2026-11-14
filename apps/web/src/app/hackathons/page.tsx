'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/landing/Navbar';
import { SquadChatDrawer } from '../../components/collaboration/SquadChatDrawer';
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

export default function HackathonsPage() {
  const { user, profile, isAuthenticated } = useAuthStore();

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');

  // Team matching modal
  const [matchingModalOpen, setMatchingModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['ROS 2', 'Arduino C++']);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [pitchMessage, setPitchMessage] = useState('');
  const [joiningPool, setJoiningPool] = useState(false);
  const [matchingSuccess, setMatchingSuccess] = useState<string | null>(null);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [matchingCandidates, setMatchingCandidates] = useState<any[]>([]);

  // Project submission modal
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionHackathon, setSubmissionHackathon] = useState<Hackathon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionForm, setSubmissionForm] = useState({
    teamName: '',
    projectTitle: '',
    projectDescription: '',
    circuitProjectId: 'proj_rover_3d_mna_01',
    videoDemoUrl: 'https://youtu.be/sample-robot-demo',
    githubUrl: 'https://github.com/roboverse-team/autonomous-rover',
  });

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
        setHackathons(res.data.hackathons || []);
      }
      setLoading(false);
    }

    loadHackathons();
  }, [selectedCity, selectedMode, searchQuery]);

  const handleOpenMatching = async (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setMatchingSuccess(null);
    setMatchingError(null);
    setMatchingModalOpen(true);

    const res = await apiRequest(`/hackathons/${hackathon.id}/team-matching`);
    if (res.success && res.data) {
      setMatchingCandidates(res.data.candidates || []);
    }
  };

  const handleOpenSubmission = (hackathon: Hackathon) => {
    setSubmissionHackathon(hackathon);
    setSubmissionSuccess(null);
    setSubmissionError(null);
    setSubmissionForm({
      teamName: `${profile?.fullName || (profile as any)?.full_name || 'RoboVerse'} Team`,
      projectTitle: 'Autonomous MNA Obstacle Navigating Rover',
      projectDescription: 'Interactive 3D simulation prototype with Arduino Uno, L298N driver, HC-SR04 ultrasonic sonar sensor and PID speed controller.',
      circuitProjectId: 'proj_rover_3d_mna_01',
      videoDemoUrl: 'https://youtu.be/sample-robot-demo',
      githubUrl: 'https://github.com/roboverse-team/autonomous-rover',
    });
    setSubmissionModalOpen(true);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionHackathon) return;

    if (!isAuthenticated) {
      setSubmissionError('Please log in with your Student ID to submit a hackathon project.');
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    const res = await apiRequest('/hackathons/submit', {
      method: 'POST',
      body: JSON.stringify({
        hackathonId: submissionHackathon.id,
        ...submissionForm,
      }),
    });

    setSubmitting(false);

    if (res.success) {
      setSubmissionSuccess('Project submitted successfully! You earned +100 XP for your squad.');
    } else {
      setSubmissionError(res.error?.message || 'Failed to submit hackathon project.');
    }
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
      setMatchingError('Please log in or register your Student ID to join the matching pool.');
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
      setMatchingSuccess('Successfully joined the verified team-matching pool! Other students in your city will see your profile.');
    } else {
      setMatchingError(res.error?.message || 'Failed to join matching pool.');
    }
  };

  const totalPrizePool = hackathons.reduce((acc, h) => acc + h.prizePoolInr, 0);

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text font-sans selection:bg-robo-neon selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header HUD Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1F17] via-[#081710] to-[#040C08] border border-robo-borderSubtle p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-robo-neon/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-robo-teal/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-robo-surfaceRaised/80 border border-robo-neon/40 text-robo-neon text-xs font-mono mb-4 shadow-neon-subtle">
              <Trophy className="w-3.5 h-3.5 animate-bounce" />
              <span>NATIONAL ROBOTICS ARENA 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Robotics Hackathons &amp; Competitions
            </h1>
            <p className="text-base sm:text-lg text-robo-textSecondary max-w-3xl mb-8 leading-relaxed">
              Compete in high-stakes autonomous rover challenges, drone obstacle derbies, and IoT sprints across India.
              Form verified student squads via the AI matchmaking pool, prototype circuits in the 3D Workbench, and win prizes.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-robo-borderSubtle/60">
              <div className="p-4 rounded-2xl bg-black/40 border border-robo-borderSubtle">
                <div className="text-xs font-mono text-robo-textSecondary mb-1">TOTAL PRIZE POOL</div>
                <div className="text-2xl sm:text-3xl font-black text-robo-neon">
                  ₹{totalPrizePool.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-robo-borderSubtle">
                <div className="text-xs font-mono text-robo-textSecondary mb-1">ACTIVE EVENTS</div>
                <div className="text-2xl sm:text-3xl font-black text-robo-teal">
                  {hackathons.length} Arenas
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-robo-borderSubtle">
                <div className="text-xs font-mono text-robo-textSecondary mb-1">REGISTERED SQUADS</div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  340+ Teams
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-robo-borderSubtle">
                <div className="text-xs font-mono text-robo-textSecondary mb-1">PRO PREP TRACK</div>
                <div className="text-sm font-bold text-robo-accentOrange mt-1 flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  <span>Mentorship Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-robo-textSecondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by challenge, technology (e.g. Rover, ROS, ESP32, Drone)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-robo-surfaceRaised/90 border border-robo-borderSubtle text-white placeholder-robo-textSecondary text-sm focus:outline-none focus:border-robo-neon transition-colors"
              />
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['ALL', 'OFFLINE', 'HYBRID', 'ONLINE'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                    selectedMode === mode
                      ? 'bg-robo-teal text-black shadow-neon-subtle'
                      : 'bg-robo-surfaceRaised text-robo-textSecondary border border-robo-borderSubtle hover:text-white'
                  }`}
                >
                  {mode === 'ALL' ? 'All Formats' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* City Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="text-robo-textSecondary font-mono shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-robo-neon" />
              City:
            </span>
            {['ALL', 'Delhi', 'Bengaluru', 'Mumbai', 'Pune'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                  selectedCity === city
                    ? 'bg-robo-neon text-black font-bold'
                    : 'bg-black/40 text-robo-textSecondary border border-robo-borderSubtle hover:text-white hover:border-robo-border'
                }`}
              >
                {city === 'ALL' ? 'All India' : city}
              </button>
            ))}
          </div>
        </section>

        {/* Hackathon Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-robo-neon border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-robo-textSecondary font-mono text-sm">Querying National Robotics Arena registry...</p>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-robo-surfaceRaised/50 border border-robo-borderSubtle p-8">
            <AlertCircle className="w-12 h-12 text-robo-textSecondary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Hackathons Found</h3>
            <p className="text-sm text-robo-textSecondary mb-6">
              No active hackathons matched your current search and location filters.
            </p>
            <button
              onClick={() => {
                setSelectedCity('ALL');
                setSelectedMode('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl bg-robo-surfaceRaised border border-robo-neon text-robo-neon text-xs font-mono font-bold hover:bg-robo-neon hover:text-black transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => {
              const deadlineDate = new Date(hackathon.registrationDeadline);
              const eventDate = new Date(hackathon.eventDate);
              const isClosingSoon = (deadlineDate.getTime() - Date.now()) / (1000 * 3600 * 24) < 14;

              return (
                <div
                  key={hackathon.id}
                  className="group relative rounded-3xl bg-gradient-to-b from-[#0B1C15] to-[#05110C] border border-robo-borderSubtle hover:border-robo-neon/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-neon-card"
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-robo-surfaceRaised border border-robo-borderSubtle text-robo-teal flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {hackathon.city}, {hackathon.state}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                          hackathon.mode === 'HYBRID'
                            ? 'bg-robo-teal/10 border-robo-teal text-robo-teal'
                            : 'bg-robo-neon/10 border-robo-neon text-robo-neon'
                        }`}
                      >
                        {hackathon.mode}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-robo-neon transition-colors leading-snug">
                      {hackathon.title}
                    </h3>
                    <p className="text-xs font-mono text-robo-textSecondary mb-4">
                      Organized by: <span className="text-white">{hackathon.organizer}</span>
                    </p>

                    <p className="text-sm text-robo-textSecondary leading-relaxed line-clamp-3 mb-6">
                      {hackathon.description}
                    </p>
                  </div>

                  {/* Bottom Metadata & Actions */}
                  <div className="pt-4 border-t border-robo-borderSubtle/60 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-robo-textSecondary block text-[10px]">PRIZE POOL</span>
                        <span className="text-lg font-black text-robo-neon">
                          ₹{hackathon.prizePoolInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-robo-textSecondary block text-[10px]">REGISTRATION CLOSES</span>
                        <span className={`font-semibold ${isClosingSoon ? 'text-robo-accentOrange' : 'text-white'}`}>
                          {deadlineDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-robo-textSecondary pt-1">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-robo-teal" />
                        Max {hackathon.teamSizeMax} Members
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-robo-neon" />
                        {eventDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenMatching(hackathon)}
                          className="w-full py-2.5 px-3 rounded-xl bg-robo-surfaceRaised border border-robo-teal/50 hover:border-robo-teal hover:bg-robo-teal/10 text-robo-teal font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Squad Match</span>
                        </button>

                        <button
                          onClick={() => handleOpenSubmission(hackathon)}
                          className="w-full py-2.5 px-3 rounded-xl bg-robo-neon/20 border border-robo-neon hover:bg-robo-neon hover:text-black text-robo-neon font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-neon-subtle"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Submit Project</span>
                        </button>
                      </div>

                      <a
                        href={hackathon.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-robo-borderSubtle hover:border-robo-neon text-robo-textSecondary hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pro Hackathon Track Callout */}
        <section className="mt-16 rounded-3xl bg-gradient-to-r from-[#0C241B] via-[#091B13] to-[#040E0A] border border-robo-neon/40 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-neon-card">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-robo-neon/10 border border-robo-neon text-robo-neon text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ROBOVERSE PRO ADVANTAGE</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Need Pitch Coaching &amp; Hardware Circuit Reviews?</h3>
            <p className="text-sm text-robo-textSecondary max-w-xl">
              Pro plan students receive 1-on-1 mentor code audits, past winning problem statement breakdowns, and 3D simulation stress tests before physical trials.
            </p>
          </div>
          <Link
            href="/#pricing"
            className="shrink-0 px-6 py-3 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-sm shadow-neon-glow flex items-center gap-2 transition-transform hover:scale-105"
          >
            <span>Upgrade to Pro Track</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Team Matching Modal */}
      {matchingModalOpen && selectedHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#091C14] border border-robo-neon/50 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setMatchingModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-robo-textSecondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-robo-neon text-xs font-mono mb-2">
              <Users className="w-4 h-4" />
              <span>TEAM MATCHMAKING POOL</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Join Squad for {selectedHackathon.title}
            </h3>
            <p className="text-xs text-robo-textSecondary mb-6">
              Connect with fellow electronics and robotics students looking to complete a {selectedHackathon.teamSizeMax}-person squad.
            </p>

            {matchingSuccess ? (
              <div className="p-4 rounded-2xl bg-robo-neon/10 border border-robo-neon text-robo-neon space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pool Registration Confirmed!</span>
                </div>
                <p className="text-xs text-robo-textSecondary leading-relaxed">{matchingSuccess}</p>
                <button
                  onClick={() => setMatchingModalOpen(false)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-robo-neon text-black font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitMatching} className="space-y-5">
                {matchingError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{matchingError}</span>
                  </div>
                )}

                {/* Target Role */}
                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-2">
                    PREFERRED SQUAD ROLE
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skills Multi-select */}
                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-2">
                    YOUR TECHNICAL SKILLS (SELECT APPLICABLE)
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
                              ? 'bg-robo-teal text-black font-bold shadow-neon-subtle'
                              : 'bg-black/40 text-robo-textSecondary border border-robo-borderSubtle hover:text-white'
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
                  <label className="block text-xs font-mono text-robo-textSecondary mb-2">
                    SQUAD PITCH / PAST ROBOTICS EXPERIENCE
                  </label>
                  <textarea
                    rows={3}
                    value={pitchMessage}
                    onChange={(e) => setPitchMessage(e.target.value)}
                    placeholder="e.g. Built an obstacle-avoiding rover with Arduino & L298N. Proficient with ROS 2 navigation packages and fusion sensors..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white placeholder-robo-textSecondary text-xs focus:outline-none focus:border-robo-neon resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={joiningPool}
                    className="w-full py-3 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-sm shadow-neon-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {joiningPool ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Publish to Matching Pool</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Existing Candidates in Matching Pool */}
            {matchingCandidates.length > 0 && (
              <div className="mt-6 pt-6 border-t border-robo-borderSubtle">
                <span className="text-xs font-mono text-robo-teal block mb-3">
                  CANDIDATES CURRENTLY SEEKING TEAMMATES ({matchingCandidates.length}):
                </span>
                <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                  {matchingCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-black/40 border border-robo-borderSubtle text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white">{c.name}</strong>
                        <span className="text-[10px] font-mono text-robo-neon">{c.preferredRole}</span>
                      </div>
                      <p className="text-[11px] text-robo-textSecondary line-clamp-1">{c.message}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {c.skills?.map((s: string) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-robo-surfaceRaised text-robo-textSecondary"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Submission Modal */}
      {submissionModalOpen && submissionHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#091D14] border border-robo-neon/50 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSubmissionModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-robo-textSecondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-robo-neon text-xs font-mono mb-2">
              <Trophy className="w-4 h-4" />
              <span>OFFICIAL ARENA PROJECT SUBMISSION</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Submit to {submissionHackathon.title}
            </h3>
            <p className="text-xs text-robo-textSecondary mb-6">
              Submit your circuit schematics, 3D simulation telemetry, and video demo to the judging committee.
            </p>

            {submissionSuccess ? (
              <div className="p-4 rounded-2xl bg-robo-neon/10 border border-robo-neon text-robo-neon space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Submission Recorded!</span>
                </div>
                <p className="text-xs text-robo-textSecondary leading-relaxed">{submissionSuccess}</p>
                <button
                  onClick={() => setSubmissionModalOpen(false)}
                  className="w-full mt-2 py-2.5 rounded-xl bg-robo-neon text-black font-bold text-xs"
                >
                  Return to Arenas
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProject} className="space-y-4">
                {submissionError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                    TEAM / SQUAD NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionForm.teamName}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, teamName: e.target.value })}
                    placeholder="e.g. RoverAlpha Squad"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                    PROJECT TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={submissionForm.projectTitle}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, projectTitle: e.target.value })}
                    placeholder="e.g. Autonomous Obstacle Evading Rover"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                    TECHNICAL ABSTRACT &amp; ARCHITECTURE
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={submissionForm.projectDescription}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, projectDescription: e.target.value })}
                    placeholder="Describe microcontroller, sensors, MNA electrical solver validation, PID motor control algorithm..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-white placeholder-robo-textSecondary text-xs focus:outline-none focus:border-robo-neon resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-robo-textSecondary mb-1">
                      VIDEO DEMO LINK
                    </label>
                    <input
                      type="url"
                      value={submissionForm.videoDemoUrl}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, videoDemoUrl: e.target.value })}
                      placeholder="YouTube / Drive link"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-robo-textSecondary mb-1">
                      GITHUB REPO / CODE
                    </label>
                    <input
                      type="url"
                      value={submissionForm.githubUrl}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, githubUrl: e.target.value })}
                      placeholder="GitHub repository"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-robo-borderSubtle text-white text-xs focus:outline-none focus:border-robo-neon"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-sm shadow-neon-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-4 h-4" />
                        <span>Submit Project to Judging Committee (+100 XP)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Realtime Squad Team Chat Drawer */}
      <SquadChatDrawer />
    </div>
  );
}
