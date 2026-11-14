import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const sessionId = params.id;

    // Verify session belongs to user
    const { data: session } = await (supabase.from('chat_sessions') as any)
      .select('id, user_id, title')
      .eq('id', sessionId)
      .single();

    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ success: false, error: { message: 'Session not found' } }, { status: 404 });
    }

    const { data: messages, error } = await (supabase.from('chat_messages') as any)
      .select('id, sender, content, off_topic, image_url, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        session,
        messages: (messages || []).map((m: any) => ({
          id: m.id,
          sender: m.sender,
          content: m.content,
          isOffTopic: m.off_topic,
          photoUrl: m.image_url,
          timestamp: m.created_at,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to fetch session messages' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const sessionId = params.id;

    // Delete session (RLS ensures user can only delete own sessions)
    const { error } = await (supabase.from('chat_sessions') as any)
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Chat session deleted successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to delete session' } },
      { status: 500 }
    );
  }
}
