'use client';

import React, { useState } from 'react';
import { useCircuitStore } from '@/store/useCircuitStore';
import { useRituuStore } from '@/store/useRituuStore';
import { CircuitDiagnosticSeverity } from '@roboverse/shared';
import { AlertTriangle, AlertCircle, Bot, X, CheckCircle, ArrowRight } from 'lucide-react';

export const CircuitDiagnosticsBar: React.FC = () => {
  const { diagnostics, isSimulating } = useCircuitStore();
  const [selectedError, setSelectedError] = useState<any | null>(null);

  if (!isSimulating && diagnostics.length === 0) {
    return null;
  }

  const criticalErrors = diagnostics.filter((d) => d.severity === CircuitDiagnosticSeverity.CRITICAL);
  const warningErrors = diagnostics.filter((d) => d.severity === CircuitDiagnosticSeverity.WARNING);

  return (
    <>
      {/* Floating Bottom Diagnostics Pill */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-full px-4">
        {diagnostics.length > 0 ? (
          <div
            className={`p-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 ${
              criticalErrors.length > 0
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
                : 'bg-amber-950/90 border-amber-500/60 text-amber-200'
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
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white shrink-0 transition"
            >
              <Bot className="w-3.5 h-3.5 text-[#39FF6A]" />
              Explain with Rituu
            </button>
          </div>
        ) : isSimulating ? (
          <div className="p-2.5 px-4 rounded-full border border-[#39FF6A]/40 bg-[#0E2A1F]/90 backdrop-blur-md shadow-lg flex items-center justify-center gap-2 text-xs text-[#39FF6A] mx-auto w-fit">
            <CheckCircle className="w-4 h-4 text-[#39FF6A]" />
            <span className="font-mono">Circuit Health OK • All Nets Verified Safe</span>
          </div>
        ) : null}
      </div>

      {/* Rituu AI Diagnostic Explanation Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#07110D] border border-[#39FF6A]/50 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative font-sans">
            <button
              onClick={() => setSelectedError(null)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Rituu Avatar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0E2A1F] border border-[#39FF6A]/60 flex items-center justify-center p-1 shadow-lg shadow-[#39FF6A]/20">
                <Bot className="w-7 h-7 text-[#39FF6A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Rituu AI Circuit Diagnostic</h3>
                  <span className="text-[10px] bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-2 py-0.5 rounded-full font-mono">
                    RoboVerse Copilot
                  </span>
                </div>
                <p className="text-xs text-gray-400">Automated fault analysis & electrical safety check</p>
              </div>
            </div>

            {/* Error Card */}
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 mb-4 text-xs font-mono">
              <div className="font-bold text-rose-300 mb-1">{selectedError.message}</div>
              <div className="text-[11px] text-gray-300">{selectedError.explanation}</div>
            </div>

            {/* Rituu's Fix Recommendation */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#0E2A1F]/70 border border-[#39FF6A]/30 text-gray-200">
                <div className="text-[#39FF6A] font-bold text-xs uppercase mb-1 flex items-center gap-1.5 font-sans">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Rituu&apos;s Recommended Fix:
                </div>
                <p className="text-xs leading-relaxed text-gray-300 font-sans">
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
                className="flex-1 py-2.5 bg-[#0E2A1F] hover:bg-[#0E2A1F]/80 text-[#39FF6A] border border-[#39FF6A]/40 font-bold text-xs rounded-xl shadow transition font-sans flex items-center justify-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                Ask Rituu in Chat
              </button>

              <button
                onClick={() => setSelectedError(null)}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-black font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition font-sans"
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
