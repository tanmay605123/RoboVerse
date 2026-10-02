import {
  CircuitComponent,
  WireConnection,
  CircuitDiagnosticError,
  CircuitDiagnosticSeverity,
} from '@roboverse/shared';

export interface SimulationNode {
  id: string;
  voltage: number;
  isGround: boolean;
  connectedPinIds: string[];
}

export interface SimulationState {
  time: number; // in seconds
  step: number;
  nodes: Map<string, SimulationNode>;
  componentValues: Map<string, Record<string, any>>;
  errors: CircuitDiagnosticError[];
  isRunning: boolean;
}

export class CircuitDiagnosticEngine {
  /**
   * Run rule-based electrical sanity checks before running full MNA matrices
   */
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

    // 2. Check for direct short circuits (e.g. VCC wired directly to GND)
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

      // If connected to power without a resistor
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
