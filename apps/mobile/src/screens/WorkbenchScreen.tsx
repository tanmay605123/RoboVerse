import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { MobileCircuitCanvas } from '../components/3d/MobileCircuitCanvas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Play,
  Square,
  RotateCcw,
  Activity,
  Sparkles,
  Plus,
  CheckCircle2,
  Save,
  X,
  HardDrive,
  Info,
} from 'lucide-react-native';

const INITIAL_COMPONENTS = [
  { id: 'c_uno', name: 'Arduino Uno R3', category: 'MCU', pinCount: 28, status: 'Connected • Port USB0' },
  { id: 'c_led', name: '5mm Red LED', category: 'Opto', pinCount: 2, status: 'Active (2.1V / 18mA)' },
  { id: 'c_res', name: '220Ω Resistor', category: 'Passive', pinCount: 2, status: 'Current Limiter' },
  { id: 'c_btn', name: 'Tactile Push Button', category: 'Input', pinCount: 4, status: 'D2 Pullup Input' },
  { id: 'c_servo', name: 'SG90 Micro Servo', category: 'Actuator', pinCount: 3, status: 'PWM Pin 9 (90°)' },
  { id: 'c_sonar', name: 'HC-SR04 Ultrasonic', category: 'Sensor', pinCount: 4, status: 'Echo D7 / Trig D8' },
];

const COMPONENT_PALETTE = [
  { id: 'c_buzzer', name: 'Piezo Buzzer (5V)', category: 'Actuator', pinCount: 2, status: 'Digital Pin D3' },
  { id: 'c_pot', name: '10kΩ Potentiometer', category: 'Passive', pinCount: 3, status: 'Analog Pin A0' },
  { id: 'c_pir', name: 'HC-SR501 PIR Sensor', category: 'Sensor', pinCount: 3, status: 'Digital Pin D4' },
  { id: 'c_oled', name: '0.96" SSD1306 OLED (I2C)', category: 'Display', pinCount: 4, status: 'SDA A4 / SCL A5' },
  { id: 'c_l298n', name: 'L298N Dual Motor Driver', category: 'Actuator', pinCount: 8, status: 'Pins D5, D6, D9, D10' },
];

