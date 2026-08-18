# Phase 6 Decomposition Plan — Dashboard Analytics & Reporting

## Context & Scope
This phase introduces analytical widgets to the admin dashboard and a suite of reporting pages. Since this phase primarily revolves around reading data (aggregations and charts) rather than complex state mutations, the entirety of Phase 6 can be handled in a single horizontal batch.

## 1. Database & Backend Layer (Flash 3.7)
**Goal:** Create read-only services and SQL functions/views for aggregating dashboard metrics and generating reports.

- **Dashboard Metrics Service (`lib/services/analytics.ts`):**
  - `getDashboardSummary()`: Returns total donations, active campaign count, total beneficiaries, and total volunteers.
  - `getBeneficiaryDistribution()`: Returns aggregated counts of beneficiaries by family size or status.
  - `getVolunteerParticipation()`: Returns aggregated volunteer attendance rates.
- **Reporting Service (`lib/services/reports.ts`):**
  - `getFinancialSummary(startDate, endDate)`: Aggregates donations over time.
  - `getCampaignPerformance(startDate, endDate)`: Aggregates metrics per campaign.
- **Exports:**
  - Create utility functions to convert structured JSON data into CSV strings.

## 2. API Layer (Flash 3.7)
**Goal:** Create Server Actions or Route Handlers to expose the analytics data and CSV generation.

- **Analytics Actions (`lib/actions/analytics.actions.ts`):**
  - Actions for date-filtered reports.
- **Export Route Handlers (`app/api/export/route.ts`):**
  - GET endpoints for downloading generated CSV files with appropriate headers (e.g., `text/csv`).

## 3. Test Layer (Flash 3.7)
**Goal:** Validate the aggregations and exports.

- **Unit Tests:**
  - Test the analytics service functions against a seeded database state.
  - Test CSV generator utility functions.
- **Integration Tests:**
  - Test Server Actions and Route Handlers for correct authentication and role validation.

## 4. UI Layer (Claude 4.6)
**Goal:** Build the visual dashboard widgets and the new reporting views.

- **Admin Dashboard (`app/dashboard/page.tsx`):**
  - Replace the placeholder dashboard with actual KPI cards (Total Donations, Active Campaigns, etc.).
  - Integrate a charting library (e.g., Recharts) for the beneficiary distribution and volunteer participation graphs.
- **Reporting Views (`app/dashboard/reports/page.tsx`):**
  - Build date-range picker components.
  - Display financial and campaign performance in sortable tables.
  - Add "Export to CSV" buttons linked to the Route Handlers.
- **Navigation:**
  - Update `Sidebar.tsx` to include the new "Reports" navigation link.
