'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import { Eye, EyeOff, Lock, Mail, Smartphone, Fingerprint, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/apiClient';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Password / Student ID Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error?.message || 'Login failed. Please verify credentials.');
      return;
    }

    setAuth({
      user: res.data.user,
      profile: res.data.profile,
      studentIdCard: res.data.profile?.studentId
        ? {
            studentId: res.data.profile.studentId,
            qrCodeDataUrl: '',
            verificationUrl: '',
            validUntil: '',
          }
        : undefined,
      tokens: res.data.tokens,
    });

    router.push('/dashboard');
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
      setError(res.error?.message || 'Failed to send OTP.');
      return;
    }

    setOtpSent(true);
    setSuccessMessage('OTP sent to ' + mobileNumber);
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
    if (!res.success) {
      setError(res.error?.message || 'Invalid or expired OTP.');
      return;
    }

    setAuth({
      user: res.data.user,
      profile: res.data.profile,
      studentIdCard: res.data.studentIdCard,
      tokens: res.data.tokens,
    });

    router.push('/dashboard');
  };

  // Quick Demo credentials
  const handleDemoFill = (role: 'student' | 'mentor' | 'admin') => {
    if (role === 'student') {
      setIdentifier('vikram.aditya@example.com');
      setPassword('RoboSpark#2026');
    } else if (role === 'mentor') {
      setIdentifier('mentor.rahul@roboverse.io');
      setPassword('RoboSpark#2026');
    } else if (role === 'admin') {
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
          Log in with your Email, unique Student ID, or Mobile OTP
        </p>
      </div>

      {/* Centered Dark Glass Card (R4) */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(7,17,13,0.9)]">
          {/* Login Mode Toggle Tabs (Active = Neon Green Capsule) */}
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
                    placeholder="e.g. RV-2026-000101 or student@school.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] focus:border-[#39FF6A] text-xs text-[#EAF7EF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#8FA99B]">
                    Password
                  </label>
                  <Link
                    href="/login?forgot=true"
                    className="text-[11px] font-bold text-[#7FE7D6] hover:underline"
                  >
                    Forgot password?
                  </Link>
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all font-sans"
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
                    className="px-4 py-2.5 rounded-xl bg-[rgba(57,255,106,0.15)] text-[#39FF6A] hover:bg-[rgba(57,255,106,0.25)] border border-[#39FF6A]/40 text-xs font-bold shrink-0 transition-colors"
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
                  {debugOtp && (
                    <p className="text-[11px] text-[#7FE7D6] mt-1.5 font-mono text-center">
                      Auto-detected Demo OTP: {debugOtp}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all font-sans disabled:opacity-50"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Social & Alternative Sign In */}
          <div className="mt-6 pt-6 border-t border-[rgba(57,255,106,0.1)]">
            <p className="text-center text-[11px] font-bold text-[#8FA99B] font-mono uppercase tracking-wider mb-3">
              Quick Evaluator Sign-In
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className="py-2.5 px-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] text-[#EAF7EF] text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="py-2.5 px-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] text-[#EAF7EF] text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

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
