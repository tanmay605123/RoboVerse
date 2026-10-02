'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../../components/brand/Logo';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Heart,
  QrCode,
} from 'lucide-react';
import { apiRequest } from '../../lib/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { STUDENT_INTEREST_OPTIONS } from '@roboverse/shared';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('+91');
  const [dateOfBirth, setDateOfBirth] = useState('2007-06-15');
  const [parentEmail, setParentEmail] = useState('');
  const [parentalConsentGiven, setParentalConsentGiven] = useState(false);

  // Step 2: Academic
  const [institutionType, setInstitutionType] = useState<'school' | 'college' | 'university' | 'self_learner'>('school');
  const [schoolOrCollegeName, setSchoolOrCollegeName] = useState('');
  const [classOrYear, setClassOrYear] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['arduino', 'circuit_design']);

  // Step 4: Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate age from DOB
  const studentAge = useMemo(() => {
    if (!dateOfBirth) return 18;
    const birthYear = new Date(dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  }, [dateOfBirth]);

  const isMinor = studentAge < 18;

  // Password strength validation
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score; // 0 to 5
  }, [password]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Step Validation
  const canProceedStep1 =
    fullName.length >= 2 &&
    email.includes('@') &&
    passwordStrength >= 4 &&
    mobileNumber.length >= 10 &&
    (!isMinor || (parentEmail.includes('@') && parentalConsentGiven));

  const canProceedStep2 =
    schoolOrCollegeName.length >= 2 &&
    classOrYear.length >= 1 &&
    city.length >= 2 &&
    state.length >= 2;

  const canProceedStep3 = selectedInterests.length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept the Terms and Conditions to create an account.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      fullName,
      email,
      password,
      mobileNumber,
      dateOfBirth,
      parentEmail: isMinor ? parentEmail : undefined,
      parentalConsentGiven: isMinor ? parentalConsentGiven : true,
      institutionType,
      schoolOrCollegeName,
      classOrYear,
      city,
      state,
      country: 'India',
      interests: selectedInterests,
      acceptedTerms,
      referralCode: referralCode || undefined,
    };

    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error?.message || 'Registration failed. Please check inputs.');
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

  return (
    <div className="min-h-screen bg-robo-bg py-12 px-4 sm:px-6 lg:px-8 relative hud-grid-bg">
      <div className="max-w-3xl mx-auto">
        {/* Logo and Progress */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="stacked" size="md" />
          </div>
          <h2 className="text-3xl font-extrabold font-sans text-robo-text">
            Join the Next Generation of Roboticists
          </h2>
          <p className="text-xs text-robo-textSecondary mt-1">
            Free forever • Generates your verifiable digital Student ID with QR code
          </p>

          {/* Step Progress Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-mono text-robo-textSecondary mb-2">
              <span className={currentStep >= 1 ? 'text-robo-neon font-bold' : ''}>1. Security</span>
              <span className={currentStep >= 2 ? 'text-robo-neon font-bold' : ''}>2. Academic</span>
              <span className={currentStep >= 3 ? 'text-robo-neon font-bold' : ''}>3. Interests</span>
              <span className={currentStep >= 4 ? 'text-robo-neon font-bold' : ''}>4. Student ID</span>
            </div>
            <div className="w-full h-2 bg-[#061810] rounded-full overflow-hidden p-0.5 border border-robo-borderSubtle">
              <div
                className="h-full bg-gradient-to-r from-robo-neon to-robo-teal rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="rounded-3xl glass-panel p-8 sm:p-10 border border-robo-borderHighlight/40 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-robo-red/10 border border-robo-red/40 text-xs text-robo-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1: Account, Age & Minor Consent */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="border-b border-robo-borderSubtle/50 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-robo-text flex items-center gap-2">
                    <User className="w-5 h-5 text-robo-neon" />
                    <span>Personal Profile & Credentials</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav.sharma@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      MOBILE NUMBER (WITH COUNTRY CODE) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      DATE OF BIRTH (YYYY-MM-DD) *
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                  </div>
                </div>

                {/* Minor Safety & Parental Consent (Automated detection if age < 18) */}
                {isMinor && (
                  <div className="p-4 rounded-2xl bg-robo-orange/10 border border-robo-orange/30 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-robo-orange">
                      <ShieldCheck className="w-4 h-4" />
                      <span>STUDENT UNDER 18 DETECTED (AGE {studentAge}) — PARENTAL CONSENT REQUIRED</span>
                    </div>
                    <p className="text-[11px] text-robo-textMuted leading-relaxed">
                      In compliance with child privacy protection regulations, students under 18 must provide guardian email verification and consent.
                    </p>
                    <div>
                      <label className="block text-[11px] font-mono text-robo-textSecondary mb-1">
                        PARENT / GUARDIAN EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent.guardian@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-xs focus:outline-none focus:border-robo-orange"
                      />
                    </div>
                    <label className="flex items-start gap-2.5 text-xs text-robo-textSecondary cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={parentalConsentGiven}
                        onChange={(e) => setParentalConsentGiven(e.target.checked)}
                        className="mt-0.5 rounded border-robo-borderSubtle text-robo-orange focus:ring-robo-orange"
                      />
                      <span>
                        My parent/guardian has consented to my registration on RoboVerse and accepts the terms.
                      </span>
                    </label>
                  </div>
                )}

                {/* Password & Live Strength Meter */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono text-robo-textSecondary">
                      ACCOUNT PASSWORD *
                    </label>
                    <span className="text-[11px] font-mono text-robo-teal">
                      Strength: {passwordStrength}/5
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters with upper, lower, digit & special symbol"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-robo-textMuted hover:text-robo-text"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Visual Bars */}
                  <div className="grid grid-cols-5 gap-1.5 mt-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1.5 rounded-full transition-colors ${
                          passwordStrength >= lvl
                            ? passwordStrength <= 2
                              ? 'bg-robo-red'
                              : passwordStrength <= 3
                              ? 'bg-robo-orange'
                              : 'bg-robo-neon'
                            : 'bg-[#061810]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => { setError(null); setCurrentStep(2); }}
                    className="px-6 py-3 rounded-xl bg-robo-neon text-black font-bold text-sm shadow-neon-subtle hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Next: Academic Info</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Academic & Geographical Details */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="border-b border-robo-borderSubtle/50 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-robo-text flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-robo-teal" />
                    <span>Academic & School Details</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-2">
                    INSTITUTION TYPE
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'school', label: 'School' },
                      { id: 'college', label: 'College' },
                      { id: 'university', label: 'University' },
                      { id: 'self_learner', label: 'Self Learner' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setInstitutionType(t.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          institutionType === t.id
                            ? 'bg-robo-neon/15 border-robo-neon text-robo-neon'
                            : 'bg-[#040B08] border-robo-borderSubtle text-robo-textSecondary hover:border-robo-neon/40'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                    SCHOOL / COLLEGE / INSTITUTE NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolOrCollegeName}
                    onChange={(e) => setSchoolOrCollegeName(e.target.value)}
                    placeholder="e.g. Delhi Public School or IIT Delhi"
                    className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                    CLASS / DEGREE YEAR *
                  </label>
                  <input
                    type="text"
                    required
                    value={classOrYear}
                    onChange={(e) => setClassOrYear(e.target.value)}
                    placeholder="e.g. Class 11 or B.Tech ECE 2nd Year"
                    className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      CITY *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      STATE *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Delhi"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-3 rounded-xl border border-robo-borderSubtle text-robo-textSecondary text-sm hover:border-robo-text flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStep2}
                    onClick={() => { setError(null); setCurrentStep(3); }}
                    className="px-6 py-3 rounded-xl bg-robo-neon text-black font-bold text-sm shadow-neon-subtle hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Next: Robotics Interests</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Robotics Interests */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="border-b border-robo-borderSubtle/50 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-robo-text flex items-center gap-2">
                    <Heart className="w-5 h-5 text-robo-orange" />
                    <span>Select Your Areas of Passion</span>
                  </h3>
                  <p className="text-xs text-robo-textSecondary mt-1">
                    This personalizes your 3D roadmap and Rituu recommendations.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STUDENT_INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    const label = interest
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-robo-neon/15 border-robo-neon text-robo-neon shadow-neon-subtle'
                            : 'bg-[#040B08] border-robo-borderSubtle text-robo-textSecondary hover:border-robo-neon/40'
                        }`}
                      >
                        <span>{label}</span>
                        {isSelected && <Check className="w-4 h-4 shrink-0 text-robo-neon" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-3 rounded-xl border border-robo-borderSubtle text-robo-textSecondary text-sm hover:border-robo-text flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canProceedStep3}
                    onClick={() => { setError(null); setCurrentStep(4); }}
                    className="px-6 py-3 rounded-xl bg-robo-neon text-black font-bold text-sm shadow-neon-subtle hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Next: Generate Student ID</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Terms, Student ID Preview & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-robo-borderSubtle/50 pb-3 mb-2">
                  <h3 className="text-lg font-bold text-robo-text flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-robo-neon" />
                    <span>Confirm & Generate Digital ID Card</span>
                  </h3>
                </div>

                {/* Digital Student ID Preview Mockup */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#092218] to-[#040C08] border border-robo-neon/50 shadow-neon-subtle relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-robo-borderSubtle/50 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Logo variant="icon" size="sm" withLink={false} />
                      <span className="font-mono text-xs text-robo-neon tracking-wider">OFFICIAL STUDENT CREDENTIAL</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-robo-neon/20 text-robo-neon border border-robo-neon/40">
                      FREE EXPLORER
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="sm:col-span-2 space-y-1">
                      <div className="text-lg font-extrabold text-robo-text">{fullName || 'Student Name'}</div>
                      <div className="text-xs text-robo-textSecondary font-mono">{schoolOrCollegeName || 'Institution'} • {city || 'City'}</div>
                      <div className="pt-2 text-xs font-mono text-robo-teal">
                        PROJECTED ID: <span className="text-robo-neon font-bold">RV-2026-XXXXXX</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-20 h-20 rounded-xl bg-black/60 border border-robo-teal/50 flex flex-col items-center justify-center text-center p-1">
                        <QrCode className="w-10 h-10 text-robo-neon mb-1 animate-pulse" />
                        <span className="text-[8px] font-mono text-robo-textMuted">VERIFY QR</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Code */}
                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                    INVITATION OR REFERRAL CODE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RV-FRIEND-123 (Gives 1 Free Month of Plus)"
                    className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-neon font-mono text-sm focus:outline-none focus:border-robo-neon uppercase"
                  />
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 text-xs text-robo-textSecondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 rounded border-robo-borderSubtle text-robo-neon focus:ring-robo-neon"
                    />
                    <span>
                      I agree to the <Link href="/terms" className="text-robo-neon underline">Terms of Service</Link> and <Link href="/privacy" className="text-robo-neon underline">Privacy Policy</Link>, and consent to receiving robotics competition alerts for my city.
                    </span>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-3 rounded-xl border border-robo-borderSubtle text-robo-textSecondary text-sm hover:border-robo-text flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Issue Student ID & Enter RoboVerse</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
