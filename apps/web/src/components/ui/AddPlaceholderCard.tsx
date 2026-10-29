'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface AddPlaceholderCardProps {
  title?: string;
  subtitle?: string;
  onClick: () => void;
  className?: string;
}

export function AddPlaceholderCard({
  title = 'Create New Circuit',
  subtitle = 'Start a fresh 3D workshop simulation',
  onClick,
  className = '',
}: AddPlaceholderCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group w-full aspect-[16/11] rounded-[18px] border-2 border-dashed border-[rgba(57,255,106,0.20)] hover:border-[#39FF6A] bg-[#0E2A1F]/30 hover:bg-[#0E2A1F]/60 p-6 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(57,255,106,0.2)] ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] group-hover:scale-110 group-hover:bg-[#39FF6A] group-hover:text-[#07110D] group-hover:shadow-[0_0_15px_#39FF6A] flex items-center justify-center mb-3 transition-all duration-200">
        <Plus className="w-6 h-6 stroke-[3]" />
      </div>
      <p className="text-sm font-bold text-[#EAF7EF] group-hover:text-[#39FF6A] transition-colors">
        {title}
      </p>
      <p className="text-xs text-[#8FA99B] font-mono mt-1 max-w-[200px]">
        {subtitle}
      </p>
    </button>
  );
}
