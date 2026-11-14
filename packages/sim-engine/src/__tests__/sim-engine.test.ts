import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MnaCircuitSolver,
  ArduinoSketchRunner,
  ArduinoCompiler,
  ArduinoVirtualMachine,
  CircuitDiagnosticEngine,
} from '../index';
import { CircuitComponent, WireConnection, CircuitDiagnosticSeverity } from '@roboverse/shared';

describe('RoboVerse MNA Simulation & Diagnostics Engine', () => {
  it('should identify electrical nets using Union-Find disjoint sets', () => {
    const components: CircuitComponent[] = [
      {
        id: 'comp1',
        typeId: 'resistor',
        name: 'Resistor 1',
        category: 'PASSIVE',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: {},
        pins: [
          { id: 'p1', name: 'Pin 1', type: 'DIGITAL_IO' },
          { id: 'p2', name: 'Pin 2', type: 'DIGITAL_IO' },
        ],
      },
      {
        id: 'comp2',
        typeId: 'resistor',
        name: 'Resistor 2',
        category: 'PASSIVE',
        model3DUrl: '',
        position: [1, 0, 0],
        rotation: [0, 0, 0],
        properties: {},
        pins: [
          { id: 'p1', name: 'Pin 1', type: 'DIGITAL_IO' },
          { id: 'p2', name: 'Pin 2', type: 'DIGITAL_IO' },
        ],
      },
    ];

    const wires: WireConnection[] = [
      {
        id: 'w1',
        color: '#39FF6A',
        fromComponentId: 'comp1',
        fromPinId: 'p2',
        toComponentId: 'comp2',
        toPinId: 'p1',
      },
    ];

    const { netMap } = MnaCircuitSolver.buildElectricalNets(components, wires);
    assert.strictEqual(netMap.get('comp1:p2'), netMap.get('comp2:p1'));
    assert.notStrictEqual(netMap.get('comp1:p1'), netMap.get('comp2:p2'));
  });

  it('should detect direct short circuit between VCC and GND with CRITICAL severity', () => {
    const components: CircuitComponent[] = [
      {
        id: 'batt',
        typeId: 'battery_9v',
        name: '9V Battery',
        category: 'POWER',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: { voltage: 9.0 },
        pins: [
          { id: 'vcc', name: 'Positive', type: 'POWER_VCC' },
          { id: 'gnd', name: 'Negative', type: 'GROUND' },
        ],
      },
    ];

    const wires: WireConnection[] = [
      {
        id: 'short_wire',
        color: '#FF0000',
        fromComponentId: 'batt',
        fromPinId: 'vcc',
        toComponentId: 'batt',
        toPinId: 'gnd',
      },
    ];

    const diags = CircuitDiagnosticEngine.validateCircuit(components, wires);
    const shortDiag = diags.find((d) => d.code === 'SHORT_CIRCUIT');
    assert.ok(shortDiag, 'Short circuit diagnostic should be flagged');
    assert.strictEqual(shortDiag.severity, CircuitDiagnosticSeverity.CRITICAL);
  });

  it('should detect LED connected to power without current-limiting resistor', () => {
    const components: CircuitComponent[] = [
      {
        id: 'uno',
        typeId: 'arduino_uno',
        name: 'Arduino Uno',
        category: 'MICROCONTROLLER',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: {},
        pins: [
          { id: 'pin_5v', name: '5V', type: 'POWER_VCC' },
          { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
        ],
      },
      {
        id: 'led',
        typeId: 'led_red',
        name: 'Red LED',
        category: 'ACTUATOR',
        model3DUrl: '',
        position: [1, 0, 0],
        rotation: [0, 0, 0],
        properties: { forwardVoltage: 2.0 },
        pins: [
          { id: 'anode', name: 'Anode', type: 'DIGITAL_IO' },
          { id: 'cathode', name: 'Cathode', type: 'GROUND' },
        ],
      },
    ];

    const wires: WireConnection[] = [
      {
        id: 'w1',
        color: '#FF0000',
        fromComponentId: 'uno',
        fromPinId: 'pin_5v',
        toComponentId: 'led',
        toPinId: 'anode',
      },
      {
        id: 'w2',
        color: '#000000',
        fromComponentId: 'led',
        fromPinId: 'cathode',
        toComponentId: 'uno',
        toPinId: 'pin_gnd',
      },
    ];

    const diags = CircuitDiagnosticEngine.validateCircuit(components, wires);
    const ledDiag = diags.find((d) => d.code === 'LED_NO_RESISTOR');
    assert.ok(ledDiag, 'LED without resistor warning should be flagged');
    assert.strictEqual(ledDiag.severity, CircuitDiagnosticSeverity.WARNING);
  });

  it('should run Arduino sketch execution cycles and toggle digital pin voltages', () => {
    const runner = new ArduinoSketchRunner();
    runner.reset();

    // Cycle 1: loopCounter = 1 -> odd -> LOW (0.0V)
    runner.executeCycle('blink');
    assert.strictEqual(runner.getPinVoltages().get(13), 0.0);

    // Cycle 2: loopCounter = 2 -> even -> HIGH (5.0V)
    runner.executeCycle('blink');
    assert.strictEqual(runner.getPinVoltages().get(13), 5.0);

    // Check serial buffer logs
    const logs = runner.getSerialLogs();
    assert.ok(logs.some((l) => l.includes('Pin 13 State: HIGH')));
  });

  it('should compile and validate the Push Button + LED Arduino sketch', () => {
    const validCode = `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`;

    const res = ArduinoCompiler.compile(validCode);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.errors.length, 0);
    assert.ok(res.programBytes > 0);
    assert.ok(res.compilerLogs.some((log: string) => log.includes('Compilation successful')));

    // Syntax error test: missing semicolon
    const brokenCode = `void setup() {
  pinMode(2, INPUT)
}
void loop() {}`;
    const brokenRes = ArduinoCompiler.compile(brokenCode);
    assert.strictEqual(brokenRes.success, false);
    assert.ok(brokenRes.errors.length > 0);
  });

  it('should execute the Push Button LED sketch in the Arduino VM and react to button press/release', () => {
    const code = `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`;

    const vm = new ArduinoVirtualMachine();
    const compileResult = vm.loadCode(code);
    assert.strictEqual(compileResult.success, true);
    assert.strictEqual(vm.getPinModes().get(2), 'INPUT_PULLUP');
    assert.strictEqual(vm.getPinModes().get(13), 'OUTPUT');

    // Case 1: Button is NOT pressed (returns HIGH / 1 due to INPUT_PULLUP)
    vm.executeCycle('custom', () => 1);
    assert.strictEqual(vm.getPinVoltages().get(13), 0.0, 'LED should be LOW when button released');

    // Case 2: Button IS pressed (closed to GND -> returns LOW / 0)
    vm.executeCycle('custom', () => 0);
    assert.strictEqual(vm.getPinVoltages().get(13), 5.0, 'LED should be HIGH when button pressed');

    // Case 3: Button released again -> LED should turn back OFF
    vm.executeCycle('custom', () => 1);
    assert.strictEqual(vm.getPinVoltages().get(13), 0.0, 'LED should be LOW when button released again');
  });

  it('should simulate the complete Tinkercad Push Button LED circuit end-to-end with MNA solver and Arduino VM', () => {
    const solver = new MnaCircuitSolver();
    const vm = new ArduinoVirtualMachine();

    const code = `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`;

    vm.loadCode(code);

    const components: CircuitComponent[] = [
      {
        id: 'arduino_uno_1',
        typeId: 'arduino_uno',
        name: 'Arduino Uno R3',
        category: 'MICROCONTROLLER',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: {},
        pins: [
          { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO' },
          { id: 'pin_d2', name: 'D2', type: 'DIGITAL_IO' },
          { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
        ],
      },
      {
        id: 'breadboard_1',
        typeId: 'breadboard_half',
        name: 'Half-Size Breadboard',
        category: 'PROTOTYPING',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: { tiePoints: 400 },
        pins: [
          { id: 'power_gnd_1', name: 'GND Rail', type: 'GROUND' },
        ],
      },
      {
        id: 'resistor_220_1',
        typeId: 'resistor_220',
        name: '220Ω Resistor',
        category: 'PASSIVE',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: { resistanceOhms: 220 },
        pins: [
          { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO' },
          { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO' },
        ],
      },
      {
        id: 'led_red_1',
        typeId: 'led_red',
        name: 'Red LED',
        category: 'ACTUATOR',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: { forwardVoltage: 2.0 },
        pins: [
          { id: 'anode', name: 'Anode', type: 'DIGITAL_IO' },
          { id: 'cathode', name: 'Cathode', type: 'GROUND' },
        ],
      },
      {
        id: 'button_1',
        typeId: 'push_button',
        name: 'Push Button',
        category: 'PASSIVE',
        model3DUrl: '',
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        properties: { isPressed: false },
        pins: [
          { id: 'pin_1a', name: 'Terminal 1a', type: 'DIGITAL_IO' },
          { id: 'pin_2a', name: 'Terminal 2a', type: 'GROUND' },
        ],
      },
    ];

    const wires: WireConnection[] = [
      { id: 'w1', color: '#39FF6A', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d13', toComponentId: 'resistor_220_1', toPinId: 'lead_1' },
      { id: 'w2', color: '#FF9A1F', fromComponentId: 'resistor_220_1', fromPinId: 'lead_2', toComponentId: 'led_red_1', toPinId: 'anode' },
      { id: 'w3', color: '#222222', fromComponentId: 'led_red_1', fromPinId: 'cathode', toComponentId: 'breadboard_1', toPinId: 'power_gnd_1' },
      { id: 'w4', color: '#222222', fromComponentId: 'breadboard_1', fromPinId: 'power_gnd_1', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd' },
      { id: 'w5', color: '#0A84FF', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d2', toComponentId: 'button_1', toPinId: 'pin_1a' },
      { id: 'w6', color: '#222222', fromComponentId: 'button_1', fromPinId: 'pin_2a', toComponentId: 'breadboard_1', toPinId: 'power_gnd_1' },
    ];

    // STEP 1: Button is NOT pressed
    const preResult1 = solver.solveStep(components, wires, vm.getPinVoltages(), vm.getPinModes());
    const pinReader1 = (pinNum: number) => {
      const pinKey = `arduino_uno_1:pin_d${pinNum}`;
      return (preResult1.pinStates.get(pinKey)?.voltage ?? 5.0) < 1.5 ? 0 : 1;
    };
    vm.executeCycle('custom', pinReader1);
    const postResult1 = solver.solveStep(components, wires, vm.getPinVoltages(), vm.getPinModes());
    const ledOutput1 = postResult1.componentOutputs.get('led_red_1');
    assert.strictEqual(ledOutput1?.state.isOn, false, 'LED must be OFF when button is released');

    // STEP 2: Button IS pressed (isPressed = true)
    components.find((c) => c.id === 'button_1')!.properties.isPressed = true;
    const preResult2 = solver.solveStep(components, wires, vm.getPinVoltages(), vm.getPinModes());
    const pinReader2 = (pinNum: number) => {
      const pinKey = `arduino_uno_1:pin_d${pinNum}`;
      return (preResult2.pinStates.get(pinKey)?.voltage ?? 5.0) < 1.5 ? 0 : 1;
    };
    vm.executeCycle('custom', pinReader2);
    const postResult2 = solver.solveStep(components, wires, vm.getPinVoltages(), vm.getPinModes());
    const ledOutput2 = postResult2.componentOutputs.get('led_red_1');
    assert.strictEqual(ledOutput2?.state.isOn, true, 'LED must be ON when button is pressed');
    assert.ok((ledOutput2?.state.brightness || 0) > 0.5, 'LED must glow with high brightness');
    assert.ok((ledOutput2?.state.currentMa || 0) > 10, 'LED forward current must be ~13.6mA through 220Ω resistor');

    // STEP 3: Button released again
    components.find((c) => c.id === 'button_1')!.properties.isPressed = false;
    const preResult3 = solver.solveStep(components, wires, vm.getPinVoltages(), vm.getPinModes());
    const pinReader3 = (pinNum: number) => {
      const pinKey = `arduino_uno_1:pin_d${pinNum}`;
      return (preResult3.pinStates.get(pinKey)?.voltage ?? 5.0) < 1.5 ? 0 : 1;
    };
    vm.executeCycle('custom', pinReader3);
    const postResult3 = solver.solveStep(components, wires, vm.getPinVoltages(), vm.getPinModes());
    const ledOutput3 = postResult3.componentOutputs.get('led_red_1');
    assert.strictEqual(ledOutput3?.state.isOn, false, 'LED must turn back OFF when button is released');
  });
});
