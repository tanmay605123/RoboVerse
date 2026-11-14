import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MnaCircuitSolver,
  ArduinoSketchRunner,
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
});
