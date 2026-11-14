import { RobotTemplate, ArenaDefinition } from '../types/robotics';

export const ROBOT_TEMPLATES: RobotTemplate[] = [
  {
    id: 'tmpl_rover_2wd',
    slug: '2wd-obstacle-avoider',
    name: '2WD Autonomous Obstacle Avoider',
    type: 'ROVER_2WD',
    description: 'Differential-drive 2WD rover equipped with SG90 servo-pivoting HC-SR04 sonar radar and dual TT gearmotors.',
    difficulty: 'Beginner',
    chassis: {
      typeId: 'chassis_2wd',
      dimensionsMm: [160, 220, 40],
      massGrams: 145,
      material: 'Laser-cut Acrylic',
    },
    mountPoints: [
      { id: 'mount_mcu', name: 'MCU Mount (Center)', position: [0, 0.05, 0.1], rotation: [0, 0, 0], allowedTypes: ['arduino_uno', 'arduino_nano'] },
      { id: 'mount_driver', name: 'Motor Driver (Rear)', position: [0, 0.05, -0.4], rotation: [0, 0, 0], allowedTypes: ['driver_l298n', 'driver_l293d'] },
      { id: 'mount_sensor', name: 'Sonar Turret (Front)', position: [0, 0.1, 0.9], rotation: [0, 0, 0], allowedTypes: ['ultrasonic_hcsr04', 'sensor_ir'] },
      { id: 'mount_battery', name: 'Battery Bay (Mid-Bottom)', position: [0, -0.05, -0.1], rotation: [0, 0, 0], allowedTypes: ['battery_9v', 'battery_18650'] },
    ],
    defaultParts: [
      { id: 'part_mcu', componentId: 'arduino_uno', name: 'Arduino Uno R3', mountPointId: 'mount_mcu', position: [0, 0.05, 0.1], rotation: [0, 0, 0], massGrams: 28 },
      { id: 'part_driver', componentId: 'driver_l298n', name: 'L298N Dual H-Bridge', mountPointId: 'mount_driver', position: [0, 0.05, -0.4], rotation: [0, 0, 0], massGrams: 33 },
      { id: 'part_sonar', componentId: 'ultrasonic_hcsr04', name: 'HC-SR04 Ultrasonic Sonar', mountPointId: 'mount_sensor', position: [0, 0.1, 0.9], rotation: [0, 0, 0], massGrams: 12 },
      { id: 'part_turret_servo', componentId: 'servo_sg90', name: 'SG90 Turret Servo', mountPointId: 'mount_sensor', position: [0, 0.04, 0.9], rotation: [0, 0, 0], massGrams: 9 },
      { id: 'part_bat', componentId: 'battery_9v', name: '9V Alkaline Battery', mountPointId: 'mount_battery', position: [0, -0.05, -0.1], rotation: [0, 0, 0], massGrams: 46 },
    ],
    defaultCode: `// 2WD Obstacle Avoidance Autonomous Controller
#include <Servo.h>

const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int LEFT_MOTOR_PWM = 5;
const int RIGHT_MOTOR_PWM = 6;
Servo sonarServo;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LEFT_MOTOR_PWM, OUTPUT);
  pinMode(RIGHT_MOTOR_PWM, OUTPUT);
  sonarServo.attach(11);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  long distCm = duration * 0.034 / 2;
  
  if (distCm < 35 && distCm > 0) {
    // Obstacle detected! Reverse and steer right
    analogWrite(LEFT_MOTOR_PWM, 180);
    analogWrite(RIGHT_MOTOR_PWM, 50);
  } else {
    // Clear path ahead: Forward full speed
    analogWrite(LEFT_MOTOR_PWM, 200);
    analogWrite(RIGHT_MOTOR_PWM, 200);
  }
  delay(50);
}
`,
    defaultArenaId: 'arena_obstacle_course',
    specs: {
      topSpeedMps: 0.9,
      payloadCapacityGrams: 500,
      batteryCapacityMah: 550,
      operatingVoltage: 9.0,
    },
  },
  {
    id: 'tmpl_rover_4wd',
    slug: '4wd-line-follower',
    name: '4WD Precision Line Follower',
    type: 'ROVER_4WD',
    description: 'Heavy-duty 4-wheel skid-steer rover with a 5-channel TCRT5000 infrared reflectance array for high-speed track navigation.',
    difficulty: 'Intermediate',
    chassis: {
      typeId: 'chassis_4wd',
      dimensionsMm: [180, 240, 55],
      massGrams: 230,
      material: 'Anodized Aluminum Alloy',
    },
    mountPoints: [
      { id: 'mount_mcu', name: 'MCU Mount (Center)', position: [0, 0.05, 0], rotation: [0, 0, 0], allowedTypes: ['arduino_uno', 'arduino_nano'] },
      { id: 'mount_ir_array', name: 'IR Line Array (Front Underside)', position: [0, -0.05, 1.1], rotation: [0, 0, 0], allowedTypes: ['sensor_ir_line_array'] },
      { id: 'mount_driver', name: 'Dual Driver (Center)', position: [0, 0.05, -0.3], rotation: [0, 0, 0], allowedTypes: ['driver_l298n'] },
      { id: 'mount_battery', name: 'Dual 18650 Pack (Rear)', position: [0, 0.05, -0.7], rotation: [0, 0, 0], allowedTypes: ['battery_18650'] },
    ],
    defaultParts: [
      { id: 'part_mcu', componentId: 'arduino_nano', name: 'Arduino Nano V3', mountPointId: 'mount_mcu', position: [0, 0.05, 0], rotation: [0, 0, 0], massGrams: 15 },
      { id: 'part_ir', componentId: 'sensor_ir_line_array', name: '5-Channel Line Tracker Array', mountPointId: 'mount_ir_array', position: [0, -0.05, 1.1], rotation: [0, 0, 0], massGrams: 22 },
      { id: 'part_driver', componentId: 'driver_l298n', name: 'L298N Dual H-Bridge', mountPointId: 'mount_driver', position: [0, 0.05, -0.3], rotation: [0, 0, 0], massGrams: 33 },
      { id: 'part_bat', componentId: 'battery_18650', name: 'Dual 18650 Li-ion 7.4V Pack', mountPointId: 'mount_battery', position: [0, 0.05, -0.7], rotation: [0, 0, 0], massGrams: 94 },
    ],
    defaultCode: `// 4WD 5-Channel PID Line Follower Sketch
const int SENSORS[5] = {A0, A1, A2, A3, A4};
const int LEFT_PWM = 5;
const int RIGHT_PWM = 6;

void setup() {
  for (int i = 0; i < 5; i++) pinMode(SENSORS[i], INPUT);
  pinMode(LEFT_PWM, OUTPUT);
  pinMode(RIGHT_PWM, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int weights[5] = {-2, -1, 0, 1, 2};
  int totalWeight = 0;
  int activeSensors = 0;

  for (int i = 0; i < 5; i++) {
    int val = digitalRead(SENSORS[i]);
    if (val == HIGH) {
      totalWeight += weights[i];
      activeSensors++;
    }
  }

  if (activeSensors > 0) {
    int error = totalWeight;
    int baseSpeed = 190;
    int turnKp = 35;
    
    int leftSpeed = baseSpeed + (error * turnKp);
    int rightSpeed = baseSpeed - (error * turnKp);
    
    analogWrite(LEFT_PWM, constrain(leftSpeed, 0, 255));
    analogWrite(RIGHT_PWM, constrain(rightSpeed, 0, 255));
  }
  delay(10);
}
`,
    defaultArenaId: 'arena_maze_line',
    specs: {
      topSpeedMps: 1.3,
      payloadCapacityGrams: 850,
      batteryCapacityMah: 2600,
      operatingVoltage: 7.4,
    },
  },
  {
    id: 'tmpl_arm_3dof',
    slug: '3dof-robotic-arm',
    name: '3-DOF Articulated Robotic Arm',
    type: 'ROBOTIC_ARM_3DOF',
    description: 'Precision articulated robotic manipulator arm with base pan, shoulder elevation, elbow flexion, and a two-finger pinch gripper.',
    difficulty: 'Intermediate',
    chassis: {
      typeId: 'chassis_arm_base',
      dimensionsMm: [140, 140, 60],
      massGrams: 320,
      material: 'Weighted Cast Steel & PLA',
    },
    mountPoints: [
      { id: 'mount_base_yaw', name: 'Base Turret (Yaw)', position: [0, 0.08, 0], rotation: [0, 0, 0], allowedTypes: ['servo_mg996r'] },
      { id: 'mount_shoulder', name: 'Shoulder Joint (Pitch)', position: [0, 0.25, 0], rotation: [0, 0, 0], allowedTypes: ['servo_mg996r'] },
      { id: 'mount_elbow', name: 'Elbow Joint (Pitch)', position: [0, 0.65, 0.3], rotation: [0, 0, 0], allowedTypes: ['servo_sg90'] },
      { id: 'mount_gripper', name: 'Gripper End-Effector', position: [0, 0.95, 0.6], rotation: [0, 0, 0], allowedTypes: ['servo_sg90'] },
    ],
    defaultParts: [
      { id: 'part_base_servo', componentId: 'servo_mg996r', name: 'MG996R Metal Gear Base Servo', mountPointId: 'mount_base_yaw', position: [0, 0.08, 0], rotation: [0, 0, 0], massGrams: 55 },
      { id: 'part_shoulder_servo', componentId: 'servo_mg996r', name: 'MG996R Shoulder Servo', mountPointId: 'mount_shoulder', position: [0, 0.25, 0], rotation: [0, 0, 0], massGrams: 55 },
      { id: 'part_elbow_servo', componentId: 'servo_sg90', name: 'SG90 Elbow Pitch Servo', mountPointId: 'mount_elbow', position: [0, 0.65, 0.3], rotation: [0, 0, 0], massGrams: 9 },
      { id: 'part_gripper_servo', componentId: 'servo_sg90', name: 'SG90 Gripper Clamp Servo', mountPointId: 'mount_gripper', position: [0, 0.95, 0.6], rotation: [0, 0, 0], massGrams: 9 },
    ],
    defaultCode: `// 3-DOF Arm Forward & Inverse Kinematics Controller
#include <Servo.h>

Servo baseYaw;
Servo shoulder;
Servo elbow;
Servo gripper;

void setup() {
  baseYaw.attach(3);
  shoulder.attach(5);
  elbow.attach(6);
  gripper.attach(9);
  
  // Home position
  baseYaw.write(90);
  shoulder.write(60);
  elbow.write(120);
  gripper.write(30);
  Serial.begin(9600);
}

void moveToCoordinates(float x, float y, float z) {
  // Analytical inverse kinematics
  float r = sqrt(x*x + y*y);
  float thetaBase = atan2(y, x) * 180.0 / PI;
  baseYaw.write(constrain(thetaBase, 0, 180));
  delay(400);
}

void loop() {
  // Automated pick and place demonstration
  gripper.write(60); // open claw
  delay(500);
  shoulder.write(40);
  delay(500);
  gripper.write(15); // grasp cargo
  delay(500);
  shoulder.write(80);
  delay(1000);
}
`,
    defaultArenaId: 'arena_delivery',
    specs: {
      topSpeedMps: 0.4,
      payloadCapacityGrams: 180,
      batteryCapacityMah: 1200,
      operatingVoltage: 6.0,
    },
  },
  {
    id: 'tmpl_hexapod',
    slug: 'hexapod-spider-walker',
    name: '12-Servo Hexapod Bio-Spider',
    type: 'HEXAPOD_WALKER',
    description: 'Multi-legged bio-mimetic hexapod capable of all-terrain crawling using alternating tripod gait wave generation.',
    difficulty: 'Advanced',
    chassis: {
      typeId: 'chassis_hexapod',
      dimensionsMm: [220, 260, 50],
      massGrams: 280,
      material: 'Carbon Fiber Reinforced Composite',
    },
    mountPoints: [
      { id: 'mount_mcu', name: 'MCU Mount (Center)', position: [0, 0.08, 0], rotation: [0, 0, 0], allowedTypes: ['arduino_mega', 'esp32_devkit'] },
      { id: 'mount_battery', name: 'High-Discharge LiPo (Underside)', position: [0, -0.05, 0], rotation: [0, 0, 0], allowedTypes: ['battery_18650'] },
    ],
    defaultParts: [
      { id: 'part_mcu', componentId: 'arduino_mega', name: 'Arduino Mega 2560 Pro', mountPointId: 'mount_mcu', position: [0, 0.08, 0], rotation: [0, 0, 0], massGrams: 37 },
      { id: 'part_bat', componentId: 'battery_18650', name: '7.4V 2S 30C LiPo Pack', mountPointId: 'mount_battery', position: [0, -0.05, 0], rotation: [0, 0, 0], massGrams: 110 },
    ],
    defaultCode: `// Hexapod Tripod Wave Gait Generator
#include <Servo.h>

// 6 Legs x 2 DOF (Coxa + Femur) = 12 Servos
// Tripod Group A: Legs 1, 3, 5
// Tripod Group B: Legs 2, 4, 6

void setup() {
  Serial.begin(115200);
  Serial.println("Hexapod Bio-Spider: Calibrating 12 servo joints...");
}

void loop() {
  // Phase 1: Swing Tripod A forward while Tripod B pushes back
  // Phase 2: Swing Tripod B forward while Tripod A pushes back
  Serial.println("[HEXAPOD] Executing Tripod Gait Crawl Cycle");
  delay(250);
}
`,
    defaultArenaId: 'arena_obstacle_course',
    specs: {
      topSpeedMps: 0.35,
      payloadCapacityGrams: 400,
      batteryCapacityMah: 2200,
      operatingVoltage: 7.4,
    },
  },
  {
    id: 'tmpl_quadcopter',
    slug: 'quadcopter-drone-x',
    name: 'Quadcopter AeroDrone X-4',
    type: 'QUADCOPTER',
    description: 'High-agility X-frame aerobatic drone with 4x 2212 920KV brushless motors, 1045 propellers, 30A ESCs, and 6-DOF gyro flight controller.',
    difficulty: 'Advanced',
    chassis: {
      typeId: 'chassis_quad_x',
      dimensionsMm: [450, 450, 80],
      massGrams: 280,
      material: '3K Carbon Fiber Matte Weave',
    },
    mountPoints: [
      { id: 'mount_fc', name: 'Flight Controller (Center)', position: [0, 0.04, 0], rotation: [0, 0, 0], allowedTypes: ['esp32_devkit', 'arduino_nano'] },
      { id: 'mount_motor_fl', name: 'Front-Left Motor (CW)', position: [-1.4, 0.08, 1.4], rotation: [0, 0, 0], allowedTypes: ['motor_bldc_2212'] },
      { id: 'mount_motor_fr', name: 'Front-Right Motor (CCW)', position: [1.4, 0.08, 1.4], rotation: [0, 0, 0], allowedTypes: ['motor_bldc_2212'] },
      { id: 'mount_motor_rl', name: 'Rear-Left Motor (CCW)', position: [-1.4, 0.08, -1.4], rotation: [0, 0, 0], allowedTypes: ['motor_bldc_2212'] },
      { id: 'mount_motor_rr', name: 'Rear-Right Motor (CW)', position: [1.4, 0.08, -1.4], rotation: [0, 0, 0], allowedTypes: ['motor_bldc_2212'] },
    ],
    defaultParts: [
      { id: 'part_fc', componentId: 'esp32_devkit', name: 'ESP32 Dual-Core Flight Controller', mountPointId: 'mount_fc', position: [0, 0.04, 0], rotation: [0, 0, 0], massGrams: 10 },
      { id: 'part_m1', componentId: 'motor_bldc_2212', name: '2212 920KV BLDC Motor (FL)', mountPointId: 'mount_motor_fl', position: [-1.4, 0.08, 1.4], rotation: [0, 0, 0], massGrams: 52 },
      { id: 'part_m2', componentId: 'motor_bldc_2212', name: '2212 920KV BLDC Motor (FR)', mountPointId: 'mount_motor_fr', position: [1.4, 0.08, 1.4], rotation: [0, 0, 0], massGrams: 52 },
      { id: 'part_m3', componentId: 'motor_bldc_2212', name: '2212 920KV BLDC Motor (RL)', mountPointId: 'mount_motor_rl', position: [-1.4, 0.08, -1.4], rotation: [0, 0, 0], massGrams: 52 },
      { id: 'part_m4', componentId: 'motor_bldc_2212', name: '2212 920KV BLDC Motor (RR)', mountPointId: 'mount_motor_rr', position: [1.4, 0.08, -1.4], rotation: [0, 0, 0], massGrams: 52 },
    ],
    defaultCode: `// Quadcopter X-Frame 4-Axis PID Flight Stabilization
#include <Wire.h>

float pitchTarget = 0, rollTarget = 0, yawTarget = 0;
float throttle = 1450; // Microseconds (1000-2000)

void setup() {
  Wire.begin();
  Serial.begin(115200);
  Serial.println("Quadcopter FC Online: Arming ESCs and stabilizing IMU...");
}

void loop() {
  // Read MPU-6050 accelerometer & gyro
  // Compute PID differential corrections for motors:
  // FL = Throttle + RollPID - PitchPID - YawPID
  // FR = Throttle - RollPID - PitchPID + YawPID
  // RL = Throttle + RollPID + PitchPID + YawPID
  // RR = Throttle - RollPID + PitchPID - YawPID
  delay(4); // 250 Hz control loop
}
`,
    defaultArenaId: 'arena_flat_ground',
    specs: {
      topSpeedMps: 14.5,
      payloadCapacityGrams: 650,
      batteryCapacityMah: 2200,
      operatingVoltage: 11.1,
    },
  },
];

