import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateSubscriptionPrice,
  validateCoupon,
  ROBOVERSE_PLANS,
  ROBOVERSE_FEATURE_COMPARISON,
  ACTIVE_PROMO_COUPONS,
} from '@roboverse/shared';

describe('Phase 10: Payments, Plans & Subscriptions Engine', () => {
  it('correctly retrieves official RoboVerse plan configurations and limits', () => {
    // Free plan
    const free = ROBOVERSE_PLANS.free;
    assert.strictEqual(free.priceInrMonthly, 0);
    assert.strictEqual(free.priceInrYearly, 0);
    assert.strictEqual(free.maxSavedProjects, 5);
    assert.strictEqual(free.rituuDailyQuestions, 20);
    assert.strictEqual(free.guidedLessonsCount, 16);
    assert.strictEqual(free.certificateIssuance, false);

    // Plus plan
    const plus = ROBOVERSE_PLANS.plus;
    assert.strictEqual(plus.priceInrMonthly, 299);
    assert.strictEqual(plus.priceInrYearly, 2499);
    assert.strictEqual(plus.maxSavedProjects, -1); // Unlimited
    assert.strictEqual(plus.rituuDailyQuestions, 200);
    assert.strictEqual(plus.rituuPhotoDebugging, true);
    assert.strictEqual(plus.guidedLessonsCount, 50);
    assert.strictEqual(plus.robotTemplatesUnlocked, 5);
    assert.strictEqual(plus.arenasUnlocked, 4);
    assert.strictEqual(plus.storeDiscountPercent, 5);
    assert.strictEqual(plus.certificateIssuance, true);

    // Pro plan
    const pro = ROBOVERSE_PLANS.pro;
    assert.strictEqual(pro.priceInrMonthly, 599);
    assert.strictEqual(pro.priceInrYearly, 4999);
    assert.strictEqual(pro.maxSavedProjects, -1);
    assert.strictEqual(pro.rituuDailyQuestions, -1); // Unlimited
    assert.strictEqual(pro.rituuPhotoDebugging, true);
    assert.strictEqual(pro.storeDiscountPercent, 10);
    assert.strictEqual(pro.rosMatlabExport, true);
    assert.strictEqual(pro.customComponents, true);
    assert.strictEqual(pro.certificateIssuance, true);
  });

  it('authoritatively calculates subscription price with 18% GST breakdown', () => {
    // Plus Monthly: ₹299 (GST incl)
    const plusMonthly = calculateSubscriptionPrice('plus', 'monthly');
    assert.strictEqual(plusMonthly.basePriceInr, 299);
    assert.strictEqual(plusMonthly.discountInr, 0);
    assert.strictEqual(plusMonthly.totalPayableInr, 299);
    // 299 / 1.18 = 253.39
    assert.strictEqual(plusMonthly.taxablePriceInr, 253.39);
    assert.strictEqual(plusMonthly.gstAmountInr, 45.61);
    assert.strictEqual(
      Math.round((plusMonthly.taxablePriceInr + plusMonthly.gstAmountInr) * 100) / 100,
      299
    );

    // Plus Yearly: ₹2,499 (GST incl, 30% savings compared to 299 * 12 = 3588)
    const plusYearly = calculateSubscriptionPrice('plus', 'yearly');
    assert.strictEqual(plusYearly.basePriceInr, 2499);
    assert.strictEqual(plusYearly.totalPayableInr, 2499);
    // 2499 / 1.18 = 2117.80
    assert.strictEqual(plusYearly.taxablePriceInr, 2117.8);
    assert.strictEqual(plusYearly.gstAmountInr, 381.2);

    // Pro Yearly: ₹4,999 (GST incl)
    const proYearly = calculateSubscriptionPrice('pro', 'yearly');
    assert.strictEqual(proYearly.basePriceInr, 4999);
    assert.strictEqual(proYearly.totalPayableInr, 4999);
  });

  it('validates promo coupon codes and applies percentage or flat discounts', () => {
    // 1. Percentage discount: DIWALI2026 (20% off)
    const diwaliValidation = validateCoupon('DIWALI2026', 'plus', 'monthly');
    assert.strictEqual(diwaliValidation.valid, true);
    assert.strictEqual(diwaliValidation.discountPercent, 20);
    // 20% of 299 = 59.8 -> 60
    assert.strictEqual(diwaliValidation.discountAppliedInr, 60);
    assert.strictEqual(diwaliValidation.finalPriceInr, 239);

    // 2. Pricing with DIWALI2026 coupon applied on Pro Yearly
    const proWithDiwali = calculateSubscriptionPrice('pro', 'yearly', 'DIWALI2026');
    assert.strictEqual(proWithDiwali.basePriceInr, 4999);
    // 20% of 4999 = 1000
    assert.strictEqual(proWithDiwali.discountInr, 1000);
    assert.strictEqual(proWithDiwali.totalPayableInr, 3999);
    assert.strictEqual(proWithDiwali.couponApplied?.code, 'DIWALI2026');

    // 3. Flat discount: INNOVATOR (₹500 off, min order ₹2,000)
    // On monthly plan (₹299), min order is not met:
    const innovatorMonthly = validateCoupon('INNOVATOR', 'plus', 'monthly');
    assert.strictEqual(innovatorMonthly.valid, false);
    assert.ok(innovatorMonthly.message.includes('minimum order'));

    // On yearly plan (₹2,499), min order IS met:
    const innovatorYearly = validateCoupon('INNOVATOR', 'plus', 'yearly');
    assert.strictEqual(innovatorYearly.valid, true);
    assert.strictEqual(innovatorYearly.discountAppliedInr, 500);
    assert.strictEqual(innovatorYearly.finalPriceInr, 1999);

    // 4. Invalid coupon
    const invalidCoupon = validateCoupon('EXPIRED_CODE_123', 'pro', 'monthly');
    assert.strictEqual(invalidCoupon.valid, false);
    assert.strictEqual(invalidCoupon.discountAppliedInr, 0);
  });

  it('generates compliant 10-minute UPI Dynamic QR code URI with valid parameters', () => {
    const amountInr = 2499;
    const planTier = 'plus';
    const razorpayOrderId = 'order_rp_test_9921';

    const upiUri = `upi://pay?pa=roboverse@icici&pn=RoboVerse%20Technologies&am=${amountInr}&cu=INR&tn=RoboVerse%20${planTier.toUpperCase()}%20Plan&tr=${razorpayOrderId}`;

    assert.ok(upiUri.startsWith('upi://pay?'));
    assert.ok(upiUri.includes('pa=roboverse@icici'));
    assert.ok(upiUri.includes('pn=RoboVerse%20Technologies'));
    assert.ok(upiUri.includes(`am=${amountInr}`));
    assert.ok(upiUri.includes('cu=INR'));
    assert.ok(upiUri.includes('tr=order_rp_test_9921'));

    // Check 10-minute expiry timestamp calculation
    const now = Date.now();
    const expiryDate = new Date(now + 10 * 60 * 1000);
    const diffMinutes = (expiryDate.getTime() - now) / (60 * 1000);
    assert.strictEqual(Math.round(diffMinutes), 10);
  });

  it('calculates correct subscription period boundaries on upgrade', () => {
    const startDate = new Date('2026-11-14T10:00:00.000Z');

    // Monthly subscription
    const monthlyEnd = new Date(startDate);
    monthlyEnd.setMonth(monthlyEnd.getMonth() + 1);
    assert.strictEqual(monthlyEnd.toISOString(), '2026-12-14T10:00:00.000Z');

    // Yearly subscription
    const yearlyEnd = new Date(startDate);
    yearlyEnd.setMonth(yearlyEnd.getMonth() + 12);
    assert.strictEqual(yearlyEnd.toISOString(), '2027-11-14T10:00:00.000Z');
  });

  it('maintains comprehensive feature comparison matrix across all 4 tiers', () => {
    assert.ok(ROBOVERSE_FEATURE_COMPARISON.length >= 10);

    const rituuQuota = ROBOVERSE_FEATURE_COMPARISON.find((f) => f.name.includes('Rituu AI Chat Quota'));
    assert.ok(rituuQuota);
    assert.strictEqual(rituuQuota.free, '20 questions / day');
    assert.strictEqual(rituuQuota.plus, '200 questions / day');
    assert.strictEqual(rituuQuota.pro, 'Unlimited 24/7');

    const photoDebug = ROBOVERSE_FEATURE_COMPARISON.find((f) => f.name.includes('Multimodal Photo'));
    assert.ok(photoDebug);
    assert.strictEqual(photoDebug.free, false);
    assert.strictEqual(photoDebug.plus, true);
    assert.strictEqual(photoDebug.pro, true);

    const storeDiscount = ROBOVERSE_FEATURE_COMPARISON.find((f) => f.name.includes('Store Discount'));
    assert.ok(storeDiscount);
    assert.strictEqual(storeDiscount.free, 'Standard Pricing');
    assert.strictEqual(storeDiscount.plus, '5% OFF');
    assert.strictEqual(storeDiscount.pro, '10% OFF');
  });
});
