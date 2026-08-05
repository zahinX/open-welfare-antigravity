# Open Welfare — Architecture Document

> **Status:** Draft  
> **Version:** 0.1.0  
> **Last Updated:** 2026-08-06

---

## 1. High-Level Architecture

Open Welfare is a Next.js (App Router) application using Supabase as the backend-as-a-service layer for authentication, database (PostgreSQL), and Row Level Security.

```
┌─────────────────────────────────────────────┐
│               Client (Browser)              │
│  Next.js App Router (React Server Components│
│  + Client Components)                       │
└────────────────────┬────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────┐
│            Next.js Server                   │
│  • Server Components (RSC)                  │
│  • Server Actions                           │
│  • Route Handlers                           │
│  • Middleware (auth session refresh)         │
└────────────────────┬────────────────────────┘
                     │ PostgREST / Auth API
┌────────────────────▼────────────────────────┐
│         Supabase (Local CLI)                │
│  • PostgreSQL + Row Level Security          │
│  • GoTrue Auth                              │
│  • Storage (future)                         │
└─────────────────────────────────────────────┘
```

## 2. Directory Structure

```
open-welfare/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth-related routes (login, register)
│   ├── (public)/           # Public-facing pages (campaigns, volunteer)
│   ├── dashboard/          # Admin/authenticated pages
│   ├── api/                # API route handlers
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/             # Shared UI components
│   ├── ui/                 # Base UI primitives (Shadcn/Radix)
│   └── ...                 # Feature-specific components
├── lib/                    # Utilities and shared logic
│   ├── supabase/           # Supabase client factories
│   ├── validations/        # Zod schemas
│   └── utils.ts            # General utilities
├── docs/                   # Project documentation
├── supabase/               # Supabase CLI config and migrations
│   ├── config.toml
│   └── migrations/
├── tests/                  # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── public/                 # Static assets
```

## 3. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Router | App Router | Server Components, streaming, server actions |
| Styling | Tailwind CSS + Shadcn UI | Rapid iteration, consistent design system |
| Auth | Supabase GoTrue | Integrated with DB, supports RLS |
| Database | PostgreSQL via Supabase | RLS for multi-tenant security |
| Testing | Vitest + Playwright | Fast unit tests + reliable E2E |
| State Management | Server-first (RSC) | Minimize client JS, leverage server caching |

## 4. Security Model

- **Row Level Security (RLS):** Every table has RLS policies. No direct DB access without policy checks.
- **Auth Middleware:** Next.js middleware refreshes sessions on every request.
- **Server Actions:** All mutations go through server actions with Zod validation.
- **Role-Based Access:** Admin vs. Public user roles enforced at both API and DB level.
