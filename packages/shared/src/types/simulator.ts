import { z } from 'zod';

export type ComponentCategory =
  | 'MICROCONTROLLER'
  | 'PASSIVE'
  | 'ACTUATOR'
  | 'SENSOR'
  | 'DISPLAY'
  | 'POWER'
  | 'COMMUNICATION'
  | 'PROTOTYPING';

export interface PinDefinition {
  id: string;
  name: string;
  type: 'DIGITAL_IO' | 'ANALOG_IN' | 'PWM' | 'POWER_VCC' | 'GROUND' | 'I2C_SDA' | 'I2C_SCL' | 'UART_TX' | 'UART_RX' | 'SPI';
  description?: string;
  position3D?: [number, number, number];
}

export interface CircuitComponent {
  id: string;
  typeId: string;
  name: string;
  category: ComponentCategory;
  model3DUrl: string;
  pins: PinDefinition[];
  properties: Record<string, any>; // e.g. resistance: 220, capacitance: 10uF, ledColor: 'red'
  position: [number, number, number];
  rotation: [number, number, number];
  isLocked?: boolean;
}

export interface WireConnection {
  id: string;
  color: string; // e.g. '#FF3939' (red for 5V), '#000000' (black for GND), '#39FF6A' (green for signal)
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  waypoints?: [number, number, number][];
}

export enum CircuitDiagnosticSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface CircuitDiagnosticError {
  id: string;
  code:
    | 'SHORT_CIRCUIT'
    | 'MISSING_GROUND'
    | 'FLOATING_PIN'
    | 'LED_NO_RESISTOR'
    | 'REVERSED_POLARITY'
    | 'VOLTAGE_EXCEEDED'
    | 'INVALID_PIN_TYPE';
  severity: CircuitDiagnosticSeverity;
  message: string;
  explanation: string;
  affectedComponentIds: string[];
  affectedPinIds?: string[];
  fixSuggestion: string;
}

export interface CircuitProjectSnapshot {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  components: CircuitComponent[];
  wires: WireConnection[];
  arduinoCode?: string;
  thumbnailUrl?: string;
  bom: Array<{
    componentName: string;
    quantity: number;
    estimatedPriceInr: number;
    techsavyyyProductId?: string;
  }>;
}
