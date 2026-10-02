import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../theme/colors';

interface RadialGaugeCardProps {
  completed?: number;
  planned?: number;
  title?: string;
  subtitle?: string;
}

export function RadialGaugeCard({
  completed = 24,
  planned = 53,
  title = 'ACTIVE ROBOT FLEET',
  subtitle = 'MISSION COMPLETION',
}: RadialGaugeCardProps) {
  const percentage = Math.min(100, Math.round((completed / planned) * 100));

  const size = 80;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.card}>
      <View style={styles.gaugeBox}>
        <Svg width={size} height={size}>
          {/* Background Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(57, 255, 106, 0.15)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.neon}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.gaugeTextOverlay}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.infoCol}>
        <Text style={styles.headerLabel}>{title}</Text>
        <View style={styles.countsRow}>
          <Text style={styles.completedCount}>{completed}</Text>
          <Text style={styles.dividerSlash}> / </Text>
          <Text style={styles.plannedCount}>{planned} Planned</Text>
        </View>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#091A14',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 14,
  },
  gaugeBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    color: COLORS.neon,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  infoCol: {
    flex: 1,
  },
  headerLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginBottom: 4,
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  completedCount: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  dividerSlash: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  plannedCount: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitleText: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: '600',
  },
});
