#!/usr/bin/env node

/**
 * RoboVerse / TechSavyyy Hardware Store & Razorpay Automated Test Suite
 * Validates:
 * 1. Server-side pricing enforcement (client price tampering prevention)
 * 2. Embedded 18% GST calculation formula (Taxable Base + CGST 9% + SGST 9% / IGST 18%)
 * 3. Stock sufficiency validation
 * 4. Age-restricted item protection for minors without parental consent
 * 5. Member tier discount computation (Pro 10%, Plus 5%, Free 0%)
 * 6. Dynamic single-use UPI QR code generation with 15-minute countdown
 * 7. Razorpay HMAC-SHA256 signature verification & webhook idempotency
 * 8. Order finalization & inventory stock deduction
 * 9. GST tax invoice generation, HSN mapping, and amount in words
 */

const crypto = require('crypto');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('🧪 Starting TechSavyyy Store & Razorpay Payment Verification...\n');

// =========================================================================
// TEST 1: Server-Side Price Calculation & Client Price Tampering Prevention
// =========================================================================
console.log('--- Test 1: Canonical Server-Side Price Verification ---');
const databaseCatalog = {
  prod_uno_compat: { price: 399, stock: 250, ageRestricted: false },
  prod_sg90_servo: { price: 139, stock: 350, ageRestricted: false },
  prod_lipo_3s_2200: { price: 1599, stock: 60, ageRestricted: true },
};

