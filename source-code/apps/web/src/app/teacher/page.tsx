'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../../components/brand/Logo';
import { useAuthStore } from '../../store/useAuthStore';
import {
  Users,
  GraduationCap,
  Layers,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  Cpu,
  Terminal,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Play,
} from 'lucide-react';

interface StudentRosterItem {
  id: string;
  studentId: string;
  fullName: string;
  school: string;
  currentLesson: string;
  progressPct: number;
  completedLessons: number;
  totalLessons: number;
  lastActive: string;
  status: 'active' | 'needs_help' | 'ahead';
  activeProject: string;
}

const MOCK_STUDENTS: StudentRosterItem[] = [
  {
    id: '1',
    studentId: 'RV-2026-000101',
    fullName: 'Aarav Sharma',
    school: 'Delhi Public School, R.K. Puram',
    currentLesson: 'Lesson 12: Analog PWM Speed Control',
    progressPct: 75,
    completedLessons: 12,
    totalLessons: 16,
    lastActive: '12 mins ago',
    status: 'ahead',
    activeProject: 'Autonomous 2-Wheel Line Follower',
  },
  {
    id: '2',
    studentId: 'RV-2026-000104',
    fullName: 'Diya Patel',
    school: 'Delhi Public School, R.K. Puram',
    currentLesson: 'Lesson 8: Ultrasonic Sonar Echo Timing',
    progressPct: 50,
    completedLessons: 8,
    totalLessons: 16,
    lastActive: '1 hour ago',
    status: 'active',
    activeProject: '180° Obstacle Radar Sweep',
  },
  {
    id: '3',
    studentId: 'RV-2026-000115',
    fullName: 'Kabir Verma',
    school: 'Delhi Public School, R.K. Puram',
    currentLesson: 'Lesson 5: Pull-down Resistors & Debouncing',
    progressPct: 31,
    completedLessons: 5,
    totalLessons: 16,
    lastActive: '2 days ago',
    status: 'needs_help',
    activeProject: 'Push Button & Piezo Buzzer',
  },
  {
    id: '4',
    studentId: 'RV-2026-000128',
    fullName: 'Ananya Iyer',
    school: 'Delhi Public School, R.K. Puram',
    currentLesson: 'Lesson 16: Final Capstone Certification',
    progressPct: 100,
    completedLessons: 16,
    totalLessons: 16,
    lastActive: 'Just now',
    status: 'ahead',
    activeProject: '4-DOF Robotic Arm Servo Controller',
  },
];

