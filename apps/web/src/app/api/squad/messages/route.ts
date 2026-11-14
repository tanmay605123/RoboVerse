import { NextRequest, NextResponse } from 'next/server';
import { realtimeStorage } from '../../realtime/realtimeStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const squadId = req.nextUrl.searchParams.get('squadId') || 'squad_garuda_2026';
    const messages = realtimeStorage.getSquadMessages(squadId);
    return NextResponse.json({ success: true, data: messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch squad messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      squadId = 'squad_garuda_2026',
      senderId = 'usr_aarav_01',
      senderName = 'Aarav Sharma',
      senderRole = 'TEAM_CAPTAIN',
      senderStudentId = 'RV-2026-000108',
      content,
      type = 'text',
      metadata,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    const message = realtimeStorage.postSquadMessage({
      squadId,
      senderId,
      senderName,
      senderRole,
      senderStudentId,
      content,
      type,
      metadata,
    });

    return NextResponse.json({ success: true, data: message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send squad message' }, { status: 500 });
  }
}
