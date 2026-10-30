import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { DbUserRole, DbPlanTier } from '@roboverse/shared';
import { PlanTier } from '@roboverse/shared';

export interface UserSession {
  id: string;
  email: string;
  mobileNumber?: string;
  role: DbUserRole;
  studentId: string;
  fullName: string;
}

export interface StudentProfileData {
  studentId: string;
  fullName: string;
  institutionType?: string;
  schoolOrCollegeName: string;
  classOrYear: string;
  city: string;
  state: string;
  interests: string[];
  avatarUrl?: string;
  level: string;
  xp: number;
  streakDays: number;
  lastSeenAt: string;
  currentActivity: string;
  totalLearningHours?: number;
}

export interface StudentIdCardData {
  studentId: string;
  fullName: string;
  schoolOrCollege: string;
  planName: string;
  level: string;
  xp: number;
  qrCodeDataUrl?: string;
  verificationUrl: string;
  validUntil: string;
}

interface AuthState {
  user: UserSession | null;
  profile: StudentProfileData | null;
  studentIdCard: StudentIdCardData | null;
  planTier: PlanTier | DbPlanTier | string;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  initAuth: () => Promise<void>;
  setAuth: (data: {
    user: UserSession;
    profile: StudentProfileData;
    studentIdCard?: StudentIdCardData;
    planTier?: PlanTier | DbPlanTier | string;
  }) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  studentIdCard: null,
  planTier: PlanTier.FREE,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        set({
          user: null,
          profile: null,
          studentIdCard: null,
          planTier: 'free',
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
        });
        return;
      }

      const uid = session.user.id;
      // Fetch profile from database
      const { data: profileRow } = await (supabase.from('profiles') as any)
        .select('*')
        .eq('id', uid)
        .single();

      // Fetch active subscription
      const { data: subRow } = await (supabase.from('subscriptions') as any)
        .select('plan_id, plans(tier)')
        .eq('user_id', uid)
        .eq('status', 'active')
        .maybeSingle();

      const userRole = (profileRow?.role || session.user.user_metadata?.role || 'student') as DbUserRole;
      const studentId = profileRow?.student_id || session.user.user_metadata?.student_id || 'RV-2026-001001';
      const fullName = profileRow?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'RoboVerse Explorer';
      const rawTier = (subRow as any)?.plans?.tier;
      const tier: PlanTier = (rawTier ? String(rawTier).toUpperCase() : PlanTier.FREE) as PlanTier;

      const userSession: UserSession = {
        id: uid,
        email: session.user.email || '',
        mobileNumber: session.user.phone,
        role: userRole,
        studentId,
        fullName,
      };

      const profileData: StudentProfileData = {
        studentId,
        fullName,
        schoolOrCollegeName: profileRow?.school_or_college || session.user.user_metadata?.school_or_college || 'Indian Institute of Robotics',
        classOrYear: profileRow?.class_level || session.user.user_metadata?.class_level || 'Grade 10',
        city: profileRow?.city || session.user.user_metadata?.city || 'Bengaluru',
        state: profileRow?.state || session.user.user_metadata?.state || 'Karnataka',
        interests: profileRow?.interests || session.user.user_metadata?.interests || ['arduino', 'circuits'],
        avatarUrl: profileRow?.avatar_url || session.user.user_metadata?.avatar_url || undefined,
        level: profileRow?.level || 'Rookie',
        xp: profileRow?.xp ?? 50,
        streakDays: profileRow?.streak_days ?? 1,
        lastSeenAt: profileRow?.last_seen_at || new Date().toISOString(),
        currentActivity: profileRow?.current_activity || 'Exploring RoboVerse Labs',
        totalLearningHours: 14.5,
      };

      const idCard: StudentIdCardData = {
        studentId,
        fullName,
        schoolOrCollege: profileData.schoolOrCollegeName,
        planName: tier === PlanTier.PRO ? 'Pro Engineer' : tier === PlanTier.PLUS ? 'Plus Builder' : 'Free Explorer',
        level: profileData.level,
        xp: profileData.xp,
        verificationUrl: `https://roboverse.dev/verify/${studentId}`,
        validUntil: '31 DEC 2026',
      };

      set({
        user: userSession,
        profile: profileData,
        studentIdCard: idCard,
        planTier: tier,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      });
    } catch (err) {
      console.error('Error initializing auth:', err);
      set({ isLoading: false, initialized: true });
    }
  },

  setAuth: ({ user, profile, studentIdCard, planTier = PlanTier.FREE }) => {
    set({
      user,
      profile,
      studentIdCard: studentIdCard || null,
      planTier,
      isAuthenticated: true,
      isLoading: false,
      initialized: true,
    });
  },

  refreshProfile: async () => {
    await get().initAuth();
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    set({
      user: null,
      profile: null,
      studentIdCard: null,
      planTier: PlanTier.FREE,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
