import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  issueCertificateAuthoritative,
  verifyCertificateAuthoritative,
  Certificate,
  OFFICIAL_HACKATHONS,
} from '@roboverse/shared';

describe('Phase 8: Hackathons & Certificates', () => {
  const sampleCerts: Certificate[] = [
    {
      id: 'cert_101',
      code: 'RV-CERT-2026-991234',
      userId: 'usr_student_01',
      courseId: 'crs_arduino_learn',
      title: 'Learn Arduino: From Zero to Robotics Engineer Mastery Certificate',
      gradeScore: 98.5,
      issueDate: '2026-10-15T10:00:00Z',
      verificationUrl: 'https://roboverse-delta.vercel.app/verify/RV-CERT-2026-991234',
      revoked: false,
      createdAt: '2026-10-15T10:00:00Z',
      studentName: 'Tanmay Chawda',
      studentId: 'RV-2026-000101',
      school: 'Delhi Technological University',
    },
    {
      id: 'cert_revoked_01',
      code: 'RV-CERT-2026-REVOKED',
      userId: 'usr_bad_actor',
      courseId: 'crs_arduino_learn',
      title: 'Learn Arduino Mastery Certificate',
      gradeScore: 45.0,
      issueDate: '2026-08-01T10:00:00Z',
      verificationUrl: 'https://roboverse-delta.vercel.app/verify/RV-CERT-2026-REVOKED',
      revoked: true,
      revokedReason: 'Academic dishonesty policy violation during circuit simulation test.',
      createdAt: '2026-08-01T10:00:00Z',
      studentName: 'Disqualified Candidate',
      studentId: 'RV-2026-000999',
      school: 'Unknown Institute',
    },
  ];

  it('rejects certificate issuance if course completion criteria are not met', () => {
    assert.throws(
      () =>
        issueCertificateAuthoritative(
          {
            userId: 'usr_student_02',
            courseId: 'crs_arduino_learn',
            courseTitle: 'Learn Arduino',
            completedLessonsCount: 12,
            totalLessonsCount: 16,
            averageScore: 88,
            studentName: 'Aarav Patel',
            studentId: 'RV-2026-000202',
            school: 'IIT Bombay',
          },
          sampleCerts
        ),
      /Course completion requirements not met: 12 of 16 lessons completed/
    );
  });

  it('successfully issues certificate when 16/16 lessons are complete and awards 250 XP', () => {
    const res = issueCertificateAuthoritative(
      {
        userId: 'usr_student_03',
        courseId: 'crs_robot_design',
        courseTitle: 'Robotic Design Lab: Kinematics & Mechanics',
        completedLessonsCount: 16,
        totalLessonsCount: 16,
        averageScore: 94.5,
        studentName: 'Isha Nair',
        studentId: 'RV-2026-000303',
        school: 'NIT Surathkal',
      },
      sampleCerts
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.alreadyIssued, false);
    assert.strictEqual(res.xpAwarded, 250);
    assert.ok(res.code.startsWith('RV-CERT-2026-'));
    assert.strictEqual(res.gradeScore, 94.5);
    assert.ok(res.verificationUrl.includes(res.code));
  });

  it('returns existing certificate idempotently if already issued for the same course', () => {
    const res = issueCertificateAuthoritative(
      {
        userId: 'usr_student_01',
        courseId: 'crs_arduino_learn',
        courseTitle: 'Learn Arduino',
        completedLessonsCount: 16,
        totalLessonsCount: 16,
        averageScore: 98.5,
        studentName: 'Tanmay Chawda',
        studentId: 'RV-2026-000101',
        school: 'Delhi Technological University',
      },
      sampleCerts
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.alreadyIssued, true);
    assert.strictEqual(res.code, 'RV-CERT-2026-991234');
    assert.strictEqual(res.xpAwarded, 0); // No duplicate XP awarded
  });

  it('verifies valid certificates on public ledger', () => {
    const res = verifyCertificateAuthoritative('RV-CERT-2026-991234', sampleCerts);

    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.code, 'RV-CERT-2026-991234');
    assert.strictEqual(res.studentName, 'Tanmay Chawda');
    assert.strictEqual(res.studentId, 'RV-2026-000101');
    assert.strictEqual(res.school, 'Delhi Technological University');
    assert.strictEqual(res.gradeScore, 98.5);
  });

  it('identifies and reports revoked certificates with reason', () => {
    const res = verifyCertificateAuthoritative('RV-CERT-2026-REVOKED', sampleCerts);

    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.revoked, true);
    assert.ok(res.revokedReason?.includes('Academic dishonesty'));
    assert.ok(res.error?.includes('revoked'));
  });

  it('returns error when certificate code does not exist in ledger', () => {
    const res = verifyCertificateAuthoritative('RV-CERT-NON-EXISTENT', sampleCerts);

    assert.strictEqual(res.valid, false);
    assert.ok(res.error?.includes('not found in RoboVerse central credential ledger'));
  });

  it('maintains curated national robotics hackathons with complete tracks and rules', () => {
    assert.ok(OFFICIAL_HACKATHONS.length >= 5);

    const sih = OFFICIAL_HACKATHONS.find((h) => h.id === 'hack_sih_robotics_2026');
    assert.ok(sih);
    assert.strictEqual(sih?.prizePoolInr, 1500000);
    assert.strictEqual(sih?.city, 'Delhi');
    assert.strictEqual(sih?.mode, 'HYBRID');
    assert.ok(sih?.tracks.includes('Autonomous Navigation'));

    const droneDerby = OFFICIAL_HACKATHONS.find((h) => h.id === 'hack_drone_derby_2026');
    assert.ok(droneDerby);
    assert.strictEqual(droneDerby?.prizePoolInr, 1200000);
    assert.strictEqual(droneDerby?.city, 'Bengaluru');
  });
});
