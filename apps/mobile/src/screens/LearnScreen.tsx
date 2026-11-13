import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Video,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  Compass,
} from 'lucide-react-native';

const MODULES = [
  {
    id: 'mod_1',
    title: 'Arduino & Circuit Fundamentals',
    level: 'Rookie Track',
    progress: 100,
    status: 'COMPLETED',
    lessonsCount: 8,
    xpReward: 400,
    topics: ['Breadboard Connections', 'Ohm\'s Law & Resistor Color Bands', 'LED Current Limiting', 'Digital Output & PWM'],
  },
  {
    id: 'mod_2',
    title: 'Sensors & Environmental Perception',
    level: 'Builder Track',
    progress: 65,
    status: 'IN_PROGRESS',
    lessonsCount: 10,
    xpReward: 650,
    topics: ['Analog Potentiometers', 'HC-SR04 Ultrasonic Sonar', 'PIR Motion Detector', 'I2C Bus Communication'],
  },
  {
    id: 'mod_3',
    title: 'Actuators, Motors & Power Drivers',
    level: 'Engineer Track',
    progress: 20,
    status: 'IN_PROGRESS',
    lessonsCount: 12,
    xpReward: 800,
    topics: ['SG90 Micro Servos', 'L298N Dual H-Bridge Driver', 'DC Gearmotor PWM Speed Control', 'Flyback Diodes & Snubbers'],
  },
  {
    id: 'mod_4',
    title: 'Autonomous Mobile Robots & ROS 2',
    level: 'Innovator Track',
    progress: 0,
    status: 'LOCKED',
    lessonsCount: 15,
    xpReward: 1200,
    topics: ['Differential Drive Kinematics', 'PID Line Following', 'Obstacle Avoidance Algorithms', 'Micro-ROS on ESP32'],
  },
];

const UPCOMING_CLASSES = [
  {
    id: 'cls_1',
    title: 'Live Lab: Wiring an L298N Motor Driver',
    mentor: 'Dr. Vikram Malhotra (IIT Delhi)',
    time: 'Today • 6:00 PM IST',
    participants: 48,
    status: 'STARTS_SOON',
  },
  {
    id: 'cls_2',
    title: 'Masterclass: Sensor Calibration & Noise Filtering',
    mentor: 'Priya Sharma (Robotics Fellow)',
    time: 'Tomorrow • 5:00 PM IST',
    participants: 62,
    status: 'UPCOMING',
  },
];

