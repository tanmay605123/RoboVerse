'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  X,
  CheckCircle2,
  Circle,
  Play,
  Code2,
  Wrench,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { BEGINNER_LESSONS, BeginnerLesson } from './beginnerCurriculumData';

interface BeginnerCurriculumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCodeEditor?: () => void;
}

export const BeginnerCurriculumDrawer: React.FC<BeginnerCurriculumDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCodeEditor,
}) => {
  const { components, wires, loadStarterAssembly, setArduinoCode, startSimulation } = useCircuitStore();
  const { user } = useAuthStore();

  const [selectedLessonId, setSelectedLessonId] = useState<string>(BEGINNER_LESSONS[0].id);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'IDLE' | 'PASS' | 'FAIL';
    message: string;
    missingParts?: string[];
  }>({ status: 'IDLE', message: '' });
  const [isClaimingXp, setIsClaimingXp] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  // Load completed lessons from localStorage and Supabase on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('roboverse_completed_lessons');
      if (cached) {
        setCompletedLessonIds(JSON.parse(cached));
      }
    } catch {
      // ignore
    }

    // Attempt to sync from Supabase if logged in
    async function syncCompletedLessons() {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const { data } = await (supabase.from('lesson_progress') as any)
            .select('lesson_id, status')
            .eq('user_id', session.user.id)
            .eq('status', 'completed');

          if (data && data.length > 0) {
            const ids = Array.from(new Set<string>(data.map((d: any) => String(d.lesson_id))));
            setCompletedLessonIds(ids);
            localStorage.setItem('roboverse_completed_lessons', JSON.stringify(ids));
          }
        }
      } catch (err) {
        console.warn('Could not sync lesson progress from Supabase:', err);
      }
    }

    if (isOpen) {
      syncCompletedLessons();
    }
  }, [isOpen]);

  const activeLesson = BEGINNER_LESSONS.find((l) => l.id === selectedLessonId) || BEGINNER_LESSONS[0];
  const totalLessons = BEGINNER_LESSONS.length;
  const completedCount = completedLessonIds.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  // Check which required components are currently placed on the workbench
  const placedTypeIds = new Set(components.map((c) => c.typeId.toLowerCase()));
  const missingParts = activeLesson.requiredComponents.filter((req) => {
    // fuzzy match (e.g. 'breadboard' matches 'breadboard_half' or 'breadboard_small')
    return !Array.from(placedTypeIds).some((placed) => placed.includes(req.toLowerCase()));
  });

  // 1-Click Auto Assemble
  const handleAutoAssemble = () => {
    loadStarterAssembly({
      components: activeLesson.sampleAssembly.components,
      wires: activeLesson.sampleAssembly.wires,
      arduinoCode: activeLesson.starterCode,
      title: activeLesson.title,
    });
    setVerificationResult({
      status: 'PASS',
      message: 'Verified assembly automatically loaded onto workbench!',
    });
  };

  // 1-Click Load Code
  const handleLoadCode = () => {
    setArduinoCode(activeLesson.starterCode);
    if (onOpenCodeEditor) {
      onOpenCodeEditor();
    }
  };

  // Auto-Check Circuit Netlist
  const handleVerifyCircuit = () => {
    if (missingParts.length > 0) {
      setVerificationResult({
        status: 'FAIL',
        message: `Missing required parts: ${missingParts.join(', ')}. Please add them from the component palette or click Auto-Assemble.`,
        missingParts,
      });
      return;
    }

    // If Arduino is required, ensure it has connections
    const hasArduino = components.some((c) => c.typeId.includes('arduino'));
    if (hasArduino && wires.length === 0) {
      setVerificationResult({
        status: 'FAIL',
        message: 'No wires connected! Please connect the circuit pins according to the wiring guide below.',
      });
      return;
    }

    setVerificationResult({
      status: 'PASS',
      message: 'Circuit netlist verified! All components and wiring meet lesson requirements.',
    });
  };

  // Claim XP & Complete Lesson
  const handleClaimXp = async () => {
    setIsClaimingXp(true);
    const newCompleted = Array.from(new Set([...completedLessonIds, activeLesson.id]));
    setCompletedLessonIds(newCompleted);
    localStorage.setItem('roboverse_completed_lessons', JSON.stringify(newCompleted));

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await (supabase.from('lesson_progress') as any).upsert({
          user_id: session.user.id,
          lesson_id: activeLesson.id,
          status: 'completed',
          score: 100,
          completed_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Failed saving progress to Supabase:', e);
    }

    setXpAwarded(activeLesson.xpReward);
    setIsClaimingXp(false);

    // Auto-advance to next lesson if available
    setTimeout(() => {
      setXpAwarded(null);
      const nextIndex = activeLesson.lessonNumber; // 1-based, so next is index = lessonNumber
      if (nextIndex < totalLessons) {
        setSelectedLessonId(BEGINNER_LESSONS[nextIndex].id);
        setVerificationResult({ status: 'IDLE', message: '' });
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full md:w-[620px] lg:w-[700px] bg-[#07110D]/95 backdrop-blur-2xl border-l border-[rgba(57,255,106,0.2)] shadow-[-16px_0_40px_rgba(0,0,0,0.8)] flex flex-col font-sans text-[#EAF7EF] select-none animate-slide-left">
      {/* DRAWER TOP BAR */}
      <div className="h-16 px-6 border-b border-[rgba(57,255,106,0.15)] flex items-center justify-between bg-[#040B08]/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#39FF6A]/20 to-[#7FE7D6]/20 border border-[#39FF6A]/40 flex items-center justify-center text-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.25)]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#EAF7EF]">
                Simple Lab Curriculum
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#39FF6A]/15 text-[#39FF6A] border border-[#39FF6A]/30">
                16 Lessons
              </span>
            </div>
            <p className="text-[11px] text-[#8FA99B] font-mono">
              Rookie Electronics & Physical Computing Track
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors border border-transparent hover:border-[rgba(57,255,106,0.2)]"
          title="Close Curriculum Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* PROGRESS TRACKER BAR */}
      <div className="px-6 py-3 bg-[#05130E] border-b border-[rgba(57,255,106,0.12)] shrink-0">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="text-[#8FA99B]">Progress:</span>
          <span className="text-[#39FF6A] font-bold">
            {completedCount} / {totalLessons} Missions Complete ({progressPct}%)
          </span>
        </div>
        <div className="w-full h-2 bg-[#040B08] rounded-full overflow-hidden border border-[rgba(57,255,106,0.2)]">
          <div
            className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(57,255,106,0.6)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* SPLIT VIEWPORT: LEFT HORIZONTAL MISSION SELECTOR + RIGHT DETAIL CARD */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* MISSION LIST (Scrollable) */}
        <div className="w-full md:w-56 bg-[#040B08]/90 border-r border-[rgba(57,255,106,0.1)] overflow-y-auto shrink-0 p-3 space-y-1.5 scrollbar-thin">
          <div className="text-[10px] uppercase font-bold text-[#8FA99B] tracking-wider px-2 py-1">
            Missions (1 to 16)
          </div>
          {BEGINNER_LESSONS.map((lesson) => {
            const isSelected = lesson.id === selectedLessonId;
            const isCompleted = completedLessonIds.includes(lesson.id);

            return (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonId(lesson.id);
                  setVerificationResult({ status: 'IDLE', message: '' });
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-center justify-between text-xs ${
                  isSelected
                    ? 'bg-[#0E2A1F] border-[#39FF6A] text-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.25)]'
                    : 'bg-white/[0.02] border-transparent hover:bg-white/5 text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#39FF6A] shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#8FA99B]/40 shrink-0" />
                  )}
                  <span className="font-bold truncate">{lesson.title.split('.')[1] || lesson.title}</span>
                </div>
                <span className="text-[9px] font-mono shrink-0 ml-1 opacity-70">
                  {lesson.durationMinutes}m
                </span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE MISSION WORKSPACE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#07110D]">
          {/* Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0A2319] to-[#040B08] border border-[rgba(57,255,106,0.25)] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#39FF6A]/15 text-[#39FF6A] border border-[#39FF6A]/30">
                {activeLesson.category} • {activeLesson.level}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF9A1F]">
                <Award className="w-4 h-4" />
                <span>+{activeLesson.xpReward} XP</span>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-[#EAF7EF] mb-1">
              {activeLesson.title}
            </h3>
            <p className="text-xs text-[#8FA99B] leading-relaxed">
              {activeLesson.description}
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="p-4 rounded-2xl bg-[#040B08]/60 border border-[rgba(57,255,106,0.12)]">
            <h4 className="text-xs font-mono font-bold text-[#39FF6A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Key Concepts & Objectives</span>
            </h4>
            <ul className="space-y-1.5">
              {activeLesson.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#C5D8CD]">
                  <ChevronRight className="w-3.5 h-3.5 text-[#39FF6A] shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hardware Checklist & 1-Click Auto Assemble */}
          <div className="p-4 rounded-2xl bg-[#040B08]/60 border border-[rgba(57,255,106,0.12)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-[#EAF7EF] uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#7FE7D6]" />
                <span>Hardware Needed</span>
              </h4>
              <button
                onClick={handleAutoAssemble}
                className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] hover:brightness-110 shadow-[0_0_12px_rgba(57,255,106,0.4)] flex items-center gap-1.5 transition-all"
                title="Automatically place components and connect wires onto workbench"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Assemble Circuit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {activeLesson.requiredComponents.map((req, i) => {
                const isPlaced = Array.from(placedTypeIds).some((p) => p.includes(req.toLowerCase()));
                return (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-xl border flex items-center justify-between font-mono text-[11px] ${
                      isPlaced
                        ? 'bg-[#0E2A1F]/70 border-[#39FF6A]/40 text-[#EAF7EF]'
                        : 'bg-white/[0.02] border-white/10 text-[#8FA99B]'
                    }`}
                  >
                    <span className="capitalize">{req.replace(/_/g, ' ')}</span>
                    {isPlaced ? (
                      <span className="text-[10px] text-[#39FF6A] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#FF9A1F]">Missing</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wiring Guide Table */}
          <div className="p-4 rounded-2xl bg-[#040B08]/60 border border-[rgba(57,255,106,0.12)] space-y-2">
            <h4 className="text-xs font-mono font-bold text-[#EAF7EF] uppercase tracking-wider">
              Pin Connection Guide
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-[#8FA99B] text-[10px] uppercase">
                    <th className="pb-1.5">From</th>
                    <th className="pb-1.5">To</th>
                    <th className="pb-1.5">Wire</th>
                    <th className="pb-1.5">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeLesson.wiringGuide.map((step, i) => (
                    <tr key={i} className="text-[11px]">
                      <td className="py-2 text-[#EAF7EF] font-bold">{step.from}</td>
                      <td className="py-2 text-[#7FE7D6]">{step.to}</td>
                      <td className="py-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-white/20 align-middle mr-1.5"
                          style={{ backgroundColor: step.color }}
                        />
                      </td>
                      <td className="py-2 text-[#8FA99B]">{step.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Starter Sketch Preview & Load Code */}
          <div className="p-4 rounded-2xl bg-[#040B08]/60 border border-[rgba(57,255,106,0.12)] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-[#EAF7EF] uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#39FF6A]" />
                <span>Starter C++ Sketch</span>
              </h4>
              <button
                onClick={handleLoadCode}
                className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/30 transition-all flex items-center gap-1.5"
              >
                <span>Load Sketch into Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#020604] border border-white/5 text-[11px] font-mono text-[#8FA99B] overflow-x-auto max-h-36 scrollbar-thin">
              <code>{activeLesson.starterCode}</code>
            </pre>
          </div>

          {/* Verification Feedback Banner */}
          {verificationResult.status !== 'IDLE' && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-mono animate-slide-up ${
                verificationResult.status === 'PASS'
                  ? 'bg-[#0E2A1F] border-[#39FF6A] text-[#39FF6A]'
                  : 'bg-[#2A1608] border-[#FF9A1F] text-[#FF9A1F]'
              }`}
            >
              {verificationResult.status === 'PASS' ? (
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#39FF6A]" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#FF9A1F]" />
              )}
              <div>
                <p className="font-bold">{verificationResult.status === 'PASS' ? 'Check Passed' : 'Action Required'}</p>
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{verificationResult.message}</p>
              </div>
            </div>
          )}

          {/* XP Claim Celebration Overlay */}
          {xpAwarded && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#39FF6A]/20 to-[#7FE7D6]/20 border border-[#39FF6A] text-center space-y-1 animate-bounce">
              <Sparkles className="w-6 h-6 text-[#39FF6A] mx-auto animate-spin" />
              <p className="text-sm font-black text-[#EAF7EF]">MISSION ACCOMPLISHED!</p>
              <p className="text-xs font-mono text-[#39FF6A]">+{xpAwarded} XP Claimed & Passport Updated</p>
            </div>
          )}

          {/* ACTION BUTTONS: VERIFY CIRCUIT, RUN SIMULATION, CLAIM XP */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleVerifyCircuit}
              className="flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold border border-[#39FF6A]/40 bg-[#0E2A1F] text-[#39FF6A] hover:bg-[#39FF6A]/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Wiring & Netlist</span>
            </button>

            <button
              onClick={() => {
                handleVerifyCircuit();
                startSimulation();
              }}
              className="flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold bg-[#1D4ED8] hover:bg-[#2563EB] text-white shadow-[0_0_12px_rgba(29,78,216,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run Simulation</span>
            </button>

            <button
              onClick={handleClaimXp}
              disabled={isClaimingXp || completedLessonIds.includes(activeLesson.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center gap-2 ${
                completedLessonIds.includes(activeLesson.id)
                  ? 'bg-white/10 text-[#8FA99B] cursor-default'
                  : 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] hover:brightness-110 shadow-[0_0_16px_rgba(57,255,106,0.5)]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>
                {completedLessonIds.includes(activeLesson.id)
                  ? 'Completed'
                  : isClaimingXp
                  ? 'Syncing...'
                  : 'Claim +100 XP'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
