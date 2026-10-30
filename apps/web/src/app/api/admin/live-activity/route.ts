import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export interface LiveStudentSession {
  id: string;
  studentId: string;
  fullName: string;
  lab: 'Simple Lab' | 'Circuit Lab' | 'Robotic Design Lab' | 'Rituu AI' | 'TechSavyyy Store';
  projectName: string;
  action: string;
  timeActiveMinutes: number;
  lastPingSecondsAgo: number;
}

const LIVE_SESSIONS: LiveStudentSession[] = [
  {
    id: 's01',
    studentId: 'RV-2026-001001',
    fullName: 'Tanmay Chawda',
    lab: 'Circuit Lab',
    projectName: 'Dual Sonar Rover with SG90 Servo Turret',
    action: 'Simulating MNA node voltages (Pin 9 PWM duty cycle 65%)',
    timeActiveMinutes: 38,
    lastPingSecondsAgo: 4,
  },
  {
    id: 's02',
    studentId: 'RV-2026-001003',
    fullName: 'Ananya Deshmukh',
    lab: 'Robotic Design Lab',
    projectName: '4-DOF Articulated Robotic Arm',
    action: 'Running Physics Simulation in Obstacle Slalom Arena (Score: 88)',
    timeActiveMinutes: 52,
    lastPingSecondsAgo: 8,
  },
  {
    id: 's03',
    studentId: 'RV-2026-001002',
    fullName: 'Aarav Sharma',
    lab: 'Simple Lab',
    projectName: 'Interactive Traffic Light Controller',
    action: 'Routing Red LED anode jumper wire to Breadboard tie-point E12',
    timeActiveMinutes: 19,
    lastPingSecondsAgo: 14,
  },
  {
    id: 's04',
    studentId: 'RV-2026-001005',
    fullName: 'Pooja Sundaram',
    lab: 'Rituu AI',
    projectName: 'Autonomous Line Follower PID Tuning',
    action: 'Asking Rituu: "Why does my rover oscillate around the black tape?"',
    timeActiveMinutes: 12,
    lastPingSecondsAgo: 22,
  },
  {
    id: 's05',
    studentId: 'RV-2026-001007',
    fullName: 'Devansh Kulkarni',
    lab: 'Robotic Design Lab',
    projectName: 'Self-Balancing Inverted Pendulum Robot',
    action: 'Tuning PID Kd parameter for MPU6050 angle stabilization',
    timeActiveMinutes: 44,
    lastPingSecondsAgo: 31,
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        sessions: LIVE_SESSIONS,
        count: LIVE_SESSIONS.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to fetch live activity' } },
      { status: 500 }
    );
  }
}
