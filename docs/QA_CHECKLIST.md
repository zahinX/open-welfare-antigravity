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

### Step 3.3: Public Campaign Browsing
- **Automated Coverage:**
  - `tests/unit/public-campaign-service.test.ts` (service functions `getPublicCampaigns` and `getPublicCampaignById`)
  - `tests/unit/campaign-card.test.tsx` (UI components `ProgressBar` and `CampaignCard`)
  - `tests/e2e/campaign-browsing.spec.ts` (E2E navigation flow)
- **Manual QA Script:**
  1. Navigate to `http://localhost:3000` (Home page) as an unauthenticated visitor.
  2. Click "View Campaigns" in the hero section or "Campaigns" in the public navbar.
  3. Verify the `/campaigns` page displays all active and completed campaigns in a responsive card grid.
  4. Verify each card shows the campaign title, badge status, progress bar, raised amount, and target goal.
  5. Click on any campaign card to navigate to `/campaigns/[id]`.
  6. Verify the detailed campaign view renders full description, deadline, fundraising metrics, and back button.
  7. Verify draft/cancelled campaigns return a 404 Not Found page when accessed directly by ID.
- **Impact Matrix (Regression Check):**
  - `app/(public)/**`
  - `components/campaigns/**`
  - `lib/services/campaign.ts`
  - `components/dashboard/Sidebar.tsx`

### Step 3.4: Campaign Data & UI Refinement
- **Automated Coverage:**
  - `tests/unit/campaign-card.test.tsx` (International currency formatting, dynamic progress rendering)
  - `tests/unit/campaign-ui.test.tsx` (Campaign create/edit forms with multi-currency selector and verification metadata)
  - `tests/integration/campaign-actions.test.ts` (Validations and server actions for new currency and verification columns)
  - `tests/e2e/campaign-browsing.spec.ts` (Public browsing journey with updated high-contrast layout)
- **Manual QA Script:**
  1. Log in as an admin and go to `/dashboard/campaigns/new`.
  2. Create a campaign with a non-BDT currency (e.g. `USD`), custom verification text (e.g. `Verified by Mosque Admin Committee`), and a verification proof URL (e.g. `https://example.com/proof.pdf`).
  3. Submit and verify campaign creation succeeds.
  4. Edit the newly created campaign: verify that the base currency is locked/immutable with an explanatory note, but verification fields can be updated.
  5. Go to the public `/campaigns` page: verify the card renders the raised/target amount with the correct currency symbol (e.g. `$`).
  6. Click into `/campaigns/[id]`: verify the dynamic verification text is displayed with a live pulse indicator, and the "View Verification Proof" link correctly opens the external U  7. Check page aesthetics and verify high readability of small text and comfortable dark background (`bg-zinc-900`).

### Step 3.5: Donation Flow & Currency Conversion
- **Automated Coverage:**
  - `tests/unit/currency-service.test.ts` (Cross-currency math, exchange rate lookups, fallback rates, and rounding)
  - `tests/unit/donation-service.test.ts` (Supabase DB donation insertion, campaign queries, and donor lookups)
  - `tests/unit/donation-ui.test.tsx` (Donation modal, preset amounts, confirmation receipt, and supporter list anonymity)
  - `tests/integration/donation-actions.test.ts` (Zod schema validation, guest vs authenticated donors, active campaign verification, and cache revalidation)
  - `tests/e2e/donation-flow.spec.ts` (Playwright browser E2E test verifying full public donation flow, modal interactions, currency switching, and live conversion preview)
