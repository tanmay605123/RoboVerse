import { create } from 'zustand';
import {
  CircuitComponent,
  WireConnection,
  CircuitDiagnosticError,
} from '@roboverse/shared';
import {
  MnaCircuitSolver,
  ArduinoVirtualMachine,
  ArduinoCompiler,
  CompilationResult,
  PinState,
  ComponentSimulationOutput,
} from '@roboverse/sim-engine';
import {
  StudioVisualizationMode,
  StudioToolMode,
  StudioBottomTab,
} from '../components/arduino-studio/types';
import { TEMPLATES } from '../components/arduino-studio/templates';

export interface StudioHistorySnapshot {
  components: CircuitComponent[];
  wires: WireConnection[];
  arduinoCode: string;
}

export interface ArduinoStudioState {
  // Workspace Meta
  projectName: string;
  visualizationMode: StudioVisualizationMode;
  toolMode: StudioToolMode;
  activeBottomTab: StudioBottomTab;
  activeWireColor: string;
  
  // Canvas Viewport
  zoomLevel: number;
  panOffset: { x: number; y: number };

  // Circuit Data Model
  components: CircuitComponent[];
  wires: WireConnection[];
  selectedComponentId: string | null;
  selectedWireId: string | null;
  wireDraftFrom: { componentId: string; pinId: string } | null;

  // History Stack
  undoStack: StudioHistorySnapshot[];
  redoStack: StudioHistorySnapshot[];

  // Simulation Controller
  isSimulating: boolean;
  isPaused: boolean;
  simulationSpeed: number;
  simulationStep: number;
  simInterval: any;

  // Code & MCU
  arduinoCode: string;
  compilerResult: CompilationResult | null;
  compilerLogs: string[];
  serialLogs: string[];
  simulationLogs: string[];

  // Electrical State
  pinStates: Map<string, PinState>;
  componentOutputs: Map<string, ComponentSimulationOutput>;
  oscilloscopeSamples: Array<{ timeMs: number; voltage: number }>;
  diagnostics: CircuitDiagnosticError[];

  // Actions
  setProjectName: (name: string) => void;
  setVisualizationMode: (mode: StudioVisualizationMode) => void;
  setToolMode: (mode: StudioToolMode) => void;
  setActiveBottomTab: (tab: StudioBottomTab) => void;
  setActiveWireColor: (color: string) => void;
  
  setZoomLevel: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  
  selectComponent: (id: string | null) => void;
  selectWire: (id: string | null) => void;
  
  addComponent: (component: CircuitComponent) => void;
  updateComponentPosition: (id: string, position: [number, number, number]) => void;
  rotateComponent: (id: string, deltaDeg?: number) => void;
  duplicateComponent: (id: string) => void;
  removeComponent: (id: string) => void;
  updateComponentProperty: (id: string, propKey: string, propVal: any) => void;
  togglePushButton: (componentId: string, forcedState?: boolean) => void;

  startWireDraft: (componentId: string, pinId: string) => void;
  completeWireDraft: (componentId: string, pinId: string) => void;
  cancelWireDraft: () => void;
  removeWire: (wireId: string) => void;

  setArduinoCode: (code: string) => void;
  compileCode: () => boolean;
  
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepCycle: () => void;
  setSimulationSpeed: (speed: number) => void;

  clearSerial: () => void;
  clearLogs: () => void;
  sendSerialInput: (input: string) => void;

  loadTemplate: (templateId: string) => void;
  undo: () => void;
  redo: () => void;
  exportInoFile: () => void;
  exportJsonProject: () => void;
  importJsonProject: (jsonStr: string) => boolean;
}

const defaultTemplate = TEMPLATES[0]; // Tinkercad Push Button LED Circuit
const solver = new MnaCircuitSolver();
const vm = new ArduinoVirtualMachine();

