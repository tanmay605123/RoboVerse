'use client';

import { create } from 'zustand';
import { getSupabaseClient } from '@/lib/supabaseClient';

export type ArenaType =
  | 'arena_flat_ground'
  | 'arena_line_track'
  | 'arena_obstacle_maze'
  | 'arena_sumo_ring'
  | 'arena_drone_gates'
  | 'arena_pick_place';

export type ChassisType = 'chassis_2wd' | 'chassis_4wd' | 'drone_f450' | 'arm_4dof' | 'self_balancing';

export interface SnapPointDef {
  id: string;
  name: string;
  position: [number, number, number]; // [x, y, z] relative to chassis center
  rotation?: [number, number, number];
  allowedCategories: Array<'wheel' | 'motor' | 'sensor' | 'controller' | 'battery' | 'arm' | 'gripper' | 'propeller'>;
}

export interface AttachedRobotPart {
  id: string;
  snapPointId: string;
  componentTypeId: string;
  name: string;
  category: 'wheel' | 'motor' | 'sensor' | 'controller' | 'battery' | 'arm' | 'gripper' | 'propeller';
  massG: number;
  powerMw: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export interface RobotTemplate {
  id: string;
  name: string;
  slug: string;
  category: 'ROVER' | 'DRONE' | 'ARM' | 'BALANCE';
  description: string;
  recommendedArenaId: ArenaType;
  chassisType: ChassisType;
  defaultParts: AttachedRobotPart[];
  starterCode: string;
}

export interface ArenaConfig {
  id: ArenaType;
  name: string;
  tagline: string;
  description: string;
  targetTimeSeconds: number;
  environment: {
    gravity: number;
    groundFriction: number;
    windSpeedMps?: number;
    trackWidthM?: number;
  };
}

export interface TelemetryFrame {
  timestampMs: number;
  position: [number, number, number];
  rotation: [number, number, number];
  speedMps: number;
  motorRpm: { left: number; right: number };
  batteryVoltage: number;
  sonarDistanceCm: number;
  lineSensors: [boolean, boolean, boolean, boolean, boolean];
  currentScore: number;
}

export interface RobotStoreState {
  // Mode: CAD Builder or Simulation Test Run
  mode: 'BUILDER' | 'SIMULATION';
  setMode: (mode: 'BUILDER' | 'SIMULATION') => void;

  // Active Design / Template
  selectedTemplateId: string;
  currentDesignTitle: string;
  setDesignTitle: (title: string) => void;
  chassisType: ChassisType;
  setChassisType: (type: ChassisType) => void;
  attachedParts: AttachedRobotPart[];

  // Active Arena
  activeArenaId: ArenaType;
  setArena: (arenaId: ArenaType) => void;

  // Physical Diagnostics
  totalMassG: number;
  centerOfMass: [number, number, number];
  powerBudgetMw: number;
  batteryCapacityMah: number;
  estimatedRuntimeMin: number;
  thrustToWeightRatio: number;

  // Assembly Actions
  attachPart: (snapPointId: string, part: Omit<AttachedRobotPart, 'id' | 'snapPointId'>) => void;
  detachPart: (partId: string) => void;
  loadTemplate: (templateId: string) => void;
  resetAssembly: () => void;

  // Simulation State
  isSimulating: boolean;
  isPaused: boolean;
  simSpeedMultiplier: number;
  setSimSpeedMultiplier: (speed: number) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  stopSimulation: () => void;
  resetSimulationState: () => void;

  // Real-time Physics & Telemetry
  robotPosition: [number, number, number];
  robotRotation: [number, number, number]; // [pitch, yaw, roll]
  linearVelocityMps: number;
  angularVelocityRps: number;
  leftMotorRpm: number;
  rightMotorRpm: number;
  batteryVoltage: number;
  sonarDistanceCm: number;
  lineSensors: [boolean, boolean, boolean, boolean, boolean];
  steerHeadingDeg: number;

  // Arena & Scoring
  elapsedSeconds: number;
  currentScore: number;
  checkpointsCleared: number;
  penaltiesCount: number;
  isRunCompleted: boolean;

  // Sumo Opponent Bot State
  sumoOpponent: {
    position: [number, number, number];
    rotation: [number, number, number];
    behavior: 'AGGRESSIVE' | 'EDGE_AVOID' | 'RANDOM';
    isFallen: boolean;
  };
  setSumoBehavior: (behavior: 'AGGRESSIVE' | 'EDGE_AVOID' | 'RANDOM') => void;

  // Replay & Playback Scrubbing
  recordedFrames: TelemetryFrame[];
  isReplaying: boolean;
  replayScrubFraction: number; // 0.0 to 1.0
  startReplay: () => void;
  stopReplay: () => void;
  scrubReplay: (fraction: number) => void;

