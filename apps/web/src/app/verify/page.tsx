'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/landing/Navbar';
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function VerifySearchPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a valid RoboVerse Certificate Code.');
      return;
    }
    setError(null);
    router.push(`/verify/${encodeURIComponent(code.trim().toUpperCase())}`);
  };

  return (
    <div className="min-h-screen bg-[#05100B] text-robo-text font-sans selection:bg-robo-neon selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-robo-surfaceRaised border border-robo-neon/40 text-robo-neon text-xs font-mono mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>ROBOVERSE PUBLIC CREDENTIAL DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Verify a Certificate
          </h1>
          <p className="text-sm sm:text-base text-robo-textSecondary max-w-lg mx-auto">
            Validate the authenticity, track score, and student credential details of any official RoboVerse robotics certification.
          </p>
        </div>

        {/* Search Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#092016] to-[#05110C] border border-robo-neon/40 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-mono text-robo-textSecondary">
              ENTER UNIQUE CERTIFICATE CODE (E.G. RV-CERT-2026-991234)
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-robo-textSecondary" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="RV-CERT-2026-XXXXXX"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/60 border border-robo-borderSubtle text-white font-mono text-base uppercase placeholder:normal-case placeholder-robo-textSecondary/50 focus:outline-none focus:border-robo-neon transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-mono">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-robo-neon hover:bg-robo-neonHover text-black font-bold text-sm shadow-neon-glow flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify Institutional Credential</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Sample Links */}
          <div className="pt-6 border-t border-robo-borderSubtle/60 text-xs font-mono">
            <span className="text-robo-textSecondary block mb-2">QUICK TEST CODES:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push('/verify/RV-CERT-2026-991234')}
                className="px-3 py-1.5 rounded-lg bg-black/40 border border-robo-borderSubtle hover:border-robo-teal text-robo-teal flex items-center gap-1.5 transition-colors"
              >
                <span>RV-CERT-2026-991234 (Verified)</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/verify/RV-CERT-2026-REVOKED')}
                className="px-3 py-1.5 rounded-lg bg-black/40 border border-red-500/40 hover:border-red-500 text-red-400 flex items-center gap-1.5 transition-colors"
              >
                <span>RV-CERT-2026-REVOKED (Revoked Test)</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
