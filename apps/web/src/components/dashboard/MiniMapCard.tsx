'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Trophy, ArrowRight, ExternalLink } from 'lucide-react';

export function MiniMapCard() {
  const [activeTab, setActiveTab] = useState<'shops' | 'leaderboard'>('shops');

  const nearbyShops = [
    { name: 'RoboElements Hub', distance: '1.2 km', status: 'OPEN', inStock: 'Arduino Uno, SG90, L298N' },
    { name: 'Silicon Arcade & Chips', distance: '2.8 km', status: 'OPEN', inStock: 'ESP32, OLED, Breadboards' },
    { name: 'ElectroMech Lab Store', distance: '4.5 km', status: 'CLOSING SOON', inStock: 'LiPo Packs, Soldering' },
  ];

  const leaders = [
    { rank: 1, name: 'Ananya Roy', city: 'Delhi', xp: '7,420 XP' },
    { rank: 2, name: 'Kabir Mehta', city: 'Bengaluru', xp: '6,890 XP' },
    { rank: 3, name: 'Devika Nair', city: 'Mumbai', xp: '6,210 XP' },
    { rank: 4, name: 'Aarav Sharma (You)', city: 'Delhi', xp: '4,850 XP' },
  ];

  return (
    <div className="glass-card p-5 bg-[#0E2A1F]/40 border border-[rgba(57,255,106,0.15)] backdrop-blur-xl">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(57,255,106,0.12)]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#39FF6A]" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EAF7EF]">
            Hardware Map & City
          </h4>
        </div>

        <div className="flex items-center p-0.5 rounded-full bg-[#040B08] border border-[rgba(57,255,106,0.15)]">
          <button
            onClick={() => setActiveTab('shops')}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
              activeTab === 'shops'
                ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] border border-[rgba(57,255,106,0.4)] shadow-[0_0_6px_rgba(57,255,106,0.3)]'
                : 'text-[#8FA99B] hover:text-[#EAF7EF]'
            }`}
          >
            Shops
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] border border-[rgba(57,255,106,0.4)] shadow-[0_0_6px_rgba(57,255,106,0.3)]'
                : 'text-[#8FA99B] hover:text-[#EAF7EF]'
            }`}
          >
            Ranks
          </button>
        </div>
      </div>

      {/* Cyber Mini-Map Canvas Graphic */}
      <div className="mt-3 relative h-28 rounded-xl overflow-hidden bg-[#040B08] border border-[rgba(57,255,106,0.15)] flex items-center justify-center">
        {/* Radar concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full border border-[rgba(57,255,106,0.15)] animate-ping" />
          <div className="absolute w-16 h-16 rounded-full border border-[rgba(57,255,106,0.25)]" />
          <div className="absolute w-8 h-8 rounded-full border border-[rgba(57,255,106,0.35)]" />
          <div className="absolute w-2 h-2 rounded-full bg-[#39FF6A] shadow-[0_0_8px_#39FF6A]" />
        </div>

        {/* Glowing shop pins scattered */}
        <div className="absolute top-5 left-8 flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#39FF6A] shadow-[0_0_6px_#39FF6A]" />
          <span className="text-[8px] font-mono text-[#7FE7D6] bg-black/70 px-1 rounded">1.2 km</span>
        </div>
        <div className="absolute bottom-6 right-10 flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7FE7D6] shadow-[0_0_6px_#7FE7D6]" />
          <span className="text-[8px] font-mono text-[#7FE7D6] bg-black/70 px-1 rounded">2.8 km</span>
        </div>
        <div className="absolute top-7 right-6 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#FF9A1F] shadow-[0_0_6px_#FF9A1F]" />
        </div>

        {/* Map Overlay Button */}
        <Link
          href="/shops"
          className="absolute bottom-2 left-2 z-10 px-2.5 py-1 rounded-md bg-[#0E2A1F]/90 border border-[rgba(57,255,106,0.3)] text-[10px] font-mono text-[#39FF6A] hover:bg-[#39FF6A] hover:text-[#07110D] transition-all flex items-center gap-1 shadow-xs"
        >
          <Navigation className="w-3 h-3" />
          <span>Launch GPS View</span>
        </Link>
      </div>

      {/* Content based on tab */}
      {activeTab === 'shops' ? (
        <div className="mt-3 space-y-2">
          {nearbyShops.map((s, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#040B08]/60 border border-[rgba(57,255,106,0.10)] flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#EAF7EF] truncate">{s.name}</p>
                  <span className="text-[9px] font-mono text-[#39FF6A]">{s.distance}</span>
                </div>
                <p className="text-[10px] text-[#8FA99B] font-mono truncate">{s.inStock}</p>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(57,255,106,0.12)] text-[#39FF6A] border border-[rgba(57,255,106,0.25)] shrink-0">
                {s.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {leaders.map((l) => (
            <div
              key={l.rank}
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                l.rank === 4
                  ? 'bg-[rgba(57,255,106,0.12)] border-[rgba(57,255,106,0.35)]'
                  : 'bg-[#040B08]/60 border-[rgba(57,255,106,0.10)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                    l.rank === 1
                      ? 'bg-amber-400 text-black'
                      : l.rank === 2
                      ? 'bg-slate-300 text-black'
                      : l.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-[#0E2A1F] text-[#39FF6A]'
                  }`}
                >
                  {l.rank}
                </span>
                <div>
                  <p className="text-xs font-bold text-[#EAF7EF]">{l.name}</p>
                  <p className="text-[10px] text-[#8FA99B] font-mono">{l.city}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#39FF6A]">{l.xp}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Link */}
      <div className="mt-3 pt-2.5 border-t border-[rgba(57,255,106,0.10)] flex items-center justify-between">
        <Link
          href="/shops"
          className="text-[11px] font-mono text-[#39FF6A] hover:underline flex items-center gap-1"
        >
          <span>Find offline electronics stores</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
