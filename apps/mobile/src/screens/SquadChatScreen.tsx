import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  SquadMessage,
  SquadMember,
  SquadRole,
  realtimeManager,
} from '@roboverse/shared';

export function SquadChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [members, setMembers] = useState<SquadMember[]>([
    {
      userId: 'usr_aarav_01',
      studentId: 'RV-2026-000108',
      fullName: 'Aarav Sharma',
      role: 'TEAM_CAPTAIN',
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
    },
    {
      userId: 'usr_diya_02',
      studentId: 'RV-2026-000142',
      fullName: 'Diya Patel',
      role: 'CIRCUIT_LEAD',
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
    },
    {
      userId: 'usr_rohan_03',
      studentId: 'RV-2026-000195',
      fullName: 'Rohan Verma',
      role: 'FIRMWARE_ENG',
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView | null>(null);

  const squadId = 'squad_garuda_2026';
  const currentUserId = 'usr_aarav_01';

  // Seed default chat messages
  useEffect(() => {
    setMessages([
      {
        id: 'msg_001',
        squadId,
        senderId: 'usr_aarav_01',
        senderName: 'Aarav Sharma',
        senderRole: 'TEAM_CAPTAIN',
        senderStudentId: 'RV-2026-000108',
        content: 'Team, national hackathon deadline is in 2 weeks. I ran our rover through the Lunar Crater arena!',
        type: 'text',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg_002',
        squadId,
        senderId: 'usr_aarav_01',
        senderName: 'Aarav Sharma',
        senderRole: 'TEAM_CAPTAIN',
        senderStudentId: 'RV-2026-000108',
        content: 'Check out the live 3D run telemetry! 875 points and 3 stars with zero collisions.',
        type: 'telemetry_share',
        metadata: {
          testRunId: 'tr_sih_mars_rover_01',
          robotName: 'Titan Explorer 4WD',
          score: 875,
          stars: 3,
        },
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg_003',
        squadId,
        senderId: 'usr_diya_02',
        senderName: 'Diya Patel',
        senderRole: 'CIRCUIT_LEAD',
        senderStudentId: 'RV-2026-000142',
        content: 'Awesome run! Notice battery voltage dropped under peak motor load. Adding a 470uF filter capacitor on 5V rail.',
        type: 'text',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
    ]);

    // Realtime subscription
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
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const content = inputText.trim();
    setInputText('');

    const newMsg: SquadMessage = {
      id: `msg_${Date.now()}`,
      squadId,
      senderId: currentUserId,
      senderName: 'Aarav Sharma',
      senderRole: 'TEAM_CAPTAIN',
      senderStudentId: 'RV-2026-000108',
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    realtimeManager.broadcastSquadMessage(squadId, newMsg);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const getRoleColor = (role: SquadRole) => {
    switch (role) {
      case 'TEAM_CAPTAIN':
        return COLORS.neon;
      case 'CIRCUIT_LEAD':
        return COLORS.teal;
      case 'FIRMWARE_ENG':
        return COLORS.warning;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Squad Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.squadTitle}>TEAM GARUDA AUTONOMOUS</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>REALTIME</Text>
          </View>
        </View>
        <Text style={styles.squadSub}>SIH 2026 Mars Rover Challenge &bull; 4 Members</Text>

        {/* Member Roster Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rosterScroll}>
          {members.map((mem) => (
            <View key={mem.userId} style={styles.memberChip}>
              <View
                style={[
                  styles.memberDot,
                  { backgroundColor: mem.isOnline ? COLORS.neon : COLORS.textMuted },
                ]}
              />
              <Text style={styles.memberName}>{mem.fullName.split(' ')[0]}</Text>
              <Text style={[styles.memberRole, { color: getRoleColor(mem.role) }]}>
                {mem.role.replace('_', ' ').slice(0, 7)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Messages Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          return (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                isMe ? styles.myMsgContainer : styles.otherMsgContainer,
              ]}
            >
              <View style={styles.msgSenderRow}>
                <Text style={styles.msgSenderName}>{msg.senderName}</Text>
                <Text style={[styles.msgSenderRole, { color: getRoleColor(msg.senderRole) }]}>
                  {msg.senderRole.replace('_', ' ')}
                </Text>
                <Text style={styles.msgTime}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {msg.type === 'telemetry_share' ? (
                <View style={styles.telemetryCard}>
                  <Text style={styles.telemetryTitle}>
                    🚀 {msg.metadata?.robotName || 'Titan 4WD Rover'} Telemetry
                  </Text>
                  <Text style={styles.telemetryBody}>{msg.content}</Text>
                  <View style={styles.telemetryMeta}>
                    <Text style={styles.telemetryScore}>Score: {msg.metadata?.score} pts</Text>
                    <Text style={styles.telemetryStars}>{'★'.repeat(msg.metadata?.stars || 3)}</Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                  <Text style={styles.bubbleText}>{msg.content}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message squad teammates..."
          placeholderTextColor="#64748B"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendBtnText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07110D',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0B1914',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(57, 255, 106, 0.2)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  squadTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(57, 255, 106, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#39FF6A',
  },
  liveText: {
    color: '#39FF6A',
    fontSize: 9,
    fontWeight: '800',
  },
  squadSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  rosterScroll: {
    marginTop: 10,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#07110D',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  memberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  memberName: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 9,
    fontWeight: '700',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageContainer: {
    maxWidth: '85%',
  },
  myMsgContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMsgContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  msgSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  msgSenderName: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  msgSenderRole: {
    fontSize: 9,
    fontWeight: '700',
  },
  msgTime: {
    color: '#64748B',
    fontSize: 9,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  myBubble: {
    backgroundColor: 'rgba(57, 255, 106, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.4)',
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: '#0B1914',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  telemetryCard: {
    backgroundColor: '#0B1914',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.4)',
    padding: 12,
    borderRadius: 12,
  },
  telemetryTitle: {
    color: '#39FF6A',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  telemetryBody: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 15,
  },
  telemetryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  telemetryScore: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'System',
  },
  telemetryStars: {
    color: '#39FF6A',
    fontSize: 12,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#0B1914',
    borderTopWidth: 1,
    borderTopColor: 'rgba(57, 255, 106, 0.2)',
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#07110D',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  sendBtn: {
    backgroundColor: '#39FF6A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#07110D',
    fontSize: 11,
    fontWeight: '800',
  },
});
