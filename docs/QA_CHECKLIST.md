# Open Welfare — QA & Testing Checklist

> **Status:** Active  
> **Last Updated:** 2026-08-06

This document contains structured manual testing plans and regression matrices for every completed phase and sub-step of the Open Welfare project.

---

## 📋 Phase 1: Foundation & Scaffolding

### Step 1.1: Project Scaffolding & Local Config
- **Automated Coverage:** Verified via `npm run build`. Basic tests directory scaffolded.
- **Manual QA Script:**
  1. Open `http://localhost:3000`
  2. Verify the custom Open Welfare landing page loads successfully with the emerald/teal gradient.
  3. Verify dark mode / light mode renders correctly according to system preferences.
- **Impact Matrix (Regression Check):**
  - Next.js root layout metadata
  - `page.tsx` rendering

### Step 1.2: Specification Docs Initialization
- **Automated Coverage:** N/A (Documentation only step).
- **Manual QA Script:**
  1. Open `docs/PRD.md` and verify all 3 core features (Campaigns, Beneficiaries, Shifts) have defined requirements.
  2. Open `docs/DATABASE_SCHEMA.md` and verify 7 core tables are defined with specific RLS policies (Read/Write access mapped to roles).
- **Impact Matrix (Regression Check):**
  - Project Scope / Roadmap alignment.

### Step 1.3: Testing Suite Setup
- **Automated Coverage:** 
  - Vitest configured for unit/integration testing (JS DOM environment).
  - Playwright configured for E2E testing against `http://localhost:3000`.
  - `tests/unit/sanity.test.ts` implemented to verify runner works.
- **Manual QA Script:**
  1. Run `npm run test` in terminal.
  2. Verify output shows 1 passed test file (`sanity.test.ts`) and 2 passed tests.
  3. Run `npm run test:e2e` in terminal (Note: may require `npx playwright install` first time).
- **Impact Matrix (Regression Check):**
  - Project configuration files (`package.json`, `vitest.config.ts`, `playwright.config.ts`).

### Step 1.4: Local Supabase CLI Setup
- **Automated Coverage:** N/A (CLI configuration and SQL schema definitions).
- **Manual QA Script:**
  1. Open terminal and run `npx supabase start` (requires Docker to be running).
  2. Verify that Supabase starts successfully and the local Studio URL is printed (usually `http://127.0.0.1:54323`).
  3. Open the Supabase Studio URL in the browser, navigate to the Table Editor, and verify that the 7 core tables (`profiles`, `campaigns`, `donations`, etc.) are created.
  4. Verify that RLS is enabled for all tables in the Authentication/Policies section.
- **Impact Matrix (Regression Check):**
  - Database schema integrity.

### Step 2.1: Supabase Auth Integration
- **Automated Coverage:** N/A (Server-side auth utilities; E2E tests will cover this in Auth UI steps).
- **Manual QA Script:**
  1. Open terminal and run `npm run build`.
  2. Verify that the build succeeds without errors related to `@supabase/ssr` or `proxy.ts`.
  3. Verify the Route listing output shows `ƒ Proxy (Middleware)`.
- **Impact Matrix (Regression Check):**
  - Next.js root request interception (middleware/proxy).
  - API routes and Server Actions (they will now start consuming these utility clients).

*(Future steps will be appended here as they are completed.)*

### Step 2.2: Auth UI Pages
- **Automated Coverage:** Build check (`npm run build`) confirms all 3 pages compile and are registered as dynamic routes.
- **Manual QA Script:**
  1. Run `npm run dev` and open `http://localhost:3000/login`.
  2. Verify the login form renders with email and password fields.
  3. Open `http://localhost:3000/register` — verify full name, email, password fields.
  4. Open `http://localhost:3000/forgot-password` — verify email field and submit button.
  5. From `/login`, click "Forgot password?" — verify navigation to `/forgot-password`.
  6. From `/login`, click "Create one" — verify navigation to `/register`.
  7. Verify unauthenticated visit to `/dashboard` redirects to `/login` (requires Supabase running with `.env.local` set).
- **Impact Matrix (Regression Check):**
  - `/login`, `/register`, `/forgot-password` route registrations.
  - Proxy redirect logic for `/dashboard` protection.
  - `app/(auth)/actions.ts` server actions.

### Step 2.3: Core Application Shell
- **Automated Coverage:** Build check (`npm run build`) confirms `/dashboard` routes and layout compile.
- **Manual QA Script:**
  1. Log in as an admin user and navigate to `/dashboard`.
  2. Verify the sidebar renders with role-specific navigation links.
  3. Verify the sign out action correctly terminates the session and redirects to `/login`.
- **Impact Matrix (Regression Check):**
  - `app/dashboard/layout.tsx`
  - `components/dashboard/Sidebar.tsx`

---

## 📋 Phase 3: Campaign Management (Public Donations)

### Step 3.1: Campaign Database Schema & API
- **Automated Coverage:** Schema migrations verified, Zod input validation schemas unit-tested.
- **Manual QA Script:**
  1. Verify Supabase tables for `campaigns` exist with appropriate columns and RLS policies.
  2. Verify server actions (`createCampaignAction`, `updateCampaignAction`, `deleteCampaignAction`) execute successfully with proper admin permission checks.
- **Impact Matrix (Regression Check):**
  - `lib/services/campaign.ts`
  - `lib/actions/campaign.actions.ts`
  - `lib/validations/campaign.ts`

### Step 3.2: Admin Campaign Management UI
- **Automated Coverage:** `tests/unit/campaign-ui.test.tsx` testing Campaign list, creation, editing, and deletion interactions.
- **Manual QA Script:**
  1. Navigate to `/dashboard/campaigns` as an admin.
  2. Click "New Campaign" to navigate to `/dashboard/campaigns/new`.
  3. Fill out the campaign form (Title, Description, Target Amount, Status, Deadline) and click "Create Campaign".
  4. Verify the new campaign appears in the list on `/dashboard/campaigns`.
  5. Click "Edit" on a campaign, change its title or status, and verify the updates persist.
  6. Click "Delete" on a campaign and confirm deletion removes it from the table.
- **Impact Matrix (Regression Check):**
  - `app/dashboard/campaigns/**`
  - `components/dashboard/campaigns/CampaignForm.tsx`
  - `components/dashboard/campaigns/DeleteCampaignButton.tsx`
