-- ============================================
-- ADD COMMUNICATION PREFERENCES TO USER PROFILES
-- ============================================

-- Add communication_preferences column to user_profiles
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{
    "reminders": {
      "method": "email",
      "frequency": "daily",
      "start_time": "08:00",
      "end_time": "20:00",
      "enabled": false
    },
    "reports": {
      "frequency": "weekly",
      "time": "17:00",
      "day_of_week": 1,
      "day_of_month": 1,
      "method": "email",
      "enabled": false
    }
  }'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN user_profiles.communication_preferences IS 'User communication preferences for reminders and reports. Structure: {reminders: {method, frequency, start_time, end_time, enabled}, reports: {frequency, time, day_of_week, day_of_month, method, enabled}}';

-- Update subscription_tiers to include communication features
UPDATE subscription_tiers 
SET features = jsonb_set(
  COALESCE(features, '{}'::jsonb), 
  '{communication_options}', 
  '{"email": true, "sms": false, "custom_frequency": false, "reports": false}'::jsonb
)
WHERE tier_code = 'free';

UPDATE subscription_tiers 
SET features = jsonb_set(
  COALESCE(features, '{}'::jsonb), 
  '{communication_options}', 
  '{"email": true, "sms": true, "custom_frequency": true, "reports": true, "report_frequencies": ["daily", "weekly", "monthly"]}'::jsonb
)
WHERE tier_code = 'basic';

UPDATE subscription_tiers 
SET features = jsonb_set(
  COALESCE(features, '{}'::jsonb), 
  '{communication_options}', 
  '{"email": true, "sms": true, "custom_frequency": true, "reports": true, "report_frequencies": ["daily", "weekly", "monthly"], "reminder_frequencies": ["hourly", "every_2_hours", "every_3_hours", "daily", "twice_daily"]}'::jsonb
)
WHERE tier_code IN ('premium', 'professional');