export function LearnScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'tracks' | 'classes'>('tracks');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerHeader}>
          <GraduationCap size={22} color={COLORS.primary} />
          <View style={styles.bannerTag}>
            <Sparkles size={11} color={COLORS.primary} />
            <Text style={styles.bannerTagText}>ROBOVERSE ACADEMY</Text>
          </View>
        </View>
        <Text style={styles.bannerTitle}>Robotics Learning Paths</Text>
        <Text style={styles.bannerDesc}>
          Master hardware circuits, embedded firmware, and autonomous robot algorithms with step-by-step interactive missions.
        </Text>

        <View style={styles.bannerStatsRow}>
          <View style={styles.bStat}>
            <Text style={styles.bStatVal}>4 Tracks</Text>
            <Text style={styles.bStatLbl}>Curriculum</Text>
          </View>
          <View style={styles.bDivider} />
          <View style={styles.bStat}>
            <Text style={styles.bStatVal}>45 Missions</Text>
            <Text style={styles.bStatLbl}>Interactive</Text>
          </View>
          <View style={styles.bDivider} />
          <View style={styles.bStat}>
            <Text style={[styles.bStatVal, { color: COLORS.primary }]}>3,050 XP</Text>
            <Text style={styles.bStatLbl}>Total Rewards</Text>
          </View>
        </View>
      </View>

      {/* 2. Tab Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tracks' && styles.tabButtonActive]}
          onPress={() => setActiveTab('tracks')}
        >
          <BookOpen size={14} color={activeTab === 'tracks' ? '#FFFFFF' : COLORS.textMuted} />
          <Text style={[styles.tabButtonText, activeTab === 'tracks' && styles.tabButtonTextActive]}>
            Curriculum Tracks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'classes' && styles.tabButtonActive]}
          onPress={() => setActiveTab('classes')}
        >
          <Video size={14} color={activeTab === 'classes' ? '#FFFFFF' : COLORS.textMuted} />
          <Text style={[styles.tabButtonText, activeTab === 'classes' && styles.tabButtonTextActive]}>
            Live Mentor Classes
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Tracks or Classes Content */}
      {activeTab === 'tracks' ? (
        <View style={styles.tracksList}>
          {MODULES.map((mod, index) => {
            const isCompleted = mod.status === 'COMPLETED';
            const isLocked = mod.status === 'LOCKED';

            return (
              <View key={mod.id} style={[styles.trackCard, isLocked && styles.trackCardLocked]}>
                <View style={styles.trackTopRow}>
                  <View style={styles.trackIndexBadge}>
                    <Text style={styles.trackIndexText}>0{index + 1}</Text>
                  </View>
                  <View style={styles.trackTitleCol}>
                    <Text style={styles.trackLevelText}>{mod.level}</Text>
                    <Text style={styles.trackTitleText}>{mod.title}</Text>
                  </View>
                  {isCompleted ? (
                    <View style={styles.badgeCompleted}>
                      <CheckCircle2 size={16} color={COLORS.green} />
                    </View>
                  ) : isLocked ? (
                    <View style={styles.badgeLocked}>
                      <Lock size={15} color={COLORS.textMuted} />
                    </View>
                  ) : (
                    <View style={styles.badgeXp}>
                      <Text style={styles.badgeXpText}>+{mod.xpReward} XP</Text>
                    </View>
                  )}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>
                      {isCompleted ? 'Completed (100%)' : isLocked ? 'Complete previous track to unlock' : `${mod.progress}% completed`}
                    </Text>
                    <Text style={styles.lessonsCount}>{mod.lessonsCount} Missions</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${mod.progress}%`,
                          backgroundColor: isCompleted ? COLORS.green : COLORS.primary,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Topics Preview */}
                <View style={styles.topicsGrid}>
                  {mod.topics.map((t) => (
                    <View key={t} style={styles.topicChip}>
                      <Text style={styles.topicChipText}>{t}</Text>
                    </View>
                  ))}
                </View>

                {/* Card Action */}
                {!isLocked && (
                  <TouchableOpacity
                    style={styles.continueTrackBtn}
                    onPress={() => navigation.navigate('Workbench')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.continueTrackText}>
                      {isCompleted ? 'Review Lab Missions' : 'Continue Track in 3D Lab'}
                    </Text>
                    <ChevronRight size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.classesList}>
          {UPCOMING_CLASSES.map((cls) => (
            <View key={cls.id} style={styles.classCard}>
              <View style={styles.classStatusRow}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE WORKSHOP</Text>
                </View>
                <Text style={styles.classTimeText}>{cls.time}</Text>
              </View>

              <Text style={styles.classTitle}>{cls.title}</Text>
              <Text style={styles.classMentor}>Instructor: {cls.mentor}</Text>
              <Text style={styles.classParticipants}>{cls.participants} students registered</Text>

              <TouchableOpacity
                style={styles.joinClassBtn}
                onPress={() => Linking.openURL('https://meet.google.com/')}
                activeOpacity={0.8}
              >
                <Video size={15} color="#FFFFFF" />
                <Text style={styles.joinClassBtnText}>Join Live Session</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* 4. Hackathon & Community Shortcut */}
      <View style={styles.bottomCardContainer}>
        <TouchableOpacity
          style={styles.hackathonPromoCard}
          onPress={() => navigation.navigate('Explore')}
          activeOpacity={0.8}
        >
          <View style={styles.promoIconBox}>
            <Trophy size={20} color={COLORS.primary} />
          </View>
          <View style={styles.promoTextBox}>
            <Text style={styles.promoTitle}>National Robotics Hackathons</Text>
            <Text style={styles.promoSub}>Register with your RoboVerse Student Squad</Text>
          </View>
          <Compass size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.3)',
    margin: 16,
    padding: 18,
    shadowColor: 'rgba(20, 30, 60, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  bannerTagText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bannerTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  bStat: {
    alignItems: 'center',
  },
  bStatVal: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  bStatLbl: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  bDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.borderSubtle,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  tabButtonText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tracksList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  trackCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  trackCardLocked: {
    opacity: 0.65,
  },
  trackTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F5F6F8',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trackIndexText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  trackTitleCol: {
    flex: 1,
  },
  trackLevelText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trackTitleText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(18, 183, 106, 0.1)',
    padding: 6,
    borderRadius: 10,
  },
  badgeLocked: {
    backgroundColor: '#F5F6F8',
    padding: 6,
    borderRadius: 10,
  },
  badgeXp: {
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.25)',
  },
  badgeXpText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  lessonsCount: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#EBEFF5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  topicChip: {
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topicChipText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  continueTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 40,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  continueTrackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  classesList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  classCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  classStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.coral,
  },
  liveText: {
    color: COLORS.coral,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  classTimeText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  classTitle: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  classMentor: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  classParticipants: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 12,
  },
  joinClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 42,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  joinClassBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomCardContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  hackathonPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.3)',
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  promoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  promoTextBox: {
    flex: 1,
  },
  promoTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  promoSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
