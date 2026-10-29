import mongoose, { Schema, Document, Model } from 'mongoose';

// ==========================================
// Institution Model
// ==========================================
export interface IInstitution extends Document {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  address: string;
  city: string;
  state: string;
  studentCount: number;
  licenseExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    contactEmail: { type: String, required: true },
    address: { type: String, default: '' },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    studentCount: { type: Number, default: 50 },
    licenseExpiry: { type: Date, required: true },
  },
  { timestamps: true }
);

export const InstitutionModel: Model<IInstitution> =
  mongoose.models.Institution || mongoose.model<IInstitution>('Institution', InstitutionSchema);

// ==========================================
// Batch Model
// ==========================================
export interface IBatch extends Document {
  id: string;
  institutionId: string;
  name: string;
  year: string;
  mentorId: string;
  studentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    institutionId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    year: { type: String, default: '2026' },
    mentorId: { type: String, required: true, index: true },
    studentIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const BatchModel: Model<IBatch> =
  mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

// ==========================================
// Generic Project Model
// ==========================================
export interface IProject extends Document {
  id: string;
  userId: string;
  title: string;
  type: 'SAMPLE' | 'USER' | 'COMMUNITY' | 'CHALLENGE';
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['SAMPLE', 'USER', 'COMMUNITY', 'CHALLENGE'], default: 'USER' },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const ProjectModel: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
