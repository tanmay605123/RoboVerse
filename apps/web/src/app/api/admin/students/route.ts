import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export interface AdminStudentRow {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  schoolOrCollege: string;
  city: string;
  planTier: string;
  currentActivity: string;
  xp: number;
  streakDays: number;
  lastSeenAt: string;
  createdAt: string;
}

const FALLBACK_STUDENTS: AdminStudentRow[] = [
  {
    id: 'u001',
    studentId: 'RV-2026-001001',
    fullName: 'Tanmay Chawda',
    email: 'tanmay@iitdelhi.ac.in',
    schoolOrCollege: 'Indian Institute of Technology Delhi',
    city: 'New Delhi',
    planTier: 'PRO',
    currentActivity: 'Circuit Lab: Simulating Dual Ultrasonic Rover',
    xp: 2840,
    streakDays: 14,
    lastSeenAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'u002',
    studentId: 'RV-2026-001002',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@dpsrkp.net',
    schoolOrCollege: 'Delhi Public School, R.K. Puram',
    city: 'New Delhi',
    planTier: 'PLUS',
    currentActivity: 'Simple Lab: Assembling Traffic Light Breadboard',
    xp: 1450,
    streakDays: 8,
    lastSeenAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    createdAt: '2026-09-18T14:30:00Z',
  },
];

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // Verify session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !isDemo) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 404 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    const plan = url.searchParams.get('plan')?.toUpperCase() || 'ALL';

    let studentList: AdminStudentRow[] = isDemo ? [...FALLBACK_STUDENTS] : [];

    // Try executing database RPC admin_students
    try {
      const { data: dbStudents, error } = await (supabase.rpc as any)('admin_students', {
        p_search: search || null,
        p_plan: plan !== 'ALL' ? plan.toLowerCase() : null,
        p_limit: 50,
        p_offset: 0,
      });

      if (!error && dbStudents && dbStudents.length > 0) {
        studentList = dbStudents.map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          fullName: s.full_name,
          email: s.email,
          schoolOrCollege: s.school_or_college || s.school || 'RoboVerse Learning Hub',
          city: s.city || 'India',
          planTier: (s.plan_tier || 'FREE').toUpperCase(),
          currentActivity: s.current_activity || 'Exploring RoboVerse Labs',
          xp: Number(s.xp || 0),
          streakDays: Number(s.streak_days || 0),
          lastSeenAt: s.last_seen_at || new Date().toISOString(),
          createdAt: s.created_at || new Date().toISOString(),
        }));
      }
    } catch {
      // Fall back in local demo mode
    }

    return NextResponse.json({
      success: true,
      data: {
        total: studentList.length,
        students: studentList,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to query student roster' } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !isDemo) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: { message: 'Email required' } }, { status: 400 });
    }

    // Trigger Supabase Auth password reset email
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://roboverse-delta.vercel.app/reset-password',
    });

    return NextResponse.json({
      success: true,
      message: `Statutory password reset link dispatched to ${email}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}
