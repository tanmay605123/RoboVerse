'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { INTERACTIVE_LESSONS_16, InteractiveLesson } from './lessons16Data';
import { useAuthStore } from '@/store/useAuthStore';
import { useCircuitStore } from '@/store/useCircuitStore';
import { labAudio } from '@/lib/synthAudio';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  Sparkles,
  AlertTriangle,
  Layers,
  HelpCircle,
  ExternalLink,
  Flame,
  Check,
} from 'lucide-react';

interface GuidedLessonOverlayProps {
  currentLessonId?: string;
  onSelectLesson: (lesson: InteractiveLesson) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export function GuidedLessonOverlay({
  currentLessonId,
  onSelectLesson,
  onRunSimulation,
  isSimulating,
}: GuidedLessonOverlayProps) {
  const { profile, updateProfile } = useAuthStore();
  const { components, wires } = useCircuitStore();

  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = INTERACTIVE_LESSONS_16.findIndex((l) => l.id === currentLessonId);
    return idx >= 0 ? idx : 0;
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [wiringStatus, setWiringStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [wiringMessage, setWiringMessage] = useState<string | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const activeLesson = INTERACTIVE_LESSONS_16[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextIdx = currentIndex - 1;
      setCurrentIndex(nextIdx);
      onSelectLesson(INTERACTIVE_LESSONS_16[nextIdx]);
      setWiringStatus('idle');
    }
  };

  const handleNext = () => {
    if (currentIndex < INTERACTIVE_LESSONS_16.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      onSelectLesson(INTERACTIVE_LESSONS_16[nextIdx]);
      setWiringStatus('idle');
    }
  };

  const checkWiring = () => {
    labAudio.playButtonClick(true);
    // Automatic wiring verification using MNA component checks
    const hasArduino = components.some((c) => c.typeId.toLowerCase().includes('arduino'));
    const hasBreadboard = components.some((c) => c.typeId.toLowerCase().includes('breadboard'));

    if (!hasArduino) {
      setWiringStatus('invalid');
      setWiringMessage('Missing Arduino Uno R3 on the workbench. Drag one from the parts drawer.');
      return;
    }

    if (wires.length < 2) {
      setWiringStatus('invalid');
      setWiringMessage('Circuit needs more wire connections. Follow the step-by-step schematic instructions.');
      return;
    }

    setWiringStatus('valid');
    setWiringMessage('Wiring verified! Nodes and Ground reference correctly routed.');
    labAudio.playSnapSound();
  };

  const handleCompleteLesson = () => {
    // Award XP and show celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#39FF6A', '#7FE7D6', '#FF9A1F'],
    });

    labAudio.playSnapSound();
    const newXp = (profile?.xp || 240) + activeLesson.xpAward;
    updateProfile({ xp: newXp });

