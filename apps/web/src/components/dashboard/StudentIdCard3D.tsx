'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '../brand/Logo';
import {
  ShieldCheck,
  QrCode,
  Sparkles,
  ExternalLink,
  Award,
  Flame,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface StudentIdCard3DProps {
  fullName?: string;
  studentId?: string;
  school?: string;
  planName?: string;
  qrCodeUrl?: string;
  level?: number;
  xp?: number;
  streak?: number;
}

export const StudentIdCard3D: React.FC<StudentIdCard3DProps> = ({
  fullName = 'Aarav Sharma',
  studentId = 'RV-2026-000101',
  school = 'Delhi Public School, R.K. Puram',
  planName = 'PRO MAKER',
  qrCodeUrl,
  level = 4,
  xp = 4850,
  streak = 18,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full select-none">
      {/* Top action helper */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="flex items-center gap-1.5 text-[#39FF6A] font-bold font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>OFFICIAL LEARNING PASSPORT</span>
        </span>
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#8FA99B] hover:text-[#39FF6A] transition-colors font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Flip Card</span>
        </button>
      </div>

      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 240, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-[240px] relative cursor-pointer [transform-style:preserve-3d]"
      >
        {/* FRONT FACE (Dark Glass Card with Glowing Neon Green Border) */}
        <div className="absolute inset-0 rounded-2xl p-5 bg-[#0A1F17]/95 border-2 border-[rgba(57,255,106,0.35)] shadow-[0_0_35px_rgba(57,255,106,0.2)] backdrop-blur-2xl flex flex-col justify-between [backface-visibility:hidden]">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-[rgba(57,255,106,0.15)] pb-3">
            <div className="flex items-center gap-2">
              <Logo variant="icon" size="sm" withLink={false} />
              <div>
                <div className="text-xs font-black tracking-wider text-[#EAF7EF] font-sans">
                  ROBOVERSE
                </div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#39FF6A] font-bold">
                  STUDENT IDENTITY
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]">
              {planName}
            </span>
          </div>

          {/* Student Profile Info & Avatar */}
          <div className="flex items-center gap-3.5 my-2">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#39FF6A]/60 bg-gradient-to-tr from-[#39FF6A] to-[#7FE7D6] p-0.5 shrink-0 shadow-[0_0_15px_rgba(57,255,106,0.3)]">
              <div className="w-full h-full rounded-[14px] bg-[#07110D] flex items-center justify-center text-lg font-black text-[#39FF6A]">
                {fullName.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="overflow-hidden flex-1">
              <h4 className="text-base font-extrabold text-[#EAF7EF] font-sans truncate">
                {fullName}
              </h4>
              <p className="text-[11px] text-[#8FA99B] truncate">
                {school}
              </p>
              <p className="text-xs font-mono font-bold text-[#39FF6A] mt-0.5">
                {studentId}
              </p>
            </div>
          </div>

          {/* Gamification Bar (Level, XP, Streak) */}
          <div className="pt-2.5 border-t border-[rgba(57,255,106,0.15)] flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1 text-[#EAF7EF] font-bold">
              <Award className="w-3.5 h-3.5 text-[#4C8DFF]" />
              <span>LVL {level}</span>
            </div>
            <div className="text-[#8FA99B] font-semibold">
              <span className="text-[#EAF7EF] font-bold">{xp}</span> XP
            </div>
            <div className="flex items-center gap-1 text-[#39FF6A] font-bold">
              <Flame className="w-3.5 h-3.5 text-[#39FF6A] fill-current" />
              <span>{streak}d STREAK</span>
            </div>
          </div>
        </div>

        {/* BACK FACE (Cryptographic QR & Verification in Dark Control Room Glass) */}
        <div className="absolute inset-0 rounded-2xl p-5 bg-gradient-to-br from-[#0E2A1F] via-[#0A1F17] to-[#040B08] text-[#EAF7EF] border-2 border-[rgba(57,255,106,0.35)] shadow-[0_0_35px_rgba(57,255,106,0.2)] flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex items-center justify-between border-b border-[rgba(57,255,106,0.15)] pb-2 font-mono">
            <span className="text-[10px] text-[#7FE7D6] uppercase tracking-wider font-bold">
              DIGITAL VERIFICATION PASSPORT
            </span>
            <span className="text-[9px] text-[#8FA99B]">
              ACADEMIC YEAR 2026
            </span>
          </div>

          <div className="flex items-center gap-4 my-2">
            {/* High-res QR Code */}
            <div className="w-24 h-24 p-1.5 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-lg border border-[rgba(57,255,106,0.3)]">
              {qrCodeUrl && qrCodeUrl.startsWith('data:') ? (
                <img src={qrCodeUrl} alt="Student QR Code" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-16 h-16 text-[#07110D]" />
              )}
            </div>

            <div className="text-[11px] font-mono text-[#CBD8D0] space-y-1 flex-1 min-w-0">
              <div className="text-[#EAF7EF] font-bold">Public Verification URL</div>
              <div className="text-[10px] text-[#39FF6A] truncate">
                roboverse.io/verify/{studentId}
              </div>
              <div className="flex items-center gap-1 text-[9.5px] text-[#8FA99B] pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF6A]" />
                <span>SHA-256 Ledger Verified</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(57,255,106,0.15)] flex items-center justify-between text-[10px] font-mono text-[#8FA99B]">
            <span>Valid Until: Dec 31, 2026</span>
            <span className="text-[#39FF6A]">Tap anywhere to flip</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};