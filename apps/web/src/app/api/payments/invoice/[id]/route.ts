import { NextRequest, NextResponse } from 'next/server';
import { paymentStorage } from '../../paymentStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const payment = paymentStorage.getPayment(paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const format = req.nextUrl.searchParams.get('format');
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: payment,
      });
    }

    const cgstAmount = Math.round((payment.gstAmountInr / 2) * 100) / 100;
    const sgstAmount = Math.round((payment.gstAmountInr - cgstAmount) * 100) / 100;
    const invoiceDate = new Date(payment.capturedAt || payment.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GST Tax Invoice - ${payment.invoiceNumber || 'DRAFT'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background: #07110D;
      color: #E2E8F0;
      padding: 40px 20px;
    }
    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      background: #0B1914;
      border: 1px solid rgba(57, 255, 106, 0.25);
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(127, 231, 214, 0.2);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #39FF6A;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .brand-sub {
      color: #7FE7D6;
      font-size: 13px;
      margin-top: 4px;
    }
    .invoice-tag {
      text-align: right;
    }
    .badge {
      display: inline-block;
      background: rgba(57, 255, 106, 0.12);
      color: #39FF6A;
      border: 1px solid #39FF6A;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .inv-num {
      font-family: monospace;
      font-size: 15px;
      color: #FFFFFF;
      margin-top: 6px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
      font-size: 13px;
      line-height: 1.6;
    }
    .section-title {
      color: #7FE7D6;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      background: rgba(127, 231, 214, 0.08);
      color: #7FE7D6;
      text-align: left;
      padding: 12px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid rgba(57, 255, 106, 0.2);
    }
    td {
      padding: 14px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 13px;
    }
    .total-box {
      margin-left: auto;
      width: 320px;
      font-size: 13px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #94A3B8;
    }
    .grand-total {
      border-top: 1px solid rgba(57, 255, 106, 0.3);
      padding-top: 12px;
      margin-top: 8px;
      color: #39FF6A;
      font-size: 18px;
      font-weight: 800;
    }
    .footer {
      border-top: 1px solid rgba(127, 231, 214, 0.2);
      margin-top: 36px;
      padding-top: 20px;
      font-size: 11px;
      color: #64748B;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #39FF6A;
      color: #07110D;
      border: none;
      font-weight: 700;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      margin-bottom: 20px;
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .invoice-card { box-shadow: none; border: 1px solid #ccc; background: #fff; color: #000; }
      .brand-title { color: #0b6623; }
      .brand-sub, .section-title { color: #333; }
      .badge { border-color: #333; color: #000; background: #eee; }
      .inv-num { color: #000; }
      th { background: #f4f4f4; color: #000; border-color: #ddd; }
      td { border-color: #ddd; }
      .grand-total { color: #0b6623; border-color: #000; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div style="max-width: 820px; margin: 0 auto; text-align: right;">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">RoboVerse Technologies</div>
        <div class="brand-sub">National Robotics Simulation & STEM Learning Platform</div>
      </div>
      <div class="invoice-tag">
        <span class="badge">TAX INVOICE</span>
        <div class="inv-num">${payment.invoiceNumber || 'INV-PENDING'}</div>
        <div style="color: #64748B; font-size: 11px; margin-top: 4px;">Date: ${invoiceDate}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="section-title">Supplier Details</div>
        <strong>RoboVerse Technologies Pvt Ltd</strong><br>
        Plot 42, Tech Knowledge Park, Okhla Phase III<br>
        New Delhi, Delhi - 110020, India<br>
        <strong>GSTIN:</strong> 07AAACR9928P1Z8<br>
        <strong>State Code:</strong> 07 (Delhi)
      </div>
      <div>
        <div class="section-title">Billed To (Student / Subscriber)</div>
        <strong>${payment.userEmail}</strong><br>
        Student ID: <code>${payment.userId}</code><br>
        Place of Supply: Delhi / State of Residence<br>
        Payment Mode: <strong>${payment.method === 'qr' ? 'UPI Dynamic QR (10-Min)' : 'Razorpay Gateway'}</strong><br>
        Gateway Order ID: <code>${payment.razorpayOrderId}</code>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>SAC Code</th>
          <th>Cycle</th>
          <th>Base Price</th>
          <th>Discount</th>
          <th>Taxable Amt</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>RoboVerse ${payment.planTier.toUpperCase()} Plan Subscription</strong><br>
            <span style="font-size: 11px; color: #94A3B8;">Full platform access, Rituu AI, realistic 3D CAD library & physics simulation</span>
          </td>
          <td>999293</td>
          <td>${payment.billingCycle.toUpperCase()}</td>
          <td>₹${payment.basePriceInr.toFixed(2)}</td>
          <td>₹${payment.discountInr.toFixed(2)}</td>
          <td>₹${payment.taxablePriceInr.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-row">
        <span>Taxable Value:</span>
        <span>₹${payment.taxablePriceInr.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>CGST (9.0%):</span>
        <span>₹${cgstAmount.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>SGST (9.0%):</span>
        <span>₹${sgstAmount.toFixed(2)}</span>
      </div>
      ${
        payment.couponCode
          ? `<div class="total-row" style="color: #39FF6A;">
              <span>Promo (${payment.couponCode}):</span>
              <span>-₹${payment.discountInr.toFixed(2)}</span>
            </div>`
          : ''
      }
      <div class="total-row grand-total">
        <span>Total (INR):</span>
        <span>₹${payment.amountInr.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <div>
        This is a computer-generated tax invoice and requires no physical signature.<br>
        Questions? Contact <code>billing@roboverse.in</code> | GST SAC: 999293 (Robotics STEM Education)
      </div>
      <div style="font-family: monospace; color: #39FF6A; font-size: 10px;">
        STATUS: PAID &bull; VERIFIED
      </div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error generating invoice' }, { status: 500 });
  }
}
