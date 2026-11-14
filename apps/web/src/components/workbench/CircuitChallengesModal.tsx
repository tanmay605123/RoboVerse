'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import { useCircuitStore } from '@/store/useCircuitStore';
import { Trophy, CheckCircle2, Circle, Sparkles, X, ArrowRight } from 'lucide-react';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHALLENGES = [
  {
    id: 'ch_first_led',
    title: 'Challenge 1: Light Up Your First LED',
    difficulty: 'BEGINNER',
    xpReward: 50,
    description:
      'Assemble a closed DC circuit on the breadboard with an LED and a 220Ω resistor to prevent over-current blowout.',
    steps: [
      'Place a Half-Size Breadboard in the workbench',
      'Add a Red 5mm LED and a 220Ω Resistor',
      'Connect Arduino Pin D13 to Resistor Lead 1',
      'Connect Resistor Lead 2 to LED Anode (+)',
      'Connect LED Cathode (-) to Arduino GND',
      'Verify no short circuits or warning flags',
    ],
  },
  {
    id: 'ch_servo_sweep',
    title: 'Challenge 2: Servo Motor Angular Sweep',
    difficulty: 'INTERMEDIATE',
    xpReward: 100,
    description:
      'Interface an SG90 micro-servo motor with Arduino Pin 9 PWM and run the servo sweep sketch to rotate from 0° to 180°.',
    steps: [
      'Add an SG90 Micro Servo from the Actuators palette',
      'Connect Red VCC wire to Arduino 5V',
      'Connect Brown GND wire to Arduino GND',
      'Connect Orange PWM wire to Arduino Pin D9',
      'Select preset "SG90 Servo Sweep" in the code editor and click Compile & Run',
    ],
  },
  {
    id: 'ch_ultrasonic_alarm',
    title: 'Challenge 3: Smart Sonar Distance Alarm',
    difficulty: 'ADVANCED',
    xpReward: 150,
    description:
      'Build a non-contact obstacle radar using the HC-SR04 ultrasonic sensor and an active buzzer or LED indicator.',
    steps: [
      'Add an HC-SR04 Ultrasonic Sensor and 5V Active Buzzer',
      'Wire VCC and GND pins to the breadboard power rails',
      'Wire Trig pin to Arduino D9 and Echo pin to D10',
      'Wire Buzzer positive to Arduino D6 and negative to GND',
      'Test distance detection in the Serial Monitor',
    ],
  },
];

export const CircuitChallengesModal: React.FC<ChallengesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeChallengeId,
    setChallenge,
    verifyChallenge,
    challengeCompleted,
  } = useCircuitStore();

  if (!isOpen) return null;

  const currentChallenge =
    CHALLENGES.find((c) => c.id === activeChallengeId) || CHALLENGES[0];

  const handleVerify = () => {
    const passed = verifyChallenge();
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#39FF6A', '#7FE7D6', '#FF9A1F', '#FFFFFF'],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#07110D] border border-[#39FF6A]/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative font-sans">
        {/* Header */}
        <div className="p-4 bg-[#0E2A1F]/80 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Circuit Challenges &amp; Quests</h2>
              <p className="text-xs text-gray-400">Build verified circuits, earn XP &amp; level up your Passport</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Challenge Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {CHALLENGES.map((ch) => {
              const isSelected = ch.id === currentChallenge.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setChallenge(ch.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-[#39FF6A] bg-[#39FF6A]/15 text-white'
                      : 'border-gray-800 bg-[#0E2A1F]/30 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#39FF6A] font-bold">
                      +{ch.xpReward} XP
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-gray-400 font-mono">
                      {ch.difficulty}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate">{ch.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Challenge Details Card */}
          <div className="p-5 rounded-2xl bg-[#0E2A1F]/40 border border-gray-800 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white">{currentChallenge.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#39FF6A] font-mono font-bold bg-[#39FF6A]/10 px-2.5 py-1 rounded-full border border-[#39FF6A]/30">
                <Sparkles className="w-3.5 h-3.5" />
                +{currentChallenge.xpReward} XP Reward
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              {currentChallenge.description}
            </p>

            {/* Checklist */}
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] text-gray-400 font-sans font-bold uppercase mb-1">
                Mission Checklist:
              </div>
              {currentChallenge.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-gray-300">
                  <div className="w-4 h-4 rounded-full bg-[#07110D] border border-gray-700 flex items-center justify-center text-[10px] text-gray-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-[11px] leading-tight">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Banner if Passed */}
          {challengeCompleted && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#39FF6A] shrink-0" />
              <div>
                <div className="font-bold text-sm text-white">Challenge Completed Successfully!</div>
                <div className="text-xs text-emerald-300">
                  +{currentChallenge.xpReward} XP added to your Learning Passport. Great engineering work!
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-white"
            >
              Back to Workbench
            </button>

            <button
              onClick={handleVerify}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg transition"
            >
              Verify My Circuit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
