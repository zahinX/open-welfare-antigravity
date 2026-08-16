# Open Welfare — Agent Prompt Templates

This directory contains self-contained prompt templates for each sub-agent in the development pipeline. They are distinct from `../skills/` which contains how-to instructions for the main agent.

## How These Files Are Used

The **Orchestrator** (main agent) reads these files and uses them verbatim as the base prompt when spawning sub-agents. Each file is a complete, ready-to-send prompt — the Orchestrator appends the specific feature context at the end.

## Agent Model Assignments

| Agent | File | Model |
|---|---|---|
| Orchestrator | `orchestrator.md` | Gemini 3.1 Pro (High) |
| Plan Reviewer | `plan-reviewer.md` | Gemini 3.1 Pro (High) |
| Code Reviewer | `code-reviewer.md` | Claude Opus 4.6 |
| DB Builder | `builders/db.md` | Claude Sonnet 4.6 |
| Backend Builder | `builders/backend.md` | Claude Sonnet 4.6 |
| API Builder | `builders/api.md` | Gemini Flash 3.7 (High) |
| UI Builder | `builders/ui.md` | Claude Sonnet 4.6 |
| Test Builder | `test.md` | Gemini Flash 3.7 (High) |
| Docs Agent | `docs.md` | Gemini Flash 3.7 (Medium) |

## Compatibility

These files are plain markdown — compatible with:
- **Antigravity** — referenced by `orchestrator` skill
- **Cursor / Windsurf** — usable as scoped prompt files
- **Claude Code** — usable as subagent prompts or slash command targets
- **Any AGENTS.md-compatible IDE** — reference from top-level rules

## Full Architecture

See `docs/AGENT_PIPELINE.md` for the complete pipeline design, flow diagram, and token cost estimates.
