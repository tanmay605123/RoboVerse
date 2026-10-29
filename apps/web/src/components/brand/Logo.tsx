'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withLink?: boolean;
}

export function Logo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  withLink = true,
}: LogoProps) {
  // Dimensions
  let iconSize = 36;
  let textClass = 'text-xl font-bold tracking-tight';

  if (size === 'sm') {
    iconSize = 28;
    textClass = 'text-lg font-bold tracking-tight';
  } else if (size === 'lg') {
    iconSize = 44;
    textClass = 'text-2xl font-bold tracking-tight';
  } else if (size === 'xl') {
    iconSize = 56;
    textClass = 'text-3xl font-extrabold tracking-tight';
  }

  // Sharp hexagonal chip / robot-head emblem with lightning-bolt circuit trace & glowing neon node
  const LogoIcon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        <linearGradient id="hexChassisGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F3323" />
          <stop offset="100%" stopColor="#07150F" />
        </linearGradient>
        <filter id="neonGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal Outer Chip Chassis */}
      <polygon
        points="24,4 43,14 43,34 24,44 5,34 5,14"
        fill="url(#hexChassisGrad)"
        stroke="#39FF6A"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Inner Hexagonal Circuit Line */}
      <polygon
        points="24,9 38,17 38,31 24,39 10,31 10,17"
        fill="none"
        stroke="rgba(57, 255, 106, 0.25)"
        strokeWidth="1"
        strokeDasharray="3 2"
      />

      {/* Lightning-Bolt Circuit Trace across Center */}
      <path
        d="M25 13 L17 25 L24 25 L22 35 L31 23 L24 23 Z"
        fill="#39FF6A"
        filter="url(#neonGlowEffect)"
      />

      {/* Single Glowing Neon-Green Node at Top Right */}
      <circle
        cx="39"
        cy="12"
        r="3"
        fill="#39FF6A"
        filter="url(#neonGlowEffect)"
      />
      <circle
        cx="39"
        cy="12"
        r="1.2"
        fill="#FFFFFF"
      />

      {/* Subtle Circuit Pins on Hex Edge */}
      <line x1="5" y1="20" x2="1" y2="20" stroke="#7FE7D6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5" y1="28" x2="1" y2="28" stroke="#7FE7D6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="43" y1="20" x2="47" y2="20" stroke="#7FE7D6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="43" y1="28" x2="47" y2="28" stroke="#7FE7D6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const LogoText = (
    <div className="flex flex-col leading-none">
      <div className={`flex items-center font-sans ${textClass}`}>
        <span className="text-white font-extrabold tracking-tight">Robo</span>
        <span className="text-[#39FF6A] font-extrabold tracking-tight drop-shadow-[0_0_8px_rgba(57,255,106,0.6)]">
          Verse
        </span>
      </div>
      {/* Dot-matrix underline */}
      <div className="flex items-center gap-1 mt-1">
        <span className="w-1 h-1 rounded-full bg-[#39FF6A]" />
        <span className="w-1 h-1 rounded-full bg-[#39FF6A]/80" />
        <span className="w-1 h-1 rounded-full bg-[#39FF6A]/60" />
        <span className="w-1 h-1 rounded-full bg-[#39FF6A]/40" />
        <span className="w-1 h-1 rounded-full bg-[#7FE7D6]/50" />
      </div>
      {variant !== 'icon' && size !== 'sm' && (
        <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-[#8FA99B] mt-1">
          Learn it. Build it. Simulate it.
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {LogoIcon}
      {variant !== 'icon' && LogoText}
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" aria-label="RoboVerse Home">
        {content}
      </Link>
    );
  }

  return content;
}
