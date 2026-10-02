import { create } from 'zustand';
import { UserRole, PlanTier } from '@roboverse/shared';

export interface UserSession {
  id: string;
  email: string;
  mobileNumber?: string;
  role: UserRole;
  referralCode?: string;
}

export interface StudentProfileData {
  fullName: string;
  institutionType?: string;
  schoolOrCollegeName: string;
  classOrYear: string;
  city: string;
  state: string;
  interests: string[];
  avatarUrl?: string;
  level: number;
  xp: number;
  streakDays: number;
  totalLearningHours: number;
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
  setAuth: (data: {
    user: UserSession;
    profile: StudentProfileData;
    studentIdCard?: StudentIdCardData;
    tokens: { accessToken: string; refreshToken: string };
    planTier?: PlanTier;
  }) => void;
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

  setAuth: ({ user, profile, studentIdCard, tokens, planTier = PlanTier.FREE }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roboverse_access_token', tokens.accessToken);
      localStorage.setItem('roboverse_refresh_token', tokens.refreshToken);
    }
    set({
      user,
      profile,
      studentIdCard: studentIdCard || null,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      planTier,
      isAuthenticated: true,
    });
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
    });
  },
}));
