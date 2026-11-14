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
  Cable,
  Copy,
  Gauge,
  Music2,
} from 'lucide-react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { BEGINNER_LESSONS } from './beginnerCurriculumData';
import { buzzerAudio } from '@/lib/simulation/webAudioBuzzer';
import { ProjectBlueprintPreview } from './ProjectBlueprintPreview';

const PIANO_NOTES = [
  { name: 'C4', frequency: 261.63 },
  { name: 'D4', frequency: 293.66 },
  { name: 'E4', frequency: 329.63 },
  { name: 'F4', frequency: 349.23 },
  { name: 'G4', frequency: 392 },
  { name: 'A4', frequency: 440 },
  { name: 'B4', frequency: 493.88 },
  { name: 'C5', frequency: 523.25 },
];
const stopPianoNotes = () => PIANO_NOTES.forEach((_, index) => buzzerAudio.stopTone(`lesson-piano-${index}`));

interface BeginnerCurriculumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCodeEditor?: () => void;
  startInProjectPicker?: boolean;
}

const getConnectionKey = (
  components: { id: string; typeId: string; pins: { id: string; name: string }[] }[],
  wire: { fromComponentId: string; fromPinId: string; toComponentId: string; toPinId: string }
) => {
  const from = components.find((component) => component.id === wire.fromComponentId);
  const to = components.find((component) => component.id === wire.toComponentId);
  if (!from || !to) return null;
  const normalizePin = (name: string) => name.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const fromPin = normalizePin(from.pins.find((pin) => pin.id === wire.fromPinId)?.name || wire.fromPinId);
  const toPin = normalizePin(to.pins.find((pin) => pin.id === wire.toPinId)?.name || wire.toPinId);
  const ends = [`${from.typeId}:${fromPin}`, `${to.typeId}:${toPin}`].sort();
  return ends.join('::');
};

