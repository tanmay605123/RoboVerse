'use client';

import React from 'react';

interface HudRadialGaugeProps {
  completed: number;
  total: number;
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export function HudRadialGauge({
  completed = 24,
  total = 53,
  title = 'Circuit Modules',
  subtitle = 'Progress Milestone',
  accentColor = '#39FF6A',
}: HudRadialGaugeProps) {
  const percentage = Math.round((completed / total) * 100);
  const radius = 42;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
        <svg height="96" width="96" className="transform -rotate-90">
          <circle
            stroke="#0C261B"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="48"
            cy="48"
          />
          <circle
            stroke={accentColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="48"
            cy="48"
            className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_8px_rgba(57,255,106,0.6)]"
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-base font-extrabold font-mono text-robo-text">
            {percentage}%
          </span>
        </div>
      </div>

      <div>
        <div className="text-xs font-mono text-robo-teal uppercase tracking-wider">
          {subtitle}
        </div>
        <div className="text-sm font-bold text-robo-text font-sans mt-0.5">
          {title}
        </div>
        <div className="text-xs font-mono text-robo-textSecondary mt-1">
          Completed <span className="text-robo-neon font-bold">{completed}</span> / Planned{' '}
          <span className="text-robo-text font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
}
