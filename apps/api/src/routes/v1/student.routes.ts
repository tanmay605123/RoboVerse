import { Router, Request, Response } from 'express';
import {
  UpdateProfileInputSchema,
  DigitalStudentIdCard,
  LearningPassport,
  SkillRadarScores,
} from '@roboverse/shared';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { inMemoryDb } from '../../lib/db';

const router = Router();

/**
 * GET /api/v1/students/profile
 */
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = inMemoryDb.profiles.get(userId);
  const studentIdRecord = inMemoryDb.studentIds.get(userId);

  if (!profile) {
    res.status(404).json({
      success: false,
      error: { code: 'PROFILE_NOT_FOUND', message: 'Student profile not found' },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      ...profile,
      studentId: studentIdRecord?.studentId,
    },
  });
});

/**
 * PUT /api/v1/students/profile
 */
router.put(
  '/profile',
  requireAuth,
  validateBody(UpdateProfileInputSchema),
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const profile = inMemoryDb.profiles.get(userId);

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Student profile not found' },
      });
      return;
    }

    const updated = {
      ...profile,
      ...req.body,
      updatedAt: new Date(),
    };
    inMemoryDb.profiles.set(userId, updated);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  }
);

/**
 * GET /api/v1/students/id-card
 * Digital 3D Student ID Card data
 */
router.get('/id-card', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = inMemoryDb.users.get(userId);
  const profile = inMemoryDb.profiles.get(userId);
  const studentIdRecord = inMemoryDb.studentIds.get(userId);

  if (!studentIdRecord || !profile) {
    res.status(404).json({
      success: false,
      error: { code: 'ID_CARD_NOT_FOUND', message: 'Digital Student ID Card not found' },
    });
    return;
  }

  const sub = Array.from(inMemoryDb.subscriptions.values()).find(
    (s) => s.userId === userId && s.status === 'ACTIVE'
  );
  const planName = sub?.planId === 'plan_pro' ? 'Pro Member' : sub?.planId === 'plan_plus' ? 'Plus Member' : 'Free Explorer';

  const idCard: DigitalStudentIdCard = {
    studentId: studentIdRecord.studentId,
    fullName: profile.fullName,
    email: user.email,
    avatarUrl: profile.avatarUrl,
    role: user.role,
    planName,
    schoolOrCollege: profile.schoolOrCollegeName,
    city: profile.city,
    state: profile.state,
    level: profile.level,
    xp: profile.xp,
    streakDays: profile.streakDays,
    qrCodeDataUrl: studentIdRecord.qrCodeDataUrl,
    verificationUrl: studentIdRecord.verificationUrl,
    issuedAt: studentIdRecord.issuedAt.toISOString(),
    validUntil: studentIdRecord.validUntil.toISOString(),
    badges: [
      {
        id: 'badge_first_spark',
        name: 'First Spark',
        icon: '⚡',
        category: 'CIRCUITS',
        description: 'Successfully simulated first LED circuit without blowing it up.',
        earnedAt: new Date().toISOString(),
      },
      {
        id: 'badge_robot_pioneer',
        name: 'Robot Pioneer',
        icon: '🤖',
        category: 'ROBOTICS',
        description: 'Created account and unlocked RoboVerse 3D Workbench.',
        earnedAt: new Date().toISOString(),
      },
    ],
  };

  res.json({
    success: true,
    data: idCard,
  });
});

/**
 * GET /api/v1/students/passport
 * Full Learning Passport: Courses done, projects built, learning hours, skill radar chart, certificates
 */
