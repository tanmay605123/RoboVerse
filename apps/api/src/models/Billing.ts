import mongoose, { Schema, Document, Model } from 'mongoose';
import { PlanTier, BillingCycle, SubscriptionStatus } from '@roboverse/shared';

// ==========================================
// Plan Model
// ==========================================
export interface IPlan extends Document {
  id: string;
  tier: PlanTier;
  name: string;
  tagline: string;
  isPopular: boolean;
  badge?: string | null;
  pricing: Array<{
    cycle: BillingCycle;
    priceInrInclusiveGst: number;
    discountPercentage?: number;
    label: string;
  }>;
  features: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    tier: {
      type: String,
      enum: Object.values(PlanTier),
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: null,
    },
    pricing: {
      type: [
        {
          cycle: { type: String, enum: Object.values(BillingCycle), required: true },
          priceInrInclusiveGst: { type: Number, required: true },
          discountPercentage: { type: Number },
          label: { type: String, required: true },
        },
      ],
      required: true,
    },
    features: {
      type: Schema.Types.Mixed,
      required: true,
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

export const PlanModel: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);

// ==========================================
// Subscription Model
// ==========================================
export interface ISubscription extends Document {
  id: string;
  userId: string;
  planId: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus | string;
  razorpaySubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  gracePeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planId: {
      type: String,
      required: true,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
      default: BillingCycle.MONTHLY,
    },
    status: {
      type: String,
      default: 'ACTIVE',
      index: true,
    },
    razorpaySubscriptionId: {
      type: String,
      sparse: true,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    gracePeriodEnd: {
      type: Date,
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

SubscriptionSchema.index({ userId: 1, status: 1 });

export const SubscriptionModel: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

// ==========================================
// Payment Model
// ==========================================
export interface IPayment extends Document {
  id: string;
  userId: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amountInr: number;
  currency: string;
  status: 'CREATED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  planTier?: PlanTier;
  billingCycle?: BillingCycle;
  customerState?: string;
  taxBreakdown?: Record<string, any>;
  subscriptionId?: string;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    amountInr: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['CREATED', 'CAPTURED', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    planTier: {
      type: String,
      enum: Object.values(PlanTier),
    },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
    },
    customerState: {
      type: String,
      default: 'Delhi',
    },
    taxBreakdown: {
      type: Schema.Types.Mixed,
    },
    subscriptionId: {
      type: String,
    },
    invoiceId: {
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

PaymentSchema.index({ userId: 1, createdAt: -1 });

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

// ==========================================
// QRPayment Model (Dynamic UPI QR with TTL)
// ==========================================
export interface IQRPayment extends Document {
  id: string;
  userId: string;
  planTier: PlanTier;
  billingCycle: BillingCycle;
  qrCodeId: string;
  qrImageUrl: string;
  upiIntentString: string;
  amountInr: number;
  status: 'PENDING' | 'CREDITED' | 'EXPIRED' | 'FAILED';
  expiresAt: Date;
  razorpayPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QRPaymentSchema = new Schema<IQRPayment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planTier: {
      type: String,
      enum: Object.values(PlanTier),
      required: true,
    },
    billingCycle: {
      type: String,
      enum: Object.values(BillingCycle),
      required: true,
    },
    qrCodeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrImageUrl: {
      type: String,
      required: true,
    },
    upiIntentString: {
      type: String,
      required: true,
    },
    amountInr: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CREDITED', 'EXPIRED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL Index: auto-delete or expire document after expiresAt
    },
    razorpayPaymentId: {
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

export const QRPaymentModel: Model<IQRPayment> =
  mongoose.models.QRPayment || mongoose.model<IQRPayment>('QRPayment', QRPaymentSchema);

// ==========================================
// Coupon Model
// ==========================================
export interface ICoupon extends Document {
  id: string;
  code: string;
  discountPercentage?: number | null;
  discountAmountInr?: number | null;
  minOrderAmountInr: number;
  validFrom: Date;
  validUntil: Date;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountPercentage: {
      type: Number,
      default: null,
    },
    discountAmountInr: {
      type: Number,
      default: null,
    },
    minOrderAmountInr: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

export const CouponModel: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

// ==========================================
// UsageMeter Model (Daily Quotas)
// ==========================================
export interface IUsageMeter extends Document {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  planTier: PlanTier;
  studentId: string;
  rituuMessagesCount: number;
  photoAnalysesCount: number;
  aiTokensUsed: number;
  estimatedAiCostInr: number;
  createdAt: Date;
  updatedAt: Date;
}

const UsageMeterSchema = new Schema<IUsageMeter>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    planTier: {
      type: String,
      enum: Object.values(PlanTier),
      default: PlanTier.FREE,
    },
    studentId: {
      type: String,
      required: true,
    },
    rituuMessagesCount: {
      type: Number,
      default: 0,
    },
    photoAnalysesCount: {
      type: Number,
      default: 0,
    },
    aiTokensUsed: {
      type: Number,
      default: 0,
    },
    estimatedAiCostInr: {
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

// Compound unique index on userId + date
UsageMeterSchema.index({ userId: 1, date: 1 }, { unique: true });

export const UsageMeterModel: Model<IUsageMeter> =
  mongoose.models.UsageMeter || mongoose.model<IUsageMeter>('UsageMeter', UsageMeterSchema);
