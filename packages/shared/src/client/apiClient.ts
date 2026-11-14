/**
 * RoboVerse Typed API Client
 * Shared across Next.js Web and React Native Expo Mobile apps.
 * Versioned endpoints: /api/v1
 */

import {
  RegisterInput,
  LoginInput,
  RequestOtpInput,
  VerifyOtpInput,
  GoogleAuthInput,
  BiometricChallengeRequest,
  BiometricVerifyInput,
  RefreshTokenInput,
  ApiResponse,
  AuthResponseData,
  StudentIdRecord,
  LearningPassport,
  PlanTier,
  BillingCycle,
  DEFAULT_PLANS,
} from '../index';

export interface ApiClientConfig {
  baseUrl: string;
  authToken?: string | null;
  onUnauthorized?: () => void;
}

export class RoboVerseApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.authToken = config.authToken || null;
    this.onUnauthorized = config.onUnauthorized;
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.authToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.onUnauthorized) {
      this.onUnauthorized();
    }

    const json = await response.json();
    return json as T;
  }

  // ==================== AUTH & STUDENT ID ====================
  public auth = {
    register: (data: RegisterInput) =>
      this.request<ApiResponse<AuthResponseData>>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: LoginInput) =>
      this.request<ApiResponse<AuthResponseData>>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    loginWithStudentId: (studentId: string, passwordHash: string) =>
      this.request<ApiResponse<AuthResponseData>>('/api/v1/auth/login-student-id', {
        method: 'POST',
        body: JSON.stringify({ studentId, password: passwordHash }),
      }),

    requestOtp: (data: RequestOtpInput) =>
      this.request<ApiResponse<{ message: string; otpPreview?: string }>>('/api/v1/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    verifyOtp: (data: VerifyOtpInput) =>
      this.request<ApiResponse<AuthResponseData>>('/api/v1/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    googleAuth: (data: GoogleAuthInput) =>
      this.request<ApiResponse<AuthResponseData>>('/api/v1/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    biometricRequest: (data: BiometricChallengeRequest) =>
      this.request<ApiResponse<{ challenge: string }>>('/api/v1/auth/biometric/challenge', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    biometricVerify: (data: BiometricVerifyInput) =>
      this.request<ApiResponse<AuthResponseData>>('/api/v1/auth/biometric/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    refreshToken: (data: RefreshTokenInput) =>
      this.request<ApiResponse<{ accessToken: string }>>('/api/v1/auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    me: () =>
      this.request<ApiResponse<{ user: any; profile: any; studentIdCard: StudentIdRecord; todayUsage: any }>>(
        '/api/v1/auth/me'
      ),
  };

  // ==================== STUDENTS ====================
  public students = {
    getStudentId: () =>
      this.request<ApiResponse<StudentIdRecord>>('/api/v1/students/id-card'),

    getPassport: () =>
      this.request<ApiResponse<LearningPassport>>('/api/v1/students/passport'),

    verifyStudentId: (studentId: string) =>
      this.request<ApiResponse<{ verified: boolean; studentName: string; planTier: string; issuedAt: string }>>(
        `/api/v1/students/verify/${studentId}`
      ),
  };

  // ==================== PLANS & PRICING ====================
  public plans = {
    list: () =>
      this.request<ApiResponse<{ plans: any[] }>>('/api/v1/plans'),

    getById: (planId: string) =>
      this.request<ApiResponse<{ plan: any }>>(`/api/v1/plans/${planId}`),
  };

  // ==================== RAZORPAY SUBSCRIPTIONS ====================
  public subscriptions = {
    createOrder: (data: { planId: string; billingCycle: BillingCycle; couponCode?: string }) =>
      this.request<ApiResponse<any>>('/api/v1/subscriptions/create-order', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    verifyPayment: (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) =>
      this.request<ApiResponse<any>>('/api/v1/subscriptions/verify-payment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getMySubscription: () =>
      this.request<ApiResponse<any>>('/api/v1/subscriptions/my-subscription'),

    cancel: (subscriptionId: string, reason?: string) =>
      this.request<ApiResponse<any>>(`/api/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),

    getInvoices: () =>
      this.request<ApiResponse<{ invoices: any[] }>>('/api/v1/subscriptions/invoices'),
  };

  // ==================== USAGE LIMITS & METERS ====================
  public usage = {
    getDailyUsage: () =>
      this.request<ApiResponse<any>>('/api/v1/usage/today'),

    checkFeatureQuota: (feature: 'rituu_message' | 'photo_analysis' | 'circuit_save') =>
      this.request<ApiResponse<{ allowed: boolean; remaining: number; maxAllowed: number }>>(
        `/api/v1/usage/check?feature=${feature}`
      ),
  };

  // ==================== CIRCUIT SIMULATOR ====================
  public simulator = {
    listComponents: (category?: string, freeOnly?: boolean) => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (freeOnly) params.append('freeOnly', 'true');
      return this.request<ApiResponse<{ components: any[] }>>(`/api/v1/simulator/components?${params.toString()}`);
    },

    getComponent: (id: string) =>
      this.request<ApiResponse<{ component: any }>>(`/api/v1/simulator/components/${id}`),

    listStarters: () =>
      this.request<ApiResponse<{ starters: any[] }>>('/api/v1/simulator/starters'),

    listProjects: () =>
      this.request<ApiResponse<{ projects: any[] }>>('/api/v1/simulator/projects'),

    getProject: (id: string) =>
      this.request<ApiResponse<{ project: any }>>(`/api/v1/simulator/projects/${id}`),

    saveProject: (data: {
      id?: string;
      title: string;
      description?: string;
      isPublic?: boolean;
      components: any[];
      wires: any[];
      codeSnippet?: string;
      thumbnailUrl?: string;
    }) =>
      this.request<ApiResponse<{ project: any }>>('/api/v1/simulator/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    deleteProject: (id: string) =>
      this.request<ApiResponse<{ success: boolean }>>(`/api/v1/simulator/projects/${id}`, {
        method: 'DELETE',
      }),

    validateCircuit: (components: any[], wires: any[]) =>
      this.request<ApiResponse<{ valid: boolean; diagnostics: any[] }>>('/api/v1/simulator/diagnose', {
        method: 'POST',
        body: JSON.stringify({ components, wires }),
      }),
  };

  // ==================== RITUU AI CHATBOT ====================
  public rituu = {
    sendMessage: (data: {
      message: string;
      mode?: 'DEBUG' | 'CODE' | 'PROJECT_PLANNER' | 'LEARN' | 'VOICE';
      projectId?: string;
      circuitState?: any;
    }) =>
      this.request<ApiResponse<{ reply: string; codeSnippet?: string; suggestedWiring?: any; diagnostics?: any[] }>>(
        '/api/v1/rituu/chat',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),

    uploadPhoto: (formData: FormData) =>
      this.request<ApiResponse<{ reply: string; detectedIssues: any[]; componentRecommendations: any[] }>>(
        '/api/v1/rituu/photo-debug',
        {
          method: 'POST',
          body: formData,
        }
      ),

    rateResponse: (messageId: string, rating: 'UP' | 'DOWN') =>
      this.request<ApiResponse<{ success: boolean }>>('/api/v1/rituu/feedback', {
        method: 'POST',
        body: JSON.stringify({ messageId, rating }),
      }),
  };

  // ==================== HACKATHONS & EVENTS ====================
  public hackathons = {
    list: (city?: string) => {
      const q = city ? `?city=${encodeURIComponent(city)}` : '';
      return this.request<ApiResponse<{ events: any[] }>>(`/api/v1/hackathons${q}`);
    },

    getById: (id: string) =>
      this.request<ApiResponse<{ event: any }>>(`/api/v1/hackathons/${id}`),

    joinTeamPool: (eventId: string, skills: string[]) =>
      this.request<ApiResponse<{ success: boolean; matchPoolSize: number }>>(
        `/api/v1/hackathons/${eventId}/join-pool`,
        {
          method: 'POST',
          body: JSON.stringify({ skills }),
        }
      ),
  };

  // ==================== NEARBY SHOPS ====================
  public shops = {
    listNearby: (lat: number, lng: number, radiusKm = 25) =>
      this.request<ApiResponse<{ shops: any[] }>>(
        `/api/v1/shops/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`
      ),

    getById: (id: string) =>
      this.request<ApiResponse<{ shop: any }>>(`/api/v1/shops/${id}`),
  };

  // ==================== TECHSAVYYY STORE ====================
  public store = {
    listProducts: (category?: string) => {
      const q = category ? `?category=${encodeURIComponent(category)}` : '';
      return this.request<ApiResponse<{ products: any[] }>>(`/api/v1/store/products${q}`);
    },

    getProduct: (idOrSlug: string) =>
      this.request<ApiResponse<{ product: any }>>(`/api/v1/store/products/${idOrSlug}`),

    createOrder: (items: { productId: string; quantity: number }[], shippingAddress: any) =>
      this.request<ApiResponse<any>>('/api/v1/store/orders', {
        method: 'POST',
        body: JSON.stringify({ items, shippingAddress }),
      }),

    verifyPayment: (data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) =>
      this.request<ApiResponse<any>>('/api/v1/store/verify-payment', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // ==================== ADMIN CONTROL CENTER ====================
  public admin = {
    getMetrics: () =>
      this.request<ApiResponse<any>>('/api/v1/admin/metrics'),

    updatePlan: (planId: string, data: any) =>
      this.request<ApiResponse<any>>(`/api/v1/admin/plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    listStudents: (page = 1, limit = 20) =>
      this.request<ApiResponse<{ students: any[]; total: number }>>(
        `/api/v1/admin/students?page=${page}&limit=${limit}`
      ),

    promoteStudent: (userId: string, role: string) =>
      this.request<ApiResponse<any>>(`/api/v1/admin/students/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),

    listOrders: () =>
      this.request<ApiResponse<{ orders: any[] }>>('/api/v1/admin/store/orders'),

    listInvoices: () =>
      this.request<ApiResponse<{ invoices: any[] }>>('/api/v1/admin/store/invoices'),

    createCoupon: (coupon: any) =>
      this.request<ApiResponse<any>>('/api/v1/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(coupon),
      }),
  };
}

export function createApiClient(baseUrl = 'http://localhost:5000', authToken?: string | null): RoboVerseApiClient {
  return new RoboVerseApiClient({ baseUrl, authToken });
}
