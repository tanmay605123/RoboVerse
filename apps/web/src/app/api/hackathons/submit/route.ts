import { NextRequest, NextResponse } from 'next/server';
import { HackathonSubmission } from '@roboverse/shared';

declare global {
  // eslint-disable-next-line no-var
  var __ROBOVERSE_HACKATHON_SUBMISSIONS__: Map<string, HackathonSubmission> | undefined;
}

if (!global.__ROBOVERSE_HACKATHON_SUBMISSIONS__) {
  global.__ROBOVERSE_HACKATHON_SUBMISSIONS__ = new Map<string, HackathonSubmission>();
}

const submissionStore = global.__ROBOVERSE_HACKATHON_SUBMISSIONS__;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    let userId = 'usr_guest_student';
    let studentName = 'RoboVerse Scholar';
    let studentId = 'RV-2026-000123';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub || payload.id || userId;
          if (payload.fullName) studentName = payload.fullName;
          if (payload.studentId) studentId = payload.studentId;
        }
      } catch (e) {
        // fallback
      }
    }

    const body = await req.json();
    const {
      hackathonId,
      teamName,
      projectTitle,
      projectDescription,
      circuitProjectId,
      robotDesignId,
      videoDemoUrl,
      githubUrl,
    } = body;

    if (!hackathonId || !projectTitle || !projectDescription) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Hackathon ID, project title, and description are required.',
          },
        },
        { status: 400 }
      );
    }

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSubmission: HackathonSubmission = {
      id: submissionId,
      hackathonId,
      teamName: teamName || `${studentName}'s Squad`,
      captainUserId: userId,
      captainName: studentName,
      captainStudentId: studentId,
      projectTitle,
      projectDescription,
      circuitProjectId,
      robotDesignId,
      videoDemoUrl,
      githubUrl,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    submissionStore.set(submissionId, newSubmission);

    return NextResponse.json({
      success: true,
      data: {
        submissionId,
        status: 'submitted',
        message: 'Robotics project submitted successfully to the judging panel!',
        submission: newSubmission,
        xpAwarded: 100,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUBMISSION_FAILED',
          message: err.message || 'Failed to submit hackathon project.',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hackathonId = searchParams.get('hackathonId');

  let list = Array.from(submissionStore.values());
  if (hackathonId) {
    list = list.filter((s) => s.hackathonId === hackathonId);
  }

  return NextResponse.json({
    success: true,
    data: {
      submissions: list,
      total: list.length,
    },
  });
}
