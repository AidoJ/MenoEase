-- Fix UPDATE policy to allow admins to update any user profile
-- This uses a safe function to check admin status without causing infinite recursion

-- Step 1: Create a function to check if current user is admin
-- This function uses a direct query that won't trigger RLS recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop the old UPDATE policy
DROP POLICY IF EXISTS "allow_update_own_profile" ON user_profiles;

-- Step 3: Create new UPDATE policy for regular users (own profile only)
CREATE POLICY "users_update_own_profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 4: Create separate UPDATE policy for admins (any profile)
CREATE POLICY "admins_update_any_profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (public.is_current_user_admin())
WITH CHECK (public.is_current_user_admin());

-- Verify the policies
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles' AND cmd = 'UPDATE'
ORDER BY policyname;
