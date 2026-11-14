import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { invoiceNumber: string } }
) {
  const invoiceNum = params.invoiceNumber || 'TS-INV-2026-PREVIEW';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceNum}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; background: #07110D; color: #E0EADE; padding: 40px; margin: 0; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #0B1E16; border: 1px solid #1A4731; border-radius: 16px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #39FF6A; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 900; color: #39FF6A; letter-spacing: 1px; }
    .meta { text-align: right; font-size: 12px; color: #7FE7D6; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; font-size: 13px; line-height: 1.6; }
    .box { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; border: 1px solid #1A4731; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
    .table th, .table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #1A4731; }
    .table th { background: rgba(57, 255, 106, 0.1); color: #39FF6A; }
    .totals { margin-left: auto; width: 340px; font-size: 13px; line-height: 1.8; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand-total { font-size: 18px; font-weight: 900; color: #39FF6A; border-top: 2px solid #39FF6A; padding-top: 8px; margin-top: 8px; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #7FE7D6; border-top: 1px solid #1A4731; padding-top: 20px; }
    @media print { body { background: #FFF; color: #000; } .invoice-card { border: none; background: #FFF; box-shadow: none; color: #000; } .brand { color: #000; } }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">TECHSAVYYY / ROBOVERSE</div>
        <div style="font-size: 12px; color: #9ABCB0;">Official Hardware & Curriculum Store</div>
      </div>
      <div class="meta">
        <div><strong>TAX INVOICE</strong></div>
        <div>Invoice No: <strong>${invoiceNum}</strong></div>
        <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
        <div>Status: <span style="color: #39FF6A;">PAID</span></div>
      </div>
    </div>

    <div class="details">
      <div class="box">
        <strong style="color: #39FF6A;">SUPPLIER DETAILS</strong><br>
        <strong>TechSavyyy Hardware Pvt Ltd</strong><br>
        GSTIN: <strong>07AABCT9921D1ZZ</strong><br>
        SAC/HSN Code: <strong>85423100</strong> (Integrated Circuits & Robotics Modules)<br>
        Electronics City, Phase 1, Bengaluru, Karnataka 560100<br>
        Email: billing@roboverse.tech
      </div>
      <div class="box">
        <strong style="color: #7FE7D6;">RECIPIENT (STUDENT)</strong><br>
        Customer: <strong>Verified RoboVerse Student</strong><br>
        State of Supply: <strong>Delhi (07)</strong><br>
        Place of Delivery: Hostel 4, Room 302, IIT Campus, Delhi 110016<br>
        Payment Gateway: <strong>Razorpay (UPI / Auto-Captured)</strong>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total (incl. 18% GST)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>RoboVerse Hardware Kit & Components</strong><br><span style="font-size: 11px; color: #9ABCB0;">Genuine tested ICs, microcontrollers, and curriculum kit</span></td>
          <td>854231</td>
          <td>1</td>
          <td>₹1,016.10</td>
          <td>₹1,199.00</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div><span>Taxable Base Value:</span><span>₹1,016.10</span></div>
      <div><span>CGST (9.0%):</span><span>₹91.45</span></div>
      <div><span>SGST (9.0%):</span><span>₹91.45</span></div>
      <div><span>Total 18% GST:</span><span>₹182.90</span></div>
      <div class="grand-total"><span>Total Paid:</span><span>₹1,199.00</span></div>
    </div>

    <div class="footer">
      This is a digitally generated 18% GST Tax Invoice compliant with Indian Tax Laws.<br>
      No physical signature required. TechSavyyy Robotics Pvt Ltd • GSTIN: 07AABCT9921D1ZZ
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
