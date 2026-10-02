import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { MobileRobotScene } from '../components/3d/MobileRobotScene';
import { DigitalStudentIdCard } from '../components/hud/DigitalStudentIdCard';
import { RadialGaugeCard } from '../components/hud/RadialGaugeCard';
import { RobotStatusCard } from '../components/hud/RobotStatusCard';
import { Cpu, Sparkles, Trophy, ShoppingBag, LogOut, ChevronRight } from 'lucide-react-native';

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
            onPress={() => navigation.navigate('Workbench')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { borderColor: COLORS.neon }]}>
              <Cpu size={20} color={COLORS.neon} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>3D Workbench</Text>
              <Text style={styles.launchSub}>MNA Electrical Solver</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Rituu')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { borderColor: COLORS.teal }]}>
              <Sparkles size={20} color={COLORS.teal} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>Rituu AI Mentor</Text>
              <Text style={styles.launchSub}>Vision &amp; Firmware Help</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Explore')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { borderColor: COLORS.warning }]}>
              <Trophy size={20} color={COLORS.warning} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>Hackathons &amp; Shops</Text>
              <Text style={styles.launchSub}>Matchmaking &amp; GPS Radar</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.launchCard}
            onPress={() => navigation.navigate('Store')}
            activeOpacity={0.8}
          >
            <View style={[styles.launchIconBox, { borderColor: COLORS.neon }]}>
              <ShoppingBag size={20} color={COLORS.neon} />
            </View>
            <View style={styles.launchTextBox}>
              <Text style={styles.launchTitle}>TechSavyyy Store</Text>
              <Text style={styles.launchSub}>18% GST • {planTier === 'PRO' ? '10% OFF' : 'Hardware Kits'}</Text>
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
    marginTop: 10,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
  },
  buttonGrid: {
    gap: 8,
  },
  launchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#091C14',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  launchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(4, 11, 8, 0.7)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  launchTextBox: {
    flex: 1,
  },
  launchTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  launchSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
