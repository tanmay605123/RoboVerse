import { PrismaClient } from '@prisma/client';
import { DEFAULT_PLANS, PlanTier, UserRole, UserStatus, BillingCycle, SubscriptionStatus } from '@roboverse/shared';

// Create real PrismaClient instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// In-Memory store for offline/local development or test runs
interface InMemoryDatabase {
  users: Map<string, any>;
  profiles: Map<string, any>;
  studentIds: Map<string, any>;
  plans: Map<string, any>;
  subscriptions: Map<string, any>;
  payments: Map<string, any>;
  coupons: Map<string, any>;
  usageMeters: Map<string, any>;
  circuitProjects: Map<string, any>;
  components: Map<string, any>;
  courses: Map<string, any>;
  lessons: Map<string, any>;
  events: Map<string, any>;
  shops: Map<string, any>;
  products: Map<string, any>;
  invoices: Map<string, any>;
  orders: Map<string, any>;
}

export const inMemoryDb: InMemoryDatabase = {
  users: new Map(),
  profiles: new Map(),
  studentIds: new Map(),
  plans: new Map(),
  subscriptions: new Map(),
  payments: new Map(),
  coupons: new Map(),
  usageMeters: new Map(),
  circuitProjects: new Map(),
  components: new Map(),
  courses: new Map(),
  lessons: new Map(),
  events: new Map(),
  shops: new Map(),
  products: new Map(),
  invoices: new Map(),
  orders: new Map(),
};

