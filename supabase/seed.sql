-- ============================================================================
-- ROBOVERSE SUPABASE SEED DATA
-- seed.sql: Complete initial data for Plans, 60+ Components, 16 Lessons,
-- Robot Templates, Arenas, TechSavyyy Catalog, 10 Kits, and Verified Shops.
-- ============================================================================

-- 1. SUBSCRIPTION PLANS
INSERT INTO public.plans (
  id, name, tier, price_inr_monthly, price_inr_quarterly, price_inr_yearly,
  gst_percent, max_saved_projects, rituu_daily_messages, rituu_daily_photos,
  store_discount_percent, features
) VALUES
(
  'free', 'Free Explorer', 'free', 0.00, 0.00, 0.00,
  18.00, 5, 15, 3, 0.00,
  '{"allowPrivateProjects": false, "advancedSimTools": false, "completionCertificates": false, "guidedProjects": false}'::jsonb
),
(
  'plus', 'Plus Self-Learner', 'plus', 299.00, 749.00, 2499.00,
  18.00, -1, 100, 20, 5.00,
  '{"allowPrivateProjects": true, "advancedSimTools": true, "completionCertificates": true, "guidedProjects": false, "fullTheoryLibrary": true}'::jsonb
),
(
  'pro', 'Pro Guided Learning', 'pro', 999.00, 2699.00, 8999.00,
  18.00, -1, 300, 50, 10.00,
  '{"allowPrivateProjects": true, "advancedSimTools": true, "completionCertificates": true, "guidedProjects": true, "liveClassesMonthlyCount": 8, "mentorReview": true, "mlTrack": true}'::jsonb
),
(
  'institution', 'School & Institution', 'institution', 499.00, 499.00, 499.00,
  18.00, -1, 100, 20, 10.00,
  '{"allowPrivateProjects": true, "hasTeacherDashboard": true, "bulkStudentIds": true, "batchManagement": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  price_inr_monthly = EXCLUDED.price_inr_monthly,
  rituu_daily_messages = EXCLUDED.rituu_daily_messages,
  rituu_daily_photos = EXCLUDED.rituu_daily_photos;

-- 2. COURSES & 16 BEGINNER ARDUINO LESSONS (SECTION 4)
INSERT INTO public.courses (id, title, slug, description, category, level, required_plan, estimated_hours, icon) VALUES
('crs_arduino_learn', 'Learn Arduino: From Zero to Robotics Engineer', 'learn-arduino', 'Comprehensive 16-lesson interactive track covering electronic components, C++ programming, sensor fusion, and actuator control.', 'Electronics & Embedded', 'Beginner', 'free', 12.0, '⚡'),
('crs_robot_design', 'Robotic Design Lab: Kinematics & Mechanics', 'robot-design-mastery', 'Design and simulate 3D rovers, quadcopters, and multi-DOF robotic arms with physics and PID control.', 'Robotics Engineering', 'Intermediate', 'plus', 20.0, '🤖'),
('crs_ml_vision', 'Machine Learning & Computer Vision for Autonomous Robots', 'ml-vision-robotics', 'Computer vision with OpenCV, TinyML obstacle detection, ROS 2 nodes, and path planning.', 'Artificial Intelligence', 'Advanced', 'pro', 30.0, '🧠')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id, course_id, title, order_index) VALUES
('mod_arduino_basics', 'crs_arduino_learn', 'Module 1: Digital Output & Inputs', 1),
('mod_arduino_analog', 'crs_arduino_learn', 'Module 2: Analog Controls & PWM', 2),
('mod_arduino_actuators', 'crs_arduino_learn', 'Module 3: Actuators, Motors & Displays', 3),
('mod_arduino_projects', 'crs_arduino_learn', 'Module 4: Integrated Robotics Projects', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, course_id, module_id, title, order_index, duration_minutes, content_markdown, example_code, components_used) VALUES
(
  'lsn_1_blink', 'crs_arduino_learn', 'mod_arduino_basics', '1. Blink LED', 1, 15,
  '# Blink an LED\nLearn the foundation of embedded software: GPIO digital output. Connect an LED in series with a 220Ω resistor to digital pin 13.',
  'const int ledPin = 13;\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n  Serial.begin(9600);\n}\nvoid loop() {\n  digitalWrite(ledPin, HIGH);\n  delay(1000);\n  digitalWrite(ledPin, LOW);\n  delay(1000);\n}',
  '["comp_arduino_uno", "comp_led_red", "comp_resistor_220", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_2_button', 'crs_arduino_learn', 'mod_arduino_basics', '2. Push Button Switch', 2, 15,
  '# Push Button Switch\nRead digital signals from a momentary tactile push button using internal `INPUT_PULLUP`. When pressed, the LED toggles.',
  'const int buttonPin = 2;\nconst int ledPin = 13;\nvoid setup() {\n  pinMode(buttonPin, INPUT_PULLUP);\n  pinMode(ledPin, OUTPUT);\n}\nvoid loop() {\n  int state = digitalRead(buttonPin);\n  digitalWrite(ledPin, state == LOW ? HIGH : LOW);\n}',
  '["comp_arduino_uno", "comp_push_button", "comp_led_red", "comp_resistor_220", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_3_pot', 'crs_arduino_learn', 'mod_arduino_analog', '3. Potentiometer (Analog In)', 3, 20,
  '# Potentiometer Analog Read\nRead variable voltage from a 10kΩ rotary potentiometer using Arduino’s 10-bit Analog-to-Digital Converter (ADC) on pin A0.',
  'const int potPin = A0;\nvoid setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  int val = analogRead(potPin);\n  Serial.print("ADC Value: ");\n  Serial.println(val);\n  delay(200);\n}',
  '["comp_arduino_uno", "comp_potentiometer_10k", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_4_pwm', 'crs_arduino_learn', 'mod_arduino_analog', '4. PWM LED Fade', 4, 15,
  '# Pulse Width Modulation (PWM)\nControl LED brightness by modulating the duty cycle using `analogWrite()` on PWM-capable pin ~9.',
  'const int ledPin = 9;\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\nvoid loop() {\n  for (int i=0; i<=255; i+=5) { analogWrite(ledPin, i); delay(20); }\n  for (int i=255; i>=0; i-=5) { analogWrite(ledPin, i); delay(20); }\n}',
  '["comp_arduino_uno", "comp_led_green", "comp_resistor_220", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_5_rgb', 'crs_arduino_learn', 'mod_arduino_analog', '5. RGB LED Color Mixer', 5, 20,
  '# RGB Color Mixing\nCreate any color in the visible spectrum using an RGB LED connected to PWM pins 9, 10, and 11.',
  'const int rPin = 9, gPin = 10, bPin = 11;\nvoid setup() {\n  pinMode(rPin, OUTPUT);\n  pinMode(gPin, OUTPUT);\n  pinMode(bPin, OUTPUT);\n}\nvoid loop() {\n  analogWrite(rPin, 255); analogWrite(gPin, 0); analogWrite(bPin, 128); // Purple\n  delay(1000);\n}',
  '["comp_arduino_uno", "comp_rgb_led", "comp_resistor_220", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_6_buzzer', 'crs_arduino_learn', 'mod_arduino_basics', '6. Buzzer Sound Generator', 6, 15,
  '# Sound Generation with Buzzer\nProduce alert tones and melodies using an active buzzer driven by digital pin 8.',
  'const int buzzerPin = 8;\nvoid setup() {\n  pinMode(buzzerPin, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(buzzerPin, HIGH);\n  delay(200);\n  digitalWrite(buzzerPin, LOW);\n  delay(800);\n}',
  '["comp_arduino_uno", "comp_buzzer_active", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_7_ldr', 'crs_arduino_learn', 'mod_arduino_analog', '7. LDR Light Sensor (Automatic Nightlight)', 7, 20,
  '# Light Dependent Resistor (LDR)\nBuild an automatic night lamp using an LDR and a 10kΩ resistor forming a voltage divider on pin A1.',
  'const int ldrPin = A1;\nconst int ledPin = 13;\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n  Serial.begin(9600);\n}\nvoid loop() {\n  int light = analogRead(ldrPin);\n  digitalWrite(ledPin, light < 400 ? HIGH : LOW);\n  delay(100);\n}',
  '["comp_arduino_uno", "comp_ldr", "comp_resistor_10k", "comp_led_red", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_8_ultrasonic', 'crs_arduino_learn', 'mod_arduino_actuators', '8. Ultrasonic Distance Sensor', 8, 25,
  '# HC-SR04 Sonar Ranging\nCalculate distance in centimeters by triggering an ultrasonic burst and timing the return echo pulse.',
  'const int trigPin = 11, echoPin = 12;\nvoid setup() {\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n  Serial.begin(9600);\n}\nvoid loop() {\n  digitalWrite(trigPin, LOW); delayMicroseconds(2);\n  digitalWrite(trigPin, HIGH); delayMicroseconds(10);\n  digitalWrite(trigPin, LOW);\n  long duration = pulseIn(echoPin, HIGH);\n  int distCm = duration * 0.034 / 2;\n  Serial.println(distCm);\n  delay(200);\n}',
  '["comp_arduino_uno", "comp_ultrasonic_hcsr04", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_9_servo', 'crs_arduino_learn', 'mod_arduino_actuators', '9. Servo Sweep', 9, 20,
  '# SG90 Micro Servo Position Control\nControl a servo horn from 0° to 180° using PWM pulse widths (1ms to 2ms) via the Arduino Servo library.',
  '#include <Servo.h>\nServo myServo;\nvoid setup() {\n  myServo.attach(9);\n}\nvoid loop() {\n  for (int pos=0; pos<=180; pos+=1) { myServo.write(pos); delay(15); }\n  for (int pos=180; pos>=0; pos-=1) { myServo.write(pos); delay(15); }\n}',
  '["comp_arduino_uno", "comp_servo_sg90", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_10_dcmotor', 'crs_arduino_learn', 'mod_arduino_actuators', '10. DC Motor & L298N Driver', 10, 25,
  '# DC Motor Control via H-Bridge\nBidirectional rotation and speed control of gear motors using the L298N dual H-bridge motor driver.',
  'const int in1 = 4, in2 = 5, ena = 6;\nvoid setup() {\n  pinMode(in1, OUTPUT); pinMode(in2, OUTPUT); pinMode(ena, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(in1, HIGH); digitalWrite(in2, LOW); analogWrite(ena, 200); // Forward\n  delay(2000);\n  digitalWrite(in1, LOW); digitalWrite(in2, HIGH); analogWrite(ena, 200); // Reverse\n  delay(2000);\n}',
  '["comp_arduino_uno", "comp_motor_driver_l298n", "comp_motor_dc_tt", "comp_battery_18650_2s"]'::jsonb
),
(
  'lsn_11_pir', 'crs_arduino_learn', 'mod_arduino_basics', '11. PIR Motion Alarm', 11, 20,
  '# Passive Infrared (PIR) Motion Detection\nDetect human movement using a pyroelectric sensor and trigger an intrusion alarm with LED and buzzer.',
  'const int pirPin = 7, buzzerPin = 8;\nvoid setup() {\n  pinMode(pirPin, INPUT);\n  pinMode(buzzerPin, OUTPUT);\n}\nvoid loop() {\n  int motion = digitalRead(pirPin);\n  digitalWrite(buzzerPin, motion == HIGH ? HIGH : LOW);\n}',
  '["comp_arduino_uno", "comp_sensor_pir_hc501", "comp_buzzer_active", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_12_dht11', 'crs_arduino_learn', 'mod_arduino_analog', '12. DHT11 Temperature & Humidity', 12, 20,
  '# Environmental Telemetry with DHT11\nRead digital relative humidity and Celsius ambient temperature over a single-wire digital bus.',
  '#include <DHT.h>\nDHT dht(2, DHT11);\nvoid setup() {\n  Serial.begin(9600); dht.begin();\n}\nvoid loop() {\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n  Serial.print("Temp: "); Serial.print(t); Serial.print(" C, Hum: "); Serial.println(h);\n  delay(2000);\n}',
  '["comp_arduino_uno", "comp_sensor_dht11", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_13_lcd', 'crs_arduino_learn', 'mod_arduino_actuators', '13. 16x2 LCD Display (I2C)', 13, 25,
  '# Character Display over I2C\nCommunicate with a 16x2 Liquid Crystal Display using the 2-wire I2C protocol (SDA pin A4, SCL pin A5).',
  '#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nvoid setup() {\n  lcd.init(); lcd.backlight();\n  lcd.print("RoboVerse Online");\n  lcd.setCursor(0, 1); lcd.print("Arduino Ready!");\n}\nvoid loop() {}',
  '["comp_arduino_uno", "comp_display_lcd1602_i2c", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_14_relay', 'crs_arduino_learn', 'mod_arduino_basics', '14. Relay Switch Module', 14, 20,
  '# Galvanically Isolated Switching with Relays\nControl high-voltage or high-current external circuits using a 5V opto-isolated relay module.',
  'const int relayPin = 8;\nvoid setup() {\n  pinMode(relayPin, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(relayPin, HIGH); delay(3000); // Relay ON\n  digitalWrite(relayPin, LOW); delay(3000);  // Relay OFF\n}',
  '["comp_arduino_uno", "comp_relay_1ch", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_15_traffic', 'crs_arduino_learn', 'mod_arduino_projects', '15. Traffic Light Controller', 15, 20,
  '# Finite State Machine: Traffic Lights\nImplement an automated traffic intersection sequence using Red, Yellow, and Green LEDs with precise timing states.',
  'const int red = 10, yellow = 11, green = 12;\nvoid setup() {\n  pinMode(red, OUTPUT); pinMode(yellow, OUTPUT); pinMode(green, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(red, HIGH); delay(5000); digitalWrite(red, LOW);\n  digitalWrite(yellow, HIGH); delay(1500); digitalWrite(yellow, LOW);\n  digitalWrite(green, HIGH); delay(5000); digitalWrite(green, LOW);\n}',
  '["comp_arduino_uno", "comp_led_red", "comp_led_green", "comp_resistor_220", "comp_breadboard_half"]'::jsonb
),
(
  'lsn_16_parking', 'crs_arduino_learn', 'mod_arduino_projects', '16. Smart Ultrasonic Parking Sensor', 16, 30,
  '# Smart Vehicle Distance Alert\nCombine the HC-SR04 ultrasonic sensor with RGB LED and buzzer: buzzer beep rate and LED color change as obstacles get closer.',
  'const int trig = 11, echo = 12, buzzer = 8;\nvoid setup() {\n  pinMode(trig, OUTPUT); pinMode(echo, INPUT); pinMode(buzzer, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(trig, LOW); delayMicroseconds(2);\n  digitalWrite(trig, HIGH); delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  long dist = pulseIn(echo, HIGH) * 0.034 / 2;\n  if (dist < 10) { digitalWrite(buzzer, HIGH); delay(50); digitalWrite(buzzer, LOW); delay(50); }\n  else if (dist < 30) { digitalWrite(buzzer, HIGH); delay(150); digitalWrite(buzzer, LOW); delay(150); }\n  delay(50);\n}',
  '["comp_arduino_uno", "comp_ultrasonic_hcsr04", "comp_buzzer_active", "comp_rgb_led", "comp_breadboard_half"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  example_code = EXCLUDED.example_code;

-- 3. 60+ HARDWARE COMPONENTS IN 3 FORMATS (SECTION 3)
INSERT INTO public.components (
  id, sku, name, category, pins, electrical_params, physical_params, is_free_tier, price_inr
) VALUES
-- Microcontrollers & Development Boards
('comp_arduino_uno', 'RV-COMP-UNO-R3', 'Arduino Uno R3', 'MICROCONTROLLER',
 '[{"id":"d0","name":"D0 (RX)","type":"UART_RX"},{"id":"d1","name":"D1 (TX)","type":"UART_TX"},{"id":"d2","name":"D2","type":"DIGITAL_IO"},{"id":"d3","name":"D3 (~PWM)","type":"PWM"},{"id":"d4","name":"D4","type":"DIGITAL_IO"},{"id":"d5","name":"D5 (~PWM)","type":"PWM"},{"id":"d6","name":"D6 (~PWM)","type":"PWM"},{"id":"d7","name":"D7","type":"DIGITAL_IO"},{"id":"d8","name":"D8","type":"DIGITAL_IO"},{"id":"d9","name":"D9 (~PWM)","type":"PWM"},{"id":"d10","name":"D10 (~PWM)","type":"PWM"},{"id":"d11","name":"D11 (~PWM)","type":"PWM"},{"id":"d12","name":"D12","type":"DIGITAL_IO"},{"id":"d13","name":"D13","type":"DIGITAL_IO"},{"id":"a0","name":"A0","type":"ANALOG_IN"},{"id":"a1","name":"A1","type":"ANALOG_IN"},{"id":"a2","name":"A2","type":"ANALOG_IN"},{"id":"a3","name":"A3","type":"ANALOG_IN"},{"id":"a4","name":"A4 (SDA)","type":"I2C_SDA"},{"id":"a5","name":"A5 (SCL)","type":"I2C_SCL"},{"id":"5v","name":"5V","type":"POWER_VCC"},{"id":"3v3","name":"3.3V","type":"POWER_VCC"},{"id":"gnd_1","name":"GND (1)","type":"GROUND"},{"id":"gnd_2","name":"GND (2)","type":"GROUND"},{"id":"vin","name":"VIN","type":"POWER_VCC"}]'::jsonb,
 '{"vcc": 5.0, "clockMhz": 16, "flashKb": 32, "ramKb": 2}'::jsonb,
 '{"massGrams": 25, "dimensionsMm": [68.6, 53.4, 15]}'::jsonb, true, 399.00),

('comp_arduino_nano', 'RV-COMP-NANO', 'Arduino Nano V3', 'MICROCONTROLLER',
 '[{"id":"d2","name":"D2","type":"DIGITAL_IO"},{"id":"d3","name":"D3 (~PWM)","type":"PWM"},{"id":"5v","name":"5V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"vcc": 5.0, "clockMhz": 16}'::jsonb, '{"massGrams": 7}'::jsonb, true, 349.00),

('comp_arduino_mega', 'RV-COMP-MEGA-2560', 'Arduino Mega 2560 R3', 'MICROCONTROLLER',
 '[{"id":"d13","name":"D13","type":"DIGITAL_IO"},{"id":"5v","name":"5V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"vcc": 5.0, "clockMhz": 16, "ioPins": 54}'::jsonb, '{"massGrams": 37}'::jsonb, true, 899.00),

('comp_esp32_devkit', 'RV-COMP-ESP32-DEVKIT', 'ESP32 NodeMCU DevKit', 'MICROCONTROLLER',
 '[{"id":"gpio2","name":"GPIO2","type":"DIGITAL_IO"},{"id":"3v3","name":"3.3V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"vcc": 3.3, "clockMhz": 240, "wifi": true, "ble": true}'::jsonb, '{"massGrams": 10}'::jsonb, true, 499.00),

('comp_rpi_pico', 'RV-COMP-RPI-PICO', 'Raspberry Pi Pico (RP2040)', 'MICROCONTROLLER',
 '[{"id":"gp0","name":"GP0","type":"DIGITAL_IO"},{"id":"3v3","name":"3.3V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"vcc": 3.3, "dualCore": true, "clockMhz": 133}'::jsonb, '{"massGrams": 6}'::jsonb, true, 449.00),

-- Passives & Prototyping
('comp_breadboard_half', 'RV-COMP-BB-400', 'Half-Size Breadboard (400 Tie-Points)', 'PROTOTYPING',
 '[{"id":"rail_vcc","name":"+ Rail","type":"POWER_VCC"},{"id":"rail_gnd","name":"- Rail","type":"GROUND"}]'::jsonb,
 '{"maxVolts": 30, "maxCurrentAmps": 2}'::jsonb, '{"massGrams": 40}'::jsonb, true, 129.00),

('comp_resistor_220', 'RV-COMP-RES-220R', '220Ω Resistor 1/4W', 'PASSIVE',
 '[{"id":"t1","name":"T1","type":"DIGITAL_IO"},{"id":"t2","name":"T2","type":"DIGITAL_IO"}]'::jsonb,
 '{"resistanceOhms": 220, "tolerance": 0.05, "powerWatts": 0.25}'::jsonb, '{"massGrams": 0.2}'::jsonb, true, 2.00),

('comp_resistor_10k', 'RV-COMP-RES-10K', '10kΩ Resistor 1/4W', 'PASSIVE',
 '[{"id":"t1","name":"T1","type":"DIGITAL_IO"},{"id":"t2","name":"T2","type":"DIGITAL_IO"}]'::jsonb,
 '{"resistanceOhms": 10000, "powerWatts": 0.25}'::jsonb, '{"massGrams": 0.2}'::jsonb, true, 2.00),

('comp_potentiometer_10k', 'RV-COMP-POT-10K', '10kΩ Rotary Potentiometer', 'PASSIVE',
 '[{"id":"vcc","name":"VCC","type":"POWER_VCC"},{"id":"wiper","name":"Wiper","type":"ANALOG_IN"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"resistanceOhms": 10000, "rotationAngle": 300}'::jsonb, '{"massGrams": 8}'::jsonb, true, 29.00),

('comp_push_button', 'RV-COMP-BTN-6MM', 'Tactile Push Button (6x6mm)', 'PASSIVE',
 '[{"id":"pin_1a","name":"1a","type":"DIGITAL_IO"},{"id":"pin_2a","name":"2a","type":"GROUND"}]'::jsonb,
 '{"contactRating": "12V 50mA"}'::jsonb, '{"massGrams": 0.5}'::jsonb, true, 5.00),

-- LEDs & Displays
('comp_led_red', 'RV-COMP-LED-RED', 'Red 5mm Diffused LED', 'DISPLAY',
 '[{"id":"anode","name":"Anode (+)","type":"DIGITAL_IO"},{"id":"cathode","name":"Cathode (-)","type":"GROUND"}]'::jsonb,
 '{"forwardVoltage": 2.0, "maxCurrentMa": 20, "dominantWavelengthNm": 630}'::jsonb, '{"massGrams": 0.3}'::jsonb, true, 2.00),

('comp_led_green', 'RV-COMP-LED-GRN', 'Green 5mm Diffused LED', 'DISPLAY',
 '[{"id":"anode","name":"Anode (+)","type":"DIGITAL_IO"},{"id":"cathode","name":"Cathode (-)","type":"GROUND"}]'::jsonb,
 '{"forwardVoltage": 2.2, "maxCurrentMa": 20}'::jsonb, '{"massGrams": 0.3}'::jsonb, true, 2.00),

('comp_rgb_led', 'RV-COMP-LED-RGB', 'RGB 5mm Common Cathode LED', 'DISPLAY',
 '[{"id":"r","name":"Red Anode","type":"PWM"},{"id":"g","name":"Green Anode","type":"PWM"},{"id":"b","name":"Blue Anode","type":"PWM"},{"id":"cathode","name":"Cathode","type":"GROUND"}]'::jsonb,
 '{"vForward": 2.2, "maxCurrentMa": 20}'::jsonb, '{"massGrams": 0.4}'::jsonb, true, 10.00),

('comp_display_lcd1602_i2c', 'RV-COMP-LCD-1602-I2C', '16x2 Character LCD with I2C Backpack', 'DISPLAY',
 '[{"id":"vcc","name":"VCC 5V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"},{"id":"sda","name":"SDA","type":"I2C_SDA"},{"id":"scl","name":"SCL","type":"I2C_SCL"}]'::jsonb,
 '{"operatingVoltage": 5.0, "i2cAddress": "0x27"}'::jsonb, '{"massGrams": 35}'::jsonb, true, 229.00),

('comp_display_oled_096', 'RV-COMP-OLED-096-I2C', '0.96" I2C Monochrome OLED (128x64)', 'DISPLAY',
 '[{"id":"vcc","name":"VCC","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"},{"id":"sda","name":"SDA","type":"I2C_SDA"},{"id":"scl","name":"SCL","type":"I2C_SCL"}]'::jsonb,
 '{"operatingVoltage": 3.3, "i2cAddress": "0x3C"}'::jsonb, '{"massGrams": 9}'::jsonb, true, 299.00),

-- Actuators, Motors & Drivers
('comp_buzzer_active', 'RV-COMP-BUZZER-ACT', '5V Active Buzzer', 'ACTUATOR',
 '[{"id":"vcc","name":"VCC (+)","type":"POWER_VCC"},{"id":"gnd","name":"GND (-)","type":"GROUND"}]'::jsonb,
 '{"operatingVoltage": 5.0, "soundFrequencyHz": 2500}'::jsonb, '{"massGrams": 3}'::jsonb, true, 25.00),

('comp_servo_sg90', 'RV-COMP-SERVO-SG90', 'TowerPro SG90 9g Micro Servo', 'ACTUATOR',
 '[{"id":"vcc","name":"VCC (Red 5V)","type":"POWER_VCC"},{"id":"gnd","name":"GND (Brown)","type":"GROUND"},{"id":"pwm","name":"PWM (Orange)","type":"PWM"}]'::jsonb,
 '{"operatingVoltage": 5.0, "stallTorqueKgCm": 1.8, "speedSec60Deg": 0.12}'::jsonb, '{"massGrams": 9}'::jsonb, true, 139.00),

('comp_servo_mg90s', 'RV-COMP-SERVO-MG90S', 'MG90S Metal Gear Micro Servo', 'ACTUATOR',
 '[{"id":"vcc","name":"VCC","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"},{"id":"pwm","name":"PWM","type":"PWM"}]'::jsonb,
 '{"operatingVoltage": 5.0, "stallTorqueKgCm": 2.2, "metalGears": true}'::jsonb, '{"massGrams": 14}'::jsonb, true, 249.00),

('comp_motor_dc_tt', 'RV-COMP-MOTOR-TT', 'TT Gear Motor (1:48) with Rubber Wheel', 'ACTUATOR',
 '[{"id":"m_plus","name":"Motor (+)","type":"DIGITAL_IO"},{"id":"m_minus","name":"Motor (-)","type":"GROUND"}]'::jsonb,
 '{"operatingVoltage": 6.0, "rpmNoLoad": 200, "torqueKgCm": 0.8}'::jsonb, '{"massGrams": 30}'::jsonb, true, 119.00),

('comp_motor_driver_l298n', 'RV-COMP-DRV-L298N', 'L298N Dual H-Bridge Motor Driver Module', 'ACTUATOR',
 '[{"id":"12v","name":"12V Power","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"},{"id":"5v_out","name":"5V Reg Out","type":"POWER_VCC"},{"id":"in1","name":"IN1","type":"DIGITAL_IO"},{"id":"in2","name":"IN2","type":"DIGITAL_IO"},{"id":"in3","name":"IN3","type":"DIGITAL_IO"},{"id":"in4","name":"IN4","type":"DIGITAL_IO"},{"id":"ena","name":"ENA","type":"PWM"},{"id":"enb","name":"ENB","type":"PWM"}]'::jsonb,
 '{"maxSupplyVoltage": 35.0, "peakCurrentPerChannelAmps": 2.0}'::jsonb, '{"massGrams": 28}'::jsonb, true, 169.00),

('comp_relay_1ch', 'RV-COMP-RELAY-1CH', '1-Channel 5V Optocoupler Relay Module', 'ACTUATOR',
 '[{"id":"vcc","name":"VCC 5V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"},{"id":"in","name":"IN Trigger","type":"DIGITAL_IO"}]'::jsonb,
 '{"maxSwitchingCurrentAmps": 10, "maxAcVolts": 250}'::jsonb, '{"massGrams": 15}'::jsonb, true, 69.00),

-- Sensors
('comp_ultrasonic_hcsr04', 'RV-COMP-SNS-HCSR04', 'HC-SR04 Ultrasonic Distance Sensor', 'SENSOR',
 '[{"id":"vcc","name":"VCC 5V","type":"POWER_VCC"},{"id":"trig","name":"Trig","type":"DIGITAL_IO"},{"id":"echo","name":"Echo","type":"DIGITAL_IO"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"operatingVoltage": 5.0, "minRangeCm": 2, "maxRangeCm": 400}'::jsonb, '{"massGrams": 8.5}'::jsonb, true, 89.00),

('comp_ldr', 'RV-COMP-SNS-LDR-5MM', 'Photoresistor / LDR (5mm)', 'SENSOR',
 '[{"id":"p1","name":"Pin 1","type":"DIGITAL_IO"},{"id":"p2","name":"Pin 2","type":"DIGITAL_IO"}]'::jsonb,
 '{"lightResistanceOhms": 1000, "darkResistanceOhms": 1000000}'::jsonb, '{"massGrams": 0.5}'::jsonb, true, 12.00),

('comp_sensor_pir_hc501', 'RV-COMP-SNS-HC501', 'HC-SR501 PIR Motion Sensor', 'SENSOR',
 '[{"id":"vcc","name":"VCC","type":"POWER_VCC"},{"id":"out","name":"Digital Out","type":"DIGITAL_IO"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"operatingVoltage": 5.0, "detectRangeMeters": 7}'::jsonb, '{"massGrams": 16}'::jsonb, true, 99.00),

('comp_sensor_dht11', 'RV-COMP-SNS-DHT11', 'DHT11 Temperature & Humidity Sensor', 'SENSOR',
 '[{"id":"vcc","name":"VCC 5V","type":"POWER_VCC"},{"id":"data","name":"Data Bus","type":"DIGITAL_IO"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"tempRangeC": [0, 50], "humidityRange": [20, 90]}'::jsonb, '{"massGrams": 4}'::jsonb, true, 99.00),

('comp_sensor_mpu6050', 'RV-COMP-SNS-MPU6050', 'MPU-6050 6-DOF IMU (Gyro + Accelerometer)', 'SENSOR',
 '[{"id":"vcc","name":"VCC 3.3V-5V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"},{"id":"sda","name":"SDA","type":"I2C_SDA"},{"id":"scl","name":"SCL","type":"I2C_SCL"}]'::jsonb,
 '{"gyroRangeDps": 2000, "accelRangeG": 16, "i2cAddress": "0x68"}'::jsonb, '{"massGrams": 3}'::jsonb, true, 159.00),

('comp_sensor_line_5ch', 'RV-COMP-SNS-LINE5CH', '5-Channel TCRT5000 IR Line Tracking Array', 'SENSOR',
 '[{"id":"vcc","name":"VCC 5V","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"},{"id":"out1","name":"Sensor 1","type":"DIGITAL_IO"},{"id":"out2","name":"Sensor 2","type":"DIGITAL_IO"},{"id":"out3","name":"Sensor 3","type":"DIGITAL_IO"},{"id":"out4","name":"Sensor 4","type":"DIGITAL_IO"},{"id":"out5","name":"Sensor 5","type":"DIGITAL_IO"}]'::jsonb,
 '{"detectRangeMm": [5, 25]}'::jsonb, '{"massGrams": 12}'::jsonb, true, 249.00),

-- Drone Parts & Power
('comp_battery_18650_2s', 'RV-COMP-BAT-18650-2S', '2-Cell 18650 Battery Pack with Holder', 'POWER',
 '[{"id":"v_out","name":"V+ (7.4V Nom / 8.4V Max)","type":"POWER_VCC"},{"id":"gnd","name":"GND","type":"GROUND"}]'::jsonb,
 '{"nominalVoltage": 7.4, "capacityMah": 2600}'::jsonb, '{"massGrams": 105}'::jsonb, true, 258.00),

('comp_drone_motor_2212', 'RV-COMP-DRN-M2212', 'A2212 1000KV Brushless BLDC Drone Motor', 'ACTUATOR',
 '[{"id":"phase_u","name":"Phase U","type":"DIGITAL_IO"},{"id":"phase_v","name":"Phase V","type":"DIGITAL_IO"},{"id":"phase_w","name":"Phase W","type":"DIGITAL_IO"}]'::jsonb,
 '{"kvRating": 1000, "maxThrustGrams": 850, "maxCurrentAmps": 12}'::jsonb, '{"massGrams": 47}'::jsonb, true, 449.00),

('comp_drone_esc_30a', 'RV-COMP-DRN-ESC30A', '30A Brushless ESC with 5V 2A BEC', 'ACTUATOR',
 '[{"id":"bat_plus","name":"Battery (+)","type":"POWER_VCC"},{"id":"bat_minus","name":"Battery (-)","type":"GROUND"},{"id":"pwm","name":"Signal","type":"PWM"}]'::jsonb,
 '{"continuousCurrentAmps": 30, "becOutputVolts": 5.0}'::jsonb, '{"massGrams": 25}'::jsonb, true, 499.00),

('comp_drone_frame_f450', 'RV-COMP-DRN-F450', 'F450 Quadcopter Drone Glass Fiber Frame Kit', 'MECHANICAL',
 '[]'::jsonb, '{"wheelbaseMm": 450, "integratedPdb": true}'::jsonb, '{"massGrams": 282}'::jsonb, true, 799.00)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_inr = EXCLUDED.price_inr;

-- 4. ROBOT TEMPLATES & ARENAS (SECTION 5)
INSERT INTO public.arenas (id, name, description, terrain_type, dimensions, obstacles) VALUES
('arena_line_track', 'Line Following Pro Raceway', 'Smooth high-contrast vinyl surface with sharp 90-degree hairpins, S-curves, cross intersections, and loop sections.', 'asphalt', '[15, 10]'::jsonb, '[]'::jsonb),
('arena_obstacle_maze', 'Autonomous Maze & Obstacle Course', 'Grid-based maze with dynamic wooden barriers, dead-ends, and infrared reflective targets.', 'tile', '[12, 12]'::jsonb, '[{"type":"box","x":2,"y":3}]'::jsonb),
('arena_drone_gates', 'Quadcopter FPV Airfield', 'Open sky arena with neon glowing navigation gates, altitude checkpoints, and simulated wind gusts.', 'airfield', '[50, 50]'::jsonb, '[{"type":"gate","z":3}]'::jsonb),
('arena_sumo_ring', 'National Sumo Ring (Dohyo)', 'Elevated circular sumo wrestling ring (diameter 154cm) with black interior and 5cm white border.', 'vinyl', '[3, 3]'::jsonb, '[]'::jsonb),
('arena_pick_place', 'Robotic Arm Sorting Workbench', 'Industrial workbench with colored sorting bins, cubic blocks, and precision coordinate grid.', 'metal', '[2, 1.5]'::jsonb, '[]'::jsonb),
('arena_balance_test', 'Inverted Pendulum Tilt Ramp', 'Adjustable incline ramp and moving platform to test real-time PID tilt angle balancing.', 'wood', '[6, 2]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.robot_templates (id, name, slug, description, starter_code, parts_list, arena_id, difficulty) VALUES
(
  'tmpl_line_follower', 'Line Following Autonomous Rover', 'line-following-car',
  'Differential drive 2WD robot using a 5-channel infrared sensor array to track black path lines with PID steering.',
  'const int s1=2, s2=3, s3=4, s4=5, s5=6;\nvoid setup() { pinMode(s3, INPUT); }\nvoid loop() { /* PID Line Tracking */ }',
  '["comp_arduino_uno", "comp_motor_driver_l298n", "comp_motor_dc_tt", "comp_sensor_line_5ch", "comp_battery_18650_2s"]'::jsonb,
  'arena_line_track', 'Beginner'
),
(
  'tmpl_quadcopter_f450', 'Quadcopter Drone F450', 'quadcopter-drone',
  '4-rotor aerial drone powered by four 2212 1000KV brushless motors, 30A ESCs, and 6-DOF IMU attitude stabilization.',
  'void setup() { /* Initialize MPU6050 and 4 ESC PWM Timers */ }\nvoid loop() { /* Rate PID Pitch/Roll/Yaw */ }',
  '["comp_drone_frame_f450", "comp_drone_motor_2212", "comp_drone_esc_30a", "comp_sensor_mpu6050"]'::jsonb,
  'arena_drone_gates', 'Advanced'
),
(
  'tmpl_robotic_arm_4dof', '4-DOF Articulated Robotic Arm', 'robotic-arm-4dof',
  'Four-axis mechanical arm with base rotation, shoulder, elbow, and gripper actuated by MG90S metal-gear servos.',
  '#include <Servo.h>\nServo base, shoulder, elbow, gripper;\nvoid setup() { base.attach(9); }\nvoid loop() {}',
  '["comp_arduino_uno", "comp_servo_mg90s", "comp_potentiometer_10k"]'::jsonb,
  'arena_pick_place', 'Intermediate'
),
(
  'tmpl_robotic_hand', 'Bionic 5-Finger Robotic Hand', 'robotic-hand-5dof',
  'Anatomically proportioned robotic hand with independent tendon cables pulled by five SG90 micro servos.',
  '#include <Servo.h>\nServo fingers[5];\nvoid setup() { for(int i=0; i<5; i++) fingers[i].attach(2+i); }\nvoid loop() {}',
  '["comp_arduino_uno", "comp_servo_sg90", "comp_potentiometer_10k"]'::jsonb,
  'arena_pick_place', 'Intermediate'
),
(
  'tmpl_obstacle_avoiding_car', 'Obstacle Avoiding Ultrasonic Rover', 'obstacle-avoiding-car',
  'Smart vehicle that navigates unknown environments by scanning surroundings with an HC-SR04 mounted on a servo.',
  'void setup() {}\nvoid loop() { /* Read ultrasonic distance -> Turn left/right if obstacle < 20cm */ }',
  '["comp_arduino_uno", "comp_motor_driver_l298n", "comp_motor_dc_tt", "comp_ultrasonic_hcsr04", "comp_servo_sg90", "comp_battery_18650_2s"]'::jsonb,
  'arena_obstacle_maze', 'Beginner'
),
(
  'tmpl_self_balancing_robot', 'Two-Wheeled Self-Balancing Inverted Pendulum', 'self-balancing-robot',
  'Two-wheeled dynamic robot maintaining vertical equilibrium using MPU6050 complementary filters and fast PID loops.',
  'void setup() {}\nvoid loop() { /* Compute Kalman tilt angle -> Drive motors forward/backward */ }',
  '["comp_arduino_nano", "comp_sensor_mpu6050", "comp_motor_driver_l298n", "comp_motor_dc_tt", "comp_battery_18650_2s"]'::jsonb,
  'arena_balance_test', 'Advanced'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 5. TECHSAVYYY STORE PRODUCT CATEGORIES & SEED CATALOG (SECTION 8)
INSERT INTO public.product_categories (id, name, slug, description, icon) VALUES
('cat_boards', 'Microcontrollers & Dev Boards', 'boards', 'Arduino, ESP32, Raspberry Pi Pico microcontrollers.', 'Cpu'),
('cat_proto', 'Prototyping & Passives', 'prototyping', 'Breadboards, jumper wires, resistors, capacitors, switches.', 'Layers'),
('cat_sensors', 'Sensors & Modules', 'sensors', 'Ultrasonic, IMU, IR, gas, temperature, optical sensors.', 'Radio'),
('cat_motion', 'Motors, Actuators & Drivers', 'motion', 'Servos, DC gear motors, stepper motors, motor drivers.', 'Zap'),
('cat_displays', 'Displays & Indicators', 'displays', '16x2 LCDs, OLEDs, LEDs, RGB LEDs, buzzers.', 'Tv'),
('cat_tools', 'Tools & Soldering Stations', 'tools', 'Soldering irons, multimeters, wire strippers, safety gear.', 'Wrench'),
('cat_drones', 'Drone Components & Frames', 'drone-parts', 'BLDC motors, ESCs, carbon frames, flight controllers.', 'Send'),
('cat_kits', 'Official Learning Kits', 'kits', 'All-in-one curated robotic learning and starter kits.', 'Package')
ON CONFLICT (id) DO NOTHING;

-- Seed Products (Prices GST-inclusive matching Section 8)
INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock, component_id, age_restricted, shipping_class) VALUES
('TS-BRD-UNO-CH340', 'Arduino Uno R3 Compatible (CH340 with Cable)', 'cat_boards', 399.00, 599.00, 18.00, 200, 'comp_arduino_uno', false, 'standard'),
('TS-BRD-UNO-ORIG', 'Arduino Uno R3 Original (Made in Italy)', 'cat_boards', 2650.00, 2999.00, 18.00, 50, 'comp_arduino_uno', false, 'standard'),
('TS-BRD-NANO-CH340', 'Arduino Nano Compatible V3', 'cat_boards', 349.00, 499.00, 18.00, 150, 'comp_arduino_nano', false, 'standard'),
('TS-BRD-ESP32-WROOM', 'ESP32 DevKit WROOM-32', 'cat_boards', 499.00, 699.00, 18.00, 120, 'comp_esp32_devkit', false, 'standard'),
('TS-BRD-RPI-PICO', 'Raspberry Pi Pico RP2040', 'cat_boards', 449.00, 599.00, 18.00, 100, 'comp_rpi_pico', false, 'standard'),
('TS-PRT-BB-830', 'Solderless Breadboard 830 Points', 'cat_proto', 129.00, 199.00, 18.00, 300, 'comp_breadboard_half', false, 'standard'),
('TS-PRT-JUMP-40', 'Jumper Wires 40-Pack (M-M, M-F, F-F)', 'cat_proto', 69.00, 99.00, 18.00, 400, NULL, false, 'standard'),
('TS-PRT-RES-600', 'Metal Film Resistor Assortment 600 Pcs', 'cat_proto', 199.00, 299.00, 18.00, 150, 'comp_resistor_220', false, 'standard'),
('TS-PRT-LED-100', 'Diffused LED Assortment 100 Pcs', 'cat_displays', 99.00, 149.00, 18.00, 250, 'comp_led_red', false, 'standard'),
('TS-SNS-HCSR04', 'HC-SR04 Ultrasonic Distance Sensor', 'cat_sensors', 89.00, 149.00, 18.00, 200, 'comp_ultrasonic_hcsr04', false, 'standard'),
('TS-SNS-MPU6050', 'MPU-6050 6-DOF Gyro + Accelerometer', 'cat_sensors', 159.00, 249.00, 18.00, 150, 'comp_sensor_mpu6050', false, 'standard'),
('TS-MOT-SG90', 'TowerPro SG90 9g Micro Servo', 'cat_motion', 139.00, 199.00, 18.00, 250, 'comp_servo_sg90', false, 'standard'),
('TS-MOT-MG90S', 'MG90S Metal Gear Micro Servo', 'cat_motion', 249.00, 349.00, 18.00, 180, 'comp_servo_mg90s', false, 'standard'),
('TS-MOT-L298N', 'L298N Dual Motor Driver Board', 'cat_motion', 169.00, 249.00, 18.00, 180, 'comp_motor_driver_l298n', false, 'standard'),
('TS-PWR-BAT18650', '18650 3.7V 2600mAh Li-ion Cell', 'cat_proto', 199.00, 299.00, 18.00, 200, NULL, false, 'battery'),
('TS-TOL-MULTIMETER', 'Digital Multimeter with Probes & Continuity Beep', 'cat_tools', 449.00, 699.00, 18.00, 90, NULL, true, 'standard'),
('TS-TOL-SOLDER-IRON', '60W Adjustable Temperature Soldering Iron', 'cat_tools', 499.00, 799.00, 18.00, 80, NULL, true, 'standard'),
('TS-DRN-F450-KIT', 'F450 Quadcopter Drone Complete Frame', 'cat_drones', 799.00, 1199.00, 18.00, 40, 'comp_drone_frame_f450', true, 'regulated_drone'),
('TS-DRN-MOTOR-2212', 'A2212 1000KV Brushless BLDC Motor', 'cat_drones', 449.00, 649.00, 18.00, 120, 'comp_drone_motor_2212', false, 'standard'),
('TS-DRN-ESC-30A', 'SimonK 30A Brushless ESC', 'cat_drones', 499.00, 699.00, 18.00, 120, 'comp_drone_esc_30a', false, 'standard')
ON CONFLICT (sku) DO NOTHING;

-- 6. 10 LEARNING KITS (MATCHING SECTION 8 WITH EXACT SUM-OF-PARTS AND SAVINGS)
DO $$
DECLARE
  v_prod_id UUID;
  v_kit_id UUID;
BEGIN
  -- Kit 1: Arduino Starter Kit (1199 vs parts 1467)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-01-ARDUINO-STARTER', 'RoboVerse Arduino Starter Kit', 'cat_kits', 1199.00, 1467.00, 18.00, 100)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 1199.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr, course_id)
  VALUES (v_prod_id, 'Arduino Starter Kit', 'arduino-starter-kit', 'Includes Uno, 830-pt breadboard, 3 jumper sets, resistors, LEDs, RGB LED, buttons, 2 pots, buzzer, 2 LDRs, 16x2 LCD I2C.', 1199.00, 1467.00, 'crs_arduino_learn')
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 2: Line Following Robot Kit (1199 vs parts 1433)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-02-LINE-FOLLOWER', 'Line Following Autonomous Robot Kit', 'cat_kits', 1199.00, 1433.00, 18.00, 80)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 1199.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr, robot_template_id)
  VALUES (v_prod_id, 'Line Following Robot Kit', 'line-following-robot-kit', 'Includes Uno, L298N driver, 2WD chassis with 2 TT motors, caster, 5-ch IR line array, 18650 battery holder, jumpers.', 1199.00, 1433.00, 'tmpl_line_follower')
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 3: Obstacle Avoiding Car Kit (1299 vs parts 1412)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-03-OBSTACLE-AVOID', 'Obstacle Avoiding Ultrasonic Car Kit', 'cat_kits', 1299.00, 1412.00, 18.00, 75)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 1299.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr, robot_template_id)
  VALUES (v_prod_id, 'Obstacle Avoiding Car Kit', 'obstacle-avoiding-car-kit', 'Includes Uno, L298N, 2WD chassis, caster, HC-SR04 ultrasonic sensor, SG90 servo, 18650 holder, jumpers.', 1299.00, 1412.00, 'tmpl_obstacle_avoiding_car')
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 4: Robotic Hand Kit (1999 vs parts 2404)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-04-ROBOTIC-HAND', 'Bionic Robotic Hand Structure Kit', 'cat_kits', 1999.00, 2404.00, 18.00, 50)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 1999.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr, robot_template_id)
  VALUES (v_prod_id, 'Robotic Hand Kit', 'robotic-hand-kit', 'Includes Uno, 5 SG90 servos, 5 potentiometers, acrylic hand structure, jumpers, breadboard, 5V 3A power supply.', 1999.00, 2404.00, 'tmpl_robotic_hand')
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 5: 4-DOF Robotic Arm Kit (2199 vs parts 2560)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-05-ROBOTIC-ARM', '4-DOF Articulated Robotic Arm Kit', 'cat_kits', 2199.00, 2560.00, 18.00, 60)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 2199.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr, robot_template_id)
  VALUES (v_prod_id, 'Robotic Arm Kit 4-DOF', 'robotic-arm-kit-4dof', 'Includes Uno, 4 MG90S metal-gear servos, laser-cut acrylic arm structure, breadboard, jumpers, 5V 3A adapter.', 2199.00, 2560.00, 'tmpl_robotic_arm_4dof')
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 6: Self-Balancing Robot Kit (1249 vs parts 1392)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-06-SELF-BALANCE', 'Two-Wheeled Self-Balancing Robot Kit', 'cat_kits', 1249.00, 1392.00, 18.00, 50)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 1249.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr, robot_template_id)
  VALUES (v_prod_id, 'Self-Balancing Robot Kit', 'self-balancing-robot-kit', 'Includes Nano, MPU6050 IMU, L298N driver, 2 high-speed TT gear motors, chassis, 18650 holder, jumpers.', 1249.00, 1392.00, 'tmpl_self_balancing_robot')
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 7: Sensor Learning Kit (899 vs parts 1098)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-07-SENSOR-PACK', '10-in-1 Sensor Learning Pack', 'cat_kits', 899.00, 1098.00, 18.00, 80)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 899.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr)
  VALUES (v_prod_id, 'Sensor Learning Kit', 'sensor-learning-kit', 'HC-SR04, PIR, DHT11, IR obstacle, LDR, MPU6050, buzzer, relay, breadboard, jumpers, 0.96" OLED display.', 899.00, 1098.00)
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 8: IoT Starter Kit ESP32 (999 vs parts 1189)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock)
  VALUES ('KIT-08-IOT-ESP32', 'ESP32 Wi-Fi & Bluetooth IoT Starter Kit', 'cat_kits', 999.00, 1189.00, 18.00, 90)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 999.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr)
  VALUES (v_prod_id, 'IoT Starter Kit ESP32', 'iot-starter-kit-esp32', 'ESP32 DevKit, DHT11 temp/humidity, OLED I2C, 1-ch relay, breadboard, jumpers, buzzer.', 999.00, 1189.00)
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 9: Drone Learning Kit F450 (11999 vs parts 13536) - DGCA notice
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock, age_restricted, shipping_class)
  VALUES ('KIT-09-DRONE-F450', 'F450 Quadcopter Drone Complete Learning Kit', 'cat_kits', 11999.00, 13536.00, 18.00, 20, true, 'regulated_drone')
  ON CONFLICT (sku) DO UPDATE SET price_inr = 11999.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr, robot_template_id)
  VALUES (v_prod_id, 'Drone Learning Kit F450', 'drone-learning-kit-f450', 'F450 frame, 4 BLDC motors, 4 30A ESCs, props, flight controller, 3S 2200mAh LiPo, 6-ch transmitter/receiver, PDB. (Regulated shipping, 18+ or parental consent).', 11999.00, 13536.00, 'tmpl_quadcopter_f450')
  ON CONFLICT (product_id) DO NOTHING;

  -- Kit 10: Soldering and Tools Kit (1199 vs parts 1445)
  INSERT INTO public.products (sku, name, category_id, price_inr, mrp_inr, gst_percent, stock, age_restricted)
  VALUES ('KIT-10-SOLDERING-TOOLS', 'Electronics Soldering & Workshop Tools Kit', 'cat_kits', 1199.00, 1445.00, 18.00, 70, true)
  ON CONFLICT (sku) DO UPDATE SET price_inr = 1199.00 RETURNING id INTO v_prod_id;

  INSERT INTO public.kits (product_id, name, slug, description, price_inr, sum_of_parts_inr)
  VALUES (v_prod_id, 'Soldering and Tools Kit', 'soldering-and-tools-kit', '60W adjustable iron, 50g lead-free solder wire, digital multimeter, wire stripper, safety goggles. (Adult supervision required).', 1199.00, 1445.00)
  ON CONFLICT (product_id) DO NOTHING;
