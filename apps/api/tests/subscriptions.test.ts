import request from 'supertest';
import { app } from '../src/app';

describe('Razorpay Subscriptions & GST Invoicing API', () => {
  let authToken = '';

  beforeAll(async () => {
    // Register a test user
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@example.com',
        password: 'RoboSpark#2026',
        mobileNumber: '+919876543222',
        dateOfBirth: '2004-09-20',
        institutionType: 'college',
        schoolOrCollegeName: 'COEP Pune',
        classOrYear: 'B.Tech Robotics 3rd Year',
        city: 'Pune',
        state: 'Maharashtra',
        interests: ['ros_robotics', 'machine_learning'],
        acceptedTerms: true,
      });

    authToken = res.body.data.tokens.accessToken;
  });

  it('should create Razorpay order with 18% GST breakdown and coupon discount', async () => {
    const res = await request(app)
      .post('/api/v1/subscriptions/create-order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        planTier: 'PRO',
        billingCycle: 'MONTHLY',
        couponCode: 'WELCOME100', // ₹100 off on ₹999 -> ₹899
        customerState: 'Maharashtra',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBeDefined();
    expect(res.body.data.originalAmountInr).toBe(999);
    expect(res.body.data.discountAmountInr).toBe(100);
    expect(res.body.data.amountInr).toBe(899);

    // Verify 18% GST calculation
    const tax = res.body.data.taxBreakdown;
    expect(tax.grossAmountInr).toBe(899);
    expect(tax.isInterState).toBe(true);
    expect(tax.igstAmountInr).toBeGreaterThan(0);
    expect(tax.baseAmountInr + tax.totalTaxAmountInr).toBeCloseTo(899, 1);
  });

  it('should verify payment signature, upgrade to PRO, and generate GST Invoice', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/v1/subscriptions/create-order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        planTier: 'PRO',
        billingCycle: 'MONTHLY',
        customerState: 'Delhi',
      });

    const orderId = orderRes.body.data.orderId;

    // 2. Verify signature
    const verifyRes = await request(app)
      .post('/api/v1/subscriptions/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        razorpayOrderId: orderId,
        razorpayPaymentId: 'pay_mock_test_12345',
        razorpaySignature: 'mock_sig_test_valid',
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.updatedRole).toBe('PRO_STUDENT');
    expect(verifyRes.body.data.invoice.invoiceNumber).toMatch(/^RV-INV-2026-\d{5}$/);
  });

  it('should allow 100% refund cancellation within 7 days of purchase', async () => {
    const res = await request(app)
      .post('/api/v1/subscriptions/cancel')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.refundEligible).toBe(true);
  });
});
