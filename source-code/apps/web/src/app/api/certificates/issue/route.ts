import { NextRequest, NextResponse } from 'next/server';
import {
  issueCertificateAuthoritative,
  Certificate,
} from '@roboverse/shared';
import { certificateStore, saveCertificate } from '../certificateStorage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    let userId = 'usr_guest_student';
    let studentName = 'RoboVerse Scholar';
    let studentId = 'RV-2026-000123';
    let school = 'Delhi Technical Campus';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          userId = payload.sub || payload.id || userId;
          if (payload.fullName) studentName = payload.fullName;
          if (payload.studentId) studentId = payload.studentId;
          if (payload.school) school = payload.school;
        }
      } catch (e) {
        // fallback
      }
    }

    const body = await req.json();
    const {
      courseId,
      courseTitle = 'Learn Arduino: From Zero to Robotics Engineer',
      completedLessonsCount = 16,
      totalLessonsCount = 16,
      averageScore = 95.0,
    } = body;

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_COURSE_ID',
            message: 'Course ID is required to issue certificate.',
          },
        },
        { status: 400 }
      );
    }

    const allCerts = Array.from(certificateStore.values());

    const result = issueCertificateAuthoritative(
      {
        userId,
        courseId,
        courseTitle,
        completedLessonsCount: Number(completedLessonsCount),
        totalLessonsCount: Number(totalLessonsCount),
        averageScore: Number(averageScore),
        studentName,
        studentId,
        school,
      },
      allCerts
    );

    if (!result.alreadyIssued) {
      const newCert: Certificate = {
        id: result.certificateId,
        code: result.code,
        userId,
        courseId,
        title: result.title,
        gradeScore: result.gradeScore,
        issueDate: new Date().toISOString(),
        verificationUrl: result.verificationUrl,
        revoked: false,
        createdAt: new Date().toISOString(),
        studentName,
        studentId,
        school,
      };

      saveCertificate(newCert);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CERTIFICATE_ISSUANCE_FAILED',
          message: err.message || 'Failed to issue course certificate.',
        },
      },
      { status: 400 }
    );
  }
}
