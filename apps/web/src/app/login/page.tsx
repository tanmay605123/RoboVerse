'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import { Eye, EyeOff, Lock, Mail, Smartphone, Fingerprint, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
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
      studentIdCard: res.data.profile?.studentId ? {
        studentId: res.data.profile.studentId,
        qrCodeDataUrl: '',
        verificationUrl: '',
        validUntil: '',
      } : undefined,
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
      tokens: res.data.tokens,
    });

    router.push('/dashboard');
  };

  // Handle Biometric Login
  const handleBiometricLogin = async () => {
    setLoading(true);
    setError(null);

    const challengeRes = await apiRequest('/auth/biometric/challenge', {
      method: 'POST',
      body: JSON.stringify({ studentIdOrEmail: identifier }),
    });

    if (!challengeRes.success) {
      setLoading(false);
      setError('Biometric challenge initialization failed.');
      return;
    }

    // Verify challenge
    const verifyRes = await apiRequest('/auth/biometric/verify', {
      method: 'POST',
      body: JSON.stringify({
        studentIdOrEmail: identifier,
        challenge: challengeRes.data.challenge,
        signature: 'mock_biometric_signature_verified_2026',
        publicKey: 'mock_public_key_stored_device',
      }),
    });

    setLoading(false);
    if (!verifyRes.success) {
      setError(verifyRes.error?.message || 'Biometric authentication was rejected.');
      return;
    }

    setAuth({
      user: verifyRes.data.user,
      profile: verifyRes.data.profile,
      tokens: verifyRes.data.tokens,
    });

    router.push('/dashboard');
  };

  // Handle Quick Demo Student Fill
  const handleDemoStudent = () => {
    setIdentifier('RV-2026-000001');
    setPassword('RoboSpark#2026');
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
            <div className="mt-6 pt-6 border-t border-robo-borderSubtle/50 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full py-2.5 rounded-xl border border-robo-borderSubtle hover:border-robo-teal/50 bg-[#05140D] text-robo-teal text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Sign in with Mobile Biometrics / Passkey</span>
              </button>

              <button
                type="button"
                onClick={handleDemoStudent}
                className="w-full py-2 rounded-xl bg-black/40 border border-dashed border-robo-neon/40 text-robo-neon text-[11px] font-mono hover:bg-robo-neon/10 transition-colors"
              >
                ⚡ Fill Demo Student Credentials (Auto-Fill)
              </button>
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
