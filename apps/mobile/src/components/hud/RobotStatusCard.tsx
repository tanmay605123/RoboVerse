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
      color: COLORS.green,
      bg: 'rgba(18, 183, 106, 0.08)',
      border: 'rgba(18, 183, 106, 0.25)',
    },
    {
      label: 'Under Repair',
      count: 3,
      icon: Wrench,
      color: COLORS.blue,
      bg: 'rgba(76, 141, 255, 0.08)',
      border: 'rgba(76, 141, 255, 0.25)',
    },
    {
      label: 'To be Repaired',
      count: 1,
      icon: AlertTriangle,
      color: COLORS.coral,
      bg: 'rgba(255, 107, 107, 0.08)',
      border: 'rgba(255, 107, 107, 0.25)',
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
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 74,
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
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
