-- ============================================
-- SEED DATA FOR MENOTRAK
-- Run this after running schema.sql
-- 
-- IMPORTANT: This file inserts into MASTER tables (medications_master, etc.)
-- NOT into user tables (medications, etc.)
-- User tables are populated when users track their data
-- ============================================

-- ============================================
-- 1. MEDICATIONS MASTER TABLE
-- ============================================

-- First, let's create a medications_master table if it doesn't exist
CREATE TABLE IF NOT EXISTS medications_master (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  typical_dose VARCHAR(100),
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on name to prevent duplicates (using index which supports IF NOT EXISTS)
CREATE UNIQUE INDEX IF NOT EXISTS medications_master_name_unique ON medications_master (name);

INSERT INTO medications_master (name, type, typical_dose, purpose) VALUES
('Estradiol Patch (Estradot)', 'Hormone Therapy', '25–100 mcg/day', 'Relieve hot flashes, brain fog, mood swings'),
('Progesterone (Prometrium)', 'Hormone Therapy', '100–200 mg/day', 'Endometrial protection, sleep support'),
('Testosterone Cream (Low-dose)', 'Hormone Therapy', '0.5–2 mg/day', 'Libido, energy, strength'),
('Gabapentin', 'Non-hormonal', '100–300 mg/night', 'Night sweats, sleep'),
('Low-dose Paroxetine (SSRI)', 'Non-hormonal', '7.5 mg/day', 'Hot flashes, mood regulation'),
('Melatonin', 'Sleep Aid', '1–5 mg/night', 'Sleep regulation'),
('Cetirizine (Antihistamine)', 'Anti-Histamine', '10 mg/day', 'Histamine spikes, allergies'),
('Iron Supplement', 'Mineral', '18–45 mg/day', 'Low ferritin, fatigue'),
('Magnesium Glycinate', 'Mineral', '200–400 mg/day', 'Sleep, anxiety, cramps'),
('Omega-3 Fish Oil', 'Supplement', '1000–2000 mg/day', 'Inflammation, cognitive support')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. VITAMINS + SUPPLEMENTS MASTER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS vitamins_master (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS vitamins_master_name_unique ON vitamins_master (name);

INSERT INTO vitamins_master (name, category, purpose) VALUES
('Vitamin D3 + K2', 'Bone/Immunity', 'Bone strength, mood support'),
('B-Complex', 'Energy', 'Energy metabolism, cognitive support'),
('Ashwagandha', 'Adaptogen', 'Stress reduction, cortisol balancing'),
('Collagen Peptides', 'Skin/Joints', 'Skin elasticity, joint health'),
('Probiotic', 'Gut Health', 'Digestive balance, immune support'),
('Evening Primrose Oil', 'Fatty Acid', 'Breast tenderness, mood balance'),
('Rhodiola Rosea', 'Adaptogen', 'Mental clarity, energy'),
('Turmeric (Curcumin)', 'Anti-inflammatory', 'Joint pain, inflammation')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. FOOD ITEMS (Update existing food_items table)
-- ============================================

-- Food items table uses UUID, so we'll insert without conflict handling
-- (UUIDs will be auto-generated)
INSERT INTO food_items (name, category) 
SELECT * FROM (VALUES
  ('Oatmeal with berries', 'Breakfast'),
  ('Greek yogurt', 'Dairy'),
  ('Grilled salmon', 'Protein'),
  ('Chicken stir-fry', 'Protein'),
  ('Avocado salad', 'Vegetable'),
  ('Dark chocolate (85%)', 'Snack'),
  ('Herbal tea', 'Beverage'),
  ('Coffee', 'Beverage'),
  ('Green smoothie (protein + greens)', 'Breakfast'),
  ('Spicy foods', 'Other')
) AS v(name, category)
WHERE NOT EXISTS (SELECT 1 FROM food_items WHERE food_items.name = v.name);

-- ============================================
-- 4. EXERCISES MASTER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS exercises_master (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  intensity VARCHAR(50),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS exercises_master_name_unique ON exercises_master (name);

INSERT INTO exercises_master (name, intensity, category) VALUES
('Walking', 'Low', 'Cardio'),
('Pilates', 'Low/Medium', 'Strength'),
('Yoga (Vinyasa)', 'Medium', 'Flexibility'),
('Yoga (Yin)', 'Low', 'Relaxation'),
('Strength Training', 'Medium/High', 'Strength'),
('Swimming', 'Medium', 'Cardio'),
('Cycling', 'Medium', 'Cardio'),
('HIIT', 'High', 'Metabolic')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. THERAPIES MASTER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS therapies_master (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  benefits TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS therapies_master_name_unique ON therapies_master (name);

INSERT INTO therapies_master (name, category, benefits) VALUES
('Massage Therapy', 'Bodywork', 'Stress reduction, muscle relief'),
('Acupuncture', 'Traditional', 'Hot flashes, anxiety'),
('Chiropractic', 'Physical', 'Alignment, pain relief'),
('Reiki', 'Energy', 'Relaxation, emotional balance'),
('Sauna', 'Heat Therapy', 'Detox, circulation'),
('Breathwork', 'Mind-Body', 'Stress, sleep support'),
('Guided Meditation', 'Mindfulness', 'Anxiety, mental calm'),
('Sound Therapy', 'Relaxation', 'Nervous system soothing')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 6. SYMPTOMS MASTER TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS symptoms_master (
  id SERIAL PRIMARY KEY,
  symptom VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS symptoms_master_symptom_unique ON symptoms_master (symptom);

INSERT INTO symptoms_master (symptom, category) VALUES
('Hot flashes', 'Vasomotor'),
('Night sweats', 'Vasomotor'),
('Brain fog', 'Cognitive'),
('Anxiety', 'Emotional'),
('Irritability', 'Emotional'),
('Joint pain', 'Musculoskeletal'),
('Fatigue', 'Energy'),
('Sleep difficulty', 'Sleep'),
('Heart palpitations', 'Cardiac'),
('Vaginal dryness', 'Urogenital'),
('Weight gain', 'Metabolic'),
('Bloating', 'Digestive'),
('Histamine reactions', 'Immune')
ON CONFLICT (symptom) DO NOTHING;

-- ============================================
-- 7. ENERGY LEVEL SCALE
-- ============================================

CREATE TABLE IF NOT EXISTS energy_levels (
  value INTEGER PRIMARY KEY,
  label VARCHAR(100) NOT NULL
);

INSERT INTO energy_levels (value, label) VALUES
(1, 'Completely exhausted'),
(2, 'Low energy'),
(3, 'Okay'),
(4, 'Good energy'),
(5, 'Energised')
ON CONFLICT (value) DO UPDATE SET label = EXCLUDED.label;

-- ============================================
-- 8. MOOD LEVEL SCALE
-- ============================================

CREATE TABLE IF NOT EXISTS mood_levels (
  value INTEGER PRIMARY KEY,
  label VARCHAR(100) NOT NULL
);

INSERT INTO mood_levels (value, label) VALUES
(1, 'Very low'),
(2, 'Low'),
(3, 'Neutral'),
(4, 'Positive'),
(5, 'Very positive')
ON CONFLICT (value) DO UPDATE SET label = EXCLUDED.label;

-- ============================================
-- Enable RLS on new tables
-- ============================================

ALTER TABLE medications_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitamins_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapies_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_levels ENABLE ROW LEVEL SECURITY;

-- Master tables are read-only for all authenticated users
CREATE POLICY "Anyone can view medications_master" ON medications_master
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view vitamins_master" ON vitamins_master
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view exercises_master" ON exercises_master
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view therapies_master" ON therapies_master
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view symptoms_master" ON symptoms_master
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view energy_levels" ON energy_levels
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view mood_levels" ON mood_levels
  FOR SELECT USING (true);

