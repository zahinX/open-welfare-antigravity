<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Development Rules

- **Instant UI Linking:** If any feature (e.g., auth pages, new routes) is implemented in the codebase that can be reflected in the frontend UI, instantly link it up in the relevant components (e.g. navbar, buttons, placeholders) instead of waiting for a later "polish" phase.

- **Modular Sub-Agent Protocol (Horizontal Batching & Context Limits):** When tasked with implementing a new feature or phase, act as an orchestrator and group similar tasks across the entire phase by layer to minimize model switching. **Crucially, ensure tasks are scoped so the executing model's context window does not exceed 70%.** Use Gemini Flash 3.7 to build as much as possible (DB, Backend, API, Tests) within this 70% limit, then hand off to Gemini Pro for a unified review of all Flash 3.7's work. Gemini Pro must make corrections and explicitly hand off to Claude for the final UI building and review. Ensure handoff context is thoroughly summarized before switching models.

- **GitHub MCP Preference:** Use the GitHub MCP server to perform all sorts of git and GitHub operations (creating branches, pushing files, creating pull requests, etc.) instead of standard CLI commands (like `git` or `gh`) whenever possible.

- **Phase Completion, Pull Request & Branching Protocol:** After successful completion and human approval for each phase, you MUST commit all completed changes on the finished phase branch and create a Pull Request to merge the code into the `main` branch (using the GitHub MCP server). Then, checkout a dedicated feature branch for the upcoming phase (e.g. `phase-5-volunteer-shift-management`). Ensure `.agents/.handoff/` is cleaned of numbered intermediate artifacts (e.g. `00-plan.md`, `01-*.json`), but **NEVER delete `state.json`** — instead, update `state.json` with the upcoming phase's metadata, `next_agent: "orchestrator"`, and `recommended_next_model`. All documentation (`PROJECT_ROADMAP.md`, `QA_CHECKLIST.md`, `DESIGN_SYSTEM.md`, `HANDOFF.md`) must be kept in sync.

- **Data Preservation Across Migrations:** All database migrations MUST be strictly additive and non-destructive. Never drop tables, truncate records, or alter columns destructively without explicit approval. Always provide safe defaults or backfills for new columns (e.g., `ADD COLUMN IF NOT EXISTS ... DEFAULT ...`), use idempotent guards, and ensure mock, seed, and live user data persist seamlessly across incremental migrations.
