# Open Welfare — Project Roadmap

> **Last Updated:** 2026-08-06  
> **Tracking Convention:** `[x]` Done · `[/]` In Progress · `[ ]` Pending

---

## Phase 1 — Foundation & Scaffolding

### Step 1.1: Project Scaffolding & Local Config ✅
- [x] Initialize Next.js with App Router, TypeScript, Tailwind CSS — *2026-08-06*
- [x] Create repository directory structure (`docs/`, `tests/`, `.github/`) — *2026-08-06*
- [x] Create `.env.example` with local placeholders — *2026-08-06*
- [x] Populate `docs/PROJECT_ROADMAP.md` with full phase breakdown — *2026-08-06*

### Step 1.2: Specification Docs Initialization ✅
- [x] Populate `docs/PRD.md` with functional specs (campaigns, beneficiary logs, volunteer shifts) — *2026-08-06*
- [x] Populate `docs/DATABASE_SCHEMA.md` with Supabase tables, fields, RLS rules — *2026-08-06*

### Step 1.3: Testing Suite Setup ✅
- [x] Install and configure Vitest (unit/integration) — *2026-08-06*
- [x] Install and configure Playwright (E2E) — *2026-08-06*
- [x] Create `tests/unit/sanity.test.ts` — verify runner passes — *2026-08-06*
- [x] Add `npm run test` script to `package.json` — *2026-08-06*

### Step 1.4: Local Supabase CLI Setup ✅
- [x] Initialize Supabase locally (`npx supabase init`) — *2026-08-06*
- [x] Create initial migration scripts reflecting `DATABASE_SCHEMA.md` — *2026-08-06*

---

## Phase 2 — Authentication & Core Layout

### Step 2.1: Supabase Auth Integration ✅
- [x] Install `@supabase/supabase-js` and `@supabase/ssr` — *2026-08-06*
- [x] Create Supabase client utilities (browser + server) — *2026-08-06*
- [x] Implement proxy for session management — *2026-08-06*
- [x] Create auth callback route handler — *2026-08-06*

### Step 2.2: Auth UI Pages ✅
- [x] Build `/login` page with email/password sign-in — *2026-08-10*
- [x] Build `/register` page with email/password sign-up — *2026-08-10*
- [x] Build `/forgot-password` page — *2026-08-10*
- [x] Add auth state management and redirect logic — *2026-08-10*

### Step 2.3: Core Application Shell ✅
- [x] Build responsive sidebar/navigation layout — *2026-08-13*
- [x] Create dashboard shell (`/dashboard`) — *2026-08-13*
- [x] Implement role-based nav items (Admin vs. Public) — *2026-08-13*
- [x] Add global error boundary and loading states — *2026-08-13*

---

## Phase 3 — Campaign Management (Public Donations) ✅

### Step 3.1: Campaign Database Schema & API ✅
- [x] Create `campaigns` table migration with RLS — *2026-08-17*
- [x] Build server actions for CRUD operations — *2026-08-17*
- [x] Add input validation with Zod schemas — *2026-08-17*

### Step 3.2: Admin Campaign Management UI ✅
- [x] Build `/dashboard/campaigns` list page — *2026-08-17*
- [x] Build `/dashboard/campaigns/new` create form — *2026-08-17*
- [x] Build `/dashboard/campaigns/[id]/edit` edit form — *2026-08-17*
- [x] Add campaign status management (draft/active/completed) — *2026-08-17*

### Step 3.3: Public Campaign Browsing ✅
- [x] Build `/campaigns` public listing page — *2026-08-17*
- [x] Build `/campaigns/[id]` campaign detail page — *2026-08-17*
- [x] Add campaign progress bar and donation stats — *2026-08-17*
- [x] Implement responsive card grid layout — *2026-08-17*