router.get('/passport', requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const profile = inMemoryDb.profiles.get(userId);
  const studentIdRecord = inMemoryDb.studentIds.get(userId);

  const skillRadar: SkillRadarScores = {
    electronics: 65,
    arduinoProgramming: 70,
    robotMechanics: 45,
    iotAndSensors: 50,
    machineLearning: 30,
    embeddedSystems: 55,
  };

  const passport: LearningPassport = {
    studentId: studentIdRecord?.studentId || 'RV-GUEST',
    fullName: profile?.fullName || 'RoboVerse Student',
    avatarUrl: profile?.avatarUrl,
    level: profile?.level || 1,
    xp: profile?.xp || 50,
    totalLearningHours: profile?.totalLearningHours || 4.5,
    coursesCompletedCount: 1,
    projectsBuiltCount: 2,
    certificatesEarnedCount: 1,
    skillRadar,
    recentBadges: [
      {
        id: 'badge_circuit_master',
        name: 'Ohm Apprentice',
        icon: '💡',
        category: 'CIRCUITS',
        description: 'Completed basic Ohm Law and resistor calculation challenges.',
        earnedAt: new Date().toISOString(),
      },
      {
        id: 'badge_streak_7',
        name: '7-Day Wire Streak',
        icon: '🔥',
        category: 'STREAK',
        description: 'Simulated and coded circuits for 7 consecutive days.',
        earnedAt: new Date().toISOString(),
      },
    ],
    completedCourses: [
      {
        courseId: 'crs_arduino_101',
        title: 'Arduino & Microcontroller Fundamentals',
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        gradePercentage: 92,
        certificateUrl: `/verify/certificate/RV-CERT-2026-0042`,
      },
    ],
    builtProjects: [
      {
        projectId: 'proj_line_follower_01',
        title: 'Autonomous 2-Wheel Line Follower Robot',
        description: 'Built with dual IR reflectance sensors, L298N motor driver, and Arduino Uno.',
        completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        simulationUrl: '/sim/projects/line-follower-01',
        mentorApproved: true,
      },
      {
        projectId: 'proj_ultrasonic_radar',
        title: 'Ultrasonic 180° Sonar Radar with Servo',
        description: 'HC-SR04 mounted on SG90 servo with live radar visualization.',
        completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        mentorApproved: true,
      },
    ],
    certificates: [
      {
        id: 'cert_001',
        certificateNumber: 'RV-CERT-2026-0042',
        title: 'Certified Arduino Robotics Foundations',
        issuedToName: profile?.fullName || 'Student',
        studentId: studentIdRecord?.studentId || 'RV-2026-000101',
        issueDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        qrCodeUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=RV-CERT-2026-0042',
        verificationUrl: `https://roboverse.io/verify/certificate/RV-CERT-2026-0042`,
        skillsAssessed: ['Arduino C++', 'Circuit Prototyping', 'Sensor Interfacing', 'Motor Control'],
        gradeScore: 92,
      },
    ],
  };

  res.json({
    success: true,
    data: passport,
  });
});

/**
 * GET /api/v1/students/verify-id/:studentId
 * Public verification endpoint for QR code on Student ID
 */
router.get('/verify-id/:studentId', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const hash = req.query.hash as string;

  const stidEntry = Array.from(inMemoryDb.studentIds.values()).find(
    (s) => s.studentId.toUpperCase() === studentId.toUpperCase()
  );

  if (!stidEntry) {
    res.status(404).json({
      success: false,
      error: { code: 'INVALID_STUDENT_ID', message: 'Student ID not recognized by RoboVerse Registry.' },
    });
    return;
  }

  // If hash is passed, check verification hash
  if (hash && stidEntry.verificationHash && stidEntry.verificationHash !== hash) {
    res.status(400).json({
      success: false,
      error: { code: 'HASH_MISMATCH', message: 'Tampered or expired QR verification signature.' },
    });
    return;
  }

  const profile = inMemoryDb.profiles.get(stidEntry.userId);
  const user = inMemoryDb.users.get(stidEntry.userId);
  const sub = Array.from(inMemoryDb.subscriptions.values()).find(
    (s) => s.userId === stidEntry.userId && s.status === 'ACTIVE'
  );

  res.json({
    success: true,
    message: 'Official RoboVerse Verified Student Credential',
    data: {
      verified: true,
      studentId: stidEntry.studentId,
      fullName: profile?.fullName,
      institution: profile?.schoolOrCollegeName,
      city: profile?.city,
      state: profile?.state,
      plan: sub?.planId === 'plan_pro' ? 'PRO Guided' : sub?.planId === 'plan_plus' ? 'PLUS' : 'FREE Explorer',
      status: user?.status,
      issuedAt: stidEntry.issuedAt,
      validUntil: stidEntry.validUntil,
    },
  });
});

export default router;
