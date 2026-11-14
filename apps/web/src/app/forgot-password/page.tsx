'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '../../components/brand/Logo';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message || 'Failed to send reset link. Please check the email provided.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-robo-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative hud-grid-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo variant="stacked" size="lg" />
        </div>
        <h2 className="text-2xl font-bold font-sans tracking-tight text-robo-text">
          Reset Your Access Key
        </h2>
        <p className="text-xs text-robo-textSecondary mt-1">
          Enter your registered email address to receive password reset instructions
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-3xl glass-panel p-8 border border-robo-borderHighlight/40 shadow-2xl">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-robo-neon/10 border border-robo-neon/40 flex items-center justify-center text-robo-neon">
                <CheckCircle2 className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-robo-textSecondary leading-relaxed">
                We have transmitted an authorized recovery link to <span className="font-mono text-robo-teal">{email}</span>. Please click the link inside to set your new password.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs text-robo-neon font-semibold hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Control Room Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-robo-red/10 border border-robo-red/40 text-xs text-robo-red flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                  REGISTERED EMAIL ADDRESS
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text placeholder-robo-textMuted text-sm focus:outline-none focus:border-robo-neon focus:ring-1 focus:ring-robo-neon"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.includes('@')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Transmit Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-robo-textSecondary hover:text-white transition-colors"
                >
                  Remember your password? <span className="text-robo-neon font-medium">Log in</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
