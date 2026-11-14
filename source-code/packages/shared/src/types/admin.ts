export interface AdminOverviewStats {
  totalStudents: number;
  activeStudents24h: number;
  activeStudents7d: number;
  onlineNow: number;
  studentsWorkingNow: number;
  projectsCreated: number;
  enrollmentsByCourse: Record<string, number>;
  rituuStats: {
    totalMessages: number;
    totalPhotos: number;
    offTopicCount: number;
    offTopicRatePercent: number;
    estimatedCostInr: number;
  };
  totalRevenueInr: number;
  pendingShopReports: number;
  planDistribution: {
    free: number;
    plus: number;
    pro: number;
    institution: number;
  };
}

export interface AdminStudentRow {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  schoolOrCollege: string;
  city: string;
  planTier: string;
  role: string;
  currentCourse: string;
  progressPct: number;
  currentProject: string;
  lastActive: string;
  createdAt: string;
  // NEVER include passwords!
}

export interface AdminPresenceUser {
  id: string;
  studentId: string;
  fullName: string;
  schoolOrCollege: string;
  currentActivity: string;
  lastSeenAt: string;
  isOnline: boolean;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}
