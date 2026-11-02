# Open Welfare — Database Schema

> **Status:** Draft  
> **Version:** 0.1.0  
> **Last Updated:** 2026-08-06

---

## Overview

This document defines the PostgreSQL schema for Open Welfare, hosted on Supabase. It outlines the core tables, field types, relationships, and the Row Level Security (RLS) policies required to maintain strict access control between public users, volunteers, and admins.

## Core Enums
- `campaign_status`: `'draft'`, `'active'`, `'completed'`, `'cancelled'`
- `beneficiary_status`: `'pending'`, `'approved'`, `'rejected'`, `'inactive'`
- `user_role`: `'admin'`, `'volunteer'`, `'public'`

## Tables & RLS Policies

### 1. `profiles`
Extends the Supabase `auth.users` table with application-specific user data.
- **Columns:**
  - `id` (uuid, PK, references `auth.users.id`)
  - `role` (`user_role`, default `'public'`)
  - `full_name` (text)
  - `phone` (text, nullable)
  - `created_at` (timestamp, default `now()`)
- **RLS Policies:**
  - **Read:** Users can read their own profile. Admins can read all profiles.
  - **Write:** Users can update their own profile (`full_name`, `phone`). Admins can update roles.

### 2. `campaigns`
Public-facing fundraising initiatives.
- **Columns:**
  - `id` (uuid, PK, default `uuid_generate_v4()`)
  - `title` (text)
  - `description` (text)
  - `target_amount` (numeric, default 0)
  - `current_amount` (numeric, default 0)
  - `currency` (varchar(3), default 'BDT')
  - `status` (`campaign_status`, default `'draft'`)
  - `verification_text` (text, nullable)
  - `verification_link` (text, nullable)
  - `deadline_at` (timestamp, nullable)
  - `created_by` (uuid, references `profiles.id`)
  - `created_at` (timestamp, default `now()`)
- **RLS Policies:**
  - **Read:** Anyone (anon/authenticated) can read campaigns where `status = 'active'` or `'completed'`. Admins can read all campaigns.
  - **Write:** Admins only (Insert, Update, Delete).

### 3. `donations`
Records of financial contributions towards campaigns with multi-currency exchange tracking.
- **Columns:**
  - `id` (uuid, PK)
  - `campaign_id` (uuid, references `campaigns.id`)
  - `donor_id` (uuid, references `profiles.id`, nullable for anonymous/guest)
  - `donor_name` (text, nullable)
  - `donor_email` (text, nullable)
  - `amount` (numeric, must be > 0)
  - `currency` (varchar(3), default 'BDT')
  - `converted_amount` (numeric, must be >= 0)
  - `exchange_rate` (numeric, default 1.0)
  - `payment_method` (text, default 'manual')
  - `payment_status` (text, default 'completed')
  - `is_anonymous` (boolean, default false)
  - `is_public` (boolean, default true)
  - `created_at` (timestamp)
- **RLS Policies:**
  - **Read:** Admins can read all. Donors can read their own. Public can read completed non-anonymous contributions.
  - **Write:** Anyone can insert donations towards active campaigns. Admins can update/delete.
- **Triggers:**
  - `tr_update_campaign_current_amount`: Atomic trigger that automatically updates `campaigns.current_amount` on donation insert, update, or deletion.

### 4. `beneficiaries`
Private CRM records for individuals receiving aid.
- **Columns:**
  - `id` (uuid, PK)
  - `full_name` (text)
  - `contact_phone` (text, nullable)
  - `address` (text, nullable)
  - `family_size` (integer, default 1)
  - `assessment_notes` (text, nullable)
  - `status` (`beneficiary_status`, default `'pending'`)
  - `created_at` (timestamp)
- **RLS Policies:**
  - **Read/Write:** STRICTLY Admins only. No public or volunteer access.

### 5. `disbursements`
Logs of aid (financial or material) given to beneficiaries, optionally linked to campaigns.
- **Columns:**
  - `id` (uuid, PK)
  - `beneficiary_id` (uuid, references `beneficiaries.id`)
  - `campaign_id` (uuid, references `campaigns.id`, nullable)
  - `amount_value` (numeric, default 0)
  - `description` (text)
  - `disbursed_at` (timestamp, default `now()`)
  - `logged_by` (uuid, references `profiles.id`)
- **RLS Policies:**
  - **Read/Write:** STRICTLY Admins only.

### 6. `volunteer_shifts`
Scheduled community service events requiring volunteers.
- **Columns:**
  - `id` (uuid, PK)
  - `title` (text)
  - `description` (text)
  - `location` (text)
  - `start_time` (timestamp)
  - `end_time` (timestamp)
  - `max_volunteers` (integer)
  - `created_by` (uuid, references `profiles.id`)
  - `created_at` (timestamp)
- **RLS Policies:**
  - **Read:** Anyone can read.
  - **Write:** Admins only.

### 7. `volunteer_signups`
Junction table tracking which users signed up for which shifts.
- **Columns:**
  - `id` (uuid, PK)
  - `shift_id` (uuid, references `volunteer_shifts.id`)
  - `user_id` (uuid, references `profiles.id`)
  - `attended` (boolean, default false)
  - `created_at` (timestamp)
  - **Constraint:** Unique(`shift_id`, `user_id`)
- **RLS Policies:**
  - **Read:** Admins can read all. Users can read their own signups.
  - **Write:** Users can insert/delete their own signups. Admins can update `attended` status.

---

## 🛡️ Data Preservation & Migration Integrity

To protect existing development, staging, and production data as the platform evolves:

1. **Non-Destructive DDL:**
   - All migrations must be additive (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`).
   - Column alterations that add constraints or non-nullability must provide defaults or data backfill migrations (e.g. `UPDATE table SET column = default WHERE column IS NULL`).
2. **Schema Cache Reloading:**
   - When new columns or tables are added, reload the PostgREST schema cache safely rather than executing destructive database resets.
3. **Idempotent Seeding:**
   - All entries in `supabase/seed.sql` must use `ON CONFLICT (id) DO NOTHING` or `ON CONFLICT (id) DO UPDATE` to ensure mock seeds never overwrite or erase user-created records.
