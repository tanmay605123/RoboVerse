import { z } from 'zod';
import { UserRole } from './auth';

export interface StudentBadge {
  id: string;
  name: string;
  icon: string;
  category: 'CIRCUITS' | 'CODING' | 'ROBOTICS' | 'HACKATHON' | 'STREAK';
  description: string;
  earnedAt: string;
}

export interface SkillRadarScores {
  electronics: number;       // 0 - 100
  arduinoProgramming: number;// 0 - 100
  robotMechanics: number;    // 0 - 100
  iotAndSensors: number;     // 0 - 100
  machineLearning: number;   // 0 - 100
  embeddedSystems: number;   // 0 - 100
}

export interface CompletedCourseRecord {
  courseId: string;
  title: string;
  completedAt: string;
  gradePercentage: number;
  certificateUrl?: string;
}

export interface BuiltProjectRecord {
  projectId: string;
  title: string;
  description: string;
  completedAt: string;
  simulationUrl?: string;
  hardwarePhotos?: string[];
  mentorApproved: boolean;
}

export interface VerifiableCertificate {
  id: string;
  certificateNumber: string; // e.g. RV-CERT-2026-88231
  title: string;
  issuedToName: string;
  studentId: string;
  issueDate: string;
  qrCodeUrl: string;
  verificationUrl: string;
  skillsAssessed: string[];
  gradeScore: number;
}

// Digital Student ID Card data (for the 3D flip card)
export interface DigitalStudentIdCard {
  studentId: string;           // RV-2026-000123
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  planName: string;
  schoolOrCollege: string;
  city: string;
  state: string;
  level: number;
  xp: number;
  streakDays: number;
  qrCodeDataUrl: string;       // Base64 QR code image
  verificationUrl: string;     // URL to verify ID authenticity
  issuedAt: string;
  validUntil: string;
  badges: StudentBadge[];
}

// Comprehensive Learning Passport
export interface LearningPassport {
  studentId: string;
  fullName: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  totalLearningHours: number;
  coursesCompletedCount: number;
  projectsBuiltCount: number;
  certificatesEarnedCount: number;
  skillRadar: SkillRadarScores;
  recentBadges: StudentBadge[];
  completedCourses: CompletedCourseRecord[];
  builtProjects: BuiltProjectRecord[];
  certificates: VerifiableCertificate[];
}

export const UpdateProfileInputSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  schoolOrCollegeName: z.string().min(2).max(150).optional(),
  classOrYear: z.string().min(1).max(50).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  interests: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
