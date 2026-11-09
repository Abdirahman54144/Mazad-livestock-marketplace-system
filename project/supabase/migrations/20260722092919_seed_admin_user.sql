/*
# Seed deterministic admin user for open-access mode

1. Overview
   - Creates a fixed admin account (admin@mazad.local / admin123) so the app
     can auto-sign-in silently on load without showing a login screen.
   - The handle_new_user trigger will auto-create the matching profile row.

2. Changes
   - Insert into auth.users with bcrypt-encrypted password.
   - Upsert the profiles row with role='admin' to guarantee the role is set
     even if the trigger already ran or the row pre-exists.
*/

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@mazad.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin","role":"admin"}'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@mazad.local'
);

-- Ensure profile exists with admin role
INSERT INTO profiles (id, email, full_name, role, location, phone)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'admin@mazad.local',
  'Admin',
  'admin',
  'Dubai',
  null
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin',
  email = 'admin@mazad.local';
