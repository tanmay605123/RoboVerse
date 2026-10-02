# 🤖 RoboVerse Monorepo
> **Learn it. Build it. Simulate it.**  
> A futuristic 3D robotics and electronics learning platform for students, delivered as a responsive web app and mobile app with a unified backend.

---

## 🏗️ Architecture & Monorepo Structure

```
roboverse/
├── apps/
│   ├── api/          # Node.js + Express + TypeScript, Prisma, Redis, Socket.io, Swagger, Razorpay
│   ├── web/          # Next.js + Three.js (R3F) + Tailwind CSS + Framer Motion (Phase 2 & 3)
│   └── mobile/       # React Native + Expo + Three.js / expo-gl (Phase 6)
├── packages/
│   ├── shared/       # Zod validation schemas, TypeScript interfaces, billing & GST engines
│   ├── ui-tokens/    # 3D Cyberpunk control-room theme (#07110D, #39FF6A, #7FE7D6, #FF9A1F)
│   └── sim-engine/   # Modified Nodal Analysis (MNA) electrical solver & circuit diagnostics
├── docker-compose.yml # PostgreSQL 16 + Redis 7 + API Cluster
├── .env.example      # Master environment configuration
└── package.json      # NPM Workspaces root
```

---

## 🚀 Phase 1: Completed Core Systems

### 1. Authentication & Security
- **Multi-step Student Registration**: Name, contact, date of birth, academic details, technical interests, password strength validation.
- **Under-18 Child Safety Protocol**: Mandatory parental email and consent verification for minors.
- **Multiple Login Methods**:
  - Email or Student ID + Password
  - Mobile OTP (6-digit one-time password stored in Redis with 5-min TTL)
  - Google OAuth token exchange
  - Biometric Authentication challenge/signature verification (for mobile TouchID/FaceID)
- **JWT Architecture**: Dual token setup with 1-hour access token rotation and 7-day refresh tokens.

### 2. Unique Student ID & Learning Passport
- **Automatic Sequential ID Generation**: Formatted as `RV-YYYY-NNNNNN` (e.g. `RV-2026-000101`).
- **Cryptographic Verification QR Code**: High-resolution base64 QR codes linked to `/verify/student/:studentId` with HMAC tamper-protection.
- **3D Flip Digital Student ID Card**: Tracks XP, Level, Streak days, and badges.
- **Comprehensive Learning Passport**: Skill radar chart (Electronics, Arduino, Mechanics, IoT, ML, Embedded), completed courses, approved projects, and QR-verifiable certificates.

### 3. Plans, Razorpay Subscriptions & 18% GST Billing
- **4 Market-Calibrated Plan Tiers** (All prices **INCLUDE 18% GST**):
  - **Free Explorer (₹0)**: Basic circuit simulator, 5 saved projects, 15 Rituu msgs/day, 3 photo analyses/day, community & shop access.
  - **Plus Self-Learner (₹299/mo, ₹749/qtr, ₹2,499/yr)**: Unlimited private projects, full component library, advanced tools (oscilloscope/multimeter), recorded courses, 100 Rituu msgs/day, 20 photo analyses/day, 5% store discount.
  - **Pro Guided Learning (₹999/mo, ₹2,699/qtr, ₹8,999/yr)**: 8+ live monthly classes, real-life guided projects with grading, ML for robotics track, national hackathon prep track, fair-use unlimited Rituu (300 msgs/day, 50 photos/day), mentor handoff, 10% store discount.
  - **Institution & School Plan (₹499/student/yr)**: Minimum 50 students, teacher dashboard, batch management, bulk Student IDs.
- **7-Day Full Refund Guarantee**: Full 100% refund initiated if cancelled within 7 days of purchase.
- **Dynamic Admin Plan Management**: Update prices, limits, and feature flags via `/api/v1/plans/:planId` without redeployment.
- **18% GST Invoicing Engine**: Automatic split between CGST (9%) + SGST (9%) for intra-state or IGST (18%) for inter-state, corporate GSTIN, HSN Code `999293`, invoice numbering (`RV-INV-2026-XXXXX`).
- **Razorpay Webhooks**: Handles `subscription.charged`, `subscription.halted`, `subscription.cancelled`, `subscription.paused`, `subscription.resumed`, with a 3-day grace period.

### 4. Daily Usage Limits & AI Cost Accounting
- **Usage Meter Engine**: Tracks daily text prompts, photo scans, and code reviews per student.
- **Paywall & Quota Enforcement**: Gracefully intercepts requests exceeding plan limits with HTTP 429 and targeted upgrade prompts.
- **Cost Tracking**: Computes estimated Claude AI inference cost per student in INR.

### 5. Swagger / OpenAPI 3.0 Documentation
- Interactive documentation mounted at `/api/docs` and raw JSON at `/api/docs.json`.

---

## 🛠️ Setup & Running Instructions

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Quick Start
```bash
# 1. Install all dependencies across the monorepo
npm install

# 2. Build shared packages (@roboverse/shared, @roboverse/ui-tokens, @roboverse/sim-engine)
npm run build:packages

# 3. Seed database (Plans, Components, Courses, Events, Shops, Products)
npm run seed:api

# 4. Start API Server (Development mode with watch)
npm run dev:api
```

The API server will launch at:
- **Server Root**: `http://localhost:4000`
- **Swagger Documentation**: `http://localhost:4000/api/docs`
- **Health Check**: `http://localhost:4000/api/health`

### Running Test Suite
```bash
npm run test:api
```

---

## 📅 Roadmap (Next: Phase 2)
- **Phase 2**: Design System, Futuristic 3D Logo, Web Landing Page with interactive 3D Hero Robot Arm, 3D Pricing Cards, Login/Multi-step Registration UI, Student Dashboard.
- **Phase 3**: 3D Circuit Workbench + MNA Simulator (web), Avr8js Arduino emulation, component library, learning roadmap.
- **Phase 4**: Rituu AI Chatbot (Claude API with Vision, Circuit error diagnosis, Arduino code fixer).
- **Phase 5**: National Hackathon feed, Nearby Shop finder, TechSavyyy e-commerce store with BOM checkout.
- **Phase 6**: Cross-platform Mobile App (Expo + React Native + Three.js).
- **Phase 7**: Admin Panel, Performance optimization, CI/CD, Deployment.
