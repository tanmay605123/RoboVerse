# RoboVerse database structure

This repository currently contains two database-facing models on the same Supabase PostgreSQL project:

1. **Supabase Auth + `public` application tables** use UUID `auth.users` IDs and are accessed by the Next.js client with Supabase.
2. **Prisma backend tables** use the models in `apps/api/prisma/schema.prisma`. The backend auth route writes the Prisma `public."User"` graph.

These are not aliases. A row in `auth.users` or `public.profiles` does not automatically create a row in `public."User"`.

## Signup ownership

The web email/password signup now calls `POST /api/v1/auth/register`. That backend transaction creates these records together:

| Table | Created during backend signup | Why it exists |
|---|---:|---|
| `public."User"` | Yes | Backend identity, password hash, role, status, email and mobile number. |
| `public."StudentProfile"` | Yes | Student academic details, interests and gamification baseline. |
| `public."StudentID"` | Yes | Verifiable RoboVerse student ID and QR verification data. |
| `public."Subscription"` | Yes | Starts every new account on the free plan. |
| `public."Plan"` | Read/upsert | Stores the plan catalogue; the free plan is referenced by the subscription. |

Supabase Auth signup is still used by legacy OAuth/OTP flows and by existing Supabase-authenticated accounts. A Supabase signup creates `auth.users`, and the `on_auth_user_created` trigger creates `public.profiles`; it does **not** create the Prisma `public."User"` record.

## Prisma tables (`apps/api/prisma/schema.prisma`)

All of the following Prisma models use the PostgreSQL `public` schema. Prisma preserves the model names as quoted table names unless a mapping is added, so `User` is normally `public."User"` and `StudentProfile` is `public."StudentProfile"`.

| Table | Usage | Why it is there |
|---|---|---|
| `"User"` | Backend account, role, status and credentials | Central parent record for backend-owned users and relations. Passwords are stored as hashes only. |
| `"StudentProfile"` | Name, DOB, school, class, location, interests, level and XP | Keeps student profile data separate from login/account data. |
| `"StudentID"` | Student ID, QR data, verification hash and validity dates | Provides a verifiable digital student passport. |
| `"Plan"` | Free/Plus/Pro/Institution catalogue and JSON features/pricing | Defines what each subscription tier offers. |
| `"Subscription"` | User plan, billing period, status and Razorpay identifiers | Tracks access entitlements over time. |
| `"Payment"` | Razorpay order/payment, amount, invoice and payment status | Audits money movement and links it to subscriptions/orders. |
| `"Coupon"` | Coupon code, discount, validity and usage counters | Applies and limits promotional discounts. |
| `"UsageMeter"` | Daily AI text, photo and code-review counters | Enforces plan usage limits and tracks estimated AI cost. |
| `"Course"` | Published course catalogue and plan requirement | Defines the learning curriculum. |
| `"Lesson"` | Ordered course content, video, markdown and optional quiz | Breaks courses into learnable units. |
| `"Quiz"` | Quiz questions and passing score | Assesses lesson knowledge. |
| `"Progress"` | Per-user course/lesson completion and score | Records learning progress. |
| `"Badge"` | Achievement definition, icon, category and XP reward | Defines reusable gamification achievements. |
| `"Certificate"` | Course certificate number, grade, QR and verification URL | Proves course completion and supports public verification. |
| `"CircuitProject"` | User circuit title, components, wires, code and visibility | Stores saved RoboVerse circuit projects. |
| `"Component"` | Component catalogue, 3D model, pins, defaults and price | Powers the circuit builder and component store. |
| `"Simulation"` | Circuit state, netlist and simulation errors for a project | Stores simulation runs/results associated with a circuit. |
| `"ChatSession"` | Rituu conversation metadata and optional project link | Groups assistant conversations. |
| `"ChatMessage"` | Individual user/Rituu messages, code, diagnostics and snapshots | Stores the content inside a chat session. |
| `"LiveClass"` | Scheduled class, instructor, meeting and recording details | Defines live learning events. |
| `"Enrollment"` | User registration and attendance for a live class | Connects students to live classes. |
| `"Project"` | Guided real-world project catalogue and parts list | Defines milestone-based projects. |
| `"Submission"` | User milestone submission, media, links, feedback and grade | Tracks student work against a guided project. |
| `"Event"` | Hackathon/competition details, location, dates and prize | Provides the event catalogue. |
| `"Notification"` | User message, type, read state and action URL | Delivers in-app notifications. |
| `"Shop"` | Physical shop address, location, hours and stocked components | Supports nearby robotics/electronics shops. |
| `"Product"` | Store product catalogue, price, stock, images and specs | Defines items that can be purchased. |
| `"Order"` | User order number, totals, tax, shipping and status | Represents a purchase. |
| `"OrderItem"` | Product, quantity and price snapshot inside an order | Preserves exactly what was ordered even if a product changes later. |
| `"Cart"` | One saved cart per backend user | Stores an in-progress purchase. |
| `"Review"` | User product rating and comment | Collects product feedback. |
| `"Post"` | Community post content and optional project snapshot | Provides the community feed. |
| `"Comment"` | User comment attached to a post | Supports post discussions. |
| `"Institution"` | School/college identity, contact and license limits | Supports institution plans and administration. |
| `"Batch"` | Institution academic batch and student count | Groups institution users by academic year. |
| `"Class"` | Teacher class, subject, section and invite code | Defines classroom workspaces. |
| `"ClassEnrollment"` | Student membership in a class | Connects users to teacher classes. |
| `"Assignment"` | Class instructions, due date, rubric and starter circuit | Defines teacher-assigned work. |
| `"ProjectVersion"` | Versioned components, wires and code for a circuit | Enables project history and rollback. |
| `"Collection"` | User project folders with name, colour and visibility | Organizes saved circuit projects. |

