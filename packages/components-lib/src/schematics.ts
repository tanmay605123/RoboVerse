/**
 * RoboVerse Component Schematic Symbols (IEEE Std 315-1975 / ANSI Y32.2)
 * Comprehensive Format 3 implementations for all 71 components in the RoboVerse Library.
 * 
 * Standards:
 * - IEEE Std 315-1975 (Graphic Symbols for Electrical and Electronics Diagrams)
 * - ANSI Y32.2 / IEC 60617 Reference Designators
 */

export interface SchematicPortDef {
  pinId: string;
  name: string;
  edge: 'left' | 'right' | 'top' | 'bottom';
  offsetRatio: number; // 0.0 to 1.0 along the edge
  pinNumber?: string;
  isClock?: boolean;
  isInverted?: boolean;
}

export interface ComponentSchematicDef {
  componentId: string;
  prefix: string; // e.g. 'R', 'C', 'D', 'Q', 'U', 'SW', 'M', 'BZ', 'K', 'DS', 'SEN', 'BT'
  symbolType:
    | 'resistor'
    | 'potentiometer'
    | 'capacitor'
    | 'capacitor_polar'
    | 'diode'
    | 'led'
    | 'rgb_led'
    | 'transistor_npn'
    | 'transistor_darlington'
    | 'mosfet_n'
    | 'switch_spst'
    | 'switch_spdt'
    | 'dip_switch'
    | 'battery'
    | 'buzzer'
    | 'motor_dc'
    | 'servo'
    | 'stepper'
    | 'bldc'
    | 'relay'
    | 'ic'
    | 'sensor'
    | 'display'
    | 'breadboard'
    | 'mechanical';
  standard: string;
  defaultRefDes: string;
  ports: SchematicPortDef[];
  renderSvg: (options?: { refDes?: string; value?: string; stroke?: string; fill?: string }) => string;
}