export function WorkbenchScreen({ navigation }: any) {
  const [components, setComponents] = useState(INITIAL_COMPONENTS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [voltage, setVoltage] = useState(5.0);
  const [currentMa, setCurrentMa] = useState(20.4);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    async function loadOfflineCircuit() {
      try {
        const saved = await AsyncStorage.getItem('offline_circuit_active');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.components && Array.isArray(parsed.components)) {
            setComponents(parsed.components);
          }
        }
      } catch {
        // Fallback default
      }
    }
    loadOfflineCircuit();
  }, []);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  const handleSaveOffline = async () => {
    try {
      const circuitData = {
        id: 'circuit_saved_1',
        name: 'Ultrasonic Obstacle Rover Circuit',
        savedAt: new Date().toISOString(),
        components,
        wireCount: 14,
      };
      await AsyncStorage.setItem('offline_circuit_active', JSON.stringify(circuitData));
      await AsyncStorage.setItem(`offline_circuit_${Date.now()}`, JSON.stringify(circuitData));
      setSavedOffline(true);
      Alert.alert(
        'Circuit Cached Offline',
        'This 3D circuit and MNA simulation netlist is safely saved to local device storage. You can simulate it anytime without internet connectivity.'
      );
      setTimeout(() => setSavedOffline(false), 3000);
    } catch {
      Alert.alert('Save Error', 'Failed to save circuit offline.');
    }
  };

  const handleAddComponent = (comp: any) => {
    if (!components.find((c) => c.id === comp.id)) {
      setComponents((prev) => [...prev, comp]);
    }
    setPaletteOpen(false);
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
              <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.simButtonText}>Stop Simulation</Text>
            </>
          ) : (
            <>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.simButtonText}>Start Simulation</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconActionBtn}
          onPress={() => {
            setIsSimulating(false);
            setVoltage(5.0);
          }}
          accessibilityLabel="Reset Simulation"
        >
          <RotateCcw size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconActionBtn, savedOffline && styles.iconActionBtnActive]}
          onPress={handleSaveOffline}
          accessibilityLabel="Save Offline"
        >
          <Save size={16} color={savedOffline ? COLORS.green : COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.askRituuBtn}
          onPress={() => navigation.navigate('Rituu')}
        >
          <Sparkles size={14} color={COLORS.blue} />
          <Text style={styles.askRituuText}>Ask Rituu</Text>
        </TouchableOpacity>
      </View>

      {/* Free Components Notice Banner */}
      <View style={styles.freeNoticeBanner}>
        <Info size={13} color={COLORS.primary} />
        <Text style={styles.freeNoticeText}>
          All Circuit Lab components & 3D WebGL simulations are 100% free for all students.
        </Text>
      </View>

      {/* 3. Virtual Multimeter Telemetry Display */}
      <View style={styles.multimeterCard}>
        <View style={styles.meterHeader}>
          <Activity size={14} color={COLORS.primary} />
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
            <Text style={[styles.readoutValue, { color: COLORS.blue }]}>
              {isSimulating ? currentMa.toFixed(1) : '0.0'} mA
            </Text>
          </View>

          <View style={styles.readoutDivider} />

          <View style={styles.readoutBox}>
            <Text style={styles.readoutLabel}>MNA SOLVER</Text>
            <View style={styles.statusRow}>
              <CheckCircle2 size={12} color={isSimulating ? COLORS.green : COLORS.textMuted} />
              <Text style={[styles.statusText, { color: isSimulating ? COLORS.green : COLORS.textMuted }]}>
                {isSimulating ? 'SOLVED' : 'STANDBY'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 4. Active Breadboard Components */}
      <View style={styles.componentListSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ACTIVE HARDWARE NETLIST ({components.length})</Text>
          <TouchableOpacity
            style={styles.addComponentBtn}
            onPress={() => setPaletteOpen(true)}
          >
            <Plus size={14} color={COLORS.primary} />
            <Text style={styles.addComponentText}>Add Component</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.componentGrid}>
          {components.map((c) => (
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

      {/* Component Palette Modal */}
      <Modal visible={paletteOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.paletteSheet}>
            <View style={styles.paletteHeader}>
              <View style={styles.paletteTitleRow}>
                <Plus size={18} color={COLORS.primary} />
                <Text style={styles.paletteTitle}>Free Component Catalog</Text>
              </View>
              <TouchableOpacity onPress={() => setPaletteOpen(false)}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.paletteSubtitle}>
              Tap any component to mount it directly to your virtual breadboard.
            </Text>

            <ScrollView style={styles.paletteList}>
              {COMPONENT_PALETTE.map((comp) => (
                <TouchableOpacity
                  key={comp.id}
                  style={styles.paletteItem}
                  onPress={() => handleAddComponent(comp)}
                  activeOpacity={0.8}
                >
                  <View style={styles.paletteItemText}>
                    <Text style={styles.paletteItemName}>{comp.name}</Text>
                    <Text style={styles.paletteItemCat}>{comp.category} • {comp.pinCount} Pins</Text>
                  </View>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.card,
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
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  stopButton: {
    backgroundColor: COLORS.coral,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  simButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtnActive: {
    borderColor: COLORS.green,
    backgroundColor: 'rgba(18, 183, 106, 0.1)',
  },
  askRituuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 141, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 141, 255, 0.25)',
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  askRituuText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '700',
  },
  freeNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 138, 31, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 31, 0.2)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  freeNoticeText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  multimeterCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    shadowColor: 'rgba(20, 30, 60, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  meterTitle: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  meterReadouts: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  readoutBox: {
    flex: 1,
    alignItems: 'center',
  },
  readoutLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  readoutValue: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  readoutDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderSubtle,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  componentListSection: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  addComponentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addComponentText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  componentGrid: {
    gap: 10,
  },
  compCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    shadowColor: 'rgba(20, 30, 60, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  compTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compName: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  compCategory: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(76, 141, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compStatus: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  paletteSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    padding: 20,
    maxHeight: '75%',
    shadowColor: 'rgba(15, 23, 42, 0.18)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 10,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  paletteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paletteTitle: {
    color: COLORS.navy,
    fontSize: 17,
    fontWeight: '800',
  },
  paletteSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 14,
  },
  paletteList: {
    maxHeight: 280,
  },
  paletteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  paletteItemText: {
    flex: 1,
  },
  paletteItemName: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  paletteItemCat: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  freeBadge: {
    backgroundColor: 'rgba(18, 183, 106, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(18, 183, 106, 0.3)',
  },
  freeBadgeText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '800',
  },
});
