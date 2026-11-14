import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import { mobileApiRequest, setMobileAuthToken } from '../api/client';
import { getSupabaseClient } from '@roboverse/shared';

interface MobileAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: any | null;
  profile: any | null;
  studentIdCard: any | null;
  planTier: 'FREE' | 'PLUS' | 'PRO';
  biometricsAvailable: boolean;
  
  initBiometrics: () => Promise<void>;
  loginWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuestStudent: () => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useMobileAuthStore = create<MobileAuthState>((set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  profile: null,
  studentIdCard: {
    studentId: 'RV-2026-000108',
    fullName: 'Aarav Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    level: 4,
    xp: 2850,
    planTier: 'PRO',
    completedProjects: 7,
    learningHours: 42,
  },
  planTier: 'PRO',
  biometricsAvailable: false,

  initBiometrics: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      set({ biometricsAvailable: hasHardware && isEnrolled });
    } catch {
      set({ biometricsAvailable: false });
    }
  },

  loginWithBiometrics: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID / Fingerprint to enter RoboVerse',
        fallbackLabel: 'Use Student ID Password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        // Authenticated via device biometrics
        const mockStudentUser = {
          id: 'usr_mobile_student_01',
          email: 'student.mobile@roboverse.io',
          role: 'PRO_STUDENT',
        };
        const mockProfile = {
          fullName: 'Aarav Sharma',
          studentId: 'RV-2026-000108',
          schoolOrCollegeName: 'Delhi Robotics Institute',
          city: 'Delhi',
          state: 'Delhi',
        };

        setMobileAuthToken('mock_jwt_mobile_authenticated');
        set({
          isAuthenticated: true,
          accessToken: 'mock_jwt_mobile_authenticated',
          user: mockStudentUser,
          profile: mockProfile,
          planTier: 'PRO',
        });

        return { success: true };
      } else {
        return { success: false, error: 'Biometric scan was cancelled or did not match.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Biometric authentication failed.' };
    }
  },

  loginWithPassword: async (identifier, password) => {
    try {
      const supabase = getSupabaseClient();
      let emailToUse = identifier;
      const isEmail = identifier.includes('@');

      if (!isEmail) {
        // Look up by Student ID
        const { data: profileLookup } = await (supabase.from('profiles') as any)
          .select('id')
          .eq('student_id', identifier.toUpperCase())
          .maybeSingle();

        if (profileLookup?.id) {
          emailToUse = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@roboverse.internal`;
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (!error && data?.user) {
        const { data: profileRow } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', data.user.id)
          .single();

        const studentId = profileRow?.student_id || 'RV-2026-000108';
        const fullName = profileRow?.full_name || 'Aarav Sharma';
        const level = typeof profileRow?.level === 'number' ? profileRow.level : 4;
        const xp = profileRow?.xp ?? 2850;

        setMobileAuthToken(data.session?.access_token || 'supabase_token');
        set({
          isAuthenticated: true,
          accessToken: data.session?.access_token || 'supabase_token',
          user: data.user,
          profile: profileRow || {
            fullName,
            studentId,
            schoolOrCollegeName: 'Delhi Robotics Institute',
            city: 'Delhi',
            state: 'Delhi',
          },
          studentIdCard: {
            studentId,
            fullName,
            avatarUrl: profileRow?.avatar_url || get().studentIdCard.avatarUrl,
            qrCodeData: get().studentIdCard.qrCodeData,
            level,
            xp,
            planTier: 'PRO',
            completedProjects: 7,
            learningHours: 42,
          },
          planTier: 'PRO',
        });
        return { success: true };
      }
    } catch {
      // Fall through to fallback
    }

    const isEmail = identifier.includes('@');
    const endpoint = isEmail ? '/auth/login' : '/auth/login/student-id';
    const payload = isEmail
      ? { email: identifier, password }
      : { studentId: identifier, password };

    const res = await mobileApiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      const { tokens, user, profile, studentIdCard } = res.data;
      setMobileAuthToken(tokens.accessToken);
      set({
        isAuthenticated: true,
        accessToken: tokens.accessToken,
        user,
        profile,
        studentIdCard: studentIdCard || get().studentIdCard,
        planTier: user.role === 'PRO_STUDENT' ? 'PRO' : user.role === 'PLUS_STUDENT' ? 'PLUS' : 'FREE',
      });
      return { success: true };
    } else {
      return {
        success: false,
        error: res.error?.message || 'Invalid Student ID or password credentials.',
      };
    }
  },

  loginAsGuestStudent: () => {
    set({
      isAuthenticated: true,
      accessToken: 'guest_token',
      user: {
        id: 'usr_guest_mobile',
        email: 'guest@roboverse.io',
        role: 'FREE_STUDENT',
      },
      profile: {
        fullName: 'Junior Roboticist',
        studentId: 'RV-2026-GUEST',
        schoolOrCollegeName: 'Self Learner',
        city: 'Delhi',
        state: 'Delhi',
      },
      planTier: 'FREE',
    });
  },

  logout: () => {
    setMobileAuthToken(null);
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      profile: null,
    });
  },

  fetchProfile: async () => {
    const res = await mobileApiRequest('/auth/me');
    if (res.success && res.data) {
      set({
        user: res.data.user,
        profile: res.data.profile,
        studentIdCard: res.data.studentIdCard || get().studentIdCard,
        planTier: res.data.planTier || 'PRO',
      });
    }
  },
}));
