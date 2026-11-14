'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCircuitStore } from '@/store/useCircuitStore';
import { BlocklyCanvas } from './BlocklyCanvas';
import { SerialPlotterCanvas } from './SerialPlotterCanvas';
import {
  Code2,
  Terminal,
  Play,
  Square,
  SkipForward,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  X,
  Layers,
  Cpu,
  Activity,
  FileCode,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { buzzerAudio } from '@/lib/simulation/webAudioBuzzer';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#1E1E1E] text-gray-400 font-mono text-xs">
      Loading Monaco C++ Engine...
    </div>
  ),
});

export const SKETCH_PRESETS = [
  {
    id: 'blink',
    name: '1. LED Blink (Pin 13)',
    code: `// RoboVerse Arduino C++ Blink Simulator
// Pin 13 is connected through a 220Ω resistor to a Red LED

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse MCU Initialized: Blink Sketch Running!");
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
  Serial.println("RoboVerse MCU: Servo Initialized at Pin 9");
}

void loop() {
  for (pos = 0; pos <= 180; pos += 15) {
    myServo.write(pos);
    Serial.print("[SERVO] Angle: ");
    Serial.println(pos);
    delay(50);
  }
  for (pos = 180; pos >= 0; pos -= 15) {
    myServo.write(pos);
    Serial.print("[SERVO] Angle: ");
    Serial.println(pos);
    delay(50);
  }
}
`,
  },
  {
    id: 'radar',
    name: '3. Sonar Distance Alert (HC-SR04)',
    code: `// RoboVerse Ultrasonic Sonar Radar Controller
const int TRIG_PIN = 7;
const int ECHO_PIN = 6;
const int BUZZER_PIN = 8;

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

  if (distanceCm > 0 && distanceCm < 15) {
    digitalWrite(BUZZER_PIN, HIGH); // Proximity Warning
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
  delay(300);
}
`,
  },
  {
    id: 'fade',
    name: '4. PWM LED Breath Fade (Pin 9)',
    code: `// RoboVerse PWM Analog Output (Fade)
const int LED_PIN = 9; // PWM pin ~9

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("PWM Breath Fade Active on Pin ~9");
}

void loop() {
  // Fade in from min to max
  for (int fadeVal = 0; fadeVal <= 255; fadeVal += 15) {
    analogWrite(LED_PIN, fadeVal);
    delay(30);
  }
  // Fade out from max to min
  for (int fadeVal = 255; fadeVal >= 0; fadeVal -= 15) {
    analogWrite(LED_PIN, fadeVal);
    delay(30);
  }
}
`,
  },
  {
    id: 'button',
    name: '5. Button Read & Toggle (Pin 2)',
    code: `// Pushbutton Input with Internal Pull-up Resistor
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorVal = digitalRead(BUTTON_PIN);
  if (sensorVal == LOW) { // Button pressed
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Button: PRESSED (LED ON)");
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(100);
}
`,
  },
  {
    id: 'rover',
    name: '6. Autonomous 2WD Rover Drive',
    code: `// RoboVerse 2WD Dual-Motor BO Gearmotor Drive
const int LEFT_MOTOR_PWM = 3;
const int RIGHT_MOTOR_PWM = 5;

void setup() {
  pinMode(LEFT_MOTOR_PWM, OUTPUT);
  pinMode(RIGHT_MOTOR_PWM, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse 2WD Rover Autonomous Controller Active!");
}

void loop() {
  // Drive Forward
  analogWrite(LEFT_MOTOR_PWM, 200);
  analogWrite(RIGHT_MOTOR_PWM, 200);
  Serial.println("[ROVER] Driving Forward Full Speed");
  delay(2000);

  // Pivot Left
  analogWrite(LEFT_MOTOR_PWM, 50);
  analogWrite(RIGHT_MOTOR_PWM, 200);
  Serial.println("[ROVER] Turning Left");
  delay(1000);
}
`,
  },
];

