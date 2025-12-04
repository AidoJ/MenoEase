-- ============================================
-- UPDATE MEDICATIONS MASTER TABLE WITH CATEGORIES
-- ============================================

-- Add category column if it doesn't exist
ALTER TABLE medications_master 
  ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Update existing records to have a category (if any exist)
UPDATE medications_master 
SET category = CASE 
  WHEN type LIKE '%Hormone%' OR type LIKE '%HRT%' THEN 'Prescription Medications (Hormonal)'
  WHEN type LIKE '%Vitamin%' THEN 'Vitamins'
  WHEN type LIKE '%Mineral%' THEN 'Minerals'
  ELSE 'Prescription Medications (Non-Hormonal)'
END
WHERE category IS NULL;

-- Clear existing data and insert comprehensive list
TRUNCATE TABLE medications_master;

-- ============================================
-- A. PRESCRIPTION MEDICATIONS (HORMONAL) - 10 items
-- ============================================
INSERT INTO medications_master (name, type, category, typical_dose, purpose) VALUES
('Estradiol Patch', 'Hormone Therapy', 'Prescription Medications (Hormonal)', '25–100 mcg/day', 'Relieve hot flashes, brain fog, mood swings'),
('Estradiol Gel', 'Hormone Therapy', 'Prescription Medications (Hormonal)', '0.5–2 mg/day', 'Transdermal estrogen delivery'),
('Estradiol Tablets', 'Hormone Therapy', 'Prescription Medications (Hormonal)', '0.5–2 mg/day', 'Oral estrogen replacement'),
('Estradiol Vaginal Cream', 'Hormone Therapy', 'Prescription Medications (Hormonal)', '0.5–2 g/day', 'Localized treatment for vaginal dryness'),
('Estradiol Vaginal Ring', 'Hormone Therapy', 'Prescription Medications (Hormonal)', 'Replaced every 3 months', 'Continuous low-dose estrogen for vaginal health'),
('Conjugated Estrogens (Premarin)', 'Hormone Therapy', 'Prescription Medications (Hormonal)', '0.3–1.25 mg/day', 'Synthetic estrogen replacement'),
('Micronized Progesterone (Prometrium)', 'Hormone Therapy', 'Prescription Medications (Hormonal)', '100–200 mg/day', 'Endometrial protection, sleep support'),
('Medroxyprogesterone Acetate (Provera)', 'Hormone Therapy', 'Prescription Medications (Hormonal)', '2.5–10 mg/day', 'Progestin for endometrial protection'),
('Combined Estrogen/Progestin Patch', 'Hormone Therapy', 'Prescription Medications (Hormonal)', 'As prescribed', 'Combined HRT patch (e.g., Climara Pro)'),
('Combined Oral HRT Tablets', 'Hormone Therapy', 'Prescription Medications (Hormonal)', 'As prescribed', 'Combined HRT (e.g., Femoston, Activelle)');

-- ============================================
-- B. PRESCRIPTION MEDICATIONS (NON-HORMONAL) - 10 items
-- ============================================
INSERT INTO medications_master (name, type, category, typical_dose, purpose) VALUES
('Gabapentin', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '100–300 mg/night', 'Night sweats, sleep, hot flashes'),
('Pregabalin', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '75–150 mg/day', 'Hot flashes, neuropathic pain'),
('Venlafaxine (SNRI)', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '37.5–75 mg/day', 'Hot flashes, mood regulation'),
('Desvenlafaxine (SNRI)', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '50–100 mg/day', 'Hot flashes, depression'),
('Paroxetine (SSRI)', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '7.5–20 mg/day', 'Hot flashes, mood regulation (low-dose)'),
('Sertraline (SSRI)', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '25–100 mg/day', 'Mood regulation, anxiety'),
('Fluoxetine (SSRI)', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '10–20 mg/day', 'Mood regulation, depression'),
('Clonidine', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '0.1–0.2 mg/day', 'Hot flashes, blood pressure'),
('Oxybutynin', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '2.5–5 mg/day', 'Hot flashes, overactive bladder'),
('Tibolone', 'Non-Hormonal', 'Prescription Medications (Non-Hormonal)', '2.5 mg/day', 'Synthetic steroid for menopause symptoms (some countries)');

