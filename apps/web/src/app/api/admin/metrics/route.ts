import { NextRequest, NextResponse } from 'next/server';
import { adminStudentsStore, auditLogStore } from '../adminStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const totalStudents = adminStudentsStore.length;
    const now = Date.now();

    // Active in last 24h
    const active24h = adminStudentsStore.filter(
      (s) => now - new Date(s.lastActive).getTime() <= 86400000
    ).length;

    // Active in last 7d
    const active7d = adminStudentsStore.filter(
      (s) => now - new Date(s.lastActive).getTime() <= 86400000 * 7
    ).length;

    // Online right now (active in last 5 mins)
    const onlineNow = adminStudentsStore.filter(
      (s) => now - new Date(s.lastActive).getTime() <= 1000 * 60 * 5
    ).length;

    // Actively working on projects
    const studentsWorkingNow = adminStudentsStore.filter(
      (s) =>
        now - new Date(s.lastActive).getTime() <= 1000 * 60 * 15 &&
        s.currentProject &&
        s.currentProject !== 'Offline'
    ).length;

    const planDistribution = {
      free: adminStudentsStore.filter((s) => s.planTier === 'FREE').length,
      plus: adminStudentsStore.filter((s) => s.planTier === 'PLUS').length,
      pro: adminStudentsStore.filter((s) => s.planTier === 'PRO').length,
      institution: 2,
    };

    const activePaidSubscriptions = planDistribution.plus + planDistribution.pro;
    const estimatedGrossMonthly = planDistribution.plus * 299 + planDistribution.pro * 999;
    const totalRevenueInr = 184500;
    const totalAiInferenceCostInr = 1420;
    const razorpayFeeEstimateInr = Math.round(totalRevenueInr * 0.0236);
    const estimatedNetMarginInr = totalRevenueInr - totalAiInferenceCostInr - razorpayFeeEstimateInr;

    return NextResponse.json({
      success: true,
      data: {
        totalStudentsRegistered: totalStudents,
        activeStudents24h: active24h,
        activeStudents7d: active7d,
        onlineNow,
        studentsWorkingNow,
        activePaidSubscriptions,
        estimatedGrossMonthlyInr: estimatedGrossMonthly,
        totalRevenueInr,
        totalAiInferenceCostInr,
        razorpayFeeEstimateInr,
        estimatedNetMarginInr,
        totalInvoicesIssued: 48,
        totalStoreOrdersCount: 154,
        confirmedStoreOrdersCount: 148,
        planDistribution,
        enrollmentsByCourse: {
          'crs_arduino_learn': 380,
          'crs_robot_design': 210,
          'crs_ml_vision': 120,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_METRICS_FAILED',
          message: err.message || 'Failed to retrieve administrative metrics.',
        },
      },
      { status: 500 }
    );
  }
}
