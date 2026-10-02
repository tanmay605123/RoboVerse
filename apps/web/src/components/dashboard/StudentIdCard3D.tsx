'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from '../brand/Logo';
import { ShieldCheck, Award, Zap, QrCode, RefreshCw } from 'lucide-react';
import { DigitalStudentIdCard } from '@roboverse/shared';

interface StudentIdCard3DProps {
  cardData?: Partial<DigitalStudentIdCard>;
}

export function StudentIdCard3D({ cardData }: StudentIdCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const studentId = cardData?.studentId || 'RV-2026-000101';
  const fullName = cardData?.fullName || 'Aarav Sharma';
  const planName = cardData?.planName || 'Free Explorer';
  const school = cardData?.schoolOrCollege || 'Delhi Public School';
  const level = cardData?.level || 1;
  const xp = cardData?.xp || 240;
  const streak = cardData?.streakDays || 5;
  const qrCodeUrl =
    cardData?.qrCodeDataUrl ||
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzc1tD0QAAAABJRU5ErkJggg==';

  return (
    <div className="w-full max-w-sm mx-auto select-none [perspective:1000px]">
      <div className="flex items-center justify-between mb-2 px-1 text-xs font-mono text-robo-textSecondary">
        <span className="flex items-center gap-1.5 text-robo-teal">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VERIFIABLE STUDENT ID</span>
        </span>
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1 text-[11px] text-robo-neon hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Click to Flip</span>
        </button>
      </div>

      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-[230px] sm:h-[240px] relative cursor-pointer [transform-style:preserve-3d]"
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 rounded-2xl p-5 bg-gradient-to-br from-[#0B2A1E] via-[#061811] to-[#040C08] border border-robo-neon/40 shadow-neon-glow flex flex-col justify-between [backface-visibility:hidden]">
          {/* Hologram Header */}
          <div className="flex items-center justify-between border-b border-robo-borderSubtle/60 pb-3">
            <div className="flex items-center gap-2">
              <Logo variant="icon" size="sm" withLink={false} />
              <div>
                <div className="text-[11px] font-extrabold tracking-wider text-robo-text font-sans">
                  ROBOVERSE
                </div>
                <div className="text-[9px] font-mono text-robo-teal tracking-widest">
                  CREDENTIAL
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-robo-neon/20 border border-robo-neon/50 text-robo-neon">
              {planName.toUpperCase()}
            </span>
          </div>

          {/* Student Profile Info & Avatar */}
          <div className="flex items-center gap-4 my-2">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-robo-neon/60 bg-black/60 shrink-0">
              <img
                src={cardData?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="overflow-hidden">
              <h4 className="text-base font-bold text-robo-text font-sans truncate">
                {fullName}
              </h4>
              <p className="text-[11px] text-robo-textSecondary truncate">
                {school}
              </p>
              <p className="text-xs font-mono font-bold text-robo-neon mt-0.5">
                {studentId}
              </p>
            </div>
          </div>

          {/* Gamification Bar (Level, XP, Streak) */}
          <div className="pt-2 border-t border-robo-borderSubtle/40 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-robo-teal">
              <Award className="w-3.5 h-3.5" />
              <span>LVL {level}</span>
            </div>
            <div className="text-robo-textSecondary">
              <span className="text-robo-neon font-bold">{xp}</span> XP
            </div>
            <div className="flex items-center gap-1 text-robo-orange">
              <Zap className="w-3.5 h-3.5 fill-robo-orange" />
              <span>{streak}d STREAK</span>
            </div>
          </div>
        </div>

        {/* BACK FACE (180deg rotated) */}
        <div className="absolute inset-0 rounded-2xl p-5 bg-gradient-to-bl from-[#051810] via-[#040D08] to-[#020704] border border-robo-teal/50 shadow-teal-glow flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex items-center justify-between border-b border-robo-borderSubtle/60 pb-2">
            <span className="text-[10px] font-mono text-robo-teal tracking-wider">
              CRYPTOGRAPHIC ID VERIFICATION
            </span>
            <span className="text-[9px] font-mono text-robo-textMuted">
              VALID: 2026-2030
            </span>
          </div>

          <div className="flex items-center gap-4 my-2">
            {/* High-res base64 QR Code */}
            <div className="w-24 h-24 p-1 rounded-xl bg-white flex items-center justify-center shrink-0">
              {qrCodeUrl && qrCodeUrl.startsWith('data:') ? (
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
              ) : (
                <QrCode className="w-16 h-16 text-black" />
              )}
            </div>

            <div className="text-[11px] font-mono text-robo-textSecondary space-y-1">
              <div className="text-robo-text font-bold">Official Registry Hash</div>
              <div className="text-[10px] text-robo-teal break-all">
                sha256:7f3a9e2d...01
              </div>
              <div className="text-[10px] text-robo-textMuted leading-tight pt-1">
                Scan with any mobile camera to verify student credentials & certificate authenticity.
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-robo-textMuted">
            RoboVerse Technologies Pvt Ltd • Accredited Digital Passport
          </div>
        </div>
      </motion.div>
    </div>
  );
}
