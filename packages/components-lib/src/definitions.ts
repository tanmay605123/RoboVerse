/**
 * RoboVerse Component Definitions & Visual Artworks
 * Original component designs, pin layouts, 2D canvas SVG specifications,
 * and 3D geometry parameters for 46+ electronic components.
 */

export interface ComponentPinDef {
  id: string;
  name: string;
  label?: string;
  type: 'digital' | 'analog' | 'power_5v' | 'power_3v3' | 'gnd' | 'input' | 'output' | 'passive';
  x: number; // local coordinate on canvas
  y: number; // local coordinate on canvas
  description?: string;
}

export interface ComponentVisualDef {
  id: string;
  name: string;
  category: 'basic' | 'microcontroller' | 'sensor' | 'actuator' | 'power' | 'passive' | 'display' | 'ic_driver';
  isFreeTier: boolean;
  width: number;
  height: number;
  rotationSnapAngle: number;
  pins: ComponentPinDef[];
  defaultProperties: Record<string, any>;
  svgIcon: string;
  datasheetUrl?: string;
  priceInr: number;
  description: string;
  model3D: {
    primitive: 'box' | 'cylinder' | 'mesh';
    color: string;
    dimensions: [number, number, number]; // width, height, depth in units
    modelUrl?: string;
  };
}

export const COMPONENT_CATEGORIES = [
  { id: 'all', label: 'All Components', count: 46 },
  { id: 'basic', label: 'Basic Set (Free)', count: 21 },
  { id: 'microcontroller', label: 'Microcontrollers', count: 6 },
  { id: 'sensor', label: 'Sensors', count: 12 },
  { id: 'actuator', label: 'Motors & Actuators', count: 7 },
  { id: 'display', label: 'Displays & Indicators', count: 5 },
  { id: 'power', label: 'Power & Batteries', count: 5 },
  { id: 'starters', label: 'Starter Assemblies', count: 5 },
] as const;

