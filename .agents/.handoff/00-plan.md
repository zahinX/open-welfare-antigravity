# Step 3.3 — Public Campaign Browsing

## Scope
Build public-facing pages that allow any visitor (unauthenticated) to browse active/completed campaigns and view individual campaign details with progress indicators.

---

## Layer Decomposition

### 1. Database
**No migration required.** The `campaigns` table already exists with RLS policies that allow public reads for `active` and `completed` campaigns (`"Anyone can view active campaigns"` policy). The `is_admin()` SECURITY DEFINER function and table grants were fixed in Step 3.2.

**Verification needed:** Confirm `anon` role can SELECT from `campaigns` where `status IN ('active', 'completed')` — this was granted by the `20260817000002_grant_table_permissions.sql` migration.

### 2. Backend
**Service layer already exists.** `lib/services/campaign.ts` has:
- `getCampaigns(options)` — supports `status` filter and `limit`
- `getCampaignById(id)` — fetches a single campaign

**New functions needed:**
- `getPublicCampaigns()` — wrapper that calls `getCampaigns({ status: 'active' })` and also fetches `completed` campaigns, merging both result sets ordered by `created_at` descending. Alternatively, add a `statuses` array filter to `getCampaigns`.
- `getPublicCampaignById(id)` — wrapper that calls `getCampaignById(id)` but verifies the returned campaign has `status IN ('active', 'completed')` before returning it (defence-in-depth beyond RLS).

**File:** `lib/services/campaign.ts` (extend existing)

### 3. API
**No Server Actions required.** These are read-only public pages rendered as React Server Components (RSC). Data fetching happens directly in the page components via the service layer.

**Cache strategy:** Pages should use Next.js ISR/caching via `revalidatePath('/campaigns')` (already called by campaign CRUD actions from Step 3.1). No explicit `revalidate` export needed since the admin actions already invalidate `/campaigns`.

### 4. UI
Four deliverables:

#### 4a. `/campaigns` — Public Campaign Listing Page
- **Route:** `app/(public)/campaigns/page.tsx`
- **Layout:** `app/(public)/layout.tsx` — minimal public shell with navbar (logo, "View Campaigns", "Login"/"Sign Up" links) and footer. Reuse the same header/footer style from `app/page.tsx`.
- **Components:**
  - `CampaignCard` — responsive card showing: title, truncated description (2 lines), progress bar (`current_amount / target_amount`), percentage funded, status badge, deadline countdown.
  - Card grid: responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` layout.
- **Empty state:** Friendly illustration/message if no campaigns exist.
- **SEO:** `<title>`, `<meta description>`, proper `<h1>`.

#### 4b. `/campaigns/[id]` — Campaign Detail Page
- **Route:** `app/(public)/campaigns/[id]/page.tsx`
- **Layout:** Same `(public)` layout.
- **Content:**
  - Full title, description, status badge.
  - Large progress bar with `current_amount` / `target_amount` displayed.
  - Percentage funded, amount remaining.
  - Deadline display (formatted, with "X days remaining" or "Campaign ended").
  - Created date.
  - Back link to `/campaigns`.
- **Error handling:** `notFound()` if campaign doesn't exist or isn't public.
- **SEO:** Dynamic `generateMetadata()` for campaign-specific title/description.

#### 4c. Navigation Linking (Mandatory per project rules)
- Homepage `app/page.tsx` already has a "View Campaigns" link pointing to `/campaigns` ✅.
- Add "Campaigns" link to the public layout navbar.
- Ensure the homepage hero CTA button works with the new route.

#### 4d. Loading & Error States
- `app/(public)/campaigns/loading.tsx` — skeleton cards grid.
- `app/(public)/campaigns/[id]/loading.tsx` — skeleton detail page.
- `app/(public)/campaigns/error.tsx` — error boundary.

### 5. Tests
- **Unit:** Test `CampaignCard` renders correctly with various data (active, completed, 0% funded, 100% funded, no deadline, past deadline).
- **Unit:** Test `getPublicCampaigns` and `getPublicCampaignById` service wrappers.
- **Integration:** Test `/campaigns` page renders campaign cards from mock data.
- **Integration:** Test `/campaigns/[id]` page renders detail from mock data and returns 404 for draft campaigns.

---

## File Impact Summary

| Layer    | File                                           | Action  |
|----------|------------------------------------------------|---------|
| Backend  | `lib/services/campaign.ts`                     | MODIFY  |
| UI       | `app/(public)/layout.tsx`                      | NEW     |
| UI       | `app/(public)/campaigns/page.tsx`              | NEW     |
| UI       | `app/(public)/campaigns/loading.tsx`           | NEW     |
| UI       | `app/(public)/campaigns/error.tsx`             | NEW     |
| UI       | `app/(public)/campaigns/[id]/page.tsx`         | NEW     |
| UI       | `app/(public)/campaigns/[id]/loading.tsx`      | NEW     |
| UI       | `components/campaigns/CampaignCard.tsx`        | NEW     |
| UI       | `components/campaigns/ProgressBar.tsx`         | NEW     |
| Tests    | `tests/unit/campaign-card.test.tsx`            | NEW     |
| Tests    | `tests/unit/public-campaign-service.test.tsx`  | NEW     |

---

## Design Notes
- Progress bar: Emerald gradient fill, rounded-full, animated width transition.
- Card: Dark glass morphism style (`bg-zinc-900/50 border border-zinc-800`) consistent with existing design system.
- Status badge: Color-coded pill (emerald=active, zinc=completed, amber=draft).
- Typography: Inter font, consistent with existing pages.
- Responsive: Mobile-first, single-column → 2-col → 3-col grid.

---

## Risk Assessment
- **Low risk:** No database changes, no auth changes, read-only pages.
- **RLS dependency:** Relies on existing `"Anyone can view active campaigns"` policy working for the `anon` role. Verified by Step 3.2 permission grants.
- **Cache coherence:** Admin CRUD actions already call `revalidatePath('/campaigns')`, so public pages will stay fresh.
