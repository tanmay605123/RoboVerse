import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../theme/colors';
import { ShieldCheck, Award, QrCode, RotateCw, Sparkles, Cpu } from 'lucide-react-native';

interface StudentIdCardProps {
  studentId?: string;
  fullName?: string;
  level?: number;
  xp?: number;
  planTier?: string;
  institution?: string;
}

export function DigitalStudentIdCard({
  studentId = 'RV-2026-000108',
  fullName = 'Aarav Sharma',
  level = 4,
  xp = 2850,
  planTier = 'PRO',
  institution = 'Delhi Robotics Institute',
}: StudentIdCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsFlipped(!isFlipped)}
        style={[styles.card, isFlipped ? styles.cardBack : styles.cardFront]}
      >
        {!isFlipped ? (
          // Front Side: Digital Student ID Card
          <View style={styles.innerContent}>
            {/* Top Bar */}
            <View style={styles.headerRow}>
              <View style={styles.brandRow}>
                <View style={styles.chipIcon}>
                  <Cpu size={14} color={COLORS.neon} />
                </View>
                <Text style={styles.brandTitle}>ROBOVERSE ID</Text>
              </View>

              <View style={styles.planBadge}>
                <Sparkles size={11} color={COLORS.neon} />
                <Text style={styles.planText}>{planTier}</Text>
              </View>
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatarBorder}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  }}
                  style={styles.avatar}
                />
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.studentName}>{fullName}</Text>
                <Text style={styles.studentIdCode}>{studentId}</Text>
                <Text style={styles.institutionText} numberOfLines={1}>
                  {institution}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LEVEL</Text>
                <Text style={styles.statValue}>LVL {level}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>TOTAL XP</Text>
                <Text style={[styles.statValue, { color: COLORS.neon }]}>{xp} XP</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>STATUS</Text>
                <View style={styles.verifiedRow}>
                  <ShieldCheck size={12} color={COLORS.teal} />
                  <Text style={[styles.statValue, { color: COLORS.teal, marginLeft: 3 }]}>
                    ACTIVE
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Flip Button & QR hint */}
            <View style={styles.footerRow}>
              <View style={styles.qrBadge}>
                <QrCode size={13} color={COLORS.textSecondary} />
                <Text style={styles.qrHint}>OFFICIAL CREDENTIAL</Text>
              </View>

              <View style={styles.flipHintRow}>
                <RotateCw size={12} color={COLORS.neon} />
                <Text style={styles.flipHintText}>TAP TO FLIP</Text>
              </View>
            </View>
          </View>
        ) : (
          // Back Side: Learning Passport & Verifiable Credential
          <View style={styles.innerContent}>
            <View style={styles.headerRow}>
              <View style={styles.brandRow}>
                <Award size={14} color={COLORS.teal} />
                <Text style={[styles.brandTitle, { color: COLORS.teal }]}>
                  LEARNING PASSPORT
                </Text>
              </View>

              <View style={styles.flipHintRow}>
                <RotateCw size={12} color={COLORS.neon} />
                <Text style={styles.flipHintText}>TAP FRONT</Text>
              </View>
            </View>

            <View style={styles.passportList}>
              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Hardware Projects Built:</Text>
                <Text style={styles.passportValue}>7 Verified Circuits</Text>
              </View>

              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Learning Hours Logged:</Text>
                <Text style={styles.passportValue}>42 Hours</Text>
              </View>

              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Primary Specialization:</Text>
                <Text style={[styles.passportValue, { color: COLORS.teal }]}>
                  Autonomous Rovers & ROS 2
                </Text>
              </View>

              <View style={styles.passportItem}>
                <Text style={styles.passportLabel}>Hackathon Team Pool:</Text>
                <Text style={[styles.passportValue, { color: COLORS.neon }]}>
                  Verified Perception Lead
                </Text>
              </View>
            </View>

            <View style={styles.cryptoSignatureBox}>
              <Text style={styles.signatureTitle}>SHA-256 VERIFIED ATTESTATION</Text>
              <Text style={styles.signatureCode} numberOfLines={1}>
                0x7f9a8b1c4e2d3f4a...8c1e2f3d
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardFront: {
    backgroundColor: '#091C14',
    borderColor: 'rgba(57, 255, 106, 0.4)',
  },
  cardBack: {
    backgroundColor: '#061610',
    borderColor: 'rgba(127, 231, 214, 0.4)',
  },
  innerContent: {
    justifyContent: 'space-between',
    minHeight: 185,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(57, 255, 106, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: COLORS.neon,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 106, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.neon,
    gap: 4,
  },
  planText: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.neon,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  studentIdCode: {
    color: COLORS.neon,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  institutionText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 11, 8, 0.7)',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.borderSubtle,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrHint: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  flipHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flipHintText: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  // Passport Back Styles
  passportList: {
    gap: 8,
    marginVertical: 8,
  },
  passportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 11, 8, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  passportLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  passportValue: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  cryptoSignatureBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  signatureTitle: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 0.8,
  },
  signatureCode: {
    color: COLORS.teal,
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
