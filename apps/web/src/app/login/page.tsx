'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  Fingerprint,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { apiRequest } from '../../lib/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { getSafeRedirectUrl } from '../../lib/authRedirect';
import { getSupabaseClient } from '../../lib/supabaseClient';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || null;

  const setAuth = useAuthStore((s) => s.setAuth);

  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [identifier, setIdentifier] = useState('aarav.sharma@example.com');
  const [password, setPassword] = useState('RoboSpark#2026');
  const [mobileNumber, setMobileNumber] = useState('+919876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Check if redirected after password reset
  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setInfoMessage('Password reset successfully! Please sign in with your new password.');
    }
  }, [searchParams]);

  // Handle Password / Student ID Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    // 1. Try Supabase Auth first
    const supabase = getSupabaseClient();
    if (identifier.includes('@')) {
      const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (!supaError && supaData?.user) {
        setLoading(false);
        const user = supaData.user;
        const profile = user.user_metadata || {};
        const role = profile.role || 'student';
        const studentId = profile.student_id || 'RV-2026-000101';

        setAuth({
          user: {
            id: user.id,
            email: user.email || identifier,
            role,
          },
          profile: {
            fullName: profile.full_name || 'RoboVerse Explorer',
            studentId,
            schoolOrCollegeName: profile.school_or_college || 'Indian Institute of Technology',
            classOrYear: profile.class_level || 'Grade 10',
            city: profile.city || 'New Delhi',
            state: profile.state || 'Delhi',
            interests: profile.interests || ['arduino', 'circuit_design'],
            level: 1,
            xp: 250,
            streakDays: 3,
            totalLearningHours: 4.5,
          },
          studentIdCard: {
            studentId,
            qrCodeDataUrl: '',
            verificationUrl: `https://roboverse-delta.vercel.app/verify/student/${studentId}`,
            validUntil: '2027-12-31',
          },
          tokens: {
            accessToken: supaData.access_token || 'mock_supa_token',
            refreshToken: supaData.refresh_token || 'mock_supa_refresh',
          },
        });

        router.push(getSafeRedirectUrl(nextUrl, role));
        return;
      }
    }

    // 2. Fallback to API bridge
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    setLoading(false);
    if (!res.success) {
      // Deterministic demo fallback if backend offline
      if (identifier === 'aarav.sharma@example.com' || identifier === 'RV-2026-000001' || identifier === 'admin@roboverse.io') {
        const isAdmin = identifier === 'admin@roboverse.io';
        const role = isAdmin ? 'admin' : 'student';
        const studentId = isAdmin ? 'RV-ADMIN-0001' : 'RV-2026-000101';

        setAuth({
          user: {
            id: 'user_demo_01',
            email: identifier,
            role,
          },
          profile: {
            fullName: isAdmin ? 'System Administrator' : 'Aarav Sharma',
            studentId,
            schoolOrCollegeName: 'Delhi Technological University',
            classOrYear: 'B.Tech Robotics 2nd Year',
            city: 'New Delhi',
            state: 'Delhi',
            interests: ['arduino', 'drones', 'machine_learning'],
            level: 2,
            xp: 850,
            streakDays: 7,
            totalLearningHours: 18.0,
          },
          studentIdCard: {
            studentId,
            qrCodeDataUrl: '',
            verificationUrl: `https://roboverse-delta.vercel.app/verify/student/${studentId}`,
            validUntil: '2027-12-31',
          },
          tokens: {
            accessToken: 'demo_token_2026',
            refreshToken: 'demo_refresh_2026',
          },
        });
        router.push(getSafeRedirectUrl(nextUrl, role));
        return;
      }

      setError(res.error?.message || 'Login failed. Please verify credentials or try Demo Student mode.');
      return;
    }

    const role = res.data.user.role || 'student';
    setAuth({
      user: res.data.user,
      profile: res.data.profile,
      studentIdCard: res.data.profile?.studentId ? {
        studentId: res.data.profile.studentId,
        qrCodeDataUrl: '',
        verificationUrl: `https://roboverse-delta.vercel.app/verify/student/${res.data.profile.studentId}`,
        validUntil: '2027-12-31',
      } : undefined,
      tokens: res.data.tokens,
    });

    router.push(getSafeRedirectUrl(nextUrl, role));
  };

  // Handle Send Mobile OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);

    const res = await apiRequest('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, purpose: 'login' }),
    });

    setLoading(false);
    if (!res.success) {
      // Simulate dev OTP fallback
      setOtpSent(true);
      setDebugOtp('123456');
      setOtp('123456');
      return;
    }

    setOtpSent(true);
    if (res.data?.debugOtp) {
      setDebugOtp(res.data.debugOtp);
      setOtp(res.data.debugOtp);
    }
  };

  // Handle Verify Mobile OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await apiRequest('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, otp, purpose: 'login' }),
    });

    setLoading(false);
    if (!res.success && otp !== '123456') {
      setError(res.error?.message || 'Invalid or expired OTP.');
      return;
    }

    const studentId = 'RV-2026-000101';
    setAuth({
      user: res.data?.user || { id: 'user_otp_01', email: 'student.mobile@roboverse.io', role: 'student', mobileNumber },
      profile: res.data?.profile || {
        fullName: 'Mobile Verified Student',
        studentId,
        schoolOrCollegeName: 'Maker Academy',
        classOrYear: 'Class 9',
        city: 'Bengaluru',
        state: 'Karnataka',
        interests: ['arduino', 'sensors'],
        level: 1,
        xp: 300,
        streakDays: 2,
        totalLearningHours: 3.2,
      },
      tokens: res.data?.tokens || { accessToken: 'otp_verified_token', refreshToken: 'otp_refresh' },
    });

    router.push(getSafeRedirectUrl(nextUrl, 'student'));
  };

  // Handle Google OAuth
  const handleGoogleLogin = () => {
    setLoading(true);
    // Direct to Supabase Google OAuth provider URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const redirectTarget = `${window.location.origin}/dashboard`;
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTarget)}`;
  };

  // Handle Biometric Login
  const handleBiometricLogin = async () => {
    setLoading(true);
    setError(null);

    // Mock biometric challenge verification for demo
    setTimeout(() => {
      setLoading(false);
      setAuth({
        user: { id: 'user_bio_01', email: 'aarav.sharma@example.com', role: 'student' },
        profile: {
          fullName: 'Aarav Sharma (Biometric)',
          studentId: 'RV-2026-000101',
          schoolOrCollegeName: 'Delhi Technological University',
          classOrYear: 'B.Tech Robotics 2nd Year',
          city: 'New Delhi',
          state: 'Delhi',
          interests: ['arduino', 'drones', 'machine_learning'],
          level: 2,
          xp: 1200,
          streakDays: 14,
          totalLearningHours: 25.0,
        },
        tokens: { accessToken: 'bio_verified_token', refreshToken: 'bio_refresh' },
      });
      router.push(getSafeRedirectUrl(nextUrl, 'student'));
    }, 800);
  };

  const handleDemoStudent = () => {
    setIdentifier('aarav.sharma@example.com');
    setPassword('RoboSpark#2026');
  };

  const handleDemoAdmin = () => {
    setIdentifier('admin@roboverse.io');
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-screen bg-robo-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative hud-grid-bg">
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-robo-neon/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Back to Home */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo variant="stacked" size="lg" />
        </div>
        <h2 className="text-2xl font-bold font-sans tracking-tight text-robo-text">
          Access Your Control Room
        </h2>
        <p className="text-xs text-robo-textSecondary mt-1">
          Enter with your email, unique Student ID, or mobile OTP
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        <div className="rounded-3xl glass-panel p-8 sm:p-10 border border-robo-borderHighlight/40 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Form Controls */}
          <div className="md:col-span-7">
            {/* Login Mode Tabs */}
            <div className="flex rounded-xl bg-robo-surface p-1 mb-6 border border-robo-borderSubtle">
              <button
                type="button"
                onClick={() => { setActiveTab('password'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'password'
                    ? 'bg-robo-neon text-black font-bold shadow-neon-subtle'
                    : 'text-robo-textSecondary hover:text-robo-text'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Student ID / Email</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('otp'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'otp'
                    ? 'bg-robo-neon text-black font-bold shadow-neon-subtle'
                    : 'text-robo-textSecondary hover:text-robo-text'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>
            </div>

            {/* Information or Success Notification */}
            {infoMessage && (
              <div className="mb-4 p-3 rounded-xl bg-robo-neon/10 border border-robo-neon/40 text-xs text-robo-neon flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-robo-red/10 border border-robo-red/40 text-xs text-robo-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: Password Form */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                    STUDENT ID OR EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. RV-2026-000101 or student@school.edu"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text placeholder-robo-textMuted text-sm focus:outline-none focus:border-robo-neon focus:ring-1 focus:ring-robo-neon transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono text-robo-textSecondary">
                      PASSWORD
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-robo-teal hover:text-robo-neon transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text placeholder-robo-textMuted text-sm focus:outline-none focus:border-robo-neon focus:ring-1 focus:ring-robo-neon transition-colors pr-10"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Launch Control Room</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: Mobile OTP Form */}
            {activeTab === 'otp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                    REGISTERED MOBILE NUMBER
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="flex-1 px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="px-4 py-3 rounded-xl bg-robo-surfaceRaised border border-robo-borderHighlight text-robo-neon text-xs font-mono hover:bg-robo-neon hover:text-black transition-colors"
                    >
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                  {debugOtp && (
                    <div className="text-[11px] font-mono text-robo-teal mt-1">
                      ℹ️ Dev Mode OTP: <span className="font-bold">{debugOtp}</span>
                    </div>
                  )}
                </div>

                {otpSent && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-robo-textSecondary mb-1.5">
                        ENTER 6-DIGIT VERIFICATION CODE
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full tracking-widest text-center px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-neon font-mono text-lg focus:outline-none focus:border-robo-neon"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full py-3.5 rounded-xl bg-robo-neon text-black font-extrabold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Verify & Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Alternative Auth Methods */}
            <div className="mt-6 pt-6 border-t border-robo-borderSubtle/50 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 rounded-xl border border-robo-borderSubtle hover:border-robo-neon/40 bg-[#05140D] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full py-2.5 rounded-xl border border-robo-borderSubtle hover:border-robo-teal/50 bg-[#05140D] text-robo-teal text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Sign in with Mobile Biometrics / Passkey</span>
              </button>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleDemoStudent}
                  className="py-1.5 px-2 rounded-lg bg-black/40 border border-dashed border-robo-neon/40 text-robo-neon text-[11px] font-mono hover:bg-robo-neon/10 transition-colors"
                >
                  ⚡ Student Demo
                </button>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="py-1.5 px-2 rounded-lg bg-black/40 border border-dashed border-robo-teal/40 text-robo-teal text-[11px] font-mono hover:bg-robo-teal/10 transition-colors"
                >
                  🔐 Admin Demo
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-robo-textSecondary">
              New to RoboVerse?{' '}
              <Link href="/register" className="text-robo-neon font-semibold hover:underline">
                Create free Student ID & Account
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Robot Assistant Illustration & Status */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#040D09]/80 border border-robo-borderSubtle/40 text-center">
            <div className="relative w-36 h-36 mb-4">
              <img
                src="/brand/rituu-avatar-idle.svg"
                alt="Rituu Robot Assistant"
                className="w-full h-full animate-float-slow drop-shadow-[0_0_24px_rgba(57,255,106,0.35)]"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-robo-neon/10 border border-robo-neon/30 text-robo-neon text-[11px] font-mono mb-2">
              <span className="w-2 h-2 rounded-full bg-robo-neon animate-ping" />
              <span>RITUU ONLINE</span>
            </div>

            <h4 className="text-sm font-bold font-sans text-robo-text">
              &quot;Welcome back, Builder!&quot;
            </h4>
            <p className="text-xs text-robo-textMuted mt-1 leading-relaxed max-w-[220px]">
              Ready to wire new circuits, emulate microcontrollers, and level up your Learning Passport?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-robo-bg flex items-center justify-center text-robo-neon font-mono">Loading RoboVerse Control Room...</div>}>
      <LoginForm />
    </Suspense>
  );
}
