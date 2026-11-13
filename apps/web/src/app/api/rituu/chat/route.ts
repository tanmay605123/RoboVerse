import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GeminiAIProvider, MockAIProvider, StreamEvent } from '@/lib/rituu/provider';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Per-user burst rate limit tracker (12 req/min)
const userRequestTimestamps = new Map<string, number[]>();

function checkBurstRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 12;

  const timestamps = (userRequestTimestamps.get(identifier) || []).filter(
    (t) => now - t < windowMs
  );
  timestamps.push(now);
  userRequestTimestamps.set(identifier, timestamps);

  return timestamps.length <= maxRequests;
}

// Zod Request Validation Schema
const RituuChatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string().max(4000),
      })
    )
    .max(12, 'Maximum history length is 12 turns')
    .optional()
    .default([]),
  mode: z.enum(['auto', 'debug', 'code', 'plan', 'learn']).optional().default('auto'),
  hintFirst: z.boolean().optional().default(false),
  imageBase64: z.string().optional(),
  circuitId: z.string().uuid().optional(),
  robotId: z.string().uuid().optional(),
  circuitContext: z.string().optional(),
  robotContext: z.string().optional(),
  sessionId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = RituuChatSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid request payload' },
        { status: 400 }
      );
    }

    const {
      message,
      history,
      mode,
      hintFirst,
      imageBase64,
      circuitId,
      robotId,
      circuitContext: rawCircuitContext,
      robotContext: rawRobotContext,
      sessionId: incomingSessionId,
    } = parseResult.data;

    const supabase = createServerSupabaseClient();

    // 1. Authenticate user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userIdentifier = user?.id || req.ip || 'anonymous_user';

    // 2. Per-user Burst Rate Limiting (12 requests/min)
    if (!checkBurstRateLimit(userIdentifier)) {
      return NextResponse.json(
        {
          error: 'Burst rate limit exceeded (12 requests/minute). Please slow down and try again shortly.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    // 3. Admin Kill Switch Check (feature_flags table or env)
    if (process.env.RITUU_KILL_SWITCH === 'true') {
      return NextResponse.json(
        {
          error: 'Rituu AI is currently paused for scheduled maintenance. Please try again soon.',
          code: 'KILL_SWITCH_ACTIVE',
        },
        { status: 503 }
      );
    }

    try {
      const { data: killFlag } = await (supabase.from('feature_flags') as any)
        .select('enabled')
        .eq('key', 'rituu_kill_switch')
        .maybeSingle();

      if (killFlag?.enabled) {
        return NextResponse.json(
          {
            error: 'Rituu AI is currently paused for scheduled system maintenance.',
            code: 'KILL_SWITCH_ACTIVE',
          },
          { status: 503 }
        );
      }
    } catch {
      // Continue if feature_flags table is not populated yet
    }

    // 4. Atomic Daily Quota Check via rituu_consume RPC
    const hasPhoto = Boolean(imageBase64);

    if (user) {
      try {
        const { data: quotaResult, error: quotaError } = await (supabase.rpc as any)('rituu_consume', {
          photo: hasPhoto,
        });

        if (!quotaError && quotaResult && quotaResult.allowed === false) {
          return NextResponse.json(
            {
              error: quotaResult.reason || 'Daily Rituu quota reached for your plan. Please upgrade to Plus or Pro for higher limits.',
              code: 'QUOTA_EXCEEDED',
              quota: quotaResult,
            },
            { status: 429 }
          );
        }
      } catch (qErr) {
        console.warn('Warning checking rituu_consume quota:', qErr);
      }
    }

    // 5. Server-side Circuit / Robot Context Loading with Ownership Check
    let enrichedCircuitContext = rawCircuitContext || '';
    let enrichedRobotContext = rawRobotContext || '';

    if (circuitId) {
      try {
        const { data: circuit } = await (supabase.from('circuit_projects') as any)
          .select('id, name, components, netlist, user_id, is_public')
          .eq('id', circuitId)
          .single();

        if (circuit && (circuit.is_public || (user && circuit.user_id === user.id))) {
          enrichedCircuitContext = `Project: ${circuit.name}\nComponents: ${JSON.stringify(circuit.components || [])}\nNetlist: ${JSON.stringify(circuit.netlist || [])}`;
        }
      } catch {
        // Continue with raw context
      }
    }

    if (robotId) {
      try {
        const { data: robot } = await (supabase.from('robot_designs') as any)
          .select('id, name, template_id, parts_data, user_id, is_public')
          .eq('id', robotId)
          .single();

        if (robot && (robot.is_public || (user && robot.user_id === user.id))) {
          enrichedRobotContext = `Robot Design: ${robot.name}\nParts Configuration: ${JSON.stringify(robot.parts_data || {})}`;
        }
      } catch {
        // Continue with raw context
      }
    }

    // 6. Ensure or Create Chat Session
    let activeSessionId = incomingSessionId;
    if (user && !activeSessionId) {
      try {
        const sessionTitle = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        const { data: newSession } = await (supabase.from('chat_sessions') as any)
          .insert({
            user_id: user.id,
            title: sessionTitle || 'Robotics Mentorship',
            context_project_id: circuitId || null,
          })
          .select('id')
          .single();

        if (newSession?.id) {
          activeSessionId = newSession.id;
        }
      } catch {
        // Ignore session creation failure
      }
    }

    // Save Student Message to chat_messages
    if (activeSessionId) {
      try {
        await (supabase.from('chat_messages') as any).insert({
          session_id: activeSessionId,
          sender: 'user',
          content: message,
          image_url: hasPhoto ? 'data:image_attached' : null,
        });
      } catch {
        // Ignore message insert error
      }
    }

    // 7. Select Gemini Model (default: gemini-2.5-flash; Pro for complex planning/debugging)
    const apiKey = process.env.GEMINI_API_KEY;
    const defaultModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const proModel = process.env.GEMINI_MODEL_PRO || 'gemini-2.5-pro';
    const chosenModel = mode === 'plan' || mode === 'debug' ? proModel : defaultModel;

    const provider = apiKey ? new GeminiAIProvider(apiKey, chosenModel) : new MockAIProvider();

    // 8. Stream Response via Server-Sent Events (SSE)
    const textEncoder = new TextEncoder();
    let accumulatedText = '';
    let isOffTopic = false;
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = async (event: StreamEvent) => {
          if (event.type === 'token' && event.text) {
            accumulatedText += event.text;
            controller.enqueue(
              textEncoder.encode(`data: ${JSON.stringify({ t: event.text })}\n\n`)
            );
          } else if (event.type === 'tool_call' && event.toolCall) {
            controller.enqueue(
              textEncoder.encode(`data: ${JSON.stringify({ toolCall: event.toolCall })}\n\n`)
            );
          } else if (event.type === 'done') {
            isOffTopic = Boolean(event.offTopic) || accumulatedText.trim().startsWith('[OFFTOPIC]');
            inputTokens = event.usage?.inputTokens || Math.round(message.length / 4 + 100);
            outputTokens = event.usage?.outputTokens || Math.round(accumulatedText.length / 4);

            controller.enqueue(
              textEncoder.encode(
                `data: ${JSON.stringify({
                  done: true,
                  offTopic: isOffTopic,
                  sessionId: activeSessionId,
                  usage: { inputTokens, outputTokens },
                })}\n\n`
              )
            );
            controller.close();

            // Asynchronously persist AI reply & cost telemetry
            const latencyMs = Date.now() - startTime;
            const inputRate = chosenModel.includes('pro') ? 1.25 / 1000000 : 0.075 / 1000000;
            const outputRate = chosenModel.includes('pro') ? 5.0 / 1000000 : 0.30 / 1000000;
            const estimatedCostUsd = Number(
              (inputTokens * inputRate + outputTokens * outputRate).toFixed(6)
            );

            if (activeSessionId) {
              try {
                await (supabase.from('chat_messages') as any).insert({
                  session_id: activeSessionId,
                  sender: 'rituu',
                  content: accumulatedText,
                  off_topic: isOffTopic,
                  input_tokens: inputTokens,
                  output_tokens: outputTokens,
                });

                await (supabase.from('chat_sessions') as any)
                  .update({ updated_at: new Date().toISOString() })
                  .eq('id', activeSessionId);
              } catch (persistErr) {
                console.warn('Failed to persist assistant message:', persistErr);
              }
            }

            if (user) {
              try {
                await (supabase.from('ai_cost_log') as any).insert({
                  user_id: user.id,
                  session_id: activeSessionId || null,
                  model: chosenModel,
                  input_tokens: inputTokens,
                  output_tokens: outputTokens,
                  estimated_cost_usd: estimatedCostUsd,
                  is_offtopic: isOffTopic,
                  latency_ms: latencyMs,
                });
              } catch (costErr) {
                console.warn('Failed to log AI cost telemetry:', costErr);
              }
            }
          } else if (event.type === 'error') {
            controller.enqueue(
              textEncoder.encode(
                `data: ${JSON.stringify({ error: event.error || 'Chat generation error' })}\n\n`
              )
            );
            controller.close();
          }
        };

        try {
          await provider.streamChat({
            message,
            history,
            mode,
            hintFirst,
            imageBase64,
            circuitContext: enrichedCircuitContext,
            robotContext: enrichedRobotContext,
            onChunk: sendEvent,
            signal: req.signal,
          });
        } catch (err: any) {
          await sendEvent({ type: 'error', error: err?.message || 'Chat generation error' });
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
