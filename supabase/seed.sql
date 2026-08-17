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
