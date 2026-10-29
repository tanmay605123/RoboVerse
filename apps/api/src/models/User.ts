import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, UserStatus } from '@roboverse/shared';

export interface IUser extends Document {
  id: string;
  email: string;
  mobileNumber?: string;
  passwordHash?: string | null;
  role: UserRole;
  status: UserStatus;
  referralCode?: string;
  referredById?: string;
  googleId?: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  backupCodes: string[];
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.FREE_STUDENT,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
      index: true,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    referredById: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    twoFactorSecret: {
      type: String,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    backupCodes: {
      type: [String],
      default: [],
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.twoFactorSecret;
        delete ret.backupCodes;
        return ret;
      },
    },
  }
);

// Compound index for admin listing and queries
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ==========================================
// Student Profile Model
// ==========================================
export interface IStudentProfile extends Document {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  parentEmail?: string | null;
  parentalConsentGiven: boolean;
  institutionType: 'school' | 'college' | 'university' | 'self_learner';
  schoolOrCollegeName: string;
  classOrYear: string;
  city: string;
  state: string;
  country: string;
  interests: string[];
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  streakDays: number;
  totalLearningHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
    },
    parentEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    parentalConsentGiven: {
      type: Boolean,
      default: false,
    },
    institutionType: {
      type: String,
      enum: ['school', 'college', 'university', 'self_learner'],
      default: 'school',
    },
    schoolOrCollegeName: {
      type: String,
      required: true,
      trim: true,
    },
    classOrYear: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    interests: {
      type: [String],
      default: ['arduino'],
    },
    avatarUrl: {
      type: String,
    },
    bio: {
      type: String,
      default: 'Aspiring roboticist & electronics builder at RoboVerse',
    },
    level: {
      type: Number,
      default: 1,
    },
    xp: {
      type: Number,
      default: 50,
    },
    streakDays: {
      type: Number,
      default: 1,
    },
    totalLearningHours: {
      type: Number,
      default: 0,
    },
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

// Text index for search
StudentProfileSchema.index({ fullName: 'text', schoolOrCollegeName: 'text', city: 'text' });
StudentProfileSchema.index({ city: 1, state: 1 });
StudentProfileSchema.index({ xp: -1 });

export const StudentProfileModel: Model<IStudentProfile> =
  mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

// ==========================================
// StudentID Model
// ==========================================
export interface IStudentID extends Document {
  id: string;
  userId: string;
  studentId: string; // e.g. RV-2026-000101
  qrCodeDataUrl: string;
  verificationHash: string;
  verificationUrl: string;
  issuedAt: Date;
  validUntil: Date;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  createdAt: Date;
  updatedAt: Date;
}

const StudentIDSchema = new Schema<IStudentID>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    qrCodeDataUrl: {
      type: String,
      required: true,
    },
    verificationHash: {
      type: String,
      required: true,
    },
    verificationUrl: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
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

export const StudentIDModel: Model<IStudentID> =
  mongoose.models.StudentID || mongoose.model<IStudentID>('StudentID', StudentIDSchema);
