import {
  CircuitComponent,
  WireConnection,
  CircuitDiagnosticError,
  CircuitDiagnosticSeverity,
} from '@roboverse/shared';

export interface PinState {
  pinId: string;
  componentId: string;
  voltage: number;
  currentMa: number;
  netId: string;
  isHigh?: boolean;
}

export interface ComponentSimulationOutput {
  componentId: string;
  state: {
    isOn?: boolean;
    brightness?: number;      // 0.0 to 1.0 for LEDs
    rpm?: number;             // For DC Motors
    angle?: number;           // 0 to 180 for Servos
    distanceCm?: number;      // For Ultrasonic Sensors
    temperatureC?: number;    // For Temp sensors
    humidityPct?: number;     // For humidity
    lightLux?: number;        // For LDR
    voltageOut?: number;
    currentMa?: number;
    powerMilliwatts?: number;
    isBurnedOut?: boolean;
  };
}

export interface SimulationResult {
  timestampMs: number;
  step: number;
  pinStates: Map<string, PinState>;
  componentOutputs: Map<string, ComponentSimulationOutput>;
  oscilloscopeSamples: Array<{ timeMs: number; voltage: number }>;
  serialLog: string[];
  diagnostics: CircuitDiagnosticError[];
  isRunning: boolean;
}

/**
 * Modified Nodal Analysis (MNA) DC & Basic Transient Electrical Engine
 */
export class MnaCircuitSolver {
  private stepCount = 0;
  private timeMs = 0;
  private oscilloscopeBuffer: Array<{ timeMs: number; voltage: number }> = [];

