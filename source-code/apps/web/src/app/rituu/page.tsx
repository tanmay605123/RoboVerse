'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRituuStore } from '@/store/useRituuStore';
import { useCircuitStore } from '@/store/useCircuitStore';
import { RituuAvatar } from '@/components/rituu/RituuAvatar';
import { RituuMode } from '@roboverse/shared';
import {
  Sparkles,
  ChevronLeft,
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Copy,
  Check,
  Cpu,
  Layers,
  HelpCircle,
  Zap,
  Sliders,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export default function RituuPage() {
  const router = useRouter();
  const {
    messages,
    sendMessage,
    rateMessage,
    activeMode,
    setMode,
    avatarState,
    quota,
    fetchQuota,
    voiceOutputEnabled,
    setVoiceOutput,
    isListening,
    setIsListening,
    uploadedPhotoBase64,
    setUploadedPhoto,
    clearChat,
  } = useRituuStore();

  const { setArduinoCode } = useCircuitStore();

  const [input, setInput] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !uploadedPhotoBase64) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunInSimulator = (code: string) => {
    setArduinoCode(code);
    router.push('/workbench');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="w-screen h-screen bg-[#07110D] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* TOP HEADER */}
      <header className="h-16 bg-[#07110D]/95 border-b border-[#39FF6A]/20 px-6 flex items-center justify-between shrink-0 z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-gray-800/40 hover:bg-[#39FF6A]/10 text-gray-400 hover:text-[#39FF6A] border border-gray-700/60 transition"
            title="Return to Dashboard"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2.5">
            <RituuAvatar state={avatarState} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wide">
                  Rituu <span className="text-[#39FF6A]">AI Copilot</span>
                </h1>
                <span className="text-[10px] font-mono bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-2 py-0.5 rounded-full">
                  Robotics Mentor
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {quota
                  ? `${quota.messagesUsed}/${quota.messagesLimit} messages used • ${quota.photosUsed}/${quota.photosLimit} photos analyzed (${quota.planTier})`
                  : 'Claude 3.5 Sonnet Vision Engine'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 rounded-xl bg-[#0E2A1F] border border-[#39FF6A]/30 text-xs font-mono text-[#39FF6A] hover:bg-[#39FF6A]/20 transition"
          >
            Language: {lang === 'en' ? 'English' : 'हिंदी'}
          </button>

          {/* Voice Audio Toggle */}
          <button
            onClick={() => setVoiceOutput(!voiceOutputEnabled)}
            className={`p-2 rounded-xl border transition ${
              voiceOutputEnabled
                ? 'bg-[#39FF6A]/20 border-[#39FF6A] text-[#39FF6A]'
                : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:text-white'
            }`}
            title={voiceOutputEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
          >
            {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <Link
            href="/workbench"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold rounded-xl text-xs shadow-lg transition"
          >
            <Layers className="w-4 h-4" />
            3D Workbench
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOPIC SELECTOR SIDEBAR */}
        <aside className="w-64 bg-[#09150F]/80 border-r border-gray-800 p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              Mentorship Modes
            </div>

            <nav className="space-y-1.5 text-xs font-medium">
              {[
                { id: RituuMode.DEBUG, label: 'Circuit Doctor', icon: Zap, desc: 'Find short circuits & missing resistors' },
                { id: RituuMode.CODE, label: 'Arduino Firmware', icon: Cpu, desc: 'Write, debug & optimize C++ sketches' },
                { id: RituuMode.PROJECT_PLANNER, label: 'Robot Kinematics', icon: Sliders, desc: 'Motor torque, battery & chassis' },
                { id: RituuMode.LEARN, label: 'Socratic Tutor', icon: HelpCircle, desc: 'Analogies for Ohm’s law & logic' },
              ].map((m) => {
                const Icon = m.icon;
                const isActive = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-[#0E2A1F] border-[#39FF6A]/60 text-white shadow-lg shadow-[#39FF6A]/10'
                        : 'bg-[#07110D]/40 border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#39FF6A]' : 'text-gray-400'}`} />
                      <span className="font-bold text-xs">{m.label}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-mono line-clamp-1">{m.desc}</p>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Daily Quota Card */}
          <div className="p-4 rounded-2xl bg-[#0E2A1F]/40 border border-gray-800 text-xs font-mono space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Daily Text:</span>
              <span className="text-[#39FF6A] font-bold">
                {quota ? `${quota.messagesRemaining} remaining` : '15 / day'}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Vision Photos:</span>
              <span className="text-[#7FE7D6] font-bold">
                {quota ? `${quota.photosRemaining} remaining` : '3 / day'}
              </span>
            </div>
            <a
              href="/#pricing"
              className="block text-center mt-2 py-1.5 bg-[#39FF6A]/10 hover:bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/30 rounded-xl text-[11px] font-bold transition"
            >
              Upgrade for Unlimited
            </a>
          </div>
        </aside>

        {/* CENTER CHAT WORKSPACE */}
        <main className="flex-1 flex flex-col bg-[#050D09] overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && <RituuAvatar state={avatarState} size="md" showHalo={false} />}

                  <div className="max-w-[80%] space-y-2">
                    <div
                      className={`p-4 rounded-3xl leading-relaxed whitespace-pre-wrap text-xs font-sans ${
                        isUser
                          ? 'bg-[#0E2A1F] text-white border border-[#39FF6A]/30 rounded-tr-none'
                          : 'bg-[#09150F] text-gray-200 border border-gray-800 rounded-tl-none shadow-xl'
                      }`}
                    >
                      {msg.photoUrl && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-gray-700 max-h-60">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.photoUrl}
                            alt="Uploaded diagram"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <p className="leading-relaxed">{msg.content}</p>

                      {msg.codeSnippet && (
                        <div className="mt-4 rounded-2xl overflow-hidden border border-gray-800 bg-black/80 font-mono text-[11px]">
                          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-[11px] text-gray-400">
                            <span>Arduino C++ (ATmega328P)</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                                className="flex items-center gap-1 hover:text-[#39FF6A] transition"
                              >
                                {copiedCodeId === msg.id ? (
                                  <Check className="w-3.5 h-3.5 text-[#39FF6A]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span>{copiedCodeId === msg.id ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                          <pre className="p-4 overflow-x-auto text-[#39FF6A] leading-relaxed">
                            {msg.codeSnippet}
                          </pre>

                          <div className="p-2.5 bg-gray-900/60 border-t border-gray-800 flex justify-end">
                            <button
                              onClick={() => handleRunInSimulator(msg.codeSnippet!)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold rounded-xl text-xs shadow transition font-sans"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Run in 3D Simulator
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Diagnostics warnings */}
                      {msg.diagnostics && msg.diagnostics.length > 0 && (
                        <div className="mt-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono">
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Hardware Warning:
                          </div>
                          <div>{msg.diagnostics[0].text}</div>
                        </div>
                      )}
                    </div>

                    {!isUser && (
                      <div className="flex items-center justify-between px-2 text-[10px] text-gray-500 font-mono">
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => rateMessage(msg.id, 'UP')}
                            className={`hover:text-[#39FF6A] transition ${msg.rating === 'UP' ? 'text-[#39FF6A]' : ''}`}
                          >
                            Helpful
                          </button>
                          <span>•</span>
                          <button
                            onClick={() => rateMessage(msg.id, 'DOWN')}
                            className={`hover:text-[#FF3939] transition ${msg.rating === 'DOWN' ? 'text-[#FF3939]' : ''}`}
                          >
                            Issue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom input area */}
          <div className="p-4 bg-[#07110D] border-t border-gray-800 shrink-0">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Photo preview */}
              {uploadedPhotoBase64 && (
                <div className="p-2.5 bg-[#0E2A1F] border border-[#39FF6A]/40 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-[#39FF6A]">Photo attached ready for Claude Vision analysis</span>
                  <button onClick={() => setUploadedPhoto(null)} className="text-gray-400 hover:text-white">
                    Cancel
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-[#7FE7D6] transition"
                  title="Upload Breadboard Photo / Diagram"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="Ask Rituu: 'How do I wire an ultrasonic sensor?' or 'Why is my LED not glowing?'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-[#0E2A1F]/60 border border-gray-700/80 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF6A]"
                />

                <button
                  type="submit"
                  disabled={!input.trim() && !uploadedPhotoBase64}
                  className="px-6 py-3 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold rounded-2xl text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  Ask Rituu
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
