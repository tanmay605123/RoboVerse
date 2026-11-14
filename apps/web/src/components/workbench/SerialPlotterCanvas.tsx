'use client';

import React, { useRef, useEffect } from 'react';
import { Activity, Pause, Play, Trash2 } from 'lucide-react';

interface SerialPlotterProps {
  samples: Array<{ timeMs: number; voltage: number }>;
  onClear: () => void;
}

export const SerialPlotterCanvas: React.FC<SerialPlotterProps> = ({ samples, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isPaused) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#040B08';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(57, 255, 106, 0.10)';
    ctx.lineWidth = 1;

    // Horizontal grid (voltage divisions 0V to 5V)
    const vSteps = 5;
    for (let i = 0; i <= vSteps; i++) {
      const y = (height / vSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Voltage labels
      ctx.fillStyle = '#8FA99B';
      ctx.font = '9px JetBrains Mono, monospace';
      const voltVal = (5 - i).toFixed(1);
      ctx.fillText(`${voltVal}V`, 6, y - 3);
    }

    // Vertical time grid
    const tSteps = 8;
    for (let j = 0; j <= tSteps; j++) {
      const x = (width / tSteps) * j;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    if (samples.length < 2) {
      ctx.fillStyle = '#8FA99B';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting live serial data streams...', width / 2, height / 2);
      ctx.textAlign = 'left';
      return;
    }

    // Draw Waveform Line (Neon Green #39FF6A with glow)
    ctx.shadowColor = '#39FF6A';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#39FF6A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const maxPoints = Math.max(50, samples.length);
    const slice = samples.slice(-50);

    slice.forEach((s, idx) => {
      const x = (width / (slice.length - 1)) * idx;
      // map voltage (0V to 5.0V) to height (bottom to top)
      const clampedV = Math.max(0, Math.min(5.0, s.voltage));
      const y = height - (clampedV / 5.0) * (height - 20) - 10;

      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow

    // Current Value Readout
    const lastSample = slice[slice.length - 1];
    if (lastSample) {
      ctx.fillStyle = '#EAF7EF';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`CH1: ${lastSample.voltage.toFixed(2)} V`, width - 85, 18);
    }
  }, [samples, isPaused]);

  return (
    <div className="relative w-full h-44 bg-[#040B08] border-t border-[rgba(57,255,106,0.15)] flex flex-col select-none font-mono">
      {/* Top Toolbar */}
      <div className="px-3 py-1.5 bg-[#0A1F17] border-b border-[rgba(57,255,106,0.15)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#39FF6A] font-bold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[11px]">SERIAL PLOTTER (WAVEFORM CH1)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded bg-[#07110D] hover:bg-white/5 text-[#CBD8D0] text-[10px] font-bold flex items-center gap-1 px-2 border border-[rgba(57,255,106,0.2)]"
          >
            {isPaused ? <Play className="w-3 h-3 text-[#39FF6A]" /> : <Pause className="w-3 h-3 text-[#FF9A1F]" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onClear}
            className="p-1 rounded bg-[#07110D] hover:bg-[rgba(255,77,77,0.15)] text-[#CBD8D0] hover:text-[#FF4D4D] text-[10px] font-bold flex items-center gap-1 px-2 border border-[rgba(57,255,106,0.2)]"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={380}
        height={136}
        className="w-full flex-1"
      />
    </div>
  );
};