- **Manual QA Script:**
  1. Open `http://localhost:3000/campaigns` and click into an active campaign.
  2. Click the "Donate Now" button to open the Donation Modal.
  3. Verify the currency dropdown lists all global currencies (BDT, USD, EUR, GBP, etc.).
  4. Select a foreign currency (e.g. `USD`), click the `$25` preset or enter a custom amount.
  5. Verify the live conversion box accurately displays the equivalent credited amount in the campaign's base currency (e.g. `≈ ৳3,000.00 BDT`).
  6. Fill in optional donor info or check "Make my donation anonymous".
  7. Choose a payment channel (bKash/Nagad, Card, or Manual Cash) and submit the form.
  8. Verify the loading spinner appears during processing and resolves to the "Donation Confirmation" receipt card showing the transaction ID.
  9. Click "Done" and verify the progress bar updates with the new credited total, and the recent supporters list reflects the contribution.
- **Impact Matrix (Regression Check):**
  - `supabase/migrations/20260817000004_donations_and_progress_trigger.sql`
  - `lib/services/currency.ts` & `lib/services/donation.ts`
  - `lib/actions/donation.actions.ts`
  - `components/campaigns/DonationModal.tsx`, `DonationForm.tsx`, `DonationConfirmation.tsx`, `RecentSupportersList.tsx`
  - `app/(public)/campaigns/[id]/page.tsx`

---

## 📋 Phase 4: Beneficiary Management & Disbursement Tracking

### Step 4.1: Beneficiary Database Schema & API
- **Automated Coverage:**
  - `tests/unit/beneficiary-service.test.ts` (CRUD operations, pagination, search queries, status filtering, and aggregations)
  - `tests/unit/beneficiary-actions.test.ts` (Server Action auth enforcement, admin role guards, Zod validation errors, cache revalidation)
- **Manual QA Script:**
  1. Verify Supabase tables `beneficiaries` and `disbursements` exist with appropriate schema, foreign keys, and indexes.
  2. Verify that non-admin authenticated users or public visitors cannot invoke create/update/delete actions directly.
- **Impact Matrix (Regression Check):**
  - `supabase/migrations/20260818000000_beneficiary_tweaks.sql`
  - `lib/services/beneficiary.ts`
  - `lib/actions/beneficiary.actions.ts`
  - `lib/validations/beneficiary.ts`

### Step 4.2: Beneficiary Admin UI
- **Automated Coverage:** Build validation (`npm run build`) verifies `/dashboard/beneficiaries` and `/dashboard/beneficiaries/[id]/edit` static/dynamic compilation.
- **Manual QA Script:**
  1. Log in as an admin and navigate to `/dashboard/beneficiaries`.
  2. Verify the list of registered beneficiaries is displayed with name, contact, family size, status badge, and action buttons.
  3. Click "New Beneficiary" (`/dashboard/beneficiaries/new`), fill out the form, and submit.
  4. Verify redirect to the beneficiaries list and verify the new entry is present.
  5. Click "Edit", modify details, and verify updates persist.
  6. Click "Delete", confirm browser alert, and ensure record is removed.
- **Impact Matrix (Regression Check):**
  - `app/dashboard/beneficiaries/**`
  - `components/dashboard/beneficiaries/**`
  - `components/dashboard/Sidebar.tsx`

### Step 4.3: Disbursement Tracking
- **Automated Coverage:**
  - `tests/unit/disbursement-service.test.ts` (Disbursement creation, campaign linking, joined queries, and stats calculation)
  - `tests/unit/disbursement-actions.test.ts` (Server Action admin authorization, input validation, and cache invalidation)
- **Manual QA Script:**
  1. Navigate to `/dashboard/disbursements`.
  2. Click "Record Disbursement" (`/dashboard/disbursements/new`).
  3. Select a beneficiary, optionally link to a campaign, enter amount, description, and submit.
  4. Verify the disbursement appears in the disbursement log table with formatted currency and linked names.
  5. Click "Edit" or "Delete" and confirm changes are accurately reflected.
- **Impact Matrix (Regression Check):**
  - `app/dashboard/disbursements/**`
  - `components/dashboard/disbursements/**`
  - `lib/services/disbursement.ts`
  - `lib/actions/disbursement.actions.ts`
