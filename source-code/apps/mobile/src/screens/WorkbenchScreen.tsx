import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';
import { MobileCircuitCanvas } from '../components/3d/MobileCircuitCanvas';
import { Play, Square, RotateCcw, Activity, Sparkles, Plus, AlertCircle, CheckCircle2 } from 'lucide-react-native';

const COMPONENTS = [
  { id: 'c_uno', name: 'Arduino Uno R3', category: 'MCU', pinCount: 28, status: 'Connected' },
  { id: 'c_led', name: '5mm Green LED', category: 'Opto', pinCount: 2, status: 'Active (2.1V)' },
  { id: 'c_res', name: '220Ω Resistor', category: 'Passive', pinCount: 2, status: 'Current Limiter' },
  { id: 'c_btn', name: 'Tactile Push Button', category: 'Input', pinCount: 4, status: 'D2 Pullup' },
  { id: 'c_servo', name: 'SG90 Micro Servo', category: 'Actuator', pinCount: 3, status: 'PWM Pin 9' },
  { id: 'c_sonar', name: 'HC-SR04 Ultrasonic', category: 'Sensor', pinCount: 4, status: 'Echo/Trig' },
];

export function WorkbenchScreen({ navigation }: any) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [voltage, setVoltage] = useState(5.0);
  const [currentMa, setCurrentMa] = useState(20.4);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* 1. Top 3D Interactive Circuit Canvas */}
      <MobileCircuitCanvas height={250} isSimulating={isSimulating} />

      {/* 2. Simulation HUD Controls */}
      <View style={styles.hudControlBar}>
        <TouchableOpacity
          style={[styles.simButton, isSimulating ? styles.stopButton : styles.playButton]}
          onPress={toggleSimulation}
          activeOpacity={0.8}
        >
          {isSimulating ? (
            <>
              <Square size={16} color="#000" fill="#000" />
              <Text style={styles.simButtonTextDark}>Halt Sim</Text>
            </>
          ) : (
            <>
              <Play size={16} color="#000" fill="#000" />
              <Text style={styles.simButtonTextDark}>Run Simulation</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconActionBtn}
          onPress={() => {
            setIsSimulating(false);
            setVoltage(5.0);
          }}
        >
          <RotateCcw size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.askRituuBtn}
          onPress={() => navigation.navigate('Rituu')}
        >
          <Sparkles size={14} color={COLORS.teal} />
          <Text style={styles.askRituuText}>Ask Rituu</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Virtual Multimeter Telemetry Display */}
      <View style={styles.multimeterCard}>
        <View style={styles.meterHeader}>
          <Activity size={14} color={COLORS.neon} />
          <Text style={styles.meterTitle}>TRUE-RMS VIRTUAL MULTIMETER // PROBE A</Text>
        </View>

        <View style={styles.meterReadouts}>
          <View style={styles.readoutBox}>
            <Text style={styles.readoutLabel}>DC VOLTAGE</Text>
            <Text style={styles.readoutValue}>{isSimulating ? voltage.toFixed(2) : '0.00'} V</Text>
          </View>

          <View style={styles.readoutDivider} />

          <View style={styles.readoutBox}>
            <Text style={styles.readoutLabel}>CIRCUIT CURRENT</Text>
            <Text style={[styles.readoutValue, { color: COLORS.teal }]}>
              {isSimulating ? currentMa.toFixed(1) : '0.0'} mA
            </Text>
          </View>

          <View style={styles.readoutDivider} />

          <View style={styles.readoutBox}>
            <Text style={styles.readoutLabel}>MNA STATUS</Text>
            <View style={styles.statusRow}>
              <CheckCircle2 size={12} color={COLORS.neon} />
              <Text style={styles.statusText}>{isSimulating ? 'SOLVED' : 'IDLE'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 4. Active Breadboard Components */}
      <View style={styles.componentListSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ACTIVE HARDWARE NETLIST</Text>
          <TouchableOpacity style={styles.addComponentBtn}>
            <Plus size={12} color={COLORS.neon} />
            <Text style={styles.addComponentText}>Add Component</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentGrid}>
          {COMPONENTS.map((c) => (
            <View key={c.id} style={styles.compCard}>
              <View style={styles.compTopRow}>
                <Text style={styles.compName}>{c.name}</Text>
                <Text style={styles.compCategory}>{c.category}</Text>
              </View>
              <Text style={styles.compStatus}>{c.status}</Text>
            </View>
          ))}
        </View>
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
  hudControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  simButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  playButton: {
    backgroundColor: COLORS.neon,
    shadowColor: COLORS.neon,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: COLORS.warning,
  },
  simButtonTextDark: {
    color: '#000',
    fontSize: 13,
    fontWeight: '800',
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#091A14',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askRituuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(127, 231, 214, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.teal,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  askRituuText: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '700',
  },
  multimeterCard: {
    backgroundColor: '#071610',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  meterTitle: {
    color: COLORS.neon,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
  },
  meterReadouts: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 106, 0.1)',
  },
  readoutBox: {
    flex: 1,
    alignItems: 'center',
  },
  readoutLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  readoutValue: {
    color: COLORS.neon,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  readoutDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderSubtle,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statusText: {
    color: COLORS.neon,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  componentListSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  addComponentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addComponentText: {
    color: COLORS.neon,
    fontSize: 11,
    fontWeight: '700',
  },
  componentGrid: {
    gap: 8,
  },
  compCard: {
    backgroundColor: '#091A14',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  compTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  compCategory: {
    color: COLORS.teal,
    fontSize: 9,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(127, 231, 214, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compStatus: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});
