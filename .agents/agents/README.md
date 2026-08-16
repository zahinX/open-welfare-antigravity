# Open Welfare — Multi-Model Sub-Agent System

This directory contains the operational prompt templates for all sub-agents in the Open Welfare development pipeline.

---

## 🎯 Model Mapping Table

| Agent | Recommended Model in Picker | File | Output Contract File |
|---|---|---|---|
| 🧠 **Orchestrator** | **Gemini 3.1 Pro (High)** | `orchestrator.md` | `.agents/.handoff/state.json` |
| 📋 **Plan Reviewer** | **Gemini 3.1 Pro (High)** | `plan-reviewer.md` | `.agents/.handoff/00-plan.md` |
| 🗄️ **DB Builder** | **Claude Sonnet 4.6** | `builders/db.md` | `.agents/.handoff/01-db.md` |
| ⚙️ **Backend Builder** | **Claude Sonnet 4.6** | `builders/backend.md` | `.agents/.handoff/02-backend.md` |
| 🔌 **API Builder** | **Gemini Flash 3.7 (High)** | `builders/api.md` | `.agents/.handoff/03-api.md` |
| 🎨 **UI Builder** | **Claude Sonnet 4.6** | `builders/ui.md` | `.agents/.handoff/04-ui.md` |
| 🔍 **Code Reviewer** | **Claude Opus 4.6** *(or Gemini Pro High)* | `code-reviewer.md` | `.agents/.handoff/05-review.md` |
| 🧪 **Test Builder** | **Gemini Flash 3.7 (High)** | `test.md` | `.agents/.handoff/06-test.md` |
| 📝 **Docs & Git Agent**| **Gemini Flash 3.7 (Medium)** | `docs.md` | Purges `.agents/.handoff/` & Git Commits |

---

## 🚀 How to Run the Pipeline (Zero-Instruction Flow)

1. **Start a Phase:**
   * Select **Gemini 3.1 Pro (High)** in the model picker.
   * Type: `"Start Phase 3, Step 3.1"` (or any roadmap step).
2. **Subsequent Steps ("Just Say Proceed"):**
   * Check the **Completion Footer** output by the previous agent.
   * Switch your Model Picker to the **Recommended Model**.
   * Simply type `"Proceed"` (or `"Next"`).
   * The agent will automatically read `.agents/.handoff/state.json`, execute its task, and tell you what model to pick next!
3. **Redo Requests (Autonomous Review Gate):**
   * If a Reviewer rejects code, it will state why and ask you to switch back to the Builder's model and type `"Proceed"`.
4. **Final Phase Review & Git Push:**
   * At the end of the entire phase, the Docs Agent summarizes everything and asks for your review.
   * If satisfied, reply `"Approve and Push"` — it will update documentation, purge temporary handoff files, and push to git with a clean commit message.
