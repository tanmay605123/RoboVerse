# RoboVerse

RoboVerse is a robotics and electronics learning platform. This repository contains a Next.js web app, an Express API, shared TypeScript packages, an Expo mobile app, a background worker, and Supabase database assets.

The web app includes learning, circuit workbench/simulation, robotics, and related product areas. Integrations such as Supabase, Gemini, Razorpay, maps, PostgreSQL, and Redis require their corresponding credentials and services; the presence of code or configuration does not mean a production service is connected or verified.

## Repository layout

```text
apps/
  web/          Next.js 14 web app (development server on port 3001)
  api/          Express API and Prisma schema
  mobile/       Expo / React Native app
  worker/       BullMQ background worker
packages/
  shared/       Shared clients, types, and catalog data
  sim-engine/   Circuit simulation package
  components-lib/ Hardware component definitions and artwork
  ui-tokens/    Shared UI tokens
supabase/
  migrations/   SQL migrations
  functions/    Supabase Edge Functions
  tests/        Database tests
scripts/        Project QA and utility scripts
```

## Requirements

- Node.js 20 or newer and npm 10 or newer
- Docker and Supabase CLI only if running the local Supabase stack
- PostgreSQL and Redis only for API/worker features that use those services

## Get started

```bash
npm install
```

Create local environment files from the supplied templates only for the apps you plan to run. For the web app:

```powershell
Copy-Item .env.example apps/web/.env.local
```

Then add the values needed for your setup. Do not commit `.env` files or put server-only secrets in variables prefixed with `NEXT_PUBLIC_` or `EXPO_PUBLIC_`.

Start the web app:

```bash
npm run dev:web
```

Open [http://localhost:3001](http://localhost:3001). The root `start` script serves the production web build on port 3000.

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

The API and worker need their own environment configuration and backing services. Check each app's package scripts and environment template before starting them.

## Supabase

SQL migrations and Edge Functions are under `supabase/`. To use a local Supabase instance, start Docker, install the Supabase CLI, and run:

```bash
supabase start
supabase db reset
```

For a hosted project, review the SQL migrations and policies, link the CLI to the intended project, and apply migrations through the normal Supabase workflow. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser use. Privileged keys such as `SUPABASE_SERVICE_ROLE_KEY` must remain server-side. Database migrations, auth policies, and project credentials should be checked in the target Supabase project before calling a live integration verified.

## Configuration reference

`.env.example` lists the available variables. Common integrations include:

| Variables | Used for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Web Supabase client | Publishable key is designed for client use with appropriate RLS policies. |
| `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` | Privileged server/database operations | Server-only secrets; never expose to the browser. |
| `GEMINI_API_KEY` | AI tutor | Keep server-side. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Payment routes | Use test credentials until the payment flow is configured and verified. |
| `GOOGLE_MAPS_SERVER_KEY`, `GOOGLE_PLACES_SERVER_KEY` | Maps/Places server features | Restrict provider keys to the required APIs and environments. |
| `REDIS_URL` | API/worker queues and cache | Required only for code paths that use Redis. |

Some variables are optional until their feature is enabled. Avoid sharing secret values in issues, commits, or screenshots.

## Vercel deployment

The web app is in an npm workspace. For a Vercel project building from this repository, use the repository root as the Root Directory and the checked-in `vercel.json` build configuration (`npm run build:web`). Add only the required web environment variables in the Vercel project settings. Server-only values must not use a public prefix.

The API and worker are separate apps; deploying the web app does not automatically deploy or start them. Configure and deploy those services separately if needed, then set the web app's API URL to the deployed API. Verify the production build and required external services in the target environment before launch.

## Contributing

1. Create a branch for your change.
2. Install dependencies with `npm install`.
3. Run the relevant build, lint, and tests for the code you changed.
4. Open a pull request describing the change and the checks you ran.

Do not include generated build output, local environment files, credentials, or dependency folders in commits.

## License

The root `package.json` declares the project license as MIT. Check third-party assets and dependencies for their own license terms before redistribution.
