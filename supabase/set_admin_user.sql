-- ===================================================
-- SET ADMIN USER
-- ===================================================
-- Run this SQL in Supabase SQL Editor to make a user an admin
-- Replace 'your-email@example.com' with your actual email address
-- ===================================================

-- Update the user's role to admin
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT user_id, email, first_name, last_name, role
FROM user_profiles
WHERE email = 'your-email@example.com';
