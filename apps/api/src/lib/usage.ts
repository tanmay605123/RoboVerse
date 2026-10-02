import {
  DailyUsageStatus,
  PlanTier,
  UsageActionType,
  UsageQuotaCheckResult,
  DEFAULT_PLANS,
} from '@roboverse/shared';
import { inMemoryDb } from './db';

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export class UsageService {
  /**
   * Retrieves or initializes today's usage meter for a student
   */
  public async getDailyUsage(userId: string, planTier: PlanTier, studentId: string): Promise<DailyUsageStatus> {
    const today = getTodayDateString();
    const meterKey = `${userId}_${today}`;

    let meter = inMemoryDb.usageMeters.get(meterKey);
    if (!meter) {
      meter = {
        id: `meter_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        date: today,
        textMessagesCount: 0,
        photoAnalysesCount: 0,
        codeReviewsCount: 0,
        estimatedAiCostInr: 0.0,
      };
      inMemoryDb.usageMeters.set(meterKey, meter);
    }

    const planConfig = DEFAULT_PLANS[planTier] || DEFAULT_PLANS[PlanTier.FREE];
    const limits = planConfig.features;

    // Count saved projects
    const savedProjects = Array.from(inMemoryDb.circuitProjects.values()).filter(
      (p) => p.userId === userId
    );

    return {
      userId,
      studentId,
      planTier,
      date: today,
      textMessagesUsed: meter.textMessagesCount,
      textMessagesLimit: limits.rituuDailyTextMessageLimit,
      textMessagesRemaining: Math.max(0, limits.rituuDailyTextMessageLimit - meter.textMessagesCount),
      photoAnalysesUsed: meter.photoAnalysesCount,
      photoAnalysesLimit: limits.rituuDailyPhotoAnalysisLimit,
      photoAnalysesRemaining: Math.max(0, limits.rituuDailyPhotoAnalysisLimit - meter.photoAnalysesCount),
      codeReviewsUsed: meter.codeReviewsCount,
      codeReviewsLimit: limits.rituuCodeReviewAndDebugging ? 100 : 0,
      codeReviewsRemaining: limits.rituuCodeReviewAndDebugging
        ? Math.max(0, 100 - meter.codeReviewsCount)
        : 0,
      savedProjectsCount: savedProjects.length,
      maxSavedProjectsLimit: limits.maxSavedProjects,
      estimatedAiCostInr: Number(meter.estimatedAiCostInr.toFixed(2)),
    };
  }

  /**
   * Checks whether the user has remaining quota before performing an action, and consumes it
   */
  public async checkAndConsumeQuota(
    userId: string,
    planTier: PlanTier,
    studentId: string,
    action: UsageActionType
  ): Promise<UsageQuotaCheckResult> {
    const today = getTodayDateString();
    const meterKey = `${userId}_${today}`;
    const usage = await this.getDailyUsage(userId, planTier, studentId);
    const meter = inMemoryDb.usageMeters.get(meterKey)!;

    if (action === 'RITUU_TEXT') {
      if (usage.textMessagesRemaining <= 0) {
        return {
          allowed: false,
          action,
          used: usage.textMessagesUsed,
          limit: usage.textMessagesLimit,
          remaining: 0,
          planTier,
          upgradeRequired: true,
          message: `Daily limit of ${usage.textMessagesLimit} Rituu text messages reached on ${planTier} plan.`,
          upgradePrompt: {
            recommendedPlan: planTier === PlanTier.FREE ? PlanTier.PLUS : PlanTier.PRO,
            headline: 'Supercharge Rituu with Plus or Pro',
            ctaText: 'Upgrade for up to 300 messages/day',
          },
        };
      }

      meter.textMessagesCount += 1;
      meter.estimatedAiCostInr += 0.05; // ~5 paise per prompt
      return {
        allowed: true,
        action,
        used: meter.textMessagesCount,
        limit: usage.textMessagesLimit,
        remaining: usage.textMessagesLimit - meter.textMessagesCount,
        planTier,
        upgradeRequired: false,
      };
    }

    if (action === 'RITUU_PHOTO') {
      if (usage.photoAnalysesRemaining <= 0) {
        return {
          allowed: false,
          action,
          used: usage.photoAnalysesUsed,
          limit: usage.photoAnalysesLimit,
          remaining: 0,
          planTier,
          upgradeRequired: true,
          message: `Daily limit of ${usage.photoAnalysesLimit} circuit photo analyses reached.`,
          upgradePrompt: {
            recommendedPlan: PlanTier.PLUS,
            headline: 'Analyze up to 20 circuit photos daily with Plus',
            ctaText: 'Unlock 20 Photo Analyses/Day',
          },
        };
      }

      meter.photoAnalysesCount += 1;
      meter.estimatedAiCostInr += 0.45; // ~45 paise per Claude vision photo scan
      return {
        allowed: true,
        action,
        used: meter.photoAnalysesCount,
        limit: usage.photoAnalysesLimit,
        remaining: usage.photoAnalysesLimit - meter.photoAnalysesCount,
        planTier,
        upgradeRequired: false,
      };
    }

    if (action === 'SAVE_PROJECT') {
      if (usage.maxSavedProjectsLimit !== -1 && usage.savedProjectsCount >= usage.maxSavedProjectsLimit) {
        return {
          allowed: false,
          action,
          used: usage.savedProjectsCount,
          limit: usage.maxSavedProjectsLimit,
          remaining: 0,
          planTier,
          upgradeRequired: true,
          message: `Free plan is limited to ${usage.maxSavedProjectsLimit} saved projects.`,
          upgradePrompt: {
            recommendedPlan: PlanTier.PLUS,
            headline: 'Save Unlimited Projects & Make Them Private',
            ctaText: 'Upgrade to Plus (₹299/mo)',
          },
        };
      }

      return {
        allowed: true,
        action,
        used: usage.savedProjectsCount + 1,
        limit: usage.maxSavedProjectsLimit,
        remaining: usage.maxSavedProjectsLimit === -1 ? 9999 : usage.maxSavedProjectsLimit - (usage.savedProjectsCount + 1),
        planTier,
        upgradeRequired: false,
      };
    }

    // Default code review
    meter.codeReviewsCount += 1;
    return {
      allowed: true,
      action,
      used: meter.codeReviewsCount,
      limit: 100,
      remaining: 100 - meter.codeReviewsCount,
      planTier,
      upgradeRequired: false,
    };
  }
}

export const usageService = new UsageService();
