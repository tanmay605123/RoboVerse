// Use the Next.js same-origin proxy by default. This keeps browser requests
// working in both local development and Vercel without exposing a backend URL
// in client code. The proxy target is configured in next.config.mjs.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string; details?: any } }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('roboverse_access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (!res.ok && json?.success !== false) {
      return {
        success: false,
        error: {
          code: `HTTP_${res.status}`,
          message: json?.message || `RoboVerse API request failed (${res.status}).`,
        },
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to reach RoboVerse API cluster.',
      },
    };
  }
}