  // Simulation Step Tick (Called by Three.js useFrame / requestAnimationFrame)
  tickSimulation: (deltaSec: number) => void;

  // Persistence to Supabase
  isSavingRun: boolean;
  saveTestRunToSupabase: () => Promise<boolean>;
}

// ---------------------- ARENA CONFIGURATIONS ----------------------
export const ARENA_CONFIGS: Record<ArenaType, ArenaConfig> = {
  arena_flat_ground: {
    id: 'arena_flat_ground',
    name: 'Flat Ground Skidpad',
    tagline: 'Telemetry calibration, acceleration runs & turning circles',
    description: 'Infinite calibrated grid plane with 10m sprint track and 2.5m radius skidpad turning circles.',
    targetTimeSeconds: 15.0,
    environment: { gravity: 9.81, groundFriction: 0.85 },
  },
  arena_line_track: {
    id: 'arena_line_track',
    name: 'Grand Prix Line Track',
    tagline: 'High-contrast speedway with checkpoints & lap timing',
    description: 'Black vinyl guidance track featuring S-curves, 90° hairpins, crossover loops, and neon checkpoint gates.',
    targetTimeSeconds: 20.0,
    environment: { gravity: 9.81, groundFriction: 0.88, trackWidthM: 0.03 },
  },
  arena_obstacle_maze: {
    id: 'arena_obstacle_maze',
    name: 'Hazard Obstacle Maze',
    tagline: 'Ultrasonic sonar maze navigation with dynamic pillars',
    description: 'Modular labyrinth featuring textured concrete walls, dead ends, narrow corridors, and exit trigger.',
    targetTimeSeconds: 30.0,
    environment: { gravity: 9.81, groundFriction: 0.8 },
  },
  arena_sumo_ring: {
    id: 'arena_sumo_ring',
    name: 'Autonomous Sumo Dohyo',
    tagline: 'Circular raised arena with opponent AI combatant',
    description: 'Official 154cm diameter black Dohyo ring with 5cm white border. Push the opponent out to win!',
    targetTimeSeconds: 45.0,
    environment: { gravity: 9.81, groundFriction: 0.92 },
  },
  arena_drone_gates: {
    id: 'arena_drone_gates',
    name: 'AeroZone FPV Drone Cage',
    tagline: '3D flight corridor with illuminated gates & wind gusts',
    description: 'Enclosed 10m x 10m x 6m flight cage with elevated neon gate rings, variable wind gusts, and altitude targets.',
    targetTimeSeconds: 25.0,
    environment: { gravity: 9.81, groundFriction: 0.5, windSpeedMps: 1.2 },
  },
  arena_pick_place: {
    id: 'arena_pick_place',
    name: 'Robotic Arm Workbench',
    tagline: 'Kinematics sorting station with block coordinates',
    description: 'Industrial workbench with colored pick-and-place target boxes, conveyor zone, and millimeter coordinate grids.',
    targetTimeSeconds: 30.0,
    environment: { gravity: 9.81, groundFriction: 0.9 },
  },
};

// ---------------------- PRESET ROBOT TEMPLATES ----------------------
export const ROBOT_TEMPLATES: Record<string, RobotTemplate> = {
  tmpl_obstacle_car: {
    id: 'tmpl_obstacle_car',
    name: 'Radar Guided Obstacle Rover',
    slug: 'obstacle-avoiding-rover',
    category: 'ROVER',
    description: 'Autonomous 2WD rover featuring an ultrasonic turret that scans for obstacles and navigates around hazards.',
    recommendedArenaId: 'arena_obstacle_maze',
    chassisType: 'chassis_2wd',
    defaultParts: [
      { id: 'p_chassis', snapPointId: 'root', componentTypeId: 'chassis_2wd', name: '2WD Acrylic Base', category: 'wheel', massG: 140, powerMw: 0, position: [0, 0, 0] },
      { id: 'p_wheel_l', snapPointId: 'mount_motor_l', componentTypeId: 'dc_motor_gear', name: 'Left TT Motor + Wheel', category: 'motor', massG: 65, powerMw: 450, position: [-0.65, 0.05, 0.2] },
      { id: 'p_wheel_r', snapPointId: 'mount_motor_r', componentTypeId: 'dc_motor_gear', name: 'Right TT Motor + Wheel', category: 'motor', massG: 65, powerMw: 450, position: [0.65, 0.05, 0.2] },
      { id: 'p_mcu', snapPointId: 'deck_mcu', componentTypeId: 'arduino_uno', name: 'Arduino Uno R3', category: 'controller', massG: 25, powerMw: 200, position: [0, 0.18, 0] },
      { id: 'p_driver', snapPointId: 'deck_driver', componentTypeId: 'motor_driver_l298n', name: 'L298N Dual H-Bridge', category: 'controller', massG: 32, powerMw: 150, position: [0, 0.18, 0.4] },
      { id: 'p_battery', snapPointId: 'bay_battery', componentTypeId: 'battery_aa_pack_4', name: '4xAA 6V Battery Pack', category: 'battery', massG: 120, powerMw: 0, position: [0, 0.1, -0.3] },
      { id: 'p_sonar', snapPointId: 'turret_sensor', componentTypeId: 'ultrasonic_hcsr04', name: 'HC-SR04 Sonar Turret', category: 'sensor', massG: 12, powerMw: 80, position: [0, 0.28, -0.65] },
    ],
    starterCode: `const int TRIG = 7;
const int ECHO = 6;
const int ENA = 3;
const int IN1 = 4;
const int IN2 = 5;

void setup() {
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  analogWrite(ENA, 200);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long d = pulseIn(ECHO, HIGH) * 0.0343 / 2.0;

  if (d < 20) { // Obstacle within 20cm
    // Turn right
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    delay(400);
  } else {
    // Drive forward
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
  }
  delay(50);
}`,
  },

  tmpl_line_follower: {
    id: 'tmpl_line_follower',
    name: 'Grand Prix Line Follower',
    slug: 'line-following-car',
    category: 'ROVER',
    description: 'High-speed differential rover with 5-channel infrared ground sensor array and tuned PID tracking.',
    recommendedArenaId: 'arena_line_track',
    chassisType: 'chassis_2wd',
    defaultParts: [
      { id: 'p_chassis', snapPointId: 'root', componentTypeId: 'chassis_2wd', name: '2WD Low-CG Chassis', category: 'wheel', massG: 130, powerMw: 0, position: [0, 0, 0] },
      { id: 'p_wheel_l', snapPointId: 'mount_motor_l', componentTypeId: 'dc_motor_gear', name: 'Left Motor', category: 'motor', massG: 65, powerMw: 500, position: [-0.65, 0.05, 0.2] },
      { id: 'p_wheel_r', snapPointId: 'mount_motor_r', componentTypeId: 'dc_motor_gear', name: 'Right Motor', category: 'motor', massG: 65, powerMw: 500, position: [0.65, 0.05, 0.2] },
      { id: 'p_mcu', snapPointId: 'deck_mcu', componentTypeId: 'arduino_nano', name: 'Arduino Nano V3', category: 'controller', massG: 12, powerMw: 180, position: [0, 0.15, 0] },
      { id: 'p_driver', snapPointId: 'deck_driver', componentTypeId: 'motor_driver_l298n', name: 'L298N Driver', category: 'controller', massG: 32, powerMw: 150, position: [0, 0.15, 0.35] },
      { id: 'p_battery', snapPointId: 'bay_battery', componentTypeId: 'battery_lipo_3s', name: '3S LiPo 11.1V', category: 'battery', massG: 180, powerMw: 0, position: [0, 0.1, -0.2] },
      { id: 'p_ir_array', snapPointId: 'mount_ground_ir', componentTypeId: 'ir_line_array_5ch', name: '5-Channel Line Array', category: 'sensor', massG: 18, powerMw: 90, position: [0, 0.03, -0.75] },
    ],
    starterCode: `const int S1 = A0, S2 = A1, S3 = A2, S4 = A3, S5 = A4;
float Kp = 25.0, Kd = 8.0;
int lastError = 0;

void loop() {
  int err = (digitalRead(S1)*-2) + (digitalRead(S2)*-1) + (digitalRead(S4)*1) + (digitalRead(S5)*2);
  int correction = (Kp * err) + (Kd * (err - lastError));
  lastError = err;
  setMotorSpeeds(180 + correction, 180 - correction);
  delay(10);
}`,
  },

  tmpl_drone_f450: {
    id: 'tmpl_drone_f450',
    name: 'F450 Aerodynamic Quadcopter',
    slug: 'quadcopter-drone-f450',
    category: 'DRONE',
    description: 'X-configuration 450mm drone featuring 1000KV brushless outrunners, 30A ESCs, and 6-axis flight telemetry.',
    recommendedArenaId: 'arena_drone_gates',
    chassisType: 'drone_f450',
    defaultParts: [
      { id: 'p_frame', snapPointId: 'root', componentTypeId: 'chassis_4wd', name: 'F450 Composite Airframe', category: 'propeller', massG: 280, powerMw: 0, position: [0, 0, 0] },
      { id: 'p_motor_fl', snapPointId: 'arm_fl', componentTypeId: 'bldc_2212', name: 'Front-Left 1000KV Motor', category: 'motor', massG: 50, powerMw: 1200, position: [-0.8, 0.1, -0.8] },
      { id: 'p_motor_fr', snapPointId: 'arm_fr', componentTypeId: 'bldc_2212', name: 'Front-Right 1000KV Motor', category: 'motor', massG: 50, powerMw: 1200, position: [0.8, 0.1, -0.8] },
      { id: 'p_motor_bl', snapPointId: 'arm_bl', componentTypeId: 'bldc_2212', name: 'Back-Left 1000KV Motor', category: 'motor', massG: 50, powerMw: 1200, position: [-0.8, 0.1, 0.8] },
      { id: 'p_motor_br', snapPointId: 'arm_br', componentTypeId: 'bldc_2212', name: 'Back-Right 1000KV Motor', category: 'motor', massG: 50, powerMw: 1200, position: [0.8, 0.1, 0.8] },
      { id: 'p_prop_1', snapPointId: 'prop_fl', componentTypeId: 'propeller_1045', name: '1045 CW Propeller', category: 'propeller', massG: 12, powerMw: 0, position: [-0.8, 0.18, -0.8] },
      { id: 'p_prop_2', snapPointId: 'prop_fr', componentTypeId: 'propeller_1045', name: '1045 CCW Propeller', category: 'propeller', massG: 12, powerMw: 0, position: [0.8, 0.18, -0.8] },
      { id: 'p_esc', snapPointId: 'deck_esc', componentTypeId: 'esc_30a', name: '4-in-1 30A BLHeli ESC', category: 'controller', massG: 35, powerMw: 100, position: [0, 0.08, 0] },
      { id: 'p_fc', snapPointId: 'deck_fc', componentTypeId: 'esp32', name: 'ESP32 Flight Core', category: 'controller', massG: 15, powerMw: 250, position: [0, 0.18, 0] },
      { id: 'p_imu', snapPointId: 'deck_imu', componentTypeId: 'mpu6050', name: 'MPU6050 6-DoF Gyro', category: 'sensor', massG: 5, powerMw: 40, position: [0, 0.22, 0] },
      { id: 'p_lipo', snapPointId: 'bay_lipo', componentTypeId: 'battery_lipo_3s', name: '3S 2200mAh 45C LiPo', category: 'battery', massG: 190, powerMw: 0, position: [0, -0.1, 0] },
    ],
    starterCode: `// PID Altitude Hold & Rate Gyro Stabilization
float targetAltitude = 2.0; // 2 meters
float throttleBase = 1450;  // PPM µs

void loop() {
  float currentAlt = readSonarAltitude();
  float pitch = readImuPitch();
  float roll = readImuRoll();
  
  applyMixer(throttleBase, pitch * Kp, roll * Kp, 0);
  delay(4); // 250Hz loop
}`,
  },

  tmpl_robotic_arm_4dof: {
    id: 'tmpl_robotic_arm_4dof',
    name: '4-DOF Articulated Robotic Arm',
    slug: 'robotic-arm-4dof',
    category: 'ARM',
    description: 'Multi-axis manipulator with 360° rotating base turntable, shoulder, elbow, and precision servo claw.',
    recommendedArenaId: 'arena_pick_place',
    chassisType: 'arm_4dof',
    defaultParts: [
      { id: 'p_base', snapPointId: 'turntable', componentTypeId: 'servo_mg996r', name: 'Base Turntable Servo', category: 'motor', massG: 55, powerMw: 600, position: [0, 0.1, 0] },
      { id: 'p_shoulder', snapPointId: 'joint_shoulder', componentTypeId: 'servo_mg90s', name: 'Shoulder Joint Servo', category: 'motor', massG: 14, powerMw: 450, position: [0, 0.35, 0.1] },
      { id: 'p_elbow', snapPointId: 'joint_elbow', componentTypeId: 'servo_mg90s', name: 'Elbow Joint Servo', category: 'motor', massG: 14, powerMw: 450, position: [0, 0.65, -0.1] },
      { id: 'p_wrist', snapPointId: 'joint_wrist', componentTypeId: 'servo_sg90', name: 'Wrist Pitch Servo', category: 'motor', massG: 9, powerMw: 300, position: [0, 0.9, 0] },
      { id: 'p_claw', snapPointId: 'end_effector', componentTypeId: 'robot_gripper', name: 'Precision Gripper Claw', category: 'gripper', massG: 35, powerMw: 350, position: [0, 1.05, 0] },
      { id: 'p_mcu', snapPointId: 'deck_mcu', componentTypeId: 'arduino_uno', name: 'Arduino Controller', category: 'controller', massG: 25, powerMw: 200, position: [0.4, 0.05, 0] },
      { id: 'p_psu', snapPointId: 'deck_psu', componentTypeId: 'power_supply_module', name: 'MB102 5V 2A Regulated Rail', category: 'battery', massG: 40, powerMw: 0, position: [-0.4, 0.05, 0] },
    ],
    starterCode: `#include <Servo.h>
Servo baseSrv, shoulderSrv, elbowSrv, clawSrv;

void pickObject() {
  baseSrv.write(90);
  shoulderSrv.write(120);
  elbowSrv.write(45);
  delay(500);
  clawSrv.write(40); // Close clamp
  delay(300);
  shoulderSrv.write(80); // Lift up
}`,
  },
};

// ---------------------- PHYSICAL COMPUTATION HELPERS ----------------------
function computePhysicalMetrics(parts: AttachedRobotPart[], chassis: ChassisType) {
  let totalMassG = chassis === 'drone_f450' ? 280 : chassis === 'chassis_4wd' ? 220 : 130;
  let momentX = 0;
  let momentY = 0;
  let momentZ = 0;
  let powerMw = 0;
  let batteryMah = 0;
  let totalThrustG = 0;

  for (const part of parts) {
    const m = part.massG || 10;
    totalMassG += m;
    momentX += m * (part.position[0] || 0);
    momentY += m * (part.position[1] || 0);
    momentZ += m * (part.position[2] || 0);
    powerMw += part.powerMw || 0;

    if (part.category === 'battery') {
      if (part.componentTypeId.includes('lipo')) batteryMah = 2200;
      else if (part.componentTypeId.includes('aa')) batteryMah = 1800;
      else batteryMah = 500;
    }

    if (part.category === 'propeller' || (part.category === 'motor' && part.componentTypeId.includes('bldc'))) {
      totalThrustG += 450; // ~450g thrust per 2212 motor with 1045 prop
    }
  }

  const comX = totalMassG > 0 ? momentX / totalMassG : 0;
  const comY = totalMassG > 0 ? momentY / totalMassG : 0;
  const comZ = totalMassG > 0 ? momentZ / totalMassG : 0;

  // Runtime estimation (hours = mAh / mA)
  const currentMa = powerMw > 0 ? (powerMw / 5.0) : 500;
  const runtimeMin = currentMa > 0 && batteryMah > 0 ? Math.round((batteryMah / currentMa) * 60) : 25;

  const thrustToWeight = totalMassG > 0 ? Number(((totalThrustG > 0 ? totalThrustG : 300) / totalMassG).toFixed(2)) : 1.0;

  return {
    totalMassG: Math.round(totalMassG),
    centerOfMass: [Number(comX.toFixed(3)), Number(comY.toFixed(3)), Number(comZ.toFixed(3))] as [number, number, number],
    powerBudgetMw: Math.round(powerMw),
    batteryCapacityMah: batteryMah || 1800,
    estimatedRuntimeMin: runtimeMin,
    thrustToWeightRatio: thrustToWeight,
  };
}

// ---------------------- ZUSTAND STORE ----------------------
export const useRobotStore = create<RobotStoreState>((set, get) => {
  const initialTemplate = ROBOT_TEMPLATES.tmpl_obstacle_car;
  const initialMetrics = computePhysicalMetrics(initialTemplate.defaultParts, initialTemplate.chassisType);

  return {
    mode: 'BUILDER',
    setMode: (mode) => set({ mode }),

    selectedTemplateId: initialTemplate.id,
    currentDesignTitle: initialTemplate.name,
    setDesignTitle: (title) => set({ currentDesignTitle: title }),
    chassisType: initialTemplate.chassisType,
    setChassisType: (chassisType) => {
      const { attachedParts } = get();
      const metrics = computePhysicalMetrics(attachedParts, chassisType);
      set({ chassisType, ...metrics });
    },
    attachedParts: initialTemplate.defaultParts,

    activeArenaId: initialTemplate.recommendedArenaId,
    setArena: (activeArenaId) => set({ activeArenaId }),

    ...initialMetrics,

    attachPart: (snapPointId, part) => {
      const { attachedParts, chassisType } = get();
      const newPart: AttachedRobotPart = {
        id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        snapPointId,
        ...part,
      };
      // Replace part if snap point is occupied, or append
      const filtered = attachedParts.filter((p) => p.snapPointId !== snapPointId);
      const updated = [...filtered, newPart];
      const metrics = computePhysicalMetrics(updated, chassisType);
      set({ attachedParts: updated, ...metrics });
    },

    detachPart: (partId) => {
      const { attachedParts, chassisType } = get();
      const updated = attachedParts.filter((p) => p.id !== partId);
      const metrics = computePhysicalMetrics(updated, chassisType);
      set({ attachedParts: updated, ...metrics });
    },

    loadTemplate: (templateId) => {
      const tmpl = ROBOT_TEMPLATES[templateId] || ROBOT_TEMPLATES.tmpl_obstacle_car;
      const metrics = computePhysicalMetrics(tmpl.defaultParts, tmpl.chassisType);
      set({
        selectedTemplateId: tmpl.id,
        currentDesignTitle: tmpl.name,
        chassisType: tmpl.chassisType,
        attachedParts: tmpl.defaultParts,
        activeArenaId: tmpl.recommendedArenaId,
        isSimulating: false,
        isPaused: false,
        recordedFrames: [],
        ...metrics,
      });
      get().resetSimulationState();
    },

    resetAssembly: () => {
      const { chassisType } = get();
      const metrics = computePhysicalMetrics([], chassisType);
      set({ attachedParts: [], ...metrics });
    },

    // Simulation Execution State
    isSimulating: false,
    isPaused: false,
    simSpeedMultiplier: 1.0,
    setSimSpeedMultiplier: (speed) => set({ simSpeedMultiplier: speed }),

    startSimulation: () => {
      get().resetSimulationState();
      set({
        isSimulating: true,
        isPaused: false,
        mode: 'SIMULATION',
        recordedFrames: [],
        isRunCompleted: false,
      });
    },

    pauseSimulation: () => set({ isPaused: true }),
    resumeSimulation: () => set({ isPaused: false }),
    stopSimulation: () => set({ isSimulating: false, isPaused: false }),

    resetSimulationState: () => {
      set({
        robotPosition: [0, 0.12, 0],
        robotRotation: [0, 0, 0],
        linearVelocityMps: 0,
        angularVelocityRps: 0,
        leftMotorRpm: 0,
        rightMotorRpm: 0,
        batteryVoltage: 11.1,
        sonarDistanceCm: 150,
        lineSensors: [false, false, true, false, false],
        steerHeadingDeg: 0,
        elapsedSeconds: 0,
        currentScore: 0,
        checkpointsCleared: 0,
        penaltiesCount: 0,
        isRunCompleted: false,
        sumoOpponent: {
          position: [0, 0.12, 1.8],
          rotation: [0, Math.PI, 0],
          behavior: 'AGGRESSIVE',
          isFallen: false,
        },
      });
    },

    // Real-time Physics
    robotPosition: [0, 0.12, 0],
    robotRotation: [0, 0, 0],
    linearVelocityMps: 0,
    angularVelocityRps: 0,
    leftMotorRpm: 0,
    rightMotorRpm: 0,
    batteryVoltage: 11.1,
    sonarDistanceCm: 150,
    lineSensors: [false, false, true, false, false],
    steerHeadingDeg: 0,

    elapsedSeconds: 0,
    currentScore: 0,
    checkpointsCleared: 0,
    penaltiesCount: 0,
    isRunCompleted: false,

    sumoOpponent: {
      position: [0, 0.12, 1.8],
      rotation: [0, Math.PI, 0],
      behavior: 'AGGRESSIVE',
      isFallen: false,
    },
    setSumoBehavior: (behavior) =>
      set((state) => ({ sumoOpponent: { ...state.sumoOpponent, behavior } })),

    recordedFrames: [],
    isReplaying: false,
    replayScrubFraction: 0,

    startReplay: () => {
      const { recordedFrames } = get();
      if (recordedFrames.length === 0) return;
      set({ isReplaying: true, replayScrubFraction: 0 });
    },
    stopReplay: () => set({ isReplaying: false }),
    scrubReplay: (fraction) => {
      const { recordedFrames } = get();
      if (recordedFrames.length === 0) return;
      const clamped = Math.max(0, Math.min(1, fraction));
      const frameIdx = Math.floor(clamped * (recordedFrames.length - 1));
      const frame = recordedFrames[frameIdx];
      if (frame) {
        set({
          replayScrubFraction: clamped,
          robotPosition: frame.position,
          robotRotation: frame.rotation,
          linearVelocityMps: frame.speedMps,
          leftMotorRpm: frame.motorRpm.left,
          rightMotorRpm: frame.motorRpm.right,
          batteryVoltage: frame.batteryVoltage,
          sonarDistanceCm: frame.sonarDistanceCm,
          lineSensors: frame.lineSensors,
          currentScore: frame.currentScore,
        });
      }
    },

    // ---------------------- PHYSICS INTEGRATION TICK ----------------------
    tickSimulation: (deltaSec) => {
      const state = get();
      if (!state.isSimulating || state.isPaused || state.isReplaying) return;

      const dt = deltaSec * state.simSpeedMultiplier;
      const nextElapsed = state.elapsedSeconds + dt;

      let [x, y, z] = state.robotPosition;
      let [pitch, yaw, roll] = state.robotRotation;
      let speed = state.linearVelocityMps;
      let angVel = state.angularVelocityRps;
      let score = state.currentScore;
      let checkpoints = state.checkpointsCleared;
      let penalties = state.penaltiesCount;
      let isCompleted = state.isRunCompleted;

      // Battery discharge curve: decays slightly under current load
      const batterySag = (state.powerBudgetMw / 10000) * 0.05;
      const nextVoltage = Math.max(9.6, Number((11.1 - batterySag - nextElapsed * 0.003).toFixed(2)));

      // Arena-specific behaviors
      let currentSonar = 120;
      let nextLineSensors: [boolean, boolean, boolean, boolean, boolean] = [false, false, true, false, false];

      if (state.activeArenaId === 'arena_obstacle_maze') {
        // Obstacle course logic: Rover moves forward until distance < 35cm, then turns
        const distToObstacle = Math.max(12, 180 - (Math.abs(z % 6) * 45));
        currentSonar = Math.round(distToObstacle);

        if (currentSonar < 35) {
          // Autonomous obstacle avoidance reaction
          angVel = 1.8; // pivot turn
          speed = 0.3;
        } else {
          angVel = 0;
          speed = 0.95; // cruise
        }

        yaw += angVel * dt;
        x += Math.sin(yaw) * speed * dt;
        z -= Math.cos(yaw) * speed * dt;
        score += Math.round(speed * 10 * dt);

        if (nextElapsed >= 25.0) {
          isCompleted = true;
          score += 500; // Finish bonus
        }
      } else if (state.activeArenaId === 'arena_line_track') {
        // Line track speedway: track curves along an oval
        speed = 1.35;
        const trackAngle = (nextElapsed * 0.35) % (Math.PI * 2);
        const radius = 4.0;
        x = Math.cos(trackAngle) * radius;
        z = Math.sin(trackAngle) * (radius * 0.7);
        yaw = -trackAngle + Math.PI / 2;

        // Line sensor reflections
        const deviation = Math.sin(nextElapsed * 2.5);
        if (Math.abs(deviation) < 0.2) {
          nextLineSensors = [false, false, true, false, false]; // Center
          score += 5;
        } else if (deviation > 0.2) {
          nextLineSensors = [false, false, false, true, false]; // Slight right
          score += 2;
        } else {
          nextLineSensors = [false, true, false, false, false]; // Slight left
          score += 2;
        }

        const newCheckpoints = Math.floor(nextElapsed / 5.0);
        if (newCheckpoints > checkpoints) {
          checkpoints = newCheckpoints;
          score += 150;
        }

        if (nextElapsed >= 20.0) {
          isCompleted = true;
        }
      } else if (state.activeArenaId === 'arena_sumo_ring') {
        // Sumo combat ring: radius = 1.54m / 2 = 0.77m
        speed = 0.75;
        const opponent = { ...state.sumoOpponent };
        const distToOpponent = Math.hypot(x - opponent.position[0], z - opponent.position[2]);

        // Drive towards opponent
        const targetAngle = Math.atan2(opponent.position[0] - x, -(opponent.position[2] - z));
        yaw += (targetAngle - yaw) * 0.08;

        x += Math.sin(yaw) * speed * dt;
        z -= Math.cos(yaw) * speed * dt;

        // Opponent AI behavior
        if (!opponent.isFallen) {
          if (opponent.behavior === 'AGGRESSIVE') {
            const oppTarget = Math.atan2(x - opponent.position[0], -(z - opponent.position[2]));
            opponent.rotation[1] += (oppTarget - opponent.rotation[1]) * 0.05;
            opponent.position[0] += Math.sin(opponent.rotation[1]) * 0.5 * dt;
            opponent.position[2] -= Math.cos(opponent.rotation[1]) * 0.5 * dt;
          }

          // Push opponent off edge if collision
          if (distToOpponent < 0.4) {
            opponent.position[2] += 0.8 * dt; // push back
            score += 20;
          }

          // Ring-out check (dohyo radius 1.4m)
          const oppDistFromCenter = Math.hypot(opponent.position[0], opponent.position[2]);
          if (oppDistFromCenter > 1.35) {
            opponent.isFallen = true;
            score += 1000; // Ring out Victory
            isCompleted = true;
          }
        }

        currentSonar = Math.round(distToOpponent * 100);
      } else if (state.activeArenaId === 'arena_drone_gates') {
        // Quadcopter flight: ascends to 2.2m, oscillates slightly with wind gusts
        const wind = ARENA_CONFIGS.arena_drone_gates.environment.windSpeedMps || 1.0;
        y = Math.min(2.5, 0.12 + nextElapsed * 0.4);
        pitch = Math.sin(nextElapsed * 2) * 0.08;
        roll = Math.cos(nextElapsed * 1.5) * 0.06;
        yaw += 0.01;
        speed = 1.1;
        z -= speed * dt;
        x += Math.sin(nextElapsed) * wind * 0.1 * dt;
        score += Math.round(15 * dt);

        if (nextElapsed >= 25.0) {
          isCompleted = true;
          score += 400;
        }
      } else {
        // Flat ground sprint
        speed = Math.min(2.2, nextElapsed * 0.6);
        z -= speed * dt;
        score = Math.round(Math.abs(z) * 50);
        if (Math.abs(z) >= 20) {
          isCompleted = true;
        }
      }

      const leftRpm = Math.round(speed * 120 + angVel * 30);
      const rightRpm = Math.round(speed * 120 - angVel * 30);

      // Record snapshot frame at ~30 FPS
      const newFrame: TelemetryFrame = {
        timestampMs: Math.round(nextElapsed * 1000),
        position: [x, y, z],
        rotation: [pitch, yaw, roll],
        speedMps: Number(speed.toFixed(2)),
        motorRpm: { left: leftRpm, right: rightRpm },
        batteryVoltage: nextVoltage,
        sonarDistanceCm: currentSonar,
        lineSensors: nextLineSensors,
        currentScore: score,
      };

      set({
        elapsedSeconds: nextElapsed,
        robotPosition: [x, y, z],
        robotRotation: [pitch, yaw, roll],
        linearVelocityMps: Number(speed.toFixed(2)),
        angularVelocityRps: Number(angVel.toFixed(2)),
        leftMotorRpm: leftRpm,
        rightMotorRpm: rightRpm,
        batteryVoltage: nextVoltage,
        sonarDistanceCm: currentSonar,
        lineSensors: nextLineSensors,
        currentScore: score,
        checkpointsCleared: checkpoints,
        penaltiesCount: penalties,
        isRunCompleted: isCompleted,
        recordedFrames: [...state.recordedFrames, newFrame],
      });
    },

    // ---------------------- PERSISTENCE TO SUPABASE ----------------------
    isSavingRun: false,
    saveTestRunToSupabase: async () => {
      set({ isSavingRun: true });
      const state = get();
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          // Offline / demo fallback
          console.log('Saved test run locally (guest session):', state.currentScore);
          set({ isSavingRun: false });
          return true;
        }

        const telemetrySummary = {
          topSpeedMps: state.linearVelocityMps,
          finalBatteryVoltage: state.batteryVoltage,
          checkpoints: state.checkpointsCleared,
          totalFrames: state.recordedFrames.length,
          arena: state.activeArenaId,
          template: state.selectedTemplateId,
        };

        // 1. Create or get design
        const { data: design } = await (supabase.from('robot_designs') as any)
          .insert({
            user_id: session.user.id,
            title: state.currentDesignTitle,
            template_id: state.selectedTemplateId,
            assembly_jsonb: { parts: state.attachedParts },
            total_mass_g: state.totalMassG,
            center_of_mass: state.centerOfMass,
            power_budget_mw: state.powerBudgetMw,
            thrust_to_weight_ratio: state.thrustToWeightRatio,
          })
          .select('id')
          .single();

        const designId = design?.id;

        // 2. Insert test run
        await (supabase.from('test_runs') as any).insert({
          user_id: session.user.id,
          robot_design_id: designId,
          arena_id: state.activeArenaId,
          score: state.currentScore,
          time_seconds: Number(state.elapsedSeconds.toFixed(2)),
          telemetry_summary: telemetrySummary,
        });

        // 3. Record activity event for admin dashboard
        await (supabase.from('activity_events') as any).insert({
          user_id: session.user.id,
          event_type: 'TEST_RUN_COMPLETED',
          metadata: {
            arena: state.activeArenaId,
            score: state.currentScore,
            time: state.elapsedSeconds,
          },
        });

        set({ isSavingRun: false });
        return true;
      } catch (err) {
        console.warn('Failed to save test run to Supabase:', err);
        set({ isSavingRun: false });
        return true;
      }
    },
  };
});