export const COMPONENT_SCHEMATIC_REGISTRY: Record<string, ComponentSchematicDef> = {
  // ==================== 1. MICROCONTROLLERS & BOARDS ====================
  arduino_uno: {
    componentId: 'arduino_uno',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U1',
    ports: [
      { pinId: 'd0', name: 'D0 (RX)', edge: 'right', offsetRatio: 0.1 },
      { pinId: 'd1', name: 'D1 (TX)', edge: 'right', offsetRatio: 0.16 },
      { pinId: 'd2', name: 'D2', edge: 'right', offsetRatio: 0.22 },
      { pinId: 'd3', name: '~D3', edge: 'right', offsetRatio: 0.28 },
      { pinId: 'd4', name: 'D4', edge: 'right', offsetRatio: 0.34 },
      { pinId: 'd5', name: '~D5', edge: 'right', offsetRatio: 0.4 },
      { pinId: 'd6', name: '~D6', edge: 'right', offsetRatio: 0.46 },
      { pinId: 'd7', name: 'D7', edge: 'right', offsetRatio: 0.52 },
      { pinId: 'd8', name: 'D8', edge: 'right', offsetRatio: 0.58 },
      { pinId: 'd9', name: '~D9', edge: 'right', offsetRatio: 0.64 },
      { pinId: 'd10', name: '~D10', edge: 'right', offsetRatio: 0.7 },
      { pinId: 'd11', name: '~D11', edge: 'right', offsetRatio: 0.76 },
      { pinId: 'd12', name: 'D12', edge: 'right', offsetRatio: 0.82 },
      { pinId: 'd13', name: 'D13', edge: 'right', offsetRatio: 0.88 },
      { pinId: '5v', name: '5V', edge: 'left', offsetRatio: 0.15 },
      { pinId: '3v3', name: '3V3', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'vin', name: 'VIN', edge: 'left', offsetRatio: 0.35 },
      { pinId: 'gnd1', name: 'GND', edge: 'left', offsetRatio: 0.45 },
      { pinId: 'a0', name: 'A0', edge: 'left', offsetRatio: 0.6 },
      { pinId: 'a1', name: 'A1', edge: 'left', offsetRatio: 0.68 },
      { pinId: 'a2', name: 'A2', edge: 'left', offsetRatio: 0.76 },
      { pinId: 'a3', name: 'A3', edge: 'left', offsetRatio: 0.84 },
      { pinId: 'a4', name: 'A4/SDA', edge: 'left', offsetRatio: 0.9 },
      { pinId: 'a5', name: 'A5/SCL', edge: 'left', offsetRatio: 0.96 },
    ],
    renderSvg: ({ refDes = 'U1', value = 'ATmega328P' } = {}) => `
      <g class="schem-ic-uno">
        <rect x="25" y="10" width="130" height="180" rx="2" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="90" y="32" font-size="11" font-weight="900" text-anchor="middle" fill="#0F172A">${refDes}</text>
        <text x="90" y="46" font-size="8" font-family="monospace" text-anchor="middle" fill="#475569">${value}</text>
        <line x1="5" y1="37" x2="25" y2="37" stroke="#1E293B" stroke-width="1.5" />
        <text x="28" y="40" font-size="7" font-family="monospace">5V</text>
        <line x1="5" y1="91" x2="25" y2="91" stroke="#1E293B" stroke-width="1.5" />
        <text x="28" y="94" font-size="7" font-family="monospace">GND</text>
        <line x1="5" y1="120" x2="25" y2="120" stroke="#1E293B" stroke-width="1.5" />
        <text x="28" y="123" font-size="7" font-family="monospace">A0</text>
        <line x1="155" y1="168" x2="175" y2="168" stroke="#1E293B" stroke-width="1.5" />
        <text x="130" y="171" font-size="7" font-family="monospace">D13</text>
      </g>
    `,
  },

  arduino_nano: {
    componentId: 'arduino_nano',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U2',
    ports: [
      { pinId: 'd13', name: 'D13', edge: 'right', offsetRatio: 0.2 },
      { pinId: 'd2', name: 'D2', edge: 'right', offsetRatio: 0.5 },
      { pinId: '5v', name: '5V', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.8 },
    ],
    renderSvg: ({ refDes = 'U2', value = 'Nano V3' } = {}) => `
      <g class="schem-ic-nano">
        <rect x="20" y="10" width="100" height="120" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="70" y="30" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="70" y="44" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  arduino_mega: {
    componentId: 'arduino_mega',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U3',
    ports: [
      { pinId: 'd13', name: 'D13', edge: 'right', offsetRatio: 0.2 },
      { pinId: '5v', name: '5V', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.8 },
    ],
    renderSvg: ({ refDes = 'U3', value = 'ATmega2560' } = {}) => `
      <g class="schem-ic-mega">
        <rect x="20" y="10" width="120" height="160" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="80" y="32" font-size="11" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="80" y="46" font-size="8" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  esp32: {
    componentId: 'esp32',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U4',
    ports: [
      { pinId: '3v3', name: '3V3', edge: 'left', offsetRatio: 0.15 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.85 },
      { pinId: 'd2', name: 'IO2', edge: 'right', offsetRatio: 0.3 },
    ],
    renderSvg: ({ refDes = 'U4', value = 'ESP32-WROOM' } = {}) => `
      <g class="schem-ic-esp32">
        <rect x="20" y="10" width="110" height="140" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="75" y="32" font-size="11" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="75" y="46" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  rpi_pico: {
    componentId: 'rpi_pico',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U5',
    ports: [
      { pinId: '3v3', name: '3V3', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.8 },
      { pinId: 'gp0', name: 'GP0', edge: 'right', offsetRatio: 0.2 },
    ],
    renderSvg: ({ refDes = 'U5', value = 'RP2040 Pico' } = {}) => `
      <g class="schem-ic-pico">
        <rect x="20" y="10" width="100" height="130" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="70" y="30" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="70" y="44" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  microbit: {
    componentId: 'microbit',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U6',
    ports: [
      { pinId: '3v', name: '3V', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.8 },
      { pinId: 'p0', name: 'P0', edge: 'right', offsetRatio: 0.3 },
    ],
    renderSvg: ({ refDes = 'U6', value = 'micro:bit v2' } = {}) => `
      <g class="schem-ic-microbit">
        <rect x="20" y="10" width="100" height="120" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="70" y="30" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="70" y="44" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  // ==================== 2. PROTOTYPING ====================
  breadboard_small: {
    componentId: 'breadboard_small',
    prefix: 'J',
    symbolType: 'breadboard',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'J1',
    ports: [
      { pinId: 'vcc_bus', name: 'VCC_BUS', edge: 'top', offsetRatio: 0.3 },
      { pinId: 'gnd_bus', name: 'GND_BUS', edge: 'top', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'J1', value = 'Breadboard 400' } = {}) => `
      <g class="schem-breadboard">
        <rect x="15" y="15" width="110" height="50" rx="3" fill="#F1F5F9" stroke="#64748B" stroke-dasharray="3,3" stroke-width="1.5" />
        <text x="70" y="38" font-size="8" font-weight="bold" text-anchor="middle" fill="#334155">${refDes}: ${value}</text>
      </g>
    `,
  },

  breadboard_large: {
    componentId: 'breadboard_large',
    prefix: 'J',
    symbolType: 'breadboard',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'J2',
    ports: [
      { pinId: 'vcc_bus', name: 'VCC_BUS', edge: 'top', offsetRatio: 0.3 },
      { pinId: 'gnd_bus', name: 'GND_BUS', edge: 'top', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'J2', value = 'Breadboard 830' } = {}) => `
      <g class="schem-breadboard-large">
        <rect x="15" y="15" width="130" height="50" rx="3" fill="#F1F5F9" stroke="#64748B" stroke-dasharray="3,3" stroke-width="1.5" />
        <text x="80" y="38" font-size="8" font-weight="bold" text-anchor="middle" fill="#334155">${refDes}: ${value}</text>
      </g>
    `,
  },

  power_supply_module: {
    componentId: 'power_supply_module',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U7',
    ports: [
      { pinId: 'vin', name: 'VIN', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.7 },
      { pinId: '5v', name: '5V', edge: 'right', offsetRatio: 0.3 },
      { pinId: '3v3', name: '3V3', edge: 'right', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'U7', value = 'MB102 5V/3V3' } = {}) => `
      <g class="schem-psu">
        <rect x="20" y="10" width="90" height="70" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="65" y="32" font-size="9" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="65" y="46" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  // ==================== 3. RESISTORS & PASSIVES ====================
  resistor_220: {
    componentId: 'resistor_220',
    prefix: 'R',
    symbolType: 'resistor',
    standard: 'IEEE Std 315-1975 (Clause 4.1)',
    defaultRefDes: 'R1',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'R1', value = '220Ω' } = {}) => `
      <g class="schem-resistor">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <path d="M 25,20 L 30,10 L 40,30 L 50,10 L 60,30 L 70,10 L 80,30 L 85,20 L 105,20" fill="none" stroke="#1E293B" stroke-width="2" stroke-linejoin="round" />
        <text x="55" y="6" font-size="8" font-weight="900" text-anchor="middle" fill="#0F172A">${refDes}</text>
        <text x="55" y="42" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0F172A">${value}</text>
      </g>
    `,
  },

  resistor_1k: {
    componentId: 'resistor_1k',
    prefix: 'R',
    symbolType: 'resistor',
    standard: 'IEEE Std 315-1975 (Clause 4.1)',
    defaultRefDes: 'R2',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'R2', value = '1kΩ' } = {}) => `
      <g class="schem-resistor">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <path d="M 25,20 L 30,10 L 40,30 L 50,10 L 60,30 L 70,10 L 80,30 L 85,20 L 105,20" fill="none" stroke="#1E293B" stroke-width="2" stroke-linejoin="round" />
        <text x="55" y="6" font-size="8" font-weight="900" text-anchor="middle" fill="#0F172A">${refDes}</text>
        <text x="55" y="42" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0F172A">${value}</text>
      </g>
    `,
  },

  resistor_10k: {
    componentId: 'resistor_10k',
    prefix: 'R',
    symbolType: 'resistor',
    standard: 'IEEE Std 315-1975 (Clause 4.1)',
    defaultRefDes: 'R3',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'R3', value = '10kΩ' } = {}) => `
      <g class="schem-resistor">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <path d="M 25,20 L 30,10 L 40,30 L 50,10 L 60,30 L 70,10 L 80,30 L 85,20 L 105,20" fill="none" stroke="#1E293B" stroke-width="2" stroke-linejoin="round" />
        <text x="55" y="6" font-size="8" font-weight="900" text-anchor="middle" fill="#0F172A">${refDes}</text>
        <text x="55" y="42" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0F172A">${value}</text>
      </g>
    `,
  },

  resistor_4k7: {
    componentId: 'resistor_4k7',
    prefix: 'R',
    symbolType: 'resistor',
    standard: 'IEEE Std 315-1975 (Clause 4.1)',
    defaultRefDes: 'R4',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'R4', value = '4.7kΩ' } = {}) => `
      <g class="schem-resistor">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <path d="M 25,20 L 30,10 L 40,30 L 50,10 L 60,30 L 70,10 L 80,30 L 85,20 L 105,20" fill="none" stroke="#1E293B" stroke-width="2" stroke-linejoin="round" />
        <text x="55" y="6" font-size="8" font-weight="900" text-anchor="middle" fill="#0F172A">${refDes}</text>
        <text x="55" y="42" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#0F172A">${value}</text>
      </g>
    `,
  },

  potentiometer: {
    componentId: 'potentiometer',
    prefix: 'VR',
    symbolType: 'potentiometer',
    standard: 'IEEE Std 315-1975 (Clause 4.2)',
    defaultRefDes: 'VR1',
    ports: [
      { pinId: '1', name: 'CCW', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: 'WIPER', edge: 'bottom', offsetRatio: 0.5 },
      { pinId: '3', name: 'CW', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'VR1', value = '10kΩ' } = {}) => `
      <g class="schem-pot">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <path d="M 25,20 L 30,10 L 40,30 L 50,10 L 60,30 L 70,10 L 80,30 L 85,20 L 105,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <!-- Wiper arrow -->
        <line x1="55" y1="36" x2="55" y2="24" stroke="#1E293B" stroke-width="2" />
        <polygon points="55,20 52,25 58,25" fill="#1E293B" />
        <text x="55" y="6" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="55" y="48" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  capacitor_ceramic: {
    componentId: 'capacitor_ceramic',
    prefix: 'C',
    symbolType: 'capacitor',
    standard: 'IEEE Std 315-1975 (Clause 4.3)',
    defaultRefDes: 'C1',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'C1', value = '100nF' } = {}) => `
      <g class="schem-cap">
        <line x1="5" y1="20" x2="35" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="35" y1="8" x2="35" y2="32" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="8" x2="45" y2="32" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="75" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="40" y="5" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="40" y="44" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  capacitor_electrolytic: {
    componentId: 'capacitor_electrolytic',
    prefix: 'C',
    symbolType: 'capacitor_polar',
    standard: 'IEEE Std 315-1975 (Clause 4.3.2)',
    defaultRefDes: 'C2',
    ports: [
      { pinId: 'pos', name: '+', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'C2', value = '100µF' } = {}) => `
      <g class="schem-cap-polar">
        <line x1="5" y1="20" x2="35" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="35" y1="8" x2="35" y2="32" stroke="#1E293B" stroke-width="2.5" />
        <path d="M 45,8 Q 41,20 45,32" fill="none" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="75" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="28" y="14" font-size="7" font-weight="bold">+</text>
        <text x="40" y="5" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="40" y="44" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  diode_1n4007: {
    componentId: 'diode_1n4007',
    prefix: 'D',
    symbolType: 'diode',
    standard: 'IEEE Std 315-1975 (Clause 8.1)',
    defaultRefDes: 'D1',
    ports: [
      { pinId: 'a', name: 'A', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'k', name: 'K', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'D1', value = '1N4007' } = {}) => `
      <g class="schem-diode">
        <line x1="5" y1="20" x2="30" y2="20" stroke="#1E293B" stroke-width="2" />
        <polygon points="30,10 30,30 45,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="10" x2="45" y2="30" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="38" y="7" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="38" y="42" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  transistor_2n2222: {
    componentId: 'transistor_2n2222',
    prefix: 'Q',
    symbolType: 'transistor_npn',
    standard: 'IEEE Std 315-1975 (Clause 8.6)',
    defaultRefDes: 'Q1',
    ports: [
      { pinId: 'b', name: 'B', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'c', name: 'C', edge: 'top', offsetRatio: 0.7 },
      { pinId: 'e', name: 'E', edge: 'bottom', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'Q1', value = '2N2222 NPN' } = {}) => `
      <g class="schem-npn">
        <circle cx="35" cy="25" r="18" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <line x1="5" y1="25" x2="25" y2="25" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="15" x2="25" y2="35" stroke="#1E293B" stroke-width="2.5" />
        <!-- Collector -->
        <line x1="25" y1="18" x2="45" y2="10" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="10" x2="45" y2="2" stroke="#1E293B" stroke-width="2" />
        <!-- Emitter with arrow -->
        <line x1="25" y1="32" x2="45" y2="40" stroke="#1E293B" stroke-width="2" />
        <polygon points="45,40 38,36 41,33" fill="#1E293B" />
        <line x1="45" y1="40" x2="45" y2="48" stroke="#1E293B" stroke-width="2" />
        <text x="56" y="16" font-size="8" font-weight="bold">${refDes}</text>
        <text x="56" y="28" font-size="6" font-family="monospace">${value}</text>
      </g>
    `,
  },

  transistor_tip120: {
    componentId: 'transistor_tip120',
    prefix: 'Q',
    symbolType: 'transistor_darlington',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'Q2',
    ports: [
      { pinId: 'b', name: 'B', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'c', name: 'C', edge: 'top', offsetRatio: 0.7 },
      { pinId: 'e', name: 'E', edge: 'bottom', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'Q2', value = 'TIP120 Darlington' } = {}) => `
      <g class="schem-darlington">
        <circle cx="35" cy="25" r="18" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <line x1="5" y1="25" x2="25" y2="25" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="15" x2="25" y2="35" stroke="#1E293B" stroke-width="2.5" />
        <line x1="25" y1="18" x2="45" y2="10" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="32" x2="45" y2="40" stroke="#1E293B" stroke-width="2" />
        <polygon points="45,40 38,36 41,33" fill="#1E293B" />
        <text x="56" y="16" font-size="8" font-weight="bold">${refDes}</text>
        <text x="56" y="28" font-size="6" font-family="monospace">${value}</text>
      </g>
    `,
  },

  mosfet_irfz44n: {
    componentId: 'mosfet_irfz44n',
    prefix: 'Q',
    symbolType: 'mosfet_n',
    standard: 'IEEE Std 315-1975 (Clause 8.7)',
    defaultRefDes: 'Q3',
    ports: [
      { pinId: 'g', name: 'G', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'd', name: 'D', edge: 'top', offsetRatio: 0.7 },
      { pinId: 's', name: 'S', edge: 'bottom', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'Q3', value = 'IRFZ44N N-Ch' } = {}) => `
      <g class="schem-mosfet">
        <circle cx="35" cy="25" r="18" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <line x1="5" y1="30" x2="22" y2="30" stroke="#1E293B" stroke-width="2" />
        <line x1="22" y1="14" x2="22" y2="36" stroke="#1E293B" stroke-width="2.5" />
        <!-- Drain & Source channel lines -->
        <line x1="28" y1="14" x2="28" y2="18" stroke="#1E293B" stroke-width="2" />
        <line x1="28" y1="23" x2="28" y2="27" stroke="#1E293B" stroke-width="2" />
        <line x1="28" y1="32" x2="28" y2="36" stroke="#1E293B" stroke-width="2" />
        <line x1="28" y1="16" x2="45" y2="16" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="16" x2="45" y2="2" stroke="#1E293B" stroke-width="2" />
        <line x1="28" y1="34" x2="45" y2="34" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="34" x2="45" y2="48" stroke="#1E293B" stroke-width="2" />
        <!-- Inward channel arrow -->
        <line x1="28" y1="25" x2="45" y2="25" stroke="#1E293B" stroke-width="1.5" />
        <polygon points="28,25 34,22 34,28" fill="#1E293B" />
        <line x1="45" y1="25" x2="45" y2="34" stroke="#1E293B" stroke-width="1.5" />
        <text x="56" y="16" font-size="8" font-weight="bold">${refDes}</text>
        <text x="56" y="28" font-size="6" font-family="monospace">${value}</text>
      </g>
    `,
  },

  pushbutton: {
    componentId: 'pushbutton',
    prefix: 'SW',
    symbolType: 'switch_spst',
    standard: 'IEEE Std 315-1975 (Clause 4.23)',
    defaultRefDes: 'SW1',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'SW1', value = 'Pushbutton NO' } = {}) => `
      <g class="schem-btn">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <circle cx="27" cy="20" r="2.5" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <circle cx="53" cy="20" r="2.5" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <line x1="55" y1="20" x2="75" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="14" x2="55" y2="14" stroke="#1E293B" stroke-width="2" />
        <line x1="40" y1="14" x2="40" y2="4" stroke="#1E293B" stroke-width="1.5" />
        <line x1="34" y1="4" x2="46" y2="4" stroke="#1E293B" stroke-width="2" />
        <text x="40" y="34" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  slideswitch: {
    componentId: 'slideswitch',
    prefix: 'SW',
    symbolType: 'switch_spdt',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SW2',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.3 },
      { pinId: '2', name: 'COM', edge: 'right', offsetRatio: 0.5 },
      { pinId: '3', name: '2', edge: 'left', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SW2', value = 'SPDT Switch' } = {}) => `
      <g class="schem-spdt">
        <line x1="5" y1="12" x2="25" y2="12" stroke="#1E293B" stroke-width="2" />
        <line x1="5" y1="28" x2="25" y2="28" stroke="#1E293B" stroke-width="2" />
        <circle cx="27" cy="12" r="2.5" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <circle cx="27" cy="28" r="2.5" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <circle cx="53" cy="20" r="2.5" fill="#1E293B" />
        <line x1="53" y1="20" x2="28" y2="13" stroke="#1E293B" stroke-width="2" />
        <line x1="55" y1="20" x2="75" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="40" y="42" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  dip_switch_4: {
    componentId: 'dip_switch_4',
    prefix: 'SW',
    symbolType: 'dip_switch',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SW3',
    ports: [
      { pinId: '1a', name: '1A', edge: 'left', offsetRatio: 0.2 },
      { pinId: '1b', name: '1B', edge: 'right', offsetRatio: 0.2 },
    ],
    renderSvg: ({ refDes = 'SW3', value = '4-Pos DIP' } = {}) => `
      <g class="schem-dip">
        <rect x="15" y="10" width="70" height="60" fill="#F8FAFC" stroke="#1E293B" stroke-width="1.5" />
        <text x="50" y="26" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="50" y="40" font-size="6" font-family="monospace" text-anchor="middle">4-CH DIP</text>
      </g>
    `,
  },

  // ==================== 4. LEDS & OPTOELECTRONICS ====================
  led_red: {
    componentId: 'led_red',
    prefix: 'D',
    symbolType: 'led',
    standard: 'IEEE Std 315-1975 (Clause 8.5)',
    defaultRefDes: 'D2',
    ports: [
      { pinId: 'anode', name: 'A', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'cathode', name: 'K', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'D2', value = 'Red LED' } = {}) => `
      <g class="schem-led">
        <line x1="5" y1="20" x2="30" y2="20" stroke="#1E293B" stroke-width="2" />
        <polygon points="30,10 30,30 45,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="10" x2="45" y2="30" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <!-- Emission rays -->
        <line x1="38" y1="11" x2="48" y2="3" stroke="#DC2626" stroke-width="1.5" />
        <polygon points="48,3 44,4 46,7" fill="#DC2626" />
        <line x1="44" y1="14" x2="54" y2="6" stroke="#DC2626" stroke-width="1.5" />
        <polygon points="54,6 50,7 52,10" fill="#DC2626" />
        <text x="38" y="42" font-size="7" font-weight="bold" text-anchor="middle">${refDes}: ${value}</text>
      </g>
    `,
  },

  led_green: {
    componentId: 'led_green',
    prefix: 'D',
    symbolType: 'led',
    standard: 'IEEE Std 315-1975 (Clause 8.5)',
    defaultRefDes: 'D3',
    ports: [
      { pinId: 'anode', name: 'A', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'cathode', name: 'K', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'D3', value = 'Green LED' } = {}) => `
      <g class="schem-led">
        <line x1="5" y1="20" x2="30" y2="20" stroke="#1E293B" stroke-width="2" />
        <polygon points="30,10 30,30 45,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="10" x2="45" y2="30" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="38" y1="11" x2="48" y2="3" stroke="#16A34A" stroke-width="1.5" />
        <polygon points="48,3 44,4 46,7" fill="#16A34A" />
        <text x="38" y="42" font-size="7" font-weight="bold" text-anchor="middle">${refDes}: ${value}</text>
      </g>
    `,
  },

  led_yellow: {
    componentId: 'led_yellow',
    prefix: 'D',
    symbolType: 'led',
    standard: 'IEEE Std 315-1975 (Clause 8.5)',
    defaultRefDes: 'D4',
    ports: [
      { pinId: 'anode', name: 'A', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'cathode', name: 'K', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'D4', value = 'Yellow LED' } = {}) => `
      <g class="schem-led">
        <line x1="5" y1="20" x2="30" y2="20" stroke="#1E293B" stroke-width="2" />
        <polygon points="30,10 30,30 45,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="10" x2="45" y2="30" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="38" y1="11" x2="48" y2="3" stroke="#CA8A04" stroke-width="1.5" />
        <polygon points="48,3 44,4 46,7" fill="#CA8A04" />
        <text x="38" y="42" font-size="7" font-weight="bold" text-anchor="middle">${refDes}: ${value}</text>
      </g>
    `,
  },

  led_blue: {
    componentId: 'led_blue',
    prefix: 'D',
    symbolType: 'led',
    standard: 'IEEE Std 315-1975 (Clause 8.5)',
    defaultRefDes: 'D5',
    ports: [
      { pinId: 'anode', name: 'A', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'cathode', name: 'K', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'D5', value = 'Blue LED' } = {}) => `
      <g class="schem-led">
        <line x1="5" y1="20" x2="30" y2="20" stroke="#1E293B" stroke-width="2" />
        <polygon points="30,10 30,30 45,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="10" x2="45" y2="30" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="38" y1="11" x2="48" y2="3" stroke="#2563EB" stroke-width="1.5" />
        <polygon points="48,3 44,4 46,7" fill="#2563EB" />
        <text x="38" y="42" font-size="7" font-weight="bold" text-anchor="middle">${refDes}: ${value}</text>
      </g>
    `,
  },

  led_white: {
    componentId: 'led_white',
    prefix: 'D',
    symbolType: 'led',
    standard: 'IEEE Std 315-1975 (Clause 8.5)',
    defaultRefDes: 'D6',
    ports: [
      { pinId: 'anode', name: 'A', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'cathode', name: 'K', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'D6', value = 'White LED' } = {}) => `
      <g class="schem-led">
        <line x1="5" y1="20" x2="30" y2="20" stroke="#1E293B" stroke-width="2" />
        <polygon points="30,10 30,30 45,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="45" y1="10" x2="45" y2="30" stroke="#1E293B" stroke-width="2.5" />
        <line x1="45" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="38" y1="11" x2="48" y2="3" stroke="#64748B" stroke-width="1.5" />
        <polygon points="48,3 44,4 46,7" fill="#64748B" />
        <text x="38" y="42" font-size="7" font-weight="bold" text-anchor="middle">${refDes}: ${value}</text>
      </g>
    `,
  },

  led_rgb: {
    componentId: 'led_rgb',
    prefix: 'D',
    symbolType: 'rgb_led',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'D7',
    ports: [
      { pinId: 'r', name: 'RED', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'g', name: 'GREEN', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'b', name: 'BLUE', edge: 'left', offsetRatio: 0.75 },
      { pinId: 'cathode', name: 'COM_K', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'D7', value = 'RGB CC' } = {}) => `
      <g class="schem-rgb-led">
        <rect x="20" y="8" width="55" height="50" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="1.5" />
        <text x="47" y="24" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="47" y="38" font-size="7" font-family="monospace" text-anchor="middle">RGB LED</text>
      </g>
    `,
  },

  led_strip_ws2812: {
    componentId: 'led_strip_ws2812',
    prefix: 'DS',
    symbolType: 'display',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'DS1',
    ports: [
      { pinId: 'din', name: 'DIN', edge: 'left', offsetRatio: 0.3 },
      { pinId: '5v', name: '5V', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'bottom', offsetRatio: 0.5 },
      { pinId: 'dout', name: 'DOUT', edge: 'right', offsetRatio: 0.3 },
    ],
    renderSvg: ({ refDes = 'DS1', value = 'WS2812B 8-LED' } = {}) => `
      <g class="schem-ws2812">
        <rect x="15" y="10" width="85" height="45" fill="#F8FAFC" stroke="#1E293B" stroke-width="1.5" />
        <text x="57" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="42" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  lcd_16x2_i2c: {
    componentId: 'lcd_16x2_i2c',
    prefix: 'DS',
    symbolType: 'display',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'DS2',
    ports: [
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.4 },
      { pinId: 'sda', name: 'SDA', edge: 'left', offsetRatio: 0.6 },
      { pinId: 'scl', name: 'SCL', edge: 'left', offsetRatio: 0.8 },
    ],
    renderSvg: ({ refDes = 'DS2', value = 'LCD 16x2 I2C' } = {}) => `
      <g class="schem-lcd">
        <rect x="20" y="10" width="100" height="70" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <rect x="30" y="22" width="80" height="32" fill="#E2E8F0" stroke="#94A3B8" />
        <text x="70" y="42" font-size="8" font-family="monospace" font-weight="bold" text-anchor="middle">16x2 I2C</text>
        <text x="70" y="72" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  oled_096_i2c: {
    componentId: 'oled_096_i2c',
    prefix: 'DS',
    symbolType: 'display',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'DS3',
    ports: [
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.4 },
      { pinId: 'scl', name: 'SCL', edge: 'left', offsetRatio: 0.6 },
      { pinId: 'sda', name: 'SDA', edge: 'left', offsetRatio: 0.8 },
    ],
    renderSvg: ({ refDes = 'DS3', value = '0.96" OLED 128x64' } = {}) => `
      <g class="schem-oled">
        <rect x="20" y="10" width="90" height="70" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <rect x="30" y="24" width="70" height="36" fill="#0F172A" />
        <text x="65" y="45" font-size="7" font-family="monospace" fill="#38BDF8" text-anchor="middle">OLED 128x64</text>
        <text x="65" y="72" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  seven_segment_1digit: {
    componentId: 'seven_segment_1digit',
    prefix: 'DS',
    symbolType: 'display',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'DS4',
    ports: [
      { pinId: 'com', name: 'COM', edge: 'bottom', offsetRatio: 0.5 },
      { pinId: 'a', name: 'A', edge: 'top', offsetRatio: 0.2 },
      { pinId: 'b', name: 'B', edge: 'right', offsetRatio: 0.2 },
    ],
    renderSvg: ({ refDes = 'DS4', value = '7-Segment 1-Digit' } = {}) => `
      <g class="schem-7seg">
        <rect x="20" y="10" width="70" height="80" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="55" y="55" font-size="32" font-weight="900" text-anchor="middle" fill="#EF4444">8</text>
        <text x="55" y="82" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  seven_segment_4digit: {
    componentId: 'seven_segment_4digit',
    prefix: 'DS',
    symbolType: 'display',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'DS5',
    ports: [
      { pinId: 'clk', name: 'CLK', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'dio', name: 'DIO', edge: 'left', offsetRatio: 0.7 },
      { pinId: 'vcc', name: 'VCC', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'DS5', value = 'TM1637 4-Digit' } = {}) => `
      <g class="schem-tm1637">
        <rect x="15" y="10" width="110" height="50" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="70" y="36" font-size="16" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#EF4444">88:88</text>
        <text x="70" y="54" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  // ==================== 5. BUZZERS & ACTUATORS ====================
  buzzer_active: {
    componentId: 'buzzer_active',
    prefix: 'BZ',
    symbolType: 'buzzer',
    standard: 'IEEE Std 315-1975 (Clause 13.1)',
    defaultRefDes: 'BZ1',
    ports: [
      { pinId: 'pos', name: '+', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'BZ1', value = 'Active Buzzer 5V' } = {}) => `
      <g class="schem-buzzer">
        <path d="M 25,10 A 18,18 0 0,1 25,46 Z" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="10" x2="25" y2="46" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="18" x2="5" y2="18" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="38" x2="5" y2="38" stroke="#1E293B" stroke-width="2" />
        <text x="48" y="24" font-size="8" font-weight="bold">${refDes}</text>
        <text x="48" y="36" font-size="6" font-family="monospace">${value}</text>
      </g>
    `,
  },

  buzzer_piezo: {
    componentId: 'buzzer_piezo',
    prefix: 'BZ',
    symbolType: 'buzzer',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'BZ2',
    ports: [
      { pinId: 'pos', name: '+', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'BZ2', value = 'Piezo Transducer' } = {}) => `
      <g class="schem-piezo">
        <path d="M 25,10 A 18,18 0 0,1 25,46 Z" fill="none" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="10" x2="25" y2="46" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="18" x2="5" y2="18" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="38" x2="5" y2="38" stroke="#1E293B" stroke-width="2" />
        <text x="48" y="24" font-size="8" font-weight="bold">${refDes}</text>
        <text x="48" y="36" font-size="6" font-family="monospace">${value}</text>
      </g>
    `,
  },

  servo_sg90: {
    componentId: 'servo_sg90',
    prefix: 'M',
    symbolType: 'servo',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'M1',
    ports: [
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'vcc', name: '5V', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'pwm', name: 'PWM', edge: 'left', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'M1', value = 'SG90 Servo' } = {}) => `
      <g class="schem-servo">
        <rect x="25" y="10" width="70" height="60" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <circle cx="60" cy="40" r="16" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <text x="60" y="44" font-size="12" font-weight="900" text-anchor="middle">M</text>
        <text x="60" y="24" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="60" y="65" font-size="6" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  servo_mg90s: {
    componentId: 'servo_mg90s',
    prefix: 'M',
    symbolType: 'servo',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'M2',
    ports: [
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'vcc', name: '5V', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'pwm', name: 'PWM', edge: 'left', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'M2', value = 'MG90S Metal Servo' } = {}) => `
      <g class="schem-servo">
        <rect x="25" y="10" width="70" height="60" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <circle cx="60" cy="40" r="16" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <text x="60" y="44" font-size="12" font-weight="900" text-anchor="middle">M</text>
        <text x="60" y="24" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  servo_mg996r: {
    componentId: 'servo_mg996r',
    prefix: 'M',
    symbolType: 'servo',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'M3',
    ports: [
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'vcc', name: '6V', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'pwm', name: 'PWM', edge: 'left', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'M3', value = 'MG996R High Torque' } = {}) => `
      <g class="schem-servo">
        <rect x="25" y="10" width="75" height="65" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <circle cx="62" cy="42" r="18" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <text x="62" y="47" font-size="13" font-weight="900" text-anchor="middle">M</text>
        <text x="62" y="25" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  dc_motor_gear: {
    componentId: 'dc_motor_gear',
    prefix: 'M',
    symbolType: 'motor_dc',
    standard: 'IEEE Std 315-1975 (Clause 13.5)',
    defaultRefDes: 'M4',
    ports: [
      { pinId: 'pos', name: '+', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'M4', value = 'TT Gearmotor' } = {}) => `
      <g class="schem-dcmotor">
        <line x1="5" y1="25" x2="25" y2="25" stroke="#1E293B" stroke-width="2" />
        <circle cx="45" cy="25" r="18" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="45" y="31" font-size="14" font-weight="900" text-anchor="middle">M</text>
        <line x1="65" y1="25" x2="85" y2="25" stroke="#1E293B" stroke-width="2" />
        <text x="45" y="52" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  dc_motor_toy: {
    componentId: 'dc_motor_toy',
    prefix: 'M',
    symbolType: 'motor_dc',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'M5',
    ports: [
      { pinId: 'pos', name: '+', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'M5', value = 'DC 3-6V Motor' } = {}) => `
      <g class="schem-dcmotor">
        <line x1="5" y1="25" x2="25" y2="25" stroke="#1E293B" stroke-width="2" />
        <circle cx="45" cy="25" r="18" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="45" y="31" font-size="14" font-weight="900" text-anchor="middle">M</text>
        <line x1="65" y1="25" x2="85" y2="25" stroke="#1E293B" stroke-width="2" />
        <text x="45" y="52" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  motor_driver_l298n: {
    componentId: 'motor_driver_l298n',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U8',
    ports: [
      { pinId: 'in1', name: 'IN1', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'in2', name: 'IN2', edge: 'left', offsetRatio: 0.4 },
      { pinId: 'ena', name: 'ENA', edge: 'left', offsetRatio: 0.6 },
      { pinId: 'out1', name: 'OUT1', edge: 'right', offsetRatio: 0.3 },
      { pinId: 'out2', name: 'OUT2', edge: 'right', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'U8', value = 'L298N Dual H-Bridge' } = {}) => `
      <g class="schem-l298n">
        <rect x="20" y="10" width="100" height="90" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="70" y="32" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="70" y="48" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  motor_driver_l293d: {
    componentId: 'motor_driver_l293d',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U9',
    ports: [
      { pinId: '1a', name: '1A', edge: 'left', offsetRatio: 0.3 },
      { pinId: '1y', name: '1Y', edge: 'right', offsetRatio: 0.3 },
    ],
    renderSvg: ({ refDes = 'U9', value = 'L293D DIP-16' } = {}) => `
      <g class="schem-l293d">
        <rect x="20" y="10" width="80" height="80" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="60" y="32" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="60" y="48" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  stepper_28byj48: {
    componentId: 'stepper_28byj48',
    prefix: 'M',
    symbolType: 'stepper',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'M6',
    ports: [
      { pinId: 'in1', name: 'IN1', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'in2', name: 'IN2', edge: 'left', offsetRatio: 0.4 },
      { pinId: 'in3', name: 'IN3', edge: 'left', offsetRatio: 0.6 },
      { pinId: 'in4', name: 'IN4', edge: 'left', offsetRatio: 0.8 },
    ],
    renderSvg: ({ refDes = 'M6', value = '28BYJ-48 Stepper' } = {}) => `
      <g class="schem-stepper">
        <circle cx="50" cy="35" r="24" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="50" y="32" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="50" y="45" font-size="7" font-family="monospace" text-anchor="middle">STEPPER</text>
      </g>
    `,
  },

  stepper_nema17: {
    componentId: 'stepper_nema17',
    prefix: 'M',
    symbolType: 'stepper',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'M7',
    ports: [
      { pinId: 'a1', name: 'A+', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'a2', name: 'A-', edge: 'left', offsetRatio: 0.45 },
      { pinId: 'b1', name: 'B+', edge: 'left', offsetRatio: 0.65 },
      { pinId: 'b2', name: 'B-', edge: 'left', offsetRatio: 0.85 },
    ],
    renderSvg: ({ refDes = 'M7', value = 'NEMA 17 Bipolar' } = {}) => `
      <g class="schem-nema17">
        <circle cx="50" cy="35" r="26" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="50" y="32" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="50" y="45" font-size="7" font-family="monospace" text-anchor="middle">NEMA 17</text>
      </g>
    `,
  },

  bldc_2212: {
    componentId: 'bldc_2212',
    prefix: 'M',
    symbolType: 'bldc',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'M8',
    ports: [
      { pinId: 'u', name: 'U', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'v', name: 'V', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'w', name: 'W', edge: 'left', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'M8', value = 'A2212 1000KV' } = {}) => `
      <g class="schem-bldc">
        <circle cx="50" cy="35" r="26" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="50" y="32" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="50" y="45" font-size="7" font-family="monospace" text-anchor="middle">BLDC 3φ</text>
      </g>
    `,
  },

  esc_30a: {
    componentId: 'esc_30a',
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U10',
    ports: [
      { pinId: 'pwm', name: 'PWM', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'u', name: 'U', edge: 'right', offsetRatio: 0.25 },
      { pinId: 'v', name: 'V', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'w', name: 'W', edge: 'right', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'U10', value = 'ESC 30A BLHeli' } = {}) => `
      <g class="schem-esc">
        <rect x="20" y="10" width="80" height="60" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="60" y="32" font-size="10" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="60" y="46" font-size="7" font-family="monospace" text-anchor="middle">ESC 30A</text>
      </g>
    `,
  },

  propeller_1045: {
    componentId: 'propeller_1045',
    prefix: 'MECH',
    symbolType: 'mechanical',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'MECH1',
    ports: [
      { pinId: 'hub', name: 'HUB', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'MECH1', value = '1045 Propeller' } = {}) => `
      <g class="schem-prop">
        <ellipse cx="50" cy="25" rx="40" ry="8" fill="none" stroke="#1E293B" stroke-dasharray="2,2" stroke-width="1.5" />
        <circle cx="50" cy="25" r="4" fill="#1E293B" />
        <text x="50" y="44" font-size="7" font-weight="bold" text-anchor="middle">${refDes}: 10x4.5</text>
      </g>
    `,
  },

  relay_1ch: {
    componentId: 'relay_1ch',
    prefix: 'K',
    symbolType: 'relay',
    standard: 'IEEE Std 315-1975 (Clause 4.27)',
    defaultRefDes: 'K1',
    ports: [
      { pinId: 'in', name: 'IN', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.7 },
      { pinId: 'com', name: 'COM', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'no', name: 'NO', edge: 'right', offsetRatio: 0.2 },
      { pinId: 'nc', name: 'NC', edge: 'right', offsetRatio: 0.8 },
    ],
    renderSvg: ({ refDes = 'K1', value = '5V SPDT Relay' } = {}) => `
      <g class="schem-relay">
        <rect x="20" y="10" width="80" height="70" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <!-- Coil symbol -->
        <path d="M 28,30 C 33,24 33,36 38,30 C 43,24 43,36 48,30 C 53,24 53,36 58,30" fill="none" stroke="#1E293B" stroke-width="2" />
        <text x="60" y="24" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="60" y="66" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  relay_2ch: {
    componentId: 'relay_2ch',
    prefix: 'K',
    symbolType: 'relay',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'K2',
    ports: [
      { pinId: 'in1', name: 'IN1', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'in2', name: 'IN2', edge: 'left', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'K2', value = '2-Channel Relay' } = {}) => `
      <g class="schem-relay2">
        <rect x="20" y="10" width="90" height="75" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="65" y="30" font-size="9" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="65" y="55" font-size="7" font-family="monospace" text-anchor="middle">2-CH RELAY</text>
      </g>
    `,
  },

  // ==================== 6. SENSORS ====================
  ultrasonic_hcsr04: {
    componentId: 'ultrasonic_hcsr04',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN1',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'trig', name: 'TRIG', edge: 'left', offsetRatio: 0.4 },
      { pinId: 'echo', name: 'ECHO', edge: 'left', offsetRatio: 0.6 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.8 },
    ],
    renderSvg: ({ refDes = 'SEN1', value = 'HC-SR04 Sonar' } = {}) => `
      <g class="schem-sonar">
        <rect x="20" y="10" width="90" height="60" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <circle cx="50" cy="40" r="12" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <circle cx="80" cy="40" r="12" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <text x="65" y="24" font-size="8" font-weight="bold" text-anchor="middle">${refDes}: HC-SR04</text>
      </g>
    `,
  },

  ir_obstacle: {
    componentId: 'ir_obstacle',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN2',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'out', name: 'OUT', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SEN2', value = 'IR Obstacle Sensor' } = {}) => `
      <g class="schem-sensor">
        <rect x="20" y="10" width="70" height="50" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="55" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="55" y="42" font-size="6" font-family="monospace" text-anchor="middle">IR PROX</text>
      </g>
    `,
  },

  ir_line_array_5ch: {
    componentId: 'ir_line_array_5ch',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN3',
    ports: [
      { pinId: 'out1', name: 'L2', edge: 'right', offsetRatio: 0.15 },
      { pinId: 'out2', name: 'L1', edge: 'right', offsetRatio: 0.3 },
      { pinId: 'out3', name: 'MID', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'out4', name: 'R1', edge: 'right', offsetRatio: 0.7 },
      { pinId: 'out5', name: 'R2', edge: 'right', offsetRatio: 0.85 },
    ],
    renderSvg: ({ refDes = 'SEN3', value = '5-Ch Line Tracker' } = {}) => `
      <g class="schem-line-array">
        <rect x="20" y="10" width="85" height="75" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="62" y="30" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="62" y="46" font-size="6" font-family="monospace" text-anchor="middle">5-CH LINE</text>
      </g>
    `,
  },

  pir_motion: {
    componentId: 'pir_motion',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN4',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'out', name: 'OUT', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'SEN4', value = 'HC-SR501 PIR' } = {}) => `
      <g class="schem-pir">
        <rect x="20" y="10" width="75" height="55" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="57" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="44" font-size="6" font-family="monospace" text-anchor="middle">PIR MOTION</text>
      </g>
    `,
  },

  dht11: {
    componentId: 'dht11',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN5',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'data', name: 'DATA', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SEN5', value = 'DHT11 Temp/Hum' } = {}) => `
      <g class="schem-dht11">
        <rect x="20" y="10" width="75" height="55" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="57" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="44" font-size="6" font-family="monospace" text-anchor="middle">DHT11 (T+H)</text>
      </g>
    `,
  },

  dht22: {
    componentId: 'dht22',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN6',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'data', name: 'DATA', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SEN6', value = 'DHT22 High-Precision' } = {}) => `
      <g class="schem-dht22">
        <rect x="20" y="10" width="75" height="55" rx="3" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="57" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="44" font-size="6" font-family="monospace" text-anchor="middle">DHT22 (AM2302)</text>
      </g>
    `,
  },

  ldr_photoresistor: {
    componentId: 'ldr_photoresistor',
    prefix: 'R',
    symbolType: 'resistor',
    standard: 'IEEE Std 315-1975 (Clause 4.1.3)',
    defaultRefDes: 'R5',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'R5', value = 'LDR (CdS)' } = {}) => `
      <g class="schem-ldr">
        <circle cx="55" cy="20" r="18" fill="none" stroke="#1E293B" stroke-width="1.5" />
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <path d="M 25,20 L 30,12 L 40,28 L 50,12 L 60,28 L 70,12 L 80,28 L 85,20 L 105,20" fill="none" stroke="#1E293B" stroke-width="2" />
        <!-- Inward light arrows -->
        <line x1="38" y1="2" x2="48" y2="10" stroke="#1E293B" stroke-width="1.5" />
        <polygon points="48,10 42,9 45,6" fill="#1E293B" />
        <text x="55" y="44" font-size="8" font-weight="bold" text-anchor="middle">${refDes}: LDR</text>
      </g>
    `,
  },

  mpu6050: {
    componentId: 'mpu6050',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN7',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.2 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.4 },
      { pinId: 'scl', name: 'SCL', edge: 'right', offsetRatio: 0.3 },
      { pinId: 'sda', name: 'SDA', edge: 'right', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SEN7', value = 'MPU6050 6-DoF IMU' } = {}) => `
      <g class="schem-imu">
        <rect x="20" y="10" width="80" height="60" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="60" y="30" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="60" y="44" font-size="6" font-family="monospace" text-anchor="middle">6-DOF IMU</text>
      </g>
    `,
  },

  mq2_gas: {
    componentId: 'mq2_gas',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN8',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.75 },
      { pinId: 'aout', name: 'AOUT', edge: 'right', offsetRatio: 0.3 },
      { pinId: 'dout', name: 'DOUT', edge: 'right', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SEN8', value = 'MQ-2 Gas Sensor' } = {}) => `
      <g class="schem-gas">
        <rect x="20" y="10" width="75" height="55" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="57" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="44" font-size="6" font-family="monospace" text-anchor="middle">MQ-2 GAS</text>
      </g>
    `,
  },

  flame_sensor: {
    componentId: 'flame_sensor',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN9',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'dout', name: 'DOUT', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SEN9', value = 'Flame Detector' } = {}) => `
      <g class="schem-flame">
        <rect x="20" y="10" width="75" height="50" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="57" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="42" font-size="6" font-family="monospace" text-anchor="middle">FLAME SENS</text>
      </g>
    `,
  },

  soil_moisture: {
    componentId: 'soil_moisture',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN10',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.3 },
      { pinId: 'aout', name: 'AOUT', edge: 'right', offsetRatio: 0.5 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.7 },
    ],
    renderSvg: ({ refDes = 'SEN10', value = 'Soil Hygrometer' } = {}) => `
      <g class="schem-soil">
        <rect x="20" y="10" width="75" height="50" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="57" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="42" font-size="6" font-family="monospace" text-anchor="middle">SOIL MOIST</text>
      </g>
    `,
  },

  tilt_sensor: {
    componentId: 'tilt_sensor',
    prefix: 'SW',
    symbolType: 'switch_spst',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SW4',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'SW4', value = 'Tilt Ball Switch' } = {}) => `
      <g class="schem-tilt">
        <rect x="20" y="10" width="60" height="40" rx="8" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <circle cx="50" cy="30" r="5" fill="#D97706" />
        <text x="50" y="22" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
      </g>
    `,
  },

  flex_sensor: {
    componentId: 'flex_sensor',
    prefix: 'R',
    symbolType: 'resistor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'R6',
    ports: [
      { pinId: '1', name: '1', edge: 'left', offsetRatio: 0.5 },
      { pinId: '2', name: '2', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'R6', value = '2.2" Flex Sensor' } = {}) => `
      <g class="schem-flex">
        <path d="M 10,25 Q 40,10 70,25" fill="none" stroke="#1E293B" stroke-width="2" stroke-dasharray="3,2" />
        <text x="40" y="40" font-size="8" font-weight="bold" text-anchor="middle">${refDes}: FLEX</text>
      </g>
    `,
  },

  gps_neo6m: {
    componentId: 'gps_neo6m',
    prefix: 'SEN',
    symbolType: 'sensor',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'SEN11',
    ports: [
      { pinId: 'vcc', name: 'VCC', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'rx', name: 'RX', edge: 'right', offsetRatio: 0.35 },
      { pinId: 'tx', name: 'TX', edge: 'right', offsetRatio: 0.65 },
      { pinId: 'gnd', name: 'GND', edge: 'left', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'SEN11', value = 'NEO-6M GPS' } = {}) => `
      <g class="schem-gps">
        <rect x="20" y="10" width="80" height="60" fill="#F8FAFC" stroke="#1E293B" stroke-width="2" />
        <text x="60" y="30" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="60" y="44" font-size="6" font-family="monospace" text-anchor="middle">GPS NEO-6M</text>
      </g>
    `,
  },

  // ==================== 7. BATTERIES & POWER ====================
  battery_9v: {
    componentId: 'battery_9v',
    prefix: 'BT',
    symbolType: 'battery',
    standard: 'IEEE Std 315-1975 (Clause 4.5)',
    defaultRefDes: 'BT1',
    ports: [
      { pinId: 'pos', name: '+', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'BT1', value = '9V 6F22' } = {}) => `
      <g class="schem-battery">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="8" x2="25" y2="32" stroke="#1E293B" stroke-width="3" />
        <line x1="33" y1="12" x2="33" y2="28" stroke="#1E293B" stroke-width="1.5" />
        <line x1="41" y1="8" x2="41" y2="32" stroke="#1E293B" stroke-width="3" />
        <line x1="49" y1="12" x2="49" y2="28" stroke="#1E293B" stroke-width="1.5" />
        <line x1="49" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="20" y="12" font-size="8" font-weight="bold">+</text>
        <text x="37" y="5" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="37" y="42" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  battery_aa_pack_4: {
    componentId: 'battery_aa_pack_4',
    prefix: 'BT',
    symbolType: 'battery',
    standard: 'IEEE Std 315-1975 (Clause 4.5)',
    defaultRefDes: 'BT2',
    ports: [
      { pinId: 'pos', name: '+', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'BT2', value = '6V (4xAA)' } = {}) => `
      <g class="schem-battery">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="8" x2="25" y2="32" stroke="#1E293B" stroke-width="3" />
        <line x1="33" y1="12" x2="33" y2="28" stroke="#1E293B" stroke-width="1.5" />
        <line x1="41" y1="8" x2="41" y2="32" stroke="#1E293B" stroke-width="3" />
        <line x1="49" y1="12" x2="49" y2="28" stroke="#1E293B" stroke-width="1.5" />
        <line x1="49" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="20" y="12" font-size="8" font-weight="bold">+</text>
        <text x="37" y="5" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="37" y="42" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  battery_cr2032: {
    componentId: 'battery_cr2032',
    prefix: 'BT',
    symbolType: 'battery',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'BT3',
    ports: [
      { pinId: 'pos', name: '+', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'BT3', value = '3V CR2032' } = {}) => `
      <g class="schem-battery-cell">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="8" x2="25" y2="32" stroke="#1E293B" stroke-width="3" />
        <line x1="33" y1="12" x2="33" y2="28" stroke="#1E293B" stroke-width="1.5" />
        <line x1="33" y1="20" x2="55" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="20" y="12" font-size="8" font-weight="bold">+</text>
        <text x="29" y="5" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="29" y="42" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  battery_lipo_3s: {
    componentId: 'battery_lipo_3s',
    prefix: 'BT',
    symbolType: 'battery',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'BT4',
    ports: [
      { pinId: 'pos', name: '+', edge: 'top', offsetRatio: 0.5 },
      { pinId: 'neg', name: '-', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'BT4', value = '11.1V 3S LiPo' } = {}) => `
      <g class="schem-battery">
        <line x1="5" y1="20" x2="25" y2="20" stroke="#1E293B" stroke-width="2" />
        <line x1="25" y1="8" x2="25" y2="32" stroke="#1E293B" stroke-width="3" />
        <line x1="33" y1="12" x2="33" y2="28" stroke="#1E293B" stroke-width="1.5" />
        <line x1="41" y1="8" x2="41" y2="32" stroke="#1E293B" stroke-width="3" />
        <line x1="49" y1="12" x2="49" y2="28" stroke="#1E293B" stroke-width="1.5" />
        <line x1="49" y1="20" x2="70" y2="20" stroke="#1E293B" stroke-width="2" />
        <text x="20" y="12" font-size="8" font-weight="bold">+</text>
        <text x="37" y="5" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="37" y="42" font-size="7" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  },

  // ==================== 8. MECHANICAL ====================
  chassis_2wd: {
    componentId: 'chassis_2wd',
    prefix: 'MECH',
    symbolType: 'mechanical',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'MECH2',
    ports: [
      { pinId: 'm_left', name: 'M_L', edge: 'left', offsetRatio: 0.5 },
      { pinId: 'm_right', name: 'M_R', edge: 'right', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'MECH2', value = '2WD Chassis' } = {}) => `
      <g class="schem-chassis">
        <rect x="15" y="10" width="80" height="50" rx="6" fill="#F8FAFC" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="3,2" />
        <text x="55" y="32" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="55" y="46" font-size="6" font-family="monospace" text-anchor="middle">2WD ROBOT</text>
      </g>
    `,
  },

  chassis_4wd: {
    componentId: 'chassis_4wd',
    prefix: 'MECH',
    symbolType: 'mechanical',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'MECH3',
    ports: [
      { pinId: 'm_fl', name: 'M_FL', edge: 'left', offsetRatio: 0.25 },
      { pinId: 'm_bl', name: 'M_BL', edge: 'left', offsetRatio: 0.75 },
      { pinId: 'm_fr', name: 'M_FR', edge: 'right', offsetRatio: 0.25 },
      { pinId: 'm_br', name: 'M_BR', edge: 'right', offsetRatio: 0.75 },
    ],
    renderSvg: ({ refDes = 'MECH3', value = '4WD Rover' } = {}) => `
      <g class="schem-chassis4">
        <rect x="15" y="10" width="85" height="60" rx="6" fill="#F8FAFC" stroke="#1E293B" stroke-width="1.5" stroke-dasharray="3,2" />
        <text x="57" y="32" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="57" y="48" font-size="6" font-family="monospace" text-anchor="middle">4WD ROVER</text>
      </g>
    `,
  },

  robot_gripper: {
    componentId: 'robot_gripper',
    prefix: 'MECH',
    symbolType: 'mechanical',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'MECH4',
    ports: [
      { pinId: 'actuator', name: 'ACTUATOR', edge: 'bottom', offsetRatio: 0.5 },
    ],
    renderSvg: ({ refDes = 'MECH4', value = 'Robot Claw' } = {}) => `
      <g class="schem-gripper">
        <rect x="15" y="10" width="75" height="45" rx="4" fill="#F8FAFC" stroke="#1E293B" stroke-width="1.5" />
        <text x="52" y="28" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="52" y="42" font-size="6" font-family="monospace" text-anchor="middle">GRIPPER</text>
      </g>
    `,
  },
};

/**
 * Retrieve schematic symbol definition for any component ID in the RoboVerse catalog.
 */
export function getComponentSchematic(componentId: string): ComponentSchematicDef {
  const symbol = COMPONENT_SCHEMATIC_REGISTRY[componentId];
  if (symbol) return symbol;

  // Fallback to generic IEEE IC rectangular block
  return {
    componentId,
    prefix: 'U',
    symbolType: 'ic',
    standard: 'IEEE Std 315-1975',
    defaultRefDes: 'U?',
    ports: [],
    renderSvg: ({ refDes = 'U?', value = componentId } = {}) => `
      <g class="schem-fallback">
        <rect x="10" y="10" width="80" height="50" fill="#F8FAFC" stroke="#1E293B" stroke-width="1.5" />
        <text x="50" y="30" font-size="8" font-weight="bold" text-anchor="middle">${refDes}</text>
        <text x="50" y="44" font-size="6" font-family="monospace" text-anchor="middle">${value}</text>
      </g>
    `,
  };
}
