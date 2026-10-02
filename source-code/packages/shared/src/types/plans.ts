import { z } from 'zod';

export enum PlanTier {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO',
  INSTITUTION = 'INSTITUTION',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME',
}

export interface PlanPricingDetail {
  cycle: BillingCycle;
  priceInrInclusiveGst: number; // Gross price in INR, GST inclusive
  discountPercentage?: number;
  razorpayPlanId?: string;
  label: string;
}

export interface PlanFeatures {
  maxSavedProjects: number;          // 5 for Free, -1 for unlimited
  allowPrivateProjects: boolean;
  fullComponentLibrary: boolean;
  advancedSimTools: boolean;         // oscilloscope, multimeter, 3D robot builder
  fullRoboticsTheoryLibrary: boolean;
  recordedCourses: boolean;
  liveClassesMonthlyCount: number;   // 0 for Free/Plus, 8+ for Pro
  guidedRealLifeProjects: boolean;   // with milestones, grading & portfolio certs
  machineLearningTrack: boolean;     // ML for robotics, kinematics, ROS, CV
  hackathonPrepTrack: boolean;       // past problems, mock rounds, team matching
  rituuDailyTextMessageLimit: number;// 15 (Free), 100 (Plus), 300 (Pro)
  rituuDailyPhotoAnalysisLimit: number; // 3 (Free), 20 (Plus), 50 (Pro)
  rituuCodeReviewAndDebugging: boolean;
  talkToMentorHandoff: boolean;
  storeDiscountPercent: number;      // 0%, 5%, 10%
  completionCertificates: boolean;
  prioritySupport: boolean;
  hasTeacherDashboard: boolean;      // for Institution
}

export interface RoboVersePlan {
  id: string;
  tier: PlanTier;
  name: string;
  tagline: string;
  pricing: PlanPricingDetail[];
  features: PlanFeatures;
  isPopular?: boolean;
  badge?: string;
}

