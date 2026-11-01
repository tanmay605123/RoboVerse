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
  pincode?: string;
  interests: string[];
  avatarUrl?: string;
  level: string;
  xp: number;
  streakDays: number;
  lastSeenAt: string;
  currentActivity: string;
  totalLearningHours?: number;
  dob?: string;
  isMinor?: boolean;
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

export interface EntitlementsData {
  planTier: string;
  planName: string;
  badge: 'FREE' | 'PLUS' | 'PRO' | 'INSTITUTION' | string;
  storeDiscountPercent: number;
  rituuDailyLimit: number;
  rituuPhotoLimit: number;
  maxSavedProjects: number;
  allowPhotoAnalysis: boolean;
  prioritySupport: boolean;
  customRobotUpload: boolean;
  expiresAt: string | null;
}

const DEFAULT_ENTITLEMENTS: EntitlementsData = {
  planTier: 'free',
  planName: 'RoboVerse Explorer',
  badge: 'FREE',
  storeDiscountPercent: 0,
  rituuDailyLimit: 15,
  rituuPhotoLimit: 3,
  maxSavedProjects: 5,
  allowPhotoAnalysis: true,
  prioritySupport: false,
  customRobotUpload: false,
  expiresAt: null,
};

interface AuthState {
  user: UserSession | null;
  profile: StudentProfileData | null;
  studentIdCard: StudentIdCardData | null;
  planTier: PlanTier | DbPlanTier | string;
  entitlements: EntitlementsData;
  projectCount: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  initAuth: () => Promise<void>;
  setAuth: (data: {
    user: UserSession;
    profile: StudentProfileData;
    studentIdCard?: StudentIdCardData;
    planTier?: PlanTier | DbPlanTier | string;
    entitlements?: Partial<EntitlementsData>;
    projectCount?: number;
  }) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  studentIdCard: null,
  planTier: PlanTier.FREE,
  entitlements: DEFAULT_ENTITLEMENTS,
  projectCount: 0,
  isAuthenticated: false,
  isLoading: true,
  initialized: false,

  initAuth: async () => {
    try {
      set({ isLoading: true });
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        set({
          user: null,
          profile: null,
          studentIdCard: null,
          planTier: PlanTier.FREE,
          entitlements: DEFAULT_ENTITLEMENTS,
          projectCount: 0,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
        });
        return;
      }

      const uid = session.user.id;
      // Parallelize fetches: profile, entitlements, and project count
      const [profileRes, entRes, projRes] = await Promise.all([
        (supabase.from('profiles') as any).select('*').eq('id', uid).maybeSingle(),
        (supabase.from('current_entitlements') as any).select('*').eq('user_id', uid).maybeSingle(),
        (supabase.from('circuit_projects') as any)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid),
      ]);

      const profileRow = profileRes.data;
      const entRow = entRes.data;
      const count = projRes.count ?? 0;

      const userRole = (profileRow?.role || session.user.user_metadata?.role || 'student') as DbUserRole;
      const studentId = profileRow?.student_id || session.user.user_metadata?.student_id || 'RV-XXXX-XXXXXX';
      const fullName =
        profileRow?.full_name ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split('@')[0] ||
        'RoboVerse Explorer';

      const tierBadge = (entRow?.badge || (entRow?.plan_tier ? String(entRow.plan_tier).toUpperCase() : 'FREE')) as 'FREE' | 'PLUS' | 'PRO';
      const tier: PlanTier = (tierBadge === 'PRO' ? PlanTier.PRO : tierBadge === 'PLUS' ? PlanTier.PLUS : PlanTier.FREE);

      const entitlementsData: EntitlementsData = entRow
        ? {
            planTier: entRow.plan_tier || 'free',
            planName: entRow.plan_name || (tier === PlanTier.PRO ? 'Pro Engineer' : tier === PlanTier.PLUS ? 'Plus Builder' : 'Free Explorer'),
            badge: tierBadge,
            storeDiscountPercent: Number(entRow.store_discount_percent ?? 0),
            rituuDailyLimit: Number(entRow.rituu_daily_limit ?? 15),
            rituuPhotoLimit: Number(entRow.rituu_photo_limit ?? 3),
            maxSavedProjects: Number(entRow.max_saved_projects ?? 5),
            allowPhotoAnalysis: entRow.allow_photo_analysis !== false,
            prioritySupport: !!entRow.priority_support,
            customRobotUpload: !!entRow.custom_robot_upload,
            expiresAt: entRow.expires_at || null,
          }
        : {
            ...DEFAULT_ENTITLEMENTS,
            planTier: String(tier).toLowerCase(),
            badge: tierBadge,
          };

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
        schoolOrCollegeName: profileRow?.school || profileRow?.school_or_college || session.user.user_metadata?.school || 'RoboVerse Learning Hub',
        classOrYear: profileRow?.class_level || session.user.user_metadata?.class_level || 'General',
        city: profileRow?.city || session.user.user_metadata?.city || 'India',
        state: profileRow?.state || session.user.user_metadata?.state || '',
        pincode: profileRow?.pincode || session.user.user_metadata?.pincode || '',
        interests: profileRow?.interests || session.user.user_metadata?.interests || ['arduino', 'circuits'],
        avatarUrl: profileRow?.avatar_url || session.user.user_metadata?.avatar_url || undefined,
        level: profileRow?.level || (profileRow?.xp > 2000 ? 'Innovator' : profileRow?.xp > 500 ? 'Builder' : 'Rookie'),
        xp: profileRow?.xp ?? 0,
        streakDays: profileRow?.streak_days ?? 0,
        lastSeenAt: profileRow?.last_seen_at || new Date().toISOString(),
        currentActivity: profileRow?.current_activity || 'Exploring RoboVerse Labs',
        dob: profileRow?.dob,
        isMinor: profileRow?.is_minor,
      };

      const idCard: StudentIdCardData = {
        studentId,
        fullName,
        schoolOrCollege: profileData.schoolOrCollegeName,
        planName: entitlementsData.planName,
        level: profileData.level,
        xp: profileData.xp,
        verificationUrl: `https://roboverse-delta.vercel.app/verify/${studentId}`,
        validUntil: entitlementsData.expiresAt
          ? new Date(entitlementsData.expiresAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).toUpperCase()
          : '31 DEC 2026',
      };

      set({
        user: userSession,
        profile: profileData,
        studentIdCard: idCard,
        planTier: tier,
        entitlements: entitlementsData,
        projectCount: count,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      });
    } catch (err) {
      console.error('Error initializing auth:', err);
      set({
        user: null,
        profile: null,
        studentIdCard: null,
        planTier: PlanTier.FREE,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
      });
    }
  },

  setAuth: ({ user, profile, studentIdCard, planTier = PlanTier.FREE, entitlements, projectCount = 0 }) => {
    const tierBadge = String(planTier).toUpperCase();
    const mergedEntitlements: EntitlementsData = {
      ...DEFAULT_ENTITLEMENTS,
      planTier: String(planTier).toLowerCase(),
      badge: tierBadge,
      ...entitlements,
    };

    set({
      user,
      profile,
      studentIdCard: studentIdCard || null,
      planTier,
      entitlements: mergedEntitlements,
      projectCount,
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
      entitlements: DEFAULT_ENTITLEMENTS,
      projectCount: 0,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
