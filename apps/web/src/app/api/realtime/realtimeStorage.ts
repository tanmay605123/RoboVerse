import {
  LiveTestRunSession,
  SquadMessage,
  SquadMember,
  LiveTelemetryFrame,
  realtimeManager,
} from '@roboverse/shared';

// Active Test Run Sessions
const testRunsStore = new Map<string, LiveTestRunSession>();

// Active Squad Chat Histories
const squadMessagesStore = new Map<string, SquadMessage[]>();

// Squad Roster Members
const squadMembersStore = new Map<string, SquadMember[]>();

// Seed sample test run session for SIH 2026 Mars Rover Challenge
const initialRunId = 'tr_sih_mars_rover_01';
const initialFrames: LiveTelemetryFrame[] = [];

// Generate realistic 20-frame telemetry playback
for (let i = 0; i < 30; i++) {
  const t = i * 0.5;
  initialFrames.push({
    timestampMs: i * 50,
    speedMps: Number((1.2 + Math.sin(t) * 0.3).toFixed(2)),
    motorCurrentMa: Math.round(480 + Math.sin(t * 2) * 90),
    batteryVolts: Number((11.8 - i * 0.01).toFixed(2)),
    batteryPct: Math.round(94 - i * 0.2),
    sonarDistanceCm: Math.round(140 - Math.min(100, i * 4) + Math.cos(t) * 10),
    irLineSensors: [false, true, true, true, false],
    headingRad: Number((Math.PI / 4 + Math.sin(t * 0.5) * 0.1).toFixed(3)),
    pitchRad: Number((0.02 * Math.sin(t)).toFixed(3)),
    rollRad: Number((0.03 * Math.cos(t)).toFixed(3)),
    altitudeM: 0.15,
    position: [Number((i * 0.4).toFixed(2)), 0.15, Number((Math.sin(i * 0.2) * 1.5).toFixed(2))],
    velocity: [1.2, 0, 0.2],
    score: 450 + i * 15,
    durationSeconds: Number((i * 0.5).toFixed(1)),
    checkpointsCleared: Math.min(4, Math.floor(i / 7)),
    totalCheckpoints: 4,
  });
}

testRunsStore.set(initialRunId, {
  id: initialRunId,
  title: 'SIH 2026 Autonomous Mars Rover Run',
  studentId: 'RV-2026-000108',
  studentName: 'Aarav Sharma',
  robotTemplateId: 'rover_4wd',
  robotName: 'Titan Explorer 4WD',
  arenaId: 'arena_obstacle_course',
  arenaName: 'Lunar Crater Obstacle Course',
  status: 'broadcasting',
  createdAt: new Date().toISOString(),
  score: 875,
  durationSeconds: 14.5,
  stars: 3,
  passed: true,
  currentFrame: initialFrames[initialFrames.length - 1],
  frames: initialFrames,
  viewerCount: 4,
  shareableUrl: `/test-run/${initialRunId}`,
});

// Seed Hackathon Squad 1: Team Garuda Autonomous
const defaultSquadId = 'squad_garuda_2026';

