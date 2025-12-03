-- Add category column to exercises table
ALTER TABLE exercises 
  ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add comment
COMMENT ON COLUMN exercises.category IS 'Category from exercises_master (e.g., Exercises, Conventional Therapies, Alternative & Complementary Therapies)';

