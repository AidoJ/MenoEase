-- Insert food items into food_items table
-- Run this in Supabase SQL Editor

-- BREAKFAST (20 items)
INSERT INTO food_items (name, category) VALUES
('Poached eggs', 'Breakfast'),
('Scrambled eggs', 'Breakfast'),
('Fried eggs', 'Breakfast'),
('Boiled eggs', 'Breakfast'),
('Greek yogurt', 'Breakfast'),
('Cottage cheese', 'Breakfast'),
('Oatmeal', 'Breakfast'),
('Muesli', 'Breakfast'),
('Toast', 'Breakfast'),
('Wholegrain toast', 'Breakfast'),
('Sourdough toast', 'Breakfast'),
('Peanut butter on toast', 'Breakfast'),
('Banana', 'Breakfast'),
('Apple', 'Breakfast'),
('Protein shake', 'Breakfast'),
('Smoothie', 'Breakfast'),
('Chia pudding', 'Breakfast'),
('Vegemite on toast', 'Breakfast'),
('Avocado on toast', 'Breakfast'),
('Cereal (plain)', 'Breakfast')
ON CONFLICT DO NOTHING;

-- LUNCH (20 items)
INSERT INTO food_items (name, category) VALUES
('Chicken salad', 'Lunch'),
('Tuna salad', 'Lunch'),
('Ham sandwich', 'Lunch'),
('Chicken sandwich', 'Lunch'),
('Egg salad', 'Lunch'),
('Vegetable soup', 'Lunch'),
('Chicken soup', 'Lunch'),
('Tuna wrap', 'Lunch'),
('Chicken wrap', 'Lunch'),
('Sushi (simple roll)', 'Lunch'),
('Rice + vegetables', 'Lunch'),
('Rice + chicken', 'Lunch'),
('Pasta (plain)', 'Lunch'),
('Pasta with vegetables', 'Lunch'),
('Salmon salad', 'Lunch'),
('Beef stir-fry', 'Lunch'),
('Stir-fried vegetables', 'Lunch'),
('Quiche', 'Lunch'),
('Burrito (simple)', 'Lunch'),
('Leftovers (general)', 'Lunch')
ON CONFLICT DO NOTHING;

-- DINNER (20 items)
INSERT INTO food_items (name, category) VALUES
('Grilled chicken', 'Dinner'),
('Roast chicken', 'Dinner'),
('Grilled salmon', 'Dinner'),
('Baked fish', 'Dinner'),
('Beef stir-fry', 'Dinner'),
('Chicken stir-fry', 'Dinner'),
('Vegetable stir-fry', 'Dinner'),
('Steak', 'Dinner'),
('Lamb chop', 'Dinner'),
('Pork chop', 'Dinner'),
('Roast vegetables', 'Dinner'),
('Mashed potatoes', 'Dinner'),
('Steamed vegetables', 'Dinner'),
('Rice + protein', 'Dinner'),
('Pasta + sauce', 'Dinner'),
('Curry + rice', 'Dinner'),
('Soup + bread', 'Dinner'),
('Chicken and vegetables', 'Dinner'),
('Fish and vegetables', 'Dinner'),
('Omelette', 'Dinner')
ON CONFLICT DO NOTHING;

-- SNACKS (20 items)
INSERT INTO food_items (name, category) VALUES
('Dark chocolate', 'Snack'),
('Nuts', 'Snack'),
('Apple', 'Snack'),
('Banana', 'Snack'),
('Carrot sticks', 'Snack'),
('Celery sticks', 'Snack'),
('Crackers', 'Snack'),
('Cheese slices', 'Snack'),
('Yogurt', 'Snack'),
('Protein bar', 'Snack'),
('Popcorn', 'Snack'),
('Hummus', 'Snack'),
('Boiled egg', 'Snack'),
('Rice cakes', 'Snack'),
('Fruit cup', 'Snack'),
('Edamame', 'Snack'),
('Grapes', 'Snack'),
('Berries', 'Snack'),
('Cucumber slices', 'Snack'),
('Trail mix', 'Snack')
ON CONFLICT DO NOTHING;

