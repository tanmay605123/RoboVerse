import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from '../config/env';

export class RazorpayService {
  private client: Razorpay | null = null;
  private isLiveCredentials = false;

  constructor() {
    if (ENV.RAZORPAY_KEY_ID && !ENV.RAZORPAY_KEY_ID.includes('Mock')) {
      try {
        this.client = new Razorpay({
          key_id: ENV.RAZORPAY_KEY_ID,
          key_secret: ENV.RAZORPAY_KEY_SECRET,
        });
        this.isLiveCredentials = true;
      } catch (err) {
        console.warn('⚠️ Razorpay client initialization error. Using mock mode.');
      }
    }
  }

  public async createOrder(params: {
    amountInr: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    const amountInPaise = Math.round(params.amountInr * 100);

    if (this.isLiveCredentials && this.client) {
      const order = await this.client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: params.receipt,
        notes: params.notes,
      });

      return {
        orderId: order.id,
        amount: order.amount as number,
        currency: 'INR',
        keyId: ENV.RAZORPAY_KEY_ID,
      };
    }

    // High fidelity mock order generator for testing/sandbox
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
    };
  }

  public verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!this.isLiveCredentials && params.signature.startsWith('mock_')) {
      return true; // allow test suite mock signatures
    }

    const payload = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    return expectedSignature === params.signature;
  }

  public verifyWebhookSignature(params: {
    rawBody: string;
    signature: string;
  }): boolean {
    if (!this.isLiveCredentials && params.signature.startsWith('mock_webhook_sig')) {
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_WEBHOOK_SECRET)
      .update(params.rawBody)
      .digest('hex');

    return expectedSignature === params.signature;
  }
}

export const razorpayService = new RazorpayService();
