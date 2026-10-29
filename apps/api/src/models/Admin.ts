import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER_MENTOR = 'TEACHER_MENTOR',
  SUPPORT = 'SUPPORT',
  STORE_ADMIN = 'STORE_ADMIN',
}

export interface IAdminUser extends Document {
  id: string;
  userId: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  backupCodes: string[];
  department?: string;
  ipAllowlist: string[];
  sessionTimeoutMinutes: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.ADMIN,
      index: true,
    },
    permissions: {
      type: [String],
      default: ['students:read', 'students:manage', 'plans:read', 'plans:manage', 'analytics:read', 'audit:read'],
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
    department: {
      type: String,
      default: 'Robotics Education',
    },
    ipAllowlist: {
      type: [String],
      default: [],
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 30,
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
        delete ret.twoFactorSecret;
        delete ret.backupCodes;
        return ret;
      },
    },
  }
);

export const AdminUserModel: Model<IAdminUser> =
  mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);

// ==========================================
// Audit Log Model
// ==========================================
export interface IAuditLog extends Document {
  id: string;
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  targetEntity?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      index: true,
    },
    actorEmail: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetEntity: {
      type: String,
      index: true,
    },
    targetId: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    userAgent: {
      type: String,
      default: 'Unknown Client',
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
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

// Compound index for audit log queries
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ targetEntity: 1, targetId: 1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
