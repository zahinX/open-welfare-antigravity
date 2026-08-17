<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Development Rules

- **Instant UI Linking:** If any feature (e.g., auth pages, new routes) is implemented in the codebase that can be reflected in the frontend UI, instantly link it up in the relevant components (e.g. navbar, buttons, placeholders) instead of waiting for a later "polish" phase.

- **Modular Sub-Agent Protocol:** When tasked with implementing a new feature or phase, you MUST act as an orchestrator. Do not write the entire full-stack feature in one turn. Instead, break the feature down into its constituent parts (Database -> Backend -> API -> UI) and execute them sequentially or delegate them to sub-agents. Use the specialized skills (`orchestrator`, `database`, `backend`, `api`, `ui`) located in `.agents/skills/` to guide your implementation layer by layer. This keeps accuracy high and token context focused.

- **Phase Completion, Pull Request & Branching Protocol:** After successful completion and human approval for each phase, you MUST commit all completed changes on the finished phase branch and create a Pull Request to merge the code into the `main` branch (e.g. `gh pr create --base main --head phase-3 --title "feat: Phase 3 — Campaign Management & Multi-Currency Donations"`). Then, checkout a dedicated feature branch for the upcoming phase (e.g. `git checkout -b phase-4-beneficiary-management`). Ensure `.agents/.handoff/` is cleaned up and all documentation (`PROJECT_ROADMAP.md`, `QA_CHECKLIST.md`, `DESIGN_SYSTEM.md`) is kept in sync.

- **Data Preservation Across Migrations:** All database migrations MUST be strictly additive and non-destructive. Never drop tables, truncate records, or alter columns destructively without explicit approval. Always provide safe defaults or backfills for new columns (e.g., `ADD COLUMN IF NOT EXISTS ... DEFAULT ...`), use idempotent guards, and ensure mock, seed, and live user data persist seamlessly across incremental migrations.
