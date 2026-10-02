'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRituuStore } from '@/store/useRituuStore';
import { useCircuitStore } from '@/store/useCircuitStore';
import { RituuAvatar } from './RituuAvatar';
import { RituuMode } from '@roboverse/shared';
import {
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

const QUICK_SUGGESTIONS = [
  'How to blink an LED on Arduino?',
  'Fix my short circuit warning',
  'Explain Ohm’s Law with analogy',
  'Recommend motor for 2kg rover',
  'Review my Arduino code',
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
    messages,
    sendMessage,
    rateMessage,
    quota,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
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
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedPhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !uploadedPhotoBase64) return;

    const msg = input;
    setInput('');
    await sendMessage(msg);
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
    <>
      {/* FLOATING TRIGGER BUTTON (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={toggleOpen}
            className="group relative flex items-center gap-3 p-2.5 pr-4 rounded-full bg-gradient-to-r from-[#0E2A1F] to-[#07110D] border border-[#39FF6A]/60 shadow-[0_0_25px_rgba(57,255,106,0.3)] hover:shadow-[0_0_35px_rgba(57,255,106,0.5)] hover:scale-105 active:scale-95 transition-all text-white backdrop-blur-xl"
            title="Ask Rituu AI • Robotics Mentor"
          >
            <RituuAvatar state={avatarState} size="sm" />
            <div className="text-left font-sans">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span>Rituu AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF6A] animate-ping" />
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                {quota ? `${quota.messagesRemaining} msgs left` : 'Ask anything!'}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* EXPANDED CHAT PANEL */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all font-sans flex flex-col overflow-hidden bg-[#07110D]/95 border border-[#39FF6A]/40 shadow-2xl backdrop-blur-2xl ${
            isFullscreen
              ? 'inset-4 rounded-3xl'
              : 'bottom-6 right-6 w-[430px] h-[640px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] rounded-3xl'
          }`}
        >
          {/* HEADER */}
          <div className="p-3.5 bg-[#0E2A1F]/80 border-b border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <RituuAvatar state={avatarState} size="sm" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white">Rituu AI Mentor</h3>
                  <span className="text-[9px] bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30 px-1.5 py-0.2 rounded font-mono">
                    ONLINE
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {quota
                    ? `${quota.messagesUsed}/${quota.messagesLimit} msgs used today (${quota.planTier})`
                    : 'Robotics, Circuits & Code'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              {/* Voice Output Toggle */}
              <button
                onClick={() => setVoiceOutput(!voiceOutputEnabled)}
                className={`p-1.5 rounded-lg transition ${
                  voiceOutputEnabled ? 'text-[#39FF6A] bg-[#39FF6A]/10' : 'hover:text-white'
                }`}
                title={voiceOutputEnabled ? 'Mute Voice Audio' : 'Enable Voice Audio Output'}
              >
                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear History */}
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg hover:text-[#FF3939] transition"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:text-white transition"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                onClick={toggleOpen}
                className="p-1.5 rounded-lg hover:text-white transition"
                title="Minimize Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MODE SELECTOR PILLS */}
          <div className="flex gap-1 p-2 bg-[#09150F] border-b border-gray-800 text-[10px] font-mono overflow-x-auto scrollbar-none">
            {[
              { id: RituuMode.DEBUG, label: '🔧 Debug Circuits' },
              { id: RituuMode.CODE, label: '💻 Arduino Code' },
              { id: RituuMode.PROJECT_PLANNER, label: '🚜 Robot Planner' },
              { id: RituuMode.LEARN, label: '💡 Socratic Tutor' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-2 py-1 rounded-lg whitespace-nowrap transition ${
                  activeMode === m.id
                    ? 'bg-[#39FF6A]/20 text-[#39FF6A] border border-[#39FF6A]/40 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* MESSAGES STREAM */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && <RituuAvatar state={avatarState} size="sm" showHalo={false} />}

                  <div className={`max-w-[85%] space-y-2`}>
                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-[#0E2A1F] text-white border border-[#39FF6A]/30 rounded-tr-none'
                          : 'bg-[#050D09] text-gray-200 border border-gray-800 rounded-tl-none shadow-lg'
                      }`}
                    >
                      {/* Photo Attachment if present */}
                      {msg.photoUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-gray-700 max-h-40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.photoUrl}
                            alt="Uploaded circuit diagram"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content text */}
                      <p>{msg.content}</p>

                      {/* Code Snippet Card */}
                      {msg.codeSnippet && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-800 bg-black/80 font-mono text-[11px]">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-gray-800 text-[10px] text-gray-400">
                            <span>Arduino C++ (ATmega328P)</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                                className="flex items-center gap-1 hover:text-[#39FF6A] transition"
                              >
                                {copiedCodeId === msg.id ? (
                                  <Check className="w-3 h-3 text-[#39FF6A]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedCodeId === msg.id ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                          <pre className="p-3 overflow-x-auto text-[#39FF6A] leading-relaxed">
                            {msg.codeSnippet}
                          </pre>

                          <div className="p-2 bg-gray-900/60 border-t border-gray-800 flex justify-end">
                            <button
                              onClick={() => handleRunInSimulator(msg.codeSnippet!)}
                              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold rounded-lg text-[10px] shadow transition font-sans"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Run in 3D Simulator
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Diagnostics warnings if any */}
                      {msg.diagnostics && msg.diagnostics.length > 0 && (
                        <div className="mt-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] font-mono">
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            Hardware Warning:
                          </div>
                          <div>{msg.diagnostics[0].text}</div>
                        </div>
                      )}

                      {/* Recommended TechSavyyy Components */}
                      {msg.suggestedComponents && msg.suggestedComponents.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-800">
                          <div className="text-[10px] text-gray-400 font-mono mb-1">
                            Recommended Parts (TechSavyyy Store):
                          </div>
                          <div className="space-y-1">
                            {msg.suggestedComponents.map((c, i) => (
                              <Link
                                key={i}
                                href="/store"
                                className="flex items-center justify-between p-1.5 rounded-lg bg-gray-900/70 border border-gray-800 hover:border-[#39FF6A]/40 transition text-[11px]"
                              >
                                <span className="text-gray-300 truncate">{c.name}</span>
                                <span className="text-[#39FF6A] font-mono font-bold shrink-0 ml-2">
                                  ₹{c.priceInr}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Feedback Rating (RLHF) */}
                    {!isUser && (
                      <div className="flex items-center justify-between px-1 text-[10px] text-gray-500 font-mono">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => rateMessage(msg.id, 'UP')}
                            className={`p-1 rounded hover:text-[#39FF6A] transition ${
                              msg.rating === 'UP' ? 'text-[#39FF6A]' : ''
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => rateMessage(msg.id, 'DOWN')}
                            className={`p-1 rounded hover:text-[#FF3939] transition ${
                              msg.rating === 'DOWN' ? 'text-[#FF3939]' : ''
                            }`}
                            title="Needs improvement"
                          >
                            <ThumbsDown className="w-3 h-3" />
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

          {/* QUICK PROMPT SUGGESTION CHIPS */}
          <div className="p-2 border-t border-gray-800 bg-[#09150F]/60 flex gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(s)}
                className="px-2.5 py-1 rounded-full bg-gray-800/60 hover:bg-[#39FF6A]/10 text-gray-400 hover:text-[#39FF6A] border border-gray-700 hover:border-[#39FF6A]/40 text-[10px] whitespace-nowrap transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* UPLOADED PHOTO PREVIEW BANNER */}
          {uploadedPhotoBase64 && (
            <div className="p-2 bg-[#0E2A1F] border-t border-[#39FF6A]/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedPhotoBase64}
                  alt="Ready to analyze"
                  className="w-8 h-8 rounded-lg object-cover border border-[#39FF6A]"
                />
                <span className="text-gray-300 text-[11px] font-mono">
                  Circuit Photo attached (Claude Vision)
                </span>
              </div>
              <button
                onClick={() => setUploadedPhoto(null)}
                className="text-gray-400 hover:text-[#FF3939] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-[#07110D] border-t border-gray-800 flex items-center gap-2 shrink-0"
          >
            {/* Hidden file input */}
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
              className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-[#7FE7D6] transition"
              title="Upload Circuit Photo / Schematic for AI Vision Analysis"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-950 text-rose-400 border border-rose-500 animate-pulse'
                  : 'bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-[#39FF6A]'
              }`}
              title={isListening ? 'Listening... Speak now' : 'Voice Input (Speech-to-Text)'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder="Ask Rituu about circuits, code, or robots..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#0E2A1F]/70 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF6A]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() && !uploadedPhotoBase64}
              className="p-2 rounded-xl bg-gradient-to-r from-[#39FF6A] to-[#2BD95B] hover:brightness-110 text-black font-bold disabled:opacity-40 transition shadow-lg shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
