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

### Step 1.2: Specification Docs Initialization
- [ ] Populate `docs/PRD.md` with functional specs (campaigns, beneficiary logs, volunteer shifts)
- [ ] Populate `docs/DATABASE_SCHEMA.md` with Supabase tables, fields, RLS rules

### Step 1.3: Testing Suite Setup
- [ ] Install and configure Vitest (unit/integration)
- [ ] Install and configure Playwright (E2E)
- [ ] Create `tests/unit/sanity.test.ts` — verify runner passes
- [ ] Add `npm run test` script to `package.json`

### Step 1.4: Local Supabase CLI Setup
- [ ] Initialize Supabase locally (`npx supabase init`)
- [ ] Create initial migration scripts reflecting `DATABASE_SCHEMA.md`

---

## Phase 2 — Authentication & Core Layout

### Step 2.1: Supabase Auth Integration
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] Create Supabase client utilities (browser + server)
- [ ] Implement middleware for session management
- [ ] Create auth callback route handler

### Step 2.2: Auth UI Pages
- [ ] Build `/login` page with email/password sign-in
- [ ] Build `/register` page with email/password sign-up
- [ ] Build `/forgot-password` page
- [ ] Add auth state management and redirect logic

### Step 2.3: Core Application Shell
- [ ] Build responsive sidebar/navigation layout
- [ ] Create dashboard shell (`/dashboard`)
- [ ] Implement role-based nav items (Admin vs. Public)
- [ ] Add global error boundary and loading states

---

## Phase 3 — Campaign Management (Public Donations)

### Step 3.1: Campaign Database Schema & API
- [ ] Create `campaigns` table migration with RLS
- [ ] Build server actions for CRUD operations
- [ ] Add input validation with Zod schemas

### Step 3.2: Admin Campaign Management UI
- [ ] Build `/dashboard/campaigns` list page
- [ ] Build `/dashboard/campaigns/new` create form
- [ ] Build `/dashboard/campaigns/[id]/edit` edit form
- [ ] Add campaign status management (draft/active/completed)

### Step 3.3: Public Campaign Browsing
- [ ] Build `/campaigns` public listing page
- [ ] Build `/campaigns/[id]` campaign detail page
- [ ] Add campaign progress bar and donation stats
- [ ] Implement responsive card grid layout

### Step 3.4: Donation Flow
- [ ] Create `donations` table migration with RLS
- [ ] Build donation form component
- [ ] Implement donation recording server action
- [ ] Add donation confirmation and receipt display

---

## Phase 4 — Beneficiary Management

### Step 4.1: Beneficiary Database Schema & API
- [ ] Create `beneficiaries` table migration with RLS
- [ ] Build server actions for CRUD operations
- [ ] Add admin-only access controls

### Step 4.2: Beneficiary Admin UI
- [ ] Build `/dashboard/beneficiaries` list page with filters
- [ ] Build `/dashboard/beneficiaries/new` create form
- [ ] Build `/dashboard/beneficiaries/[id]` detail/edit page
- [ ] Add beneficiary status tracking (pending/approved/disbursed)

### Step 4.3: Disbursement Tracking
- [ ] Create `disbursements` table migration with RLS
- [ ] Build disbursement log UI
- [ ] Link disbursements to campaigns and beneficiaries
- [ ] Add reporting and export functionality

---

## Phase 5 — Volunteer Shift Management

### Step 5.1: Volunteer Database Schema & API
- [ ] Create `volunteer_shifts` table migration with RLS
- [ ] Create `volunteer_signups` table migration with RLS
- [ ] Build server actions for shift management

### Step 5.2: Admin Shift Management UI
- [ ] Build `/dashboard/volunteers/shifts` list page
- [ ] Build `/dashboard/volunteers/shifts/new` create form
- [ ] Build shift detail page with signup roster
- [ ] Add shift status management

### Step 5.3: Public Volunteer Sign-Up
- [ ] Build `/volunteer` public page with available shifts
- [ ] Implement volunteer sign-up flow
- [ ] Add sign-up confirmation and calendar integration
- [ ] Build volunteer profile/history page

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
