import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { useMobileAuthStore } from '../store/useMobileAuthStore';
import { DigitalStudentIdCard } from '../components/hud/DigitalStudentIdCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Award,
  ShieldCheck,
  Fingerprint,
  HardDrive,
  ExternalLink,
  LogOut,
  RefreshCw,
  Cpu,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

const CERTIFICATES = [
  {
    id: 'cert_01',
    title: 'Certified Electronics Apprentice',
    issueDate: 'October 2026',
    credentialId: 'RV-CERT-2026-88192',
    verifyUrl: 'https://roboverse.io/verify/RV-CERT-2026-88192',
  },
  {
    id: 'cert_02',
    title: 'Autonomous Mobile Rover Architect',
    issueDate: 'In Progress (92%)',
    credentialId: 'RV-CERT-PENDING',
    verifyUrl: 'https://roboverse.io/learn',
  },
];

const SKILLS = [
  { name: 'Circuits & MNA Simulation', level: 85, color: COLORS.primary },
  { name: 'Arduino C++ & Embedded Firmware', level: 90, color: COLORS.blue },
  { name: 'Motor Drivers & Power Systems', level: 75, color: COLORS.coral },
  { name: 'Sensors, I2C & Analog Perception', level: 80, color: COLORS.green },
  { name: 'ROS 2 & Autonomous Navigation', level: 45, color: COLORS.teal },
];

export function ProfileScreen({ navigation }: any) {
  const { profile, studentIdCard, planTier, biometricsAvailable, logout } = useMobileAuthStore();
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [cachedCircuitsCount, setCachedCircuitsCount] = useState(3);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadStorageInfo() {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const circuitKeys = keys.filter((k) => k.startsWith('offline_circuit_'));
        if (circuitKeys.length > 0) {
          setCachedCircuitsCount(circuitKeys.length);
        }
      } catch {
        // Fallback default
      }
    }
    loadStorageInfo();
  }, []);

  const handleSyncOfflineData = async () => {
    setIsSyncing(true);
    // Simulate cloud sync with backend
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert('Sync Complete', 'All offline circuits, telemetry, and learning progress synced with RoboVerse Cloud.');
    }, 1200);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* 1. Interactive 3D Digital Student ID Card */}
      <View style={styles.cardHeaderArea}>
        <Text style={styles.sectionTitleHeader}>OFFICIAL STUDENT CREDENTIAL</Text>
        <DigitalStudentIdCard
          studentId={studentIdCard?.studentId || 'RV-2026-000108'}
          fullName={profile?.fullName || 'Aarav Sharma'}
          level={studentIdCard?.level || 4}
          xp={studentIdCard?.xp || 2850}
          planTier={planTier}
          institution={profile?.schoolOrCollegeName || 'Delhi Robotics Institute'}
        />
      </View>

      {/* 2. Skills Radar & Competencies */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>ENGINEERING SKILLS RADAR</Text>
        <View style={styles.skillsCard}>
          {SKILLS.map((s) => (
            <View key={s.name} style={styles.skillRow}>
              <View style={styles.skillLabelRow}>
                <Text style={styles.skillName}>{s.name}</Text>
                <Text style={[styles.skillPercent, { color: s.color }]}>{s.level}%</Text>
              </View>
              <View style={styles.skillBarBg}>
                <View
                  style={[
                    styles.skillBarFill,
                    { width: `${s.level}%`, backgroundColor: s.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Official RoboVerse Certificates */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>VERIFIED CREDENTIALS & CERTIFICATES</Text>
        <View style={styles.certsList}>
          {CERTIFICATES.map((c) => (
            <View key={c.id} style={styles.certCard}>
              <View style={styles.certIconBox}>
                <Award size={20} color={COLORS.primary} />
              </View>
              <View style={styles.certTextBox}>
                <Text style={styles.certTitle}>{c.title}</Text>
                <Text style={styles.certSub}>
                  {c.issueDate} • ID: {c.credentialId}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.verifyLinkBtn}
                onPress={() => Linking.openURL(c.verifyUrl).catch(() => {})}
              >
                <ExternalLink size={14} color={COLORS.blue} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Offline Storage & Sync Manager */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>OFFLINE LAB SYNC & STORAGE</Text>
        <View style={styles.storageCard}>
          <View style={styles.storageTopRow}>
            <View style={styles.storageIconBox}>
              <HardDrive size={18} color={COLORS.primary} />
            </View>
            <View style={styles.storageTextBox}>
              <Text style={styles.storageTitle}>Offline Circuit Cache</Text>
              <Text style={styles.storageSub}>
                {cachedCircuitsCount} circuits cached for offline lab simulation
              </Text>
            </View>
            <TouchableOpacity
              style={styles.syncBtn}
              onPress={handleSyncOfflineData}
              disabled={isSyncing}
            >
              <RefreshCw size={14} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Device Biometrics & Preferences */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>SECURITY & SETTINGS</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Fingerprint size={18} color={COLORS.blue} />
            </View>
            <View style={styles.settingTextBox}>
              <Text style={styles.settingTitle}>Biometric Student Login</Text>
              <Text style={styles.settingSub}>
                {biometricsAvailable ? 'Face ID / Fingerprint active' : 'Biometrics not detected'}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
              disabled={!biometricsAvailable}
            />
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('Store')}
          >
            <View style={[styles.settingIconBox, { backgroundColor: 'rgba(255, 138, 31, 0.1)' }]}>
              <Sparkles size={18} color={COLORS.primary} />
            </View>
            <View style={styles.settingTextBox}>
              <Text style={styles.settingTitle}>Membership Plan: {planTier}</Text>
              <Text style={styles.settingSub}>Upgrade to Pro for unlimited AI and mentor classes</Text>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. Logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <LogOut size={16} color={COLORS.coral} />
          <Text style={styles.logoutButtonText}>Sign Out of RoboVerse</Text>
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
  cardHeaderArea: {
    marginTop: 8,
  },
  sectionTitleHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  skillsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 16,
    gap: 12,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  skillRow: {
    gap: 6,
  },
  skillLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '600',
  },
  skillPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  skillBarBg: {
    height: 6,
    backgroundColor: '#EBEFF5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  certsList: {
    gap: 10,
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 14,
    shadowColor: 'rgba(20, 30, 60, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  certIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  certTextBox: {
    flex: 1,
  },
  certTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  certSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  verifyLinkBtn: {
    padding: 8,
  },
  storageCard: {
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
  storageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 138, 31, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storageTextBox: {
    flex: 1,
  },
  storageTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  storageSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  settingsCard: {
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 141, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextBox: {
    flex: 1,
  },
  settingTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '700',
  },
  settingSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: 12,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
  },
  logoutButtonText: {
    color: COLORS.coral,
    fontSize: 13,
    fontWeight: '700',
  },
});