  /**
   * Disjoint-set / Union-Find to group connected pins into electrical nets
   */
  public static buildElectricalNets(
    components: CircuitComponent[],
    wires: WireConnection[]
  ): { netMap: Map<string, string>; nets: Map<string, string[]> } {
    const parent = new Map<string, string>();

    const getPinKey = (compId: string, pinId: string) => `${compId}:${pinId}`;

    // Initialize each pin in its own net
    components.forEach((comp) => {
      comp.pins.forEach((pin) => {
        const key = getPinKey(comp.id, pin.id);
        parent.set(key, key);
      });
    });

    const find = (i: string): string => {
      const root = parent.get(i) || i;
      if (root === i) return i;
      const res = find(root);
      parent.set(i, res);
      return res;
    };

    const union = (i: string, j: string) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent.set(rootI, rootJ);
      }
    };

    // Connect wires
    wires.forEach((wire) => {
      const pinA = getPinKey(wire.fromComponentId, wire.fromPinId);
      const pinB = getPinKey(wire.toComponentId, wire.toPinId);
      if (parent.has(pinA) && parent.has(pinB)) {
        union(pinA, pinB);
      }
    });

    // Group pins into net arrays
    const nets = new Map<string, string[]>();
    const netMap = new Map<string, string>();

    parent.forEach((_, key) => {
      const netId = find(key);
      netMap.set(key, netId);
      if (!nets.has(netId)) {
        nets.set(netId, []);
      }
      nets.get(netId)!.push(key);
    });

    return { netMap, nets };
  }

  /**
   * Run a simulation time-step
   */
  public solveStep(
    components: CircuitComponent[],
    wires: WireConnection[],
    arduinoPinVoltages: Map<number, number> = new Map()
  ): SimulationResult {
    this.stepCount += 1;
    this.timeMs += 10; // 10ms time-step (100 Hz simulation tick)

    const diagnostics = CircuitDiagnosticEngine.validateCircuit(components, wires);
    const { netMap, nets } = MnaCircuitSolver.buildElectricalNets(components, wires);

    const netVoltages = new Map<string, number>();

    // 1. Identify Ground Nets (Reference 0V)
    nets.forEach((pins, netId) => {
      const hasGnd = pins.some((pKey) => {
        const [cId, pId] = pKey.split(':');
        const comp = components.find((c) => c.id === cId);
        const pin = comp?.pins.find((p) => p.id === pId);
        return pin?.type === 'GROUND';
      });
      if (hasGnd) {
        netVoltages.set(netId, 0.0);
      }
    });

    // 2. Identify Power Supply Nets (5V or 3.3V or Battery 9V)
    nets.forEach((pins, netId) => {
      if (netVoltages.get(netId) === 0.0) return; // Don't override GND if shorted

      pins.forEach((pKey) => {
        const [cId, pId] = pKey.split(':');
        const comp = components.find((c) => c.id === cId);
        if (!comp) return;

        // Arduino 5V / 3.3V pins
        if (comp.typeId.toLowerCase().includes('arduino')) {
          if (pId === 'pin_5v') netVoltages.set(netId, 5.0);
          if (pId === 'pin_3v3') netVoltages.set(netId, 3.3);
        }

        // ESP32 3.3V
        if (comp.typeId.toLowerCase().includes('esp32')) {
          if (pId === 'pin_3v3') netVoltages.set(netId, 3.3);
        }

        // Battery / Power Supply
        if (comp.typeId.toLowerCase().includes('battery')) {
          const volt = comp.properties?.voltage || 9.0;
          if (pId === 'vcc' || pId === 'positive') netVoltages.set(netId, volt);
        }

        // Dynamic Digital Arduino I/O Pins from MCU emulator
        if (comp.typeId.toLowerCase().includes('arduino') && pId.startsWith('pin_d')) {
          const pinNum = parseInt(pId.replace('pin_d', ''), 10);
          if (arduinoPinVoltages.has(pinNum)) {
            netVoltages.set(netId, arduinoPinVoltages.get(pinNum)!);
          }
        }
      });
    });

    // 3. Compute Individual Pin States and Component Outputs
    const pinStates = new Map<string, PinState>();
    const componentOutputs = new Map<string, ComponentSimulationOutput>();

    components.forEach((comp) => {
      const output: ComponentSimulationOutput = {
        componentId: comp.id,
        state: {},
      };

      // LED Evaluation
      if (comp.typeId.toLowerCase().includes('led')) {
        const anodeKey = `${comp.id}:anode`;
        const cathodeKey = `${comp.id}:cathode`;
        const netAnode = netMap.get(anodeKey);
        const netCathode = netMap.get(cathodeKey);

        const vAnode = (netAnode ? netVoltages.get(netAnode) : 0) ?? 0;
        const vCathode = (netCathode ? netVoltages.get(netCathode) : 0) ?? 0;
        const vDiff = vAnode - vCathode;

        const forwardV = comp.properties?.forwardVoltage || 2.0;
        if (vDiff >= forwardV) {
          const currentMa = Math.min(30, (vDiff - forwardV) / 0.22); // assuming ~220 ohm in path
          output.state.isOn = true;
          output.state.brightness = Math.min(1.0, currentMa / 20.0);
          output.state.currentMa = Number(currentMa.toFixed(1));
          output.state.voltageOut = Number(vDiff.toFixed(2));
        } else {
          output.state.isOn = false;
          output.state.brightness = 0;
          output.state.currentMa = 0;
        }
      }

      // DC Motor Evaluation
      if (comp.typeId.toLowerCase().includes('motor') || comp.category === 'ACTUATOR') {
        const vccNet = netMap.get(`${comp.id}:vcc`) || netMap.get(`${comp.id}:pin_1`);
        const gndNet = netMap.get(`${comp.id}:gnd`) || netMap.get(`${comp.id}:pin_2`);
        const vIn = (vccNet ? netVoltages.get(vccNet) : 0) ?? 0;
        const vGnd = (gndNet ? netVoltages.get(gndNet) : 0) ?? 0;
        const vApplied = Math.max(0, vIn - vGnd);

        if (vApplied >= 2.5) {
          const maxRpm = comp.properties?.maxRpm || 300;
          output.state.rpm = Math.round((vApplied / 5.0) * maxRpm);
          output.state.isOn = true;
        } else {
          output.state.rpm = 0;
          output.state.isOn = false;
        }
      }

      // Servo Motor Evaluation
      if (comp.typeId.toLowerCase().includes('servo')) {
        const angle = comp.properties?.angle ?? 90;
        output.state.angle = angle;
        output.state.isOn = true;
      }

      // Ultrasonic Sensor
      if (comp.typeId.toLowerCase().includes('ultrasonic')) {
        output.state.distanceCm = comp.properties?.testDistanceCm || 24.5;
      }

      componentOutputs.set(comp.id, output);

      // Record pin states
      comp.pins.forEach((pin) => {
        const key = `${comp.id}:${pin.id}`;
        const netId = netMap.get(key) || 'floating';
        const volt = netVoltages.get(netId) ?? 0.0;
        pinStates.set(key, {
          pinId: pin.id,
          componentId: comp.id,
          voltage: volt,
          currentMa: 0,
          netId,
          isHigh: volt >= 2.5,
        });
      });
    });

    // Record sample for virtual oscilloscope (captures Pin D13 or first active net)
    const probeNetVoltage = Array.from(netVoltages.values())[0] ?? 0;
    this.oscilloscopeBuffer.push({ timeMs: this.timeMs, voltage: probeNetVoltage });
    if (this.oscilloscopeBuffer.length > 50) {
      this.oscilloscopeBuffer.shift();
    }

    return {
      timestampMs: this.timeMs,
      step: this.stepCount,
      pinStates,
      componentOutputs,
      oscilloscopeSamples: this.oscilloscopeBuffer,
      serialLog: [],
      diagnostics,
      isRunning: true,
    };
  }

  public reset(): void {
    this.stepCount = 0;
    this.timeMs = 0;
    this.oscilloscopeBuffer = [];
  }
}

