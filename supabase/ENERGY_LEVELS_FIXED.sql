-- Fixed Energy Levels SQL (no special characters)
-- Run this in Supabase SQL Editor

-- Step 1: Update the mood_logs table to use INTEGER for energy_level
ALTER TABLE mood_logs 
  ALTER COLUMN energy_level TYPE INTEGER USING 
    CASE energy_level
      WHEN 'crashed' THEN 0
      WHEN 'low' THEN 3
      WHEN 'ok' THEN 5
      WHEN 'energised' THEN 9
      ELSE 5
    END;

-- Step 2: Update energy_levels table structure (add mood and description columns if they don't exist)
ALTER TABLE energy_levels 
  ADD COLUMN IF NOT EXISTS mood VARCHAR(100),
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Step 3: Clear and rebuild energy_levels table with new detailed options
TRUNCATE TABLE energy_levels;

INSERT INTO energy_levels (value, label, mood, description) VALUES
(0, 'Utterly Depleted', 'Numb, drained', 'No energy at all; even small tasks feel impossible.'),
(1, 'Barely Functioning', 'Lethargic, heavy', 'Extreme fatigue; moving through the day feels overwhelming.'),
(2, 'Heavy', 'Weighted, slow', 'Body feels heavy and drained even if sleep was adequate.'),
(3, 'Very Low Energy', 'Weary', 'Emotionally tired; tired in the bones.'),
(4, 'Low and Sluggish', 'Foggy, dull', 'Able to function but everything feels like a chore.'),
(5, 'Flat or Below Average', 'Flat, unmotivated', 'Getting through the day but lacking spark.'),
(6, 'Functional but Tired', 'Neutral, mildly fatigued', 'Usable energy, dips throughout the day.'),
(7, 'Up and Down', 'Unpredictable', 'Energy fluctuates - bursts followed by crashes.'),
(8, 'Steady', 'Balanced', 'Good, stable energy without spikes or dips.'),
(9, 'Good Energy', 'Light, optimistic', 'Productive pace, clear mind, able to handle the day well.'),
(10, 'Very Good Energy', 'Motivated, uplifted', 'Strong stamina and mental clarity.'),
(11, 'Peak Energy', 'Energised, vibrant', 'At your best - strong, sharp, motivated.')
ON CONFLICT (value) DO UPDATE SET 
  label = EXCLUDED.label,
  mood = EXCLUDED.mood,
  description = EXCLUDED.description;

