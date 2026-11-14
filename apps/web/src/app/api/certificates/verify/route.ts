import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export interface VerifiedCertificate {
  valid: boolean;
  certificateCode: string;
  studentName: string;
  studentId: string;
  courseName: string;
  track: string;
  hours: number;
  gradeScore: number;
  issuedAt: string;
  isRevoked: boolean;
  revokedReason?: string;
  issuingAuthority: string;
  skillsAssessed: string[];
  verificationUrl: string;
}

const SAMPLE_CERTIFICATES: Record<string, VerifiedCertificate> = {
  'RV-CERT-2026-001001': {
    valid: true,
    certificateCode: 'RV-CERT-2026-001001',
    studentName: 'Tanmay Chawda',
    studentId: 'RV-2026-001001',
    courseName: 'Arduino & Electronics Foundations',
    track: 'HARDWARE & EMBEDDED SYSTEMS',
    hours: 16,
    gradeScore: 98.5,
    issuedAt: '2026-10-18T14:30:00Z',
    isRevoked: false,
    issuingAuthority: 'RoboVerse Academy Certification Board',
    skillsAssessed: [
      'Ohm & Kirchhoff Laws',
      'ATmega328P Register-Level Architecture',
      'PWM Signal Control',
      'Analog-to-Digital Conversion (ADC)',
      'I2C & SPI Serial Protocols',
      'MNA Electrical Circuit Simulation',
    ],
    verificationUrl: 'https://roboverse.dev/verify/RV-CERT-2026-001001',
  },
  'RV-CERT-2026-001002': {
    valid: true,
    certificateCode: 'RV-CERT-2026-001002',
    studentName: 'Aarav Sharma',
    studentId: 'RV-2026-001002',
    courseName: 'Autonomous Mobile Robotics: Line Tracers & Rovers',
    track: 'ROBOTICS & CONTROL SYSTEMS',
    hours: 24,
    gradeScore: 96.0,
    issuedAt: '2026-10-22T11:15:00Z',
    isRevoked: false,
    issuingAuthority: 'RoboVerse Academy Certification Board',
    skillsAssessed: [
      'Differential-Drive Kinematics',
      'PID Algorithm Tuning',
      'IR Line Array Sensor Calibration',
      'L298N Dual H-Bridge Motor Control',
      'Real-Time Collision Avoidance',
    ],
    verificationUrl: 'https://roboverse.dev/verify/RV-CERT-2026-001002',
  },
  'RV-CERT-2026-REVOKED': {
    valid: false,
    certificateCode: 'RV-CERT-2026-REVOKED',
    studentName: 'Test Account',
    studentId: 'RV-2026-009999',
    courseName: 'Drone Flight Dynamics & PID Stabilization',
    track: 'AERIAL ROBOTICS',
    hours: 30,
    gradeScore: 60.0,
    issuedAt: '2026-08-01T00:00:00Z',
    isRevoked: true,
    revokedReason: 'Academic integrity policy violation - unauthorized code submission.',
    issuingAuthority: 'RoboVerse Academy Certification Board',
    skillsAssessed: ['Brushless Motor Control', 'IMU 6-DOF Filtering'],
    verificationUrl: 'https://roboverse.dev/verify/RV-CERT-2026-REVOKED',
  },
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { success: false, error: { message: 'Certificate code is required' } },
        { status: 400 }
      );
    }

    // 1. Query Supabase RPC verify_certificate
    try {
      const { data: dbResult, error } = await (supabase.rpc as any)('verify_certificate', {
        p_certificate_code: code,
      });

      if (!error && dbResult && dbResult.certificate_code) {
        const cert: VerifiedCertificate = {
          valid: Boolean(dbResult.valid),
          certificateCode: dbResult.certificate_code,
          studentName: dbResult.student_name,
          studentId: dbResult.student_id,
          courseName: dbResult.course_name,
          track: dbResult.track,
          hours: Number(dbResult.hours || 20),
          gradeScore: Number(dbResult.grade_score || 95.0),
          issuedAt: dbResult.issued_at,
          isRevoked: Boolean(dbResult.is_revoked),
          revokedReason: dbResult.revoked_reason,
          issuingAuthority: 'RoboVerse Academy Certification Board',
          skillsAssessed: [
            'Microcontroller Architecture',
            'Closed-Loop Feedback Systems',
            'Embedded C++ Firmware',
            'Hardware Circuit Diagnostics',
          ],
          verificationUrl: `https://roboverse.dev/verify/${dbResult.certificate_code}`,
        };

        return NextResponse.json({ success: true, data: cert });
      }
    } catch (dbErr) {
      // In local dev without DB connection, fall back to sample catalog
    }

    // 2. Sample Registry check
    const sampleCert = SAMPLE_CERTIFICATES[code];
    if (sampleCert) {
      return NextResponse.json({ success: true, data: sampleCert });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CERTIFICATE_NOT_FOUND',
          message: `No active or historical certificate found matching code "${code}". Please check for typos.`,
        },
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Verification service error' } },
      { status: 500 }
    );
  }
}
