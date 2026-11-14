'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Cpu,
  Flame,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface OnboardingJourneyModalProps {
  studentName: string;
  studentId: string;
  onFinish: () => void;
}

const PLACEMENT_QUESTIONS = [
  {
    id: 1,
    question: 'What component is strictly required in series with a 5V LED to prevent burnout?',
    options: [
      { text: '220Ω - 330Ω Resistor', correct: true },
      { text: '100μF Electrolytic Capacitor', correct: false },
      { text: '10kΩ Potentiometer Wiper', correct: false },
      { text: '1N4007 Rectifier Diode', correct: false },
    ],
    hint: 'Ohm’s law limits the 20mA forward current.',
  },
  {
    id: 2,
    question: 'Which core function executes continuously in an Arduino C++ sketch?',
    options: [
      { text: 'setup()', correct: false },
      { text: 'loop()', correct: true },
      { text: 'mainCycle()', correct: false },
      { text: 'digitalWrite()', correct: false },
    ],
    hint: 'It runs repeatedly after setup() completes.',
  },
  {
    id: 3,
    question: 'How do you control the angular position of an SG90 micro servo from an Arduino pin?',
    options: [
      { text: '50Hz Pulse Width Modulation (~PWM)', correct: true },
      { text: 'Constant 12V DC Voltage', correct: false },
      { text: 'Analog Audio Frequency', correct: false },
      { text: 'Ground Pulse Only', correct: false },
    ],
    hint: 'Pulse width between 1ms and 2ms sets 0° to 180°.',
  },
];

