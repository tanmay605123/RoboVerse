'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Check auth state on mount (Supabase automatically captures recovery token from URL hash)
  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          setSessionReady(true);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkRecoverySession();
  }, []);

  // Validation rules
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d\W]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isValid = hasMinLength && hasNumberOrSymbol && passwordsMatch;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to update password. Recovery link may have expired.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?message=password_updated');
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07110D] flex flex-col justify-between text-[#EAF7EF] font-sans relative overflow-hidden">
      {/* Background Ambience & Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0E2A1F]/60 via-[#07110D] to-[#040B08] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(57,255,106,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(57,255,106,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-[rgba(57,255,106,0.12)] bg-[#07110D]/60 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <Link
          href="/login"
          className="text-xs font-mono font-bold text-[#8FA99B] hover:text-[#39FF6A] transition-colors flex items-center gap-1.5"
        >
          <span>Back to Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glass Card Container */}
          <div className="glass-card p-6 md:p-8 bg-[#0E2A1F]/50 border border-[rgba(57,255,106,0.25)] rounded-3xl shadow-[0_12px_40px_rgba(7,27,19,0.8)] backdrop-blur-2xl relative overflow-hidden">
            {/* Glowing Top Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#39FF6A] via-[#7FE7D6] to-[#39FF6A] shadow-[0_0_12px_#39FF6A]" />

            {/* Header Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,106,0.25)] mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#EAF7EF]">
                Set New Password
              </h1>
              <p className="text-xs text-[#8FA99B] font-mono mt-1">
                Create a strong password for your RoboVerse Student Account
              </p>
            </div>

            {/* Success State */}
            {success ? (
              <div className="space-y-4 py-4 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-[rgba(57,255,106,0.15)] border border-[#39FF6A] text-[#39FF6A] mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(57,255,106,0.4)]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#EAF7EF]">
                  Password Updated Successfully!
                </h3>
                <p className="text-xs text-[#8FA99B] font-mono leading-relaxed">
                  Your credentials have been securely refreshed. Redirecting you to the login screen...
                </p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full btn-primary-neon text-xs font-bold"
                  >
                    <span>Login Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Reset Form */
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-[rgba(255,77,77,0.15)] border border-[rgba(255,77,77,0.3)] text-[#FF8585] text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#8FA99B] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-xs font-mono text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA99B] hover:text-[#39FF6A]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#8FA99B] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-xs font-mono text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA99B] hover:text-[#39FF6A]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Password Strength Requirements */}
                <div className="p-3 rounded-xl bg-[#040B08]/70 border border-[rgba(57,255,106,0.1)] space-y-1.5 font-mono text-[10.5px]">
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasMinLength ? 'bg-[#39FF6A] text-[#07110D]' : 'bg-[#0E2A1F] text-[#8FA99B]'
                    }`}>
                      ✓
                    </span>
                    <span className={hasMinLength ? 'text-[#39FF6A]' : 'text-[#8FA99B]'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      hasNumberOrSymbol ? 'bg-[#39FF6A] text-[#07110D]' : 'bg-[#0E2A1F] text-[#8FA99B]'
                    }`}>
                      ✓
                    </span>
                    <span className={hasNumberOrSymbol ? 'text-[#39FF6A]' : 'text-[#8FA99B]'}>
                      Contains number or special character
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      passwordsMatch ? 'bg-[#39FF6A] text-[#07110D]' : 'bg-[#0E2A1F] text-[#8FA99B]'
                    }`}>
                      ✓
                    </span>
                    <span className={passwordsMatch ? 'text-[#39FF6A]' : 'text-[#8FA99B]'}>
                      Passwords match
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="w-full py-3 rounded-full btn-primary-neon font-bold text-xs shadow-[0_0_18px_rgba(57,255,106,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#07110D] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Update Password & Enter Lab</span>
                    </>
                  )}
                </button>

                {/* Help Link */}
                <p className="text-[11px] font-mono text-center text-[#8FA99B] pt-2">
                  Link expired or having trouble?{' '}
                  <Link href="/login" className="text-[#39FF6A] hover:underline font-bold">
                    Request new link
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs font-mono text-[#527063]">
        RoboVerse Control Core • 256-Bit SSL • Supabase Auth Guard
      </footer>
    </div>
  );
}
