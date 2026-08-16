# Agent Pipeline Architecture

> **Status:** Active  
> **Version:** 2.2.4 (Roadmap Step Indicator & Quota-Optimized)  
> **Last Updated:** 2026-08-17

This document defines the modular, multi-model agent pipeline for Open Welfare. It is optimized for zero-overhead token usage, preservation of Claude weekly quotas by leveraging **Gemini Flash 3.7 High** for heavy building tasks, and surgical use of **Claude Opus 4.6** and **Claude Sonnet 4.6** for architectural planning and UI fidelity.

---

## 1. Multi-Model Tier Strategy (Quota-Optimized)

| Tier | Role / Phase | Recommended Model | Why This Model |
|---|---|---|---|
| **Tier 1 (Reasoning)** | 🧠 Orchestrator | **Gemini 3.1 Pro (High)** | Deep system architecture, PRD ↔ Schema alignment, layer decomposition (Google AI Pro) |
| **Tier 1 (Reasoning)** | 📋 Plan Reviewer | **Claude Opus 4.6 (Thinking)** | **Surgical Claude spot:** Cross-vendor audit of Gemini's architectural plan (~2K tokens only) |
| **Tier 1 (Reasoning)** | 🔍 Code Reviewer | **Gemini 3.1 Pro (High)** | High-reasoning code audit, catches edge cases without burning Claude limits |
| **Tier 2 (Building)** | 🗄️ DB Builder | **Gemini Flash 3.7 (High)** | Fast, precise PostgreSQL DDL & Supabase RLS policies (0 Claude quota) |
| **Tier 2 (Building)** | ⚙️ Backend Builder | **Gemini Flash 3.7 (High)** | Clean TypeScript service layer, error encapsulation (0 Claude quota) |
| **Tier 2 (Building)** | 🔌 API Builder | **Gemini Flash 3.7 (High)** | Pattern-following Zod validation & Next.js Server Actions (0 Claude quota) |
| **Tier 2 (Building)** | 🎨 UI Builder | **Claude Sonnet 4.6 (Thinking)** | React Server Components, Tailwind CSS, clean design precision |
| **Tier 2 (Building)** | 🧪 Test Builder | **Gemini Flash 3.7 (High)** | Massive context capacity to ingest all layer files and write Vitest + Playwright suites |
| **Tier 3 (Utility)** | 📝 Docs & Git Agent | **Gemini Flash 3.7 (Medium)** | Low-cost markdown updates, git commit/push generation, cleanup |

---

## 2. Standard Completion Footer Format

Every agent MUST conclude its output with this exact format (including the Roadmap Step indicator):

```markdown
---
#### 🏁 Step Summary & Next Action
📍 **Roadmap Step:** [e.g. Phase 3, Step 3.1 — Campaign Database Schema & API]  
👤 **Current Agent:** [e.g. ⚙️ Backend Builder]  
🤖 **Model Used:** [Current Active Model]  
📊 **Status:** ✅ [Summary of completed step]  
⏭️ **Next Agent:** [e.g. 🔍 Code Reviewer]  
👉 **Next Action:** Switch model to `[Recommended Next Model]` and type `"Proceed"`
---
```

---

## 3. The Interactive Pipeline Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Human
    participant Orch as 🧠 Orchestrator [Gemini Pro High]
    participant Plan as 📋 Plan Reviewer [Claude Opus 4.6]
    participant DB as 🗄️ DB Builder [Flash 3.7 High]
    participant Review as 🔍 Code Reviewer [Gemini Pro High]
    participant Backend as ⚙️ Backend Builder [Flash 3.7 High]
    participant API as 🔌 API Builder [Flash 3.7 High]
    participant UI as 🎨 UI Builder [Claude Sonnet 4.6]
    participant Test as 🧪 Test Builder [Flash 3.7 High]
    participant Docs as 📝 Docs Agent [Flash 3.7 Med]

    User->>Orch: "Start Phase 3, Step 3.1"
    Orch->>Plan: Decomposes into layer plan
    User->>Plan: Selects Claude Opus 4.6 -> Types "Proceed"
    Plan-->>User: Outputs Step Summary with Roadmap Step & Next Action
    
    rect rgb(240, 245, 255)
    Note over User,Review: Layer Build & Review Loop
    User->>DB: Selects Gemini Flash 3.7 High -> Types "Proceed"
    DB-->>User: Writes DB -> Next Action ("Gemini 3.1 Pro High")
    User->>Review: Selects Gemini 3.1 Pro High -> Types "Proceed"
    Review-->>User: Approved -> Next Action ("Gemini Flash 3.7 High for Backend")
    Note over User,Review: (Repeats for Backend, API, UI, Tests)
    end

    User->>Docs: Selects Gemini Flash 3.7 Med -> Types "Proceed"
    Docs-->>User: 🛑 Phase Complete: Asks Human to Review & offers Git Push
    User->>Docs: "Approve and Push"
    Docs->>Docs: Updates Docs, Cleans .agents/.handoff/, Runs Git Commit & Push
```
