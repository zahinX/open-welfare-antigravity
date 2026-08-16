# Agent Pipeline Architecture

> **Status:** Active  
> **Version:** 1.0.0  
> **Last Updated:** 2026-08-16

This document defines the multi-agent pipeline used to develop every feature in Open Welfare. It establishes agent roles, model tier assignments, folder structure conventions, and the review-retry loop protocol.

---

## Model Tier Assignments

| Tier | Purpose | Models |
|---|---|---|
| **Tier 1 — Reasoning** | Planning, architecture, deep review | Gemini 3.1 Pro (High) · Claude Opus 4.6 |
| **Tier 2 — Implementation** | Code generation, pattern-following | Claude Sonnet 4.6 · Gemini Flash 3.7 (High) |
| **Tier 3 — Utility** | Markdown, docs, simple edits | Gemini Flash 3.7 (Medium) |

---

## Agent Roster

| # | Agent | Tier | Model | Why This Model |
|---|---|---|---|---|
| 0 | 🧠 **Orchestrator** (main) | 1 | Gemini 3.1 Pro (High) | Reasoning-heavy: decompose features, manage retry state, cross-layer decisions |
| 1 | 📋 **Plan Reviewer** | 1 | Gemini 3.1 Pro (High) | Architectural reasoning: RLS gaps, schema ↔ PRD alignment, edge case detection |
| 2 | 🔍 **Code Reviewer** | 1 | Claude Opus 4.6 | Deep code inspection: precise line-level rejection with structured feedback |
| 3 | 🗄️ **DB Builder** | 2 | Claude Sonnet 4.6 | Best-in-class structured SQL generation, RLS policy writing |
| 4 | ⚙️ **Backend Builder** | 2 | Claude Sonnet 4.6 | TypeScript service files — code precision matters |
| 5 | 🔌 **API Builder** | 2 | Gemini Flash 3.7 (High) | Zod schemas + server actions — fast, pattern-following, high throughput |
| 6 | 🎨 **UI Builder** | 2 | Claude Sonnet 4.6 | React/Tailwind component generation — Claude excels at UI precision |
| 7 | 🧪 **Test Builder** | 2 | Gemini Flash 3.7 (High) | Large context window + fast; reads all created files, writes Vitest/Playwright |
| 8 | 📝 **Docs Agent** | 3 | Gemini Flash 3.7 (Medium) | Markdown-only task — lowest cost tier is more than sufficient |

> **Gemini Flash 3.7 High** is slotted for API Builder and Test Builder — tasks that are pattern-following but require reading larger file contexts. Its high reasoning setting + speed make it the most cost-efficient choice here.

---

## Pipeline Flow

```
User Request
      │
      ▼
┌─────────────────────────────────────┐
│  🧠 Orchestrator  [Gemini Pro High]  │  Reads roadmap step → decomposes into layer tasks
└──────────┬──────────────────────────┘
           │ plan artifact
           ▼
┌─────────────────────────────────────┐
│  📋 Plan Reviewer [Gemini Pro High]  │  Checks completeness, RLS, nav linking, PRD alignment
└──────────┬──────────────────────────┘
           │ approved / rejected → Orchestrator revises
           ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     BUILD → REVIEW LOOP                      │
 │                                                              │
 │  For each layer  [DB → Backend → API → UI]:                  │
 │                                                              │
 │  ┌──────────────────────┐   ┌───────────────────────────┐   │
 │  │ 🔨 Builder  [Tier 2]  │──▶│ 🔍 Code Reviewer [Opus 4.6]│  │
 │  │                      │◀──│                           │   │
 │  └──────────────────────┘   └───────────────────────────┘   │
 │        │   fix + resubmit (max 3x)        │ approved         │
 │        ▼                                  ▼                  │
 │   STOP → ask human                   Next layer              │
 └─────────────────────────────────────────────────────────────┘
           │ all layers built + approved
           ▼
┌──────────────────────────────────────┐
│  🧪 Test Builder [Flash 3.7 High]     │  Writes unit/integration/e2e, runs tests
└──────────┬───────────────────────────┘
           │ fail → Orchestrator re-spawns broken layer's Builder + Code Reviewer
           │ pass ↓
           ▼
┌──────────────────────────────────────┐
│  📝 Docs Agent    [Gemini Flash]      │  Updates Roadmap, QA Checklist, Design System
└──────────┬───────────────────────────┘
           ▼
     ✅ Feature Complete + git commit ready
```

