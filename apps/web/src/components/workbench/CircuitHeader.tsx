'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { ChevronLeft, Edit2, Check, Sparkles, Cloud, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export type CircuitViewTab = 'circuits' | 'schematic' | 'components';

interface CircuitHeaderProps {
  projectName: string;
  onRename: (newName: string) => void;
  activeTab: CircuitViewTab;
  onTabChange: (tab: CircuitViewTab) => void;
  isSaving?: boolean;
}

export const CircuitHeader: React.FC<CircuitHeaderProps> = ({
  projectName,
  onRename,
  activeTab,
  onTabChange,
  isSaving = false,
}) => {
  const { profile } = useAuthStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);

  const handleFinishEditing = () => {
    setIsEditingName(false);
    if (editedName.trim() && editedName !== projectName) {
      onRename(editedName.trim());
    }
  };

  const studentName = profile?.fullName || 'Aarav Sharma';
  const studentInitials = studentName.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 bg-[#07110D]/95 backdrop-blur-xl border-b border-[rgba(57,255,106,0.15)] px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Left: Return Arrow, Logo & Editable Project Name */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors border border-[rgba(57,255,106,0.12)]"
          title="Return to Student Dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {/* Small Horizontal Logo */}
        <Logo variant="horizontal" size="sm" />

        <div className="h-5 w-px bg-[rgba(57,255,106,0.15)] mx-1" />

        {/* Editable Fun Name Pill */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleFinishEditing}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishEditing()}
                autoFocus
                className="px-3 py-1 rounded-full text-xs font-mono font-bold text-[#EAF7EF] bg-[#040B08] border-2 border-[#39FF6A] focus:outline-none"
              />
              <button
                onClick={handleFinishEditing}
                className="p-1 rounded-full bg-[#39FF6A] text-[#07110D] hover:brightness-110 transition-colors"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditedName(projectName);
                setIsEditingName(true);
              }}
              className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#040B08] hover:bg-[#0E2A1F] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] transition-all text-xs font-mono font-bold text-[#EAF7EF]"
              title="Click to rename project"
            >
              <span className="truncate max-w-[200px]">{projectName}</span>
              <Edit2 className="w-3 h-3 text-[#8FA99B] group-hover:text-[#39FF6A] transition-colors" />
            </button>
          )}

          {/* Cloud Autosave Status */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#8FA99B] ml-1">
            {isSaving ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-[#39FF6A]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-[#39FF6A]" />
                <span>Synced</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: Three View Tabs ("Circuits", "Schematic", "Components") matching Reference B2 */}
      <div className="flex items-center p-1 bg-[#040B08] rounded-full border border-[rgba(57,255,106,0.15)]">
        {(
          [
            { id: 'circuits', label: 'Circuits' },
            { id: 'schematic', label: 'Schematic' },
            { id: 'components', label: 'Components' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.45)]'
                  : 'text-[#8FA99B] hover:text-[#EAF7EF]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Ask Rituu AI & Student Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/rituu"
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold hover:bg-purple-900/60 shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all"
          title="Ask Rituu AI to debug circuit"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Rituu</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#39FF6A] to-[#7FE7D6] flex items-center justify-center text-[#07110D] font-black text-xs shadow-[0_0_8px_rgba(57,255,106,0.3)]">
            {studentInitials}
          </div>
          <span className="hidden lg:block text-xs font-bold text-[#EAF7EF]">
            {studentName}
          </span>
        </div>
      </div>
    </header>
  );
};
