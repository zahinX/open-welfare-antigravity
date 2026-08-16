# Architectural Plan: Phase 3, Step 3.2 (Admin Campaign Management UI)

> **Reviewed by:** 📋 Plan Reviewer (Claude Opus 4.6 Thinking)  
> **Verdict:** ✅ Approved with Refinements (incorporated below)

## Goal
Implement the Admin UI for managing campaigns. The database, backend services, and API layers (Zod + Server Actions) were fully implemented in Step 3.1. This step focuses entirely on building the React Server Components and interactive client forms to consume those actions.

## 1. Database Layer
- **Status:** **Skipped** (Completed in Step 3.1)

## 2. Backend Layer
- **Status:** **Skipped** (Completed in Step 3.1)

## 3. API Layer
- **Status:** **Skipped** (Completed in Step 3.1)

## 4. UI Layer
- **Target Agent:** 🎨 UI Builder (Claude Sonnet 4.6 Thinking)
- **Tasks:**
  1. **Campaigns List Page (`app/dashboard/campaigns/page.tsx`)**
     - **Type:** React Server Component
     - **Data Fetching:** Direct server-side call to `getCampaigns()` from `lib/services/campaign.ts`.
     - **UI:** A data table or card grid displaying campaigns (Title, Status badge, Target Amount, Current Amount, Deadline, created_at).
     - **Interactions:** "Create Campaign" button navigating to `/dashboard/campaigns/new`. Per-row "Edit" link to `/dashboard/campaigns/[id]/edit`. Per-row "Delete" button invoking `deleteCampaignAction`.
     - **⚠️ Reviewer Note:** The delete action mutates server state. Wrap it in a `'use client'` component (e.g., `<DeleteCampaignButton />`) with a confirmation dialog and pending state. Do NOT call server actions directly from RSCs.
  2. **Create Campaign Page (`app/dashboard/campaigns/new/page.tsx`)**
     - **Type:** React Server Component wrapping a Client Component form.
     - **Client Component:** `components/dashboard/campaigns/CampaignForm.tsx` (shared for create + edit).
     - **UI:** Form fields: Title (text input), Description (textarea), Target Amount (number input), Status (select dropdown), Deadline (date/datetime input).
     - **Action Binding:** Calls `createCampaignAction` from `lib/actions/campaign.actions.ts`.
     - **⚠️ Reviewer Note:** Display `fieldErrors` inline next to each form field. Show a toast or banner for the top-level `error` string. Redirect to `/dashboard/campaigns` on success.
  3. **Edit Campaign Page (`app/dashboard/campaigns/[id]/edit/page.tsx`)**
     - **Type:** React Server Component
     - **Data Fetching:** `getCampaignById(params.id)`. Use `notFound()` from `next/navigation` if not found.
     - **Client Component:** Reuses `<CampaignForm />` with `initialData` prop prepopulated.
     - **Action Binding:** Calls `updateCampaignAction(id, data)`.
  4. **Route Loading & Error States:**
     - Create `app/dashboard/campaigns/loading.tsx` skeleton (reuse pattern from `app/dashboard/loading.tsx`).
     - Create `app/dashboard/campaigns/error.tsx` error boundary.
  5. **Shadcn & Design:**
     - Use existing dark theme conventions (zinc-950 bg, zinc-800 borders, emerald-400 accents) from `app/dashboard/`.
     - Build using raw Tailwind — this project doesn't have Shadcn installed. Use native HTML form elements styled with Tailwind.
     - Use `useFormStatus` for submit button pending states.
  6. **Instant Linking:**
     - The sidebar (`components/dashboard/Sidebar.tsx`) already contains a link to `/dashboard/campaigns` on line 19. Active state highlighting is already implemented via `pathname.startsWith(link.href)` on line 77. **No sidebar changes needed.**

## 5. Test Plan
- **Target Agent:** 🧪 Test Builder (Gemini 3.7 Flash High)
- **Tasks:**
  - Unit test `<CampaignForm />` rendering and validation display.
  - No Playwright E2E for now (requires running Supabase + auth session which is non-trivial to mock in CI).

## Audit Notes

### ✅ Verified
- DB/Backend/API layers correctly skipped — all CRUD is in place from Step 3.1.
- Sidebar already links to `/dashboard/campaigns` with active-state detection.
- Dashboard layout already gates behind `getUserProfile()` auth check.
- Loading and error boundary patterns established in `app/dashboard/`.

### ⚠️ Refinements Applied
1. **No Shadcn:** The plan referenced Shadcn (Button, Input, Table, etc.) but the project does not have `@shadcn/ui` installed. Changed to raw Tailwind-styled native elements matching the existing design system.
2. **Delete requires client component:** Added explicit note that delete must use a client component wrapper, not a direct action call from a server component.
3. **Field error display:** Added requirement to show per-field validation errors inline.
4. **E2E test scope reduced:** Playwright E2E against authenticated admin flows requires complex auth mocking. Scoped tests to unit-level component tests instead.
