import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from '../config/env';

export class RazorpayService {
  private client: Razorpay | null = null;
  private isLiveCredentials = false;

  constructor() {
    if (
      ENV.RAZORPAY_KEY_ID &&
      ENV.RAZORPAY_KEY_SECRET &&
      !ENV.RAZORPAY_KEY_ID.toLowerCase().includes('mock')
    ) {
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

    if (ENV.NODE_ENV === 'test') {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return { orderId: mockOrderId, amount: amountInPaise, currency: 'INR', keyId: ENV.RAZORPAY_KEY_ID };
    }
    throw new Error('Razorpay is not configured for production.');
  }

  public async createDynamicQrCode(params: {
    amountInr: number;
    description: string;
    notes?: Record<string, string>;
    expiryMinutes?: number;
  }): Promise<{
    qrCodeId: string;
    qrImageUrl: string;
    upiIntentString: string;
    amountInr: number;
    expiresAt: Date;
    expiresInSeconds: number;
  }> {
    const amountInPaise = Math.round(params.amountInr * 100);
    const expirySec = (params.expiryMinutes || 15) * 60;
    const expiresAt = new Date(Date.now() + expirySec * 1000);
    if (!this.isLiveCredentials) {
      if (ENV.NODE_ENV !== 'test') {
        throw new Error('Razorpay QR payments are not configured for production.');
      }
      const qrCodeId = `qr_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const upiIntentString = `upi://pay?pa=roboverse@icici&pn=RoboVerse%20Technologies&am=${params.amountInr.toFixed(2)}&cu=INR&tn=${encodeURIComponent(params.description)}&tr=${qrCodeId}`;
      const QRCode = require('qrcode');
      const qrImageUrl = await QRCode.toDataURL(upiIntentString, { errorCorrectionLevel: 'M', width: 320, margin: 2 });
      return { qrCodeId, qrImageUrl, upiIntentString, amountInr: params.amountInr, expiresAt, expiresInSeconds: expirySec };
    }

    const response = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${ENV.RAZORPAY_KEY_ID}:${ENV.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify({
        type: 'upi_qr',
        name: params.description.slice(0, 40),
        usage: 'single_use',
        fixed_amount: true,
        payment_amount: amountInPaise,
        description: params.description,
        close_by: Math.floor(expiresAt.getTime() / 1000),
        notes: params.notes,
      }),
    });
    if (!response.ok) throw new Error('Razorpay could not create the QR payment.');
    const qrData = await response.json();
    if (!qrData.id || !qrData.image_url) throw new Error('Razorpay returned incomplete QR details.');

    return {
      qrCodeId: qrData.id,
      qrImageUrl: qrData.image_url,
      upiIntentString: qrData.qr_code_url || '',
      amountInr: params.amountInr,
      expiresAt,
      expiresInSeconds: expirySec,
    };
  }

  public verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (!params.orderId || !params.paymentId || !params.signature) return false;
    if (!this.isLiveCredentials && ENV.NODE_ENV === 'test' && params.signature.startsWith('mock_')) {
      return true; // allow test suite mock signatures
    }

    const payload = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const supplied = Buffer.from(params.signature || '', 'hex');
    return supplied.length === expected.length && crypto.timingSafeEqual(expected, supplied);
  }

  public verifyWebhookSignature(params: {
    rawBody: string;
    signature: string;
  }): boolean {
    if (!params.rawBody || !params.signature) return false;
    if (!this.isLiveCredentials && ENV.NODE_ENV === 'test' && params.signature.startsWith('mock_webhook_sig')) {
      return true;
    }

    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_WEBHOOK_SECRET)
      .update(params.rawBody)
      .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const supplied = Buffer.from(params.signature || '', 'hex');
    return supplied.length === expected.length && crypto.timingSafeEqual(expected, supplied);
  }
}

export const razorpayService = new RazorpayService();