export const ARENAS: ArenaDefinition[] = [
  {
    id: 'arena_flat_ground',
    name: '1. Flat Calibration Test Ground',
    terrainType: 'POLISHED_CONCRETE',
    description: 'Level frictionless calibration surface with 1m metric grid lines and dual slalom obstacle pylons for speed runs.',
    dimensions: [24, 24],
    gridDivisions: 24,
    obstacles: [
      { id: 'obs_cone_1', type: 'CONE', position: [-3, 0.4, 2], dimensions: [0.3, 0.8, 0.3], color: '#FF9A1F', isCollidable: true },
      { id: 'obs_cone_2', type: 'CONE', position: [3, 0.4, -2], dimensions: [0.3, 0.8, 0.3], color: '#FF9A1F', isCollidable: true },
      { id: 'obs_cone_3', type: 'CONE', position: [0, 0.4, 5], dimensions: [0.3, 0.8, 0.3], color: '#FF9A1F', isCollidable: true },
      { id: 'obs_cone_4', type: 'CONE', position: [0, 0.4, -5], dimensions: [0.3, 0.8, 0.3], color: '#FF9A1F', isCollidable: true },
    ],
    checkpoints: [
      { id: 'cp_1', name: 'Start Gate', position: [0, 0.2, -8], radius: 1.5 },
      { id: 'cp_2', name: 'Slalom 1', position: [-4, 0.2, 0], radius: 1.5 },
      { id: 'cp_3', name: 'Apex North', position: [0, 0.2, 8], radius: 1.5 },
      { id: 'cp_4', name: 'Slalom 2', position: [4, 0.2, 0], radius: 1.5 },
      { id: 'cp_5', name: 'Finish Line', position: [0, 0.2, -8], radius: 1.5 },
    ],
    bestScoreTimeSeconds: 18.4,
  },
  {
    id: 'arena_obstacle_course',
    name: '2. Obstacle Proving Ground',
    terrainType: 'ROUGH_TERRAIN',
    description: 'Challenging off-road proving course with dynamic boulder obstacles, elevation ramps, and tight chicanes testing sonar avoidance.',
    dimensions: [24, 24],
    gridDivisions: 24,
    obstacles: [
      { id: 'obs_cyl_1', type: 'CYLINDER', position: [3, 0.6, 2], dimensions: [1.1, 1.2, 1.1], color: '#FF9A1F', isCollidable: true },
      { id: 'obs_cyl_2', type: 'CYLINDER', position: [-3.5, 0.6, 3.5], dimensions: [1.3, 1.2, 1.3], color: '#FF9A1F', isCollidable: true },
      { id: 'obs_box_1', type: 'BOX', position: [0, 0.5, 5], dimensions: [2.5, 1.0, 1.2], color: '#FF3939', isCollidable: true },
      { id: 'obs_cyl_3', type: 'CYLINDER', position: [-2, 0.6, -3], dimensions: [1.0, 1.2, 1.0], color: '#FF9A1F', isCollidable: true },
      { id: 'obs_box_2', type: 'BOX', position: [4.5, 0.5, -3], dimensions: [1.8, 1.0, 2.0], color: '#FF3939', isCollidable: true },
      { id: 'obs_cyl_4', type: 'CYLINDER', position: [-5, 0.6, -1], dimensions: [1.2, 1.2, 1.2], color: '#FF9A1F', isCollidable: true },
    ],
    checkpoints: [
      { id: 'cp_obs_1', name: 'Checkpoint Alpha', position: [-6, 0.2, -6], radius: 1.8 },
      { id: 'cp_obs_2', name: 'Checkpoint Bravo', position: [6, 0.2, -4], radius: 1.8 },
      { id: 'cp_obs_3', name: 'Checkpoint Charlie', position: [4, 0.2, 6], radius: 1.8 },
      { id: 'cp_obs_4', name: 'Checkpoint Delta', position: [-5, 0.2, 5], radius: 1.8 },
    ],
    bestScoreTimeSeconds: 32.1,
  },
  {
    id: 'arena_maze_line',
    name: '3. Line Grid & Maze Arena',
    terrainType: 'TILED_LAB',
    description: 'High-contrast black track path printed on light tiles with hairpin curves, 90-degree corners, and dead-end maze barriers.',
    dimensions: [24, 24],
    gridDivisions: 24,
    lineTrackPath: [
      [-6, -6],
      [-6, 0],
      [-3, 4],
      [0, 6],
      [4, 4],
      [6, 0],
      [5, -4],
      [0, -5],
      [-4, -3],
      [-6, -6],
    ],
    obstacles: [
      { id: 'wall_1', type: 'BOX', position: [-2, 0.5, 0], dimensions: [0.3, 1.0, 5], color: '#1E4D38', isCollidable: true },
      { id: 'wall_2', type: 'BOX', position: [2, 0.5, -2], dimensions: [4, 1.0, 0.3], color: '#1E4D38', isCollidable: true },
      { id: 'wall_3', type: 'BOX', position: [3, 0.5, 2], dimensions: [0.3, 1.0, 4], color: '#1E4D38', isCollidable: true },
    ],
    checkpoints: [
      { id: 'cp_line_1', name: 'Lap Start', position: [-6, 0.2, -6], radius: 1.6 },
      { id: 'cp_line_2', name: 'Turn 1 Apex', position: [-3, 0.2, 4], radius: 1.6 },
      { id: 'cp_line_3', name: 'North Hairpin', position: [0, 0.2, 6], radius: 1.6 },
      { id: 'cp_line_4', name: 'East Straight', position: [6, 0.2, 0], radius: 1.6 },
      { id: 'cp_line_5', name: 'South Return', position: [0, 0.2, -5], radius: 1.6 },
    ],
    bestScoreTimeSeconds: 24.6,
  },
  {
    id: 'arena_delivery',
    name: '4. Autonomous Delivery & Pick-and-Place Arena',
    terrainType: 'WAREHOUSE_CONCRETE',
    description: 'Simulated smart warehouse logistics hub featuring dedicated pickup loading bays, transit pathways, and drop-off sorting bins.',
    dimensions: [24, 24],
    gridDivisions: 24,
    pickUpZone: { position: [-6, 0.05, -6], radius: 2.2 },
    dropOffZone: { position: [6, 0.05, 6], radius: 2.2 },
    obstacles: [
      { id: 'rack_1', type: 'BOX', position: [-4, 0.8, 1], dimensions: [4.5, 1.6, 1.2], color: '#0A84FF', isCollidable: true },
      { id: 'rack_2', type: 'BOX', position: [4, 0.8, -1], dimensions: [4.5, 1.6, 1.2], color: '#0A84FF', isCollidable: true },
      { id: 'conveyor', type: 'BOX', position: [0, 0.4, 0], dimensions: [1.2, 0.8, 6.0], color: '#39FF6A', isCollidable: true },
    ],
    checkpoints: [
      { id: 'cp_deliv_load', name: 'Loading Bay', position: [-6, 0.2, -6], radius: 2.0 },
      { id: 'cp_deliv_transit', name: 'Central Corridor', position: [0, 0.2, 3], radius: 2.0 },
      { id: 'cp_deliv_drop', name: 'Unload Target Pad', position: [6, 0.2, 6], radius: 2.0 },
    ],
    bestScoreTimeSeconds: 29.8,
  },
];
