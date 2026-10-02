import { DEFAULT_PLANS, PlanTier, UserRole, UserStatus, BillingCycle } from '@roboverse/shared';
import { inMemoryDb } from '../src/lib/db';
import { generateStudentIdRecord } from '../src/lib/studentId';
import { hashPassword } from '../src/lib/password';

export async function runDatabaseSeed() {
  console.log('🌱 Starting RoboVerse Platform Database Seeding...');

  // 1. Seed Plans
  console.log('📦 Seeding Subscription Plans (Free, Plus, Pro, Institution)...');
  Object.values(DEFAULT_PLANS).forEach((plan) => {
    inMemoryDb.plans.set(plan.id, {
      id: plan.id,
      tier: plan.tier,
      name: plan.name,
      tagline: plan.tagline,
      isPopular: plan.isPopular || false,
      badge: plan.badge || null,
      pricingJson: JSON.stringify(plan.pricing),
      featuresJson: JSON.stringify(plan.features),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // 2. Seed Default Users with Student IDs and Profiles
  console.log('👥 Seeding Default Users & Digital Student IDs...');
  const defaultPasswordHash = await hashPassword('RoboSpark#2026');

  // Mentor / Teacher
  const mentorId = 'user_mentor_001';
  inMemoryDb.users.set(mentorId, {
    id: mentorId,
    email: 'mentor.rahul@roboverse.io',
    passwordHash: defaultPasswordHash,
    mobileNumber: '+919876500001',
    role: UserRole.MENTOR_TEACHER,
    status: UserStatus.ACTIVE,
    referralCode: 'RV-MENTOR-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  inMemoryDb.profiles.set(mentorId, {
    id: 'prof_mentor_001',
    userId: mentorId,
    fullName: 'Dr. Rahul Verma',
    institutionType: 'university',
    schoolOrCollegeName: 'IIT Delhi Robotics Research Group',
    classOrYear: 'Senior Robotics Faculty',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    interests: ['ros_robotics', 'machine_learning', 'embedded_c'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Robotics mentor specializing in ROS, path planning, and autonomous rovers.',
    level: 50,
    xp: 25000,
    streakDays: 120,
    totalLearningHours: 650,
  });

  // Sample Pro Student
  const proStudentId = 'user_student_pro_001';
  const proStudentIdCard = await generateStudentIdRecord(101, 2026);
  inMemoryDb.users.set(proStudentId, {
    id: proStudentId,
    email: 'vikram.aditya@example.com',
    passwordHash: defaultPasswordHash,
    mobileNumber: '+919876500101',
    role: UserRole.PRO_STUDENT,
    status: UserStatus.ACTIVE,
    referralCode: 'RV-VIK-101',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  inMemoryDb.studentIds.set(proStudentId, {
    id: `stid_${proStudentId}`,
    userId: proStudentId,
    ...proStudentIdCard,
  });
  inMemoryDb.profiles.set(proStudentId, {
    id: 'prof_pro_001',
    userId: proStudentId,
    fullName: 'Vikram Aditya',
    institutionType: 'college',
    schoolOrCollegeName: 'Delhi Technological University',
    classOrYear: 'B.Tech ECE 2nd Year',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    interests: ['arduino', 'drones', 'machine_learning', 'ros_robotics'],
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    bio: 'Building an autonomous obstacle-avoiding rover for the national hackathon.',
    level: 12,
    xp: 4500,
    streakDays: 18,
    totalLearningHours: 42.5,
  });
  inMemoryDb.subscriptions.set(`sub_${proStudentId}`, {
    id: `sub_${proStudentId}`,
    userId: proStudentId,
    planId: 'plan_pro',
    billingCycle: BillingCycle.MONTHLY,
    status: 'ACTIVE',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Seed Components Library
  console.log('⚡ Seeding 3D Circuit Component Library...');
  const componentsData = [
    {
      id: 'comp_arduino_uno',
      name: 'Arduino Uno R3',
      category: 'MICROCONTROLLER',
      model3DUrl: '/models/components/arduino_uno.glb',
      datasheetUrl: 'https://docs.arduino.cc/hardware/uno-rev3/',
      isFreeTier: true,
      priceInr: 499,
      pinDefinitionsJson: JSON.stringify([
        { id: 'pin_5v', name: '5V', type: 'POWER_VCC' },
        { id: 'pin_gnd_1', name: 'GND', type: 'GROUND' },
        { id: 'pin_d13', name: 'D13', type: 'DIGITAL_IO' },
        { id: 'pin_a0', name: 'A0', type: 'ANALOG_IN' },
      ]),
      defaultPropertiesJson: JSON.stringify({ clockSpeed: '16MHz', vcc: 5.0 }),
    },
    {
      id: 'comp_esp32',
      name: 'ESP32 NodeMCU WROOM',
      category: 'MICROCONTROLLER',
      model3DUrl: '/models/components/esp32.glb',
      datasheetUrl: 'https://www.espressif.com/en/products/socs/esp32',
      isFreeTier: false, // Plus & Pro
      priceInr: 349,
      pinDefinitionsJson: JSON.stringify([
        { id: 'pin_3v3', name: '3V3', type: 'POWER_VCC' },
        { id: 'pin_gnd', name: 'GND', type: 'GROUND' },
        { id: 'pin_gpio2', name: 'GPIO2', type: 'DIGITAL_IO' },
      ]),
      defaultPropertiesJson: JSON.stringify({ wifi: true, bluetooth: true, vcc: 3.3 }),
    },
    {
      id: 'comp_led_red',
      name: 'Red 5mm LED',
      category: 'DISPLAY',
      model3DUrl: '/models/components/led_red.glb',
      isFreeTier: true,
      priceInr: 5,
      pinDefinitionsJson: JSON.stringify([
        { id: 'anode', name: 'Anode (+)', type: 'DIGITAL_IO' },
        { id: 'cathode', name: 'Cathode (-)', type: 'GROUND' },
      ]),
      defaultPropertiesJson: JSON.stringify({ forwardVoltage: 2.0, maxCurrentMa: 20, color: '#FF3333' }),
    },
    {
      id: 'comp_resistor_220',
      name: '220Ω Resistor',
      category: 'PASSIVE',
      model3DUrl: '/models/components/resistor.glb',
      isFreeTier: true,
      priceInr: 2,
      pinDefinitionsJson: JSON.stringify([
        { id: 't1', name: 'Pin 1', type: 'DIGITAL_IO' },
        { id: 't2', name: 'Pin 2', type: 'DIGITAL_IO' },
      ]),
      defaultPropertiesJson: JSON.stringify({ resistance: 220, unit: 'Ω', powerRating: '0.25W' }),
    },
    {
      id: 'comp_servo_sg90',
      name: 'TowerPro SG90 Micro Servo',
      category: 'ACTUATOR',
      model3DUrl: '/models/components/servo_sg90.glb',
      isFreeTier: false, // Plus & Pro
      priceInr: 120,
      pinDefinitionsJson: JSON.stringify([
        { id: 'pwm', name: 'PWM Signal (Orange)', type: 'PWM' },
        { id: 'vcc', name: 'VCC 5V (Red)', type: 'POWER_VCC' },
        { id: 'gnd', name: 'GND (Brown)', type: 'GROUND' },
      ]),
      defaultPropertiesJson: JSON.stringify({ angleRange: 180, operatingVoltage: 5.0 }),
    },
    {
      id: 'comp_ultrasonic_hcsr04',
      name: 'HC-SR04 Ultrasonic Distance Sensor',
      category: 'SENSOR',
      model3DUrl: '/models/components/ultrasonic.glb',
      isFreeTier: false, // Plus & Pro
      priceInr: 110,
      pinDefinitionsJson: JSON.stringify([
        { id: 'vcc', name: 'VCC', type: 'POWER_VCC' },
        { id: 'trig', name: 'Trig', type: 'DIGITAL_IO' },
        { id: 'echo', name: 'Echo', type: 'DIGITAL_IO' },
        { id: 'gnd', name: 'GND', type: 'GROUND' },
      ]),
      defaultPropertiesJson: JSON.stringify({ rangeCm: [2, 400], frequencyKhz: 40 }),
    },
  ];

  componentsData.forEach((c) => inMemoryDb.components.set(c.id, c));

  // 4. Seed Courses
  console.log('📚 Seeding Learning Roadmap Courses...');
  const coursesData = [
    {
      id: 'crs_arduino_101',
      title: 'Arduino & Microcontroller Fundamentals',
      slug: 'arduino-fundamentals',
      description: 'Master digital I/O, analog sensors, PWM motor control, and breadboard circuit fundamentals.',
      category: 'Electronics & Microcontrollers',
      level: 'Beginner',
      requiredPlan: PlanTier.FREE,
      estimatedHours: 6.0,
      icon: '⚡',
      isPublished: true,
    },
    {
      id: 'crs_robotics_mechanics',
      title: 'Robot Mechanics, Actuators & Drive Trains',
      slug: 'robot-mechanics-actuators',
      description: 'Differential drives, servo kinematics, motor driver circuits (L298N, L293D), chassis assembly.',
      category: 'Robotics Engineering',
      level: 'Intermediate',
      requiredPlan: PlanTier.PLUS,
      estimatedHours: 12.0,
      icon: '🤖',
      isPublished: true,
    },
    {
      id: 'crs_ml_robotics',
      title: 'Machine Learning for Robotics & Computer Vision',
      slug: 'ml-robotics-vision',
      description: 'Object detection with OpenCV, line detection neural nets, ROS 2 integration, and autonomous navigation.',
      category: 'Advanced AI & Robotics',
      level: 'Advanced',
      requiredPlan: PlanTier.PRO,
      estimatedHours: 20.0,
      icon: '🧠',
      isPublished: true,
    },
  ];
  coursesData.forEach((crs) => inMemoryDb.courses.set(crs.id, crs));

  // 5. Seed Hackathons & Competitions
  console.log('🏆 Seeding Robotics Hackathons & Competitions...');
  const eventsData = [
    {
      id: 'evt_nat_rover_2026',
      title: 'National Autonomous Rover Challenge 2026',
      organizer: 'RoboVerse & All India Robotics Forum',
      city: 'New Delhi',
      state: 'Delhi',
      mode: 'HYBRID',
      level: 'National',
      prizePoolInr: 250000,
      registrationDeadline: new Date('2026-11-15'),
      eventDate: new Date('2026-12-05'),
      url: 'https://roboverse.io/hackathons/national-rover-2026',
      isCurated: true,
    },
    {
      id: 'evt_iot_hack_blr',
      title: 'Bengaluru IoT & Robotics Sprint 2026',
      organizer: 'MakerSpace Karnataka',
      city: 'Bengaluru',
      state: 'Karnataka',
      mode: 'OFFLINE',
      level: 'College & University',
      prizePoolInr: 100000,
      registrationDeadline: new Date('2026-10-30'),
      eventDate: new Date('2026-11-12'),
      url: 'https://roboverse.io/hackathons/bengaluru-iot-2026',
      isCurated: true,
    },
  ];
  eventsData.forEach((e) => inMemoryDb.events.set(e.id, e));

  // 6. Seed Nearby Component Shops
  console.log('📍 Seeding Verified Component Shops...');
  const shopsData = [
    {
      id: 'shop_delhi_lajpat',
      name: 'ElectroHub Components & Robotics',
      address: 'Shop 42, Ground Floor, Lajpat Rai Market, Chandni Chowk',
      city: 'Delhi',
      state: 'Delhi',
      latitude: 28.6562,
      longitude: 77.2355,
      phone: '+91-11-23861234',
      openingHours: '10:00 AM - 8:00 PM (Mon-Sat)',
      rating: 4.8,
      isVerified: true,
      stockedComponentsJson: JSON.stringify(['comp_arduino_uno', 'comp_esp32', 'comp_led_red', 'comp_resistor_220']),
    },
    {
      id: 'shop_blr_sp_road',
      name: 'RoboSpares Lab & Kits',
      address: '24/1 Sadar Patrappa Road (SP Road), Nagarathpete',
      city: 'Bengaluru',
      state: 'Karnataka',
      latitude: 12.9644,
      longitude: 77.5833,
      phone: '+91-80-22234567',
      openingHours: '10:30 AM - 8:30 PM (Mon-Sat)',
      rating: 4.9,
      isVerified: true,
      stockedComponentsJson: JSON.stringify(['comp_arduino_uno', 'comp_esp32', 'comp_servo_sg90', 'comp_ultrasonic_hcsr04']),
    },
  ];
  shopsData.forEach((s) => inMemoryDb.shops.set(s.id, s));

  // 7. Seed TechSavyyy Store Products
  console.log('🛒 Seeding TechSavyyy Official Store Products...');
  const productsData = [
    {
      id: 'prod_starter_kit',
      title: 'RoboVerse All-in-One Robotics Starter Kit',
      slug: 'roboverse-robotics-starter-kit',
      description: 'Includes Arduino Uno, breadboard, 50+ sensors, jumper wires, servo, ultrasonic and guide book.',
      category: 'ROBOT_KITS',
      priceInr: 1299,
      stockQuantity: 150,
      imagesJson: JSON.stringify(['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80']),
      model3DUrl: '/models/products/kit_box.glb',
      specsJson: JSON.stringify({ componentsIncluded: 45, ageGroup: '12+', warranty: '6 Months' }),
      isKitOfMonth: true,
    },
    {
      id: 'prod_chassis_4wd',
      title: '4WD Smart Robot Chassis with Bo-Motors',
      slug: '4wd-smart-robot-chassis',
      description: 'Laser-cut acrylic dual chassis with 4 DC gear motors, wheels, speed encoders and battery case.',
      category: 'MECHANICAL',
      priceInr: 649,
      stockQuantity: 80,
      imagesJson: JSON.stringify(['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80']),
      model3DUrl: '/models/products/chassis_4wd.glb',
      specsJson: JSON.stringify({ wheelDiameter: '66mm', voltage: '3V-6V', encoderDisks: 4 }),
      isKitOfMonth: false,
    },
  ];
  productsData.forEach((p) => inMemoryDb.products.set(p.id, p));

  console.log('✅ Database Seed Completed Successfully!');
}

// Auto-run if executed directly
if (require.main === module) {
  runDatabaseSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
