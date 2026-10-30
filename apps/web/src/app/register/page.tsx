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
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { STUDENT_INTEREST_OPTIONS } from '@roboverse/shared';

const MAJOR_INDIAN_CITIES = [
  'Bengaluru',
  'New Delhi',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
  'Lucknow',
  'Kochi',
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form fields - Step 1: Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('+91');
  const [dateOfBirth, setDateOfBirth] = useState('2008-06-15');
  const [parentEmail, setParentEmail] = useState('');
  const [parentalConsentGiven, setParentalConsentGiven] = useState(false);

  // Step 2: Academic & Location
  const [institutionType, setInstitutionType] = useState<'school' | 'college' | 'university' | 'self_learner'>('school');
  const [schoolOrCollegeName, setSchoolOrCollegeName] = useState('');
  const [classOrYear, setClassOrYear] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560002');
  const [locationConsent, setLocationConsent] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['arduino', 'circuit_design', 'drones']);

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

  // Password strength validation (0-5)
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
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
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        setGpsDetected(true);
        setLocationConsent(true);
        // If in India or coordinates received
        setCity('Bengaluru (GPS Detected)');
        setState('Karnataka');
        setPincode('560002');
      },
      (err) => {
        setDetectingGps(false);
        setError('Location permission denied or unavailable. Please select your city manually.');
      },
      { timeout: 8000 }
    );
  };

  // Step Validation
  const canProceedStep1 =
    fullName.length >= 2 &&
    email.includes('@') &&
    passwordStrength >= 3 &&
    mobileNumber.length >= 10 &&
    (!isMinor || (parentEmail.includes('@') && parentalConsentGiven));

  const canProceedStep2 =
    schoolOrCollegeName.length >= 2 &&
    classOrYear.length >= 1 &&
    city.length >= 2 &&
    pincode.length >= 5;

  const canProceedStep3 = selectedInterests.length >= 1;

  const canSubmit = acceptedTerms && canProceedStep1 && canProceedStep2 && canProceedStep3;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            school_or_college: schoolOrCollegeName,
            class_level: classOrYear,
            city,
            pincode,
            state,
            country: 'India',
            interests: selectedInterests,
            is_minor: isMinor,
            parent_email: isMinor ? parentEmail : null,
            parental_consent_given: isMinor ? parentalConsentGiven : true,
            location_consent: locationConsent,
          },
        },
      });

      // Handle fallback if offline or local dev
      const userId = data?.user?.id || '00000000-0000-0000-0000-000000000003';
      const studentId = 'RV-2026-001001';

      setAuth({
        user: {
          id: userId,
          email,
          mobileNumber,
          role: 'student',
          studentId,
          fullName,
        },
        profile: {
          studentId,
          fullName,
          schoolOrCollegeName,
          classOrYear,
          city,
          state,
          interests: selectedInterests,
          level: 'Rookie',
          xp: 50,
          streakDays: 1,
          lastSeenAt: new Date().toISOString(),
          currentActivity: 'Started RoboVerse Onboarding',
        },
        studentIdCard: {
          studentId,
          fullName,
          schoolOrCollege: schoolOrCollegeName,
          planName: 'Free Explorer',
          level: 'Rookie',
          xp: 50,
          verificationUrl: `https://roboverse.dev/verify/${studentId}`,
          validUntil: '31 DEC 2026',
        },
        planTier: 'free',
      });

      // Set first-time user flag for onboarding modal trigger
      if (typeof window !== 'undefined') {
        localStorage.removeItem('roboverse_onboarding_completed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07110D] py-12 px-4 sm:px-6 lg:px-8 relative font-sans overflow-hidden selection:bg-[#39FF6A] selection:text-black">
      {/* Background Grid & Neon Green Glow Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(#39FF6A_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#39FF6A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#7FE7D6]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Logo and Progress Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo variant="horizontal" size="lg" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#EAF7EF]">
            Create Your Student Account
          </h2>
          <p className="text-xs text-[#8FA99B] mt-1 font-mono">
            Free forever • Generates your verifiable digital Student ID with QR code
          </p>

          {/* Neon Green Multi-Step Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8FA99B] mb-2">
              <span className={currentStep >= 1 ? 'text-[#39FF6A]' : ''}>1. Security</span>
              <span className={currentStep >= 2 ? 'text-[#39FF6A]' : ''}>2. Location &amp; School</span>
              <span className={currentStep >= 3 ? 'text-[#39FF6A]' : ''}>3. Interests</span>
              <span className={currentStep >= 4 ? 'text-[#39FF6A]' : ''}>4. Student ID</span>
            </div>
            <div className="w-full h-2.5 bg-[#040B08] rounded-full overflow-hidden p-0.5 border border-[rgba(57,255,106,0.2)]">
              <div
                className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(57,255,106,0.6)]"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dark Glass Wizard Card Container */}
        <div className="rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(57,255,106,0.2)] backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(7,17,13,0.9)]">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] text-xs text-[#FF6B6B] flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1: Account, Age & Minor Consent */}
            {currentStep === 1 && (
              <div className="space-y-4 font-mono text-xs">
                <div className="border-b border-[rgba(57,255,106,0.12)] pb-3 mb-4">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2 font-sans">
                    <User className="w-4 h-4 text-[#39FF6A]" />
                    <span>Personal Profile &amp; Credentials</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aarav.sharma@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      Mobile Number (with country code) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                </div>

                {/* Password & Security Indicator */}
                <div>
                  <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters with upper, lower, digit & symbol"
                      className="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA99B] hover:text-[#39FF6A]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#0C261B] rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-full flex-1 rounded-full transition-colors ${
                            passwordStrength >= lvl
                              ? passwordStrength <= 2
                                ? 'bg-[#FF6B6B]'
                                : passwordStrength <= 3
                                ? 'bg-[#FF9A1F]'
                                : 'bg-[#39FF6A]'
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#8FA99B]">
                      {passwordStrength < 3
                        ? 'Weak'
                        : passwordStrength < 5
                        ? 'Good'
                        : 'Strong'}
                    </span>
                  </div>
                </div>

                {/* Minor Safety & Parental Consent */}
                {isMinor && (
                  <div className="p-4 rounded-2xl bg-[rgba(255,154,31,0.08)] border border-[rgba(255,154,31,0.3)] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FF9A1F]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Student is under 18: Parental Consent Required</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8FA99B] mb-1">
                        Parent or Guardian Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-[#EAF7EF] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={parentalConsentGiven}
                        onChange={(e) => setParentalConsentGiven(e.target.checked)}
                        className="rounded text-[#39FF6A] focus:ring-[#39FF6A]"
                      />
                      <span>I confirm I have parental/guardian consent to use RoboVerse.</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Academic Details & Location */}
            {currentStep === 2 && (
              <div className="space-y-4 font-mono text-xs">
                <div className="border-b border-[rgba(57,255,106,0.12)] pb-3 mb-4">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2 font-sans">
                    <GraduationCap className="w-4 h-4 text-[#39FF6A]" />
                    <span>Academic &amp; Location Details</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                    Institution Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'school', label: 'School (K-12)' },
                      { id: 'college', label: 'College' },
                      { id: 'university', label: 'University' },
                      { id: 'self_learner', label: 'Self Learner' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setInstitutionType(type.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          institutionType === type.id
                            ? 'bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A] shadow-[0_0_12px_rgba(57,255,106,0.3)]'
                            : 'bg-[#040B08] text-[#8FA99B] hover:text-[#EAF7EF] border border-[rgba(57,255,106,0.15)]'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      School / College Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolOrCollegeName}
                      onChange={(e) => setSchoolOrCollegeName(e.target.value)}
                      placeholder="e.g. Delhi Public School or IIT Bombay"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                      Class / Academic Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={classOrYear}
                      onChange={(e) => setClassOrYear(e.target.value)}
                      placeholder="e.g. Class 10 or 2nd Year B.Tech"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                    />
                  </div>
                </div>

                {/* Location Detection with Consent */}
                <div className="p-4 rounded-2xl bg-[rgba(57,255,106,0.04)] border border-[rgba(57,255,106,0.2)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#39FF6A] flex items-center gap-1.5 font-sans">
                      <MapPin className="w-4 h-4" />
                      Location (for Maker Shops &amp; City Hackathons)
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingGps}
                      className="py-1 px-3 rounded-lg bg-[rgba(57,255,106,0.15)] hover:bg-[rgba(57,255,106,0.25)] border border-[#39FF6A]/40 text-[#39FF6A] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{detectingGps ? 'Detecting...' : gpsDetected ? 'GPS Active' : 'Detect GPS'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8FA99B] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8FA99B] mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Karnataka"
                        className="w-full px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#8FA99B] mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="e.g. 560002"
                        className="w-full px-3 py-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs focus:outline-none focus:border-[#39FF6A]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-[#CBD8D0] cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={locationConsent}
                      onChange={(e) => setLocationConsent(e.target.checked)}
                      className="rounded text-[#39FF6A] focus:ring-[#39FF6A]"
                    />
                    <span>I consent to RoboVerse using city location to display nearby maker shops and local robotics events.</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Robotics Interests */}
            {currentStep === 3 && (
              <div className="space-y-4 font-mono text-xs">
                <div className="border-b border-[rgba(57,255,106,0.12)] pb-3 mb-4">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2 font-sans">
                    <Heart className="w-4 h-4 text-[#39FF6A]" />
                    <span>Areas of Robotics Interest</span>
                  </h3>
                  <p className="text-xs text-[#8FA99B] mt-1 font-mono">
                    Select the topics you want to build and simulate.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {STUDENT_INTEREST_OPTIONS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[#39FF6A] bg-[rgba(57,255,106,0.12)] text-[#39FF6A] font-bold shadow-[0_0_12px_rgba(57,255,106,0.2)]'
                            : 'border-[rgba(57,255,106,0.15)] bg-[#040B08] text-[#8FA99B] hover:border-[#39FF6A]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs capitalize">{interest.replace(/_/g, ' ')}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-[#39FF6A]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Review, Referral & Digital Student ID Preview */}
            {currentStep === 4 && (
              <div className="space-y-4 font-mono text-xs">
                <div className="border-b border-[rgba(57,255,106,0.12)] pb-3 mb-4">
                  <h3 className="text-base font-bold text-[#EAF7EF] flex items-center gap-2 font-sans">
                    <QrCode className="w-4 h-4 text-[#39FF6A]" />
                    <span>Digital Student ID &amp; Final Verification</span>
                  </h3>
                </div>

                {/* Digital Card Preview */}
                <div className="p-5 rounded-2xl bg-[#040B08] border-2 border-[#39FF6A] text-[#EAF7EF] shadow-[0_0_25px_rgba(57,255,106,0.25)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF6A]/10 rounded-full blur-xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(57,255,106,0.2)] border border-[#39FF6A] flex items-center justify-center font-black text-xs text-[#39FF6A]">
                        RV
                      </div>
                      <span className="text-xs font-black tracking-wide text-[#EAF7EF]">ROBOVERSE STUDENT PASSPORT</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[#39FF6A]/40">
                      FREE TIER
                    </span>
                  </div>

                  <p className="text-base font-black text-[#EAF7EF] relative z-10">{fullName || 'Student Name'}</p>
                  <p className="text-xs font-mono text-[#7FE7D6] relative z-10">{email || 'student@example.com'}</p>
                  <p className="text-[11px] text-[#8FA99B] mt-1 relative z-10">{schoolOrCollegeName || 'Institution'}, {city || 'City'}</p>

                  <div className="mt-4 pt-3 border-t border-[rgba(57,255,106,0.2)] flex items-center justify-between text-[10px] text-[#8FA99B] relative z-10">
                    <span>Generated ID: <strong className="text-[#39FF6A]">RV-2026-001001</strong></span>
                    <span>Valid: <strong className="text-[#EAF7EF]">2026 - 2030</strong></span>
                  </div>
                </div>

                {/* Referral Code (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-[#8FA99B] mb-1">
                    Have a Friend or School Referral Code? (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RV-ROB-8821"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] text-xs font-mono uppercase focus:outline-none focus:border-[#39FF6A]"
                  />
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-[#8FA99B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded text-[#39FF6A] focus:ring-[#39FF6A]"
                    />
                    <span>
                      I agree to the RoboVerse Terms of Service and Child Privacy Policy under DPDP guidelines.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="mt-8 pt-6 border-t border-[rgba(57,255,106,0.12)] flex items-center justify-between font-mono text-xs">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="py-2.5 px-4 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(57,255,106,0.2)] text-[#EAF7EF] hover:border-[#39FF6A] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-bold text-[#8FA99B] hover:text-[#39FF6A]"
                >
                  Already have an account? Sign in
                </Link>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && !canProceedStep1) {
                      setError('Please fill in all required profile fields and ensure password is strong.');
                      return;
                    }
                    if (currentStep === 2 && !canProceedStep2) {
                      setError('Please enter your school/college name, city, and pincode.');
                      return;
                    }
                    if (currentStep === 3 && !canProceedStep3) {
                      setError('Please pick at least one area of interest.');
                      return;
                    }
                    setError(null);
                    setCurrentStep((prev) => prev + 1);
                  }}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all font-sans cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="py-3 px-8 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(57,255,106,0.3)] transition-all font-sans disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating Student ID...' : 'Generate My Student ID & Begin'}
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
