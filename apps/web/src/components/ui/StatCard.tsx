'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface SegmentItem {
  label: string;
  percentage: number;
  color: string;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor?: string;
  title: string;
  value: string | number;
  deltaText?: string;
  isPositiveDelta?: boolean;
  segments?: SegmentItem[];
  className?: string;
}

export function StatCard({
  icon: Icon,
  iconBgColor = 'bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A]',
  title,
  value,
  deltaText = '+8.5% today',
  isPositiveDelta = true,
  segments = [
    { label: 'Circuits', percentage: 45, color: '#39FF6A' },
    { label: 'Arduino', percentage: 30, color: '#7FE7D6' },
    { label: 'Robotics', percentage: 15, color: '#4C8DFF' },
    { label: 'AI/ML', percentage: 10, color: '#A855F7' },
  ],
  className = '',
}: StatCardProps) {
  return (
    <div className={`glass-card p-5 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl ${className}`}>
      {/* Header Row: Icon, Title & Delta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8FA99B]">
            {title}
          </span>
        </div>

        {deltaText && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
              isPositiveDelta
                ? 'bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A]'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-400'
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            {deltaText}
          </span>
        )}
      </div>

      {/* Big Bold Near-White Metric Value */}
      <div className="mt-4">
        <p className="text-3xl font-black text-[#EAF7EF] tracking-tight">
          {value}
        </p>
      </div>

      {/* Thin Multicolor Segmented Bar */}
      {segments && segments.length > 0 && (
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-[#040B08] flex overflow-hidden border border-[rgba(57,255,106,0.10)]">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.percentage}%`}
              />
            ))}
          </div>

          {/* Segment Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-2.5">
            {segments.map((seg, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono text-[#8FA99B]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span>{seg.label}</span>
                <span className="font-semibold text-[#EAF7EF]">{seg.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
