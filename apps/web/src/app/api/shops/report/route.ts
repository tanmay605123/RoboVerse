import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop_id, reason, details } = body;

    if (!shop_id || !reason) {
      return NextResponse.json(
        { error: 'Shop ID and report reason are required' },
        { status: 400 }
      );
    }

    // Try inserting into Supabase shop_reports table
    try {
      await (supabase.from('shop_reports') as any).insert({
        shop_id,
        reason,
        details: details || '',
        status: 'pending',
      });
    } catch (dbErr) {
      console.warn('DB insert shop_reports note:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully. Our Maker Radar team will verify this store within 24 hours.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to submit report' },
      { status: 500 }
    );
  }
}
