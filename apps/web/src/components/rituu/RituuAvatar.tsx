'use client';

import React from 'react';
import Image from 'next/image';

export type RituuAvatarState = 'idle' | 'thinking' | 'speaking';

interface RituuAvatarProps {
  state?: RituuAvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showHalo?: boolean;
}

const SIZE_MAP = {
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
};

export const RituuAvatar: React.FC<RituuAvatarProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  showHalo = true,
}) => {
  const pixelSize = SIZE_MAP[size];

  const avatarSrc =
    state === 'thinking'
      ? '/brand/rituu-avatar-thinking.svg'
      : state === 'speaking'
      ? '/brand/rituu-avatar-speaking.svg'
      : '/brand/rituu-avatar-idle.svg';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Outer Glowing Halo Ring */}
      {showHalo && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            state === 'thinking'
              ? 'ring-2 ring-[#7FE7D6] shadow-[0_0_15px_rgba(127,231,214,0.6)] animate-spin'
              : state === 'speaking'
              ? 'ring-2 ring-[#39FF6A] shadow-[0_0_20px_rgba(57,255,106,0.8)] animate-pulse'
              : 'ring-1 ring-[#39FF6A]/30 shadow-[0_0_10px_rgba(57,255,106,0.2)]'
          }`}
        />
      )}

      {/* Rituu Robot Avatar SVG */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#07110D] border border-[#39FF6A]/40 flex items-center justify-center p-1 transition-transform ${
          state === 'thinking'
            ? 'scale-105'
            : state === 'speaking'
            ? 'scale-105'
            : 'hover:scale-105'
        }`}
      >
        <Image
          src={avatarSrc}
          alt={`Rituu Avatar (${state})`}
          width={pixelSize}
          height={pixelSize}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Dynamic Status Indicator Dot */}
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#07110D] ${
          state === 'thinking'
            ? 'bg-[#7FE7D6] animate-ping'
            : state === 'speaking'
            ? 'bg-[#39FF6A] animate-pulse'
            : 'bg-[#39FF6A]'
        }`}
      />
    </div>
  );
};
