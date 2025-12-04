-- ============================================
-- EXAMPLE QUERIES FOR FOOD QUANTITY ANALYSIS
-- ============================================
-- These queries demonstrate how to extract and analyze quantity data
-- from the JSONB foods field in food_logs table

-- 1. View all food logs with quantities extracted
SELECT 
  id,
  user_id,
  date,
  meal_type,
  jsonb_array_elements(foods) AS food_item
FROM food_logs
WHERE foods IS NOT NULL
ORDER BY date DESC;

-- 2. Extract food names and quantities for a specific user
SELECT 
  date,
  meal_type,
  food_item->>'name' AS food_name,
  food_item->>'quantity' AS quantity,
  food_item->>'category' AS category,
  (food_item->>'isCustom')::boolean AS is_custom
FROM food_logs,
  jsonb_array_elements(foods) AS food_item
WHERE user_id = 'USER_ID_HERE'
ORDER BY date DESC, meal_type;

-- 3. Count foods by quantity (for analysis)
SELECT 
  food_item->>'name' AS food_name,
  food_item->>'quantity' AS quantity,
  COUNT(*) AS times_logged
FROM food_logs,
  jsonb_array_elements(foods) AS food_item
WHERE user_id = 'USER_ID_HERE'
  AND food_item->>'quantity' IS NOT NULL
  AND food_item->>'quantity' != ''
GROUP BY food_item->>'name', food_item->>'quantity'
ORDER BY times_logged DESC;

-- 4. Find all meals with specific food and quantity
SELECT 
  date,
  meal_type,
  food_item->>'name' AS food_name,
  food_item->>'quantity' AS quantity
FROM food_logs,
  jsonb_array_elements(foods) AS food_item
WHERE user_id = 'USER_ID_HERE'
  AND food_item->>'name' ILIKE '%eggs%'
  AND food_item->>'quantity' IS NOT NULL
ORDER BY date DESC;

-- 5. Get all custom foods with quantities
SELECT 
  date,
  meal_type,
  food_item->>'name' AS food_name,
  food_item->>'quantity' AS quantity
FROM food_logs,
  jsonb_array_elements(foods) AS food_item
WHERE user_id = 'USER_ID_HERE'
  AND (food_item->>'isCustom')::boolean = true
ORDER BY date DESC;

-- 6. Average quantity per food item (if quantities are numeric)
-- Note: This requires parsing the quantity string, which may contain units
SELECT 
  food_item->>'name' AS food_name,
  food_item->>'quantity' AS quantity,
  COUNT(*) AS occurrences
FROM food_logs,
  jsonb_array_elements(foods) AS food_item
WHERE user_id = 'USER_ID_HERE'
  AND food_item->>'quantity' IS NOT NULL
GROUP BY food_item->>'name', food_item->>'quantity'
ORDER BY occurrences DESC;

-- 7. Full meal details with all foods and quantities
SELECT 
  fl.id,
  fl.date,
  fl.meal_type,
  jsonb_agg(
    jsonb_build_object(
      'name', food_item->>'name',
      'category', food_item->>'category',
      'quantity', food_item->>'quantity',
      'isCustom', (food_item->>'isCustom')::boolean
    )
  ) AS foods_with_quantities
FROM food_logs fl,
  jsonb_array_elements(fl.foods) AS food_item
WHERE fl.user_id = 'USER_ID_HERE'
GROUP BY fl.id, fl.date, fl.meal_type
ORDER BY fl.date DESC;

-- ============================================
-- NOTES:
-- - The quantity field is stored as TEXT in JSONB, so it can contain:
--   - Numbers: "2", "100"
--   - With units: "100g", "1 cup", "2 eggs"
--   - Any format the user enters
-- - For numeric analysis, you may need to parse the quantity string
-- - All data is fully queryable using PostgreSQL JSONB operators
-- ============================================




