'use client';

import { useEffect, useState } from 'react';
import { Pause, Play, Radio, Sparkles, Wrench } from 'lucide-react';
import type { BeginnerLesson } from './beginnerCurriculumData';

const BLUEPRINT_STAGES = [
  { title: 'See the goal', detail: 'Understand what the finished project senses or controls.', icon: Sparkles },
  { title: 'Plan the circuit', detail: 'Review the parts and follow the color-coded pin connections.', icon: Wrench },
  { title: 'Build and test', detail: 'Assemble, load the example sketch, and run the simulation.', icon: Radio },
];

export function ProjectBlueprintPreview({ lesson }: { lesson: BeginnerLesson }) {
  const [stage, setStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setStage((current) => (current + 1) % BLUEPRINT_STAGES.length), 4200);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const currentStage = BLUEPRINT_STAGES[stage];
  const StageIcon = currentStage.icon;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#39FF6A]/25 bg-[#040B08]" aria-label={`${lesson.title} project blueprint preview`}>
      <style jsx>{`
        @keyframes blueprint-flow { to { stroke-dashoffset: -52; } }
        .blueprint-flow { animation: blueprint-flow 2.2s linear infinite; }
        .blueprint-flow-delay { animation-delay: -1.1s; }
        @media (prefers-reduced-motion: reduce) { .blueprint-flow { animation: none; } }
      `}</style>
      <div className="relative overflow-hidden bg-[#071A12] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#39FF6A 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative grid gap-5 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#7FE7D6]">
              <span className="h-2 w-2 rounded-full bg-[#39FF6A] shadow-[0_0_10px_#39FF6A]" />
              Project blueprint · preview before building
            </div>
            <h4 className="mt-3 text-lg font-black text-[#EAF7EF]">{lesson.title}</h4>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-[#A8C0B2]">{lesson.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {lesson.requiredComponents.slice(0, 5).map((part) => (
                <span key={part} className="rounded-full border border-[#7FE7D6]/20 bg-black/20 px-2.5 py-1 text-[10px] capitalize text-[#C5D8CD]">{part.replace(/_/g, ' ')}</span>
              ))}
              {lesson.requiredComponents.length > 5 && <span className="px-1 py-1 text-[10px] text-[#8FA99B]">+{lesson.requiredComponents.length - 5} parts</span>}
            </div>
          </div>

          <div className="relative flex min-h-40 items-center justify-center rounded-xl border border-[#39FF6A]/20 bg-[#020805]/70 p-4">
            <svg viewBox="0 0 320 150" className="h-36 w-full max-w-sm" role="img" aria-label={`Animated circuit concept: ${currentStage.title}`}>
              <defs><filter id="blueprintGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
              <rect x="18" y="43" width="100" height="62" rx="10" fill="#0B2519" stroke="#39FF6A" strokeWidth="2" />
              <text x="68" y="69" textAnchor="middle" fill="#EAF7EF" fontSize="11" fontFamily="monospace">ROBO UNO</text>
              <text x="68" y="87" textAnchor="middle" fill="#7FE7D6" fontSize="9" fontFamily="monospace">controller</text>
              <rect x="214" y="43" width="88" height="62" rx="10" fill="#0B2519" stroke="#7FE7D6" strokeWidth="2" />
              <text x="258" y="69" textAnchor="middle" fill="#EAF7EF" fontSize="9" fontFamily="monospace">{(lesson.requiredComponents[0] || 'project').replace(/_/g, ' ').slice(0, 16)}</text>
              <text x="258" y="87" textAnchor="middle" fill="#7FE7D6" fontSize="9" fontFamily="monospace">{lesson.category}</text>
              <path d="M118 59 C155 24 175 24 214 59" fill="none" stroke="#FF4D4D" strokeWidth="3" strokeDasharray="8 5" className={isPlaying ? 'blueprint-flow' : ''} />
              <path d="M118 90 C155 126 175 126 214 90" fill="none" stroke="#7FE7D6" strokeWidth="3" strokeDasharray="8 5" className={isPlaying ? 'blueprint-flow blueprint-flow-delay' : ''} />
              <circle cx="160" cy="75" r="17" fill="#07110D" stroke="#39FF6A" strokeWidth="2" filter="url(#blueprintGlow)" />
              <text x="160" y="79" textAnchor="middle" fill="#39FF6A" fontSize="10" fontFamily="monospace">{stage + 1}/3</text>
            </svg>
            <span className="absolute bottom-2 right-3 text-[9px] font-mono uppercase tracking-wider text-[#8FA99B]">Concept preview · pins in Pinout</span>
          </div>
        </div>
        <div className="relative mt-4 grid gap-2 border-t border-[#39FF6A]/15 pt-3 sm:grid-cols-2">
          {lesson.wiringGuide.slice(0, 2).map((wire, index) => (
            <div key={`${wire.from}-${wire.to}-${index}`} className="flex min-w-0 items-center gap-2 text-[10px] font-mono text-[#C5D8CD]">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: wire.color }} />
              <span className="truncate">{wire.from}</span><span className="text-[#8FA99B]">→</span><span className="truncate text-[#7FE7D6]">{wire.to}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-start gap-3" aria-live="polite">
          <div className="rounded-lg border border-[#39FF6A]/20 bg-[#0E2A1F] p-2 text-[#39FF6A]"><StageIcon className="h-4 w-4" /></div>
          <div><p className="text-xs font-bold text-[#EAF7EF]">{currentStage.title}</p><p className="mt-1 text-[11px] leading-relaxed text-[#8FA99B]">{currentStage.detail}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-label={`Preview step ${stage + 1} of 3`}>
            {BLUEPRINT_STAGES.map((item, index) => <button key={item.title} onClick={() => setStage(index)} aria-label={`Show preview step ${index + 1}: ${item.title}`} className={`h-1.5 w-5 rounded-full transition-colors ${stage === index ? 'bg-[#39FF6A]' : 'bg-white/15'}`} />)}
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold text-[#C5D8CD] hover:border-[#39FF6A]/50" aria-label={isPlaying ? 'Pause blueprint preview' : 'Play blueprint preview'}>
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      </div>
    </section>
  );
}
