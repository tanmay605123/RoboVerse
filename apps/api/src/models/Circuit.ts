import mongoose, { Schema, Document, Model } from 'mongoose';

// ==========================================
// Component Definition Model (~60 components)
// ==========================================
export interface IComponentDef extends Document {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  model3DUrl: string;
  datasheetUrl?: string | null;
  isFreeTier: boolean;
  priceInr: number;
  pins: Array<{
    id: string;
    label: string;
    type: 'POWER' | 'GROUND' | 'DIGITAL' | 'ANALOG' | 'PWM' | 'I2C' | 'SPI' | 'PASSIVE';
    description?: string;
  }>;
  defaultProperties: Record<string, any>;
  svgPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComponentDefSchema = new Schema<IComponentDef>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
    },
    model3DUrl: {
      type: String,
      required: true,
    },
    datasheetUrl: {
      type: String,
      default: null,
    },
    isFreeTier: {
      type: Boolean,
      default: true,
      index: true,
    },
    priceInr: {
      type: Number,
      default: 0,
    },
    pins: {
      type: [
        {
          id: { type: String, required: true },
          label: { type: String, required: true },
          type: { type: String, required: true },
          description: { type: String },
        },
      ],
      default: [],
    },
    defaultProperties: {
      type: Schema.Types.Mixed,
      default: {},
    },
    svgPath: {
      type: String,
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

ComponentDefSchema.index({ category: 1, isFreeTier: 1 });

export const ComponentDefModel: Model<IComponentDef> =
  mongoose.models.ComponentDef || mongoose.model<IComponentDef>('ComponentDef', ComponentDefSchema);

// ==========================================
// Circuit Project Model
// ==========================================
export interface ICircuitProject extends Document {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  category?: string;
  componentsJson: string;
  wiresJson: string;
  codeSnippet?: string;
  blocksXml?: string;
  thumbnailUrl?: string;
  remixOfId?: string | null;
  isStarter: boolean;
  viewCount: number;
  likeCount: number;
  forkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CircuitProjectSchema = new Schema<ICircuitProject>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    category: {
      type: String,
      default: 'BASIC',
      index: true,
    },
    componentsJson: {
      type: String,
      default: '[]',
    },
    wiresJson: {
      type: String,
      default: '[]',
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    blocksXml: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
    },
    remixOfId: {
      type: String,
      default: null,
    },
    isStarter: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    forkCount: {
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

CircuitProjectSchema.index({ userId: 1, updatedAt: -1 });
CircuitProjectSchema.index({ isPublic: 1, likeCount: -1 });

export const CircuitProjectModel: Model<ICircuitProject> =
  mongoose.models.CircuitProject || mongoose.model<ICircuitProject>('CircuitProject', CircuitProjectSchema);

// ==========================================
// Project Version Model (Autosave & History)
// ==========================================
export interface IProjectVersion extends Document {
  id: string;
  projectId: string;
  versionNumber: number;
  snapshotJson: string;
  commitMessage?: string;
  createdAt: Date;
}

const ProjectVersionSchema = new Schema<IProjectVersion>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    snapshotJson: {
      type: String,
      required: true,
    },
    commitMessage: {
      type: String,
      default: 'Autosave snapshot',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

ProjectVersionSchema.index({ projectId: 1, versionNumber: -1 });

export const ProjectVersionModel: Model<IProjectVersion> =
  mongoose.models.ProjectVersion || mongoose.model<IProjectVersion>('ProjectVersion', ProjectVersionSchema);

// ==========================================
// Sample Project Model
// ==========================================
export interface ISampleProject extends Document {
  id: string;
  slug: string;
  title: string;
  description: string;
  track: 'HARDWARE' | 'SOFTWARE' | 'ROBOTICS' | 'DRONES';
  componentsJson: string;
  wiresJson: string;
  codeSnippet: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedCostInr: number;
  scenarioDescription: string;
  quizQuestions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SampleProjectSchema = new Schema<ISampleProject>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    track: {
      type: String,
      enum: ['HARDWARE', 'SOFTWARE', 'ROBOTICS', 'DRONES'],
      required: true,
    },
    componentsJson: {
      type: String,
      required: true,
    },
    wiresJson: {
      type: String,
      required: true,
    },
    codeSnippet: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER',
    },
    estimatedCostInr: {
      type: Number,
      default: 0,
    },
    scenarioDescription: {
      type: String,
      required: true,
    },
    quizQuestions: {
      type: [
        {
          question: { type: String, required: true },
          options: { type: [String], required: true },
          correctIndex: { type: Number, required: true },
          explanation: { type: String, required: true },
        },
      ],
      default: [],
    },
    badges: {
      type: [String],
      default: [],
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

export const SampleProjectModel: Model<ISampleProject> =
  mongoose.models.SampleProject || mongoose.model<ISampleProject>('SampleProject', SampleProjectSchema);

// ==========================================
// Project Collection Model
// ==========================================
export interface ICollection extends Document {
  id: string;
  userId: string;
  title: string;
  description?: string;
  projectIds: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    projectIds: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
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

export const CollectionModel: Model<ICollection> =
  mongoose.models.Collection || mongoose.model<ICollection>('Collection', CollectionSchema);

// ==========================================
// Simulation Event Model
// ==========================================
export interface ISimulation extends Document {
  id: string;
  userId: string;
  projectId: string;
  durationSeconds: number;
  peakCurrentAmps?: number;
  warningsEncountered: string[];
  status: 'COMPLETED' | 'CRASHED' | 'INTERRUPTED';
  createdAt: Date;
}

const SimulationSchema = new Schema<ISimulation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    peakCurrentAmps: {
      type: Number,
      default: 0,
    },
    warningsEncountered: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'CRASHED', 'INTERRUPTED'],
      default: 'COMPLETED',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

SimulationSchema.index({ userId: 1, createdAt: -1 });

export const SimulationModel: Model<ISimulation> =
  mongoose.models.Simulation || mongoose.model<ISimulation>('Simulation', SimulationSchema);
