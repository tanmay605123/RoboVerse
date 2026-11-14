import { CircuitTemplate } from './types';

export const TEMPLATES: CircuitTemplate[] = [
  // 1. TINKERCAD PUSH BUTTON + LED CIRCUIT (MANDATORY REQUIREMENT B)
  {
    id: 'push_button_led',
    name: 'Push Button LED (Tinkercad Reference)',
    description: 'Interactive push button switch controlling an LED via Arduino digital pin 13 with internal INPUT_PULLUP on Pin 2.',
    code: `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Push Button LED Controller Online");
}

void loop() {
  int buttonState = digitalRead(buttonPin);

  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);
    Serial.println("[BUTTON] Pressed! LED: ON (HIGH)");
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("[BUTTON] Released. LED: OFF (LOW)");
  }
  delay(100);
}
`,
    components: [
      // Arduino Uno R3
      {
        id: 'arduino_uno_1',
        typeId: 'arduino_uno',
        name: 'Arduino Uno R3',
        category: 'MICROCONTROLLER',
        model3DUrl: '/models/arduino_uno.glb',
        position: [-2.6, 0, 0],
        rotation: [0, 0, 0],
        properties: { clockMhz: 16, mcu: 'ATmega328P' },
        pins: [
          { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.0, 0.2, 0.8] },
          { id: 'pin_3v3', name: '3.3V', type: 'POWER_VCC', position3D: [-2.2, 0.2, 0.8] },
          { id: 'pin_gnd_1', name: 'GND (1)', type: 'GROUND', position3D: [-1.8, 0.2, 0.8] },
          { id: 'pin_gnd_2', name: 'GND (2)', type: 'GROUND', position3D: [-1.6, 0.2, 0.8] },
          { id: 'pin_d13', name: 'D13 (LED)', type: 'DIGITAL_IO', position3D: [-1.8, 0.2, -0.8] },
          { id: 'pin_d2', name: 'D2 (Button)', type: 'DIGITAL_IO', position3D: [-3.4, 0.2, -0.8] },
        ],
      },
      // Half-Size Breadboard
      {
        id: 'breadboard_1',
        typeId: 'breadboard_half',
        name: 'Half-Size Breadboard (400 pts)',
        category: 'PROTOTYPING',
        model3DUrl: '/models/breadboard_half.glb',
        position: [1.4, 0, 0],
        rotation: [0, 0, 0],
        properties: { tiePoints: 400 },
        pins: [
          { id: 'power_plus_1', name: '+ Bus (5V)', type: 'POWER_VCC', position3D: [0.4, 0.15, -1.0] },
          { id: 'power_gnd_1', name: '- Bus (GND Top)', type: 'GROUND', position3D: [0.4, 0.15, -0.85] },
          { id: 'row_10_e', name: 'Row 10 (Tie E)', type: 'DIGITAL_IO', position3D: [1.0, 0.15, -0.3] },
          { id: 'row_10_f', name: 'Row 10 (Tie F)', type: 'DIGITAL_IO', position3D: [1.0, 0.15, 0.3] },
          { id: 'row_15_e', name: 'Row 15 (Tie E)', type: 'DIGITAL_IO', position3D: [1.6, 0.15, -0.3] },
          { id: 'row_15_f', name: 'Row 15 (Tie F)', type: 'DIGITAL_IO', position3D: [1.6, 0.15, 0.3] },
          { id: 'power_gnd_2', name: '- Bus (GND Bottom)', type: 'GROUND', position3D: [0.4, 0.15, 1.0] },
        ],
      },
      // 220Ω Resistor
      {
        id: 'resistor_220_1',
        typeId: 'resistor_220',
        name: '220Ω Resistor',
        category: 'PASSIVE',
        model3DUrl: '/models/resistor.glb',
        position: [0.8, 0.2, -0.2],
        rotation: [0, 0, 0],
        properties: { resistanceOhms: 220, tolerancePct: 5 },
        pins: [
          { id: 'lead_1', name: 'Lead 1 (from D13)', type: 'DIGITAL_IO', position3D: [0.5, 0.25, -0.2] },
          { id: 'lead_2', name: 'Lead 2 (to Anode)', type: 'DIGITAL_IO', position3D: [1.1, 0.25, -0.2] },
        ],
      },
      // Red 5mm LED
      {
        id: 'led_red_1',
        typeId: 'led_red',
        name: 'Red 5mm LED',
        category: 'ACTUATOR',
        model3DUrl: '/models/led_red.glb',
        position: [1.5, 0.25, -0.2],
        rotation: [0, 0, 0],
        properties: { forwardVoltage: 2.0, maxCurrentMa: 25, color: '#FF3333' },
        pins: [
          { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', position3D: [1.5, 0.3, -0.3] },
          { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', position3D: [1.5, 0.3, -0.1] },
        ],
      },
      // Tactile Push Button
      {
        id: 'button_1',
        typeId: 'push_button',
        name: 'Tactile Push Button',
        category: 'PASSIVE',
        model3DUrl: '/models/push_button.glb',
        position: [1.5, 0.2, 0.6],
        rotation: [0, 0, 0],
        properties: { isPressed: false, debounceMs: 5 },
        pins: [
          { id: 'pin_1a', name: 'Terminal 1 (Pin D2)', type: 'DIGITAL_IO', position3D: [1.3, 0.25, 0.45] },
          { id: 'pin_1b', name: 'Terminal 1b', type: 'DIGITAL_IO', position3D: [1.7, 0.25, 0.45] },
          { id: 'pin_2a', name: 'Terminal 2 (GND)', type: 'GROUND', position3D: [1.3, 0.25, 0.75] },
          { id: 'pin_2b', name: 'Terminal 2b', type: 'GROUND', position3D: [1.7, 0.25, 0.75] },
        ],
      },
    ],
    wires: [
      // 1. Arduino D13 -> 220Ω Resistor Lead 1
      {
        id: 'wire_d13_resistor',
        color: '#39FF6A', // Signal green
        fromComponentId: 'arduino_uno_1',
        fromPinId: 'pin_d13',
        toComponentId: 'resistor_220_1',
        toPinId: 'lead_1',
      },
      // 2. Resistor Lead 2 -> LED Anode
      {
        id: 'wire_resistor_led',
        color: '#FF9A1F', // Orange wire
        fromComponentId: 'resistor_220_1',
        fromPinId: 'lead_2',
        toComponentId: 'led_red_1',
        toPinId: 'anode',
      },
      // 3. LED Cathode -> Breadboard GND Bus
      {
        id: 'wire_led_gnd_rail',
        color: '#222222', // Dark black for GND
        fromComponentId: 'led_red_1',
        fromPinId: 'cathode',
        toComponentId: 'breadboard_1',
        toPinId: 'power_gnd_1',
      },
      // 4. Breadboard GND Bus -> Arduino GND
      {
        id: 'wire_breadboard_arduino_gnd',
        color: '#222222', // GND black
        fromComponentId: 'breadboard_1',
        fromPinId: 'power_gnd_1',
        toComponentId: 'arduino_uno_1',
        toPinId: 'pin_gnd_1',
      },
      // 5. Arduino Pin 2 -> Push Button Terminal 1a
      {
        id: 'wire_d2_button',
        color: '#0A84FF', // Blue wire for Button logic signal
        fromComponentId: 'arduino_uno_1',
        fromPinId: 'pin_d2',
        toComponentId: 'button_1',
        toPinId: 'pin_1a',
      },
      // 6. Push Button Terminal 2a -> Breadboard GND Bus
      {
        id: 'wire_button_gnd',
        color: '#222222', // Black GND wire
        fromComponentId: 'button_1',
        fromPinId: 'pin_2a',
        toComponentId: 'breadboard_1',
        toPinId: 'power_gnd_2',
      },
      // 7. Breadboard Bottom GND Bus -> Arduino GND (2)
      {
        id: 'wire_bottom_gnd_uno',
        color: '#222222',
        fromComponentId: 'breadboard_1',
        toComponentId: 'arduino_uno_1',
        fromPinId: 'power_gnd_2',
        toPinId: 'pin_gnd_2',
      },
    ],
  },

  // 2. CLASSIC LED BLINK
  {
    id: 'led_blink',
    name: 'Classic LED Blink (Pin 13)',
    description: 'Standard 1Hz LED blinking sketch with 220Ω current-limiting resistor.',
    code: `const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino Blink Sketch Initialized");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("[LED] State: HIGH (Glowing)");
  delay(1000);

  digitalWrite(ledPin, LOW);
  Serial.println("[LED] State: LOW (Dark)");
  delay(1000);
}
`,
    components: [
      {
        id: 'arduino_uno_1',
        typeId: 'arduino_uno',
        name: 'Arduino Uno R3',
        category: 'MICROCONTROLLER',
        model3DUrl: '/models/arduino_uno.glb',
        position: [-2.6, 0, 0],
        rotation: [0, 0, 0],
        properties: { clockMhz: 16 },
        pins: [
          { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.0, 0.2, 0.8] },
          { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-1.8, 0.2, 0.8] },
          { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO', position3D: [-1.8, 0.2, -0.8] },
        ],
      },
      {
        id: 'resistor_220_1',
        typeId: 'resistor_220',
        name: '220Ω Resistor',
        category: 'PASSIVE',
        model3DUrl: '/models/resistor.glb',
        position: [0.8, 0.2, 0],
        rotation: [0, 0, 0],
        properties: { resistanceOhms: 220 },
        pins: [
          { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO', position3D: [0.5, 0.25, 0] },
          { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO', position3D: [1.1, 0.25, 0] },
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
        properties: { forwardVoltage: 2.0, color: '#FF3333' },
        pins: [
          { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', position3D: [1.6, 0.3, -0.2] },
          { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', position3D: [1.6, 0.3, 0.2] },
        ],
      },
    ],
    wires: [
      {
        id: 'wire_1',
        color: '#39FF6A',
        fromComponentId: 'arduino_uno_1',
        fromPinId: 'pin_d13',
        toComponentId: 'resistor_220_1',
        toPinId: 'lead_1',
      },
      {
        id: 'wire_2',
        color: '#FF9A1F',
        fromComponentId: 'resistor_220_1',
        fromPinId: 'lead_2',
        toComponentId: 'led_red_1',
        toPinId: 'anode',
      },
      {
        id: 'wire_3',
        color: '#222222',
        fromComponentId: 'led_red_1',
        fromPinId: 'cathode',
        toComponentId: 'arduino_uno_1',
        toPinId: 'pin_gnd_1',
      },
    ],
  },

  // 3. BLANK CANVAS
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Empty workbench ready for custom breadboard assembly.',
    code: `void setup() {
  Serial.begin(9600);
  Serial.println("Ready to build!");
}

void loop() {
  // Write your code here
  delay(100);
}
`,
    components: [],
    wires: [],
  },
];
