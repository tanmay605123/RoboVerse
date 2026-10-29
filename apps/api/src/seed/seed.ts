import mongoose from 'mongoose';
import {
  DEFAULT_PLANS,
  ROBOVERSE_COMPONENTS_CATALOG,
  ROBOVERSE_STARTER_ASSEMBLIES,
  UserRole,
  UserStatus,
  BillingCycle,
} from '@roboverse/shared';
import {
  UserModel,
  StudentProfileModel,
  StudentIDModel,
  AdminUserModel,
  AdminRole,
  PlanModel,
  CouponModel,
  ComponentDefModel,
  CircuitProjectModel,
  SampleProjectModel,
  CourseModel,
  EventModel,
  ShopModel,
  ProductModel,
  CertificateTemplateModel,
} from '../models';
import { connectMongo, disconnectMongo } from '../lib/mongoose';
import { hashPassword } from '../lib/password';

export async function runMongoSeed(): Promise<void> {
  console.log('🌱 Starting RoboVerse MongoDB Seed...');
  await connectMongo();

  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ MongoDB not connected. Skipping seed execution.');
    return;
  }

  try {
    // 1. Seed Plans
    console.log('📋 Seeding Subscription Plans (Free, Plus, Pro, Institution)...');
    for (const plan of Object.values(DEFAULT_PLANS)) {
      await PlanModel.findOneAndUpdate(
        { tier: plan.tier },
        {
          tier: plan.tier,
          name: plan.name,
          tagline: plan.tagline,
          isPopular: plan.isPopular || false,
          badge: plan.badge || null,
          pricing: plan.pricing,
          features: plan.features,
        },
        { upsert: true, new: true }
      );
    }

    // 2. Seed Super Admin
    console.log('👑 Seeding Super Admin Account...');
    const adminEmail = 'admin@roboverse.io';
    const adminPasswordHash = await hashPassword('Admin@2026!');
    const adminUserId = 'user_admin_super_001';

    const user = await UserModel.findOneAndUpdate(
      { email: adminEmail },
      {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        mobileNumber: '+919999900001',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        referralCode: 'RV-ADMIN-001',
        failedLoginAttempts: 0,
      },
      { upsert: true, new: true }
    );

    await StudentProfileModel.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        fullName: 'RoboVerse Commander',
        institutionType: 'university',
        schoolOrCollegeName: 'RoboVerse Central Robotics Lab',
        classOrYear: 'Lead Commander',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        interests: ['arduino', 'ros_robotics', 'machine_learning', 'drones'],
        level: 99,
        xp: 99999,
        streakDays: 365,
        totalLearningHours: 1500,
      },
      { upsert: true, new: true }
    );

    await StudentIDModel.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        studentId: 'RV-2026-000001',
        qrCodeDataUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzc1tD0QAAAABJRU5ErkJggg==',
        verificationHash: 'rv_genesis_super_admin_hash_000001',
        verificationUrl: 'https://roboverse.io/verify/RV-2026-000001',
        issuedAt: new Date('2026-01-01'),
        validUntil: new Date('2035-12-31'),
        status: 'ACTIVE',
      },
      { upsert: true, new: true }
    );

    await AdminUserModel.findOneAndUpdate(
      { userId: user.id },
      {
        userId: user.id,
        email: adminEmail,
        role: AdminRole.SUPER_ADMIN,
        permissions: [
          'students:read',
          'students:manage',
          'plans:read',
          'plans:manage',
          'analytics:read',
          'audit:read',
          'courses:manage',
          'shops:approve',
          'finance:read',
        ],
        department: 'Executive Operations',
        sessionTimeoutMinutes: 60,
      },
      { upsert: true, new: true }
    );

    // 3. Seed Electronic Components (~60 items)
    console.log(`🔌 Seeding Components Catalog (${ROBOVERSE_COMPONENTS_CATALOG.length} items)...`);
    for (const comp of ROBOVERSE_COMPONENTS_CATALOG) {
      await ComponentDefModel.findOneAndUpdate(
        { name: comp.name },
        {
          name: comp.name,
          category: comp.category,
          model3DUrl: comp.model3DUrl,
          datasheetUrl: comp.datasheetUrl || null,
          isFreeTier: true, // ALL components are free in RoboVerse Circuit Lab
          priceInr: comp.priceInr,
          pins: comp.pins,
          defaultProperties: comp.defaultProperties,
        },
        { upsert: true, new: true }
      );
    }

    // 4. Seed Starter Circuit Assemblies
    console.log(`⚡ Seeding Starter Circuit Assemblies (${ROBOVERSE_STARTER_ASSEMBLIES.length} items)...`);
    for (const starter of ROBOVERSE_STARTER_ASSEMBLIES) {
      await CircuitProjectModel.findOneAndUpdate(
        { title: starter.title },
        {
          userId: 'system_starters',
          title: starter.title,
          description: starter.description,
          isPublic: true,
          category: starter.category,
          componentsJson: JSON.stringify(starter.components),
          wiresJson: JSON.stringify(starter.wires),
          codeSnippet: starter.arduinoCode,
          thumbnailUrl: starter.thumbnailUrl,
          isStarter: true,
        },
        { upsert: true, new: true }
      );
    }

    // 5. Seed 3 Official Sample Projects
    console.log('🤖 Seeding 3 Official Sample Projects...');
    const sampleProjectsData = [
      {
        slug: 'line-following-robot',
        title: 'Line Following Autonomous Robot',
        description:
          'Dual IR reflective sensor robot with L298N H-Bridge dual motor driver. Follows high-contrast black line track using differential drive logic.',
        track: 'ROBOTICS' as const,
        componentsJson: JSON.stringify([
          { id: 'uno_1', name: 'Arduino Uno R3', category: 'MICROCONTROLLER', pins: [] },
          { id: 'ir_left', name: 'TCRT5000 IR Sensor (Left)', category: 'SENSOR', pins: [] },
          { id: 'ir_right', name: 'TCRT5000 IR Sensor (Right)', category: 'SENSOR', pins: [] },
          { id: 'l298n_driver', name: 'L298N Dual H-Bridge Motor Driver', category: 'ACTUATOR', pins: [] },
          { id: 'motor_left', name: 'BO Gear Motor (Left Wheel)', category: 'ACTUATOR', pins: [] },
          { id: 'motor_right', name: 'BO Gear Motor (Right Wheel)', category: 'ACTUATOR', pins: [] },
          { id: 'chassis', name: '2WD Robot Chassis with Caster', category: 'ROBOT_PARTS', pins: [] },
          { id: 'battery_pack', name: '7.4V 2S Li-Ion Battery Pack', category: 'POWER', pins: [] },
        ]),
        wiresJson: JSON.stringify([]),
        codeSnippet: `// RoboVerse Official Sample 1: Autonomous Line Follower
#define ENA 5
#define ENB 6
#define IN1 7
#define IN2 8
#define IN3 9
#define IN4 10
#define IR_LEFT 2
#define IR_RIGHT 3

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(IR_LEFT, INPUT);
  pinMode(IR_RIGHT, INPUT);
  Serial.begin(9600);
  Serial.println("Line Follower Ready");
}

void loop() {
  int leftState = digitalRead(IR_LEFT);
  int rightState = digitalRead(IR_RIGHT);

  // Both on white: Move forward
  if (leftState == LOW && rightState == LOW) {
    moveForward(180);
  }
  // Left on black line: Turn left
  else if (leftState == HIGH && rightState == LOW) {
    turnLeft(160);
  }
  // Right on black line: Turn right
  else if (leftState == LOW && rightState == HIGH) {
    turnRight(160);
  }
  // Both on black (T-junction or end): Stop
  else {
    stopMotors();
  }
}

void moveForward(int speed) {
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void turnLeft(int speed) {
  analogWrite(ENA, speed / 2);
  analogWrite(ENB, speed);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void turnRight(int speed) {
  analogWrite(ENA, speed);
  analogWrite(ENB, speed / 2);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void stopMotors() {
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
}
`,
        difficulty: 'BEGINNER' as const,
        estimatedCostInr: 1250,
        scenarioDescription:
          'Simulate the robot on an interactive 3D track. Adjust IR sensitivity and speed parameters to complete the loop under 20 seconds.',
        quizQuestions: [
          {
            question: 'What happens when the left IR sensor detects the black line?',
            options: [
              'Both motors spin in reverse',
              'The robot turns left by reducing or reversing left wheel speed',
              'The robot accelerates forward',
              'The Arduino enters sleep mode',
            ],
            correctIndex: 1,
            explanation:
              'Differential steering slows down or reverses the inner wheel to pivot the robot toward the black line.',
          },
        ],
        badges: ['line-master-rookie', 'hardware-builder'],
      },
      {
        slug: 'robotic-hand',
        title: 'Bionic 5-Finger Robotic Hand',
        description:
          'Precision tendon-driven bionic hand controlled by 5 micro servos. Capable of power grip, pinch, pointing, and gesture mimicking.',
        track: 'HARDWARE' as const,
        componentsJson: JSON.stringify([
          { id: 'uno_1', name: 'Arduino Uno R3', category: 'MICROCONTROLLER', pins: [] },
          { id: 'srv_thumb', name: 'SG90 Micro Servo (Thumb)', category: 'ACTUATOR', pins: [] },
          { id: 'srv_index', name: 'SG90 Micro Servo (Index)', category: 'ACTUATOR', pins: [] },
          { id: 'srv_middle', name: 'SG90 Micro Servo (Middle)', category: 'ACTUATOR', pins: [] },
          { id: 'srv_ring', name: 'SG90 Micro Servo (Ring)', category: 'ACTUATOR', pins: [] },
          { id: 'srv_pinky', name: 'SG90 Micro Servo (Pinky)', category: 'ACTUATOR', pins: [] },
          { id: 'pot_1', name: '10kΩ Master Grip Slider', category: 'PASSIVE', pins: [] },
          { id: 'ext_pwr', name: '5V 3A External Power Supply', category: 'POWER', pins: [] },
        ]),
        wiresJson: JSON.stringify([]),
        codeSnippet: `// RoboVerse Official Sample 2: Bionic Robotic Hand
#include <Servo.h>

Servo thumb, indexFinger, middleFinger, ringFinger, pinky;

const int flexPin = A0;

void setup() {
  thumb.attach(3);
  indexFinger.attach(5);
  middleFinger.attach(6);
  ringFinger.attach(9);
  pinky.attach(10);
  Serial.begin(9600);
  Serial.println("Robotic Hand Initialized");
}

void loop() {
  int sensorValue = analogRead(flexPin);
  int angle = map(sensorValue, 0, 1023, 0, 180);

  // Synchronized grip
  thumb.write(angle);
  indexFinger.write(angle);
  middleFinger.write(angle);
  ringFinger.write(angle);
  pinky.write(angle);

  Serial.print("Flex Angle: ");
  Serial.println(angle);
  delay(20);
}
`,
        difficulty: 'INTERMEDIATE' as const,
        estimatedCostInr: 1850,
        scenarioDescription:
          'Control each finger via virtual sliders or flex glove simulation to grip objects in a 3D physical workspace.',
        quizQuestions: [
          {
            question: 'Why must 5 micro servos be powered from an external 5V power supply rather than directly from the Arduino 5V pin?',
            options: [
              'Arduino pins only output 3.3V',
              'Servos draw peak stall current (up to 500mA each) exceeding Arduino on-board 5V regulator limits',
              'Servos require AC voltage',
              'To prevent code memory overflow',
            ],
            correctIndex: 1,
            explanation:
              'Multiple servos can draw 2A+ under load, which causes the Arduino 5V linear regulator to overheat and reset the board.',
          },
        ],
        badges: ['bionic-engineer', 'servo-virtuoso'],
      },
      {
        slug: 'drone-quadcopter',
        title: 'Autonomous Flight Quadcopter Drone',
        description:
          'Brushless quadcopter with 4x 1000KV BLDC motors, 30A ESCs, MPU6050 6-DOF IMU, and PID attitude stabilization.',
        track: 'DRONES' as const,
        componentsJson: JSON.stringify([
          { id: 'fc_uno', name: 'Arduino Uno / Flight Controller', category: 'MICROCONTROLLER', pins: [] },
          { id: 'imu_mpu', name: 'MPU6050 6-Axis Accelerometer & Gyro', category: 'SENSOR', pins: [] },
          { id: 'esc_1', name: '30A Brushless ESC 1', category: 'ACTUATOR', pins: [] },
          { id: 'esc_2', name: '30A Brushless ESC 2', category: 'ACTUATOR', pins: [] },
          { id: 'esc_3', name: '30A Brushless ESC 3', category: 'ACTUATOR', pins: [] },
          { id: 'esc_4', name: '30A Brushless ESC 4', category: 'ACTUATOR', pins: [] },
          { id: 'bldc_1', name: 'A2212 1000KV BLDC Motor (Front Left)', category: 'ACTUATOR', pins: [] },
          { id: 'bldc_2', name: 'A2212 1000KV BLDC Motor (Front Right)', category: 'ACTUATOR', pins: [] },
          { id: 'bldc_3', name: 'A2212 1000KV BLDC Motor (Rear Left)', category: 'ACTUATOR', pins: [] },
          { id: 'bldc_4', name: 'A2212 1000KV BLDC Motor (Rear Right)', category: 'ACTUATOR', pins: [] },
          { id: 'lipo_3s', name: '11.1V 2200mAh 3S LiPo Battery', category: 'POWER', pins: [] },
        ]),
        wiresJson: JSON.stringify([]),
        codeSnippet: `// RoboVerse Official Sample 3: Quadcopter Drone PID Attitude Stabilization
#include <Wire.h>

const int MPU_ADDR = 0x68;
float gyroX, gyroY, gyroZ;
float pitchTarget = 0.0, rollTarget = 0.0;
float Kp = 1.2, Ki = 0.05, Kd = 0.3;

void setup() {
  Wire.begin();
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1
  Wire.write(0);    // Wake up MPU6050
  Wire.endTransmission(true);

  Serial.begin(115200);
  Serial.println("Quadcopter Flight Controller Active. Comply with DGCA Green Zone rules.");
}

void loop() {
  // Read gyro raw values
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x43);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  int16_t rawGyroX = Wire.read() << 8 | Wire.read();
  int16_t rawGyroY = Wire.read() << 8 | Wire.read();

  gyroX = rawGyroX / 131.0;
  gyroY = rawGyroY / 131.0;

  // Compute PID correction
  float errorPitch = pitchTarget - gyroY;
  float correction = Kp * errorPitch;

  Serial.print("Pitch Error: ");
  Serial.print(errorPitch);
  Serial.print(" | ESC Adjustment: ");
  Serial.println(correction);

  delay(10);
}
`,
        difficulty: 'ADVANCED' as const,
        estimatedCostInr: 4999,
        scenarioDescription:
          'Tune Roll, Pitch, and Yaw PID gains in real time inside the 3D physics simulator. Note: For real flights in India, register on DigitalSky (DGCA) under Nano/Micro drone categories.',
        quizQuestions: [
          {
            question: 'Under Indian DGCA drone rules, what is the weight limit for Nano category drones that do not require UIN registration for non-commercial flight?',
            options: ['Up to 250 grams', 'Up to 2 kilograms', 'Up to 500 grams', 'Up to 5 kilograms'],
            correctIndex: 0,
            explanation:
              'Drones weighing less than or equal to 250 grams are classified as Nano category under the Drone Rules 2021 by the Directorate General of Civil Aviation (DGCA).',
          },
        ],
        badges: ['aerial-innovator', 'pid-tuner', 'dgca-certified'],
      },
    ];

    for (const sample of sampleProjectsData) {
      await SampleProjectModel.findOneAndUpdate(
        { slug: sample.slug },
        sample,
        { upsert: true, new: true }
      );
    }

    // 6. Seed Courses
    console.log('📚 Seeding Core Learning Courses...');
    const coursesData = [
      {
        slug: 'hardware-foundations',
        title: 'Hardware Foundations: Circuits, Sensors & Microcontrollers',
        description: 'Comprehensive foundational track covering voltage, current, Ohm law, passive components, ICs, sensors, and breadboard prototyping.',
        category: 'ELECTRONICS',
        track: 'HARDWARE' as const,
        level: 'BEGINNER' as const,
        durationHours: 12,
        isOfficialCertificate: true,
        order: 1,
      },
      {
        slug: 'arduino-software-mastery',
        title: 'Software Mastery: Arduino C++, Control Logic & Embedded Algorithms',
        description: 'Master writing robust Arduino C++ firmware, state machines, interrupt handling, PWM motor control, and sensor filtering.',
        category: 'PROGRAMMING',
        track: 'SOFTWARE' as const,
        level: 'BEGINNER' as const,
        durationHours: 14,
        isOfficialCertificate: true,
        order: 2,
      },
      {
        slug: 'autonomous-robotics-pro',
        title: 'Autonomous Mobile Robotics: Obstacle Avoidance, PID & Kinematics',
        description: 'Advanced track covering differential kinematics, PID trajectory tracking, encoder odometry, and edge computing.',
        category: 'ROBOTICS',
        track: 'ROBOTICS' as const,
        level: 'INTERMEDIATE' as const,
        durationHours: 20,
        isOfficialCertificate: true,
        order: 3,
      },
    ];

    for (const c of coursesData) {
      await CourseModel.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
    }

    // 7. Seed Hackathons
    console.log('🏆 Seeding National Robotics Hackathons...');
    const hackathonsData = [
      {
        title: 'National Autonomous Rover Challenge 2026',
        organizer: 'RoboVerse & All India Robotics Forum',
        city: 'Delhi',
        state: 'Delhi',
        mode: 'HYBRID' as const,
        level: 'National',
        prizePoolInr: 250000,
        registrationDeadline: new Date('2026-11-15'),
        eventDate: new Date('2026-12-05'),
        url: 'https://roboverse.io/hackathons/national-rover-2026',
        description: 'Design and deploy an autonomous rover capable of obstacle avoidance, terrain traversal, and color-coded payload drop.',
        isCurated: true,
        teamSizeMax: 4,
      },
      {
        title: 'Bengaluru IoT & Robotics Sprint 2026',
        organizer: 'MakerSpace Karnataka',
        city: 'Bengaluru',
        state: 'Karnataka',
        mode: 'OFFLINE' as const,
        level: 'College & University',
        prizePoolInr: 100000,
        registrationDeadline: new Date('2026-10-30'),
        eventDate: new Date('2026-11-12'),
        url: 'https://roboverse.io/hackathons/bengaluru-iot-2026',
        description: '24-hour hardware hackathon on ESP32 mesh networks, sensor fusion, and smart city robotic automation.',
        isCurated: true,
        teamSizeMax: 3,
      },
      {
        title: 'Western India Inter-College Robocon 2026',
        organizer: 'IIT Bombay Robotics Club',
        city: 'Mumbai',
        state: 'Maharashtra',
        mode: 'OFFLINE' as const,
        level: 'Inter-College',
        prizePoolInr: 150000,
        registrationDeadline: new Date('2026-11-20'),
        eventDate: new Date('2026-12-10'),
        url: 'https://roboverse.io/hackathons/mumbai-robocon-2026',
        description: 'Dual robot badminton and ball-launching precision challenge based on international ABU Robocon guidelines.',
        isCurated: true,
        teamSizeMax: 5,
      },
    ];

    for (const evt of hackathonsData) {
      await EventModel.findOneAndUpdate({ title: evt.title }, evt, { upsert: true, new: true });
    }

    // 8. Seed Verified Component Shops (with GeoJSON Point & Coordinates)
    console.log('📍 Seeding Verified Component Shops with GeoJSON 2dsphere coordinates...');
    const shopsData = [
      {
        name: 'ElectroHub Components & Robotics',
        address: 'Shop 42, Ground Floor, Lajpat Rai Market, Chandni Chowk',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110006',
        phone: '+91-11-23861234',
        location: {
          type: 'Point' as const,
          coordinates: [77.2355, 28.6562], // [lng, lat]
        },
        openingHours: '10:00 AM - 8:00 PM (Mon-Sat)',
        verifiedStatus: 'VERIFIED' as const,
        lastVerifiedAt: new Date(),
        ratingSummary: { averageRating: 4.8, reviewCount: 142 },
        inventory: [
          { componentName: 'Arduino Uno R3', inStock: true, estimatedPriceInr: 499 },
          { componentName: 'ESP32 DevKit', inStock: true, estimatedPriceInr: 349 },
          { componentName: 'SG90 Micro Servo', inStock: true, estimatedPriceInr: 110 },
          { componentName: 'HC-SR04 Ultrasonic Sonar', inStock: true, estimatedPriceInr: 99 },
          { componentName: 'L298N Motor Driver', inStock: true, estimatedPriceInr: 180 },
        ],
      },
      {
        name: 'RoboSpares Lab & Kits',
        address: '24/1 Sadar Patrappa Road (SP Road), Nagarathpete',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560002',
        phone: '+91-80-22234567',
        location: {
          type: 'Point' as const,
          coordinates: [77.5833, 12.9644],
        },
        openingHours: '10:30 AM - 8:30 PM (Mon-Sat)',
        verifiedStatus: 'VERIFIED' as const,
        lastVerifiedAt: new Date(),
        ratingSummary: { averageRating: 4.9, reviewCount: 310 },
        inventory: [
          { componentName: 'Arduino Uno R3', inStock: true, estimatedPriceInr: 480 },
          { componentName: 'BLDC Motors 1000KV', inStock: true, estimatedPriceInr: 650 },
          { componentName: '30A ESC', inStock: true, estimatedPriceInr: 420 },
          { componentName: 'LiPo 3S Battery', inStock: true, estimatedPriceInr: 1200 },
        ],
      },
      {
        name: 'Apex Robotics & Embedded Systems',
        address: 'Shop 15, Silver Mansion, Lamington Road, Grant Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400007',
        phone: '+91-22-23887654',
        location: {
          type: 'Point' as const,
          coordinates: [72.8164, 18.9616],
        },
        openingHours: '10:00 AM - 8:00 PM (Mon-Sat)',
        verifiedStatus: 'VERIFIED' as const,
        lastVerifiedAt: new Date(),
        ratingSummary: { averageRating: 4.8, reviewCount: 88 },
        inventory: [
          { componentName: 'Arduino Uno R3', inStock: true, estimatedPriceInr: 500 },
          { componentName: 'Sensors Kit', inStock: true, estimatedPriceInr: 850 },
          { componentName: 'Soldering Iron Station', inStock: true, estimatedPriceInr: 899 },
        ],
      },
    ];

    for (const shop of shopsData) {
      await ShopModel.findOneAndUpdate({ name: shop.name }, shop, { upsert: true, new: true });
    }

    // 9. Seed TechSavyyy Products
    console.log('🛍️ Seeding TechSavyyy Official Store Products...');
    const storeProducts = [
      {
        slug: 'roboverse-robotics-starter-kit',
        title: 'RoboVerse All-in-One Robotics Starter Kit',
        description:
          'Everything you need to learn robotics: Arduino Uno, Half-Size Breadboard, 50+ sensors, jumper wires, servo, ultrasonic and step-by-step guidebook.',
        category: 'ROBOT_KITS',
        priceInr: 1299,
        stockQuantity: 150,
        images: ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80'],
        rating: 4.9,
        isKitOfMonth: true,
      },
      {
        slug: '4wd-smart-robot-chassis',
        title: '4WD Smart Robot Chassis with BO Gear Motors',
        description:
          'Laser-cut acrylic dual chassis plates with 4 DC gear motors, high-grip rubber wheels, speed optical encoders and 4x AA battery case.',
        category: 'MECHANICAL',
        priceInr: 649,
        stockQuantity: 80,
        images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80'],
        rating: 4.8,
        isKitOfMonth: false,
      },
    ];

    for (const prod of storeProducts) {
      await ProductModel.findOneAndUpdate({ slug: prod.slug }, prod, { upsert: true, new: true });
    }

    // 10. Seed Discount & Scholarship Coupons
    console.log('🏷️ Seeding Promo & Scholarship Coupons...');
    const couponsData = [
      {
        code: 'WELCOME100',
        discountAmountInr: 100,
        minOrderAmountInr: 299,
        validFrom: new Date(),
        validUntil: new Date('2030-12-31'),
        maxUses: 10000,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'ROBO50',
        discountPercentage: 50,
        minOrderAmountInr: 499,
        validFrom: new Date(),
        validUntil: new Date('2030-12-31'),
        maxUses: 500,
        usedCount: 0,
        isActive: true,
      },
    ];

    for (const coup of couponsData) {
      await CouponModel.findOneAndUpdate({ code: coup.code }, coup, { upsert: true, new: true });
    }

    // 11. Seed Official Certificate Templates
    console.log('📜 Seeding Certificate Templates...');
    await CertificateTemplateModel.findOneAndUpdate(
      { name: 'Official RoboVerse Track Completion Certificate' },
      {
        name: 'Official RoboVerse Track Completion Certificate',
        track: 'Hardware & Embedded Robotics',
        issuerTitle: 'Director of Robotics Education, RoboVerse',
        defaultHours: 20,
        layoutConfig: {
          themeColor: '#FF8A1F',
          borderStyle: 'double-gold',
          sealUrl: '/assets/branding/roboverse_official_seal.png',
        },
      },
      { upsert: true, new: true }
    );

    console.log('✅ RoboVerse MongoDB Seed Completed Successfully!');
  } catch (err: any) {
    console.error('❌ Error during MongoDB seed:', err);
    throw err;
  } finally {
    await disconnectMongo();
  }
}

// If run directly via CLI
if (require.main === module) {
  runMongoSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
