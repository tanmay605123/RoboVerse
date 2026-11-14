import {
  SubscriptionPlanTier,
  SubscriptionBillingCycle,
  PlanDetails,
  PlanFeature,
  CouponValidationResult,
} from '../types/subscriptions';

/**
 * RoboVerse Master Subscription Plans
 * Defined per Section 10 specifications:
 * - Free: ₹0
 * - Plus: ₹299/mo or ₹2,499/yr
 * - Pro: ₹599/mo or ₹4,999/yr
 * - Institutional: Custom Quote / Per Seat
 */
export const ROBOVERSE_PLANS: Record<SubscriptionPlanTier, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Explorer Free',
    tagline: 'Ideal for beginners starting with robotics & electronics fundamentals.',
    priceInrMonthly: 0,
    priceInrYearly: 0,
    savingsYearlyPercent: 0,
    maxSavedProjects: 5,
    rituuDailyQuestions: 20,
    rituuPhotoDebugging: false,
    guidedLessonsCount: 16,
    robotTemplatesUnlocked: 1,
    arenasUnlocked: 1,
    storeDiscountPercent: 0,
    certificateIssuance: false,
    rosMatlabExport: false,
    customComponents: false,
    highlights: [
      'Full 66+ Realistic Hardware Component Library (100% Free)',
      '16 Interactive Step-by-Step Guided Lessons',
      '5 Saved Simulation Projects',
      '20 Daily Rituu AI Mentor Questions',
      'Full Access to TechSavyyy Retail Store & Nearby Shops',
      'Basic Two-Wheel Rover Simulation',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus Maker',
    tagline: 'For active hobbyists and engineering students building serious robots.',
    badge: 'MOST POPULAR',
    popular: true,
    priceInrMonthly: 299,
    priceInrYearly: 2499,
    savingsYearlyPercent: 30,
    maxSavedProjects: -1, // Unlimited
    rituuDailyQuestions: 200,
    rituuPhotoDebugging: true,
    guidedLessonsCount: 50,
    robotTemplatesUnlocked: 5,
    arenasUnlocked: 4,
    storeDiscountPercent: 5,
    certificateIssuance: true,
    rosMatlabExport: false,
    customComponents: false,
    highlights: [
      'Unlimited Saved Simulation Projects',
      '200 Daily Rituu Questions + Multimodal Photo Debugging',
      'All 50 Advanced Robotics Lessons',
      'All 5 Robot Templates (Quadruped, Hexapod, Arm, Drones)',
      'All 4 Physics Testing Arenas (Lunar, Maze, Obstacle, Terrain)',
      '5% Exclusive Store Discount on Hardware Kits',
      'Verified Certificate of Completion Issuance',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Innovator',
    tagline: 'Comprehensive robotics suite for competitive hackathons and industrial prototypes.',
    badge: 'ADVANCED R&D',
    priceInrMonthly: 599,
    priceInrYearly: 4999,
    savingsYearlyPercent: 31,
    maxSavedProjects: -1, // Unlimited
    rituuDailyQuestions: -1, // Unlimited
    rituuPhotoDebugging: true,
    guidedLessonsCount: 100,
    robotTemplatesUnlocked: 5,
    arenasUnlocked: 4,
    storeDiscountPercent: 10,
    certificateIssuance: true,
    rosMatlabExport: true,
    customComponents: true,
    highlights: [
      'Everything in Plus with Zero Limits',
      'Unlimited Rituu AI Guidance (24/7 Dedicated Reasoning)',
      'Custom Component CAD & Pinout Importer',
      'Advanced ROS 2 & MATLAB / Simulink Kinematics Export',
      '10% Maximum Store Discount on All Kits & Parts',
      'Priority Squad Matchmaking in National Hackathons',
      'Priority 24/7 Human Mentor & Engineering Support',
    ],
  },
  institution: {
    id: 'institution',
    name: 'Institution Lab',
    tagline: 'Bulk licensing, teacher grading console & physical lab hardware bundles.',
    badge: 'SCHOOLS & COLLEGES',
    priceInrMonthly: 2499,
    priceInrYearly: 19999,
    savingsYearlyPercent: 33,
    maxSavedProjects: -1,
    rituuDailyQuestions: -1,
    rituuPhotoDebugging: true,
    guidedLessonsCount: 100,
    robotTemplatesUnlocked: 5,
    arenasUnlocked: 4,
    storeDiscountPercent: 15,
    certificateIssuance: true,
    rosMatlabExport: true,
    customComponents: true,
    highlights: [
      'Per-Seat Student Roster & Bulk Onboarding',
      'Teacher Classroom Command & Assignment Grading Portal',
      'Custom Curriculum Mapping to CBSE / ICSE / AICTE standards',
      'Institutional 18% GST Invoicing & Net-30 Purchase Orders',
      'Dedicated Customer Success Manager & Lab Training',
      'Custom School Branded Verification Ledger & Certificates',
    ],
  },
};

