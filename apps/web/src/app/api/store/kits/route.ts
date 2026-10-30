import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface LearningKitItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPriceInr: number;
}

export interface LearningKit {
  id: string;
  name: string;
  slug: string;
  description: string;
  kitPriceInr: number; // GST 18% inclusive
  sumOfPartsInr: number;
  savingsInr: number;
  savingsPercent: number;
  shippingClass: 'standard' | 'battery' | 'regulated_drone';
  ageRestricted: boolean;
  bom: LearningKitItem[];
  linkedCourseSlug?: string;
  linkedCircuitSampleId?: string;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const KITS: LearningKit[] = [
  {
    id: 'kit_arduino_starter',
    name: 'RoboVerse Arduino Starter Kit',
    slug: 'arduino-starter-kit',
    description: 'The complete beginner bundle: Arduino Uno, breadboard, 3 jumper sets, resistors, LEDs, RGB LED, buttons, 2 pots, buzzer, 2 LDRs, and 16x2 I2C LCD.',
    kitPriceInr: 1199,
    sumOfPartsInr: 1467,
    savingsInr: 268,
    savingsPercent: 18,
    shippingClass: 'standard',
    ageRestricted: false,
    level: 'Beginner',
    image: '/kits/starter-kit.png',
    linkedCourseSlug: 'arduino-foundations',
    linkedCircuitSampleId: 'sample-blink-led',
    bom: [
      { id: 'prod_uno_compat', name: 'Arduino Uno R3 Compatible', sku: 'RV-BRD-001', quantity: 1, unitPriceInr: 399 },
      { id: 'prod_breadboard_830', name: 'Solderless Breadboard 830 Points', sku: 'RV-PRT-001', quantity: 1, unitPriceInr: 129 },
      { id: 'prod_jumpers_40_mm', name: 'Jumper Wires M-M 40pcs', sku: 'RV-PRT-002', quantity: 1, unitPriceInr: 69 },
      { id: 'prod_jumpers_40_mf', name: 'Jumper Wires M-F 40pcs', sku: 'RV-PRT-003', quantity: 1, unitPriceInr: 69 },
      { id: 'prod_resistor_pack', name: 'Resistor Assortment 600pcs', sku: 'RV-PRT-005', quantity: 1, unitPriceInr: 199 },
      { id: 'prod_led_pack_100', name: 'Diffused LEDs 100pcs', sku: 'RV-PRT-006', quantity: 1, unitPriceInr: 99 },
      { id: 'prod_rgb_led_5', name: 'RGB LED 5pcs', sku: 'RV-PRT-007', quantity: 1, unitPriceInr: 49 },
      { id: 'prod_buzzer_active', name: 'Active Buzzer 5V', sku: 'RV-PRT-010', quantity: 1, unitPriceInr: 25 },
      { id: 'prod_lcd_16x2_i2c', name: '16x2 LCD Display with I2C Backpack', sku: 'RV-DSP-001', quantity: 1, unitPriceInr: 229 },
    ],
  },
  {
    id: 'kit_line_follower',
    name: 'Autonomous Line Following Robot Kit',
    slug: 'line-following-robot-kit',
    description: 'Build a championship-ready line tracer: Arduino Uno, L298N driver, 2WD chassis, ball caster, 5-channel high-speed IR array, 18650 holder, and jumpers.',
    kitPriceInr: 1199,
    sumOfPartsInr: 1433,
    savingsInr: 234,
    savingsPercent: 16,
    shippingClass: 'standard',
    ageRestricted: false,
    level: 'Intermediate',
    image: '/kits/line-follower.png',
    linkedCourseSlug: 'mobile-robotics',
    linkedCircuitSampleId: 'sample-line-follower',
    bom: [
      { id: 'prod_uno_compat', name: 'Arduino Uno R3 Compatible', sku: 'RV-BRD-001', quantity: 1, unitPriceInr: 399 },
      { id: 'prod_l298n_driver', name: 'L298N Dual H-Bridge Driver', sku: 'RV-ACT-004', quantity: 1, unitPriceInr: 169 },
      { id: 'prod_2wd_chassis', name: '2WD Smart Robot Car Chassis', sku: 'RV-ACT-006', quantity: 1, unitPriceInr: 449 },
      { id: 'prod_ir_line_array_5', name: '5-Channel IR Line Array Sensor', sku: 'RV-SNS-004', quantity: 1, unitPriceInr: 249 },
      { id: 'prod_battery_holder_18650', name: '2-Cell 18650 Battery Holder', sku: 'RV-PWR-001', quantity: 1, unitPriceInr: 59 },
      { id: 'prod_jumpers_40_mf', name: 'Jumper Wires M-F 40pcs', sku: 'RV-PRT-003', quantity: 1, unitPriceInr: 69 },
    ],
  },
  {
    id: 'kit_obstacle_avoiding',
    name: 'Obstacle Avoiding Autonomous Rover Kit',
    slug: 'obstacle-avoiding-rover-kit',
    description: 'Radar-guided rover: Arduino Uno, L298N motor driver, 2WD chassis, caster, HC-SR04 sonar sensor, SG90 servo turret, 18650 battery holder, and jumpers.',
    kitPriceInr: 1299,
    sumOfPartsInr: 1412,
    savingsInr: 113,
    savingsPercent: 8,
    shippingClass: 'standard',
    ageRestricted: false,
    level: 'Beginner',
    image: '/kits/obstacle-rover.png',
    linkedCourseSlug: 'autonomous-navigation',
    linkedCircuitSampleId: 'sample-obstacle-rover',
    bom: [
      { id: 'prod_uno_compat', name: 'Arduino Uno R3 Compatible', sku: 'RV-BRD-001', quantity: 1, unitPriceInr: 399 },
      { id: 'prod_l298n_driver', name: 'L298N Motor Driver', sku: 'RV-ACT-004', quantity: 1, unitPriceInr: 169 },
      { id: 'prod_2wd_chassis', name: '2WD Car Chassis Kit', sku: 'RV-ACT-006', quantity: 1, unitPriceInr: 449 },
      { id: 'prod_hc_sr04', name: 'HC-SR04 Sonar Distance Sensor', sku: 'RV-SNS-001', quantity: 1, unitPriceInr: 89 },
      { id: 'prod_sg90_servo', name: 'SG90 9g Turret Servo', sku: 'RV-ACT-001', quantity: 1, unitPriceInr: 139 },
      { id: 'prod_battery_holder_18650', name: '2-Cell 18650 Battery Holder', sku: 'RV-PWR-001', quantity: 1, unitPriceInr: 59 },
    ],
  },
  {
    id: 'kit_robotic_hand',
    name: '5-Finger Bionic Robotic Hand Kit',
    slug: 'bionic-robotic-hand-kit',
    description: 'Anatomical robotics: Arduino Uno, 5x SG90 servos, 5x potentiometers, acrylic hand frame, breadboard, jumpers, and 5V 3A power supply.',
    kitPriceInr: 2199,
    sumOfPartsInr: 2516,
    savingsInr: 317,
    savingsPercent: 13,
    shippingClass: 'standard',
    ageRestricted: false,
    level: 'Intermediate',
    image: '/kits/bionic-hand.png',
    linkedCourseSlug: 'bio-robotics',
    linkedCircuitSampleId: 'sample-bionic-hand',
    bom: [
      { id: 'prod_uno_compat', name: 'Arduino Uno R3 Compatible', sku: 'RV-BRD-001', quantity: 1, unitPriceInr: 399 },
      { id: 'prod_sg90_servo', name: 'TowerPro SG90 Servos', sku: 'RV-ACT-001', quantity: 5, unitPriceInr: 139 },
      { id: 'prod_breadboard_830', name: 'Solderless Breadboard', sku: 'RV-PRT-001', quantity: 1, unitPriceInr: 129 },
      { id: 'prod_power_supply_5v3a', name: '5V 3A DC Regulated Power Adapter', sku: 'RV-PWR-003', quantity: 1, unitPriceInr: 299 },
    ],
  },
  {
    id: 'kit_quadcopter_drone',
    name: 'Autonomous STEM Quadcopter Drone Kit',
    slug: 'stem-quadcopter-drone-kit',
    description: 'Full DIY aerial robotics platform: F450 frame, 4x 1000KV brushless motors, 4x 30A ESCs, 1045 props, flight controller, PDB, and 3S 2200mAh LiPo.',
    kitPriceInr: 7999,
    sumOfPartsInr: 8941,
    savingsInr: 942,
    savingsPercent: 11,
    shippingClass: 'battery',
    ageRestricted: true,
    level: 'Advanced',
    image: '/kits/quadcopter.png',
    linkedCourseSlug: 'aerial-robotics',
    linkedCircuitSampleId: 'sample-drone-esc',
    bom: [
      { id: 'prod_drone_frame_f450', name: 'F450 Quadcopter Drone Frame', sku: 'RV-DRN-001', quantity: 1, unitPriceInr: 799 },
      { id: 'prod_bldc_2212_motor', name: 'A2212 1000KV BLDC Motors', sku: 'RV-DRN-002', quantity: 4, unitPriceInr: 449 },
      { id: 'prod_esc_30a', name: '30A SimonK Brushless ESCs', sku: 'RV-DRN-003', quantity: 4, unitPriceInr: 499 },
      { id: 'prod_flight_controller', name: 'Drone Flight Controller with IMU', sku: 'RV-DRN-005', quantity: 1, unitPriceInr: 1999 },
      { id: 'prod_lipo_3s_2200', name: '3S 11.1V 2200mAh LiPo Pack', sku: 'RV-DRN-006', quantity: 1, unitPriceInr: 1599 },
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      kits: KITS,
      count: KITS.length,
    },
  });
}
