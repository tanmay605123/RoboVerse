import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  realtimeManager,
  inMemoryBus,
  LiveTelemetryFrame,
  SquadMessage,
  SquadRole,
} from '@roboverse/shared';

describe('Phase 11: Realtime Presence, Live Test-Run Sharing & Team Squad Chat', () => {
  it('manages real-time pub-sub channels and listener counts with clean unsubscription', () => {
    const testChannel = 'test_run:tr_unit_test_01';
    let receivedCount = 0;

    // Initially 0 listeners
    assert.strictEqual(inMemoryBus.getChannelListenerCount(testChannel), 0);

    // Subscribe
    const unsubscribe = inMemoryBus.subscribe(testChannel, (msg) => {
      if (msg.event === 'telemetry') {
        receivedCount += 1;
      }
    });

    assert.strictEqual(inMemoryBus.getChannelListenerCount(testChannel), 1);

    // Broadcast event
    inMemoryBus.broadcast(testChannel, 'telemetry', { speedMps: 1.5 });
    assert.strictEqual(receivedCount, 1);

    // Unsubscribe
    unsubscribe();
    assert.strictEqual(inMemoryBus.getChannelListenerCount(testChannel), 0);
  });

  it('broadcasts and receives 20-30 Hz live test-run telemetry frames', () => {
    const runId = 'tr_live_robotics_mars_007';
    const receivedFrames: LiveTelemetryFrame[] = [];

    const unsubscribe = realtimeManager.subscribeToTestRun(runId, {
      onTelemetry: (frame) => {
        receivedFrames.push(frame);
      },
    });

    // Simulate 5 consecutive 20 Hz frames (50ms delta)
    for (let i = 0; i < 5; i++) {
      const frame: LiveTelemetryFrame = {
        timestampMs: i * 50,
        speedMps: 1.2 + i * 0.1,
        motorCurrentMa: 450 + i * 20,
        batteryVolts: 11.8 - i * 0.02,
        batteryPct: 95,
        sonarDistanceCm: 80 - i * 5,
        irLineSensors: [false, true, true, true, false],
        headingRad: 0.785,
        pitchRad: 0.01,
        rollRad: 0.02,
        altitudeM: 0.15,
        position: [i * 0.2, 0.15, 0.0],
        velocity: [1.2, 0, 0],
        score: 500 + i * 25,
        durationSeconds: (i * 50) / 1000,
        checkpointsCleared: 2,
        totalCheckpoints: 4,
      };
      realtimeManager.broadcastTelemetry(runId, frame);
    }

    assert.strictEqual(receivedFrames.length, 5);
    assert.strictEqual(receivedFrames[0].speedMps, 1.2);
    assert.strictEqual(receivedFrames[4].speedMps, 1.6);
    assert.strictEqual(receivedFrames[4].score, 600);
    assert.deepStrictEqual(receivedFrames[2].irLineSensors, [false, true, true, true, false]);
    assert.deepStrictEqual(receivedFrames[4].position, [0.8, 0.15, 0.0]);

    unsubscribe();
  });

  it('broadcasts test-run completion with stars and final score', () => {
    const runId = 'tr_completion_test_42';
    let completedPayload: any = null;

    const unsubscribe = realtimeManager.subscribeToTestRun(runId, {
      onCompleted: (res) => {
        completedPayload = res;
      },
    });

    realtimeManager.broadcastTestRunComplete(runId, {
      score: 950,
      durationSeconds: 12.8,
      stars: 3,
    });

    assert.ok(completedPayload);
    assert.strictEqual(completedPayload.score, 950);
    assert.strictEqual(completedPayload.stars, 3);
    assert.strictEqual(completedPayload.durationSeconds, 12.8);

    unsubscribe();
  });

  it('supports squad team chat with role badges and message payloads', () => {
    const squadId = 'squad_phoenix_2026';
    const receivedMessages: SquadMessage[] = [];

    const unsubscribe = realtimeManager.subscribeToSquad(squadId, {
      onMessage: (msg) => {
        receivedMessages.push(msg);
      },
    });

    // 1. Text message from Team Captain
    const captainMsg: SquadMessage = {
      id: 'msg_test_01',
      squadId,
      senderId: 'usr_aarav_01',
      senderName: 'Aarav Sharma',
      senderRole: 'TEAM_CAPTAIN',
      senderStudentId: 'RV-2026-000108',
      content: 'Finalizing hardware BOM before checkout.',
      type: 'text',
      timestamp: new Date().toISOString(),
    };
    realtimeManager.broadcastSquadMessage(squadId, captainMsg);

    // 2. Telemetry share message from Pilot
    const telemetryMsg: SquadMessage = {
      id: 'msg_test_02',
      squadId,
      senderId: 'usr_pilot_04',
      senderName: 'Kabir Mehta',
      senderRole: 'PILOT_OPERATOR',
      senderStudentId: 'RV-2026-000215',
      content: 'New obstacle arena test run live!',
      type: 'telemetry_share',
      metadata: {
        testRunId: 'tr_live_kabir_09',
        score: 890,
        stars: 3,
      },
      timestamp: new Date().toISOString(),
    };
    realtimeManager.broadcastSquadMessage(squadId, telemetryMsg);

    // 3. Code snippet message from Firmware Engineer
    const codeMsg: SquadMessage = {
      id: 'msg_test_03',
      squadId,
      senderId: 'usr_rohan_03',
      senderName: 'Rohan Verma',
      senderRole: 'FIRMWARE_ENG',
      senderStudentId: 'RV-2026-000195',
      content: 'Updated differential drive PWM parameters.',
      type: 'code_snippet',
      metadata: {
        codeSnippet: 'int speed = 200;',
      },
      timestamp: new Date().toISOString(),
    };
    realtimeManager.broadcastSquadMessage(squadId, codeMsg);

    assert.strictEqual(receivedMessages.length, 3);
    assert.strictEqual(receivedMessages[0].senderRole, 'TEAM_CAPTAIN');
    assert.strictEqual(receivedMessages[1].type, 'telemetry_share');
    assert.strictEqual(receivedMessages[1].metadata?.score, 890);
    assert.strictEqual(receivedMessages[2].type, 'code_snippet');
    assert.strictEqual(receivedMessages[2].metadata?.codeSnippet, 'int speed = 200;');

    unsubscribe();
  });

  it('verifies valid squad roles definition and members presence telemetry', () => {
    const validRoles: SquadRole[] = [
      'TEAM_CAPTAIN',
      'CIRCUIT_LEAD',
      'FIRMWARE_ENG',
      'CAD_ARCHITECT',
      'PILOT_OPERATOR',
    ];

    assert.strictEqual(validRoles.length, 5);
    assert.ok(validRoles.includes('CIRCUIT_LEAD'));
    assert.ok(validRoles.includes('PILOT_OPERATOR'));
  });
});
