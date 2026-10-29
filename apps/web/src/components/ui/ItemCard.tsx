'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  Edit3,
  Trash2,
  Copy,
  Lock,
  Globe,
  GitFork,
  Heart,
  Cpu,
} from 'lucide-react';

export interface ItemCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  category?: string;
  timeAgo: string;
  isPublic?: boolean;
  remixCount?: number;
  likeCount?: number;
  componentsCount?: number;
  onSimulate?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function ItemCard({
  id,
  title,
  thumbnailUrl,
  category = 'Circuits',
  timeAgo,
  isPublic = false,
  remixCount = 3,
  likeCount = 14,
  componentsCount = 6,
  onSimulate,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
}: ItemCardProps) {
  return (
    <div className="group relative glass-card bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(57,255,106,0.35)] hover:shadow-[0_12px_40px_rgba(7,27,19,0.8),0_0_15px_rgba(57,255,106,0.15)]">
      {/* Thumbnail Area with Dark Circuit Grid */}
      <div className="relative aspect-[16/10] bg-[#040B08] border-b border-[rgba(57,255,106,0.10)] flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A] flex items-center justify-center mb-2 shadow-[0_0_10px_rgba(57,255,106,0.25)] group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono text-[#8FA99B]">
              {componentsCount} COMPONENTS
            </span>
          </div>
        )}

        {/* Top Badges (Visibility & Category) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#040B08]/90 text-[#EAF7EF] border border-[rgba(57,255,106,0.2)] backdrop-blur-md">
            {isPublic ? <Globe className="w-3 h-3 text-[#39FF6A]" /> : <Lock className="w-3 h-3 text-[#FF9A1F]" />}
            {isPublic ? 'PUBLIC' : 'PRIVATE'}
          </span>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-[#040B08]/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
          <Link
            href={`/workbench?project=${id}`}
            className="btn-primary-neon px-3.5 py-1.5 text-xs font-extrabold flex items-center gap-1.5 shadow-[0_0_12px_rgba(57,255,106,0.4)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Simulate
          </Link>
          <Link
            href={`/workbench?project=${id}&mode=edit`}
            className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-white/10 border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] hover:text-[#39FF6A] hover:bg-white/15 transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" /> Tinker
          </Link>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-[#EAF7EF] line-clamp-1 group-hover:text-[#39FF6A] transition-colors">
              {title}
            </h3>
            <span className="text-[10px] font-mono text-[#8FA99B] shrink-0">{timeAgo}</span>
          </div>

          {/* Social Stats Row */}
          <div className="flex items-center gap-3 mt-2 text-xs font-mono text-[#8FA99B]">
            <span className="flex items-center gap-1" title={`${remixCount} remixes`}>
              <GitFork className="w-3.5 h-3.5 text-[#7FE7D6]" /> {remixCount}
            </span>
            <span className="flex items-center gap-1" title={`${likeCount} likes`}>
              <Heart className="w-3.5 h-3.5 text-rose-400" /> {likeCount}
            </span>
          </div>
        </div>

        {/* Bottom Pill Action Buttons */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[rgba(57,255,106,0.10)]">
          <Link
            href={`/workbench?project=${id}`}
            className="flex-1 py-1.5 text-center text-xs font-bold rounded-full bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.35)] hover:brightness-110 transition-all"
          >
            Simulate
          </Link>
          <button
            onClick={() => onDuplicate?.(id)}
            className="px-3 py-1.5 text-xs font-bold rounded-full bg-[rgba(57,255,106,0.10)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A] hover:bg-[rgba(57,255,106,0.20)] transition-colors"
            title="Duplicate circuit"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete?.(id)}
            className="px-3 py-1.5 text-xs font-bold rounded-full bg-rose-950/30 border border-rose-500/25 text-[#FF4D4D] hover:bg-rose-900/40 transition-colors"
            title="Delete circuit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
