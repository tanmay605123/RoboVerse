'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '../../../components/landing/Navbar';
import { apiRequest } from '../../../lib/apiClient';
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  Calendar,
  User,
  GraduationCap,
  ExternalLink,
  Printer,
  Copy,
  Check,
  Search,
  Sparkles,
  QrCode,
  FileCheck,
} from 'lucide-react';

interface VerificationData {
  valid: boolean;
  code: string;
  title?: string;
  studentName?: string;
  studentId?: string;
  school?: string;
  gradeScore?: number;
  issueDate?: string;
  verificationUrl?: string;
  revoked?: boolean;
  revokedReason?: string;
  error?: string;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const codeParam = (params?.code as string) || '';

  const [code, setCode] = useState(codeParam);
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!codeParam) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await apiRequest(`/certificates/verify/${encodeURIComponent(codeParam)}`);
      if (res.success && res.data) {
        setData(res.data);
      } else if (res.data) {
        setData(res.data);
      } else {
        setData({
          valid: false,
          code: codeParam,
          error: res.error?.message || 'Certificate code not found in central ledger.',
        });
      }
      setLoading(false);
    }

    verify();
  }, [codeParam]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text font-sans selection:bg-robo-neon selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-robo-surfaceRaised border border-robo-neon/40 text-robo-neon text-xs font-mono mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>ROBOVERSE PUBLIC CREDENTIAL LEDGER</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Certificate Authenticity Verification
          </h1>
          <p className="text-sm text-robo-textSecondary max-w-lg mx-auto mt-2">
            Every RoboVerse robotics mastery credential is cryptographically stamped and registered on our tamper-proof verification ledger.
          </p>
        </div>

        {/* Certificate Display or Result */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-robo-neon border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-robo-textSecondary font-mono text-sm">Validating certificate hash in cryptographic ledger...</p>
          </div>
        ) : !data || !data.valid ? (
          <div className="rounded-3xl bg-red-950/20 border border-red-500/40 p-8 sm:p-12 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-900/40 border border-red-500 mx-auto flex items-center justify-center text-red-400 mb-4 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              {data?.revoked ? 'Certificate Revoked' : 'Certificate Not Found'}
            </h2>
            <p className="text-sm text-red-200 max-w-md mx-auto mb-6">
              {data?.error || 'The entered certificate code could not be verified in our official institutional records.'}
            </p>

            {data?.revoked && data.revokedReason && (
              <div className="max-w-md mx-auto p-4 rounded-xl bg-black/60 border border-red-500/30 text-xs text-left mb-6 font-mono">
                <span className="text-red-400 font-bold block mb-1">REVOCATION REASON:</span>
                <span className="text-robo-textSecondary">{data.revokedReason}</span>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Link
                href="/verify"
                className="px-5 py-2.5 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle hover:border-robo-neon text-xs font-mono font-bold text-white transition-colors"
              >
                Search Another Code
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Diploma Certificate Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#092218] via-[#061810] to-[#040E0A] border-2 border-robo-neon/60 p-8 sm:p-12 shadow-2xl">
              {/* Corner Watermarks */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-robo-neon/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-robo-teal/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top Certificate Header */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-robo-borderSubtle pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-robo-neon font-black tracking-widest text-xs uppercase mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Official Certification of Achievement</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    RoboVerse Technologies &amp; TechSavyyy
                  </h2>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4" />
                  <span>VERIFIED GENUINE</span>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="relative z-10 text-center space-y-6 my-8">
                <p className="text-xs uppercase font-mono text-robo-textSecondary tracking-widest">
                  This certifies that
                </p>

                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {data.studentName}
                </h3>

                <div className="inline-flex items-center gap-4 text-xs font-mono text-robo-teal bg-black/50 px-4 py-2 rounded-xl border border-robo-teal/30">
                  <span>Student ID: <strong>{data.studentId}</strong></span>
                  <span>•</span>
                  <span>{data.school}</span>
                </div>

                <p className="text-sm text-robo-textSecondary max-w-xl mx-auto leading-relaxed">
                  Has successfully mastered and demonstrated rigorous engineering proficiency in
                </p>

                <div className="p-4 rounded-2xl bg-black/40 border border-robo-borderSubtle max-w-lg mx-auto">
                  <h4 className="text-lg font-black text-robo-neon mb-1">
                    {data.title}
                  </h4>
                  <div className="flex items-center justify-center gap-4 text-xs font-mono text-robo-textSecondary mt-2">
                    <span>Grade Score: <strong className="text-white">{data.gradeScore}%</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-400">Distinction</strong></span>
                  </div>
                </div>
              </div>

              {/* Certificate Footer Stamp */}
              <div className="relative z-10 pt-6 border-t border-robo-borderSubtle grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-robo-textSecondary block text-[10px]">CERTIFICATE ID</span>
                  <span className="text-white font-bold">{data.code}</span>
                </div>

                <div className="sm:text-center">
                  <span className="text-robo-textSecondary block text-[10px]">ISSUE DATE</span>
                  <span className="text-white">
                    {data.issueDate ? new Date(data.issueDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'October 2026'}
                  </span>
                </div>

                <div className="sm:text-right">
                  <span className="text-robo-textSecondary block text-[10px]">LEDGER STATUS</span>
                  <span className="text-robo-teal font-bold">Tamper-Proof Immutable</span>
                </div>
              </div>
            </div>

            {/* Verification Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-robo-surfaceRaised border border-robo-borderSubtle">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-black/50 border border-robo-borderSubtle hover:border-robo-neon text-xs font-mono text-white flex items-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-robo-neon" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Public Verification Link'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-black/50 border border-robo-borderSubtle hover:border-robo-teal text-xs font-mono text-white flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-robo-teal" />
                  <span>Print Certificate</span>
                </button>
              </div>

              <Link
                href="/dashboard"
                className="text-xs font-mono text-robo-neon hover:underline flex items-center gap-1"
              >
                <span>Return to Student Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
