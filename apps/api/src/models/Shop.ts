import mongoose, { Schema, Document, Model } from 'mongoose';

// ==========================================
// Shop Model (with GeoJSON 2dsphere index)
// ==========================================
export interface IShop extends Document {
  id: string;
  name: string;
  ownerId?: string | null;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
  openingHours: string;
  categories: string[];
  inventory: Array<{
    componentName: string;
    inStock: boolean;
    estimatedPriceInr?: number;
  }>;
  photos: string[];
  googlePlaceId?: string | null;
  verifiedStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  lastVerifiedAt?: Date | null;
  ratingSummary: {
    averageRating: number;
    reviewCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    ownerId: {
      type: String,
      default: null,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    openingHours: {
      type: String,
      default: '10:00 AM - 8:00 PM (Mon-Sat)',
    },
    categories: {
      type: [String],
      default: ['Sensors', 'Microcontrollers', 'Motors', 'Tools'],
    },
    inventory: {
      type: [
        {
          componentName: { type: String, required: true },
          inStock: { type: Boolean, default: true },
          estimatedPriceInr: { type: Number },
        },
      ],
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    googlePlaceId: {
      type: String,
      sparse: true,
      index: true,
    },
    verifiedStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    ratingSummary: {
      averageRating: { type: Number, default: 4.5 },
      reviewCount: { type: Number, default: 1 },
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

// CRITICAL 2dsphere index for GeoJSON spatial queries ($near, $geoNear, $geoWithin)
ShopSchema.index({ location: '2dsphere' });
ShopSchema.index({ city: 1, verifiedStatus: 1 });
ShopSchema.index({ name: 'text', address: 'text', city: 'text' });

export const ShopModel: Model<IShop> =
  mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);

// ==========================================
// Shop Report Model
// ==========================================
export interface IShopReport extends Document {
  id: string;
  shopId: string;
  reporterUserId: string;
  reason: 'WRONG_LOCATION' | 'CLOSED_PERMANENTLY' | 'INCORRECT_PHONE' | 'OUT_OF_STOCK' | 'OTHER';
  comments?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: Date;
}

const ShopReportSchema = new Schema<IShopReport>(
  {
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    reporterUserId: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['WRONG_LOCATION', 'CLOSED_PERMANENTLY', 'INCORRECT_PHONE', 'OUT_OF_STOCK', 'OTHER'],
      required: true,
    },
    comments: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'RESOLVED'],
      default: 'PENDING',
      index: true,
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

export const ShopReportModel: Model<IShopReport> =
  mongoose.models.ShopReport || mongoose.model<IShopReport>('ShopReport', ShopReportSchema);

// ==========================================
// Store Product Model
// ==========================================
export interface IProduct extends Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  priceInr: number;
  stockQuantity: number;
  images: string[];
  model3DUrl?: string;
  specs?: Record<string, any>;
  rating: number;
  isKitOfMonth: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    priceInr: {
      type: Number,
      required: true,
    },
    stockQuantity: {
      type: Number,
      default: 100,
    },
    images: {
      type: [String],
      default: [],
    },
    model3DUrl: {
      type: String,
    },
    specs: {
      type: Schema.Types.Mixed,
      default: {},
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    isKitOfMonth: {
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

export const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

// ==========================================
// Order & Order Item Models
// ==========================================
export interface IOrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPriceInr: number;
  totalInr: number;
}

export interface IOrder extends Document {
  id: string;
  userId: string;
  orderNumber: string;
  items: IOrderItem[];
  taxBreakdown: Record<string, any>;
  shippingAddress: Record<string, any>;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  razorpayOrderId?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [
        {
          productId: { type: String, required: true },
          title: { type: String, required: true },
          quantity: { type: Number, required: true },
          unitPriceInr: { type: Number, required: true },
          totalInr: { type: Number, required: true },
        },
      ],
      required: true,
    },
    taxBreakdown: {
      type: Schema.Types.Mixed,
      required: true,
    },
    shippingAddress: {
      type: Schema.Types.Mixed,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    trackingNumber: {
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

OrderSchema.index({ userId: 1, createdAt: -1 });

export const OrderModel: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

// ==========================================
// Cart Model
// ==========================================
export interface ICart extends Document {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPriceInr: number;
  }>;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [
        {
          productId: { type: String, required: true },
          quantity: { type: Number, default: 1 },
          unitPriceInr: { type: Number, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const CartModel: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

// ==========================================
// Review Model
// ==========================================
export interface IReview extends Document {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
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

export const ReviewModel: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
