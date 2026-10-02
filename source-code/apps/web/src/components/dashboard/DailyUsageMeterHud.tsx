'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Camera, Code2, AlertCircle } from 'lucide-react';
import { DailyUsageStatus, PlanTier } from '@roboverse/shared';

interface DailyUsageMeterHudProps {
  usage?: Partial<DailyUsageStatus>;
  planTier?: PlanTier;
}

export function DailyUsageMeterHud({
  usage,
  planTier = PlanTier.FREE,
}: DailyUsageMeterHudProps) {
  const textUsed = usage?.textMessagesUsed ?? 1;
  const textLimit = usage?.textMessagesLimit ?? 15;
  const textPercent = Math.min(100, Math.round((textUsed / textLimit) * 100));

  const photoUsed = usage?.photoAnalysesUsed ?? 1;
  const photoLimit = usage?.photoAnalysesLimit ?? 3;
  const photoPercent = Math.min(100, Math.round((photoUsed / photoLimit) * 100));

  return (
    <div className="rounded-2xl glass-panel p-5 border border-robo-borderSubtle space-y-4">
      <div className="flex items-center justify-between border-b border-robo-borderSubtle/50 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-robo-teal" />
          <h4 className="text-xs font-mono font-bold text-robo-text uppercase tracking-wider">
            Today’s Rituu AI Quota
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-robo-teal border border-robo-teal/30">
          PLAN: {planTier}
        </span>
      </div>

      {/* Meter 1: Text Messages */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-robo-textSecondary mb-1.5">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-robo-neon" />
            <span>Text Queries</span>
          </span>
          <span>
            <strong className="text-robo-neon">{textUsed}</strong> / {textLimit} used
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              textPercent > 80 ? 'bg-robo-orange' : 'bg-robo-neon'
            }`}
            style={{ width: `${textPercent}%` }}
          />
        </div>
      </div>

      {/* Meter 2: Circuit Photo Analyses */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-robo-textSecondary mb-1.5">
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-robo-teal" />
            <span>Circuit Photo Scans</span>
          </span>
          <span>
            <strong className="text-robo-teal">{photoUsed}</strong> / {photoLimit} used
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#040B08] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              photoPercent > 80 ? 'bg-robo-orange' : 'bg-robo-teal'
            }`}
            style={{ width: `${photoPercent}%` }}
          />
        </div>
      </div>

      {/* Upgrade Callout for Free Tier */}
      {planTier === PlanTier.FREE && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-robo-neon/10 to-transparent border border-robo-neon/30 flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-robo-text">Need More Rituu Power?</div>
            <div className="text-[11px] text-robo-textMuted">
              Unlock 100 queries + 20 photo scans/day
            </div>
          </div>
          <Link
            href="/#pricing"
            className="px-3 py-1.5 rounded-lg bg-robo-neon text-black font-bold text-[11px] shrink-0 hover:brightness-110 shadow-neon-subtle"
          >
            Upgrade ₹299
          </Link>
        </div>
      )}
    </div>
  );
}
