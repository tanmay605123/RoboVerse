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
  MapPin,
  Navigation,
} from 'lucide-react';
import { apiRequest } from '../../lib/apiClient';
import { useAuthStore } from '../../store/useAuthStore';
import { RegisterInputSchema, STUDENT_INTEREST_OPTIONS } from '@roboverse/shared';
import { OnboardingJourneyModal } from '../../components/onboarding/OnboardingJourneyModal';

export default function RegisterPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form fields - Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('+91');
  const [dateOfBirth, setDateOfBirth] = useState('2007-06-15');
  const [parentEmail, setParentEmail] = useState('');
  const [parentalConsentGiven, setParentalConsentGiven] = useState(false);

  // Step 2: Academic & Location
  const [institutionType, setInstitutionType] = useState<'school' | 'college' | 'university' | 'self_learner'>('school');
  const [schoolOrCollegeName, setSchoolOrCollegeName] = useState('');
  const [classOrYear, setClassOrYear] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [locationConsent, setLocationConsent] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['arduino', 'circuit_design']);

  // Step 4: Terms
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Onboarding modal trigger
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [createdStudentData, setCreatedStudentData] = useState<{ name: string; studentId: string } | null>(null);

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

  // Browser GPS Location Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        setGpsDetected(true);
        // Default to detected major tech city coordinates for demo
        setCity('New Delhi');
        setState('Delhi');
        setPincode('110001');
      },
      (err) => {
        setDetectingGps(false);
        setError('Location permission denied. You can manually enter your city & pincode.');
      },
      { timeout: 8000 }
    );
  };

  // Step Validation
  const canProceedStep1 =
    fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    passwordStrength === 5 &&
    /^\+?[1-9]\d{9,14}$/.test(mobileNumber.trim()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim()) &&
    (!isMinor || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail.trim()) && parentalConsentGiven));

  const canProceedStep2 =
    schoolOrCollegeName.trim().length >= 2 &&
    classOrYear.trim().length >= 1 &&
    city.trim().length >= 2 &&
    state.trim().length >= 2 &&
    pincode.trim().length >= 5;

  const canProceedStep3 = selectedInterests.length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      mobileNumber: mobileNumber.trim().replace(/[\s()-]/g, ''),
      dateOfBirth: dateOfBirth.trim(),
      parentEmail: isMinor ? parentEmail.trim().toLowerCase() : '',
      parentalConsentGiven: isMinor ? parentalConsentGiven : true,
      institutionType,
      schoolOrCollegeName: schoolOrCollegeName.trim(),
      classOrYear: classOrYear.trim(),
      city: city.trim(),
      state: state.trim(),
      country: 'India',
      interests: selectedInterests,
      acceptedTerms,
      referralCode: referralCode.trim().toUpperCase(),
    };

    const parsedPayload = RegisterInputSchema.safeParse(payload);
    if (!parsedPayload.success) {
      setError(parsedPayload.error.issues[0]?.message || 'Please check the registration details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(parsedPayload.data),
      });

      if (!response.success || !response.data?.user || !response.data?.tokens?.accessToken) {
        const details = response.error?.details;
        const firstDetail = Array.isArray(details) ? details.find((detail: any) => detail?.message)?.message : undefined;
        setError(firstDetail || response.error?.message || 'Registration failed. Please check your inputs.');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('roboverse_access_token', response.data.tokens.accessToken);
        localStorage.setItem('roboverse_refresh_token', response.data.tokens.refreshToken);
      }

      useAuthStore.getState().setBackendAuth(response.data);
      setCreatedStudentData({ name: payload.fullName, studentId: response.data.studentId });
      setShowOnboarding(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-robo-bg py-12 px-4 sm:px-6 lg:px-8 relative hud-grid-bg">
      {/* Onboarding Placement Quiz & First Mission Modal */}
      {showOnboarding && createdStudentData && (
        <OnboardingJourneyModal
          studentName={createdStudentData.name}
          studentId={createdStudentData.studentId}
          onFinish={() => setShowOnboarding(false)}
        />
      )}

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
              <span className={currentStep >= 2 ? 'text-robo-neon font-bold' : ''}>2. Academic & Location</span>
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
                    <span>Account Security & Child Safety</span>
                  </h3>
                  <p className="text-xs text-robo-textSecondary mt-1">
                    Student data is encrypted. Minors under 18 require verified parental consent under child safety policies.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                    FULL NAME (LEGAL NAME FOR CERTIFICATES) *
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@school.edu"
                      className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                      MOBILE NUMBER (FOR OTP) *
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
                </div>

                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                    DATE OF BIRTH *
                  </label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-neon"
                  />
                  <span className="text-[11px] font-mono text-robo-textMuted mt-1 block">
                    Calculated age: {studentAge} years old {isMinor ? '• Under-18 Minor Policy Active' : '• Adult'}
                  </span>
                </div>

                {/* Under-18 Parental Verification Protocol */}
                {isMinor && (
                  <div className="p-4 rounded-2xl bg-robo-surfaceRaised border border-robo-orange/40 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-robo-orange text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Parent / Guardian Consent Protocol Required</span>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                        PARENT / GUARDIAN EMAIL *
                      </label>
                      <input
                        type="email"
                        required={isMinor}
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-sm focus:outline-none focus:border-robo-orange"
                      />
                    </div>
                    <label className="flex items-start gap-2.5 text-xs text-robo-textSecondary cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={parentalConsentGiven}
                        onChange={(e) => setParentalConsentGiven(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-700 bg-black text-robo-orange focus:ring-0"
                      />
                      <span>
                        I confirm my parent/guardian has approved my registration and platform usage.
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
                    <span>Next: Academic & Location</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Academic & Geographical Location Details */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="border-b border-robo-borderSubtle/50 pb-3 mb-4">
                  <h3 className="text-lg font-bold text-robo-text flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-robo-teal" />
                    <span>Academic & Location Details</span>
                  </h3>
                  <p className="text-xs text-robo-textSecondary mt-1">
                    Enables nearby component shop alerts and localized robotics hackathon matching.
                  </p>
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

                {/* Location Detection with Browser GPS */}
                <div className="p-4 rounded-2xl bg-[#040E0A] border border-robo-borderHighlight/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-robo-teal">
                      <MapPin className="w-4 h-4" />
                      <span>LOCATION & NEARBY RADAR</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingGps}
                      className="px-3 py-1.5 rounded-lg bg-robo-neon/10 border border-robo-neon/40 text-robo-neon text-[11px] font-mono hover:bg-robo-neon hover:text-black transition-all flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{detectingGps ? 'Detecting GPS...' : gpsDetected ? '✓ GPS Detected' : 'Detect Location'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-robo-textSecondary mb-1">
                        CITY *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-xs focus:outline-none focus:border-robo-neon"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-robo-textSecondary mb-1">
                        STATE *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Delhi"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-xs focus:outline-none focus:border-robo-neon"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-robo-textSecondary mb-1">
                        PINCODE
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="110001"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text text-xs focus:outline-none focus:border-robo-neon"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-gray-400 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={locationConsent}
                      onChange={(e) => setLocationConsent(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-700 bg-black text-robo-neon focus:ring-0"
                    />
                    <span>
                      I consent to location-based nearby electronics store searches (we never store precise live GPS coordinates).
                    </span>
                  </label>
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
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#092218] to-[#040F0A] border border-robo-borderHighlight/50 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-robo-teal tracking-widest uppercase">
                        ROBOVERSE ACADEMY PASSPORT
                      </span>
                      <h4 className="text-lg font-bold text-robo-text mt-0.5">{fullName || 'Student Name'}</h4>
                      <p className="text-xs text-robo-textSecondary">{schoolOrCollegeName || 'School / College'}</p>
                      <p className="text-xs text-robo-textMuted">{city}, {state}</p>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-black/60 border border-robo-borderHighlight flex flex-col items-center justify-center p-1 text-center">
                      <QrCode className="w-8 h-8 text-robo-neon" />
                      <span className="text-[8px] font-mono text-robo-neon mt-0.5">SECURE</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-robo-borderSubtle/40 flex justify-between items-center text-xs font-mono">
                    <span className="text-robo-textMuted">STUDENT ID:</span>
                    <span className="text-robo-neon font-bold">RV-{new Date().getFullYear()}-XXXXXX (AUTO)</span>
                  </div>
                </div>

                {/* Referral Code Optional Input */}
                <div>
                  <label className="block text-xs font-mono text-robo-textSecondary mb-1">
                    REFERRAL / SCHOLARSHIP CODE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. HACKATHON2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#040B08] border border-robo-borderSubtle text-robo-text font-mono text-sm focus:outline-none focus:border-robo-neon"
                  />
                </div>

                {/* Consent & Terms Checkbox */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 text-xs text-robo-textSecondary cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-700 bg-black text-robo-neon focus:ring-0"
                    />
                    <span>
                      I agree to the <Link href="/terms" className="text-robo-neon underline">Terms of Service</Link> and <Link href="/privacy" className="text-robo-neon underline">Privacy Policy</Link>. I understand my Student ID is tamper-protected.
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
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-robo-neon to-robo-neonHover text-black font-extrabold text-sm shadow-neon-glow hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Activate Student ID & Launch Onboarding</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-robo-textSecondary">
          Already registered?{' '}
          <Link href="/login" className="text-robo-neon font-semibold hover:underline">
            Access your existing Control Room
          </Link>
        </div>
      </div>
    </div>
  );
}
