'use client';

import React, { useState } from 'react';

const RANGE_TABS = ['1D', '7D', '1M', '3M', '6M', '1Y', 'ALL'] as const;
type RangeTab = (typeof RANGE_TABS)[number];

interface ChartCardProps {
  title: string;
  metric: string;
  subtitle?: string;
  className?: string;
}

export function ChartCard({
  title = 'Learning & Simulation Activity',
  metric = '48.5 hrs',
  subtitle = 'Total simulation time across circuits & robot builds',
  className = '',
}: ChartCardProps) {
  const [activeRange, setActiveRange] = useState<RangeTab>('1M');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sample data points representing days / months
  const dataPoints = [
    { label: 'Mon', value: 3.2, day: 'Oct 01' },
    { label: 'Tue', value: 4.8, day: 'Oct 02' },
    { label: 'Wed', value: 2.1, day: 'Oct 03' },
    { label: 'Thu', value: 6.5, day: 'Oct 04' },
    { label: 'Fri', value: 5.4, day: 'Oct 05' },
    { label: 'Sat', value: 8.2, day: 'Oct 06' },
    { label: 'Sun', value: 7.1, day: 'Oct 07' },
    { label: 'Mon', value: 4.3, day: 'Oct 08' },
    { label: 'Tue', value: 6.9, day: 'Oct 09' },
    { label: 'Wed', value: 9.0, day: 'Oct 10' },
    { label: 'Thu', value: 5.8, day: 'Oct 11' },
    { label: 'Fri', value: 7.4, day: 'Oct 12' },
  ];

  const maxValue = Math.max(...dataPoints.map((d) => d.value));

  return (
    <div className={`glass-card p-5 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl ${className}`}>
      {/* Header with Title and Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(57,255,106,0.12)]">
        <div>
          <h3 className="text-base font-bold text-[#EAF7EF]">{title}</h3>
          {subtitle && <p className="text-xs font-mono text-[#8FA99B] mt-0.5">{subtitle}</p>}
        </div>

        {/* Range Tabs (Active = Neon Green Pill) */}
        <div className="flex items-center gap-1 p-1 bg-[#040B08] rounded-full self-start sm:self-auto overflow-x-auto border border-[rgba(57,255,106,0.12)]">
          {RANGE_TABS.map((tab) => {
            const isActive = activeRange === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveRange(tab)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_10px_rgba(57,255,106,0.4)]'
                    : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Display */}
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-black font-mono text-[#EAF7EF]">{metric}</span>
        <span className="text-xs font-mono font-semibold text-[#39FF6A] bg-[rgba(57,255,106,0.15)] border border-[rgba(57,255,106,0.3)] px-2 py-0.5 rounded-full">
          +18.2% vs last month
        </span>
      </div>

      {/* Interactive Bar Chart with Hover Tooltip */}
      <div className="mt-6 h-48 flex items-end gap-2 md:gap-3 pt-6 pb-2 relative">
        {dataPoints.map((dp, idx) => {
          const heightPct = (dp.value / maxValue) * 100;
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 bg-[#040B08] text-[#EAF7EF] border border-[#39FF6A] text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-10 whitespace-nowrap animate-fade-in">
                  {dp.day}: <span className="text-[#39FF6A]">{dp.value} hrs</span>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#040B08]" />
                </div>
              )}

              {/* Bar Column */}
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full max-w-[28px] rounded-t-lg transition-all duration-200 ${
                  isHovered
                    ? 'bg-gradient-to-t from-[#2BD95B] to-[#39FF6A] shadow-[0_0_12px_#39FF6A]'
                    : idx % 2 === 0
                    ? 'bg-[#39FF6A]/70 hover:bg-[#39FF6A]'
                    : 'bg-[#7FE7D6]/50 hover:bg-[#7FE7D6]'
                }`}
              />

              <span className="text-[10px] font-mono text-[#8FA99B] mt-2 truncate w-full text-center">
                {dp.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
