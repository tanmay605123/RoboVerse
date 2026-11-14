export type RobotType =
  | 'ROVER_2WD'
  | 'ROVER_4WD'
  | 'ROBOTIC_ARM_3DOF'
  | 'HEXAPOD_WALKER'
  | 'QUADCOPTER';

export type ArenaId =
  | 'arena_flat_ground'
  | 'arena_obstacle_course'
  | 'arena_maze_line'
  | 'arena_delivery';

export interface MountPoint {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  allowedTypes: string[];
}

export interface AttachedPart {
  id: string;
  componentId: string;
  name: string;
  mountPointId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  massGrams: number;
  properties?: Record<string, any>;
}

export interface PhysicalMetrics {
  totalMassGrams: number;
  centerOfMass: [number, number, number]; // [x, y, z] relative to chassis origin
  weightDistribution: {
    frontPct: number;
    rearPct: number;
    leftPct: number;
    rightPct: number;
  };
  stabilityScore: number; // 0 to 100
  estimatedBatteryLifeMinutes: number;
}

export interface RobotTemplate {
  id: string;
  slug: string;
  name: string;
  type: RobotType;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  chassis: {
    typeId: string;
    dimensionsMm: [number, number, number];
    massGrams: number;
    material: string;
  };
  mountPoints: MountPoint[];
  defaultParts: AttachedPart[];
  defaultCode: string;
  defaultArenaId: ArenaId;
  specs: {
    topSpeedMps: number;
    payloadCapacityGrams: number;
    batteryCapacityMah: number;
    operatingVoltage: number;
  };
}

export interface ArenaObstacle {
  id: string;
  type: 'CYLINDER' | 'BOX' | 'CONE' | 'RAMP';
  position: [number, number, number];
  dimensions: [number, number, number]; // [w, h, d] or [radius, height, radius]
  color?: string;
  isCollidable: boolean;
}

export interface ArenaCheckpoint {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  passed?: boolean;
}

export interface ArenaDefinition {
  id: ArenaId;
  name: string;
  terrainType: string;
  description: string;
  dimensions: [number, number]; // [width, length] in meters
  gridDivisions: number;
  obstacles: ArenaObstacle[];
  checkpoints: ArenaCheckpoint[];
  lineTrackPath?: Array<[number, number]>; // 2D points along track (x, z)
  pickUpZone?: { position: [number, number, number]; radius: number };
  dropOffZone?: { position: [number, number, number]; radius: number };
  bestScoreTimeSeconds?: number;
}

export interface LiveTelemetryFrame {
  timestampMs: number;
  speedMps: number;
  motorCurrentMa: number;
  batteryVolts: number;
  batteryPct: number;
  sonarDistanceCm: number;
  irLineSensors: [boolean, boolean, boolean, boolean, boolean]; // 5 channels
  headingRad: number;
  pitchRad: number;
  rollRad: number;
  altitudeM: number;
  position?: [number, number, number];
  velocity?: [number, number, number];
  armJointAnglesDeg?: [number, number, number, number]; // [yaw, shoulder, elbow, gripper]
  score: number;
  durationSeconds: number;
  checkpointsCleared: number;
  totalCheckpoints: number;
}

export interface TestRunRecord {
  id: string;
  userId: string;
  robotTemplateId: string;
  arenaId: ArenaId;
  score: number;
  durationSeconds: number;
  passed: boolean;
  stars: number; // 1, 2, or 3
  telemetrySummary: {
    avgSpeedMps: number;
    maxSpeedMps: number;
    minSonarDistanceCm: number;
    batteryConsumedPct: number;
    checkpointsCleared: number;
  };
  createdAt: string;
}