// Seed default plans into inMemoryDb immediately
export function initInMemorySeed(): void {
  // 1. Seed Plans
  Object.values(DEFAULT_PLANS).forEach((p) => {
    inMemoryDb.plans.set(p.id, {
      id: p.id,
      tier: p.tier,
      name: p.name,
      tagline: p.tagline,
      isPopular: p.isPopular || false,
      badge: p.badge || null,
      pricingJson: JSON.stringify(p.pricing),
      featuresJson: JSON.stringify(p.features),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // 2. Seed Default Promo Coupons
  inMemoryDb.coupons.set('WELCOME100', {
    id: 'coup_welcome100',
    code: 'WELCOME100',
    discountAmountInr: 100,
    minOrderAmountInr: 299,
    validFrom: new Date(),
    validUntil: new Date('2030-12-31'),
    maxUses: 10000,
    usedCount: 0,
    isActive: true,
  });

  inMemoryDb.coupons.set('ROBO50', {
    id: 'coup_robo50',
    code: 'ROBO50',
    discountPercentage: 50,
    minOrderAmountInr: 499,
    validFrom: new Date(),
    validUntil: new Date('2030-12-31'),
    maxUses: 500,
    usedCount: 0,
    isActive: true,
  });

  // 3. Seed Default Admin User
  const adminId = 'user_admin_001';
  inMemoryDb.users.set(adminId, {
    id: adminId,
    email: 'admin@roboverse.io',
    passwordHash: '$2a$10$pT6o3y7f3wGZfJ8/YdI0CeN0oAovt6gJv6f1J1rJ1n6.Zgq9pEweC', // Admin@2026!
    mobileNumber: '+919999900001',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    referralCode: 'ROBO-ADMIN-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  inMemoryDb.profiles.set(adminId, {
    id: 'prof_admin_001',
    userId: adminId,
    fullName: 'RoboVerse Commander',
    institutionType: 'university',
    schoolOrCollegeName: 'RoboVerse Robotics Lab',
    classOrYear: 'Lead Admin',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    interests: ['arduino', 'ros_robotics', 'machine_learning'],
    level: 99,
    xp: 99999,
    streakDays: 365,
    totalLearningHours: 1200,
  });

  inMemoryDb.studentIds.set(adminId, {
    id: 'id_admin_001',
    userId: adminId,
    studentId: 'RV-2026-000001',
    qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzc1tD0QAAAABJRU5ErkJggg==',
    verificationHash: 'admin_hash_000001',
    issuedAt: new Date(),
    validUntil: new Date('2030-12-31'),
  });

  // 4. Seed Hackathons & Competitions
  const sampleEvents = [
    {
      id: 'evt_nat_rover_2026',
      title: 'National Autonomous Rover Challenge 2026',
      organizer: 'RoboVerse & All India Robotics Forum',
      city: 'Delhi',
      state: 'Delhi',
      mode: 'HYBRID',
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
      description: '24-hour hardware hackathon on ESP32 mesh networks, sensor fusion, and smart city robotic automation.',
      isCurated: true,
      teamSizeMax: 3,
    },
    {
      id: 'evt_mumbai_robocon',
      title: 'Western India Inter-College Robocon 2026',
      organizer: 'IIT Bombay Robotics Club',
      city: 'Mumbai',
      state: 'Maharashtra',
      mode: 'OFFLINE',
      level: 'Inter-College',
      prizePoolInr: 150000,
      registrationDeadline: new Date('2026-11-20'),
      eventDate: new Date('2026-12-10'),
      url: 'https://roboverse.io/hackathons/mumbai-robocon-2026',
      description: 'Dual robot badminton and ball-launching precision challenge based on international ABU Robocon guidelines.',
      isCurated: true,
      teamSizeMax: 5,
    },
    {
      id: 'evt_pune_drone_hack',
      title: 'Pune Autonomous Aerial Drone Derby',
      organizer: 'AeroRobotics Pune',
      city: 'Pune',
      state: 'Maharashtra',
      mode: 'HYBRID',
      level: 'Open Category',
      prizePoolInr: 180000,
      registrationDeadline: new Date('2026-11-05'),
      eventDate: new Date('2026-11-28'),
      url: 'https://roboverse.io/hackathons/pune-drone-2026',
      description: 'Quadcopter obstacle course race with automated optical flow position hold and gate detection.',
      isCurated: true,
      teamSizeMax: 4,
    },
  ];
  sampleEvents.forEach((e) => inMemoryDb.events.set(e.id, e));

  // 5. Seed Verified Component Shops
  const sampleShops = [
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
      stockedComponents: ['Arduino Uno', 'ESP32', 'SG90 Servo', 'HC-SR04', 'L298N', 'Breadboards', 'Soldering Irons'],
    },
    {
      id: 'shop_delhi_nehru',
      name: 'CircuitWorks Nehru Place',
      address: 'G-12, Paras Cinema Complex, Nehru Place',
      city: 'Delhi',
      state: 'Delhi',
      latitude: 28.5494,
      longitude: 77.2522,
      phone: '+91-11-41609876',
      openingHours: '10:30 AM - 7:30 PM (Mon-Sat)',
      rating: 4.7,
      isVerified: true,
      stockedComponents: ['Raspberry Pi 4', 'Pico W', 'LiPo Batteries', 'Sensors Kit', 'Jumper Wires'],
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
      stockedComponents: ['Arduino', 'ESP32', 'Robotic Grippers', 'BLDC Motors', 'ESC 30A', 'Filament'],
    },
    {
      id: 'shop_mumbai_lamington',
      name: 'Apex Robotics & Embedded Systems',
      address: 'Shop 15, Silver Mansion, Lamington Road, Grant Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 18.9616,
      longitude: 72.8164,
      phone: '+91-22-23887654',
      openingHours: '10:00 AM - 8:00 PM (Mon-Sat)',
      rating: 4.8,
      isVerified: true,
      stockedComponents: ['Arduino Uno', 'Sensors', 'Chassis', 'Wheels', 'Multimeters', 'Oscilloscopes'],
    },
  ];
  sampleShops.forEach((s) => inMemoryDb.shops.set(s.id, s));

  // 6. Seed TechSavyyy Official Store Products
  const sampleProducts = [
    {
      id: 'prod_starter_kit',
      title: 'RoboVerse All-in-One Robotics Starter Kit',
      slug: 'roboverse-robotics-starter-kit',
      description: 'Everything you need to learn robotics: Arduino Uno, Half-Size Breadboard, 50+ sensors, jumper wires, servo, ultrasonic and step-by-step guidebook.',
      category: 'ROBOT_KITS',
      priceInr: 1299,
      stockQuantity: 150,
      images: ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=400&q=80'],
      model3DUrl: '/models/products/kit_box.glb',
      specs: { componentsIncluded: 45, ageGroup: '10+', warranty: '6 Months', gstIncludedPct: 18 },
      rating: 4.9,
      isKitOfMonth: true,
    },
    {
      id: 'prod_chassis_4wd',
      title: '4WD Smart Robot Chassis with BO Gear Motors',
      slug: '4wd-smart-robot-chassis',
      description: 'Laser-cut acrylic dual chassis plates with 4 DC gear motors, high-grip rubber wheels, speed optical encoders and 4x AA battery case.',
      category: 'MECHANICAL',
      priceInr: 649,
      stockQuantity: 80,
      images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80'],
      model3DUrl: '/models/products/chassis_4wd.glb',
      specs: { wheelDiameter: '66mm', voltage: '3V-6V DC', encoderDisks: 4 },
      rating: 4.8,
      isKitOfMonth: false,
    },
    {
      id: 'prod_esp32_devkit',
      title: 'ESP32 Dual-Core WiFi + Bluetooth DevKit V1',
      slug: 'esp32-devkit-v1',
      description: 'High-performance 240MHz microcontroller for IoT, smart home, and cloud-connected robotics projects.',
      category: 'MICROCONTROLLERS',
      priceInr: 349,
      stockQuantity: 200,
      images: ['https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80'],
      specs: { clock: '240 MHz', wifi: '802.11 b/g/n', bluetooth: 'v4.2 BR/EDR and BLE' },
      rating: 4.9,
      isKitOfMonth: false,
    },
    {
      id: 'prod_sg90_servo_pack',
      title: 'TowerPro SG90 9g Micro Servos (Pack of 4)',
      slug: 'sg90-micro-servos-pack',
      description: 'Precision 0-180 degree positional servo motors for robot arms, pan-tilt turrets, and grippers.',
      category: 'ACTUATORS',
      priceInr: 420,
      stockQuantity: 120,
      images: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80'],
      specs: { torque: '1.8 kg-cm', speed: '0.1s / 60 deg', operatingV: '4.8V - 6V' },
      rating: 4.7,
      isKitOfMonth: false,
    },
    {
      id: 'prod_ultrasonic_sensor',
      title: 'HC-SR04 Ultrasonic Sonar Distance Module (Pack of 2)',
      slug: 'hc-sr04-ultrasonic-sensor-pair',
      description: 'High-accuracy sonar distance sensor with 2cm to 400cm range for obstacle avoidance rovers.',
      category: 'SENSORS',
      priceInr: 199,
      stockQuantity: 250,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'],
      specs: { measuringRange: '2cm - 400cm', resolution: '0.3cm', angle: '15 degrees' },
      rating: 4.8,
      isKitOfMonth: false,
    },
    {
      id: 'prod_soldering_iron_kit',
      title: '60W Adjustable Temperature Soldering Station Kit',
      slug: '60w-soldering-iron-station-kit',
      description: 'Complete soldering tool kit: 60W iron with 5 extra tips, solder wire, desoldering pump, stand, and tweezers.',
      category: 'TOOLS',
      priceInr: 899,
      stockQuantity: 60,
      images: ['https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=400&q=80'],
      specs: { power: '60W', tempRange: '200°C - 450°C', safetyStand: true },
      rating: 4.9,
      isKitOfMonth: false,
    },
  ];
  sampleProducts.forEach((p) => inMemoryDb.products.set(p.id, p));
}

initInMemorySeed();