export const BeginnerCurriculumDrawer: React.FC<BeginnerCurriculumDrawerProps> = ({
  isOpen,
  onClose,
  onOpenCodeEditor,
  startInProjectPicker = false,
}) => {
  const { components, wires, loadStarterAssembly, setArduinoCode, startSimulation } = useCircuitStore();

  const [selectedLessonId, setSelectedLessonId] = useState<string>(BEGINNER_LESSONS[0].id);
  const [activeTab, setActiveTab] = useState<'BLUEPRINT' | 'OVERVIEW' | 'PINOUT' | 'EXAMPLE' | 'SPECIFICATIONS'>('OVERVIEW');
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmAssemble, setConfirmAssemble] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'IDLE' | 'PASS' | 'FAIL';
    message: string;
    missingParts?: string[];
  }>({ status: 'IDLE', message: '' });
  const [isClaimingXp, setIsClaimingXp] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) stopPianoNotes();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && startInProjectPicker) {
      const nextLesson = BEGINNER_LESSONS.find((lesson) => !completedLessonIds.includes(lesson.id)) || BEGINNER_LESSONS[0];
      setSelectedLessonId(nextLesson.id);
      setActiveTab('OVERVIEW');
      setVerificationResult({ status: 'IDLE', message: '' });
    }
  }, [completedLessonIds, isOpen, startInProjectPicker]);

  useEffect(() => () => stopPianoNotes(), []);

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
  const recommendedLesson = BEGINNER_LESSONS.find((lesson) => !completedLessonIds.includes(lesson.id)) || BEGINNER_LESSONS[0];

  // Check which required components are currently placed on the workbench
  const availablePartTypes = components.map((component) => component.typeId.toLowerCase());
  const requiredPartStatuses = activeLesson.requiredComponents.map((requiredType) => {
    const availableIndex = availablePartTypes.findIndex((type) => type.includes(requiredType.toLowerCase()));
    if (availableIndex < 0) return false;
    availablePartTypes.splice(availableIndex, 1);
    return true;
  });
  const missingParts = activeLesson.requiredComponents.filter((_, index) => !requiredPartStatuses[index]);

  const requiredConnectionKeys = activeLesson.sampleAssembly.wires.map((wire) =>
    getConnectionKey(activeLesson.sampleAssembly.components, wire)
  );
  const placedConnectionCounts = new Map<string, number>();
  wires.forEach((wire) => {
    const key = getConnectionKey(components, wire);
    if (key) placedConnectionCounts.set(key, (placedConnectionCounts.get(key) || 0) + 1);
  });
  const usedConnectionCounts = new Map<string, number>();
  const missingConnections = requiredConnectionKeys
    .map((key, index) => {
      if (!key) return index;
      const usedCount = usedConnectionCounts.get(key) || 0;
      usedConnectionCounts.set(key, usedCount + 1);
      return usedCount < (placedConnectionCounts.get(key) || 0) ? null : index;
    })
    .filter((index): index is number => index !== null);

  const assembleLesson = () => {
    loadStarterAssembly({
      components: activeLesson.sampleAssembly.components,
      wires: activeLesson.sampleAssembly.wires,
      arduinoCode: activeLesson.starterCode,
      title: activeLesson.title,
    });
    window.dispatchEvent(new Event('roboverse:fit-circuit'));
    setConfirmAssemble(false);
    setVerificationResult({
      status: 'PASS',
      message: 'Lesson starter circuit assembled. Its parts and connections match the lesson.',
    });
  };

  const handleAutoAssemble = () => {
    if (components.length > 0 || wires.length > 0) {
      setConfirmAssemble(true);
      return;
    }
    assembleLesson();
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

    if (missingConnections.length > 0) {
      const firstMissing = activeLesson.wiringGuide[missingConnections[0]];
      const detail = firstMissing ? ` For example: ${firstMissing.from} → ${firstMissing.to}.` : '';
      setVerificationResult({
        status: 'FAIL',
        message: `${missingConnections.length} required lesson connection${missingConnections.length === 1 ? ' is' : 's are'} missing or connected to different pins.${detail} Follow the Pinout tab or Auto-Assemble the starter circuit.`,
      });
      return;
    }

    setVerificationResult({
      status: 'PASS',
      message: `All required parts and ${requiredConnectionKeys.length} lesson connections are present.`,
    });
  };

  const handleRunLesson = () => {
    if (missingParts.length > 0 || missingConnections.length > 0) {
      handleVerifyCircuit();
      return;
    }
    setArduinoCode(activeLesson.starterCode);
    onOpenCodeEditor?.();
    startSimulation();
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
                RoboVerse Circuit Lab
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
            {completedCount} / {totalLessons} Lessons Complete ({progressPct}%)
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
        {/* LESSON LIST (Scrollable) */}
        <div className="w-full md:w-56 bg-[#040B08]/90 border-r border-[rgba(57,255,106,0.1)] overflow-y-auto shrink-0 p-3 space-y-1.5 scrollbar-thin">
          <div className="mb-2 rounded-xl border border-[#7FE7D6]/20 bg-[#7FE7D6]/[0.06] p-3">
            <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#7FE7D6]">Suggested next · {recommendedLesson.level.toLowerCase()}</p>
            <p className="mt-1 text-xs font-bold text-[#EAF7EF]">{recommendedLesson.title.replace(/^\d+\.\s*/, '')}</p>
            <button
              onClick={() => {
                setSelectedLessonId(recommendedLesson.id);
                setActiveTab('OVERVIEW');
                setConfirmAssemble(false);
                setVerificationResult({ status: 'IDLE', message: '' });
              }}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-[#39FF6A] px-2 py-1.5 text-[10px] font-extrabold text-[#07110D] hover:brightness-110"
            >
              <Sparkles className="h-3 w-3" /> Preview project
            </button>
          </div>
          <div className="text-[10px] uppercase font-bold text-[#8FA99B] tracking-wider px-2 py-1">
            Choose from the 16-project path
          </div>
          {BEGINNER_LESSONS.map((lesson) => {
            const isSelected = lesson.id === selectedLessonId;
            const isCompleted = completedLessonIds.includes(lesson.id);

            return (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonId(lesson.id);
                  setActiveTab('OVERVIEW');
                  setConfirmAssemble(false);
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

          <div role="tablist" aria-label="Lesson sections" className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#040B08] p-1">
            {([
              ['BLUEPRINT', 'Blueprint'],
              ['OVERVIEW', 'Build steps'],
              ['PINOUT', 'Pinout'],
              ['EXAMPLE', 'Example'],
              ['SPECIFICATIONS', 'Specifications'],
            ] as const).map(([tab, label]) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                title={{
                  BLUEPRINT: 'Preview the project goal, main parts, and circuit idea before you start.',
                  OVERVIEW: 'Follow the project steps from parts to simulation.',
                  PINOUT: 'See each wire and the exact pins it connects.',
                  EXAMPLE: 'Explore the sample sketch and open it in the editor.',
                  SPECIFICATIONS: 'Review project level, time, parts, and connections.',
                }[tab]}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold transition ${activeTab === tab ? 'bg-[#39FF6A] text-[#07110D]' : 'text-[#8FA99B] hover:bg-white/5 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'BLUEPRINT' && <>
            <ProjectBlueprintPreview lesson={activeLesson} />
            <div className="rounded-xl border border-[#39FF6A]/15 bg-[#040B08]/60 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#39FF6A]">Before you start</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-[#A8C0B2]">Preview the goal, parts, and build sequence first. When you are ready, start the guided project to load its sample circuit into your RoboVerse workbench.</p>
              <button onClick={handleAutoAssemble} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] px-4 py-2.5 text-xs font-extrabold text-[#07110D] hover:brightness-110">
                <Wrench className="h-4 w-4" /> Start this project in the lab
              </button>
              {confirmAssemble && (
                <div role="alert" className="mt-3 rounded-xl border border-[#FF9A1F]/40 bg-[#2A1608]/70 p-3 text-xs text-[#EAF7EF]">
                  <p className="font-bold text-[#FF9A1F]">Replace the current circuit?</p>
                  <p className="mt-1 text-[#C5D8CD]">Starting this project replaces the current parts, wires, and sketch with its starter circuit.</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button onClick={() => setConfirmAssemble(false)} className="rounded-lg border border-white/15 px-3 py-1.5 font-bold text-[#C5D8CD] hover:bg-white/5">Keep my circuit</button>
                    <button onClick={assembleLesson} className="rounded-lg bg-[#FF9A1F] px-3 py-1.5 font-bold text-[#07110D] hover:brightness-110">Replace with starter</button>
                  </div>
                </div>
              )}
            </div>
          </>}

          {/* Learning Objectives */}
          {activeTab === 'OVERVIEW' && <>
          <ProjectBlueprintPreview lesson={activeLesson} />
          <div className="rounded-xl border border-[#7FE7D6]/15 bg-[#7FE7D6]/[0.04] px-4 py-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7FE7D6]">Watch the project idea, then follow each step below</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#A8C0B2]">This preview shows the goal and main parts. The build plan below explains how to assemble, connect, code, and test this project.</p>
          </div>
          <div className="rounded-2xl border border-[#7FE7D6]/20 bg-[#071A12] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7FE7D6]">Your build plan</p>
                <h4 className="mt-1 text-sm font-extrabold text-[#EAF7EF]">Follow these steps in order</h4>
              </div>
              <span className="rounded-full border border-[#39FF6A]/20 px-2 py-1 text-[10px] text-[#8FA99B]">{activeLesson.durationMinutes} min</span>
            </div>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#39FF6A] text-[11px] font-black text-[#07110D]">1</span>
                <div><p className="text-xs font-bold text-[#EAF7EF]">Understand the goal</p><p className="mt-0.5 text-[11px] leading-relaxed text-[#8FA99B]">{activeLesson.description}</p></div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#39FF6A]/15 text-[11px] font-black text-[#39FF6A]">2</span>
                <div><p className="text-xs font-bold text-[#EAF7EF]">Gather and place the parts</p><p className="mt-0.5 text-[11px] leading-relaxed text-[#8FA99B]">Choose Auto-Assemble below for a guided start, or close this guide and add the listed parts from Components.</p></div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#39FF6A]/15 text-[11px] font-black text-[#39FF6A]">3</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#EAF7EF]">Connect the pins</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#8FA99B]">Use these color-coded connections as your guide. Open Pinout for the full connection table.</p>
                  {activeLesson.wiringGuide.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {activeLesson.wiringGuide.slice(0, 4).map((wire, index) => (
                        <div key={`${wire.from}-${wire.to}-${index}`} className="flex min-w-0 items-center gap-2 rounded-lg bg-black/20 px-2.5 py-2 text-[10px] font-mono">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: wire.color }} />
                          <span className="truncate text-[#EAF7EF]">{wire.from}</span><ChevronRight className="h-3 w-3 shrink-0 text-[#8FA99B]" /><span className="truncate text-[#7FE7D6]">{wire.to}</span>
                          <span className="ml-auto hidden shrink-0 text-[#8FA99B] sm:inline">{wire.purpose}</span>
                        </div>
                      ))}
                      {activeLesson.wiringGuide.length > 4 && <p className="text-[10px] text-[#8FA99B]">+{activeLesson.wiringGuide.length - 4} more connections in Pinout</p>}
                    </div>
                  ) : <p className="mt-2 text-[11px] text-[#8FA99B]">This project starts with the board itself. Continue to Example to explore its sketch.</p>}
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#39FF6A]/15 text-[11px] font-black text-[#39FF6A]">4</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#EAF7EF]">Load the example and test</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#8FA99B]">Open the starter sketch, verify your wiring, then run the simulation and observe what changes.</p>
                  <button onClick={handleLoadCode} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#39FF6A]/30 bg-[#39FF6A]/10 px-3 py-1.5 text-[10px] font-bold text-[#39FF6A] hover:bg-[#39FF6A]/20"><Code2 className="h-3 w-3" />Open starter code</button>
                </div>
              </li>
            </ol>
          </div>
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
                title="Replace the current circuit with this lesson's starter assembly"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Assemble Circuit</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {activeLesson.requiredComponents.map((req, i) => {
                const isPlaced = requiredPartStatuses[i];
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
            {confirmAssemble && (
              <div role="alert" className="rounded-xl border border-[#FF9A1F]/40 bg-[#2A1608]/70 p-3 text-xs text-[#EAF7EF]">
                <p className="font-bold text-[#FF9A1F]">Replace the current circuit?</p>
                <p className="mt-1 text-[#C5D8CD]">Auto-Assemble replaces its parts, wires, and sketch with the lesson starter.</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => setConfirmAssemble(false)} className="rounded-lg border border-white/15 px-3 py-1.5 font-bold text-[#C5D8CD] hover:bg-white/5">Keep my circuit</button>
                  <button onClick={assembleLesson} className="rounded-lg bg-[#FF9A1F] px-3 py-1.5 font-bold text-[#07110D] hover:brightness-110">Replace with starter</button>
                </div>
              </div>
            )}
          </div>
          </>}

          {/* Wiring Guide Table */}
          {activeTab === 'PINOUT' && <>
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
          </>}

          {/* Starter Sketch Preview & Load Code */}
          {activeTab === 'EXAMPLE' && <>
          {activeLesson.id === 'les_06_buzzer' && (
            <div className="rounded-2xl border border-[rgba(127,231,214,0.2)] bg-[#0A1F17]/60 p-4">
              <h4 className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7FE7D6]"><Music2 className="h-4 w-4" />Try the 8-note virtual piano</h4>
              <p className="mt-1.5 text-[11px] text-[#8FA99B]">Press and hold a key to hear its tone. This is a quick sound check; Start Simulation runs the lesson sketch.</p>
              <div className="mt-3 grid grid-cols-8 gap-1.5">
                {PIANO_NOTES.map((note, index) => (
                  <button
                    key={note.name}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      buzzerAudio.playTone(`lesson-piano-${index}`, note.frequency);
                    }}
                    onPointerUp={() => buzzerAudio.stopTone(`lesson-piano-${index}`)}
                    onPointerCancel={() => buzzerAudio.stopTone(`lesson-piano-${index}`)}
                    onPointerLeave={() => buzzerAudio.stopTone(`lesson-piano-${index}`)}
                    onKeyDown={(event) => {
                      if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
                        event.preventDefault();
                        buzzerAudio.playTone(`lesson-piano-${index}`, note.frequency);
                      }
                    }}
                    onKeyUp={() => buzzerAudio.stopTone(`lesson-piano-${index}`)}
                    onBlur={() => buzzerAudio.stopTone(`lesson-piano-${index}`)}
                    aria-label={`Play ${note.name}`}
                    className="rounded-lg border border-[#39FF6A]/20 bg-[#07110D] py-3 text-[10px] font-bold text-[#EAF7EF] transition hover:border-[#39FF6A] hover:bg-[#39FF6A]/10 active:translate-y-0.5 active:bg-[#39FF6A]/20"
                  >
                    {note.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-[rgba(127,231,214,0.18)] bg-[#0A1F17]/60 p-4">
            <h4 className="mb-2 text-xs font-mono font-bold uppercase tracking-wider text-[#7FE7D6]">What you will practice</h4>
            <ul className="space-y-1.5">
              {activeLesson.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-[#C5D8CD]">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7FE7D6]" />{objective}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-[#040B08]/60 border border-[rgba(57,255,106,0.12)] space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-[#EAF7EF] uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#39FF6A]" />
                <span>Starter C++ Sketch</span>
              </h4>
              <div className="flex gap-2">
                <button onClick={async () => { await navigator.clipboard.writeText(activeLesson.starterCode); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 1600); }} className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-[#EAF7EF] border border-white/10 transition-all flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" /> {copiedCode ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleLoadCode}
                  className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/30 transition-all flex items-center gap-1.5"
                >
                  <span>Open in editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <pre className="p-3 rounded-xl bg-[#020604] border border-white/5 text-[11px] font-mono text-[#8FA99B] overflow-x-auto max-h-36 scrollbar-thin">
              <code>{activeLesson.starterCode}</code>
            </pre>
          </div>
          </>}

          {activeTab === 'SPECIFICATIONS' && <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Difficulty', value: activeLesson.level },
                { label: 'Estimated time', value: `${activeLesson.durationMinutes} min` },
                { label: 'Circuit connections', value: `${activeLesson.wiringGuide.length} wires` },
                { label: 'Reward', value: `${activeLesson.xpReward} XP` },
              ].map((spec) => <div key={spec.label} className="rounded-xl border border-white/10 bg-[#040B08]/70 p-3">
                <span className="block text-[10px] uppercase tracking-wider text-[#8FA99B]">{spec.label}</span>
                <span className="mt-1 block text-sm font-bold text-[#EAF7EF]">{spec.value}</span>
              </div>)}
            </div>
            <div className="rounded-2xl border border-[rgba(57,255,106,0.15)] bg-[#040B08]/60 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF6A]"><Gauge className="h-4 w-4" /> Parts and connections</h4>
              <div className="flex flex-wrap gap-2">{activeLesson.requiredComponents.map((part) => <span key={part} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[11px] text-[#C5D8CD]">{part.replace(/_/g, ' ')}</span>)}</div>
            </div>
            <div className="rounded-2xl border border-[rgba(57,255,106,0.15)] bg-[#040B08]/60 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#39FF6A]"><Cable className="h-4 w-4" /> Board connections</h4>
              <div className="space-y-2">{activeLesson.wiringGuide.map((step, i) => <div key={i} className="flex items-center gap-2 text-xs"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: step.color }} /><span className="text-[#EAF7EF]">{step.from}</span><ChevronRight className="h-3.5 w-3.5 text-[#8FA99B]" /><span className="text-[#7FE7D6]">{step.to}</span></div>)}</div>
            </div>
          </div>}

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
              <p className="text-sm font-black text-[#EAF7EF]">LESSON COMPLETE!</p>
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
              onClick={handleRunLesson}
              className="flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
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
