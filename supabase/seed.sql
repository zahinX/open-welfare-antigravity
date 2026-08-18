-- Seed Data for Open Welfare Local Development

-- 1. Create Default Admin User
-- Note: auth.users password hash for 'Password123!'
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '8697f584-bced-46cd-89ed-05e4fa35bef6',
  'authenticated',
  'authenticated',
  'admin@openwelfare.org',
  crypt('Password123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Manager"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Ensure profile has 'admin' role
INSERT INTO public.profiles (id, full_name, role)
VALUES ('8697f584-bced-46cd-89ed-05e4fa35bef6', 'Admin Manager', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin Manager';

-- 2. Seed Sample Welfare Campaigns
INSERT INTO public.campaigns (
  id,
  title,
  description,
  target_amount,
  current_amount,
  currency,
  status,
  verification_text,
  verification_link,
  created_by,
  created_at
) VALUES (
  '6e48d4a2-c805-48dd-9663-144ad343180e',
  'Winter Warmth & Blanket Drive 2026',
  'Providing winter clothing and heavy blankets to underprivileged families across northern flood-affected districts.',
  100000,
  32500,
  'BDT',
  'active',
  'Verified by Central Welfare Oversight Committee',
  'https://example.org/audit/winter-2026.pdf',
  '8697f584-bced-46cd-89ed-05e4fa35bef6',
  now() - INTERVAL '5 days'
), (
  'f7b8c9d0-1234-5678-9abc-def012345678',
  'Clean Water Filtration Systems for Flood Areas',
  'Installing commercial-grade solar water purifiers in remote coastal villages suffering from salinity.',
  5000,
  2100,
  'USD',
  'active',
  'Verified by Water For Life Foundation',
  'https://example.org/audit/water-purifiers.pdf',
  '8697f584-bced-46cd-89ed-05e4fa35bef6',
  now() - INTERVAL '2 days'
) ON CONFLICT (id) DO NOTHING;

-- 3. Seed Sample Volunteer Shifts
INSERT INTO public.volunteer_shifts (
  id,
  title,
  description,
  location,
  start_time,
  end_time,
  max_volunteers,
  created_by,
  created_at
) VALUES (
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'Winter Relief Package Assembly & Sorting',
  'Help our logistics team sort, pack, and label thermal blankets, dry food rations, and winter clothing kits for distribution.',
  'Central Welfare Warehouse, Sector 4, Uttara, Dhaka',
  now() + INTERVAL '3 days' + INTERVAL '9 hours',
  now() + INTERVAL '3 days' + INTERVAL '14 hours',
  15,
  '8697f584-bced-46cd-89ed-05e4fa35bef6',
  now() - INTERVAL '1 day'
), (
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'Community Health & Medical Camp Support',
  'Assisting volunteer doctors with patient registration, queue management, and essential OTC medicine kit handoffs.',
  'Community Center, Kurigram Sadar',
  now() + INTERVAL '7 days' + INTERVAL '8 hours',
  now() + INTERVAL '7 days' + INTERVAL '16 hours',
  10,
  '8697f584-bced-46cd-89ed-05e4fa35bef6',
  now() - INTERVAL '2 days'
), (
  'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  'Clean Water Filter Installation Logistics',
  'Aid the field engineering squad in unloading, assembling, and testing community solar water filters.',
  'Coastal Union Parishad Ground, Dacope, Khulna',
  now() + INTERVAL '12 days' + INTERVAL '10 hours',
  now() + INTERVAL '12 days' + INTERVAL '17 hours',
  8,
  '8697f584-bced-46cd-89ed-05e4fa35bef6',
  now() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;
