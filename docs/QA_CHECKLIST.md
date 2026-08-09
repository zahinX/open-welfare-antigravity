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
