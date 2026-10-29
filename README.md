# 🤖 RoboVerse: Robotics, Electronics & Software Learning Platform
> **"Learn it. Build it. Simulate it."**  
> A full-stack, cross-platform learning ecosystem for students, featuring interactive 3D WebGL circuit and robot simulation, Rituu AI copilot (powered by Google Gemini), Google Maps maker shops radar, TechSavyyy hardware store, and a master admin control center.

---

## 🎨 Design Language & Visual System
- **Orange Light Theme (Reference A)**: Light, airy, professional aesthetic with `#F5F6F8` background, white cards with soft elevated shadows (`0 8px 30px rgba(20,30,60,0.06)`), 16–20px corner radii, and generous whitespace.
- **Accents**: Primary orange gradient (`#FF8A1F` to `#FFA94D`), secondary blue (`#4C8DFF`), positive green (`#12B76A`), coral (`#FF6B6B`), and deep navy (`#1B2559`) for headings.
- **Circuit Lab (Reference B / Tinkercad-Style)**: Clean toolbar, 3-view switcher (*Circuits*, *Schematic*, *Components BOM*), Monaco C++ & Blockly code editors with live Serial Monitor.
- **100% Free Components Principle**: Every electronic component in the Circuit Lab is free for all students.

---

## 🏗️ Monorepo Architecture

```
roboverse/
├── apps/
│   ├── web/          # Next.js 14 App Router, Three.js / React Three Fiber, Tailwind CSS, Monaco Editor
│   ├── mobile/       # React Native with Expo SDK 51, Three.js / expo-gl, Local Biometrics, Offline Sync
│   ├── api/          # Node.js 20 LTS, Express, TypeScript, Mongoose, Redis, Socket.io, Swagger, Razorpay
│   └── worker/       # BullMQ Background Worker for PDFs, Invoices, Certificates, and Telemetry
├── packages/
│   ├── shared/       # Zod schemas, TypeScript types, API client, roles, GST tax calculations
│   ├── ui-tokens/    # Orange light & dark theme color tokens, spacing, typography scales
│   ├── sim-engine/   # Modified Nodal Analysis (MNA) electrical solver & circuit diagnostics
│   └── components-lib # Vector artwork & pin definitions for ~46 electronic components
├── docker-compose.yml # MongoDB Atlas / Local Mongo + Redis 7 + API Cluster
└── package.json      # NPM Workspaces root
```

---

## 🚀 The 7 Core Production Phases

### Phase 1: Server Skeleton, Mongoose Models, 2FA Admin & Dynamic UPI QR
- **Auth**: JWT access + rotating refresh tokens, mobile OTP with 5-minute Redis TTL, Google OAuth, parental consent flow for under-18 learners.
- **Unique Student ID**: Automatic `RV-YYYY-NNNNNN` generation with HMAC tamper-protected QR code cards.
- **Dynamic UPI QR Codes**: 15-minute countdown single-use UPI QR generation and `qr_code.credited` webhook listener.
- **Billing & 18% GST**: Intra-state (CGST 9% + SGST 9%) and inter-state (IGST 18%) automatic calculation, 7-day 100% refund policy.

### Phase 2: Web Client Foundation, Navigation & Student Dashboard
- **Responsive App Shell**: 260px collapsible sidebar, Ctrl+K global search, role-based redirects.
- **Student Dashboard**: 3D interactive robot hero arm, Level & XP progression (Rookie -> Builder -> Engineer -> Innovator), live challenge cards, sample projects (Line Following Robot, Robotic Hand, Drone).

### Phase 3: Circuit Lab Workshop & Simulation Engine
- **3 View Modes**:
  1. *Circuits View*: Realistic 2D & 3D WebGL top-down breadboard simulation.
  2. *Schematic View*: Clean ANSI schematic diagram with standard electronic symbols.
  3. *Components List (BOM)*: Full bill of materials with quantities, specifications, and store links.
- **MNA Simulation Engine**: True-RMS virtual multimeter (DC voltage, circuit current, power), interactive sensor sliders (sonar distance, potentiometer, PIR trigger), short circuit detection.
- **Dual Code Editor**: Blockly blocks + Monaco C++ firmware editor with interactive Serial Monitor (baud rate selector, timestamp toggle, auto-scroll).

