-- Add category column to medications table
ALTER TABLE medications 
  ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add comment
COMMENT ON COLUMN medications.category IS 'Category from medications_master (e.g., Prescription Medications (Hormonal), Vitamins, etc.)';