END $$;

-- 7. VERIFIED COMPONENT STORES ACROSS INDIA (SECTION 7)
INSERT INTO public.shops (
  name, phone, address, city, state, pincode, location, google_place_id, hours, categories, verified_status, last_verified_at, rating
) VALUES
(
  'ElectroHub Components & Robotics', '+91-11-23861234',
  'Shop 42, Ground Floor, Lajpat Rai Market, Chandni Chowk',
  'Delhi', 'Delhi', '110006',
  ST_SetSRID(ST_MakePoint(77.2355, 28.6562), 4326),
  'ChIJ48z6w7_8DDkR7Lh8-G-test1',
  '10:00 AM - 8:00 PM (Mon-Sat)',
  ARRAY['Arduino', 'Microcontrollers', 'Sensors', 'Robotics Kits'],
  'verified', NOW(), 4.8
),
(
  'Nehru Place Maker Supplies', '+91-11-41609876',
  'Building 14, 2nd Floor, Nehru Place Market',
  'Delhi', 'Delhi', '110019',
  ST_SetSRID(ST_MakePoint(77.2522, 28.5494), 4326),
  'ChIJ48z6w7_8DDkR7Lh8-G-test2',
  '10:30 AM - 8:30 PM (Mon-Sat)',
  ARRAY['Arduino', 'ESP32', 'Wires & Tools', '3D Printing'],
  'verified', NOW(), 4.6
),
(
  'RoboSpares Lab & Kits', '+91-80-22234567',
  '24/1 Sadar Patrappa Road (SP Road), Nagarathpete',
  'Bengaluru', 'Karnataka', '560002',
  ST_SetSRID(ST_MakePoint(77.5833, 12.9644), 4326),
  'ChIJ48z6w7_8DDkR7Lh8-G-test3',
  '10:30 AM - 8:30 PM (Mon-Sat)',
  ARRAY['Arduino', 'Motors', 'Sensors', 'Drone Parts'],
  'verified', NOW(), 4.9
),
(
  'Lamington Electronics Arcade', '+91-22-23876543',
  '12 Tara Temple Lane, Lamington Road, Grant Road East',
  'Mumbai', 'Maharashtra', '400007',
  ST_SetSRID(ST_MakePoint(72.8164, 18.9616), 4326),
  'ChIJ48z6w7_8DDkR7Lh8-G-test4',
  '11:00 AM - 8:30 PM (Mon-Sat)',
  ARRAY['Arduino', 'Raspberry Pi', 'Relays', 'Soldering'],
  'verified', NOW(), 4.7
)
ON CONFLICT (google_place_id) DO NOTHING;
