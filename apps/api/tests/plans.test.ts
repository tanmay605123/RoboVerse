import request from 'supertest';
import { app } from '../src/app';

describe('Plans & Pricing API', () => {
  it('should list all 4 tiers (FREE, PLUS, PRO, INSTITUTION) with 18% GST inclusive prices', async () => {
    const res = await request(app).get('/api/v1/plans');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(4);

    const plusPlan = res.body.data.find((p: any) => p.tier === 'PLUS');
    expect(plusPlan).toBeDefined();
    expect(plusPlan.pricing.some((pr: any) => pr.priceInrInclusiveGst === 299)).toBe(true);

    const proPlan = res.body.data.find((p: any) => p.tier === 'PRO');
    expect(proPlan).toBeDefined();
    expect(proPlan.pricing.some((pr: any) => pr.priceInrInclusiveGst === 999)).toBe(true);
    expect(proPlan.features.liveClassesMonthlyCount).toBe(8);
  });

  it('should retrieve a single plan by ID', async () => {
    const res = await request(app).get('/api/v1/plans/plan_pro');

    expect(res.status).toBe(200);
    expect(res.body.data.tier).toBe('PRO');
    expect(res.body.data.features.machineLearningTrack).toBe(true);
  });
});
