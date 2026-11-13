'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface SelectableCardProps {
  isSelected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  price?: string;
  features?: string[];
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode;
}

export function SelectableCard({
  isSelected,
  onSelect,
  title,
  subtitle,
  badge,
  price,
  features,
  icon: Icon,
  className = '',
  children,
}: SelectableCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative glass-card p-5 bg-[#0E2A1F]/40 backdrop-blur-xl transition-all cursor-pointer select-none ${
        isSelected
          ? 'border-2 border-[#39FF6A] ring-4 ring-[#39FF6A]/20 shadow-[0_0_20px_rgba(57,255,106,0.25)]'
          : 'border border-[rgba(57,255,106,0.15)] hover:border-[rgba(57,255,106,0.35)]'
      } ${className}`}
    >
      {/* Check Badge in Top-Right Corner */}
      <div
        className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_10px_#39FF6A] scale-100'
            : 'border-2 border-[rgba(57,255,106,0.2)] text-transparent hover:border-[#39FF6A]'
        }`}
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>

      {/* Header Info */}
      <div className="flex items-start gap-3.5 pr-8">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? 'bg-[rgba(57,255,106,0.20)] text-[#39FF6A] border border-[rgba(57,255,106,0.4)] shadow-[0_0_10px_rgba(57,255,106,0.3)]'
                : 'bg-[#040B08] text-[#8FA99B] border border-[rgba(57,255,106,0.12)]'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-[#EAF7EF]">{title}</h4>
            {badge && (
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs font-mono text-[#8FA99B] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Price tag if applicable */}
      {price && (
        <div className="mt-4">
          <span className="text-2xl font-black font-mono text-[#EAF7EF]">{price}</span>
        </div>
      )}

      {/* Features list if provided */}
      {features && features.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-[rgba(57,255,106,0.10)] pt-3">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs font-mono text-[#CBD8D0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] shrink-0 shadow-[0_0_4px_#39FF6A]" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      )}

      {children}
    </div>
  );
}
