import { Router, Request, Response } from 'express';
import { inMemoryDb } from '../../lib/db';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { razorpayService } from '../../lib/razorpay';
import { generateGstInvoice } from '../../lib/gst';
import { PlanTier, UserRole, BillingCycle, PaymentMethodType } from '@roboverse/shared';

const router = Router();

/**
 * @openapi
 * /api/v1/store/products:
 *   get:
 *     summary: List TechSavyyy store components and kits
 *     tags: [TechSavyyy Store]
 */
router.get('/products', optionalAuth, (req: Request, res: Response) => {
  const { category, search, sort } = req.query;

  let products = Array.from(inMemoryDb.products.values());

  if (category && category !== 'ALL') {
    products = products.filter(
      (p) => p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (search) {
    const q = (search as string).toLowerCase();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    products.sort((a, b) => a.priceInr - b.priceInr);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.priceInr - a.priceInr);
  } else {
    // Default popularity / rating
    products.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
  }

  return res.status(200).json({
    success: true,
    data: {
      total: products.length,
      products,
    },
  });
});

/**
 * @openapi
 * /api/v1/store/products/{slugOrId}:
 *   get:
 *     summary: Retrieve product details by slug or ID
 *     tags: [TechSavyyy Store]
 */
router.get('/products/:slugOrId', optionalAuth, (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const products = Array.from(inMemoryDb.products.values());
  const product = products.find((p) => p.id === slugOrId || p.slug === slugOrId);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found in TechSavyyy store' },
    });
  }

  return res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * @openapi
 * /api/v1/store/checkout:
 *   post:
 *     summary: Initiate store order checkout with Razorpay and plan discount
 *     tags: [TechSavyyy Store]
 *     security:
 *       - bearerAuth: []
 */
router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user!.userId;
    const profile = inMemoryDb.profiles.get(userId);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_CART', message: 'Cart must contain at least one item' },
      });
    }

    // Determine plan discount: 0% Free, 5% Plus, 10% Pro
    const userRole = req.user!.role;
    const planTier: PlanTier =
      userRole === UserRole.PRO_STUDENT
        ? PlanTier.PRO
        : userRole === UserRole.PLUS_STUDENT
        ? PlanTier.PLUS
        : PlanTier.FREE;

    const discountPct = planTier === PlanTier.PRO ? 10 : planTier === PlanTier.PLUS ? 5 : 0;

    // Calculate subtotal
    let subtotalInr = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const prod = inMemoryDb.products.get(item.productId);
      const unitPrice = prod ? prod.priceInr : item.unitPrice || 100;
      const title = prod ? prod.title : item.title || 'Component';
      const qty = item.quantity || 1;
      const totalItemPrice = unitPrice * qty;

      subtotalInr += totalItemPrice;
      orderItems.push({
        productId: item.productId,
        title,
        quantity: qty,
        unitPriceInr: unitPrice,
        totalPriceInr: totalItemPrice,
      });
    }

    const discountAmountInr = Math.round((subtotalInr * discountPct) / 100);
    const finalAmountInr = subtotalInr - discountAmountInr;

    // In India, consumer retail prices INCLUDE 18% GST
    const taxableAmount = Number((finalAmountInr / 1.18).toFixed(2));
    const gstTotal = Number((finalAmountInr - taxableAmount).toFixed(2));
    const isInterState = shippingAddress?.state && shippingAddress.state.toLowerCase() !== 'delhi';

    const taxBreakdown = {
      subtotalInr,
      discountAmountInr,
      discountPct,
      taxableAmountInr: taxableAmount,
      gstRatePct: 18,
      cgstInr: isInterState ? 0 : Number((gstTotal / 2).toFixed(2)),
      sgstInr: isInterState ? 0 : Number((gstTotal / 2).toFixed(2)),
      igstInr: isInterState ? gstTotal : 0,
      totalGstInr: gstTotal,
      finalAmountInr,
    };

    // Create Razorpay Order
    const receiptId = `rcpt_${Date.now()}`;
    const rzpOrder = await razorpayService.createOrder({
      amountInr: finalAmountInr,
      receipt: receiptId,
      notes: {
        userId,
        orderType: 'TECHSAVYYY_STORE',
      },
    });

    const pendingOrder = {
      orderId: `RV-ORD-${Date.now()}`,
      userId,
      customerName: profile?.fullName || 'Student Builder',
      customerEmail: inMemoryDb.users.get(userId)?.email || 'student@example.com',
      razorpayOrderId: rzpOrder.orderId,
      items: orderItems,
      taxBreakdown,
      shippingAddress: shippingAddress || {
        addressLine1: 'Hostel 3, Room 204',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110016',
      },
      status: 'AWAITING_PAYMENT',
      createdAt: new Date().toISOString(),
    };

    inMemoryDb.orders.set(rzpOrder.orderId, pendingOrder);

    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.orderId,
        amountInr: finalAmountInr,
        currency: 'INR',
        taxBreakdown,
        studentPlan: planTier,
        discountAppliedPct: discountPct,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CHECKOUT_FAILED', message: error.message },
    });
  }
});

/**
 * @openapi
 * /api/v1/store/verify-order:
 *   post:
 *     summary: Verify Razorpay payment and issue GST invoice
 *     tags: [TechSavyyy Store]
 *     security:
 *       - bearerAuth: []
 */
router.post('/verify-order', requireAuth, async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user!.userId;

    const isValid = razorpayService.verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Razorpay payment signature verification failed' },
      });
    }

    const order = inMemoryDb.orders.get(razorpayOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order reference not found' },
      });
    }

    order.status = 'CONFIRMED';
    order.razorpayPaymentId = razorpayPaymentId;

    const studentRecord = inMemoryDb.studentIds.get(userId);

    // Generate Official GST Tax Invoice
    const invoice = generateGstInvoice({
      orderId: razorpayOrderId,
      userId,
      studentId: studentRecord?.studentId || 'RV-2026-GUEST',
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerState: order.shippingAddress.state,
      planName: 'TechSavyyy Robotics Components Kit',
      billingCycle: BillingCycle.MONTHLY,
      grossAmountInr: order.taxBreakdown.finalAmountInr,
      paymentMethod: PaymentMethodType.UPI,
      paymentId: razorpayPaymentId,
    });

    inMemoryDb.invoices.set(invoice.id, invoice);
    order.invoice = invoice;
    inMemoryDb.orders.set(razorpayOrderId, order);

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.orderId,
        status: 'CONFIRMED',
        invoiceNumber: invoice.invoiceNumber,
        invoicePdfUrl: `/api/v1/subscriptions/invoices/${invoice.id}`,
        invoice,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ORDER_VERIFICATION_FAILED', message: error.message },
    });
  }
});

/**
 * @openapi
 * /api/v1/store/orders:
 *   get:
 *     summary: Retrieve user order history with GST invoices
 *     tags: [TechSavyyy Store]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userOrders = Array.from(inMemoryDb.orders.values()).filter((o) => o.userId === userId);

  return res.status(200).json({
    success: true,
    data: {
      orders: userOrders,
    },
  });
});

export default router;
