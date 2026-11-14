import { NextRequest, NextResponse } from 'next/server';
import { realtimeStorage } from '../../realtime/realtimeStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const squadId = req.nextUrl.searchParams.get('squadId') || 'squad_garuda_2026';
    const members = realtimeStorage.getSquadMembers(squadId);
    return NextResponse.json({ success: true, data: members });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch squad members' }, { status: 500 });
  }
}