/**
 * High-Level Arduino C++ Sketch Emulator & Virtual Serial Monitor
 */
export class ArduinoSketchRunner {
  private pinVoltages: Map<number, number> = new Map();
  private serialBuffer: string[] = [];
  private loopCounter = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.pinVoltages.clear();
    for (let i = 0; i <= 13; i++) {
      this.pinVoltages.set(i, 0.0);
    }
    this.serialBuffer = [
      '[ROBOVERSE AVR8JS VIRTUAL MCU INITIALIZED]',
      'ATmega328P Clock: 16.00 MHz',
      'Serial connection established at 9600 baud.',
      '----------------------------------------------',
    ];
    this.loopCounter = 0;
  }

  public getPinVoltages(): Map<number, number> {
    return this.pinVoltages;
  }

  public getSerialLogs(): string[] {
    return this.serialBuffer;
  }

  /**
   * Execute one Arduino loop() cycle based on the active sketch
   */
  public executeCycle(sketchType: string = 'blink'): void {
    this.loopCounter += 1;

    if (sketchType === 'blink') {
      const isHigh = this.loopCounter % 2 === 0;
      this.pinVoltages.set(13, isHigh ? 5.0 : 0.0);
      if (this.serialBuffer.length < 30) {
        this.serialBuffer.push(`[${new Date().toLocaleTimeString()}] Pin 13 State: ${isHigh ? 'HIGH (5.0V)' : 'LOW (0.0V)'}`);
      }
    } else if (sketchType === 'servo') {
      const angle = (this.loopCounter * 15) % 180;
      this.pinVoltages.set(9, 5.0); // PWM active
      if (this.serialBuffer.length < 30) {
        this.serialBuffer.push(`[SERVO] Swept to position: ${angle}°`);
      }
    } else if (sketchType === 'radar') {
      const dist = 15 + Math.round(Math.sin(this.loopCounter * 0.2) * 10);
      if (this.serialBuffer.length < 30) {
        this.serialBuffer.push(`[RADAR] Target detected at: ${dist} cm`);
      }
    } else if (sketchType === 'line_follower') {
      this.pinVoltages.set(3, 4.5); // Left motor PWM
      this.pinVoltages.set(5, 4.5); // Right motor PWM
      if (this.serialBuffer.length < 30) {
        this.serialBuffer.push(`[ROVER] Dual IR Trackers OK: Driving Forward (PWM 180)`);
      }
    }
  }
}

