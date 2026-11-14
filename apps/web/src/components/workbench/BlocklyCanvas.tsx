'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  RotateCw,
  Terminal,
  Radio,
  Trash2,
  Plus,
  Play,
  Layers,
} from 'lucide-react';

interface BlockItem {
  id: string;
  type: 'digital_write' | 'delay' | 'pwm_write' | 'servo_write' | 'serial_print';
  pin?: number;
  value?: any;
  text?: string;
}

interface BlocklyCanvasProps {
  onGenerateCode: (code: string) => void;
}

export const BlocklyCanvas: React.FC<BlocklyCanvasProps> = ({ onGenerateCode }) => {
  const [blocks, setBlocks] = useState<BlockItem[]>([
    { id: 'b1', type: 'digital_write', pin: 13, value: 'HIGH' },
    { id: 'b2', type: 'delay', value: 1000 },
    { id: 'b3', type: 'digital_write', pin: 13, value: 'LOW' },
    { id: 'b4', type: 'delay', value: 1000 },
  ]);

  const generateCpp = (currentBlocks: BlockItem[]) => {
    let setupLines = ['  // Initialize pins and communications', '  Serial.begin(9600);'];
    let loopLines: string[] = [];

    currentBlocks.forEach((b) => {
      if (b.type === 'digital_write') {
        setupLines.push(`  pinMode(${b.pin}, OUTPUT);`);
        loopLines.push(`  digitalWrite(${b.pin}, ${b.value});`);
      } else if (b.type === 'delay') {
        loopLines.push(`  delay(${b.value});`);
      } else if (b.type === 'pwm_write') {
        setupLines.push(`  pinMode(${b.pin}, OUTPUT);`);
        loopLines.push(`  analogWrite(${b.pin}, ${b.value});`);
      } else if (b.type === 'servo_write') {
        loopLines.push(`  // servo.write(${b.value});`);
      } else if (b.type === 'serial_print') {
        loopLines.push(`  Serial.println("${b.text ?? ''}");`);
      }
    });

    const uniqueSetup = Array.from(new Set(setupLines)).join('\n');
    return `// Auto-generated Arduino C++ from RoboVerse Visual Blocks\n\nvoid setup() {\n${uniqueSetup}\n}\n\nvoid loop() {\n${loopLines.join('\n')}\n}\n`;
  };

  const handleAddBlock = (type: BlockItem['type']) => {
    const newBlock: BlockItem = {
      id: `blk_${Date.now()}`,
      type,
      pin: 13,
      value: type === 'delay' ? 1000 : type === 'pwm_write' ? 128 : type === 'servo_write' ? 90 : 'HIGH',
      text: type === 'serial_print' ? 'RoboVerse Radar Online' : undefined,
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    onGenerateCode(generateCpp(updated));
  };

  const handleUpdateBlock = (id: string, updates: Partial<BlockItem>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBlocks(updated);
    onGenerateCode(generateCpp(updated));
  };

  const handleDeleteBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    onGenerateCode(generateCpp(updated));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#07110D] select-none overflow-hidden font-mono text-[#EAF7EF]">
      {/* Visual Blocks Toolbox Header */}
      <div className="p-2.5 bg-[#040B08]/90 border-b border-[rgba(57,255,106,0.15)] flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8FA99B] shrink-0">
          Add Block:
        </span>

        <div className="flex items-center gap-1.5 flex-nowrap">
          {/* Output Block */}
          <button
            onClick={() => handleAddBlock('digital_write')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)] text-[11px] font-bold hover:brightness-110 transition shrink-0"
          >
            <Radio className="w-3 h-3" />
            <span>Set Digital Pin</span>
          </button>

          {/* PWM Block */}
          <button
            onClick={() => handleAddBlock('pwm_write')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(76,141,255,0.12)] text-[#4C8DFF] border border-[rgba(76,141,255,0.25)] text-[11px] font-bold hover:brightness-110 transition shrink-0"
          >
            <Sliders className="w-3 h-3" />
            <span>Set PWM</span>
          </button>

          {/* Delay Block */}
          <button
            onClick={() => handleAddBlock('delay')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(255,154,31,0.12)] text-[#FF9A1F] border border-[rgba(255,154,31,0.25)] text-[11px] font-bold hover:brightness-110 transition shrink-0"
          >
            <Clock className="w-3 h-3" />
            <span>Wait (ms)</span>
          </button>

          {/* Servo Block */}
          <button
            onClick={() => handleAddBlock('servo_write')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(168,85,247,0.12)] text-[#A855F7] border border-[rgba(168,85,247,0.25)] text-[11px] font-bold hover:brightness-110 transition shrink-0"
          >
            <RotateCw className="w-3 h-3" />
            <span>Rotate Servo</span>
          </button>

          {/* Serial Print Block */}
          <button
            onClick={() => handleAddBlock('serial_print')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[rgba(127,231,214,0.12)] text-[#7FE7D6] border border-[rgba(127,231,214,0.25)] text-[11px] font-bold hover:brightness-110 transition shrink-0"
          >
            <Terminal className="w-3 h-3" />
            <span>Serial Print</span>
          </button>
        </div>
      </div>

      {/* Snap Workspace Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
        {/* Main Loop Container Bracket */}
        <div className="rounded-2xl border-2 border-dashed border-[rgba(57,255,106,0.25)] p-3 bg-[rgba(255,255,255,0.02)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#39FF6A]">
              Forever Loop (void loop)
            </span>
          </div>

          <div className="space-y-2">
            {blocks.map((b, index) => (
              <div
                key={b.id}
                className="group relative flex items-center justify-between p-2.5 rounded-xl border transition-all shadow-xs bg-[#0A1F17]/80 border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A]"
              >
                {/* Block Content */}
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAF7EF] flex-wrap">
                  <span className="w-5 h-5 rounded-full bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#39FF6A] text-[10px] flex items-center justify-center font-bold">
                    {index + 1}
                  </span>

                  {/* Digital Write */}
                  {b.type === 'digital_write' && (
                    <div className="flex items-center gap-1.5 bg-[rgba(57,255,106,0.15)] text-[#39FF6A] px-2.5 py-1 rounded-lg border border-[rgba(57,255,106,0.25)]">
                      <span>set digital pin</span>
                      <select
                        value={b.pin}
                        onChange={(e) => handleUpdateBlock(b.id, { pin: parseInt(e.target.value, 10) })}
                        className="bg-[#040B08] text-[#EAF7EF] px-1.5 py-0.5 rounded border border-[rgba(57,255,106,0.3)] font-mono text-xs font-bold"
                      >
                        {[13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <span>to</span>
                      <select
                        value={b.value}
                        onChange={(e) => handleUpdateBlock(b.id, { value: e.target.value })}
                        className="bg-[#040B08] text-[#EAF7EF] px-1.5 py-0.5 rounded border border-[rgba(57,255,106,0.3)] font-mono text-xs font-bold"
                      >
                        <option value="HIGH">HIGH (5V)</option>
                        <option value="LOW">LOW (0V)</option>
                      </select>
                    </div>
                  )}

                  {/* PWM Write */}
                  {b.type === 'pwm_write' && (
                    <div className="flex items-center gap-1.5 bg-[rgba(76,141,255,0.15)] text-[#4C8DFF] px-2.5 py-1 rounded-lg border border-[rgba(76,141,255,0.25)]">
                      <span>set PWM pin</span>
                      <select
                        value={b.pin}
                        onChange={(e) => handleUpdateBlock(b.id, { pin: parseInt(e.target.value, 10) })}
                        className="bg-[#040B08] text-[#EAF7EF] px-1.5 py-0.5 rounded border border-[rgba(76,141,255,0.3)] font-mono text-xs font-bold"
                      >
                        {[3, 5, 6, 9, 10, 11].map((p) => (
                          <option key={p} value={p}>
                            ~{p}
                          </option>
                        ))}
                      </select>
                      <span>to</span>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={b.value}
                        onChange={(e) => handleUpdateBlock(b.id, { value: parseInt(e.target.value, 10) || 0 })}
                        className="w-16 bg-[#040B08] text-[#EAF7EF] px-1.5 py-0.5 rounded border border-[rgba(76,141,255,0.3)] font-mono text-xs font-bold"
                      />
                    </div>
                  )}

                  {/* Delay */}
                  {b.type === 'delay' && (
                    <div className="flex items-center gap-1.5 bg-[rgba(255,154,31,0.15)] text-[#FF9A1F] px-2.5 py-1 rounded-lg border border-[rgba(255,154,31,0.25)]">
                      <span>wait</span>
                      <input
                        type="number"
                        step="100"
                        min="10"
                        max="10000"
                        value={b.value}
                        onChange={(e) => handleUpdateBlock(b.id, { value: parseInt(e.target.value, 10) || 1000 })}
                        className="w-16 bg-[#040B08] text-[#EAF7EF] px-1.5 py-0.5 rounded border border-[rgba(255,154,31,0.3)] font-mono text-xs font-bold"
                      />
                      <span>ms</span>
                    </div>
                  )}

                  {/* Servo Write */}
                  {b.type === 'servo_write' && (
                    <div className="flex items-center gap-1.5 bg-[rgba(168,85,247,0.15)] text-[#A855F7] px-2.5 py-1 rounded-lg border border-[rgba(168,85,247,0.25)]">
                      <span>rotate servo on pin 9 to</span>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={b.value}
                        onChange={(e) => handleUpdateBlock(b.id, { value: parseInt(e.target.value, 10) || 0 })}
                        className="w-14 bg-[#040B08] text-[#EAF7EF] px-1.5 py-0.5 rounded border border-[rgba(168,85,247,0.3)] font-mono text-xs font-bold"
                      />
                      <span>degrees</span>
                    </div>
                  )}

                  {/* Serial Print */}
                  {b.type === 'serial_print' && (
                    <div className="flex items-center gap-1.5 bg-[rgba(127,231,214,0.15)] text-[#7FE7D6] px-2.5 py-1 rounded-lg border border-[rgba(127,231,214,0.25)]">
                      <span>serial print</span>
                      <input
                        type="text"
                        value={b.text ?? ''}
                        onChange={(e) => handleUpdateBlock(b.id, { text: e.target.value })}
                        className="w-36 bg-[#040B08] text-[#EAF7EF] px-2 py-0.5 rounded border border-[rgba(127,231,214,0.3)] font-mono text-xs font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Delete Block */}
                <button
                  onClick={() => handleDeleteBlock(b.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#FF4D4D] hover:bg-[rgba(255,77,77,0.2)] transition"
                  title="Delete Block"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};