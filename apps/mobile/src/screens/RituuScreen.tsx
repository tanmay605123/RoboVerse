import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { mobileApiRequest } from '../api/client';
import {
  Sparkles,
  Send,
  Camera,
  Mic,
  MicOff,
  AlertTriangle,
  Play,
} from 'lucide-react-native';

interface ChatMessage {
  id: string;
  sender: 'user' | 'rituu';
  text: string;
  codeSnippet?: string;
  safetyWarning?: string;
  timestamp: string;
}

export function RituuScreen({ navigation }: any) {
  const { planTier } = useMobileAuthStore();

  const [avatarState, setAvatarState] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'rituu',
      text: "Namaste! I am Rituu, your RoboVerse AI robotics mentor. Ask me how to wire sensors, size DC motors, or debug Arduino C++ sketches!",
      timestamp: '10:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dailyQuota, setDailyQuota] = useState({ used: 4, limit: planTier === 'PRO' ? 300 : 15 });

  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || inputText.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);
    setAvatarState('thinking');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Call backend /api/v1/rituu/chat
    const res = await mobileApiRequest('/rituu/chat', {
      method: 'POST',
      body: JSON.stringify({ message: textToSend }),
    });

    setIsSending(false);
    setAvatarState('speaking');

    if (res.success && res.data) {
      const { reply, codeSnippet, safetyWarning, usage } = res.data;
      if (usage) {
        setDailyQuota({ used: usage.messagesToday, limit: usage.dailyLimit });
      }

      const rituuMsg: ChatMessage = {
        id: `rituu_${Date.now()}`,
        sender: 'rituu',
        text: reply,
        codeSnippet,
        safetyWarning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, rituuMsg]);
    } else {
      // Fallback offline intelligent response
      let fallbackText = "To connect an SG90 servo: Brown wire to GND, Red to 5V, Orange to PWM Pin 9 on Arduino.";
      let fallbackCode = "#include <Servo.h>\nServo myServo;\nvoid setup() { myServo.attach(9); }\nvoid loop() { myServo.write(90); }";

      setMessages((prev) => [
        ...prev,
        {
          id: `rituu_${Date.now()}`,
          sender: 'rituu',
          text: fallbackText,
          codeSnippet: fallbackCode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }

    setTimeout(() => {
      setAvatarState('idle');
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 2500);
  };

  const handleSimulatePhotoUpload = () => {
    sendMessage("Analyze this circuit photo: HC-SR04 sonar sensor connected to Arduino pins D8 and D9. Is the VCC wired correctly?");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 1. Top Rituu Robot Avatar HUD */}
      <View style={styles.avatarHeader}>
        <View
          style={[
            styles.avatarGlowBox,
            avatarState === 'thinking' && styles.avatarThinking,
            avatarState === 'speaking' && styles.avatarSpeaking,
          ]}
        >
          {/* Friendly Robot Face */}
          <View style={styles.robotFace}>
            <View style={styles.eyesRow}>
              <View
                style={[
                  styles.eyePupil,
                  avatarState === 'speaking' && styles.eyeSpeaking,
                ]}
              />
              <View
                style={[
                  styles.eyePupil,
                  avatarState === 'speaking' && styles.eyeSpeaking,
                ]}
              />
            </View>
            <View style={styles.mouthLine} />
          </View>
        </View>

        <View style={styles.avatarMeta}>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.nameText}>RITUU AI COPILOT</Text>
            <Text style={styles.stateBadge}>
              {avatarState.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.quotaText}>
            Daily Fair-Use: {dailyQuota.used} / {dailyQuota.limit} msgs
          </Text>
        </View>
      </View>

      {/* 2. Chat Message Stream */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userBubble : styles.rituuBubble,
            ]}
          >
            {msg.sender === 'rituu' && (
              <View style={styles.rituuBubbleHeader}>
                <Sparkles size={13} color={COLORS.primary} />
                <Text style={styles.rituuSenderText}>Rituu AI</Text>
                <Text style={styles.timestampText}>{msg.timestamp}</Text>
              </View>
            )}

            <Text style={[styles.messageText, msg.sender === 'user' && styles.userMessageText]}>
              {msg.text}
            </Text>

            {/* Code Snippet Box */}
            {msg.codeSnippet && (
              <View style={styles.codeSnippetBox}>
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLangText}>Arduino C++ Firmware</Text>
                  <TouchableOpacity
                    style={styles.runInSimBtn}
                    onPress={() => navigation.navigate('Lab')}
                  >
                    <Play size={10} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.runInSimText}>Run in Lab</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeContent}>{msg.codeSnippet}</Text>
              </View>
            )}

            {/* Safety Warning */}
            {msg.safetyWarning && (
              <View style={styles.safetyBox}>
                <AlertTriangle size={14} color={COLORS.coral} />
                <Text style={styles.safetyText}>{msg.safetyWarning}</Text>
              </View>
            )}
          </View>
        ))}

        {isSending && (
          <View style={[styles.messageBubble, styles.rituuBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.thinkingText}>Rituu is analyzing circuits...</Text>
          </View>
        )}
      </ScrollView>

      {/* 3. Quick Chips */}
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={styles.chip}
          onPress={() => sendMessage("How do I avoid shorting an LED with Arduino 5V?")}
        >
          <Text style={styles.chipText}>LED Resistor Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chip}
          onPress={() => sendMessage("Generate Arduino code for ultrasonic obstacle avoidance")}
        >
          <Text style={styles.chipText}>Sonar Rover Code</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Bottom Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleSimulatePhotoUpload}
          accessibilityLabel="Upload Circuit Photo"
        >
          <Camera size={18} color={COLORS.primary} />
        </TouchableOpacity>

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask Rituu about circuits or Arduino..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.textInput}
        />

        <TouchableOpacity
          style={[styles.voiceBtn, isListening && styles.voiceBtnActive]}
          onPress={() => setIsListening(!isListening)}
        >
          {isListening ? (
            <MicOff size={16} color={COLORS.coral} />
          ) : (
            <Mic size={16} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isSending}
        >
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  avatarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    gap: 12,
    shadowColor: 'rgba(20, 30, 60, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarGlowBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarThinking: {
    borderColor: COLORS.blue,
    shadowColor: COLORS.blue,
    backgroundColor: 'rgba(76, 141, 255, 0.1)',
  },
  avatarSpeaking: {
    borderColor: COLORS.green,
    shadowColor: COLORS.green,
    transform: [{ scale: 1.05 }],
  },
  robotFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  eyePupil: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  eyeSpeaking: {
    height: 5,
    backgroundColor: COLORS.green,
  },
  mouthLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 138, 31, 0.6)',
  },
  avatarMeta: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.green,
  },
  nameText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stateBadge: {
    color: COLORS.blue,
    fontSize: 9,
    fontWeight: '700',
    backgroundColor: 'rgba(76, 141, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quotaText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 14,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 138, 31, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.3)',
  },
  rituuBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  rituuBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  rituuSenderText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  timestampText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginLeft: 'auto',
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  userMessageText: {
    color: COLORS.navy,
  },
  codeSnippetBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#0F1530',
    borderWidth: 1,
    borderColor: '#2A3568',
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#171E3F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#25305E',
  },
  codeLangText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  runInSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  runInSimText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  codeContent: {
    padding: 12,
    color: '#F0FFF5',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 17,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  safetyText: {
    color: COLORS.coral,
    fontSize: 11,
    flex: 1,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: 'rgba(20, 30, 60, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F9FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 14,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  voiceBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtnActive: {
    borderColor: COLORS.coral,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
