import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { data: sessions, error } = await (supabase.from('chat_sessions') as any)
      .select('id, title, context_project_id, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: sessions || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to fetch sessions' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title = body.title || 'Robotics Mentorship Session';
    const contextProjectId = body.circuitId || null;

    const { data: newSession, error } = await (supabase.from('chat_sessions') as any)
      .insert({
        user_id: user.id,
        title,
        context_project_id: contextProjectId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: newSession,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to create session' } },
      { status: 500 }
    );
  }
}
