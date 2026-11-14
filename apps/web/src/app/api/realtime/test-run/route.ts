import { NextRequest, NextResponse } from 'next/server';
import { realtimeStorage } from '../realtimeStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const runs = realtimeStorage.getAllLiveRuns();
    return NextResponse.json({ success: true, data: runs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch test runs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      studentId = 'RV-2026-000108',
      studentName = 'Aarav Sharma',
      robotTemplateId = 'rover_4wd',
      robotName = 'Titan Explorer 4WD',
      arenaId = 'arena_obstacle_course',
      arenaName = 'Lunar Crater Obstacle Course',
    } = body;

    const session = realtimeStorage.createTestRun({
      title: title || `${robotName} Live Arena Run`,
      studentId,
      studentName,
      robotTemplateId,
      robotName,
      arenaId,
      arenaName,
    });

    return NextResponse.json({ success: true, data: session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to initialize test run' }, { status: 500 });
  }
}
