import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth';
import { inMemoryDb } from '../../lib/db';

const router = Router();

/**
 * POST /api/v1/coupons/validate
 * Validates a coupon or referral code against order amount
 */
router.post('/validate', async (req: Request, res: Response) => {
  const { code, amountInr = 0 } = req.body;

  if (!code) {
    res.status(400).json({
      success: false,
      error: { code: 'CODE_REQUIRED', message: 'Coupon code is required' },
    });
    return;
  }

  const upperCode = code.toUpperCase();
  const coupon = inMemoryDb.coupons.get(upperCode);

  // Check if it's a student referral code
  const isReferralUser = Array.from(inMemoryDb.users.values()).find(
    (u) => u.referralCode === upperCode
  );

  if (isReferralUser) {
    // Referral code gives 1 month discount or ₹299 off on Plus/Pro
    const discountAmount = Math.min(amountInr, 299);
    res.json({
      success: true,
      message: 'Student Referral Code Applied! You get ₹299 off, and your friend gets 1 free month!',
      data: {
        code: upperCode,
        isReferral: true,
        discountAmountInr: discountAmount,
        finalAmountInr: Math.max(0, amountInr - discountAmount),
      },
    });
    return;
  }

  if (!coupon || !coupon.isActive) {
    res.status(404).json({
      success: false,
      error: { code: 'INVALID_COUPON', message: 'Invalid or inactive coupon code.' },
    });
    return;
  }

  if (new Date(coupon.validUntil) < new Date()) {
    res.status(400).json({
      success: false,
      error: { code: 'COUPON_EXPIRED', message: 'This coupon code has expired.' },
    });
    return;
  }

  if (amountInr < coupon.minOrderAmountInr) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MIN_ORDER_NOT_MET',
        message: `Minimum order amount of ₹${coupon.minOrderAmountInr} required for this coupon.`,
      },
    });
    return;
  }

  let discountAmount = 0;
  if (coupon.discountPercentage) {
    discountAmount = (amountInr * coupon.discountPercentage) / 100;
  } else if (coupon.discountAmountInr) {
    discountAmount = coupon.discountAmountInr;
  }

  res.json({
    success: true,
    message: `Coupon '${upperCode}' applied successfully!`,
    data: {
      code: upperCode,
      isReferral: false,
      discountAmountInr: discountAmount,
      finalAmountInr: Math.max(0, amountInr - discountAmount),
    },
  });
});

/**
 * GET /api/v1/coupons/referral-code
 */
router.get('/referral-code', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = inMemoryDb.users.get(userId);

  res.json({
    success: true,
    data: {
      referralCode: user?.referralCode,
      benefit: 'Share with friends! When they join RoboVerse, you both get 1 month of Plus/Pro free.',
    },
  });
});

export default router;
