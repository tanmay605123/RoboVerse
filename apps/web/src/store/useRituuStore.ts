import { create } from 'zustand';
import { RituuMode, RituuMessage, PlanTier } from '@roboverse/shared';
import { apiRequest } from '../lib/apiClient';

interface RituuQuota {
  messagesUsed: number;
  messagesLimit: number;
  messagesRemaining: number;
  photosUsed: number;
  photosLimit: number;
  photosRemaining: number;
  planTier: PlanTier;
}

interface RituuState {
  isOpen: boolean;
  isFullscreen: boolean;
  avatarState: 'idle' | 'thinking' | 'speaking';
  activeMode: RituuMode;
  messages: RituuMessage[];
  quota: RituuQuota | null;
  voiceOutputEnabled: boolean;
  isListening: boolean;
  uploadedPhotoBase64: string | null;
  pendingCircuitJson: string | null;

  // Actions
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  toggleFullscreen: () => void;
  setMode: (mode: RituuMode) => void;
  setVoiceOutput: (enabled: boolean) => void;
  setIsListening: (listening: boolean) => void;
  setUploadedPhoto: (base64: string | null) => void;
  setPendingCircuit: (json: string | null) => void;

  sendMessage: (text: string, options?: { imageBase64?: string; circuitJson?: string }) => Promise<void>;
  rateMessage: (messageId: string, rating: 'UP' | 'DOWN', comment?: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  fetchQuota: () => Promise<void>;
  clearChat: () => void;
}

const DEFAULT_WELCOME_MESSAGE: RituuMessage = {
  id: 'msg_welcome',
  sender: 'rituu',
  mode: RituuMode.LEARN,
  content: `Hello! I'm **Rituu**, your AI robotics & electronics mentor! 🤖⚡\n\nI can help you:\n- **Debug circuit errors** (upload a photo or live breadboard snapshot)\n- **Write & explain Arduino C++ code**\n- **Calculate motor torque & battery sizing** for rovers\n\nAsk a question or tap a suggestion chip below to start!`,
  timestamp: new Date().toISOString(),
};

export const useRituuStore = create<RituuState>((set, get) => ({
  isOpen: false,
  isFullscreen: false,
  avatarState: 'idle',
  activeMode: RituuMode.DEBUG,
  messages: [DEFAULT_WELCOME_MESSAGE],
  quota: null,
  voiceOutputEnabled: false,
  isListening: false,
  uploadedPhotoBase64: null,
  pendingCircuitJson: null,

  toggleOpen: () => {
    const next = !get().isOpen;
    set({ isOpen: next });
    if (next && !get().quota) {
      get().fetchQuota();
    }
  },

  setOpen: (open) => {
    set({ isOpen: open });
    if (open && !get().quota) {
      get().fetchQuota();
    }
  },

  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  setMode: (mode) => set({ activeMode: mode }),

  setVoiceOutput: (enabled) => set({ voiceOutputEnabled: enabled }),

  setIsListening: (listening) => set({ isListening: listening }),

  setUploadedPhoto: (base64) => set({ uploadedPhotoBase64: base64 }),

  setPendingCircuit: (json) => set({ pendingCircuitJson: json }),

  sendMessage: async (text, options) => {
    const { activeMode, messages, uploadedPhotoBase64, pendingCircuitJson, voiceOutputEnabled } = get();
    if (!text.trim() && !options?.imageBase64 && !uploadedPhotoBase64) return;

    const img = options?.imageBase64 || uploadedPhotoBase64;
    const circuit = options?.circuitJson || pendingCircuitJson;

    // Append optimistic user message
    const userMsg: RituuMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      content: text,
      photoUrl: img || undefined,
      timestamp: new Date().toISOString(),
    };

    set({
      messages: [...messages, userMsg],
      avatarState: 'thinking',
      uploadedPhotoBase64: null,
      pendingCircuitJson: null,
    });

    try {
      const res = await apiRequest('/rituu/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          mode: activeMode,
          circuitJson: circuit || undefined,
          imageBase64: img || undefined,
        }),
      });

      if (res.success && res.data) {
        const rituuMsg = res.data.message;
        set((state) => ({
          messages: [...state.messages, rituuMsg],
          avatarState: 'speaking',
          quota: res.data.quota,
        }));

        // Voice output synthesis if enabled
        if (voiceOutputEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const cleanText = rituuMsg.content.replace(/[*#`_$[\]]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 250));
          utterance.rate = 1.0;
          utterance.onend = () => set({ avatarState: 'idle' });
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(() => set({ avatarState: 'idle' }), 2000);
        }
      } else {
        // Handle error / quota exceeded
        const errMsg: RituuMessage = {
          id: `msg_err_${Date.now()}`,
          sender: 'rituu',
          content: res.error?.message || 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, errMsg],
          avatarState: 'idle',
        }));
      }
    } catch {
      const fallbackMsg: RituuMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'rituu',
        content: "I'm having trouble connecting to the RoboVerse server. Please verify your connection.",
        timestamp: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, fallbackMsg],
        avatarState: 'idle',
      }));
    }
  },

  rateMessage: async (messageId, rating, comment) => {
    await apiRequest('/rituu/rate', {
      method: 'POST',
      body: JSON.stringify({ messageId, rating, comment }),
    });

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, rating } : m
      ),
    }));
  },

  loadHistory: async () => {
    const res = await apiRequest('/rituu/history');
    if (res.success && res.data?.messages?.length > 0) {
      set({ messages: res.data.messages });
    }
  },

  fetchQuota: async () => {
    const res = await apiRequest('/rituu/quota');
    if (res.success && res.data) {
      set({ quota: res.data });
    }
  },

  clearChat: () => {
    set({ messages: [DEFAULT_WELCOME_MESSAGE] });
  },
}));
