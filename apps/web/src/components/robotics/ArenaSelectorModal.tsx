'use client';

import React from 'react';
import {
  X,
  Compass,
  Zap,
  Flag,
  ShieldAlert,
  Wind,
  Box,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { useRobotStore, ArenaType, ARENA_CONFIGS } from '@/store/useRobotStore';

interface ArenaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARENA_ICONS: Record<ArenaType, React.ComponentType<{ className?: string }>> = {
  arena_flat_ground: Compass,
  arena_line_track: Flag,
  arena_obstacle_maze: ShieldAlert,
  arena_sumo_ring: Trophy,
  arena_drone_gates: Wind,
  arena_pick_place: Box,
};

export const ArenaSelectorModal: React.FC<ArenaSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeArenaId, setArena, resetSimulationState } = useRobotStore();

  if (!isOpen) return null;

  const handleSelectArena = (id: ArenaType) => {
    setArena(id);
    resetSimulationState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#07110D]/95 border border-[rgba(57,255,106,0.3)] rounded-3xl p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(57,255,106,0.15)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center text-[#39FF6A]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#EAF7EF] tracking-tight">
                Select Simulation Arena
              </h2>
              <p className="text-xs text-[#8FA99B] font-mono">
                6 Physics Environments with Ground Friction, Raycasting & Dynamic Obstacles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-[#39FF6A]/50 flex items-center justify-center text-[#8FA99B] hover:text-[#EAF7EF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Arenas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-6 overflow-y-auto pr-1">
          {(Object.keys(ARENA_CONFIGS) as ArenaType[]).map((arenaId) => {
            const arena = ARENA_CONFIGS[arenaId];
            const Icon = ARENA_ICONS[arenaId] || Compass;
            const isSelected = activeArenaId === arenaId;

            return (
              <div
                key={arenaId}
                onClick={() => handleSelectArena(arenaId)}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#39FF6A]/10 border-[#39FF6A] shadow-[0_0_24px_rgba(57,255,106,0.2)]'
                    : 'bg-[#040B08]/60 border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A]/50 hover:bg-[#040B08]/90'
                }`}
              >
                {/* Active Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#39FF6A] text-[#07110D] text-[10px] font-mono font-black uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#39FF6A] text-[#07110D]'
                          : 'bg-[#39FF6A]/10 text-[#39FF6A] group-hover:bg-[#39FF6A]/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-mono uppercase text-[#7FE7D6] tracking-wider">
                      {arena.targetTimeSeconds}s Target
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#EAF7EF] mb-1">
                    {arena.name}
                  </h3>
                  <p className="text-xs text-[#8FA99B] font-mono mb-3 line-clamp-2">
                    {arena.tagline}
                  </p>
                  <p className="text-xs text-white/60 mb-4 leading-relaxed line-clamp-2">
                    {arena.description}
                  </p>
                </div>

                {/* Physics specs pills */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#8FA99B]">
                  <span>Friction: {arena.environment.groundFriction}</span>
                  <span>Gravity: {arena.environment.gravity} m/s²</span>
                  {arena.environment.windSpeedMps && (
                    <span className="text-[#7FE7D6]">Wind: {arena.environment.windSpeedMps} m/s</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(57,255,106,0.15)] flex items-center justify-between text-xs text-[#8FA99B] font-mono">
          <span>
            Current: <strong className="text-[#39FF6A]">{ARENA_CONFIGS[activeArenaId].name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#39FF6A]/40 text-[#EAF7EF] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
