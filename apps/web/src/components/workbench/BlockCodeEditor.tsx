'use client';

import React, { useState, useEffect } from 'react';
import {
  Blocks,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';

export type BlockType =
  | 'PIN_MODE'
  | 'DIGITAL_WRITE'
  | 'DELAY'
  | 'IF_BUTTON'
  | 'ANALOG_WRITE'
  | 'SERVO_WRITE'
  | 'TONE'
  | 'SONAR_READ';

export interface CodeBlockItem {
  id: string;
  type: BlockType;
  params: Record<string, any>;
}

interface BlockCodeEditorProps {
  onGenerateCode: (cCode: string) => void;
  initialBlocks?: CodeBlockItem[];
}

export const DEFAULT_BLOCKS: CodeBlockItem[] = [
  { id: 'b1', type: 'PIN_MODE', params: { pin: 13, mode: 'OUTPUT' } },
  { id: 'b2', type: 'DIGITAL_WRITE', params: { pin: 13, value: 'HIGH' } },
  { id: 'b3', type: 'DELAY', params: { ms: 1000 } },
  { id: 'b4', type: 'DIGITAL_WRITE', params: { pin: 13, value: 'LOW' } },
  { id: 'b5', type: 'DELAY', params: { ms: 1000 } },
];

export function compileBlocksToCpp(blocks: CodeBlockItem[]): string {
  const setupLines: string[] = ['  Serial.begin(9600);'];
  const loopLines: string[] = [];
  let usesServo = false;

  blocks.forEach((b) => {
    switch (b.type) {
      case 'PIN_MODE':
        setupLines.push(`  pinMode(${b.params.pin}, ${b.params.mode});`);
        break;
      case 'DIGITAL_WRITE':
        loopLines.push(`  digitalWrite(${b.params.pin}, ${b.params.value});`);
        break;
      case 'DELAY':
        loopLines.push(`  delay(${b.params.ms});`);
        break;
      case 'ANALOG_WRITE':
        loopLines.push(`  analogWrite(${b.params.pin}, ${b.params.value});`);
        break;
      case 'SERVO_WRITE':
        usesServo = true;
        if (!setupLines.some((l) => l.includes('myServo.attach'))) {
          setupLines.push(`  myServo.attach(${b.params.pin});`);
        }
        loopLines.push(`  myServo.write(${b.params.angle});`);
        break;
      case 'TONE':
        loopLines.push(`  tone(${b.params.pin}, ${b.params.freq}, ${b.params.duration});`);
        break;
      case 'IF_BUTTON':
        loopLines.push(`  if (digitalRead(${b.params.pin}) == ${b.params.state}) {`);
        loopLines.push(`    digitalWrite(${b.params.actionPin}, ${b.params.actionValue});`);
        loopLines.push('  }');
        break;
      case 'SONAR_READ':
        loopLines.push(`  digitalWrite(${b.params.trigPin}, LOW); delayMicroseconds(2);`);
        loopLines.push(`  digitalWrite(${b.params.trigPin}, HIGH); delayMicroseconds(10);`);
        loopLines.push(`  digitalWrite(${b.params.trigPin}, LOW);`);
        loopLines.push(`  long duration = pulseIn(${b.params.echoPin}, HIGH);`);
        loopLines.push(`  int distCm = duration * 0.034 / 2;`);
        loopLines.push(`  Serial.print("Distance (cm): "); Serial.println(distCm);`);
        break;
    }
  });

  let code = '';
  if (usesServo) {
    code += '#include <Servo.h>\nServo myServo;\n\n';
  }
  code += 'void setup() {\n' + setupLines.join('\n') + '\n}\n\n';
  code += 'void loop() {\n' + loopLines.join('\n') + '\n}';
  return code;
}

export function BlockCodeEditor({ onGenerateCode, initialBlocks }: BlockCodeEditorProps) {
  const [blocks, setBlocks] = useState<CodeBlockItem[]>(initialBlocks || DEFAULT_BLOCKS);

  // Sync to C++ whenever blocks change
  useEffect(() => {
    const cpp = compileBlocksToCpp(blocks);
    onGenerateCode(cpp);
  }, [blocks]);

  const addBlock = (type: BlockType) => {
    const newId = `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let params: Record<string, any> = {};
    switch (type) {
      case 'PIN_MODE':
        params = { pin: 13, mode: 'OUTPUT' };
        break;
      case 'DIGITAL_WRITE':
        params = { pin: 13, value: 'HIGH' };
        break;
      case 'DELAY':
        params = { ms: 500 };
        break;
      case 'ANALOG_WRITE':
        params = { pin: 9, value: 128 };
        break;
      case 'SERVO_WRITE':
        params = { pin: 9, angle: 90 };
        break;
      case 'TONE':
        params = { pin: 8, freq: 2500, duration: 200 };
        break;
      case 'IF_BUTTON':
        params = { pin: 2, state: 'LOW', actionPin: 13, actionValue: 'HIGH' };
        break;
      case 'SONAR_READ':
        params = { trigPin: 11, echoPin: 12 };
        break;
    }
    setBlocks((prev) => [...prev, { id: newId, type, params }]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateParam = (id: string, key: string, val: any) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, params: { ...b.params, [key]: val } } : b))
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#040C08] text-xs font-sans select-none">
      {/* Top Block Palette Bar */}
      <div className="p-3 border-b border-robo-borderSubtle bg-[#030906] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-robo-neon font-bold">
          <Blocks className="w-4 h-4" />
          <span>ROBOVERSE VISUAL BLOCKS</span>
        </div>
        <span className="text-[10px] font-mono text-robo-teal px-2 py-0.5 rounded bg-black/60 border border-robo-teal/30">
          LIVE SYNC WITH C++
        </span>
      </div>

      {/* Add Block Palette Buttons */}
      <div className="p-2.5 border-b border-robo-borderSubtle/60 flex flex-wrap gap-1.5 bg-[#020704]">
        <button
          onClick={() => addBlock('PIN_MODE')}
          className="px-2 py-1 rounded-lg bg-robo-teal/15 hover:bg-robo-teal/30 text-robo-teal border border-robo-teal/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Pin Mode
        </button>
        <button
          onClick={() => addBlock('DIGITAL_WRITE')}
          className="px-2 py-1 rounded-lg bg-robo-neon/15 hover:bg-robo-neon/30 text-robo-neon border border-robo-neon/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Digital Write
        </button>
        <button
          onClick={() => addBlock('DELAY')}
          className="px-2 py-1 rounded-lg bg-robo-orange/15 hover:bg-robo-orange/30 text-robo-orange border border-robo-orange/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Delay
        </button>
        <button
          onClick={() => addBlock('ANALOG_WRITE')}
          className="px-2 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> PWM Write
        </button>
        <button
          onClick={() => addBlock('IF_BUTTON')}
          className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> If Button
        </button>
        <button
          onClick={() => addBlock('SERVO_WRITE')}
          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Servo Angle
        </button>
        <button
          onClick={() => addBlock('TONE')}
          className="px-2 py-1 rounded-lg bg-yellow-500/15 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Buzzer Tone
        </button>
        <button
          onClick={() => addBlock('SONAR_READ')}
          className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-mono text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Sonar Read
        </button>
      </div>

      {/* Blocks Sequence List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {blocks.map((b, idx) => (
          <div
            key={b.id}
            className="p-3 rounded-xl bg-[#061811] border border-robo-borderSubtle flex items-center justify-between gap-3 shadow-md hover:border-robo-neon/40 transition-colors"
          >
            {/* Block Content by Type */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="w-5 h-5 rounded-md bg-black/60 flex items-center justify-center text-[10px] text-robo-textMuted font-bold">
                {idx + 1}
              </span>

              {b.type === 'PIN_MODE' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-robo-teal/20 text-robo-teal font-bold">set pin</span>
                  <select
                    value={b.params.pin}
                    onChange={(e) => updateParam(b.id, 'pin', Number(e.target.value))}
                    className="bg-black border border-robo-borderSubtle rounded px-2 py-1 text-robo-text"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((p) => (
                      <option key={p} value={p}>D{p}</option>
                    ))}
                  </select>
                  <span className="text-robo-textMuted">mode to</span>
                  <select
                    value={b.params.mode}
                    onChange={(e) => updateParam(b.id, 'mode', e.target.value)}
                    className="bg-black border border-robo-borderSubtle rounded px-2 py-1 text-robo-neon font-bold"
                  >
                    <option value="OUTPUT">OUTPUT</option>
                    <option value="INPUT">INPUT</option>
                    <option value="INPUT_PULLUP">INPUT_PULLUP</option>
                  </select>
                </div>
              )}

              {b.type === 'DIGITAL_WRITE' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-robo-neon/20 text-robo-neon font-bold">digital write</span>
                  <span className="text-robo-textMuted">pin</span>
                  <select
                    value={b.params.pin}
                    onChange={(e) => updateParam(b.id, 'pin', Number(e.target.value))}
                    className="bg-black border border-robo-borderSubtle rounded px-2 py-1 text-robo-text"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((p) => (
                      <option key={p} value={p}>D{p}</option>
                    ))}
                  </select>
                  <span className="text-robo-textMuted">to</span>
                  <select
                    value={b.params.value}
                    onChange={(e) => updateParam(b.id, 'value', e.target.value)}
                    className={`bg-black border border-robo-borderSubtle rounded px-2 py-1 font-bold ${
                      b.params.value === 'HIGH' ? 'text-robo-neon' : 'text-robo-textMuted'
                    }`}
                  >
                    <option value="HIGH">HIGH (ON / 5V)</option>
                    <option value="LOW">LOW (OFF / 0V)</option>
                  </select>
                </div>
              )}

              {b.type === 'DELAY' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-robo-orange/20 text-robo-orange font-bold">wait</span>
                  <input
                    type="number"
                    value={b.params.ms}
                    onChange={(e) => updateParam(b.id, 'ms', Number(e.target.value))}
                    className="w-20 bg-black border border-robo-borderSubtle rounded px-2 py-1 text-robo-orange font-bold text-center"
                  />
                  <span className="text-robo-textMuted">milliseconds</span>
                </div>
              )}

              {b.type === 'ANALOG_WRITE' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">PWM write</span>
                  <select
                    value={b.params.pin}
                    onChange={(e) => updateParam(b.id, 'pin', Number(e.target.value))}
                    className="bg-black border border-robo-borderSubtle rounded px-2 py-1 text-robo-text"
                  >
                    {[3, 5, 6, 9, 10, 11].map((p) => (
                      <option key={p} value={p}>~D{p}</option>
                    ))}
                  </select>
                  <span className="text-robo-textMuted">duty (0-255):</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={b.params.value}
                    onChange={(e) => updateParam(b.id, 'value', Number(e.target.value))}
                    className="w-24 accent-[#39FF6A]"
                  />
                  <span className="text-robo-teal font-bold w-8">{b.params.value}</span>
                </div>
              )}

              {b.type === 'SERVO_WRITE' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">servo angle</span>
                  <select
                    value={b.params.pin}
                    onChange={(e) => updateParam(b.id, 'pin', Number(e.target.value))}
                    className="bg-black border border-robo-borderSubtle rounded px-2 py-1 text-robo-text"
                  >
                    {[9, 10, 6, 5, 3].map((p) => (
                      <option key={p} value={p}>D{p}</option>
                    ))}
                  </select>
                  <span className="text-robo-textMuted">to</span>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={b.params.angle}
                    onChange={(e) => updateParam(b.id, 'angle', Number(e.target.value))}
                    className="w-24 accent-[#7FE7D6]"
                  />
                  <span className="text-robo-teal font-bold w-10">{b.params.angle}°</span>
                </div>
              )}

              {b.type === 'TONE' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">buzzer tone</span>
                  <span className="text-robo-textMuted">pin D{b.params.pin} at</span>
                  <input
                    type="number"
                    value={b.params.freq}
                    onChange={(e) => updateParam(b.id, 'freq', Number(e.target.value))}
                    className="w-16 bg-black border border-robo-borderSubtle rounded px-1.5 py-0.5 text-center text-yellow-400"
                  />
                  <span className="text-robo-textMuted">Hz for</span>
                  <input
                    type="number"
                    value={b.params.duration}
                    onChange={(e) => updateParam(b.id, 'duration', Number(e.target.value))}
                    className="w-14 bg-black border border-robo-borderSubtle rounded px-1.5 py-0.5 text-center text-yellow-400"
                  />
                  <span className="text-robo-textMuted">ms</span>
                </div>
              )}

              {b.type === 'IF_BUTTON' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">if button on D{b.params.pin}</span>
                  <span className="text-robo-textMuted">is PRESSED, set D{b.params.actionPin} to</span>
                  <select
                    value={b.params.actionValue}
                    onChange={(e) => updateParam(b.id, 'actionValue', e.target.value)}
                    className="bg-black border border-robo-borderSubtle rounded px-2 py-1 text-robo-neon font-bold"
                  >
                    <option value="HIGH">HIGH (ON)</option>
                    <option value="LOW">LOW (OFF)</option>
                  </select>
                </div>
              )}

              {b.type === 'SONAR_READ' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">sonar distance</span>
                  <span className="text-robo-textMuted">Trig: D{b.params.trigPin}, Echo: D{b.params.echoPin} → print distance in cm</span>
                </div>
              )}
            </div>

            {/* Delete Block */}
            <button
              onClick={() => removeBlock(b.id)}
              className="p-1 rounded-lg text-robo-textMuted hover:text-robo-red hover:bg-robo-red/10 transition-colors"
              title="Remove block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
