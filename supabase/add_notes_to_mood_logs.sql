-- Add notes column to mood_logs table
ALTER TABLE mood_logs
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN mood_logs.notes IS 'General notes and comments about mood and wellness';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mood_logs' AND column_name = 'notes';
