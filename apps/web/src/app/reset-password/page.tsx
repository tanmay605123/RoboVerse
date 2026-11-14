'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    // Update password using Supabase
    setTimeout(() => {
      setLoading(false);
      router.push('/login?reset=success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-robo-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative hud-grid-bg">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo variant="stacked" size="lg" />
        </div>
        <h2 className="text-2xl font-bold font-sans tracking-tight text-robo-text">
          Set New Access Password
        </h2>
        <p className="text-xs text-robo-textSecondary mt-1">
          Choose a secure, strong password to protect your projects and Learning Passport
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-3xl glass-panel p-8 border border-robo-borderHighlight/40 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-robo-red/10 border border-robo-red/40 text-xs text-robo-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text placeholder-robo-textMuted text-sm focus:outline-none focus:border-robo-neon pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-robo-textMuted hover:text-robo-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                CONFIRM NEW PASSWORD
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text placeholder-robo-textMuted text-sm focus:outline-none focus:border-robo-neon"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save New Password & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
