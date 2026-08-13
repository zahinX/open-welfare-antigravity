<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Development Rules

- **Instant UI Linking:** If any feature (e.g., auth pages, new routes) is implemented in the codebase that can be reflected in the frontend UI, instantly link it up in the relevant components (e.g. navbar, buttons, placeholders) instead of waiting for a later "polish" phase.

- **Modular Sub-Agent Protocol:** When tasked with implementing a new feature or phase, you MUST act as an orchestrator. Do not write the entire full-stack feature in one turn. Instead, break the feature down into its constituent parts (Database -> Backend -> API -> UI) and execute them sequentially or delegate them to sub-agents. Use the specialized skills (`orchestrator`, `database`, `backend`, `api`, `ui`) located in `.agents/skills/` to guide your implementation layer by layer. This keeps accuracy high and token context focused.
