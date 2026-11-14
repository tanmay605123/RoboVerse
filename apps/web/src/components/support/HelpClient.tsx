'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Check, ChevronDown, Clipboard, Cpu, CreditCard, HelpCircle, Mail, Search, ShoppingBag, Sparkles, User, Users } from 'lucide-react';
import { helpCategories, helpFaqs } from '../../content/helpContent';
import { SUPPORT_EMAIL, SUPPORT_RESPONSE_TIME } from '../../lib/support';
import { SupportShell } from './SupportShell';

const categoryIcons = { user: User, 'credit-card': CreditCard, cpu: Cpu, 'shopping-bag': ShoppingBag, sparkles: Sparkles, users: Users } as const;

export function HelpClient() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', category: 'Account and Login', message: '' });
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return helpFaqs.filter((faq) => (activeCategory === 'all' || faq.category === activeCategory) && (!needle || `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(needle)));
  }, [activeCategory, query]);

  const submitFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);
    setFormError(null);
    if (formState.name.trim().length < 2) return setFormError('Please enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(formState.email.trim())) return setFormError('Please enter a valid email address.');
    if (formState.message.trim().length < 10) return setFormError('Please include at least 10 characters in your message.');
    const subject = `RoboVerse support: ${formState.category}`;
    const body = `Name: ${formState.name.trim()}\nEmail: ${formState.email.trim()}\nCategory: ${formState.category}\n\n${formState.message.trim()}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setFormMessage('Your email draft is ready. Send it from your mail app to reach support.');
  };

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(SUPPORT_EMAIL); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setFormError('Copy was unavailable. Please select the email address manually.'); }
  };

  return (
    <SupportShell>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="glass-panel relative overflow-hidden p-6 text-center sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-robo-neon/10 blur-3xl" />
          <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-robo-neon">ROBO-HELP / SUPPORT HUB</p>
          <h1 className="mt-3 text-3xl font-black text-robo-text sm:text-5xl">How can we help?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-robo-textSecondary">Search common answers or choose a category to find the shortest path back to your build.</p>
          <label className="relative mx-auto mt-7 block max-w-2xl text-left"><span className="sr-only">Search help center</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-robo-textMuted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions, simulator, billing..." className="w-full rounded-2xl border border-robo-borderSubtle bg-robo-pitchDark/90 py-3.5 pl-11 pr-4 text-sm text-robo-text outline-none focus:border-robo-neon focus:ring-2 focus:ring-robo-neon/20" /></label>
        </section>

        <section className="mt-8"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black text-robo-text">Quick categories</h2><span className="font-mono text-[10px] text-robo-textMuted">{filteredFaqs.length} answers</span></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{helpCategories.map((category) => { const Icon = categoryIcons[category.icon as keyof typeof categoryIcons]; const active = activeCategory === category.id; return <button key={category.id} onClick={() => setActiveCategory(active ? 'all' : category.id)} className={`glass-panel-hover rounded-2xl p-4 text-left transition ${active ? 'border-robo-neon bg-robo-neon/10' : ''}`} aria-pressed={active}><Icon className={`h-5 w-5 ${active ? 'text-robo-neon' : 'text-robo-teal'}`} /><span className="mt-3 block text-xs font-bold text-robo-text">{category.title}</span><span className="mt-1 block text-[10px] leading-4 text-robo-textMuted">{category.description}</span></button>; })}</div></section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div><div className="mb-4 flex items-end justify-between gap-3"><div><p className="font-mono text-[10px] font-bold tracking-[0.18em] text-robo-neon">FAQ / LIVE FILTER</p><h2 className="mt-1 text-2xl font-black text-robo-text">Frequently asked questions</h2></div>{activeCategory !== 'all' && <button onClick={() => setActiveCategory('all')} className="text-xs font-bold text-robo-neon hover:underline">Clear category</button>}</div><div className="space-y-2">{filteredFaqs.map((faq) => { const isOpen = openFaq === faq.id; return <div key={faq.id} className="overflow-hidden rounded-2xl border border-robo-borderSubtle bg-robo-surface/70"><h3><button className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-robo-text transition hover:text-robo-neon" onClick={() => setOpenFaq(isOpen ? null : faq.id)} aria-expanded={isOpen} aria-controls={`faq-answer-${faq.id}`}><span>{faq.question}</span><ChevronDown className={`h-4 w-4 shrink-0 text-robo-neon transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button></h3>{isOpen && <div id={`faq-answer-${faq.id}`} className="border-t border-robo-borderSubtle px-4 pb-4 pt-3 text-sm leading-6 text-robo-textSecondary">{faq.answer}</div>}</div>; })}</div>{filteredFaqs.length === 0 && <div className="glass-panel p-8 text-center text-sm text-robo-textSecondary">No FAQs match that search. Try a different phrase or send feedback below.</div>}</div>
          <aside className="space-y-6">
            <div className="glass-panel p-5"><div className="flex items-center gap-2"><Cpu className="h-5 w-5 text-robo-neon" /><h2 className="font-bold text-robo-text">Simulator checklist</h2></div><ol className="mt-4 space-y-3 text-xs leading-5 text-robo-textSecondary">{['Update your browser.', 'Enable hardware acceleration.', 'Close heavy tabs and apps.', 'Clear the RoboVerse site cache.', 'Try another supported browser.'].map((item, index) => <li key={item} className="flex gap-2"><span className="font-mono text-robo-neon">0{index + 1}</span>{item}</li>)}</ol></div>
            <div className="glass-panel p-5"><div className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-robo-teal" /><h2 className="font-bold text-robo-text">Still need help?</h2></div><p className="mt-3 text-xs leading-5 text-robo-textSecondary">Email the RoboVerse team and include your account email, device, browser, and a link or screenshot when relevant.</p><div className="mt-4 flex items-center gap-2"><a href={`mailto:${SUPPORT_EMAIL}`} className="min-w-0 truncate text-xs font-bold text-robo-neon hover:underline">{SUPPORT_EMAIL}</a><button onClick={copyEmail} className="rounded-lg border border-robo-borderSubtle p-2 text-robo-textSecondary hover:border-robo-neon hover:text-robo-neon" aria-label="Copy support email">{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}</button></div><p className="mt-3 font-mono text-[10px] text-robo-textMuted">{SUPPORT_RESPONSE_TIME}</p></div>
          </aside>
        </section>

        <section className="glass-panel mt-10 p-5 sm:p-7"><div className="flex items-start gap-3"><div className="rounded-xl bg-robo-neon/10 p-2 text-robo-neon"><Mail className="h-5 w-5" /></div><div><p className="font-mono text-[10px] font-bold tracking-[0.18em] text-robo-neon">FEEDBACK CHANNEL</p><h2 className="mt-1 text-2xl font-black text-robo-text">Report a bug or send feedback</h2><p className="mt-2 text-sm text-robo-textSecondary">This opens a pre-filled email draft; your message is not sent automatically.</p></div></div><form onSubmit={submitFeedback} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-robo-textSecondary">Name<input required value={formState.name} onChange={(event) => setFormState({ ...formState, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-robo-borderSubtle bg-robo-pitchDark px-3 py-2.5 text-sm text-robo-text outline-none focus:border-robo-neon" /></label><label className="text-xs font-bold text-robo-textSecondary">Email<input required type="email" value={formState.email} onChange={(event) => setFormState({ ...formState, email: event.target.value })} className="mt-1.5 w-full rounded-xl border border-robo-borderSubtle bg-robo-pitchDark px-3 py-2.5 text-sm text-robo-text outline-none focus:border-robo-neon" /></label><label className="text-xs font-bold text-robo-textSecondary">Category<select value={formState.category} onChange={(event) => setFormState({ ...formState, category: event.target.value })} className="mt-1.5 w-full rounded-xl border border-robo-borderSubtle bg-robo-pitchDark px-3 py-2.5 text-sm text-robo-text outline-none focus:border-robo-neon">{helpCategories.map((category) => <option key={category.id}>{category.title}</option>)}</select></label><label className="text-xs font-bold text-robo-textSecondary sm:col-span-2">Message<textarea required minLength={10} rows={5} value={formState.message} onChange={(event) => setFormState({ ...formState, message: event.target.value })} className="mt-1.5 w-full resize-y rounded-xl border border-robo-borderSubtle bg-robo-pitchDark px-3 py-2.5 text-sm text-robo-text outline-none focus:border-robo-neon" placeholder="Tell us what happened and what you expected..." /></label>{formError && <p className="sm:col-span-2 text-xs font-semibold text-red-400" role="alert">{formError}</p>}{formMessage && <p className="sm:col-span-2 text-xs font-semibold text-robo-neon" role="status">{formMessage}</p>}<div className="sm:col-span-2"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-robo-neon px-5 py-3 text-xs font-black text-robo-bg transition hover:bg-robo-neonHover focus:outline-none focus:ring-2 focus:ring-robo-neon focus:ring-offset-2 focus:ring-offset-robo-bg"><Mail className="h-4 w-4" /> Open email draft</button></div></form></section>
      </div>
    </SupportShell>
  );
}

