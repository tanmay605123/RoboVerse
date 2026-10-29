import mongoose, { Schema, Document, Model } from 'mongoose';

// ==========================================
// Course Model
// ==========================================
export interface ICourse extends Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  track: 'HARDWARE' | 'SOFTWARE' | 'HYBRID' | 'ROBOTICS' | 'DRONES';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  thumbnailUrl?: string;
  isOfficialCertificate: boolean;
  durationHours: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    track: {
      type: String,
      enum: ['HARDWARE', 'SOFTWARE', 'HYBRID', 'ROBOTICS', 'DRONES'],
      default: 'HYBRID',
      index: true,
    },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    thumbnailUrl: { type: String },
    isOfficialCertificate: { type: Boolean, default: true },
    durationHours: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CourseModel: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

// ==========================================
// Module Model
// ==========================================
export interface IModule extends Document {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

const ModuleSchema = new Schema<IModule>(
  {
    courseId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ModuleModel: Model<IModule> =
  mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);

// ==========================================
// Lesson Model
// ==========================================
export interface ILesson extends Document {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  content: string;
  videoUrl?: string;
  starterCircuitId?: string;
  quizId?: string;
  durationMinutes: number;
  order: number;
}

const LessonSchema = new Schema<ILesson>(
  {
    courseId: { type: String, required: true, index: true },
    moduleId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    content: { type: String, required: true },
    videoUrl: { type: String },
    starterCircuitId: { type: String },
    quizId: { type: String },
    durationMinutes: { type: Number, default: 15 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LessonModel: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);

// ==========================================
// Quiz Model
// ==========================================
export interface IQuiz extends Document {
  id: string;
  lessonId: string;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  passingScorePct: number;
}

const QuizSchema = new Schema<IQuiz>(
  {
    lessonId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    questions: {
      type: [
        {
          question: { type: String, required: true },
          options: { type: [String], required: true },
          correctIndex: { type: Number, required: true },
          explanation: { type: String, required: true },
        },
      ],
      required: true,
    },
    passingScorePct: { type: Number, default: 70 },
  },
  { timestamps: true }
);

export const QuizModel: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

// ==========================================
// Progress Model
// ==========================================
export interface IProgress extends Document {
  id: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  progressPct: number;
  completedAt?: Date | null;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    completedLessonIds: { type: [String], default: [] },
    quizScores: { type: Schema.Types.Mixed, default: {} },
    progressPct: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const ProgressModel: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);

// ==========================================
// Class & Assignment Models
// ==========================================
export interface IClass extends Document {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  institutionId?: string;
  description: string;
  schedule?: string;
  studentIds: string[];
}

const ClassSchema = new Schema<IClass>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    teacherId: { type: String, required: true, index: true },
    institutionId: { type: String, index: true },
    description: { type: String, default: '' },
    schedule: { type: String },
    studentIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ClassModel: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);

export interface IAssignment extends Document {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: Date;
  starterCircuitId?: string;
  maxPoints: number;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    classId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    starterCircuitId: { type: String },
    maxPoints: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const AssignmentModel: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

// ==========================================
// Submission Model
// ==========================================
export interface ISubmission extends Document {
  id: string;
  assignmentId: string;
  studentId: string;
  circuitProjectId: string;
  feedback?: string;
  grade?: number;
  gradedAt?: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    circuitProjectId: { type: String, required: true },
    feedback: { type: String },
    grade: { type: Number },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

export const SubmissionModel: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

// ==========================================
// Live Class Model
// ==========================================
export interface ILiveClass extends Document {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  mentorName: string;
  scheduledAt: Date;
  durationMinutes: number;
  meetingUrl?: string;
  recordingUrl?: string;
  attendeesCount: number;
  planRequired: 'PLUS' | 'PRO';
}

const LiveClassSchema = new Schema<ILiveClass>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    mentorId: { type: String, required: true, index: true },
    mentorName: { type: String, required: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60 },
    meetingUrl: { type: String },
    recordingUrl: { type: String },
    attendeesCount: { type: Number, default: 0 },
    planRequired: { type: String, enum: ['PLUS', 'PRO'], default: 'PRO' },
  },
  { timestamps: true }
);

export const LiveClassModel: Model<ILiveClass> =
  mongoose.models.LiveClass || mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);

// ==========================================
// Enrollment Model
// ==========================================
export interface IEnrollment extends Document {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'DROPPED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

// ==========================================
// Badge Model
// ==========================================
export interface IBadge extends Document {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'CIRCUITS' | 'CODING' | 'ROBOTICS' | 'HACKATHON' | 'STREAK';
  criteria: Record<string, any>;
}

const BadgeSchema = new Schema<IBadge>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    iconUrl: { type: String, required: true },
    category: {
      type: String,
      enum: ['CIRCUITS', 'CODING', 'ROBOTICS', 'HACKATHON', 'STREAK'],
      required: true,
    },
    criteria: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const BadgeModel: Model<IBadge> =
  mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);

// ==========================================
// Official Certificate & Template Models
// ==========================================
export interface ICertificate extends Document {
  id: string;
  certificateId: string; // e.g. RV-CERT-2026-000492
  studentId: string;
  studentName: string;
  userId: string;
  courseId: string;
  courseName: string;
  track: string;
  issuedAt: Date;
  hours: number;
  scorePct: number;
  signatureUrl: string;
  verificationUrl: string;
  status: 'VALID' | 'REVOKED';
  qrCodeDataUrl: string;
  pdfUrl?: string;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    courseId: { type: String, required: true },
    courseName: { type: String, required: true },
    track: { type: String, default: 'Robotics & Hardware' },
    issuedAt: { type: Date, default: Date.now },
    hours: { type: Number, default: 20 },
    scorePct: { type: Number, default: 90 },
    signatureUrl: { type: String, default: '/signatures/lead_instructor.png' },
    verificationUrl: { type: String, required: true },
    status: { type: String, enum: ['VALID', 'REVOKED'], default: 'VALID', index: true },
    qrCodeDataUrl: { type: String, required: true },
    pdfUrl: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

CertificateSchema.index({ studentId: 1, courseId: 1 });

export const CertificateModel: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);

export interface ICertificateTemplate extends Document {
  id: string;
  name: string;
  track: string;
  layoutConfig: Record<string, any>;
  issuerTitle: string;
  defaultHours: number;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    name: { type: String, required: true },
    track: { type: String, required: true },
    layoutConfig: { type: Schema.Types.Mixed, default: {} },
    issuerTitle: { type: String, default: 'Head of Robotics Education' },
    defaultHours: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export const CertificateTemplateModel: Model<ICertificateTemplate> =
  mongoose.models.CertificateTemplate ||
  mongoose.model<ICertificateTemplate>('CertificateTemplate', CertificateTemplateSchema);
