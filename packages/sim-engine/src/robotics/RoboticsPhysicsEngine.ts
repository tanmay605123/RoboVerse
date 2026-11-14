import {
  RobotTemplate,
  AttachedPart,
  PhysicalMetrics,
  ArenaDefinition,
  LiveTelemetryFrame,
  TestRunRecord,
} from '@roboverse/shared';

export interface RoverSimulationState {
  x: number;
  y: number;
  z: number;
  heading: number; // in radians
  pitch: number;
  roll: number;
  linearVelocity: number;
  angularVelocity: number;
  leftMotorPwm: number;
  rightMotorPwm: number;
  batteryMahRemaining: number;
  sonarDistanceCm: number;
  irLineSensors: [boolean, boolean, boolean, boolean, boolean];
  armJointsDeg: [number, number, number, number]; // [yaw, shoulder, elbow, gripper]
  checkpointsCleared: Set<string>;
  score: number;
  elapsedSeconds: number;
  isColliding: boolean;
}

export class RoboticsPhysicsEngine {
  /**
   * 1. Calculate Center of Mass (CoM), Weight Distribution, and Physical Metrics
   */
  public static calculatePhysicalMetrics(
    template: RobotTemplate,
    parts: AttachedPart[] = template.defaultParts
  ): PhysicalMetrics {
    const chassisMass = template.chassis.massGrams;
    const [cW, cL, cH] = template.chassis.dimensionsMm;

    // Chassis center of mass at origin (0, 0, 0)
    let totalMass = chassisMass;
    let weightedX = 0;
    let weightedY = 0;
    let weightedZ = 0;

    parts.forEach((part) => {
      totalMass += part.massGrams;
      weightedX += part.massGrams * part.position[0];
      weightedY += part.massGrams * part.position[1];
      weightedZ += part.massGrams * part.position[2];
    });

    const comX = Number((weightedX / totalMass).toFixed(3));
    const comY = Number((weightedY / totalMass).toFixed(3));
    const comZ = Number((weightedZ / totalMass).toFixed(3));

    // Weight distribution across quadrants (front vs rear, left vs right)
    let frontMass = chassisMass / 2;
    let rearMass = chassisMass / 2;
    let leftMass = chassisMass / 2;
    let rightMass = chassisMass / 2;

    parts.forEach((p) => {
      if (p.position[2] >= 0) frontMass += p.massGrams;
      else rearMass += p.massGrams;

      if (p.position[0] < 0) leftMass += p.massGrams;
      else rightMass += p.massGrams;
    });

    const frontPct = Math.round((frontMass / totalMass) * 100);
    const rearPct = 100 - frontPct;
    const leftPct = Math.round((leftMass / totalMass) * 100);
    const rightPct = 100 - leftPct;

    // Stability score: favors low CoM (y < 0.2) and balanced 50/50 lateral symmetry
    const lateralDelta = Math.abs(leftPct - 50);
    const longitudinalDelta = Math.abs(frontPct - 50);
    const heightPenalty = Math.max(0, comY * 60);
    const stabilityScore = Math.max(
      10,
      Math.min(100, Math.round(100 - lateralDelta * 1.5 - longitudinalDelta * 0.8 - heightPenalty))
    );

    // Battery endurance (assumes average 400mA draw on nominal load)
    const avgDrawMa = template.type === 'QUADCOPTER' ? 3500 : 550;
    const batteryLifeMin = Math.round((template.specs.batteryCapacityMah / avgDrawMa) * 60);

    return {
      totalMassGrams: Math.round(totalMass),
      centerOfMass: [comX, comY, comZ],
      weightDistribution: { frontPct, rearPct, leftPct, rightPct },
      stabilityScore,
      estimatedBatteryLifeMinutes: batteryLifeMin,
    };
  }

