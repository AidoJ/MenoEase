-- ============================================
-- UPDATE EXERCISES MASTER TABLE WITH CATEGORIES
-- ============================================

-- Create exercises_master table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercises_master (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  intensity VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE exercises_master 
  ADD COLUMN IF NOT EXISTS category VARCHAR(100);

ALTER TABLE exercises_master 
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Clear existing data and insert comprehensive list
TRUNCATE TABLE exercises_master;

-- ============================================
-- A. EXERCISES - 15 items
-- ============================================
INSERT INTO exercises_master (name, category, intensity, description) VALUES
('Brisk Walking', 'Exercises', 'Moderate', 'Movement-based activity helpful during menopause'),
('Pilates (Mat or Reformer)', 'Exercises', 'Moderate', 'Core strength and flexibility'),
('Yoga (Hatha, Restorative, Yin)', 'Exercises', 'Light', 'Flexibility, relaxation, stress relief'),
('Strength Training with Dumbbells', 'Exercises', 'Vigorous', 'Muscle strength and bone health'),
('Bodyweight Exercises (Squats, Lunges, Push-ups)', 'Exercises', 'Moderate', 'Functional strength training'),
('Swimming', 'Exercises', 'Moderate', 'Low-impact full-body workout'),
('Aqua Aerobics', 'Exercises', 'Light', 'Water-based gentle exercise'),
('Cycling (Outdoor or Stationary)', 'Exercises', 'Moderate', 'Cardiovascular fitness'),
('Elliptical / Cross Trainer', 'Exercises', 'Moderate', 'Low-impact cardio'),
('Light Jogging', 'Exercises', 'Vigorous', 'Cardiovascular and bone health'),
('Dance Fitness (Zumba, freestyle, movement classes)', 'Exercises', 'Moderate', 'Fun cardiovascular exercise'),
('Barre Workouts', 'Exercises', 'Moderate', 'Strength and flexibility'),
('Stretching / Mobility Routines', 'Exercises', 'Light', 'Flexibility and range of motion'),
('Tai Chi', 'Exercises', 'Light', 'Mind-body movement, balance, stress relief'),
('Balance Training (Bosu, stability exercises)', 'Exercises', 'Light', 'Fall prevention, core stability');

-- ============================================
-- B. CONVENTIONAL THERAPIES - 15 items
-- ============================================
INSERT INTO exercises_master (name, category, intensity, description) VALUES
('Cognitive Behavioural Therapy (CBT)', 'Conventional Therapies', 'N/A', 'Mainstream, evidence-informed therapy for mood and anxiety'),
('Pelvic Floor Physiotherapy', 'Conventional Therapies', 'N/A', 'Specialized physiotherapy for pelvic health'),
('General Physiotherapy for Musculoskeletal Support', 'Conventional Therapies', 'N/A', 'Pain management and movement support'),
('Dietitian/Nutritionist Guidance', 'Conventional Therapies', 'N/A', 'Evidence-based nutritional support'),
('Sleep Hygiene Therapy / CBT-I', 'Conventional Therapies', 'N/A', 'Insomnia-focused cognitive behavioral therapy'),
('Lifestyle Coaching (energy pacing, habit building)', 'Conventional Therapies', 'N/A', 'Practical support for daily management'),
('Occupational Therapy (daily routine restructuring)', 'Conventional Therapies', 'N/A', 'Support for daily activities and routines'),
('Stress Management Coaching', 'Conventional Therapies', 'N/A', 'Evidence-based stress reduction techniques'),
('Mind–Body Skills Therapy (psychology-based)', 'Conventional Therapies', 'N/A', 'Integrated psychological and physical approaches'),
('Menopause-Specific Education Sessions', 'Conventional Therapies', 'N/A', 'Educational support and information'),
('Group Support Programs or Peer Support Circles', 'Conventional Therapies', 'N/A', 'Social support and shared experiences'),
('Hydrotherapy (warm-water therapy)', 'Conventional Therapies', 'Light', 'Therapeutic warm water treatment'),
('Pain Management Programs', 'Conventional Therapies', 'N/A', 'Multidisciplinary pain management'),
('Cognitive Training / Brain Fog Support Programs', 'Conventional Therapies', 'N/A', 'Support for cognitive changes'),
('Breathing Re-education Therapy (physio-led)', 'Conventional Therapies', 'Light', 'Therapeutic breathing techniques');

-- ============================================
-- C. ALTERNATIVE & COMPLEMENTARY THERAPIES - 15 items
-- ============================================
INSERT INTO exercises_master (name, category, intensity, description) VALUES
('Acupuncture / TCM', 'Alternative & Complementary Therapies', 'N/A', 'Traditional Chinese medicine approach'),
('Massage Therapy (relaxation or therapeutic)', 'Alternative & Complementary Therapies', 'Light', 'Physical and relaxation support'),
('Reflexology', 'Alternative & Complementary Therapies', 'Light', 'Foot and hand pressure point therapy'),
('Reiki or Energy Balancing', 'Alternative & Complementary Therapies', 'Light', 'Energy healing modality'),
('Naturopathic Herbal Support', 'Alternative & Complementary Therapies', 'N/A', 'Natural medicine consultation'),
('Aromatherapy Sessions', 'Alternative & Complementary Therapies', 'Light', 'Essential oil therapy'),
('Sound Therapy / Singing Bowls', 'Alternative & Complementary Therapies', 'Light', 'Vibrational and sound healing'),
('Vibroacoustic Therapy', 'Alternative & Complementary Therapies', 'Light', 'Vibrational therapy using sound frequencies'),
('PEMF Therapy (Pulsed Electromagnetic Field)', 'Alternative & Complementary Therapies', 'Light', 'Electromagnetic field therapy'),
('Breathwork / Pranayama', 'Alternative & Complementary Therapies', 'Light', 'Controlled breathing practices'),
('Meditation Coaching (guided or silent practice)', 'Alternative & Complementary Therapies', 'Light', 'Mindfulness and meditation training'),
('Yoga Therapy (therapeutic, one-on-one)', 'Alternative & Complementary Therapies', 'Light', 'Individualized therapeutic yoga'),
('Craniosacral Therapy', 'Alternative & Complementary Therapies', 'Light', 'Gentle hands-on therapy'),
('Light Therapy (bright light exposure)', 'Alternative & Complementary Therapies', 'Light', 'Light exposure for mood and circadian rhythm'),
('Chiropractic Care (gentle techniques)', 'Alternative & Complementary Therapies', 'Light', 'Spinal and musculoskeletal adjustment');

-- Ensure unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS exercises_master_name_unique ON exercises_master (name);

