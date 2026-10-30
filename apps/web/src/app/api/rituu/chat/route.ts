import { NextRequest, NextResponse } from 'next/server';
import { GeminiAIProvider, MockAIProvider, StreamEvent } from '@/lib/rituu/provider';
import { supabase } from '@/lib/supabaseClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        { error: 'Message text is required (max 2000 characters)' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message exceeds maximum length of 2000 characters' },
        { status: 400 }
      );
    }

    // Try consuming quota if user is authenticated via Supabase session
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const {
          data: { user },
        } = await supabase.auth.getUser(token);

        if (user) {
          const { data: quotaResult } = await (supabase.rpc as any)('rituu_consume', {
            photo: Boolean(imageBase64),
          });

          if (quotaResult && quotaResult.allowed === false) {
            return NextResponse.json(
              {
                error: quotaResult.reason || 'Daily Rituu quota reached. Please upgrade to Plus or Pro for higher limits.',
                code: 'QUOTA_EXCEEDED',
                quota: quotaResult,
              },
              { status: 429 }
            );
          }
        }
      }
    } catch {
      // Continue gracefully
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const provider = apiKey ? new GeminiAIProvider(apiKey, model) : new MockAIProvider();

    const textEncoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: StreamEvent) => {
          if (event.type === 'token' && event.text) {
            controller.enqueue(
              textEncoder.encode(`data: ${JSON.stringify({ t: event.text })}\n\n`)
            );
          } else if (event.type === 'tool_call' && event.toolCall) {
            controller.enqueue(
              textEncoder.encode(`data: ${JSON.stringify({ toolCall: event.toolCall })}\n\n`)
            );
          } else if (event.type === 'done') {
            controller.enqueue(
              textEncoder.encode(
                `data: ${JSON.stringify({
                  done: true,
                  offTopic: event.offTopic,
                  usage: event.usage || {},
                })}\n\n`
              )
            );
            controller.close();
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
