import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export interface StoreProduct {
  id: string;
  sku: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  priceInr: number; // GST 18% inclusive
  mrpInr: number;
  gstPercent: number;
  stockQuantity: number;
  ageRestricted: boolean;
  shippingClass: 'standard' | 'battery' | 'regulated_drone';
  images: string[];
  specs: Record<string, any>;
  description: string;
  componentId?: string; // Linked hardware component in lab
}

// Seed catalog fallback covering all 40+ hardware items from migration 1 & seed
const FALLBACK_PRODUCTS: StoreProduct[] = [
  // Microcontroller Boards
  {
    id: 'prod_uno_compat',
    sku: 'RV-BRD-001',
    title: 'Arduino Uno R3 Compatible (CH340 + Cable)',
    slug: 'arduino-uno-r3-compatible',
    categoryId: 'cat_boards',
    categoryName: 'Microcontrollers',
    priceInr: 399,
    mrpInr: 599,
    gstPercent: 18,
    stockQuantity: 250,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/uno.png'],
    specs: { mcu: 'ATmega328P', clock: '16MHz', voltage: '5V', io_pins: 14 },
    description: 'Workhorse beginner microcontroller with pre-loaded Optiboot bootloader and blue USB cable.',
    componentId: 'arduino_uno',
  },
  {
    id: 'prod_uno_orig',
    sku: 'RV-BRD-002',
    title: 'Arduino Uno R3 Original (Made in Italy)',
    slug: 'arduino-uno-r3-original',
    categoryId: 'cat_boards',
    categoryName: 'Microcontrollers',
    priceInr: 2650,
    mrpInr: 3100,
    gstPercent: 18,
    stockQuantity: 50,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/uno-orig.png'],
    specs: { mcu: 'ATmega328P', clock: '16MHz', origin: 'Italy', usb_chip: 'ATmega16U2' },
    description: 'Official Italian Arduino Uno R3 with genuine holographic anti-counterfeit seal.',
    componentId: 'arduino_uno',
  },
  {
    id: 'prod_nano_compat',
    sku: 'RV-BRD-003',
    title: 'Arduino Nano V3 Compatible (Mini-USB)',
    slug: 'arduino-nano-compatible',
    categoryId: 'cat_boards',
    categoryName: 'Microcontrollers',
    priceInr: 349,
    mrpInr: 499,
    gstPercent: 18,
    stockQuantity: 180,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/nano.png'],
    specs: { mcu: 'ATmega328P', clock: '16MHz', form_factor: 'Breadboard friendly' },
    description: 'Compact 30-pin DIP breadboard-friendly microcontroller.',
    componentId: 'arduino_nano',
  },
  {
    id: 'prod_esp32_devkit',
    sku: 'RV-BRD-004',
    title: 'ESP32 DevKit V1 (Wi-Fi + Bluetooth BLE)',
    slug: 'esp32-devkit-v1',
    categoryId: 'cat_boards',
    categoryName: 'Microcontrollers',
    priceInr: 499,
    mrpInr: 799,
    gstPercent: 18,
    stockQuantity: 120,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/esp32.png'],
    specs: { cpu: 'Dual-Core Xtensa 240MHz', wireless: 'Wi-Fi 802.11 b/g/n + BLE 4.2' },
    description: 'High-performance IoT controller with dual-core processor and integrated antennas.',
    componentId: 'esp32_devkit',
  },
  {
    id: 'prod_pico_rp2040',
    sku: 'RV-BRD-005',
    title: 'Raspberry Pi Pico (RP2040 Dual ARM Cortex)',
    slug: 'raspberry-pi-pico',
    categoryId: 'cat_boards',
    categoryName: 'Microcontrollers',
    priceInr: 449,
    mrpInr: 599,
    gstPercent: 18,
    stockQuantity: 90,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/pico.png'],
    specs: { cpu: 'Dual ARM Cortex-M0+ 133MHz', sram: '264KB' },
    description: 'Flexible microcontroller board from Raspberry Pi with programmable I/O (PIO).',
    componentId: 'rpi_pico',
  },

  // Prototyping & Passives
  {
    id: 'prod_breadboard_830',
    sku: 'RV-PRT-001',
    title: 'Solderless Breadboard 830 Tie Points',
    slug: 'breadboard-830-points',
    categoryId: 'cat_proto',
    categoryName: 'Prototyping & Wiring',
    priceInr: 129,
    mrpInr: 199,
    gstPercent: 18,
    stockQuantity: 500,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/breadboard.png'],
    specs: { points: 830, power_rails: 4 },
    description: 'High-retention phosphor bronze nickel-plated spring clips with self-adhesive backing.',
    componentId: 'breadboard_half',
  },
  {
    id: 'prod_jumpers_40_mm',
    sku: 'RV-PRT-002',
    title: 'Jumper Wires 40 pcs (Male-to-Male 20cm)',
    slug: 'jumper-wires-mm-40',
    categoryId: 'cat_proto',
    categoryName: 'Prototyping & Wiring',
    priceInr: 69,
    mrpInr: 120,
    gstPercent: 18,
    stockQuantity: 400,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/jumpers-mm.png'],
    specs: { count: 40, length: '20cm', type: 'M-M' },
    description: 'Rainbow ribbon cable peelable jumper wires with molded terminals.',
    componentId: 'jumper_wires',
  },
  {
    id: 'prod_jumpers_40_mf',
    sku: 'RV-PRT-003',
    title: 'Jumper Wires 40 pcs (Male-to-Female 20cm)',
    slug: 'jumper-wires-mf-40',
    categoryId: 'cat_proto',
    categoryName: 'Prototyping & Wiring',
    priceInr: 69,
    mrpInr: 120,
    gstPercent: 18,
    stockQuantity: 400,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/jumpers-mf.png'],
    specs: { count: 40, length: '20cm', type: 'M-F' },
    description: 'Essential for connecting sensor breakout modules to Arduino boards.',
    componentId: 'jumper_wires',
  },
  {
    id: 'prod_resistor_pack',
    sku: 'RV-PRT-005',
    title: 'Carbon Film Resistor Assortment 600 pcs (30 values)',
    slug: 'resistor-assortment-600',
    categoryId: 'cat_proto',
    categoryName: 'Prototyping & Wiring',
    priceInr: 199,
    mrpInr: 299,
    gstPercent: 18,
    stockQuantity: 300,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/resistors.png'],
    specs: { count: 600, values_count: 30, power: '1/4 Watt' },
    description: 'Includes 10Ω to 1MΩ resistors clearly labeled in labeled sleeves.',
    componentId: 'resistor_220',
  },
  {
    id: 'prod_led_pack_100',
    sku: 'RV-PRT-006',
    title: 'Diffused LED Assortment 100 pcs (5 Colors)',
    slug: 'led-assortment-100',
    categoryId: 'cat_proto',
    categoryName: 'Prototyping & Wiring',
    priceInr: 99,
    mrpInr: 160,
    gstPercent: 18,
    stockQuantity: 350,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/leds.png'],
    specs: { colors: ['Red', 'Green', 'Yellow', 'Blue', 'White'], size: '5mm' },
    description: 'Bright 5mm diffused LEDs with 20mA max continuous current.',
    componentId: 'led_red',
  },
  {
    id: 'prod_rgb_led_5',
    sku: 'RV-PRT-007',
    title: 'Common Cathode RGB LED 5 pcs',
    slug: 'rgb-led-common-cathode-5',
    categoryId: 'cat_proto',
    categoryName: 'Prototyping & Wiring',
    priceInr: 49,
    mrpInr: 99,
    gstPercent: 18,
    stockQuantity: 200,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/rgb-led.png'],
    specs: { type: 'Common Cathode', size: '5mm' },
    description: '4-lead RGB LEDs for full-spectrum color mixing labs.',
    componentId: 'led_rgb',
  },
  {
    id: 'prod_buzzer_active',
    sku: 'RV-PRT-010',
    title: '5V Active Buzzer Module',
    slug: 'active-buzzer-5v',
    categoryId: 'cat_proto',
    categoryName: 'Prototyping & Wiring',
    priceInr: 25,
    mrpInr: 50,
    gstPercent: 18,
    stockQuantity: 250,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/buzzer.png'],
    specs: { voltage: '5V', sound_output: '85dB at 10cm' },
    description: 'Piezoelectric buzzer with internal oscillation circuit for simple high/low tones.',
    componentId: 'buzzer_active',
  },

  // Sensors & Inputs
  {
    id: 'prod_hc_sr04',
    sku: 'RV-SNS-001',
    title: 'HC-SR04 Ultrasonic Distance Sensor',
    slug: 'hc-sr04-ultrasonic',
    categoryId: 'cat_sensors',
    categoryName: 'Sensors & Inputs',
    priceInr: 89,
    mrpInr: 150,
    gstPercent: 18,
    stockQuantity: 300,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/hc-sr04.png'],
    specs: { range: '2cm - 400cm', accuracy: '3mm', trigger_pulse: '10us' },
    description: 'Dual-transducer ultrasonic sonar module for obstacle avoidance and range finding.',
    componentId: 'sensor_ultrasonic_hcsr04',
  },
  {
    id: 'prod_ir_obstacle',
    sku: 'RV-SNS-002',
    title: 'IR Infrared Obstacle Avoidance Sensor',
    slug: 'ir-obstacle-avoidance-module',
    categoryId: 'cat_sensors',
    categoryName: 'Sensors & Inputs',
    priceInr: 49,
    mrpInr: 99,
    gstPercent: 18,
    stockQuantity: 250,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/ir-sensor.png'],
    specs: { range: '2cm - 30cm', potentiometer: 'Sensitivity adjustment' },
    description: 'Active infrared reflective sensor for close-proximity detection.',
    componentId: 'sensor_ir',
  },
  {
    id: 'prod_ir_line_array_5',
    sku: 'RV-SNS-004',
    title: '5-Channel High Precision IR Line Tracking Sensor Array',
    slug: '5ch-ir-line-tracking-array',
    categoryId: 'cat_sensors',
    categoryName: 'Sensors & Inputs',
    priceInr: 249,
    mrpInr: 399,
    gstPercent: 18,
    stockQuantity: 150,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/line-array.png'],
    specs: { channels: 5, spacing: '15mm', pitch: 'Ideal for fast line followers' },
    description: '5-sensor integrated array with onboard indicator LEDs for PID line-follower robots.',
    componentId: 'sensor_line_array',
  },
  {
    id: 'prod_pir_sensor',
    sku: 'RV-SNS-005',
    title: 'HC-SR501 Pyroelectric PIR Motion Sensor',
    slug: 'pir-motion-sensor-hc-sr501',
    categoryId: 'cat_sensors',
    categoryName: 'Sensors & Inputs',
    priceInr: 99,
    mrpInr: 180,
    gstPercent: 18,
    stockQuantity: 180,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/pir.png'],
    specs: { sensing_angle: '120 degrees', delay_time: 'Adjustable 0.3s - 5min' },
    description: 'Human body infrared passive motion sensor with Fresnel dome lens.',
    componentId: 'sensor_pir_hc_sr501',
  },
  {
    id: 'prod_dht11',
    sku: 'RV-SNS-006',
    title: 'DHT11 Temperature & Humidity Sensor Breakout',
    slug: 'dht11-temperature-humidity',
    categoryId: 'cat_sensors',
    categoryName: 'Sensors & Inputs',
    priceInr: 99,
    mrpInr: 180,
    gstPercent: 18,
    stockQuantity: 200,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/dht11.png'],
    specs: { temp_range: '0-50 C', humidity_range: '20-90% RH' },
    description: 'Calibrated digital output composite temperature and humidity sensor.',
    componentId: 'sensor_dht11',
  },
  {
    id: 'prod_mpu6050',
    sku: 'RV-SNS-007',
    title: 'MPU-6050 6-Axis Gyroscope & Accelerometer',
    slug: 'mpu6050-gyro-accelerometer',
    categoryId: 'cat_sensors',
    categoryName: 'Sensors & Inputs',
    priceInr: 159,
    mrpInr: 299,
    gstPercent: 18,
    stockQuantity: 160,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/mpu6050.png'],
    specs: { gyro_range: '+-2000 deg/s', accel_range: '+-16g', protocol: 'I2C' },
    description: '6-DOF motion tracking sensor essential for drone flight controllers and self-balancing robots.',
    componentId: 'sensor_mpu6050',
  },

  // Motors, Servos & Actuators
  {
    id: 'prod_sg90_servo',
    sku: 'RV-ACT-001',
    title: 'TowerPro SG90 9g Micro Servo Motor 180°',
    slug: 'sg90-micro-servo-9g',
    categoryId: 'cat_motion',
    categoryName: 'Motors & Servos',
    priceInr: 139,
    mrpInr: 220,
    gstPercent: 18,
    stockQuantity: 350,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/sg90.png'],
    specs: { torque: '1.8 kg-cm', operating_speed: '0.1 s/60deg', rotation: '180 degrees' },
    description: 'Lightweight micro servo with horns and screws for steering, pan-tilt and robotic fingers.',
    componentId: 'servo_sg90',
  },
  {
    id: 'prod_tt_motor_wheel',
    sku: 'RV-ACT-003',
    title: 'Yellow TT Dual-Shaft DC Gear Motor with 65mm Wheel',
    slug: 'tt-motor-with-wheel',
    categoryId: 'cat_motion',
    categoryName: 'Motors & Servos',
    priceInr: 119,
    mrpInr: 199,
    gstPercent: 18,
    stockQuantity: 300,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/tt-motor.png'],
    specs: { gear_ratio: '1:48', voltage: '3-6V', speed: '200 RPM at 6V' },
    description: 'High-torque DC gearbox motor paired with high-traction rubber tire wheel.',
    componentId: 'motor_dc_tt',
  },
  {
    id: 'prod_l298n_driver',
    sku: 'RV-ACT-004',
    title: 'L298N Dual H-Bridge Motor Driver Module',
    slug: 'l298n-dual-hbridge-driver',
    categoryId: 'cat_motion',
    categoryName: 'Motors & Servos',
    priceInr: 169,
    mrpInr: 280,
    gstPercent: 18,
    stockQuantity: 250,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/l298n.png'],
    specs: { peak_current: '2A per bridge', operating_voltage: '5V - 35V', heatsink: 'Aluminum' },
    description: 'High-power dual DC motor and 4-phase stepper motor controller with screw terminals.',
    componentId: 'driver_l298n',
  },
  {
    id: 'prod_2wd_chassis',
    sku: 'RV-ACT-006',
    title: '2WD Smart Robot Car Chassis Kit',
    slug: '2wd-smart-robot-car-chassis',
    categoryId: 'cat_motion',
    categoryName: 'Motors & Servos',
    priceInr: 449,
    mrpInr: 699,
    gstPercent: 18,
    stockQuantity: 120,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/chassis.png'],
    specs: { material: 'Laser-cut acrylic', wheels: 2, castor: 1, battery_box: 'Included' },
    description: 'Complete mechanical platform with speed encoder disks, rocker switch, and mounting holes.',
    componentId: 'chassis_2wd',
  },

  // Displays
  {
    id: 'prod_lcd_16x2_i2c',
    sku: 'RV-DSP-001',
    title: '16x2 Character LCD with I2C Backpack Module',
    slug: '16x2-lcd-display-i2c',
    categoryId: 'cat_displays',
    categoryName: 'Displays & Indicators',
    priceInr: 229,
    mrpInr: 380,
    gstPercent: 18,
    stockQuantity: 200,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/lcd1602.png'],
    specs: { resolution: '16 cols x 2 rows', backlight: 'Blue/White', protocol: 'I2C (Address 0x27)' },
    description: 'Alphanumeric display requiring only 2 data wires (SDA and SCL) instead of 16 pins.',
    componentId: 'lcd_1602_i2c',
  },
  {
    id: 'prod_oled_096_i2c',
    sku: 'RV-DSP-002',
    title: '0.96" Monochrome I2C OLED Display (128x64)',
    slug: 'oled-display-0-96-inch',
    categoryId: 'cat_displays',
    categoryName: 'Displays & Indicators',
    priceInr: 299,
    mrpInr: 450,
    gstPercent: 18,
    stockQuantity: 150,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/oled.png'],
    specs: { resolution: '128x64', driver: 'SSD1306', color: 'Blue/Yellow-Blue' },
    description: 'Crisp high-contrast graphical display for showing live telemetry graphs and face expressions.',
    componentId: 'oled_096_i2c',
  },

  // Power & Batteries
  {
    id: 'prod_battery_holder_18650',
    sku: 'RV-PWR-001',
    title: '2-Cell 18650 Battery Holder with Leads',
    slug: '2-cell-18650-battery-holder',
    categoryId: 'cat_power',
    categoryName: 'Power & Batteries',
    priceInr: 59,
    mrpInr: 110,
    gstPercent: 18,
    stockQuantity: 250,
    ageRestricted: false,
    shippingClass: 'standard',
    images: ['/products/battery-holder.png'],
    specs: { configuration: '2S (7.4V nominal)', leads: 'Red and Black 15cm' },
    description: 'Rigid plastic case for dual 18650 rechargeable batteries to power robot motors.',
    componentId: 'battery_holder',
  },
  {
    id: 'prod_18650_cell',
    sku: 'RV-PWR-002',
    title: 'Li-ion 18650 Rechargeable Cell 2600mAh (High Drain)',
    slug: '18650-rechargeable-cell-2600mah',
    categoryId: 'cat_power',
    categoryName: 'Power & Batteries',
    priceInr: 199,
    mrpInr: 320,
    gstPercent: 18,
    stockQuantity: 200,
    ageRestricted: false,
    shippingClass: 'battery',
    images: ['/products/18650.png'],
    specs: { capacity: '2600mAh', nominal_voltage: '3.7V', chemistry: 'Li-ion' },
    description: 'Grade-A rechargeable lithium-ion cell with built-in safety vent.',
    componentId: 'battery_18650',
  },

  // Tools (Age restricted for heating/cutting)
  {
    id: 'prod_soldering_iron_60w',
    sku: 'RV-TOL-002',
    title: '60W Temperature-Adjustable Soldering Iron',
    slug: '60w-adjustable-soldering-iron',
    categoryId: 'cat_tools',
    categoryName: 'Tools & Workshop',
    priceInr: 499,
    mrpInr: 799,
    gstPercent: 18,
    stockQuantity: 90,
    ageRestricted: true,
    shippingClass: 'standard',
    images: ['/products/soldering-iron.png'],
    specs: { power: '60W', temp_range: '200C - 450C', tip: 'Replaceable ceramic heater' },
    description: 'Precision heating tool for assembling permanent electronic circuits. Adult supervision required.',
    componentId: 'tool_soldering_iron',
  },
  {
    id: 'prod_wire_stripper',
    sku: 'RV-TOL-004',
    title: 'Automatic Precision Wire Stripper & Cutter',
    slug: 'automatic-wire-stripper-cutter',
    categoryId: 'cat_tools',
    categoryName: 'Tools & Workshop',
    priceInr: 249,
    mrpInr: 399,
    gstPercent: 18,
    stockQuantity: 100,
    ageRestricted: true,
    shippingClass: 'standard',
    images: ['/products/wire-stripper.png'],
    specs: { range: '10-24 AWG', crimp: 'Insulated and non-insulated terminals' },
    description: 'Self-adjusting stripper for single-squeeze insulation removal without conductor damage.',
    componentId: 'tool_wire_stripper',
  },

  // Drones & Regulated Equipment (Age Restricted 18+ / Regulated Shipping)
  {
    id: 'prod_lipo_3s_2200',
    sku: 'RV-DRN-006',
    title: '3S 11.1V 2200mAh 35C LiPo Battery Pack with XT60',
    slug: '3s-lipo-battery-2200mah-35c',
    categoryId: 'cat_drones',
    categoryName: 'Drones & Aerial',
    priceInr: 1599,
    mrpInr: 2400,
    gstPercent: 18,
    stockQuantity: 60,
    ageRestricted: true,
    shippingClass: 'battery',
    images: ['/products/lipo-3s.png'],
    specs: { voltage: '11.1V 3-Cell', capacity: '2200mAh', discharge_rate: '35C' },
    description: 'High-discharge lithium-polymer flight battery. 18+ Adult consent required for minors.',
    componentId: 'battery_lipo_3s',
  },
  {
    id: 'prod_flight_controller',
    sku: 'RV-DRN-005',
    title: 'Open-Source Drone Flight Controller with Gyro & Baro',
    slug: 'open-source-drone-flight-controller',
    categoryId: 'cat_drones',
    categoryName: 'Drones & Aerial',
    priceInr: 1999,
    mrpInr: 2800,
    gstPercent: 18,
    stockQuantity: 40,
    ageRestricted: true,
    shippingClass: 'regulated_drone',
    images: ['/products/flight-controller.png'],
    specs: { sensors: 'InvenSense IMU + High precision Barometer', firmware: 'Betaflight/ArduPilot support' },
    description: 'Autonomous flight stabilization controller with altitude hold. DGCA compliance notice applies.',
    componentId: 'flight_controller',
  },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search')?.toLowerCase();
    const componentId = url.searchParams.get('component_id');
    const sort = url.searchParams.get('sort');

    let productsList: StoreProduct[] = [...FALLBACK_PRODUCTS];

    // Attempt to query Supabase products table
    try {
      let query = (supabase.from('products') as any)
        .select('*, product_categories(name)')
        .eq('is_active', true);

      if (category && category !== 'ALL') {
        query = query.eq('category_id', category);
      }

      const { data: dbProducts, error } = await query;
      if (!error && dbProducts && dbProducts.length > 0) {
        productsList = dbProducts.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          title: p.name,
          slug: p.slug,
          categoryId: p.category_id,
          categoryName: p.product_categories?.name || 'Hardware',
          priceInr: Number(p.price_inr),
          mrpInr: Number(p.mrp_inr || p.price_inr * 1.3),
          gstPercent: Number(p.gst_percent || 18),
          stockQuantity: Number(p.stock),
          ageRestricted: Boolean(p.age_restricted),
          shippingClass: p.shipping_class || 'standard',
          images: p.images || [`/products/${p.slug}.png`],
          specs: p.specs || {},
          description: p.description || '',
          componentId: p.component_id,
        }));
      }
    } catch (dbErr) {
      // Graceful fallback to rich seed catalog
    }

    // Apply URL filter parameters
    if (category && category !== 'ALL') {
      productsList = productsList.filter(
        (p) => p.categoryId === category || p.categoryName.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (componentId) {
      productsList = productsList.filter(
        (p) => p.componentId === componentId || p.id.includes(componentId) || p.slug.includes(componentId)
      );
    }

    if (search) {
      productsList = productsList.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search)
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      productsList.sort((a, b) => a.priceInr - b.priceInr);
    } else if (sort === 'price_desc') {
      productsList.sort((a, b) => b.priceInr - a.priceInr);
    } else {
      // Default: featured / popularity
      productsList.sort((a, b) => b.stockQuantity - a.stockQuantity);
    }

    return NextResponse.json({
      success: true,
      data: {
        products: productsList,
        count: productsList.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || 'Failed to fetch products' } },
      { status: 500 }
    );
  }
}
