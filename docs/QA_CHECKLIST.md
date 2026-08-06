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

*(Future steps will be appended here as they are completed.)*