// Default Plan Configuration (Market-calibrated according to benchmark requirements)
export const DEFAULT_PLANS: Record<PlanTier, RoboVersePlan> = {
  [PlanTier.FREE]: {
    id: 'plan_free',
    tier: PlanTier.FREE,
    name: 'Free Explorer',
    tagline: 'Open for all students starting their robotics & circuits journey.',
    pricing: [
      {
        cycle: BillingCycle.MONTHLY,
        priceInrInclusiveGst: 0,
        label: 'Free Forever',
      },
    ],
    features: {
      maxSavedProjects: 5,
      allowPrivateProjects: false,
      fullComponentLibrary: false,
      advancedSimTools: false,
      fullRoboticsTheoryLibrary: false,
      recordedCourses: false,
      liveClassesMonthlyCount: 0,
      guidedRealLifeProjects: false,
      machineLearningTrack: false,
      hackathonPrepTrack: false,
      rituuDailyTextMessageLimit: 15,
      rituuDailyPhotoAnalysisLimit: 3,
      rituuCodeReviewAndDebugging: false,
      talkToMentorHandoff: false,
      storeDiscountPercent: 0,
      completionCertificates: false,
      prioritySupport: false,
      hasTeacherDashboard: false,
    },
  },

  [PlanTier.PLUS]: {
    id: 'plan_plus',
    tier: PlanTier.PLUS,
    name: 'Plus Self-Learner',
    tagline: 'Full simulator access, complete component library & recorded robotics masterclasses.',
    badge: 'Best for Self-Learners',
    pricing: [
      {
        cycle: BillingCycle.MONTHLY,
        priceInrInclusiveGst: 299,
        label: '₹299 / month',
      },
      {
        cycle: BillingCycle.QUARTERLY,
        priceInrInclusiveGst: 749,
        discountPercentage: 16,
        label: '₹749 / quarter (Save ~16%)',
      },
      {
        cycle: BillingCycle.YEARLY,
        priceInrInclusiveGst: 2499,
        discountPercentage: 30,
        label: '₹2,499 / year (Save ~30%)',
      },
    ],
    features: {
      maxSavedProjects: -1, // unlimited
      allowPrivateProjects: true,
      fullComponentLibrary: true,
      advancedSimTools: true,
      fullRoboticsTheoryLibrary: true,
      recordedCourses: true,
      liveClassesMonthlyCount: 0,
      guidedRealLifeProjects: false,
      machineLearningTrack: false,
      hackathonPrepTrack: false,
      rituuDailyTextMessageLimit: 100,
      rituuDailyPhotoAnalysisLimit: 20,
      rituuCodeReviewAndDebugging: true,
      talkToMentorHandoff: false,
      storeDiscountPercent: 5,
      completionCertificates: true,
      prioritySupport: false,
      hasTeacherDashboard: false,
    },
  },

  [PlanTier.PRO]: {
    id: 'plan_pro',
    tier: PlanTier.PRO,
    name: 'Pro Guided Learning',
    tagline: 'Live online classes, mentor reviews, machine learning track & national hackathon prep.',
    isPopular: true,
    badge: 'Most Popular',
    pricing: [
      {
        cycle: BillingCycle.MONTHLY,
        priceInrInclusiveGst: 999,
        label: '₹999 / month',
      },
      {
        cycle: BillingCycle.QUARTERLY,
        priceInrInclusiveGst: 2699,
        discountPercentage: 10,
        label: '₹2,699 / quarter (Save ~10%)',
      },
      {
        cycle: BillingCycle.YEARLY,
        priceInrInclusiveGst: 8999,
        discountPercentage: 25,
        label: '₹8,999 / year (Save ~25%)',
      },
    ],
    features: {
      maxSavedProjects: -1, // unlimited
      allowPrivateProjects: true,
      fullComponentLibrary: true,
      advancedSimTools: true,
      fullRoboticsTheoryLibrary: true,
      recordedCourses: true,
      liveClassesMonthlyCount: 8,
      guidedRealLifeProjects: true,
      machineLearningTrack: true,
      hackathonPrepTrack: true,
      rituuDailyTextMessageLimit: 300,
      rituuDailyPhotoAnalysisLimit: 50,
      rituuCodeReviewAndDebugging: true,
      talkToMentorHandoff: true,
      storeDiscountPercent: 10,
      completionCertificates: true,
      prioritySupport: true,
      hasTeacherDashboard: false,
    },
  },

  [PlanTier.INSTITUTION]: {
    id: 'plan_institution',
    tier: PlanTier.INSTITUTION,
    name: 'Institution & School Plan',
    tagline: 'For schools and colleges: batch management, teacher dashboard, and bulk student access.',
    badge: 'Institutions',
    pricing: [
      {
        cycle: BillingCycle.YEARLY,
        priceInrInclusiveGst: 499, // per student per year, minimum 50
        label: '₹499 / student / year (Min 50 students)',
      },
    ],
    features: {
      maxSavedProjects: -1,
      allowPrivateProjects: true,
      fullComponentLibrary: true,
      advancedSimTools: true,
      fullRoboticsTheoryLibrary: true,
      recordedCourses: true,
      liveClassesMonthlyCount: 4,
      guidedRealLifeProjects: true,
      machineLearningTrack: true,
      hackathonPrepTrack: true,
      rituuDailyTextMessageLimit: 200,
      rituuDailyPhotoAnalysisLimit: 30,
      rituuCodeReviewAndDebugging: true,
      talkToMentorHandoff: true,
      storeDiscountPercent: 10,
      completionCertificates: true,
      prioritySupport: true,
      hasTeacherDashboard: true,
    },
  },
};

// Admin Plan Update Schema
export const UpdatePlanInputSchema = z.object({
  name: z.string().min(2).optional(),
  tagline: z.string().optional(),
  pricing: z
    .array(
      z.object({
        cycle: z.nativeEnum(BillingCycle),
        priceInrInclusiveGst: z.number().min(0),
        discountPercentage: z.number().optional(),
        label: z.string(),
      })
    )
    .optional(),
  features: z
    .object({
      maxSavedProjects: z.number().optional(),
      allowPrivateProjects: z.boolean().optional(),
      fullComponentLibrary: z.boolean().optional(),
      advancedSimTools: z.boolean().optional(),
      fullRoboticsTheoryLibrary: z.boolean().optional(),
      recordedCourses: z.boolean().optional(),
      liveClassesMonthlyCount: z.number().optional(),
      guidedRealLifeProjects: z.boolean().optional(),
      machineLearningTrack: z.boolean().optional(),
      hackathonPrepTrack: z.boolean().optional(),
      rituuDailyTextMessageLimit: z.number().optional(),
      rituuDailyPhotoAnalysisLimit: z.number().optional(),
      rituuCodeReviewAndDebugging: z.boolean().optional(),
      talkToMentorHandoff: z.boolean().optional(),
      storeDiscountPercent: z.number().optional(),
      completionCertificates: z.boolean().optional(),
      prioritySupport: z.boolean().optional(),
      hasTeacherDashboard: z.boolean().optional(),
    })
    .optional(),
});

export type UpdatePlanInput = z.infer<typeof UpdatePlanInputSchema>;
