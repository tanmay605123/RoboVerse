import { z } from 'zod';

export enum RituuMode {
  DEBUG = 'DEBUG',                     // Wiring & error debugging
  CODE = 'CODE',                       // Arduino / ESP32 / Python code generation & review
  PROJECT_PLANNER = 'PROJECT_PLANNER', // Asks goal, budget, skill -> outputs BOM, schematic, code, schedule
  LEARN = 'LEARN',                     // Socratic, beginner-friendly explanations
  VOICE = 'VOICE',                     // Conversational voice responses (English/Hindi)
}

export interface RituuMessage {
  id: string;
  sender: 'user' | 'rituu';
  mode?: RituuMode;
  content: string;
  timestamp: string;
  circuitSnapshotJson?: string;
  photoUrl?: string;
  codeSnippet?: string;
  diagnostics?: Array<{
    severity: 'WARNING' | 'ERROR';
    text: string;
    fixSnippet?: string;
  }>;
  suggestedComponents?: Array<{
    name: string;
    techsavyyyProductId?: string;
    priceInr: number;
  }>;
  rating?: 'UP' | 'DOWN';
  feedbackComment?: string;
}

export const SendRituuMessageInputSchema = z.object({
  sessionId: z.string().optional(),
  projectId: z.string().optional(),
  mode: z.nativeEnum(RituuMode).default(RituuMode.DEBUG),
  message: z.string().min(1, 'Message cannot be empty'),
  circuitJson: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  codeSnippet: z.string().optional(),
  serialOutput: z.string().optional(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type SendRituuMessageInput = z.infer<typeof SendRituuMessageInputSchema>;
