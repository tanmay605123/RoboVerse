import request from 'supertest';
import { app } from '../src/app';
import { inMemoryDb } from '../src/lib/db';
import { UserRole, PlanTier, BillingCycle } from '@roboverse/shared';
import { getMongoHealthStatus } from '../src/lib/mongoose';
import {
  UserModel,
  StudentIDModel,
  ShopModel,
  ComponentDefModel,
  SampleProjectModel,
  AuditLogModel,
} from '../src/models';

describe('Phase 1: Production Server Skeleton, Auth, Role-Based Redirect, 2FA Admin, Dynamic UPI QR & Plans', () => {
  let studentToken: string;
  let studentUserId: string;
  let studentIdNumber: string;
  let adminToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Register Student for testing
    const studentRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Aarav Sharma',
        email: `aarav_p1_${Date.now()}@example.com`,
        password: 'Password@123',
        mobileNumber: `+919871${Math.floor(100000 + Math.random() * 900000)}`,
        dateOfBirth: '2004-08-12',
        institutionType: 'college',
        schoolOrCollegeName: 'Delhi Technological University',
        classOrYear: '2nd Year B.Tech',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        interests: ['arduino', 'circuit_design', 'ros_robotics'],
        acceptedTerms: true,
      });

    expect(studentRes.status).toBe(201);
    studentToken = studentRes.body.data.tokens.accessToken;
    studentUserId = studentRes.body.data.user.id;
    studentIdNumber = studentRes.body.data.studentId;

    // Register Admin user for testing
    const adminEmail = `admin_p1_${Date.now()}@example.com`;
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Vikramaditya Admin',
        email: adminEmail,
        password: 'AdminPassword@123',
        mobileNumber: `+919872${Math.floor(100000 + Math.random() * 900000)}`,
        dateOfBirth: '1992-04-10',
        institutionType: 'university',
        schoolOrCollegeName: 'RoboVerse HQ Admin Center',
        classOrYear: 'Lead Operations',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        interests: ['all'],
        acceptedTerms: true,
      });

    expect(adminRes.status).toBe(201);
    adminUserId = adminRes.body.data.user.id;

    // Promote to ADMIN in inMemoryDb
    const user = inMemoryDb.users.get(adminUserId);
    user.role = UserRole.ADMIN;
    inMemoryDb.users.set(adminUserId, user);

    // Login as admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: adminEmail,
        password: 'AdminPassword@123',
      });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.tokens.accessToken;
  });

  // ==========================================
  // 1. Production Server Skeleton & Health Checks
  // ==========================================
  describe('1. Production Server Skeleton & Health Checks', () => {
    it('should return 200 and healthy status with memory, MongoDB, and Redis telemetry', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.app).toBe('RoboVerse Core API');
      expect(res.body.database.type).toBe('MongoDB');
      expect(res.body.redis.status).toBe('active');
      expect(res.body.memory).toBeDefined();
    });

    it('should serve Swagger OpenAPI documentation', async () => {
      const res = await request(app).get('/api/docs.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.0');
      expect(res.body.info.title).toContain('RoboVerse');
    });

    it('should include rate limiting security headers', async () => {
      const res = await request(app).get('/api/v1/plans');
      expect(res.status).toBe(200);
      expect(res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit']).toBeDefined();
    });
  });

  // ==========================================
  // 2. MongoDB Mongoose Models & Schemas
  // ==========================================
  describe('2. MongoDB Mongoose Models & Schemas', () => {
    it('should have Mongoose schemas compiled and accessible', () => {
      expect(UserModel.modelName).toBe('User');
      expect(StudentIDModel.modelName).toBe('StudentID');
      expect(ShopModel.modelName).toBe('Shop');
      expect(ComponentDefModel.modelName).toBe('ComponentDef');
      expect(SampleProjectModel.modelName).toBe('SampleProject');
      expect(AuditLogModel.modelName).toBe('AuditLog');
    });

    it('should inspect health check status from mongoose connection helper', () => {
      const status = getMongoHealthStatus();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('readyState');
      expect(status).toHaveProperty('host');
      expect(status).toHaveProperty('dbName');
    });
  });

  // ==========================================
  // 3. Auth, Role-Based Redirect & Student ID
  // ==========================================
  describe('3. Auth, Role-Based Redirect & Student ID', () => {
    it('should enforce parental consent for students under 18', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Minor Student',
          email: `minor_${Date.now()}@example.com`,
          password: 'Password@123',
          mobileNumber: `+919873${Math.floor(100000 + Math.random() * 900000)}`,
          dateOfBirth: '2012-01-01', // 14 years old
          institutionType: 'school',
          schoolOrCollegeName: 'Delhi Public School',
          classOrYear: 'Class 8',
          city: 'Delhi',
          state: 'Delhi',
          interests: ['arduino'],
          acceptedTerms: true,
          parentalConsentGiven: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('PARENTAL_CONSENT_REQUIRED');
    });

    it('should generate a unique Student ID (e.g. RV-2026-XXXXXX) with QR Card', async () => {
      expect(studentIdNumber).toMatch(/^RV-2026-\d{6}$/);
    });

    it('should return role-based redirect path in login response', async () => {
      const user = inMemoryDb.users.get(studentUserId);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: user.email,
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.redirectTo).toBe('/dashboard');
    });

    it('should return /admin redirect path for admin user', async () => {
      const admin = inMemoryDb.users.get(adminUserId);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: admin.email,
          password: 'AdminPassword@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.redirectTo).toBe('/admin');
    });

    it('should query role redirect path via /api/v1/auth/redirect-path endpoint', async () => {
      const resStudent = await request(app).get('/api/v1/auth/redirect-path?role=FREE_STUDENT');
      expect(resStudent.status).toBe(200);
      expect(resStudent.body.data.redirectTo).toBe('/dashboard');

      const resTeacher = await request(app).get('/api/v1/auth/redirect-path?role=MENTOR_TEACHER');
      expect(resTeacher.status).toBe(200);
      expect(resTeacher.body.data.redirectTo).toBe('/teacher');

      const resAdmin = await request(app).get('/api/v1/auth/redirect-path?role=ADMIN');
      expect(resAdmin.status).toBe(200);
      expect(resAdmin.body.data.redirectTo).toBe('/admin');
    });
  });

  // ==========================================
  // 4. Admin Authentication with 2FA & Audit Logs
  // ==========================================
  describe('4. Admin Authentication with 2FA & Audit Logs', () => {
    it('should reject non-admin students from /api/v1/admin/auth/login', async () => {
      const student = inMemoryDb.users.get(studentUserId);
      const res = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: student.email,
          password: 'Password@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_ADMIN_CREDENTIALS');
    });

    it('should authenticate admin via /api/v1/admin/auth/login', async () => {
      const admin = inMemoryDb.users.get(adminUserId);
      const res = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: admin.email,
          password: 'AdminPassword@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe(UserRole.ADMIN);
      expect(res.body.data.redirectTo).toBe('/admin');
    });

    it('should setup 2FA TOTP and generate QR code and backup codes for Admin', async () => {
      const res = await request(app)
        .post('/api/v1/admin/auth/2fa/setup')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.secret).toBeDefined();
      expect(res.body.data.otpAuthUrl).toContain('otpauth://totp/RoboVerse');
      expect(res.body.data.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(res.body.data.backupCodes.length).toBe(6);
    });

    it('should record and query audit logs of admin activities', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs).toBeDefined();
      expect(res.body.data.logs.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // 5. Plans, Razorpay & Dynamic UPI QR Codes
  // ==========================================
  describe('5. Plans, Razorpay & Dynamic UPI QR Codes', () => {
    it('should list all 4 plans with 18% GST breakdown', async () => {
      const res = await request(app).get('/api/v1/plans');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4); // FREE, PLUS, PRO, INSTITUTION
      const proPlan = res.body.data.find((p: any) => p.tier === 'PRO');
      expect(proPlan).toBeDefined();
      expect(proPlan.pricing[0].priceInrInclusiveGst).toBe(999);
    });

    it('should generate a Dynamic UPI QR Code with 15-minute countdown and single-use timer', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions/create-qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          planTier: PlanTier.PLUS,
          billingCycle: BillingCycle.MONTHLY,
          customerState: 'Delhi',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.qrCodeId).toMatch(/^qr_/);
      expect(res.body.data.qrImageUrl).toMatch(/^data:image\/png;base64,/);
      expect(res.body.data.upiIntentString).toContain('upi://pay?');
      expect(res.body.data.amountInr).toBe(299);
      expect(res.body.data.expiresInSeconds).toBe(900); // 15 mins
      expect(res.body.data.taxBreakdown.gstRatePercentage).toBe(18);
    });

    it('should poll dynamic UPI QR status', async () => {
      // 1. Create QR
      const createRes = await request(app)
        .post('/api/v1/subscriptions/create-qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          planTier: PlanTier.PRO,
          billingCycle: BillingCycle.MONTHLY,
          customerState: 'Delhi',
        });

      const qrCodeId = createRes.body.data.qrCodeId;

      // 2. Poll QR status
      const statusRes = await request(app)
        .get(`/api/v1/subscriptions/qr-status/${qrCodeId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe('PENDING');
      expect(statusRes.body.data.amountInr).toBe(999);
    });

    it('should handle qr_code.credited webhook and activate student subscription', async () => {
      // 1. Create QR for student
      const createRes = await request(app)
        .post('/api/v1/subscriptions/create-qr')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          planTier: PlanTier.PRO,
          billingCycle: BillingCycle.MONTHLY,
          customerState: 'Delhi',
        });

      const qrCodeId = createRes.body.data.qrCodeId;

      // 2. Dispatch simulated webhook event
      const webhookRes = await request(app)
        .post('/api/v1/subscriptions/webhook')
        .set('x-razorpay-signature', 'mock_webhook_sig_123')
        .send({
          event: 'qr_code.credited',
          payload: {
            qr_code: {
              entity: {
                id: qrCodeId,
              },
            },
            payment: {
              entity: {
                id: `pay_qr_live_${Date.now()}`,
                amount: 99900,
              },
            },
          },
        });

      expect(webhookRes.status).toBe(200);

      // 3. Verify student user upgraded to PRO_STUDENT
      const updatedUser = inMemoryDb.users.get(studentUserId);
      expect(updatedUser.role).toBe(UserRole.PRO_STUDENT);

      // 4. Verify QR status is now CREDITED
      const pollRes = await request(app)
        .get(`/api/v1/subscriptions/qr-status/${qrCodeId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(pollRes.status).toBe(200);
      expect(pollRes.body.data.status).toBe('CREDITED');
      expect(pollRes.body.data.subscriptionId).toBeDefined();
    });

    it('should support 7-day 100% refund policy cancellation', async () => {
      const cancelRes = await request(app)
        .post('/api/v1/subscriptions/cancel')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.refundEligible).toBe(true);
      expect(cancelRes.body.data.refundAmount).toContain('100% Full Refund');
    });
  });

  // ==========================================
  // 6. Usage Limits Enforcement
  // ==========================================
  describe('6. Usage Limits Enforcement', () => {
    it('should return today usage meter with tier limits', async () => {
      const res = await request(app)
        .get('/api/v1/usage/today')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('rituuMessagesCount');
      expect(res.body.data).toHaveProperty('photoAnalysesCount');
      expect(res.body.data).toHaveProperty('limits');
      expect(res.body.data.limits).toHaveProperty('dailyTextMessageLimit');
      expect(res.body.data.limits).toHaveProperty('dailyPhotoAnalysisLimit');
    });
  });
});
