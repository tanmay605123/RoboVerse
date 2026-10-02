import { Router, Request, Response } from 'express';
import { PlanTier, UserRole } from '@roboverse/shared';
import { requireAuth } from '../../middleware/auth';
import { inMemoryDb } from '../../lib/db';
import { usageService } from '../../lib/usage';
import { CircuitDiagnosticEngine } from '@roboverse/sim-engine';

const router = Router();

/**
 * GET /api/v1/simulator/projects
 * List user's saved circuits
 */
router.get('/projects', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const projects = Array.from(inMemoryDb.circuitProjects.values()).filter(
    (p) => p.userId === userId
  );

  res.json({
    success: true,
    data: projects,
  });
});

/**
 * POST /api/v1/simulator/projects
 * Save a circuit project (verifies project limits based on plan)
 */
router.post('/projects', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const studentIdRecord = inMemoryDb.studentIds.get(userId);
  const { title, description, components = [], wires = [], codeSnippet = '', isPublic = true } = req.body;

  const planTier = (req.user!.role === UserRole.PRO_STUDENT
    ? PlanTier.PRO
    : req.user!.role === UserRole.PLUS_STUDENT
    ? PlanTier.PLUS
    : PlanTier.FREE) as PlanTier;

  // Check quota for saving projects
  const quotaCheck = await usageService.checkAndConsumeQuota(
    userId,
    planTier,
    studentIdRecord?.studentId || 'RV-GUEST',
    'SAVE_PROJECT'
  );

  if (!quotaCheck.allowed) {
    res.status(429).json({
      success: false,
      error: {
        code: 'PROJECT_LIMIT_EXCEEDED',
        message: quotaCheck.message,
        upgradePrompt: quotaCheck.upgradePrompt,
      },
    });
    return;
  }

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const project = {
    id: projectId,
    userId,
    title: title || 'Untitled 3D Circuit',
    description: description || '',
    isPublic: planTier === PlanTier.FREE ? true : isPublic, // Free projects are public
    componentsJson: JSON.stringify(components),
    wiresJson: JSON.stringify(wires),
    codeSnippet,
    thumbnailUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  inMemoryDb.circuitProjects.set(projectId, project);

  res.status(201).json({
    success: true,
    message: 'Circuit project saved successfully',
    data: project,
  });
});

/**
 * POST /api/v1/simulator/validate
 * Run circuit diagnostics (short circuits, missing ground, LED resistors)
 */
router.post('/validate', async (req: Request, res: Response) => {
  const { components = [], wires = [] } = req.body;
  const diagnostics = CircuitDiagnosticEngine.validateCircuit(components, wires);

  res.json({
    success: true,
    data: {
      hasErrors: diagnostics.length > 0,
      criticalErrorCount: diagnostics.filter((d) => d.severity === 'CRITICAL').length,
      warningCount: diagnostics.filter((d) => d.severity === 'WARNING').length,
      diagnostics,
    },
  });
});

export default router;
