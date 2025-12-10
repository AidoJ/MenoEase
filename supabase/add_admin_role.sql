-- Add admin role field to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Add comment
COMMENT ON COLUMN user_profiles.role IS 'User role: user or admin';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update RLS policies to allow admins to manage users
-- Admin can view all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    role = 'admin'
    OR user_id = auth.uid()
  );

-- Admin can update any profile
CREATE POLICY IF NOT EXISTS "Admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    role = 'admin'
    OR user_id = auth.uid()
  );