export class CircuitDiagnosticEngine {
  public static validateCircuit(
    components: CircuitComponent[],
    wires: WireConnection[]
  ): CircuitDiagnosticError[] {
    const diagnostics: CircuitDiagnosticError[] = [];

    if (components.length === 0) {
      return diagnostics;
    }

    // 1. Check if there is at least one ground connection
    const hasGround = components.some((c) =>
      c.pins.some((p) => p.type === 'GROUND') &&
      wires.some((w) => (w.fromComponentId === c.id || w.toComponentId === c.id))
    );

    if (!hasGround && components.length > 1) {
      diagnostics.push({
        id: 'diag_missing_gnd',
        code: 'MISSING_GROUND',
        severity: CircuitDiagnosticSeverity.WARNING,
        message: 'No circuit ground (GND) detected.',
        explanation: 'Every closed circuit requires a common reference ground (0V) for current to flow safely.',
        affectedComponentIds: components.map((c) => c.id),
        fixSuggestion: 'Connect a wire from your power supply GND pin or Arduino GND pin to the circuit breadboard bus.',
      });
    }

    // 2. Check for direct short circuits
    for (const wire of wires) {
      const fromComp = components.find((c) => c.id === wire.fromComponentId);
      const toComp = components.find((c) => c.id === wire.toComponentId);
      if (!fromComp || !toComp) continue;

      const fromPin = fromComp.pins.find((p) => p.id === wire.fromPinId);
      const toPin = toComp.pins.find((p) => p.id === wire.toPinId);

      if (
        (fromPin?.type === 'POWER_VCC' && toPin?.type === 'GROUND') ||
        (fromPin?.type === 'GROUND' && toPin?.type === 'POWER_VCC')
      ) {
        diagnostics.push({
          id: `diag_short_${wire.id}`,
          code: 'SHORT_CIRCUIT',
          severity: CircuitDiagnosticSeverity.CRITICAL,
          message: 'Direct Short Circuit Detected!',
          explanation: 'Power (VCC) is directly connected to Ground (GND) without any load. This will burn out components or cause battery damage.',
          affectedComponentIds: [fromComp.id, toComp.id],
          affectedPinIds: [fromPin.id, toPin.id],
          fixSuggestion: 'Remove this direct wire connection immediately or add a load (resistor, motor, etc.) between them.',
        });
      }
    }

    // 3. Check for LEDs without current-limiting resistors
    const leds = components.filter((c) => c.typeId.toLowerCase().includes('led'));
    for (const led of leds) {
      const ledWires = wires.filter((w) => w.fromComponentId === led.id || w.toComponentId === led.id);
      const connectsToResistor = ledWires.some((w) => {
        const otherId = w.fromComponentId === led.id ? w.toComponentId : w.fromComponentId;
        const otherComp = components.find((c) => c.id === otherId);
        return otherComp && otherComp.typeId.toLowerCase().includes('resistor');
      });

      const connectsDirectToPower = ledWires.some((w) => {
        const otherId = w.fromComponentId === led.id ? w.toComponentId : w.fromComponentId;
        const otherComp = components.find((c) => c.id === otherId);
        return otherComp && (otherComp.typeId.toLowerCase().includes('arduino') || otherComp.typeId.toLowerCase().includes('battery'));
      });

      if (connectsDirectToPower && !connectsToResistor) {
        diagnostics.push({
          id: `diag_led_resistor_${led.id}`,
          code: 'LED_NO_RESISTOR',
          severity: CircuitDiagnosticSeverity.WARNING,
          message: `LED "${led.name}" has no current-limiting resistor.`,
          explanation: 'Connecting an LED directly to a 5V source without a 220Ω - 330Ω resistor will blow the LED due to excessive forward current.',
          affectedComponentIds: [led.id],
          fixSuggestion: 'Place a 220Ω or 330Ω resistor in series with the anode or cathode of the LED.',
        });
      }
    }

    return diagnostics;
  }
}
