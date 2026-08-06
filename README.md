# 🌿 Open Welfare

> **Empowering Communities Through Transparent Welfare Management**

Open Welfare is an open-source, full-stack platform designed for mosques, community centers, and local charities. Our goal is to provide a modern, efficient, and transparent way to manage donation campaigns, track beneficiary support, and coordinate volunteer shifts—all in one unified portal.

By digitizing and streamlining these processes, we enable community organizations to focus on what matters most: **maximizing their impact and helping those in need.**

---

## 🎯 Project Impact & Vision

For many local charities, managing donations, aid distribution, and volunteers involves fragmented spreadsheets and manual tracking. Open Welfare solves this by providing:

- **Transparent Campaign Management:** Clear goals, real-time progress, and audited donation records.
- **Dignified Beneficiary Tracking:** Secure, private records of aid disbursement ensuring equitable distribution.
- **Seamless Volunteer Coordination:** Easy shift scheduling and sign-ups to mobilize community support.
- **Data-Driven Insights:** Dashboards and reports that provide accountability to donors and stakeholders.

---

## 🏗️ Architecture & Tech Stack

Open Welfare is built with a modern, server-first mindset using Next.js and Supabase, ensuring high performance, excellent developer experience, and robust security.

### High-Level System Design

```text
┌─────────────────────────────────────────────────────────┐
│ 🌐  User Interface (The Client)                         │
│     Where donors, volunteers, and admins interact.      │
│     Built with Next.js & React Components.              │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼  (Secure HTTPS)
┌─────────────────────────────────────────────────────────┐
│ ⚙️  Application Server (Next.js)                        │
│     The brain of the operation. Handles logic,          │
│     processes forms, and manages secure sessions.       │
│     • Server Actions (Mutations)                        │
│     • Middleware (Security Checks)                      │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼  (Secure Internal API)
┌─────────────────────────────────────────────────────────┐
│ 🗄️  Database & Security Engine (Supabase)               │
│     The vault. Stores all sensitive data safely.        │
│     • PostgreSQL (Data Storage)                         │
│     • GoTrue (Authentication)                           │
│     • Row Level Security (Access Control)               │
└─────────────────────────────────────────────────────────┘
```

### Core Technologies

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | **Next.js (App Router)** | Leverages React Server Components (RSC) and Server Actions to minimize client-side JavaScript and improve data fetching performance. |
| **Styling** | **Tailwind CSS + Shadcn UI** | Enables rapid UI iteration with a consistent, accessible, and highly customizable design system. |
| **Backend & Auth** | **Supabase (Local CLI)** | Provides a powerful PostgreSQL database with GoTrue authentication built-in, avoiding complex custom backend infrastructure. |
| **Security** | **PostgreSQL RLS** | Row Level Security ensures that data access policies are enforced directly at the database level, critical for multi-tenant privacy. |
| **Testing** | **Vitest + Playwright** | Fast unit testing combined with reliable end-to-end testing ensures code quality and prevents regressions. |

---

## 📁 Repository Structure

Our codebase is organized to separate public-facing routes from authenticated dashboards, while keeping shared logic centralized.

```text
open-welfare/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes (login, register)
│   ├── (public)/           # Public pages (campaigns, volunteer signups)
│   ├── dashboard/          # Authenticated admin dashboard
│   ├── api/                # API route handlers
│   ├── layout.tsx          # Root layout & providers
│   └── globals.css         # Global Tailwind styles
├── components/             # Shared UI components
│   ├── ui/                 # Base primitives (Shadcn/Radix UI)
│   └── ...                 # Feature-specific components
├── lib/                    # Core business logic and utilities
│   ├── supabase/           # Supabase client factories (browser/server)
│   └── validations/        # Zod validation schemas
├── docs/                   # Architectural decisions, PRDs, and Roadmaps
├── supabase/               # Local Supabase CLI config & DB migrations
└── tests/                  # Test suites (unit, integration, e2e)
```

---

## 🛡️ Security Model

Given the sensitive nature of beneficiary data and financial donations, security is a first-class citizen:

1. **Row Level Security (RLS):** Every database table operates under strict RLS policies. No data can be read or mutated without satisfying policy checks based on the user's authenticated session.
2. **Server-Side Mutations:** All data modifications are routed through Next.js Server Actions, where inputs are strictly validated using Zod before reaching the database.
3. **Session Management:** Next.js Middleware actively refreshes and validates Supabase auth sessions on every request.
4. **Role-Based Access Control (RBAC):** Distinct boundaries between Public users, Volunteers, and Admins are enforced at both the UI routing level and the database level.

---

## 🚀 Getting Started (Local Development)

> **Note to Developers:** This project currently mandates a **Local-First** execution policy. All database interactions and testing must run locally via the Supabase CLI.

### Prerequisites
- Node.js (v20+)
- Docker (required for local Supabase)
- Git

### Setup Steps
1. **Clone & Install:**
   ```bash
   git clone <repository-url>
   cd open-welfare
   npm install
   ```
2. **Environment Variables:**
   Copy `.env.example` to `.env.local` and configure your local Supabase endpoints.
3. **Start Local Supabase:**
   ```bash
   npx supabase start
   ```
4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 🤝 Contributing

We welcome contributions from developers, designers, and product managers! 
- Check out our [PROJECT_ROADMAP.md](./docs/PROJECT_ROADMAP.md) to see current priorities.
- Review our [AGENT_RULES.md](./docs/AGENT_RULES.md) for coding conventions and operational constraints.
- Please use the provided GitHub Issue templates for feature requests and bug reports.

*Together, we can build technology that serves the community.* 💚
