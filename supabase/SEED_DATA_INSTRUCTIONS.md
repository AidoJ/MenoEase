# Seed Data Instructions

## What This Does

This seed data file populates your database with reference/master data that users can select from when tracking. It includes:

- **10 Common Medications** (HRT, supplements, etc.)
- **8 Vitamins & Supplements** (Vitamin D, B-Complex, etc.)
- **10 Food Items** (Common menopause-friendly foods)
- **8 Exercise Types** (Walking, Yoga, etc.)
- **8 Therapy Types** (Massage, Acupuncture, etc.)
- **13 Common Symptoms** (Hot flashes, night sweats, etc.)
- **Energy Level Scale** (1-5 scale)
- **Mood Level Scale** (1-5 scale)

## How to Run

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file `supabase/seed_data.sql`
3. Copy the **entire contents**
4. Paste into SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success" messages

## What Gets Created

### Master Tables (Reference Data)
- `medications_master` - List of common medications
- `vitamins_master` - List of vitamins/supplements
- `exercises_master` - List of exercise types
- `therapies_master` - List of therapy types
- `symptoms_master` - List of common symptoms
- `energy_levels` - Energy scale (1-5)
- `mood_levels` - Mood scale (1-5)

### Updated Tables
- `food_items` - Gets populated with common foods

## Important Notes

- **Master tables are read-only** - Users can view but not modify
- **Safe to run multiple times** - Uses `ON CONFLICT DO NOTHING` to prevent duplicates
- **RLS policies** - All master tables are readable by authenticated users
- **User data tables** - These remain empty until users start tracking

## After Running

Users will be able to:
- Select medications from the master list when adding their own
- Choose symptoms from the master list
- Select exercise types from the master list
- Use the energy and mood scales
- See common foods in the food search

## Next Steps

After seeding:
1. ✅ Database has reference data
2. 🚀 Start building features that use this data
3. 📊 Users can start tracking with real options




