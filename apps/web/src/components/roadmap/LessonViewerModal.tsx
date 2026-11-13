'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LevelData } from './RoadmapWorld3D';
import { Component3D } from '../workbench/Component3D';
import { CircuitComponent } from '@roboverse/shared';
import {
  BookOpen,
  Box,
  Code,
  CheckCircle,
  HelpCircle,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';

interface LessonViewerProps {
  level: LevelData | null;
  onClose: () => void;
}

const SAMPLE_INSPECTABLE_COMPONENT: CircuitComponent = {
  id: 'inspect_arduino',
  typeId: 'arduino_uno',
  name: 'Arduino Uno R3',
  category: 'MICROCONTROLLER',
  model3DUrl: '/models/arduino_uno.glb',
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  properties: { clockMhz: 16 },
  pins: [
    { id: 'pin_5v', name: '5V (Power)', type: 'POWER_VCC', position3D: [0.6, 0.2, 0.8] },
    { id: 'pin_gnd', name: 'GND (Ground)', type: 'GROUND', position3D: [0.8, 0.2, 0.8] },
    { id: 'pin_d13', name: 'D13 (LED)', type: 'DIGITAL_IO', position3D: [0.8, 0.2, -0.8] },
  ],
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "According to Ohm's Law (V = I * R), what resistor value is needed for a 5V supply and a 2V Red LED drawing 15mA (0.015A)?",
    options: ['100 Ω', '200 Ω (approx 220 Ω standard)', '1000 Ω', '47 kΩ'],
    correctIndex: 1,
    explanation: 'Voltage drop across resistor is 5V - 2V = 3V. R = 3V / 0.015A = 200Ω. The nearest standard resistor value is 220Ω.',
  },
  {
    id: 2,
    question: 'Which Arduino pin function must be called in setup() to configure Pin 13 as a digital output?',
    options: ['digitalWrite(13, HIGH);', 'pinMode(13, OUTPUT);', 'analogRead(13);', 'Serial.begin(13);'],
    correctIndex: 1,
    explanation: 'pinMode(pin, OUTPUT) initializes the hardware pin register for output sourcing.',
  },
  {
    id: 3,
    question: 'What happens if you connect an LED directly between 5V and GND with no series resistor?',
    options: [
      'It blinks slowly',
      'Nothing happens',
      'The LED burns out immediately due to excessive forward current',
      'The Arduino turns off',
    ],
    correctIndex: 2,
    explanation: 'Without a current-limiting resistor, current exceeds maximum ratings (25mA) and destroys the PN junction.',
  },
];