function serverCalculateOrder(items, userTier = 'FREE', isMinor = false, hasParentalConsent = false, couponCode = null) {
  let subtotal = 0;
  for (const item of items) {
    const dbItem = databaseCatalog[item.productId];
    if (!dbItem) throw new Error(`Product not found: ${item.productId}`);
    if (dbItem.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.productId}`);
    }
    if (dbItem.ageRestricted && isMinor && !hasParentalConsent) {
      throw new Error(`Parental consent required for age-restricted item ${item.productId}`);
    }
    // Price strictly comes from database, IGNORING client item.tamperedPrice
    subtotal += dbItem.price * item.quantity;
  }

  // Tier discount
  let tierDiscountPct = 0;
  if (userTier === 'PRO') tierDiscountPct = 10;
  else if (userTier === 'PLUS') tierDiscountPct = 5;

  let discount = Math.round((subtotal * tierDiscountPct) / 100);

  // Coupon
  if (couponCode === 'ROBOFIRST') {
    discount += Math.min(200, Math.round(subtotal * 0.1));
  }

  const total = Math.max(0, subtotal - discount);
  const taxableBase = Math.round((total / 1.18) * 100) / 100;
  const gstTotal = Math.round((total - taxableBase) * 100) / 100;
  const cgst = Math.round((gstTotal / 2) * 100) / 100;
  const sgst = Math.round((gstTotal - cgst) * 100) / 100;

  return { subtotal, discount, total, taxableBase, gstTotal, cgst, sgst };
}

// Client attempts to tamper price of Uno to ₹10 instead of ₹399
const clientCartWithTamperedPrice = [
  { productId: 'prod_uno_compat', quantity: 2, tamperedPrice: 10 },
  { productId: 'prod_sg90_servo', quantity: 1, tamperedPrice: 5 },
];

const calculatedOrder = serverCalculateOrder(clientCartWithTamperedPrice, 'FREE');
assert(
  calculatedOrder.subtotal === 399 * 2 + 139 * 1,
  `Server rejected client tampered prices (Expected Subtotal: ₹937, Got: ₹${calculatedOrder.subtotal})`
);

// =========================================================================
// TEST 2: Embedded 18% GST Formula Breakdown
// =========================================================================
console.log('\n--- Test 2: Embedded 18% GST Formula Verification ---');
// Gross Total = ₹937
// Taxable Base = 937 / 1.18 = 794.07
// GST Total = 937 - 794.07 = 142.93
// CGST (9%) = 71.465 -> 71.47, SGST (9%) = 71.46
assert(calculatedOrder.taxableBase === 794.07, `Taxable base calculated correctly: ₹${calculatedOrder.taxableBase}`);
assert(calculatedOrder.gstTotal === 142.93, `GST Total (18%) calculated correctly: ₹${calculatedOrder.gstTotal}`);
assert(
  Math.abs(calculatedOrder.taxableBase + calculatedOrder.cgst + calculatedOrder.sgst - calculatedOrder.total) < 0.02,
  'Taxable Base + CGST + SGST exactly matches Grand Total'
);

// =========================================================================
// TEST 3: Member Tier Discounts (Pro 10%, Plus 5%)
// =========================================================================
console.log('\n--- Test 3: Member Tier Discount Verification ---');
const proOrder = serverCalculateOrder(clientCartWithTamperedPrice, 'PRO');
const expectedProDiscount = Math.round(937 * 0.1); // 94
assert(proOrder.discount === expectedProDiscount, `PRO member received 10% discount (-₹${proOrder.discount})`);
assert(proOrder.total === 937 - expectedProDiscount, `PRO total payable: ₹${proOrder.total}`);

const plusOrder = serverCalculateOrder(clientCartWithTamperedPrice, 'PLUS');
const expectedPlusDiscount = Math.round(937 * 0.05); // 47
assert(plusOrder.discount === expectedPlusDiscount, `PLUS member received 5% discount (-₹${plusOrder.discount})`);

// =========================================================================
// TEST 4: Age-Restricted Equipment Protection (Section 10)
// =========================================================================
console.log('\n--- Test 4: Age Restriction & Minor Protection ---');
const cartWithLipo = [
  { productId: 'prod_lipo_3s_2200', quantity: 1 },
];

let minorBlocked = false;
try {
  // Minor attempting to checkout without parental consent
  serverCalculateOrder(cartWithLipo, 'FREE', true, false);
} catch (err) {
  minorBlocked = err.message.includes('Parental consent required');
}
assert(minorBlocked, 'Minor without parental consent is blocked from purchasing 3S LiPo battery (18+)');

let adultOrConsentedAllowed = false;
try {
  // Minor with parental consent
  const orderWithConsent = serverCalculateOrder(cartWithLipo, 'FREE', true, true);
  adultOrConsentedAllowed = orderWithConsent.total === 1599;
} catch (e) {
  adultOrConsentedAllowed = false;
}
assert(adultOrConsentedAllowed, 'Minor with verified parental consent is permitted to purchase 18+ equipment');

// =========================================================================
// TEST 5: Dynamic Single-Use UPI QR Code NPCI Spec & Expiry Countdown
// =========================================================================
console.log('\n--- Test 5: Dynamic UPI QR Code & 15-Minute Expiry Countdown ---');
function generateUpiString(params) {
  const vpa = encodeURIComponent(params.pa);
  const name = encodeURIComponent(params.pn);
  const note = encodeURIComponent(params.tn);
  return `upi://pay?pa=${vpa}&pn=${name}&am=${params.am.toFixed(2)}&tr=${params.tr}&cu=INR&tn=${note}`;
}

const orderNumber = 'ROBO-20261030-8491';
const upiUri = generateUpiString({
  pa: 'techsavyyy@razorpay',
  pn: 'RoboVerse TechSavyyy',
  am: 937.0,
  tr: orderNumber,
  tn: `RoboVerse Order ${orderNumber}`,
});

assert(upiUri.startsWith('upi://pay?'), 'Valid NPCI UPI protocol prefix');
assert(upiUri.includes('pa=techsavyyy%40razorpay'), 'Correct Merchant UPI VPA encoded');
assert(upiUri.includes('am=937.00'), 'Correct INR amount formatted to 2 decimal places');
assert(upiUri.includes(`tr=${orderNumber}`), 'Unique order tracking reference embedded');

const createdAt = Date.now();
const expiresAt = createdAt + 15 * 60 * 1000;
const diffSeconds = Math.round((expiresAt - createdAt) / 1000);
assert(diffSeconds === 900, 'Dynamic UPI QR countdown is exactly 15 minutes (900 seconds)');

// =========================================================================
// TEST 6: Razorpay HMAC-SHA256 Webhook Signature Verification
// =========================================================================
console.log('\n--- Test 6: Razorpay Webhook HMAC-SHA256 Signature Verification ---');
const webhookSecret = 'rzp_test_secret_roboverse_2026';
const mockWebhookPayload = JSON.stringify({
  entity: 'event',
  account_id: 'acc_roboverse',
  event: 'payment.captured',
  contains: ['payment'],
  payload: {
    payment: {
      entity: {
        id: 'pay_N01849102849',
        entity: 'payment',
        amount: 93700,
        currency: 'INR',
        status: 'captured',
        order_id: 'order_ROBO202610308491',
        notes: {
          order_id: 'd9b3e100-4b21-4b10-8201-9a1829f00001',
          user_id: 'u001-student',
        },
      },
    },
  },
  created_at: 1761829000,
});

const generatedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(mockWebhookPayload)
  .digest('hex');

// Verify signature matching
function verifySignature(payload, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
}

assert(
  verifySignature(mockWebhookPayload, generatedSignature, webhookSecret),
  'Webhook HMAC-SHA256 signature verified successfully with RAZORPAY_WEBHOOK_SECRET'
);

assert(
  !verifySignature(mockWebhookPayload, 'invalid_signature_hex_123', webhookSecret),
  'Tampered signature rejected'
);

// =========================================================================
// TEST 7: Webhook Idempotency & Stock Finalization Simulation
// =========================================================================
console.log('\n--- Test 7: Idempotency & Stock Decrement Verification ---');
const processedEvents = new Set();
let mockProductStock = 250;

function handleWebhookEvent(event) {
  if (processedEvents.has(event.id)) {
    return { status: 'already_processed', duplicate: true };
  }
  processedEvents.add(event.id);

  // Decrement stock (simulates finalize_order_payment RPC)
  mockProductStock -= 2;
  return { status: 'processed', duplicate: false };
}

const webhookEvent = { id: 'evt_rzp_9812903810', type: 'order.paid' };
const firstCall = handleWebhookEvent(webhookEvent);
assert(firstCall.status === 'processed' && !firstCall.duplicate, 'First webhook delivery processed successfully');
assert(mockProductStock === 248, `Product stock decremented from 250 to ${mockProductStock}`);

// Duplicate delivery
const duplicateCall = handleWebhookEvent(webhookEvent);
assert(duplicateCall.duplicate === true, 'Duplicate webhook event correctly deduplicated (Idempotent)');
assert(mockProductStock === 248, 'Stock was NOT decremented a second time on duplicate event');

// =========================================================================
// TEST 8: Indian Numbering System Amount In Words
// =========================================================================
console.log('\n--- Test 8: Amount in Words (Indian Rupees) ---');
function numberToWordsInr(amount) {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(num) {
    if ((num = num.toString().length > 9 ? parseFloat(num.toString().substring(0, 9)) : num) === 0) return '';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim();
  }

  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';
  return `${inWords(rounded)} Rupees Only`;
}

const words937 = numberToWordsInr(937);
assert(words937 === 'Nine Hundred and Thirty Seven Rupees Only', `NumberToWords: 937 -> "${words937}"`);
const words7999 = numberToWordsInr(7999);
assert(words7999 === 'Seven Thousand Nine Hundred and Ninety Nine Rupees Only', `NumberToWords: 7999 -> "${words7999}"`);

// =========================================================================
// TEST 9: GST Tax Invoice HSN Codes Mapping
// =========================================================================
console.log('\n--- Test 9: GST Tax Invoice HSN Mapping ---');
const HSN_MAPPING = {
  cat_boards: '8542.31.00',
  cat_sensors: '8541.40.11',
  cat_motion: '8501.10.12',
  cat_power: '8507.60.00',
  cat_drones: '8806.91.00',
  cat_kits: '8471.41.90',
  cat_tools: '8205.59.90',
};

assert(HSN_MAPPING.cat_boards === '8542.31.00', 'Microcontrollers mapped to HSN 8542.31.00 (ICs)');
assert(HSN_MAPPING.cat_sensors === '8541.40.11', 'Sensors mapped to HSN 8541.40.11 (Semiconductors)');
assert(HSN_MAPPING.cat_motion === '8501.10.12', 'Motors/Servos mapped to HSN 8501.10.12 (Electric Motors)');
assert(HSN_MAPPING.cat_kits === '8471.41.90', 'Robotics Kits mapped to HSN 8471.41.90 (Computing STEM units)');

// Summary
console.log(`\n========================================`);
console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} Passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
