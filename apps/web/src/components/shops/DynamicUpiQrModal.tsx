'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  QrCode,
  Clock,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface DynamicUpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderId: string;
    orderNumber: string;
    totalInr: number;
    gstAmountInr: number;
    upiString?: string;
    qrImageUrl?: string;
    qrExpiresAt?: string;
  };
  onPaymentSuccess: (confirmedData: any) => void;
  onRefreshQr: () => Promise<void>;
}

export const DynamicUpiQrModal: React.FC<DynamicUpiQrModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
  onRefreshQr,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 minutes default
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize or update countdown timer from qrExpiresAt
  useEffect(() => {
    if (!isOpen) return;

    if (order.qrExpiresAt) {
      const expires = new Date(order.qrExpiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setSecondsRemaining(diff > 0 ? diff : 900);
    } else {
      setSecondsRemaining(900); // 15 mins
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, order.qrExpiresAt]);

  // Polling loop: check order payment status every 3 seconds
  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch(`/api/store/order-status?orderId=${encodeURIComponent(order.orderId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        if (json.success && json.data?.isPaid) {
          clearInterval(pollInterval);
          onPaymentSuccess(json.data);
        }
      } catch (e) {
        // Silent poll error
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [isOpen, order.orderId, order.orderNumber, secondsRemaining, onPaymentSuccess]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = ((secondsRemaining / (15 * 60)) * 100);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText('techsavyyy@razorpay');
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(order.totalInr.toFixed(2));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshQr();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#07110D] border border-[#39FF6A]/40 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#39FF6A]/10 border border-[#39FF6A]/30 flex items-center justify-center text-[#39FF6A]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Dynamic UPI QR Code
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Order: {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 15-Minute Countdown Header */}
        <div className="mt-4 p-3 bg-black/50 border border-gray-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${secondsRemaining < 120 ? 'text-[#FF9A1F] animate-pulse' : 'text-[#39FF6A]'}`} />
            <span className="text-xs font-mono text-gray-300">Single-Use QR Expires In:</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-base font-bold ${
                secondsRemaining < 120 ? 'text-[#FF9A1F]' : 'text-[#39FF6A]'
              }`}
            >
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* Expiry Progress Bar */}
        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mt-1.5">
          <div
            className={`h-full transition-all duration-1000 ${
              secondsRemaining < 120 ? 'bg-[#FF9A1F]' : 'bg-[#39FF6A]'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* QR Code Frame */}
        <div className="mt-5 flex flex-col items-center justify-center">
          {secondsRemaining > 0 ? (
            <div className="relative p-3 bg-white rounded-2xl shadow-xl border-4 border-[#39FF6A]/30">
              {order.qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.qrImageUrl}
                  alt="Dynamic UPI QR Code"
                  className="w-48 h-48 rounded-lg object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-[#0A1813] flex items-center justify-center rounded-lg text-white font-mono text-xs text-center p-4">
                  Generating dynamic UPI QR...
                </div>
              )}

              {/* Verified NPCI Badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#07110D] border border-[#39FF6A] text-[#39FF6A] text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
                <ShieldCheck className="w-3 h-3" />
                Verified NPCI UPI
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 bg-red-950/30 border border-red-500/40 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
              <p className="text-xs text-red-200 font-bold">QR Code Expired</p>
              <p className="text-[10px] text-gray-400 mt-1">
                For security, single-use dynamic QRs expire after 15 minutes.
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-3 px-3 py-1.5 bg-[#39FF6A] text-black text-xs font-bold rounded-lg flex items-center gap-1 hover:brightness-110 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                Regenerate QR
              </button>
            </div>
          )}

          {/* Amount Due Display */}
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-400">Total Payable Amount (incl. 18% GST)</div>
            <div className="text-3xl font-bold font-mono text-white mt-0.5">
              ₹{order.totalInr}
            </div>
          </div>
        </div>

        {/* UPI Details & Copy Helpers */}
        <div className="mt-5 space-y-2 bg-black/40 p-3 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Merchant VPA:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-200">techsavyyy@razorpay</span>
              <button
                onClick={handleCopyVpa}
                className="p-1 text-gray-400 hover:text-[#39FF6A] transition"
                title="Copy VPA"
              >
                {copiedVpa ? <Check className="w-3.5 h-3.5 text-[#39FF6A]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Exact Amount:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#39FF6A] font-bold">₹{order.totalInr.toFixed(2)}</span>
              <button
                onClick={handleCopyAmount}
                className="p-1 text-gray-400 hover:text-[#39FF6A] transition"
                title="Copy Amount"
              >
                {copiedAmount ? <Check className="w-3.5 h-3.5 text-[#39FF6A]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Supported UPI Apps Pills */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-gray-400">
          <span>Supported:</span>
          <span className="bg-gray-800/80 px-2 py-0.5 rounded text-gray-300">Google Pay</span>
          <span className="bg-gray-800/80 px-2 py-0.5 rounded text-gray-300">PhonePe</span>
          <span className="bg-gray-800/80 px-2 py-0.5 rounded text-gray-300">Paytm</span>
          <span className="bg-gray-800/80 px-2 py-0.5 rounded text-gray-300">BHIM</span>
        </div>

        {/* Payment status is confirmed by the server after the provider webhook. */}
        <div className="mt-5 pt-4 border-t border-gray-800 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF6A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF6A]"></span>
            </span>
            Waiting for verified payment confirmation...
          </div>
        </div>
      </div>
    </div>
  );
};
