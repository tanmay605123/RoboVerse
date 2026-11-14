import { ComponentCategory, PinDefinition } from '../types/simulator';

export interface CatalogComponentItem {
  id: string;
  name: string;
  category: ComponentCategory;
  model3DUrl: string;
  datasheetUrl?: string;
  isFreeTier: boolean; // true = Basic set (Free), false = All set (Plus / Pro)
  priceInr: number;
  pins: PinDefinition[];
  defaultProperties: Record<string, any>;
  description: string;
}

export const ROBOVERSE_COMPONENTS_CATALOG: CatalogComponentItem[] = [
  // ==================== BASIC SET (FREE TIER) ====================
  {
    id: 'comp_arduino_uno',
    name: 'Arduino Uno R3',
    category: 'MICROCONTROLLER',
    model3DUrl: '/models/components/arduino_uno.glb',
    datasheetUrl: 'https://docs.arduino.cc/hardware/uno-rev3/',
    isFreeTier: true,
    priceInr: 499,
    pins: [
      { id: 'pin_5v', name: '5V', type: 'POWER_VCC', description: '5V Regulated Power Output' },
      { id: 'pin_3v3', name: '3.3V', type: 'POWER_VCC', description: '3.3V Regulated Output' },
      { id: 'pin_gnd_1', name: 'GND 1', type: 'GROUND', description: 'Ground' },
      { id: 'pin_gnd_2', name: 'GND 2', type: 'GROUND', description: 'Ground' },
      { id: 'pin_vin', name: 'VIN', type: 'POWER_VCC', description: 'Voltage Input 7-12V' },
      { id: 'pin_d0_rx', name: 'D0 (RX)', type: 'UART_RX', description: 'Serial Receive' },
      { id: 'pin_d1_tx', name: 'D1 (TX)', type: 'UART_TX', description: 'Serial Transmit' },
      { id: 'pin_d2', name: 'D2', type: 'DIGITAL_IO', description: 'Digital I/O' },
      { id: 'pin_d3_pwm', name: 'D3 (~PWM)', type: 'PWM', description: 'PWM Digital Pin 3' },
      { id: 'pin_d4', name: 'D4', type: 'DIGITAL_IO', description: 'Digital Pin 4' },
      { id: 'pin_d5_pwm', name: 'D5 (~PWM)', type: 'PWM', description: 'PWM Digital Pin 5' },
      { id: 'pin_d6_pwm', name: 'D6 (~PWM)', type: 'PWM', description: 'PWM Digital Pin 6' },
      { id: 'pin_d7', name: 'D7', type: 'DIGITAL_IO', description: 'Digital Pin 7' },
      { id: 'pin_d8', name: 'D8', type: 'DIGITAL_IO', description: 'Digital Pin 8' },
      { id: 'pin_d9_pwm', name: 'D9 (~PWM)', type: 'PWM', description: 'PWM Digital Pin 9' },
      { id: 'pin_d10_pwm', name: 'D10 (~PWM)', type: 'PWM', description: 'PWM Digital Pin 10' },
      { id: 'pin_d11_pwm', name: 'D11 (~PWM)', type: 'PWM', description: 'PWM Digital Pin 11' },
      { id: 'pin_d12', name: 'D12', type: 'DIGITAL_IO', description: 'Digital Pin 12' },
      { id: 'pin_d13', name: 'D13 (LED)', type: 'DIGITAL_IO', description: 'Built-in LED Pin 13' },
      { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN', description: 'Analog Input 0' },
      { id: 'pin_a1', name: 'A1', type: 'ANALOG_IN', description: 'Analog Input 1' },
      { id: 'pin_a2', name: 'A2', type: 'ANALOG_IN', description: 'Analog Input 2' },
      { id: 'pin_a3', name: 'A3', type: 'ANALOG_IN', description: 'Analog Input 3' },
      { id: 'pin_a4_sda', name: 'A4 (SDA)', type: 'I2C_SDA', description: 'Analog 4 / I2C Data' },
      { id: 'pin_a5_scl', name: 'A5 (SCL)', type: 'I2C_SCL', description: 'Analog 5 / I2C Clock' },
    ],
    defaultProperties: { clockSpeed: '16MHz', vcc: 5.0, mcu: 'ATmega328P' },
    description: 'Industry standard ATmega328P-based microcontroller board for beginners.',
  },
  {
    id: 'comp_resistor_220',
    name: '220Ω Resistor',
    category: 'PASSIVE',
    model3DUrl: '/models/components/resistor.glb',
    isFreeTier: true,
    priceInr: 2,
    pins: [
      { id: 't1', name: 'Terminal 1', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Terminal 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { resistance: 220, unit: 'Ω', colorBands: ['red', 'red', 'brown', 'gold'] },
    description: 'Carbon film resistor ideal for current limiting 5V LEDs.',
  },
  {
    id: 'comp_resistor_1k',
    name: '1kΩ Resistor',
    category: 'PASSIVE',
    model3DUrl: '/models/components/resistor.glb',
    isFreeTier: true,
    priceInr: 2,
    pins: [
      { id: 't1', name: 'Terminal 1', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Terminal 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { resistance: 1000, unit: 'Ω', colorBands: ['brown', 'black', 'red', 'gold'] },
    description: 'General purpose 1kΩ pull-up or voltage divider resistor.',
  },
  {
    id: 'comp_resistor_10k',
    name: '10kΩ Resistor',
    category: 'PASSIVE',
    model3DUrl: '/models/components/resistor.glb',
    isFreeTier: true,
    priceInr: 2,
    pins: [
      { id: 't1', name: 'Terminal 1', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Terminal 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { resistance: 10000, unit: 'Ω', colorBands: ['brown', 'black', 'orange', 'gold'] },
    description: 'High impedance pull-down/pull-up resistor for pushbuttons and LDR circuits.',
  },
  {
    id: 'comp_led_red',
    name: 'Red 5mm LED',
    category: 'DISPLAY',
    model3DUrl: '/models/components/led_red.glb',
    isFreeTier: true,
    priceInr: 5,
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO', description: 'Long leg (+)' },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND', description: 'Flat side (-)' },
    ],
    defaultProperties: { forwardVoltage: 2.0, maxCurrentMa: 20, color: '#FF3333' },
    description: 'Standard 5mm red through-hole indicator light emitting diode.',
  },
  {
    id: 'comp_led_green',
    name: 'Green 5mm LED',
    category: 'DISPLAY',
    model3DUrl: '/models/components/led_green.glb',
    isFreeTier: true,
    priceInr: 5,
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO' },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND' },
    ],
    defaultProperties: { forwardVoltage: 2.2, maxCurrentMa: 20, color: '#12B76A' },
    description: 'Standard 5mm green through-hole LED indicator.',
  },
  {
    id: 'comp_led_blue',
    name: 'Blue 5mm LED',
    category: 'DISPLAY',
    model3DUrl: '/models/components/led_blue.glb',
    isFreeTier: true,
    priceInr: 6,
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO' },
      { id: 'cathode', name: 'Cathode (-)', type: 'GROUND' },
    ],
    defaultProperties: { forwardVoltage: 3.0, maxCurrentMa: 20, color: '#4C8DFF' },
    description: 'High-intensity 5mm blue LED indicator.',
  },
  {
    id: 'comp_led_rgb',
    name: 'RGB LED (Common Cathode)',
    category: 'DISPLAY',
    model3DUrl: '/models/components/led_rgb.glb',
    isFreeTier: true,
    priceInr: 15,
    pins: [
      { id: 'red', name: 'Red Anode', type: 'PWM' },
      { id: 'cathode', name: 'Cathode (GND)', type: 'GROUND' },
      { id: 'blue', name: 'Blue Anode', type: 'PWM' },
      { id: 'green', name: 'Green Anode', type: 'PWM' },
    ],
    defaultProperties: { type: 'common_cathode', forwardVoltage: 2.1 },
    description: '4-pin full color RGB LED capable of millions of colors via PWM.',
  },
  {
    id: 'comp_pushbutton',
    name: 'Tactile Pushbutton',
    category: 'PASSIVE',
    model3DUrl: '/models/components/pushbutton.glb',
    isFreeTier: true,
    priceInr: 5,
    pins: [
      { id: 't1a', name: 'Pin 1a', type: 'DIGITAL_IO' },
      { id: 't1b', name: 'Pin 1b', type: 'DIGITAL_IO' },
      { id: 't2a', name: 'Pin 2a', type: 'DIGITAL_IO' },
      { id: 't2b', name: 'Pin 2b', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { isPressed: false, momentary: true },
    description: '6x6mm momentary tactile switch for digital user input.',
  },
  {
    id: 'comp_potentiometer',
    name: '10kΩ Rotary Potentiometer',
    category: 'PASSIVE',
    model3DUrl: '/models/components/potentiometer.glb',
    isFreeTier: true,
    priceInr: 25,
    pins: [
      { id: 't1', name: 'Terminal 1 (VCC)', type: 'POWER_VCC' },
      { id: 'wiper', name: 'Wiper (Signal)', type: 'ANALOG_IN' },
      { id: 't2', name: 'Terminal 2 (GND)', type: 'GROUND' },
    ],
    defaultProperties: { totalResistance: 10000, wiperPositionPct: 50 },
    description: 'Analog knob dial for adjusting voltage levels and sensor thresholds.',
  },
  {
    id: 'comp_capacitor_ceramic',
    name: '100nF Ceramic Capacitor',
    category: 'PASSIVE',
    model3DUrl: '/models/components/capacitor_ceramic.glb',
    isFreeTier: true,
    priceInr: 3,
    pins: [
      { id: 't1', name: 'Pin 1', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Pin 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { capacitance: '100nF', code: '104', maxVoltage: 50 },
    description: 'Non-polarized ceramic disc capacitor for high-frequency noise decoupling.',
  },
  {
    id: 'comp_capacitor_electrolytic',
    name: '100µF Electrolytic Capacitor',
    category: 'PASSIVE',
    model3DUrl: '/models/components/capacitor_electrolytic.glb',
    isFreeTier: true,
    priceInr: 5,
    pins: [
      { id: 'anode', name: 'Positive (+)', type: 'POWER_VCC' },
      { id: 'cathode', name: 'Negative (-)', type: 'GROUND' },
    ],
    defaultProperties: { capacitance: '100µF', maxVoltage: 25, polarized: true },
    description: 'Polarized cylindrical capacitor for power supply smoothing.',
  },
  {
    id: 'comp_slideswitch',
    name: 'SPDT Slide Switch',
    category: 'PASSIVE',
    model3DUrl: '/models/components/slideswitch.glb',
    isFreeTier: true,
    priceInr: 10,
    pins: [
      { id: 't1', name: 'Terminal 1', type: 'DIGITAL_IO' },
      { id: 'common', name: 'Common', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Terminal 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { position: 1 },
    description: 'Single-Pole Double-Throw toggle switch for power or mode selection.',
  },
  {
    id: 'comp_battery_9v',
    name: '9V Alkaline Battery',
    category: 'POWER',
    model3DUrl: '/models/components/battery_9v.glb',
    isFreeTier: true,
    priceInr: 45,
    pins: [
      { id: 'pos', name: 'Positive (+9V)', type: 'POWER_VCC' },
      { id: 'neg', name: 'Negative (GND)', type: 'GROUND' },
    ],
    defaultProperties: { voltage: 9.0, capacityMah: 500 },
    description: '9V PP3 battery with snap connector for standalone portable circuits.',
  },
  {
    id: 'comp_battery_coincell_3v',
    name: '3V Coin Cell (CR2032)',
    category: 'POWER',
    model3DUrl: '/models/components/battery_cr2032.glb',
    isFreeTier: true,
    priceInr: 20,
    pins: [
      { id: 'pos', name: 'Positive (+3V)', type: 'POWER_VCC' },
      { id: 'neg', name: 'Negative (GND)', type: 'GROUND' },
    ],
    defaultProperties: { voltage: 3.0, capacityMah: 220 },
    description: 'Compact 3V lithium coin cell for low-power wearables and RTCs.',
  },
  {
    id: 'comp_battery_aa_1v5',
    name: '4x AA 6V Battery Pack',
    category: 'POWER',
    model3DUrl: '/models/components/battery_aa_pack.glb',
    isFreeTier: true,
    priceInr: 95,
    pins: [
      { id: 'pos', name: 'Positive (+6V Red)', type: 'POWER_VCC' },
      { id: 'neg', name: 'Negative (GND Black)', type: 'GROUND' },
    ],
    defaultProperties: { voltage: 6.0, cellCount: 4 },
    description: '4x 1.5V AA holder providing 6V ideal for DC motors and servos.',
  },
  {
    id: 'comp_breadboard_small',
    name: 'Breadboard Small (400 Tie-Points)',
    category: 'PROTOTYPING',
    model3DUrl: '/models/components/breadboard_400.glb',
    isFreeTier: true,
    priceInr: 80,
    pins: [
      { id: 'rail_pos_top', name: 'Power Rail Top (+)', type: 'POWER_VCC' },
      { id: 'rail_neg_top', name: 'Ground Rail Top (-)', type: 'GROUND' },
      { id: 'rail_pos_bot', name: 'Power Rail Bottom (+)', type: 'POWER_VCC' },
      { id: 'rail_neg_bot', name: 'Ground Rail Bottom (-)', type: 'GROUND' },
    ],
    defaultProperties: { tiePoints: 400, rows: 30, powerRails: 4 },
    description: 'Half-size solderless breadboard with dual power rails.',
  },
  {
    id: 'comp_microbit',
    name: 'BBC micro:bit v2',
    category: 'MICROCONTROLLER',
    model3DUrl: '/models/components/microbit.glb',
    datasheetUrl: 'https://microbit.org/get-started/user-guide/overview/',
    isFreeTier: true,
    priceInr: 1650,
    pins: [
      { id: 'pin_0', name: 'Pin 0 (P0)', type: 'DIGITAL_IO' },
      { id: 'pin_1', name: 'Pin 1 (P1)', type: 'DIGITAL_IO' },
      { id: 'pin_2', name: 'Pin 2 (P2)', type: 'DIGITAL_IO' },
      { id: 'pin_3v', name: '3V Power', type: 'POWER_VCC' },
      { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
    ],
    defaultProperties: { ledMatrix: '5x5', ble: true, motionSensor: true },
    description: 'Educational microcomputer with 5x5 LED matrix, radio, and sensors.',
  },
  {
    id: 'comp_vibration_motor',
    name: 'Coin Vibration Motor',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/vibration_motor.glb',
    isFreeTier: true,
    priceInr: 35,
    pins: [
      { id: 'pos', name: 'VCC (+ Blue/Red)', type: 'POWER_VCC' },
      { id: 'neg', name: 'GND (- Blue/Black)', type: 'GROUND' },
    ],
    defaultProperties: { operatingVoltage: 3.0, rpm: 12000 },
    description: 'Haptic feedback pancake vibration motor for tactile alerts.',
  },
  {
    id: 'comp_dc_motor',
    name: 'Small Toy DC Motor 3V-6V',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/dc_motor.glb',
    isFreeTier: true,
    priceInr: 40,
    pins: [
      { id: 't1', name: 'Terminal 1', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Terminal 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { voltage: 5.0, noLoadRpm: 9000 },
    description: 'High-speed mini DC motor for fans, propellers, and spinners.',
  },
  {
    id: 'comp_hobby_gearmotor',
    name: 'TT Hobby Gearmotor (BO Motor)',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/bo_motor.glb',
    isFreeTier: true,
    priceInr: 65,
    pins: [
      { id: 't1', name: 'Motor Terminal A', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Motor Terminal B', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { gearRatio: '1:48', operatingVoltage: 6.0, rpm: 200 },
    description: 'High torque yellow geared motor used on 2WD and 4WD robotic chassis.',
  },
  {
    id: 'comp_transistor_npn',
    name: '2N2222 NPN Transistor',
    category: 'PASSIVE',
    model3DUrl: '/models/components/transistor_2n2222.glb',
    isFreeTier: true,
    priceInr: 6,
    pins: [
      { id: 'collector', name: 'Collector (C)', type: 'POWER_VCC' },
      { id: 'base', name: 'Base (B)', type: 'DIGITAL_IO' },
      { id: 'emitter', name: 'Emitter (E)', type: 'GROUND' },
    ],
    defaultProperties: { maxCurrentMa: 800, vceMax: 40 },
    description: 'TO-92 bipolar junction transistor for switching motors and high-current loads.',
  },
  {
    id: 'comp_diode',
    name: '1N4007 Rectifier Diode',
    category: 'PASSIVE',
    model3DUrl: '/models/components/diode_1n4007.glb',
    isFreeTier: true,
    priceInr: 2,
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO' },
      { id: 'cathode', name: 'Cathode (- Band)', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { forwardCurrentA: 1.0, reverseVoltageV: 1000 },
    description: 'Flyback kickback protection diode for inductive coils and motors.',
  },
  {
    id: 'comp_photoresistor',
    name: 'Photoresistor (LDR)',
    category: 'SENSOR',
    model3DUrl: '/models/components/ldr.glb',
    isFreeTier: true,
    priceInr: 10,
    pins: [
      { id: 't1', name: 'Pin 1', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Pin 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { lightLevelLux: 300, darkResistanceK: 500, lightResistanceK: 10 },
    description: 'Cadmium sulfide light dependent resistor for daylight detection.',
  },
  {
    id: 'comp_soil_moisture_sensor',
    name: 'Soil Moisture Sensor Probe',
    category: 'SENSOR',
    model3DUrl: '/models/components/soil_sensor.glb',
    isFreeTier: true,
    priceInr: 60,
    pins: [
      { id: 'vcc', name: 'VCC (3.3V-5V)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'ao', name: 'Analog Out (AO)', type: 'ANALOG_IN' },
      { id: 'do', name: 'Digital Out (DO)', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { moisturePct: 45, threshold: 500 },
    description: 'Forks probe that measures volumetric water content in soil.',
  },
  {
    id: 'comp_tilt_sensor',
    name: 'Tilt Ball Switch Sensor',
    category: 'SENSOR',
    model3DUrl: '/models/components/tilt_sensor.glb',
    isFreeTier: true,
    priceInr: 15,
    pins: [
      { id: 't1', name: 'Terminal 1', type: 'DIGITAL_IO' },
      { id: 't2', name: 'Terminal 2', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { isTilted: false, ballContactClosed: true },
    description: 'Internal conductive rolling ball switch to detect orientation tilt.',
  },

  // ==================== ALL SET (PLUS & PRO TIERS) ====================
  {
    id: 'comp_esp32',
    name: 'ESP32 NodeMCU WROOM-32',
    category: 'MICROCONTROLLER',
    model3DUrl: '/models/components/esp32.glb',
    datasheetUrl: 'https://www.espressif.com/en/products/socs/esp32',
    isFreeTier: false,
    priceInr: 349,
    pins: [
      { id: 'pin_3v3', name: '3V3', type: 'POWER_VCC' },
      { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
      { id: 'pin_gpio2', name: 'GPIO2', type: 'DIGITAL_IO' },
      { id: 'pin_gpio4', name: 'GPIO4', type: 'DIGITAL_IO' },
      { id: 'pin_gpio18', name: 'GPIO18', type: 'DIGITAL_IO' },
      { id: 'pin_gpio19', name: 'GPIO19', type: 'DIGITAL_IO' },
      { id: 'pin_gpio21_sda', name: 'GPIO21 (SDA)', type: 'I2C_SDA' },
      { id: 'pin_gpio22_scl', name: 'GPIO22 (SCL)', type: 'I2C_SCL' },
      { id: 'pin_vin', name: 'VIN (5V)', type: 'POWER_VCC' },
    ],
    defaultProperties: { clockSpeed: '240MHz', wifi: true, ble: true, vcc: 3.3 },
    description: 'Powerful dual-core 240MHz microcontroller with built-in WiFi and BLE.',
  },
  {
    id: 'comp_arduino_nano',
    name: 'Arduino Nano V3',
    category: 'MICROCONTROLLER',
    model3DUrl: '/models/components/arduino_nano.glb',
    datasheetUrl: 'https://docs.arduino.cc/hardware/nano/',
    isFreeTier: false,
    priceInr: 249,
    pins: [
      { id: 'pin_5v', name: '5V', type: 'POWER_VCC' },
      { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
      { id: 'pin_d2', name: 'D2', type: 'DIGITAL_IO' },
      { id: 'pin_d3_pwm', name: 'D3 (~PWM)', type: 'PWM' },
      { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO' },
      { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN' },
      { id: 'pin_a4_sda', name: 'A4 (SDA)', type: 'I2C_SDA' },
      { id: 'pin_a5_scl', name: 'A5 (SCL)', type: 'I2C_SCL' },
    ],
    defaultProperties: { vcc: 5.0, formFactor: 'Breadboard Friendly DIP' },
    description: 'Breadboard-friendly mini ATmega328P microcontroller board.',
  },
  {
    id: 'comp_arduino_mega',
    name: 'Arduino Mega 2560 R3',
    category: 'MICROCONTROLLER',
    model3DUrl: '/models/components/arduino_mega.glb',
    datasheetUrl: 'https://docs.arduino.cc/hardware/mega-2560/',
    isFreeTier: false,
    priceInr: 999,
    pins: [
      { id: 'pin_5v', name: '5V', type: 'POWER_VCC' },
      { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
      { id: 'pin_d2', name: 'D2', type: 'DIGITAL_IO' },
      { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO' },
      { id: 'pin_d20_sda', name: 'D20 (SDA)', type: 'I2C_SDA' },
      { id: 'pin_d21_scl', name: 'D21 (SCL)', type: 'I2C_SCL' },
    ],
    defaultProperties: { digitalIoCount: 54, analogInCount: 16, mcu: 'ATmega2560' },
    description: 'High pin-count board for complex multi-joint robotic arms and 3D printers.',
  },
  {
    id: 'comp_rpi_pico',
    name: 'Raspberry Pi Pico (RP2040)',
    category: 'MICROCONTROLLER',
    model3DUrl: '/models/components/rpi_pico.glb',
    datasheetUrl: 'https://www.raspberrypi.com/documentation/microcontrollers/raspberry-pi-pico.html',
    isFreeTier: false,
    priceInr: 380,
    pins: [
      { id: 'pin_3v3', name: '3V3 Out', type: 'POWER_VCC' },
      { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
      { id: 'pin_gp0', name: 'GP0 (UART0 TX)', type: 'UART_TX' },
      { id: 'pin_gp1', name: 'GP1 (UART0 RX)', type: 'UART_RX' },
      { id: 'pin_gp25', name: 'GP25 (LED)', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { core: 'Dual ARM Cortex-M0+', clock: '133MHz' },
    description: 'Custom RP2040 silicon board with programmable I/O (PIO) blocks.',
  },
  {
    id: 'comp_servo_sg90',
    name: 'TowerPro SG90 Micro Servo',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/servo_sg90.glb',
    isFreeTier: false,
    priceInr: 120,
    pins: [
      { id: 'pwm', name: 'PWM Signal (Orange)', type: 'PWM' },
      { id: 'vcc', name: 'VCC 5V (Red)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND (Brown)', type: 'GROUND' },
    ],
    defaultProperties: { angleRange: 180, currentAngle: 90, operatingVoltage: 5.0 },
    description: 'Precision 9g miniature positional servo with 180-degree sweep.',
  },
  {
    id: 'comp_ultrasonic_hcsr04',
    name: 'HC-SR04 Ultrasonic Sonar Sensor',
    category: 'SENSOR',
    model3DUrl: '/models/components/ultrasonic.glb',
    isFreeTier: false,
    priceInr: 110,
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC' },
      { id: 'trig', name: 'Trig', type: 'DIGITAL_IO' },
      { id: 'echo', name: 'Echo', type: 'DIGITAL_IO' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
    defaultProperties: { distanceCm: 25, rangeCm: [2, 400], frequencyKhz: 40 },
    description: 'Non-contact distance measurement module with 2cm to 4m range.',
  },
  {
    id: 'comp_pir_motion_sensor',
    name: 'PIR Motion Sensor (HC-SR501)',
    category: 'SENSOR',
    model3DUrl: '/models/components/pir_sensor.glb',
    isFreeTier: false,
    priceInr: 95,
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC' },
      { id: 'out', name: 'Digital Out', type: 'DIGITAL_IO' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
    defaultProperties: { motionDetected: false, delayTimeSec: 3, sensitivityRangeM: 7 },
    description: 'Pyroelectric infrared motion detector for human intrusion sensing.',
  },
  {
    id: 'comp_ir_sensor',
    name: 'IR Obstacle Sensor Module',
    category: 'SENSOR',
    model3DUrl: '/models/components/ir_sensor.glb',
    isFreeTier: false,
    priceInr: 45,
    pins: [
      { id: 'vcc', name: 'VCC 5V', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'out', name: 'Digital Out (Active Low)', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { obstacleDetected: false, detectionRangeCm: 10 },
    description: 'Infrared transmitter-receiver pair for line follower and obstacle detection.',
  },
  {
    id: 'comp_dht11_temp_humidity',
    name: 'DHT11 Temperature & Humidity Sensor',
    category: 'SENSOR',
    model3DUrl: '/models/components/dht11.glb',
    isFreeTier: false,
    priceInr: 90,
    pins: [
      { id: 'vcc', name: 'VCC (3.3-5V)', type: 'POWER_VCC' },
      { id: 'data', name: 'Single-Bus Data', type: 'DIGITAL_IO' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
    defaultProperties: { temperatureC: 26, humidityPct: 55 },
    description: 'Digital temperature and relative humidity sensor with single-wire protocol.',
  },
  {
    id: 'comp_dht22_temp_humidity',
    name: 'DHT22 High-Precision Sensor',
    category: 'SENSOR',
    model3DUrl: '/models/components/dht22.glb',
    isFreeTier: false,
    priceInr: 280,
    pins: [
      { id: 'vcc', name: 'VCC', type: 'POWER_VCC' },
      { id: 'data', name: 'Data', type: 'DIGITAL_IO' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
    defaultProperties: { temperatureC: 24.5, humidityPct: 48.2, accuracyTempC: 0.5 },
    description: 'Calibrated digital sensor measuring -40°C to 80°C and 0-100% RH.',
  },
  {
    id: 'comp_mpu6050_gyro',
    name: 'MPU6050 6-Axis Gyro & Accelerometer',
    category: 'SENSOR',
    model3DUrl: '/models/components/mpu6050.glb',
    isFreeTier: false,
    priceInr: 195,
    pins: [
      { id: 'vcc', name: 'VCC (3.3V-5V)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'scl', name: 'SCL', type: 'I2C_SCL' },
      { id: 'sda', name: 'SDA', type: 'I2C_SDA' },
      { id: 'int', name: 'Interrupt', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { pitchDeg: 0, rollDeg: 0, yawDeg: 0, i2cAddress: '0x68' },
    description: 'MEMS MotionTracking device with 3-axis gyro and 3-axis accelerometer.',
  },
  {
    id: 'comp_gas_sensor_mq2',
    name: 'MQ-2 Flammable Gas & Smoke Sensor',
    category: 'SENSOR',
    model3DUrl: '/models/components/mq2_sensor.glb',
    isFreeTier: false,
    priceInr: 120,
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'ao', name: 'Analog Out', type: 'ANALOG_IN' },
      { id: 'do', name: 'Digital Out', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { gasLevelPpm: 120, detectedGas: 'LPG/Smoke' },
    description: 'Electro-chemical sensor for LPG, butane, methane, alcohol, and smoke.',
  },
  {
    id: 'comp_flame_sensor',
    name: 'IR Flame Detection Sensor',
    category: 'SENSOR',
    model3DUrl: '/models/components/flame_sensor.glb',
    isFreeTier: false,
    priceInr: 65,
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'ao', name: 'Analog Out', type: 'ANALOG_IN' },
      { id: 'do', name: 'Digital Out', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { flameDetected: false, wavelengthNm: 760 },
    description: 'Detects fire or light sources with wavelengths in the 760nm-1100nm spectrum.',
  },
  {
    id: 'comp_buzzer_piezo',
    name: 'Piezo Buzzer / Speaker',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/piezo_buzzer.glb',
    isFreeTier: false,
    priceInr: 20,
    pins: [
      { id: 'pos', name: 'Positive (+ Signal)', type: 'PWM' },
      { id: 'neg', name: 'Negative (GND)', type: 'GROUND' },
    ],
    defaultProperties: { frequencyHz: 2048, isBeeping: false, soundLevelDb: 85 },
    description: 'Piezoelectric element for tonal melodies and audio warning alerts.',
  },
  {
    id: 'comp_relay_module',
    name: '5V 1-Channel Relay Module',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/relay_module.glb',
    isFreeTier: false,
    priceInr: 85,
    pins: [
      { id: 'vcc', name: 'VCC 5V', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'in', name: 'Control IN (Active Low)', type: 'DIGITAL_IO' },
      { id: 'com', name: 'Common (COM)', type: 'POWER_VCC' },
      { id: 'no', name: 'Normally Open (NO)', type: 'POWER_VCC' },
      { id: 'nc', name: 'Normally Closed (NC)', type: 'POWER_VCC' },
    ],
    defaultProperties: { isEnergized: false, maxAcCurrentA: 10 },
    description: 'Optocoupler-isolated relay for safely controlling high-voltage appliances.',
  },
  {
    id: 'comp_motor_driver_l298n',
    name: 'L298N Dual H-Bridge Motor Driver',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/l298n_driver.glb',
    isFreeTier: false,
    priceInr: 180,
    pins: [
      { id: 'vcc_12v', name: '12V Power', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'vcc_5v', name: '5V Logic Out', type: 'POWER_VCC' },
      { id: 'ena', name: 'ENA (Speed A)', type: 'PWM' },
      { id: 'in1', name: 'IN1', type: 'DIGITAL_IO' },
      { id: 'in2', name: 'IN2', type: 'DIGITAL_IO' },
      { id: 'in3', name: 'IN3', type: 'DIGITAL_IO' },
      { id: 'in4', name: 'IN4', type: 'DIGITAL_IO' },
      { id: 'enb', name: 'ENB (Speed B)', type: 'PWM' },
      { id: 'out1', name: 'OUT1 (Motor A)', type: 'POWER_VCC' },
      { id: 'out2', name: 'OUT2 (Motor A)', type: 'GROUND' },
      { id: 'out3', name: 'OUT3 (Motor B)', type: 'POWER_VCC' },
      { id: 'out4', name: 'OUT4 (Motor B)', type: 'GROUND' },
    ],
    defaultProperties: { peakCurrentA: 2.0, heatSinkIncluded: true },
    description: 'Dual H-bridge module for independent bidirectional control of 2 DC motors.',
  },
  {
    id: 'comp_motor_driver_l293d',
    name: 'L293D Dual H-Bridge IC',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/l293d_ic.glb',
    isFreeTier: false,
    priceInr: 45,
    pins: [
      { id: 'en1', name: 'Enable 1,2', type: 'PWM' },
      { id: 'in1', name: 'Input 1', type: 'DIGITAL_IO' },
      { id: 'out1', name: 'Output 1', type: 'DIGITAL_IO' },
      { id: 'gnd1', name: 'GND', type: 'GROUND' },
      { id: 'vcc1', name: 'VCC1 (5V Logic)', type: 'POWER_VCC' },
      { id: 'vcc2', name: 'VCC2 (Motor Power)', type: 'POWER_VCC' },
    ],
    defaultProperties: { currentPerChannelMa: 600 },
    description: '16-pin quadruple half-H driver DIP IC for breadboard robotic motor circuits.',
  },
  {
    id: 'comp_stepper_motor',
    name: '28BYJ-48 Stepper Motor + ULN2003',
    category: 'ACTUATOR',
    model3DUrl: '/models/components/stepper_28byj48.glb',
    isFreeTier: false,
    priceInr: 160,
    pins: [
      { id: 'vcc', name: 'VCC 5V', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'in1', name: 'IN1', type: 'DIGITAL_IO' },
      { id: 'in2', name: 'IN2', type: 'DIGITAL_IO' },
      { id: 'in3', name: 'IN3', type: 'DIGITAL_IO' },
      { id: 'in4', name: 'IN4', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { stepsPerRevolution: 2048, strideAngleDeg: 5.625 },
    description: '4-phase 5V geared reduction stepper motor with ULN2003 driver array.',
  },
  {
    id: 'comp_lcd_16x2',
    name: '16x2 Character LCD (I2C Module)',
    category: 'DISPLAY',
    model3DUrl: '/models/components/lcd_16x2.glb',
    isFreeTier: false,
    priceInr: 180,
    pins: [
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC' },
      { id: 'sda', name: 'SDA', type: 'I2C_SDA' },
      { id: 'scl', name: 'SCL', type: 'I2C_SCL' },
    ],
    defaultProperties: { lines: 2, charactersPerLine: 16, i2cAddress: '0x27', backlight: true },
    description: 'Alphanumeric display with HD44780 controller and PCF8574 I2C backpack.',
  },
  {
    id: 'comp_oled_i2c',
    name: '0.96" I2C Monochrome OLED Display',
    category: 'DISPLAY',
    model3DUrl: '/models/components/oled_096.glb',
    isFreeTier: false,
    priceInr: 220,
    pins: [
      { id: 'vcc', name: 'VCC (3.3V-5V)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'scl', name: 'SCL', type: 'I2C_SCL' },
      { id: 'sda', name: 'SDA', type: 'I2C_SDA' },
    ],
    defaultProperties: { resolution: '128x64', driver: 'SSD1306', color: 'White' },
    description: 'Sharp graphic OLED with high contrast and fast I2C refresh rate.',
  },
  {
    id: 'comp_7_segment',
    name: '7-Segment 1-Digit Display',
    category: 'DISPLAY',
    model3DUrl: '/models/components/7segment.glb',
    isFreeTier: false,
    priceInr: 25,
    pins: [
      { id: 'seg_a', name: 'Segment A', type: 'DIGITAL_IO' },
      { id: 'seg_b', name: 'Segment B', type: 'DIGITAL_IO' },
      { id: 'seg_c', name: 'Segment C', type: 'DIGITAL_IO' },
      { id: 'seg_d', name: 'Segment D', type: 'DIGITAL_IO' },
      { id: 'seg_e', name: 'Segment E', type: 'DIGITAL_IO' },
      { id: 'seg_f', name: 'Segment F', type: 'DIGITAL_IO' },
      { id: 'seg_g', name: 'Segment G', type: 'DIGITAL_IO' },
      { id: 'com', name: 'Common Cathode (GND)', type: 'GROUND' },
    ],
    defaultProperties: { currentNumber: 8, color: '#FF3333' },
    description: 'Numeric single-digit LED display for countdown timers and counters.',
  },
  {
    id: 'comp_shift_register_74hc595',
    name: '74HC595 8-Bit Shift Register',
    category: 'PASSIVE',
    model3DUrl: '/models/components/shift_register_74hc595.glb',
    isFreeTier: false,
    priceInr: 18,
    pins: [
      { id: 'ser', name: 'SER (Data)', type: 'DIGITAL_IO' },
      { id: 'srclk', name: 'SRCLK (Clock)', type: 'DIGITAL_IO' },
      { id: 'rclk', name: 'RCLK (Latch)', type: 'DIGITAL_IO' },
      { id: 'vcc', name: 'VCC', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
    defaultProperties: { bits: 8 },
    description: 'Serial-in parallel-out shift register to expand microcontroller I/O pins.',
  },
  {
    id: 'comp_bluetooth_hc05',
    name: 'HC-05 Bluetooth Serial Module',
    category: 'COMMUNICATION',
    model3DUrl: '/models/components/hc05_bluetooth.glb',
    isFreeTier: false,
    priceInr: 260,
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'POWER_VCC' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
      { id: 'tx', name: 'TXD', type: 'UART_TX' },
      { id: 'rx', name: 'RXD', type: 'UART_RX' },
      { id: 'state', name: 'STATE', type: 'DIGITAL_IO' },
      { id: 'en', name: 'EN (AT Mode)', type: 'DIGITAL_IO' },
    ],
    defaultProperties: { baudRate: 9600, bluetoothVersion: '2.0+EDR' },
    description: 'SPP transparent serial port profile module for mobile robot remote control.',
  },
  {
    id: 'comp_multimeter',
    name: 'Digital Multimeter',
    category: 'POWER',
    model3DUrl: '/models/components/multimeter.glb',
    isFreeTier: false,
    priceInr: 450,
    pins: [
      { id: 'probe_pos', name: 'Red Probe (+)', type: 'ANALOG_IN' },
      { id: 'probe_neg', name: 'Black Probe (COM)', type: 'GROUND' },
    ],
    defaultProperties: { mode: 'VOLTAGE_DC', measuredValue: 5.0, unit: 'V' },
    description: 'Virtual lab instrument for measuring DC voltage, current, and resistance.',
  },
  {
    id: 'comp_oscilloscope',
    name: 'Dual-Channel Oscilloscope',
    category: 'POWER',
    model3DUrl: '/models/components/oscilloscope.glb',
    isFreeTier: false,
    priceInr: 3200,
    pins: [
      { id: 'ch1', name: 'CH1 Input', type: 'ANALOG_IN' },
      { id: 'ch2', name: 'CH2 Input', type: 'ANALOG_IN' },
      { id: 'gnd', name: 'Scope Ground', type: 'GROUND' },
    ],
    defaultProperties: { timebaseMs: 10, vDiv1: 1.0, vDiv2: 1.0, triggerMode: 'AUTO' },
    description: 'Real-time waveform tracer for PWM signals, clock pulses, and sensor signals.',
  },
  {
    id: 'comp_function_generator',
    name: 'Function Waveform Generator',
    category: 'POWER',
    model3DUrl: '/models/components/function_generator.glb',
    isFreeTier: false,
    priceInr: 2800,
    pins: [
      { id: 'out', name: 'Waveform Output', type: 'PWM' },
      { id: 'gnd', name: 'GND', type: 'GROUND' },
    ],
    defaultProperties: { waveform: 'SINE', frequencyHz: 1000, amplitudeV: 5.0 },
    description: 'Signal source providing sine, square, and triangle waves for testing.',
  },
];

export interface StarterAssemblyItem {
  id: string;
  title: string;
  category: 'Basic' | 'Arduino' | 'micro:bit' | 'Circuit Assemblies';
  description: string;
  thumbnailUrl: string;
  arduinoCode: string;
  components: Array<{
    id: string;
    typeId: string;
    name: string;
    category: ComponentCategory;
    model3DUrl: string;
    pins: PinDefinition[];
    properties: Record<string, any>;
    position: [number, number, number];
    rotation: [number, number, number];
  }>;
  wires: Array<{
    id: string;
    color: string;
    fromComponentId: string;
    fromPinId: string;
    toComponentId: string;
    toPinId: string;
  }>;
}

export const ROBOVERSE_STARTER_ASSEMBLIES: StarterAssemblyItem[] = [
  {
    id: 'starter_arduino_blink',
    title: 'Blink External LED',
    category: 'Arduino',
    description: 'The "Hello World" of physical computing. Controls a 5mm Red LED via Pin 13 with a 220Ω resistor.',
    thumbnailUrl: '/thumbnails/starter_blink.png',
    arduinoCode: `// RoboVerse Starter 1: Blink External LED
// Pin 13 -> 220Ω Resistor -> LED Anode (+) -> Cathode (-) -> GND

const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse Simulation Initialized: LED Blink Running!");
}

void loop() {
  digitalWrite(ledPin, HIGH);   // Turn LED ON (5V)
  Serial.println("LED: HIGH (ON)");
  delay(1000);                  // Wait 1 second
  
  digitalWrite(ledPin, LOW);    // Turn LED OFF (0V)
  Serial.println("LED: LOW (OFF)");
  delay(1000);                  // Wait 1 second
}
`,
    components: [
      {
        id: 'uno_1',
        typeId: 'comp_arduino_uno',
        name: 'Arduino Uno R3',
        category: 'MICROCONTROLLER',
        model3DUrl: '/models/components/arduino_uno.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_arduino_uno')!.pins,
        properties: { clockSpeed: '16MHz' },
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      },
      {
        id: 'r1',
        typeId: 'comp_resistor_220',
        name: '220Ω Resistor',
        category: 'PASSIVE',
        model3DUrl: '/models/components/resistor.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_resistor_220')!.pins,
        properties: { resistance: 220 },
        position: [120, 0, -40],
        rotation: [0, 0, 0],
      },
      {
        id: 'led_1',
        typeId: 'comp_led_red',
        name: 'Red 5mm LED',
        category: 'DISPLAY',
        model3DUrl: '/models/components/led_red.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_led_red')!.pins,
        properties: { color: '#FF3333' },
        position: [180, 0, -40],
        rotation: [0, 0, 0],
      },
    ],
    wires: [
      {
        id: 'w1',
        color: '#FF8A1F', // Orange signal wire
        fromComponentId: 'uno_1',
        fromPinId: 'pin_d13',
        toComponentId: 'r1',
        toPinId: 't1',
      },
      {
        id: 'w2',
        color: '#FF3333', // Red wire
        fromComponentId: 'r1',
        toComponentId: 'led_1',
        fromPinId: 't2',
        toPinId: 'anode',
      },
      {
        id: 'w3',
        color: '#1B2559', // Deep navy / black ground wire
        fromComponentId: 'led_1',
        toComponentId: 'uno_1',
        fromPinId: 'cathode',
        toPinId: 'pin_gnd_1',
      },
    ],
  },
  {
    id: 'starter_servo_sweep',
    title: 'Micro Servo Angular Sweep',
    category: 'Arduino',
    description: 'Smooth 0 to 180 degree back-and-forth rotational sweep using PWM on Digital Pin 9.',
    thumbnailUrl: '/thumbnails/starter_servo.png',
    arduinoCode: `// RoboVerse Starter 2: Micro Servo Sweep
#include <Servo.h>

Servo myServo;
int pos = 0;

void setup() {
  myServo.attach(9); // Attach SG90 PWM signal to Pin 9
  Serial.begin(9600);
  Serial.println("RoboVerse SG90 Servo Sweep Initialized");
}

void loop() {
  // Sweep from 0 to 180 degrees
  for (pos = 0; pos <= 180; pos += 5) {
    myServo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.println(pos);
    delay(30);
  }
  
  // Sweep back from 180 to 0 degrees
  for (pos = 180; pos >= 0; pos -= 5) {
    myServo.write(pos);
    Serial.print("Servo Angle: ");
    Serial.println(pos);
    delay(30);
  }
}
`,
    components: [
      {
        id: 'uno_1',
        typeId: 'comp_arduino_uno',
        name: 'Arduino Uno R3',
        category: 'MICROCONTROLLER',
        model3DUrl: '/models/components/arduino_uno.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_arduino_uno')!.pins,
        properties: {},
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      },
      {
        id: 'servo_1',
        typeId: 'comp_servo_sg90',
        name: 'TowerPro SG90 Micro Servo',
        category: 'ACTUATOR',
        model3DUrl: '/models/components/servo_sg90.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_servo_sg90')!.pins,
        properties: { currentAngle: 0 },
        position: [160, 0, -20],
        rotation: [0, 0, 0],
      },
    ],
    wires: [
      {
        id: 'w_srv_pwm',
        color: '#FFA94D', // PWM wire
        fromComponentId: 'uno_1',
        fromPinId: 'pin_d9_pwm',
        toComponentId: 'servo_1',
        toPinId: 'pwm',
      },
      {
        id: 'w_srv_vcc',
        color: '#FF3939', // 5V Power
        fromComponentId: 'uno_1',
        fromPinId: 'pin_5v',
        toComponentId: 'servo_1',
        toPinId: 'vcc',
      },
      {
        id: 'w_srv_gnd',
        color: '#1B2559', // Ground
        fromComponentId: 'uno_1',
        fromPinId: 'pin_gnd_1',
        toComponentId: 'servo_1',
        toPinId: 'gnd',
      },
    ],
  },
  {
    id: 'starter_ultrasonic_radar',
    title: 'Ultrasonic Sonar Distance Meter',
    category: 'Circuit Assemblies',
    description: 'Calculates obstacle distance in centimeters using sonar echo times and beeps if distance < 15cm.',
    thumbnailUrl: '/thumbnails/starter_ultrasonic.png',
    arduinoCode: `// RoboVerse Starter 3: HC-SR04 Ultrasonic Distance Sensor
const int trigPin = 7;
const int echoPin = 6;
const int buzzerPin = 8;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("RoboVerse Sonar Radar Active");
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.034 / 2;

  Serial.print("Target Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  if (distanceCm > 0 && distanceCm < 15) {
    digitalWrite(buzzerPin, HIGH); // Proximity Alert!
  } else {
    digitalWrite(buzzerPin, LOW);
  }
  delay(200);
}
`,
    components: [
      {
        id: 'uno_1',
        typeId: 'comp_arduino_uno',
        name: 'Arduino Uno R3',
        category: 'MICROCONTROLLER',
        model3DUrl: '/models/components/arduino_uno.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_arduino_uno')!.pins,
        properties: {},
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      },
      {
        id: 'sonar_1',
        typeId: 'comp_ultrasonic_hcsr04',
        name: 'HC-SR04 Ultrasonic Sonar',
        category: 'SENSOR',
        model3DUrl: '/models/components/ultrasonic.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_ultrasonic_hcsr04')!.pins,
        properties: { distanceCm: 18 },
        position: [140, 0, -60],
        rotation: [0, 0, 0],
      },
      {
        id: 'buzzer_1',
        typeId: 'comp_buzzer_piezo',
        name: 'Piezo Buzzer',
        category: 'ACTUATOR',
        model3DUrl: '/models/components/piezo_buzzer.glb',
        pins: ROBOVERSE_COMPONENTS_CATALOG.find((c) => c.id === 'comp_buzzer_piezo')!.pins,
        properties: {},
        position: [140, 0, 40],
        rotation: [0, 0, 0],
      },
    ],
    wires: [
      { id: 'w_s_vcc', color: '#FF3939', fromComponentId: 'uno_1', fromPinId: 'pin_5v', toComponentId: 'sonar_1', toPinId: 'vcc' },
      { id: 'w_s_gnd', color: '#1B2559', fromComponentId: 'uno_1', fromPinId: 'pin_gnd_1', toComponentId: 'sonar_1', toPinId: 'gnd' },
      { id: 'w_s_trig', color: '#4C8DFF', fromComponentId: 'uno_1', fromPinId: 'pin_d7', toComponentId: 'sonar_1', toPinId: 'trig' },
      { id: 'w_s_echo', color: '#12B76A', fromComponentId: 'uno_1', fromPinId: 'pin_d6_pwm', toComponentId: 'sonar_1', toPinId: 'echo' },
      { id: 'w_b_pos', color: '#FF8A1F', fromComponentId: 'uno_1', fromPinId: 'pin_d8', toComponentId: 'buzzer_1', toPinId: 'pos' },
      { id: 'w_b_gnd', color: '#1B2559', fromComponentId: 'uno_1', fromPinId: 'pin_gnd_2', toComponentId: 'buzzer_1', toPinId: 'neg' },
    ],
  },
];
