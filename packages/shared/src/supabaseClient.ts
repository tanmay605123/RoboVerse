import { Database } from './types/database';

export interface SupabaseClientConfig {
  supabaseUrl: string;
  supabaseKey: string;
  authToken?: string | null;
}

export class RoboVerseSupabaseClient {
  private url: string;
  private key: string;
  private token: string | null;

  constructor(config: SupabaseClientConfig) {
    this.url = config.supabaseUrl.replace(/\/+$/, '');
    this.key = config.supabaseKey;
    this.token = config.authToken || null;
  }

  public setAuthToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: this.key,
      ...extraHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Auth Operations
  public auth = {
    signUp: async (credentials: {
      email: string;
      password?: string;
      phone?: string;
      options?: { data?: Record<string, any> };
    }) => {
      try {
        const res = await fetch(`${this.url}/auth/v1/signup`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            phone: credentials.phone,
            data: credentials.options?.data || {},
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: { message: data.msg || data.message || data.error_description || 'Signup failed', status: res.status } };
        }
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message, status: 500 } };
      }
    },

    signInWithPassword: async (credentials: { email?: string; phone?: string; password: string }) => {
      try {
        const body = credentials.email
          ? { email: credentials.email, password: credentials.password }
          : { phone: credentials.phone, password: credentials.password };

        const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: { message: data.msg || data.error_description || 'Login failed', status: res.status } };
        }
        if (data.access_token) {
          this.setAuthToken(data.access_token);
        }
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message, status: 500 } };
      }
    },

    signInWithOtp: async (credentials: { phone?: string; email?: string }) => {
      try {
        const res = await fetch(`${this.url}/auth/v1/otp`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(credentials),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: { message: data.msg || 'OTP request failed', status: res.status } };
        }
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message, status: 500 } };
      }
    },

    verifyOtp: async (params: { phone?: string; email?: string; token: string; type: 'sms' | 'email' | 'signup' | 'recovery' }) => {
      try {
        const res = await fetch(`${this.url}/auth/v1/verify`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: { message: data.msg || 'Invalid or expired OTP', status: res.status } };
        }
        if (data.access_token) {
          this.setAuthToken(data.access_token);
        }
        return { data, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message, status: 500 } };
      }
    },

    resetPasswordForEmail: async (email: string, options?: { redirectTo?: string }) => {
      try {
        const res = await fetch(`${this.url}/auth/v1/recover`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ email, ...options }),
        });
        const data = await res.json();
        return { data, error: res.ok ? null : { message: data.msg || 'Reset password request failed' } };
      } catch (err: any) {
        return { data: null, error: { message: err.message } };
      }
    },

    signOut: async () => {
      try {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: 'POST',
          headers: this.getHeaders(),
        });
      } finally {
        this.setAuthToken(null);
      }
      return { error: null };
    },

    getUser: async () => {
      if (!this.token) return { data: { user: null }, error: null };
      try {
        const res = await fetch(`${this.url}/auth/v1/user`, {
          method: 'GET',
          headers: this.getHeaders(),
        });
        const data = await res.json();
        if (!res.ok) return { data: { user: null }, error: data };
        return { data: { user: data }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: err };
      }
    },
  };

  // RPC (Stored Procedures execution)
  public rpc = async <T = any>(functionName: string, params: Record<string, any> = {}) => {
    try {
      const res = await fetch(`${this.url}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        return { data: null, error: { message: data.message || `RPC ${functionName} failed`, details: data } };
      }
      return { data: data as T, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message, details: err } };
    }
  };

  // PostgREST Database Query Builder
  public from = (tableName: string) => {
    return new PostgrestQueryBuilder(this.url, tableName, this.getHeaders.bind(this));
  };

  // Supabase Edge Functions Invoker
  public functions = {
    invoke: async <T = any>(functionName: string, options: { body?: any; headers?: Record<string, string> } = {}) => {
      try {
        const res = await fetch(`${this.url}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: this.getHeaders(options.headers || {}),
          body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body || {}),
        });
        const data = await res.json();
        if (!res.ok) {
          return { data: null, error: { message: data.error || data.message || `Edge function ${functionName} failed`, status: res.status } };
        }
        return { data: data as T, error: null };
      } catch (err: any) {
        return { data: null, error: { message: err.message, status: 500 } };
      }
    },
  };

  // Storage
  public storage = {
    from: (bucketId: string) => ({
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `${this.url}/storage/v1/object/public/${bucketId}/${path}` },
      }),
    }),
  };
}

class PostgrestQueryBuilder {
  private baseEndpoint: string;
  private headersFn: (extra?: Record<string, string>) => Record<string, string>;
  private queryParams: string[] = [];

  constructor(
    supabaseUrl: string,
    tableName: string,
    headersFn: (extra?: Record<string, string>) => Record<string, string>
  ) {
    this.baseEndpoint = `${supabaseUrl}/rest/v1/${tableName}`;
    this.headersFn = headersFn;
  }

  public select(columns: string = '*') {
    this.queryParams.push(`select=${encodeURIComponent(columns)}`);
    return this;
  }

  public eq(column: string, value: any) {
    this.queryParams.push(`${column}=eq.${encodeURIComponent(String(value))}`);
    return this;
  }

  public order(column: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.queryParams.push(`order=${column}.${ascending ? 'asc' : 'desc'}`);
    return this;
  }

  public limit(count: number) {
    this.queryParams.push(`limit=${count}`);
    return this;
  }

  public single() {
    this.queryParams.push(`limit=1`);
    return this;
  }

  public async insert(data: any | any[]) {
    const res = await fetch(this.baseEndpoint, {
      method: 'POST',
      headers: this.headersFn({ Prefer: 'return=representation' }),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { data: res.ok ? json : null, error: res.ok ? null : json };
  }

  public async update(data: any) {
    const url = `${this.baseEndpoint}?${this.queryParams.join('&')}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.headersFn({ Prefer: 'return=representation' }),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { data: res.ok ? json : null, error: res.ok ? null : json };
  }

  public async delete() {
    const url = `${this.baseEndpoint}?${this.queryParams.join('&')}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.headersFn({ Prefer: 'return=representation' }),
    });
    const json = await res.json();
    return { data: res.ok ? json : null, error: res.ok ? null : json };
  }

  public async then(resolve: (val: any) => void, reject?: (err: any) => void) {
    try {
      const url = this.queryParams.length ? `${this.baseEndpoint}?${this.queryParams.join('&')}` : this.baseEndpoint;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.headersFn(),
      });
      const data = await res.json();
      resolve({ data: res.ok ? data : null, error: res.ok ? null : data });
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }
}

export function createRoboVerseSupabaseClient(config: SupabaseClientConfig) {
  return new RoboVerseSupabaseClient(config);
}
