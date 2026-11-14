'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShieldCheck, Award, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

const FEATURED_VERIFICATIONS = [
  {
    code: 'RV-CERT-2026-001001',
    studentName: 'Tanmay Chawda',
    courseName: 'Arduino & Electronics Foundations',
    track: 'HARDWARE & EMBEDDED SYSTEMS',
    grade: '98.5%',
  },
  {
    code: 'RV-CERT-2026-001002',
    studentName: 'Aarav Sharma',
    courseName: 'Autonomous Mobile Robotics: Line Tracers & Rovers',
    track: 'ROBOTICS & CONTROL SYSTEMS',
    grade: '96.0%',
  },
];

export default function CertificateLookupPage() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCode.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a certificate verification code.');
      return;
    }
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-[#040B08] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#07110D]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39FF6A] text-black font-extrabold flex items-center justify-center font-mono text-sm shadow">
              RV
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base">RoboVerse</span>
              <span className="text-[10px] text-[#7FE7D6] font-mono block -mt-1">
                Official Credential Verification Service
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs font-mono text-gray-300 hover:text-[#39FF6A] transition"
          >
            Student Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#39FF6A]/10 border border-[#39FF6A]/30 text-[#39FF6A] text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>PUBLIC REGISTRY LOOKUP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Verify a RoboVerse Certificate
          </h1>

          <p className="text-sm text-gray-400 font-mono max-w-xl mx-auto leading-relaxed">
            Enter the unique credential identifier found on the physical or digital certificate
            to verify student authenticity, course completion, and assessed robotics competencies.
          </p>
        </div>

        {/* Verification Input Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setError(null);
              }}
              placeholder="e.g. RV-CERT-2026-001001"
              className="w-full pl-12 pr-32 py-3.5 bg-[#07110D] border-2 border-gray-800 focus:border-[#39FF6A] rounded-2xl text-sm font-mono text-white placeholder-gray-500 uppercase tracking-wider focus:outline-none transition shadow-xl"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#39FF6A] hover:bg-[#32e55e] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow font-sans"
            >
              <span>Verify</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs font-mono text-red-400">{error}</p>}
        </form>

        {/* Quick Demo Verification Cards */}
        <div className="pt-8 text-left space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-gray-800 pb-2">
            <span className="uppercase tracking-wider font-bold">Example Verified Credentials</span>
            <span>Click to inspect live certificate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_VERIFICATIONS.map((item) => (
              <Link
                key={item.code}
                href={`/verify/${item.code}`}
                className="group p-5 bg-[#07110D] border border-gray-800 hover:border-[#39FF6A]/50 rounded-2xl transition flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-2">
                    <span className="text-[#39FF6A] font-bold">{item.code}</span>
                    <span className="px-2 py-0.5 rounded bg-[#39FF6A]/10 text-[#39FF6A] text-[10px] font-bold">
                      Grade: {item.grade}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#39FF6A] transition-colors font-sans">
                    {item.studentName}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {item.courseName}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#7FE7D6] pt-2 border-t border-gray-800/80">
                  <span>Track: {item.track}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Security & Cryptographic Guarantee */}
        <div className="pt-8 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left text-xs font-mono text-gray-400">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#39FF6A] shrink-0" />
            <div>
              <strong className="text-white block font-sans">Immutable Registry</strong>
              <span>Conferred certificates are recorded in Supabase PostgreSQL with unique SHA hash fingerprints.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Award className="w-5 h-5 text-[#7FE7D6] shrink-0" />
            <div>
              <strong className="text-white block font-sans">Accredited Rigor</strong>
              <span>Issued exclusively upon 100% completion of MNA circuit labs, firmware exams, and telemetry tests.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Lock className="w-5 h-5 text-[#39FF6A] shrink-0" />
            <div>
              <strong className="text-white block font-sans">Anti-Tampering</strong>
              <span>Revoked or forged credentials are instantly flagged by the public verification sentinel.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
