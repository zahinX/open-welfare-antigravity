---
name: database
description: >-
  Use this skill when modifying or creating database structures, including Supabase SQL 
  migrations, tables, Row Level Security (RLS) policies, and generating database types.
---

# Database Workflow

When tasked with data layer modifications, follow these constraints:

## Steps
1. **Write Migrations**: All schema changes must be written as valid PostgreSQL migrations inside `supabase/migrations/`.
2. **Enforce RLS**: Every new table MUST have `ENABLE ROW LEVEL SECURITY`. You must create explicit `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies defining exactly who can access the data.
3. **Naming Conventions**: Use `snake_case` for table names and column names.
4. **Validation**: Test the migration locally by running `npx supabase db reset` or applying it to the local instance before proceeding to backend logic.
