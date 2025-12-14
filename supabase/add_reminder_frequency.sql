-- ===================================================
-- ADD FREQUENCY FIELD TO REMINDERS TABLE
-- ===================================================
-- This migration adds a frequency field to distinguish between:
-- - 'one-off': Fires at specific time set in reminder.time
-- - 'hourly': Fires every hour based on Communication Settings
-- ===================================================

-- Add frequency column to reminders table
ALTER TABLE reminders
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'one-off' CHECK (frequency IN ('one-off', 'hourly'));

-- Add comment
COMMENT ON COLUMN reminders.frequency IS 'Reminder frequency: one-off (specific time) or hourly (uses communication settings)';

-- Update existing reminders to be 'one-off' by default (if any exist without this field)
UPDATE reminders SET frequency = 'one-off' WHERE frequency IS NULL;

-- Create index for faster filtering by frequency
CREATE INDEX IF NOT EXISTS idx_reminders_frequency ON reminders(frequency);
