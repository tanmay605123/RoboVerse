'use client';

import React, { useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import {
  Code,
  Terminal,
  Play,
  Square,
  SkipForward,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
} from 'lucide-react';

const SKETCH_PRESETS = [
  {
    id: 'blink',
    name: '1. LED Blink (Pin 13)',
    code: `// RoboVerse Arduino C++ Blink Simulator
// Pin 13 is connected through a 220Ω resistor to a Red LED

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse MCU: Blink sketch initialized!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // Turn on LED (5V)
  Serial.println("[LED] State: HIGH (Glow)");
  delay(1000);                   // Wait 1 second
  
  digitalWrite(LED_PIN, LOW);    // Turn off LED (0V)
  Serial.println("[LED] State: LOW (Dark)");
  delay(1000);                   // Wait 1 second
}
`,
  },
  {
    id: 'servo',
    name: '2. SG90 Servo Sweep (Pin 9)',
    code: `// RoboVerse SG90 9g Servo Sweep Controller
#include <Servo.h>

Servo myServo;
int pos = 0;

void setup() {
  myServo.attach(9); // Orange PWM wire to Pin 9
  Serial.begin(9600);
  Serial.println("RoboVerse MCU: Servo initialized at Pin 9");
}

void loop() {
  for (pos = 0; pos <= 180; pos += 15) {
    myServo.write(pos);
    Serial.print("[SERVO] Swept to position: ");
    Serial.println(pos);
    delay(100);
  }
  for (pos = 180; pos >= 0; pos -= 15) {
    myServo.write(pos);
    Serial.print("[SERVO] Swept back to: ");
    Serial.println(pos);
    delay(100);
  }
}
`,
  },
  {
    id: 'radar',
    name: '3. Ultrasonic Sonar Radar (HC-SR04)',
    code: `// RoboVerse HC-SR04 Ultrasonic Sonar Radar
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int BUZZER_PIN = 6;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Sonar Radar Online: Monitoring Obstacles...");
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  long distanceCm = duration * 0.034 / 2;

  Serial.print("[RADAR] Target distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  if (distanceCm < 15) {
    digitalWrite(BUZZER_PIN, HIGH); // Alarm warning!
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
  delay(300);
}
`,
  },
  {
    id: 'line_follower',
    name: '4. Autonomous Line Tracking Rover',
    code: `// RoboVerse 2WD Dual-Motor Line Follower
const int LEFT_PWM = 3;
const int RIGHT_PWM = 5;
const int IR_LEFT = 2;
const int IR_RIGHT = 4;

void setup() {
  pinMode(LEFT_PWM, OUTPUT);
  pinMode(RIGHT_PWM, OUTPUT);
  pinMode(IR_LEFT, INPUT);
  pinMode(IR_RIGHT, INPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse Rover: Autonomous line follower online");
}

void loop() {
  int leftVal = digitalRead(IR_LEFT);
  int rightVal = digitalRead(IR_RIGHT);

  if (leftVal == 0 && rightVal == 0) {
    // Both on white: Drive forward
    analogWrite(LEFT_PWM, 200);
    analogWrite(RIGHT_PWM, 200);
    Serial.println("[ROVER] Forward Full Speed");
  } else if (leftVal == 1) {
    // Turn left
    analogWrite(LEFT_PWM, 50);
    analogWrite(RIGHT_PWM, 200);
    Serial.println("[ROVER] Steering Left");
  } else if (rightVal == 1) {
    // Turn right
    analogWrite(LEFT_PWM, 200);
    analogWrite(RIGHT_PWM, 50);
    Serial.println("[ROVER] Steering Right");
  }
  delay(100);
}
`,
  },
];

export const ArduinoEditorDrawer: React.FC = () => {
  const {
    arduinoCode,
    setArduinoCode,
    setSketchType,
    isSimulating,
    startSimulation,
    stopSimulation,
    stepSimulation,
    resetCircuit,
    serialLogs,
    clearSerialLogs,
    appendSerialLog,
  } = useCircuitStore();

  const [activeTab, setActiveTab] = useState<'CODE' | 'SERIAL'>('CODE');
  const [copied, setCopied] = useState(false);
  const [baudRate, setBaudRate] = useState('9600');
  const [serialInput, setSerialInput] = useState('');

  const handleSelectPreset = (presetId: string) => {
    const preset = SKETCH_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setArduinoCode(preset.code);
      setSketchType(preset.id as any);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;
    appendSerialLog(`> ${serialInput}`);
    setSerialInput('');
  };

  return (
    <div className="w-96 h-full bg-[#07110D]/95 border-l border-[#39FF6A]/20 flex flex-col backdrop-blur-xl z-20 font-mono">
      {/* Top Header & Presets */}
      <div className="p-3 border-b border-gray-800 bg-[#0E2A1F]/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#39FF6A]" />
            <span className="text-xs font-bold text-white tracking-wider uppercase font-sans">
              Arduino C++ IDE
            </span>
          </div>

          {/* Preset Selector */}
          <select
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-[#07110D] border border-gray-700 rounded text-[11px] text-[#7FE7D6] px-2 py-1 focus:outline-none focus:border-[#39FF6A]"
          >
            {SKETCH_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Simulation Control Toolbar */}
        <div className="flex items-center gap-1.5 mt-2">
          {isSimulating ? (
            <button
              onClick={stopSimulation}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#FF3939]/20 hover:bg-[#FF3939]/30 text-[#FF3939] border border-[#FF3939]/50 rounded-lg text-xs font-bold transition font-sans"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop Sim
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black rounded-lg text-xs font-bold transition shadow-lg font-sans"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Compile & Run
            </button>
          )}

          <button
            onClick={stepSimulation}
            disabled={isSimulating}
            className="p-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 disabled:opacity-40 rounded-lg border border-gray-700 transition"
            title="Step 1 Cycle"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetCircuit}
            className="p-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition"
            title="Reset MCU & Hardware"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs: Code vs Serial Monitor */}
      <div className="flex border-b border-gray-800 text-xs font-sans">
        <button
          onClick={() => setActiveTab('CODE')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
            activeTab === 'CODE'
              ? 'border-[#39FF6A] text-[#39FF6A] bg-[#39FF6A]/5 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Sketch (C++)
        </button>
        <button
          onClick={() => setActiveTab('SERIAL')}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition ${
            activeTab === 'SERIAL'
              ? 'border-[#7FE7D6] text-[#7FE7D6] bg-[#7FE7D6]/5 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Serial Monitor
          {serialLogs.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#7FE7D6] animate-pulse" />
          )}
        </button>
      </div>

      {/* TAB 1: CODE EDITOR */}
      {activeTab === 'CODE' && (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050B08]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-gray-800/80 text-[10px] text-gray-400">
            <span>sketch.ino (ATmega328P)</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-gray-400 hover:text-[#39FF6A] transition"
            >
              {copied ? <Check className="w-3 h-3 text-[#39FF6A]" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <textarea
            value={arduinoCode}
            onChange={(e) => setArduinoCode(e.target.value)}
            className="flex-1 p-3 bg-transparent text-xs text-[#39FF6A] font-mono resize-none focus:outline-none leading-relaxed selection:bg-[#39FF6A]/30 selection:text-white"
            spellCheck={false}
          />
        </div>
      )}

      {/* TAB 2: VIRTUAL SERIAL MONITOR */}
      {activeTab === 'SERIAL' && (
        <div className="flex-1 flex flex-col bg-[#050B08] overflow-hidden text-xs">
          <div className="flex items-center justify-between p-2 bg-black/50 border-b border-gray-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Baud:</span>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="bg-[#07110D] border border-gray-700 rounded px-1.5 py-0.5 text-xs text-[#39FF6A]"
              >
                <option value="9600">9600 baud</option>
                <option value="19200">19200 baud</option>
                <option value="115200">115200 baud</option>
              </select>
            </div>
            <button
              onClick={clearSerialLogs}
              className="text-[10px] text-gray-400 hover:text-[#FF3939] transition"
            >
              Clear
            </button>
          </div>

          {/* Logs Output */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-[11px] text-gray-300">
            {serialLogs.length === 0 ? (
              <div className="text-gray-600 italic">No serial data received yet...</div>
            ) : (
              serialLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-tight ${
                    log.startsWith('>')
                      ? 'text-[#7FE7D6]'
                      : log.includes('ERROR')
                      ? 'text-[#FF3939]'
                      : 'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Send Input Bar */}
          <form
            onSubmit={handleSendSerial}
            className="p-2 border-t border-gray-800 bg-[#0E2A1F]/40 flex gap-2"
          >
            <input
              type="text"
              placeholder="Send command to Arduino..."
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              className="flex-1 bg-[#07110D] border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#7FE7D6]"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#7FE7D6]/20 hover:bg-[#7FE7D6]/30 text-[#7FE7D6] border border-[#7FE7D6]/40 rounded text-xs font-bold transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
