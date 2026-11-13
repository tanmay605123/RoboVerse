import { Platform } from 'react-native';

const LIVE_API_URL = 'https://86fac5b648019d.lhr.life/api/v1';

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || LIVE_API_URL;

let authToken: string | null = null;

export function setMobileAuthToken(token: string | null) {
  authToken = token;
}

export function getMobileAuthToken(): string | null {
  return authToken;
}

export async function mobileApiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string; details?: any } }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${DEFAULT_API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Cannot reach RoboVerse Control Core.',
      },
    };
  }
}
