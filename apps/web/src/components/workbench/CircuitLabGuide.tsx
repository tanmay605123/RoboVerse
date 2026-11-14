'use client';

import React from 'react';
import {
  BookOpen,
  Cable,
  CheckCircle2,
  CircleHelp,
  Code2,
  Compass,
  MousePointer2,
  PackageSearch,
  Play,
  Rotate3D,
  X,
} from 'lucide-react';
import type { CircuitViewTab } from './CircuitHeader';

interface CircuitLabGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLessons: () => void;
  onOpenCode: () => void;
  onSetView: (view: CircuitViewTab) => void;
}

export const CircuitLabGuide: React.FC<CircuitLabGuideProps> = ({
  isOpen,
  onClose,
  onOpenLessons,
  onOpenCode,
  onSetView,
}) => {
  if (!isOpen) return null;

  const open = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="circuit-guide-title" className="flex max-h-[min(88vh,850px)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#39FF6A]/30 bg-[#07110D] text-[#EAF7EF] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-[#040B08] px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-xl border border-[#39FF6A]/30 bg-[#39FF6A]/10 p-2 text-[#39FF6A]"><CircleHelp className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7FE7D6]">New to the workbench?</p>
              <h2 id="circuit-guide-title" className="mt-1 text-xl font-black">Your RoboVerse Circuit Lab guide</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#8FA99B]">Build a circuit, explore the board, write a sketch, and see the simulation respond. You can use the virtual lab without physical hardware.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-[#8FA99B] transition hover:bg-white/5 hover:text-white" aria-label="Close guide"><X className="h-5 w-5" /></button>
        </header>

        <div className="grid flex-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-[#39FF6A]/20 bg-[#0A1F17]/70 p-4">
            <div className="flex items-center gap-2 text-[#39FF6A]"><BookOpen className="h-4 w-4" /><h3 className="text-sm font-extrabold">1. Learn with a guided lesson</h3></div>
            <p className="mt-2 text-xs leading-relaxed text-[#C5D8CD]">Choose a lesson to see its goal, required parts, pin-by-pin wiring, example code, and specifications. Auto-Assemble places its starter circuit; Verify checks the setup before you run it.</p>
            <button onClick={() => open(onOpenLessons)} className="mt-3 rounded-lg bg-[#39FF6A] px-3 py-2 text-xs font-extrabold text-[#07110D] hover:brightness-110">Open Circuit Lab lessons</button>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#040B08]/70 p-4">
            <div className="flex items-center gap-2 text-[#7FE7D6]"><PackageSearch className="h-4 w-4" /><h3 className="text-sm font-extrabold">2. Find and place parts</h3></div>
            <p className="mt-2 text-xs leading-relaxed text-[#C5D8CD]">Use the right-hand Components panel to search or filter parts. Click a tile to add it, or drag it onto the canvas. Use the info button on a tile or list row to read what a part does and see its pinout.</p>
            <p className="mt-2 text-[11px] text-[#8FA99B]">On the 2D canvas, drag a part to move it. Double-click it to edit resistance, LED colour, sensor values, or servo angle.</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#040B08]/70 p-4">
            <div className="flex items-center gap-2 text-[#FF9A1F]"><Cable className="h-4 w-4" /><h3 className="text-sm font-extrabold">3. Connect pins</h3></div>
            <p className="mt-2 text-xs leading-relaxed text-[#C5D8CD]">Click a pin on one part, then click the pin it should connect to. Use the wire colour and style menus to keep power, ground, and signals easy to follow. Right-click or press Escape to cancel a wire in progress.</p>
            <p className="mt-2 text-[11px] text-[#8FA99B]">In 2D, use the Overview map to jump around a large circuit. In 3D, drag to orbit, use WASD to pan and Q/E to rotate, or use the corner buttons. Choose Reset View or Top View to reorient.</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#040B08]/70 p-4">
            <div className="flex items-center gap-2 text-[#A78BFA]"><Code2 className="h-4 w-4" /><h3 className="text-sm font-extrabold">4. Write and run code</h3></div>
            <p className="mt-2 text-xs leading-relaxed text-[#C5D8CD]">Open Code to edit an Arduino sketch or build it with Blocks. Load a starter example, then Start Simulation to run it. Serial Monitor shows printed messages; Plotter graphs changing values.</p>
            <button onClick={() => open(onOpenCode)} className="mt-3 rounded-lg border border-[#39FF6A]/40 px-3 py-2 text-xs font-bold text-[#39FF6A] hover:bg-[#39FF6A]/10">Open code and serial tools</button>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#040B08]/70 p-4">
            <div className="flex items-center gap-2 text-[#7FE7D6]"><Compass className="h-4 w-4" /><h3 className="text-sm font-extrabold">5. Explore the design</h3></div>
            <p className="mt-2 text-xs leading-relaxed text-[#C5D8CD]">Circuits has a 2D canvas and a rotatable 3D table. In 2D, drag empty space to pan and use Fit or the zoom buttons. The Zap button animates connected wires during a run as a visual guide; it does not measure current. Schematic shows the circuit drawing; Components lists parts and build costs.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => open(() => onSetView('schematic'))} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold hover:border-[#39FF6A]/50 hover:text-[#39FF6A]">View schematic</button>
              <button onClick={() => open(() => onSetView('components'))} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold hover:border-[#39FF6A]/50 hover:text-[#39FF6A]">View components</button>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#040B08]/70 p-4">
            <div className="flex items-center gap-2 text-[#39FF6A]"><MousePointer2 className="h-4 w-4" /><h3 className="text-sm font-extrabold">6. Edit, check, and share</h3></div>
            <p className="mt-2 text-xs leading-relaxed text-[#C5D8CD]">Undo and redo edits from the toolbar. Rotate with R, delete a selected part with Delete, and press Escape to clear a selection. Send To contains image, netlist, parts-list, print, and share options.</p>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#8FA99B]"><CheckCircle2 className="h-3.5 w-3.5 text-[#39FF6A]" />Circuit Health reports common wiring and safety issues while you work.</p>
          </article>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#040B08] px-6 py-4">
          <span className="flex items-center gap-2 text-[11px] text-[#8FA99B]"><Rotate3D className="h-4 w-4 text-[#7FE7D6]" /> Hover buttons for quick hints; reopen this guide any time from the toolbar.</span>
          <button onClick={onClose} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] px-4 py-2.5 text-sm font-black text-[#07110D]"><Play className="h-3.5 w-3.5 fill-current" />Start building</button>
        </footer>
      </section>
    </div>
  );
};