export const COMPONENT_VISUAL_REGISTRY: Record<string, ComponentVisualDef> = {
  arduino_uno: {
    id: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'microcontroller',
    isFreeTier: true,
    width: 220,
    height: 160,
    rotationSnapAngle: 90,
    priceInr: 450,
    description: 'ATmega328P microcontroller board with 14 digital I/O pins, 6 analog inputs, 16 MHz quartz crystal, and USB connection.',
    defaultProperties: {
      voltage: '5V',
      clock: '16MHz',
      flash: '32KB',
    },
    pins: [
      { id: 'd0', name: 'RX<-0', type: 'digital', x: 198, y: 18 },
      { id: 'd1', name: 'TX->1', type: 'digital', x: 186, y: 18 },
      { id: 'd2', name: 'D2', type: 'digital', x: 174, y: 18 },
      { id: 'd3', name: '~D3', type: 'digital', x: 162, y: 18 },
      { id: 'd4', name: 'D4', type: 'digital', x: 150, y: 18 },
      { id: 'd5', name: '~D5', type: 'digital', x: 138, y: 18 },
      { id: 'd6', name: '~D6', type: 'digital', x: 126, y: 18 },
      { id: 'd7', name: 'D7', type: 'digital', x: 114, y: 18 },
      { id: 'd8', name: 'D8', type: 'digital', x: 96, y: 18 },
      { id: 'd9', name: '~D9', type: 'digital', x: 84, y: 18 },
      { id: 'd10', name: '~D10', type: 'digital', x: 72, y: 18 },
      { id: 'd11', name: '~D11', type: 'digital', x: 60, y: 18 },
      { id: 'd12', name: 'D12', type: 'digital', x: 48, y: 18 },
      { id: 'd13', name: 'D13', type: 'digital', x: 36, y: 18 },
      { id: 'gnd_d', name: 'GND', type: 'gnd', x: 24, y: 18 },
      { id: 'aref', name: 'AREF', type: 'passive', x: 12, y: 18 },
      // Power header
      { id: 'vin', name: 'VIN', type: 'power_5v', x: 198, y: 142 },
      { id: 'gnd1', name: 'GND', type: 'gnd', x: 186, y: 142 },
      { id: 'gnd2', name: 'GND', type: 'gnd', x: 174, y: 142 },
      { id: '5v', name: '5V', type: 'power_5v', x: 162, y: 142 },
      { id: '3v3', name: '3.3V', type: 'power_3v3', x: 150, y: 142 },
      { id: 'reset', name: 'RESET', type: 'passive', x: 138, y: 142 },
      { id: 'ioref', name: 'IOREF', type: 'passive', x: 126, y: 142 },
      // Analog header
      { id: 'a0', name: 'A0', type: 'analog', x: 96, y: 142 },
      { id: 'a1', name: 'A1', type: 'analog', x: 84, y: 142 },
      { id: 'a2', name: 'A2', type: 'analog', x: 72, y: 142 },
      { id: 'a3', name: 'A3', type: 'analog', x: 60, y: 142 },
      { id: 'a4', name: 'A4/SDA', type: 'analog', x: 48, y: 142 },
      { id: 'a5', name: 'A5/SCL', type: 'analog', x: 36, y: 142 },
    ],
    svgIcon: 'arduino_uno_icon',
    model3D: {
      primitive: 'box',
      color: '#00878F',
      dimensions: [6.86, 0.3, 5.34],
    },
  },

  breadboard_small: {
    id: 'breadboard_small',
    name: 'Breadboard Small',
    category: 'basic',
    isFreeTier: true,
    width: 260,
    height: 120,
    rotationSnapAngle: 90,
    priceInr: 120,
    description: 'Solderless breadboard with 400 tie points, power rails (+) and (-) on top and bottom, and 0.1 inch spacing.',
    defaultProperties: {
      tiePoints: 400,
    },
    pins: [
      { id: 'power_top_plus', name: '+ (Top Rail)', type: 'power_5v', x: 20, y: 12 },
      { id: 'power_top_minus', name: '- (Top Rail)', type: 'gnd', x: 20, y: 24 },
      { id: 'power_bot_plus', name: '+ (Bot Rail)', type: 'power_5v', x: 20, y: 96 },
      { id: 'power_bot_minus', name: '- (Bot Rail)', type: 'gnd', x: 20, y: 108 },
    ],
    svgIcon: 'breadboard_icon',
    model3D: {
      primitive: 'box',
      color: '#F4F4F4',
      dimensions: [8.2, 0.4, 5.5],
    },
  },

  led_red: {
    id: 'led_red',
    name: 'LED (Standard)',
    category: 'basic',
    isFreeTier: true,
    width: 40,
    height: 60,
    rotationSnapAngle: 45,
    priceInr: 5,
    description: '5mm through-hole Light Emitting Diode. Requires a current-limiting resistor (typically 220-330Ω).',
    defaultProperties: {
      color: 'red',
      forwardVoltage: 2.0,
      maxCurrentMa: 20,
    },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'input', x: 12, y: 55, description: 'Longer leg, connects to positive/resistor' },
      { id: 'cathode', name: 'Cathode (-)', type: 'gnd', x: 28, y: 55, description: 'Shorter leg with flat rim edge, connects to GND' },
    ],
    svgIcon: 'led_icon',
    model3D: {
      primitive: 'cylinder',
      color: '#FF2A2A',
      dimensions: [0.5, 1.2, 0.5],
    },
  },

  resistor: {
    id: 'resistor',
    name: 'Resistor',
    category: 'basic',
    isFreeTier: true,
    width: 60,
    height: 24,
    rotationSnapAngle: 45,
    priceInr: 2,
    description: '1/4 Watt axial carbon film resistor with standard 4-band color code.',
    defaultProperties: {
      resistance: 220,
      unit: 'Ω',
      tolerance: '5%',
    },
    pins: [
      { id: 'terminal_1', name: 'Terminal 1', type: 'passive', x: 4, y: 12 },
      { id: 'terminal_2', name: 'Terminal 2', type: 'passive', x: 56, y: 12 },
    ],
    svgIcon: 'resistor_icon',
    model3D: {
      primitive: 'cylinder',
      color: '#D4B886',
      dimensions: [1.4, 0.35, 0.35],
    },
  },

  pushbutton: {
    id: 'pushbutton',
    name: 'Pushbutton',
    category: 'basic',
    isFreeTier: true,
    width: 44,
    height: 44,
    rotationSnapAngle: 90,
    priceInr: 8,
    description: 'Tactile momentary push button (SPST normally open), 4 pins.',
    defaultProperties: {
      type: 'momentary',
      normallyOpen: true,
    },
    pins: [
      { id: 'pin_1a', name: 'Terminal 1a', type: 'passive', x: 4, y: 10 },
      { id: 'pin_1b', name: 'Terminal 1b', type: 'passive', x: 40, y: 10 },
      { id: 'pin_2a', name: 'Terminal 2a', type: 'passive', x: 4, y: 34 },
      { id: 'pin_2b', name: 'Terminal 2b', type: 'passive', x: 40, y: 34 },
    ],
    svgIcon: 'pushbutton_icon',
    model3D: {
      primitive: 'box',
      color: '#262626',
      dimensions: [0.8, 0.6, 0.8],
    },
  },

  potentiometer: {
    id: 'potentiometer',
    name: 'Potentiometer',
    category: 'basic',
    isFreeTier: true,
    width: 50,
    height: 60,
    rotationSnapAngle: 45,
    priceInr: 25,
    description: '10kΩ rotary potentiometer with 3 terminals (VCC, Wiper/Signal, GND).',
    defaultProperties: {
      maxResistance: 10000,
      currentPosition: 0.5, // 0.0 to 1.0
    },
    pins: [
      { id: 'terminal_1', name: 'Terminal 1 (VCC)', type: 'passive', x: 10, y: 52 },
      { id: 'wiper', name: 'Wiper (Signal)', type: 'output', x: 25, y: 52 },
      { id: 'terminal_2', name: 'Terminal 2 (GND)', type: 'gnd', x: 40, y: 52 },
    ],
    svgIcon: 'potentiometer_icon',
    model3D: {
      primitive: 'cylinder',
      color: '#4A6984',
      dimensions: [1.2, 1.4, 1.2],
    },
  },

  ultrasonic_sensor: {
    id: 'ultrasonic_sensor',
    name: 'Ultrasonic Distance Sensor (HC-SR04)',
    category: 'sensor',
    isFreeTier: true,
    width: 90,
    height: 50,
    rotationSnapAngle: 90,
    priceInr: 99,
    description: 'Sonar sensor offering 2cm-400cm non-contact distance measurement with 4 pins (VCC, Trig, Echo, GND).',
    defaultProperties: {
      minDistanceCm: 2,
      maxDistanceCm: 400,
      currentDistanceCm: 50,
    },
    pins: [
      { id: 'vcc', name: 'VCC (+5V)', type: 'power_5v', x: 20, y: 44 },
      { id: 'trig', name: 'Trig', type: 'input', x: 36, y: 44 },
      { id: 'echo', name: 'Echo', type: 'output', x: 54, y: 44 },
      { id: 'gnd', name: 'GND', type: 'gnd', x: 70, y: 44 },
    ],
    svgIcon: 'ultrasonic_icon',
    model3D: {
      primitive: 'box',
      color: '#1E58A4',
      dimensions: [4.5, 2.0, 1.5],
    },
  },

  micro_servo: {
    id: 'micro_servo',
    name: 'Micro Servo 9g (SG90)',
    category: 'actuator',
    isFreeTier: true,
    width: 70,
    height: 60,
    rotationSnapAngle: 45,
    priceInr: 105,
    description: 'Precision 0° to 180° positional actuator with 3-wire PWM control (Signal, VCC, GND).',
    defaultProperties: {
      currentAngle: 90,
      minAngle: 0,
      maxAngle: 180,
    },
    pins: [
      { id: 'gnd', name: 'GND (Brown)', type: 'gnd', x: 18, y: 52 },
      { id: 'vcc', name: 'Power (Red, 5V)', type: 'power_5v', x: 35, y: 52 },
      { id: 'signal', name: 'PWM Signal (Orange)', type: 'input', x: 52, y: 52 },
    ],
    svgIcon: 'servo_icon',
    model3D: {
      primitive: 'box',
      color: '#1A6DCC',
      dimensions: [2.3, 2.9, 1.2],
    },
  },

  battery_9v: {
    id: 'battery_9v',
    name: '9V Battery',
    category: 'power',
    isFreeTier: true,
    width: 60,
    height: 90,
    rotationSnapAngle: 90,
    priceInr: 45,
    description: 'Standard 9 Volt alkaline battery with snap connectors (+ and -).',
    defaultProperties: {
      voltage: 9.0,
      capacityMah: 550,
    },
    pins: [
      { id: 'positive', name: 'Positive (+)', type: 'power_5v', x: 20, y: 12 },
      { id: 'negative', name: 'Negative (-)', type: 'gnd', x: 40, y: 12 },
    ],
    svgIcon: 'battery_9v_icon',
    model3D: {
      primitive: 'box',
      color: '#1E2430',
      dimensions: [2.6, 4.8, 1.7],
    },
  },

  dc_motor: {
    id: 'dc_motor',
    name: 'DC Motor',
    category: 'actuator',
    isFreeTier: true,
    width: 70,
    height: 50,
    rotationSnapAngle: 45,
    priceInr: 60,
    description: '3V-6V cylindrical DC toy motor for wheels, fans, and mobile robots.',
    defaultProperties: {
      rpm: 3000,
      operatingVoltage: 5.0,
    },
    pins: [
      { id: 'terminal_1', name: 'Terminal 1', type: 'passive', x: 12, y: 25 },
      { id: 'terminal_2', name: 'Terminal 2', type: 'passive', x: 58, y: 25 },
    ],
    svgIcon: 'motor_icon',
    model3D: {
      primitive: 'cylinder',
      color: '#8A99AD',
      dimensions: [2.0, 3.2, 2.0],
    },
  },

  pir_sensor: {
    id: 'pir_sensor',
    name: 'PIR Motion Sensor (HC-SR501)',
    category: 'sensor',
    isFreeTier: false,
    width: 70,
    height: 65,
    rotationSnapAngle: 90,
    priceInr: 120,
    description: 'Pyroelectric infrared motion detector with dome lens and adjustable delay/sensitivity.',
    defaultProperties: {
      detected: false,
      delaySeconds: 3,
    },
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power_5v', x: 18, y: 55 },
      { id: 'out', name: 'Digital Out', type: 'output', x: 35, y: 55 },
      { id: 'gnd', name: 'GND', type: 'gnd', x: 52, y: 55 },
    ],
    svgIcon: 'pir_icon',
    model3D: {
      primitive: 'cylinder',
      color: '#FFFFFF',
      dimensions: [2.8, 2.2, 2.8],
    },
  },

  lcd_16x2: {
    id: 'lcd_16x2',
    name: 'LCD 16x2 Display (with I2C)',
    category: 'display',
    isFreeTier: false,
    width: 180,
    height: 70,
    rotationSnapAngle: 90,
    priceInr: 220,
    description: '16 character by 2 row alphanumeric liquid crystal display with I2C backpack interface.',
    defaultProperties: {
      i2cAddress: '0x27',
      line1: 'RoboVerse Lab',
      line2: 'Ready!',
    },
    pins: [
      { id: 'gnd', name: 'GND', type: 'gnd', x: 15, y: 58 },
      { id: 'vcc', name: 'VCC (5V)', type: 'power_5v', x: 30, y: 58 },
      { id: 'sda', name: 'SDA (Data)', type: 'input', x: 45, y: 58 },
      { id: 'scl', name: 'SCL (Clock)', type: 'input', x: 60, y: 58 },
    ],
    svgIcon: 'lcd_icon',
    model3D: {
      primitive: 'box',
      color: '#0D3820',
      dimensions: [8.0, 3.6, 1.2],
    },
  },
};
