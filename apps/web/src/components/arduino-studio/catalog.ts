import { ComponentCatalogItem } from './types';

export const COMPONENT_CATALOG: ComponentCatalogItem[] = [
  // 1. Arduino Uno R3
  {
    typeId: 'arduino_uno',
    name: 'Arduino Uno R3',
    category: 'MICROCONTROLLER',
    description: 'ATmega328P 16MHz MCU with 14 digital I/O pins (6 PWM) and 6 analog inputs.',
    operatingVoltage: '5V DC (USB or 7-12V DC Jack)',
    defaultProperties: { clockMhz: 16, mcu: 'ATmega328P' },
    defaultWidth2D: 240,
    defaultHeight2D: 180,
    pins: [
      // Digital Header (top row)
      { id: 'pin_aref', name: 'AREF', type: 'DIGITAL_IO', rel2D: [60, 10], rel3D: [-0.6, 0.2, -0.85] },
      { id: 'pin_gnd_dig', name: 'GND', type: 'GROUND', rel2D: [72, 10], rel3D: [-0.8, 0.2, -0.85] },
      { id: 'pin_d13', name: 'D13 (SCK/LED)', type: 'DIGITAL_IO', rel2D: [84, 10], rel3D: [-1.0, 0.2, -0.85] },
      { id: 'pin_d12', name: 'D12 (MISO)', type: 'DIGITAL_IO', rel2D: [96, 10], rel3D: [-1.2, 0.2, -0.85] },
      { id: 'pin_d11', name: 'D11 (~PWM)', type: 'PWM', rel2D: [108, 10], rel3D: [-1.4, 0.2, -0.85] },
      { id: 'pin_d10', name: 'D10 (~PWM)', type: 'PWM', rel2D: [120, 10], rel3D: [-1.6, 0.2, -0.85] },
      { id: 'pin_d9', name: 'D9 (~PWM)', type: 'PWM', rel2D: [132, 10], rel3D: [-1.8, 0.2, -0.85] },
      { id: 'pin_d8', name: 'D8', type: 'DIGITAL_IO', rel2D: [144, 10], rel3D: [-2.0, 0.2, -0.85] },
      { id: 'pin_d7', name: 'D7', type: 'DIGITAL_IO', rel2D: [160, 10], rel3D: [-2.2, 0.2, -0.85] },
      { id: 'pin_d6', name: 'D6 (~PWM)', type: 'PWM', rel2D: [172, 10], rel3D: [-2.4, 0.2, -0.85] },
      { id: 'pin_d5', name: 'D5 (~PWM)', type: 'PWM', rel2D: [184, 10], rel3D: [-2.6, 0.2, -0.85] },
      { id: 'pin_d4', name: 'D4', type: 'DIGITAL_IO', rel2D: [196, 10], rel3D: [-2.8, 0.2, -0.85] },
      { id: 'pin_d3', name: 'D3 (~PWM)', type: 'PWM', rel2D: [208, 10], rel3D: [-3.0, 0.2, -0.85] },
      { id: 'pin_d2', name: 'D2 (INT0)', type: 'DIGITAL_IO', rel2D: [220, 10], rel3D: [-3.2, 0.2, -0.85] },
      { id: 'pin_d1', name: 'D1 (TX)', type: 'UART_TX', rel2D: [232, 10], rel3D: [-3.4, 0.2, -0.85] },
      { id: 'pin_d0', name: 'D0 (RX)', type: 'UART_RX', rel2D: [244, 10], rel3D: [-3.6, 0.2, -0.85] },
      // Power & Analog Header (bottom row)
      { id: 'pin_ioref', name: 'IOREF', type: 'POWER_VCC', rel2D: [60, 170], rel3D: [-0.6, 0.2, 0.85] },
      { id: 'pin_reset', name: 'RESET', type: 'DIGITAL_IO', rel2D: [72, 170], rel3D: [-0.8, 0.2, 0.85] },
      { id: 'pin_3v3', name: '3.3V', type: 'POWER_VCC', rel2D: [84, 170], rel3D: [-1.0, 0.2, 0.85] },
      { id: 'pin_5v', name: '5V', type: 'POWER_VCC', rel2D: [96, 170], rel3D: [-1.2, 0.2, 0.85] },
      { id: 'pin_gnd_1', name: 'GND (1)', type: 'GROUND', rel2D: [108, 170], rel3D: [-1.4, 0.2, 0.85] },
      { id: 'pin_gnd_2', name: 'GND (2)', type: 'GROUND', rel2D: [120, 170], rel3D: [-1.6, 0.2, 0.85] },
      { id: 'pin_vin', name: 'VIN', type: 'POWER_VCC', rel2D: [132, 170], rel3D: [-1.8, 0.2, 0.85] },
      { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN', rel2D: [160, 170], rel3D: [-2.2, 0.2, 0.85] },
      { id: 'pin_a1', name: 'A1', type: 'ANALOG_IN', rel2D: [172, 170], rel3D: [-2.4, 0.2, 0.85] },
      { id: 'pin_a2', name: 'A2', type: 'ANALOG_IN', rel2D: [184, 170], rel3D: [-2.6, 0.2, 0.85] },
      { id: 'pin_a3', name: 'A3', type: 'ANALOG_IN', rel2D: [196, 170], rel3D: [-2.8, 0.2, 0.85] },
      { id: 'pin_a4', name: 'A4 (SDA)', type: 'I2C_SDA', rel2D: [208, 170], rel3D: [-3.0, 0.2, 0.85] },
      { id: 'pin_a5', name: 'A5 (SCL)', type: 'I2C_SCL', rel2D: [220, 170], rel3D: [-3.2, 0.2, 0.85] },
    ],
    docs: {
      overview: 'The Arduino Uno R3 is the world standard microcontroller prototyping board. Powered by an ATmega328P processor clocked at 16 MHz.',
      pinout: 'Digital Pins 0-13 support pinMode(), digitalWrite(), and digitalRead(). Pins 3, 5, 6, 9, 10, 11 support 490Hz 8-bit PWM. Pins A0-A5 provide 10-bit ADC conversion (0-1023).',
      schematicTips: 'Always connect a common Ground (GND) to any external sensors or actuators.',
    },
  },

  // 2. Breadboard (Half-Size 400 pts)
  {
    typeId: 'breadboard_half',
    name: 'Half-Size Breadboard (400 tie-points)',
    category: 'PROTOTYPING',
    description: 'Solderless breadboard with 30 terminal rows (a-e and f-j) and dual power rails (+ / -).',
    operatingVoltage: 'Up to 30V DC / 2A',
    defaultProperties: { tiePoints: 400 },
    defaultWidth2D: 320,
    defaultHeight2D: 220,
    pins: [
      { id: 'power_plus_1', name: '+ Bus (Top)', type: 'POWER_VCC', rel2D: [40, 20], rel3D: [0.2, 0.15, -1.0] },
      { id: 'power_gnd_1', name: '- Bus GND (Top)', type: 'GROUND', rel2D: [40, 36], rel3D: [0.2, 0.15, -0.85] },
      { id: 'row_10_e', name: 'Row 10 (Tie E)', type: 'DIGITAL_IO', rel2D: [120, 80], rel3D: [1.0, 0.15, -0.3] },
      { id: 'row_10_f', name: 'Row 10 (Tie F)', type: 'DIGITAL_IO', rel2D: [120, 130], rel3D: [1.0, 0.15, 0.3] },
      { id: 'row_15_e', name: 'Row 15 (Tie E)', type: 'DIGITAL_IO', rel2D: [160, 80], rel3D: [1.6, 0.15, -0.3] },
      { id: 'row_15_f', name: 'Row 15 (Tie F)', type: 'DIGITAL_IO', rel2D: [160, 130], rel3D: [1.6, 0.15, 0.3] },
      { id: 'row_20_e', name: 'Row 20 (Tie E)', type: 'DIGITAL_IO', rel2D: [200, 80], rel3D: [2.0, 0.15, -0.3] },
      { id: 'row_20_f', name: 'Row 20 (Tie F)', type: 'DIGITAL_IO', rel2D: [200, 130], rel3D: [2.0, 0.15, 0.3] },
      { id: 'power_plus_2', name: '+ Bus (Bottom)', type: 'POWER_VCC', rel2D: [40, 180], rel3D: [0.2, 0.15, 0.85] },
      { id: 'power_gnd_2', name: '- Bus GND (Bottom)', type: 'GROUND', rel2D: [40, 196], rel3D: [0.2, 0.15, 1.0] },
    ],
    docs: {
      overview: 'Solderless breadboards allow rapid circuit prototyping without soldering.',
      pinout: 'Horizontal rows 1-30 are internally connected in two blocks (a-e and f-j). The outer rails run full length.',
      schematicTips: 'Do not connect the top and bottom rails together unless bridged with jumper wires.',
    },
  },

  // 3. Tactile Push Button
  {
    typeId: 'push_button',
    name: 'Tactile Push Button (4-Pin)',
    category: 'PASSIVE',
    description: 'Momentary 6x6mm SPST tactile switch. Contacts close when pressed.',
    operatingVoltage: '12V DC 50mA max',
    defaultProperties: { isPressed: false, debounceMs: 5 },
    defaultWidth2D: 60,
    defaultHeight2D: 60,
    pins: [
      { id: 'pin_1a', name: 'Terminal 1a', type: 'DIGITAL_IO', rel2D: [10, 10], rel3D: [-0.2, 0.15, -0.2] },
      { id: 'pin_1b', name: 'Terminal 1b', type: 'DIGITAL_IO', rel2D: [50, 10], rel3D: [0.2, 0.15, -0.2] },
      { id: 'pin_2a', name: 'Terminal 2a', type: 'DIGITAL_IO', rel2D: [10, 50], rel3D: [-0.2, 0.15, 0.2] },
      { id: 'pin_2b', name: 'Terminal 2b', type: 'DIGITAL_IO', rel2D: [50, 50], rel3D: [0.2, 0.15, 0.2] },
    ],
    docs: {
      overview: 'Standard tactile switch. Pins 1a and 1b are internally connected, and pins 2a and 2b are internally connected.',
      pinout: 'When button is pressed, 1a/1b connects to 2a/2b.',
      schematicTips: 'Connect one side to an Arduino digital pin configured as INPUT_PULLUP and the other side to GND.',
    },
  },

  // 4. Red 5mm LED
  {
    typeId: 'led_red',
    name: 'Red 5mm LED',
    category: 'ACTUATOR',
    description: 'High-brightness diffused 5mm red light-emitting diode.',
    operatingVoltage: '1.8V - 2.2V forward drop (20mA max)',
    defaultProperties: { color: '#FF3333', forwardVoltage: 2.0, maxCurrentMa: 25 },
    defaultWidth2D: 40,
    defaultHeight2D: 60,
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', rel2D: [20, 10], rel3D: [0, 0.25, -0.15] },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', rel2D: [20, 50], rel3D: [0, 0.25, 0.15] },
    ],
    docs: {
      overview: 'A semiconductor diode that emits red light when current flows from anode to cathode.',
      pinout: 'Long leg = Anode (+), Short leg / flat rim notch = Cathode (-).',
      schematicTips: 'Always place a current limiting resistor (220Ω - 330Ω) in series with the LED to prevent burnout.',
    },
  },

  // 5. Green 5mm LED
  {
    typeId: 'led_green',
    name: 'Green 5mm LED',
    category: 'ACTUATOR',
    description: 'Diffused 5mm green indicator LED.',
    operatingVoltage: '2.2V - 2.4V forward drop',
    defaultProperties: { color: '#39FF6A', forwardVoltage: 2.2, maxCurrentMa: 25 },
    defaultWidth2D: 40,
    defaultHeight2D: 60,
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', rel2D: [20, 10], rel3D: [0, 0.25, -0.15] },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', rel2D: [20, 50], rel3D: [0, 0.25, 0.15] },
    ],
    docs: {
      overview: 'Standard green diffused 5mm LED.',
      pinout: 'Anode (+) connects toward positive supply/pin; Cathode (-) connects to GND.',
      schematicTips: 'Requires 220Ω series resistor for 5V operation.',
    },
  },

  // 6. 220-Ohm Resistor
  {
    typeId: 'resistor_220',
    name: '220Ω Resistor',
    category: 'PASSIVE',
    description: 'Carbon film 1/4W 220Ω resistor (Color: Red, Red, Brown, Gold).',
    operatingVoltage: '0.25W power dissipation rating',
    defaultProperties: { resistanceOhms: 220, tolerancePct: 5 },
    defaultWidth2D: 90,
    defaultHeight2D: 30,
    pins: [
      { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO', rel2D: [10, 15], rel3D: [-0.4, 0.1, 0] },
      { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO', rel2D: [80, 15], rel3D: [0.4, 0.1, 0] },
    ],
    docs: {
      overview: 'Standard through-hole axial resistor used for limiting current to LEDs and semiconductor components.',
      pinout: 'Non-polarized: current can flow in either direction.',
      schematicTips: 'Ohm’s Law: V = I * R. At 5V with 2.0V LED drop, I = (5-2)/220 = 13.6 mA.',
    },
  },

  // 7. 10k-Ohm Resistor
  {
    typeId: 'resistor_10k',
    name: '10kΩ Resistor',
    category: 'PASSIVE',
    description: '1/4W 10kΩ resistor (Color: Brown, Black, Orange, Gold). Ideal pullup/pulldown.',
    operatingVoltage: '0.25W rating',
    defaultProperties: { resistanceOhms: 10000, tolerancePct: 5 },
    defaultWidth2D: 90,
    defaultHeight2D: 30,
    pins: [
      { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO', rel2D: [10, 15], rel3D: [-0.4, 0.1, 0] },
      { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO', rel2D: [80, 15], rel3D: [0.4, 0.1, 0] },
    ],
    docs: {
      overview: 'Common pull-up or pull-down resistor for buttons, switches, and I2C buses.',
      pinout: 'Non-polarized.',
      schematicTips: 'Use to ensure logic inputs remain at a stable state when unconnected.',
    },
  },

  // 8. 10k Potentiometer
  {
    typeId: 'potentiometer_10k',
    name: '10kΩ Potentiometer',
    category: 'PASSIVE',
    description: 'Rotary variable resistor for analog voltage division.',
    operatingVoltage: '0V - 5V DC',
    defaultProperties: { resistanceOhms: 10000, wiperPositionPct: 50 },
    defaultWidth2D: 60,
    defaultHeight2D: 60,
    pins: [
      { id: 'pin_1', name: 'Terminal A (5V)', type: 'POWER_VCC', rel2D: [15, 50], rel3D: [-0.2, 0.1, 0.2] },
      { id: 'wiper', name: 'Wiper (Analog Out)', type: 'ANALOG_IN', rel2D: [30, 50], rel3D: [0, 0.1, 0.2] },
      { id: 'pin_2', name: 'Terminal B (GND)', type: 'GROUND', rel2D: [45, 50], rel3D: [0.2, 0.1, 0.2] },
    ],
    docs: {
      overview: 'Provides adjustable voltage division from 0 to VCC to Arduino analog input pins.',
      pinout: 'Terminal A to 5V, Terminal B to GND, Wiper to Analog Pin A0.',
      schematicTips: 'analogRead() yields values from 0 (0V) to 1023 (5V).',
    },
  },

  // 9. SG90 Micro Servo
  {
    typeId: 'servo_sg90',
    name: 'SG90 Micro Servo (9g)',
    category: 'ACTUATOR',
    description: '0° to 180° positional actuator controlled via 50Hz PWM signal.',
    operatingVoltage: '4.8V - 6.0V DC',
    defaultProperties: { angle: 90, torqueKgCm: 1.8 },
    defaultWidth2D: 70,
    defaultHeight2D: 60,
    pins: [
      { id: 'gnd', name: 'GND (Brown)', type: 'GROUND', rel2D: [20, 50], rel3D: [-0.15, 0.1, 0.2] },
      { id: 'vcc', name: 'VCC (Red 5V)', type: 'POWER_VCC', rel2D: [35, 50], rel3D: [0, 0.1, 0.2] },
      { id: 'pwm', name: 'Signal (Orange ~PWM)', type: 'PWM', rel2D: [50, 50], rel3D: [0.15, 0.1, 0.2] },
    ],
    docs: {
      overview: 'Standard 9g hobby servo motor with internal motor, gearbox, and feedback potentiometer.',
      pinout: 'Brown = GND, Red = 5V, Orange = PWM signal (e.g. Pin 9).',
      schematicTips: 'Requires #include <Servo.h>. Connect signal to any PWM-capable pin (~9, ~10, etc.).',
    },
  },

  // 10. HC-SR04 Ultrasonic Distance Sensor
  {
    typeId: 'sensor_ultrasonic_hcsr04',
    name: 'HC-SR04 Ultrasonic Sensor',
    category: 'SENSOR',
    description: 'Non-contact sonar distance sensor measuring 2cm to 400cm.',
    operatingVoltage: '5.0V DC',
    defaultProperties: { testDistanceCm: 25 },
    defaultWidth2D: 100,
    defaultHeight2D: 60,
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC', rel2D: [20, 50], rel3D: [-0.3, 0.1, 0.2] },
      { id: 'trig', name: 'Trig', type: 'DIGITAL_IO', rel2D: [40, 50], rel3D: [-0.1, 0.1, 0.2] },
      { id: 'echo', name: 'Echo', type: 'DIGITAL_IO', rel2D: [60, 50], rel3D: [0.1, 0.1, 0.2] },
      { id: 'gnd', name: 'GND', type: 'GROUND', rel2D: [80, 50], rel3D: [0.3, 0.1, 0.2] },
    ],
    docs: {
      overview: 'Sends an ultrasonic 40kHz pulse and measures travel time of the returning echo.',
      pinout: 'VCC -> 5V, GND -> GND, Trig -> Output pin, Echo -> Input pin.',
      schematicTips: 'Distance (cm) = (Duration * 0.0343) / 2.',
    },
  },

  // 11. 5V Active Buzzer
  {
    typeId: 'buzzer_active',
    name: '5V Active Buzzer',
    category: 'ACTUATOR',
    description: 'Generates audible 2.5kHz acoustic tone when 5V logic signal is applied.',
    operatingVoltage: '3.5V - 5.5V DC',
    defaultProperties: { frequencyHz: 2500 },
    defaultWidth2D: 50,
    defaultHeight2D: 50,
    pins: [
      { id: 'vcc', name: 'VCC (+)', type: 'POWER_VCC', rel2D: [15, 40], rel3D: [-0.15, 0.1, 0.2] },
      { id: 'gnd', name: 'GND (-)', type: 'GROUND', rel2D: [35, 40], rel3D: [0.15, 0.1, 0.2] },
    ],
    docs: {
      overview: 'Built-in oscillator creates a fixed 2.5kHz beep whenever powered.',
      pinout: '+ pin connects to Arduino digital pin, - pin connects to GND.',
      schematicTips: 'digitalWrite(pin, HIGH) sounds the buzzer; digitalWrite(pin, LOW) stops it.',
    },
  },
];
