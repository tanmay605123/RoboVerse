import { NextRequest, NextResponse } from 'next/server';
import { realtimeStorage } from '../../../realtimeStorage';
import { LiveTelemetryFrame } from '@roboverse/shared';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const frame: LiveTelemetryFrame = await req.json();

    if (!frame || typeof frame.speedMps === 'undefined') {
      return NextResponse.json({ error: 'Invalid telemetry frame payload' }, { status: 400 });
    }

    realtimeStorage.publishTelemetryFrame(params.id, frame);

    return NextResponse.json({ success: true, timestampMs: frame.timestampMs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to publish telemetry frame' }, { status: 500 });
  }
}