-- ============================================
-- C. VITAMINS - 10 items
-- ============================================
INSERT INTO medications_master (name, type, category, typical_dose, purpose) VALUES
('Vitamin D3', 'Vitamin', 'Vitamins', '1000–4000 IU/day', 'Bone health, immune support, mood'),
('Vitamin B12 (Methylcobalamin)', 'Vitamin', 'Vitamins', '500–1000 mcg/day', 'Energy, cognitive function, nerve health'),
('Vitamin B6 (Pyridoxine or P5P)', 'Vitamin', 'Vitamins', '25–50 mg/day', 'Hormone regulation, mood support'),
('Vitamin B1 (Thiamine)', 'Vitamin', 'Vitamins', '50–100 mg/day', 'Energy metabolism, nerve function'),
('Vitamin B2 (Riboflavin)', 'Vitamin', 'Vitamins', '25–50 mg/day', 'Energy production, antioxidant support'),
('Vitamin B3 (Niacinamide)', 'Vitamin', 'Vitamins', '50–100 mg/day', 'Energy metabolism, skin health'),
('Vitamin B5 (Pantothenic Acid)', 'Vitamin', 'Vitamins', '100–500 mg/day', 'Adrenal support, energy production'),
('Vitamin C (Ascorbic Acid)', 'Vitamin', 'Vitamins', '500–2000 mg/day', 'Immune support, collagen production'),
('Vitamin K2 (MK-7)', 'Vitamin', 'Vitamins', '100–200 mcg/day', 'Bone health, calcium regulation'),
('Vitamin E (Mixed Tocopherols)', 'Vitamin', 'Vitamins', '200–400 IU/day', 'Antioxidant, skin health');

-- ============================================
-- D. MINERALS - 10 items
-- ============================================
INSERT INTO medications_master (name, type, category, typical_dose, purpose) VALUES
('Magnesium Glycinate', 'Mineral', 'Minerals', '200–400 mg/day', 'Sleep, anxiety, muscle relaxation'),
('Magnesium Threonate', 'Mineral', 'Minerals', '144–200 mg/day', 'Cognitive function, brain health'),
('Magnesium Citrate', 'Mineral', 'Minerals', '200–400 mg/day', 'Digestive support, muscle function'),
('Zinc Picolinate', 'Mineral', 'Minerals', '15–30 mg/day', 'Immune support, hormone regulation'),
('Selenium', 'Mineral', 'Minerals', '100–200 mcg/day', 'Antioxidant, thyroid support'),
('Calcium Citrate', 'Mineral', 'Minerals', '500–1000 mg/day', 'Bone health, muscle function'),
('Potassium', 'Mineral', 'Minerals', '99–2000 mg/day', 'Electrolyte balance, blood pressure'),
('Iron (if deficient)', 'Mineral', 'Minerals', '18–45 mg/day', 'Energy, red blood cell production'),
('Chromium Picolinate', 'Mineral', 'Minerals', '200–1000 mcg/day', 'Blood sugar regulation'),
('Iodine (if clinically appropriate)', 'Mineral', 'Minerals', '150–300 mcg/day', 'Thyroid function, metabolism');

-- ============================================
-- E. HERBAL & NATURAL SUPPLEMENTS - 10 items
-- ============================================
INSERT INTO medications_master (name, type, category, typical_dose, purpose) VALUES
('Black Cohosh', 'Herbal Supplement', 'Herbal & Natural Supplements', '20–80 mg/day', 'Hot flashes, night sweats'),
('Red Clover (Isoflavones)', 'Herbal Supplement', 'Herbal & Natural Supplements', '40–160 mg/day', 'Hormone-like effects, hot flashes'),
('Dong Quai', 'Herbal Supplement', 'Herbal & Natural Supplements', '500–1000 mg/day', 'Traditional Chinese medicine for menopause'),
('Chaste Tree (Vitex)', 'Herbal Supplement', 'Herbal & Natural Supplements', '200–400 mg/day', 'Hormone balance, PMS symptoms'),
('Ashwagandha', 'Herbal Supplement', 'Herbal & Natural Supplements', '300–600 mg/day', 'Stress reduction, cortisol balancing'),
('Rhodiola Rosea', 'Herbal Supplement', 'Herbal & Natural Supplements', '200–400 mg/day', 'Mental clarity, energy, stress adaptation'),
('Maca Root (Lepidium meyenii)', 'Herbal Supplement', 'Herbal & Natural Supplements', '1500–3000 mg/day', 'Energy, libido, hormone support'),
('Sage Extract (Salvia officinalis)', 'Herbal Supplement', 'Herbal & Natural Supplements', '200–400 mg/day', 'Hot flashes, sweating reduction'),
('Evening Primrose Oil (GLA)', 'Herbal Supplement', 'Herbal & Natural Supplements', '1000–2000 mg/day', 'Breast tenderness, mood balance'),
('St. John''s Wort', 'Herbal Supplement', 'Herbal & Natural Supplements', '300–900 mg/day', 'Mood support (WARNING: interacts with many medications)');

-- Ensure unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS medications_master_name_unique ON medications_master (name);




