'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppTopBar } from '../../components/layout/AppTopBar';
import { useRituuStore } from '@/store/useRituuStore';
import { useCircuitStore } from '@/store/useCircuitStore';
import { RituuAvatar } from '@/components/rituu/RituuAvatar';
import { RituuMode } from '@roboverse/shared';
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

  // Run snippet in 3D circuit simulator
  const handleRunInSimulator = (code: string) => {
    setArduinoCode(code);
    router.push('/workbench?mode=code');
  };

  const textUsed = quota?.messagesUsed || 0;
  const textLimit = quota?.messagesLimit || 20;
  const textPercent = Math.min(100, Math.round((textUsed / textLimit) * 100));

  const photosUsed = quota?.photosUsed || 0;
  const photosLimit = quota?.photosLimit || 5;
  const photosPercent = Math.min(100, Math.round((photosUsed / photosLimit) * 100));

  return (
    <div className="flex h-screen bg-[#07110D] overflow-hidden text-[#EAF7EF] font-sans">
      {/* 1. App Navigation Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Sticky Bar */}
        <AppTopBar
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Page Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT MENTORSHIP & QUOTA CONTROL PANEL */}
          <aside className="w-72 bg-[#07110D]/95 backdrop-blur-2xl border-r border-[rgba(57,255,106,0.15)] p-5 flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
            <div className="space-y-6">
              {/* Rituu Hero Card */}
              <div className="p-4 rounded-2xl bg-[#0E2A1F]/50 border border-[rgba(57,255,106,0.25)] text-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <RituuAvatar state={avatarState} size="lg" className="mx-auto mb-2" />
                <h3 className="font-extrabold text-base text-[#EAF7EF]">
                  Rituu AI Mentor
                </h3>
                <p className="text-[11px] text-[#8FA99B] font-mono mt-0.5">
                  Trained strictly on robotics, circuits, microcontrollers &amp; Arduino code.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#040B08] border border-[rgba(57,255,106,0.3)] text-[10px] font-mono font-bold text-[#39FF6A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] animate-pulse" />
                  <span>Google Gemini Flash Active</span>
                </div>
              </div>

              {/* Mentorship Modes */}
              <div className="space-y-2 font-mono">
                <div className="text-[10px] font-bold text-[#8FA99B] uppercase tracking-wider">
                  Mentorship Modes
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: RituuMode.DEBUG, label: 'Circuit Doctor', icon: Zap, desc: 'Find short circuits, missing resistors & wire faults' },
                    { id: RituuMode.CODE, label: 'Arduino Firmware', icon: Cpu, desc: 'Generate & debug C++ sketches with live comments' },
                    { id: RituuMode.PROJECT_PLANNER, label: 'Robot Kinematics', icon: Sliders, desc: 'Motor torque, chassis physics & battery sizing' },
                    { id: RituuMode.LEARN, label: 'Socratic Tutor', icon: HelpCircle, desc: 'Step-by-step guidance & electrical analogies' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isActive = activeMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
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
            </div>

            {/* Daily Quota Card in Dark Glass Style */}
            <div className="mt-6 p-4 rounded-2xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#EAF7EF]">Daily AI Quota</span>
                <span className="px-2 py-0.5 rounded-full bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] text-[10px] font-bold">
                  {quota?.planTier || 'FREE'}
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

              {quota?.planTier === 'FREE' && (
                <Link
                  href="/dashboard?tab=plans"
                  className="block text-center py-2 px-3 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-extrabold text-xs shadow-[0_0_12px_rgba(57,255,106,0.4)] hover:brightness-110"
                >
                  Upgrade to Pro for Unlimited
                </Link>
              )}
            </div>
          </aside>

          {/* CENTER CHAT WORKSPACE */}
          <main className="flex-1 flex flex-col bg-[#07110D] overflow-hidden">
            {/* Chat Top Subheader */}
            <div className="h-14 bg-[#07110D]/90 backdrop-blur-xl border-b border-[rgba(57,255,106,0.15)] px-6 flex items-center justify-between shrink-0 font-mono">
              <div className="flex items-center gap-3">
                <div className="md:hidden">
                  <RituuAvatar state={avatarState} size="sm" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#EAF7EF] flex items-center gap-2">
                    <span>Active Telemetry Session</span>
                    <span className="w-2 h-2 rounded-full bg-[#39FF6A] shadow-[0_0_6px_#39FF6A]" />
                  </h2>
                  <span className="text-[10px] text-[#8FA99B]">
                    Mode: <strong className="text-[#39FF6A] capitalize">{activeMode.toLowerCase()}</strong>
                  </span>
                </div>
              </div>

              {/* Top Controls: Audio, Language & 3D Lab */}
              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <button
                  onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                  className="px-3 py-1.5 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-xs font-bold text-[#EAF7EF] hover:border-[#39FF6A] transition-colors"
                >
                  {lang === 'en' ? 'English' : 'हिंदी'}
                </button>

                {/* Voice Audio Toggle */}
                <button
                  onClick={() => setVoiceOutput(!voiceOutputEnabled)}
                  className={`p-2 rounded-xl border transition-colors ${
                    voiceOutputEnabled
                      ? 'bg-[rgba(57,255,106,0.15)] border-[#39FF6A] text-[#39FF6A]'
                      : 'bg-[#040B08] border-[rgba(57,255,106,0.15)] text-[#8FA99B] hover:text-[#EAF7EF]'
                  }`}
                  title={voiceOutputEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
                >
                  {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Clear Chat */}
                <button
                  onClick={clearChat}
                  className="p-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] text-[#8FA99B] hover:text-[#FF4D4D] transition-colors"
                  title="Clear Chat Conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <Link
                  href="/workbench"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-extrabold rounded-xl text-xs shadow-[0_0_14px_rgba(57,255,106,0.4)] hover:brightness-110"
                >
                  <Layers className="w-4 h-4" />
                  <span>3D Circuit Lab</span>
                </Link>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && <RituuAvatar state={avatarState} size="md" showHalo={false} />}

                    <div className="max-w-[85%] sm:max-w-[78%] space-y-2">
                      <div
                        className={`p-4 sm:p-5 rounded-3xl leading-relaxed text-xs sm:text-sm ${
                          isUser
                            ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-medium rounded-tr-none shadow-[0_0_15px_rgba(57,255,106,0.25)] border border-[#39FF6A]'
                            : 'glass-panel bg-[#0E2A1F]/60 text-[#EAF7EF] border border-[rgba(57,255,106,0.2)] rounded-tl-none shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                        }`}
                      >
                        {/* Attached Photo Preview */}
                        {msg.photoUrl && (
                          <div className="mb-3 rounded-2xl overflow-hidden border border-[rgba(57,255,106,0.3)] max-h-60 bg-black/40">
                            <img
                              src={msg.photoUrl}
                              alt="Uploaded breadboard circuit"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Safety Warning Badge */}
                        {msg.safetyWarning && (
                          <div className="mb-3 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
                            <span>
                              <strong>Safety Notice:</strong> Mains AC and battery puncturing are strictly hazardous.
                            </span>
                          </div>
                        )}

                        {/* Message Text Content */}
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                        {/* Code Snippet Box */}
                        {msg.codeSnippet && (
                          <div className="mt-4 rounded-2xl overflow-hidden border border-[rgba(57,255,106,0.25)] bg-[#040B08] text-white font-mono text-xs shadow-inner">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#0E2A1F] border-b border-[rgba(57,255,106,0.15)] text-[#CBD8D0]">
                              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#39FF6A]">
                                <Cpu className="w-3.5 h-3.5" />
                                Arduino C++ Sketch
                              </span>
                              <button
                                onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                                className="flex items-center gap-1 hover:text-[#39FF6A] transition-colors text-xs font-mono font-bold"
                              >
                                {copiedCodeId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-[#39FF6A]" />
                                    <span className="text-[#39FF6A]">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <pre className="p-4 overflow-x-auto text-[#39FF6A] leading-relaxed font-mono text-[11px]">
                              {msg.codeSnippet}
                            </pre>

                            <div className="p-2.5 bg-[#0E2A1F]/80 border-t border-[rgba(57,255,106,0.15)] flex justify-end">
                              <button
                                onClick={() => handleRunInSimulator(msg.codeSnippet!)}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-extrabold rounded-xl text-xs shadow-[0_0_12px_rgba(57,255,106,0.4)] hover:brightness-110 font-mono"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Run in 3D Circuit Lab</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Diagnostics Hardware Warning */}
                        {msg.diagnostics && msg.diagnostics.length > 0 && (
                          <div className="mt-3 p-3 rounded-2xl bg-[#040B08] border border-[#FF9A1F]/50 text-[#FF9A1F] text-xs font-mono">
                            <div className="flex items-center gap-1.5 font-bold mb-0.5">
                              <AlertTriangle className="w-4 h-4 text-[#FF9A1F]" />
                              <span>Circuit Diagnostic Warning:</span>
                            </div>
                            <div>{msg.diagnostics[0].text}</div>
                          </div>
                        )}

                        {/* Suggested Components linking to TechSavyyy */}
                        {msg.suggestedComponents && msg.suggestedComponents.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-[rgba(57,255,106,0.12)] space-y-2">
                            <span className="text-[10px] font-mono font-bold text-[#8FA99B] uppercase block">
                              RECOMMENDED HARDWARE (TECHSAVYYY STORE):
                            </span>
                            <div className="space-y-1.5">
                              {msg.suggestedComponents.map((comp, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] text-xs"
                                >
                                  <span className="font-semibold text-[#EAF7EF]">
                                    {comp.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#39FF6A] font-mono">
                                      ₹{comp.priceInr}
                                    </span>
                                    <Link
                                      href="/store"
                                      className="px-2.5 py-1 rounded-lg bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] font-mono font-bold text-[10px] flex items-center gap-1 hover:bg-[#39FF6A] hover:text-[#07110D] transition-colors"
                                    >
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>View in Store</span>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message Footer */}
                      {!isUser && (
                        <div className="flex items-center justify-between px-2 text-[10px] text-[#8FA99B] font-mono">
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => rateMessage(msg.id, 'UP')}
                              className={`flex items-center gap-1 hover:text-[#39FF6A] transition-colors ${
                                msg.rating === 'UP' ? 'text-[#39FF6A] font-bold' : ''
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>Helpful</span>
                            </button>
                            <span>•</span>
                            <button
                              onClick={() => rateMessage(msg.id, 'DOWN')}
                              className={`flex items-center gap-1 hover:text-[#FF4D4D] transition-colors ${
                                msg.rating === 'DOWN' ? 'text-[#FF4D4D] font-bold' : ''
                              }`}
                            >
                              <ThumbsDown className="w-3 h-3" />
                              <span>Needs Work</span>
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

            {/* Bottom Input & Quick Prompts Area */}
            <div className="p-4 bg-[#07110D]/95 backdrop-blur-xl border-t border-[rgba(57,255,106,0.15)] shrink-0 space-y-3">
              <div className="max-w-4xl mx-auto space-y-3">
                {/* Quick Prompts Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                  <span className="text-[10px] font-bold text-[#8FA99B] shrink-0 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#39FF6A]" />
                    QUICK ASKS:
                  </span>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="px-3 py-1 rounded-xl bg-[#040B08] border border-[rgba(57,255,106,0.15)] text-[#CBD8D0] text-xs hover:border-[#39FF6A] hover:text-[#39FF6A] transition-colors shrink-0 whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Photo attachment notification */}
                {uploadedPhotoBase64 && (
                  <div className="p-2.5 bg-[#040B08] border border-[rgba(57,255,106,0.3)] rounded-xl flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#39FF6A] font-bold">
                      <ImageIcon className="w-4 h-4" />
                      <span>Circuit photo attached ready for Gemini Vision diagnostics</span>
                    </div>
                    <button
                      onClick={() => setUploadedPhoto(null)}
                      className="text-[#8FA99B] hover:text-[#FF4D4D] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Form Input Bar */}
                <form onSubmit={handleSend} className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />

                  {/* Photo Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-2xl bg-[#040B08] hover:bg-[#0E2A1F] text-[#8FA99B] hover:text-[#39FF6A] border border-[rgba(57,255,106,0.2)] transition-colors shrink-0"
                    title="Upload Circuit Breadboard Photo"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  {/* Speech to Text Microphone Button */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-3 rounded-2xl border transition-colors shrink-0 ${
                      isListening
                        ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse'
                        : 'bg-[#040B08] border-[rgba(57,255,106,0.2)] text-[#8FA99B] hover:text-[#39FF6A]'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Input (Mic)'}
                  >
                    {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    placeholder="Ask Rituu about circuit wiring, Arduino code, motor torque, or robot kinematics..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-[#040B08] border border-[rgba(57,255,106,0.2)] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#EAF7EF] placeholder-[#527063] font-mono focus:outline-none focus:border-[#39FF6A] transition-colors"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!input.trim() && !uploadedPhotoBase64}
                    className="px-5 sm:px-6 py-3 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] font-extrabold rounded-2xl text-xs sm:text-sm shadow-[0_0_15px_rgba(57,255,106,0.4)] hover:brightness-110 flex items-center gap-2 shrink-0 disabled:opacity-40"
                  >
                    <Send className="w-4 h-4 stroke-[3]" />
                    <span className="hidden sm:inline">Ask Rituu</span>
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
