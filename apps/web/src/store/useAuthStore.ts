import { create } from 'zustand';
import { UserRole, PlanTier } from '@roboverse/shared';

export type JourneyLevel = 'Rookie' | 'Builder' | 'Engineer' | 'Innovator';

export function calculateJourneyLevel(xp: number): { levelName: JourneyLevel; levelNumber: number; nextLevelXp: number; progressPct: number } {
  if (xp < 500) {
    return {
      levelName: 'Rookie',
      levelNumber: 1,
      nextLevelXp: 500,
      progressPct: Math.min(100, Math.round((xp / 500) * 100)),
    };
  }
  if (xp < 2000) {
    return {
      levelName: 'Builder',
      levelNumber: 2,
      nextLevelXp: 2000,
      progressPct: Math.min(100, Math.round(((xp - 500) / 1500) * 100)),
    };
  }
  if (xp < 5000) {
    return {
      levelName: 'Engineer',
      levelNumber: 3,
      nextLevelXp: 5000,
      progressPct: Math.min(100, Math.round(((xp - 2000) / 3000) * 100)),
    };
  }
  return {
    levelName: 'Innovator',
    levelNumber: 4,
    nextLevelXp: 10000,
    progressPct: Math.min(100, Math.round(((xp - 5000) / 5000) * 100)),
  };
}

export interface UserSession {
  id: string;
  email: string;
  mobileNumber?: string;
  role: string;
  referralCode?: string;
}

export interface StudentProfileData {
  fullName: string;
  studentId?: string;
  institutionType?: string;
  schoolOrCollegeName: string;
  classOrYear: string;
  city: string;
  state: string;
  pincode?: string;
  interests: string[];
  avatarUrl?: string;
  level: number;
  xp: number;
  streakDays: number;
  totalLearningHours: number;
  journeyLevel?: JourneyLevel;
  locationConsent?: boolean;
}

export interface StudentIdCardData {
  studentId: string;
  qrCodeDataUrl: string;
  verificationUrl: string;
  validUntil: string;
}

interface AuthState {
  user: UserSession | null;
  profile: StudentProfileData | null;
  studentIdCard: StudentIdCardData | null;
  accessToken: string | null;
  refreshToken: string | null;
  planTier: PlanTier;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;

  setAuth: (data: {
    user: UserSession;
    profile: StudentProfileData;
    studentIdCard?: StudentIdCardData;
    tokens: { accessToken: string; refreshToken: string };
    planTier?: PlanTier;
  }) => void;
  updateProfile: (updates: Partial<StudentProfileData>) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  studentIdCard: null,
  accessToken: null,
  refreshToken: null,
  planTier: PlanTier.FREE,
  isAuthenticated: false,
  hasCompletedOnboarding: false,

  setAuth: ({ user, profile, studentIdCard, tokens, planTier = PlanTier.FREE }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roboverse_access_token', tokens.accessToken);
      localStorage.setItem('roboverse_refresh_token', tokens.refreshToken);
    }
    const computed = calculateJourneyLevel(profile.xp || 0);
    const enrichedProfile: StudentProfileData = {
      ...profile,
      level: computed.levelNumber,
      journeyLevel: computed.levelName,
    };

    const resolvedStudentId = profile.studentId || studentIdCard?.studentId || 'RV-2026-000101';
    const fallbackIdCard: StudentIdCardData = studentIdCard || {
      studentId: resolvedStudentId,
      qrCodeDataUrl: '',
      verificationUrl: `https://roboverse-delta.vercel.app/verify/student/${resolvedStudentId}`,
      validUntil: '2027-12-31',
    };

    set({
      user,
      profile: enrichedProfile,
      studentIdCard: fallbackIdCard,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      planTier,
      isAuthenticated: true,
    });
  },

  updateProfile: (updates) => {
    set((state) => {
      if (!state.profile) return state;
      const newXp = updates.xp !== undefined ? updates.xp : state.profile.xp;
      const computed = calculateJourneyLevel(newXp);
      return {
        profile: {
          ...state.profile,
          ...updates,
          level: computed.levelNumber,
          journeyLevel: computed.levelName,
        },
      };
    });
  },

  setOnboardingCompleted: (completed) => {
    set({ hasCompletedOnboarding: completed });
    if (typeof window !== 'undefined') {
      localStorage.setItem('roboverse_onboarding_completed', completed ? 'true' : 'false');
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('roboverse_access_token');
      localStorage.removeItem('roboverse_refresh_token');
    }
    set({
      user: null,
      profile: null,
      studentIdCard: null,
      accessToken: null,
      refreshToken: null,
      planTier: PlanTier.FREE,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    });
  },
}));
