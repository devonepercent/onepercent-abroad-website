-- RPC function: given an array of user IDs, return their emails from auth.users.
-- SECURITY DEFINER so it can read auth.users; guarded by an admin-role check.
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE(user_id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT au.id AS user_id, au.email::text AS email
  FROM auth.users au
  WHERE au.id = ANY(user_ids)
    AND has_role(auth.uid(), 'admin'::app_role);
$$;
