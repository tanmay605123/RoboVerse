import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { usageService } from '../../lib/usage';
import { inMemoryDb } from '../../lib/db';
import { RituuAiService } from '../../lib/rituuAi';
import { RituuMode, PlanTier, UserRole, SendRituuMessageInputSchema } from '@roboverse/shared';

const router = Router();

// In-memory chat store for user sessions
const chatSessions = new Map<string, Array<any>>();
const feedbackRatings = new Map<string, { rating: 'UP' | 'DOWN'; comment?: string; timestamp: string }>();

/**
 * @openapi
 * /api/v1/rituu/chat:
 *   post:
 *     summary: Send message to Rituu AI robotics assistant
 *     tags: [Rituu AI]
 *     security:
 *       - bearerAuth: []
 */
router.post('/chat', requireAuth, async (req: Request, res: Response) => {
  try {
    const parseResult = SendRituuMessageInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input format',
          details: parseResult.error.format(),
        },
      });
    }

    const { message, mode, circuitJson, imageBase64, imageUrl, codeSnippet, serialOutput, language, sessionId } =
      parseResult.data;

    const userId = req.user!.userId;
    const studentIdRecord = inMemoryDb.studentIds.get(userId);
    const planTier = (req.user!.role === UserRole.PRO_STUDENT
      ? PlanTier.PRO
      : req.user!.role === UserRole.PLUS_STUDENT
      ? PlanTier.PLUS
      : PlanTier.FREE) as PlanTier;

    const isPhoto = !!(imageBase64 || imageUrl);
    const action = isPhoto ? 'RITUU_PHOTO' : 'RITUU_TEXT';

    // 1. Check & Consume server-side daily rate limit
    const quotaResult = await usageService.checkAndConsumeQuota(
      userId,
      planTier,
      studentIdRecord?.studentId || 'RV-GUEST',
      action
    );

    if (!quotaResult.allowed) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RITUU_DAILY_QUOTA_EXCEEDED',
          message: quotaResult.message,
          details: {
            currentUsage: quotaResult.used,
            dailyLimit: quotaResult.limit,
            actionType: action,
            upgradeUrl: '/#pricing',
          },
        },
      });
    }

    // 2. Generate Rituu Response via server-side AI pipeline
    const aiResponse = await RituuAiService.generateResponse({
      message,
      mode,
      circuitJson,
      imageBase64,
      imageUrl,
      codeSnippet,
      serialOutput,
      language,
      userId,
    });

    // 3. Record to user's chat session history
    const sessionKey = sessionId || userId;
    if (!chatSessions.has(sessionKey)) {
      chatSessions.set(sessionKey, []);
    }

    const userMsg = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      photoUrl: imageUrl,
    };

    const rituuMsg = {
      id: `msg_rituu_${Date.now() + 1}`,
      sender: 'rituu',
      mode: mode || RituuMode.DEBUG,
      content: aiResponse.content,
      codeSnippet: aiResponse.codeSnippet,
      suggestedComponents: aiResponse.suggestedComponents,
      diagnostics: aiResponse.diagnostics,
      safetyWarning: aiResponse.safetyWarning,
      timestamp: new Date().toISOString(),
    };

    chatSessions.get(sessionKey)!.push(userMsg, rituuMsg);

    // 4. Fetch updated daily quota
    const updatedMeter = await usageService.getDailyUsage(
      userId,
      planTier,
      studentIdRecord?.studentId || 'RV-GUEST'
    );

    return res.status(200).json({
      success: true,
      data: {
        message: rituuMsg,
        quota: {
          messagesUsed: updatedMeter.textMessagesUsed,
          messagesLimit: updatedMeter.textMessagesLimit,
          messagesRemaining: updatedMeter.textMessagesRemaining,
          photosUsed: updatedMeter.photoAnalysesUsed,
          photosLimit: updatedMeter.photoAnalysesLimit,
          photosRemaining: updatedMeter.photoAnalysesRemaining,
          planTier,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'RITUU_AI_ERROR',
        message: error.message || 'Failed to process Rituu request',
      },
    });
  }
});

/**
 * @openapi
 * /api/v1/rituu/history:
 *   get:
 *     summary: Retrieve chat history for current session
 *     tags: [Rituu AI]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const sessionId = (req.query.sessionId as string) || userId;
  const history = chatSessions.get(sessionId) || [];

  return res.status(200).json({
    success: true,
    data: {
      messages: history,
    },
  });
});

/**
 * @openapi
 * /api/v1/rituu/quota:
 *   get:
 *     summary: Retrieve current student Rituu quota and consumption
 *     tags: [Rituu AI]
 *     security:
 *       - bearerAuth: []
 */
router.get('/quota', requireAuth, async (req: Request, res: Response) => {
  try {
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

    return res.status(200).json({
      success: true,
      data: {
        planTier,
        messagesUsed: usage.textMessagesUsed,
        messagesLimit: usage.textMessagesLimit,
        messagesRemaining: usage.textMessagesRemaining,
        photosUsed: usage.photoAnalysesUsed,
        photosLimit: usage.photoAnalysesLimit,
        photosRemaining: usage.photoAnalysesRemaining,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'QUOTA_FETCH_ERROR', message: error.message },
    });
  }
});

/**
 * @openapi
 * /api/v1/rituu/rate:
 *   post:
 *     summary: Submit feedback rating on Rituu response (RLHF)
 *     tags: [Rituu AI]
 *     security:
 *       - bearerAuth: []
 */
router.post('/rate', requireAuth, (req: Request, res: Response) => {
  const { messageId, rating, comment } = req.body;
  if (!messageId || !['UP', 'DOWN'].includes(rating)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_RATING', message: 'Rating must be UP or DOWN' },
    });
  }

  feedbackRatings.set(messageId, {
    rating,
    comment,
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    data: {
      messageId,
      status: 'RECORDED',
    },
  });
});

export default router;
