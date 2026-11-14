import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const invoices = [
    {
      id: 'inv_01',
      invoiceNumber: 'TS-INV-2026-00481',
      studentName: 'Tanmay Chawda',
      studentId: 'RV-2026-000101',
      grossAmountInr: 1199.00,
      baseAmountInr: 1016.10,
      totalGstInr: 182.90,
      status: 'PAID',
      issuedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'inv_02',
      invoiceNumber: 'TS-INV-2026-00482',
      studentName: 'Aarav Patel',
      studentId: 'RV-2026-000102',
      grossAmountInr: 299.00,
      baseAmountInr: 253.39,
      totalGstInr: 45.61,
      status: 'PAID',
      issuedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      invoices,
      total: invoices.length,
    },
  });
}
