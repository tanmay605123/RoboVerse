'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ReportShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: { id: string; name: string } | null;
}

const REPORT_REASONS = [
  'Wrong Location / GPS Pin Incorrect',
  'Store Permanently Closed Down',
  'Incorrect or Outdated Phone Number',
  'Does Not Stock Electronics / Robotics Components',
  'Overcharging / Fraudulent Behavior',
];

export const ReportShopModal: React.FC<ReportShopModalProps> = ({
  isOpen,
  onClose,
  shop,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !shop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/shops/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shop.id,
          reason: selectedReason,
          details,
        }),
      });
    } catch {
      // Continue
    }

    setIsSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setDetails('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#07110D]/95 border border-[rgba(255,154,31,0.3)] rounded-3xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,154,31,0.2)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF9A1F]/10 border border-[#FF9A1F]/30 flex items-center justify-center text-[#FF9A1F]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EAF7EF]">Report Store Issue</h3>
              <p className="text-[11px] text-[#8FA99B] font-mono">{shop.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#8FA99B] hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2 font-mono">
            <CheckCircle2 className="w-10 h-10 text-[#39FF6A] mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-[#EAF7EF]">Report Submitted</h4>
            <p className="text-xs text-[#8FA99B]">
              Thank you for keeping Maker Radar accurate for fellow robotics students!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-[#8FA99B] block mb-1.5 uppercase font-bold">
                Select Issue Reason *
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-[#040B08] border border-white/10 rounded-xl px-3 py-2 text-[#EAF7EF] focus:border-[#FF9A1F] focus:outline-none"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#8FA99B] block mb-1.5 uppercase font-bold">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Store moved to shop #12 across the road; new phone number..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-[#040B08] border border-white/10 rounded-xl p-3 text-[#EAF7EF] focus:border-[#FF9A1F] focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#8FA99B] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[#FF9A1F] text-[#07110D] font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
