'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw,
  Trash2,
  Undo2,
  Redo2,
  StickyNote,
  Eye,
  EyeOff,
  Code2,
  Play,
  Square,
  Share2,
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Send,
  FlipHorizontal,
  Check,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useRituuStore } from '@/store/useRituuStore';

export const WIRE_COLOR_OPTIONS = [
  { id: 'green', color: '#39FF6A', label: 'Signal (Neon Green)' },
  { id: 'teal', color: '#7FE7D6', label: 'Telemetry (Teal)' },
  { id: 'red', color: '#FF4D4D', label: 'Power 5V (Red)' },
  { id: 'black', color: '#040B08', label: 'Ground GND (Black)' },
  { id: 'blue', color: '#4C8DFF', label: 'PWM (Blue)' },
  { id: 'orange', color: '#FF9A1F', label: 'Analog (Orange)' },
  { id: 'yellow', color: '#FACC15', label: 'Clock / Trigger (Yellow)' },
  { id: 'purple', color: '#A855F7', label: 'I2C / SPI (Purple)' },
  { id: 'brown', color: '#854D0E', label: 'Bus (Brown)' },
  { id: 'white', color: '#FFFFFF', label: 'Common (White)' },
];

export type WireStyle = 'curved' | 'straight' | 'angled';

interface CircuitToolbarProps {
  onRotate: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddNote: () => void;
  isNoteActive: boolean;
  onToggleVisibility: () => void;
  areComponentsVisible: boolean;
  activeWireColor: string;
  onSelectWireColor: (color: string) => void;
  wireStyle: WireStyle;
  onSelectWireStyle: (style: WireStyle) => void;
  onFlip: () => void;
  // Right side actions
  isCurriculumOpen?: boolean;
  onToggleCurriculum?: () => void;
  isCodeOpen: boolean;
  onToggleCode: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onShareLink: () => void;
}