export function OnboardingJourneyModal({
  studentName,
  studentId,
  onFinish,
}: OnboardingJourneyModalProps) {
  const router = useRouter();
  const { updateProfile, setOnboardingCompleted } = useAuthStore();

  const [step, setStep] = useState<'welcome' | 'quiz' | 'result' | 'mission'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (optionIndex: number) => {
    const isCorrect = PLACEMENT_QUESTIONS[currentQuestionIndex].options[optionIndex].correct;
    const newAnswers = [...selectedAnswers, optionIndex];
    setSelectedAnswers(newAnswers);

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    if (currentQuestionIndex < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      // Calculate journey level
      const finalScore = score + (isCorrect ? 1 : 0);
      let awardedXp = 250;
      let levelName = 'Rookie';
      if (finalScore === 3) {
        awardedXp = 600;
        levelName = 'Builder';
      } else if (finalScore === 2) {
        awardedXp = 450;
        levelName = 'Rookie';
      }

      updateProfile({
        xp: awardedXp,
      });

      setStep('result');
    }
  };

  const handleLaunchMission = () => {
    setOnboardingCompleted(true);
    onFinish();
    router.push('/arduino-studio');
  };

  const handleSkipToDashboard = () => {
    setOnboardingCompleted(true);
    onFinish();
    router.push('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040B08]/90 backdrop-blur-xl flex items-center justify-center p-4 selection:bg-robo-neon selection:text-black">
      <div className="w-full max-w-xl rounded-3xl glass-panel p-8 border border-robo-neon/40 shadow-[0_0_50px_rgba(57,255,106,0.2)] text-white relative overflow-hidden">
        {/* Top Floating Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-robo-neon/20 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: WELCOME & STUDENT ID CARD DISPLAY */}
        {step === 'welcome' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-robo-neon/10 border border-robo-neon flex items-center justify-center text-robo-neon shadow-neon-glow">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] font-mono text-robo-neon tracking-widest uppercase bg-robo-neon/10 border border-robo-neon/30 px-3 py-1 rounded-full">
                OFFICIAL ONBOARDING PROTOCOL
              </span>
              <h2 className="text-2xl font-extrabold font-sans mt-3">
                Welcome to RoboVerse, {studentName}!
              </h2>
              <p className="text-xs text-robo-textSecondary mt-1.5 max-w-md mx-auto leading-relaxed">
                Your unique cryptographic digital Student ID is generated and verified across our network.
              </p>
            </div>

            {/* Micro Student ID Badge */}
            <div className="p-4 rounded-2xl bg-[#040E0A] border border-robo-teal/30 flex items-center justify-between max-w-sm mx-auto text-left shadow-inner">
              <div>
                <p className="text-[10px] font-mono text-robo-textMuted uppercase">ASSIGNED STUDENT ID</p>
                <p className="text-base font-mono font-bold text-robo-neon tracking-wide">{studentId}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{studentName}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-robo-teal">
                QR VERIFIED
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setStep('quiz')}
                className="py-3 px-6 rounded-xl bg-robo-neon text-black font-extrabold text-xs shadow-neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Take 2-Min Placement Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSkipToDashboard}
                className="py-3 px-6 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-gray-300 hover:text-white text-xs font-mono transition-colors"
              >
                Skip to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PLACEMENT QUIZ */}
        {step === 'quiz' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-robo-borderSubtle pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-robo-neon">
                <Cpu className="w-4 h-4" />
                <span>PLACEMENT QUIZ • QUESTION {currentQuestionIndex + 1} OF {PLACEMENT_QUESTIONS.length}</span>
              </div>
              <span className="text-xs font-mono text-gray-400">Score: {score}</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white leading-snug">
                {PLACEMENT_QUESTIONS[currentQuestionIndex].question}
              </h3>
              <p className="text-[11px] text-robo-textMuted mt-1 font-mono">
                💡 Hint: {PLACEMENT_QUESTIONS[currentQuestionIndex].hint}
              </p>
            </div>

            <div className="space-y-2.5">
              {PLACEMENT_QUESTIONS[currentQuestionIndex].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className="w-full text-left p-3.5 rounded-xl bg-[#040E0A] border border-robo-borderSubtle hover:border-robo-neon hover:bg-robo-neon/10 transition-all text-xs text-gray-200 flex items-center justify-between group"
                >
                  <span>{opt.text}</span>
                  <span className="w-5 h-5 rounded-full border border-gray-600 group-hover:border-robo-neon flex items-center justify-center text-[10px] text-robo-neon font-mono">
                    {String.fromCharCode(65 + idx)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: RESULT & JOURNEY LEVEL ASSIGNMENT */}
        {step === 'result' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-robo-teal/10 border border-robo-teal flex items-center justify-center text-robo-teal shadow-[0_0_24px_rgba(127,231,214,0.3)]">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="text-[11px] font-mono text-robo-teal tracking-widest uppercase bg-robo-teal/10 border border-robo-teal/30 px-3 py-1 rounded-full">
                PLACEMENT EVALUATION COMPLETE
              </span>
              <h3 className="text-2xl font-extrabold font-sans mt-3 text-white">
                Initial Rank: {score >= 2 ? 'Builder (Level 2)' : 'Rookie (Level 1)'}
              </h3>
              <p className="text-xs text-robo-textSecondary mt-1.5 max-w-md mx-auto leading-relaxed">
                You answered {score} of {PLACEMENT_QUESTIONS.length} correctly. We have calibrated your learning path and awarded you starting XP!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="p-3 rounded-xl bg-[#040E0A] border border-robo-borderSubtle text-center">
                <p className="text-[10px] font-mono text-gray-400">INITIAL XP</p>
                <p className="text-lg font-bold font-mono text-robo-neon">+{score >= 2 ? '600' : '250'} XP</p>
              </div>
              <div className="p-3 rounded-xl bg-[#040E0A] border border-robo-borderSubtle text-center">
                <p className="text-[10px] font-mono text-gray-400">STARTING STREAK</p>
                <p className="text-lg font-bold font-mono text-robo-teal">1 Day Flame</p>
              </div>
            </div>

            <button
              onClick={() => setStep('mission')}
              className="py-3 px-8 rounded-xl bg-robo-neon text-black font-extrabold text-xs shadow-neon-glow hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <span>Unlock Mission 1: Blink an LED</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: FIRST MISSION "BLINK AN LED" */}
        {step === 'mission' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-robo-neon/10 border border-robo-neon flex items-center justify-center text-robo-neon shadow-neon-glow">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] font-mono text-robo-neon tracking-widest uppercase bg-robo-neon/10 border border-robo-neon/30 px-3 py-1 rounded-full">
                FIRST ENGINEERING MISSION
              </span>
              <h3 className="text-2xl font-extrabold font-sans mt-3 text-white">
                Mission 1: The Classic LED Blink
              </h3>
              <p className="text-xs text-robo-textSecondary mt-1.5 max-w-md mx-auto leading-relaxed">
                Every roboticist begins with a single blinking LED. Wire an Arduino Uno, connect a 220Ω resistor, and observe the live circuit execution in 3D.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#040E0A] border border-robo-borderHighlight/30 text-left text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-robo-neon text-[11px]">
                <span>⚡ CIRCUIT BLUEPRINT</span>
                <span>Uno R3 + Red LED</span>
              </div>
              <p className="text-gray-300 text-[11px]">
                Pin 13 ➜ 220Ω Resistor ➜ LED Anode (+) ➜ Cathode (-) ➜ GND
              </p>
              <div className="p-2.5 rounded-lg bg-black/60 text-[11px] text-robo-teal font-mono border border-gray-800">
                <code>digitalWrite(13, HIGH); // LED On!</code>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleLaunchMission}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-xs shadow-neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch in 3D Arduino Studio</span>
              </button>
              <button
                onClick={handleSkipToDashboard}
                className="py-3 px-6 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle text-gray-300 hover:text-white text-xs font-mono transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