-- BEVERAGES (20 items)
INSERT INTO food_items (name, category) VALUES
('Water', 'Beverage'),
('Sparkling water', 'Beverage'),
('Coffee', 'Beverage'),
('Decaf coffee', 'Beverage'),
('Black tea', 'Beverage'),
('Green tea', 'Beverage'),
('Herbal tea', 'Beverage'),
('Peppermint tea', 'Beverage'),
('Chamomile tea', 'Beverage'),
('Lemon water', 'Beverage'),
('Protein shake', 'Beverage'),
('Electrolyte drink (sugar-free)', 'Beverage'),
('Kombucha', 'Beverage'),
('Orange juice', 'Beverage'),
('Apple juice', 'Beverage'),
('Milk', 'Beverage'),
('Iced tea', 'Beverage'),
('Hot chocolate', 'Beverage'),
('Bone broth', 'Beverage'),
('Ginger tea', 'Beverage')
ON CONFLICT DO NOTHING;

-- PROTEIN (20 items)
INSERT INTO food_items (name, category) VALUES
('Chicken breast', 'Protein'),
('Chicken thigh', 'Protein'),
('Salmon', 'Protein'),
('White fish', 'Protein'),
('Tuna', 'Protein'),
('Eggs', 'Protein'),
('Beef mince', 'Protein'),
('Beef steak', 'Protein'),
('Lamb', 'Protein'),
('Pork', 'Protein'),
('Turkey', 'Protein'),
('Tofu', 'Protein'),
('Tempeh', 'Protein'),
('Lentils', 'Protein'),
('Chickpeas', 'Protein'),
('Beans', 'Protein'),
('Sardines', 'Protein'),
('Prawns/shrimp', 'Protein'),
('Protein powder', 'Protein'),
('Roast beef', 'Protein')
ON CONFLICT DO NOTHING;

-- VEGETABLES (20 items)
INSERT INTO food_items (name, category) VALUES
('Spinach', 'Vegetable'),
('Broccoli', 'Vegetable'),
('Carrots', 'Vegetable'),
('Celery', 'Vegetable'),
('Lettuce', 'Vegetable'),
('Cucumber', 'Vegetable'),
('Tomatoes', 'Vegetable'),
('Zucchini', 'Vegetable'),
('Cauliflower', 'Vegetable'),
('Pumpkin', 'Vegetable'),
('Sweet potato', 'Vegetable'),
('Green beans', 'Vegetable'),
('Peas', 'Vegetable'),
('Bell peppers', 'Vegetable'),
('Mushrooms', 'Vegetable'),
('Kale', 'Vegetable'),
('Eggplant', 'Vegetable'),
('Asparagus', 'Vegetable'),
('Beetroot', 'Vegetable'),
('Corn', 'Vegetable')
ON CONFLICT DO NOTHING;

-- DAIRY (20 items)
INSERT INTO food_items (name, category) VALUES
('Milk', 'Dairy'),
('Greek yogurt', 'Dairy'),
('Plain yogurt', 'Dairy'),
('Cottage cheese', 'Dairy'),
('Cheddar cheese', 'Dairy'),
('Mozzarella', 'Dairy'),
('Feta', 'Dairy'),
('Parmesan', 'Dairy'),
('Ricotta', 'Dairy'),
('Goat cheese', 'Dairy'),
('Cream cheese', 'Dairy'),
('Sour cream', 'Dairy'),
('Butter', 'Dairy'),
('A2 milk', 'Dairy'),
('Kefir', 'Dairy'),
('Yogurt drink', 'Dairy'),
('Swiss cheese', 'Dairy'),
('String cheese', 'Dairy'),
('Full cream milk', 'Dairy'),
('Skim milk', 'Dairy')
ON CONFLICT DO NOTHING;

-- OTHER (20 items)
INSERT INTO food_items (name, category) VALUES
('Spicy foods', 'Other'),
('Fast food', 'Other'),
('Fried foods', 'Other'),
('Processed meats', 'Other'),
('Pastries', 'Other'),
('Cakes', 'Other'),
('Biscuits', 'Other'),
('Chips', 'Other'),
('Candy', 'Other'),
('Sugary cereal', 'Other'),
('White bread', 'Other'),
('High-salt meals', 'Other'),
('Rich sauces', 'Other'),
('Alcohol', 'Other'),
('Energy drinks', 'Other'),
('Artificial sweeteners', 'Other'),
('Ice cream', 'Other'),
('Pizza', 'Other'),
('Chocolate milk', 'Other'),
('High-carb meals', 'Other')
ON CONFLICT DO NOTHING;

