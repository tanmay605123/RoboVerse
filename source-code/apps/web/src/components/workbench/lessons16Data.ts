import { CodeBlockItem } from './BlockCodeEditor';

export interface InteractiveLesson {
  id: string;
  lessonNumber: number;
  title: string;
  badge: string;
  xpAward: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  objective: string;
  description: string;
  componentsNeeded: string[];
  schematicInstructions: string[];
  starterCode: string;
  starterBlocks: CodeBlockItem[];
  solutionCode: string;
  requiredConnections: Array<{ fromType: string; toType: string }>;
}

export const INTERACTIVE_LESSONS_16: InteractiveLesson[] = [
  // 1. Blink an LED
  {
    id: 'lesson_1_blink',
    lessonNumber: 1,
    title: 'Blink an LED: Digital GPIO & Resistors',
    badge: 'GPIO BASICS',
    xpAward: 50,
    difficulty: 'Beginner',
    durationMinutes: 10,
    objective: 'Wire an LED with a 220Ω current-limiting resistor to Digital Pin 13 and cycle it on/off with 1000ms delay.',
    description: 'Learn how microcontrollers communicate with external components using digital binary voltage (5V = HIGH, 0V = LOW).',
    componentsNeeded: ['Arduino Uno R3', 'Half-Size Breadboard', 'Red 5mm LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect Arduino Pin D13 to 220Ω Resistor Lead 1.',
      'Connect Resistor Lead 2 to the LED Anode (+).',
      'Connect the LED Cathode (-) to the Breadboard GND rail.',
      'Connect the Breadboard GND rail to Arduino GND.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 13, mode: 'OUTPUT' } },
      { id: 'b2', type: 'DIGITAL_WRITE', params: { pin: 13, value: 'HIGH' } },
      { id: 'b3', type: 'DELAY', params: { ms: 1000 } },
      { id: 'b4', type: 'DIGITAL_WRITE', params: { pin: 13, value: 'LOW' } },
      { id: 'b5', type: 'DELAY', params: { ms: 1000 } },
    ],
    starterCode: `const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}
`,
    solutionCode: `const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}
`,
    requiredConnections: [
      { fromType: 'arduino', toType: 'resistor' },
      { fromType: 'resistor', toType: 'led' },
      { fromType: 'led', toType: 'arduino' },
    ],
  },

  // 2. Push Button Toggle LED
  {
    id: 'lesson_2_button',
    lessonNumber: 2,
    title: 'Push Button Toggle LED: Digital Inputs',
    badge: 'INPUT / PULLUP',
    xpAward: 60,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objective: 'Read tactile push button state using INPUT_PULLUP on pin 2 and turn on the LED when pressed.',
    description: 'Explore active-low push button logic with internal ATmega328P pull-up resistors.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'Push Button', 'Red LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect Push Button Terminal 1a to Arduino Pin D2.',
      'Connect Push Button Terminal 2a to Breadboard GND.',
      'Connect Arduino Pin D13 to 220Ω resistor and LED anode, cathode to GND.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 2, mode: 'INPUT_PULLUP' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 13, mode: 'OUTPUT' } },
      { id: 'b3', type: 'IF_BUTTON', params: { pin: 2, state: 'LOW', actionPin: 13, actionValue: 'HIGH' } },
    ],
    starterCode: `const int buttonPin = 2;
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
}
`,
    solutionCode: `const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}
`,
    requiredConnections: [
      { fromType: 'button', toType: 'arduino' },
      { fromType: 'resistor', toType: 'led' },
    ],
  },

  // 3. Traffic Lights
  {
    id: 'lesson_3_traffic',
    lessonNumber: 3,
    title: 'Traffic Lights: State Sequencing',
    badge: 'STATE MACHINE',
    xpAward: 75,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objective: 'Wire Red, Yellow, and Green LEDs to pins 10, 11, 12 and program a timed traffic intersection cycle.',
    description: 'Implement timed states: Red (5s), Yellow (2s), Green (5s) with dedicated current-limiting resistors.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'Red LED', 'Yellow LED', 'Green LED', '3x 220Ω Resistors'],
    schematicInstructions: [
      'Wire Red LED on pin 10, Yellow LED on pin 11, Green LED on pin 12.',
      'Ensure each LED has a 220Ω resistor in series.',
      'Tie all three cathodes to common Breadboard GND.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 10, mode: 'OUTPUT' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 11, mode: 'OUTPUT' } },
      { id: 'b3', type: 'PIN_MODE', params: { pin: 12, mode: 'OUTPUT' } },
      { id: 'b4', type: 'DIGITAL_WRITE', params: { pin: 10, value: 'HIGH' } },
      { id: 'b5', type: 'DELAY', params: { ms: 3000 } },
    ],
    starterCode: `const int red = 10, yellow = 11, green = 12;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(yellow, OUTPUT);
  pinMode(green, OUTPUT);
}

void loop() {
  // Red state
  digitalWrite(red, HIGH);
  delay(3000);
  digitalWrite(red, LOW);

  // Yellow state
  digitalWrite(yellow, HIGH);
  delay(1000);
  digitalWrite(yellow, LOW);

  // Green state
  digitalWrite(green, HIGH);
  delay(3000);
  digitalWrite(green, LOW);
}
`,
    solutionCode: `const int red = 10, yellow = 11, green = 12;

void setup() {
  pinMode(red, OUTPUT);
  pinMode(yellow, OUTPUT);
  pinMode(green, OUTPUT);
}

void loop() {
  digitalWrite(red, HIGH);
  delay(3000);
  digitalWrite(red, LOW);
  digitalWrite(yellow, HIGH);
  delay(1000);
  digitalWrite(yellow, LOW);
  digitalWrite(green, HIGH);
  delay(3000);
  digitalWrite(green, LOW);
}
`,
    requiredConnections: [
      { fromType: 'arduino', toType: 'led' },
      { fromType: 'resistor', toType: 'led' },
    ],
  },

  // 4. Potentiometer LED Brightness
  {
    id: 'lesson_4_potentiometer',
    lessonNumber: 4,
    title: 'Potentiometer LED Brightness: ADC & PWM',
    badge: 'ANALOG & PWM',
    xpAward: 75,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objective: 'Map 10-bit analogRead(A0) (0-1023) to 8-bit analogWrite(9) (0-255) for smooth dimming control.',
    description: 'Discover how pulse-width modulation simulates variable analog voltage on digital pins ~3, ~5, ~6, ~9, ~10, ~11.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', '10kΩ Potentiometer', 'Red LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect Potentiometer pin 1 to 5V, pin 3 to GND, wiper to Arduino Pin A0.',
      'Connect LED anode via 220Ω resistor to PWM Pin ~9, cathode to GND.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 9, mode: 'OUTPUT' } },
      { id: 'b2', type: 'ANALOG_WRITE', params: { pin: 9, value: 128 } },
    ],
    starterCode: `const int potPin = A0;
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int sensorValue = analogRead(potPin);
  int brightness = map(sensorValue, 0, 1023, 0, 255);
  analogWrite(ledPin, brightness);
  delay(10);
}
`,
    solutionCode: `const int potPin = A0;
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int sensorValue = analogRead(potPin);
  int brightness = map(sensorValue, 0, 1023, 0, 255);
  analogWrite(ledPin, brightness);
}
`,
    requiredConnections: [
      { fromType: 'potentiometer', toType: 'arduino' },
      { fromType: 'arduino', toType: 'led' },
    ],
  },

  // 5. Night Light (LDR Voltage Divider)
  {
    id: 'lesson_5_nightlight',
    lessonNumber: 5,
    title: 'Automatic Night Light: LDR Sensor',
    badge: 'LIGHT SENSING',
    xpAward: 80,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objective: 'Construct a voltage divider with a 5mm LDR and 10kΩ resistor on Pin A1 to automatically turn on LED when dark.',
    description: 'Learn how light intensity dynamically modulates resistance from 1kΩ in bright room to 1MΩ in complete darkness.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', '5mm LDR', '10kΩ Resistor', 'Red LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect 5V to LDR lead 1, LDR lead 2 to Pin A1.',
      'Connect 10k resistor from Pin A1 to GND.',
      'Connect LED anode via 220Ω resistor to Pin 13, cathode to GND.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 13, mode: 'OUTPUT' } },
    ],
    starterCode: `const int ldrPin = A1;
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.print("Light Level: ");
  Serial.println(lightLevel);

  if (lightLevel < 400) {
    digitalWrite(ledPin, HIGH); // Dark outside
  } else {
    digitalWrite(ledPin, LOW);  // Daylight
  }
  delay(100);
}
`,
    solutionCode: `const int ldrPin = A1;
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  if (lightLevel < 400) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}
`,
    requiredConnections: [
      { fromType: 'ldr', toType: 'arduino' },
      { fromType: 'resistor', toType: 'arduino' },
    ],
  },

  // 6. Melody Buzzer
  {
    id: 'lesson_6_buzzer',
    lessonNumber: 6,
    title: 'Melody Buzzer: Audio Synthesizer',
    badge: 'AUDIO SYNTH',
    xpAward: 80,
    difficulty: 'Beginner',
    durationMinutes: 15,
    objective: 'Generate distinct musical frequencies (C4, E4, G4, C5) on Pin 8 using the Arduino tone() function.',
    description: 'Synthesize audio waves with precise pitch and duration on piezoelectric speakers.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', '5V Active Buzzer or Piezo'],
    schematicInstructions: [
      'Connect Buzzer (+) to Arduino Pin D8.',
      'Connect Buzzer (-) to Breadboard GND rail.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'TONE', params: { pin: 8, freq: 262, duration: 250 } },
      { id: 'b2', type: 'DELAY', params: { ms: 300 } },
      { id: 'b3', type: 'TONE', params: { pin: 8, freq: 330, duration: 250 } },
    ],
    starterCode: `const int buzzerPin = 8;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  tone(buzzerPin, 262, 200); // C4
  delay(300);
  tone(buzzerPin, 330, 200); // E4
  delay(300);
  tone(buzzerPin, 392, 200); // G4
  delay(300);
  tone(buzzerPin, 523, 400); // C5
  delay(1500);
}
`,
    solutionCode: `const int buzzerPin = 8;

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  tone(buzzerPin, 262, 200);
  delay(300);
  tone(buzzerPin, 330, 200);
  delay(300);
  tone(buzzerPin, 392, 200);
  delay(300);
  tone(buzzerPin, 523, 400);
  delay(1500);
}
`,
    requiredConnections: [
      { fromType: 'buzzer', toType: 'arduino' },
    ],
  },

  // 7. Ultrasonic Distance Meter
  {
    id: 'lesson_7_ultrasonic',
    lessonNumber: 7,
    title: 'Ultrasonic Distance Meter: Sonar Echo',
    badge: 'SONAR SENSING',
    xpAward: 90,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objective: 'Emit 40kHz ultrasound bursts from Trig Pin 11 and measure pulseIn(echoPin) on Pin 12 to compute obstacle distance.',
    description: 'Calculate distance with formula: distCm = (pulseDuration_us * 0.034) / 2.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'HC-SR04 Ultrasonic Sensor', 'Red LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect HC-SR04 VCC to 5V, GND to GND.',
      'Connect Trig to Arduino Pin 11, Echo to Arduino Pin 12.',
      'Connect alert LED to Pin 13 with 220Ω resistor.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 11, mode: 'OUTPUT' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 12, mode: 'INPUT' } },
      { id: 'b3', type: 'SONAR_READ', params: { trigPin: 11, echoPin: 12 } },
    ],
    starterCode: `const int trigPin = 11;
const int echoPin = 12;
const int ledPin = 13;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  int distanceCm = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  digitalWrite(ledPin, distanceCm < 15 ? HIGH : LOW);
  delay(100);
}
`,
    solutionCode: `const int trigPin = 11;
const int echoPin = 12;
const int ledPin = 13;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  int distanceCm = duration * 0.034 / 2;
  digitalWrite(ledPin, distanceCm < 15 ? HIGH : LOW);
  delay(100);
}
`,
    requiredConnections: [
      { fromType: 'ultrasonic', toType: 'arduino' },
    ],
  },

  // 8. Servo Angle Sweep
  {
    id: 'lesson_8_servo',
    lessonNumber: 8,
    title: 'Servo Angle Sweep: Precision Actuators',
    badge: 'ROBOT JOINTS',
    xpAward: 90,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objective: 'Drive an SG90 micro servo from 0° to 180° and back using the Arduino Servo library on Pin 9.',
    description: 'Master positional pulse width control (1.0ms = 0 deg, 1.5ms = 90 deg, 2.0ms = 180 deg).',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'TowerPro SG90 9g Micro Servo'],
    schematicInstructions: [
      'Connect Servo Red wire to 5V, Brown wire to GND.',
      'Connect Servo Orange wire to Arduino PWM Pin 9.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'SERVO_WRITE', params: { pin: 9, angle: 0 } },
      { id: 'b2', type: 'DELAY', params: { ms: 1000 } },
      { id: 'b3', type: 'SERVO_WRITE', params: { pin: 9, angle: 180 } },
      { id: 'b4', type: 'DELAY', params: { ms: 1000 } },
    ],
    starterCode: `#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 5) {
    myServo.write(pos);
    delay(20);
  }
  for (int pos = 180; pos >= 0; pos -= 5) {
    myServo.write(pos);
    delay(20);
  }
}
`,
    solutionCode: `#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 5) {
    myServo.write(pos);
    delay(20);
  }
  for (int pos = 180; pos >= 0; pos -= 5) {
    myServo.write(pos);
    delay(20);
  }
}
`,
    requiredConnections: [
      { fromType: 'servo', toType: 'arduino' },
    ],
  },

  // 9. Temperature Monitor (DHT11)
  {
    id: 'lesson_9_dht11',
    lessonNumber: 9,
    title: 'Temperature Monitor: Environmental Sensing',
    badge: 'DIGITAL BUS',
    xpAward: 90,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objective: 'Sample ambient Celsius temperature and humidity from DHT11 on Pin 2 and stream live telemetry to Serial Monitor.',
    description: 'Communicate over single-wire digital bus with handshaking and CRC check.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'DHT11 Sensor'],
    schematicInstructions: [
      'Connect DHT11 VCC to 5V, GND to GND.',
      'Connect DHT11 Data pin to Arduino Pin 2.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 2, mode: 'INPUT' } },
    ],
    starterCode: `const int dhtPin = 2;

void setup() {
  Serial.begin(9600);
  Serial.println("DHT11 Weather Station Initialized");
}

void loop() {
  // Simulating environmental telemetry packet
  float tempC = 24.5;
  float humidity = 62.0;

  Serial.print("Temp: ");
  Serial.print(tempC);
  Serial.print(" °C | Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");

  delay(2000);
}
`,
    solutionCode: `const int dhtPin = 2;

void setup() {
  Serial.begin(9600);
}

void loop() {
  float tempC = 24.5;
  Serial.print("Temp: ");
  Serial.println(tempC);
  delay(2000);
}
`,
    requiredConnections: [
      { fromType: 'dht', toType: 'arduino' },
    ],
  },

  // 10. Motion Detector Alarm
  {
    id: 'lesson_10_pir',
    lessonNumber: 10,
    title: 'Motion Detector Alarm: Security Systems',
    badge: 'SECURITY IOT',
    xpAward: 100,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objective: 'Detect human intrusion with PIR sensor on Pin 7 and trigger synchronized strobe LED and buzzer alarm.',
    description: 'Build an automated residential security alarm system using pyroelectric infrared sensors.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'PIR Motion Sensor', '5V Buzzer', 'Red LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect PIR VCC to 5V, GND to GND, OUT to Pin 7.',
      'Connect Buzzer (+) to Pin 8, (-) to GND.',
      'Connect Red LED to Pin 13 via 220Ω resistor.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 7, mode: 'INPUT' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 8, mode: 'OUTPUT' } },
      { id: 'b3', type: 'PIN_MODE', params: { pin: 13, mode: 'OUTPUT' } },
    ],
    starterCode: `const int pirPin = 7;
const int buzzerPin = 8;
const int ledPin = 13;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  int motion = digitalRead(pirPin);
  if (motion == HIGH) {
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 2800, 150);
    delay(200);
    digitalWrite(ledPin, LOW);
    delay(100);
  } else {
    digitalWrite(ledPin, LOW);
  }
}
`,
    solutionCode: `const int pirPin = 7;
const int buzzerPin = 8;
const int ledPin = 13;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 2800, 150);
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(100);
}
`,
    requiredConnections: [
      { fromType: 'pir', toType: 'arduino' },
      { fromType: 'buzzer', toType: 'arduino' },
    ],
  },

  // 11. RGB Mood Lamp
  {
    id: 'lesson_11_rgb',
    lessonNumber: 11,
    title: 'RGB Mood Lamp: Color Space Synthesis',
    badge: 'COLOR MIXING',
    xpAward: 100,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objective: 'Drive an RGB LED common cathode using PWM pins 9, 10, 11 to smoothly cross-fade across 16.7 million colors.',
    description: 'Understand additive primary color mixing (Red + Green = Yellow, Red + Blue = Magenta, Green + Blue = Cyan).',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'RGB LED', '3x 220Ω Resistors'],
    schematicInstructions: [
      'Connect Red lead via 220Ω resistor to Pin 9.',
      'Connect Green lead via 220Ω resistor to Pin 10.',
      'Connect Blue lead via 220Ω resistor to Pin 11.',
      'Connect Common Cathode lead to Breadboard GND.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 9, mode: 'OUTPUT' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 10, mode: 'OUTPUT' } },
      { id: 'b3', type: 'PIN_MODE', params: { pin: 11, mode: 'OUTPUT' } },
      { id: 'b4', type: 'ANALOG_WRITE', params: { pin: 9, value: 255 } },
      { id: 'b5', type: 'ANALOG_WRITE', params: { pin: 11, value: 255 } },
    ],
    starterCode: `const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void setColor(int r, int g, int b) {
  analogWrite(redPin, r);
  analogWrite(greenPin, g);
  analogWrite(bluePin, b);
}

void loop() {
  setColor(255, 0, 0);   // Red
  delay(1000);
  setColor(0, 255, 0);   // Green
  delay(1000);
  setColor(0, 0, 255);   // Blue
  delay(1000);
  setColor(255, 0, 255); // Purple
  delay(1000);
}
`,
    solutionCode: `const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  analogWrite(redPin, 255);
  analogWrite(greenPin, 0);
  analogWrite(bluePin, 128);
  delay(1000);
}
`,
    requiredConnections: [
      { fromType: 'arduino', toType: 'resistor' },
    ],
  },

  // 12. 7-Segment Display Counter
  {
    id: 'lesson_12_7seg',
    lessonNumber: 12,
    title: '7-Segment Display: Hexadecimal Multiplexing',
    badge: 'DIGITAL LOGIC',
    xpAward: 100,
    difficulty: 'Intermediate',
    durationMinutes: 25,
    objective: 'Map numbers 0 through 9 to 7-segment LED anodes A-G and increment a digital counter every second.',
    description: 'Learn binary truth tables and bus mapping for numeric LED indicators.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', '7-Segment Display', '7x 220Ω Resistors'],
    schematicInstructions: [
      'Connect Common Cathode to GND.',
      'Connect Segments A through G to Arduino Pins 2 through 8 with series 220Ω resistors.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 2, mode: 'OUTPUT' } },
      { id: 'b2', type: 'DIGITAL_WRITE', params: { pin: 2, value: 'HIGH' } },
    ],
    starterCode: `const int segPins[7] = {2, 3, 4, 5, 6, 7, 8};

// 7-segment digit lookup table (A, B, C, D, E, F, G)
const byte digits[10] = {
  0b00111111, // 0
  0b00000110, // 1
  0b01011011, // 2
  0b01001111, // 3
  0b01100110, // 4
  0b01101101, // 5
  0b01111101, // 6
  0b00000111, // 7
  0b01111111, // 8
  0b01101111  // 9
};

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
}

void displayDigit(int num) {
  byte pattern = digits[num];
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], (pattern >> i) & 1);
  }
}

void loop() {
  for (int d = 0; d < 10; d++) {
    displayDigit(d);
    delay(1000);
  }
}
`,
    solutionCode: `const int segPins[7] = {2, 3, 4, 5, 6, 7, 8};

void setup() {
  for (int i = 0; i < 7; i++) pinMode(segPins[i], OUTPUT);
}

void loop() {
  for (int i = 0; i < 7; i++) digitalWrite(segPins[i], HIGH);
  delay(1000);
}
`,
    requiredConnections: [
      { fromType: 'display', toType: 'arduino' },
    ],
  },

  // 13. LCD 16x2 "Hello RoboVerse"
  {
    id: 'lesson_13_lcd',
    lessonNumber: 13,
    title: 'LCD 16x2 Display: Two-Wire I2C Protocol',
    badge: 'I2C BUS',
    xpAward: 100,
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objective: 'Transmit string messages and custom robotic telemetry to a 16x2 Character LCD over the I2C bus.',
    description: 'Learn I2C addressing (0x27) and synchronous data transfer on SDA (A4) and SCL (A5).',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', '16x2 I2C Character LCD'],
    schematicInstructions: [
      'Connect LCD VCC to 5V, GND to GND.',
      'Connect SDA to Arduino Pin A4.',
      'Connect SCL to Arduino Pin A5.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'DELAY', params: { ms: 1000 } },
    ],
    starterCode: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello RoboVerse!");
  lcd.setCursor(0, 1);
  lcd.print("Robotics OS v2.6");
}