/**
 * Feature Comparison Matrix
 */
export const ROBOVERSE_FEATURE_COMPARISON: PlanFeature[] = [
  {
    category: 'core',
    name: 'Hardware Component Library',
    free: '66+ FREE Parts',
    plus: '66+ FREE Parts',
    pro: '66+ FREE + Custom CAD',
    institution: '66+ FREE + Custom CAD',
  },
  {
    category: 'core',
    name: 'Saved Circuit & Robot Projects',
    free: '5 Projects',
    plus: 'Unlimited',
    pro: 'Unlimited',
    institution: 'Unlimited',
  },
  {
    category: 'core',
    name: 'Guided Curriculum Lessons',
    free: '16 Basic Lessons',
    plus: '50 Intermediate Lessons',
    pro: '100+ Advanced Tracks',
    institution: '100+ Custom Tracks',
  },
  {
    category: 'rituu',
    name: 'Rituu AI Chat Quota',
    free: '20 questions / day',
    plus: '200 questions / day',
    pro: 'Unlimited 24/7',
    institution: 'Unlimited 24/7',
  },
  {
    category: 'rituu',
    name: 'Multimodal Photo Circuit Debugging',
    free: false,
    plus: true,
    pro: true,
    institution: true,
  },
  {
    category: 'labs',
    name: 'Robot Templates (Rover, Arm, Quad, Hex, Drone)',
    free: '1 Rover',
    plus: 'All 5 Templates',
    pro: 'All 5 Templates',
    institution: 'All 5 Templates',
  },
  {
    category: 'labs',
    name: 'Physics Testing Arenas',
    free: 'Flat Ground',
    plus: 'All 4 Arenas',
    pro: 'All 4 Arenas',
    institution: 'All 4 Arenas + Custom',
  },
  {
    category: 'labs',
    name: 'ROS 2 & MATLAB Code Export',
    free: false,
    plus: false,
    pro: true,
    institution: true,
  },
  {
    category: 'hardware',
    name: 'TechSavyyy Hardware Store Discount',
    free: 'Standard Pricing',
    plus: '5% OFF',
    pro: '10% OFF',
    institution: '15% OFF Bulk',
  },
  {
    category: 'support',
    name: 'Verifiable Completion Certificates',
    free: false,
    plus: true,
    pro: true,
    institution: true,
  },
  {
    category: 'support',
    name: 'Teacher Grading Portal & Class Analytics',
    free: false,
    plus: false,
    pro: false,
    institution: true,
  },
];

/**
 * Valid Active Promo Coupons
 */
export const ACTIVE_PROMO_COUPONS: Record<
  string,
  { discountPercent?: number; discountAmountInr?: number; minOrderInr?: number; description: string }
> = {
  ROBOFIRST: {
    discountPercent: 15,
    description: '15% First-Time Explorer Discount',
  },
  DIWALI2026: {
    discountPercent: 20,
    description: '20% Festive Robotic Season Discount',
  },
  INNOVATOR: {
    discountAmountInr: 500,
    minOrderInr: 2000,
    description: 'Flat ₹500 OFF on Annual Plans',
  },
  INSTITUTE50: {
    discountPercent: 50,
    description: '50% Educational Institutional Grant',
  },
};