export const LessonViewerModal: React.FC<LessonViewerProps> = ({ level, onClose }) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | '3D_VIEW' | 'CODE' | 'QUIZ'>('GUIDE');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  if (!level) return null;

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleGradeQuiz = () => {
    let correctCount = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    setQuizSubmitted(true);
    if (correctCount === QUIZ_QUESTIONS.length) {
      setQuizPassed(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#39FF6A', '#7FE7D6', '#FF9A1F', '#FFFFFF'],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#07110D] border border-[#39FF6A]/40 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative font-sans">
        {/* Header */}
        <div className="p-4 bg-[#0E2A1F]/80 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39FF6A]/10 border border-[#39FF6A]/40 flex items-center justify-center text-[#39FF6A]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#39FF6A]">
                  LEVEL {level.levelNumber} LESSON
                </span>
                <span className="text-[10px] bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-2 py-0.5 rounded-full font-mono">
                  +{level.xpReward} XP
                </span>
              </div>
              <h2 className="text-base font-bold text-white">{level.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 bg-[#09150F] px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'GUIDE'
                ? 'border-[#39FF6A] text-[#39FF6A] font-bold bg-[#39FF6A]/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Theory &amp; Wiring Guide
          </button>

          <button
            onClick={() => setActiveTab('3D_VIEW')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === '3D_VIEW'
                ? 'border-[#7FE7D6] text-[#7FE7D6] font-bold bg-[#7FE7D6]/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            3D Component Explorer
          </button>

          <button
            onClick={() => setActiveTab('CODE')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'CODE'
                ? 'border-[#FF9A1F] text-[#FF9A1F] font-bold bg-[#FF9A1F]/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            Arduino C++ Code
          </button>

          <button
            onClick={() => setActiveTab('QUIZ')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'QUIZ'
                ? 'border-[#39FF6A] text-[#39FF6A] font-bold bg-[#39FF6A]/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Interactive Quiz (XP)
            {quizPassed && <CheckCircle className="w-3.5 h-3.5 text-[#39FF6A]" />}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: THEORY & WIRING GUIDE */}
          {activeTab === 'GUIDE' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Building Your First Closed DC Circuit
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  In electrical engineering, electric charge only flows when there is a continuous,
                  unbroken loop between the voltage source (5V) and reference ground (0V).
                  In this lesson, we explore how current flows through an LED and why series resistance
                  is mandatory to safeguard components.
                </p>
              </div>

              {/* Ohm's Law Formula Card */}
              <div className="p-4 rounded-2xl bg-[#0E2A1F]/60 border border-[#39FF6A]/30">
                <div className="text-xs font-mono font-bold text-[#39FF6A] uppercase mb-1">
                  Core Electrical Formula: Ohm&apos;s Law
                </div>
                <div className="text-xl font-bold font-mono text-white my-1">
                  V = I × R &nbsp;➔&nbsp; R = (V_supply - V_forward) / I_target
                </div>
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  For a 5V Arduino pin driving a 2.0V Red LED at 15mA (0.015A):
                  <br />
                  R = (5V - 2.0V) / 0.015A = 200Ω ➔ Nearest standard resistor = 220Ω (Color: Red, Red, Brown).
                </p>
              </div>

              {/* Step by step guide */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Breadboard Wiring Procedure:
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800 flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#39FF6A]/20 text-[#39FF6A] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      1
                    </span>
                    <p className="text-gray-300">
                      Place the 5mm Red LED into the breadboard. The longer lead is the Anode (+),
                      and the shorter lead with the flat side is the Cathode (-).
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800 flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#39FF6A]/20 text-[#39FF6A] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      2
                    </span>
                    <p className="text-gray-300">
                      Connect a 220Ω resistor in series with the LED Anode. Resistors do not have
                      polarity, so either lead orientation works.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-gray-800 flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#39FF6A]/20 text-[#39FF6A] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      3
                    </span>
                    <p className="text-gray-300">
                      Route a jumper wire from Arduino Pin D13 to the resistor. Route another wire
                      from the LED Cathode to Arduino GND.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3D COMPONENT EXPLORER */}
          {activeTab === '3D_VIEW' && (
            <div className="w-full h-full flex flex-col">
              <div className="mb-3">
                <h3 className="text-base font-bold text-white">Interactive 360° Component Inspector</h3>
                <p className="text-xs text-gray-400">
                  Click and drag to orbit in 3D. Hover pins to inspect pinout definitions.
                </p>
              </div>

              <div className="flex-1 bg-[#050B08] rounded-2xl border border-gray-800 relative overflow-hidden">
                <Canvas camera={{ position: [0, 2.5, 4], fov: 45 }}>
                  <ambientLight intensity={1.2} />
                  <directionalLight position={[5, 10, 5]} intensity={1.5} />
                  <pointLight position={[-5, 5, -5]} color="#7FE7D6" intensity={0.8} />
                  <OrbitControls enableDamping autoRotate autoRotateSpeed={1.0} />
                  <Component3D component={SAMPLE_INSPECTABLE_COMPONENT} />
                </Canvas>
              </div>
            </div>
          )}

          {/* TAB 3: CODE SANDBOX */}
          {activeTab === 'CODE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Blink Controller Sketch (C++)</h3>
                  <p className="text-xs text-gray-400">
                    Compiled for ATmega328P 16MHz AVR Architecture
                  </p>
                </div>

                <a
                  href="/workbench"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in 3D Workbench
                </a>
              </div>

              <pre className="p-4 rounded-2xl bg-black/60 border border-gray-800 text-xs font-mono text-[#39FF6A] overflow-x-auto leading-relaxed">
{`// RoboVerse Level 1: Arduino Blink Sketch
const int LED_PIN = 13;

void setup() {
  // Configure Digital Pin 13 as an electrical output
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse MCU: Running Blink Routine...");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // Supply 5.0 Volts
  Serial.println("[LED] State: HIGH (Glow)");
  delay(1000);                   // Wait 1000ms

  digitalWrite(LED_PIN, LOW);    // Drop to 0.0 Volts (Ground)
  Serial.println("[LED] State: LOW (Dark)");
  delay(1000);                   // Wait 1000ms
}`}
              </pre>
            </div>
          )}

          {/* TAB 4: INTERACTIVE QUIZ */}
          {activeTab === 'QUIZ' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-white">
                  Knowledge Check &amp; Certification Quiz
                </h3>
                <p className="text-xs text-gray-400">
                  Answer all questions correctly to claim your +{level.xpReward} XP reward!
                </p>
              </div>

              {QUIZ_QUESTIONS.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-[#0E2A1F]/40 border border-gray-800">
                  <div className="text-xs font-bold text-white mb-3">
                    {q.id}. {q.question}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      const isCorrect = optIdx === q.correctIndex;
                      const showResult = quizSubmitted;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`w-full text-left p-3 rounded-xl text-xs transition flex items-center justify-between border ${
                            showResult
                              ? isCorrect
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                                : isSelected
                                ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                                : 'bg-black/30 border-gray-800 text-gray-400'
                              : isSelected
                              ? 'bg-[#39FF6A]/20 border-[#39FF6A] text-white font-medium'
                              : 'bg-black/30 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {showResult && isCorrect && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-gray-800 text-[11px] text-gray-300 font-mono">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {/* Submit / Retry Actions */}
              <div className="flex items-center justify-between pt-4">
                {quizPassed && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#39FF6A]">
                    <Sparkles className="w-4 h-4" />
                    Quiz Mastered! +{level.xpReward} XP awarded to your Learning Passport.
                  </div>
                )}

                <button
                  onClick={handleGradeQuiz}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg transition ml-auto"
                >
                  {quizSubmitted ? 'Re-evaluate Answers' : 'Submit Quiz for Grading'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
