import request from 'supertest';
import { app } from '../src/app';
import { generateAuthTokens } from '../src/lib/jwt';
import { inMemoryDb } from '../src/lib/db';
import { UserRole } from '@roboverse/shared';

describe('Simulator, Components & Starters API', () => {
  let authToken: string;
  const testUserId = 'test_sim_user_001';

  beforeAll(() => {
    inMemoryDb.users.set(testUserId, {
      id: testUserId,
      email: 'sim.student@example.com',
      role: UserRole.PRO_STUDENT,
    });
    inMemoryDb.studentIds.set(testUserId, {
      studentId: 'RV-2026-999001',
    });
    const tokens = generateAuthTokens({
      userId: testUserId,
      email: 'sim.student@example.com',
      role: UserRole.PRO_STUDENT,
      studentId: 'RV-2026-999001',
      planId: 'plan_pro',
    });
    authToken = tokens.accessToken;
  });

  it('should list all ~46 components in the library', async () => {
    const res = await request(app).get('/api/v1/simulator/components');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(40);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('pins');
  });

  it('should filter components by category (e.g. SENSOR)', async () => {
    const res = await request(app).get('/api/v1/simulator/components?category=SENSOR');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((c: any) => c.category === 'SENSOR')).toBe(true);
  });

  it('should filter free tier components', async () => {
    const res = await request(app).get('/api/v1/simulator/components?freeOnly=true');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((c: any) => c.isFreeTier === true)).toBe(true);
  });

  it('should retrieve a single component definition with pinout and default properties', async () => {
    const res = await request(app).get('/api/v1/simulator/components/comp_arduino_uno');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Arduino Uno R3');
    expect(res.body.data.pins.length).toBeGreaterThan(10);
  });

  it('should list pre-built starter assemblies (Blink, Servo, Radar)', async () => {
    const res = await request(app).get('/api/v1/simulator/starters');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(3);
    expect(res.body.data.some((s: any) => s.id === 'starter_arduino_blink')).toBe(true);
  });

  it('should save, retrieve, update, and delete a circuit project', async () => {
    // 1. Create Project
    const createRes = await request(app)
      .post('/api/v1/simulator/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'My Smart Dustbin Project',
        description: 'Automated lid opener with ultrasonic sensor and SG90 servo.',
        components: [
          { id: 'uno_1', typeId: 'comp_arduino_uno' },
          { id: 'srv_1', typeId: 'comp_servo_sg90' },
        ],
        wires: [
          { id: 'w1', color: '#FF8A1F', fromComponentId: 'uno_1', fromPinId: 'pin_d9_pwm', toComponentId: 'srv_1', toPinId: 'pwm' },
        ],
        codeSnippet: '// Smart dustbin code',
        isPublic: false,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const projectId = createRes.body.data.id;

    // 2. Retrieve Project
    const getRes = await request(app).get(`/api/v1/simulator/projects/${projectId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.title).toBe('My Smart Dustbin Project');
    expect(getRes.body.data.components.length).toBe(2);

    // 3. Update Project
    const updateRes = await request(app)
      .put(`/api/v1/simulator/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'My Smart Dustbin Project v2',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('My Smart Dustbin Project v2');

    // 4. Delete Project
    const deleteRes = await request(app)
      .delete(`/api/v1/simulator/projects/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(deleteRes.status).toBe(200);

    // 5. Verify 404 after deletion
    const verifyRes = await request(app).get(`/api/v1/simulator/projects/${projectId}`);
    expect(verifyRes.status).toBe(404);
  });

  it('should validate circuit wiring and detect errors via diagnostic engine', async () => {
    const res = await request(app)
      .post('/api/v1/simulator/validate')
      .send({
        components: [
          {
            id: 'bat1',
            typeId: 'comp_battery_9v',
            pins: [
              { id: 'pos', name: 'VCC', type: 'POWER_VCC' },
              { id: 'neg', name: 'GND', type: 'GROUND' },
            ],
          },
        ],
        wires: [
          // Direct short circuit from pos to neg
          { id: 'w_short', color: '#FF3333', fromComponentId: 'bat1', fromPinId: 'pos', toComponentId: 'bat1', toPinId: 'neg' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasErrors).toBe(true);
    expect(res.body.data.criticalErrorCount).toBeGreaterThanOrEqual(1);
  });
});