squadMembersStore.set(defaultSquadId, [
  {
    userId: 'usr_aarav_01',
    studentId: 'RV-2026-000108',
    fullName: 'Aarav Sharma',
    role: 'TEAM_CAPTAIN',
    isOnline: true,
    currentActivity: '3D Simulation Testing',
    lastSeenAt: new Date().toISOString(),
  },
  {
    userId: 'usr_diya_02',
    studentId: 'RV-2026-000142',
    fullName: 'Diya Patel',
    role: 'CIRCUIT_LEAD',
    isOnline: true,
    currentActivity: 'MNA Push-Button Wiring',
    lastSeenAt: new Date().toISOString(),
  },
  {
    userId: 'usr_rohan_03',
    studentId: 'RV-2026-000195',
    fullName: 'Rohan Verma',
    role: 'FIRMWARE_ENG',
    isOnline: true,
    currentActivity: 'PID Control Tuning',
    lastSeenAt: new Date().toISOString(),
  },
  {
    userId: 'usr_ananya_04',
    studentId: 'RV-2026-000210',
    fullName: 'Ananya Rao',
    role: 'CAD_ARCHITECT',
    isOnline: false,
    currentActivity: 'Chassis Mount Rigging',
    lastSeenAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
]);

squadMessagesStore.set(defaultSquadId, [
  {
    id: 'msg_001',
    squadId: defaultSquadId,
    senderId: 'usr_aarav_01',
    senderName: 'Aarav Sharma',
    senderRole: 'TEAM_CAPTAIN',
    senderStudentId: 'RV-2026-000108',
    content: 'Team, the national deadline is in 2 weeks. I just ran our rover through the Lunar Crater arena!',
    type: 'text',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_002',
    squadId: defaultSquadId,
    senderId: 'usr_aarav_01',
    senderName: 'Aarav Sharma',
    senderRole: 'TEAM_CAPTAIN',
    senderStudentId: 'RV-2026-000108',
    content: 'Check out the live 3D run telemetry! 875 points and 3 stars with zero collisions.',
    type: 'telemetry_share',
    metadata: {
      testRunId: initialRunId,
      robotName: 'Titan Explorer 4WD',
      score: 875,
      stars: 3,
    },
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_003',
    squadId: defaultSquadId,
    senderId: 'usr_diya_02',
    senderName: 'Diya Patel',
    senderRole: 'CIRCUIT_LEAD',
    senderStudentId: 'RV-2026-000142',
    content: 'Awesome run! Notice battery voltage dropped from 11.8V to 11.5V under peak motor load. I am adding a 470uF filter capacitor on the 5V rail to prevent logic brownouts.',
    type: 'text',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_004',
    squadId: defaultSquadId,
    senderId: 'usr_rohan_03',
    senderName: 'Rohan Verma',
    senderRole: 'FIRMWARE_ENG',
    senderStudentId: 'RV-2026-000195',
    content: 'Updated our Arduino PID line tracking routine. Increased Kp from 0.8 to 1.2 for sharper cornering.',
    type: 'code_snippet',
    metadata: {
      codeSnippet: `// Optimized Line Tracking PID for 4WD Rover\nfloat Kp = 1.2, Ki = 0.05, Kd = 0.3;\nfloat error = readLineSensors() - 2.0;\nint motorCorrection = (Kp * error) + (Kd * (error - prevError));\nanalogWrite(LEFT_PWM, constrain(BASE_SPEED + motorCorrection, 0, 255));\nanalogWrite(RIGHT_PWM, constrain(BASE_SPEED - motorCorrection, 0, 255));`,
    },
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
]);

export const realtimeStorage = {
  // Test Run Telemetry
  getTestRun(id: string): LiveTestRunSession | undefined {
    return testRunsStore.get(id);
  },

  getAllLiveRuns(): LiveTestRunSession[] {
    return Array.from(testRunsStore.values());
  },

  createTestRun(params: {
    title: string;
    studentId: string;
    studentName: string;
    robotTemplateId: string;
    robotName: string;
    arenaId: any;
    arenaName: string;
  }): LiveTestRunSession {
    const id = `tr_live_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const session: LiveTestRunSession = {
      id,
      title: params.title,
      studentId: params.studentId,
      studentName: params.studentName,
      robotTemplateId: params.robotTemplateId,
      robotName: params.robotName,
      arenaId: params.arenaId,
      arenaName: params.arenaName,
      status: 'broadcasting',
      createdAt: new Date().toISOString(),
      score: 0,
      durationSeconds: 0,
      stars: 1,
      passed: false,
      frames: [],
      viewerCount: 1,
      shareableUrl: `/test-run/${id}`,
    };

    testRunsStore.set(id, session);
    return session;
  },

  publishTelemetryFrame(testRunId: string, frame: LiveTelemetryFrame): void {
    const session = testRunsStore.get(testRunId);
    if (!session) return;

    session.currentFrame = frame;
    session.score = Math.max(session.score, frame.score);
    session.durationSeconds = frame.durationSeconds;

    // Keep circular buffer of last 600 frames (30s at 20Hz)
    session.frames.push(frame);
    if (session.frames.length > 600) {
      session.frames.shift();
    }

    // Broadcast across realtime bus
    realtimeManager.broadcastTelemetry(testRunId, frame);
  },

  completeTestRun(
    testRunId: string,
    result: { score: number; durationSeconds: number; stars: number; passed: boolean }
  ): void {
    const session = testRunsStore.get(testRunId);
    if (!session) return;

    session.status = 'completed';
    session.score = result.score;
    session.durationSeconds = result.durationSeconds;
    session.stars = result.stars;
    session.passed = result.passed;

    realtimeManager.broadcastTestRunComplete(testRunId, result);
  },

  incrementViewerCount(testRunId: string): number {
    const session = testRunsStore.get(testRunId);
    if (session) {
      session.viewerCount += 1;
      return session.viewerCount;
    }
    return 1;
  },

  // Squad Chat
  getSquadMessages(squadId: string): SquadMessage[] {
    return squadMessagesStore.get(squadId) || [];
  },

  getSquadMembers(squadId: string): SquadMember[] {
    return squadMembersStore.get(squadId) || [];
  },

  postSquadMessage(params: {
    squadId: string;
    senderId: string;
    senderName: string;
    senderRole: any;
    senderStudentId: string;
    content: string;
    type?: 'text' | 'system' | 'telemetry_share' | 'code_snippet';
    metadata?: any;
  }): SquadMessage {
    const {
      squadId,
      senderId,
      senderName,
      senderRole,
      senderStudentId,
      content,
      type = 'text',
      metadata,
    } = params;

    const message: SquadMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      squadId,
      senderId,
      senderName,
      senderRole,
      senderStudentId,
      content,
      type,
      metadata,
      timestamp: new Date().toISOString(),
    };

    if (!squadMessagesStore.has(squadId)) {
      squadMessagesStore.set(squadId, []);
    }
    squadMessagesStore.get(squadId)!.push(message);

    // Broadcast across realtime bus
    realtimeManager.broadcastSquadMessage(squadId, message);

    return message;
  },
};
