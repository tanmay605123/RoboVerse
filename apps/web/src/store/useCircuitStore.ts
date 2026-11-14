import { create } from 'zustand';
import {
  CircuitComponent,
  WireConnection,
  CircuitDiagnosticError,
  PlanTier,
} from '@roboverse/shared';
import {
  MnaCircuitSolver,
  ArduinoSketchRunner,
  PinState,
  ComponentSimulationOutput,
} from '@roboverse/sim-engine';

export type WorkbenchViewMode = '3D' | 'SCHEMATIC' | 'ROBOT_BUILDER';
export type ToolMode = 'SELECT' | 'WIRE' | 'DELETE' | 'PROBE';

export interface CircuitHistorySnapshot {
  components: CircuitComponent[];
  wires: WireConnection[];
  arduinoCode: string;
}

// Starter Kit: Arduino Uno + Breadboard + Resistor + Red LED connected to Pin 13
export const DEFAULT_COMPONENTS: CircuitComponent[] = [
  {
    id: 'arduino_uno_1',
    typeId: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'MICROCONTROLLER',
    model3DUrl: '/models/arduino_uno.glb',
    position: [-2.8, 0, 0],
    rotation: [0, 0, 0],
    properties: { clockMhz: 16 },
    pins: [
      { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.2, 0.2, 0.8] },
      { id: 'pin_3v3', name: '3.3V', type: 'POWER_VCC', position3D: [-2.4, 0.2, 0.8] },
      { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
      { id: 'pin_gnd_2', name: 'GND', type: 'GROUND', position3D: [-1.8, 0.2, 0.8] },
      { id: 'pin_vin', name: 'VIN', type: 'POWER_VCC', position3D: [-1.6, 0.2, 0.8] },
      { id: 'pin_d13', name: 'D13 (SCK/LED)', type: 'DIGITAL_IO', position3D: [-2.0, 0.2, -0.8] },
      { id: 'pin_d12', name: 'D12 (MISO)', type: 'DIGITAL_IO', position3D: [-2.2, 0.2, -0.8] },
      { id: 'pin_d11', name: 'D11 (PWM)', type: 'PWM', position3D: [-2.4, 0.2, -0.8] },
      { id: 'pin_d9', name: 'D9 (PWM)', type: 'PWM', position3D: [-2.8, 0.2, -0.8] },
      { id: 'pin_d3', name: 'D3 (PWM)', type: 'PWM', position3D: [-3.4, 0.2, -0.8] },
      { id: 'pin_d2', name: 'D2', type: 'DIGITAL_IO', position3D: [-3.6, 0.2, -0.8] },
      { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN', position3D: [-3.0, 0.2, 0.8] },
    ],
  },
  {
    id: 'breadboard_1',
    typeId: 'breadboard_half',
    name: 'Half-Size Breadboard (400 pts)',
    category: 'PROTOTYPING',
    model3DUrl: '/models/breadboard_half.glb',
    position: [1.2, 0, 0],
    rotation: [0, 0, 0],
    properties: { tiePoints: 400 },
    pins: [
      { id: 'power_plus_1', name: '+ Bus (5V)', type: 'POWER_VCC', position3D: [0.2, 0.15, -1.2] },
      { id: 'power_gnd_1', name: '- Bus (GND)', type: 'GROUND', position3D: [0.2, 0.15, -1.0] },
      { id: 'row_10_e', name: 'Row 10 (Tie E)', type: 'DIGITAL_IO', position3D: [1.0, 0.15, -0.3] },
      { id: 'row_10_f', name: 'Row 10 (Tie F)', type: 'DIGITAL_IO', position3D: [1.0, 0.15, 0.3] },
      { id: 'row_15_e', name: 'Row 15 (Tie E)', type: 'DIGITAL_IO', position3D: [1.6, 0.15, -0.3] },
      { id: 'row_15_f', name: 'Row 15 (Tie F)', type: 'DIGITAL_IO', position3D: [1.6, 0.15, 0.3] },
      { id: 'power_gnd_2', name: '- Bus (GND)', type: 'GROUND', position3D: [2.2, 0.15, 1.0] },
    ],
  },
  {
    id: 'resistor_220_1',
    typeId: 'resistor_220',
    name: '220Ω Resistor',
    category: 'PASSIVE',
    model3DUrl: '/models/resistor.glb',
    position: [1.0, 0.2, 0],
    rotation: [0, 0, 0],
    properties: { resistanceOhms: 220, tolerancePct: 5 },
    pins: [
      { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO', position3D: [1.0, 0.25, -0.3] },
      { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO', position3D: [1.0, 0.25, 0.3] },
    ],
  },
  {
    id: 'led_red_1',
    typeId: 'led_red',
    name: 'Red 5mm LED',
    category: 'ACTUATOR',
    model3DUrl: '/models/led_red.glb',
    position: [1.6, 0.25, 0],
    rotation: [0, 0, 0],
    properties: { forwardVoltage: 2.0, maxCurrentMa: 25, color: '#FF3333' },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', position3D: [1.6, 0.3, -0.2] },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', position3D: [1.6, 0.3, 0.2] },
    ],
  },
];

export const DEFAULT_WIRES: WireConnection[] = [
  // Arduino Pin D13 -> Resistor Lead 1
  {
    id: 'wire_1',
    color: '#39FF6A', // Neon Green for Signal
    fromComponentId: 'arduino_uno_1',
    fromPinId: 'pin_d13',
    toComponentId: 'resistor_220_1',
    toPinId: 'lead_1',
  },
  // Resistor Lead 2 -> LED Anode
  {
    id: 'wire_2',
    color: '#FF9A1F', // Orange wire
    fromComponentId: 'resistor_220_1',
    fromPinId: 'lead_2',
    toComponentId: 'led_red_1',
    toPinId: 'anode',
  },
  // LED Cathode -> Arduino GND
  {
    id: 'wire_3',
    color: '#222222', // Dark / Black for GND
    fromComponentId: 'led_red_1',
    fromPinId: 'cathode',
    toComponentId: 'arduino_uno_1',
    toPinId: 'pin_gnd_1',
  },
];

export const DEFAULT_ARDUINO_CODE = `// RoboVerse Arduino C++ Blink Simulator
// Pin 13 is connected through a 220Ω resistor to a Red LED

const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse MCU Initialized: Blink Sketch Running!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // Turn on LED (5V)
  Serial.println("[LED] State: HIGH (Glow)");
  delay(1000);                   // Wait 1 second
  
  digitalWrite(LED_PIN, LOW);    // Turn off LED (0V)
  Serial.println("[LED] State: LOW (Dark)");
  delay(1000);                   // Wait 1 second
}
`;

export interface CircuitState {
  viewMode: WorkbenchViewMode;
  toolMode: ToolMode;
  activeWireColor: string;
  components: CircuitComponent[];
  wires: WireConnection[];
  selectedComponentId: string | null;
  wireDraftFrom: { componentId: string; pinId: string } | null;
  
  // History for Undo/Redo
  undoStack: CircuitHistorySnapshot[];
  redoStack: CircuitHistorySnapshot[];

  // Simulation State
  isSimulating: boolean;
  simulationStep: number;
  pinStates: Map<string, PinState>;
  componentOutputs: Map<string, ComponentSimulationOutput>;
  oscilloscopeSamples: Array<{ timeMs: number; voltage: number }>;
  diagnostics: CircuitDiagnosticError[];
  
  // Arduino MCU & Code
  arduinoCode: string;
  activeSketchType: 'blink' | 'servo' | 'radar' | 'line_follower';
  serialLogs: string[];
  mcuLoopInterval: any;

  // Active Challenge / Guided mode
  activeChallengeId: string | null;
  challengeCompleted: boolean;

  // Actions
  setViewMode: (mode: WorkbenchViewMode) => void;
  setToolMode: (mode: ToolMode) => void;
  setActiveWireColor: (color: string) => void;
  selectComponent: (id: string | null) => void;
  addComponent: (component: CircuitComponent) => void;
  removeComponent: (id: string) => void;
  updateComponentPosition: (id: string, position: [number, number, number]) => void;
  
  startWireDraft: (componentId: string, pinId: string) => void;
  completeWireDraft: (componentId: string, pinId: string) => void;
  cancelWireDraft: () => void;
  removeWire: (wireId: string) => void;
  
  setArduinoCode: (code: string) => void;
  setSketchType: (type: 'blink' | 'servo' | 'radar' | 'line_follower') => void;
  appendSerialLog: (msg: string) => void;
  clearSerialLogs: () => void;
  
  startSimulation: () => void;
  stopSimulation: () => void;
  stepSimulation: () => void;
  resetCircuit: () => void;
  
  undo: () => void;
  redo: () => void;
  
  setChallenge: (challengeId: string | null) => void;
  verifyChallenge: () => boolean;
}

const solver = new MnaCircuitSolver();
const sketchRunner = new ArduinoSketchRunner();

export const useCircuitStore = create<CircuitState>((set, get) => ({
  viewMode: '3D',
  toolMode: 'SELECT',
  activeWireColor: '#39FF6A',
  components: DEFAULT_COMPONENTS,
  wires: DEFAULT_WIRES,
  selectedComponentId: null,
  wireDraftFrom: null,
  
  undoStack: [],
  redoStack: [],

  isSimulating: false,
  simulationStep: 0,
  pinStates: new Map(),
  componentOutputs: new Map(),
  oscilloscopeSamples: [],
  diagnostics: [],

  arduinoCode: DEFAULT_ARDUINO_CODE,
  activeSketchType: 'blink',
  serialLogs: sketchRunner.getSerialLogs(),
  mcuLoopInterval: null,

  activeChallengeId: null,
  challengeCompleted: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setToolMode: (mode) => set({ toolMode: mode, wireDraftFrom: null }),
  setActiveWireColor: (color) => set({ activeWireColor: color }),
  selectComponent: (id) => set({ selectedComponentId: id }),

  addComponent: (component) => {
    const { components, wires, arduinoCode, undoStack } = get();
    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      components: [...components, component],
      selectedComponentId: component.id,
    });
  },

  removeComponent: (id) => {
    const { components, wires, arduinoCode, undoStack } = get();
    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      components: components.filter((c) => c.id !== id),
      wires: wires.filter((w) => w.fromComponentId !== id && w.toComponentId !== id),
      selectedComponentId: null,
    });
  },

  updateComponentPosition: (id, position) => {
    const { components } = get();
    set({
      components: components.map((c) => (c.id === id ? { ...c, position } : c)),
    });
  },

  startWireDraft: (componentId, pinId) => {
    set({ wireDraftFrom: { componentId, pinId } });
  },

  completeWireDraft: (toComponentId, toPinId) => {
    const { wireDraftFrom, components, wires, arduinoCode, undoStack, activeWireColor } = get();
    if (!wireDraftFrom) return;
    
    // Disallow self-pin connection
    if (wireDraftFrom.componentId === toComponentId && wireDraftFrom.pinId === toPinId) {
      set({ wireDraftFrom: null });
      return;
    }

    const newWire: WireConnection = {
      id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      color: activeWireColor,
      fromComponentId: wireDraftFrom.componentId,
      fromPinId: wireDraftFrom.pinId,
      toComponentId,
      toPinId,
    };

    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      wires: [...wires, newWire],
      wireDraftFrom: null,
    });
  },

  cancelWireDraft: () => set({ wireDraftFrom: null }),

  removeWire: (wireId) => {
    const { components, wires, arduinoCode, undoStack } = get();
    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      wires: wires.filter((w) => w.id !== wireId),
    });
  },

  setArduinoCode: (code) => set({ arduinoCode: code }),

  setSketchType: (type) => {
    sketchRunner.reset();
    set({
      activeSketchType: type,
      serialLogs: sketchRunner.getSerialLogs(),
    });
  },

  appendSerialLog: (msg) => {
    set((state) => ({
      serialLogs: [...state.serialLogs.slice(-40), msg],
    }));
  },

  clearSerialLogs: () => set({ serialLogs: [] }),

  startSimulation: () => {
    const { mcuLoopInterval } = get();
    if (mcuLoopInterval) clearInterval(mcuLoopInterval);

    solver.reset();
    sketchRunner.reset();

    const interval = setInterval(() => {
      const { components, wires, activeSketchType, isSimulating } = get();
      if (!isSimulating) return;

      sketchRunner.executeCycle(activeSketchType);
      const pinVoltages = sketchRunner.getPinVoltages();
      const simResult = solver.solveStep(components, wires, pinVoltages);

      set({
        simulationStep: simResult.step,
        pinStates: simResult.pinStates,
        componentOutputs: simResult.componentOutputs,
        oscilloscopeSamples: [...simResult.oscilloscopeSamples],
        diagnostics: simResult.diagnostics,
        serialLogs: sketchRunner.getSerialLogs(),
      });
    }, 400); // 400ms tick for visible LED blinking and motor motion

    set({ isSimulating: true, mcuLoopInterval: interval });
  },

  stopSimulation: () => {
    const { mcuLoopInterval } = get();
    if (mcuLoopInterval) clearInterval(mcuLoopInterval);
    set({ isSimulating: false, mcuLoopInterval: null });
  },

  stepSimulation: () => {
    const { components, wires, activeSketchType } = get();
    sketchRunner.executeCycle(activeSketchType);
    const pinVoltages = sketchRunner.getPinVoltages();
    const simResult = solver.solveStep(components, wires, pinVoltages);

    set({
      simulationStep: simResult.step,
      pinStates: simResult.pinStates,
      componentOutputs: simResult.componentOutputs,
      oscilloscopeSamples: [...simResult.oscilloscopeSamples],
      diagnostics: simResult.diagnostics,
      serialLogs: sketchRunner.getSerialLogs(),
    });
  },

  resetCircuit: () => {
    const { mcuLoopInterval } = get();
    if (mcuLoopInterval) clearInterval(mcuLoopInterval);
    solver.reset();
    sketchRunner.reset();
    set({
      isSimulating: false,
      mcuLoopInterval: null,
      components: DEFAULT_COMPONENTS,
      wires: DEFAULT_WIRES,
      selectedComponentId: null,
      wireDraftFrom: null,
      pinStates: new Map(),
      componentOutputs: new Map(),
      oscilloscopeSamples: [],
      diagnostics: [],
      serialLogs: sketchRunner.getSerialLogs(),
    });
  },

  undo: () => {
    const { undoStack, redoStack, components, wires, arduinoCode } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, { components, wires, arduinoCode }],
      components: prev.components,
      wires: prev.wires,
      arduinoCode: prev.arduinoCode,
    });
  },

  redo: () => {
    const { undoStack, redoStack, components, wires, arduinoCode } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      components: next.components,
      wires: next.wires,
      arduinoCode: next.arduinoCode,
    });
  },

  setChallenge: (challengeId) => {
    set({ activeChallengeId: challengeId, challengeCompleted: false });
  },

  verifyChallenge: () => {
    const { activeChallengeId, components, wires, diagnostics } = get();
    if (!activeChallengeId) return false;

    // Check challenge constraints
    let passed = false;
    if (activeChallengeId === 'ch_first_led') {
      const hasLed = components.some((c) => c.typeId.includes('led'));
      const hasResistor = components.some((c) => c.typeId.includes('resistor'));
      const hasWires = wires.length >= 3;
      const noCriticalDiag = !diagnostics.some((d) => d.severity === 'CRITICAL');
      passed = hasLed && hasResistor && hasWires && noCriticalDiag;
    } else if (activeChallengeId === 'ch_servo_sweep') {
      const hasServo = components.some((c) => c.typeId.includes('servo'));
      passed = hasServo && wires.length >= 3;
    } else if (activeChallengeId === 'ch_ultrasonic_alarm') {
      const hasUltrasonic = components.some((c) => c.typeId.includes('ultrasonic'));
      const hasBuzzer = components.some((c) => c.typeId.includes('buzzer') || c.typeId.includes('led'));
      passed = hasUltrasonic && hasBuzzer && wires.length >= 4;
    }

    if (passed) {
      set({ challengeCompleted: true });
    }
    return passed;
  },
}));
