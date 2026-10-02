import { Router, Request, Response } from 'express';
import { TrackUsageInputSchema, PlanTier, UserRole } from '@roboverse/shared';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { usageService } from '../../lib/usage';
import { inMemoryDb } from '../../lib/db';

const router = Router();

/**
 * GET /api/v1/usage/today
 * Check today's quota usage, remaining credits and limits
 */
router.get('/today', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const studentIdRecord = inMemoryDb.studentIds.get(userId);

  const planTier = (req.user!.role === UserRole.PRO_STUDENT
    ? PlanTier.PRO
    : req.user!.role === UserRole.PLUS_STUDENT
    ? PlanTier.PLUS
    : PlanTier.FREE) as PlanTier;

  const usage = await usageService.getDailyUsage(
    userId,
    planTier,
    studentIdRecord?.studentId || 'RV-GUEST'
  );

  res.json({
    success: true,
    data: usage,
  });
});

/**
 * POST /api/v1/usage/track
 * Consume quota for Rituu text, photo analysis, code review, or saving projects
 */
router.post(
  '/track',
  requireAuth,
  validateBody(TrackUsageInputSchema),
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { action } = req.body;
    const studentIdRecord = inMemoryDb.studentIds.get(userId);

    const planTier = (req.user!.role === UserRole.PRO_STUDENT
      ? PlanTier.PRO
      : req.user!.role === UserRole.PLUS_STUDENT
      ? PlanTier.PLUS
      : PlanTier.FREE) as PlanTier;

    const result = await usageService.checkAndConsumeQuota(
      userId,
      planTier,
      studentIdRecord?.studentId || 'RV-GUEST',
      action
    );

    if (!result.allowed) {
      res.status(429).json({
        success: false,
        error: {
          code: 'PLAN_QUOTA_EXCEEDED',
          message: result.message,
          upgradePrompt: result.upgradePrompt,
        },
        data: result,
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  }
);

/**
 * GET /api/v1/usage/history
 */
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userMeters = Array.from(inMemoryDb.usageMeters.values()).filter(
    (m) => m.userId === userId
  );

  res.json({
    success: true,
    data: userMeters,
  });
});

export default router;
