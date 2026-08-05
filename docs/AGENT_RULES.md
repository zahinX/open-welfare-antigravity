# Open Welfare — Agent Rules

> **Last Updated:** 2026-08-06

---

## Operational Rules

1. **Local-First:** All execution, testing, and database interactions run locally. No cloud deployments.
2. **Step-by-Step Cadence:** Work on ONE sub-step at a time. Validate, test, verify with human, commit.
3. **PM Tracking:** Update `docs/PROJECT_ROADMAP.md` after every completed sub-step.
4. **Automated Testing:** Write and run tests for every new piece of logic or UI component.
5. **Git Commits:** Provide clean `git commit` commands at each verified checkpoint.

## Human-in-the-Loop Safeguards

1. **3-Attempt Rule:** If a test/build fails 3 times, STOP and report to human.
2. **Requirement Conflicts:** If a step contradicts `PRD.md` or architecture, pause and ask.
3. **Destructive Schema Changes:** Dropping tables, mutating columns, or changing global types requires human approval.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS + Lucide Icons + Radix UI / Shadcn UI
- **Database & Auth:** Local Supabase CLI / PostgreSQL (strict RLS)
- **Testing:** Vitest (Unit/Integration) + Playwright (E2E)

## Code Conventions

- Use TypeScript strict mode.
- Prefer Server Components; use `'use client'` only when necessary.
- All mutations through Server Actions with Zod validation.
- Colocate component-specific styles; use Tailwind utility classes.
- Name files in kebab-case; name components in PascalCase.