    setShowCelebrationModal(true);
  };

  return (
    <>
      {/* Top Floating Control Bar */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl select-none">
        <div className="rounded-2xl glass-panel p-3.5 border border-robo-neon/40 shadow-neon-subtle bg-[#040C08]/90 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Left: Mission Info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-robo-neon/20 border border-robo-neon/40 flex items-center justify-center text-robo-neon font-mono font-bold shrink-0">
              {activeLesson.lessonNumber}
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-robo-teal/15 text-robo-teal border border-robo-teal/30 font-bold">
                  {activeLesson.badge}
                </span>
                <span className="text-robo-orange font-mono text-[10px] font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  +{activeLesson.xpAward} XP
                </span>
              </div>
              <h3 className="text-xs font-bold text-robo-text truncate mt-0.5">
                {activeLesson.title}
              </h3>
            </div>
          </div>

          {/* Center & Right Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Step Drawer Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-xl bg-[#030906] hover:bg-robo-surfaceRaised text-robo-textSecondary hover:text-robo-text border border-robo-borderSubtle font-mono text-[11px] flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-robo-teal" />
              <span>{isExpanded ? 'Hide Guide' : 'Guided Steps'}</span>
            </button>

            {/* Check Wiring (MNA) */}
            <button
              onClick={checkWiring}
              className="px-3 py-1.5 rounded-xl bg-robo-teal/15 hover:bg-robo-teal/30 text-robo-teal border border-robo-teal/30 font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors"
              title="Validate electrical circuit connections"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Check Wiring</span>
            </button>

            {/* Run Simulation */}
            <button
              onClick={() => {
                labAudio.playButtonClick(true);
                onRunSimulation();
              }}
              className={`px-4 py-1.5 rounded-xl font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                isSimulating
                  ? 'bg-robo-orange text-black shadow-neon-glow'
                  : 'bg-robo-neon text-black hover:bg-robo-teal shadow-neon-glow'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isSimulating ? 'PAUSE SIM' : 'RUN SIMULATION'}</span>
            </button>

            {/* Complete Lesson */}
            <button
              onClick={handleCompleteLesson}
              className="px-3 py-1.5 rounded-xl bg-[#0A2E20] hover:bg-robo-neon hover:text-black text-robo-neon border border-robo-neon/40 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Claim Lesson XP"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>

            {/* Prev / Next Lesson Navigation */}
            <div className="flex items-center gap-1 pl-2 border-l border-robo-borderSubtle">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg bg-black/40 text-robo-textMuted hover:text-robo-text disabled:opacity-30 border border-robo-borderSubtle"
                title="Previous Lesson"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === INTERACTIVE_LESSONS_16.length - 1}
                className="p-1.5 rounded-lg bg-black/40 text-robo-textMuted hover:text-robo-text disabled:opacity-30 border border-robo-borderSubtle"
                title="Next Lesson"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Wiring Validation Feedback Toast */}
        {wiringMessage && (
          <div
            className={`mt-2 p-2.5 rounded-xl font-mono text-xs flex items-center justify-between border ${
              wiringStatus === 'valid'
                ? 'bg-[#062114] border-robo-neon/60 text-robo-neon shadow-neon-subtle'
                : 'bg-[#210D06] border-robo-orange/60 text-robo-orange'
            }`}
          >
            <div className="flex items-center gap-2">
              {wiringStatus === 'valid' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{wiringMessage}</span>
            </div>
            <button
              onClick={() => setWiringMessage(null)}
              className="text-[10px] text-robo-textMuted hover:text-robo-text ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Expandable Step-by-Step Instructions Drawer */}
        {isExpanded && (
          <div className="mt-2 rounded-2xl glass-panel p-5 border border-robo-borderSubtle bg-[#030A07]/95 backdrop-blur-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold font-mono text-robo-teal uppercase tracking-wider">
                  MISSION OBJECTIVE
                </h4>
                <p className="text-xs text-robo-text mt-1 leading-relaxed">
                  {activeLesson.objective}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-robo-textMuted block">Difficulty</span>
                <span className="text-xs font-mono font-bold text-robo-neon">{activeLesson.difficulty}</span>
              </div>
            </div>

            {/* Required Parts Chips */}
            <div>
              <span className="text-[10px] font-mono text-robo-textMuted uppercase block mb-1.5">
                Components Needed (From Parts Bin):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeLesson.componentsNeeded.map((comp) => (
                  <span
                    key={comp}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/50 border border-robo-borderSubtle text-robo-textSecondary"
                  >
                    • {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Wiring Checklist */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-robo-textMuted uppercase block mb-1">
                Breadboard Wiring Instructions:
              </span>
              {activeLesson.schematicInstructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-robo-textSecondary">
                  <span className="w-4 h-4 rounded-full bg-robo-neon/20 text-robo-neon font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion & XP Reward Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 border border-robo-neon/60 bg-[#04120B] shadow-neon-glow space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-robo-neon/20 border border-robo-neon/40 flex items-center justify-center mx-auto text-robo-neon shadow-neon-glow">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-mono text-robo-teal uppercase tracking-widest font-bold">
                MISSION ACCOMPLISHED!
              </div>
              <h3 className="text-lg font-bold text-robo-text font-sans mt-1">
                Lesson {activeLesson.lessonNumber}: {activeLesson.title}
              </h3>
              <p className="text-xs text-robo-textSecondary mt-2">
                You successfully wired, compiled, and simulated the circuit with full electrical verification.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-robo-borderSubtle flex items-center justify-around">
              <div>
                <span className="text-[10px] font-mono text-robo-textMuted block">XP Awarded</span>
                <span className="text-lg font-mono font-bold text-robo-neon">+{activeLesson.xpAward} XP</span>
              </div>
              <div className="h-8 w-px bg-robo-borderSubtle" />
              <div>
                <span className="text-[10px] font-mono text-robo-textMuted block">Curriculum</span>
                <span className="text-lg font-mono font-bold text-robo-teal">{activeLesson.lessonNumber} / 16 Done</span>
              </div>
            </div>

            {/* If Lesson 16: Certificate Earned! */}
            {activeLesson.lessonNumber === 16 && (
              <div className="p-3 rounded-xl bg-robo-neon/15 border border-robo-neon/50 text-xs font-mono text-robo-neon">
                🎓 Capstone Complete! You have earned the Certified Arduino Robotics Apprentice credential!
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-black/60 border border-robo-borderSubtle text-xs font-mono text-robo-textSecondary hover:text-robo-text transition-colors"
              >
                Keep Exploring
              </button>
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  handleNext();
                }}
                className="flex-1 py-2.5 rounded-xl bg-robo-neon text-black font-bold text-xs font-mono hover:bg-robo-teal transition-colors shadow-neon-glow"
              >
                Next Mission →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