## Supabase application tables

These tables are created by the SQL migrations under `supabase/migrations/` and the consolidated setup script. They use snake_case names and generally reference `auth.users` through `public.profiles`.

| Table | Usage | Why it is there |
|---|---|---|
| `auth.users` | Supabase-managed email/phone identity, login providers and password credential metadata | The source of truth for Supabase Auth accounts. Never insert passwords directly. |
| `public.profiles` | Supabase user profile, role, student ID, location, XP and activity | Frontend/RLS-facing profile linked 1:1 to `auth.users`; created by the auth trigger. |
| `public.consents` | General user consent records | Provides an auditable consent history. |
| `public.parental_consents` | Guardian consent for minor accounts | Supports child privacy and parental approval requirements. |
| `public.plans` | Supabase-side plan catalogue | Supports Supabase/RLS functions and frontend entitlement views. It is separate from Prisma `"Plan"`. |
| `public.subscriptions` | Supabase-side user subscription state | Supports frontend entitlement queries and payment workflows. It is separate from Prisma `"Subscription"`. |
| `public.payments` | Supabase-side payment records | Supports client/RLS-facing payment history. |
| `public.refunds` | Refund records and actor information | Audits refunds without deleting original payments. |
| `public.webhook_events` | Idempotency records for provider webhooks | Prevents duplicate processing of payment/provider callbacks. |
| `public.coupons` | Supabase-side coupon catalogue | Supports client-facing coupon validation. |
| `public.courses` | Course catalogue | Stores learning content available to Supabase-authenticated users. |
| `public.modules` | Course grouping between courses and lessons | Organizes curriculum hierarchy. |
| `public.lessons` | Lesson content and ordering | Stores individual learning units. |
| `public.enrollments` | User course/class enrollment | Records access and enrollment state. |
| `public.lesson_progress` | Per-user lesson completion and score | Tracks learning progress in the Supabase model. |
| `public.quizzes` | Quiz definitions | Stores questions and passing rules. |
| `public.quiz_attempts` | User quiz submissions and scores | Keeps assessment history. |
| `public.certificates` | Completion certificate records | Supports certificate display and verification. |
| `public.components` | Component catalogue | Supplies frontend circuit-builder parts. |
| `public.circuit_projects` | Supabase user circuit projects | Stores projects accessed directly by the Next.js client. |
| `public.circuit_project_versions` | Circuit project history | Preserves revisions of client-side projects. |
| `public.robot_templates` | Reusable robot templates | Provides starting points for robot designs. |
| `public.robot_designs` | User robot designs | Stores saved robot-builder designs. |
| `public.arenas` | Simulation/challenge arenas | Defines environments for robot tests. |
| `public.test_runs` | User simulation/test execution results | Stores test outcomes and diagnostics. |
| `public.activity_events` | User activity/audit events | Powers activity feeds and analytics. |
| `public.chat_sessions` | Supabase-side Rituu sessions | Stores assistant conversation metadata. |
| `public.chat_messages` | Supabase-side Rituu messages | Stores conversation content. |
| `public.rituu_usage` | Daily Rituu usage counters | Enforces assistant limits for Supabase users. |
| `public.ai_cost_log` | AI request cost records | Tracks provider usage and estimated spend. |
| `public.shops` | Nearby shop directory | Supports local component discovery. |
| `public.shop_inventory` | Shop/component stock mapping | Shows what a shop currently carries. |
| `public.shop_reports` | User-reported shop issues | Moderates directory quality. |
| `public.product_categories` | Store category catalogue | Organizes products. |
| `public.products` | Supabase-side product catalogue | Supports storefront/RLS queries. |
| `public.kits` | Product kit definitions | Groups products into robotics kits. |
| `public.kit_items` | Product membership in kits | Links kit contents to products and quantities. |
| `public.addresses` | Saved user shipping addresses | Separates reusable addresses from orders. |
| `public.carts` | Supabase-side user carts | Stores one active cart per user. |
| `public.cart_items` | Products in a cart | Stores cart quantities and price snapshots. |
| `public.orders` | Supabase-side order headers | Represents storefront purchases. |
| `public.order_items` | Products inside Supabase orders | Preserves order line items. |
| `public.order_events` | Order status/audit history | Tracks fulfillment changes. |
| `public.shipments` | Shipment and tracking data | Connects an order to delivery information. |
| `public.invoices` | Tax invoice records | Provides billing documents. |
| `public.hackathons` | Hackathon catalogue | Lists events students can discover. |
| `public.hackathon_registrations` | User registrations for hackathons | Connects students to events. |
| `public.notifications` | Supabase-side notifications | Delivers user alerts. |
| `public.audit_log` | Security and administrative actions | Provides an immutable operational audit trail. |
| `public.daily_stats` | Aggregated daily platform metrics | Supports dashboards without scanning every event. |
| `public.feature_flags` | Feature enable/disable switches | Enables controlled rollout of features. |
| `public.app_config` | Non-secret application configuration | Centralizes public runtime settings; secrets must not be stored here. |

## Important operational notes

- Do not expect a backend signup to appear in `auth.users`; it writes Prisma `public."User"` instead.
- Do not expect a Supabase signup to appear in Prisma `public."User"`; it writes `auth.users` and the trigger-created `public.profiles` instead.
- The password columns in both systems must contain hashes managed by their respective auth implementation. Never log or copy plaintext passwords.
- `DATABASE_URL` is used by Prisma on the backend. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are public browser configuration and are needed by Supabase frontend features; `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains a legacy fallback only. Neither is a PostgreSQL password.
- The backend should use the Supabase pooler hostname in `DATABASE_URL` on Render. Direct IPv6 database hosts can fail with `No route to host` on some networks.
