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
    }
  ) => Promise<void>;
  stopGeneration: () => void;
  fetchQuota: () => Promise<void>;
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
  quota: { messagesUsed: 3, messagesLimit: 15, photosUsed: 0, photosLimit: 3 },
  voiceOutputEnabled: false,
  isListening: false,
  uploadedPhotoBase64: null,
  pendingCircuitContext: null,
  pendingRobotContext: null,
  abortController: null,

  toggleOpen: () => {
    const next = !get().isOpen;
    set({ isOpen: next });
    if (next) get().fetchQuota();
  },

  setOpen: (open) => {
    set({ isOpen: open });
    if (open) get().fetchQuota();
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

      // Build conversation history (excluding placeholder)
      const history = messages
        .filter((m) => m.id !== 'msg_welcome')
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
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User aborted
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

      const { data } = await (supabase.from('rituu_usage') as any)
        .select('messages_count, photos_count')
        .eq('user_id', userId)
        .eq('day_ist', todayIst)
        .maybeSingle();

      if (data) {
        const usageData = data as any;
        set((state) => ({
          quota: {
            messagesUsed: usageData.messages_count || 0,
            messagesLimit: state.quota?.messagesLimit || 15,
            photosUsed: usageData.photos_count || 0,
            photosLimit: state.quota?.photosLimit || 3,
          },
        }));
      }
    } catch {
      // Continue
    }
  },

  clearChat: () => {
    set({ messages: [DEFAULT_WELCOME_MESSAGE] });
  },
}));
