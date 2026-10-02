import { Router, Request, Response } from 'express';
import { UpdatePlanInputSchema, UserRole } from '@roboverse/shared';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { inMemoryDb } from '../../lib/db';

const router = Router();

/**
 * GET /api/v1/plans
 * List all available plans with complete pricing, feature matrices, and limits
 */
router.get('/', async (req: Request, res: Response) => {
  const plans = Array.from(inMemoryDb.plans.values()).map((p) => ({
    id: p.id,
    tier: p.tier,
    name: p.name,
    tagline: p.tagline,
    isPopular: p.isPopular,
    badge: p.badge,
    pricing: JSON.parse(p.pricingJson),
    features: JSON.parse(p.featuresJson),
  }));

  res.json({
    success: true,
    data: plans,
  });
});

/**
 * GET /api/v1/plans/:planId
 */
router.get('/:planId', async (req: Request, res: Response) => {
  const { planId } = req.params;
  const plan = inMemoryDb.plans.get(planId);

  if (!plan) {
    res.status(404).json({
      success: false,
      error: { code: 'PLAN_NOT_FOUND', message: `Plan '${planId}' not found` },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: plan.id,
      tier: plan.tier,
      name: plan.name,
      tagline: plan.tagline,
      isPopular: plan.isPopular,
      badge: plan.badge,
      pricing: JSON.parse(plan.pricingJson),
      features: JSON.parse(plan.featuresJson),
    },
  });
});

/**
 * PUT /api/v1/plans/:planId
 * Admin endpoint: Update plan pricing, limits, and feature flags dynamically without redeployment
 */
router.put(
  '/:planId',
  requireAuth,
  requireRole(UserRole.ADMIN),
  validateBody(UpdatePlanInputSchema),
  async (req: Request, res: Response) => {
    const { planId } = req.params;
    const plan = inMemoryDb.plans.get(planId);

    if (!plan) {
      res.status(404).json({
        success: false,
        error: { code: 'PLAN_NOT_FOUND', message: `Plan '${planId}' not found` },
      });
      return;
    }

    const { name, tagline, pricing, features } = req.body;

    if (name) plan.name = name;
    if (tagline) plan.tagline = tagline;
    if (pricing) plan.pricingJson = JSON.stringify(pricing);
    if (features) {
      const existingFeatures = JSON.parse(plan.featuresJson);
      plan.featuresJson = JSON.stringify({ ...existingFeatures, ...features });
    }
    plan.updatedAt = new Date();

    inMemoryDb.plans.set(planId, plan);

    res.json({
      success: true,
      message: `Plan '${planId}' successfully updated by Admin`,
      data: {
        id: plan.id,
        tier: plan.tier,
        name: plan.name,
        tagline: plan.tagline,
        pricing: JSON.parse(plan.pricingJson),
        features: JSON.parse(plan.featuresJson),
      },
    });
  }
);

export default router;
