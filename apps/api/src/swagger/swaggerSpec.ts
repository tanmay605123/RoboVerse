export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'RoboVerse Core Platform API',
    version: '1.0.0',
    description:
      'Official REST API for RoboVerse - 3D Robotics and Electronics Learning Platform for Students.\n\nTagline: *Learn it. Build it. Simulate it.*',
    contact: {
      name: 'RoboVerse Engineering Support',
      email: 'dev@roboverse.io',
      url: 'https://roboverse.io',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.roboverse.io',
      description: 'Production Cloud Cluster',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token (format: Bearer <token>)',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid input details provided.' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Authentication & Student ID'],
        summary: 'Register new student with parental consent & generate unique Student ID',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password', 'mobileNumber', 'dateOfBirth', 'schoolOrCollegeName', 'classOrYear', 'city', 'state', 'interests', 'acceptedTerms'],
                properties: {
                  fullName: { type: 'string', example: 'Aarav Sharma' },
                  email: { type: 'string', example: 'aarav.sharma@example.com' },
                  password: { type: 'string', example: 'RoboSpark#2026' },
                  mobileNumber: { type: 'string', example: '+919876543210' },
                  dateOfBirth: { type: 'string', example: '2008-05-15' },
                  parentEmail: { type: 'string', example: 'parent.sharma@example.com' },
                  parentalConsentGiven: { type: 'boolean', example: true },
                  institutionType: { type: 'string', enum: ['school', 'college', 'university', 'self_learner'], example: 'school' },
                  schoolOrCollegeName: { type: 'string', example: 'Delhi Public School, R.K. Puram' },
                  classOrYear: { type: 'string', example: 'Class 11' },
                  city: { type: 'string', example: 'New Delhi' },
                  state: { type: 'string', example: 'Delhi' },
                  interests: { type: 'array', items: { type: 'string' }, example: ['arduino', 'machine_learning', 'drones'] },
                  acceptedTerms: { type: 'boolean', example: true },
                  referralCode: { type: 'string', example: 'ROBO-FRIEND-123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful, student ID and tokens generated.' },
          400: { description: 'Validation failed or missing parental consent for under-18.' },
          409: { description: 'Email or mobile number already exists.' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication & Student ID'],
        summary: 'Log in with Email or Student ID + Password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                  identifier: { type: 'string', example: 'RV-2026-000101' },
                  password: { type: 'string', example: 'RoboSpark#2026' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/v1/auth/otp/send': {
      post: {
        tags: ['Authentication & Student ID'],
        summary: 'Request 6-digit mobile OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mobileNumber'],
                properties: {
                  mobileNumber: { type: 'string', example: '+919876543210' },
                  purpose: { type: 'string', enum: ['login', 'register', 'reset_password'], example: 'login' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OTP dispatched' } },
      },
    },
    '/api/v1/auth/otp/verify': {
      post: {
        tags: ['Authentication & Student ID'],
        summary: 'Verify mobile OTP and authenticate student',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mobileNumber', 'otp'],
                properties: {
                  mobileNumber: { type: 'string', example: '+919876543210' },
                  otp: { type: 'string', example: '123456' },
                  purpose: { type: 'string', example: 'login' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'OTP verified successfully' } },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication & Student ID'],
        summary: 'Get active student profile, student ID card, and daily usage meter',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Profile and usage retrieved' } },
      },
    },
    '/api/v1/students/id-card': {
      get: {
        tags: ['Student Credentials & Passport'],
        summary: 'Get Digital 3D Student ID Card with Base64 QR Code',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Digital ID Card payload returned' } },
      },
    },
    '/api/v1/students/passport': {
      get: {
        tags: ['Student Credentials & Passport'],
        summary: 'Get full Learning Passport (skill radar, courses, projects, certs)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Learning Passport data' } },
      },
    },
    '/api/v1/students/verify-id/{studentId}': {
      get: {
        tags: ['Student Credentials & Passport'],
        summary: 'Public QR Code verification endpoint for student credentials',
        parameters: [
          { name: 'studentId', in: 'path', required: true, schema: { type: 'string', example: 'RV-2026-000101' } },
          { name: 'hash', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Verified credential' } },
      },
    },
    '/api/v1/plans': {
      get: {
        tags: ['Plans & Pricing'],
        summary: 'List all subscription plans with 18% GST inclusive prices and features',
        responses: { 200: { description: 'Plans list' } },
      },
    },
    '/api/v1/subscriptions/create-order': {
      post: {
        tags: ['Razorpay Subscriptions & Invoices'],
        summary: 'Create Razorpay order for subscription with coupon and GST calculation',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['planTier', 'billingCycle'],
                properties: {
                  planTier: { type: 'string', enum: ['PLUS', 'PRO', 'INSTITUTION'], example: 'PRO' },
                  billingCycle: { type: 'string', enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'], example: 'MONTHLY' },
                  couponCode: { type: 'string', example: 'WELCOME100' },
                  startFreeTrial: { type: 'boolean', example: false },
                  customerState: { type: 'string', example: 'Delhi' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Razorpay order created with GST breakdown' } },
      },
    },
    '/api/v1/subscriptions/verify': {
      post: {
        tags: ['Razorpay Subscriptions & Invoices'],
        summary: 'Verify Razorpay payment signature and issue GST Tax Invoice',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'],
                properties: {
                  razorpayOrderId: { type: 'string', example: 'order_12345' },
                  razorpayPaymentId: { type: 'string', example: 'pay_67890' },
                  razorpaySignature: { type: 'string', example: 'mock_sig_123' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Subscription activated and invoice generated' } },
      },
    },
    '/api/v1/usage/today': {
      get: {
        tags: ['Usage Limits & Cost Control'],
        summary: 'Get today quota usage (Rituu messages, photo scans, projects, AI cost)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Daily usage status' } },
      },
    },
    '/api/v1/usage/track': {
      post: {
        tags: ['Usage Limits & Cost Control'],
        summary: 'Check and consume quota before executing an action',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['action'],
                properties: {
                  action: { type: 'string', enum: ['RITUU_TEXT', 'RITUU_PHOTO', 'CODE_REVIEW', 'SAVE_PROJECT'], example: 'RITUU_TEXT' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Action allowed and quota consumed' },
          429: { description: 'Quota exceeded with paywall upgrade prompt' },
        },
      },
    },
  },
};
