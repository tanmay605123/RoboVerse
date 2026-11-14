import { NextRequest, NextResponse } from 'next/server';
import { TeamMatchingEntry } from '@roboverse/shared';

declare global {
  // eslint-disable-next-line no-var
  var __ROBOVERSE_TEAM_MATCHING__: TeamMatchingEntry[] | undefined;
}

if (!global.__ROBOVERSE_TEAM_MATCHING__) {
  global.__ROBOVERSE_TEAM_MATCHING__ = [
    {
      id: 'match_01',
      hackathonId: 'hack_sih_robotics_2026',
      userId: 'usr_student_rohit',
      studentId: 'RV-2026-000412',
      name: 'Rohit Sharma',
      skills: ['ROS 2', 'Computer Vision', 'Python'],
      preferredRole: 'Perception & AI Lead',
      message: 'Looking for a firmware engineer to interface LiDAR and camera stream with ROS 2 navigation stack!',
      city: 'Delhi',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'match_02',
      hackathonId: 'hack_sih_robotics_2026',
      userId: 'usr_student_priya',
      studentId: 'RV-2026-000551',
      name: 'Priya Iyer',
      skills: ['Arduino C++', 'ESP32 Mesh', 'PCB Design'],
      preferredRole: 'Firmware & Embedded Systems Engineer',
      message: 'Experienced with ESP-NOW and MNA motor circuits. Let us win this rover challenge!',
      city: 'Delhi',
      createdAt: new Date().toISOString(),
    },
  ];
}

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hackathonId = params.id;
    const authHeader = req.headers.get('Authorization');
    let userId = 'usr_guest_student';
    let studentName = 'RoboVerse Scholar';
    let studentId = 'RV-2026-000123';
    let city = 'Delhi';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub || payload.id || userId;
          if (payload.fullName) studentName = payload.fullName;
          if (payload.studentId) studentId = payload.studentId;
          if (payload.city) city = payload.city;
        }
      } catch (e) {
        // fallback
      }
    }

    const body = await req.json();
    const { skills = [], preferredRole = 'Firmware Engineer', message = '' } = body;

    const newEntry: TeamMatchingEntry = {
      id: `match_${Date.now()}`,
      hackathonId,
      userId,
      studentId,
      name: studentName,
      skills,
      preferredRole,
      message,
      city,
      createdAt: new Date().toISOString(),
    };

    global.__ROBOVERSE_TEAM_MATCHING__?.push(newEntry);

    return NextResponse.json({
      success: true,
      data: {
        entry: newEntry,
        message: 'Joined team matching pool successfully!',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MATCHING_FAILED',
          message: err.message || 'Failed to join team matching pool.',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const hackathonId = params.id;
  const list = (global.__ROBOVERSE_TEAM_MATCHING__ || []).filter(
    (m) => m.hackathonId === hackathonId
  );

  return NextResponse.json({
    success: true,
    data: {
      candidates: list,
      total: list.length,
    },
  });
}
