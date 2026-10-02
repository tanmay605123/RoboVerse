import { Router, Request, Response } from 'express';
import { inMemoryDb } from '../../lib/db';
import { requireAuth, optionalAuth } from '../../middleware/auth';

const router = Router();

// In-memory team matching submissions
const teamMatchingPool = new Map<string, Array<any>>();

/**
 * @openapi
 * /api/v1/hackathons:
 *   get:
 *     summary: Retrieve robotics hackathons and competitions feed
 *     tags: [Hackathons]
 */
router.get('/', optionalAuth, (req: Request, res: Response) => {
  const { city, level, mode, search } = req.query;

  let events = Array.from(inMemoryDb.events.values());

  if (city) {
    const cityStr = (city as string).toLowerCase();
    events = events.filter((e) => e.city.toLowerCase() === cityStr);
  }

  if (level) {
    events = events.filter((e) => e.level.toLowerCase() === (level as string).toLowerCase());
  }

  if (mode) {
    events = events.filter((e) => e.mode.toLowerCase() === (mode as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
    );
  }

  // Sort upcoming by eventDate ascending
  events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  return res.status(200).json({
    success: true,
    data: {
      total: events.length,
      hackathons: events,
    },
  });
});

/**
 * @openapi
 * /api/v1/hackathons/{id}:
 *   get:
 *     summary: Get hackathon details by ID
 *     tags: [Hackathons]
 */
router.get('/:id', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const event = inMemoryDb.events.get(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      error: { code: 'HACKATHON_NOT_FOUND', message: 'Hackathon event not found' },
    });
  }

  const teamPool = teamMatchingPool.get(id) || [];

  return res.status(200).json({
    success: true,
    data: {
      hackathon: event,
      lookingForTeamCount: teamPool.length,
    },
  });
});

/**
 * @openapi
 * /api/v1/hackathons/{id}/team-matching:
 *   post:
 *     summary: Submit a team matching request for a hackathon
 *     tags: [Hackathons]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/team-matching', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { skills, message, preferredRole } = req.body;
  const userId = req.user!.userId;
  const profile = inMemoryDb.profiles.get(userId);

  if (!inMemoryDb.events.has(id)) {
    return res.status(404).json({
      success: false,
      error: { code: 'HACKATHON_NOT_FOUND', message: 'Hackathon event not found' },
    });
  }

  if (!teamMatchingPool.has(id)) {
    teamMatchingPool.set(id, []);
  }

  const matchEntry = {
    userId,
    fullName: profile?.fullName || 'Anonymous Builder',
    college: profile?.schoolOrCollegeName || 'University',
    city: profile?.city || 'Delhi',
    skills: skills || ['Arduino', 'C++'],
    preferredRole: preferredRole || 'Hardware / Embedded Engineer',
    message: message || 'Looking for passionate teammates to build an autonomous rover!',
    joinedAt: new Date().toISOString(),
  };

  teamMatchingPool.get(id)!.push(matchEntry);

  return res.status(201).json({
    success: true,
    data: {
      status: 'MATCHING_POOL_JOINED',
      entry: matchEntry,
      currentCandidates: teamMatchingPool.get(id),
    },
  });
});

export default router;
