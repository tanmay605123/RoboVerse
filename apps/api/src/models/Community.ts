import mongoose, { Schema, Document, Model } from 'mongoose';

// ==========================================
// Robotics Hackathons & Events Model
// ==========================================
export interface IEvent extends Document {
  id: string;
  title: string;
  organizer: string;
  city: string;
  state: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  level: string;
  prizePoolInr: number;
  registrationDeadline: Date;
  eventDate: Date;
  url: string;
  description: string;
  isCurated: boolean;
  teamSizeMax: number;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    mode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'], default: 'HYBRID', index: true },
    level: { type: String, default: 'National' },
    prizePoolInr: { type: Number, default: 0 },
    registrationDeadline: { type: Date, required: true },
    eventDate: { type: Date, required: true, index: true },
    url: { type: String, required: true },
    description: { type: String, required: true },
    isCurated: { type: Boolean, default: true, index: true },
    teamSizeMax: { type: Number, default: 4 },
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

EventSchema.index({ eventDate: 1, city: 1 });

export const EventModel: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

// ==========================================
// In-App Notification Model
// ==========================================
export interface INotification extends Document {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ACHIEVEMENT' | 'HACKATHON' | 'BILLING' | 'CLASS';
  isRead: boolean;
  linkUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['INFO', 'ACHIEVEMENT', 'HACKATHON', 'BILLING', 'CLASS'],
      default: 'INFO',
    },
    isRead: { type: Boolean, default: false, index: true },
    linkUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

// ==========================================
// Forum Post & Comment Models
// ==========================================
export interface IPost extends Document {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  commentsCount: number;
  isSolution: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isSolution: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1, upvotes: -1 });

export const PostModel: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export interface IComment extends Document {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  content: string;
  upvotes: number;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CommentModel: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

// ==========================================
// Rituu Chat Session & Message Models
// ==========================================
export interface IChatSession extends Document {
  id: string;
  userId: string;
  projectId?: string;
  mode: 'DEBUG' | 'CODE' | 'PLAN' | 'LEARN' | 'VOICE';
  messagesCount: number;
  photoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true, index: true },
    projectId: { type: String, index: true },
    mode: {
      type: String,
      enum: ['DEBUG', 'CODE', 'PLAN', 'LEARN', 'VOICE'],
      default: 'DEBUG',
    },
    messagesCount: { type: Number, default: 0 },
    photoCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ChatSessionModel: Model<IChatSession> =
  mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);

export interface IChatMessage extends Document {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  errorDiagnosis?: string;
  appliedFixJson?: string;
  tokenUsage?: number;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    errorDiagnosis: { type: String },
    appliedFixJson: { type: String },
    tokenUsage: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatMessageModel: Model<IChatMessage> =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

// ==========================================
// Telemetry: ActivityEvent Model
// ==========================================
export interface IActivityEvent extends Document {
  id: string;
  userId: string;
  type:
    | 'PROJECT_OPENED'
    | 'PROJECT_EDITED'
    | 'SIMULATION_RUN'
    | 'CIRCUIT_SAVED'
    | 'LESSON_COMPLETED'
    | 'AI_MESSAGE'
    | 'QUIZ_SUBMITTED'
    | 'STORE_ORDER';
  entityId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const ActivityEventSchema = new Schema<IActivityEvent>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        'PROJECT_OPENED',
        'PROJECT_EDITED',
        'SIMULATION_RUN',
        'CIRCUIT_SAVED',
        'LESSON_COMPLETED',
        'AI_MESSAGE',
        'QUIZ_SUBMITTED',
        'STORE_ORDER',
      ],
      required: true,
      index: true,
    },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

ActivityEventSchema.index({ userId: 1, timestamp: -1 });

export const ActivityEventModel: Model<IActivityEvent> =
  mongoose.models.ActivityEvent || mongoose.model<IActivityEvent>('ActivityEvent', ActivityEventSchema);

// ==========================================
// Pre-computed Daily Analytics (DailyStats)
// ==========================================
export interface IDailyStats extends Document {
  id: string;
  date: string; // YYYY-MM-DD
  activeStudentsCount: number;
  newSignupsCount: number;
  simulationsRunCount: number;
  circuitsCreatedCount: number;
  rituuMessagesCount: number;
  photoAnalysesCount: number;
  grossRevenueInr: number;
  planDistribution: {
    free: number;
    plus: number;
    pro: number;
    institution: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DailyStatsSchema = new Schema<IDailyStats>(
  {
    date: { type: String, required: true, unique: true, index: true },
    activeStudentsCount: { type: Number, default: 0 },
    newSignupsCount: { type: Number, default: 0 },
    simulationsRunCount: { type: Number, default: 0 },
    circuitsCreatedCount: { type: Number, default: 0 },
    rituuMessagesCount: { type: Number, default: 0 },
    photoAnalysesCount: { type: Number, default: 0 },
    grossRevenueInr: { type: Number, default: 0 },
    planDistribution: {
      free: { type: Number, default: 0 },
      plus: { type: Number, default: 0 },
      pro: { type: Number, default: 0 },
      institution: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const DailyStatsModel: Model<IDailyStats> =
  mongoose.models.DailyStats || mongoose.model<IDailyStats>('DailyStats', DailyStatsSchema);