  /**
   * 2. Sonar Raycasting against 3D Arena Obstacles & Boundary Walls
   */
  public static castSonarRay(
    originX: number,
    originZ: number,
    headingRad: number,
    arena: ArenaDefinition,
    maxRangeCm: number = 250
  ): number {
    const rayDirX = Math.sin(headingRad);
    const rayDirZ = Math.cos(headingRad);
    let closestDistCm = maxRangeCm;

    // A. Check arena perimeter walls ([-w/2, w/2], [-l/2, l/2])
    const halfW = arena.dimensions[0] / 2;
    const halfL = arena.dimensions[1] / 2;

    const testWall = (t: number) => {
      if (t > 0) {
        const distCm = t * 100;
        if (distCm < closestDistCm) closestDistCm = distCm;
      }
    };

    if (rayDirX > 0.001) testWall((halfW - originX) / rayDirX);
    if (rayDirX < -0.001) testWall((-halfW - originX) / rayDirX);
    if (rayDirZ > 0.001) testWall((halfL - originZ) / rayDirZ);
    if (rayDirZ < -0.001) testWall((-halfL - originZ) / rayDirZ);

    // B. Check each arena obstacle
    arena.obstacles.forEach((obs) => {
      const dx = obs.position[0] - originX;
      const dz = obs.position[2] - originZ;
      const radiusM = obs.dimensions[0] / 2;

      // Project center onto ray line
      const tProj = dx * rayDirX + dz * rayDirZ;
      if (tProj > 0) {
        const perpDistSq = (dx * dx + dz * dz) - (tProj * tProj);
        const radiusSq = radiusM * radiusM;

        if (perpDistSq <= radiusSq) {
          const hitDistM = tProj - Math.sqrt(Math.max(0, radiusSq - perpDistSq));
          const hitDistCm = hitDistM * 100;
          if (hitDistCm > 5 && hitDistCm < closestDistCm) {
            closestDistCm = hitDistCm;
          }
        }
      }
    });

    return Math.max(5, Math.round(closestDistCm));
  }

  /**
   * 3. 5-Channel Ground Reflectance Infrared Line Sensor Raycaster
   */
  public static evaluateLineSensors(
    originX: number,
    originZ: number,
    headingRad: number,
    arena: ArenaDefinition,
    sensorSpacingM: number = 0.04
  ): [boolean, boolean, boolean, boolean, boolean] {
    if (!arena.lineTrackPath || arena.lineTrackPath.length < 2) {
      return [false, false, false, false, false];
    }

    const rightDirX = Math.cos(headingRad);
    const rightDirZ = -Math.sin(headingRad);

    const fwdDistM = 0.22; // sensor bar placed 22cm ahead of robot center
    const barCenterX = originX + Math.sin(headingRad) * fwdDistM;
    const barCenterZ = originZ + Math.cos(headingRad) * fwdDistM;

    const offsets = [-2, -1, 0, 1, 2];
    const results: [boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false];

    offsets.forEach((idx, i) => {
      const sX = barCenterX + rightDirX * (idx * sensorSpacingM);
      const sZ = barCenterZ + rightDirZ * (idx * sensorSpacingM);

      // Check distance to closest segment on the line track path
      let minTrackDistM = 999;
      for (let s = 0; s < arena.lineTrackPath!.length - 1; s++) {
        const p1 = arena.lineTrackPath![s];
        const p2 = arena.lineTrackPath![s + 1];

        // Segment distance formula
        const segDx = p2[0] - p1[0];
        const segDz = p2[1] - p1[1];
        const l2 = segDx * segDx + segDz * segDz;
        if (l2 === 0) continue;

        let t = ((sX - p1[0]) * segDx + (sZ - p1[1]) * segDz) / l2;
        t = Math.max(0, Math.min(1, t));

        const projX = p1[0] + t * segDx;
        const projZ = p1[1] + t * segDz;

        const dSq = (sX - projX) * (sX - projX) + (sZ - projZ) * (sZ - projZ);
        const d = Math.sqrt(dSq);
        if (d < minTrackDistM) minTrackDistM = d;
      }

      // Line tape width is ~45mm (0.045m); if sensor is within 25mm of center line, it's ON the black track
      results[i] = minTrackDistM <= 0.035;
    });

    return results;
  }