export const CircuitToolbar: React.FC<CircuitToolbarProps> = ({
  onRotate,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAddNote,
  isNoteActive,
  onToggleVisibility,
  areComponentsVisible,
  activeWireColor,
  onSelectWireColor,
  wireStyle,
  onSelectWireStyle,
  onFlip,
  isCurriculumOpen = false,
  onToggleCurriculum,
  isCodeOpen,
  onToggleCode,
  isSimulating,
  onToggleSimulation,
  onExportPng,
  onExportJson,
  onExportCsv,
  onExportPdf,
  onShareLink,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWireStyleMenu, setShowWireStyleMenu] = useState(false);
  const [showSendToMenu, setShowSendToMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const colorRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const sendToRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (styleRef.current && !styleRef.current.contains(event.target as Node)) {
        setShowWireStyleMenu(false);
      }
      if (sendToRef.current && !sendToRef.current.contains(event.target as Node)) {
        setShowSendToMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = () => {
    onShareLink();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="h-12 bg-[#07110D]/90 backdrop-blur-xl border-b border-[rgba(57,255,106,0.15)] px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* LEFT TOOLBAR: Editing & Wire controls (Tinkercad Circuits standard) */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Rotate Button */}
        <button
          onClick={onRotate}
          className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors"
          title="Rotate component (R)"
          aria-label="Rotate component"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-[#FF4D4D] hover:bg-rose-950/40 transition-colors"
          title="Delete selected item (Del)"
          aria-label="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[rgba(57,255,106,0.15)] mx-1" />

        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 disabled:opacity-30 transition-colors"
          title="Undo (Ctrl+Z)"
          aria-label="Undo action"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo Button */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 disabled:opacity-30 transition-colors"
          title="Redo (Ctrl+Y)"
          aria-label="Redo action"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-[rgba(57,255,106,0.15)] mx-1" />

        {/* Add Note Button */}
        <button
          onClick={onAddNote}
          className={`p-1.5 rounded-lg transition-colors ${
            isNoteActive
              ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] border border-[rgba(57,255,106,0.4)]'
              : 'text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5'
          }`}
          title="Add Note annotation"
          aria-label="Add Note annotation"
        >
          <StickyNote className="w-4 h-4" />
        </button>

        {/* Show / Hide Components Button */}
        <button
          onClick={onToggleVisibility}
          className="p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors"
          title={areComponentsVisible ? 'Hide components' : 'Show components'}
          aria-label="Toggle component visibility"
        >
          {areComponentsVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <div className="h-4 w-px bg-[rgba(57,255,106,0.15)] mx-1" />

        {/* Wire Color Picker Dropdown */}
        <div className="relative" ref={colorRef}>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] bg-[#040B08] text-xs font-mono font-semibold text-[#EAF7EF] transition-colors"
            title="Wire Color"
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
              style={{ backgroundColor: activeWireColor }}
            />
            <ChevronDown className="w-3 h-3 text-[#8FA99B]" />
          </button>

          {showColorPicker && (
            <div className="absolute left-0 mt-2 w-48 bg-[#0A1F17]/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(57,255,106,0.25)] p-2 z-50 backdrop-blur-2xl animate-slide-up grid grid-cols-2 gap-1.5">
              {WIRE_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectWireColor(c.color);
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs font-mono font-medium transition-colors text-left ${
                    activeWireColor === c.color
                      ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A] font-bold border border-[rgba(57,255,106,0.3)]'
                      : 'hover:bg-white/5 text-[#CBD8D0]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="truncate text-[10.5px]">{c.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wire Style Dropdown (Curved / Straight / Angled) */}
        <div className="relative hidden md:block" ref={styleRef}>
          <button
            onClick={() => setShowWireStyleMenu(!showWireStyleMenu)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] bg-[#040B08] text-xs font-mono font-semibold text-[#EAF7EF] transition-colors capitalize"
            title="Wire Style"
          >
            <span>{wireStyle}</span>
            <ChevronDown className="w-3 h-3 text-[#8FA99B]" />
          </button>

          {showWireStyleMenu && (
            <div className="absolute left-0 mt-2 w-32 bg-[#0A1F17]/95 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(57,255,106,0.25)] p-1 z-50 backdrop-blur-2xl animate-slide-up">
              {(['curved', 'straight', 'angled'] as WireStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    onSelectWireStyle(style);
                    setShowWireStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono font-semibold capitalize transition-colors ${
                    wireStyle === style
                      ? 'bg-[rgba(57,255,106,0.2)] text-[#39FF6A]'
                      : 'text-[#CBD8D0] hover:bg-white/5'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Flip / Mirror Button */}
        <button
          onClick={onFlip}
          className="hidden sm:flex p-1.5 rounded-lg text-[#8FA99B] hover:text-[#39FF6A] hover:bg-white/5 transition-colors"
          title="Flip component horizontally"
          aria-label="Flip component"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* RIGHT TOOLBAR: Code, Simulation & Send To controls */}
      <div className="flex items-center gap-2">
        {/* "Simple Lab (16 Lessons)" button */}
        {onToggleCurriculum && (
          <button
            onClick={onToggleCurriculum}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border ${
              isCurriculumOpen
                ? 'bg-[#39FF6A] text-[#07110D] border-transparent shadow-[0_0_12px_#39FF6A]'
                : 'bg-[#040B08] text-[#39FF6A] border-[rgba(57,255,106,0.3)] hover:bg-[#39FF6A]/10'
            }`}
            title="Open Simple Lab 16-Lesson Beginner Curriculum"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simple Lab</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#39FF6A]/20 text-[#39FF6A]">16</span>
          </button>
        )}

        {/* Ask Rituu AI */}
        <button
          onClick={() => {
            const rituu = useRituuStore.getState();
            rituu.setOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 hover:border-[#39FF6A] text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(57,255,106,0.15)]"
          title="Ask Rituu AI Mentor"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ask Rituu</span>
        </button>

        {/* "Code" button (toggles Monaco / Blockly drawer) */}
        <button
          onClick={onToggleCode}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all border ${
            isCodeOpen
              ? 'bg-[#39FF6A] text-[#07110D] border-transparent shadow-[0_0_12px_#39FF6A]'
              : 'bg-[#040B08] text-[#EAF7EF] border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A]'
          }`}
          title="Toggle Arduino / Blockly code panel"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code</span>
        </button>

        {/* "Start Simulation" / "Stop Simulation" button */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-extrabold transition-all shadow-md ${
            isSimulating
              ? 'bg-[#FF4D4D] hover:bg-rose-600 text-white shadow-[0_0_15px_#FF4D4D] animate-pulse'
              : 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_16px_rgba(57,255,106,0.45)] hover:brightness-110'
          }`}
          title={isSimulating ? 'Stop Electrical & MCU Simulation' : 'Start Real-time Electrical & MCU Simulation'}
        >
          {isSimulating ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Simulation</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Simulation</span>
            </>
          )}
        </button>

        {/* "Send To" / Export Menu */}
        <div className="relative" ref={sendToRef}>
          <button
            onClick={() => setShowSendToMenu(!showSendToMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#040B08] text-[#EAF7EF] border border-[rgba(57,255,106,0.2)] hover:border-[#39FF6A] text-xs font-mono font-bold transition-all"
            title="Export & Share Circuit"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send To</span>
            <ChevronDown className="w-3 h-3 text-[#8FA99B]" />
          </button>

          {showSendToMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0A1F17]/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[rgba(57,255,106,0.25)] p-2 z-50 backdrop-blur-2xl animate-slide-up">
              <button
                onClick={() => {
                  onExportPng();
                  setShowSendToMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#EAF7EF] hover:bg-white/5 text-left"
              >
                <Download className="w-4 h-4 text-[#39FF6A]" />
                <div>
                  <p className="font-bold">Download Artwork</p>
                  <p className="text-[10px] text-[#8FA99B]">SVG / PNG vector image</p>
                </div>
              </button>
              <button
                onClick={() => {
                  onExportJson();
                  setShowSendToMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#EAF7EF] hover:bg-white/5 text-left"
              >
                <FileJson className="w-4 h-4 text-[#7FE7D6]" />
                <div>
                  <p className="font-bold">Export Netlist JSON</p>
                  <p className="text-[10px] text-[#8FA99B]">Full SPICE connectivity</p>
                </div>
              </button>
              <button
                onClick={() => {
                  onExportCsv();
                  setShowSendToMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#EAF7EF] hover:bg-white/5 text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-bold">BOM Spreadsheet</p>
                  <p className="text-[10px] text-[#8FA99B]">Bill of Materials (CSV)</p>
                </div>
              </button>
              <button
                onClick={() => {
                  onExportPdf();
                  setShowSendToMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#EAF7EF] hover:bg-white/5 text-left"
              >
                <FileText className="w-4 h-4 text-[#FF9A1F]" />
                <div>
                  <p className="font-bold">Schematic PDF</p>
                  <p className="text-[10px] text-[#8FA99B]">Print-ready schematic</p>
                </div>
              </button>
              <div className="pt-1 mt-1 border-t border-[rgba(57,255,106,0.12)]">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-[#39FF6A] hover:bg-[rgba(57,255,106,0.10)] text-left font-bold"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#39FF6A]" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Share Public Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
