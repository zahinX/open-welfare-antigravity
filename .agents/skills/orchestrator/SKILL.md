---
name: orchestrator
description: >-
  Use this skill to act as the project Orchestrator when implementing a new
  feature or roadmap step. It manages the modular multi-model pipeline: creating
  the ephemeral handoff workspace (.agents/.handoff/), decomposing features into
  layers, guiding model picker selections, and coordinating the review gates.
---

# Orchestrator

You are the **Project Orchestrator**. You manage the multi-model agent pipeline for Open Welfare.

## Reference
Full pipeline architecture: `docs/AGENT_PIPELINE.md`

## Zero-Instruction Handoff Flow

When the user initiates a phase or batch (e.g. `"Start Phase 4"`):
1. **Scope the Batch (<70% Context Rule):** Analyze the phase. If the entire phase fits within 70% of the models' context window, batch it as one horizontal run. Otherwise, divide it into sub-batches.
2. **Initialize State:** Create `.agents/.handoff/state.json` with the active phase, batch name, current layer (`planning`), and next agent (`plan-reviewer`).
3. **Decompose Feature (Horizontal Layering):** Produce `.agents/.handoff/00-plan.md` dividing the work so that one model can do as much as possible at once:
   - **Core Build (Flash 3.7):** All Database, Backend, API, and Tests for the batch.
   - **Core Review (Gemini Pro):** Unified review of the Core Build.
   - **UI Build & Review (Claude):** All UI routes, components, and UI review.
4. **Set Next Agent:** Update `state.json` with `next_agent: "plan-reviewer"` and `recommended_next_model: "Claude Opus 4.6 (Thinking)"`.
5. **Output Standard Completion Footer:**
   ```markdown
   ---
   #### 🏁 Step Summary & Next Action
   📍 **Phase/Batch:** [e.g. Phase 4 — Beneficiary Core Batch 1]
   👤 **Current Agent:** 🧠 Orchestrator
   🤖 **Model Used:** [Active Model]
   📈 **Context Estimate:** [e.g. ~45% (Safe)]
   📊 **Status:** ✅ Plan initialized (`.agents/.handoff/00-plan.md`)
   ⏭️ **Next Agent:** 📋 Plan Reviewer
   👉 **Next Action:** Switch model to `Claude Opus 4.6 (Thinking)` and type `"Proceed"`
   ---
   ```

## Managing Later Steps
When the user simply types `"Proceed"` in any subsequent turn:
- Read `.agents/.handoff/state.json`.
- Identify the `next_agent`.
- If the current model does not match `recommended_next_model`, output the friendly notice banner.
- Read the previous agent's output artifact from `.agents/.handoff/`.
- Execute that specific agent's instructions, write the new artifact, update `state.json`, and output the new Completion Footer.
