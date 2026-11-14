'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Search } from 'lucide-react';
import { docsPlanRows, docsSections } from '../../content/docsContent';
import { SUPPORT_EMAIL, SUPPORT_RESPONSE_TIME } from '../../lib/support';
import { SupportShell } from './SupportShell';

export function DocsClient() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = useMemo(() => docsSections.filter((section) => {
    if (!normalizedQuery) return true;
    return [section.title, section.summary, ...section.paragraphs, ...(section.bullets || [])]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
  }), [normalizedQuery]);

  return (
    <SupportShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-8 max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-robo-borderHighlight bg-robo-neon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-robo-neon font-mono">
            <BookOpen className="h-3.5 w-3.5" /> RoboVerse Knowledge Base
          </div>
          <h1 className="text-3xl font-black tracking-tight text-robo-text sm:text-5xl">Documentation</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-robo-textSecondary sm:text-base">
            Practical guides for learning, building, simulating, and sharing robotics projects in RoboVerse.
          </p>
          <label className="relative mt-6 block max-w-2xl">
            <span className="sr-only">Search documentation</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-robo-textMuted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documentation..."
              className="w-full rounded-2xl border border-robo-borderSubtle bg-robo-pitchDark/90 py-3 pl-11 pr-4 text-sm text-robo-text outline-none transition focus:border-robo-neon focus:ring-2 focus:ring-robo-neon/20"
            />
          </label>
        </header>

        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <label className="sr-only" htmlFor="docs-mobile-toc">Jump to a documentation section</label>
            <select
              id="docs-mobile-toc"
              className="mb-4 w-full rounded-xl border border-robo-borderSubtle bg-robo-pitchDark px-3 py-2.5 text-xs text-robo-text lg:hidden"
              defaultValue="getting-started"
              onChange={(event) => document.getElementById(event.target.value)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
            >
              {docsSections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
            </select>
            <nav aria-label="Documentation table of contents" className="hidden rounded-2xl border border-robo-borderSubtle bg-robo-surface/70 p-3 lg:block">
              <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-robo-textMuted font-mono">ON THIS PAGE</p>
              <div className="space-y-1">
                {docsSections.map((section, index) => (
                  <a key={section.id} href={`#${section.id}`} className="group flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-robo-textSecondary transition hover:bg-robo-neon/10 hover:text-robo-neon">
                    <span className="font-mono text-[10px] text-robo-textMuted group-hover:text-robo-neon">{String(index + 1).padStart(2, '0')}</span>
                    <span>{section.title}</span>
                  </a>
                ))}
              </div>
            </nav>
          </aside>

          <div className="min-w-0 space-y-6">
            {visibleSections.length === 0 && (
              <div className="glass-panel p-8 text-center text-sm text-robo-textSecondary">No documentation sections match “{query}”.</div>
            )}
            {visibleSections.map((section) => {
              const originalIndex = docsSections.findIndex((item) => item.id === section.id);
              const previous = docsSections[originalIndex - 1];
              const next = docsSections[originalIndex + 1];
              return (
                <article id={section.id} key={section.id} className="scroll-mt-24 glass-panel p-5 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-robo-borderSubtle pb-5">
                    <div>
                      <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-robo-neon">{section.eyebrow}</p>
                      <h2 className="mt-2 text-2xl font-black text-robo-text">{section.title}</h2>
                    </div>
                    <a href={`#${section.id}`} aria-label={`Copy link to ${section.title}`} className="rounded-lg border border-robo-borderSubtle px-2.5 py-1.5 text-[10px] font-mono text-robo-textMuted transition hover:border-robo-neon hover:text-robo-neon">#{section.id}</a>
                  </div>
                  <p className="mt-5 text-base font-semibold leading-7 text-robo-teal">{section.summary}</p>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-robo-textSecondary">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                  {section.steps && <ol className="mt-5 space-y-3 rounded-2xl border border-robo-borderSubtle bg-robo-pitchDark/60 p-4 text-sm text-robo-textSecondary">{section.steps.map((step, index) => <li key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-robo-neon/15 font-mono text-xs font-bold text-robo-neon">{index + 1}</span><span>{step}</span></li>)}</ol>}
                  {section.bullets && <ul className="mt-5 grid gap-3 sm:grid-cols-2">{section.bullets.map((bullet) => <li key={bullet} className="rounded-xl border border-robo-borderSubtle bg-robo-pitchDark/50 p-3 text-sm leading-6 text-robo-textSecondary"><span className="mr-2 text-robo-neon">◆</span>{bullet}</li>)}</ul>}
                  {section.componentRows && <div className="mt-6 overflow-x-auto rounded-2xl border border-robo-borderSubtle"><table className="w-full min-w-[560px] text-left text-xs"><thead className="bg-robo-neon/10 font-mono uppercase tracking-wider text-robo-neon"><tr><th className="px-4 py-3">Component</th><th className="px-4 py-3">Best for</th><th className="px-4 py-3">Access</th></tr></thead><tbody className="divide-y divide-robo-borderSubtle">{section.componentRows.map((row) => <tr key={row.component} className="text-robo-textSecondary"><td className="px-4 py-3 font-semibold text-robo-text">{row.component}</td><td className="px-4 py-3">{row.use}</td><td className="px-4 py-3 text-robo-teal">{row.access}</td></tr>)}</tbody></table></div>}
                  {section.id === 'plans-pricing' && <div className="mt-6 overflow-x-auto rounded-2xl border border-robo-borderSubtle"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-robo-neon/10 font-mono uppercase tracking-wider text-robo-neon"><tr><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Projects</th><th className="px-4 py-3">Rituu</th><th className="px-4 py-3">Certificates</th></tr></thead><tbody className="divide-y divide-robo-borderSubtle">{docsPlanRows.map((plan) => <tr key={plan.plan} className="text-robo-textSecondary"><td className="px-4 py-3 font-semibold text-robo-text">{plan.plan}</td><td className="px-4 py-3 text-robo-teal">{plan.price}</td><td className="px-4 py-3">{plan.projects}</td><td className="px-4 py-3">{plan.rituu}</td><td className="px-4 py-3">{plan.certificates}</td></tr>)}</tbody></table><div className="border-t border-robo-borderSubtle p-4"><Link href="/pricing" className="inline-flex items-center gap-2 text-xs font-bold text-robo-neon hover:underline">View full Plans & Pricing <ExternalLink className="h-3.5 w-3.5" /></Link></div></div>}
                  {section.id === 'contact' && <div className="mt-5 rounded-2xl border border-robo-neon/25 bg-robo-neon/5 p-4 text-sm text-robo-textSecondary"><a className="font-semibold text-robo-neon hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a><span className="ml-2">• {SUPPORT_RESPONSE_TIME}</span><div className="mt-3"><Link href="/help" className="inline-flex items-center gap-2 font-bold text-robo-text hover:text-robo-neon">Open Help Center <ArrowRight className="h-4 w-4" /></Link></div></div>}
                  <div className="mt-7 flex items-center justify-between gap-3 border-t border-robo-borderSubtle pt-5">
                    {previous ? <a href={`#${previous.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-robo-textSecondary hover:text-robo-neon"><ArrowLeft className="h-4 w-4" />{previous.title}</a> : <span />}
                    {next ? <a href={`#${next.id}`} className="inline-flex items-center gap-2 text-right text-xs font-bold text-robo-textSecondary hover:text-robo-neon">{next.title}<ArrowRight className="h-4 w-4" /></a> : <span />}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </SupportShell>
  );
}

