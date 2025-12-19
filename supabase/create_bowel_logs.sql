-- Create bowel_logs table for tracking bowel movements
CREATE TABLE IF NOT EXISTS bowel_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Daily check-in
  went_today BOOLEAN DEFAULT true,

  -- Core tracking (only if went_today = true)
  stool_form TEXT,
  frequency TEXT,
  ease_level TEXT,
  urgency TEXT,
  completeness TEXT,

  -- Discomfort & sensations (array)
  discomfort TEXT[] DEFAULT '{}',

  -- Visual changes (optional details)
  color TEXT,
  other_visual TEXT[] DEFAULT '{}',
  smell_intensity TEXT,
  timing TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one entry per user per date
  UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bowel_logs_user_date ON bowel_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bowel_logs_user_created ON bowel_logs(user_id, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE bowel_logs IS 'Tracks daily bowel movements and digestive health patterns';
COMMENT ON COLUMN bowel_logs.went_today IS 'Whether user had a bowel movement on this date';
COMMENT ON COLUMN bowel_logs.stool_form IS 'Bristol Stool Scale form type';
COMMENT ON COLUMN bowel_logs.frequency IS 'Number of bowel movements in a day';
COMMENT ON COLUMN bowel_logs.ease_level IS 'Ease or difficulty level (effortless, mild effort, straining, painful)';
COMMENT ON COLUMN bowel_logs.urgency IS 'Urgency level (no urgency, normal urge, sudden/urgent, barely made it)';
COMMENT ON COLUMN bowel_logs.completeness IS 'Feeling of completeness (felt complete, some left, incomplete)';
COMMENT ON COLUMN bowel_logs.discomfort IS 'Array of discomfort symptoms (bloating, gas, burning, cramping, nausea)';
COMMENT ON COLUMN bowel_logs.color IS 'Stool color observation';
COMMENT ON COLUMN bowel_logs.other_visual IS 'Other visual changes (mucus, undigested food, oily/floating)';
COMMENT ON COLUMN bowel_logs.smell_intensity IS 'Smell intensity level';
COMMENT ON COLUMN bowel_logs.timing IS 'Time of day (morning, afternoon, evening, night)';

-- Enable Row Level Security
ALTER TABLE bowel_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own bowel logs
CREATE POLICY "Users can view own bowel logs"
ON bowel_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own bowel logs
CREATE POLICY "Users can insert own bowel logs"
ON bowel_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bowel logs
CREATE POLICY "Users can update own bowel logs"
ON bowel_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bowel logs
CREATE POLICY "Users can delete own bowel logs"
ON bowel_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_bowel_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bowel_logs_updated_at
BEFORE UPDATE ON bowel_logs
FOR EACH ROW
EXECUTE FUNCTION update_bowel_logs_updated_at();

-- Verify table creation
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bowel_logs'
ORDER BY ordinal_position;
