'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Code2,
  Box,
  Compass,
  Zap,
  Flame,
  Check,
  X,
} from 'lucide-react';
import { StudentIdCard3D } from './StudentIdCard3D';

interface OnboardingJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentId?: string;
  schoolName?: string;
}

export function OnboardingJourneyModal({
  isOpen,
  onClose,
  studentName = 'Aarav Sharma',
  studentId = 'RV-2026-000101',
  schoolName = 'Delhi Technological University',
}: OnboardingJourneyModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Quiz state
  const [selectedLevel, setSelectedLevel] = useState<'rookie' | 'builder' | 'engineer' | 'innovator'>('builder');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['arduino', 'robotics']);
  const [primaryGoal, setPrimaryGoal] = useState<'hackathons' | 'college' | 'career' | 'hobby'>('hackathons');

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLaunchFirstMission = () => {
    onClose();
    router.push('/workbench?starter=starter_blink');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-[#0A1F17]/95 rounded-3xl shadow-2xl border border-[rgba(57,255,106,0.3)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#EAF7EF]">
        {/* Top Header with Progress Bar */}
        <div className="p-6 border-b border-[rgba(57,255,106,0.15)] bg-[#040B08]/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#EAF7EF]">
                  Start Your RoboVerse Journey
                </h3>
                <p className="text-[11px] text-[#8FA99B] font-mono">
                  Personalized robotics & electronics path
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#8FA99B] hover:text-[#39FF6A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4-Step Progress Indicator */}
          <div className="flex items-center gap-2 font-mono">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex flex-col gap-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s <= step
                      ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B]'
                      : 'bg-[#0E2A1F]'
                  }`}
                />
                <span
                  className={`text-[9.5px] font-bold text-center ${
                    s === step
                      ? 'text-[#39FF6A]'
                      : s < step
                      ? 'text-[#EAF7EF]'
                      : 'text-[#8FA99B]'
                  }`}
                >
                  {s === 1
                    ? 'Passport'
                    : s === 2
                    ? 'Profile Quiz'
                    : s === 3
                    ? 'Roadmap'
                    : 'First Mission'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Step Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* STEP 1: Welcome & Student ID Passport */}
          {step === 1 && (
            <div className="space-y-6 text-center animate-slide-up">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#39FF6A] px-3 py-1 rounded-full bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)]">
                  Welcome to RoboVerse
                </span>
                <h2 className="text-2xl font-black text-[#EAF7EF] mt-2.5">
                  Meet Your Digital Student ID
                </h2>
                <p className="text-xs md:text-sm text-[#8FA99B] max-w-md mx-auto mt-1">
                  Every RoboVerse student receives an official, cryptographically verifiable Student ID. Use it to submit circuits, enter hackathons, and verify course certifications.
                </p>
              </div>

              {/* 3D Student ID Card View */}
              <div className="py-2">
                <StudentIdCard3D
                  studentId={studentId}
                  fullName={studentName}
                  school={schoolName}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs text-[#CBD8D0] text-left flex items-center gap-3 font-mono">
                <CheckCircle2 className="w-5 h-5 text-[#39FF6A] shrink-0" />
                <p>
                  Your unique student ID <strong className="text-[#39FF6A]">{studentId}</strong> is registered on the RoboVerse student ledger. Let&apos;s personalize your learning journey!
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Skill Level & Focus Areas */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h3 className="text-lg font-black text-[#EAF7EF]">
                  Where are you starting from?
                </h3>
                <p className="text-xs text-[#8FA99B] mt-0.5 font-mono">
                  We adapt circuit challenges, Rituu AI debugging hints, and lesson tracks to your level.
                </p>
              </div>

              {/* Skill Levels Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'rookie', title: 'Rookie', desc: 'New to circuits & coding' },
                  { id: 'builder', title: 'Builder', desc: 'Blinked LEDs, know basics' },
                  { id: 'engineer', title: 'Engineer', desc: 'Built Arduino/ROS robots' },
                  { id: 'innovator', title: 'Innovator', desc: 'Autonomous drones & ML' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedLevel === lvl.id
                        ? 'border-2 border-[#39FF6A] bg-[rgba(57,255,106,0.15)] shadow-[0_0_15px_rgba(57,255,106,0.2)]'
                        : 'border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A]/50 bg-white/5'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#EAF7EF]">{lvl.title}</p>
                    <p className="text-[10px] text-[#8FA99B] mt-1">{lvl.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAF7EF] mb-2.5 font-mono">
                  Select Your Primary Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'arduino', label: 'Arduino & Microcontrollers' },
                    { id: 'robotics', label: 'Mobile Wheeled Robots' },
                    { id: 'circuit_design', label: 'Circuit Simulation & PCB' },
                    { id: 'sensors', label: 'Sensors & IoT' },
                    { id: 'drones', label: 'Autonomous Drones' },
                    { id: 'ml_ai', label: 'Edge AI & Computer Vision' },
                    { id: 'blockly', label: 'Blockly Visual Programming' },
                  ].map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 font-mono ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]'
                            : 'bg-white/5 text-[#CBD8D0] hover:bg-white/10 border border-[rgba(57,255,106,0.15)]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{interest.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#EAF7EF] mb-2.5 font-mono">
                  What is your main goal?
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'hackathons', title: '🏆 Win Robotics Hackathons' },
                    { id: 'college', title: '🎓 Excel in School / College Projects' },
                    { id: 'career', title: '🚀 Launch a Career in Robotics & Embedded' },
                    { id: 'hobby', title: '💡 Build Creative Hardware Inventions' },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => setPrimaryGoal(goal.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        primaryGoal === goal.id
                          ? 'border-[#39FF6A] bg-[rgba(57,255,106,0.15)] text-[#39FF6A]'
                          : 'border-[rgba(57,255,106,0.15)] text-[#CBD8D0] bg-white/5'
                      }`}
                    >
                      {goal.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Recommended Learning Roadmap */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]">
                  Targeted Path Generated
                </span>
                <h3 className="text-lg font-black text-[#EAF7EF] mt-2">
                  Your Recommended Learning Track
                </h3>
                <p className="text-xs text-[#8FA99B] font-mono">
                  Curated for your level (<strong>{selectedLevel.toUpperCase()}</strong>) with focus on <strong>{selectedInterests.join(', ')}</strong>.
                </p>
              </div>

              <div className="space-y-3 font-mono">
                {[
                  {
                    num: '1',
                    title: 'Electronics Primitives & Safe Prototyping',
                    sub: 'Breadboard rails, current-limiting resistors, Ohm’s Law and LED circuits.',
                    status: 'Ready Now',
                    badgeBg: 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]',
                  },
                  {
                    num: '2',
                    title: 'Microcontroller Logic with Arduino Uno & C++',
                    sub: 'Digital I/O, analog PWM, ultrasonic sonar distance sensors and serial monitor.',
                    status: 'Next',
                    badgeBg: 'bg-[rgba(76,141,255,0.15)] text-[#4C8DFF] border border-[rgba(76,141,255,0.3)]',
                  },
                  {
                    num: '3',
                    title: 'Motor Drivers & Autonomous Mobile Robotics',
                    sub: 'H-Bridges (L298N), differential drive PID line tracking, obstacle evasion.',
                    status: 'Milestone',
                    badgeBg: 'bg-[rgba(255,154,31,0.15)] text-[#FF9A1F] border border-[rgba(255,154,31,0.3)]',
                  },
                  {
                    num: '4',
                    title: 'Official RoboVerse Junior Robotics Certification',
                    sub: 'Timed capstone simulation project + mentor code review + QR credential.',
                    status: 'Official Cert',
                    badgeBg: 'bg-[rgba(168,85,247,0.15)] text-[#A855F7] border border-[rgba(168,85,247,0.3)]',
                  },
                ].map((track) => (
                  <div
                    key={track.num}
                    className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#0E2A1F] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] font-bold text-xs flex items-center justify-center shrink-0">
                        {track.num}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#EAF7EF]">{track.title}</p>
                        <p className="text-[10px] text-[#8FA99B] mt-0.5">{track.sub}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${track.badgeBg}`}>
                      {track.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: First Mission Launch */}
          {step === 4 && (
            <div className="space-y-6 text-center animate-slide-up">
              <div className="w-20 h-20 rounded-3xl bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(57,255,106,0.3)]">
                <Cpu className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)]">
                  Mission 01: Ready
                </span>
                <h3 className="text-2xl font-black text-[#EAF7EF] mt-2.5">
                  Blink an LED on Arduino Uno
                </h3>
                <p className="text-xs md:text-sm text-[#8FA99B] max-w-md mx-auto mt-1 font-mono">
                  Your first hands-on lab: wire a red LED with a 220Ω resistor to digital pin 13, and upload your first Arduino C++ firmware.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] max-w-md mx-auto text-left space-y-2 font-mono">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAF7EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF6A]" />
                  <span>Components ready on breadboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAF7EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF6A]" />
                  <span>Real-time electrical MNA engine enabled</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAF7EF]">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF6A]" />
                  <span>Rituu AI will check your wiring in real time</span>
                </div>
              </div>

              <button
                onClick={handleLaunchFirstMission}
                className="btn-primary-neon px-8 py-3.5 text-sm font-extrabold shadow-neon-pill inline-flex items-center gap-2 font-mono"
              >
                <span>Launch Circuit Lab & Blink LED</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-[rgba(57,255,106,0.15)] bg-[#040B08] flex items-center justify-between font-mono">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#8FA99B] hover:text-[#EAF7EF]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as any)}
              className="btn-primary-neon px-5 py-2 text-xs font-bold shadow-neon-pill flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-bold text-[#8FA99B] hover:text-[#EAF7EF] px-4 py-2"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}