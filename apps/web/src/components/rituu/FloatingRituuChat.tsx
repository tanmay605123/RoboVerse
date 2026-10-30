'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRituuStore, RituuChatMode } from '@/store/useRituuStore';
import { useCircuitStore } from '@/store/useCircuitStore';
import { RituuAvatar } from './RituuAvatar';
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
  X,
  Maximize2,
  Minimize2,
  Square,
  Wrench,
  BookOpen,
  Compass,
} from 'lucide-react';

const QUICK_SUGGESTIONS = [
  'Why is my LED not lighting up?',
  'How do I calculate resistor value for 5V LED?',
  'Explain Arduino analogRead vs digitalRead',
  'Write code for HC-SR04 ultrasonic sensor',
  'How do I wire an L298N motor driver?',
];

export const FloatingRituuChat: React.FC = () => {
  const router = useRouter();
  const {
    isOpen,
    toggleOpen,
    isFullscreen,
    toggleFullscreen,
    avatarState,
    activeMode,
    setMode,
    hintFirst,
    setHintFirst,
    messages,
    quota,
    voiceOutputEnabled,
    setVoiceOutput,
    isListening,
    setIsListening,
    uploadedPhotoBase64,
    setUploadedPhoto,
    sendMessage,
    stopGeneration,
  } = useRituuStore();

  const { setArduinoCode } = useCircuitStore();

  const [input, setInput] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Voice Input Speech Recognition Setup (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
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

  // Apply proposed fix to circuit workbench
  const handleApplyFix = (codePatch?: string) => {
    if (codePatch) {
      setArduinoCode(codePatch);
      router.push('/workbench?mode=code');
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Bottom Right - Dark Glass & Glowing Neon Green) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={toggleOpen}
            className="group relative flex items-center gap-3 p-2.5 pr-4 rounded-full bg-[#07110D]/95 border border-[rgba(57,255,106,0.3)] shadow-[0_0_25px_rgba(57,255,106,0.25)] hover:border-[#39FF6A] hover:shadow-[0_0_35px_rgba(57,255,106,0.4)] hover:scale-105 active:scale-95 transition-all text-[#EAF7EF] backdrop-blur-xl"
            title="Ask Rituu AI • Robotics Mentor"
          >
            <RituuAvatar state={avatarState} size="sm" />
            <div className="text-left font-sans">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#EAF7EF]">
                <span>Ask Rituu</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] animate-ping" />
              </div>
              <div className="text-[10px] font-mono text-[#8FA99B]">
                {quota
                  ? `${quota.messagesLimit - quota.messagesUsed} msgs left today`
                  : 'AI Robotics Mentor'}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* EXPANDED POPUP CHAT PANEL (Dark Glass Control-Room Style) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all font-sans flex flex-col overflow-hidden bg-[#07110D]/95 backdrop-blur-2xl border border-[rgba(57,255,106,0.25)] shadow-[0_0_60px_rgba(0,0,0,0.85)] ${
            isFullscreen
              ? 'inset-4 rounded-3xl'
              : 'bottom-6 right-6 w-[430px] h-[640px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] rounded-3xl'
          }`}
        >
          {/* TOP HEADER */}
          <div className="p-3.5 bg-[#040B08]/90 border-b border-[rgba(57,255,106,0.15)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <RituuAvatar state={avatarState} size="sm" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#EAF7EF]">Rituu AI Mentor</h3>
                  <span className="text-[9px] font-mono bg-[rgba(57,255,106,0.15)] text-[#39FF6A] border border-[rgba(57,255,106,0.3)] px-1.5 py-0.2 rounded-full font-bold">
                    ONLINE
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#8FA99B]">
                  {quota
                    ? `${quota.messagesUsed}/${quota.messagesLimit} msgs used today`
                    : 'Robotics, Circuits & Code'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#8FA99B]">
              {/* Voice Output Toggle */}
              <button
                onClick={() => setVoiceOutput(!voiceOutputEnabled)}
                className={`p-1.5 rounded-lg transition-colors ${
                  voiceOutputEnabled ? 'text-[#39FF6A] bg-[rgba(57,255,106,0.12)]' : 'hover:text-[#EAF7EF]'
                }`}
                title={voiceOutputEnabled ? 'Mute Voice' : 'Enable Voice'}
              >
                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:text-[#EAF7EF] transition-colors"
                title={isFullscreen ? 'Restore' : 'Maximize'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Full Page View Link */}
              <Link
                href="/rituu"
                className="p-1.5 rounded-lg hover:text-[#39FF6A] transition-colors"
                title="Open Fullscreen Workspace"
              >
                <Layers className="w-4 h-4" />
              </Link>

              {/* Close Button */}
              <button
                onClick={toggleOpen}
                className="p-1.5 rounded-lg hover:text-[#EAF7EF] transition-colors ml-1"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MENTORSHIP MODE TABS & HINT-FIRST TOGGLE */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#0A1F17]/80 border-b border-[rgba(57,255,106,0.12)] text-[10px] font-mono shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto pr-2">
              <span className="text-[#8FA99B] font-bold mr-1 shrink-0">Mode:</span>
              {[
                { id: 'debug', label: 'Debug' },
                { id: 'code', label: 'Code' },
                { id: 'plan', label: 'BOM/Plan' },
                { id: 'learn', label: 'Learn' },
              ].map((m) => {
                const isActive = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as RituuChatMode)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] text-[#07110D] shadow-[0_0_12px_rgba(57,255,106,0.4)]'
                        : 'bg-white/5 text-[#8FA99B] hover:text-[#EAF7EF] border border-[rgba(57,255,106,0.1)]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Hint First Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-[#8FA99B] hover:text-[#EAF7EF] shrink-0">
              <input
                type="checkbox"
                checked={hintFirst}
                onChange={(e) => setHintFirst(e.target.checked)}
                className="rounded border-[rgba(57,255,106,0.3)] bg-black/40 text-[#39FF6A] focus:ring-0"
              />
              <span className="text-[10px] font-bold">Hint First</span>
            </label>
          </div>

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#07110D]/90">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && <RituuAvatar state={avatarState} size="sm" showHalo={false} />}

                  <div className="max-w-[85%] space-y-1">
                    {/* Off-Topic Sentinel Banner */}
                    {msg.isOffTopic && (
                      <div className="p-2 rounded-xl bg-[#FF9A1F]/10 border border-[#FF9A1F]/30 text-[#FF9A1F] text-[10px] font-mono flex items-center gap-1.5 font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Robotics Scope Sentinel: Question outside robotics</span>
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-[rgba(57,255,106,0.18)] to-[rgba(43,217,91,0.22)] text-[#EAF7EF] border border-[#39FF6A]/60 shadow-[0_0_15px_rgba(57,255,106,0.2)] rounded-tr-none'
                          : 'bg-[#0E2A1F]/70 text-[#EAF7EF] border border-[rgba(57,255,106,0.18)] rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md'
                      }`}
                    >
                      {/* Attached Photo */}
                      {msg.photoUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-[rgba(57,255,106,0.3)] max-h-48">
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
                            Thinking & calculating electrical model...
                          </span>
                        )}
                      </div>

                      {/* Tool Call Proposals */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-[rgba(57,255,106,0.2)]">
                          {msg.toolCalls.map((call, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-black/40 border border-[#39FF6A]/30 text-xs font-mono"
                            >
                              {call.name === 'propose_fix' && (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-[#39FF6A] font-bold">
                                    <Wrench className="w-3.5 h-3.5" />
                                    <span>Proposed Fix: {call.args.title}</span>
                                  </div>
                                  <p className="text-[11px] text-white/70">{call.args.description}</p>
                                  {call.args.code_patch && (
                                    <button
                                      onClick={() => handleApplyFix(call.args.code_patch)}
                                      className="px-3 py-1 rounded-lg bg-[#39FF6A] text-[#07110D] font-bold text-[10px] hover:brightness-110 flex items-center gap-1"
                                    >
                                      <Check className="w-3 h-3" /> Apply Fix to Workspace
                                    </button>
                                  )}
                                </div>
                              )}

                              {call.name === 'highlight_wiring_issue' && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-[#FF9A1F] font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Pin Issue: {call.args.component_id} ({call.args.pin_id})</span>
                                  </div>
                                  <p className="text-[11px] text-white/70">{call.args.reason}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="px-2 text-[9px] text-[#8FA99B] font-mono">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* QUICK PROMPT SUGGESTIONS */}
          <div className="px-3 py-2 bg-[#040B08]/90 border-t border-[rgba(57,255,106,0.12)] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono shrink-0">
            {QUICK_SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)] text-[#CBD8D0] border border-[rgba(57,255,106,0.15)] hover:border-[#39FF6A] hover:text-[#39FF6A] transition-colors shrink-0 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* BOTTOM INPUT BAR */}
          <div className="p-3 bg-[#040B08]/95 border-t border-[rgba(57,255,106,0.15)] shrink-0">
            {/* Photo preview pill */}
            {uploadedPhotoBase64 && (
              <div className="mb-2 p-1.5 px-2 rounded-xl bg-[rgba(57,255,106,0.1)] border border-[rgba(57,255,106,0.3)] text-[10px] font-mono text-[#39FF6A] flex items-center justify-between">
                <span>Circuit photo attached for Vision diagnosis</span>
                <button onClick={() => setUploadedPhoto(null)} className="font-bold hover:text-[#FF4D4D]">
                  Remove
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2">
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
                className="p-2 rounded-xl bg-[rgba(255,255,255,0.04)] text-[#8FA99B] hover:text-[#39FF6A] border border-[rgba(57,255,106,0.15)] transition-colors"
                title="Upload Circuit Breadboard Photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl border transition-colors ${
                  isListening
                    ? 'bg-[rgba(255,77,77,0.15)] border-[#FF4D4D] text-[#FF4D4D] animate-pulse'
                    : 'bg-[rgba(255,255,255,0.04)] border-[rgba(57,255,106,0.15)] text-[#8FA99B] hover:text-[#39FF6A]'
                }`}
                title={isListening ? 'Listening...' : 'Voice Input'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                placeholder="Ask Rituu about circuits or Arduino..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-[#07110D] border border-[rgba(57,255,106,0.2)] rounded-xl px-3 py-2 text-xs text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none focus:border-[#39FF6A] font-mono transition-colors"
              />

              {avatarState !== 'idle' ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="p-2 rounded-xl bg-[#FF4D4D]/20 border border-[#FF4D4D]/50 text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() && !uploadedPhotoBase64}
                  className="btn-primary-neon px-3.5 py-2 text-xs shadow-neon-pill transition-transform hover:scale-105 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};
