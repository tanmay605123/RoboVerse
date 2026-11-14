'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  SquadMessage,
  SquadMember,
  SquadRole,
  realtimeManager,
} from '@roboverse/shared';

interface SquadChatDrawerProps {
  squadId?: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: SquadRole;
  currentUserStudentId?: string;
}

export function SquadChatDrawer({
  squadId = 'squad_garuda_2026',
  currentUserId = 'usr_aarav_01',
  currentUserName = 'Aarav Sharma',
  currentUserRole = 'TEAM_CAPTAIN',
  currentUserStudentId = 'RV-2026-000108',
}: SquadChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load initial messages and squad roster
  useEffect(() => {
    async function loadSquadData() {
      try {
        const [msgRes, memRes] = await Promise.all([
          fetch(`/api/squad/messages?squadId=${squadId}`),
          fetch(`/api/squad/members?squadId=${squadId}`),
        ]);
        const msgJson = await msgRes.json();
        const memJson = await memRes.json();

        if (msgJson.data) setMessages(msgJson.data);
        if (memJson.data) setMembers(memJson.data);
      } catch (err) {
        console.error('Failed to load squad data:', err);
      }
    }
    loadSquadData();

    // Subscribe to real-time incoming messages via Realtime Manager
    const unsubscribe = realtimeManager.subscribeToSquad(squadId, {
      onMessage: (newMsg: SquadMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [squadId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic message creation
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: SquadMessage = {
      id: tempId,
      squadId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderStudentId: currentUserStudentId,
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/squad/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          squadId,
          senderId: currentUserId,
          senderName: currentUserName,
          senderRole: currentUserRole,
          senderStudentId: currentUserStudentId,
          content,
        }),
      });
      const json = await res.json();
      if (json.data) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? json.data : m)));
      }
    } catch (err) {
      console.error('Failed to post squad message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadgeColor = (role: SquadRole) => {
    switch (role) {
      case 'TEAM_CAPTAIN':
        return 'bg-[#39FF6A]/15 text-[#39FF6A] border-[#39FF6A]/40';
      case 'CIRCUIT_LEAD':
        return 'bg-[#7FE7D6]/15 text-[#7FE7D6] border-[#7FE7D6]/40';
      case 'FIRMWARE_ENG':
        return 'bg-[#FF9A1F]/15 text-[#FF9A1F] border-[#FF9A1F]/40';
      case 'CAD_ARCHITECT':
        return 'bg-purple-400/15 text-purple-300 border-purple-400/40';
      case 'PILOT_OPERATOR':
        return 'bg-blue-400/15 text-blue-300 border-blue-400/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-20 z-40 px-3.5 py-2.5 rounded-full bg-[#0B1914] border border-[#39FF6A]/50 text-[#39FF6A] hover:bg-[#39FF6A]/15 shadow-xl shadow-black/60 flex items-center gap-2 font-mono text-xs font-bold transition-all"
        title="Open Squad Team Chat"
      >
        <span className="w-2 h-2 rounded-full bg-[#39FF6A] animate-ping" />
        <span>SQUAD CHAT</span>
        <span className="px-1.5 py-0.2 rounded-full bg-[#39FF6A] text-black text-[10px]">
          {members.filter((m) => m.isOnline).length}
        </span>
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md bg-[#07110D] border-l border-[#39FF6A]/30 shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-[#0B1914] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Team Garuda Autonomous
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#39FF6A]/10 text-[#39FF6A] border border-[#39FF6A]/30">
                  REALTIME
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                SIH 2026 Mars Rover Challenge &bull; 4 Members
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 text-sm font-mono"
            >
              ✕
            </button>
          </div>

          {/* Member Roster Strip */}
          <div className="px-4 py-2 bg-black/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[10px] font-mono">
            {members.map((mem) => (
              <div
                key={mem.userId}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0B1914] border border-slate-800 shrink-0"
                title={`${mem.fullName} (${mem.role}) - ${mem.currentActivity || 'Online'}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    mem.isOnline ? 'bg-[#39FF6A]' : 'bg-slate-600'
                  }`}
                />
                <span className="text-slate-200">{mem.fullName.split(' ')[0]}</span>
                <span
                  className={`text-[8px] px-1 rounded border ${getRoleBadgeColor(mem.role)}`}
                >
                  {mem.role.replace('_', ' ').slice(0, 7)}
                </span>
              </div>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-slate-400">
                    <span className="font-bold text-slate-200">{msg.senderName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded border text-[8px] ${getRoleBadgeColor(
                        msg.senderRole
                      )}`}
                    >
                      {msg.senderRole.replace('_', ' ')}
                    </span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Bubble by Type */}
                  {msg.type === 'telemetry_share' ? (
                    <div className="rounded-xl p-3 bg-[#0B1914] border border-[#39FF6A]/40 max-w-[85%] text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-[#39FF6A] font-bold mb-1">
                        <span>🚀</span>
                        <span>{msg.metadata?.robotName || 'Titan 4WD Rover'} Telemetry</span>
                      </div>
                      <p className="text-slate-300 text-xs mb-2">{msg.content}</p>
                      <div className="flex items-center justify-between text-[11px] mb-2.5">
                        <span className="text-slate-400">Score: {msg.metadata?.score} pts</span>
                        <span className="text-[#39FF6A]">{'★'.repeat(msg.metadata?.stars || 3)}</span>
                      </div>
                      <Link
                        href={`/test-run/${msg.metadata?.testRunId || 'tr_sih_mars_rover_01'}`}
                        className="block w-full text-center py-1.5 rounded-lg bg-[#39FF6A] text-[#07110D] font-bold text-[11px] uppercase hover:bg-[#32e05d]"
                      >
                        Watch 3D Replay ➔
                      </Link>
                    </div>
                  ) : msg.type === 'code_snippet' ? (
                    <div className="rounded-xl p-3 bg-black/70 border border-[#7FE7D6]/30 max-w-[90%] text-xs font-mono">
                      <p className="text-slate-300 text-xs mb-2">{msg.content}</p>
                      <pre className="p-2.5 rounded bg-black border border-slate-800 text-[#7FE7D6] text-[10px] overflow-x-auto">
                        <code>{msg.metadata?.codeSnippet}</code>
                      </pre>
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[85%] ${
                        isMe
                          ? 'bg-[#39FF6A]/15 text-slate-100 border border-[#39FF6A]/40 rounded-br-sm'
                          : 'bg-[#0B1914] text-slate-200 border border-slate-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Share Bar */}
          <div className="px-3 py-1.5 bg-black/40 border-t border-slate-800/80 flex items-center gap-2 text-[10px] font-mono">
            <span className="text-slate-500">QUICK ACTIONS:</span>
            <button
              onClick={() => {
                setInputText('Hey team, review our latest autonomous arena run telemetry here:');
              }}
              className="text-[#39FF6A] hover:underline"
            >
              + Share Test Run
            </button>
            <span className="text-slate-700">&bull;</span>
            <button
              onClick={() => {
                setInputText('// Updated MNA Motor Pin Assignment:\n#define MOTOR_ENABLE 9\n#define DIR_A 8\n#define DIR_B 7');
              }}
              className="text-[#7FE7D6] hover:underline"
            >
              + Share Code
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#0B1914] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message your robotics squad..."
              className="flex-1 bg-black/50 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#39FF6A]"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2 rounded-xl bg-[#39FF6A] text-[#07110D] font-mono font-bold text-xs uppercase disabled:opacity-40 hover:bg-[#32e05d] transition-all"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
