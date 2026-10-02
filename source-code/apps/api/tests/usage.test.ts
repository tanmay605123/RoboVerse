import request from 'supertest';
import { app } from '../src/app';

describe('Usage Limits & Paywall Enforcement API', () => {
  let freeUserToken = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Ananya Gupta',
        email: 'ananya.gupta@example.com',
        password: 'RoboSpark#2026',
        mobileNumber: '+919876543233',
        dateOfBirth: '2006-11-10',
        institutionType: 'school',
        schoolOrCollegeName: 'Modern School Barakhamba',
        classOrYear: 'Class 12',
        city: 'New Delhi',
        state: 'Delhi',
        interests: ['arduino', 'circuit_design'],
        acceptedTerms: true,
      });

    freeUserToken = res.body.data.tokens.accessToken;
  });

  it('should track daily Rituu text message consumption', async () => {
    const res = await request(app)
      .post('/api/v1/usage/track')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({
        action: 'RITUU_TEXT',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.used).toBe(1);
    expect(res.body.data.remaining).toBe(14); // 15 - 1
  });

  it('should enforce photo analysis limit for free tier (limit = 3/day)', async () => {
    // Consume 3 photo analyses
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/usage/track')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ action: 'RITUU_PHOTO' });
    }

    // 4th photo analysis must be rejected with 429 and upgrade prompt
    const res = await request(app)
      .post('/api/v1/usage/track')
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({ action: 'RITUU_PHOTO' });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PLAN_QUOTA_EXCEEDED');
    expect(res.body.error.upgradePrompt.recommendedPlan).toBe('PLUS');
  });
});
