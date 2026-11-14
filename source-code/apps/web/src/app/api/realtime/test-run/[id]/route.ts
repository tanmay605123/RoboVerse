import { NextRequest, NextResponse } from 'next/server';
import { realtimeStorage } from '../../realtimeStorage';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = realtimeStorage.getTestRun(params.id);
    if (!session) {
      return NextResponse.json({ error: 'Test run session not found' }, { status: 404 });
    }

    realtimeStorage.incrementViewerCount(params.id);

    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch test run session' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { score, durationSeconds, stars, passed } = body;

    realtimeStorage.completeTestRun(params.id, {
      score: score || 0,
      durationSeconds: durationSeconds || 0,
      stars: stars || 1,
      passed: !!passed,
    });

    const session = realtimeStorage.getTestRun(params.id);
    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to finalize test run' }, { status: 500 });
  }
}