  /**
   * 4. 3-DOF Robotic Arm Analytical Forward & Inverse Kinematics (FK / IK)
   */
  public static solveArmKinematics(targetX: number, targetY: number, targetZ: number): {
    anglesDeg: [number, number, number, number];
    isReachable: boolean;
  } {
    const l1 = 0.40; // Shoulder to elbow length in meters
    const l2 = 0.35; // Elbow to wrist/gripper length in meters
    const baseHeight = 0.20;

    // 1. Base Yaw
    let thetaBaseDeg = (Math.atan2(targetX, targetZ) * 180) / Math.PI;
    thetaBaseDeg = Math.max(0, Math.min(180, thetaBaseDeg + 90));

    // 2. Planar projection for shoulder & elbow
    const r = Math.sqrt(targetX * targetX + targetZ * targetZ);
    const yRel = targetY - baseHeight;
    const distSq = r * r + yRel * yRel;
    const dist = Math.sqrt(distSq);

    const maxReach = l1 + l2;
    const isReachable = dist <= maxReach && dist >= Math.abs(l1 - l2);

    if (!isReachable) {
      // Clamp to edge of reach sphere
      return {
        anglesDeg: [Math.round(thetaBaseDeg), 45, 90, 20],
        isReachable: false,
      };
    }

    // Law of cosines for elbow angle
    const cosElbow = (l1 * l1 + l2 * l2 - distSq) / (2 * l1 * l2);
    const elbowRad = Math.acos(Math.max(-1, Math.min(1, cosElbow)));
    const thetaElbowDeg = Math.round(180 - (elbowRad * 180) / Math.PI);

    // Shoulder angle
    const alpha = Math.atan2(yRel, r);
    const beta = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + distSq - l2 * l2) / (2 * l1 * dist))));
    const thetaShoulderDeg = Math.round(((alpha + beta) * 180) / Math.PI);

    return {
      anglesDeg: [
        Math.round(thetaBaseDeg),
        Math.max(0, Math.min(160, thetaShoulderDeg)),
        Math.max(0, Math.min(160, thetaElbowDeg)),
        30, // Gripper default open
      ],
      isReachable: true,
    };
  }

  /**
   * 5. Integration Step for Differential Drive Rover (2WD & 4WD)
   */
  public static stepDifferentialDrive(
    state: RoverSimulationState,
    arena: ArenaDefinition,
    deltaSeconds: number
  ): RoverSimulationState {
    const trackWidthM = 0.22;
    const maxWheelMps = 1.2;

    // Convert motor PWM (0-255) to wheel linear speeds
    const vLeft = (state.leftMotorPwm / 255) * maxWheelMps;
    const vRight = (state.rightMotorPwm / 255) * maxWheelMps;

    const vLin = (vLeft + vRight) / 2;
    const omega = (vRight - vLeft) / trackWidthM;

    let newHeading = state.heading + omega * deltaSeconds;
    let newX = state.x + Math.sin(newHeading) * vLin * deltaSeconds;
    let newZ = state.z + Math.cos(newHeading) * vLin * deltaSeconds;

    // Collision detection against arena boundaries & obstacles
    const halfW = arena.dimensions[0] / 2 - 0.4;
    const halfL = arena.dimensions[1] / 2 - 0.4;
    let isColliding = false;

    if (newX > halfW || newX < -halfW || newZ > halfL || newZ < -halfL) {
      isColliding = true;
      newX = Math.max(-halfW, Math.min(halfW, newX));
      newZ = Math.max(-halfL, Math.min(halfL, newZ));
      newHeading += Math.PI * 0.7; // Bounce off wall
    }

    arena.obstacles.forEach((obs) => {
      if (!obs.isCollidable) return;
      const dx = newX - obs.position[0];
      const dz = newZ - obs.position[2];
      const radiusM = (obs.dimensions[0] / 2) + 0.35; // combined radius with rover buffer
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < radiusM) {
        isColliding = true;
        // Elastic pushback vector
        const pushX = (dx / dist) * radiusM;
        const pushZ = (dz / dist) * radiusM;
        newX = obs.position[0] + pushX;
        newZ = obs.position[2] + pushZ;
        newHeading += 0.5;
      }
    });

    // Check checkpoints
    const updatedCheckpoints = new Set(state.checkpointsCleared);
    arena.checkpoints.forEach((cp) => {
      const cdx = newX - cp.position[0];
      const cdz = newZ - cp.position[2];
      const dist = Math.sqrt(cdx * cdx + cdz * cdz);
      if (dist <= cp.radius) {
        updatedCheckpoints.add(cp.id);
      }
    });

    // Sonar & IR line sensor evaluation
    const sonarDist = RoboticsPhysicsEngine.castSonarRay(newX, newZ, newHeading, arena);
    const lineSensors = RoboticsPhysicsEngine.evaluateLineSensors(newX, newZ, newHeading, arena);

    // Battery consumption & score calculation
    const currentDrawMa = 150 + Math.abs(state.leftMotorPwm + state.rightMotorPwm) * 1.5;
    const mahUsed = (currentDrawMa * (deltaSeconds / 3600));
    const newBatteryMah = Math.max(0, state.batteryMahRemaining - mahUsed);

    const cpScore = updatedCheckpoints.size * 250;
    const collisionPenalty = isColliding ? 50 : 0;
    const newScore = Math.max(0, cpScore - collisionPenalty);

    return {
      ...state,
      x: newX,
      z: newZ,
      heading: newHeading,
      linearVelocity: vLin,
      angularVelocity: omega,
      sonarDistanceCm: sonarDist,
      irLineSensors: lineSensors,
      batteryMahRemaining: newBatteryMah,
      checkpointsCleared: updatedCheckpoints,
      score: newScore,
      elapsedSeconds: state.elapsedSeconds + deltaSeconds,
      isColliding,
    };
  }

  /**
   * 6. Generate Telemetry Frame for Live Control Room HUD
   */
  public static createTelemetryFrame(
    state: RoverSimulationState,
    template: RobotTemplate,
    arena: ArenaDefinition
  ): LiveTelemetryFrame {
    const batteryPct = Math.round(
      (state.batteryMahRemaining / template.specs.batteryCapacityMah) * 100
    );
    const motorCurrentMa = Math.round(
      120 + Math.abs(state.leftMotorPwm + state.rightMotorPwm) * 1.6
    );
    const batteryVolts = Number(
      (template.specs.operatingVoltage * (0.85 + (batteryPct / 100) * 0.15)).toFixed(2)
    );

    return {
      timestampMs: Date.now(),
      speedMps: Number(state.linearVelocity.toFixed(2)),
      motorCurrentMa,
      batteryVolts,
      batteryPct: Math.max(0, Math.min(100, batteryPct)),
      sonarDistanceCm: state.sonarDistanceCm,
      irLineSensors: state.irLineSensors,
      headingRad: state.heading,
      pitchRad: state.pitch,
      rollRad: state.roll,
      altitudeM: state.y,
      armJointAnglesDeg: state.armJointsDeg,
      score: state.score,
      durationSeconds: Number(state.elapsedSeconds.toFixed(1)),
      checkpointsCleared: state.checkpointsCleared.size,
      totalCheckpoints: arena.checkpoints.length,
    };
  }

  /**
   * 7. Finalize and Grade Test Run
   */
  public static gradeTestRun(
    userId: string,
    templateId: string,
    arena: ArenaDefinition,
    finalState: RoverSimulationState
  ): TestRunRecord {
    const totalCps = arena.checkpoints.length;
    const clearedCps = finalState.checkpointsCleared.size;
    const targetTime = arena.bestScoreTimeSeconds || 30.0;

    const allPassed = clearedCps === totalCps;
    let stars = 0;
    if (allPassed) {
      if (finalState.elapsedSeconds <= targetTime && !finalState.isColliding) {
        stars = 3;
      } else if (finalState.elapsedSeconds <= targetTime * 1.5) {
        stars = 2;
      } else {
        stars = 1;
      }
    } else if (clearedCps > 0) {
      stars = 1;
    }

    return {
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      robotTemplateId: templateId,
      arenaId: arena.id,
      score: finalState.score,
      durationSeconds: Number(finalState.elapsedSeconds.toFixed(1)),
      passed: allPassed,
      stars,
      telemetrySummary: {
        avgSpeedMps: Number(finalState.linearVelocity.toFixed(2)),
        maxSpeedMps: 1.1,
        minSonarDistanceCm: finalState.sonarDistanceCm,
        batteryConsumedPct: Math.round(
          ((550 - finalState.batteryMahRemaining) / 550) * 100
        ),
        checkpointsCleared: clearedCps,
      },
      createdAt: new Date().toISOString(),
    };
  }
}
