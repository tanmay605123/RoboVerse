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
 * GET /api/v1/simulator/projects/:projectId
 */
router.get('/projects/:projectId', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = inMemoryDb.circuitProjects.get(projectId);

  if (!project) {
    res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: `Project ${projectId} not found` },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      ...project,
      components: JSON.parse(project.componentsJson || '[]'),
      wires: JSON.parse(project.wiresJson || '[]'),
    },
  });
});

/**
 * PUT /api/v1/simulator/projects/:projectId
 */
router.put('/projects/:projectId', requireAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user!.userId;
  const project = inMemoryDb.circuitProjects.get(projectId);

  if (!project) {
    res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: `Project ${projectId} not found` },
    });
    return;
  }

  if (project.userId !== userId && req.user!.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to edit this project' },
    });
    return;
  }

  const { title, description, components, wires, codeSnippet, isPublic } = req.body;
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (components !== undefined) project.componentsJson = JSON.stringify(components);
  if (wires !== undefined) project.wiresJson = JSON.stringify(wires);
  if (codeSnippet !== undefined) project.codeSnippet = codeSnippet;
  if (isPublic !== undefined) project.isPublic = isPublic;
  project.updatedAt = new Date();

  inMemoryDb.circuitProjects.set(projectId, project);

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

/**
 * DELETE /api/v1/simulator/projects/:projectId
 */
router.delete('/projects/:projectId', requireAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user!.userId;
  const project = inMemoryDb.circuitProjects.get(projectId);

  if (!project) {
    res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: `Project ${projectId} not found` },
    });
    return;
  }

  if (project.userId !== userId && req.user!.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this project' },
    });
    return;
  }

  inMemoryDb.circuitProjects.delete(projectId);

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
});

/**
 * GET /api/v1/simulator/components
 * List all available circuit components with filtering by category and free tier
 */
router.get('/components', async (req: Request, res: Response) => {
  const { category, freeOnly } = req.query;
  let components = Array.from(inMemoryDb.components.values());

  if (category) {
    components = components.filter((c) => c.category === category);
  }
  if (freeOnly === 'true') {
    components = components.filter((c) => c.isFreeTier);
  }

  const formatted = components.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    model3DUrl: c.model3DUrl,
    datasheetUrl: c.datasheetUrl,
    isFreeTier: c.isFreeTier,
    priceInr: c.priceInr,
    pins: typeof c.pinDefinitionsJson === 'string' ? JSON.parse(c.pinDefinitionsJson) : c.pins || [],
    defaultProperties: typeof c.defaultPropertiesJson === 'string' ? JSON.parse(c.defaultPropertiesJson) : c.defaultProperties || {},
  }));

  res.json({
    success: true,
    total: formatted.length,
    data: formatted,
  });
});

/**
 * GET /api/v1/simulator/components/:componentId
 */
router.get('/components/:componentId', async (req: Request, res: Response) => {
  const { componentId } = req.params;
  const c = inMemoryDb.components.get(componentId);

  if (!c) {
    res.status(404).json({
      success: false,
      error: { code: 'COMPONENT_NOT_FOUND', message: `Component ${componentId} not found` },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: c.id,
      name: c.name,
      category: c.category,
      model3DUrl: c.model3DUrl,
      datasheetUrl: c.datasheetUrl,
      isFreeTier: c.isFreeTier,
      priceInr: c.priceInr,
      pins: typeof c.pinDefinitionsJson === 'string' ? JSON.parse(c.pinDefinitionsJson) : c.pins || [],
      defaultProperties: typeof c.defaultPropertiesJson === 'string' ? JSON.parse(c.defaultPropertiesJson) : c.defaultProperties || {},
    },
  });
});

/**
 * GET /api/v1/simulator/starters
 * List ready-made circuit starter assemblies (Basic, Arduino, micro:bit, Circuit Assemblies)
 */
router.get('/starters', async (req: Request, res: Response) => {
  const starters = Array.from(inMemoryDb.circuitProjects.values())
    .filter((p) => p.userId === 'system_starters' || p.isStarter)
    .map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category || 'Basic',
      thumbnailUrl: p.thumbnailUrl,
      componentsCount: JSON.parse(p.componentsJson || '[]').length,
      wiresCount: JSON.parse(p.wiresJson || '[]').length,
    }));

  res.json({
    success: true,
    total: starters.length,
    data: starters,
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
