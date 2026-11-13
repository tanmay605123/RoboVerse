import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { MobileRobotScene } from '../components/3d/MobileRobotScene';
import { DigitalStudentIdCard } from '../components/hud/DigitalStudentIdCard';
import { RadialGaugeCard } from '../components/hud/RadialGaugeCard';
import { RobotStatusCard } from '../components/hud/RobotStatusCard';
import { Cpu, Sparkles, Compass, ShoppingBag, LogOut, ChevronRight } from 'lucide-react-native';

export function DashboardScreen({ navigation }: any) {
  const { profile, studentIdCard, planTier, logout } = useMobileAuthStore();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* 1. Top 3D Interactive Robot Scene */}
      <MobileRobotScene height={230} interactive={true} />

      {/* 2. Digital Student ID Card with 3D Flip */}
      <DigitalStudentIdCard
        studentId={studentIdCard?.studentId || 'RV-2026-000108'}
        fullName={profile?.fullName || 'Aarav Sharma'}
        level={studentIdCard?.level || 4}
        xp={studentIdCard?.xp || 2850}
        planTier={planTier}
        institution={profile?.schoolOrCollegeName || 'Delhi Robotics Institute'}
      />

      {/* 3. Control Room Telemetry Radial Gauge */}
      <RadialGaugeCard
        completed={24}
        planned={53}
        title="FLEET MISSION PROGRESS"
        subtitle="AUTONOMOUS OBSTACLE RUNS"
      />

      {/* 4. Robot Status Telemetry Cards */}
      <RobotStatusCard />

      {/* 5. Quick Launch Control Stations */}
      <View style={styles.quickLaunchContainer}>
        <Text style={styles.sectionHeader}>STATION SHORTCUTS</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Lab')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(255, 138, 31, 0.1)', borderColor: 'rgba(255, 138, 31, 0.3)' }]}>
              <Cpu size={20} color={COLORS.primary} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>3D Circuit Lab</Text>
              <Text style={styles.launchSub}>MNA Simulator &amp; Breadboard</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Learn')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(18, 183, 106, 0.1)', borderColor: 'rgba(18, 183, 106, 0.3)' }]}>
              <Cpu size={20} color={COLORS.green} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>RoboVerse Academy</Text>
              <Text style={styles.launchSub}>4 Curriculum Tracks &amp; Live Labs</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Rituu')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(76, 141, 255, 0.1)', borderColor: 'rgba(76, 141, 255, 0.3)' }]}>
              <Sparkles size={20} color={COLORS.blue} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>Rituu AI Mentor</Text>
              <Text style={styles.launchSub}>Vision Diagnostics &amp; Arduino Help</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Explore')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderColor: 'rgba(255, 107, 107, 0.3)' }]}>
              <Compass size={20} color={COLORS.coral} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>Hackathons &amp; Shops</Text>
              <Text style={styles.launchSub}>Delhi, Bangalore &amp; Mumbai Radar</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Store')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(18, 183, 106, 0.1)', borderColor: 'rgba(18, 183, 106, 0.3)' }]}>
              <ShoppingBag size={20} color={COLORS.green} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>TechSavyyy Store</Text>
              <Text style={styles.launchSub}>18% GST • {planTier === 'PRO' ? '10% OFF PRO' : 'Hardware Kits'}</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout option */}
      <View style={styles.logoutRow}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={14} color={COLORS.textMuted} />
          <Text style={styles.logoutText}>Exit Student Session</Text>
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
  quickLaunchContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  buttonGrid: {
    gap: 10,
  },
  launchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  launchIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  launchTextBox: {
    flex: 1,
  },
  launchTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  launchSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  logoutRow: {
    alignItems: 'center',
    marginTop: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  logoutText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