---

## Review Protocol

### Plan Reviewer checks for:
- Missing RLS policies in DB tasks
- Zod validation gaps in API tasks
- Orphaned routes (UI built but not linked in nav)
- Schema ↔ PRD alignment

### Code Reviewer checks for:
- **DB:** RLS on every table, `snake_case`, migration idempotency
- **Backend:** Error handling (no raw Supabase errors leaked), typed I/O
- **API:** Zod validation present, auth check at top, `revalidatePath()` called
- **UI:** Server Component default, `'use client'` only when needed, a11y, nav linking

### Rejection format:
```json
{
  "status": "rejected",
  "issues": [
    { "file": "...", "line": 0, "severity": "error|warning", "message": "...", "suggestion": "..." }
  ]
}
```

### Retry Protocol:
- Each builder gets **max 3 round-trips** with the Code Reviewer per layer
- If still failing after 3 attempts → **STOP and report to human** (per existing 3-Attempt Rule)
- If Test Builder fails → Orchestrator identifies broken layer and re-spawns only that Builder + Code Reviewer

---

## Folder Structure

```
.agents/
├── skills/                        # How-to instructions for the main agent
│   ├── orchestrator/SKILL.md
│   ├── database/SKILL.md
│   ├── backend/SKILL.md
│   ├── api/SKILL.md
│   ├── ui/SKILL.md
│   ├── plan-review/SKILL.md
│   ├── code-review/SKILL.md
│   ├── test/SKILL.md
│   └── docs/SKILL.md
│
└── agents/                        # Self-contained prompt templates for sub-agents
    ├── README.md
    ├── orchestrator.md
    ├── plan-reviewer.md
    ├── code-reviewer.md
    ├── builders/
    │   ├── db.md
    │   ├── backend.md
    │   ├── api.md
    │   └── ui.md
    ├── test.md
    └── docs.md
```

### Folder Semantics

| Folder | Contains | Purpose |
|---|---|---|
| `skills/` | `SKILL.md` files | **How** — instructions the *main agent* reads to guide its own behavior |
| `agents/` | `.md` prompt templates | **Who** — self-contained prompts the Orchestrator hands verbatim to sub-agents |

### IDE Compatibility

| IDE | `skills/` usage | `agents/` usage |
|---|---|---|
| **Antigravity** | Auto-discovered, progressive disclosure | Referenced by orchestrator skill |
| **Cursor / Windsurf** | Manual reference | Scoped prompt files / rule documents |
| **Claude Code** | Manual reference | Slash commands or subagent prompts |

---

## Token Cost Estimate Per Feature

| Agent | Model | Est. Tokens | Spawns |
|---|---|---|---|
| Orchestrator | Gemini 3.1 Pro High | ~2K | 1 |
| Plan Reviewer | Gemini 3.1 Pro High | ~3K | 1 |
| DB Builder | Claude Sonnet 4.6 | ~4K | 1–3 |
| Backend Builder | Claude Sonnet 4.6 | ~5K | 1–3 |
| API Builder | Gemini Flash 3.7 High | ~3K | 1–3 |
| UI Builder | Claude Sonnet 4.6 | ~6K | 1–3 |
| Code Reviewer | Claude Opus 4.6 | ~3K | 4× (one per layer) |
| Test Builder | Gemini Flash 3.7 High | ~4K | 1–2 |
| Docs Agent | Gemini Flash 3.7 Medium | ~1K | 1 |
| **Happy path total** | | **~31K** | **11** |
| **Worst case (3× retries)** | | **~60K** | **25** |
