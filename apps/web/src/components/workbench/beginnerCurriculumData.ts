/**
 * RoboVerse 16 Beginner Lessons Curriculum Dataset
 * Complete definitions for Rookie Robotics & Electronics Certification
 */

import { CircuitComponent, WireConnection } from '@roboverse/shared';

export interface WiringStep {
  from: string;
  to: string;
  color: string;
  purpose: string;
}

export interface BeginnerLesson {
  id: string;
  lessonNumber: number;
  slug: string;
  title: string;
  category: 'Basics' | 'Analog' | 'Actuators' | 'Sensors' | 'Displays' | 'Systems';
  level: 'ROOKIE' | 'BUILDER';
  durationMinutes: number;
  xpReward: number;
  description: string;
  objectives: string[];
  requiredComponents: string[];
  wiringGuide: WiringStep[];
  starterCode: string;
  sampleAssembly: {
    components: CircuitComponent[];
    wires: WireConnection[];
  };
}

export const BEGINNER_LESSONS: BeginnerLesson[] = [
  // 1. BLINK LED
  {
    id: 'les_01_blink_led',
    lessonNumber: 1,
    slug: 'blink-led',
    title: '1. Blink an LED (Hello World)',
    category: 'Basics',
    level: 'ROOKIE',
    durationMinutes: 10,
    xpReward: 100,
    description: 'The foundation of physical computing: pulse digital output pin 13 high and low at 1-second intervals.',
    objectives: [
      "Understand Ohm's law and current-limiting resistors",
      'Learn pinMode(13, OUTPUT) configuration',
      'Master digitalWrite() and delay() functions',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'resistor_220', 'led_red'],
    wiringGuide: [
      { from: 'Arduino Pin D13', to: 'Resistor Lead 1', color: '#39FF6A', purpose: 'Digital High/Low output' },
      { from: 'Resistor Lead 2', to: 'LED Anode (+)', color: '#FF9A1F', purpose: 'Current-limited signal' },
      { from: 'LED Cathode (-)', to: 'Arduino GND', color: '#040B08', purpose: 'Ground return loop' },
    ],
    starterCode: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH); // Turn LED ON
  delay(1000);            // Wait 1000ms
  digitalWrite(13, LOW);  // Turn LED OFF
  delay(1000);            // Wait 1000ms
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
            { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO', position3D: [-2.0, 0.2, -0.8] },
          ],
        },
        {
          id: 'breadboard_1',
          typeId: 'breadboard_half',
          name: 'Half Breadboard',
          category: 'PROTOTYPING',
          model3DUrl: '/models/breadboard_half.glb',
          position: [1.2, 0, 0],
          rotation: [0, 0, 0],
          properties: { tiePoints: 400 },
          pins: [],
        },
        {
          id: 'resistor_220_1',
          typeId: 'resistor_220',
          name: '220Ω Resistor',
          category: 'PASSIVE',
          model3DUrl: '/models/resistor.glb',
          position: [1.0, 0.2, 0],
          rotation: [0, 0, 0],
          properties: { resistanceOhms: 220 },
          pins: [
            { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO', position3D: [1.0, 0.25, -0.3] },
            { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO', position3D: [1.0, 0.25, 0.3] },
          ],
        },
        {
          id: 'led_red_1',
          typeId: 'led_red',
          name: 'Red LED',
          category: 'ACTUATOR',
          model3DUrl: '/models/led_red.glb',
          position: [1.6, 0.25, 0],
          rotation: [0, 0, 0],
          properties: { color: '#FF3333' },
          pins: [
            { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', position3D: [1.6, 0.3, -0.2] },
            { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', position3D: [1.6, 0.3, 0.2] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#39FF6A', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d13', toComponentId: 'resistor_220_1', toPinId: 'lead_1' },
        { id: 'w2', color: '#FF9A1F', fromComponentId: 'resistor_220_1', fromPinId: 'lead_2', toComponentId: 'led_red_1', toPinId: 'anode' },
        { id: 'w3', color: '#040B08', fromComponentId: 'led_red_1', fromPinId: 'cathode', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd_1' },
      ],
    },
  },

  // 2. BUTTON INPUT
  {
    id: 'les_02_button_input',
    lessonNumber: 2,
    slug: 'pushbutton-digital-input',
    title: '2. Pushbutton Digital Input',
    category: 'Basics',
    level: 'ROOKIE',
    durationMinutes: 15,
    xpReward: 100,
    description: 'Read momentary state transitions from a tactile button with internal pull-up resistors.',
    objectives: [
      'Learn digitalRead() and boolean state logic',
      'Understand floating pins and internal INPUT_PULLUP',
      'Toggle an LED based on real-time mechanical contact',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'pushbutton', 'led_red', 'resistor_220'],
    wiringGuide: [
      { from: 'Arduino Pin D2', to: 'Pushbutton Pin 1', color: '#7FE7D6', purpose: 'Digital Input with Pull-up' },
      { from: 'Pushbutton Pin 2', to: 'Arduino GND', color: '#040B08', purpose: 'Ground closure on press' },
      { from: 'Arduino Pin D13', to: 'Resistor Lead 1', color: '#39FF6A', purpose: 'Indicator output' },
      { from: 'Resistor Lead 2', to: 'LED Anode (+)', color: '#FF9A1F', purpose: 'Limit LED current' },
      { from: 'LED Cathode (-)', to: 'Arduino GND', color: '#040B08', purpose: 'Indicator return' },
    ],
    starterCode: `const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
            { id: 'pin_d2', name: 'D2', type: 'DIGITAL_IO', position3D: [-3.6, 0.2, -0.8] },
            { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO', position3D: [-2.0, 0.2, -0.8] },
          ],
        },
        {
          id: 'breadboard_1',
          typeId: 'breadboard_half',
          name: 'Half Breadboard',
          category: 'PROTOTYPING',
          model3DUrl: '/models/breadboard_half.glb',
          position: [1.2, 0, 0],
          rotation: [0, 0, 0],
          properties: { tiePoints: 400 },
          pins: [],
        },
        {
          id: 'pushbutton_1',
          typeId: 'pushbutton',
          name: 'Tactile Pushbutton',
          category: 'PASSIVE',
          model3DUrl: '/models/pushbutton.glb',
          position: [0.8, 0.2, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 't1', name: 'Terminal 1', type: 'DIGITAL_IO', position3D: [0.8, 0.25, -0.2] },
            { id: 't2', name: 'Terminal 2', type: 'GROUND', position3D: [0.8, 0.25, 0.2] },
          ],
        },
        {
          id: 'led_red_1',
          typeId: 'led_red',
          name: 'Red LED',
          category: 'ACTUATOR',
          model3DUrl: '/models/led_red.glb',
          position: [1.6, 0.25, 0],
          rotation: [0, 0, 0],
          properties: { color: '#FF3333' },
          pins: [
            { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', position3D: [1.6, 0.3, -0.2] },
            { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', position3D: [1.6, 0.3, 0.2] },
          ],
        },
        {
          id: 'resistor_220_1',
          typeId: 'resistor_220',
          name: '220Ω Resistor',
          category: 'PASSIVE',
          model3DUrl: '/models/resistor.glb',
          position: [1.1, 0.2, -0.6],
          rotation: [0, 0, 0],
          properties: { resistanceOhms: 220 },
          pins: [
            { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO', position3D: [1.0, 0.25, -0.8] },
            { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO', position3D: [1.2, 0.25, -0.4] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#7FE7D6', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d2', toComponentId: 'pushbutton_1', toPinId: 't1' },
        { id: 'w2', color: '#040B08', fromComponentId: 'pushbutton_1', fromPinId: 't2', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd_1' },
        { id: 'w3', color: '#39FF6A', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d13', toComponentId: 'resistor_220_1', toPinId: 'lead_1' },
        { id: 'w4', color: '#FF9A1F', fromComponentId: 'resistor_220_1', fromPinId: 'lead_2', toComponentId: 'led_red_1', toPinId: 'anode' },
        { id: 'w5', color: '#040B08', fromComponentId: 'led_red_1', fromPinId: 'cathode', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd_1' },
      ],
    },
  },

  // 3. POTENTIOMETER
  {
    id: 'les_03_potentiometer',
    lessonNumber: 3,
    slug: 'potentiometer-analog-read',
    title: '3. Potentiometer Analog Reading',
    category: 'Analog',
    level: 'ROOKIE',
    durationMinutes: 15,
    xpReward: 100,
    description: 'Sample continuous voltage from 0V to 5V using the 10-bit Analog-to-Digital Converter (ADC).',
    objectives: [
      'Learn analogRead() mapping (0 to 1023)',
      'Compute voltage = rawValue * (5.0 / 1023.0)',
      'Stream live telemetry over Serial.begin(9600)',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'potentiometer'],
    wiringGuide: [
      { from: 'Pot Terminal 1', to: 'Arduino 5V', color: '#FF4D4D', purpose: 'Upper rail voltage' },
      { from: 'Pot Wiper (Center)', to: 'Arduino A0', color: '#FF9A1F', purpose: 'Analog voltage sample' },
      { from: 'Pot Terminal 3', to: 'Arduino GND', color: '#040B08', purpose: 'Lower ground rail' },
    ],
    starterCode: `void setup() {
  Serial.begin(9600);
}

void loop() {
  int rawValue = analogRead(A0);
  float voltage = rawValue * (5.0 / 1023.0);
  Serial.print("Raw ADC: ");
  Serial.print(rawValue);
  Serial.print(" | Voltage: ");
  Serial.println(voltage);
  delay(150);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.2, 0.2, 0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
            { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN', position3D: [-3.0, 0.2, 0.8] },
          ],
        },
        {
          id: 'potentiometer_1',
          typeId: 'potentiometer',
          name: '10kΩ Rotary Potentiometer',
          category: 'PASSIVE',
          model3DUrl: '/models/potentiometer.glb',
          position: [1.2, 0.2, 0],
          rotation: [0, 0, 0],
          properties: { resistanceOhms: 10000 },
          pins: [
            { id: 't1', name: 'VCC', type: 'POWER_VCC', position3D: [1.0, 0.25, -0.2] },
            { id: 'wiper', name: 'WIPER', type: 'ANALOG_IN', position3D: [1.2, 0.25, 0] },
            { id: 't3', name: 'GND', type: 'GROUND', position3D: [1.4, 0.25, 0.2] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#FF4D4D', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_5v', toComponentId: 'potentiometer_1', toPinId: 't1' },
        { id: 'w2', color: '#FF9A1F', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_a0', toComponentId: 'potentiometer_1', toPinId: 'wiper' },
        { id: 'w3', color: '#040B08', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_gnd_1', toComponentId: 'potentiometer_1', toPinId: 't3' },
      ],
    },
  },

  // 4. PWM LED FADING
  {
    id: 'les_04_pwm_fade',
    lessonNumber: 4,
    slug: 'pwm-led-fade',
    title: '4. PWM LED Breathing & Fading',
    category: 'Basics',
    level: 'ROOKIE',
    durationMinutes: 15,
    xpReward: 100,
    description: 'Modulate apparent LED brightness with 490Hz Pulse Width Modulation (PWM) on Pin D9.',
    objectives: [
      'Master analogWrite(pin, dutyCycle) between 0 and 255',
      'Compute PWM duty cycle percentages',
      'Synthesize smooth breathing LED transitions',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'resistor_220', 'led_red'],
    wiringGuide: [
      { from: 'Arduino Pin D9 (PWM)', to: 'Resistor Lead 1', color: '#4C8DFF', purpose: 'High-speed PWM signal' },
      { from: 'Resistor Lead 2', to: 'LED Anode (+)', color: '#FF9A1F', purpose: 'Current-limited signal' },
      { from: 'LED Cathode (-)', to: 'Arduino GND', color: '#040B08', purpose: 'Ground return loop' },
    ],
    starterCode: `const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (int b = 0; b <= 255; b += 5) {
    analogWrite(LED_PIN, b);
    delay(20);
  }
  for (int b = 255; b >= 0; b -= 5) {
    analogWrite(LED_PIN, b);
    delay(20);
  }
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d9', name: 'D9', type: 'PWM', position3D: [-2.8, 0.2, -0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
          ],
        },
        {
          id: 'resistor_220_1',
          typeId: 'resistor_220',
          name: '220Ω Resistor',
          category: 'PASSIVE',
          model3DUrl: '/models/resistor.glb',
          position: [1.0, 0.2, 0],
          rotation: [0, 0, 0],
          properties: { resistanceOhms: 220 },
          pins: [
            { id: 'lead_1', name: 'Lead 1', type: 'DIGITAL_IO', position3D: [1.0, 0.25, -0.3] },
            { id: 'lead_2', name: 'Lead 2', type: 'DIGITAL_IO', position3D: [1.0, 0.25, 0.3] },
          ],
        },
        {
          id: 'led_red_1',
          typeId: 'led_red',
          name: 'Red LED',
          category: 'ACTUATOR',
          model3DUrl: '/models/led_red.glb',
          position: [1.6, 0.25, 0],
          rotation: [0, 0, 0],
          properties: { color: '#FF3333' },
          pins: [
            { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', position3D: [1.6, 0.3, -0.2] },
            { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', position3D: [1.6, 0.3, 0.2] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#4C8DFF', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d9', toComponentId: 'resistor_220_1', toPinId: 'lead_1' },
        { id: 'w2', color: '#FF9A1F', fromComponentId: 'resistor_220_1', fromPinId: 'lead_2', toComponentId: 'led_red_1', toPinId: 'anode' },
        { id: 'w3', color: '#040B08', fromComponentId: 'led_red_1', fromPinId: 'cathode', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd_1' },
      ],
    },
  },

  // 5. RGB LED COLOR MIXING
  {
    id: 'les_05_rgb_led',
    lessonNumber: 5,
    slug: 'rgb-led-color-mixing',
    title: '5. RGB LED Color Mixing',
    category: 'Basics',
    level: 'ROOKIE',
    durationMinutes: 15,
    xpReward: 100,
    description: 'Combine Red, Green, and Blue channels via triple PWM pins to synthesize 16 million colors.',
    objectives: [
      'Learn additive color synthesis',
      'Control 3 PWM channels simultaneously',
      'Generate RoboVerse Neon Green (#39FF6A)',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'led_rgb', 'resistor_220'],
    wiringGuide: [
      { from: 'Arduino D9 (PWM)', to: 'RGB Red Pin', color: '#FF4D4D', purpose: 'Red PWM channel' },
      { from: 'Arduino D10 (PWM)', to: 'RGB Green Pin', color: '#39FF6A', purpose: 'Green PWM channel' },
      { from: 'Arduino D11 (PWM)', to: 'RGB Blue Pin', color: '#4C8DFF', purpose: 'Blue PWM channel' },
      { from: 'RGB Cathode', to: 'Arduino GND', color: '#040B08', purpose: 'Common ground return' },
    ],
    starterCode: `const int RED = 9;
const int GREEN = 10;
const int BLUE = 11;

void setColor(int r, int g, int b) {
  analogWrite(RED, r);
  analogWrite(GREEN, g);
  analogWrite(BLUE, b);
}

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);
}

void loop() {
  setColor(255, 0, 0);   // Red
  delay(1000);
  setColor(0, 255, 0);   // Green
  delay(1000);
  setColor(0, 0, 255);   // Blue
  delay(1000);
  setColor(57, 255, 106); // RoboVerse Neon Green
  delay(1000);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d9', name: 'D9', type: 'PWM', position3D: [-2.8, 0.2, -0.8] },
            { id: 'pin_d10', name: 'D10', type: 'PWM', position3D: [-2.6, 0.2, -0.8] },
            { id: 'pin_d11', name: 'D11', type: 'PWM', position3D: [-2.4, 0.2, -0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
          ],
        },
        {
          id: 'led_rgb_1',
          typeId: 'led_rgb',
          name: 'RGB LED (Common Cathode)',
          category: 'ACTUATOR',
          model3DUrl: '/models/led_rgb.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 'r', name: 'Red', type: 'DIGITAL_IO', position3D: [1.0, 0.3, -0.2] },
            { id: 'cathode', name: 'Cathode', type: 'GROUND', position3D: [1.1, 0.3, -0.1] },
            { id: 'g', name: 'Green', type: 'DIGITAL_IO', position3D: [1.2, 0.3, 0.1] },
            { id: 'b', name: 'Blue', type: 'DIGITAL_IO', position3D: [1.3, 0.3, 0.2] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#FF4D4D', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d9', toComponentId: 'led_rgb_1', toPinId: 'r' },
        { id: 'w2', color: '#39FF6A', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d10', toComponentId: 'led_rgb_1', toPinId: 'g' },
        { id: 'w3', color: '#4C8DFF', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d11', toComponentId: 'led_rgb_1', toPinId: 'b' },
        { id: 'w4', color: '#040B08', fromComponentId: 'led_rgb_1', fromPinId: 'cathode', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd_1' },
      ],
    },
  },

  // 6. BUZZER TONE
  {
    id: 'les_06_buzzer',
    lessonNumber: 6,
    slug: 'active-buzzer-tone',
    title: '6. Active Buzzer Tone Synthesis',
    category: 'Actuators',
    level: 'ROOKIE',
    durationMinutes: 10,
    xpReward: 100,
    description: 'Synthesize audible alert frequencies and musical notes using a piezo buzzer transducer.',
    objectives: [
      'Master the tone(pin, freq, duration) function',
      'Understand audio acoustic resonance in Hertz',
      'Create alert beeps and warning sirens',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'buzzer_active'],
    wiringGuide: [
      { from: 'Arduino Pin D8', to: 'Buzzer Positive (+)', color: '#FF9A1F', purpose: 'Acoustic tone output' },
      { from: 'Buzzer Negative (-)', to: 'Arduino GND', color: '#040B08', purpose: 'Ground return' },
    ],
    starterCode: `const int BUZZER_PIN = 8;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  tone(BUZZER_PIN, 1000, 200); // 1 kHz beep
  delay(400);
  tone(BUZZER_PIN, 1500, 200); // 1.5 kHz beep
  delay(1000);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d8', name: 'D8', type: 'DIGITAL_IO', position3D: [-3.0, 0.2, -0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
          ],
        },
        {
          id: 'buzzer_1',
          typeId: 'buzzer_active',
          name: 'Active Buzzer 5V',
          category: 'ACTUATOR',
          model3DUrl: '/models/buzzer.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 'pos', name: '+', type: 'DIGITAL_IO', position3D: [1.1, 0.3, -0.1] },
            { id: 'neg', name: '-', type: 'GROUND', position3D: [1.3, 0.3, 0.1] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#FF9A1F', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d8', toComponentId: 'buzzer_1', toPinId: 'pos' },
        { id: 'w2', color: '#040B08', fromComponentId: 'buzzer_1', fromPinId: 'neg', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd_1' },
      ],
    },
  },

  // 7. LDR LIGHT SENSOR
  {
    id: 'les_07_ldr_light',
    lessonNumber: 7,
    slug: 'ldr-light-sensor-night-lamp',
    title: '7. LDR Light Sensor Night Lamp',
    category: 'Sensors',
    level: 'ROOKIE',
    durationMinutes: 20,
    xpReward: 100,
    description: 'Construct an automatic twilight night lamp that lights up when ambient room light diminishes.',
    objectives: [
      'Understand Cadmium-Sulfide (CdS) photoresistors',
      'Construct a voltage divider with a 10kΩ fixed resistor',
      'Implement threshold detection logic for automatic switching',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'ldr_photoresistor', 'resistor_10k', 'led_red', 'resistor_220'],
    wiringGuide: [
      { from: 'LDR Pin 1', to: 'Arduino 5V', color: '#FF4D4D', purpose: 'Divider upper rail' },
      { from: 'LDR Pin 2 / 10kΩ Node', to: 'Arduino A0', color: '#FF9A1F', purpose: 'Sensor voltage junction' },
      { from: '10kΩ Resistor Pin 2', to: 'Arduino GND', color: '#040B08', purpose: 'Divider ground return' },
      { from: 'Arduino Pin D13', to: 'LED Anode (+)', color: '#39FF6A', purpose: 'Night lamp switch' },
    ],
    starterCode: `const int LDR_PIN = A0;
const int LED_PIN = 13;
const int THRESHOLD = 500;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(LDR_PIN);
  Serial.println(lightLevel);
  if (lightLevel < THRESHOLD) {
    digitalWrite(LED_PIN, HIGH); // Turn on lamp in dark
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(100);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.2, 0.2, 0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
            { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN', position3D: [-3.0, 0.2, 0.8] },
            { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO', position3D: [-2.0, 0.2, -0.8] },
          ],
        },
        {
          id: 'ldr_1',
          typeId: 'ldr_photoresistor',
          name: 'LDR Photoresistor',
          category: 'SENSOR',
          model3DUrl: '/models/ldr.glb',
          position: [1.0, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 't1', name: 'T1', type: 'POWER_VCC', position3D: [0.9, 0.25, -0.1] },
            { id: 't2', name: 'T2', type: 'ANALOG_IN', position3D: [1.1, 0.25, 0.1] },
          ],
        },
        {
          id: 'led_red_1',
          typeId: 'led_red',
          name: 'Night Lamp LED',
          category: 'ACTUATOR',
          model3DUrl: '/models/led_red.glb',
          position: [1.8, 0.25, 0],
          rotation: [0, 0, 0],
          properties: { color: '#FF3333' },
          pins: [
            { id: 'anode', name: 'Anode', type: 'DIGITAL_IO', position3D: [1.7, 0.3, -0.1] },
            { id: 'cathode', name: 'Cathode', type: 'GROUND', position3D: [1.9, 0.3, 0.1] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#FF4D4D', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_5v', toComponentId: 'ldr_1', toPinId: 't1' },
        { id: 'w2', color: '#FF9A1F', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_a0', toComponentId: 'ldr_1', toPinId: 't2' },
        { id: 'w3', color: '#39FF6A', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d13', toComponentId: 'led_red_1', toPinId: 'anode' },
        { id: 'w4', color: '#040B08', fromComponentId: 'led_red_1', fromPinId: 'cathode', toComponentId: 'arduino_uno_1', toPinId: 'pin_gnd_1' },
      ],
    },
  },

  // 8. ULTRASONIC DISTANCE SENSOR
  {
    id: 'les_08_ultrasonic',
    lessonNumber: 8,
    slug: 'ultrasonic-distance-meter',
    title: '8. Ultrasonic Distance Meter (HC-SR04)',
    category: 'Sensors',
    level: 'ROOKIE',
    durationMinutes: 20,
    xpReward: 100,
    description: 'Measure target distances with millimeter precision using 40kHz acoustic pulse timing.',
    objectives: [
      'Master pulseIn(pin, HIGH) microsecond timing',
      'Compute distance = duration * 0.0343 / 2.0',
      'Handle echo timeouts and range limits (2cm - 400cm)',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'ultrasonic_hcsr04'],
    wiringGuide: [
      { from: 'HC-SR04 VCC', to: 'Arduino 5V', color: '#FF4D4D', purpose: '5V Power rail' },
      { from: 'HC-SR04 GND', to: 'Arduino GND', color: '#040B08', purpose: 'Ground return' },
      { from: 'HC-SR04 TRIG', to: 'Arduino D7', color: '#FACC15', purpose: '10µs acoustic burst trigger' },
      { from: 'HC-SR04 ECHO', to: 'Arduino D6', color: '#7FE7D6', purpose: 'Echo reflection timing' },
    ],
    starterCode: `const int TRIG_PIN = 7;
const int ECHO_PIN = 6;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.0343 / 2.0;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(150);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.2, 0.2, 0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
            { id: 'pin_d7', name: 'D7', type: 'DIGITAL_IO', position3D: [-3.2, 0.2, -0.8] },
            { id: 'pin_d6', name: 'D6', type: 'DIGITAL_IO', position3D: [-3.4, 0.2, -0.8] },
          ],
        },
        {
          id: 'sonar_1',
          typeId: 'ultrasonic_hcsr04',
          name: 'HC-SR04 Sonar',
          category: 'SENSOR',
          model3DUrl: '/models/ultrasonic.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 'vcc', name: 'VCC', type: 'POWER_VCC', position3D: [1.0, 0.25, -0.2] },
            { id: 'trig', name: 'TRIG', type: 'DIGITAL_IO', position3D: [1.1, 0.25, -0.1] },
            { id: 'echo', name: 'ECHO', type: 'DIGITAL_IO', position3D: [1.2, 0.25, 0.1] },
            { id: 'gnd', name: 'GND', type: 'GROUND', position3D: [1.3, 0.25, 0.2] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#FF4D4D', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_5v', toComponentId: 'sonar_1', toPinId: 'vcc' },
        { id: 'w2', color: '#040B08', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_gnd_1', toComponentId: 'sonar_1', toPinId: 'gnd' },
        { id: 'w3', color: '#FACC15', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d7', toComponentId: 'sonar_1', toPinId: 'trig' },
        { id: 'w4', color: '#7FE7D6', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d6', toComponentId: 'sonar_1', toPinId: 'echo' },
      ],
    },
  },

  // 9. SERVO SWEEP
  {
    id: 'les_09_servo_sweep',
    lessonNumber: 9,
    slug: 'sg90-servo-sweep',
    title: '9. Servo Sweep & Angle Control',
    category: 'Actuators',
    level: 'ROOKIE',
    durationMinutes: 15,
    xpReward: 100,
    description: 'Directly position an SG90 micro servo arm from 0° to 180° using PWM pulse widths.',
    objectives: [
      'Learn the standard <Servo.h> library',
      'Understand 1ms to 2ms PPM positioning pulses',
      'Sweep robotic joint linkages smoothly',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'servo_sg90'],
    wiringGuide: [
      { from: 'Servo Red wire', to: 'Arduino 5V', color: '#FF4D4D', purpose: '5V Motor power' },
      { from: 'Servo Brown wire', to: 'Arduino GND', color: '#040B08', purpose: 'Ground return' },
      { from: 'Servo Orange wire', to: 'Arduino D9 (PWM)', color: '#FF9A1F', purpose: 'PWM position command' },
    ],
    starterCode: `#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 2) {
    myServo.write(pos);
    delay(15);
  }
  for (int pos = 180; pos >= 0; pos -= 2) {
    myServo.write(pos);
    delay(15);
  }
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.2, 0.2, 0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
            { id: 'pin_d9', name: 'D9', type: 'PWM', position3D: [-2.8, 0.2, -0.8] },
          ],
        },
        {
          id: 'servo_1',
          typeId: 'servo_sg90',
          name: 'SG90 Micro Servo',
          category: 'ACTUATOR',
          model3DUrl: '/models/servo_sg90.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 'vcc', name: 'VCC', type: 'POWER_VCC', position3D: [1.0, 0.25, -0.1] },
            { id: 'gnd', name: 'GND', type: 'GROUND', position3D: [1.2, 0.25, 0] },
            { id: 'pwm', name: 'PWM', type: 'PWM', position3D: [1.4, 0.25, 0.1] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#FF4D4D', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_5v', toComponentId: 'servo_1', toPinId: 'vcc' },
        { id: 'w2', color: '#040B08', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_gnd_1', toComponentId: 'servo_1', toPinId: 'gnd' },
        { id: 'w3', color: '#FF9A1F', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d9', toComponentId: 'servo_1', toPinId: 'pwm' },
      ],
    },
  },

  // 10. DC MOTOR WITH L298N
  {
    id: 'les_10_dc_motor',
    lessonNumber: 10,
    slug: 'dc-motor-l298n-driver',
    title: '10. DC Motor Control with L298N',
    category: 'Actuators',
    level: 'BUILDER',
    durationMinutes: 25,
    xpReward: 100,
    description: 'Drive high-current DC gear motors with bi-directional forward/reverse and PWM velocity control.',
    objectives: [
      'Master H-bridge dual forward/reverse switching',
      'Learn motor speed control with ENA PWM',
      'Understand inductive flyback diode protection',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'motor_driver_l298n', 'dc_motor_gear'],
    wiringGuide: [
      { from: 'Arduino D4', to: 'L298N IN1', color: '#39FF6A', purpose: 'Direction input 1' },
      { from: 'Arduino D5', to: 'L298N IN2', color: '#7FE7D6', purpose: 'Direction input 2' },
      { from: 'Arduino D3 (PWM)', to: 'L298N ENA', color: '#4C8DFF', purpose: 'Speed PWM input' },
    ],
    starterCode: `const int IN1 = 4;
const int IN2 = 5;
const int ENA = 3;

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
}

void loop() {
  // Forward half speed
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 150);
  delay(2000);

  // Reverse full speed
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, 255);
  delay(2000);

  // Stop
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  delay(1000);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d3', name: 'D3', type: 'PWM', position3D: [-3.4, 0.2, -0.8] },
            { id: 'pin_d4', name: 'D4', type: 'DIGITAL_IO', position3D: [-3.2, 0.2, -0.8] },
            { id: 'pin_d5', name: 'D5', type: 'DIGITAL_IO', position3D: [-3.0, 0.2, -0.8] },
          ],
        },
        {
          id: 'driver_1',
          typeId: 'motor_driver_l298n',
          name: 'L298N Motor Driver',
          category: 'ACTUATOR',
          model3DUrl: '/models/l298n.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 'in1', name: 'IN1', type: 'DIGITAL_IO', position3D: [1.0, 0.25, -0.2] },
            { id: 'in2', name: 'IN2', type: 'DIGITAL_IO', position3D: [1.2, 0.25, -0.1] },
            { id: 'ena', name: 'ENA', type: 'PWM', position3D: [1.4, 0.25, 0.1] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#39FF6A', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d4', toComponentId: 'driver_1', toPinId: 'in1' },
        { id: 'w2', color: '#7FE7D6', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d5', toComponentId: 'driver_1', toPinId: 'in2' },
        { id: 'w3', color: '#4C8DFF', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d3', toComponentId: 'driver_1', toPinId: 'ena' },
      ],
    },
  },

  // 11. PIR MOTION ALARM
  {
    id: 'les_11_pir_alarm',
    lessonNumber: 11,
    slug: 'pir-motion-alarm',
    title: '11. PIR Motion Security Alarm',
    category: 'Sensors',
    level: 'BUILDER',
    durationMinutes: 20,
    xpReward: 100,
    description: 'Protect a perimeter by triggering sound and light alarms upon human thermal infrared detection.',
    objectives: [
      'Learn passive pyroelectric infrared detection',
      'Handle sensor warmup and stabilization delay',
      'Trigger buzzer sirens and visual alarm latches',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'pir_motion', 'buzzer_active', 'led_red'],
    wiringGuide: [
      { from: 'PIR OUT pin', to: 'Arduino D2', color: '#7FE7D6', purpose: 'Motion interrupt signal' },
      { from: 'Arduino D8', to: 'Buzzer Positive', color: '#FF9A1F', purpose: 'Audio siren trigger' },
      { from: 'Arduino D13', to: 'LED Anode', color: '#39FF6A', purpose: 'Visual strobe warning' },
    ],
    starterCode: `const int PIR_PIN = 2;
const int LED_PIN = 13;
const int BUZZER_PIN = 8;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  if (motion == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 2000, 100);
    Serial.println("INTRUDER DETECTED!");
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(100);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d2', name: 'D2', type: 'DIGITAL_IO', position3D: [-3.6, 0.2, -0.8] },
            { id: 'pin_d8', name: 'D8', type: 'DIGITAL_IO', position3D: [-3.0, 0.2, -0.8] },
            { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO', position3D: [-2.0, 0.2, -0.8] },
          ],
        },
        {
          id: 'pir_1',
          typeId: 'pir_motion',
          name: 'HC-SR501 PIR',
          category: 'SENSOR',
          model3DUrl: '/models/pir.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [{ id: 'out', name: 'OUT', type: 'DIGITAL_IO', position3D: [1.2, 0.25, 0] }],
        },
      ],
      wires: [
        { id: 'w1', color: '#7FE7D6', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d2', toComponentId: 'pir_1', toPinId: 'out' },
      ],
    },
  },

  // 12. DHT11 TEMPERATURE & HUMIDITY
  {
    id: 'les_12_dht11_temp',
    lessonNumber: 12,
    slug: 'dht11-temperature-humidity',
    title: '12. DHT11 Temperature & Humidity',
    category: 'Sensors',
    level: 'BUILDER',
    durationMinutes: 20,
    xpReward: 100,
    description: 'Read calibrated atmospheric data over a single-wire digital protocol.',
    objectives: [
      'Learn single-wire proprietary timing bus',
      'Compute relative humidity % and Celsius temperature',
      'Calculate heat index and climate comfort metrics',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'dht11'],
    wiringGuide: [
      { from: 'DHT11 VCC', to: 'Arduino 5V', color: '#FF4D4D', purpose: '5V Power rail' },
      { from: 'DHT11 DATA', to: 'Arduino D4', color: '#7FE7D6', purpose: 'Single-wire digital data' },
      { from: 'DHT11 GND', to: 'Arduino GND', color: '#040B08', purpose: 'Ground return' },
    ],
    starterCode: `#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print("% | Temp: ");
  Serial.print(t);
  Serial.println(" C");
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_5v', name: '5V', type: 'POWER_VCC', position3D: [-2.2, 0.2, 0.8] },
            { id: 'pin_gnd_1', name: 'GND', type: 'GROUND', position3D: [-2.0, 0.2, 0.8] },
            { id: 'pin_d4', name: 'D4', type: 'DIGITAL_IO', position3D: [-3.2, 0.2, -0.8] },
          ],
        },
        {
          id: 'dht11_1',
          typeId: 'dht11',
          name: 'DHT11 Sensor',
          category: 'SENSOR',
          model3DUrl: '/models/dht11.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 'vcc', name: 'VCC', type: 'POWER_VCC', position3D: [1.0, 0.25, -0.1] },
            { id: 'data', name: 'DATA', type: 'DIGITAL_IO', position3D: [1.2, 0.25, 0] },
            { id: 'gnd', name: 'GND', type: 'GROUND', position3D: [1.4, 0.25, 0.1] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#FF4D4D', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_5v', toComponentId: 'dht11_1', toPinId: 'vcc' },
        { id: 'w2', color: '#7FE7D6', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d4', toComponentId: 'dht11_1', toPinId: 'data' },
        { id: 'w3', color: '#040B08', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_gnd_1', toComponentId: 'dht11_1', toPinId: 'gnd' },
      ],
    },
  },

  // 13. LCD 16X2 I2C DISPLAY
  {
    id: 'les_13_lcd_display',
    lessonNumber: 13,
    slug: 'lcd-16x2-i2c-screen',
    title: '13. LCD 16x2 Character Display',
    category: 'Displays',
    level: 'BUILDER',
    durationMinutes: 20,
    xpReward: 100,
    description: 'Render text, sensor metrics, and custom UI telemetry on a 16-col x 2-row backlit LCD via I2C.',
    objectives: [
      'Understand the 2-wire I2C communication protocol',
      'Learn LiquidCrystal_I2C initialization and cursor positioning',
      'Format clean telemetry status dashboards',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'lcd_16x2_i2c'],
    wiringGuide: [
      { from: 'LCD SDA', to: 'Arduino A4 (SDA)', color: '#A855F7', purpose: 'I2C Serial Data' },
      { from: 'LCD SCL', to: 'Arduino A5 (SCL)', color: '#FACC15', purpose: 'I2C Serial Clock' },
      { from: 'LCD VCC', to: 'Arduino 5V', color: '#FF4D4D', purpose: '5V Display power' },
      { from: 'LCD GND', to: 'Arduino GND', color: '#040B08', purpose: 'Ground return' },
    ],
    starterCode: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("RoboVerse v2.0");
  lcd.setCursor(0, 1);
  lcd.print("Systems Online!");
}

void loop() {
  // Static telemetry banner
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_a4', name: 'A4', type: 'I2C_SDA', position3D: [-3.8, 0.2, 0.8] },
            { id: 'pin_a5', name: 'A5', type: 'I2C_SCL', position3D: [-4.0, 0.2, 0.8] },
          ],
        },
        {
          id: 'lcd_1',
          typeId: 'lcd_16x2_i2c',
          name: 'LCD 16x2 I2C',
          category: 'DISPLAY',
          model3DUrl: '/models/lcd.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [
            { id: 'sda', name: 'SDA', type: 'I2C_SDA', position3D: [1.1, 0.25, 0] },
            { id: 'scl', name: 'SCL', type: 'I2C_SCL', position3D: [1.3, 0.25, 0] },
          ],
        },
      ],
      wires: [
        { id: 'w1', color: '#A855F7', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_a4', toComponentId: 'lcd_1', toPinId: 'sda' },
        { id: 'w2', color: '#FACC15', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_a5', toComponentId: 'lcd_1', toPinId: 'scl' },
      ],
    },
  },

  // 14. RELAY SWITCH
  {
    id: 'les_14_relay_switch',
    lessonNumber: 14,
    slug: 'relay-module-switch',
    title: '14. Relay Switch for High Power Loads',
    category: 'Systems',
    level: 'BUILDER',
    durationMinutes: 15,
    xpReward: 100,
    description: 'Safely switch isolated high-power external loads using a 5V opto-coupled relay.',
    objectives: [
      'Learn electro-mechanical relay isolation',
      'Master NO (Normally Open) and NC (Normally Closed) terminals',
      'Control appliances safely with low-voltage logic',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'relay_1ch'],
    wiringGuide: [
      { from: 'Arduino D7', to: 'Relay IN pin', color: '#7FE7D6', purpose: 'Active-low coil trigger' },
      { from: 'Arduino 5V', to: 'Relay VCC', color: '#FF4D4D', purpose: '5V Coil excitation' },
      { from: 'Arduino GND', to: 'Relay GND', color: '#040B08', purpose: 'Ground return' },
    ],
    starterCode: `const int RELAY_PIN = 7;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
}

void loop() {
  digitalWrite(RELAY_PIN, LOW);  // Active-LOW Energize
  delay(3000);
  digitalWrite(RELAY_PIN, HIGH); // De-energize
  delay(3000);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d7', name: 'D7', type: 'DIGITAL_IO', position3D: [-3.2, 0.2, -0.8] },
          ],
        },
        {
          id: 'relay_1',
          typeId: 'relay_1ch',
          name: '5V Relay Module',
          category: 'ACTUATOR',
          model3DUrl: '/models/relay.glb',
          position: [1.2, 0.25, 0],
          rotation: [0, 0, 0],
          properties: {},
          pins: [{ id: 'in', name: 'IN', type: 'DIGITAL_IO', position3D: [1.2, 0.25, 0] }],
        },
      ],
      wires: [
        { id: 'w1', color: '#7FE7D6', fromComponentId: 'arduino_uno_1', fromPinId: 'pin_d7', toComponentId: 'relay_1', toPinId: 'in' },
      ],
    },
  },

  // 15. TRAFFIC LIGHT INTERSECTION
  {
    id: 'les_15_traffic_light',
    lessonNumber: 15,
    slug: 'smart-traffic-light-intersection',
    title: '15. Smart Traffic Light Intersection',
    category: 'Systems',
    level: 'BUILDER',
    durationMinutes: 20,
    xpReward: 100,
    description: 'Implement finite state machine (FSM) sequencing for a busy road intersection with Red, Yellow, and Green phases.',
    objectives: [
      'Learn finite state machine (FSM) principles',
      'Implement non-blocking state transitions',
      'Coordinate multi-signal output routines',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'led_red', 'led_yellow', 'led_green', 'resistor_220'],
    wiringGuide: [
      { from: 'Arduino D10', to: 'Red LED Anode', color: '#FF4D4D', purpose: 'Stop phase' },
      { from: 'Arduino D9', to: 'Yellow LED Anode', color: '#FACC15', purpose: 'Caution phase' },
      { from: 'Arduino D8', to: 'Green LED Anode', color: '#39FF6A', purpose: 'Go phase' },
    ],
    starterCode: `const int RED = 10;
const int YELLOW = 9;
const int GREEN = 8;

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(GREEN, OUTPUT);
}

void loop() {
  // Green Go (5s)
  digitalWrite(GREEN, HIGH);
  digitalWrite(YELLOW, LOW);
  digitalWrite(RED, LOW);
  delay(5000);

  // Yellow Caution (1.5s)
  digitalWrite(GREEN, LOW);
  digitalWrite(YELLOW, HIGH);
  delay(1500);

  // Red Stop (5s)
  digitalWrite(YELLOW, LOW);
  digitalWrite(RED, HIGH);
  delay(5000);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d10', name: 'D10', type: 'DIGITAL_IO', position3D: [-2.6, 0.2, -0.8] },
            { id: 'pin_d9', name: 'D9', type: 'DIGITAL_IO', position3D: [-2.8, 0.2, -0.8] },
            { id: 'pin_d8', name: 'D8', type: 'DIGITAL_IO', position3D: [-3.0, 0.2, -0.8] },
          ],
        },
      ],
      wires: [],
    },
  },

  // 16. PARKING SENSOR RADAR
  {
    id: 'les_16_parking_sensor',
    lessonNumber: 16,
    slug: 'car-parking-sensor-system',
    title: '16. Ultrasonic Reverse Parking Sensor',
    category: 'Systems',
    level: 'BUILDER',
    durationMinutes: 25,
    xpReward: 100,
    description: 'Synthesize an automotive reverse parking radar with dynamic buzzer beeping frequencies based on proximity.',
    objectives: [
      'Combine acoustic distance measurement with real-time audio telemetry',
      'Implement tiered warning zones (Safe, Warning, Critical)',
      'Calculate inverse proportional audio beep timing',
    ],
    requiredComponents: ['arduino_uno', 'breadboard', 'ultrasonic_hcsr04', 'buzzer_active', 'led_red'],
    wiringGuide: [
      { from: 'HC-SR04 TRIG', to: 'Arduino D7', color: '#FACC15', purpose: 'Acoustic burst trigger' },
      { from: 'HC-SR04 ECHO', to: 'Arduino D6', color: '#7FE7D6', purpose: 'Echo return timing' },
      { from: 'Arduino D8', to: 'Buzzer Positive (+)', color: '#FF9A1F', purpose: 'Proximity audio tone' },
      { from: 'Arduino D13', to: 'LED Anode (+)', color: '#39FF6A', purpose: 'Proximity visual warning' },
    ],
    starterCode: `const int TRIG = 7;
const int ECHO = 6;
const int BUZZER = 8;
const int LED = 13;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long d = pulseIn(ECHO, HIGH) * 0.0343 / 2.0;

  if (d < 10) { // Critical Zone (< 10cm)
    digitalWrite(LED, HIGH);
    tone(BUZZER, 2500);
  } else if (d < 30) { // Warning Zone (10 - 30cm)
    digitalWrite(LED, HIGH);
    tone(BUZZER, 1800, 50);
    delay(d * 10);
    digitalWrite(LED, LOW);
  } else { // Safe Zone
    digitalWrite(LED, LOW);
    noTone(BUZZER);
  }
  delay(100);
}`,
    sampleAssembly: {
      components: [
        {
          id: 'arduino_uno_1',
          typeId: 'arduino_uno',
          name: 'Arduino Uno R3',
          category: 'MICROCONTROLLER',
          model3DUrl: '/models/arduino_uno.glb',
          position: [-2.8, 0, 0],
          rotation: [0, 0, 0],
          properties: { clockMhz: 16 },
          pins: [
            { id: 'pin_d7', name: 'D7', type: 'DIGITAL_IO', position3D: [-3.2, 0.2, -0.8] },
            { id: 'pin_d6', name: 'D6', type: 'DIGITAL_IO', position3D: [-3.4, 0.2, -0.8] },
            { id: 'pin_d8', name: 'D8', type: 'DIGITAL_IO', position3D: [-3.0, 0.2, -0.8] },
            { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO', position3D: [-2.0, 0.2, -0.8] },
          ],
        },
      ],
      wires: [],
    },
  },
];
