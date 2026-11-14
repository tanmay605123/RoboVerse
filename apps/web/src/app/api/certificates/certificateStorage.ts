import { Certificate } from '@roboverse/shared';

declare global {
  // eslint-disable-next-line no-var
  var __ROBOVERSE_CERTIFICATES__: Map<string, Certificate> | undefined;
}

if (!global.__ROBOVERSE_CERTIFICATES__) {
  global.__ROBOVERSE_CERTIFICATES__ = new Map<string, Certificate>();

  // Seed sample verified certificates
  const seedCert: Certificate = {
    id: 'cert_sample_01',
    code: 'RV-CERT-2026-991234',
    userId: 'usr_student_tanmay',
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
  };

  const seedCertRevoked: Certificate = {
    id: 'cert_sample_revoked',
    code: 'RV-CERT-2026-REVOKED',
    userId: 'usr_student_bad_actor',
    courseId: 'crs_arduino_learn',
    title: 'Learn Arduino: From Zero to Robotics Engineer Mastery Certificate',
    gradeScore: 45.0,
    issueDate: '2026-08-01T10:00:00Z',
    verificationUrl: 'https://roboverse-delta.vercel.app/verify/RV-CERT-2026-REVOKED',
    revoked: true,
    revokedReason: 'Academic dishonesty policy violation during final MNA circuit simulation exam.',
    createdAt: '2026-08-01T10:00:00Z',
    studentName: 'Disqualified Candidate',
    studentId: 'RV-2026-000999',
    school: 'Unknown Institute',
  };

  const seedCertDashboard: Certificate = {
    id: 'cert_sample_dashboard',
    code: 'RV-CERT-ARD-2026-0042',
    userId: 'all',
    courseId: 'crs_arduino_learn',
    title: 'Learn Arduino: From Zero to Robotics Engineer Mastery Certificate',
    gradeScore: 99.0,
    issueDate: '2026-11-01T12:00:00Z',
    verificationUrl: 'https://roboverse-delta.vercel.app/verify/RV-CERT-ARD-2026-0042',
    revoked: false,
    createdAt: '2026-11-01T12:00:00Z',
    studentName: 'Verified RoboVerse Student',
    studentId: 'RV-2026-000042',
    school: 'RoboVerse Academy of Engineering',
  };

  global.__ROBOVERSE_CERTIFICATES__.set(seedCert.code.toUpperCase(), seedCert);
  global.__ROBOVERSE_CERTIFICATES__.set(seedCertRevoked.code.toUpperCase(), seedCertRevoked);
  global.__ROBOVERSE_CERTIFICATES__.set(seedCertDashboard.code.toUpperCase(), seedCertDashboard);
}

export const certificateStore = global.__ROBOVERSE_CERTIFICATES__;

export function saveCertificate(cert: Certificate): void {
  certificateStore.set(cert.code.toUpperCase(), cert);
  certificateStore.set(cert.id, cert);
}

export function getCertificateByCode(code: string): Certificate | undefined {
  return certificateStore.get(code.trim().toUpperCase());
}

export function getCertificatesForUser(userId: string): Certificate[] {
  const all = Array.from(new Set(certificateStore.values()));
  return all.filter((c) => c.userId === userId || userId === 'all');
}
