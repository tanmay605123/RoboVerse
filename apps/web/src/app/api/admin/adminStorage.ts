import {
  AdminOverviewStats,
  AdminStudentRow,
  AdminPresenceUser,
  AuditLogEntry,
  AdminCoupon,
} from '@roboverse/shared';

declare global {
  // eslint-disable-next-line no-var
  var __ROBOVERSE_ADMIN_STUDENTS__: AdminStudentRow[] | undefined;
  // eslint-disable-next-line no-var
  var __ROBOVERSE_AUDIT_LOG__: AuditLogEntry[] | undefined;
  // eslint-disable-next-line no-var
  var __ROBOVERSE_COUPONS__: AdminCoupon[] | undefined;
}

if (!global.__ROBOVERSE_ADMIN_STUDENTS__) {
  global.__ROBOVERSE_ADMIN_STUDENTS__ = [
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
      lastActive: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
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
      lastActive: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 mins ago
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
      currentProject: 'Blinking LED with 220 Ohm Resistor',
      lastActive: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      createdAt: '2026-10-01T12:00:00Z',
    },
    {
      id: 'usr_student_priya',
      studentId: 'RV-2026-000551',
      fullName: 'Priya Iyer',
      email: 'priya.iyer@iiitb.ac.in',
      schoolOrCollege: 'IIIT Bengaluru',
      city: 'Bengaluru',
      planTier: 'PRO',
      role: 'PRO_STUDENT',
      currentCourse: 'Machine Learning & Computer Vision for Autonomous Robots',
      progressPct: 92,
      currentProject: 'Line Follower Infrared Array Tuning',
      lastActive: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 mins ago
      createdAt: '2026-09-15T14:20:00Z',
    },
    {
      id: 'usr_student_meera',
      studentId: 'RV-2026-000620',
      fullName: 'Meera Kulkarni',
      email: 'meera.k@coep.ac.in',
      schoolOrCollege: 'COEP Technological University',
      city: 'Pune',
      planTier: 'PLUS',
      role: 'PLUS_STUDENT',
      currentCourse: 'Robotic Design Lab: Kinematics & Mechanics',
      progressPct: 70,
      currentProject: 'Self-Balancing Inverted Pendulum PID',
      lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      createdAt: '2026-09-22T09:15:00Z',
    },
  ];
}

if (!global.__ROBOVERSE_AUDIT_LOG__) {
  global.__ROBOVERSE_AUDIT_LOG__ = [
    {
      id: 'aud_01',
      adminId: 'usr_admin_master',
      adminEmail: 'admin@roboverse.tech',
      action: 'SYSTEM_BOOT',
      targetType: 'SYSTEM',
      targetId: 'NODE_PRIMARY_DELHI',
      details: { environment: 'production', cluster: 'in-north-1', postgis: 'enabled' },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'aud_02',
      adminId: 'usr_admin_master',
      adminEmail: 'admin@roboverse.tech',
      action: 'ROLE_PROMOTION',
      targetType: 'USER',
      targetId: 'RV-2026-000101',
      details: { previousRole: 'FREE_STUDENT', newRole: 'PRO_STUDENT', reason: 'Hackathon Grand Prize Winner' },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

if (!global.__ROBOVERSE_COUPONS__) {
  global.__ROBOVERSE_COUPONS__ = [
    {
      id: 'cpn_diwali25',
      code: 'DIWALI25',
      discountPercentage: 25,
      maxUses: 500,
      usedCount: 142,
      active: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'cpn_robotics50',
      code: 'ROBOTICS50',
      discountPercentage: 50,
      maxUses: 100,
      usedCount: 88,
      active: true,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ];
}

export const adminStudentsStore = global.__ROBOVERSE_ADMIN_STUDENTS__;
export const auditLogStore = global.__ROBOVERSE_AUDIT_LOG__;
export const couponStore = global.__ROBOVERSE_COUPONS__;

export function recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): AuditLogEntry {
  const newEntry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...entry,
    createdAt: new Date().toISOString(),
  };
  auditLogStore.unshift(newEntry);
  return newEntry;
}

export function touchStudentPresence(userId: string, activity: string): void {
  const student = adminStudentsStore.find((s) => s.id === userId);
  if (student) {
    student.lastActive = new Date().toISOString();
    student.currentProject = activity;
  }
}
