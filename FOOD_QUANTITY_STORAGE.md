# Food Quantity Storage & Retrieval

## How Quantity Data is Stored

The quantity field **IS stored in the database** as part of the JSONB `foods` field in the `food_logs` table.

### Database Structure

```sql
food_logs.foods JSONB
-- Stores: [{id, name, category, quantity, isCustom}, ...]
```

### Example Stored Data

When a user logs:
- **Food**: "Eggs"
- **Quantity**: "2"

The database stores:
```json
{
  "foods": [
    {
      "id": 1,
      "name": "Eggs",
      "category": "Breakfast",
      "quantity": "2",
      "isCustom": false
    }
  ]
}
```

## How Data is Saved

In `src/pages/FoodLog/FoodLog.jsx`, the `handleSave` function includes quantity:

```javascript
foods: selectedFoods.map(f => ({ 
  id: f.id, 
  name: f.name, 
  category: f.category,
  quantity: f.quantity || null,  // ✅ Quantity IS saved
  isCustom: f.isCustom || false
}))
```

## How Data is Retrieved

1. **Loading meals**: `foodService.getByDate()` retrieves the entire `foods` JSONB field
2. **Displaying history**: The component accesses `meal.foods[].quantity` to show quantities
3. **Editing meals**: When editing, quantities are loaded from the database

## How to Query for Analysis

JSONB data is **fully queryable** in PostgreSQL. See `supabase/query_food_quantities_example.sql` for examples.

### Quick Examples:

**Get all foods with quantities:**
```sql
SELECT 
  date,
  meal_type,
  food_item->>'name' AS food_name,
  food_item->>'quantity' AS quantity
FROM food_logs,
  jsonb_array_elements(foods) AS food_item
WHERE user_id = 'USER_ID'
ORDER BY date DESC;
```

**Count occurrences of specific food/quantity combinations:**
```sql
SELECT 
  food_item->>'name' AS food_name,
  food_item->>'quantity' AS quantity,
  COUNT(*) AS times_logged
FROM food_logs,
  jsonb_array_elements(foods) AS food_item
WHERE user_id = 'USER_ID'
  AND food_item->>'quantity' IS NOT NULL
GROUP BY food_item->>'name', food_item->>'quantity';
```

## Why JSONB?

- ✅ **Flexible**: Can store any structure without schema changes
- ✅ **Queryable**: Full PostgreSQL JSONB query support
- ✅ **Efficient**: Indexed and optimized by PostgreSQL
- ✅ **Complete**: All data (name, category, quantity, custom flag) in one field

## Verification

To verify quantities are being stored:

1. Log a meal with quantities
2. Check Supabase dashboard → `food_logs` table
3. View the `foods` JSONB field - you'll see `quantity` values

Or run this query:
```sql
SELECT 
  id,
  date,
  meal_type,
  foods
FROM food_logs
WHERE foods IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

## Summary

✅ **Quantity IS stored** in the database (as part of JSONB)  
✅ **Quantity IS retrieved** when loading history  
✅ **Quantity IS displayed** in the UI  
✅ **Quantity IS queryable** for analysis using PostgreSQL JSONB operators

The data is fully persistent and available for:
- History views
- Analytics
- Reports
- Pattern analysis
- Any future features




