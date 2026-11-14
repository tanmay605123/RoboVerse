import { calculateGst, GstInvoice, BillingCycle, PaymentMethodType } from '@roboverse/shared';
import { ENV } from '../config/env';

let invoiceSequence = 1000;

export function generateGstInvoice(params: {
  orderId: string;
  userId: string;
  studentId: string;
  customerName: string;
  customerEmail: string;
  customerState: string;
  customerGstin?: string;
  planName: string;
  billingCycle: BillingCycle;
  grossAmountInr: number;
  paymentMethod?: PaymentMethodType;
  paymentId: string;
}): GstInvoice {
  invoiceSequence += 1;
  const invoiceNumber = `RV-INV-2026-${invoiceSequence.toString().padStart(5, '0')}`;
  
  // Intra-state if customer is in Haryana (same as RoboVerse), else inter-state (IGST)
  const isInterState = !params.customerState.toLowerCase().includes('haryana');
  const tax = calculateGst(params.grossAmountInr, isInterState);

  return {
    id: `inv_${Date.now()}_${invoiceSequence}`,
    invoiceNumber,
    orderId: params.orderId,
    userId: params.userId,
    studentId: params.studentId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerState: params.customerState,
    customerGstin: params.customerGstin,
    companyName: ENV.ROBOVERSE_COMPANY_NAME,
    companyGstin: ENV.ROBOVERSE_GSTIN,
    companyAddress: ENV.ROBOVERSE_COMPANY_ADDRESS,
    companyHsnCode: ENV.ROBOVERSE_HSN_CODE,
    items: [
      {
        description: `RoboVerse ${params.planName} - ${params.billingCycle} Access`,
        billingCycle: params.billingCycle,
        quantity: 1,
        unitPrice: tax.baseAmountInr,
        grossPrice: params.grossAmountInr,
      },
    ],
    tax,
    paymentMethod: params.paymentMethod || PaymentMethodType.UPI,
    paymentId: params.paymentId,
    issuedAt: new Date().toISOString(),
    status: 'PAID',
  };
}
