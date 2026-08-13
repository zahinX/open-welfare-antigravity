---
name: backend
description: >-
  Use this skill when writing core backend business logic, services, data aggregations, 
  and direct Supabase database interactions that are independent of the HTTP/API boundaries.
---

# Backend Workflow

This layer sits between the database and the API. It should be reusable and isolated from specific HTTP requests or Next.js route contexts.

## Steps
1. **Service Layer**: Create service files (e.g., `lib/services/campaign.ts`) to encapsulate complex data operations.
2. **Supabase Client**: Ensure you are using the correct Supabase server client (e.g., `@/lib/supabase/server`) when executing queries.
3. **Error Handling**: Handle Supabase errors explicitly. Do not leak raw database error strings; throw structured application errors that the API layer can catch and format.
4. **Types**: Strongly type the inputs and outputs of your service functions using TypeScript interfaces or exported Supabase generated types.
