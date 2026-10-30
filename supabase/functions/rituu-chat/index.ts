// Follow Deno and Supabase Edge Function conventions
import { corsHeaders } from '../_shared/cors.ts';
import {
  AIProvider,
  GeminiAIProvider,
  MockAIProvider,
  StreamEvent,
} from '../_shared/aiProvider.ts';

// In-memory per-user rate limit tracker (burst limit ~12 req/min)
const userRequestTimestamps = new Map<string, number[]>();

function checkBurstRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 15;

  const timestamps = (userRequestTimestamps.get(userId) || []).filter(
    (t) => now - t < windowMs
  );
  timestamps.push(now);
  userRequestTimestamps.set(userId, timestamps);

  return timestamps.length <= maxRequests;
}

Deno.serve(async (req: Request) => {
  // 1. CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Kill switch check
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
    const body = await req.json();
    const {
      message,
      history = [],
      mode = 'auto',
      hintFirst = false,
      imageBase64,
      circuitContext,
      robotContext,
    } = body;

    if (!message || typeof message !== 'string') {
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

    // 3. User Authentication & Quota Consumption
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    let userId = 'anonymous';

    if (authHeader && supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import('npm:@supabase/supabase-js@2');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
          global: { headers: { Authorization: authHeader } },
        });

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (user && !userError) {
          userId = user.id;

          // Rate limit check
          if (!checkBurstRateLimit(userId)) {
            return new Response(
              JSON.stringify({
                error: 'Too many requests. Please slow down and try again in a few seconds.',
                code: 'RATE_LIMITED',
              }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Atomic Quota Consumption via rituu_consume RPC
          const hasPhoto = Boolean(imageBase64);
          const { data: quotaResult, error: quotaError } = await supabase.rpc(
            'rituu_consume',
            { photo: hasPhoto }
          );

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
        }
      } catch (authErr) {
        console.warn('Supabase auth/quota check warning:', authErr);
      }
    }

    // 4. Select AI Provider (Gemini official or Mock fallback)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiModel = Deno.env.get('GEMINI_MODEL') || 'gemini-3.8-flash';

    const provider: AIProvider = geminiApiKey
      ? new GeminiAIProvider(geminiApiKey, geminiModel)
      : new MockAIProvider();

    // 5. Initialize Server-Sent Events (SSE) Stream
    const textEncoder = new TextEncoder();
    let accumulatedText = '';
    let isOffTopic = false;

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: StreamEvent) => {
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
            isOffTopic = Boolean(event.offTopic);
            controller.enqueue(
              textEncoder.encode(
                `data: ${JSON.stringify({
                  done: true,
                  offTopic: isOffTopic,
                  usage: event.usage || {},
                })}\n\n`
              )
            );
            controller.close();
          } else if (event.type === 'error') {
            controller.enqueue(
              textEncoder.encode(
                `data: ${JSON.stringify({ error: event.error || 'Unknown error' })}\n\n`
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
            circuitContext,
            robotContext,
            onChunk: sendEvent,
            signal: req.signal,
          });
        } catch (err: any) {
          sendEvent({ type: 'error', error: err?.message || 'Chat generation error' });
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
