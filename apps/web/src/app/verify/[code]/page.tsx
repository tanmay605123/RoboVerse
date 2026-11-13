'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  ShieldAlert,
  Printer,
  ExternalLink,
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  QrCode,
  ArrowLeft,
  Search,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { VerifiedCertificate } from '../../api/certificates/verify/route';

export default function CertificateVerificationPage() {
  const params = useParams();
  const rawCode = params?.code as string;
  const certificateCode = rawCode ? decodeURIComponent(rawCode).trim().toUpperCase() : '';

  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!certificateCode) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/certificates/verify?code=${encodeURIComponent(certificateCode)}`);
        const json = await res.json();

        if (json.success && json.data) {
          setCertificate(json.data);
        } else {
          setError(json.error?.message || 'Certificate verification failed.');
        }
      } catch (err: any) {
        setError(err.message || 'Verification service unreachable.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [certificateCode]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#040B08] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* Top Public Header (Hidden on print) */}
      <header className="border-b border-gray-800 bg-[#07110D]/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <Link
              href="/verify"
              className="text-xs font-mono text-gray-300 hover:text-[#39FF6A] flex items-center gap-1.5 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify Another Code</span>
            </Link>

            {certificate && certificate.valid && (
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-[#39FF6A] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 hover:brightness-110 shadow transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 print:p-0">
        {loading ? (
          <div className="py-24 text-center font-mono space-y-3">
            <div className="w-10 h-10 border-2 border-[#39FF6A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-400">
              Querying RoboVerse Academy Certification Registry for {certificateCode}...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center font-mono space-y-4 max-w-lg mx-auto bg-[#07110D] border border-red-500/40 rounded-3xl p-8 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-500/50 text-red-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white font-sans">
              Certificate Not Verified
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              {error}
            </p>
            <div className="pt-2">
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-bold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Try Another Certificate Code</span>
              </Link>
            </div>
          </div>
        ) : certificate ? (
          <div className="space-y-6">
            {/* Verification Status Banner (Hidden on print) */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between font-mono text-xs print:hidden shadow-lg ${
                certificate.valid
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {certificate.valid ? (
                  <div className="w-9 h-9 rounded-xl bg-[#39FF6A]/20 border border-[#39FF6A]/40 flex items-center justify-center text-[#39FF6A]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-sm block">
                    {certificate.valid
                      ? 'OFFICIALLY VERIFIED & ACTIVE CREDENTIAL'
                      : 'WARNING: THIS CERTIFICATE HAS BEEN REVOKED'}
                  </span>
                  <span className="text-[11px] opacity-80">
                    Issued by {certificate.issuingAuthority} • Recorded in Supabase Registry
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-gray-700 rounded-xl text-[11px] flex items-center gap-1.5 transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#39FF6A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL CERTIFICATE DOCUMENT */}
            <div
              id="official-certificate-document"
              className="relative rounded-3xl bg-gradient-to-b from-[#0A1813] to-[#040907] border-4 border-[#39FF6A]/40 p-8 sm:p-14 shadow-2xl overflow-hidden print:p-8 print:border-8 print:border-emerald-800 print:bg-white print:text-black"
            >
              {/* Ornate Cybernetic Corner Accents */}
              <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#39FF6A]" />
              <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#39FF6A]" />
              <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#39FF6A]" />
              <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#39FF6A]" />

              {/* Certificate Inner Frame */}
              <div className="border border-[#7FE7D6]/20 p-6 sm:p-10 rounded-2xl relative z-10 text-center space-y-6">
                {/* Seal / Header */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#39FF6A] to-[#2BD95B] text-black font-extrabold flex items-center justify-center font-mono text-2xl shadow-[0_0_25px_rgba(57,255,106,0.4)]">
                    <Award className="w-10 h-10" />
                  </div>

                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#7FE7D6] print:text-emerald-800 font-bold">
                    ROBOVERSE ACADEMY OF ADVANCED ROBOTICS
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white print:text-black font-sans uppercase">
                    Certificate of Mastery
                  </h1>
                  <p className="text-xs text-gray-400 print:text-gray-600 font-mono">
                    This official credential is conferred in recognition of rigorous technical achievement
                  </p>
                </div>

                {/* Recipient */}
                <div className="py-2">
                  <span className="text-xs text-gray-400 print:text-gray-600 font-mono uppercase tracking-wider block">
                    Proudly Presented To
                  </span>
                  <div className="text-3xl sm:text-5xl font-extrabold text-[#39FF6A] print:text-emerald-800 tracking-tight font-sans mt-1">
                    {certificate.studentName}
                  </div>
                  <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-black/60 print:bg-gray-100 border border-gray-800 print:border-gray-300 text-xs font-mono text-gray-300 print:text-gray-700">
                    Student ID: <strong>{certificate.studentId}</strong>
                  </div>
                </div>

                {/* Course & Achievement */}
                <div className="max-w-xl mx-auto space-y-2">
                  <p className="text-xs sm:text-sm text-gray-300 print:text-gray-800 leading-relaxed">
                    for successfully demonstrating comprehensive theoretical knowledge, MNA circuit simulation,
                    and hands-on embedded firmware implementation in the specialized curriculum:
                  </p>
                  <div className="text-xl sm:text-2xl font-bold text-white print:text-black font-sans">
                    {certificate.courseName}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-gray-400 print:text-gray-600 pt-1">
                    <span>Track: <strong className="text-[#7FE7D6] print:text-black">{certificate.track}</strong></span>
                    <span>•</span>
                    <span>Curriculum Duration: <strong>{certificate.hours} Hours</strong></span>
                    <span>•</span>
                    <span>Overall Grade: <strong className="text-[#39FF6A] print:text-black">{certificate.gradeScore}% (Distinction)</strong></span>
                  </div>
                </div>

                {/* Skills Assessed Grid */}
                {certificate.skillsAssessed && certificate.skillsAssessed.length > 0 && (
                  <div className="pt-2 max-w-lg mx-auto">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 print:text-gray-600 block mb-2 font-bold">
                      Verified Competencies &amp; Lab Evaluations:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-left text-[11px] font-mono">
                      {certificate.skillsAssessed.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-gray-300 print:text-gray-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF6A] shrink-0" />
                          <span className="truncate">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Verification & Signatures */}
                <div className="pt-6 border-t border-gray-800/80 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono">
                  {/* Left: Issuance Info */}
                  <div className="text-left space-y-1">
                    <div className="text-gray-400 print:text-gray-600">
                      Issue Date: <strong className="text-white print:text-black">{new Date(certificate.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    </div>
                    <div className="text-gray-400 print:text-gray-600">
                      Credential ID: <strong className="text-[#39FF6A] print:text-black">{certificate.certificateCode}</strong>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Issuing Board: {certificate.issuingAuthority}
                    </div>
                  </div>

                  {/* Center: QR Verification Stamp */}
                  <div className="p-2 bg-white rounded-xl shadow border border-gray-300 flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#040B08] rounded flex items-center justify-center text-white">
                      <QrCode className="w-12 h-12 text-[#39FF6A]" />
                    </div>
                    <span className="text-[8px] text-black font-bold uppercase mt-1">Scan to Verify</span>
                  </div>

                  {/* Right: Digital Signature */}
                  <div className="text-right space-y-1">
                    <div className="font-serif italic text-base text-[#7FE7D6] print:text-black font-bold">
                      Dr. Rajeshwar Sen
                    </div>
                    <div className="text-[11px] font-bold text-white print:text-black">Dean of Robotics &amp; AI</div>
                    <div className="text-[10px] text-gray-400 print:text-gray-600">RoboVerse Certification Authority</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
