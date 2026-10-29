'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import {
  GraduationCap,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Send,
  Video,
  FileText,
  KeyRound,
  X,
  ExternalLink,
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
  code: string;
  instructor: string;
  institution: string;
  studentCount: number;
  activeAssignments: number;
  nextSession: string;
  isEnrolled: boolean;
  bannerColor: string;
}

export default function ClassesPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinStatus, setJoinStatus] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: 'cls_iitd_robotics',
      name: 'Autonomous Robotics & Sensor Integration',
      code: 'ROBO-IITD-2026',
      instructor: 'Dr. Rahul Verma',
      institution: 'Delhi Technological University / IIT Delhi',
      studentCount: 38,
      activeAssignments: 2,
      nextSession: 'Today at 5:00 PM IST',
      isEnrolled: true,
      bannerColor: 'from-[#0E2A1F] to-[#123E2D]',
    },
    {
      id: 'cls_arduino_iot',
      name: 'Arduino Microcontrollers & IoT Embedded Systems',
      code: 'ARDUINO-101-DELHI',
      instructor: 'Prof. Ananya Rao',
      institution: 'Netaji Subhas University of Technology',
      studentCount: 52,
      activeAssignments: 1,
      nextSession: 'Thursday at 3:30 PM IST',
      isEnrolled: true,
      bannerColor: 'from-[#0A2218] to-[#174632]',
    },
    {
      id: 'cls_ros2_slam',
      name: 'ROS 2 Navigation, LiDAR & Edge Computer Vision',
      code: 'ROS2-MASTERS-2026',
      instructor: 'Vikram Joshi (AI Robotics Lab)',
      institution: 'RoboVerse Pro Mentorship Track',
      studentCount: 24,
      activeAssignments: 3,
      nextSession: 'Saturday at 11:00 AM IST',
      isEnrolled: false,
      bannerColor: 'from-[#071F15] to-[#0F3524]',
    },
  ]);

  const assignments = [
    {
      id: 'asg_pid_rover',
      className: 'Autonomous Robotics & Sensor Integration',
      title: 'Lab Assignment 3: PID Line Follower Circuit & Simulation',
      due: 'Friday, Oct 24 • 11:59 PM',
      status: 'In Progress',
      rubric: 'MNA nodal analysis, zero short circuits, tuned Kp/Ki/Kd parameters in Arduino C++ sketch.',
      points: '100 Pts',
      href: '/workbench?starter=starter_line_follower',
    },
    {
      id: 'asg_sonar_radar',
      className: 'Arduino Microcontrollers & IoT Embedded Systems',
      title: 'Lab Assignment 2: Ultrasonic Sonar Radar with Virtual Serial Plotter',
      due: 'Sunday, Oct 26 • 6:00 PM',
      status: 'Not Started',
      rubric: 'Send angular distance telemetry over UART 9600 baud to the Serial Plotter.',
      points: '50 Pts',
      href: '/workbench?starter=starter_sonar_radar',
    },
  ];

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;

    setJoinStatus('Checking code on institution ledger...');
    setTimeout(() => {
      setClasses((prev) =>
        prev.map((c) =>
          c.code.toLowerCase() === classCodeInput.trim().toLowerCase()
            ? { ...c, isEnrolled: true }
            : c
        )
      );
      setJoinStatus('Enrolled successfully! Redirecting to classroom dashboard...');
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinStatus(null);
        setClassCodeInput('');
      }, 1000);
    }, 700);
  };

  return (
    <div className="flex h-screen bg-[#07110D] overflow-hidden text-[#EAF7EF] font-sans">
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8">
          {/* Header Title & Join Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[#EAF7EF]">
                  My Classes & Teacher Workspaces
                </h1>
              </div>
              <p className="text-xs text-[#8FA99B] mt-1 font-mono">
                Collaborate with mentors, submit simulated lab circuits, and track classroom assignments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="btn-primary-neon px-4 py-2 text-xs font-bold shadow-neon-pill flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Join Class with Code</span>
              </button>
            </div>
          </div>

          {/* Classes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] overflow-hidden flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:border-[rgba(57,255,106,0.35)] transition-all"
              >
                <div>
                  {/* Decorative Banner */}
                  <div className={`h-24 bg-gradient-to-r ${cls.bannerColor} p-4 flex items-start justify-between text-[#EAF7EF] relative border-b border-[rgba(57,255,106,0.15)]`}>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/50 border border-[rgba(57,255,106,0.25)] text-[#39FF6A] backdrop-blur-xs">
                      {cls.code}
                    </span>
                    {cls.isEnrolled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0E2A1F] border border-[rgba(57,255,106,0.3)] text-[#39FF6A]">
                        <CheckCircle2 className="w-3 h-3 text-[#39FF6A]" /> Enrolled
                      </span>
                    )}
                  </div>

                  {/* Class Info */}
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-[#EAF7EF] line-clamp-2">
                      {cls.name}
                    </h3>
                    <p className="text-[11px] text-[#8FA99B] mt-1">
                      Instructor: <strong className="text-[#EAF7EF]">{cls.instructor}</strong>
                    </p>
                    <p className="text-[10.5px] text-[#8FA99B] truncate font-mono">{cls.institution}</p>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[rgba(57,255,106,0.12)] text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#8FA99B] uppercase font-semibold">Roster</span>
                        <p className="font-bold flex items-center gap-1 mt-0.5 text-[#EAF7EF]">
                          <Users className="w-3.5 h-3.5 text-[#39FF6A]" /> {cls.studentCount} Students
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8FA99B] uppercase font-semibold">Active Tasks</span>
                        <p className="font-bold flex items-center gap-1 mt-0.5 text-[#EAF7EF]">
                          <FileText className="w-3.5 h-3.5 text-[#4C8DFF]" /> {cls.activeAssignments} Labs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-[#040B08]/80 border-t border-[rgba(57,255,106,0.12)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#7FE7D6] font-semibold text-[11px] font-mono">
                    <Video className="w-3.5 h-3.5" />
                    <span>{cls.nextSession}</span>
                  </div>

                  {cls.isEnrolled ? (
                    <button className="px-3.5 py-1.5 rounded-full bg-[rgba(57,255,106,0.15)] hover:bg-[#39FF6A] text-[#39FF6A] hover:text-[#07110D] border border-[rgba(57,255,106,0.3)] font-bold text-xs transition-colors font-mono">
                      Enter Class
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setClassCodeInput(cls.code);
                        setIsJoinModalOpen(true);
                      }}
                      className="btn-primary-neon px-3.5 py-1.5 rounded-full text-xs font-bold font-mono"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Active Homework & Lab Assignments Section */}
          <div className="space-y-4 pt-4 border-t border-[rgba(57,255,106,0.15)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#39FF6A]" />
                <h2 className="text-base font-black text-[#EAF7EF]">
                  Pending Lab Assignments & Circuit Submissions
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="rounded-2xl p-5 bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)]">
                        {asg.className}
                      </span>
                      <span className="text-[11px] font-mono text-[#7FE7D6] font-bold">
                        {asg.points}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#EAF7EF]">
                      {asg.title}
                    </h4>
                    <p className="text-xs text-[#8FA99B]">{asg.rubric}</p>
                    <p className="text-[11px] font-mono font-semibold text-[#FF9A1F] flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" /> Due: {asg.due}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <Link
                      href={asg.href}
                      className="btn-primary-neon px-4 py-2 text-xs font-bold shadow-neon-pill flex items-center gap-1.5 font-mono"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Lab Canvas</span>
                    </Link>
                    <button
                      onClick={() => alert(`Submitting circuit for assignment ${asg.id}...`)}
                      className="px-4 py-2 text-xs font-mono font-bold rounded-full bg-[rgba(255,255,255,0.05)] text-[#EAF7EF] hover:bg-[#39FF6A]/20 hover:text-[#39FF6A] border border-[rgba(57,255,106,0.2)] transition-colors"
                    >
                      Submit Circuit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Join Class with Invite Code Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0A1F17]/95 rounded-3xl p-6 shadow-2xl border border-[rgba(57,255,106,0.3)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#EAF7EF]">Join a Class</h3>
              </div>
              <button onClick={() => setIsJoinModalOpen(false)}>
                <X className="w-4 h-4 text-[#8FA99B] hover:text-[#39FF6A]" />
              </button>
            </div>

            <p className="text-xs text-[#8FA99B] mt-2 font-mono">
              Ask your teacher or university mentor for the 6 to 12 character class invite code (e.g. <code>ROBO-IITD-2026</code>).
            </p>

            <form onSubmit={handleJoinClass} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#EAF7EF] uppercase tracking-wider">
                  Class Invite Code
                </label>
                <input
                  type="text"
                  value={classCodeInput}
                  onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ROBO-IITD-2026"
                  className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-xs font-mono font-bold text-[#EAF7EF] uppercase tracking-wider focus:outline-none focus:border-[#39FF6A]"
                />
              </div>

              {joinStatus && (
                <div className="p-2.5 rounded-xl bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] text-xs font-mono font-semibold animate-fade-in">
                  {joinStatus}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-mono font-bold text-[#8FA99B] hover:text-[#EAF7EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-neon px-5 py-2 text-xs font-bold shadow-neon-pill"
                >
                  Verify &amp; Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}