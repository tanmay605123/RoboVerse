import { z } from 'zod';
import { PlanTier } from './plans';

export type ShippingClass = 'standard' | 'battery' | 'regulated_drone';

export interface ProductSpecification {
  [key: string]: string | number | boolean;
}

export interface StoreProduct {
  id: string;
  sku: string;
  name: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  categoryId: string;
  priceInr: number; // GST-inclusive
  mrpInr: number;
  gstPercent: number; // 18.00
  stock: number;
  stockQuantity: number;
  images: string[];
  specs?: ProductSpecification;
  componentId?: string | null;
  ageRestricted: boolean;
  shippingClass: ShippingClass;
  rating: number;
  reviewsCount: number;
  isKit?: boolean;
  isKitOfMonth?: boolean;
  isActive: boolean;
  courseId?: string;
  robotTemplateId?: string;
  sumOfPartsInr?: number;
}

export interface StoreCartItem {
  productId: string;
  quantity: number;
  product?: StoreProduct;
}

export interface OrderTaxBreakdown {
  grossAmountInr: number;    // Gross inclusive total
  baseAmountInr: number;     // Amount excluding GST (gross / 1.18)
  totalTaxAmountInr: number; // Gross - Base
  cgstAmountInr: number;     // 9%
  sgstAmountInr: number;     // 9%
  igstAmountInr: number;     // 18% if interstate
  gstRatePercentage: number; // 18%
  discountAmountInr: number;
  discountPercentage: number;
  planTier: PlanTier;
}

export interface ShippingAddressInput {
  fullName?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderCalculationInput {
  userId?: string;
  userPlanTier: PlanTier;
  isMinor: boolean;
  hasParentalConsent: boolean;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddressInput;
  catalogProducts: Record<string, StoreProduct>;
}

export interface OrderCalculationResult {
  orderNumber: string;
  items: Array<{
    productId: string;
    sku: string;
    title: string;
    quantity: number;
    unitPriceInr: number;
    totalPriceInr: number;
    ageRestricted: boolean;
    shippingClass: ShippingClass;
  }>;
  subtotalInr: number;
  discountAmountInr: number;
  discountPercentage: number;
  finalAmountInr: number;
  taxBreakdown: OrderTaxBreakdown;
  shippingClass: ShippingClass;
  shippingFeeInr: number;
  estimatedDeliveryDays: number;
  ageRestrictionNotice?: string;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmountInr: number;
  taxBreakdown: OrderTaxBreakdown;
  shippingAddress: ShippingAddressInput;
  shippingClass: ShippingClass;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  createdAt: string;
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    unitPriceInr: number;
    totalPriceInr: number;
  }>;
}

/**
 * Calculates authoritative order pricing and tax strictly on server side.
 * Never trust client pricing!
 */
export function calculateAuthoritativeOrder(input: OrderCalculationInput): OrderCalculationResult {
  if (!input.items || input.items.length === 0) {
    throw new Error('Cart cannot be empty for checkout calculation.');
  }

  let subtotal = 0;
  let highestShipping: ShippingClass = 'standard';
  const resolvedItems = [];

  for (const item of input.items) {
    if (item.quantity <= 0) {
      throw new Error(`Invalid item quantity ${item.quantity}. Must be at least 1.`);
    }

    const catalogProd = input.catalogProducts[item.productId];
    if (!catalogProd) {
      throw new Error(`Product not found in official catalog: ${item.productId}`);
    }

    if (catalogProd.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${catalogProd.name}". Only ${catalogProd.stock} units available.`
      );
    }

    if (catalogProd.ageRestricted && input.isMinor && !input.hasParentalConsent) {
      throw new Error(
        `Product "${catalogProd.name}" is age-restricted (18+). Parental consent verification required before ordering.`
      );
    }

    // Determine highest shipping class
    if (catalogProd.shippingClass === 'regulated_drone') {
      highestShipping = 'regulated_drone';
    } else if (catalogProd.shippingClass === 'battery' && highestShipping !== 'regulated_drone') {
      highestShipping = 'battery';
    }

    const itemTotal = catalogProd.priceInr * item.quantity;
    subtotal += itemTotal;

    resolvedItems.push({
      productId: catalogProd.id,
      sku: catalogProd.sku,
      title: catalogProd.title,
      quantity: item.quantity,
      unitPriceInr: catalogProd.priceInr,
      totalPriceInr: itemTotal,
      ageRestricted: catalogProd.ageRestricted,
      shippingClass: catalogProd.shippingClass,
    });
  }

  // Member discount based on plan tier
  let discountPercentage = 0;
  if (input.userPlanTier === PlanTier.PRO) {
    discountPercentage = 10;
  } else if (input.userPlanTier === PlanTier.PLUS) {
    discountPercentage = 5;
  }

  const discountAmountInr = Math.round((subtotal * discountPercentage) / 100);
  const finalAmountInr = Math.max(0, subtotal - discountAmountInr);

  // Authoritative 18% GST Breakdown:
  // Base = Gross / 1.18
  const baseAmountInr = Number((finalAmountInr / 1.18).toFixed(2));
  const totalTaxAmountInr = Number((finalAmountInr - baseAmountInr).toFixed(2));
  const cgstAmountInr = Number((totalTaxAmountInr / 2).toFixed(2));
  const sgstAmountInr = Number((totalTaxAmountInr - cgstAmountInr).toFixed(2));

  const taxBreakdown: OrderTaxBreakdown = {
    grossAmountInr: finalAmountInr,
    baseAmountInr,
    totalTaxAmountInr,
    cgstAmountInr,
    sgstAmountInr,
    igstAmountInr: 0,
    gstRatePercentage: 18,
    discountAmountInr,
    discountPercentage,
    planTier: input.userPlanTier,
  };

  // Shipping fee is free across India for all kits and orders over 499
  const shippingFeeInr = finalAmountInr >= 499 ? 0 : 49;
  const estimatedDeliveryDays = highestShipping === 'regulated_drone' ? 5 : highestShipping === 'battery' ? 4 : 2;

  const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const currentYear = new Date().getFullYear();
  const orderNumber = `TS-${currentYear}-${randomHash}`;

  return {
    orderNumber,
    items: resolvedItems,
    subtotalInr: subtotal,
    discountAmountInr,
    discountPercentage,
    finalAmountInr,
    taxBreakdown,
    shippingClass: highestShipping,
    shippingFeeInr,
    estimatedDeliveryDays,
    ageRestrictionNotice:
      highestShipping === 'regulated_drone'
        ? 'Regulated drone hardware: Complies with DGCA guidelines. Delivery via verified surface courier.'
        : undefined,
  };
}
