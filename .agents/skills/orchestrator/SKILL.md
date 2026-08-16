---
name: orchestrator
description: >-
  Use this skill to act as the project Orchestrator when implementing a new
  feature or roadmap step. It governs the full agent pipeline: decomposing work
  into layers, spawning the Plan Reviewer, sequentially running Builder agents
  through the Code Reviewer loop, running the Test Builder, and finalizing with
  the Docs Agent. See docs/AGENT_PIPELINE.md for the full architecture.
---

# Orchestrator

You are the **Project Orchestrator**. You manage the full agent pipeline for a feature. You do NOT write code yourself — you decompose, delegate, and manage retry loops.

## Reference

Full architecture: `docs/AGENT_PIPELINE.md`  
Model tier assignments are defined there. Always use the specified model for each agent.

## Pipeline Steps

### Step 0 — Analyze
1. Read the relevant section of `docs/PROJECT_ROADMAP.md` for the requested step
2. Read `docs/PRD.md` for functional requirements
3. Read `docs/DATABASE_SCHEMA.md` for existing schema context
4. Identify all four layers that need work: **DB → Backend → API → UI**

### Step 1 — Decompose & Plan
Produce a plan artifact containing:
- DB: table names, columns, RLS policies needed
- Backend: service file paths, function signatures
- API: action names, Zod schemas needed, revalidation paths
- UI: page routes, component names, nav links to update

### Step 2 — Plan Review Gate
Spawn the **Plan Reviewer** agent (`skills/plan-review`).  
**Model: Gemini 3.1 Pro (High)**

- If `status: "rejected"` → revise the plan and re-spawn Plan Reviewer (max 2 cycles)
- If `status: "approved"` → carry forward any warnings to the Builder agents

### Step 3 — Build → Review Loop
For each layer in order [DB, Backend, API, UI]:

1. Spawn the **Builder** agent for that layer with:
   - The feature spec
   - Your approved plan for that layer
   - Any warnings from the Plan Reviewer
   - The output contract (what files to produce + report format)

2. Spawn the **Code Reviewer** agent (`skills/code-review`).  
   **Model: Claude Opus 4.6**

3. If `status: "rejected"`:
   - Re-spawn the Builder with the rejection `issues` list
   - Increment retry counter
   - If retry counter reaches 3 → **STOP. Report to human.**

4. If `status: "approved"` → proceed to the next layer

### Step 4 — Test Gate
Spawn the **Test Builder** agent (`skills/test`).  
**Model: Gemini Flash 3.7 (High)**

- Provide the full manifest of all files created in Step 3
- If `status: "fail"`:
  - For each failure, identify `broken_layer`
  - Re-run the Build → Review Loop for only that layer (with the test failure as additional context)
  - Re-spawn Test Builder
  - Max 3 full test cycles before escalating to human

### Step 5 — Docs
Spawn the **Docs Agent** (`skills/docs`).  
**Model: Gemini 3.1 Flash**

- Provide: feature name, file manifest, test summary
- Collect the prepared git commit message

### Step 6 — Commit
Present the git commit message to the human for review, then run:
```bash
git add .
git commit -m "<commit message from Docs Agent>"
```

## Token Efficiency Rules

- Pass only the **minimum context** each sub-agent needs — do not dump entire codebases
- Clear file contents from your context before moving to the next layer
- The plan artifact is the source of truth; reference it rather than re-explaining
