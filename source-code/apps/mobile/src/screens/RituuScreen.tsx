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
  Cpu,
  AlertTriangle,
  Play,
  RotateCcw,
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
          {/* Friendly Glowing Robot Face */}
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
                <Sparkles size={12} color={COLORS.teal} />
                <Text style={styles.rituuSenderText}>Rituu</Text>
                <Text style={styles.timestampText}>{msg.timestamp}</Text>
              </View>
            )}

            <Text style={styles.messageText}>{msg.text}</Text>

            {/* Code Snippet Box */}
            {msg.codeSnippet && (
              <View style={styles.codeSnippetBox}>
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLangText}>Arduino C++ Firmware</Text>
                  <TouchableOpacity
                    style={styles.runInSimBtn}
                    onPress={() => navigation.navigate('Workbench')}
                  >
                    <Play size={10} color="#000" fill="#000" />
                    <Text style={styles.runInSimText}>Run in Workbench</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeContent}>{msg.codeSnippet}</Text>
              </View>
            )}

            {/* Safety Warning */}
            {msg.safetyWarning && (
              <View style={styles.safetyBox}>
                <AlertTriangle size={14} color={COLORS.warning} />
                <Text style={styles.safetyText}>{msg.safetyWarning}</Text>
              </View>
            )}
          </View>
        ))}

        {isSending && (
          <View style={[styles.messageBubble, styles.rituuBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color={COLORS.neon} />
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
          <Camera size={18} color={COLORS.teal} />
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
            <MicOff size={16} color={COLORS.warning} />
          ) : (
            <Mic size={16} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || isSending}
        >
          <Send size={16} color="#000" />
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
    backgroundColor: '#05120D',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    gap: 12,
  },
  avatarGlowBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#091A14',
    borderWidth: 1.5,
    borderColor: COLORS.neon,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarThinking: {
    borderColor: COLORS.teal,
    shadowColor: COLORS.teal,
  },
  avatarSpeaking: {
    borderColor: '#39FF6A',
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
    backgroundColor: COLORS.neon,
  },
  eyeSpeaking: {
    height: 5,
    backgroundColor: '#7FE7D6',
  },
  mouthLine: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(57, 255, 106, 0.5)',
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neon,
  },
  nameText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  stateBadge: {
    color: COLORS.teal,
    fontSize: 9,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(127, 231, 214, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  quotaText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'monospace',
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
    backgroundColor: '#112C20',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.3)',
  },
  rituuBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#091C14',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
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
    gap: 4,
    marginBottom: 6,
  },
  rituuSenderText: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: '800',
  },
  timestampText: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginLeft: 'auto',
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  codeSnippetBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#040B08',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.25)',
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  codeLangText: {
    color: COLORS.teal,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  runInSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  runInSimText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
  },
  codeContent: {
    padding: 10,
    color: '#E0FFE8',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 154, 31, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
  },
  safetyText: {
    color: COLORS.warning,
    fontSize: 11,
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  chip: {
    backgroundColor: '#071810',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chipText: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#05110C',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#091A14',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#081710',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  voiceBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#091A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtnActive: {
    borderColor: COLORS.warning,
    borderWidth: 1,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.neon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
