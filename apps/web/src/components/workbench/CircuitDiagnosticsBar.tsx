'use client';

import React, { useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useRituuStore } from '@/store/useRituuStore';
import { CircuitDiagnosticSeverity } from '@roboverse/shared';
import { AlertTriangle, AlertCircle, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

export const CircuitDiagnosticsBar: React.FC = () => {
  const { diagnostics, isSimulating } = useCircuitStore();
  const [selectedError, setSelectedError] = useState<any | null>(null);

  if (!isSimulating && diagnostics.length === 0) {
    return null;
  }

  const criticalErrors = diagnostics.filter((d) => d.severity === CircuitDiagnosticSeverity.CRITICAL);

  return (
    <>
      {/* Floating Bottom Diagnostics Pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-full px-4 select-none">
        {diagnostics.length > 0 ? (
          <div
            className={`p-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 ${
              criticalErrors.length > 0
                ? 'bg-rose-900/90 border-rose-500/70 text-rose-100'
                : 'bg-amber-900/90 border-amber-500/70 text-amber-100'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {criticalErrors.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <div className="text-xs truncate">
                <span className="font-bold mr-1">
                  {criticalErrors.length > 0 ? 'Circuit Fault Detected:' : 'Circuit Warning:'}
                </span>
                <span>{diagnostics[0].message}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedError(diagnostics[0])}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-xs font-bold text-white shrink-0 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Explain with Rituu
            </button>
          </div>
        ) : isSimulating ? (
          <div className="p-2.5 px-4 rounded-full border border-emerald-400/40 bg-emerald-950/90 text-emerald-300 backdrop-blur-md shadow-lg flex items-center justify-center gap-2 text-xs mx-auto w-fit">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono">Circuit Health OK • All Nets Operating Safely</span>
          </div>
        ) : null}
      </div>

      {/* Rituu AI Diagnostic Explanation Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#171E3F] border border-[#E8ECF2] dark:border-[#2A3568] rounded-3xl w-full max-w-lg p-6 shadow-2xl relative font-sans text-brand-navy dark:text-white animate-slide-up">
            <button
              onClick={() => setSelectedError(null)}
              className="absolute top-4 right-4 p-1.5 text-brand-muted hover:text-brand-navy dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Rituu Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-brand-purple flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-brand-navy dark:text-white">Rituu AI Circuit Diagnostic</h3>
                  <span className="text-[10px] bg-purple-100 text-brand-purple dark:bg-purple-950 px-2 py-0.5 rounded-full font-bold">
                    Robotics Copilot
                  </span>
                </div>
                <p className="text-xs text-brand-muted">Automated fault analysis & electrical safety check</p>
              </div>
            </div>

            {/* Error Card */}
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 mb-4 text-xs">
              <div className="font-bold text-rose-900 dark:text-rose-300 mb-1">{selectedError.message}</div>
              <div className="text-[11px] leading-relaxed">{selectedError.explanation}</div>
            </div>

            {/* Rituu's Fix Recommendation */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-brand-navy dark:text-gray-200">
                <div className="text-brand-orange font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Rituu&apos;s Recommended Fix:
                </div>
                <p className="text-xs leading-relaxed">
                  {selectedError.fixSuggestion}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const { setOpen, sendMessage } = useRituuStore.getState();
                  setOpen(true);
                  sendMessage(`Explain and fix this circuit diagnostic error: ${selectedError.message}. ${selectedError.explanation}`);
                  setSelectedError(null);
                }}
                className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-brand-purple border border-purple-200 dark:border-purple-800 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask Rituu in Chat
              </button>

              <button
                onClick={() => setSelectedError(null)}
                className="flex-1 py-2.5 btn-primary-orange font-bold text-xs rounded-xl shadow-orange-pill transition"
              >
                Got It! I&apos;ll Fix The Circuit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
