import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { shopId, shopName, reason, details, userEmail } = body;

    if (!shopId || !reason) {
      return NextResponse.json(
        { success: false, error: { message: 'Shop ID and reason are required.' } },
        { status: 400 }
      );
    }

    // In production with Supabase credentials:
    // await supabase.from('shop_reports').insert([{ shop_id: shopId, reason, details }]);

    return NextResponse.json({
      success: true,
      data: {
        reportId: `rep_${Date.now()}`,
        status: 'received',
        message: 'Thank you! Your store telemetry report has been submitted to the RoboVerse hardware verification team for audit.',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to submit report' } },
      { status: 500 }
    );
  }
}