export default function TeacherDashboardPage() {
  const { profile } = useAuthStore();
  const [selectedBatch, setSelectedBatch] = useState('batch_grade9');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [gradeStatus, setGradeStatus] = useState<Record<string, 'passed' | 'revision'>>({});

  const filteredStudents = MOCK_STUDENTS.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGrade = (id: string, status: 'passed' | 'revision') => {
    setGradeStatus((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text flex flex-col font-sans selection:bg-robo-neon selection:text-black">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-[#040C08]/90 border-b border-robo-borderSubtle flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Logo variant="horizontal" size="sm" />
          <div className="h-5 w-px bg-robo-borderSubtle hidden sm:block" />
          <span className="text-xs font-mono font-bold text-robo-teal hidden sm:flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-robo-neon" />
            TEACHER COMMAND CONSOLE // ROBOVERSE EDU
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-xs font-mono text-robo-textSecondary hover:text-robo-text transition-colors"
          >
            Switch to Student View
          </Link>
          <div className="w-8 h-8 rounded-lg bg-robo-neon/20 border border-robo-neon/40 flex items-center justify-center text-xs font-mono font-bold text-robo-neon">
            {profile?.fullName?.charAt(0) || 'T'}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>ACTIVE BATCHES</span>
              <Layers className="w-4 h-4 text-robo-teal" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-neon">3 Batches</div>
            <div className="text-xs text-robo-textSecondary mt-1">Grade 9, 10 & 11 STEM</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>ENROLLED STUDENTS</span>
              <Users className="w-4 h-4 text-robo-neon" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-text">84 Students</div>
            <div className="text-xs text-robo-neon mt-1">92% active this week</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>PENDING LAB REVIEWS</span>
              <Clock className="w-4 h-4 text-robo-orange" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-orange">5 Submissions</div>
            <div className="text-xs text-robo-textSecondary mt-1">Circuit simulations awaiting review</div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-robo-borderSubtle bg-[#040E0A]">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textMuted mb-2">
              <span>AVG CURRICULUM MASTERY</span>
              <BarChart3 className="w-4 h-4 text-robo-teal" />
            </div>
            <div className="text-2xl font-mono font-bold text-robo-teal">78.4%</div>
            <div className="text-xs text-robo-textSecondary mt-1">+14% vs last semester</div>
          </div>
        </div>

        {/* Batch Selection & Student Roster */}
        <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle space-y-5 bg-[#040D09]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-robo-borderSubtle/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-robo-text font-sans flex items-center gap-2">
                <Users className="w-5 h-5 text-robo-neon" />
                <span>Class Roster & Real-Time Progress</span>
              </h3>
              <p className="text-xs text-robo-textSecondary mt-0.5">
                Track live simulator activity, Arduino firmware completions, and lab milestones.
              </p>
            </div>

            {/* Batch Selector & Search Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="bg-black/60 border border-robo-borderSubtle rounded-xl px-3 py-1.5 text-xs text-robo-text font-mono focus:border-robo-neon outline-none"
              >
                <option value="batch_grade9">Grade 9: Robotics & Arduino Basics (Section A)</option>
                <option value="batch_grade10">Grade 10: Embedded C++ & Sensor Interfacing</option>
                <option value="batch_grade11">Grade 11: Autonomous Robotics Capstone</option>
              </select>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-xs text-robo-text flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-robo-textMuted" />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-robo-text placeholder:text-robo-textMuted focus:outline-none w-36"
                />
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="text-[11px] font-mono text-robo-textMuted border-b border-robo-borderSubtle/60 uppercase">
                <tr>
                  <th className="pb-3 px-3">Student</th>
                  <th className="pb-3 px-3">Current Lesson</th>
                  <th className="pb-3 px-3">Progress</th>
                  <th className="pb-3 px-3">Active Circuit</th>
                  <th className="pb-3 px-3">Last Active</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-robo-borderSubtle/30">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-robo-surfaceRaised/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-robo-text">{st.fullName}</div>
                      <div className="text-[10px] font-mono text-robo-teal">{st.studentId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-robo-textSecondary font-medium">{st.currentLesson}</div>
                      <div className="text-[10px] font-mono text-robo-textMuted">
                        {st.completedLessons}/{st.totalLessons} Lessons Done
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-black/60 rounded-full overflow-hidden border border-robo-borderSubtle">
                          <div
                            className="h-full bg-robo-neon rounded-full"
                            style={{ width: `${st.progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-robo-neon font-bold">
                          {st.progressPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-black/50 border border-robo-teal/30 text-[10px] font-mono text-robo-teal">
                        {st.activeProject}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-robo-textMuted font-mono text-[11px]">
                      {st.lastActive}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/workbench?studentId=${st.studentId}`}
                          className="px-2.5 py-1 rounded-lg bg-robo-neon/15 hover:bg-robo-neon text-robo-neon hover:text-black border border-robo-neon/40 font-mono text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                          title="Inspect Student 3D Workbench"
                        >
                          <Cpu className="w-3 h-3" />
                          <span>Inspect</span>
                        </Link>
                        <Link
                          href={`/verify/student/${st.studentId}`}
                          className="p-1 rounded-lg bg-black/50 hover:bg-robo-surfaceRaised text-robo-textSecondary hover:text-robo-text border border-robo-borderSubtle"
                          title="View Verified Credentials"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Submissions Grading Queue */}
        <div className="rounded-2xl glass-panel p-6 border border-robo-borderSubtle space-y-4 bg-[#040C08]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-robo-text font-sans flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-robo-teal" />
                <span>Assignment & Lab Milestone Grading Queue</span>
              </h3>
              <p className="text-xs text-robo-textSecondary mt-0.5">
                Review simulator test runs, MNA nodal voltage checks, and firmware code submitted by students.
              </p>
            </div>
            <span className="text-xs font-mono text-robo-orange font-bold px-2.5 py-1 rounded-full bg-robo-orange/15 border border-robo-orange/30">
              3 Requires Grading
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Submission 1 */}
            <div className="p-4 rounded-xl bg-[#040E0A] border border-robo-borderSubtle space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-robo-text">Autonomous Line Follower</h4>
                  <p className="text-[10px] font-mono text-robo-teal">By Aarav Sharma (RV-2026-000101)</p>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-robo-orange/20 text-robo-orange border border-robo-orange/40 font-bold">
                  SUBMITTED
                </span>
              </div>
              <p className="text-[11px] text-robo-textSecondary leading-snug">
                Completed dual IR analog calibration on black vinyl surface. PID loop achieved 98.2% lap stability.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-robo-borderSubtle/50 text-[10px] font-mono">
                <Link
                  href="/workbench?sample=line_follower"
                  className="text-robo-neon hover:underline flex items-center gap-1"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Test Run in 3D</span>
                </Link>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleGrade('sub1', 'revision')}
                    className="px-2 py-0.5 rounded bg-black/60 hover:bg-robo-orange/20 text-robo-textMuted hover:text-robo-orange border border-robo-borderSubtle"
                  >
                    Request Rev
                  </button>
                  <button
                    onClick={() => handleGrade('sub1', 'passed')}
                    className="px-2 py-0.5 rounded bg-robo-neon/20 hover:bg-robo-neon text-robo-neon hover:text-black border border-robo-neon/40 font-bold"
                  >
                    {gradeStatus['sub1'] === 'passed' ? 'Approved ✓' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>

            {/* Submission 2 */}
            <div className="p-4 rounded-xl bg-[#040E0A] border border-robo-borderSubtle space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-robo-text">RGB Traffic Controller</h4>
                  <p className="text-[10px] font-mono text-robo-teal">By Diya Patel (RV-2026-000104)</p>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-robo-orange/20 text-robo-orange border border-robo-orange/40 font-bold">
                  SUBMITTED
                </span>
              </div>
              <p className="text-[11px] text-robo-textSecondary leading-snug">
                Non-blocking <code className="text-robo-teal font-mono">millis()</code> state machine with crosswalk buzzer audio tone.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-robo-borderSubtle/50 text-[10px] font-mono">
                <Link
                  href="/workbench?sample=traffic_light"
                  className="text-robo-neon hover:underline flex items-center gap-1"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Test Run in 3D</span>
                </Link>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleGrade('sub2', 'revision')}
                    className="px-2 py-0.5 rounded bg-black/60 hover:bg-robo-orange/20 text-robo-textMuted hover:text-robo-orange border border-robo-borderSubtle"
                  >
                    Request Rev
                  </button>
                  <button
                    onClick={() => handleGrade('sub2', 'passed')}
                    className="px-2 py-0.5 rounded bg-robo-neon/20 hover:bg-robo-neon text-robo-neon hover:text-black border border-robo-neon/40 font-bold"
                  >
                    {gradeStatus['sub2'] === 'passed' ? 'Approved ✓' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>

            {/* Submission 3 */}
            <div className="p-4 rounded-xl bg-[#040E0A] border border-robo-borderSubtle space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-robo-text">4-DOF Robotic Arm</h4>
                  <p className="text-[10px] font-mono text-robo-teal">By Ananya Iyer (RV-2026-000128)</p>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-robo-neon/20 text-robo-neon border border-robo-neon/40 font-bold">
                  CAPSTONE
                </span>
              </div>
              <p className="text-[11px] text-robo-textSecondary leading-snug">
                Inverse kinematics algorithm controlling 4 SG90 servos for precision pick-and-place task in physics arena.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-robo-borderSubtle/50 text-[10px] font-mono">
                <Link
                  href="/workbench?sample=robotic_arm"
                  className="text-robo-neon hover:underline flex items-center gap-1"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Test Run in 3D</span>
                </Link>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleGrade('sub3', 'passed')}
                    className="px-3 py-0.5 rounded bg-robo-neon/20 hover:bg-robo-neon text-robo-neon hover:text-black border border-robo-neon/40 font-bold"
                  >
                    {gradeStatus['sub3'] === 'passed' ? 'Certified ✓' : 'Award Certificate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
