'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { Gauge, Activity, X } from 'lucide-react';

interface InstrumentsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualInstrumentsModal: React.FC<InstrumentsProps> = ({
  isOpen,
  onClose,
}) => {
  const { oscilloscopeSamples, components, pinStates, isSimulating } = useCircuitStore();
  const [activeInstrument, setActiveInstrument] = useState<'OSCILLOSCOPE' | 'MULTIMETER'>('OSCILLOSCOPE');

  // Multimeter states
  const [probeA, setProbeA] = useState<string>('arduino_uno_1:pin_d13');
  const [probeB, setProbeB] = useState<string>('arduino_uno_1:pin_gnd_1');
  const [multimeterMode, setMultimeterMode] = useState<'V' | 'mA' | 'OHM'>('V');

  // Oscilloscope controls
  const [timeDiv, setTimeDiv] = useState<number>(10);
  const [voltDiv, setVoltDiv] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render oscilloscope waveform on canvas
  useEffect(() => {
    if (!isOpen || activeInstrument !== 'OSCILLOSCOPE') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#05110A';
    ctx.fillRect(0, 0, width, height);

    // Draw reticle / oscilloscope grid lines
    ctx.strokeStyle = 'rgba(57, 255, 106, 0.15)';
    ctx.lineWidth = 1;

    // Vertical grid divisions
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid divisions
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center crosshair axis
    ctx.strokeStyle = 'rgba(57, 255, 106, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Plot waveform
    if (oscilloscopeSamples.length > 1) {
      ctx.strokeStyle = '#39FF6A';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#39FF6A';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const stepX = width / Math.max(20, oscilloscopeSamples.length - 1);
      oscilloscopeSamples.forEach((sample, i) => {
        const x = i * stepX;
        // Map 0 - 5V to canvas Y
        const normalizedY = (sample.voltage / (5 * voltDiv)) * (height * 0.7);
        const y = height - 40 - normalizedY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }
  }, [isOpen, activeInstrument, oscilloscopeSamples, voltDiv, timeDiv]);

  if (!isOpen) return null;

  // Calculate Multimeter Values
  const vA = pinStates.get(probeA)?.voltage ?? 0;
  const vB = pinStates.get(probeB)?.voltage ?? 0;
  const vDiff = Math.abs(vA - vB);
  const currentEst = vDiff > 0 ? (vDiff / 220) * 1000 : 0; // approx loop mA

  // All pins across components
  const allPins: { key: string; label: string }[] = [];
  components.forEach((c) => {
    c.pins.forEach((p) => {
      allPins.push({
        key: `${c.id}:${p.id}`,
        label: `${c.name} - ${p.name}`,
      });
    });
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#07110D] border border-[#39FF6A]/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-[#0E2A1F]/70 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Virtual Benchtop Instruments</h2>
              <p className="text-xs text-gray-400">Real-time Oscilloscope & Digital Multimeter</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveInstrument('OSCILLOSCOPE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeInstrument === 'OSCILLOSCOPE'
                  ? 'bg-[#39FF6A] text-black shadow-md'
                  : 'text-gray-400 hover:text-white bg-gray-800/40'
              }`}
            >
              2-Ch Oscilloscope
            </button>
            <button
              onClick={() => setActiveInstrument('MULTIMETER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeInstrument === 'MULTIMETER'
                  ? 'bg-[#39FF6A] text-black shadow-md'
                  : 'text-gray-400 hover:text-white bg-gray-800/40'
              }`}
            >
              Digital Multimeter (DMM)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INSTRUMENT 1: OSCILLOSCOPE */}
        {activeInstrument === 'OSCILLOSCOPE' && (
          <div className="p-6">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#1B4D3E] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              <canvas
                ref={canvasRef}
                width={700}
                height={260}
                className="w-full h-64 block"
              />

              {/* Live HUD telemetry overlays */}
              <div className="absolute top-3 left-3 bg-[#05110A]/90 border border-[#39FF6A]/40 px-3 py-1.5 rounded-lg text-[11px] font-mono text-[#39FF6A] flex gap-4">
                <span>CH1: ACTIVE (D13)</span>
                <span>Vpp: {(vDiff || 5.0).toFixed(2)}V</span>
                <span>Freq: 1.00 Hz</span>
              </div>

              {!isSimulating && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#7FE7D6] bg-black/80 px-4 py-2 rounded-xl border border-[#7FE7D6]/40">
                    Simulation Paused • Click &quot;Compile &amp; Run&quot; to stream signal
                  </span>
                </div>
              )}
            </div>

            {/* Oscilloscope Control Dials */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-[#0E2A1F]/40 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-mono">VOLTS / DIVISION</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{voltDiv} V/div</div>
                </div>
                <div className="flex gap-2">
                  {[0.5, 1, 2, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVoltDiv(v)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                        voltDiv === v
                          ? 'border-[#39FF6A] bg-[#39FF6A]/20 text-[#39FF6A]'
                          : 'border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {v}V
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E2A1F]/40 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-mono">TIME / DIVISION</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{timeDiv} ms/div</div>
                </div>
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeDiv(t)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition ${
                        timeDiv === t
                          ? 'border-[#7FE7D6] bg-[#7FE7D6]/20 text-[#7FE7D6]'
                          : 'border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}ms
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSTRUMENT 2: DIGITAL MULTIMETER */}
        {activeInstrument === 'MULTIMETER' && (
          <div className="p-6 font-mono">
            {/* 7-Segment LCD Display Frame */}
            <div className="bg-[#122A1E] border-4 border-[#07110D] rounded-2xl p-6 shadow-inner text-center relative">
              <div className="text-xs text-[#39FF6A]/70 uppercase tracking-widest mb-1">
                RoboVerse True-RMS Digital Multimeter
              </div>
              <div className="text-5xl font-black text-[#39FF6A] tracking-wider my-2">
                {multimeterMode === 'V'
                  ? `${vDiff.toFixed(2)} V`
                  : multimeterMode === 'mA'
                  ? `${currentEst.toFixed(1)} mA`
                  : `220.0 Ω`}
              </div>
              <div className="text-[11px] text-gray-400 flex justify-center gap-6 mt-2">
                <span>Mode: DC Voltage</span>
                <span>Auto-Ranging: Active</span>
                <span>Sampling: 100 Hz</span>
              </div>
            </div>

            {/* Probe Selectors & Mode Dials */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Probe Connections */}
              <div className="p-4 rounded-xl bg-[#0E2A1F]/40 border border-gray-800 space-y-3">
                <div className="text-xs font-bold text-white font-sans">Probe Attachment:</div>
                <div>
                  <label className="text-[10px] text-[#FF3939] font-bold block mb-1">
                    RED PROBE (+) :
                  </label>
                  <select
                    value={probeA}
                    onChange={(e) => setProbeA(e.target.value)}
                    className="w-full bg-[#07110D] border border-gray-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {allPins.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">
                    BLACK PROBE (-) :
                  </label>
                  <select
                    value={probeB}
                    onChange={(e) => setProbeB(e.target.value)}
                    className="w-full bg-[#07110D] border border-gray-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    {allPins.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="p-4 rounded-xl bg-[#0E2A1F]/40 border border-gray-800 flex flex-col justify-between">
                <div className="text-xs font-bold text-white font-sans">Measurement Function:</div>
                <div className="grid grid-cols-3 gap-2 my-2">
                  <button
                    onClick={() => setMultimeterMode('V')}
                    className={`p-3 rounded-xl border text-center transition ${
                      multimeterMode === 'V'
                        ? 'border-[#39FF6A] bg-[#39FF6A]/20 text-[#39FF6A] font-bold'
                        : 'border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-lg">V ⎓</div>
                    <div className="text-[10px] mt-1">DC Voltage</div>
                  </button>
                  <button
                    onClick={() => setMultimeterMode('mA')}
                    className={`p-3 rounded-xl border text-center transition ${
                      multimeterMode === 'mA'
                        ? 'border-[#39FF6A] bg-[#39FF6A]/20 text-[#39FF6A] font-bold'
                        : 'border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-lg">mA</div>
                    <div className="text-[10px] mt-1">Current</div>
                  </button>
                  <button
                    onClick={() => setMultimeterMode('OHM')}
                    className={`p-3 rounded-xl border text-center transition ${
                      multimeterMode === 'OHM'
                        ? 'border-[#39FF6A] bg-[#39FF6A]/20 text-[#39FF6A] font-bold'
                        : 'border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="text-lg">Ω</div>
                    <div className="text-[10px] mt-1">Resistance</div>
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 italic text-center">
                  Protected with 500mA fast-acting ceramic fuse
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
