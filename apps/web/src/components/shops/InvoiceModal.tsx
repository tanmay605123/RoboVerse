'use client';

import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';
import { InvoiceData } from '@/lib/invoice/generateInvoice';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#07110D] border border-[#39FF6A]/30 rounded-2xl shadow-2xl overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 bg-[#0A1813] border-b border-gray-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#39FF6A]" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              GST Tax Invoice • {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#39FF6A] text-black font-bold text-xs rounded-lg hover:brightness-110 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-8 font-sans text-xs bg-[#07110D] print:bg-white text-gray-200 print:text-black space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-800 print:border-gray-300 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#39FF6A] text-black font-bold flex items-center justify-center font-mono text-sm">
                  RV
                </div>
                <h1 className="text-lg font-bold tracking-tight text-white print:text-black">
                  {invoice.seller.legalName}
                </h1>
              </div>
              <p className="text-[11px] text-gray-400 print:text-gray-600 mt-1">
                {invoice.seller.tradeName}
              </p>
              <p className="text-[10px] text-gray-400 print:text-gray-600 mt-1 max-w-sm">
                {invoice.seller.address}, {invoice.seller.city}, {invoice.seller.state} - {invoice.seller.pincode}
              </p>
              <p className="text-[10px] font-mono text-gray-300 print:text-gray-700 mt-1">
                <span className="font-bold text-[#39FF6A] print:text-black">GSTIN:</span> {invoice.seller.gstin} | <span className="font-bold">PAN:</span> {invoice.seller.pan}
              </p>
              <p className="text-[9px] font-mono text-gray-500 print:text-gray-500">
                CIN: {invoice.seller.cin}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block bg-[#39FF6A]/10 border border-[#39FF6A]/30 print:border-gray-400 px-3 py-1 rounded text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#39FF6A] print:text-black font-bold">
                  TAX INVOICE
                </span>
              </div>
              <div className="mt-2 text-sm font-mono font-bold text-white print:text-black">
                {invoice.invoiceNumber}
              </div>
              <div className="text-[10px] font-mono text-gray-400 print:text-gray-600 mt-0.5">
                Date: {invoice.invoiceDate}
              </div>
              <div className="text-[10px] font-mono text-gray-400 print:text-gray-600">
                Order: {invoice.orderNumber}
              </div>
              <div className="text-[9px] font-mono text-gray-500 print:text-gray-500 mt-1">
                Place of Supply: {invoice.placeOfSupply}
              </div>
            </div>
          </div>

          {/* Buyer & Billing Info */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-black/40 print:bg-gray-50 rounded-xl border border-gray-800/80 print:border-gray-200">
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-gray-400 print:text-gray-600 font-bold mb-1">
                Billed To (Student / Institution):
              </h3>
              <p className="font-bold text-sm text-white print:text-black">
                {invoice.buyer.fullName}
              </p>
              <p className="text-[10px] font-mono text-[#39FF6A] print:text-black">
                Student ID: {invoice.buyer.studentId}
              </p>
              {invoice.buyer.schoolOrCollege && (
                <p className="text-[10px] text-gray-300 print:text-gray-700">
                  {invoice.buyer.schoolOrCollege}
                </p>
              )}
              {invoice.buyer.buyerGstin && (
                <p className="text-[10px] font-mono text-gray-300 print:text-gray-700">
                  Buyer GSTIN: {invoice.buyer.buyerGstin}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-gray-400 print:text-gray-600 font-bold mb-1">
                Shipping Destination:
              </h3>
              <p className="text-[10px] text-gray-300 print:text-gray-700">
                {invoice.buyer.addressLine1}
                {invoice.buyer.addressLine2 ? `, ${invoice.buyer.addressLine2}` : ''}
              </p>
              <p className="text-[10px] text-gray-300 print:text-gray-700">
                {invoice.buyer.city}, {invoice.buyer.state} - {invoice.buyer.pincode}
              </p>
              <p className="text-[10px] text-gray-300 print:text-gray-700 mt-0.5">
                Phone: {invoice.buyer.phone}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 print:border-gray-300 text-[10px] font-mono uppercase text-gray-400 print:text-gray-600">
                  <th className="py-2 px-1">#</th>
                  <th className="py-2 px-2">Description of Goods</th>
                  <th className="py-2 px-2">HSN/SAC</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Taxable Val</th>
                  <th className="py-2 px-2 text-right">CGST (9%)</th>
                  <th className="py-2 px-2 text-right">SGST (9%)</th>
                  <th className="py-2 px-2 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 print:divide-gray-200 text-[11px] font-mono">
                {invoice.items.map((item, idx) => (
                  <tr key={item.productId || idx}>
                    <td className="py-2 px-1 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-2 font-sans font-medium text-white print:text-black">
                      {item.name}
                      <span className="block text-[9px] font-mono text-gray-500">{item.sku}</span>
                    </td>
                    <td className="py-2 px-2 text-gray-400 print:text-gray-700">{item.hsnCode}</td>
                    <td className="py-2 px-2 text-center text-gray-300 print:text-black">{item.quantity}</td>
                    <td className="py-2 px-2 text-right text-gray-300 print:text-black">
                      ₹{item.taxableValue.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-400 print:text-gray-600">
                      ₹{item.cgstAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-400 print:text-gray-600">
                      ₹{item.sgstAmount.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-white print:text-black">
                      ₹{item.totalGstInclusive.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-between items-start pt-4 border-t border-gray-800 print:border-gray-300">
            <div className="max-w-md">
              <span className="text-[10px] font-mono uppercase text-gray-400 print:text-gray-600 block mb-1">
                Amount in Words:
              </span>
              <p className="text-xs font-serif italic text-gray-300 print:text-black">
                {invoice.amountInWords}
              </p>

              <div className="mt-4 p-2.5 bg-black/40 print:bg-gray-50 rounded-lg border border-gray-800 print:border-gray-200 text-[10px] font-mono">
                <span className="text-gray-400 print:text-gray-600">Payment Status: </span>
                <span className="text-[#39FF6A] print:text-black font-bold uppercase">
                  {invoice.paymentDetails.status}
                </span>
                <span className="block text-gray-400 print:text-gray-600 mt-0.5">
                  Method: {invoice.paymentDetails.method} | Ref: {invoice.paymentDetails.razorpayPaymentId}
                </span>
              </div>
            </div>

            <div className="w-64 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-gray-400 print:text-gray-600">
                <span>Subtotal (Gross):</span>
                <span>₹{invoice.subtotalInr.toFixed(2)}</span>
              </div>
              {invoice.discountInr > 0 && (
                <div className="flex justify-between text-emerald-400 print:text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{invoice.discountInr.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400 print:text-gray-600">
                <span>Taxable Base Value:</span>
                <span>₹{invoice.taxableBaseInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 print:text-gray-600">
                <span>CGST (9.0%):</span>
                <span>₹{invoice.cgstTotalInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400 print:text-gray-600">
                <span>SGST (9.0%):</span>
                <span>₹{invoice.sgstTotalInr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white print:text-black pt-2 border-t border-gray-800 print:border-gray-400">
                <span>Grand Total:</span>
                <span className="text-[#39FF6A] print:text-black">₹{invoice.grandTotalInr.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Digital Signature */}
          <div className="pt-6 border-t border-gray-800 print:border-gray-300 flex justify-between items-end text-[10px] text-gray-400 print:text-gray-600">
            <div>
              <p>• Goods once sold are backed by RoboVerse 1-Year Lab Warranty.</p>
              <p>• This is a computer-generated tax invoice and requires no physical signature.</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[#39FF6A] print:text-black font-mono font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                Digitally Authenticated
              </div>
              <p className="font-bold text-white print:text-black">For RoboVerse Technologies India Pvt Ltd</p>
              <p className="text-[9px] text-gray-500">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
