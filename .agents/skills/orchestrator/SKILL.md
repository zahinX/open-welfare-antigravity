---
name: orchestrator
description: >-
  Use this skill to act as a project manager when implementing a new feature or phase. 
  It guides the breakdown of work into Database, Backend, API, and UI tasks, ensuring 
  proper delegation to sub-agents or sequential processing to avoid context bloat.
---

# Orchestrator Workflow

When the user asks you to build a feature, do **NOT** attempt to write the entire feature at once. 

## Steps
1. **Analyze Requirements**: Read the relevant PRD or Roadmap sections to understand the feature.
2. **Breakdown**: Create an implementation plan dividing the work strictly into:
   - **Database**: Schemas, migrations, RLS policies.
   - **Backend**: Core business logic, services, DB access functions.
   - **API**: Server actions, route handlers, input validation (Zod).
   - **UI**: React components, pages, state management.
3. **Execute Sequentially**: Request user approval for the plan. Once approved, execute the plan module-by-module. You must use the specialized skills (`database`, `backend`, `api`, `ui`) as needed for each step, and ensure you clear unnecessary files from your context before moving to the next layer.
4. **Delegate**: If available, spawn sub-agents for specific, well-scoped tasks within these modules.
