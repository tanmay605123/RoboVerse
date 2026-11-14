import { Router, Request, Response } from 'express';
import { UpdatePlanInputSchema, UserRole } from '@roboverse/shared';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { prisma } from '../../lib/db';

const router = Router();

type PlanRow = {
  id: string;
  tier: string;
  name: string;
  tagline: string;
  isPopular: boolean;
  badge: string | null;
  pricingJson: string;
  featuresJson: string;
};

/**
 * GET /api/v1/plans
 * List all available plans with complete pricing, feature matrices, and limits
 */
router.get('/', async (req: Request, res: Response) => {
  const plans = (await prisma.plan.findMany({ orderBy: { id: 'asc' } })).map((p: PlanRow) => ({
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
  const plan = await prisma.plan.findUnique({ where: { id: planId } });

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
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    if (!plan) {
      res.status(404).json({
        success: false,
        error: { code: 'PLAN_NOT_FOUND', message: `Plan '${planId}' not found` },
      });
      return;
    }

    const { name, tagline, pricing, features } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (tagline) updateData.tagline = tagline;
    if (pricing) updateData.pricingJson = JSON.stringify(pricing);
    if (features) {
      const existingFeatures = JSON.parse(plan.featuresJson);
      updateData.featuresJson = JSON.stringify({ ...existingFeatures, ...features });
    }
    const updatedPlan = await prisma.plan.update({ where: { id: planId }, data: updateData });

    res.json({
      success: true,
      message: `Plan '${planId}' successfully updated by Admin`,
      data: {
        id: updatedPlan.id,
        tier: updatedPlan.tier,
        name: updatedPlan.name,
        tagline: updatedPlan.tagline,
        pricing: JSON.parse(updatedPlan.pricingJson),
        features: JSON.parse(updatedPlan.featuresJson),
      },
    });
  }
);

export default router;
