import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

export type RituuChatMode = 'auto' | 'debug' | 'code' | 'plan' | 'learn';

export interface RituuToolCall {
  name: string;
  args: Record<string, any>;
}

export interface RituuChatMessage {
  id: string;
  sender: 'user' | 'rituu';
  content: string;
  photoUrl?: string;
  isOffTopic?: boolean;
  toolCalls?: RituuToolCall[];
  timestamp: string;
}

export interface RituuQuota {
  messagesUsed: number;
  messagesLimit: number;
  photosUsed: number;
  photosLimit: number;
}

export interface RituuSessionSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface RituuState {
  isOpen: boolean;
  isFullscreen: boolean;
  avatarState: 'idle' | 'thinking' | 'speaking';
  activeMode: RituuChatMode;
  hintFirst: boolean;
  messages: RituuChatMessage[];
  quota: RituuQuota | null;
  voiceOutputEnabled: boolean;
  isListening: boolean;
  uploadedPhotoBase64: string | null;
  pendingCircuitContext: string | null;
  pendingRobotContext: string | null;
  abortController: AbortController | null;
  currentSessionId: string | null;
  sessionsList: RituuSessionSummary[];

  // Actions
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  toggleFullscreen: () => void;
  setMode: (mode: RituuChatMode) => void;
  setHintFirst: (enabled: boolean) => void;
  setVoiceOutput: (enabled: boolean) => void;
  setIsListening: (listening: boolean) => void;
  setUploadedPhoto: (base64: string | null) => void;
  setPendingCircuitContext: (context: string | null) => void;
  setPendingRobotContext: (context: string | null) => void;

  sendMessage: (
    text: string,
    options?: {
      imageBase64?: string;
      circuitContext?: string;
      robotContext?: string;
      circuitId?: string;
      robotId?: string;
    }
  ) => Promise<void>;
  stopGeneration: () => void;
  fetchQuota: () => Promise<void>;
  loadSessions: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  startNewSession: () => void;
  clearChat: () => void;
}

const DEFAULT_WELCOME_MESSAGE: RituuChatMessage = {
  id: 'msg_welcome',
  sender: 'rituu',
  content: `Namaste! I'm **Rituu**, your RoboVerse robotics mentor! 🤖⚡\n\nI can help you:\n- **Debug circuits & wiring** (upload a photo or breadboard screenshot)\n- **Write & explain Arduino C++ / ESP32 code**\n- **Size DC motors, ESCs, servos & calculate battery runtime**\n- **Tune PID algorithms** for line followers and quadcopters\n\nWhat are we building today? Ask a question or tap a suggestion chip below!`,
  timestamp: new Date().toISOString(),
};

