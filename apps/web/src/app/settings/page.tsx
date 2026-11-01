'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabaseClient';
import { STUDENT_INTEREST_OPTIONS } from '@roboverse/shared';
import {
  User,
  Shield,
  KeyRound,
  Smartphone,
  Globe,
  Bell,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Save,
  LogOut,
  Sliders,
  Sparkles,
  Lock,
  Layers,
  Activity,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, studentIdCard, planTier, entitlements, refreshProfile, logout } = useAuthStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'preferences' | 'privacy'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password & Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // MFA State
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [totpQr, setTotpQr] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [enrollingMfa, setEnrollingMfa] = useState(false);

  // Preferences State
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Privacy & Data state
  const [exportingData, setExportingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Status & Feedback messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setSchool(profile.schoolOrCollegeName || '');
      setClassLevel(profile.classOrYear || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setPincode(profile.pincode || '');
      setInterests(profile.interests || ['arduino', 'circuits']);
    }
  }, [profile]);

  // Load MFA factors
  const loadMfaFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data) {
        setMfaFactors(data.totp || []);
      }
    } catch {
      // MFA inspection ignored if not supported
    }
  };

  useEffect(() => {
    loadMfaFactors();
  }, []);

  const clearMessageSoon = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  // 1. Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setMessage(null);

    try {
      const { error } = await (supabase.from('profiles') as any)
        .update({
          full_name: fullName,
          school: school,
          class_level: classLevel,
          city: city,
          state: state,
          pincode: pincode,
          interests: interests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      clearMessageSoon();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      clearMessageSoon();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 3. MFA Enrollment
  const handleStartMfaEnrollment = async () => {
    setEnrollingMfa(true);
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'RoboVerse Authenticator',
      });
      if (error) throw error;
      setTotpQr(data.totp.qr_code);
      setTotpSecret(data.totp.secret);
      setTotpFactorId(data.id);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to initialize MFA enrollment.' });
      setEnrollingMfa(false);
    }
  };

  const handleVerifyMfaEnrollment = async () => {
    if (!totpFactorId || totpVerifyCode.length !== 6) return;
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactorId,
        challengeId: challenge.data.id,
        code: totpVerifyCode,
      });
      if (verify.error) throw verify.error;

      setMessage({ type: 'success', text: 'Two-Factor Authentication (MFA) enabled successfully!' });
      setTotpQr(null);
      setTotpSecret(null);
      setTotpVerifyCode('');
      setEnrollingMfa(false);
      await loadMfaFactors();
      clearMessageSoon();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'MFA code verification failed.' });
    }
  };

  // 4. Sign Out Other Sessions
  const handleSignOutOtherSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'others' });
      setMessage({ type: 'success', text: 'All other active devices signed out.' });
      clearMessageSoon();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to sign out other sessions.' });
    }
  };

  // 5. Export Personal Data (DPDP Act)
  const handleExportData = async () => {
    setExportingData(true);
    try {
      const res = await fetch('/api/privacy/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: profile?.studentId, email: user?.email }),
      });
      const json = await res.json();
      if (json.success) {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roboverse-data-${profile?.studentId || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: 'Personal data package exported successfully.' });
      } else {
        throw new Error(json.error?.message || 'Export failed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to export data.' });
    } finally {
      setExportingData(false);
      clearMessageSoon();
    }
  };

  // 6. Delete Account Request
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm.' });
      return;
    }
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/privacy/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, studentId: profile?.studentId, confirmDelete: true }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.data?.message || 'Account scheduled for erasure under DPDP Act.');
        await logout();
        router.push('/');
      } else {
        throw new Error(json.error?.message || 'Deletion failed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Account deletion request failed.' });
      setDeletingAccount(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07110D] text-[#EAF7EF] font-sans selection:bg-[#39FF6A] selection:text-black">
      {/* Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(57,255,106,0.12)]">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#EAF7EF] flex items-center gap-2.5">
                <Sliders className="w-6 h-6 text-[#39FF6A]" />
                <span>Account &amp; Security Settings</span>
              </h1>
              <p className="text-xs text-[#8FA99B] font-mono mt-1">
                Manage your student identity, security parameters, preferences, and DPDP data rights.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.25)] text-[#39FF6A]">
                {entitlements?.badge || 'FREE'} PLAN
              </span>
              <span className="text-[11px] font-mono text-[#8FA99B]">
                ID: {profile?.studentId || 'RV-XXXX-XXXXXX'}
              </span>
            </div>
          </div>

          {/* Feedback Alert */}
          {message && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-mono border backdrop-blur-md animate-slide-up ${
                message.type === 'success'
                  ? 'bg-[rgba(57,255,106,0.1)] border-[rgba(57,255,106,0.3)] text-[#39FF6A]'
                  : 'bg-[rgba(255,107,107,0.1)] border-[rgba(255,107,107,0.3)] text-[#FF6B6B]'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Settings Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[rgba(57,255,106,0.12)]">
            {[
              { id: 'profile', label: 'Profile & Passport', icon: User },
              { id: 'security', label: 'Security & MFA', icon: Shield },
              { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
              { id: 'preferences', label: 'Preferences', icon: Globe },
              { id: 'privacy', label: 'DPDP Privacy & Data', icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_15px_rgba(57,255,106,0.35)]'
                      : 'text-[#8FA99B] hover:text-[#39FF6A] bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.15)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md space-y-4">
                <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#39FF6A]" />
                  <span>Student Identity &amp; Academic Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">Student ID (Immutable)</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.studentId || 'RV-XXXX-XXXXXX'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08]/80 border border-[rgba(57,255,106,0.15)] text-[#39FF6A] font-bold cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">Email Address</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08]/80 border border-[rgba(57,255,106,0.15)] text-[#CBD8D0] cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">School / College Name</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">Class / Grade / Year</label>
                    <input
                      type="text"
                      value={classLevel}
                      onChange={(e) => setClassLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">PIN Code</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                </div>

                {/* Interests Selection */}
                <div className="pt-4 border-t border-[rgba(57,255,106,0.12)]">
                  <label className="block text-xs text-[#8FA99B] font-mono font-bold mb-2">
                    Robotics &amp; Engineering Focus Areas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STUDENT_INTEREST_OPTIONS.map((interest) => {
                      const isSelected = interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer capitalize ${
                            isSelected
                              ? 'bg-[rgba(57,255,106,0.2)] border border-[#39FF6A] text-[#39FF6A] font-bold'
                              : 'bg-[#040B08] border border-[rgba(57,255,106,0.15)] text-[#8FA99B] hover:border-[#39FF6A]/40'
                          }`}
                        >
                          {interest.replace(/_/g, ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,106,0.35)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & MFA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md space-y-4">
                <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#39FF6A]" />
                  <span>Update Password</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">New Password (Min 8 characters)</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8FA99B] mb-1 font-bold">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.25)] text-[#EAF7EF] focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updatingPassword || !newPassword}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,106,0.35)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{updatingPassword ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>

              {/* MFA / TOTP Section */}
              <div className="p-6 rounded-3xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#39FF6A]" />
                      <span>Two-Factor Authentication (MFA / TOTP)</span>
                    </h3>
                    <p className="text-xs text-[#8FA99B] font-mono mt-0.5">
                      Protect your account and administrative operations with an authenticator app (Google Authenticator, Authy).
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    mfaFactors.length > 0
                      ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border-[rgba(57,255,106,0.3)]'
                      : 'bg-white/5 text-[#8FA99B] border-white/10'
                  }`}>
                    {mfaFactors.length > 0 ? 'MFA ACTIVE' : 'MFA DISABLED'}
                  </span>
                </div>

                {totpQr ? (
                  <div className="p-4 rounded-2xl bg-[#040B08] border border-[rgba(57,255,106,0.3)] space-y-3 font-mono text-xs">
                    <p className="text-[#39FF6A] font-bold">1. Scan this QR code in your Authenticator app:</p>
                    <div className="flex items-center justify-center p-4 bg-white rounded-xl max-w-xs mx-auto">
                      <img src={totpQr} alt="MFA TOTP QR Code" className="w-48 h-48" />
                    </div>
                    {totpSecret && (
                      <p className="text-[11px] text-[#8FA99B] text-center">
                        Or enter secret manually: <strong className="text-white">{totpSecret}</strong>
                      </p>
                    )}
                    <div className="pt-2 max-w-xs mx-auto space-y-2">
                      <label className="block text-[#8FA99B] font-bold">2. Enter 6-digit verification code:</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={totpVerifyCode}
                        onChange={(e) => setTotpVerifyCode(e.target.value)}
                        placeholder="123456"
                        className="w-full text-center tracking-widest text-base font-bold py-2 rounded-xl bg-[#07110D] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyMfaEnrollment}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black font-extrabold text-xs shadow"
                      >
                        Verify &amp; Activate MFA
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {mfaFactors.length === 0 ? (
                      <button
                        type="button"
                        onClick={handleStartMfaEnrollment}
                        disabled={enrollingMfa}
                        className="px-5 py-2.5 rounded-xl bg-[rgba(57,255,106,0.12)] hover:bg-[rgba(57,255,106,0.2)] border border-[rgba(57,255,106,0.3)] text-[#39FF6A] text-xs font-bold font-mono transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Enable Authenticator App</span>
                      </button>
                    ) : (
                      <div className="text-xs font-mono text-[#8FA99B] space-y-2">
                        <p className="text-[#39FF6A] font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>MFA is enrolled and safeguarding your student ID.</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="p-6 rounded-3xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#39FF6A]" />
                    <span>Active Sessions &amp; Device Registry</span>
                  </h3>
                  <p className="text-xs text-[#8FA99B] font-mono mt-0.5">
                    View devices logged into this student account and revoke unused sessions.
                  </p>
                </div>
                <button
                  onClick={handleSignOutOtherSessions}
                  className="px-4 py-2 rounded-xl bg-[rgba(255,107,107,0.1)] hover:bg-[rgba(255,107,107,0.2)] border border-[rgba(255,107,107,0.3)] text-[#FF6B6B] text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Sign Out Other Devices
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] flex items-center justify-center text-[#39FF6A]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#EAF7EF]">Current Web Browser Session</p>
                    <p className="text-[11px] text-[#8FA99B]">Origin: {typeof window !== 'undefined' ? window.location.host : 'Web'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)]">
                  ACTIVE NOW
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="p-6 rounded-3xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#39FF6A]" />
                  <span>Language &amp; Localization</span>
                </h3>
                <p className="text-xs text-[#8FA99B] font-mono mt-0.5">
                  Choose your preferred language for Rituu AI, tutorials, and interface elements.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs font-mono">
                  {[
                    { id: 'en', label: 'English (India)', native: 'English' },
                    { id: 'hi', label: 'Hindi', native: 'हिंदी' },
                    { id: 'hinglish', label: 'Hinglish (Colloquial)', native: 'Hinglish' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanguage(l.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        language === l.id
                          ? 'border-2 border-[#39FF6A] bg-[rgba(57,255,106,0.15)] text-[#39FF6A] font-bold'
                          : 'border-[rgba(57,255,106,0.15)] bg-[#040B08] text-[#8FA99B]'
                      }`}
                    >
                      <p className="font-bold">{l.native}</p>
                      <p className="text-[10px] text-[#8FA99B]">{l.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(57,255,106,0.12)]">
                <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#39FF6A]" />
                  <span>Notification Preferences</span>
                </h3>
                <div className="space-y-3 mt-3 text-xs font-mono">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] cursor-pointer">
                    <div>
                      <p className="font-bold text-[#EAF7EF]">Lab Telemetry &amp; Challenge Alerts</p>
                      <p className="text-[11px] text-[#8FA99B]">Get notifications when hackathons open or circuit tests finish.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded text-[#39FF6A] focus:ring-[#39FF6A]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] cursor-pointer">
                    <div>
                      <p className="font-bold text-[#EAF7EF]">Weekly Learning Digest</p>
                      <p className="text-[11px] text-[#8FA99B]">Summary of XP gained, streaks, and recommended starter circuits.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={weeklyDigest}
                      onChange={(e) => setWeeklyDigest(e.target.checked)}
                      className="rounded text-[#39FF6A] focus:ring-[#39FF6A]"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY & DPDP RIGHTS */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* DPDP Export */}
              <div className="p-6 rounded-3xl bg-[#0E2A1F]/60 border border-[rgba(57,255,106,0.15)] backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#EAF7EF] flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#39FF6A]" />
                      <span>DPDP Right to Data Portability (Export)</span>
                    </h3>
                    <p className="text-xs text-[#8FA99B] font-mono mt-0.5">
                      Download a machine-readable JSON copy of your profile, projects, test runs, and certifications.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    disabled={exportingData}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,106,0.35)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{exportingData ? 'Exporting...' : 'Export JSON Package'}</span>
                  </button>
                </div>
              </div>

              {/* Account Erasure */}
              <div className="p-6 rounded-3xl bg-[rgba(255,107,107,0.06)] border border-[rgba(255,107,107,0.25)] backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#FF6B6B] flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      <span>DPDP Right to Erasure (Delete Account)</span>
                    </h3>
                    <p className="text-xs text-[#8FA99B] font-mono mt-0.5">
                      Request permanent deletion of your profile and data under India DPDP Act statutory requirements.
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[rgba(255,107,107,0.15)] hover:bg-[rgba(255,107,107,0.25)] border border-[rgba(255,107,107,0.4)] text-[#FF6B6B] text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    Request Deletion
                  </button>
                </div>
              </div>

              {/* Delete Account Confirmation Modal */}
              {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                  <div className="max-w-md w-full p-6 rounded-3xl bg-[#0A1F17] border border-[rgba(255,107,107,0.4)] text-xs font-mono space-y-4 shadow-[0_0_40px_rgba(255,107,107,0.2)]">
                    <h4 className="text-base font-bold text-[#FF6B6B] flex items-center gap-2 font-sans">
                      <AlertCircle className="w-5 h-5" />
                      <span>Confirm Account Erasure Request</span>
                    </h4>
                    <p className="text-[#8FA99B] leading-relaxed">
                      This will initiate a 14-day statutory grace period, after which all personal designs, certificates, and Rituu logs will be permanently purged. Order tax records are retained as required by GST statutory guidelines.
                    </p>
                    <div>
                      <label className="block text-[#8FA99B] mb-1 font-bold">Type DELETE to confirm:</label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(255,107,107,0.3)] text-[#FF6B6B] font-bold focus:outline-none tracking-widest text-center"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          setDeleteModalOpen(false);
                          setDeleteConfirmation('');
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#CBD8D0] hover:text-white font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== 'DELETE' || deletingAccount}
                        className="px-5 py-2 rounded-xl bg-[#FF6B6B] text-black font-extrabold disabled:opacity-40 cursor-pointer shadow"
                      >
                        {deletingAccount ? 'Processing...' : 'Confirm Erasure'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
