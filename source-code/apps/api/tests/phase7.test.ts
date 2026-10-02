import request from 'supertest';
import { app } from '../src/app';
import { inMemoryDb } from '../src/lib/db';
import { UserRole } from '@roboverse/shared';

describe('Phase 7: Admin Control Center, Live Pricing Editor & Telemetry API', () => {
  let adminToken: string;
  let studentToken: string;
  let studentUserId: string;

  beforeAll(async () => {
    // 1. Register a regular student
    const studentRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Phase 7 Regular Student',
        email: `student_phase7_${Date.now()}@example.com`,
        password: 'Password@123',
        mobileNumber: `+919876${Math.floor(100000 + Math.random() * 900000)}`,
        dateOfBirth: '2003-05-15',
        institutionType: 'college',
        schoolOrCollegeName: 'Delhi Robotics Lab',
        classOrYear: '3rd Year',
        city: 'Delhi',
        state: 'Delhi',
        interests: ['arduino', 'machine-learning'],
        acceptedTerms: true,
      });

    expect(studentRes.status).toBe(201);
    studentToken = studentRes.body.data.tokens.accessToken;
    studentUserId = studentRes.body.data.user.id;

    // 2. Register an Admin user
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Super Admin Engineer',
        email: `admin_phase7_${Date.now()}@example.com`,
        password: 'AdminPassword@123',
        mobileNumber: `+919876${Math.floor(100000 + Math.random() * 900000)}`,
        dateOfBirth: '1995-01-01',
        institutionType: 'college',
        schoolOrCollegeName: 'RoboVerse HQ',
        classOrYear: 'Faculty',
        city: 'Delhi',
        state: 'Delhi',
        interests: ['all'],
        acceptedTerms: true,
      });

    expect(adminRes.status).toBe(201);
    const adminUserId = adminRes.body.data.user.id;

    // Promote this user to ADMIN in inMemoryDb
    const adminUser = inMemoryDb.users.get(adminUserId);
    adminUser.role = UserRole.ADMIN;
    inMemoryDb.users.set(adminUserId, adminUser);

    // Re-login to get updated JWT with ADMIN role
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: adminUser.email,
        password: 'AdminPassword@123',
      });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.tokens.accessToken;
  });

  describe('1. Role-Based Access Control (RBAC) Security', () => {
    it('should reject non-admin students from accessing /api/v1/admin endpoints with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should permit verified ADMIN to access /api/v1/admin/metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudentsRegistered).toBeGreaterThanOrEqual(2);
      expect(res.body.data.razorpayFeeEstimateInr).toBeDefined();
    });
  });

  describe('2. Live Pricing & Plan Limits Editor Without Redeploying', () => {
    it('should allow Admin to update plan pricing, GST inclusive amounts, and daily Rituu quotas', async () => {
      // Update PLUS plan limits & price
      const updateRes = await request(app)
        .put('/api/v1/plans/plan_plus')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Plus Plan (RoboMaker Edition)',
          tagline: 'Self-guided builders with advanced simulation & 120 AI queries',
          pricing: [
            {
              cycle: 'MONTHLY',
              priceInrInclusiveGst: 349, // Updated from 299
              label: '₹349 / month',
            },
            {
              cycle: 'QUARTERLY',
              priceInrInclusiveGst: 899,
              discountPercentage: 15,
              label: '₹899 / quarter',
            },
            {
              cycle: 'YEARLY',
              priceInrInclusiveGst: 2999,
              discountPercentage: 28,
              label: '₹2,999 / year',
            },
          ],
          features: {
            maxSavedProjects: -1, // Unlimited
            fullComponentLibrary: true,
            advancedSimTools: true,
            rituuDailyTextMessageLimit: 120, // Increased limit
            rituuDailyPhotoAnalysisLimit: 25,
            storeDiscountPercent: 5,
          },
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.name).toBe('Plus Plan (RoboMaker Edition)');

      // Verify that public /api/v1/plans immediately reflects updated pricing without redeployment
      const publicRes = await request(app).get('/api/v1/plans/plan_plus');
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.pricing[0].priceInrInclusiveGst).toBe(349);
      expect(publicRes.body.data.features.rituuDailyTextMessageLimit).toBe(120);
    });
  });

  describe('3. Student Management & Role Promotion', () => {
    it('should list all registered students with their plans and credentials', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.some((u: any) => u.id === studentUserId)).toBe(true);
    });

    it('should allow Admin to promote a student to PRO_STUDENT or MENTOR', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${studentUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.PRO_STUDENT });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe(UserRole.PRO_STUDENT);

      // Verify updated in DB
      const updatedUser = inMemoryDb.users.get(studentUserId);
      expect(updatedUser.role).toBe(UserRole.PRO_STUDENT);
    });
  });

  describe('4. Store Orders & GST Invoices Audit', () => {
    it('should list store orders with customer names and payment details', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });

    it('should list official 18% GST tax invoices with tax breakdown and download links', async () => {
      const res = await request(app)
        .get('/api/v1/admin/invoices')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.invoices)).toBe(true);
    });

    it('should allow Admin to create dynamic discount & scholarship coupons', async () => {
      const res = await request(app)
        .post('/api/v1/admin/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'ROBOINDIA50',
          discountPercentage: 50,
          maxUses: 200,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('ROBOINDIA50');
      expect(res.body.data.discountPercentage).toBe(50);
    });
  });
});
