import request from 'supertest';
import { app } from '../src/app';

describe('Auth & Student ID API', () => {
  let createdUserToken = '';
  let generatedStudentId = '';

  it('should reject registration if under-18 student has no parental consent', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Young Builder',
        email: 'young@example.com',
        password: 'Password#2026',
        mobileNumber: '+919876543299',
        dateOfBirth: '2012-01-01', // age 14
        parentalConsentGiven: false,
        institutionType: 'school',
        schoolOrCollegeName: 'Delhi Public School',
        classOrYear: 'Class 8',
        city: 'New Delhi',
        state: 'Delhi',
        interests: ['arduino', 'circuit_design'],
        acceptedTerms: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PARENTAL_CONSENT_REQUIRED');
  });

  it('should successfully register student and generate unique Student ID + QR Card', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Tanmay Sharma',
        email: 'tanmay.sharma@example.com',
        password: 'RoboSpark#2026',
        mobileNumber: '+919876543211',
        dateOfBirth: '2005-04-12',
        institutionType: 'college',
        schoolOrCollegeName: 'IIT Delhi',
        classOrYear: 'B.Tech Mechanical 2nd Year',
        city: 'New Delhi',
        state: 'Delhi',
        interests: ['arduino', 'machine_learning', 'drones'],
        acceptedTerms: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toMatch(/^RV-2026-\d{6}$/);
    expect(res.body.data.studentIdCard.qrCodeDataUrl).toContain('data:image/png;base64');
    expect(res.body.data.tokens.accessToken).toBeDefined();

    createdUserToken = res.body.data.tokens.accessToken;
    generatedStudentId = res.body.data.studentId;
  });

  it('should login with Email and Password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'tanmay.sharma@example.com',
        password: 'RoboSpark#2026',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toBe(generatedStudentId);
  });

  it('should login with Student ID and Password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: generatedStudentId,
        password: 'RoboSpark#2026',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('tanmay.sharma@example.com');
  });

  it('should send and verify Mobile OTP', async () => {
    const otpReq = await request(app)
      .post('/api/v1/auth/otp/send')
      .send({
        mobileNumber: '+919988776655',
        purpose: 'login',
      });

    expect(otpReq.status).toBe(200);
    const debugOtp = otpReq.body.data.debugOtp || '123456';

    const verifyReq = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({
        mobileNumber: '+919988776655',
        otp: debugOtp,
        purpose: 'login',
      });

    expect(verifyReq.status).toBe(200);
    expect(verifyReq.body.success).toBe(true);
    expect(verifyReq.body.data.studentId).toMatch(/^RV-2026-\d{6}$/);
  });

  it('should fetch authenticated /me with Student ID and today usage meter', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${createdUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.studentIdCard.studentId).toBe(generatedStudentId);
    expect(res.body.data.todayUsage.textMessagesLimit).toBe(15); // Free plan default
  });

  it('should verify Student ID authenticity via public verification endpoint', async () => {
    const res = await request(app)
      .get(`/api/v1/students/verify-id/${generatedStudentId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.verified).toBe(true);
    expect(res.body.data.fullName).toBe('Tanmay Sharma');
  });
});