### Step 3.4: Campaign Data & UI Refinement ✅
- [x] Improve global UI contrast (lighter dark backgrounds, better text visibility) — *2026-08-17*
- [x] Add `currency` column to `campaigns` table and form (e.g. BDT, USD) — *2026-08-17*
- [x] Add `verification_text` and `verification_link` columns to `campaigns` table — *2026-08-17*
- [x] Make campaign verification info dynamic in the public detail view — *2026-08-17*

### Step 3.5: Donation Flow ✅
- [x] Create `donations` table migration with RLS — *2026-08-17*
- [x] Build donation form component with live currency conversion — *2026-08-17*
- [x] Implement donation recording server action — *2026-08-17*
- [x] Add donation confirmation and receipt display — *2026-08-17*

---

## Phase 4 — Beneficiary Management ✅

### Step 4.1: Beneficiary Database Schema & API ✅
- [x] Create `beneficiaries` table migration with RLS — *2026-08-18*
- [x] Build server actions for CRUD operations — *2026-08-18*
- [x] Add admin-only access controls — *2026-08-18*

### Step 4.2: Beneficiary Admin UI ✅
- [x] Build `/dashboard/beneficiaries` list page with filters — *2026-08-18*
- [x] Build `/dashboard/beneficiaries/new` create form — *2026-08-18*
- [x] Build `/dashboard/beneficiaries/[id]/edit` detail/edit page — *2026-08-18*
- [x] Add beneficiary status tracking (pending/approved/disbursed) — *2026-08-18*

### Step 4.3: Disbursement Tracking ✅
- [x] Create `disbursements` table migration with RLS — *2026-08-18*
- [x] Build disbursement log UI — *2026-08-18*
- [x] Link disbursements to campaigns and beneficiaries — *2026-08-18*
- [x] Add reporting and export functionality — *2026-08-18*

---

## Phase 5 — Volunteer Shift Management ✅

### Step 5.1: Volunteer Database Schema & API ✅
- [x] Create `volunteer_shifts` table migration with RLS — *2026-08-18*
- [x] Create `volunteer_signups` table migration with RLS — *2026-08-18*
- [x] Build server actions for shift management — *2026-08-18*

### Step 5.2: Admin Shift Management UI ✅
- [x] Build `/dashboard/volunteers/shifts` list page — *2026-08-18*
- [x] Build `/dashboard/volunteers/shifts/new` create form — *2026-08-18*
- [x] Build shift detail page with signup roster — *2026-08-18*
- [x] Add shift status management — *2026-08-18*

### Step 5.3: Public Volunteer Sign-Up ✅
- [x] Build `/volunteer` public page with available shifts — *2026-08-18*
- [x] Implement volunteer sign-up flow — *2026-08-18*
- [x] Add sign-up confirmation and calendar integration — *2026-08-18*
- [x] Build volunteer profile/history page — *2026-08-18*

---

## Phase 6 — Dashboard Analytics & Reporting

### Step 6.1: Admin Dashboard Widgets
- [ ] Total donations summary card
- [ ] Active campaigns overview
- [ ] Beneficiary distribution chart
- [ ] Volunteer participation metrics

### Step 6.2: Reporting Pages
- [ ] Build financial summary reports
- [ ] Build campaign performance reports
- [ ] Add date-range filtering
- [ ] Implement CSV/PDF export

---

## Phase 7 — Polish, Accessibility & Performance

### Step 7.1: Accessibility Audit
- [ ] ARIA labels and semantic HTML review
- [ ] Keyboard navigation testing
- [ ] Screen reader compatibility
- [ ] Color contrast compliance (WCAG 2.1 AA)

### Step 7.2: Performance Optimization
- [ ] Lighthouse audit and optimization
- [ ] Image optimization and lazy loading
- [ ] Bundle analysis and code splitting
- [ ] Core Web Vitals compliance

### Step 7.3: Documentation & Open Source Prep
- [ ] Finalize README.md with setup instructions
- [ ] Add CONTRIBUTING.md
- [ ] Add LICENSE (MIT)
- [ ] Final review of all docs/
