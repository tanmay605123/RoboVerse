import { PrismaClient } from '@prisma/client';
import { DEFAULT_PLANS, PlanTier, UserRole, UserStatus, BillingCycle, SubscriptionStatus } from '@roboverse/shared';

// Create real PrismaClient instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// In-Memory store for offline/local development or test runs
interface InMemoryDatabase {
  users: Map<string, any>;
  profiles: Map<string, any>;
  studentIds: Map<string, any>;
  plans: Map<string, any>;
  subscriptions: Map<string, any>;
  payments: Map<string, any>;
  coupons: Map<string, any>;
  usageMeters: Map<string, any>;
  circuitProjects: Map<string, any>;
  components: Map<string, any>;
  courses: Map<string, any>;
  lessons: Map<string, any>;
  events: Map<string, any>;
  shops: Map<string, any>;
  products: Map<string, any>;
  invoices: Map<string, any>;
}

export const inMemoryDb: InMemoryDatabase = {
  users: new Map(),
  profiles: new Map(),
  studentIds: new Map(),
  plans: new Map(),
  subscriptions: new Map(),
  payments: new Map(),
  coupons: new Map(),
  usageMeters: new Map(),
  circuitProjects: new Map(),
  components: new Map(),
  courses: new Map(),
  lessons: new Map(),
  events: new Map(),
  shops: new Map(),
  products: new Map(),
  invoices: new Map(),
};

// Seed default plans into inMemoryDb immediately
export function initInMemorySeed(): void {
  // 1. Seed Plans
  Object.values(DEFAULT_PLANS).forEach((p) => {
    inMemoryDb.plans.set(p.id, {
      id: p.id,
      tier: p.tier,
      name: p.name,
      tagline: p.tagline,
      isPopular: p.isPopular || false,
      badge: p.badge || null,
      pricingJson: JSON.stringify(p.pricing),
      featuresJson: JSON.stringify(p.features),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // 2. Seed Default Promo Coupons
  inMemoryDb.coupons.set('WELCOME100', {
    id: 'coup_welcome100',
    code: 'WELCOME100',
    discountAmountInr: 100,
    minOrderAmountInr: 299,
    validFrom: new Date(),
    validUntil: new Date('2030-12-31'),
    maxUses: 10000,
    usedCount: 0,
    isActive: true,
  });

  inMemoryDb.coupons.set('ROBO50', {
    id: 'coup_robo50',
    code: 'ROBO50',
    discountPercentage: 50,
    minOrderAmountInr: 499,
    validFrom: new Date(),
    validUntil: new Date('2030-12-31'),
    maxUses: 500,
    usedCount: 0,
    isActive: true,
  });

  // 3. Seed Default Admin User
  const adminId = 'user_admin_001';
  inMemoryDb.users.set(adminId, {
    id: adminId,
    email: 'admin@roboverse.io',
    passwordHash: '$2a$10$pT6o3y7f3wGZfJ8/YdI0CeN0oAovt6gJv6f1J1rJ1n6.Zgq9pEweC', // Admin@2026!
    mobileNumber: '+919999900001',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    referralCode: 'ROBO-ADMIN-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  inMemoryDb.profiles.set(adminId, {
    id: 'prof_admin_001',
    userId: adminId,
    fullName: 'RoboVerse Commander',
    institutionType: 'university',
    schoolOrCollegeName: 'RoboVerse Robotics Lab',
    classOrYear: 'Lead Admin',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    interests: ['arduino', 'ros_robotics', 'machine_learning'],
    level: 99,
    xp: 99999,
    streakDays: 365,
    totalLearningHours: 1200,
  });

  inMemoryDb.studentIds.set(adminId, {
    id: 'id_admin_001',
    userId: adminId,
    studentId: 'RV-2026-000001',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzc1tD0QAAAABJRU5ErkJggg==',
    verificationHash: 'admin_hash_000001',
    issuedAt: new Date(),
    validUntil: new Date('2030-12-31'),
  });
}

initInMemorySeed();
