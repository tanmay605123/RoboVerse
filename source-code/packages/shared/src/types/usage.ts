import { z } from 'zod';
import { PlanTier } from './plans';

export interface DailyUsageStatus {
  userId: string;
  studentId: string;
  planTier: PlanTier;
  date: string; // YYYY-MM-DD
  // Text messages
  textMessagesUsed: number;
  textMessagesLimit: number;
  textMessagesRemaining: number;
  // Photo / Diagram analyses
  photoAnalysesUsed: number;
  photoAnalysesLimit: number;
  photoAnalysesRemaining: number;
  // Code reviews
  codeReviewsUsed: number;
  codeReviewsLimit: number;
  codeReviewsRemaining: number;
  // Circuit projects
  savedProjectsCount: number;
  maxSavedProjectsLimit: number;
  // AI Cost accounting (in INR)
  estimatedAiCostInr: number;
}

export type UsageActionType = 'RITUU_TEXT' | 'RITUU_PHOTO' | 'CODE_REVIEW' | 'SAVE_PROJECT';

export const TrackUsageInputSchema = z.object({
  action: z.enum(['RITUU_TEXT', 'RITUU_PHOTO', 'CODE_REVIEW', 'SAVE_PROJECT']),
  promptTokens: z.number().optional().default(0),
  completionTokens: z.number().optional().default(0),
  imageCount: z.number().optional().default(0),
});

export type TrackUsageInput = z.infer<typeof TrackUsageInputSchema>;

export interface UsageQuotaCheckResult {
  allowed: boolean;
  action: UsageActionType;
  used: number;
  limit: number;
  remaining: number;
  planTier: PlanTier;
  upgradeRequired: boolean;
  message?: string;
  upgradePrompt?: {
    recommendedPlan: PlanTier;
    headline: string;
    ctaText: string;
  };
}
