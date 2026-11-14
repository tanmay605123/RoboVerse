'use client';

import React from 'react';
import { SkillRadarScores } from '@roboverse/shared';

interface SkillRadarChartProps {
  scores?: Partial<SkillRadarScores>;
}

export function SkillRadarChart({ scores }: SkillRadarChartProps) {
  const data = [
    { label: 'Electronics', score: scores?.electronics ?? 65 },
    { label: 'Arduino C++', score: scores?.arduinoProgramming ?? 70 },
    { label: 'Mechanics', score: scores?.robotMechanics ?? 45 },
    { label: 'IoT Sensors', score: scores?.iotAndSensors ?? 50 },
    { label: 'Machine Learning', score: scores?.machineLearning ?? 30 },
    { label: 'Embedded', score: scores?.embeddedSystems ?? 55 },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 85;

  // Calculate polygon points
  const points = data.map((item, index) => {
    const angle = (Math.PI * 2 / data.length) * index - Math.PI / 2;
    const factor = item.score / 100;
    const x = center + radius * factor * Math.cos(angle);
    const y = center + radius * factor * Math.sin(angle);
    return { x, y, angle, label: item.label, score: item.score };
  });

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Background Web concentric rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-[260px] h-[260px]">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Concentric Hexagon Web Rings */}
          {rings.map((ringFactor, rIdx) => {
            const ringPoints = data.map((_, index) => {
              const angle = (Math.PI * 2 / data.length) * index - Math.PI / 2;
              const x = center + radius * ringFactor * Math.cos(angle);
              const y = center + radius * ringFactor * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');

            return (
              <polygon
                key={rIdx}
                points={ringPoints}
                fill="none"
                stroke="#123828"
                strokeWidth="1"
                strokeDasharray={rIdx === 3 ? 'none' : '3 3'}
              />
            );
          })}

          {/* Radial Spokes from Center */}
          {data.map((_, index) => {
            const angle = (Math.PI * 2 / data.length) * index - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#123828"
                strokeWidth="1"
              />
            );
          })}

          {/* Student Skill Radar Area */}
          <polygon
            points={polygonPath}
            fill="rgba(57, 255, 106, 0.25)"
            stroke="#39FF6A"
            strokeWidth="2.5"
            className="filter drop-shadow-[0_0_8px_rgba(57,255,106,0.6)]"
          />

          {/* Radar Vertex Points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#39FF6A"
              stroke="#040B08"
              strokeWidth="1.5"
            />
          ))}

          {/* External Labels with Score */}
          {points.map((p, idx) => {
            const labelRadius = radius + 24;
            const lx = center + labelRadius * Math.cos(p.angle);
            const ly = center + labelRadius * Math.sin(p.angle);

            return (
              <text
                key={idx}
                x={lx}
                y={ly + 4}
                textAnchor="middle"
                className="fill-robo-textSecondary text-[9.5px] font-mono select-none"
              >
                {p.label} ({p.score}%)
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