export interface ArduinoEditorDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ArduinoEditorDrawer: React.FC<ArduinoEditorDrawerProps> = ({
  isOpen = true,
  onClose,
}) => {
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
    components,
    oscilloscopeSamples,
  } = useCircuitStore();

  const [editorMode, setEditorMode] = useState<'TEXT' | 'BLOCKS'>('TEXT');
  const [fontSize, setFontSize] = useState<number>(13);
  const [selectedBoard, setSelectedBoard] = useState('uno_1');
  const [isCopied, setIsCopied] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Serial Monitor state
  const [isSerialOpen, setIsSerialOpen] = useState(true);
  const [serialHeight, setSerialHeight] = useState(176);
  const [serialTab, setSerialTab] = useState<'MONITOR' | 'PLOTTER'>('MONITOR');
  const [baudRate, setBaudRate] = useState('9600');
  const [serialInput, setSerialInput] = useState('');
  const [autoscroll, setAutoscroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [isMuted, setIsMuted] = useState(buzzerAudio.getIsMuted());

  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const serialResizeY = useRef<number | null>(null);

  // Programmable boards in circuit
  const programmableBoards = components.filter(
    (c) =>
      c.typeId.includes('arduino') ||
      c.typeId.includes('esp32') ||
      c.typeId.includes('microbit') ||
      c.category === 'MICROCONTROLLER'
  );

  useEffect(() => {
    if (autoscroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialLogs, autoscroll]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    const preset = SKETCH_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setArduinoCode(preset.code);
      setSketchType(preset.id as any);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const blob = new Blob([arduinoCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sketch.ino';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;
    appendSerialLog(`> ${serialInput}`);
    setSerialInput('');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    buzzerAudio.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  return (
    <aside className="w-96 sm:w-[440px] md:w-[480px] h-full bg-[#07110D]/95 backdrop-blur-2xl border-l border-[rgba(57,255,106,0.15)] flex flex-col z-30 select-none shadow-[0_0_50px_rgba(0,0,0,0.8)] font-mono text-[#EAF7EF]">
      {/* 1. TOP HEADER: Mode Dropdown, Board Selector, Preset Sketched, Font, Download, Help */}
      <div className="p-3 border-b border-[rgba(57,255,106,0.15)] bg-[#040B08]/90 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Editor Mode: Text (Monaco) / Blocks (Blockly) */}
            <div className="flex items-center p-0.5 bg-[#07110D] rounded-xl border border-[rgba(57,255,106,0.2)]">
              <button
                onClick={() => setEditorMode('TEXT')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  editorMode === 'TEXT'
                    ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]'
                    : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setEditorMode('BLOCKS')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  editorMode === 'BLOCKS'
                    ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]'
                    : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Blocks</span>
              </button>
            </div>

            {/* Board Selector */}
            {programmableBoards.length > 0 && (
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="bg-[#07110D] border border-[rgba(57,255,106,0.2)] text-xs font-bold text-[#EAF7EF] px-2 py-1 rounded-xl focus:outline-none focus:border-[#39FF6A]"
                title="Select programmable microcontroller"
              >
                {programmableBoards.map((b, idx) => (
                  <option key={b.id} value={b.id}>
                    {idx + 1} ({b.name})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right Action Icons: Sound Mute, Download, Help, Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg border transition ${
                isMuted
                  ? 'bg-[rgba(255,77,77,0.15)] text-[#FF4D4D] border-[rgba(255,77,77,0.3)]'
                  : 'bg-[#07110D] text-[#CBD8D0] border-[rgba(57,255,106,0.2)] hover:text-[#39FF6A]'
              }`}
              title={isMuted ? 'Unmute Simulator Audio' : 'Mute Simulator Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleDownloadIno}
              className="p-1.5 rounded-lg bg-[#07110D] text-[#CBD8D0] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] hover:text-[#39FF6A] transition"
              title="Download Arduino Sketch (.ino)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 rounded-lg bg-[#07110D] text-[#CBD8D0] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] hover:text-[#39FF6A] transition"
              title="Arduino Code Quick Reference"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#EAF7EF] hover:bg-white/5 transition"
                title="Close Code Panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Second Row: Starter Sketches & Font Size */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Starter Sketches dropdown */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#8FA99B] uppercase tracking-wider shrink-0">
              Sketches:
            </span>
            <select
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full bg-[#07110D] border border-[rgba(57,255,106,0.2)] rounded-xl text-[11px] font-semibold text-[#EAF7EF] px-2 py-1 focus:outline-none focus:border-[#39FF6A] truncate"
            >
              {SKETCH_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-[#8FA99B] font-bold">Size:</span>
            {[12, 14, 16].map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                  fontSize === s
                    ? 'bg-[#39FF6A] text-[#07110D]'
                    : 'bg-[#07110D] text-[#8FA99B] border border-[rgba(57,255,106,0.2)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. EDITOR BODY: Monaco Editor or Blockly Visual Blocks */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {editorMode === 'TEXT' ? (
          <div className="flex-1 relative">
            <MonacoEditor
              height="100%"
              defaultLanguage="cpp"
              language="cpp"
              value={arduinoCode}
              onChange={(val) => setArduinoCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize,
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: 'smooth',
                lineDecorationsWidth: 6,
              }}
            />

            {/* Quick Copy Floating Pill */}
            <button
              onClick={handleCopyCode}
              className="absolute top-3 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/90 text-white text-[10px] font-bold backdrop-blur-md transition shadow-md"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        ) : (
          <BlocklyCanvas
            onGenerateCode={(generatedCode) => {
              setArduinoCode(generatedCode);
            }}
          />
        )}
      </div>

      {/* 3. COLLAPSIBLE SERIAL MONITOR & SERIAL PLOTTER DRAWER */}
      <div className="border-t border-[rgba(57,255,106,0.15)] flex flex-col bg-[#040B08]/95">
        {isSerialOpen && (
          <button
            type="button"
            aria-label="Resize serial monitor"
            title="Drag to resize the Serial Monitor"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              serialResizeY.current = event.clientY;
            }}
            onPointerMove={(event) => {
              if (serialResizeY.current === null) return;
              const delta = serialResizeY.current - event.clientY;
              serialResizeY.current = event.clientY;
              setSerialHeight((height) => Math.max(96, Math.min(360, height + delta)));
            }}
            onPointerUp={() => { serialResizeY.current = null; }}
            onPointerCancel={() => { serialResizeY.current = null; }}
            className="group flex h-2 w-full cursor-row-resize items-center justify-center bg-[#07110D] hover:bg-[#0E2A1F]"
          >
            <span className="h-0.5 w-12 rounded-full bg-[#527063] group-hover:bg-[#39FF6A]" />
          </button>
        )}
        {/* Serial Header Bar */}
        <div className="px-3 py-2 bg-[#040B08] flex items-center justify-between border-b border-[rgba(57,255,106,0.15)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSerialOpen(!isSerialOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#EAF7EF] hover:text-[#39FF6A] transition font-mono"
            >
              <Terminal className="w-3.5 h-3.5 text-[#39FF6A]" />
              <span>Serial Monitor</span>
              {isSerialOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#8FA99B]" /> : <ChevronUp className="w-3.5 h-3.5 text-[#8FA99B]" />}
            </button>

            {/* Sub-tabs: Monitor vs Plotter */}
            {isSerialOpen && (
              <div className="flex items-center p-0.5 bg-[#07110D] rounded-lg border border-[rgba(57,255,106,0.2)] ml-2">
                <button
                  onClick={() => setSerialTab('MONITOR')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    serialTab === 'MONITOR'
                      ? 'bg-[#39FF6A] text-[#07110D]'
                      : 'text-[#8FA99B]'
                  }`}
                >
                  Logs
                </button>
                <button
                  onClick={() => setSerialTab('PLOTTER')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    serialTab === 'PLOTTER'
                      ? 'bg-[#39FF6A] text-[#07110D]'
                      : 'text-[#8FA99B]'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  <span>Plotter</span>
                </button>
              </div>
            )}
          </div>

          {/* Controls: Baud Rate & Clear */}
          {isSerialOpen && (
            <div className="flex items-center gap-2 font-mono">
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="bg-[#07110D] border border-[rgba(57,255,106,0.2)] text-[10px] font-bold text-[#EAF7EF] px-2 py-0.5 rounded-lg focus:outline-none"
              >
                <option value="9600">9600 baud</option>
                <option value="19200">19200 baud</option>
                <option value="38400">38400 baud</option>
                <option value="57600">57600 baud</option>
                <option value="115200">115200 baud</option>
              </select>

              <button
                onClick={clearSerialLogs}
                className="text-[10px] font-bold text-[#8FA99B] hover:text-[#FF4D4D] px-2 py-0.5 rounded bg-[#07110D] border border-[rgba(57,255,106,0.2)] transition"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Serial Content when Expanded */}
        {isSerialOpen && (
          <div className="flex flex-col" style={{ height: serialHeight }}>
            {serialTab === 'PLOTTER' ? (
              <SerialPlotterCanvas
                samples={oscilloscopeSamples}
                onClear={clearSerialLogs}
              />
            ) : (
              /* TEXT SERIAL LOGS */
              <div className="flex-1 flex flex-col overflow-hidden bg-[#040B08] font-mono text-[11px] p-2.5 text-[#39FF6A]">
                <div className="flex-1 overflow-y-auto space-y-1">
                  {serialLogs.map((log, idx) => (
                    <div key={idx} className="leading-tight">
                      {showTimestamps && (
                        <span className="text-[#527063] mr-1.5 select-none text-[10px]">
                          [{new Date().toLocaleTimeString()}]
                        </span>
                      )}
                      <span>{log}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>

                {/* Send Input Bar & Toggles */}
                <form
                  onSubmit={handleSendSerial}
                  className="flex items-center gap-1.5 pt-2 border-t border-[rgba(57,255,106,0.15)] mt-1"
                >
                  <input
                    type="text"
                    placeholder="Send command to Arduino (e.g. 1, 0, start)..."
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    className="flex-1 bg-[#07110D] border border-[rgba(57,255,106,0.2)] rounded-lg px-2.5 py-1 text-[#EAF7EF] text-[11px] placeholder:text-[#527063] focus:outline-none focus:border-[#39FF6A]"
                  />
                  <button
                    type="submit"
                    className="btn-primary-neon px-3 py-1 text-[11px] font-bold"
                  >
                    Send
                  </button>

                  <div className="flex items-center gap-2 text-[10px] text-[#8FA99B] font-mono ml-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoscroll}
                        onChange={(e) => setAutoscroll(e.target.checked)}
                        className="rounded accent-[#39FF6A]"
                      />
                      <span>Autoscroll</span>
                    </label>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ARDUINO CHEAT SHEET / QUICK REFERENCE MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1F17]/95 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[rgba(57,255,106,0.3)] animate-slide-up text-[#EAF7EF]">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(57,255,106,0.15)]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#39FF6A]" />
                <h3 className="text-sm font-extrabold text-[#EAF7EF]">
                  Arduino C++ Quick Cheat Sheet
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-full text-[#8FA99B] hover:text-[#39FF6A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
              <div className="p-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)]">
                <span className="text-[#39FF6A] font-bold">pinMode(pin, mode)</span>
                <p className="text-[11px] text-[#8FA99B] font-sans mt-0.5">
                  Sets pin as <code>INPUT</code>, <code>OUTPUT</code>, or <code>INPUT_PULLUP</code>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)]">
                <span className="text-[#39FF6A] font-bold">digitalWrite(pin, value)</span>
                <p className="text-[11px] text-[#8FA99B] font-sans mt-0.5">
                  Output 5V with <code>HIGH</code> or 0V with <code>LOW</code>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)]">
                <span className="text-[#39FF6A] font-bold">digitalRead(pin)</span>
                <p className="text-[11px] text-[#8FA99B] font-sans mt-0.5">
                  Reads pin state, returning <code>HIGH</code> (1) or <code>LOW</code> (0).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)]">
                <span className="text-[#39FF6A] font-bold">analogWrite(pin, 0-255)</span>
                <p className="text-[11px] text-[#8FA99B] font-sans mt-0.5">
                  Generates a PWM analog signal (Pins ~3, ~5, ~6, ~9, ~10, ~11).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)]">
                <span className="text-[#39FF6A] font-bold">delay(ms)</span>
                <p className="text-[11px] text-[#8FA99B] font-sans mt-0.5">
                  Pauses the program for the specified number of milliseconds (1000ms = 1s).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)]">
                <span className="text-[#39FF6A] font-bold">Serial.print(val) / Serial.println(val)</span>
                <p className="text-[11px] text-[#8FA99B] font-sans mt-0.5">
                  Prints data to the Serial Monitor at the configured baud rate.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelpModal(false)}
                className="btn-primary-neon px-4 py-1.5 text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
