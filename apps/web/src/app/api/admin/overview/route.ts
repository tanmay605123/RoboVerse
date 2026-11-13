import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export interface AdminMetrics {
  totalStudents: number;
  onlineNow: number;
  active24h: number;
  active7d: number;
  workingOnProjects: number;
  projectsCreated: number;
  enrollmentsCount: number;
  certificatesIssued: number;
  rituuMessagesToday: number;
  rituuOfftopicToday: number;
  rituuOfftopicRatePct: number;
  totalRevenueInr: number;
  ordersCount: number;
  openShopReports: number;
  serverTimestamp: string;
}

const FALLBACK_METRICS: AdminMetrics = {
  totalStudents: 1420,
  onlineNow: 84,
  active24h: 612,
  active7d: 1280,
  workingOnProjects: 46,
  projectsCreated: 3120,
  enrollmentsCount: 2850,
  certificatesIssued: 418,
  rituuMessagesToday: 1840,
  rituuOfftopicToday: 38,
  rituuOfftopicRatePct: 2.1,
  totalRevenueInr: 184500,
  ordersCount: 168,
  openShopReports: 3,
  serverTimestamp: new Date().toISOString(),
};

export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // Verify session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !isDemo) {
      return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 404 });
    }

    let metricsData: AdminMetrics = {
      totalStudents: 0,
      onlineNow: 0,
      active24h: 0,
      active7d: 0,
      workingOnProjects: 0,
      projectsCreated: 0,
      enrollmentsCount: 0,
      certificatesIssued: 0,
      rituuMessagesToday: 0,
      rituuOfftopicToday: 0,
      rituuOfftopicRatePct: 0,
      totalRevenueInr: 0,
      ordersCount: 0,
      openShopReports: 0,
      serverTimestamp: new Date().toISOString(),
    };

    if (isDemo) {
      metricsData = { ...FALLBACK_METRICS, serverTimestamp: new Date().toISOString() };
    }

    try {
      const { data: dbOverview, error } = await (supabase.rpc as any)('admin_overview');
      if (!error && dbOverview) {
        const totalMsg = Number(dbOverview.rituu_messages_today || 0);
        const offTopic = Number(dbOverview.rituu_offtopic_today || 0);
        const ratePct = totalMsg > 0 ? Number(((offTopic / totalMsg) * 100).toFixed(1)) : 0;

        metricsData = {
          totalStudents: Number(dbOverview.total_students || 0),
          onlineNow: Number(dbOverview.online_now || 0),
          active24h: Number(dbOverview.active_24h || 0),
          active7d: Number(dbOverview.active_7d || 0),
          workingOnProjects: Number(dbOverview.working_on_projects || 0),
          projectsCreated: Number(dbOverview.projects_created || 0),
          enrollmentsCount: Number(dbOverview.enrollments_count || 0),
          certificatesIssued: Number(dbOverview.certificates_issued || 0),
          rituuMessagesToday: totalMsg,
          rituuOfftopicToday: offTopic,
          rituuOfftopicRatePct: ratePct,
          totalRevenueInr: Number(dbOverview.total_revenue_inr || 0),
          ordersCount: Number(dbOverview.orders_count || 0),
          openShopReports: Number(dbOverview.open_shop_reports || 0),
          serverTimestamp: new Date().toISOString(),
        };
      }
    } catch (dbErr) {
      // In local dev without DB connection, keep empty or demo metrics
    }

    return NextResponse.json({
      success: true,
      data: metricsData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to fetch admin overview' } },
      { status: 500 }
    );
  }
}
