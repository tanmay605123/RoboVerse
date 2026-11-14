import { LiveTelemetryFrame } from '../types/robotics';
import {
  SquadMessage,
  SquadMember,
  RealtimePresenceState,
} from '../types/realtime';

type EventCallback = (payload: any) => void;

/**
 * In-Memory Realtime Pub-Sub Bus
 * Provides instant sub-millisecond local message routing and fallback
 * for testing, offline simulation, and decoupled local clients.
 */
class InMemoryRealtimeBus {
  private channels = new Map<string, Set<EventCallback>>();

  subscribe(channel: string, callback: EventCallback): () => void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(callback);

    return () => {
      const listeners = this.channels.get(channel);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.channels.delete(channel);
        }
      }
    };
  }

  broadcast(channel: string, event: string, payload: any): void {
    const listeners = this.channels.get(channel);
    if (listeners) {
      listeners.forEach((cb) => {
        try {
          cb({ event, payload, timestamp: Date.now() });
        } catch (err) {
          console.error(`[InMemoryBus Error] Channel ${channel}:`, err);
        }
      });
    }
  }

  getChannelListenerCount(channel: string): number {
    return this.channels.get(channel)?.size || 0;
  }
}

export const inMemoryBus = new InMemoryRealtimeBus();

/**
 * RoboVerse Realtime Telemetry & Collaboration Manager
 */
export class RoboVerseRealtimeManager {
  private activeSubscriptions = new Map<string, () => void>();

  /**
   * Subscribe to Live Test-Run Telemetry Stream (20-30 Hz updates)
   */
  subscribeToTestRun(
    testRunId: string,
    callbacks: {
      onTelemetry?: (frame: LiveTelemetryFrame) => void;
      onCompleted?: (result: { score: number; durationSeconds: number; stars: number }) => void;
    }
  ): () => void {
    const channelName = `test_run:${testRunId}`;

    const unsubscribe = inMemoryBus.subscribe(channelName, (msg: any) => {
      if (msg.event === 'telemetry' && callbacks.onTelemetry) {
        callbacks.onTelemetry(msg.payload);
      } else if (msg.event === 'completed' && callbacks.onCompleted) {
        callbacks.onCompleted(msg.payload);
      }
    });

    this.activeSubscriptions.set(channelName, unsubscribe);
    return unsubscribe;
  }

  /**
   * Broadcast Telemetry Frame across the network
   */
  broadcastTelemetry(testRunId: string, frame: LiveTelemetryFrame): void {
    const channelName = `test_run:${testRunId}`;
    inMemoryBus.broadcast(channelName, 'telemetry', frame);
  }

  /**
   * Broadcast Test Run Completion
   */
  broadcastTestRunComplete(
    testRunId: string,
    result: { score: number; durationSeconds: number; stars: number }
  ): void {
    const channelName = `test_run:${testRunId}`;
    inMemoryBus.broadcast(channelName, 'completed', result);
  }

  /**
   * Subscribe to Squad Team Chat & Live Presence
   */
  subscribeToSquad(
    squadId: string,
    callbacks: {
      onMessage?: (message: SquadMessage) => void;
      onPresence?: (presence: RealtimePresenceState) => void;
    }
  ): () => void {
    const channelName = `squad:${squadId}`;

    const unsubscribe = inMemoryBus.subscribe(channelName, (msg: any) => {
      if (msg.event === 'squad_message' && callbacks.onMessage) {
        callbacks.onMessage(msg.payload);
      } else if (msg.event === 'presence' && callbacks.onPresence) {
        callbacks.onPresence(msg.payload);
      }
    });

    this.activeSubscriptions.set(channelName, unsubscribe);
    return unsubscribe;
  }

  /**
   * Broadcast Squad Message
   */
  broadcastSquadMessage(squadId: string, message: SquadMessage): void {
    const channelName = `squad:${squadId}`;
    inMemoryBus.broadcast(channelName, 'squad_message', message);
  }

  /**
   * Broadcast Presence Update
   */
  broadcastPresence(channel: string, presence: RealtimePresenceState): void {
    inMemoryBus.broadcast(channel, 'presence', presence);
  }
}

export const realtimeManager = new RoboVerseRealtimeManager();
