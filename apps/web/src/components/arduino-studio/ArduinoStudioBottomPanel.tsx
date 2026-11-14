'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useArduinoStudioStore } from '@/store/useArduinoStudioStore';
import { TEMPLATES } from './templates';
import {
  Code,
  CheckCircle2,
  Terminal,
  Activity,
  ListFilter,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  Play,
  Square,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Send,
  Trash2,
} from 'lucide-react';

// Dynamically import Monaco Editor with SSR disabled for Next.js
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#050B08] p-4 text-xs font-mono text-[#39FF6A] flex items-center justify-center">
      Loading Arduino C++ Monaco Editor...
    </div>
  ),
});

export const ArduinoStudioBottomPanel: React.FC = () => {
  const {
    activeBottomTab,
    setActiveBottomTab,
    arduinoCode,
    setArduinoCode,
    compilerResult,
    compilerLogs,
    serialLogs,
    clearSerial,
    sendSerialInput,
    simulationLogs,
    clearLogs,
    diagnostics,
    isSimulating,
    startSimulation,
    stopSimulation,
    resetSimulation,
    compileCode,
    exportInoFile,
    loadTemplate,
  } = useArduinoStudioStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelHeight, setPanelHeight] = useState(290);
  const [serialInput, setSerialInput] = useState('');
  const [baudRate, setBaudRate] = useState('9600');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialInput.trim()) return;
    sendSerialInput(serialInput);
    setSerialInput('');
  };

  const criticalDiags = diagnostics.filter((d) => d.severity === 'CRITICAL');
  const warningDiags = diagnostics.filter((d) => d.severity === 'WARNING');

  if (isCollapsed) {
    return (
      <div className="h-10 bg-[#07110D]/95 border-t border-[#39FF6A]/20 px-4 flex items-center justify-between z-20 backdrop-blur-xl font-sans">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1.5 text-xs text-[#39FF6A] hover:underline font-bold"
          >
            <ChevronUp className="w-4 h-4" />
            Expand Arduino Console &amp; Editor
          </button>
          <span className="text-[10px] text-gray-400 font-mono">
            {isSimulating ? '• Live Simulation Running' : '• Simulation Idle'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {diagnostics.length > 0 && (
            <span className="text-[10px] bg-[#FF3939]/20 text-[#FF3939] px-2 py-0.5 rounded border border-[#FF3939]/30 font-mono">
              {diagnostics.length} Diagnostic Issue(s)
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height: `${panelHeight}px` }}
      className="bg-[#07110D]/95 border-t border-[#39FF6A]/20 flex flex-col z-20 backdrop-blur-xl font-sans select-none"
    >
      {/* Top Tab Bar Header */}
      <div className="h-10 border-b border-gray-800 bg-[#0E2A1F]/50 px-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          {/* Tab 1: Code Editor */}
          <button
            onClick={() => setActiveBottomTab('CODE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
              activeBottomTab === 'CODE'
                ? 'bg-[#050B08] text-[#39FF6A] border-t-2 border-[#39FF6A] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            sketch.ino
          </button>

          {/* Tab 2: Compiler Output */}
          <button
            onClick={() => setActiveBottomTab('COMPILER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
              activeBottomTab === 'COMPILER'
                ? 'bg-[#050B08] text-[#7FE7D6] border-t-2 border-[#7FE7D6] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Compiler Output
            {compilerResult && (
              <span
                className={`w-2 h-2 rounded-full ${
                  compilerResult.success ? 'bg-[#39FF6A]' : 'bg-[#FF3939]'
                }`}
              />
            )}
          </button>

          {/* Tab 3: Serial Monitor */}
          <button
            onClick={() => setActiveBottomTab('SERIAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
              activeBottomTab === 'SERIAL'
                ? 'bg-[#050B08] text-[#39FF6A] border-t-2 border-[#39FF6A] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Serial Monitor
            {serialLogs.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#7FE7D6] animate-pulse" />
            )}
          </button>

          {/* Tab 4: Circuit Diagnostics */}
          <button
            onClick={() => setActiveBottomTab('DIAGNOSTICS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
              activeBottomTab === 'DIAGNOSTICS'
                ? 'bg-[#050B08] text-amber-300 border-t-2 border-amber-400 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Circuit Diagnostics
            {diagnostics.length > 0 && (
              <span className="text-[10px] bg-[#FF3939] text-white px-1.5 rounded-full font-mono font-bold">
                {diagnostics.length}
              </span>
            )}
          </button>

          {/* Tab 5: Simulation Logs */}
          <button
            onClick={() => setActiveBottomTab('LOGS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition ${
              activeBottomTab === 'LOGS'
                ? 'bg-[#050B08] text-white border-t-2 border-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Simulation Logs
          </button>
        </div>

        {/* Action Controls & Collapse */}
        <div className="flex items-center gap-2">
          {activeBottomTab === 'CODE' && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-gray-400 hover:text-[#39FF6A] transition text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#39FF6A]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={exportInoFile}
                className="flex items-center gap-1 text-gray-400 hover:text-[#7FE7D6] transition text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                .ino
              </button>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 text-gray-400 hover:text-white transition"
            title="Collapse bottom panel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: CODE EDITOR (MONACO) */}
      {activeBottomTab === 'CODE' && (
        <div className="flex-1 flex overflow-hidden bg-[#050B08]">
          <div className="flex-1 h-full relative">
            <MonacoEditor
              height="100%"
              language="cpp"
              theme="vs-dark"
              value={arduinoCode}
              onChange={(value) => setArduinoCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: 'smooth',
                wordWrap: 'on',
              }}
            />
          </div>
        </div>
      )}

      {/* TAB 2: COMPILER OUTPUT */}
      {activeBottomTab === 'COMPILER' && (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-gray-300 bg-[#050B08] space-y-1">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-[11px]">
            <span className="text-gray-400 font-bold uppercase">
              AVR-G++ Output Stream (ATmega328P)
            </span>
            {compilerResult && (
              <span
                className={`font-bold ${
                  compilerResult.success ? 'text-[#39FF6A]' : 'text-[#FF3939]'
                }`}
              >
                {compilerResult.success ? '✓ BUILD SUCCESSFUL' : '✗ BUILD FAILED'}
              </span>
            )}
          </div>

          {compilerLogs.map((log, idx) => (
            <div
              key={idx}
              className={`leading-tight ${
                log.includes('error:') || log.includes('failed')
                  ? 'text-[#FF3939] font-bold'
                  : log.includes('successful') || log.includes('OK')
                  ? 'text-[#39FF6A]'
                  : 'text-gray-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SERIAL MONITOR */}
      {activeTabIsSerial(activeBottomTab, baudRate, setBaudRate, clearSerial, serialLogs, handleSendSerial, serialInput, setSerialInput)}

      {/* TAB 4: CIRCUIT DIAGNOSTICS */}
      {activeBottomTab === 'DIAGNOSTICS' && (
        <div className="flex-1 p-3.5 overflow-y-auto bg-[#050B08] space-y-3 font-sans text-xs">
          {diagnostics.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-mono">
              <CheckCircle2 className="w-8 h-8 text-[#39FF6A] mx-auto mb-2" />
              <div className="text-white font-bold text-xs">Circuit Netlist Verified Safe</div>
              <div className="text-gray-400 text-[11px] mt-0.5">
                No short circuits, floating grounds, or damaged component connections detected.
              </div>
            </div>
          ) : (
            diagnostics.map((diag) => (
              <div
                key={diag.id}
                className={`p-3 rounded-xl border backdrop-blur-md space-y-1 ${
                  diag.severity === 'CRITICAL'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {diag.severity === 'CRITICAL' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>{diag.message}</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed font-mono">
                  {diag.explanation}
                </p>
                <div className="pt-1 text-[11px] text-[#39FF6A] font-bold">
                  Fix: {diag.fixSuggestion}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: SIMULATION LOGS */}
      {activeBottomTab === 'LOGS' && (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-gray-300 bg-[#050B08] space-y-1">
          <div className="flex items-center justify-between pb-1.5 border-b border-gray-800 text-[11px]">
            <span className="text-gray-400 font-bold uppercase">
              Microcontroller Instruction &amp; Pin Transition Timeline
            </span>
            <button
              onClick={clearLogs}
              className="text-gray-500 hover:text-white transition text-[10px]"
            >
              Clear
            </button>
          </div>
          {simulationLogs.map((log, idx) => (
            <div
              key={idx}
              className={`leading-tight ${
                log.includes('PIN CHANGE')
                  ? 'text-[#39FF6A]'
                  : log.includes('USER INTERACTION')
                  ? 'text-[#7FE7D6] font-bold'
                  : log.includes('SIMULATION BLOCKED')
                  ? 'text-[#FF3939]'
                  : 'text-gray-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function activeTabIsSerial(
  activeBottomTab: string,
  baudRate: string,
  setBaudRate: (val: string) => void,
  clearSerial: () => void,
  serialLogs: string[],
  handleSendSerial: (e: React.FormEvent) => void,
  serialInput: string,
  setSerialInput: (val: string) => void
) {
  if (activeBottomTab !== 'SERIAL') return null;

  return (
    <div className="flex-1 flex flex-col bg-[#050B08] overflow-hidden text-xs">
      {/* Serial Sub-bar */}
      <div className="flex items-center justify-between p-2 bg-black/40 border-b border-gray-800 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono">Baud Rate:</span>
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(e.target.value)}
            className="bg-[#07110D] border border-gray-700 rounded px-1.5 py-0.5 text-xs text-[#39FF6A] font-mono outline-none"
          >
            <option value="9600">9600 baud</option>
            <option value="19200">19200 baud</option>
            <option value="115200">115200 baud</option>
          </select>
        </div>
        <button
          onClick={clearSerial}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#FF3939] transition"
        >
          <Trash2 className="w-3 h-3" />
          Clear Output
        </button>
      </div>

      {/* Serial Terminal Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-[11px] text-gray-300">
        {serialLogs.length === 0 ? (
          <div className="text-gray-600 italic">No serial communication received yet...</div>
        ) : (
          serialLogs.map((log, idx) => (
            <div
              key={idx}
              className={`leading-tight ${
                log.startsWith('>')
                  ? 'text-[#7FE7D6]'
                  : log.includes('ERROR')
                  ? 'text-[#FF3939]'
                  : 'text-gray-300'
              }`}
            >
              {log}
            </div>
          ))
        )}
      </div>

      {/* Send Command Input */}
      <form
        onSubmit={handleSendSerial}
        className="p-2 border-t border-gray-800 bg-[#0E2A1F]/30 flex gap-2"
      >
        <input
          type="text"
          placeholder="Send command to Arduino over UART..."
          value={serialInput}
          onChange={(e) => setSerialInput(e.target.value)}
          className="flex-1 bg-[#07110D] border border-gray-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#7FE7D6]"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-[#7FE7D6]/20 hover:bg-[#7FE7D6]/30 text-[#7FE7D6] border border-[#7FE7D6]/40 rounded text-xs font-bold transition flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          Send
        </button>
      </form>
    </div>
  );
}
