# 🤖 RoboVerse: 3D Robotics & Electronics Learning Platform

> **"Learn it. Build it. Simulate it."**

RoboVerse is a next-generation 3D robotics and electronics learning platform built with Next.js 14, Three.js, React Native / Expo, and Supabase.

---

## 🌐 1. Live Deployed Website (Vercel Production)

The application is deployed live on **Vercel** with full SSL, global CDN, and real-time backend connectivity:

- 🚀 **Official Vercel URL**: **[https://roboverse-delta.vercel.app](https://roboverse-delta.vercel.app)**
- 🎛️ **3D Circuit Workbench**: [https://roboverse-delta.vercel.app/workbench](https://roboverse-delta.vercel.app/workbench)
- 🤖 **Rituu AI Assistant Station**: [https://roboverse-delta.vercel.app/rituu](https://roboverse-delta.vercel.app/rituu)
- 📊 **Student Dashboard & 3D Passport**: [https://roboverse-delta.vercel.app/dashboard](https://roboverse-delta.vercel.app/dashboard)
- 🛒 **TechSavyyy Hardware Store**: [https://roboverse-delta.vercel.app/store](https://roboverse-delta.vercel.app/store)
- 🏆 **Hackathons Hub**: [https://roboverse-delta.vercel.app/hackathons](https://roboverse-delta.vercel.app/hackathons)
- 📍 **Nearby Component Shops Radar**: [https://roboverse-delta.vercel.app/shops](https://roboverse-delta.vercel.app/shops)
- 🔐 **Admin Control Center**: [https://roboverse-delta.vercel.app/admin](https://roboverse-delta.vercel.app/admin)
  - *Admin Credentials*: Email: `admin@roboverse.io` | Password: `Admin@12345`

---

## 📁 Repository layout

```text
apps/
  web/          Next.js 14 web app (development server on port 3000)
  api/          Express API and Prisma schema
  mobile/       Expo / React Native app
  worker/       BullMQ background worker
packages/
  shared/       Shared clients, types, and catalog data
  sim-engine/   Circuit simulation and robotics physics package
  components-lib/ Hardware component definitions and artwork
  ui-tokens/    Shared UI tokens
supabase/
  migrations/   SQL migrations
  functions/    Supabase Edge Functions
  tests/        Database tests
scripts/        Project QA and utility scripts
```

## Requirements

- Node.js 18 or newer and npm 9 or newer
- Docker and Supabase CLI for running the local Supabase stack (optional)
- PostgreSQL and Redis for API/worker features

## Get started

```bash
npm install
```

Start the web app:

```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000).

Other available workspace commands include:

```bash
npm run dev:api
npm run start:mobile
npm run dev:worker
npm run build:web
npm run lint
npm run test:api
npm run test:sim
```

## Supabase

SQL migrations and Edge Functions are under `supabase/`.
Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser use. Privileged keys such as `SUPABASE_SERVICE_ROLE_KEY` must remain server-side.

## Vercel deployment

The web app is in an npm workspace. For a Vercel project building from this repository, use the repository root as the Root Directory and the checked-in `vercel.json` build configuration (`npm run build:web`). Add only the required web environment variables in the Vercel project settings.

## Contributing

1. Create a branch for your change.
2. Install dependencies with `npm install`.
3. Run the relevant build, lint, and tests for the code you changed.
4. Open a pull request describing the change and the checks you ran.

## License

MIT
