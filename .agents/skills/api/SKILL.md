---
name: api
description: >-
  Use this skill when building Next.js Server Actions, Route Handlers, or API endpoints. 
  It handles input validation, authorization checks, and acts as the bridge between the UI and backend logic.
---

# API & Server Action Workflow

The API layer bridges the client UI and the secure backend services.

## Steps
1. **Validation First**: Always use `Zod` schemas to rigorously validate incoming `FormData` or JSON payloads before processing.
2. **Authorization**: Call `getUserProfile()` (or similar) at the very top of your action. Verify the user has the correct role (e.g., `admin`) to perform the action.
3. **Delegation**: Do not write massive SQL queries directly in the action. Call the encapsulated functions from your `backend` services layer.
4. **Error Boundaries**: Return structured responses (e.g., `{ error: string }` or `{ success: true, data: ... }`) so the client can display meaningful toasts or error messages, rather than relying solely on HTTP status codes.
5. **Revalidation**: If data is mutated, ensure you call `revalidatePath()` or `revalidateTag()` to update the Next.js cache so the UI reflects the changes instantly.
