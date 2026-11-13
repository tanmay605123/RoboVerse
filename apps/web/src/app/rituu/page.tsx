'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { useRituuStore, RituuChatMode } from '@/store/useRituuStore';
import { useCircuitStore } from '@/store/useCircuitStore';
import { RituuAvatar } from '@/components/rituu/RituuAvatar';
import {
  Sparkles,
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
  RotateCcw,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag,
  Square,
  Wrench,
  Compass,
  Plus,
  Trash2,
  MessageSquare,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Why is my LED not glowing on pin 13?',
  'How do I wire an HC-SR04 ultrasonic sensor?',
  'Calculate motor torque for a 2 kg rover on 15° slope',
  'Explain Ohm’s Law with the water plumbing analogy',
  'Write Arduino code for SG90 servo sweep 0 to 180°',
  'How do I debounce a pushbutton in software?',
];

export default function RituuPage() {
  const router = useRouter();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    messages,
    sendMessage,
    stopGeneration,
    activeMode,
    setMode,
    hintFirst,
    setHintFirst,
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
    currentSessionId,
    sessionsList,
    loadSessions,
    selectSession,
    deleteSession,
    startNewSession,
  } = useRituuStore();

  const { setArduinoCode } = useCircuitStore();

  const [input, setInput] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchQuota();
    loadSessions();
  }, [fetchQuota, loadSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Input Speech Recognition Setup (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Photo Upload Handler (base64)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size exceeds 8MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed && !uploadedPhotoBase64) return;

    const textToSend = trimmed;
    setInput('');

    await sendMessage(
      textToSend,
      uploadedPhotoBase64 ? { imageBase64: uploadedPhotoBase64 } : undefined
    );
  };

  // Copy code snippet to clipboard
  const handleCopyCode = (code: string, id: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  // Apply code patch to workbench
  const handleApplyFix = (codePatch?: string) => {
    if (codePatch) {
      setArduinoCode(codePatch);
      router.push('/workbench?mode=code');
    }
  };

  const textUsed = quota?.messagesUsed ?? 0;
  const textLimit = quota?.messagesLimit ?? 15;
  const textPercent = Math.min(100, Math.round((textUsed / (textLimit || 1)) * 100));

  const photosUsed = quota?.photosUsed ?? 0;
  const photosLimit = quota?.photosLimit ?? 3;
  const photosPercent = Math.min(100, Math.round((photosUsed / (photosLimit || 1)) * 100));

  return (
    <div className="flex h-screen bg-[#07110D] overflow-hidden text-[#EAF7EF]">
      {/* LEFT MAIN NAVIGATION RAIL */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP SYSTEM BAR */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* MAIN BODY AREA: DUAL PANEL (Left Mentorship Controls + Center Chat Area) */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT MENTORSHIP CONTROL DOCK */}
          <aside className="w-80 border-r border-[rgba(57,255,106,0.15)] bg-[#040B08]/90 p-5 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
            <div className="space-y-4">
              {/* Avatar Profile Box */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-[rgba(57,255,106,0.15)]">
                <RituuAvatar state={avatarState} size="lg" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-black text-[#EAF7EF]">Rituu AI</h2>
                    <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-ping" />
                  </div>
                  <p className="text-xs text-[#8FA99B] font-mono">Robotics & Vision Mentor</p>
                </div>
              </div>

              {/* Start New Chat Button */}
              <button
                onClick={startNewSession}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[rgba(57,255,106,0.15)] to-[rgba(127,231,214,0.1)] border border-[#39FF6A]/40 text-[#39FF6A] hover:bg-[rgba(57,255,106,0.25)] font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(57,255,106,0.15)]"
              >
                <Plus className="w-4 h-4" />
                <span>New Robotics Session</span>
              </button>

              {/* Mentorship Mode Switcher */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-[#8FA99B] uppercase font-bold tracking-wider block">
                  Mentorship Mode
                </span>
                <div className="space-y-1.5 font-mono">
                  {[
                    { id: 'debug', label: 'Circuit Doctor', desc: 'Isolate wiring faults & shorts', icon: AlertTriangle },
                    { id: 'code', label: 'Arduino Firmware', desc: 'C++ logic, timers & interrupts', icon: Cpu },
                    { id: 'plan', label: 'BOM & Kinematics', desc: 'Motors, batteries & mechanical', icon: Wrench },
                    { id: 'learn', label: 'Socratic Tutor', desc: 'Learn electronics first principles', icon: HelpCircle },
                  ].map((m) => {
                    const isActive = activeMode === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id as RituuChatMode)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-[rgba(57,255,106,0.15)] border-[#39FF6A] text-[#EAF7EF] shadow-[0_0_12px_rgba(57,255,106,0.25)]'
                            : 'bg-[#040B08] border-[rgba(57,255,106,0.12)] text-[#8FA99B] hover:text-[#EAF7EF]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#39FF6A]' : 'text-[#8FA99B]'}`} />
                          <span className={`text-xs font-bold ${isActive ? 'text-[#39FF6A]' : ''}`}>
                            {m.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8FA99B] line-clamp-1">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hint First Toggle */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#EAF7EF] block">Hint-First Mode</span>
                  <span className="text-[10px] text-[#8FA99B]">Guide with hints before answers</span>
                </div>
                <input
                  type="checkbox"
                  checked={hintFirst}
                  onChange={(e) => setHintFirst(e.target.checked)}
                  className="rounded border-[rgba(57,255,106,0.3)] bg-[#07110D] text-[#39FF6A] focus:ring-0 w-4 h-4"
                />
              </div>

              {/* Recent Saved Sessions */}
              {sessionsList && sessionsList.length > 0 && (
                <div className="space-y-1.5 font-mono pt-2 border-t border-[rgba(57,255,106,0.1)]">
                  <span className="text-[11px] font-mono text-[#8FA99B] uppercase font-bold tracking-wider block">
                    Saved Sessions ({sessionsList.length})
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {sessionsList.map((s) => {
                      const isCurrent = currentSessionId === s.id;
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                            isCurrent
                              ? 'bg-[rgba(57,255,106,0.15)] border-[#39FF6A] text-[#EAF7EF]'
                              : 'bg-black/30 border-white/5 text-[#8FA99B] hover:text-[#EAF7EF]'
                          }`}
                        >
                          <button
                            onClick={() => selectSession(s.id)}
                            className="flex items-center gap-2 truncate text-left flex-1 min-w-0"
                            title={s.title}
                          >
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 text-[#39FF6A]" />
                            <span className="truncate">{s.title || 'Robotics Chat'}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this chat session?')) {
                                deleteSession(s.id);
                              }
                            }}
                            className="p-1 hover:text-[#FF4D4D] text-[#527063] transition-colors ml-1 shrink-0"
                            title="Delete session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Quota Card in Dark Glass Style */}
            <div className="mt-6 p-4 rounded-2xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] space-y-3 font-mono shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#EAF7EF]">Daily AI Quota</span>
                <span className="px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Messages Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#8FA99B]">
                  <span>Chat Queries:</span>
                  <span className="font-bold text-[#EAF7EF]">
                    {textUsed} / {textLimit}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#07150F] rounded-full overflow-hidden border border-[rgba(57,255,106,0.15)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#39FF6A] to-[#7FE7D6] rounded-full shadow-[0_0_8px_#39FF6A]"
                    style={{ width: `${textPercent}%` }}
                  />
                </div>
              </div>

              {/* Photos Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#8FA99B]">
                  <span>Photo Diagnostics:</span>
                  <span className="font-bold text-[#EAF7EF]">
                    {photosUsed} / {photosLimit}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#07150F] rounded-full overflow-hidden border border-[rgba(57,255,106,0.15)]">
                  <div
                    className="h-full bg-[#7FE7D6] rounded-full shadow-[0_0_8px_#7FE7D6]"
                    style={{ width: `${photosPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER CHAT WORKSPACE */}
          <main className="flex-1 flex flex-col bg-[#07110D] overflow-hidden">
            {/* Chat Top Subheader */}
            <div className="h-14 bg-[#07110D]/90 backdrop-blur-xl border-b border-[rgba(57,255,106,0.15)] px-6 flex items-center justify-between shrink-0 font-mono">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#8FA99B] font-bold uppercase">
                  Target Language:
                </span>
                <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lang === 'en'
                        ? 'bg-[#39FF6A] text-[#07110D]'
                        : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang('hi')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lang === 'hi'
                        ? 'bg-[#39FF6A] text-[#07110D]'
                        : 'text-[#8FA99B] hover:text-[#EAF7EF]'
                    }`}
                  >
                    Hindi / Hinglish
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={startNewSession}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(57,255,106,0.15)] border border-[#39FF6A]/40 text-xs text-[#39FF6A] hover:bg-[rgba(57,255,106,0.25)] transition-colors"
                  title="Start a new robotics mentorship session"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#8FA99B] hover:text-[#FF4D4D] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="max-w-4xl mx-auto space-y-5">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && <RituuAvatar state={avatarState} size="md" />}

                      <div className="max-w-[85%] space-y-1">
                        {/* Off-Topic Sentinel Banner */}
                        {msg.isOffTopic && (
                          <div className="p-2.5 rounded-2xl bg-[#FF9A1F]/10 border border-[#FF9A1F]/30 text-[#FF9A1F] text-xs font-mono flex items-center gap-2 font-bold mb-1">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Robotics Scope Sentinel: Question outside robotics</span>
                          </div>
                        )}

                        <div
                          className={`p-4 rounded-3xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-r from-[rgba(57,255,106,0.18)] to-[rgba(43,217,91,0.22)] text-[#EAF7EF] border border-[#39FF6A]/60 shadow-[0_0_20px_rgba(57,255,106,0.2)] rounded-tr-none'
                              : 'bg-[#0E2A1F]/80 text-[#EAF7EF] border border-[rgba(57,255,106,0.2)] rounded-tl-none shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md'
                          }`}
                        >
                          {/* Attached Photo */}
                          {msg.photoUrl && (
                            <div className="mb-3 rounded-2xl overflow-hidden border border-[rgba(57,255,106,0.3)] max-h-60">
                              <img
                                src={msg.photoUrl}
                                alt="Uploaded circuit"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="whitespace-pre-wrap leading-relaxed font-sans">
                            {msg.content || (
                              <span className="text-[#8FA99B] font-mono italic animate-pulse">
                                Calculating electrical netlist & inspecting pin connections...
                              </span>
                            )}
                          </div>

                          {/* Tool Call Proposals */}
                          {msg.toolCalls && msg.toolCalls.length > 0 && (
                            <div className="mt-4 space-y-2.5 pt-3 border-t border-[rgba(57,255,106,0.2)] font-mono">
                              {msg.toolCalls.map((call, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-2xl bg-black/50 border border-[#39FF6A]/30 text-xs"
                                >
                                  {call.name === 'propose_fix' && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-[#39FF6A] font-bold">
                                        <Wrench className="w-4 h-4" />
                                        <span>Proposed Fix: {call.args.title}</span>
                                      </div>
                                      <p className="text-white/70">{call.args.description}</p>
                                      {call.args.code_patch && (
                                        <button
                                          onClick={() => handleApplyFix(call.args.code_patch)}
                                          className="px-3.5 py-1.5 rounded-xl bg-[#39FF6A] text-[#07110D] font-bold text-xs hover:brightness-110 flex items-center gap-1.5"
                                        >
                                          <Check className="w-3.5 h-3.5" /> Apply Code to Circuit Lab
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {call.name === 'highlight_wiring_issue' && (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 text-[#FF9A1F] font-bold">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Pin Fault: {call.args.component_id} ({call.args.pin_id})</span>
                                      </div>
                                      <p className="text-white/70">{call.args.reason}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="px-2 text-[10px] text-[#8FA99B] font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-6 py-2 bg-[#040B08]/90 border-t border-[rgba(57,255,106,0.12)] flex items-center gap-2 overflow-x-auto text-xs font-mono shrink-0">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 rounded-full bg-white/5 text-[#CBD8D0] border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] hover:text-[#39FF6A] transition-colors shrink-0 whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form Bar */}
            <div className="p-4 bg-[#040B08]/95 border-t border-[rgba(57,255,106,0.15)] shrink-0">
              <div className="max-w-4xl mx-auto">
                {uploadedPhotoBase64 && (
                  <div className="mb-2 p-2 rounded-xl bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-xs font-mono text-[#39FF6A] flex items-center justify-between">
                    <span>Circuit photo attached for Vision diagnosis</span>
                    <button onClick={() => setUploadedPhoto(null)} className="font-bold hover:text-[#FF4D4D]">
                      Remove
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-2.5">
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
                    className="p-2.5 rounded-xl bg-white/5 text-[#8FA99B] hover:text-[#39FF6A] border border-[rgba(57,255,106,0.15)] transition-colors"
                    title="Upload Circuit Breadboard Photo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isListening
                        ? 'bg-[rgba(255,77,77,0.15)] border-[#FF4D4D] text-[#FF4D4D] animate-pulse'
                        : 'bg-white/5 border-[rgba(57,255,106,0.15)] text-[#8FA99B] hover:text-[#39FF6A]'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Input'}
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <input
                    type="text"
                    placeholder="Ask Rituu about circuit wiring, motor sizing, or Arduino C++..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-[#07110D] border border-[rgba(57,255,106,0.25)] rounded-2xl px-4 py-2.5 text-sm text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none focus:border-[#39FF6A] font-mono transition-colors"
                  />

                  {avatarState !== 'idle' ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="px-4 py-2.5 rounded-2xl bg-[#FF4D4D]/20 border border-[#FF4D4D]/50 text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim() && !uploadedPhotoBase64}
                      className="btn-primary-neon px-5 py-2.5 text-sm shadow-neon-pill transition-transform hover:scale-105 disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
