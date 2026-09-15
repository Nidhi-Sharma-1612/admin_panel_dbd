# Design by Dial — Admin Panel

A multi-tenant content admin for Design by Dial's client vacation rental sites (mydreamvacation.net, kevin/louise/vip.weblaucher.com, and any future site). One login manages every site's FAQs, marketing pages, and settings through a generic block editor — no code deploy needed for content changes.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **Drizzle ORM** + **Postgres** (self-hosted)
- **MinIO** (S3-compatible) for media storage
- **Tailwind CSS 4**
- Cookie-based sessions (bcrypt password hashing, no third-party auth provider)

## Getting started

1. Copy `.env.example` to `.env.local` and fill in real values:
   - `DATABASE_URL` — your Postgres connection string
   - `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_URL_BASE` — your S3-compatible storage (MinIO)
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — optional, only used by the seed script (see below)

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run migrations against your database:

   ```bash
   npm run db:migrate
   ```

4. Seed initial data (creates the first super-admin user and the default sites/pages):

   ```bash
   npm run db:seed
   ```

   If `SEED_ADMIN_PASSWORD` isn't set, a random password is generated and printed once — copy it immediately, it isn't shown again. **Change it via the Account page after your first login.**

5. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and sign in.

## Roles

- **`super_admin`** (Design by Dial staff) — sees every site, plus a cross-site **Super Admin Panel** dashboard (total sites/users, activity across every site, user management). Selectable as "Super Admin Panel" from the site switcher, or per-site like any other user.
- **`admin`** (a client) — scoped to only the sites they're explicitly granted via `user_sites`. No access to user management.

## Project structure

- `src/app/(admin)/` — the authenticated admin UI: Overview, FAQs, Pages (generic block editor), Activity, Users (super admin only), Settings, Account
- `src/app/api/public/[site]/` — read-only API consumed by each client site's frontend (settings, FAQs, page sections), scoped by site slug + API key
- `src/app/login/` — sign-in page
- `src/components/` — shared UI (sidebar, admin shell, generic block-editor fields)
- `src/db/schema.ts` — Drizzle schema (sites, users, user_sites, sessions, site_settings, pages, page_sections, faqs, media, activity_log, api_keys)
- `src/db/seed.ts` — one-time seed script (admin user + default sites/pages)
- `src/lib/auth.ts` — session/auth logic and role helpers
- `src/lib/storage.ts` — S3/MinIO upload helper
- `drizzle/` — generated SQL migrations

## Useful scripts

| Script                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Start the dev server (Turbopack)                  |
| `npm run build`       | Production build                                  |
| `npm run lint`        | Run ESLint                                        |
| `npm run db:generate` | Generate a new migration from schema changes      |
| `npm run db:migrate`  | Apply migrations to the database                  |
| `npm run db:studio`   | Open Drizzle Studio to browse the database        |
| `npm run db:seed`     | Seed the initial admin user + default sites/pages |
