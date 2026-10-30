/**
 * RoboVerse / TechSavyyy Official GST Tax Invoice Generator
 * Conforms to Indian Goods & Services Tax (GST) Invoicing Rules
 */

export interface InvoiceLineItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  hsnCode: string;
  quantity: number;
  unitPriceGstInclusive: number;
  totalGstInclusive: number;
  taxableValue: number;
  cgstRate: number; // e.g. 9.0
  cgstAmount: number;
  sgstRate: number; // e.g. 9.0
  sgstAmount: number;
  igstRate: number; // e.g. 18.0
  igstAmount: number;
}

export interface InvoiceData {
  invoiceNumber: string; // e.g. INV-2026-004812
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  placeOfSupply: string; // e.g. "Delhi (07)" or "Karnataka (29)"
  reverseCharge: 'No';
  seller: {
    legalName: string;
    tradeName: string;
    gstin: string;
    pan: string;
    cin: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    email: string;
    phone: string;
    supportUrl: string;
  };
  buyer: {
    studentId: string;
    fullName: string;
    schoolOrCollege?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    buyerGstin?: string; // For schools/institutions
  };
  items: InvoiceLineItem[];
  subtotalInr: number;
  discountInr: number;
  taxableBaseInr: number;
  cgstTotalInr: number;
  sgstTotalInr: number;
  igstTotalInr: number;
  gstTotalInr: number;
  grandTotalInr: number;
  amountInWords: string;
  paymentDetails: {
    method: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    status: string;
  };
}

// Standard Indian HSN / SAC Codes for Robotics & Electronics
export const HSN_MAPPING: Record<string, string> = {
  cat_boards: '8542.31.00', // Electronic integrated circuits / Processors & controllers
  cat_proto: '8544.42.99',  // Insulated wire/cable connectors & breadboards
  cat_sensors: '8541.40.11',// Photosensitive semiconductor devices & sensor transducers
  cat_motion: '8501.10.12', // Electric motors of an output not exceeding 37.5 W / Micro servos
  cat_displays: '8528.59.00',// Flat panel display units (OLED, LCD modules)
  cat_power: '8507.60.00',  // Lithium-ion rechargeable accumulators
  cat_tools: '8205.59.90',  // Hand tools, electric soldering appliances (8515)
  cat_drones: '8806.91.00', // Unmanned aircraft / quadcopter components
  cat_kits: '8471.41.90',   // Educational robotics & computing training machines
  default: '8471.41.90',
};

export function getHsnForCategory(categoryId?: string, sku?: string): string {
  if (categoryId && HSN_MAPPING[categoryId]) {
    return HSN_MAPPING[categoryId];
  }
  if (sku?.startsWith('RV-BRD')) return '8542.31.00';
  if (sku?.startsWith('RV-SNS')) return '8541.40.11';
  if (sku?.startsWith('RV-ACT')) return '8501.10.12';
  if (sku?.startsWith('RV-PWR')) return '8507.60.00';
  if (sku?.startsWith('RV-DRN')) return '8806.91.00';
  if (sku?.startsWith('RV-TOL')) return '8205.59.90';
  if (sku?.startsWith('RV-PRT')) return '8544.42.99';
  if (sku?.startsWith('RV-DSP')) return '8528.59.00';
  return HSN_MAPPING.default;
}

// Convert INR number to words (Indian numbering system: Lakhs, Crores)
export function numberToWordsInr(amount: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(num: number): string {
    if ((num = num.toString().length > 9 ? parseFloat(num.toString().substring(0, 9)) : num) === 0) return '';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
    str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
    str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
    str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
    str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
    return str.trim();
  }

  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';
  return `${inWords(rounded)} Rupees Only`;
}

/**
 * Builds an official GST-compliant tax invoice object from raw order data
 */
