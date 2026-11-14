import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ROBOT_TEMPLATES, ARENAS } from '@roboverse/shared';
import {
  RoboticsPhysicsEngine,
  RoverSimulationState,
} from '../robotics/RoboticsPhysicsEngine';

describe('RoboVerse Robotics Physics & Kinematics Engine', () => {
  it('should calculate realistic Center of Mass (CoM) and stability for all 5 robot templates', () => {
    assert.strictEqual(ROBOT_TEMPLATES.length, 5, 'Must contain all 5 pre-built robot templates');

    ROBOT_TEMPLATES.forEach((tmpl) => {
      const metrics = RoboticsPhysicsEngine.calculatePhysicalMetrics(tmpl);
      assert.ok(metrics.totalMassGrams > 0, `${tmpl.name} mass must be positive`);
      assert.ok(metrics.stabilityScore >= 10 && metrics.stabilityScore <= 100, `${tmpl.name} stability must be in [10, 100]`);
      assert.ok(metrics.estimatedBatteryLifeMinutes > 0, `${tmpl.name} battery life must be positive`);
      assert.strictEqual(metrics.centerOfMass.length, 3, `${tmpl.name} CoM must have 3 axes`);
      assert.strictEqual(
        metrics.weightDistribution.frontPct + metrics.weightDistribution.rearPct,
        100,
        `${tmpl.name} front + rear weight must equal 100%`
      );
    });
  });

  it('should cast sonar rays and detect obstacles within range in arena', () => {
    const obstacleArena = ARENAS.find((a) => a.id === 'arena_obstacle_course')!;
    assert.ok(obstacleArena, 'Obstacle arena must exist');

    // Robot facing obstacle at x=3, z=2 from x=3, z=-2, heading=0 (straight North along +Z)
    const distCm = RoboticsPhysicsEngine.castSonarRay(3, -2, 0, obstacleArena, 400);
    assert.ok(distCm > 0 && distCm < 350, `Sonar ray should detect obstacle ahead (measured ${distCm}cm)`);
  });

  it('should evaluate 5-channel line tracker array over maze track', () => {
    const mazeArena = ARENAS.find((a) => a.id === 'arena_maze_line')!;
    assert.ok(mazeArena, 'Maze arena must exist');

    // Place robot directly over line track at [-6, -6], heading towards [-6, 0]
    const headingNorth = 0;
    const sensors = RoboticsPhysicsEngine.evaluateLineSensors(-6, -6, headingNorth, mazeArena);
    assert.strictEqual(sensors.length, 5, 'Must return 5 sensor channels');
    assert.ok(sensors.some((s) => s === true), 'Center sensor or adjacent should detect black line track');
  });

  it('should solve 3-DOF robotic arm forward and inverse kinematics', () => {
    // Test reachable target in front of arm
    const targetX = 0.2;
    const targetY = 0.35;
    const targetZ = 0.3;

    const ikResult = RoboticsPhysicsEngine.solveArmKinematics(targetX, targetY, targetZ);
    assert.strictEqual(ikResult.isReachable, true, 'Target must be geometrically reachable');
    assert.strictEqual(ikResult.anglesDeg.length, 4, 'Must return 4 joint angles');
    assert.ok(ikResult.anglesDeg[0] >= 0 && ikResult.anglesDeg[0] <= 180, 'Base yaw must be valid servo angle');
    assert.ok(ikResult.anglesDeg[1] >= 0 && ikResult.anglesDeg[1] <= 160, 'Shoulder angle must be valid');
    assert.ok(ikResult.anglesDeg[2] >= 0 && ikResult.anglesDeg[2] <= 160, 'Elbow angle must be valid');
  });

  it('should step differential drive physics and register checkpoint clearance', () => {
    const flatArena = ARENAS.find((a) => a.id === 'arena_flat_ground')!;
    const startCp = flatArena.checkpoints[0];

    const initialRover: RoverSimulationState = {
      x: startCp.position[0],
      y: 0.2,
      z: startCp.position[2],
      heading: 0,
      pitch: 0,
      roll: 0,
      linearVelocity: 0,
      angularVelocity: 0,
      leftMotorPwm: 200,
      rightMotorPwm: 200,
      batteryMahRemaining: 550,
      sonarDistanceCm: 150,
      irLineSensors: [false, false, false, false, false],
      armJointsDeg: [90, 60, 90, 30],
      checkpointsCleared: new Set(),
      score: 0,
      elapsedSeconds: 0,
      isColliding: false,
    };

    const nextState = RoboticsPhysicsEngine.stepDifferentialDrive(initialRover, flatArena, 0.1);
    assert.ok(nextState.linearVelocity > 0, 'Rover linear velocity must be positive with 200 PWM');
    assert.ok(nextState.checkpointsCleared.has(startCp.id), 'Start checkpoint must be registered');
    assert.ok(nextState.score > 0, 'Score must increase upon checkpoint clearance');
  });

  it('should grade test runs with 3 stars when under target time with zero collisions', () => {
    const flatArena = ARENAS.find((a) => a.id === 'arena_flat_ground')!;
    const allCps = new Set(flatArena.checkpoints.map((c) => c.id));

    const perfectRunState: RoverSimulationState = {
      x: 0,
      y: 0.2,
      z: 0,
      heading: 0,
      pitch: 0,
      roll: 0,
      linearVelocity: 0.9,
      angularVelocity: 0,
      leftMotorPwm: 200,
      rightMotorPwm: 200,
      batteryMahRemaining: 520,
      sonarDistanceCm: 150,
      irLineSensors: [false, false, true, false, false],
      armJointsDeg: [90, 60, 90, 30],
      checkpointsCleared: allCps,
      score: 1250,
      elapsedSeconds: 15.2, // Under best score time (18.4s)
      isColliding: false,
    };

    const record = RoboticsPhysicsEngine.gradeTestRun('user_student_1', 'tmpl_rover_2wd', flatArena, perfectRunState);
    assert.strictEqual(record.passed, true, 'Test run must pass');
    assert.strictEqual(record.stars, 3, 'Perfect run must award 3 stars');
    assert.strictEqual(record.telemetrySummary.checkpointsCleared, flatArena.checkpoints.length);
  });
});
