'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { ChallengeBanner } from '../../components/dashboard/ChallengeBanner';
import { OnboardingJourneyModal } from '../../components/dashboard/OnboardingJourneyModal';
import { StatCard } from '../../components/ui/StatCard';
import { ItemCard } from '../../components/ui/ItemCard';
import { AddPlaceholderCard } from '../../components/ui/AddPlaceholderCard';
import { SelectableCard } from '../../components/ui/SelectableCard';
import { RobotArmScene } from '../../components/3d/RobotArmScene';
import { RobotStatusTiles } from '../../components/dashboard/RobotStatusTiles';
import { HudRadialGauge } from '../../components/dashboard/HudRadialGauge';
import { TimelineScrubber } from '../../components/dashboard/TimelineScrubber';
import { MiniMapCard } from '../../components/dashboard/MiniMapCard';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Cpu,
  Code2,
  Box,
  Bookmark,
  Award,
  Video,
  Trophy,
  Sparkles,
  Calendar,
  Grid,
  List,
  Search,
  ArrowRight,
  Flame,
  Clock,
  MapPin,
  Send,
  Zap,
  Play,
  Copy,
  Edit3,
  Trash2,
  FolderPlus,
  Lock,
  Globe,
  GitFork,
  Heart,
  ChevronDown,
  X,
  Compass,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, studentIdCard, planTier } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Tabs & filters
  const [activeCategoryTab, setActiveCategoryTab] = useState<
    'all' | 'sample-projects' | 'circuits' | 'code' | '3d' | 'collections' | 'certificates'
  >('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'modified' | 'name' | 'remixes'>('modified');
  const [selectedCity, setSelectedCity] = useState<'Delhi' | 'Bengaluru' | 'Mumbai' | 'Online'>('Delhi');

  // Quick Rituu ask state
  const [quickRituuPrompt, setQuickRituuPrompt] = useState('');
  const [isRituuAsking, setIsRituuAsking] = useState(false);
  const [rituuQuickReply, setRituuQuickReply] = useState<string | null>(null);

  // Modals state for card actions
  const [renameModalItem, setRenameModalItem] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [shareModalItem, setShareModalItem] = useState<{ id: string; title: string } | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Check if first-time user for onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('roboverse_onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleFinishOnboarding = () => {
    localStorage.setItem('roboverse_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Sample Projects (Featured Starters)
  const sampleProjects = [
    {
      id: 'starter_line_follower',
      title: 'Autonomous Line Following Robot',
      tag: 'PID Control & Robotics',
      tagBg: 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]',
      description: 'Differential drive mobile robot with dual TCRT5000 infrared reflectance sensors and L298N dual H-bridge motor driver.',
      components: ['Arduino Uno R3', 'Dual IR Sensors', 'L298N Motor Driver', '2x DC Gearmotors', '7.4V LiPo Pack'],
      componentsCount: 6,
      badge: 'Featured Starter',
      difficulty: 'Intermediate',
      href: '/workbench?starter=starter_line_follower',
    },
    {
      id: 'starter_robotic_hand',
      title: '5-Finger Articulated Robotic Hand',
      tag: 'Bionics & Servo Kinematics',
      tagBg: 'bg-[rgba(127,231,214,0.15)] text-[#7FE7D6] border border-[rgba(127,231,214,0.3)]',
      description: 'Proportional 5-finger prosthetic hand driven by 5 individual SG90 micro servo motors with flex sensor triggers.',
      components: ['Arduino Uno R3', '5x SG90 Micro Servos', 'PCA9685 16-Channel PWM', 'Flex Resistors', 'External 5V 3A Supply'],
      componentsCount: 8,
      badge: 'CapStone',
      difficulty: 'Advanced',
      href: '/workbench?starter=starter_robotic_hand',
    },
    {
      id: 'starter_drone_quad',
      title: 'Drone Quadcopter Flight Controller',
      tag: 'IMU & Brushless ESC Telemetry',
      tagBg: 'bg-[rgba(255,154,31,0.15)] text-[#FF9A1F] border border-[rgba(255,154,31,0.3)]',
      description: '6-DOF IMU stabilization with MPU6050 gyroscope/accelerometer and high-speed PWM signals to 4 brushless ESCs.',
      components: ['Arduino Uno R3', 'MPU6050 6-Axis Accelerometer', '4x 30A Brushless ESCs', '2212 920KV Motors', '3S 11.1V Battery'],
      componentsCount: 9,
      badge: 'High Performance',
      difficulty: 'Expert',
      href: '/workbench?starter=starter_drone_quad',
    },
  ];

  // My Saved Circuits state (Tinkercad-style fun names)
  const [circuits, setCircuits] = useState([
    {
      id: 'proj_mighty_bombul',
      title: 'Sizzling Blad-Kieran',
      category: 'Circuits',
      timeAgo: '13 days ago',
      isPublic: false,
      remixCount: 4,
      likeCount: 18,
      componentsCount: 7,
      thumbnailUrl: null,
    },
    {
      id: 'proj_sonar_radar',
      title: 'Ultrasonic Sonar Distance Radar',
      category: 'Circuits',
      timeAgo: '2 days ago',
      isPublic: true,
      remixCount: 12,
      likeCount: 45,
      componentsCount: 5,
      thumbnailUrl: null,
    },
    {
      id: 'proj_servo_gripper',
      title: 'Precision SG90 Servo Gripper',
      category: 'Circuits',
      timeAgo: '5 days ago',
      isPublic: false,
      remixCount: 1,
      likeCount: 9,
      componentsCount: 4,
      thumbnailUrl: null,
    },
    {
      id: 'proj_smart_lamp',
      title: 'Automatic LDR Smart Night Lamp',
      category: 'Circuits',
      timeAgo: '8 days ago',
      isPublic: true,
      remixCount: 8,
      likeCount: 31,
      componentsCount: 6,
      thumbnailUrl: null,
    },
    {
      id: 'proj_dht11_weather',
      title: 'Brave Snicket-Amur',
      category: 'Circuits',
      timeAgo: '10 days ago',
      isPublic: true,
      remixCount: 6,
      likeCount: 22,
      componentsCount: 5,
      thumbnailUrl: null,
    },
  ]);

  // Code Projects state
  const codeProjects = [
    {
      id: 'code_blink_timer',
      title: 'Non-Blocking Timer Interrupt Blink',
      type: 'Text (C++)',
      board: 'Arduino Uno R3',
      timeAgo: '3 days ago',
      linesCount: 42,
    },
    {
      id: 'code_pid_speed',
      title: 'PID Velocity Loop for DC Motors',
      type: 'Text (C++)',
      board: 'Arduino Uno R3',
      timeAgo: '1 week ago',
      linesCount: 88,
    },
    {
      id: 'code_blockly_maze',
      title: 'Blockly Visual Maze Navigator',
      type: 'Blocks (Blockly)',
      board: 'micro:bit',
      timeAgo: '2 weeks ago',
      linesCount: 15,
    },
  ];

  // 3D Robot Builds state
  const robotBuilds = [
    {
      id: 'robot_4wd_chassis',
      title: '4WD Autonomous Obstacle Rover',
      type: 'Mobile Robot',
      timeAgo: '4 days ago',
      partsCount: 18,
    },
    {
      id: 'robot_arm_3dof',
      title: '3-DOF Articulated Robotic Arm',
      type: 'Manipulator',
      timeAgo: '2 weeks ago',
      partsCount: 14,
    },
  ];

  // Collections state
  const collections = [
    { id: 'col_basics', name: 'Arduino Electronics 101', count: 5, color: '#39FF6A' },
    { id: 'col_hackathon', name: 'National Rover Hackathon 2026', count: 3, color: '#7FE7D6' },
    { id: 'col_iot', name: 'ESP32 Smart Home Sensors', count: 4, color: '#4C8DFF' },
  ];

  // Certificates state
  const certificates = [
    {
      id: 'cert_rover_2026',
      title: 'Autonomous Mobile Robotics & PID Control',
      track: 'Capstone Certification',
      issueDate: 'October 12, 2026',
      verificationHash: 'sha256:7f3a9e2d09c8112a44',
      badge: 'Verified Credential',
    },
    {
      id: 'cert_arduino_essentials',
      title: 'Arduino Electronics & Sensor Telemetry Specialist',
      track: 'Foundation Track',
      issueDate: 'September 28, 2026',
      verificationHash: 'sha256:91c2b8e0147fab2955',
      badge: 'Verified Credential',
    },
  ];

  // City Hackathons data
  const hackathonsByCity = {
    Delhi: [
      {
        id: 'h1',
        title: 'Delhi Robotics Sprint 2026',
        venue: 'IIT Delhi, Hauz Khas',
        date: 'Oct 24-26, 2026',
        prize: '₹1,50,000 Pool',
        teamsLooking: 8,
      },
      {
        id: 'h2',
        title: 'National Autonomous Rover Challenge',
        venue: 'Pragati Maidan, New Delhi',
        date: 'Nov 14-16, 2026',
        prize: '₹2,50,000 Pool',
        teamsLooking: 14,
      },
    ],
    Bengaluru: [
      {
        id: 'h3',
        title: 'Bengaluru IoT & Drone Hackathon',
        venue: 'IISc Bengaluru, Malleshwaram',
        date: 'Nov 02-04, 2026',
        prize: '₹2,00,000 Pool',
        teamsLooking: 11,
      },
    ],
    Mumbai: [
      {
        id: 'h4',
        title: 'Mumbai Autonomous Subsea & Robotics Jam',
        venue: 'IIT Bombay, Powai',
        date: 'Nov 20-22, 2026',
        prize: '₹1,75,000 Pool',
        teamsLooking: 6,
      },
    ],
    Online: [
      {
        id: 'h5',
        title: 'RoboVerse Global Virtual Circuit Sprint',
        venue: 'RoboVerse 3D WebGL Arena',
        date: 'Every Weekend',
        prize: '₹50,000 + Pro Memberships',
        teamsLooking: 25,
      },
    ],
  };

  // Quick Rituu AI submission
  const handleQuickAsk = (text?: string) => {
    const query = text || quickRituuPrompt;
    if (!query.trim()) return;

    setIsRituuAsking(true);
    setRituuQuickReply(null);

    setTimeout(() => {
      setIsRituuAsking(false);
      setRituuQuickReply(
        `💡 Rituu Insight: For "${query}", wire a 220Ω resistor to Pin 9, configure PWM duty cycle using analogWrite(), and ensure common ground between the external 5V power supply and Arduino GND.`
      );
    }, 800);
  };

  // Filter circuits by search query
  const filteredCircuits = circuits.filter((c) =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const studentName = profile?.fullName || 'Aarav Sharma';
  const studentId = studentIdCard?.studentId || 'RV-2026-000101';
  const currentPlan = planTier || 'PRO';

  return (
    <div className="flex h-screen bg-[#07110D] overflow-hidden text-[#EAF7EF] font-sans">
      {/* 1. Left Sidebar (Slim Glass Rail / Nav) */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Translucent Top Bar with Timeline Scrubber */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
          {/* Top Rotating Challenge Banner */}
          <ChallengeBanner />

          {/* 12-Column Responsive Control-Room Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Data Overview, Gauges, Mini-Map, Rituu Quick-Ask (4 Columns on LG) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Student Identity & Data Overview Card */}
              <div className="glass-card p-6 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xl">
                {/* Glowing Neon Top Accent Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#39FF6A] via-[#7FE7D6] to-[#39FF6A] shadow-[0_0_10px_#39FF6A]" />

                {/* Avatar with Journey Level Badge */}
                <div className="relative mt-2">
                  <div className="w-22 h-22 rounded-full bg-gradient-to-tr from-[#39FF6A] to-[#7FE7D6] p-1 shadow-[0_0_16px_rgba(57,255,106,0.4)]">
                    <div className="w-full h-full rounded-full bg-[#07110D] flex items-center justify-center text-2xl font-black text-[#39FF6A]">
                      {studentName.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-[#040B08] text-[#39FF6A] text-[9.5px] font-mono font-black border border-[rgba(57,255,106,0.3)] shadow-xs">
                    LVL {profile?.level || 14}
                  </span>
                </div>

                {/* Student Name & Unique ID */}
                <h3 className="text-lg font-black text-[#EAF7EF] mt-3">
                  {studentName}
                </h3>
                <p className="text-xs font-mono text-[#8FA99B] mt-0.5">
                  {studentId}
                </p>

                {/* Rank & Plan Badge */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]">
                    <Compass className="w-3 h-3" /> Engineer Rank
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[rgba(127,231,214,0.12)] text-[#7FE7D6] border border-[rgba(127,231,214,0.3)]">
                    <Zap className="w-3 h-3 fill-current" /> {currentPlan} Student
                  </span>
                </div>

                {/* XP Progress Bar to Next Level */}
                <div className="w-full mt-4 text-left font-mono">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#8FA99B] mb-1.5">
                    <span>Rank Progress:</span>
                    <span className="text-[#39FF6A]">4,850 / 6,000 XP</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#040B08] border border-[rgba(57,255,106,0.12)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] transition-all duration-500 shadow-[0_0_8px_#39FF6A]"
                      style={{ width: '80.8%' }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8FA99B] mt-1 text-right">
                    1,150 XP until <strong className="text-[#EAF7EF]">Innovator</strong> rank
                  </p>
                </div>

                {/* Data Overview: Hours learned, XP, Streak, Lab Hours */}
                <div className="w-full grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[rgba(57,255,106,0.12)] font-mono">
                  <div>
                    <p className="text-base font-black text-[#EAF7EF]">
                      {profile?.xp || 4850}
                    </p>
                    <p className="text-[9.5px] font-bold text-[#8FA99B] uppercase">Total XP</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-[#39FF6A] flex items-center justify-center gap-0.5">
                      <Flame className="w-4 h-4 fill-current text-[#FF9A1F]" /> 18
                    </p>
                    <p className="text-[9.5px] font-bold text-[#8FA99B] uppercase">Streak</p>
                  </div>
                  <div>
                    <p className="text-base font-black text-[#7FE7D6]">52h</p>
                    <p className="text-[9.5px] font-bold text-[#8FA99B] uppercase">Lab Hours</p>
                  </div>
                </div>

                {/* View 3D Digital Student Passport */}
                <div className="w-full mt-5">
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="w-full btn-primary-neon py-2 text-xs font-bold shadow-[0_0_14px_rgba(57,255,106,0.35)] flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View 3D Student Passport</span>
                  </button>
                </div>
              </div>

              {/* Radial Gauge Card (Milestones: Completed 24 / Planned 53) */}
              <div className="glass-card p-5 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl">
                <HudRadialGauge
                  completed={24}
                  total={53}
                  title="Robotics & Circuit Modules"
                  subtitle="CURRICULUM MILESTONE"
                  accentColor="#39FF6A"
                />
              </div>

              {/* Hardware Mini-Map & City Leaderboard */}
              <MiniMapCard />

              {/* Rituu AI Quick-Ask in Dark Glass Panel */}
              <div className="glass-card p-5 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#EAF7EF]">Rituu AI Quick Mentor</h4>
                    <p className="text-[10px] font-mono text-[#8FA99B]">Ask anything about circuits or code</p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={quickRituuPrompt}
                    onChange={(e) => setQuickRituuPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAsk()}
                    placeholder="e.g. How to wire HC-SR04 with buzzer?"
                    className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] focus:border-[#39FF6A] text-xs font-mono text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuickAsk()}
                    disabled={isRituuAsking}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#39FF6A] text-[#07110D] hover:brightness-110 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>

                {/* Prompt Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {[
                    'Debug circuit wiring',
                    'Arduino Servo Sweep',
                    'Fix short circuit',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setQuickRituuPrompt(chip);
                        handleQuickAsk(chip);
                      }}
                      className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.08)] border border-[rgba(57,255,106,0.2)] text-[#39FF6A] hover:bg-[rgba(57,255,106,0.18)] transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* AI Reply Card */}
                {rituuQuickReply && (
                  <div className="mt-3 p-3 rounded-xl bg-[#040B08] border border-[rgba(168,85,247,0.3)] text-xs text-[#EAF7EF] animate-slide-up">
                    {rituuQuickReply}
                    <div className="mt-2 flex justify-end">
                      <Link
                        href="/rituu"
                        className="text-[10px] font-mono font-bold text-purple-400 hover:underline flex items-center gap-1"
                      >
                        Open full Rituu lab chat <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Hackathons in My City */}
              <div className="glass-card p-5 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#FF9A1F]" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EAF7EF]">
                      Hackathons in My City
                    </h4>
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value as any)}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#39FF6A] focus:outline-none"
                  >
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Online">Online / Global</option>
                  </select>
                </div>

                <div className="space-y-2.5">
                  {hackathonsByCity[selectedCity].map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-[#040B08]/70 border border-[rgba(57,255,106,0.10)]"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#7FE7D6]">
                        <span>{h.date}</span>
                        <span className="text-[#39FF6A]">{h.prize}</span>
                      </div>
                      <h5 className="text-xs font-bold text-[#EAF7EF] mt-1">
                        {h.title}
                      </h5>
                      <p className="text-[10px] text-[#8FA99B] font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#FF4D4D]" />
                        <span>{h.venue}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-[rgba(57,255,106,0.08)]">
                        <span className="text-[10px] font-mono text-[#8FA99B]">
                          {h.teamsLooking} teams looking
                        </span>
                        <Link
                          href="/hackathons"
                          className="text-[10px] font-mono font-bold text-[#39FF6A] hover:underline"
                        >
                          Join Team &gt;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 3D Lab Scene (Hero), Status Tiles, Tinkercad Rows (8 Columns on LG) */}
            <div className="lg:col-span-8 space-y-8">
              {/* ============================================================== */}
              {/* HERO & DASHBOARD CENTRE: Interactive 3D RoboVerse Lab Scene */}
              {/* ============================================================== */}
              <div className="glass-card overflow-hidden bg-[#07110D]/80 border border-[rgba(57,255,106,0.25)] shadow-[0_12px_50px_rgba(7,27,19,0.9)] relative">
                <div className="absolute top-4 left-5 z-10 flex items-center gap-2 pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] animate-ping" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EAF7EF] drop-shadow-md">
                    ROBOVERSE_LAB // 3D CONTROL ROOM
                  </h3>
                </div>

                <div className="w-full h-[460px] md:h-[540px]">
                  <RobotArmScene />
                </div>
              </div>

              {/* Status Tiles in a Glass Card (Total Projects / In Progress / Completed / Needs Fix) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8FA99B]">
                    Active Robot Fleet Telemetry
                  </h4>
                  <span className="text-[10px] font-mono text-[#39FF6A] flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-pulse" />
                    3 SYSTEMS LINKED
                  </span>
                </div>
                <RobotStatusTiles />
              </div>

              {/* Top Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  icon={Cpu}
                  title="Circuits Designed"
                  value={circuits.length.toString()}
                  deltaText="+3 this week"
                  isPositiveDelta={true}
                  segments={[
                    { label: 'Basic', percentage: 40, color: '#39FF6A' },
                    { label: 'Arduino', percentage: 35, color: '#7FE7D6' },
                    { label: 'Robots', percentage: 25, color: '#4C8DFF' },
                  ]}
                />
                <StatCard
                  icon={Code2}
                  title="Arduino Sketches"
                  value="24"
                  deltaText="+120 LOC"
                  isPositiveDelta={true}
                  segments={[
                    { label: 'C++', percentage: 65, color: '#7FE7D6' },
                    { label: 'Blockly', percentage: 35, color: '#A855F7' },
                  ]}
                />
              </div>

              {/* ============================================================== */}
              {/* SECTION: Sample Projects (Official Starters) */}
              {/* ============================================================== */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'sample-projects') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-black text-[#EAF7EF]">
                        Sample Projects
                      </h3>
                      <span className="text-xs font-mono text-[#8FA99B]">(Official Starters)</span>
                    </div>
                    <Link
                      href="/workbench"
                      className="text-xs font-mono font-bold text-[#39FF6A] hover:underline flex items-center gap-1"
                    >
                      View all in Lab <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sampleProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="group glass-card p-5 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex flex-col justify-between hover:border-[rgba(57,255,106,0.35)] hover:shadow-[0_0_20px_rgba(57,255,106,0.2)] transition-all duration-200"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full ${proj.tagBg}`}>
                              {proj.tag}
                            </span>
                            <span className="text-[10px] font-mono text-[#8FA99B]">
                              {proj.difficulty}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#EAF7EF] group-hover:text-[#39FF6A] transition-colors">
                            {proj.title}
                          </h4>
                          <p className="text-[11px] text-[#8FA99B] mt-1.5 line-clamp-3 leading-relaxed">
                            {proj.description}
                          </p>

                          {/* Components Preview */}
                          <div className="mt-3 pt-3 border-t border-[rgba(57,255,106,0.10)] font-mono">
                            <span className="text-[9.5px] font-bold text-[#8FA99B] uppercase tracking-wider">
                              Components ({proj.componentsCount}):
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {proj.components.slice(0, 3).map((comp, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-[#040B08] text-[#CBD8D0] border border-[rgba(57,255,106,0.15)]"
                                >
                                  {comp}
                                </span>
                              ))}
                              {proj.components.length > 3 && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-[#39FF6A]">
                                  +{proj.components.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-5 pt-3 border-t border-[rgba(57,255,106,0.10)] flex items-center gap-2">
                          <Link
                            href={proj.href}
                            className="flex-1 py-1.5 text-center text-xs font-bold rounded-full bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.35)] hover:brightness-110 transition-all flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Open in Lab</span>
                          </Link>
                          <Link
                            href={`${proj.href}&view=schematic`}
                            className="px-3 py-1.5 text-xs font-mono font-bold rounded-full bg-[rgba(57,255,106,0.10)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)] hover:bg-[rgba(57,255,106,0.20)] transition-colors"
                            title="View Schematic"
                          >
                            Schematic
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Filter & Search Toolbar (Tinkercad-style rows in dark glass) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[rgba(57,255,106,0.12)]">
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'all', label: 'All Projects' },
                    { id: 'circuits', label: `Circuits (${circuits.length})` },
                    { id: 'sample-projects', label: 'Sample Projects (3)' },
                    { id: 'code', label: `Code (${codeProjects.length})` },
                    { id: '3d', label: `3D Builds (${robotBuilds.length})` },
                    { id: 'collections', label: `Collections (${collections.length})` },
                    { id: 'certificates', label: `Certificates (${certificates.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategoryTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap ${
                        activeCategoryTab === tab.id
                          ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_10px_rgba(57,255,106,0.4)]'
                          : 'text-[#8FA99B] hover:text-[#EAF7EF] bg-[#0E2A1F]/50 border border-[rgba(57,255,106,0.15)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search & Grid/List View Toggle */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA99B]" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search my projects..."
                      className="pl-8 pr-3 py-1.5 rounded-full bg-[#040B08] border border-[rgba(57,255,106,0.15)] text-xs font-mono text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none focus:border-[#39FF6A] w-44"
                    />
                  </div>

                  <div className="flex items-center p-1 bg-[#040B08] rounded-full border border-[rgba(57,255,106,0.15)]">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === 'grid' ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A]' : 'text-[#8FA99B]'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-full transition-colors ${
                        viewMode === 'list' ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A]' : 'text-[#8FA99B]'
                      }`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: Circuits (My Saved Circuits) */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'circuits') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#39FF6A]" />
                      <h3 className="text-base font-black text-[#EAF7EF]">
                        Circuits
                      </h3>
                      <span className="text-xs font-mono text-[#8FA99B]">
                        ({filteredCircuits.length})
                      </span>
                    </div>
                    <Link
                      href="/workbench"
                      className="text-xs font-mono font-bold text-[#39FF6A] hover:underline flex items-center gap-1"
                    >
                      View all in Lab <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Add Placeholder Card */}
                      <AddPlaceholderCard
                        onClick={() => router.push('/workbench')}
                        title="Create New Circuit"
                        subtitle="Launch 3D & 2D workshop"
                      />

                      {filteredCircuits.map((c) => (
                        <ItemCard
                          key={c.id}
                          id={c.id}
                          title={c.title}
                          category={c.category}
                          timeAgo={c.timeAgo}
                          isPublic={c.isPublic}
                          remixCount={c.remixCount}
                          likeCount={c.likeCount}
                          componentsCount={c.componentsCount}
                          onSimulate={() => router.push(`/workbench?project=${c.id}`)}
                          onDuplicate={() => {
                            const newCircuit = {
                              ...c,
                              id: `proj_${Date.now()}`,
                              title: `${c.title} (Copy)`,
                              timeAgo: 'Just now',
                            };
                            setCircuits([newCircuit, ...circuits]);
                          }}
                          onDelete={() => {
                            setCircuits(circuits.filter((item) => item.id !== c.id));
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredCircuits.map((c) => (
                        <div
                          key={c.id}
                          className="glass-card p-3 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A] flex items-center justify-center shrink-0">
                              <Cpu className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#EAF7EF] truncate">{c.title}</h4>
                              <p className="text-[10px] font-mono text-[#8FA99B]">{c.timeAgo} • {c.componentsCount} parts</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/workbench?project=${c.id}`}
                              className="px-3 py-1 rounded-full text-xs font-bold bg-[#39FF6A] text-[#07110D] hover:brightness-110"
                            >
                              Simulate
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: Code Projects */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'code') && (
                <div className="space-y-4 pt-4 border-t border-[rgba(57,255,106,0.12)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-[#7FE7D6]" />
                      <h3 className="text-base font-black text-[#EAF7EF]">
                        Code Projects
                      </h3>
                      <span className="text-xs font-mono text-[#8FA99B]">({codeProjects.length})</span>
                    </div>
                    <Link
                      href="/workbench?tab=code"
                      className="text-xs font-mono font-bold text-[#7FE7D6] hover:underline flex items-center gap-1"
                    >
                      View more <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {codeProjects.map((p) => (
                      <div
                        key={p.id}
                        className="glass-card p-4 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#8FA99B] mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-[rgba(127,231,214,0.12)] text-[#7FE7D6] border border-[rgba(127,231,214,0.3)]">
                              {p.type}
                            </span>
                            <span>{p.timeAgo}</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#EAF7EF] line-clamp-2">
                            {p.title}
                          </h4>
                          <p className="text-[11px] text-[#8FA99B] mt-1 font-mono">{p.board}</p>
                        </div>
                        <div className="mt-4 pt-2 border-t border-[rgba(57,255,106,0.10)] flex items-center justify-between font-mono">
                          <span className="text-[10px] text-[#8FA99B]">{p.linesCount} lines</span>
                          <Link
                            href={`/workbench?code=${p.id}`}
                            className="text-xs font-bold text-[#39FF6A] hover:underline"
                          >
                            Open in Monaco
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: 3D Designs & Robot Builds */}
              {(activeCategoryTab === 'all' || activeCategoryTab === '3d') && (
                <div className="space-y-4 pt-4 border-t border-[rgba(57,255,106,0.12)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="w-5 h-5 text-[#39FF6A]" />
                      <h3 className="text-base font-black text-[#EAF7EF]">
                        3D Designs & Robot Builds
                      </h3>
                      <span className="text-xs font-mono text-[#8FA99B]">({robotBuilds.length})</span>
                    </div>
                    <Link
                      href="/workbench?mode=3d"
                      className="text-xs font-mono font-bold text-[#39FF6A] hover:underline flex items-center gap-1"
                    >
                      View more <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {robotBuilds.map((b) => (
                      <div
                        key={b.id}
                        className="glass-card p-4 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] flex items-center gap-4"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A] flex items-center justify-center shrink-0">
                          <Box className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-[#39FF6A] uppercase">{b.type}</span>
                          <h4 className="text-xs font-bold text-[#EAF7EF] truncate">
                            {b.title}
                          </h4>
                          <p className="text-[11px] text-[#8FA99B] font-mono mt-0.5">{b.partsCount} mechanical parts</p>
                        </div>
                        <Link
                          href={`/workbench?robot=${b.id}`}
                          className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] hover:bg-[#39FF6A] hover:text-[#07110D] transition-colors shrink-0"
                        >
                          View 3D
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Collections */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'collections') && (
                <div className="space-y-4 pt-4 border-t border-[rgba(57,255,106,0.12)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-[#39FF6A]" />
                      <h3 className="text-base font-black text-[#EAF7EF]">
                        Collections
                      </h3>
                      <span className="text-xs font-mono text-[#8FA99B]">({collections.length})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {collections.map((col) => (
                      <div
                        key={col.id}
                        className="glass-card p-4 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] flex items-center gap-3.5"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                          style={{ backgroundColor: `${col.color}20`, border: `1px solid ${col.color}50`, color: col.color }}
                        >
                          <Bookmark className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#EAF7EF] truncate">
                            {col.name}
                          </h4>
                          <p className="text-[11px] text-[#8FA99B] font-mono">{col.count} projects stored</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: Certificates & Verified Credentials (dark glass cards with neon seal) */}
              {(activeCategoryTab === 'all' || activeCategoryTab === 'certificates') && (
                <div className="space-y-4 pt-4 border-t border-[rgba(57,255,106,0.12)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#39FF6A]" />
                      <h3 className="text-base font-black text-[#EAF7EF]">
                        Certificates & Verified Credentials
                      </h3>
                      <span className="text-xs font-mono text-[#8FA99B]">({certificates.length})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="glass-card p-5 bg-[#0E2A1F]/50 border border-[rgba(57,255,106,0.25)] relative overflow-hidden backdrop-blur-xl"
                      >
                        {/* Neon Seal in Top Right */}
                        <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-[rgba(57,255,106,0.15)] border border-[#39FF6A] flex items-center justify-center shadow-[0_0_15px_rgba(57,255,106,0.3)]">
                          <ShieldCheck className="w-6 h-6 text-[#39FF6A]" />
                        </div>

                        <span className="text-[10px] font-mono font-bold text-[#7FE7D6] uppercase tracking-wider">
                          {cert.track}
                        </span>
                        <h4 className="text-sm font-bold text-[#EAF7EF] mt-1 pr-12">
                          {cert.title}
                        </h4>
                        <p className="text-[11px] text-[#8FA99B] font-mono mt-1">
                          Issued on {cert.issueDate}
                        </p>
                        <p className="text-[9.5px] font-mono text-[#527063] mt-2 truncate">
                          HASH: {cert.verificationHash}
                        </p>

                        <div className="mt-4 pt-3 border-t border-[rgba(57,255,106,0.12)] flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]">
                            {cert.badge}
                          </span>
                          <button
                            onClick={() => alert(`Downloading verified PDF certificate for ${cert.title}...`)}
                            className="text-xs font-mono font-bold text-[#39FF6A] hover:underline"
                          >
                            Download PDF ↓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Simulation Scrubber */}
              <div className="pt-4 border-t border-[rgba(57,255,106,0.12)]">
                <TimelineScrubber />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Onboarding Journey Modal */}
      <OnboardingJourneyModal
        isOpen={showOnboarding}
        onClose={handleFinishOnboarding}
      />
    </div>
  );
}
