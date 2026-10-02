import request from 'supertest';
import { app } from '../src/app';

describe('Phase 5: Hackathons Hub, Component Shops & TechSavyyy Store API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Register a test student
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Phase5 Student',
        email: `phase5_student_${Date.now()}@example.com`,
        password: 'Password@123',
        mobileNumber: `+919876${Math.floor(100000 + Math.random() * 900000)}`,
        dateOfBirth: '2004-02-10',
        institutionType: 'college',
        schoolOrCollegeName: 'Delhi Robotics Lab',
        classOrYear: '2nd Year',
        city: 'Delhi',
        state: 'Delhi',
        interests: ['arduino', 'drones'],
        acceptedTerms: true,
      });

    expect(regRes.status).toBe(201);
    authToken = regRes.body.data.tokens.accessToken;
  });

  describe('1. Hackathons Hub API', () => {
    it('should list all upcoming robotics hackathons', async () => {
      const res = await request(app).get('/api/v1/hackathons');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
      expect(res.body.data.hackathons[0].title).toBeDefined();
    });

    it('should filter hackathons by city (e.g. Delhi)', async () => {
      const res = await request(app).get('/api/v1/hackathons?city=Delhi');

      expect(res.status).toBe(200);
      expect(res.body.data.hackathons.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.hackathons.every((h: any) => h.city.toLowerCase() === 'delhi')).toBe(true);
    });

    it('should allow student to join team matching pool', async () => {
      const res = await request(app)
        .post('/api/v1/hackathons/evt_nat_rover_2026/team-matching')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          skills: ['ROS 2', 'C++', 'Computer Vision'],
          preferredRole: 'Perception & Navigation Lead',
          message: 'Ready to build an autonomous rover for the national finals!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('MATCHING_POOL_JOINED');
      expect(res.body.data.entry.preferredRole).toBe('Perception & Navigation Lead');
    });
  });

  describe('2. Nearby Component Shops Finder API', () => {
    it('should return nearby electronics shops with calculated distance in km', async () => {
      // Query near Connaught Place, Delhi (28.6315, 77.2167)
      const res = await request(app).get('/api/v1/shops/nearby?lat=28.6315&lng=77.2167&radiusKm=20');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.shops.length).toBeGreaterThanOrEqual(1);
      const firstShop = res.body.data.shops[0];
      expect(firstShop.distanceKm).toBeDefined();
      expect(typeof firstShop.distanceKm).toBe('number');
      expect(firstShop.directionsUrl).toContain('https://www.google.com/maps/dir/?api=1&destination=');
    });

    it('should filter shops stocking specific components (e.g. Arduino)', async () => {
      const res = await request(app).get('/api/v1/shops/nearby?component=Arduino');

      expect(res.status).toBe(200);
      expect(res.body.data.shops.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.shops.some((s: any) => s.name.includes('ElectroHub'))).toBe(true);
    });
  });

  describe('3. TechSavyyy Store E-Commerce API', () => {
    it('should list products and filter by category', async () => {
      const res = await request(app).get('/api/v1/store/products?category=ROBOT_KITS');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.products[0].priceInr).toBeGreaterThan(0);
    });

    it('should create Razorpay checkout order with 18% GST breakdown and plan discount', async () => {
      const res = await request(app)
        .post('/api/v1/store/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            { productId: 'prod_starter_kit', quantity: 1, unitPrice: 1299 },
            { productId: 'prod_chassis_4wd', quantity: 1, unitPrice: 649 },
          ],
          shippingAddress: {
            addressLine1: 'Room 302, Hall of Residence',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110016',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.razorpayOrderId).toMatch(/^order_mock_/);
      expect(res.body.data.taxBreakdown.gstRatePct).toBe(18);
      expect(res.body.data.taxBreakdown.cgstInr).toBeGreaterThan(0);
      expect(res.body.data.taxBreakdown.sgstInr).toBeGreaterThan(0);
    });

    it('should verify payment signature and issue official GST Tax Invoice', async () => {
      // 1. Checkout
      const checkoutRes = await request(app)
        .post('/api/v1/store/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: 'prod_esp32_devkit', quantity: 2, unitPrice: 349 }],
        });

      const orderId = checkoutRes.body.data.razorpayOrderId;

      // 2. Verify Order Payment
      const verifyRes = await request(app)
        .post('/api/v1/store/verify-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_signature_valid_for_dev_mode',
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.status).toBe('CONFIRMED');
      expect(verifyRes.body.data.invoiceNumber).toMatch(/^RV-INV-2026-\d{5}$/);
      expect(verifyRes.body.data.invoicePdfUrl).toContain('/api/v1/subscriptions/invoices/');
    });
  });
});