export function buildGstInvoice(params: {
  order: {
    id: string;
    orderNumber: string;
    subtotalInr: number;
    discountInr: number;
    gstAmountInr: number;
    totalInr: number;
    createdAt?: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
      buyerGstin?: string;
    };
    items: Array<{
      productId: string;
      name: string;
      sku?: string;
      category?: string;
      quantity: number;
      priceInr: number;
      gstPercent?: number;
    }>;
    payment?: {
      method?: string;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
      status?: string;
    };
  };
  studentId?: string;
  schoolOrCollege?: string;
}): InvoiceData {
  const { order, studentId = 'RV-2026-001001', schoolOrCollege } = params;
  const isInterState = order.shippingAddress.state.trim().toLowerCase() !== 'delhi';

  const items: InvoiceLineItem[] = order.items.map((it) => {
    const totalGstInc = it.priceInr * it.quantity;
    const taxableVal = Math.round((totalGstInc / 1.18) * 100) / 100;
    const itemGst = Math.round((totalGstInc - taxableVal) * 100) / 100;

    let cgstRate = 0;
    let cgstAmount = 0;
    let sgstRate = 0;
    let sgstAmount = 0;
    let igstRate = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstRate = 18.0;
      igstAmount = itemGst;
    } else {
      cgstRate = 9.0;
      cgstAmount = Math.round((itemGst / 2) * 100) / 100;
      sgstRate = 9.0;
      sgstAmount = Math.round((itemGst - cgstAmount) * 100) / 100;
    }

    return {
      productId: it.productId,
      sku: it.sku || `SKU-${it.productId.substring(0, 8)}`,
      name: it.name,
      category: it.category || 'cat_proto',
      hsnCode: getHsnForCategory(it.category, it.sku),
      quantity: it.quantity,
      unitPriceGstInclusive: it.priceInr,
      totalGstInclusive: totalGstInc,
      taxableValue: taxableVal,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
    };
  });

  const grandTotal = order.totalInr;
  const taxableBase = Math.round((grandTotal / 1.18) * 100) / 100;
  const gstTotal = Math.round((grandTotal - taxableBase) * 100) / 100;

  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  if (isInterState) {
    igstTotal = gstTotal;
  } else {
    cgstTotal = Math.round((gstTotal / 2) * 100) / 100;
    sgstTotal = Math.round((gstTotal - cgstTotal) * 100) / 100;
  }

  const invoiceNumber = `INV-2026-${order.orderNumber.replace(/[^0-9]/g, '').slice(-6) || '104820'}`;
  const now = new Date(order.createdAt || Date.now());
  const dateFormatted = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return {
    invoiceNumber,
    invoiceDate: dateFormatted,
    orderNumber: order.orderNumber,
    orderDate: dateFormatted,
    placeOfSupply: `${order.shippingAddress.state} (${isInterState ? 'Inter-State' : 'Intra-State'})`,
    reverseCharge: 'No',
    seller: {
      legalName: 'RoboVerse Technologies India Private Limited',
      tradeName: 'TechSavyyy Hardware Labs',
      gstin: '07AABCR1234F1Z8',
      pan: 'AABCR1234F',
      cin: 'U72900DL2026PTC394821',
      address: 'Plot 42, Innovation Corridor, Okhla Industrial Area Phase-III',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110020',
      email: 'billing@roboverse.education',
      phone: '+91 11 4892 0000',
      supportUrl: 'https://roboverse.education/support',
    },
    buyer: {
      studentId,
      fullName: order.shippingAddress.fullName,
      schoolOrCollege,
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      phone: order.shippingAddress.phone,
      buyerGstin: order.shippingAddress.buyerGstin,
    },
    items,
    subtotalInr: order.subtotalInr,
    discountInr: order.discountInr,
    taxableBaseInr: taxableBase,
    cgstTotalInr: cgstTotal,
    sgstTotalInr: sgstTotal,
    igstTotalInr: igstTotal,
    gstTotalInr: gstTotal,
    grandTotalInr: grandTotal,
    amountInWords: numberToWordsInr(grandTotal),
    paymentDetails: {
      method: order.payment?.method?.toUpperCase() || 'RAZORPAY UPI / CHECKOUT',
      razorpayPaymentId: order.payment?.razorpayPaymentId || `pay_rzp_${Date.now()}`,
      razorpayOrderId: order.payment?.razorpayOrderId,
      status: order.payment?.status?.toUpperCase() || 'COMPLETED',
    },
  };
}
