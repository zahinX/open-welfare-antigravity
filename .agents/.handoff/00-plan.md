# Feature Decomposition Plan: Step 3.5 — Donation Flow & Currency Conversion

## Overview
Implement the complete donation flow allowing donors to contribute to community welfare campaigns in any supported currency (BDT, USD, EUR, GBP, etc.). The system automatically calculates exchange rates, converts foreign contributions into the campaign's base currency, increments the campaign's progress atomically via database triggers, and displays donation confirmation receipts.

---

## 1. Database Layer (`database-builder`)
- **Migration File:** `supabase/migrations/20260817000004_donations_and_progress_trigger.sql`
- **Table: `donations`**
  - `id` (uuid, PK, default `gen_random_uuid()`)
  - `campaign_id` (uuid, references `campaigns.id` ON DELETE CASCADE, NOT NULL)
  - `donor_id` (uuid, references `profiles.id` ON DELETE SET NULL, nullable)
  - `donor_name` (text, nullable)
  - `donor_email` (text, nullable)
  - `amount` (numeric, check > 0, NOT NULL) — amount paid in donor's chosen currency
  - `currency` (varchar(3), default 'BDT', NOT NULL) — currency paid (ISO 4217)
  - `converted_amount` (numeric, check > 0, NOT NULL) — amount credited to campaign base currency
  - `exchange_rate` (numeric, default 1.0, check > 0, NOT NULL) — rate applied (`converted_amount = amount * exchange_rate`)
  - `payment_method` (text, default 'manual', NOT NULL)
  - `payment_status` (text, default 'completed', NOT NULL)
  - `is_anonymous` (boolean, default false, NOT NULL)
  - `created_at` (timestamptz, default `now()`, NOT NULL)
- **Database Trigger:**
  - `update_campaign_current_amount_trigger`: Automatically increments or decrements `campaigns.current_amount` on `donations` INSERT, UPDATE (`payment_status`), and DELETE to guarantee ACID consistency.
- **Row Level Security (RLS):**
  - Enable RLS on `donations`
  - `SELECT`: Admins can read all donations. Donors can read their own donations (`donor_id = auth.uid()`). Public can read completed non-anonymous donations for active campaigns.
  - `INSERT`: Anyone (authenticated or anon) can insert donations.
  - `UPDATE`: Admins only.
  - `DELETE`: Admins only.
- **TypeScript Types:**
  - Update `lib/supabase/database.types.ts` with `donations` Row, Insert, Update types.

---

## 2. Backend Layer (`backend-builder`)
- **Currency Service (`lib/services/currency.ts`):**
  - Base exchange rate matrix for major global currencies (BDT, USD, EUR, GBP, CAD, AUD, SAR, AED, JPY, INR, etc.).
  - `getExchangeRate(fromCurrency: string, toCurrency: string): number`
  - `convertCurrency(amount: number, fromCurrency: string, toCurrency: string): { convertedAmount: number, exchangeRate: number }`
- **Donation Validation (`lib/validations/donation.ts`):**
  - `createDonationSchema`: Validates `campaign_id`, `amount` (> 0), `currency` (ISO 3-char code), `donor_name`, `donor_email`, `is_anonymous`, `payment_method`.
- **Donation Service (`lib/services/donation.ts`):**
  - `createDonation(data: InsertDonation)`
  - `getDonationsByCampaignId(campaignId: string)`
  - `getRecentDonations(limit?: number)`

---

## 3. API Layer (`api-builder`)
- **Server Actions (`lib/actions/donation.actions.ts`):**
  - `createDonationAction(payload)`:
    1. Validates input schema via `createDonationSchema`.
    2. Fetches target campaign to determine its base currency and verify `status = 'active'`.
    3. Calculates `converted_amount` and `exchange_rate` via `convertCurrency(amount, donorCurrency, campaign.currency)`.
    4. Records donation in database with user profile ID if authenticated.
    5. Revalidates paths: `/campaigns`, `/campaigns/[id]`, `/dashboard`, `/dashboard/campaigns`.
    6. Returns structured response `{ success: true, data: donation }`.

---

## 4. UI Layer (`ui-builder`)
- **Donation Modal / Form (`components/campaigns/DonationForm.tsx`):**
  - Currency selector with real-time conversion preview towards campaign base currency.
  - Quick amount selector presets (e.g. 500, 1000, 2500, 5000 or $10, $25, $50, $100).
  - Custom amount input.
  - Donor info (Name, Email, Anonymous toggle).
  - Submit button with `useFormStatus` pending state and accessible ARIA attributes.
- **Donation Confirmation Dialog (`components/campaigns/DonationConfirmation.tsx`):**
  - Clear success receipt showing amount paid, converted contribution towards campaign goal, and transaction ID.
- **Campaign Detail Page Integration (`app/(public)/campaigns/[id]/page.tsx`):**
  - Connect "Donate Now" button to open the Donation Modal.
  - Render recent supporters list with privacy masking for anonymous donors.

---

## 5. Test Layer (`test-builder`)
- **Unit Tests:**
  - `tests/unit/currency-service.test.ts`: Conversion math, reverse rates, same-currency 1:1 tests.
  - `tests/unit/donation-service.test.ts`: Service methods with mocked Supabase client.
  - `tests/unit/donation-ui.test.tsx`: Donation form interactions, quick presets, and conversion preview.
- **Integration Tests:**
  - `tests/integration/donation-actions.test.ts`: Server action validation, rate calculation, campaign status check, path revalidations.
- **E2E Tests:**
  - `tests/e2e/donation-flow.spec.ts`: Full public donation flow on an active campaign.

---

## 6. Verification Plan
1. `npx supabase db reset` or migration test.
2. `npm run test` — all unit and integration tests passing.
3. `npm run test:e2e` — Playwright browser donation flow passing.
4. `npm run build` — Turbopack zero-error build verification.
