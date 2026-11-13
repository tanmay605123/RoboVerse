// Follow Deno and Supabase Edge Function conventions
import { corsHeaders } from '../_shared/cors.ts';
import {
  AIProvider,
  GeminiAIProvider,
  MockAIProvider,
  StreamEvent,
} from '../_shared/aiProvider.ts';

// In-memory per-user burst rate limit tracker (12 req/min)
const userRequestTimestamps = new Map<string, number[]>();

function checkBurstRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 12;

  const timestamps = (userRequestTimestamps.get(userId) || []).filter(
    (t) => now - t < windowMs
  );
  timestamps.push(now);
  userRequestTimestamps.set(userId, timestamps);

  return timestamps.length <= maxRequests;
}

Deno.serve(async (req: Request) => {
  const startTime = Date.now();

  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Kill switch check via environment variable
  if (Deno.env.get('RITUU_KILL_SWITCH') === 'true') {
    return new Response(
      JSON.stringify({
        error: 'Rituu is currently paused for scheduled system maintenance. Please try again soon.',
        code: 'KILL_SWITCH_ACTIVE',
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      message,
      history = [],
      mode = 'auto',
      hintFirst = false,
      imageBase64,
      circuitId,
      robotId,
      circuitContext: rawCircuitContext,
      robotContext: rawRobotContext,
      sessionId: incomingSessionId,
    } = body;

    // Zod-compatible validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message text is required (max 2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message exceeds maximum length of 2000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. User Authentication & Supabase Client Initialization
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Rituu is not configured yet. Please try again later.', code: 'BACKEND_NOT_CONFIGURED' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let userId: string | null = null;
    let userClient: any = null;
    let adminClient: any = null;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('npm:@supabase/supabase-js@2');
        adminClient = createClient(supabaseUrl, supabaseServiceKey);

        if (authHeader) {
          userClient = createClient(supabaseUrl, supabaseServiceKey, {
            global: { headers: { Authorization: authHeader } },
          });

          const { data: { user } } = await userClient.auth.getUser();
          if (user) {
            userId = user.id;
          }
        }
      } catch (clientErr) {
        console.warn('Supabase client initialization warning:', clientErr);
      }
    }

    // Check DB Kill Switch in feature_flags
    if (adminClient) {
      try {
        const { data: flag } = await adminClient
          .from('feature_flags')
          .select('enabled')
          .eq('key', 'rituu_kill_switch')
          .maybeSingle();

        if (flag?.enabled) {
          return new Response(
            JSON.stringify({
              error: 'Rituu is currently paused for scheduled system maintenance.',
              code: 'KILL_SWITCH_ACTIVE',
            }),
            { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch {
        // Continue if feature_flags table unpopulated
      }
    }

    // 4. Rate Limiting Check
    const rateLimitKey = userId || 'anon';
    if (!checkBurstRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests (12 requests/minute limit). Please slow down and try again shortly.',
          code: 'RATE_LIMITED',
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Atomic Daily Quota Consumption via rituu_consume RPC
    const hasPhoto = Boolean(imageBase64);
    if (userClient) {
      try {
        const { data: quotaResult, error: quotaError } = await userClient.rpc('rituu_consume', {
          photo: hasPhoto,
        });

        if (!quotaError && quotaResult && quotaResult.allowed === false) {
          return new Response(
            JSON.stringify({
              error: quotaResult.reason || 'Daily Rituu quota reached for your plan. Please upgrade to Plus or Pro for higher limits.',
              code: 'QUOTA_EXCEEDED',
              quota: quotaResult,
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (quotaErr) {
        console.warn('Quota check warning:', quotaErr);
      }
    }

    // 6. Server-side Circuit & Robot Context with Ownership Verification
    let enrichedCircuitContext = rawCircuitContext || '';
    let enrichedRobotContext = rawRobotContext || '';

    if (adminClient && circuitId) {
      try {
        const { data: circuit } = await adminClient
          .from('circuit_projects')
          .select('id, name, components, netlist, user_id, is_public')
          .eq('id', circuitId)
          .single();

        if (circuit && (circuit.is_public || (userId && circuit.user_id === userId))) {
          enrichedCircuitContext = `Project: ${circuit.name}\nComponents: ${JSON.stringify(circuit.components || [])}\nNetlist: ${JSON.stringify(circuit.netlist || [])}`;
        }
      } catch {
        // Continue
      }
    }

    if (adminClient && robotId) {
      try {
        const { data: robot } = await adminClient
          .from('robot_designs')
          .select('id, name, template_id, parts_data, user_id, is_public')
          .eq('id', robotId)
          .single();

        if (robot && (robot.is_public || (userId && robot.user_id === userId))) {
          enrichedRobotContext = `Robot: ${robot.name}\nParts Configuration: ${JSON.stringify(robot.parts_data || {})}`;
        }
      } catch {
        // Continue
      }
    }

    // 7. Ensure or Create Chat Session
    let activeSessionId = incomingSessionId;
    if (adminClient && userId && !activeSessionId) {
      try {
        const title = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        const { data: session } = await adminClient
          .from('chat_sessions')
          .insert({
            user_id: userId,
            title: title || 'Robotics Mentorship',
            context_project_id: circuitId || null,
          })
          .select('id')
          .single();

        if (session?.id) {
          activeSessionId = session.id;
        }
      } catch {
        // Continue
      }
    }

    // Save Student Message
    if (adminClient && activeSessionId) {
      try {
        await adminClient.from('chat_messages').insert({
          session_id: activeSessionId,
          sender: 'user',
          content: message,
          image_url: hasPhoto ? 'data:image_attached' : null,
        });
      } catch {
        // Continue
      }
    }

    // 8. Select Gemini Model (default: gemini-2.5-flash; Pro for complex planning/debugging)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const defaultModel = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';
    const proModel = Deno.env.get('GEMINI_MODEL_PRO') || 'gemini-2.5-pro';
    const chosenModel = mode === 'plan' || mode === 'debug' ? proModel : defaultModel;

    const provider: AIProvider = geminiApiKey
      ? new GeminiAIProvider(geminiApiKey, chosenModel)
      : new MockAIProvider();

    // 9. Initialize Server-Sent Events (SSE) Stream
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

            // Persist AI reply and cost log
            const latencyMs = Date.now() - startTime;
            const inputRate = chosenModel.includes('pro') ? 1.25 / 1000000 : 0.075 / 1000000;
            const outputRate = chosenModel.includes('pro') ? 5.0 / 1000000 : 0.30 / 1000000;
            const estimatedCostUsd = Number(
              (inputTokens * inputRate + outputTokens * outputRate).toFixed(6)
            );

            if (adminClient && activeSessionId) {
              try {
                await adminClient.from('chat_messages').insert({
                  session_id: activeSessionId,
                  sender: 'rituu',
                  content: accumulatedText,
                  off_topic: isOffTopic,
                  input_tokens: inputTokens,
                  output_tokens: outputTokens,
                });

                await adminClient
                  .from('chat_sessions')
                  .update({ updated_at: new Date().toISOString() })
                  .eq('id', activeSessionId);
              } catch (persistErr) {
                console.warn('Persist assistant message warning:', persistErr);
              }
            }

            if (adminClient && userId) {
              try {
                await adminClient.from('ai_cost_log').insert({
                  user_id: userId,
                  session_id: activeSessionId || null,
                  model: chosenModel,
                  input_tokens: inputTokens,
                  output_tokens: outputTokens,
                  estimated_cost_usd: estimatedCostUsd,
                  is_offtopic: isOffTopic,
                  latency_ms: latencyMs,
                });
              } catch (costErr) {
                console.warn('Cost log warning:', costErr);
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
        ...corsHeaders,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
