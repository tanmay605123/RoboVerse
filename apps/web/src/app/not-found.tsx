import Link from 'next/link';
import { ArrowLeft, BookOpen, HelpCircle, Radar } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="hud-grid-bg flex min-h-screen items-center justify-center bg-robo-bg px-5 py-12 text-robo-text">
      <div className="glass-panel w-full max-w-xl p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-robo-neon/40 bg-robo-neon/10 text-robo-neon shadow-neon-subtle"><Radar className="h-8 w-8" /></div>
        <p className="mt-6 font-mono text-xs font-bold tracking-[0.2em] text-robo-neon">SIGNAL NOT FOUND / 404</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">This route drifted out of orbit.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-robo-textSecondary">The page may have moved, but the next useful guide is close by.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/docs" className="inline-flex items-center justify-center gap-2 rounded-xl bg-robo-neon px-5 py-3 text-xs font-black text-robo-bg hover:bg-robo-neonHover"><BookOpen className="h-4 w-4" /> Documentation</Link><Link href="/help" className="inline-flex items-center justify-center gap-2 rounded-xl border border-robo-borderHighlight px-5 py-3 text-xs font-bold text-robo-neon hover:bg-robo-neon/10"><HelpCircle className="h-4 w-4" /> Help Center</Link></div>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-robo-textMuted hover:text-robo-text"><ArrowLeft className="h-3.5 w-3.5" /> Return home</Link>
      </div>
    </main>
  );
}

