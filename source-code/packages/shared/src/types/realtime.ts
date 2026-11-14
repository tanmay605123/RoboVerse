import { LiveTelemetryFrame, ArenaId } from './robotics';

export type SquadRole =
  | 'CIRCUIT_LEAD'
  | 'FIRMWARE_ENG'
  | 'CAD_ARCHITECT'
  | 'PILOT_OPERATOR'
  | 'TEAM_CAPTAIN';

export interface SquadMember {
  userId: string;
  studentId: string;
  fullName: string;
  role: SquadRole;
  isOnline: boolean;
  avatarUrl?: string;
  currentActivity?: string;
  lastSeenAt: string;
}

export interface SquadMessage {
  id: string;
  squadId: string;
  senderId: string;
  senderName: string;
  senderRole: SquadRole;
  senderStudentId: string;
  content: string;
  type: 'text' | 'system' | 'telemetry_share' | 'code_snippet';
  metadata?: {
    testRunId?: string;
    robotName?: string;
    score?: number;
    stars?: number;
    codeSnippet?: string;
    circuitProjectId?: string;
  };
  timestamp: string;
}

export interface LiveTestRunSession {
  id: string;
  title: string;
  studentId: string;
  studentName: string;
  robotTemplateId: string;
  robotName: string;
  arenaId: ArenaId;
  arenaName: string;
  status: 'broadcasting' | 'completed' | 'replay';
  createdAt: string;
  score: number;
  durationSeconds: number;
  stars: number;
  passed: boolean;
  currentFrame?: LiveTelemetryFrame;
  frames: LiveTelemetryFrame[];
  viewerCount: number;
  shareableUrl: string;
}

export interface RealtimePresenceState {
  userId: string;
  studentId: string;
  fullName: string;
  currentProject?: string;
  activity: string;
  cursor?: { x: number; y: number };
  lastActive: string;
}