### Phase 4: Rituu AI Chatbot (Google Gemini API)
- **Pluggable AI Architecture**: Server-side Google Gemini (`gemini-1.5-pro` & `gemini-1.5-flash`) behind an `AIProvider` interface for zero-downtime swapping.
- **Safety Filters**: Immediate rejection of 230V AC mains and lithium-ion fire hazards with safe robotics alternatives.
- **Optical Circuit Diagnosis**: Multimodal photo upload troubleshooting breadboard wiring and pinouts.
- **Bilingual**: Seamless English + Hindi responses.

### Phase 5: Nearby Component Shops, TechSavyyy Store & Hackathons Hub
- **Maker Shops Radar**: Google Maps Platform integration, Haversine proximity calculation, turn-by-turn directions deep links, phone dialing, and component stock filters.
- **TechSavyyy Hardware Store**: Tier-based discounts (Free 0%, Plus 5%, Pro 10%), Razorpay checkout, and official 18% GST Tax Invoices.
- **Hackathons Hub**: National robotics competition feed, squad matchmaking pool, and RFC 5545 `.ics` calendar export.

### Phase 6: Mobile App (React Native with Expo for iOS & Android)
- **Zero Flutter / Swift / Kotlin**: Pure React Native with Expo SDK 51.
- **Bottom Tab Shell**: Dedicated 5-tab navigation (**Home**, **Learn**, **Lab**, **Rituu**, **Profile**).
- **3D WebGL on Mobile**: Hardware-accelerated 3D scenes via `expo-gl` + `Three.js` with gesture touch controls.
- **Biometric Security**: Face ID / Fingerprint student authentication via `expo-local-authentication`.
- **Deep Linking**: `roboverse://` scheme configuration.
- **Offline Sync**: `@react-native-async-storage/async-storage` circuit netlist caching for zero-internet simulation.

### Phase 7: Admin Control Center, Live Pricing Editor & Telemetry
- **Live Student Telemetry**: Real-time monitor of students actively working on hardware projects, what topics they are studying, and active MNA solver runs.
- **Zero-Redeploy Pricing Editor**: Real-time modification of plan prices (incl. 18% GST), daily Gemini AI rate caps, and store discounts.
- **Student Roster**: Track progress, completed circuits count, learning hours, and role promotion (`PRO_STUDENT`, `MENTOR`, `ADMIN`).
- **GST Invoices Audit**: Centralized audit repository of all generated 18% GST tax invoices.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: >= 20 LTS
- **npm**: >= 10
- **Redis**: Running locally (`redis://localhost:6379`) or via cloud instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/roboverse.git
cd roboverse

# Install dependencies across all workspaces
npm install
```

### 3. Running Services

```bash
# Run API backend (port 4000)
npm run dev:api

# Run Web client (port 3000)
npm run dev:web

# Run Background Worker
npm run dev:worker

# Run Mobile app (Expo Metro bundler)
npm run start:mobile
```

### 4. Running Test Suites
```bash
# Run full API test suite (all 9 suites, 67 tests)
npm run test:api

# Run Simulation Engine tests
npm run test:sim

# Run Mobile TypeScript verification
npm run typecheck:mobile
```

---

## 📜 Endpoints Overview

- **Web Frontend**: `http://localhost:3000`
- **API Server**: `http://localhost:4000`
- **Swagger Documentation**: `http://localhost:4000/api/docs`
- **Health Telemetry**: `http://localhost:4000/api/health`
- **Admin Control Center**: `http://localhost:3000/admin`
- **Circuit Lab**: `http://localhost:3000/workbench`
- **Rituu AI**: `http://localhost:3000/rituu`
- **Maker Shops Radar**: `http://localhost:3000/shops`
- **TechSavyyy Store**: `http://localhost:3000/store`
- **Hackathons Hub**: `http://localhost:3000/hackathons`

---

## 📄 License & Attribution
RoboVerse is built with original branding, icons, and 3D component artwork. Free for all students worldwide.
