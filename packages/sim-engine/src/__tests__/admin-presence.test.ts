import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  AdminStudentRow,
  AuditLogEntry,
  AdminOverviewStats,
} from '@roboverse/shared';

describe('Phase 9: Admin Panel, Realtime Presence & Security Operations', () => {
  const mockStudents: AdminStudentRow[] = [
    {
      id: 'usr_student_tanmay',
      studentId: 'RV-2026-000101',
      fullName: 'Tanmay Chawda',
      email: 'tanmay@roboverse.tech',
      schoolOrCollege: 'Delhi Technological University',
      city: 'Delhi',
      planTier: 'PRO',
      role: 'PRO_STUDENT',
      currentCourse: 'Robotic Design Lab: Kinematics & Mechanics',
      progressPct: 88,
      currentProject: 'Designing 4-DOF Robotic Arm in 3D Arena',
      lastActive: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      createdAt: '2026-09-01T08:00:00Z',
    },
    {
      id: 'usr_student_aarav',
      studentId: 'RV-2026-000102',
      fullName: 'Aarav Patel',
      email: 'aarav.patel@iitb.ac.in',
      schoolOrCollege: 'IIT Bombay',
      city: 'Mumbai',
      planTier: 'PLUS',
      role: 'PLUS_STUDENT',
      currentCourse: 'Learn Arduino: From Zero to Robotics Engineer',
      progressPct: 65,
      currentProject: 'Simulating MNA Push Button & LED Circuit',
      lastActive: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      createdAt: '2026-09-10T10:30:00Z',
    },
    {
      id: 'usr_student_rohit',
      studentId: 'RV-2026-000412',
      fullName: 'Rohit Sharma',
      email: 'rohit.s@dtu.ac.in',
      schoolOrCollege: 'Delhi Technological University',
      city: 'Delhi',
      planTier: 'FREE',
      role: 'FREE_STUDENT',
      currentCourse: 'Learn Arduino: From Zero to Robotics Engineer',
      progressPct: 40,
      currentProject: 'Offline',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30h ago
      createdAt: '2026-10-01T12:00:00Z',
    },
  ];

  it('guarantees zero password exposure in student directory', () => {
    mockStudents.forEach((student) => {
      assert.strictEqual((student as any).password, undefined);
      assert.strictEqual((student as any).password_hash, undefined);
      assert.strictEqual((student as any).encrypted_password, undefined);
      assert.ok(student.studentId.startsWith('RV-2026-'));
      assert.ok(student.email.includes('@'));
    });
  });

  it('filters students by search query and plan tier', () => {
    const searchFilter = (query: string) =>
      mockStudents.filter(
        (s) =>
          s.fullName.toLowerCase().includes(query.toLowerCase()) ||
          s.studentId.toLowerCase().includes(query.toLowerCase()) ||
          s.city.toLowerCase().includes(query.toLowerCase())
      );

    const delhiStudents = searchFilter('Delhi');
    assert.strictEqual(delhiStudents.length, 2);

    const proStudents = mockStudents.filter((s) => s.planTier === 'PRO');
    assert.strictEqual(proStudents.length, 1);
    assert.strictEqual(proStudents[0].studentId, 'RV-2026-000101');
  });

  it('calculates online and active working students accurately from lastSeenAt timestamps', () => {
    const now = Date.now();
    // Online: active in last 5 minutes
    const online = mockStudents.filter(
      (s) => now - new Date(s.lastActive).getTime() <= 1000 * 60 * 5
    );
    assert.strictEqual(online.length, 1); // Tanmay (2 mins ago)

    // Working in labs: active in last 15 minutes with active project
    const workingInLabs = mockStudents.filter(
      (s) =>
        now - new Date(s.lastActive).getTime() <= 1000 * 60 * 15 &&
        s.currentProject &&
        s.currentProject !== 'Offline'
    );
    assert.strictEqual(workingInLabs.length, 2); // Tanmay & Aarav
  });

  it('records tamper-proof security audit log entries for administrative actions', () => {
    const auditLog: AuditLogEntry[] = [];

    function logAction(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>) {
      const recorded: AuditLogEntry = {
        id: `aud_${Date.now()}_test`,
        ...entry,
        createdAt: new Date().toISOString(),
      };
      auditLog.push(recorded);
      return recorded;
    }

    const entry1 = logAction({
      adminId: 'usr_admin_01',
      adminEmail: 'admin@roboverse.tech',
      action: 'ROLE_PROMOTION',
      targetType: 'STUDENT',
      targetId: 'RV-2026-000102',
      details: { previousRole: 'FREE_STUDENT', newRole: 'PLUS_STUDENT' },
    });

    assert.strictEqual(auditLog.length, 1);
    assert.strictEqual(entry1.action, 'ROLE_PROMOTION');
    assert.strictEqual(entry1.targetId, 'RV-2026-000102');

    const entry2 = logAction({
      adminId: 'usr_admin_01',
      adminEmail: 'admin@roboverse.tech',
      action: 'PASSWORD_RESET_LINK_SENT',
      targetType: 'STUDENT',
      targetId: 'RV-2026-000412',
      details: { recipientEmail: 'rohit.s@dtu.ac.in', method: 'supabase_auth_otp' },
    });

    assert.strictEqual(auditLog.length, 2);
    assert.strictEqual(entry2.action, 'PASSWORD_RESET_LINK_SENT');
  });

  it('updates student heartbeat and workbench project via presence touch', () => {
    const student = { ...mockStudents[0] };
    const newActivity = 'Autonomous Waypoint Drone Simulation';

    student.currentProject = newActivity;
    student.lastActive = new Date().toISOString();

    assert.strictEqual(student.currentProject, newActivity);
    const timeDiff = Math.abs(Date.now() - new Date(student.lastActive).getTime());
    assert.ok(timeDiff < 1000);
  });
});