void loop() {
  // Static banner
}
`,
    solutionCode: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.print("Hello RoboVerse!");
}

void loop() {}
`,
    requiredConnections: [
      { fromType: 'display', toType: 'arduino' },
    ],
  },

  // 14. DC Motor Speed & Direction
  {
    id: 'lesson_14_dcmotor',
    lessonNumber: 14,
    title: 'DC Motor Speed & Direction: L298N H-Bridge',
    badge: 'MOTOR CONTROL',
    xpAward: 120,
    difficulty: 'Advanced',
    durationMinutes: 25,
    objective: 'Drive TT gear motors forward, reverse, and modulate speed with PWM through the L298N dual H-bridge.',
    description: 'Control high-current inductive motors safely without overloading the microcontroller.',
    componentsNeeded: ['Arduino Uno R3', 'L298N Motor Driver', 'TT DC Motor', '7.4V Li-ion Battery Pack'],
    schematicInstructions: [
      'Connect Battery 7.4V to L298N 12V terminal, Battery GND to L298N GND.',
      'Connect L298N GND to Arduino GND (common ground!).',
      'Connect Arduino Pin 4 to IN1, Pin 5 to IN2, Pin 6 to ENA (PWM).',
      'Connect Motor wires to OUT1 and OUT2.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 4, mode: 'OUTPUT' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 5, mode: 'OUTPUT' } },
      { id: 'b3', type: 'PIN_MODE', params: { pin: 6, mode: 'OUTPUT' } },
      { id: 'b4', type: 'DIGITAL_WRITE', params: { pin: 4, value: 'HIGH' } },
      { id: 'b5', type: 'DIGITAL_WRITE', params: { pin: 5, value: 'LOW' } },
      { id: 'b6', type: 'ANALOG_WRITE', params: { pin: 6, value: 200 } },
    ],
    starterCode: `const int in1 = 4;
const int in2 = 5;
const int ena = 6;

void setup() {
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(ena, OUTPUT);
}

void loop() {
  // Forward motion
  digitalWrite(in1, HIGH);
  digitalWrite(in2, LOW);
  analogWrite(ena, 220);
  delay(3000);

  // Stop
  analogWrite(ena, 0);
  delay(500);

  // Reverse motion
  digitalWrite(in1, LOW);
  digitalWrite(in2, HIGH);
  analogWrite(ena, 220);
  delay(3000);

  // Stop
  analogWrite(ena, 0);
  delay(1000);
}
`,
    solutionCode: `const int in1 = 4, in2 = 5, ena = 6;

void setup() {
  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT); pinMode(ena, OUTPUT);
}

void loop() {
  digitalWrite(in1, HIGH); digitalWrite(in2, LOW); analogWrite(ena, 200);
}
`,
    requiredConnections: [
      { fromType: 'motor_driver', toType: 'arduino' },
      { fromType: 'motor', toType: 'motor_driver' },
    ],
  },

  // 15. IR Remote Controlled LED
  {
    id: 'lesson_15_ir_remote',
    lessonNumber: 15,
    title: 'IR Remote Controlled LED: Packet Decoding',
    badge: 'WIRELESS IR',
    xpAward: 120,
    difficulty: 'Advanced',
    durationMinutes: 25,
    objective: 'Decode 38kHz infrared NEC protocol packets from a remote control to toggle LEDs remotely.',
    description: 'Learn pulse distance modulation and demodulation with an IR receiver.',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'IR Receiver Module', 'Red LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect IR Receiver VCC to 5V, GND to GND, OUT to Pin 11.',
      'Connect LED to Pin 13 via 220Ω resistor.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 11, mode: 'INPUT' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 13, mode: 'OUTPUT' } },
    ],
    starterCode: `const int irPin = 11;
const int ledPin = 13;

void setup() {
  pinMode(irPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("IR Receiver Ready. Press Remote Button...");
}

void loop() {
  int irState = digitalRead(irPin);
  if (irState == LOW) {
    digitalWrite(ledPin, HIGH);
    Serial.println("IR Command Received: [KEY_POWER] -> LED ON");
    delay(500);
    digitalWrite(ledPin, LOW);
  }
}
`,
    solutionCode: `const int irPin = 11, ledPin = 13;

void setup() {
  pinMode(irPin, INPUT); pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(irPin) == LOW) {
    digitalWrite(ledPin, HIGH);
    delay(500);
    digitalWrite(ledPin, LOW);
  }
}
`,
    requiredConnections: [
      { fromType: 'sensor', toType: 'arduino' },
    ],
  },

  // 16. Smart Dustbin Capstone
  {
    id: 'lesson_16_smart_bin',
    lessonNumber: 16,
    title: 'Smart Dustbin Capstone: Sensor-Actuator Loop',
    badge: 'CAPSTONE PROJECT',
    xpAward: 150,
    difficulty: 'Advanced',
    durationMinutes: 30,
    objective: 'Detect approaching hands within 20cm using HC-SR04 sonar and automatically open servo-driven lid for 4 seconds.',
    description: 'Complete capstone integrating closed-loop sensing, algorithmic thresholding, and servo motor mechanical control. Awards Course Certificate!',
    componentsNeeded: ['Arduino Uno R3', 'Breadboard', 'HC-SR04 Ultrasonic Sensor', 'SG90 Servo Motor', 'Buzzer', 'Green LED', '220Ω Resistor'],
    schematicInstructions: [
      'Connect Ultrasonic Trig to Pin 11, Echo to Pin 12.',
      'Connect Servo Signal to PWM Pin 9.',
      'Connect Green LED to Pin 13 via 220Ω resistor.',
      'Connect Piezo Buzzer to Pin 8.',
    ],
    starterBlocks: [
      { id: 'b1', type: 'PIN_MODE', params: { pin: 11, mode: 'OUTPUT' } },
      { id: 'b2', type: 'PIN_MODE', params: { pin: 12, mode: 'INPUT' } },
      { id: 'b3', type: 'SERVO_WRITE', params: { pin: 9, angle: 0 } },
    ],
    starterCode: `#include <Servo.h>

Servo lidServo;
const int trigPin = 11;
const int echoPin = 12;
const int ledPin = 13;
const int buzzerPin = 8;

void setup() {
  lidServo.attach(9);
  lidServo.write(0); // Lid closed
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  int distanceCm = duration * 0.034 / 2;

  if (distanceCm > 0 && distanceCm <= 20) {
    Serial.println("Hand detected! Opening lid...");
    tone(buzzerPin, 2000, 100);
    digitalWrite(ledPin, HIGH);
    lidServo.write(90); // Open lid
    delay(4000);        // Hold open for 4 seconds
    lidServo.write(0);  // Close lid
    digitalWrite(ledPin, LOW);
  }
  delay(100);
}
`,
    solutionCode: `#include <Servo.h>

Servo lidServo;
const int trigPin = 11, echoPin = 12;

void setup() {
  lidServo.attach(9);
  lidServo.write(0);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long dist = pulseIn(echoPin, HIGH) * 0.034 / 2;
  if (dist > 0 && dist <= 20) {
    lidServo.write(90);
    delay(4000);
    lidServo.write(0);
  }
}
`,
    requiredConnections: [
      { fromType: 'ultrasonic', toType: 'arduino' },
      { fromType: 'servo', toType: 'arduino' },
    ],
  },
];
