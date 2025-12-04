-- User Profiles and Subscription Tiers
-- Run this in Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'UTC',
  date_of_birth DATE,
  stage TEXT, -- 'perimenopause', 'menopause', 'postmenopause'
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'basic', 'premium', 'professional'
  subscription_status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  subscription_start_date DATE,
  subscription_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription_tiers reference table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  tier_code TEXT PRIMARY KEY,
  tier_name TEXT NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  reminder_frequency TEXT, -- 'daily', 'twice_daily', 'weekly', 'none'
  max_reminders_per_day INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert subscription tiers
INSERT INTO subscription_tiers (tier_code, tier_name, price_monthly, price_yearly, reminder_frequency, max_reminders_per_day, features) VALUES
('free', 'Free', 0.00, 0.00, 'none', 0, '{"tracking": true, "history_7_days": true, "basic_insights": false, "reminders": false, "export": false}'),
('basic', 'Basic', 9.99, 99.99, 'daily', 1, '{"tracking": true, "history_30_days": true, "basic_insights": true, "reminders": true, "export": true, "email_support": true}'),
('premium', 'Premium', 19.99, 199.99, 'twice_daily', 2, '{"tracking": true, "history_unlimited": true, "advanced_insights": true, "reminders": true, "export": true, "email_support": true, "priority_support": true, "custom_reminders": true}'),
('professional', 'Professional', 39.99, 399.99, 'twice_daily', 3, '{"tracking": true, "history_unlimited": true, "advanced_insights": true, "reminders": true, "export": true, "email_support": true, "priority_support": true, "custom_reminders": true, "api_access": true, "white_label": true}')
ON CONFLICT (tier_code) DO UPDATE SET
  tier_name = EXCLUDED.tier_name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  reminder_frequency = EXCLUDED.reminder_frequency,
  max_reminders_per_day = EXCLUDED.max_reminders_per_day,
  features = EXCLUDED.features;

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- 'medication', 'tracking', 'check_in', 'custom'
  title TEXT NOT NULL,
  message TEXT,
  time TIME NOT NULL,
  days_of_week INTEGER[], -- [0=Sunday, 1=Monday, ..., 6=Saturday] or empty for daily
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reminder_logs table (track when reminders were sent)
CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_method TEXT, -- 'email', 'sms', 'push'
  status TEXT, -- 'sent', 'failed', 'delivered'
  metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder_id ON reminder_logs(reminder_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Subscription tiers are public (read-only)
CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers
  FOR SELECT USING (true);

-- Reminders
CREATE POLICY "Users can manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminder logs" ON reminder_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION set_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION set_user_profiles_updated_at();

CREATE OR REPLACE FUNCTION set_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reminders_updated_at
BEFORE UPDATE ON reminders
FOR EACH ROW EXECUTE FUNCTION set_reminders_updated_at();




