import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { CheckCircle2, Wrench, AlertTriangle } from 'lucide-react-native';

export function RobotStatusCard() {
  const statusItems = [
    {
      label: 'Working',
      count: 14,
      icon: CheckCircle2,
      color: COLORS.neon,
      bg: 'rgba(57, 255, 106, 0.1)',
      border: 'rgba(57, 255, 106, 0.3)',
    },
    {
      label: 'Under Repair',
      count: 3,
      icon: Wrench,
      color: COLORS.teal,
      bg: 'rgba(127, 231, 214, 0.1)',
      border: 'rgba(127, 231, 214, 0.3)',
    },
    {
      label: 'To be Repaired',
      count: 1,
      icon: AlertTriangle,
      color: COLORS.warning,
      bg: 'rgba(255, 154, 31, 0.1)',
      border: 'rgba(255, 154, 31, 0.3)',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>ROBOTIC UNIT TELEMETRY</Text>
      <View style={styles.grid}>
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <View
              key={item.label}
              style={[
                styles.tile,
                { backgroundColor: item.bg, borderColor: item.border },
              ]}
            >
              <View style={styles.topRow}>
                <Icon size={16} color={item.color} />
                <Text style={[styles.countText, { color: item.color }]}>
                  {item.count}
                </Text>
              </View>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 72,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  countText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});