export const useArduinoStudioStore = create<ArduinoStudioState>((set, get) => ({
  projectName: 'Push Button LED Circuit (Tinkercad Reference)',
  visualizationMode: '2D',
  toolMode: 'SELECT',
  activeBottomTab: 'CODE',
  activeWireColor: '#39FF6A',

  zoomLevel: 1.0,
  panOffset: { x: 0, y: 0 },

  components: defaultTemplate.components,
  wires: defaultTemplate.wires,
  selectedComponentId: defaultTemplate.components[0]?.id || null,
  selectedWireId: null,
  wireDraftFrom: null,

  undoStack: [],
  redoStack: [],

  isSimulating: false,
  isPaused: false,
  simulationSpeed: 1,
  simulationStep: 0,
  simInterval: null,

  arduinoCode: defaultTemplate.code,
  compilerResult: null,
  compilerLogs: [
    'RoboVerse AVR Compiler v1.2 ready.',
    'Target MCU: ATmega328P (16MHz RISC, 32KB Flash, 2KB SRAM).',
    'Click "Compile" or "Start Sim" to build sketch.',
  ],
  serialLogs: vm.getSerialLogs(),
  simulationLogs: [
    '[STUDIO] Initialized Arduino Studio module with Push Button LED circuit.',
    '[CIRCUIT] Ready for 2D/3D breadboard wiring and real-time C++ simulation.',
  ],

  pinStates: new Map(),
  componentOutputs: new Map(),
  oscilloscopeSamples: [],
  diagnostics: [],

  setProjectName: (name) => set({ projectName: name }),
  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  setToolMode: (mode) => set({ toolMode: mode, wireDraftFrom: null }),
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),
  setActiveWireColor: (color) => set({ activeWireColor: color }),

  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.3, Math.min(2.5, zoom)) }),
  zoomIn: () => set((state) => ({ zoomLevel: Math.min(2.5, Number((state.zoomLevel + 0.15).toFixed(2))) })),
  zoomOut: () => set((state) => ({ zoomLevel: Math.max(0.3, Number((state.zoomLevel - 0.15).toFixed(2))) })),
  resetZoom: () => set({ zoomLevel: 1.0, panOffset: { x: 0, y: 0 } }),
  setPanOffset: (offset) => set({ panOffset: offset }),

  selectComponent: (id) => set({ selectedComponentId: id, selectedWireId: null }),
  selectWire: (id) => set({ selectedWireId: id, selectedComponentId: null }),

  addComponent: (component) => {
    const { components, wires, arduinoCode, undoStack } = get();
    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      components: [...components, component],
      selectedComponentId: component.id,
      selectedWireId: null,
    });
  },

  updateComponentPosition: (id, position) => {
    set((state) => ({
      components: state.components.map((c) => (c.id === id ? { ...c, position } : c)),
    }));
  },

  rotateComponent: (id, deltaDeg = 90) => {
    const { components, wires, arduinoCode, undoStack } = get();
    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      components: components.map((c) => {
        if (c.id !== id) return c;
        const currentRotY = c.rotation[1] || 0;
        const newRotY = (currentRotY + (deltaDeg * Math.PI) / 180) % (Math.PI * 2);
        return {
          ...c,
          rotation: [c.rotation[0], newRotY, c.rotation[2]],
        };
      }),
    });
  },

  duplicateComponent: (id) => {
    const { components, wires, arduinoCode, undoStack } = get();
    const source = components.find((c) => c.id === id);
    if (!source) return;

    const newId = `${source.typeId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newComponent: CircuitComponent = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      position: [source.position[0] + 0.4, source.position[1], source.position[2] + 0.4],
      pins: source.pins.map((p) => ({ ...p })),
      properties: { ...source.properties },
    };

    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      components: [...components, newComponent],
      selectedComponentId: newId,
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

  updateComponentProperty: (id, propKey, propVal) => {
    set((state) => ({
      components: state.components.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          properties: {
            ...c.properties,
            [propKey]: propVal,
          },
        };
      }),
    }));
  },

  togglePushButton: (componentId, forcedState) => {
    const { components, isSimulating } = get();
    const comp = components.find((c) => c.id === componentId);
    if (!comp) return;

    const nextState = forcedState !== undefined ? forcedState : !comp.properties?.isPressed;
    const updatedComponents = components.map((c) =>
      c.id === componentId ? { ...c, properties: { ...c.properties, isPressed: nextState } } : c
    );

    set((state) => ({
      components: updatedComponents,
      simulationLogs: [
        ...state.simulationLogs.slice(-60),
        `[USER INTERACTION] Push button "${comp.name}" ${nextState ? 'PRESSED (Contacts Closed to GND)' : 'RELEASED (Contacts Open)'}`,
      ],
    }));

    // If simulating, trigger immediate reactive electrical step
    if (isSimulating) {
      get().stepCycle();
    }
  },

  startWireDraft: (componentId, pinId) => {
    set({ wireDraftFrom: { componentId, pinId } });
  },

  completeWireDraft: (toComponentId, toPinId) => {
    const { wireDraftFrom, components, wires, arduinoCode, undoStack, activeWireColor } = get();
    if (!wireDraftFrom) return;

    // Disallow connecting pin to itself
    if (wireDraftFrom.componentId === toComponentId && wireDraftFrom.pinId === toPinId) {
      set({ wireDraftFrom: null });
      return;
    }

    const newWire: WireConnection = {
      id: `wire_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
      selectedWireId: newWire.id,
      simulationLogs: [
        ...get().simulationLogs.slice(-60),
        `[WIRING] Connected ${wireDraftFrom.componentId}:${wireDraftFrom.pinId} -> ${toComponentId}:${toPinId}`,
      ],
    });
  },

  cancelWireDraft: () => set({ wireDraftFrom: null }),

  removeWire: (wireId) => {
    const { components, wires, arduinoCode, undoStack } = get();
    set({
      undoStack: [...undoStack, { components, wires, arduinoCode }],
      redoStack: [],
      wires: wires.filter((w) => w.id !== wireId),
      selectedWireId: null,
    });
  },

  setArduinoCode: (code) => set({ arduinoCode: code }),

  compileCode: () => {
    const { arduinoCode } = get();
    const result = ArduinoCompiler.compile(arduinoCode);

    set({
      compilerResult: result,
      compilerLogs: result.compilerLogs,
      activeBottomTab: result.success ? get().activeBottomTab : 'COMPILER',
      simulationLogs: [
        ...get().simulationLogs.slice(-60),
        result.success
          ? `[COMPILER] Build succeeded! Flash: ${result.programBytes} bytes, SRAM: ${result.dynamicMemoryBytes} bytes.`
          : `[COMPILER] Build failed with ${result.errors.length} error(s).`,
      ],
    });

    if (result.success) {
      vm.loadCode(arduinoCode);
    }
    return result.success;
  },

  startSimulation: () => {
    const { simInterval, arduinoCode, simulationSpeed } = get();
    if (simInterval) clearInterval(simInterval);

    // 1. Mandatory genuine compile step
    const compResult = ArduinoCompiler.compile(arduinoCode);
    set({
      compilerResult: compResult,
      compilerLogs: compResult.compilerLogs,
    });

    if (!compResult.success) {
      set({
        activeBottomTab: 'COMPILER',
        simulationLogs: [
          ...get().simulationLogs.slice(-60),
          `[SIMULATION BLOCKED] Cannot start simulation: code failed compilation.`,
        ],
      });
      return;
    }

    // 2. Load compiled firmware into VM
    solver.reset();
    vm.reset();
    vm.loadCode(arduinoCode);

    // 3. Start high-frequency tick loop
    const tickMs = Math.round(200 / simulationSpeed);
    const interval = setInterval(() => {
      const { isSimulating, isPaused } = get();
      if (!isSimulating || isPaused) return;

      get().stepCycle();
    }, tickMs);

    set({
      isSimulating: true,
      isPaused: false,
      simInterval: interval,
      simulationLogs: [
        ...get().simulationLogs.slice(-60),
        `[SIMULATION] Started ATmega328P simulation at ${simulationSpeed}x speed (Tick: ${tickMs}ms).`,
      ],
    });
  },

  pauseSimulation: () => {
    set((state) => ({
      isPaused: true,
      simulationLogs: [...state.simulationLogs.slice(-60), '[SIMULATION] Paused execution.'],
    }));
  },

  resumeSimulation: () => {
    set((state) => ({
      isPaused: false,
      simulationLogs: [...state.simulationLogs.slice(-60), '[SIMULATION] Resumed execution.'],
    }));
  },

  stopSimulation: () => {
    const { simInterval } = get();
    if (simInterval) clearInterval(simInterval);
    set((state) => ({
      isSimulating: false,
      isPaused: false,
      simInterval: null,
      simulationLogs: [...state.simulationLogs.slice(-60), '[SIMULATION] Stopped MCU and circuit clock.'],
    }));
  },

  resetSimulation: () => {
    const { simInterval } = get();
    if (simInterval) clearInterval(simInterval);
    solver.reset();
    vm.reset();
    set({
      isSimulating: false,
      isPaused: false,
      simInterval: null,
      simulationStep: 0,
      pinStates: new Map(),
      componentOutputs: new Map(),
      oscilloscopeSamples: [],
      diagnostics: [],
      serialLogs: vm.getSerialLogs(),
      simulationLogs: ['[SIMULATION] Simulation registers and net voltages reset to zero.'],
    });
  },

  stepCycle: () => {
    const { components, wires } = get();

    // 1. First solve nets to determine input pin voltages (e.g. from push button to Pin 2)
    const pinVoltagesPre = vm.getPinVoltages();
    const pinModes = vm.getPinModes();
    const preResult = solver.solveStep(components, wires, pinVoltagesPre, pinModes);

    // 2. MCU execution: digitalRead queries the solved net voltage for that Arduino pin
    const pinReader = (pinNum: number): number => {
      const pinKey = `arduino_uno_1:pin_d${pinNum}`;
      const state = preResult.pinStates.get(pinKey);
      if (!state) return 1; // Default floating HIGH if INPUT_PULLUP
      // If voltage is below 1.5V, logic LOW (0), else logic HIGH (1)
      return state.voltage < 1.5 ? 0 : 1;
    };

    // 3. Execute one loop() iteration in Arduino VM
    vm.executeCycle('custom', pinReader);

    // 4. Feed updated MCU output voltages back into MNA solver
    const pinVoltagesPost = vm.getPinVoltages();
    const finalResult = solver.solveStep(components, wires, pinVoltagesPost, pinModes);

    set({
      simulationStep: finalResult.step,
      pinStates: finalResult.pinStates,
      componentOutputs: finalResult.componentOutputs,
      oscilloscopeSamples: [...finalResult.oscilloscopeSamples],
      diagnostics: finalResult.diagnostics,
      serialLogs: [...vm.getSerialLogs()],
      simulationLogs: [...get().simulationLogs.slice(-80), ...vm.getSimulationLogs().slice(-3)],
    });
  },

  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
    const { isSimulating } = get();
    if (isSimulating) {
      // Re-arm interval with new speed
      get().startSimulation();
    }
  },

  clearSerial: () => {
    vm.clearSerial();
    set({ serialLogs: [] });
  },

  clearLogs: () => {
    vm.clearSimulationLogs();
    set({ simulationLogs: [] });
  },

  sendSerialInput: (input) => {
    if (!input.trim()) return;
    set((state) => ({
      serialLogs: [...state.serialLogs, `> ${input}`],
      simulationLogs: [...state.simulationLogs.slice(-60), `[SERIAL RX] Received user byte stream: "${input}"`],
    }));
  },

  loadTemplate: (templateId) => {
    const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    const { simInterval } = get();
    if (simInterval) clearInterval(simInterval);

    solver.reset();
    vm.reset();

    set({
      projectName: template.name,
      components: template.components,
      wires: template.wires,
      arduinoCode: template.code,
      selectedComponentId: template.components[0]?.id || null,
      selectedWireId: null,
      wireDraftFrom: null,
      isSimulating: false,
      isPaused: false,
      simInterval: null,
      simulationStep: 0,
      compilerResult: null,
      serialLogs: vm.getSerialLogs(),
      simulationLogs: [`[TEMPLATE] Loaded "${template.name}".`],
      pinStates: new Map(),
      componentOutputs: new Map(),
      diagnostics: [],
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

  exportInoFile: () => {
    const { arduinoCode, projectName } = get();
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ino`;
    const blob = new Blob([arduinoCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportJsonProject: () => {
    const { projectName, components, wires, arduinoCode } = get();
    const snapshot = {
      version: '1.0.0',
      projectName,
      exportedAt: new Date().toISOString(),
      components,
      wires,
      arduinoCode,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.roboverse.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importJsonProject: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.components || !data.wires) return false;
      const { simInterval } = get();
      if (simInterval) clearInterval(simInterval);
      solver.reset();
      vm.reset();

      set({
        projectName: data.projectName || 'Imported Circuit',
        components: data.components,
        wires: data.wires,
        arduinoCode: data.arduinoCode || get().arduinoCode,
        isSimulating: false,
        isPaused: false,
        simInterval: null,
        simulationLogs: [`[IMPORT] Successfully loaded project from JSON.`],
      });
      return true;
    } catch {
      return false;
    }
  },
}));
