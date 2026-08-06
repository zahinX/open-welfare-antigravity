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
  - `status` (`campaign_status`, default `'draft'`)
  - `deadline_at` (timestamp, nullable)
  - `created_by` (uuid, references `profiles.id`)
  - `created_at` (timestamp, default `now()`)
- **RLS Policies:**
  - **Read:** Anyone (anon/authenticated) can read campaigns where `status = 'active'` or `'completed'`. Admins can read all campaigns.
  - **Write:** Admins only (Insert, Update, Delete).

### 3. `donations`
Records of financial contributions towards campaigns.
- **Columns:**
  - `id` (uuid, PK)
  - `campaign_id` (uuid, references `campaigns.id`)
  - `donor_id` (uuid, references `profiles.id`, nullable for anonymous)
  - `donor_name_override` (text, nullable)
  - `amount` (numeric, must be > 0)
  - `is_public` (boolean, default false - whether to show donor name publicly)
  - `created_at` (timestamp)
- **RLS Policies:**
  - **Read:** Admins can read all. Donors can read their own. Public can read aggregated amounts via views/RPCs, or individual rows if `is_public = true` (excluding donor details if anonymous).
  - **Write:** Authenticated users can insert their own. Admins can insert/update all.

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
