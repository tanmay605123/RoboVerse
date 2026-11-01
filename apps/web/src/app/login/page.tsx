'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { apiRequest } from '../../lib/apiClient';
import type { DbUserRole } from '@roboverse/shared';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect');
  const initAuth = useAuthStore((s) => s.initAuth);
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const [activeTab, setActiveTab] = useState<'password' | 'otp' | 'forgot'>('password');
  const [showPassword, setShowPassword] = useState(false);

  // Form states - empty in production, prefilled only in demo mode
  const [identifier, setIdentifier] = useState(isDemo ? 'aarav.sharma@example.com' : '');
  const [password, setPassword] = useState(isDemo ? 'RoboSpark#2026' : '');
  const [mobileNumber, setMobileNumber] = useState(isDemo ? '+919876543210' : '+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const demoAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true';

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setSuccessMessage('Account created. Check your email to confirm it, then sign in.');
    }
  }, [searchParams]);

  // Role-based redirect helper
  const navigateByRole = (role: DbUserRole) => {
    if (returnUrl) {
      router.push(returnUrl);
      return;
    }
    switch (role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'teacher':
        router.push('/teacher');
        break;
      case 'institution_admin':
        router.push('/institution');
        break;
      case 'store_admin':
        router.push('/store-admin');
        break;
      case 'student':
      default:
        router.push('/dashboard');
        break;
    }
  };

  // Handle Password / Student ID Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Email/password accounts are owned by the backend auth service. Its
      // transaction creates the public.User row used by Prisma.
      const backendResponse = await apiRequest<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      if (backendResponse.success && backendResponse.data?.user && backendResponse.data?.tokens?.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('roboverse_access_token', backendResponse.data.tokens.accessToken);
          localStorage.setItem('roboverse_refresh_token', backendResponse.data.tokens.refreshToken);
        }
        useAuthStore.getState().setBackendAuth(backendResponse.data);
        const role = (backendResponse.data.user.role === 'ADMIN'
          ? 'admin'
          : backendResponse.data.user.role === 'MENTOR_TEACHER'
            ? 'teacher'
            : backendResponse.data.user.role === 'INSTITUTION_ADMIN'
              ? 'institution_admin'
              : backendResponse.data.user.role === 'STORE_ADMIN'
                ? 'store_admin'
                : 'student') as DbUserRole;
        setSuccessMessage('Welcome back, ' + (backendResponse.data.profile?.fullName || identifier));
        navigateByRole(role);
        return;
      }

      // Compatibility fallback for legacy Supabase Auth accounts created
      // before the backend auth path was enabled.
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier.trim().toLowerCase(),
        password,
      });

      if (authError) {
        // Fallback ONLY in DEMO_MODE for local testing without internet
        if (
          (isDemo || demoAuthEnabled) &&
          (identifier === 'aarav.sharma@example.com' ||
            identifier === 'admin@roboverse.io' ||
            identifier.includes('demo'))
        ) {
          const isDemoAdmin = identifier.includes('admin');
          const mockRole: DbUserRole = isDemoAdmin ? 'admin' : 'student';
          const mockId = isDemoAdmin ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002';
          const mockStudentId = isDemoAdmin ? 'RV-ADMIN-000001' : 'RV-2026-001001';
          const mockName = isDemoAdmin ? 'Master Admin' : 'Aarav Sharma';

          useAuthStore.getState().setAuth({
            user: {
              id: mockId,
              email: identifier,
              role: mockRole,
              studentId: mockStudentId,
              fullName: mockName,
            },
            profile: {
              studentId: mockStudentId,
              fullName: mockName,
              schoolOrCollegeName: 'Delhi Public School, R.K. Puram',
              classOrYear: 'Class 10',
              city: 'New Delhi',
              state: 'Delhi',
              interests: ['arduino', 'drones', 'circuits'],
              level: isDemoAdmin ? 'Innovator' : 'Builder',
              xp: isDemoAdmin ? 4500 : 780,
              streakDays: isDemoAdmin ? 45 : 12,
              lastSeenAt: new Date().toISOString(),
              currentActivity: 'Exploring RoboVerse Labs',
            },
            studentIdCard: {
              studentId: mockStudentId,
              fullName: mockName,
              schoolOrCollege: 'Delhi Public School, R.K. Puram',
              planName: isDemoAdmin ? 'Pro Engineer' : 'Plus Builder',
              level: isDemoAdmin ? 'Innovator' : 'Builder',
              xp: isDemoAdmin ? 4500 : 780,
              verificationUrl: `https://roboverse.dev/verify/${mockStudentId}`,
              validUntil: '31 DEC 2026',
            },
            planTier: isDemoAdmin ? 'pro' : 'plus',
          });

          setSuccessMessage('Logged in successfully!');
          navigateByRole(mockRole);
          return;
        }

        setError(backendResponse.error?.message || authError.message || 'Login failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Initialize full auth store with real profile and entitlements from database
        await initAuth();

        const { data: profile } = await (supabase.from('profiles') as any)
          .select('role, full_name')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = (profile?.role || data.user.user_metadata?.role || 'student') as DbUserRole;
        const fullName = profile?.full_name || data.user.email?.split('@')[0] || 'RoboVerse Explorer';

        setSuccessMessage('Welcome back, ' + fullName);
        navigateByRole(role);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Mobile OTP
  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: mobileNumber,
      });

      if (otpError) {
        if (isDemo || demoAuthEnabled) {
          setOtpSent(true);
          setOtp('123456');
          setSuccessMessage('OTP sent to ' + mobileNumber + ' (Demo OTP: 123456)');
          return;
        }
        setError(otpError.message || 'Failed to send OTP.');
        return;
      }

      setOtpSent(true);
      setSuccessMessage('Verification OTP sent to ' + mobileNumber);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Mobile OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (otp.length === 6) {
        if ((isDemo || demoAuthEnabled) && otp === '123456') {
          // Demo fallback
          await initAuth();
          setSuccessMessage('Phone verified successfully!');
          navigateByRole('student');
          return;
        }

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          phone: mobileNumber,
          token: otp,
          type: 'sms',
        });

        if (verifyError) {
          setError(verifyError.message || 'Invalid or expired OTP code.');
          setLoading(false);
          return;
        }

        if (data?.user) {
          await initAuth();
          const { data: profile } = await (supabase.from('profiles') as any)
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
          const role = (profile?.role || 'student') as DbUserRole;
          setSuccessMessage('Phone verified successfully!');
          navigateByRole(role);
          return;
        }
      }

      setError('Please enter a valid 6-digit code.');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (googleError) {
        setError(googleError.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Sign In.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Request
  const handleResetPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccessMessage('Password reset instructions sent to ' + identifier);
      }
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Credentials Helper
  const handleDemoFill = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setIdentifier('aarav.sharma@example.com');
      setPassword('RoboSpark#2026');
    } else {
      setIdentifier('admin@roboverse.io');
      setPassword('Admin@2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#07110D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans overflow-hidden selection:bg-[#39FF6A] selection:text-black">
      {/* Background Grid & Neon Green Glow Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(#39FF6A_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#39FF6A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#7FE7D6]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Brand Logo Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6 relative z-10">
        <div className="flex justify-center mb-3">
          <Logo variant="horizontal" size="lg" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#EAF7EF]">
          Welcome to RoboVerse
        </h2>
        <p className="text-xs text-[#8FA99B] mt-1 font-mono">
          Control-Room Authentication • Supabase Auth & Multi-Factor Security
        </p>
      </div>

      {/* Centered Dark Glass Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(7,17,13,0.9)]">
          {/* Login Mode Toggle Tabs */}
          <div className="flex rounded-full bg-[#040B08] p-1 mb-6 border border-[rgba(57,255,106,0.2)]">
            <button
              type="button"
              onClick={() => { setActiveTab('password'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 font-mono ${
                activeTab === 'password'
                  ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.3)]'
                  : 'text-[#8FA99B] hover:text-[#EAF7EF]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email / Student ID</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('otp'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 font-mono ${
                activeTab === 'otp'
                  ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.3)]'
                  : 'text-[#8FA99B] hover:text-[#EAF7EF]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] text-xs text-[#FF6B6B] flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-xs text-[#39FF6A] flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: Password Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-xs font-bold text-[#8FA99B] mb-1.5">
                  Email or Student ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B]" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. RV-2026-001001 or aarav@school.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-xs text-[#EAF7EF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#8FA99B]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] font-bold text-[#7FE7D6] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-xs text-[#EAF7EF] focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B] hover:text-[#39FF6A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all font-sans cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to RoboVerse'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: Mobile OTP Form */}
          {activeTab === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-xs font-bold text-[#8FA99B] mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B]" />
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-xs text-[#EAF7EF] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] hover:bg-[rgba(57,255,106,0.25)] border border-[#39FF6A]/40 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-bold text-[#8FA99B] mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-center tracking-widest text-lg font-mono font-bold text-[#39FF6A] focus:outline-none"
                  />
                  {demoAuthEnabled && (
                    <p className="text-[11px] text-[#7FE7D6] mt-1.5 font-mono text-center">
                      Demo OTP: 123456
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all font-sans disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: Forgot Password Form */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleResetPasswordRequest} className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#040B08] border border-[rgba(127,231,214,0.2)] text-[#7FE7D6]">
                Enter your registered email address and Supabase Auth will send a secure recovery link.
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8FA99B] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B]" />
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-xs text-[#EAF7EF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('password')}
                  className="w-1/3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.05)] text-[#EAF7EF] text-xs font-bold hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#39FF6A] text-black font-bold text-xs hover:bg-[#2BD95B] transition-colors cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          {/* Google OAuth Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Evaluator Sign-In */}
          {demoAuthEnabled && <div className="mt-6 pt-6 border-t border-[rgba(57,255,106,0.1)]">
            <p className="text-center text-[11px] font-bold text-[#8FA99B] font-mono uppercase tracking-wider mb-3">
              Quick Evaluator Sign-In
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className="py-2.5 px-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] text-[#EAF7EF] text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="py-2.5 px-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] text-[#EAF7EF] text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Demo Admin</span>
              </button>
            </div>
          </div>}

          {/* Footer Register Link */}
          <div className="mt-6 text-center font-mono text-xs">
            <p className="text-[#8FA99B]">
              Don't have an account yet?{' '}
              <Link href="/register" className="font-bold text-[#39FF6A] hover:underline">
                Create free student account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07110D] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#39FF6A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