export const useRituuStore = create<RituuState>((set, get) => ({
  isOpen: false,
  isFullscreen: false,
  avatarState: 'idle',
  activeMode: 'debug',
  hintFirst: false,
  messages: [DEFAULT_WELCOME_MESSAGE],
  quota: { messagesUsed: 0, messagesLimit: 15, photosUsed: 0, photosLimit: 3 },
  voiceOutputEnabled: false,
  isListening: false,
  uploadedPhotoBase64: null,
  pendingCircuitContext: null,
  pendingRobotContext: null,
  abortController: null,
  currentSessionId: null,
  sessionsList: [],

  toggleOpen: () => {
    const next = !get().isOpen;
    set({ isOpen: next });
    if (next) {
      get().fetchQuota();
      get().loadSessions();
    }
  },

  setOpen: (open) => {
    set({ isOpen: open });
    if (open) {
      get().fetchQuota();
      get().loadSessions();
    }
  },

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  setMode: (mode) => set({ activeMode: mode }),

  setHintFirst: (hintFirst) => set({ hintFirst }),

  setVoiceOutput: (enabled) => set({ voiceOutputEnabled: enabled }),

  setIsListening: (listening) => set({ isListening: listening }),

  setUploadedPhoto: (base64) => set({ uploadedPhotoBase64: base64 }),

  setPendingCircuitContext: (context) => set({ pendingCircuitContext: context }),

  setPendingRobotContext: (context) => set({ pendingRobotContext: context }),

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ abortController: null, avatarState: 'idle' });
    }
  },

  sendMessage: async (text, options) => {
    const {
      activeMode,
      hintFirst,
      messages,
      uploadedPhotoBase64,
      pendingCircuitContext,
      pendingRobotContext,
      voiceOutputEnabled,
      currentSessionId,
    } = get();

    if (!text.trim() && !options?.imageBase64 && !uploadedPhotoBase64) return;

    const img = options?.imageBase64 || uploadedPhotoBase64;
    const circuit = options?.circuitContext || pendingCircuitContext;
    const robot = options?.robotContext || pendingRobotContext;

    // 1. Append optimistic user message
    const userMsgId = `msg_user_${Date.now()}`;
    const userMsg: RituuChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: text,
      photoUrl: img || undefined,
      timestamp: new Date().toISOString(),
    };

    // 2. Prepare streaming assistant placeholder
    const assistantMsgId = `msg_rituu_${Date.now()}`;
    const assistantPlaceholder: RituuChatMessage = {
      id: assistantMsgId,
      sender: 'rituu',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const abortController = new AbortController();

    set({
      messages: [...messages, userMsg, assistantPlaceholder],
      avatarState: 'thinking',
      uploadedPhotoBase64: null,
      pendingCircuitContext: null,
      pendingRobotContext: null,
      abortController,
    });

    try {
      // Get auth token from Supabase session if available
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // Build conversation history (excluding welcome message & placeholder)
      const history = messages
        .filter((m) => m.id !== 'msg_welcome' && m.id !== assistantMsgId)
        .slice(-10)
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: m.content,
        }));

      // Call API route
      const response = await fetch('/api/rituu/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history,
          mode: activeMode,
          hintFirst,
          imageBase64: img || undefined,
          circuitContext: circuit || undefined,
          robotContext: robot || undefined,
          circuitId: options?.circuitId,
          robotId: options?.robotId,
          sessionId: currentSessionId || undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errMessage = 'Encountered an issue processing your request.';
        try {
          const errJson = await response.json();
          if (errJson.error) errMessage = errJson.error;
        } catch {
          // ignore
        }

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, content: errMessage } : m
          ),
          avatarState: 'idle',
          abortController: null,
        }));
        return;
      }

      // Stream Server-Sent Events (SSE)
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body stream not available');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let isOffTopic = false;
      const toolCalls: RituuToolCall[] = [];

      set({ avatarState: 'speaking' });

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.replace('data: ', '').trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.t) {
              accumulatedText += data.t;
              if (accumulatedText.trim().startsWith('[OFFTOPIC]')) {
                isOffTopic = true;
              }
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: accumulatedText,
                        isOffTopic,
                        toolCalls: toolCalls.length > 0 ? [...toolCalls] : undefined,
                      }
                    : m
                ),
              }));
            } else if (data.toolCall) {
              toolCalls.push(data.toolCall);
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, toolCalls: [...toolCalls] }
                    : m
                ),
              }));
            } else if (data.done) {
              isOffTopic = Boolean(data.offTopic) || isOffTopic;
              if (data.sessionId && !get().currentSessionId) {
                set({ currentSessionId: data.sessionId });
              }
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, isOffTopic } : m
                ),
              }));
            } else if (data.error) {
              accumulatedText += `\n\n⚠️ *${data.error}*`;
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                ),
              }));
            }
          } catch {
            // ignore JSON parse error in incomplete chunk
          }
        }
      }

      // Synthesis if enabled
      if (voiceOutputEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const cleanText = accumulatedText.replace(/[*#`_$[\]]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 250));
        utterance.rate = 1.0;
        utterance.onend = () => set({ avatarState: 'idle' });
        window.speechSynthesis.speak(utterance);
      } else {
        set({ avatarState: 'idle' });
      }

      set({ abortController: null });
      get().fetchQuota();
      get().loadSessions();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        set({ avatarState: 'idle', abortController: null });
        return;
      }

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "I'm having trouble connecting to the RoboVerse server. Please verify your connection.",
              }
            : m
        ),
        avatarState: 'idle',
        abortController: null,
      }));
    }
  },

  fetchQuota: async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) return;

      const userId = sessionData.session.user.id;
      const todayIst = new Date().toISOString().split('T')[0];

      const [entRes, usageRes] = await Promise.all([
        (supabase.from('current_entitlements') as any)
          .select('rituu_daily_limit, rituu_photo_limit')
          .eq('user_id', userId)
          .maybeSingle(),
        (supabase.from('rituu_usage') as any)
          .select('messages_count, photos_count')
          .eq('user_id', userId)
          .eq('day_ist', todayIst)
          .maybeSingle(),
      ]);

      const messagesLimit = Number(entRes.data?.rituu_daily_limit ?? 15);
      const photosLimit = Number(entRes.data?.rituu_photo_limit ?? 3);
      const messagesUsed = Number(usageRes.data?.messages_count ?? 0);
      const photosUsed = Number(usageRes.data?.photos_count ?? 0);

      set({
        quota: {
          messagesUsed,
          messagesLimit,
          photosUsed,
          photosLimit,
        },
      });
    } catch {
      // Continue gracefully
    }
  },

  loadSessions: async () => {
    try {
      const res = await fetch('/api/rituu/sessions');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        set({ sessionsList: json.data });
      }
    } catch {
      // Continue
    }
  },

  selectSession: async (sessionId: string) => {
    try {
      set({ currentSessionId: sessionId });
      const res = await fetch(`/api/rituu/sessions/${sessionId}`);
      const json = await res.json();
      if (json.success && json.data?.messages) {
        set({
          messages: [
            DEFAULT_WELCOME_MESSAGE,
            ...json.data.messages,
          ],
        });
      }
    } catch {
      // Continue
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await fetch(`/api/rituu/sessions/${sessionId}`, { method: 'DELETE' });
      set((state) => ({
        sessionsList: state.sessionsList.filter((s) => s.id !== sessionId),
        currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        messages: state.currentSessionId === sessionId ? [DEFAULT_WELCOME_MESSAGE] : state.messages,
      }));
    } catch {
      // Continue
    }
  },

  startNewSession: () => {
    set({
      currentSessionId: null,
      messages: [DEFAULT_WELCOME_MESSAGE],
      uploadedPhotoBase64: null,
    });
  },

  clearChat: () => {
    get().startNewSession();
  },
}));
