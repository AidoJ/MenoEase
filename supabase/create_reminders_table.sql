-- ===================================================
-- CREATE REMINDERS TABLE
-- ===================================================

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  frequency TEXT DEFAULT 'one-off' CHECK (frequency IN ('one-off', 'hourly')),
  time TIME NOT NULL,
  days_of_week INTEGER[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_reminders_frequency ON reminders(frequency);

-- Add comments
COMMENT ON TABLE reminders IS 'User reminders for medications, tracking, and check-ins';
COMMENT ON COLUMN reminders.reminder_type IS 'Reminder type: medication, tracking, check_in, custom';
COMMENT ON COLUMN reminders.frequency IS 'Reminder frequency: one-off (specific time) or hourly (uses communication settings)';
COMMENT ON COLUMN reminders.days_of_week IS 'Array of days [0=Sunday, 1=Monday, ..., 6=Saturday]. Empty array = daily';

-- Create reminder logs table
CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  method TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user ON reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder ON reminder_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_date ON reminder_logs(date);

-- Add comments
COMMENT ON TABLE reminder_logs IS 'Log of all sent reminders';
COMMENT ON COLUMN reminder_logs.method IS 'Delivery method: email, sms';
COMMENT ON COLUMN reminder_logs.status IS 'Delivery status: sent, failed, pending';

-- ===================================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================================

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can view own reminder logs" ON reminder_logs;

-- Create policies
CREATE POLICY "Users can manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminder logs" ON reminder_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON reminders TO authenticated;
GRANT ALL ON reminder_logs TO authenticated;
