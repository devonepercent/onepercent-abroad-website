-- Instructions to add an admin user in Supabase:
-- 
-- STEP 1: Create a user in Supabase Dashboard
--   1. Go to Authentication > Users
--   2. Click "Add user" or "Invite user"
--   3. Enter email and password
--   4. Copy the User ID (UUID) that gets created
--
-- STEP 2: Run this SQL query in Supabase SQL Editor
--   Replace 'YOUR_USER_ID_HERE' with the actual UUID from Step 1

INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- To verify the admin was added, run:
-- SELECT ur.*, au.email 
-- FROM public.user_roles ur
-- JOIN auth.users au ON ur.user_id = au.id
-- WHERE ur.role = 'admin';