/**
 * Authoritative Price Calculator
 */
export function calculateSubscriptionPrice(
  planTier: SubscriptionPlanTier,
  cycle: SubscriptionBillingCycle,
  couponCode?: string
): {
  basePriceInr: number;
  discountInr: number;
  taxablePriceInr: number;
  gstAmountInr: number;
  totalPayableInr: number;
  couponApplied?: {
    code: string;
    discountInr: number;
    description: string;
  };
} {
  const plan = ROBOVERSE_PLANS[planTier];
  if (!plan) {
    throw new Error(`Invalid plan tier: ${planTier}`);
  }

  const basePriceInr = cycle === 'yearly' ? plan.priceInrYearly : plan.priceInrMonthly;
  if (basePriceInr === 0) {
    return {
      basePriceInr: 0,
      discountInr: 0,
      taxablePriceInr: 0,
      gstAmountInr: 0,
      totalPayableInr: 0,
    };
  }

  let discountInr = 0;
  let couponApplied = undefined;

  if (couponCode) {
    const normalizedCode = couponCode.trim().toUpperCase();
    const coupon = ACTIVE_PROMO_COUPONS[normalizedCode];

    if (coupon) {
      if (coupon.minOrderInr && basePriceInr < coupon.minOrderInr) {
        // min order requirement not met
      } else {
        if (coupon.discountPercent) {
          discountInr = Math.round((basePriceInr * coupon.discountPercent) / 100);
        } else if (coupon.discountAmountInr) {
          discountInr = Math.min(basePriceInr, coupon.discountAmountInr);
        }

        couponApplied = {
          code: normalizedCode,
          discountInr,
          description: coupon.description,
        };
      }
    }
  }

  const discountedTotal = Math.max(0, basePriceInr - discountInr);
  // Prices in RoboVerse are GST-inclusive (18% GST).
  const taxablePriceInr = Math.round((discountedTotal / 1.18) * 100) / 100;
  const gstAmountInr = Math.round((discountedTotal - taxablePriceInr) * 100) / 100;

  return {
    basePriceInr,
    discountInr,
    taxablePriceInr,
    gstAmountInr,
    totalPayableInr: discountedTotal,
    couponApplied,
  };
}

/**
 * Validate Coupon Helper
 */
export function validateCoupon(
  code: string,
  planTier: SubscriptionPlanTier,
  cycle: SubscriptionBillingCycle
): CouponValidationResult {
  const normalized = (code || '').trim().toUpperCase();
  const coupon = ACTIVE_PROMO_COUPONS[normalized];

  if (!coupon) {
    return {
      valid: false,
      code: normalized,
      discountAppliedInr: 0,
      finalPriceInr:
        cycle === 'yearly'
          ? ROBOVERSE_PLANS[planTier].priceInrYearly
          : ROBOVERSE_PLANS[planTier].priceInrMonthly,
      message: 'Invalid promo code. Please enter a valid coupon code.',
    };
  }

  const plan = ROBOVERSE_PLANS[planTier];
  const basePrice = cycle === 'yearly' ? plan.priceInrYearly : plan.priceInrMonthly;

  if (coupon.minOrderInr && basePrice < coupon.minOrderInr) {
    return {
      valid: false,
      code: normalized,
      discountAppliedInr: 0,
      finalPriceInr: basePrice,
      message: `Coupon ${normalized} requires a minimum order of ₹${coupon.minOrderInr}.`,
    };
  }

  let discount = 0;
  if (coupon.discountPercent) {
    discount = Math.round((basePrice * coupon.discountPercent) / 100);
  } else if (coupon.discountAmountInr) {
    discount = Math.min(basePrice, coupon.discountAmountInr);
  }

  return {
    valid: true,
    code: normalized,
    discountPercent: coupon.discountPercent,
    discountAmountInr: coupon.discountAmountInr,
    discountAppliedInr: discount,
    finalPriceInr: Math.max(0, basePrice - discount),
    message: `${coupon.description} applied successfully! Saved ₹${discount}.`,
  };
}
